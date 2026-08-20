import assert from "node:assert/strict";
import { test } from "node:test";
import { encodeFunctionData, type Address, type Hex } from "viem";
import * as actions from "../src/actions.js";

const A = "0x1111111111111111111111111111111111111111" as Address;
const B = "0x2222222222222222222222222222222222222222" as Address;
const C = "0x3333333333333333333333333333333333333333" as Address;
const ID = `0x${"ab".repeat(32)}` as Hex;

/** Every builder's output must encode against its ABI — this catches arg drift. */
const CALLS: [string, actions.PreparedCall][] = [
  ["adapterCollect", actions.adapterCollect(A)],
  ["adapterForward", actions.adapterForward(A, B)],
  ["routerSync (weth)", actions.routerSync(A, B)],
  ["routerSync (guarded)", actions.routerSync(A, B, 1n)],
  ["routerProcessBucket", actions.routerProcessBucket(A, {
    bucketId: 1, inputAsset: B, amountIn: 5n
  })],
  ["routerSendProtocolFee", actions.routerSendProtocolFee(A, B, 5n)],
  ["routerSendWallet", actions.routerSendWallet(A, B, C, 5n)],
  ["routerFundSink", actions.routerFundSink(A, 1, 2, 5n)],
  ["liquidityMint", actions.liquidityMint(A, { funder: B, subject: C, notional: 5n })],
  ["liquidityCollect", actions.liquidityCollect(A, B, C)],
  ["liquiditySendFee", actions.liquiditySendFee(A, B, C, 5n)],
  ["liquiditySendProtocolFee", actions.liquiditySendProtocolFee(A, B, 5n)],
  ["airdropPush", actions.airdropPush(A, {
    funder: B, subject: C, asset: B, epochId: 1n,
    leaves: [{ holder: C, cumulativeAmount: 5n }],
    proofs: [[{ siblingHash: ID, siblingSum: 1n, siblingIsLeft: false }]]
  })],
  ["airdropSendProtocolFee", actions.airdropSendProtocolFee(A, B, 5n)],
  ["launchStakingStake", actions.launchStakingStake(A, B, 5n)],
  ["launchStakingUnstake", actions.launchStakingUnstake(A, B, 5n)],
  ["launchStakingExecuteEpoch", actions.launchStakingExecuteEpoch(A, {
    funder: B, subject: C, asset: A
  })],
  ["launchStakingClaim", actions.launchStakingClaim(A, ID, [1n, 2n])],
  ["launchStakingSweepUnclaimed", actions.launchStakingSweepUnclaimed(A, ID, 1n)],
  ["raffleSync", actions.raffleSync(A)],
  ["raffleExpireRound", actions.raffleExpireRound(A, 7n)],
  ["raffleAbandonRound", actions.raffleAbandonRound(A, 7n)],
  ["raffleDeliverOwed", actions.raffleDeliverOwed(A, B)],
  ["raffleDeliverStockOwed", actions.raffleDeliverStockOwed(A, B, C)],
  ["randomnessSeal", actions.randomnessSeal(A, ID)],
  ["randomnessDeliver", actions.randomnessDeliver(A, ID)],
  ["collectorForward", actions.collectorForward(A, B, 5n)],
  ["collectorForwardAll", actions.collectorForwardAll(A, B)]
];

test("every prepared call encodes against its ABI", () => {
  for (const [name, call] of CALLS) {
    const data = encodeFunctionData({
      abi: call.abi, functionName: call.functionName, args: call.args as unknown[]
    });
    assert.ok(data.startsWith("0x") && data.length >= 10, name);
    assert.ok(call.description.length > 0, `${name} has a description`);
  }
});

test("raffle claim encodes with a real leaf/proof tuple shape", () => {
  const call = actions.raffleClaim(A, {
    roundId: 7n,
    slot: 0,
    leaf: { holder: B, tickets: 3n },
    proof: [{ siblingHash: ID, siblingSum: 1n, siblingIsLeft: true }]
  });
  const data = encodeFunctionData({
    abi: call.abi, functionName: call.functionName, args: call.args as unknown[]
  });
  assert.ok(data.length > 10);
});
