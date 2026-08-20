import { parseAbi, type Abi, type Address, type Hex } from "viem";
import {
  sinjohAirdropDistributorAbi, sinjohEcvrfRandomnessAbi,
  sinjohFeeRouterAbi, sinjohLiquidityManagerAbi, sinjohRaffleRewardsAbi,
  sinjohRevenueCollectorAbi, sinjohLaunchStakingEngineAbi
} from "@sinjoh/abis";

/** The `ISinjohLaunchpadAdapter` seam — a copied convention shared by every adapter family. */
const launchpadAdapterAbi = parseAbi([
  "function collect()",
  "function forward(address asset)"
]);

/**
 * Prepared transactions for every permissionless lifecycle operation, one failure-isolated
 * protocol action per call. The SDK never signs or submits: a `PreparedCall` spreads directly
 * into viem's `simulateContract`/`writeContract`, and simulation before signature is the
 * caller's responsibility. Restricted operations (attestor commits, creator repoints,
 * governance) are deliberately absent.
 */
export interface PreparedCall {
  address: Address;
  abi: Abi;
  functionName: string;
  args: readonly unknown[];
  /** Native value the call must carry (e.g. a Pons launch fee); absent means zero. */
  value?: bigint;
  description: string;
}

// -- Launchpad adapters (shared seam: collect + forward) ----------------------

export function adapterCollect(adapter: Address): PreparedCall {
  return {
    address: adapter, abi: launchpadAdapterAbi as Abi, functionName: "collect", args: [],
    description: "Collect launchpad fees into the adapter"
  };
}

export function adapterForward(adapter: Address, asset: Address): PreparedCall {
  return {
    address: adapter, abi: launchpadAdapterAbi as Abi, functionName: "forward", args: [asset],
    description: "Forward a collected asset from the adapter to its router"
  };
}

// -- Fee router ---------------------------------------------------------------

export function routerSync(router: Address, asset: Address, callerMinOut?: bigint): PreparedCall {
  return callerMinOut === undefined
    ? {
      address: router, abi: sinjohFeeRouterAbi as Abi, functionName: "sync", args: [asset],
      description: "Recognize the router's unaccounted balance of an asset"
    }
    : {
      address: router, abi: sinjohFeeRouterAbi as Abi, functionName: "sync",
      args: [asset, callerMinOut],
      description: "Normalize and recognize an unaccounted non-WETH balance"
    };
}

export function routerProcessBucket(router: Address, args: {
  bucketId: number; inputAsset: Address; amountIn: bigint; callerMinOut?: bigint;
  guardData?: Hex;
}): PreparedCall {
  return {
    address: router, abi: sinjohFeeRouterAbi as Abi, functionName: "processBucket",
    args: [args.bucketId, args.inputAsset, args.amountIn, args.callerMinOut ?? 0n,
      args.guardData ?? "0x"],
    description: "Convert a tranche of pending bucket input into the bucket's output asset"
  };
}

export function routerSendProtocolFee(
  router: Address, asset: Address, amount: bigint
): PreparedCall {
  return {
    address: router, abi: sinjohFeeRouterAbi as Abi, functionName: "sendProtocolFee",
    args: [asset, amount],
    description: "Deliver accrued protocol fees to the immutable protocol recipient"
  };
}

export function routerSendWallet(
  router: Address, destination: Address, asset: Address, amount: bigint
): PreparedCall {
  return {
    address: router, abi: sinjohFeeRouterAbi as Abi, functionName: "sendWallet",
    args: [destination, asset, amount],
    description: "Deliver a pending wallet allocation to its recorded destination"
  };
}

export function routerFundSink(
  router: Address, bucketId: number, allocationId: number, amount: bigint
): PreparedCall {
  return {
    address: router, abi: sinjohFeeRouterAbi as Abi, functionName: "fundSink",
    args: [bucketId, allocationId, amount],
    description: "Fund a sink allocation with its pending credit"
  };
}

// -- Liquidity manager ----------------------------------------------------------

