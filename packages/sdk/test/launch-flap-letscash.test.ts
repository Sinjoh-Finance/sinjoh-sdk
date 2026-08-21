import assert from "node:assert/strict";
import { test } from "node:test";
import { encodeFunctionData, type Address, type Hex, type PublicClient } from "viem";
import { AssetKind, type RouterConfig } from "../src/codecs/router.js";
import type { RaffleConfig } from "../src/codecs/raffle.js";
import {
  planFlapLaunch, predictUniswapV2Pair, raffleExclusionsForFlapLaunch,
  type FlapLaunchPlanInput
} from "../src/launch/flap.js";
import {
  letscashActivate, planLetsCashIntegration, raffleBind
} from "../src/launch/letscash.js";

const CREATOR = "0x00000000000000000000000000000000000000c1" as Address;
const ADAPTER_FACTORY = "0x00000000000000000000000000000000000000a0" as Address;
const ROUTER_FACTORY = "0x00000000000000000000000000000000000000b0" as Address;
const RAFFLE_FACTORY = "0x00000000000000000000000000000000000000d0" as Address;
const ADAPTER = "0x00000000000000000000000000000000000000a1" as Address;
const ROUTER = "0x00000000000000000000000000000000000000b1" as Address;
const RAFFLE = "0x00000000000000000000000000000000000000d1" as Address;
const TOKEN = "0x0000000000000000000000000000000000000071" as Address;
const WETH = "0x00000000000000000000000000000000000000e1" as Address;
const ZERO = "0x0000000000000000000000000000000000000000" as Address;
const SALT = `0x${"01".repeat(32)}` as Hex;

const ADAPTER_IMPL = "0x00000000000000000000000000000000000000a2" as Address;

function stubClient(overrides: Record<string, unknown> = {}): PublicClient {
  const reads: Record<string, unknown> = {
    [`${ADAPTER_FACTORY}:predictAddress`]: ADAPTER,
    [`${ROUTER_FACTORY}:predictLaunchpadAddress`]: ROUTER,
    [`${RAFFLE_FACTORY}:predictRaffle`]: RAFFLE,
    [`${ADAPTER_IMPL}:predictSubject`]: TOKEN,
    ...overrides
  };
  return {
    readContract: async (args: { address: Address; functionName: string }) => {
      const key = `${args.address}:${args.functionName}`;
      if (key in reads) return reads[key];
      throw new Error(`unexpected read ${key}`);
    }
  } as unknown as PublicClient;
}

function routerConfig(predicted: { adapter: Address; raffle?: Address }): RouterConfig {
  return {
    creator: CREATOR,
    protocolFeeRecipient: "0x00000000000000000000000000000000000000fe",
    weth: WETH,
    launchpadAdapter: predicted.adapter,
    normalizations: [],
    buckets: [{
      output: { kind: AssetKind.FIXED_ERC20, token: WETH },
      bps: 10_000,
      route: { adapter: ZERO, routeData: "0x" },
      priceGuard: ZERO,
      maxAmountInPerCall: 10n ** 20n,
      allocations: [{
        destination: predicted.raffle ?? CREATOR,
        bps: 10_000,
        isSink: predicted.raffle !== undefined,
        creatorMayRepoint: false,
        sinkConfig: "0x"
      }]
    }]
  };
}

function raffleConfig(exclusions: Address[]): RaffleConfig {
  return {
    creator: CREATOR, attestor: CREATOR, randomness: CREATOR, prizeAsset: WETH,
    protocolFeeRecipient: CREATOR, taxRecipient: CREATOR,
    tokensPerTicket: 10n ** 22n, maxTicketsPerHolder: 0n, minPrize: 1n, maxPrize: 0n,
    prizeBps: 500, recipientTaxBps: 0, recycleTaxBps: 0, minConfirmations: 1,
    winnersPerRound: 1, minRoundInterval: 3_600, weightWindowBlocks: 0,
    randomnessTimeout: 7_200, claimWindow: 604_800, basis: 0,
    exclusions, stockRewards: []
  };
}

test("predictUniswapV2Pair reproduces the canonical mainnet USDC/WETH pair", () => {
  // Ethereum mainnet Uniswap V2 constants; same init-code hash the Flap V2 factory uses.
  const pair = predictUniswapV2Pair({
    factory: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
    initCodeHash: "0x96e8ac4277198ff8b6f785478aa9a39f403cb768dd02cbee326c3e7da348845f",
    tokenA: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    tokenB: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
  });
  assert.equal(pair, "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc");
});

