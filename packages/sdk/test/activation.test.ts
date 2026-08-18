import assert from "node:assert/strict";
import { test } from "node:test";
import type { Address, Hex, PublicClient } from "viem";
import { checkPonsV2Activation } from "../src/activation.js";
import { expectedCloneRuntime } from "../src/predict/clones.js";

const ADAPTER = "0x00000000000000000000000000000000000000a1" as Address;
const ROUTER = "0x00000000000000000000000000000000000000a2" as Address;
const SUBJECT = "0x00000000000000000000000000000000000000e2" as Address;
const WETH = "0x00000000000000000000000000000000000000e1" as Address;
const IMPL = "0x00000000000000000000000000000000000000b1" as Address;
const ZERO = "0x0000000000000000000000000000000000000000" as Address;

function stubClient(overrides: Record<string, unknown> = {}): PublicClient {
  const routes: Record<string, unknown> = {
    [`${ADAPTER}:subject`]: SUBJECT,
    [`${ADAPTER}:router`]: ROUTER,
    [`${ADAPTER}:launched`]: true,
    [`${ADAPTER}:initialized`]: true,
    [`${ROUTER}:creator`]: ZERO,
    [`${ROUTER}:protocolFeeRecipient`]: ZERO,
    [`${ROUTER}:weth`]: WETH,
    [`${ROUTER}:launchpadAdapter`]: ADAPTER,
    [`${ROUTER}:subject`]: SUBJECT,
    [`${ROUTER}:configHash`]: `0x${"11".repeat(32)}`,
    [`${ROUTER}:initialized`]: true,
    [`${ROUTER}:bound`]: true,
    [`${ROUTER}:intakeAssetCount`]: 2n,
    [`${ROUTER}:intakeAsset:[0]`]: [{ kind: 1, token: WETH }, WETH],
    [`${ROUTER}:intakeAsset:[1]`]: [{ kind: 2, token: ZERO }, SUBJECT],
    [`${ROUTER}:normalizationInfo:["${SUBJECT}"]`]: [IMPL, IMPL, "0x", 100n],
    [`${ROUTER}:bucketCount`]: 0,
    ...overrides
  };
  return {
    readContract: async (args: {
      address: Address; functionName: string; args?: readonly unknown[];
    }) => {
      const suffix = args.args === undefined || args.args.length === 0
        ? args.functionName
        : `${args.functionName}:${JSON.stringify(args.args, (_, v) =>
          typeof v === "bigint" ? Number(v) : v)}`;
      const key = `${args.address}:${suffix}`;
      if (key in routes) return routes[key];
      throw new Error(`unexpected read ${key}`);
    },
    getCode: async ({ address }: { address: Address }): Promise<Hex> =>
      address === ADAPTER ? expectedCloneRuntime(IMPL) : "0x6001",
    ...({})
  } as unknown as PublicClient;
}

test("a fully wired launch reports active with all checks passing", async () => {
  const report = await checkPonsV2Activation(stubClient(), {
    adapter: ADAPTER, router: ROUTER, adapterImplementation: IMPL
  });
  assert.equal(report.state, "active");
  assert.ok(report.checks.length >= 6);
  for (const check of report.checks) assert.ok(check.ok, check.name);
});

test("a router bound to a different subject reports inactive", async () => {
  const report = await checkPonsV2Activation(stubClient({
    [`${ROUTER}:subject`]: "0x00000000000000000000000000000000000000ff"
  }), { adapter: ADAPTER, router: ROUTER });
  assert.equal(report.state, "inactive");
  const failed = report.checks.find((check) => !check.ok);
  assert.ok(failed);
  assert.match(failed.name, /bound to the adapter's subject/);
});

test("a wrong clone runtime fails the code check", async () => {
  const report = await checkPonsV2Activation(stubClient(), {
    adapter: ADAPTER, router: ROUTER, routerImplementation: IMPL
  });
  assert.equal(report.state, "inactive");
  const failed = report.checks.find((check) => !check.ok);
  assert.ok(failed);
  assert.match(failed.name, /router runtime/);
});
