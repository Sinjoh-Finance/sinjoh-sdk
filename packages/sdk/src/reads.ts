import { sinjohFeeRouterAbi } from "@sinjoh/abis";
import type { Address, Hex } from "viem";
import type { ReadClient } from "./client.js";

/**
 * Live-state reads. These are the authoritative tier: indexer and database data are history
 * and notification only, and pending amounts must always reconcile to these getters at a
 * confirmed block.
 */

export interface RouterIdentity {
  creator: Address;
  protocolFeeRecipient: Address;
  weth: Address;
  launchpadAdapter: Address;
  subject: Address;
  configHash: Hex;
  initialized: boolean;
  bound: boolean;
}

export interface RouterAllocation {
  bucketId: number;
  allocationId: number;
  destination: Address;
  bps: number;
  isSink: boolean;
  creatorMayRepoint: boolean;
}

export interface RouterConversion {
  bucketId: number;
  conversionId: number;
  resolvedInput: Address;
  adapter: Address;
  priceGuard: Address;
  routeData: Hex;
  maxAmountInPerCall: bigint;
  minInterval: bigint;
}

export interface RouterBucket {
  bucketId: number;
  resolvedOutput: Address;
  bps: number;
  conversions: RouterConversion[];
  allocations: RouterAllocation[];
}

export interface RouterSnapshot extends RouterIdentity {
  address: Address;
  intakeAssets: Address[];
  buckets: RouterBucket[];
}

function router(address: Address) {
  return { address, abi: sinjohFeeRouterAbi } as const;
}

export async function readRouterIdentity(
  client: ReadClient, address: Address
): Promise<RouterIdentity> {
  const at = router(address);
  const [creator, protocolFeeRecipient, weth, launchpadAdapter, subject, configHash,
    initialized, bound] = await Promise.all([
    client.readContract({ ...at, functionName: "creator" }),
    client.readContract({ ...at, functionName: "protocolFeeRecipient" }),
    client.readContract({ ...at, functionName: "weth" }),
    client.readContract({ ...at, functionName: "launchpadAdapter" }),
    client.readContract({ ...at, functionName: "subject" }),
    client.readContract({ ...at, functionName: "configHash" }),
    client.readContract({ ...at, functionName: "initialized" }),
    client.readContract({ ...at, functionName: "bound" })
  ]);
  return {
    creator, protocolFeeRecipient, weth, launchpadAdapter, subject, configHash,
    initialized, bound
  };
}

/** The router's full immutable structure, read from chain rather than assumed from records. */
export async function readRouterSnapshot(
  client: ReadClient, address: Address
): Promise<RouterSnapshot> {
  const at = router(address);
  const identity = await readRouterIdentity(client, address);

  const intakeAssetCount = await client.readContract({
    ...at, functionName: "intakeAssetCount"
  });
  const intakeAssets: Address[] = [];
  for (let i = 0n; i < intakeAssetCount; i++) {
    const [, resolved] = await client.readContract({
      ...at, functionName: "intakeAsset", args: [i]
    });
    intakeAssets.push(resolved);
  }

  const bucketCount = await client.readContract({ ...at, functionName: "bucketCount" });
  const buckets: RouterBucket[] = [];
  for (let bucketId = 0; bucketId < Number(bucketCount); bucketId++) {
    const [, resolvedOutput, bps, conversionCount, allocationCount] =
      await client.readContract({ ...at, functionName: "bucketInfo", args: [bucketId] });

    const conversions: RouterConversion[] = [];
    for (let conversionId = 0; conversionId < Number(conversionCount); conversionId++) {
      const [, resolvedInput, adapter, priceGuard, routeData, maxAmountInPerCall, minInterval] =
        await client.readContract({
          ...at, functionName: "conversionInfo", args: [bucketId, conversionId]
        });
      conversions.push({
        bucketId, conversionId, resolvedInput, adapter, priceGuard, routeData,
        maxAmountInPerCall, minInterval: BigInt(minInterval)
      });
    }

    const allocations: RouterAllocation[] = [];
    for (let allocationId = 0; allocationId < Number(allocationCount); allocationId++) {
      const [destination, allocationBps, isSink, creatorMayRepoint] =
        await client.readContract({
          ...at, functionName: "allocationInfo", args: [bucketId, allocationId]
        });
      allocations.push({
        bucketId, allocationId, destination, bps: allocationBps, isSink, creatorMayRepoint
      });
    }

    buckets.push({ bucketId, resolvedOutput, bps, conversions, allocations });
  }

  return { ...identity, address, intakeAssets, buckets };
}
