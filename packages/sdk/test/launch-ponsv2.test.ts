import assert from "node:assert/strict";
import { test } from "node:test";
import { encodeFunctionData, type Address, type Hex, type PublicClient } from "viem";
import { AssetKind, type RouterConfig } from "../src/codecs/router.js";
import type { RaffleConfig } from "../src/codecs/raffle.js";
import { planPonsV2Launch, type PonsV2LaunchPlanInput } from "../src/launch/ponsv2.js";

const CREATOR = "0x00000000000000000000000000000000000000c1" as Address;
const ADAPTER_FACTORY = "0x00000000000000000000000000000000000000a0" as Address;
const ROUTER_FACTORY = "0x00000000000000000000000000000000000000b0" as Address;
const RAFFLE_FACTORY = "0x00000000000000000000000000000000000000d0" as Address;
const PONS_FACTORY = "0x00000000000000000000000000000000000000f0" as Address;
const ADAPTER = "0x00000000000000000000000000000000000000a1" as Address;
const ROUTER = "0x00000000000000000000000000000000000000b1" as Address;
const RAFFLE = "0x00000000000000000000000000000000000000d1" as Address;
const TOKEN = "0x0000000000000000000000000000000000000071" as Address;
const CURVE = "0x0000000000000000000000000000000000000072" as Address;
const WETH = "0x00000000000000000000000000000000000000e1" as Address;
const MEME_HOOK = "0x00000000000000000000000000000000000000f2" as Address;
const ZERO = "0x0000000000000000000000000000000000000000" as Address;
const SALT = `0x${"01".repeat(32)}` as Hex;
const ECONOMICS = `0x${"ec".repeat(32)}` as Hex;

function stubClient(): PublicClient {
  const reads: Record<string, unknown> = {
    [`${ADAPTER_FACTORY}:predictAddress`]: ADAPTER,
    [`${ROUTER_FACTORY}:predictLaunchpadAddress`]: ROUTER,
    [`${PONS_FACTORY}:previewLaunchEconomics`]: ECONOMICS,
    [`${PONS_FACTORY}:launchFee`]: 100n,
    [`${PONS_FACTORY}:getLaunchConfig`]: {
      supply: 10n ** 27n, curveFeeBps: 100n, phantomQuote: 10n ** 18n,
      graduationThreshold: 42n * 10n ** 17n, poolFee: 3000, tickSpacing: 60, enabled: true
    },
    [`${PONS_FACTORY}:memeHook`]: MEME_HOOK,
    [`${PONS_FACTORY}:feeEscrow`]: "0x00000000000000000000000000000000000000f3",
    [`${PONS_FACTORY}:buybackVault`]: "0x00000000000000000000000000000000000000f4",
    [`${PONS_FACTORY}:poolManager`]: "0x00000000000000000000000000000000000000f5",
    [`${PONS_FACTORY}:launchDeployer`]: "0x00000000000000000000000000000000000000f6",
    [`${MEME_HOOK}:currentFeePolicy`]: {
      protocolFeeRecipient: "0x00000000000000000000000000000000000000f7",
      protocolFeeShareBps: 2500, buybackBurnBps: 1000, hookFeeBps: 100,
      maxInternalPriceImpactBps: 300
    },
    ["0x00000000000000000000000000000000000000f6:predictLaunchAddresses"]: [TOKEN, CURVE],
    [`${RAFFLE_FACTORY}:predictRaffle`]: RAFFLE
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
    winnersPerRound: 1, minRoundInterval: 3_600, weightWindowBlocks: 900,
    randomnessTimeout: 7_200, claimWindow: 604_800, basis: 0,
    exclusions, stockRewards: []
  };
}

const INPUT: PonsV2LaunchPlanInput = {
  creator: CREATOR,
  adapterFactory: ADAPTER_FACTORY,
  routerFactory: ROUTER_FACTORY,
  ponsFactory: PONS_FACTORY,
  launchConfigId: 0n,
  pairToken: ZERO,
  adapterSalt: SALT,
  routerSalt: SALT,
  token: {
    name: "Rehearsal", symbol: "RHRSL", logo: "", description: "",
    socials: { twitter: "", telegram: "", discord: "", website: "", farcaster: "" },
    creatorTaxBps: 250, buybackEnabled: false, salt: SALT
  },
  developerBuy: 25n,
  routerConfig,
  raffle: { factory: RAFFLE_FACTORY, salt: SALT, config: raffleConfig }
};

test("plans the fork-rehearsal ordering with all predictions resolved", async () => {
  const plan = await planPonsV2Launch(stubClient(), INPUT);
  assert.deepEqual(plan.predicted, {
    adapter: ADAPTER, router: ROUTER, token: TOKEN, curve: CURVE, raffle: RAFFLE
  });
  assert.equal(plan.launchFee, 100n);
  assert.equal(plan.expectedEconomics, ECONOMICS);
  assert.deepEqual(
    plan.steps.map((step) => step.id),
    ["deploy-raffle", "deploy-router", "deploy-adapter", "launch", "bind-raffle"]
  );
});

test("every step encodes against its ABI and the launch carries fee + developer buy", async () => {
  const plan = await planPonsV2Launch(stubClient(), INPUT);
  for (const step of plan.steps) {
    const data = encodeFunctionData({
      abi: step.call.abi, functionName: step.call.functionName,
      args: step.call.args as unknown[]
    });
    assert.ok(data.length > 10, step.id);
    assert.ok(step.verify.length > 0, `${step.id} has a readback`);
  }
  const launch = plan.steps.find((step) => step.id === "launch");
  assert.ok(launch);
  assert.equal(launch.call.value, 125n, "launch fee plus developer buy");
  const params = launch.call.args[0] as { expectedEconomics: Hex; creatorFeeRecipient: Address };
  assert.equal(params.expectedEconomics, ECONOMICS, "live economics pinned into the launch");
  assert.equal(params.creatorFeeRecipient, ZERO, "zero recipient routes revenue via adapter");
});

test("raffle exclusions include the predicted curve and adapter, sorted ascending", async () => {
  const plan = await planPonsV2Launch(stubClient(), INPUT);
  const deployRaffle = plan.steps.find((step) => step.id === "deploy-raffle");
  assert.ok(deployRaffle);
  const config = deployRaffle.call.args[1] as RaffleConfig;
  const numeric = config.exclusions.map((address) => BigInt(address));
  assert.ok(numeric.includes(BigInt(CURVE)), "curve excluded");
  assert.ok(numeric.includes(BigInt(ADAPTER)), "adapter excluded");
  for (let i = 1; i < numeric.length; i++) assert.ok(numeric[i]! > numeric[i - 1]!);
});

test("a router config that drops the adapter is rejected before any deploy", async () => {
  await assert.rejects(
    planPonsV2Launch(stubClient(), {
      ...INPUT,
      routerConfig: (predicted) => ({
        ...routerConfig(predicted), launchpadAdapter: CREATOR
      })
    }),
    /launchpadAdapter/
  );
});

test("omitting the raffle drops its steps but keeps the ordering", async () => {
  const input: PonsV2LaunchPlanInput = {
    ...INPUT,
    routerConfig: (predicted) => routerConfig({ adapter: predicted.adapter })
  };
  delete (input as { raffle?: unknown }).raffle;
  const plan = await planPonsV2Launch(stubClient(), input);
  assert.deepEqual(
    plan.steps.map((step) => step.id),
    ["deploy-router", "deploy-adapter", "launch"]
  );
  assert.equal(plan.predicted.raffle, undefined);
});
