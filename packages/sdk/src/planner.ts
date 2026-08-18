import { sinjohFeeRouterAbi } from "@sinjoh/abis";
import type { Address } from "viem";
import {
  routerFundSink, routerProcessBucket, routerSendProtocolFee, routerSendWallet, routerSync,
  type PreparedCall
} from "./actions.js";
import type { ReadClient } from "./client.js";
import { readRouterSnapshot, type RouterSnapshot } from "./reads.js";

/**
 * The read-side work planner: given a router, enumerate every currently eligible
 * permissionless action with its amount and lifecycle state label. This is the primary agent
 * entry point — it turns "understand the whole routing lifecycle" into "call one function,
 * simulate the returned list".
 *
 * Planning is a snapshot, not a reservation: amounts must be re-simulated immediately before
 * submission, and a plan built at one block can be partially stale a block later. Non-WETH
 * sync and guarded bucket conversions carry `needsGuardPreflight` — run
 * `preflightMinimumOutput` first and surface its state instead of submitting blind.
 */

export type RouterWorkKind =
  | "sync" | "process-bucket" | "send-protocol-fee" | "send-wallet" | "fund-sink";

export interface PlannedAction {
  kind: RouterWorkKind;
  /** UI-NOTES lifecycle state label for this pending work. */
  state: string;
  asset: Address;
  amount: bigint;
  needsGuardPreflight: boolean;
  call: PreparedCall;
}

export interface RouterWorkPlan {
  router: RouterSnapshot;
  actions: PlannedAction[];
}

export async function planRouterWork(
  client: ReadClient, routerAddress: Address
): Promise<RouterWorkPlan> {
  const router = await readRouterSnapshot(client, routerAddress);
  const at = { address: routerAddress, abi: sinjohFeeRouterAbi } as const;
  const actions: PlannedAction[] = [];

  // 1. Unaccounted intake -> sync. WETH needs no normalization; other assets swap under an
  //    immutable guard, so their sync takes a caller floor and deserves a preflight.
  for (const asset of router.intakeAssets) {
    const unaccounted = await client.readContract({
      ...at, functionName: "unaccountedBalance", args: [asset]
    });
    if (unaccounted === 0n) continue;
    const isWeth = asset.toLowerCase() === router.weth.toLowerCase();
    actions.push({
      kind: "sync",
      state: "Unaccounted router balance",
      asset,
      amount: unaccounted,
      needsGuardPreflight: !isWeth,
      call: isWeth ? routerSync(routerAddress, asset) : routerSync(routerAddress, asset, 0n)
    });
  }

  // 2. Pending bucket input -> processBucket, one bounded tranche per conversion route.
  const outputAssets = new Set<string>();
  for (const bucket of router.buckets) {
    outputAssets.add(bucket.resolvedOutput.toLowerCase());
    for (const conversion of bucket.conversions) {
      const owed = await client.readContract({
        ...at, functionName: "bucketInputOwed",
        args: [bucket.bucketId, conversion.resolvedInput]
      });
      if (owed === 0n) continue;
      const tranche = conversion.maxAmountInPerCall > 0n
        && owed > conversion.maxAmountInPerCall
        ? conversion.maxAmountInPerCall
        : owed;
      actions.push({
        kind: "process-bucket",
        state: "Bucket conversion ready",
        asset: conversion.resolvedInput,
        amount: tranche,
        needsGuardPreflight: conversion.priceGuard
          !== "0x0000000000000000000000000000000000000000",
        call: routerProcessBucket(routerAddress, {
          bucketId: bucket.bucketId,
          inputAsset: conversion.resolvedInput,
          amountIn: tranche
        })
      });
    }
  }

  // 3. Accrued protocol fees -> sendProtocolFee, per asset the router can hold.
  const feeAssets = new Set<string>(
    [...router.intakeAssets.map((asset) => asset.toLowerCase()), ...outputAssets]
  );
  for (const key of feeAssets) {
    const asset = key as Address;
    const owed = await client.readContract({
      ...at, functionName: "protocolOwed", args: [asset]
    });
    if (owed === 0n) continue;
    actions.push({
      kind: "send-protocol-fee",
      state: "Allocation awaiting delivery",
      asset,
      amount: owed,
      needsGuardPreflight: false,
      call: routerSendProtocolFee(routerAddress, asset, owed)
    });
  }

  // 4. Allocation credits -> sendWallet / fundSink, in the bucket's resolved output asset.
  //    walletOwed is keyed by (destination, asset), so allocations sharing a destination
  //    share one credit: plan it once.
  const walletsPlanned = new Set<string>();
  for (const bucket of router.buckets) {
    const asset = bucket.resolvedOutput;
    for (const allocation of bucket.allocations) {
      if (allocation.isSink) {
        const key = await client.readContract({
          ...at, functionName: "allocationKey",
          args: [bucket.bucketId, allocation.allocationId]
        });
        const owed = await client.readContract({
          ...at, functionName: "sinkOwed", args: [key, asset]
        });
        if (owed === 0n) continue;
        actions.push({
          kind: "fund-sink",
          state: "Allocation awaiting delivery",
          asset,
          amount: owed,
          needsGuardPreflight: false,
          call: routerFundSink(routerAddress, bucket.bucketId, allocation.allocationId, owed)
        });
      } else {
        const walletKey = `${allocation.destination.toLowerCase()}:${asset.toLowerCase()}`;
        if (walletsPlanned.has(walletKey)) continue;
        walletsPlanned.add(walletKey);
        const owed = await client.readContract({
          ...at, functionName: "walletOwed", args: [allocation.destination, asset]
        });
        if (owed === 0n) continue;
        actions.push({
          kind: "send-wallet",
          state: "Allocation awaiting delivery",
          asset,
          amount: owed,
          needsGuardPreflight: false,
          call: routerSendWallet(routerAddress, allocation.destination, asset, owed)
        });
      }
    }
  }

  return { router, actions };
}