export function liquidityMint(manager: Address, args: {
  funder: Address; subject: Address; notional: bigint; callerMinOut?: bigint; guardData?: Hex;
}): PreparedCall {
  return {
    address: manager, abi: sinjohLiquidityManagerAbi as Abi, functionName: "mint",
    args: [args.funder, args.subject, args.notional, args.callerMinOut ?? 0n,
      args.guardData ?? "0x"],
    description: "Swap and mint/increase the account's permanent full-range position"
  };
}

export function liquidityCollect(
  manager: Address, funder: Address, subject: Address
): PreparedCall {
  return {
    address: manager, abi: sinjohLiquidityManagerAbi as Abi, functionName: "collect",
    args: [funder, subject],
    description: "Collect LP fees without decreasing principal"
  };
}

export function liquiditySendFee(
  manager: Address, recipient: Address, asset: Address, amount: bigint
): PreparedCall {
  return {
    address: manager, abi: sinjohLiquidityManagerAbi as Abi, functionName: "sendFee",
    args: [recipient, asset, amount],
    description: "Deliver collected LP fees to their recorded recipient"
  };
}

export function liquiditySendProtocolFee(
  manager: Address, asset: Address, amount: bigint
): PreparedCall {
  return {
    address: manager, abi: sinjohLiquidityManagerAbi as Abi, functionName: "sendProtocolFee",
    args: [asset, amount],
    description: "Deliver accrued protocol fees to the immutable protocol recipient"
  };
}

// -- Airdrop distributor ----------------------------------------------------------

export interface AirdropPushLeaf {
  holder: Address;
  cumulativeAmount: bigint;
}

export interface AirdropPushProofElement {
  siblingHash: Hex;
  siblingSum: bigint;
  siblingIsLeft: boolean;
}

export function airdropPush(distributor: Address, args: {
  funder: Address; subject: Address; asset: Address; epochId: bigint;
  leaves: readonly AirdropPushLeaf[];
  proofs: readonly (readonly AirdropPushProofElement[])[];
}): PreparedCall {
  return {
    address: distributor, abi: sinjohAirdropDistributorAbi as Abi, functionName: "push",
    args: [args.funder, args.subject, args.asset, args.epochId, args.leaves, args.proofs],
    description: "Push a sorted batch of committed-epoch payments to holders"
  };
}

export function airdropSendProtocolFee(
  distributor: Address, asset: Address, amount: bigint
): PreparedCall {
  return {
    address: distributor, abi: sinjohAirdropDistributorAbi as Abi,
    functionName: "sendProtocolFee", args: [asset, amount],
    description: "Deliver accrued protocol fees to the immutable protocol recipient"
  };
}

// -- Launch staking ----------------------------------------------------------

export function launchStakingStake(
  engine: Address, subject: Address, amount: bigint
): PreparedCall {
  return {
    address: engine, abi: sinjohLaunchStakingEngineAbi as Abi, functionName: "stake",
    args: [subject, amount],
    description: "Stake a launched token at one-token-to-one-reward-unit weight"
  };
}

export function launchStakingUnstake(
  engine: Address, subject: Address, amount: bigint
): PreparedCall {
  return {
    address: engine, abi: sinjohLaunchStakingEngineAbi as Abi, functionName: "unstake",
    args: [subject, amount],
    description: "Return staked launch tokens immediately"
  };
}

export function launchStakingExecuteEpoch(engine: Address, args: {
  funder: Address; subject: Address; asset: Address;
}): PreparedCall {
  return {
    address: engine, abi: sinjohLaunchStakingEngineAbi as Abi, functionName: "executeEpoch",
    args: [args.funder, args.subject, args.asset],
    description: "Snapshot active stake and open the funded reward epoch"
  };
}

export function launchStakingClaim(
  engine: Address, accountId: Hex, epochIds: readonly bigint[]
): PreparedCall {
  return {
    address: engine, abi: sinjohLaunchStakingEngineAbi as Abi, functionName: "claim",
    args: [accountId, epochIds],
    description: "Claim one or more launch-staking snapshot rewards"
  };
}

