import { keccak256, type Address, type Hex } from "viem";
import type { ChainManifest, DeploymentEntry } from "./types.js";

/** The one read this module needs; any viem PublicClient satisfies it structurally. */
export interface CodeReader {
  getCode(args: { address: Address }): Promise<Hex | undefined>;
}

export interface VerificationResult {
  key: string;
  address: Address;
  expected: Hex;
  /** keccak256 of the live runtime code, or null when no code exists at the address. */
  actual: Hex | null;
  ok: boolean;
}

/**
 * Compares the recorded runtime code hashes of every manifest entry that carries one against
 * the live chain. Entries without a recorded hash are skipped, never assumed valid.
 *
 * Callers must check `ok` on every result before trusting an address: a manifest is only as
 * good as its last verification against the chain it names.
 */
export async function verifyManifest(
  client: CodeReader,
  manifest: Pick<ChainManifest, "contracts"> & Partial<Pick<ChainManifest, "dependencies">>,
  options: { keys?: readonly string[] } = {}
): Promise<VerificationResult[]> {
  const dependencies = manifest.dependencies ?? {};
  const selected = options.keys ?? [
    ...Object.keys(manifest.contracts),
    ...Object.keys(dependencies).map((key) => `dependencies.${key}`),
  ];
  const results: VerificationResult[] = [];
  for (const key of selected) {
    const dependencyKey = key.startsWith("dependencies.") ? key.slice("dependencies.".length) : null;
    const contractKey = key.startsWith("contracts.") ? key.slice("contracts.".length) : key;
    const entry: DeploymentEntry | undefined = dependencyKey === null
      ? manifest.contracts[contractKey]
      : dependencies[dependencyKey];
    if (!entry) throw new Error(`manifest has no entry for ${key}`);
    const resultPrefix = dependencyKey === null ? contractKey : `dependencies.${dependencyKey}`;
    const verifyAddress = async (resultKey: string, address: Address, expected: Hex) => {
      const code = await client.getCode({ address });
      const actual = code && code !== "0x" ? keccak256(code) : null;
      results.push({
        key: resultKey,
        address,
        expected,
        actual,
        ok: actual !== null && actual.toLowerCase() === expected.toLowerCase()
      });
    };
    if (entry.runtimeCodeHash) {
      await verifyAddress(resultPrefix, entry.address, entry.runtimeCodeHash);
    }
    if (entry.implementationRuntimeCodeHash && !entry.implementation) {
      throw new Error(`${key} has an implementation hash but no implementation address`);
    }
    if (entry.implementation && entry.implementationRuntimeCodeHash) {
      await verifyAddress(
        `${resultPrefix}.implementation`, entry.implementation, entry.implementationRuntimeCodeHash
      );
    }
  }
  return results;
}

/** True only when every hash-carrying entry matched. An empty result set is a failure. */
export function allVerified(results: readonly VerificationResult[]): boolean {
  return results.length > 0 && results.every((result) => result.ok);
}
