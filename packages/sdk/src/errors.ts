import { decodeErrorResult, type Abi, type Hex } from "viem";
import * as harvested from "@sinjoh/abis";

/**
 * Decoding for the custom errors of every Sinjoh contract, with the operator guidance the
 * UI handoff specifies for the high-value ones. The error registry is derived from
 * `@sinjoh/abis`, so it always matches the harvested source commit.
 */

interface AbiInput { type: string; components?: readonly AbiInput[] }
interface AbiErrorItem { type: "error"; name: string; inputs: readonly AbiInput[] }

function fullType(input: AbiInput): string {
  if (input.components && input.type.startsWith("tuple")) {
    const inner = input.components.map(fullType).join(",");
    return `(${inner})${input.type.slice("tuple".length)}`;
  }
  return input.type;
}

function signature(item: AbiErrorItem): string {
  return `${item.name}(${item.inputs.map(fullType).join(",")})`;
}

function collectErrorAbi(): AbiErrorItem[] {
  const seen = new Map<string, AbiErrorItem>();
  for (const value of Object.values(harvested)) {
    if (!Array.isArray(value)) continue;
    for (const item of value as readonly { type: string }[]) {
      if (item.type !== "error") continue;
      const error = item as unknown as AbiErrorItem;
      const key = signature(error);
      if (!seen.has(key)) seen.set(key, error);
    }
  }
  return [...seen.values()];
}

/** Every distinct custom error across the harvested Sinjoh contracts. */
export const sinjohErrorAbi: Abi = collectErrorAbi() as unknown as Abi;

/** Operator guidance from `UI-NOTES.md` for the errors integrators hit most. */
export const errorGuidance: Readonly<Record<string, string>> = {
  ConfigurationMismatch:
    "The encoded configuration differs from the account's immutable first-fund configuration.",
  NonCanonicalConfiguration:
    "The encoded configuration differs from the account's immutable first-fund configuration.",
  OracleNotReady:
    "The pool does not yet contain enough real TWAP history. Retry after the configured window.",
  ExcessivePriceDeviation:
    "Current price moved outside the immutable safety bounds. No value was moved.",
  InsufficientOutput:
    "Current price moved outside the immutable safety bounds. No value was moved.",
  InvalidInterval: "The immutable processing or mint interval has not elapsed.",
  PoolNotInitialized:
    "The target pool is not initialized. Funding remains pending and cannot be withdrawn.",
  InsufficientLiability:
    "Refresh state; the requested amount exceeds the account's current credit.",
  InsufficientCredit:
    "Refresh state; the requested amount exceeds the account's current credit.",
  InvalidSnapshot:
    "Snapshot confirmations, block domain/hash, or the 255-block commit window is invalid.",
  InvalidProof:
    "The generated leaf/proof batch is not canonical for the committed epoch.",
  InvalidBatch:
    "The generated leaf/proof batch is not canonical for the committed epoch.",
  CreatorTaxTooHigh:
    "The requested Pons v2 creator tax exceeds Sinjoh's 50% ceiling or the factory's current"
    + " lower cap. Refresh and choose an allowed rate.",
  InvalidPonsV2Configuration:
    "Pons v2 launch state, fee, preview economics, escrow, or post-launch readback changed."
    + " Refresh all factory data and simulate again."
};

export interface DecodedSinjohError {
  errorName: string;
  args: readonly unknown[];
  guidance?: string;
}

/**
 * Decodes revert data against every known Sinjoh custom error. Returns undefined for
 * selectors no Sinjoh contract defines (plain reverts, third-party errors, panics).
 */
export function decodeSinjohError(data: Hex): DecodedSinjohError | undefined {
  try {
    const decoded = decodeErrorResult({ abi: sinjohErrorAbi, data });
    const guidance = errorGuidance[decoded.errorName];
    return {
      errorName: decoded.errorName,
      args: decoded.args ?? [],
      ...(guidance === undefined ? {} : { guidance })
    };
  } catch {
    return undefined;
  }
}
