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
  manifest: Pick<ChainManifest, "contracts">,
  options: { keys?: readonly string[] } = {}
): Promise<VerificationResult[]> {
  const selected = options.keys ?? Object.keys(manifest.contracts);
  const results: VerificationResult[] = [];
  for (const key of selected) {
    const entry: DeploymentEntry | undefined = manifest.contracts[key];
    if (!entry) throw new Error(`manifest has no entry for ${key}`);
    if (!entry.runtimeCodeHash) continue;
    const code = await client.getCode({ address: entry.address });
    const actual = code && code !== "0x" ? keccak256(code) : null;
    results.push({
      key,
      address: entry.address,
      expected: entry.runtimeCodeHash,
      actual,
      ok: actual !== null && actual.toLowerCase() === entry.runtimeCodeHash.toLowerCase()
    });
  }
  return results;
}

/** True only when every hash-carrying entry matched. An empty result set is a failure. */
export function allVerified(results: readonly VerificationResult[]): boolean {
  return results.length > 0 && results.every((result) => result.ok);
}
