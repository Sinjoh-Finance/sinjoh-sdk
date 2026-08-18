import {
  BaseError, ContractFunctionRevertedError, type Address, type Hex
} from "viem";
import { sinjohSharedV3TwapPriceGuardAbi as guardAbi } from "@sinjoh/abis";
import type { ReadClient } from "./client.js";
import { decodeSinjohError, errorGuidance } from "./errors.js";

/**
 * Guard preflights. Every conversion and mint runs under an immutable price guard whose
 * `minimumOutput` reverts with a typed reason while the pool is unusable. Preflighting turns
 * those reverts into explicit states so callers surface "oracle not ready" instead of a
 * generic failure — and never submit a transaction that must revert.
 */

export type GuardPreflight =
  | { status: "ok"; minOut: bigint; validUntil: number }
  | { status: "oracle-not-ready" | "price-moved" | "interval-locked"; errorName: string;
    guidance?: string }
  | { status: "reverted"; errorName?: string; guidance?: string };

export interface GuardPreflightInput {
  guard: Address;
  subject: Address;
  assetIn: Address;
  assetOut: Address;
  amountIn: bigint;
  routeHash?: Hex;
  guardData?: Hex;
}

const STATUS_BY_ERROR: Record<string, "oracle-not-ready" | "price-moved" | "interval-locked"> = {
  OracleNotReady: "oracle-not-ready",
  ExcessivePriceDeviation: "price-moved",
  InsufficientOutput: "price-moved",
  InvalidInterval: "interval-locked"
};

function classify(error: unknown): GuardPreflight {
  let errorName: string | undefined;
  if (error instanceof BaseError) {
    const reverted = error.walk((cause) => cause instanceof ContractFunctionRevertedError);
    if (reverted instanceof ContractFunctionRevertedError) {
      errorName = reverted.data?.errorName;
      if (errorName === undefined && reverted.raw !== undefined) {
        errorName = decodeSinjohError(reverted.raw)?.errorName;
      }
    }
  }
  if (errorName === undefined) return { status: "reverted" };
  const guidance = errorGuidance[errorName];
  const status = STATUS_BY_ERROR[errorName] ?? "reverted";
  return { status, errorName, ...(guidance === undefined ? {} : { guidance }) };
}

/**
 * Asks a guard for the immutable minimum output of a swap. `callerMinOut` may be set above
 * the returned value at execution time, never below — the guard re-checks on-chain.
 */
export async function preflightMinimumOutput(
  client: ReadClient, args: GuardPreflightInput
): Promise<GuardPreflight> {
  try {
    const [minOut, validUntil] = await client.readContract({
      address: args.guard,
      abi: guardAbi,
      functionName: "minimumOutput",
      args: [
        args.subject, args.assetIn, args.assetOut, args.amountIn,
        args.routeHash ?? `0x${"00".repeat(32)}` as Hex,
        args.guardData ?? "0x"
      ]
    });
    return { status: "ok", minOut, validUntil: Number(validUntil) };
  } catch (error) {
    return classify(error);
  }
}

/** The guard's TWAP quote for an input amount; a read-only sanity reference, not a floor. */
export async function quoteAtTwap(client: ReadClient, args: {
  guard: Address;
  assetIn: Address;
  assetOut: Address;
  amountIn: bigint;
}): Promise<bigint> {
  return client.readContract({
    address: args.guard,
    abi: guardAbi,
    functionName: "quoteAtTwap",
    args: [args.assetIn, args.assetOut, args.amountIn]
  });
}
