import { getAddress, keccak256, type Address, type Hex } from "viem";
import type { ChainManifest, DeploymentEntry } from "./types.js";

/** The one read this module needs; any viem PublicClient satisfies it structurally. */
export interface CodeReader {
  getCode(args: { address: Address }): Promise<Hex | undefined>;
  getStorageAt?(args: { address: Address; slot: Hex }): Promise<Hex | undefined>;
  call?(args: { to: Address; data: Hex }): Promise<{ data: Hex | undefined }>;
}

export interface VerificationResult {
  key: string;
  address: Address;
  expected: Hex | null;
  expectedKind: "contract" | "eoa" | "unclassified" | "implementation-binding";
  /** keccak256 of the live runtime code, or null when no code exists at the address. */
  actual: Hex | null;
  expectedAddress?: Address;
  actualAddress?: Address | null;
  ok: boolean;
}

/**
 * Compares every manifest address with live chain code. Contract entries must carry a runtime
 * hash; explicitly classified EOAs must have no code; unclassified addresses fail closed.
 *
 * Callers must check `ok` on every result before trusting an address: a manifest is only as
 * good as its last verification against the chain it names.
 */
export async function verifyManifest(
  client: CodeReader,
  manifest: Pick<ChainManifest, "contracts">
    & Partial<Pick<ChainManifest, "dependencies" | "roles">>,
  options: { keys?: readonly string[] } = {}
): Promise<VerificationResult[]> {
  const dependencies = manifest.dependencies ?? {};
  const roles = manifest.roles ?? {};
  const selected = options.keys ?? [
    ...Object.keys(manifest.contracts),
    ...Object.keys(dependencies).map((key) => `dependencies.${key}`),
    ...Object.keys(roles).map((key) => `roles.${key}`),
  ];
  const results: VerificationResult[] = [];
  for (const key of selected) {
    const dependencyKey = key.startsWith("dependencies.") ? key.slice("dependencies.".length) : null;
    const roleKey = key.startsWith("roles.") ? key.slice("roles.".length) : null;
    const contractKey = key.startsWith("contracts.") ? key.slice("contracts.".length) : key;
    const entry: DeploymentEntry | undefined = roleKey !== null
      ? roles[roleKey as keyof typeof roles]
      : dependencyKey === null
        ? manifest.contracts[contractKey]
        : dependencies[dependencyKey];
    if (!entry) throw new Error(`manifest has no entry for ${key}`);
    const resultPrefix = roleKey !== null
      ? `roles.${roleKey}`
      : dependencyKey === null ? contractKey : `dependencies.${dependencyKey}`;
    const verifyAddress = async (
      resultKey: string,
      address: Address,
      expected: Hex | null,
      expectedKind: VerificationResult["expectedKind"],
    ) => {
      const code = await client.getCode({ address });
      const actual = code && code !== "0x" ? keccak256(code) : null;
      results.push({
        key: resultKey,
        address,
        expected,
        expectedKind,
        actual,
        ok: expectedKind === "eoa"
          ? actual === null
          : expected !== null && actual !== null
            && actual.toLowerCase() === expected.toLowerCase()
      });
    };
    if (entry.kind === "eoa" && entry.runtimeCodeHash) {
      throw new Error(`${key} is classified as eoa but carries a runtime code hash`);
    }
    if (entry.kind === "eoa" && entry.implementation) {
      throw new Error(`${key} is classified as eoa but carries an implementation address`);
    }
    if (entry.kind === "contract" && !entry.runtimeCodeHash) {
      throw new Error(`${key} is classified as contract but has no runtime code hash`);
    }
    if (entry.runtimeCodeHash) {
      await verifyAddress(resultPrefix, entry.address, entry.runtimeCodeHash, "contract");
    } else if (entry.kind === "eoa") {
      await verifyAddress(resultPrefix, entry.address, null, "eoa");
    } else {
      await verifyAddress(resultPrefix, entry.address, null, "unclassified");
    }
    if (entry.implementationRuntimeCodeHash && !entry.implementation) {
      throw new Error(`${key} has an implementation hash but no implementation address`);
    }
    if (entry.implementation && !entry.implementationRuntimeCodeHash) {
      throw new Error(`${key} has an implementation address but no implementation hash`);
    }
    if (entry.implementation && entry.implementationRuntimeCodeHash) {
      await verifyAddress(
        `${resultPrefix}.implementation`,
        entry.implementation,
        entry.implementationRuntimeCodeHash,
        "contract",
      );
    }
    if (entry.implementationBinding) {
      if (!entry.implementation) {
        throw new Error(`${key} has an implementation binding but no implementation address`);
      }
      let word: Hex | undefined;
      if (entry.implementationBinding.kind === "eip1967") {
        if (!client.getStorageAt) {
          throw new Error(`${key} requires a CodeReader with getStorageAt`);
        }
        word = await client.getStorageAt({
          address: entry.address,
          slot: entry.implementationBinding.slot,
        });
      } else {
        if (!client.call) throw new Error(`${key} requires a CodeReader with call`);
        word = (await client.call({
          to: entry.address,
          data: "0x5c60da1b",
        })).data;
      }
      let actualAddress: Address | null = null;
      if (word && /^0x[0-9a-fA-F]{64}$/.test(word)) {
        actualAddress = getAddress(`0x${word.slice(-40)}`);
      }
      results.push({
        key: `${resultPrefix}.implementationBinding`,
        address: entry.address,
        expected: null,
        expectedKind: "implementation-binding",
        actual: null,
        expectedAddress: entry.implementation,
        actualAddress,
        ok: actualAddress?.toLowerCase() === entry.implementation.toLowerCase(),
      });
    }
  }
  return results;
}

/** True only when every selected address is classified and matches live code state. */
export function allVerified(results: readonly VerificationResult[]): boolean {
  return results.length > 0 && results.every((result) => result.ok);
}