const FLAP_INPUT: FlapLaunchPlanInput = {
  creator: CREATOR,
  adapterFactory: ADAPTER_FACTORY,
  adapterImplementation: ADAPTER_IMPL,
  routerFactory: ROUTER_FACTORY,
  adapterSalt: SALT,
  routerSalt: SALT,
  token: {
    salt: SALT,
    predictedAddress: TOKEN,
    params: {
      name: "Rehearsal", symbol: "RHRSL", meta: "", dexThresh: 0,
      migratorType: 1, quoteToken: ZERO, quoteAmt: 0n,
      permitData: "0x", extensionID: `0x${"00".repeat(32)}`, extensionData: "0x",
      dexId: 0, lpFeeProfile: 0, buyTaxRate: 100, sellTaxRate: 100,
      taxDuration: 0n, antiFarmerDuration: 0n, mktBps: 10_000, deflationBps: 0,
      dividendBps: 0, lpBps: 0, minimumShareBalance: 0n, dividendToken: ZERO,
      tokenVersion: 6
    }
  },
  reviewedPortalConfigHash: `0x${"ab".repeat(32)}`,
  expectedFlapFeeRate: 300,
  flap: {
    portal: "0x0000000000000000000000000000000000000f01",
    v2Factory: "0x0000000000000000000000000000000000000f02",
    v2PairInitCodeHash: `0x${"96".repeat(32)}`,
    weth: WETH,
    liquidityManager: "0x0000000000000000000000000000000000000f03",
    buybackAdapter: "0x0000000000000000000000000000000000000f04"
  },
  routerConfig,
  raffle: { factory: RAFFLE_FACTORY, salt: SALT, config: raffleConfig }
};

test("planFlapLaunch follows the rehearsal ordering and encodes every step", async () => {
  const plan = await planFlapLaunch(stubClient(), FLAP_INPUT);
  assert.deepEqual(
    plan.steps.map((step) => step.id),
    ["deploy-raffle", "deploy-router", "deploy-adapter", "launch", "bind-raffle"]
  );
  assert.equal(plan.predicted.adapter, ADAPTER);
  assert.equal(plan.predicted.token, TOKEN);
  assert.match(plan.predicted.v2Pair, /^0x[0-9a-fA-F]{40}$/);
  for (const step of plan.steps) {
    const data = encodeFunctionData({
      abi: step.call.abi, functionName: step.call.functionName,
      args: step.call.args as unknown[]
    });
    assert.ok(data.length > 10, step.id);
  }
  const launch = plan.steps.find((step) => step.id === "launch");
  assert.ok(launch);
  assert.equal(launch.call.args[1], FLAP_INPUT.reviewedPortalConfigHash, "config hash pinned");
  assert.equal(launch.call.args[2], 300, "fee rate pinned");
  assert.equal(launch.call.value, 0n, "native launch value is derived from quoteAmt");
  const params = launch.call.args[0] as { beneficiary: Address; commissionReceiver: Address };
  assert.equal(params.beneficiary, ADAPTER);
  assert.equal(params.commissionReceiver, ADAPTER);
});

test("flap raffle exclusions include the six protocol holders, sorted", async () => {
  const plan = await planFlapLaunch(stubClient(), FLAP_INPUT);
  const deployRaffle = plan.steps.find((step) => step.id === "deploy-raffle");
  assert.ok(deployRaffle);
  const config = deployRaffle.call.args[1] as RaffleConfig;
  assert.equal(config.exclusions.length, 6);
  const numeric = config.exclusions.map((address) => BigInt(address));
  for (const expected of [
    FLAP_INPUT.flap.portal, plan.predicted.v2Pair, FLAP_INPUT.flap.liquidityManager,
    FLAP_INPUT.flap.buybackAdapter, ADAPTER_FACTORY, ADAPTER
  ]) {
    assert.ok(numeric.includes(BigInt(expected)), expected);
  }
  for (let i = 1; i < numeric.length; i++) assert.ok(numeric[i]! > numeric[i - 1]!);
});

test("exclusion builder is deterministic under duplicates", () => {
  const list = raffleExclusionsForFlapLaunch({
    portal: FLAP_INPUT.flap.portal,
    predictedPair: FLAP_INPUT.flap.portal, // duplicate collapses
    liquidityManager: FLAP_INPUT.flap.liquidityManager,
    buybackAdapter: FLAP_INPUT.flap.buybackAdapter,
    adapterFactory: ADAPTER_FACTORY,
    adapter: ADAPTER
  });
  assert.equal(list.length, 5);
});

