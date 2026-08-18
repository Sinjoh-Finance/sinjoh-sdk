import assert from "node:assert/strict";
import { test } from "node:test";
import { keccak256, type Address, type PublicClient } from "viem";
import { planRouterWork } from "../src/planner.js";

const ROUTER = "0x00000000000000000000000000000000000000aa" as Address;
const WETH = "0x00000000000000000000000000000000000000e1" as Address;
const SUBJECT = "0x00000000000000000000000000000000000000e2" as Address;
const CREATOR = "0x00000000000000000000000000000000000000c1" as Address;
const WALLET = "0x00000000000000000000000000000000000000d1" as Address;
const SINK = "0x00000000000000000000000000000000000000d2" as Address;
const GUARD = "0x00000000000000000000000000000000000000f1" as Address;
const ZERO = "0x0000000000000000000000000000000000000000" as Address;

/**
 * A router with WETH + subject intake, one subject-output bucket with a guarded WETH->subject
 * conversion and two allocations (a wallet and a sink), and pending work everywhere.
 */
function stubClient(overrides: Record<string, unknown> = {}): PublicClient {
  const routes: Record<string, unknown> = {
    "creator": CREATOR,
    "protocolFeeRecipient": CREATOR,
    "weth": WETH,
    "launchpadAdapter": ZERO,
    "subject": SUBJECT,
    "configHash": `0x${"11".repeat(32)}`,
    "initialized": true,
    "bound": true,
    "intakeAssetCount": 2n,
    "intakeAsset:[0]": [{ kind: 1, token: WETH }, WETH],
    "intakeAsset:[1]": [{ kind: 2, token: ZERO }, SUBJECT],
    [`normalizationInfo:["${SUBJECT}"]`]: [GUARD, GUARD, "0x1234", 60n],
    "bucketCount": 1,
    "bucketInfo:[0]": [{ kind: 2, token: ZERO }, SUBJECT, 10000, 1n, 2n],
    "conversionInfo:[0,0]": [{ kind: 1, token: WETH }, WETH, GUARD, GUARD, "0x", 60n, 0],
    "allocationInfo:[0,0]": [WALLET, 7000, false, true, "0x"],
    "allocationInfo:[0,1]": [SINK, 3000, true, false, "0xdead"],
    [`unaccountedBalance:["${WETH}"]`]: 100n,
    [`unaccountedBalance:["${SUBJECT}"]`]: 500n,
    [`bucketInputOwed:[0,"${WETH}"]`]: 90n,
    [`protocolOwed:["${WETH}"]`]: 7n,
    [`protocolOwed:["${SUBJECT}"]`]: 0n,
    "allocationKey:[0,1]": 1,
    [`sinkOwed:[1,"${SUBJECT}"]`]: 30n,
    [`walletOwed:["${WALLET}","${SUBJECT}"]`]: 70n,
    ...overrides
  };
  return {
    readContract: async (args: { functionName: string; args?: readonly unknown[] }) => {
      const key = args.args === undefined || args.args.length === 0
        ? args.functionName
        : `${args.functionName}:${JSON.stringify(args.args, (_, v) =>
          typeof v === "bigint" ? Number(v) : v)}`;
      if (key in routes) return routes[key];
      throw new Error(`unexpected read ${key}`);
    }
  } as unknown as PublicClient;
}

test("plans the full routing lifecycle from live state", async () => {
  const plan = await planRouterWork(stubClient(), ROUTER);
  const byKind = new Map(plan.actions.map((action) => [
    `${action.kind}:${action.asset.toLowerCase()}`, action
  ]));

  const wethSync = byKind.get(`sync:${WETH}`);
  assert.ok(wethSync);
  assert.equal(wethSync.amount, 100n);
  assert.equal(wethSync.needsGuardPreflight, false);
  assert.deepEqual(wethSync.call.args, [WETH]);

  const subjectSync = byKind.get(`sync:${SUBJECT}`);
  assert.ok(subjectSync);
  assert.equal(subjectSync.amount, 60n, "normalization tranche is capped on chain");
  assert.equal(subjectSync.needsGuardPreflight, true, "guarded sync needs preflight");
  assert.deepEqual(subjectSync.call.args, [SUBJECT, 1n], "guarded sync carries a nonzero placeholder floor");
  assert.deepEqual(subjectSync.guardPreflight, {
    guard: GUARD,
    subject: SUBJECT,
    assetIn: SUBJECT,
    assetOut: WETH,
    amountIn: 60n,
    routeHash: keccak256("0x1234"),
    guardData: "0x"
  });

  const conversion = byKind.get(`process-bucket:${WETH}`);
  assert.ok(conversion);
  assert.equal(conversion.amount, 60n, "tranche capped by maxAmountInPerCall");
  assert.equal(conversion.needsGuardPreflight, true);
  assert.deepEqual(conversion.guardPreflight, {
    guard: GUARD,
    subject: SUBJECT,
    assetIn: WETH,
    assetOut: SUBJECT,
    amountIn: 60n,
    routeHash: keccak256("0x"),
    guardData: "0x"
  });

  const fee = byKind.get(`send-protocol-fee:${WETH}`);
  assert.ok(fee);
  assert.equal(fee.amount, 7n);

  const wallet = byKind.get(`send-wallet:${SUBJECT}`);
  assert.ok(wallet);
  assert.equal(wallet.amount, 70n);
  assert.deepEqual(wallet.call.args, [WALLET, SUBJECT, 70n]);

  const sink = byKind.get(`fund-sink:${SUBJECT}`);
  assert.ok(sink);
  assert.equal(sink.amount, 30n);
  assert.deepEqual(sink.call.args, [0, 1, 30n]);

  assert.equal(plan.actions.length, 6);
});

test("a quiet router plans nothing", async () => {
  const plan = await planRouterWork(stubClient({
    [`unaccountedBalance:["${WETH}"]`]: 0n,
    [`unaccountedBalance:["${SUBJECT}"]`]: 0n,
    [`bucketInputOwed:[0,"${WETH}"]`]: 0n,
    [`protocolOwed:["${WETH}"]`]: 0n,
    [`sinkOwed:[1,"${SUBJECT}"]`]: 0n,
    [`walletOwed:["${WALLET}","${SUBJECT}"]`]: 0n
  }), ROUTER);
  assert.equal(plan.actions.length, 0);
  assert.equal(plan.router.subject, SUBJECT);
});

test("an uncapped conversion takes the full owed amount", async () => {
  const plan = await planRouterWork(stubClient({
    "conversionInfo:[0,0]": [{ kind: 1, token: WETH }, WETH, GUARD, ZERO, "0x", 0n, 0]
  }), ROUTER);
  const conversion = plan.actions.find((action) => action.kind === "process-bucket");
  assert.ok(conversion);
  assert.equal(conversion.amount, 90n, "zero cap means no tranche limit");
  assert.equal(conversion.needsGuardPreflight, false, "zero guard needs no preflight");
  assert.equal(conversion.guardPreflight, undefined);
});
