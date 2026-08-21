import assert from "node:assert/strict";
import { test } from "node:test";
import {
  BaseError, ContractFunctionRevertedError, encodeErrorResult,
  type Abi, type Address, type PublicClient
} from "viem";
import { sinjohErrorAbi } from "../src/errors.js";
import { preflightMinimumOutput, quoteAtTwap } from "../src/guards.js";

const GUARD = "0x00000000000000000000000000000000000000f1" as Address;
const A = "0x1111111111111111111111111111111111111111" as Address;
const B = "0x2222222222222222222222222222222222222222" as Address;

function okClient(): PublicClient {
  return {
    readContract: async () => [95n, 1_700_000_000n]
  } as unknown as PublicClient;
}

function revertingClient(errorName: string): PublicClient {
  const item = sinjohErrorAbi.find(
    (entry) => entry.type === "error" && entry.name === errorName
  );
  assert.ok(item, `${errorName} must exist in the harvested ABIs`);
  assert.ok(item.type === "error");
  const args = item.inputs.map(() => 0n);
  const reverted = new ContractFunctionRevertedError({
    abi: [item] as Abi,
    functionName: "minimumOutput",
    data: encodeErrorResult({ abi: [item] as Abi, errorName, args })
  });
  return {
    readContract: async () => {
      throw new BaseError("execution reverted", { cause: reverted });
    }
  } as unknown as PublicClient;
}

const ARGS = { guard: GUARD, subject: A, assetIn: A, assetOut: B, amountIn: 100n };

test("a healthy guard returns the immutable floor", async () => {
  const result = await preflightMinimumOutput(okClient(), ARGS);
  assert.deepEqual(result, { status: "ok", minOut: 95n, validUntil: 1_700_000_000 });
});

test("typed guard reverts map to explicit states", async () => {
  for (const [errorName, status] of [
    ["OracleNotReady", "oracle-not-ready"],
    ["ExcessivePriceDeviation", "price-moved"],
    ["InvalidInterval", "interval-locked"]
  ] as const) {
    const result = await preflightMinimumOutput(revertingClient(errorName), ARGS);
    assert.equal(result.status, status, errorName);
    assert.ok("errorName" in result && result.errorName === errorName, errorName);
    assert.ok("guidance" in result && result.guidance, `${errorName} carries guidance`);
  }
});

test("a provider failure is distinguishable from an on-chain revert", async () => {
  const client = {
    readContract: async () => { throw new Error("boom"); }
  } as unknown as PublicClient;
  const result = await preflightMinimumOutput(client, ARGS);
  assert.deepEqual(result, { status: "unavailable", message: "boom" });
});

test("an opaque contract revert remains an on-chain revert", async () => {
  const reverted = new ContractFunctionRevertedError({
    abi: [],
    functionName: "minimumOutput",
    data: "0xdeadbeef",
  });
  const client = {
    readContract: async () => { throw new BaseError("execution reverted", { cause: reverted }); },
  } as unknown as PublicClient;
  assert.deepEqual(await preflightMinimumOutput(client, ARGS), { status: "reverted" });
});

test("quoteAtTwap passes through the guard's view", async () => {
  const client = {
    readContract: async (args: { functionName: string }) => {
      assert.equal(args.functionName, "quoteAtTwap");
      return 42n;
    }
  } as unknown as PublicClient;
  assert.equal(await quoteAtTwap(client, {
    guard: GUARD, assetIn: A, assetOut: B, amountIn: 1n
  }), 42n);
});
