import { strict as assert } from "node:assert";
import { test } from "node:test";
import * as abis from "../src/index.js";

type AbiItem = { type: string; name?: string };

function names(abi: readonly unknown[], type: string): string[] {
  return (abi as readonly AbiItem[])
    .filter((item) => item.type === type)
    .map((item) => item.name ?? "");
}

test("meta records the source commit and a full harvest", () => {
  assert.match(abis.abiSourceCommit, /^[0-9a-f]{40}$/);
  const total = Object.values(abis.abiContractCounts)
    .reduce((sum, count) => sum + count, 0);
  assert.ok(total >= 60, `only ${total} contracts harvested`);
});

test("core protocol surfaces expose their known entrypoints", () => {
  const expectations: [readonly unknown[], string, string[]][] = [
    [abis.sinjohFeeRouterAbi, "SinjohFeeRouter",
      ["initialize", "bind", "sync", "processBucket", "sendProtocolFee", "sendWallet",
        "fundSink"]],
    [abis.sinjohFeeRouterFactoryAbi, "SinjohFeeRouterFactory",
      ["deployForLaunchpad", "predictLaunchpadAddress"]],
    [abis.sinjohRevenueCollectorAbi, "SinjohRevenueCollector",
      ["forward", "forwardAll", "setProcessor"]],
    [abis.sinjohAirdropDistributorAbi, "SinjohAirdropDistributor",
      ["fund", "commitEpoch", "push", "accountId", "leafHash", "nodeHash"]],
    [abis.sinjohLiquidityManagerAbi, "SinjohLiquidityManager",
      ["fund", "mint", "collect", "sendFee", "sendProtocolFee"]],
    [abis.sinjohRaffleRewardsAbi, "SinjohRaffleRewards",
      ["commitRound", "claim", "expireRound", "abandonRound", "receiveRandomness"]],
    [abis.sinjohRaffleRewardsFactoryAbi, "SinjohRaffleRewardsFactory",
      ["deployRaffle", "predictRaffle", "hashConfig"]],
    [abis.sinjohEcvrfRandomnessAbi, "SinjohEcvrfRandomness",
      ["requestRandomness", "seal", "fulfill", "deliver"]],
    [abis.sinjohFundingBandsAbi, "SinjohFundingBands",
      ["create", "fund", "settle", "sendProceeds"]],
    [abis.sinjohTreasuryFactoryAbi, "SinjohTreasuryFactory",
      ["createStandardTreasury"]],
    [abis.feeRouterV2Abi, "FeeRouterV2",
      ["proposeConfiguration", "activateConfiguration", "rollbackConfiguration", "sync"]],
    [abis.stakingEngineAbi, "StakingEngine",
      ["stake", "increaseStake", "extendLock", "getPastRewardWeight"]],
    [abis.sinjohStakingEngineAbi, "SinjohStakingEngine",
      ["createSchedule", "executeEpoch", "claim", "claimable", "sweepUnclaimed"]],
    [abis.yieldBasketAbi, "YieldBasket",
      ["configureAdapter", "setAdapterRewardRoutes", "allocate", "harvest",
        "writeOffAdapter", "recoverWrittenOffShares", "realizeIdleValue"]],
    [abis.dynamicFundingBandsAbi, "DynamicFundingBands",
      ["createBand", "activate", "observe", "redeem", "expire"]],
    [abis.sinjohGovernorAbi, "SinjohGovernor",
      ["propose", "castVote", "queue", "execute"]],
    [abis.sinjohPonsV1AdapterAbi, "SinjohPonsV1Adapter",
      ["collect", "forward"]],
    [abis.sinjohPonsV2AdapterAbi, "SinjohPonsV2Adapter",
      ["launch", "collect", "forward", "intakeAssets"]]
  ];
  for (const [abi, label, expected] of expectations) {
    const functions = new Set(names(abi, "function"));
    for (const name of expected) {
      assert.ok(functions.has(name), `${label} is missing ${name}()`);
    }
  }
});

test("contract ABIs carry their events and custom errors", () => {
  assert.ok(names(abis.sinjohFeeRouterAbi, "event").includes("Synchronized"));
  assert.ok(names(abis.sinjohAirdropDistributorAbi, "event").includes("PaymentFailed"));
  assert.ok(names(abis.sinjohRaffleRewardsAbi, "error").length > 0,
    "raffle ABI should include custom errors");
});