export function launchStakingSweepUnclaimed(
  engine: Address, accountId: Hex, epochId: bigint
): PreparedCall {
  return {
    address: engine, abi: sinjohLaunchStakingEngineAbi as Abi,
    functionName: "sweepUnclaimed", args: [accountId, epochId],
    description: "Sweep an expired epoch remainder to its immutable destination"
  };
}

// -- Raffle -------------------------------------------------------------------

export function raffleSync(raffle: Address): PreparedCall {
  return {
    address: raffle, abi: sinjohRaffleRewardsAbi as Abi, functionName: "sync", args: [],
    description: "Recognize the raffle's unaccounted prize-asset balance"
  };
}

export function raffleClaim(raffle: Address, args: {
  roundId: bigint; slot: number; leaf: unknown; proof: readonly unknown[];
}): PreparedCall {
  return {
    address: raffle, abi: sinjohRaffleRewardsAbi as Abi, functionName: "claim",
    args: [args.roundId, args.slot, args.leaf, args.proof],
    description: "Claim a drawn slot's prize for the winning holder"
  };
}

export function raffleExpireRound(raffle: Address, roundId: bigint): PreparedCall {
  return {
    address: raffle, abi: sinjohRaffleRewardsAbi as Abi, functionName: "expireRound",
    args: [roundId],
    description: "Expire a drawn round whose claim window has closed"
  };
}

export function raffleAbandonRound(raffle: Address, roundId: bigint): PreparedCall {
  return {
    address: raffle, abi: sinjohRaffleRewardsAbi as Abi, functionName: "abandonRound",
    args: [roundId],
    description: "Abandon a stalled round, returning its reserve to the pool"
  };
}

export function raffleDeliverOwed(raffle: Address, holder: Address): PreparedCall {
  return {
    address: raffle, abi: sinjohRaffleRewardsAbi as Abi, functionName: "deliverOwed",
    args: [holder],
    description: "Retry delivery of a deferred prize credit"
  };
}

export function raffleDeliverStockOwed(
  raffle: Address, holder: Address, asset: Address
): PreparedCall {
  return {
    address: raffle, abi: sinjohRaffleRewardsAbi as Abi, functionName: "deliverStockOwed",
    args: [holder, asset],
    description: "Retry delivery of a deferred tokenized-stock prize credit"
  };
}

// -- Randomness (prover key stays outside the SDK; fulfill takes a finished proof) --

export function randomnessSeal(randomness: Address, requestId: Hex): PreparedCall {
  return {
    address: randomness, abi: sinjohEcvrfRandomnessAbi as Abi, functionName: "seal",
    args: [requestId],
    description: "Seal a randomness request inside the 255-block hash window"
  };
}

export function randomnessFulfill(
  randomness: Address, requestId: Hex, proof: unknown
): PreparedCall {
  return {
    address: randomness, abi: sinjohEcvrfRandomnessAbi as Abi, functionName: "fulfill",
    args: [requestId, proof],
    description: "Submit the ECVRF proof for a sealed request"
  };
}

export function randomnessDeliver(randomness: Address, requestId: Hex): PreparedCall {
  return {
    address: randomness, abi: sinjohEcvrfRandomnessAbi as Abi, functionName: "deliver",
    args: [requestId],
    description: "Deliver a fulfilled seed to its consumer"
  };
}

// -- Revenue collector ----------------------------------------------------------

export function collectorForward(
  collector: Address, asset: Address, amount: bigint
): PreparedCall {
  return {
    address: collector, abi: sinjohRevenueCollectorAbi as Abi, functionName: "forward",
    args: [asset, amount],
    description: "Forward protocol revenue to the collector's current processor"
  };
}

export function collectorForwardAll(collector: Address, asset: Address): PreparedCall {
  return {
    address: collector, abi: sinjohRevenueCollectorAbi as Abi, functionName: "forwardAll",
    args: [asset],
    description: "Forward the collector's full balance of an asset to its processor"
  };
}