test("planLetsCashIntegration stops at the adapter and hands off follow-ups", async () => {
  const plan = await planLetsCashIntegration(stubClient(), {
    creator: CREATOR,
    adapterFactory: ADAPTER_FACTORY,
    routerFactory: ROUTER_FACTORY,
    adapterSalt: SALT,
    routerSalt: SALT,
    letscash: {
      factory: "0x0000000000000000000000000000000000000f05",
      poolManager: "0x0000000000000000000000000000000000000f06",
      hook: "0x0000000000000000000000000000000000000f07"
    },
    routerConfig,
    raffle: { factory: RAFFLE_FACTORY, salt: SALT, config: raffleConfig }
  });
  assert.deepEqual(
    plan.steps.map((step) => step.id),
    ["deploy-raffle", "deploy-router", "deploy-adapter"]
  );
  assert.equal(plan.followUps.length, 4);
  assert.match(plan.followUps[0]!, /launchWithFeeSplit/);
  assert.match(plan.followUps[1]!, /feeRoutingIntact/);
  const registryFollowUp = plan.followUps[3]!;
  assert.match(registryFollowUp, /registry publication is separate and not automatic/i);
  assert.match(registryFollowUp, /public_launches/);
  assert.match(registryFollowUp, /launch transaction hash/);
  assert.match(registryFollowUp, /subject/);
  assert.match(registryFollowUp, /poolId/);
  assert.match(registryFollowUp, /configId/);
  assert.match(registryFollowUp, new RegExp(ROUTER, "i"));
  assert.match(registryFollowUp, new RegExp(ADAPTER, "i"));

  const deployRaffle = plan.steps.find((step) => step.id === "deploy-raffle");
  const config = deployRaffle!.call.args[1] as RaffleConfig;
  assert.equal(config.exclusions.length, 5, "adapter, router, factory, poolManager, hook");
  const numeric = config.exclusions.map((address) => BigInt(address));
  assert.ok(numeric.includes(BigInt(ROUTER)), "router excluded");

  for (const step of plan.steps) {
    const data = encodeFunctionData({
      abi: step.call.abi, functionName: step.call.functionName,
      args: step.call.args as unknown[]
    });
    assert.ok(data.length > 10, step.id);
  }
});

test("a stale vanity salt fails the plan before anything immutable is planned", async () => {
  await assert.rejects(
    planFlapLaunch(stubClient({
      [`${ADAPTER_IMPL}:predictSubject`]: "0x00000000000000000000000000000000000000ff"
    }), FLAP_INPUT),
    /token prediction mismatch/
  );
});

test("a Flap developer buy derives native value from quoteAmt", async () => {
  const quoteAmt = 123n;
  const plan = await planFlapLaunch(stubClient(), {
    ...FLAP_INPUT,
    token: {
      ...FLAP_INPUT.token,
      params: { ...FLAP_INPUT.token.params, quoteAmt }
    },
    minDeveloperBuyOut: 1n
  });
  assert.equal(plan.steps.find((step) => step.id === "launch")!.call.value, quoteAmt);
});

test("invalid Flap policy fails before an immutable raffle is planned", async () => {
  await assert.rejects(
    planFlapLaunch(stubClient(), {
      ...FLAP_INPUT,
      token: {
        ...FLAP_INPUT.token,
        params: { ...FLAP_INPUT.token.params, migratorType: 0 }
      }
    }),
    /migratorType must be 1/
  );
});

test("a flap router config that drops the adapter is rejected before any deploy", async () => {
  await assert.rejects(
    planFlapLaunch(stubClient(), {
      ...FLAP_INPUT,
      routerConfig: (predicted) => ({ ...routerConfig(predicted), launchpadAdapter: CREATOR })
    }),
    /launchpadAdapter/
  );
});

test("omitting the raffle drops flap raffle steps but keeps the ordering", async () => {
  const input: FlapLaunchPlanInput = {
    ...FLAP_INPUT,
    routerConfig: (predicted) => routerConfig({ adapter: predicted.adapter })
  };
  delete (input as { raffle?: unknown }).raffle;
  const plan = await planFlapLaunch(stubClient(), input);
  assert.deepEqual(
    plan.steps.map((step) => step.id),
    ["deploy-router", "deploy-adapter", "launch"]
  );
  assert.equal(plan.predicted.raffle, undefined);
});

test("omitting the raffle collapses letscash to two steps and three follow-ups", async () => {
  const plan = await planLetsCashIntegration(stubClient(), {
    creator: CREATOR,
    adapterFactory: ADAPTER_FACTORY,
    routerFactory: ROUTER_FACTORY,
    adapterSalt: SALT,
    routerSalt: SALT,
    letscash: {
      factory: "0x0000000000000000000000000000000000000f05",
      poolManager: "0x0000000000000000000000000000000000000f06",
      hook: "0x0000000000000000000000000000000000000f07"
    },
    routerConfig: (predicted) => routerConfig({ adapter: predicted.adapter })
  });
  assert.deepEqual(plan.steps.map((step) => step.id), ["deploy-router", "deploy-adapter"]);
  assert.equal(plan.followUps.length, 3);
  assert.match(plan.followUps[2]!, /registry publication is separate and not automatic/i);
  assert.equal(plan.predicted.raffle, undefined);
});

test("post-launch builders encode against their ABIs", () => {
  for (const call of [
    letscashActivate(ADAPTER, TOKEN, `0x${"22".repeat(32)}`, 1_000n),
    raffleBind(RAFFLE, TOKEN)
  ]) {
    const data = encodeFunctionData({
      abi: call.abi, functionName: call.functionName, args: call.args as unknown[]
    });
    assert.ok(data.length > 10, call.functionName);
  }
});
