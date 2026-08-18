import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import type { Address, PublicClient } from "viem";
import {
  assembleLaunchDeployment, encodePredictionCall, raffleExclusionsForLaunch,
  type PonsV2LaunchDeployment
} from "../src/predict/ponsv2.js";

const fixture = JSON.parse(
  readFileSync(new URL("./fixtures/ponsv2-prediction.json", import.meta.url), "utf8")
) as { calldata: string };

/** The exact LaunchDeployment GeneratePonsV2Fixtures.t.sol encodes. */
const FIXTURE_DEPLOYMENT: PonsV2LaunchDeployment = {
  pairToken: "0x0000000000000000000000000000000000000000",
  creatorFeeRecipient: "0x000000000000000000000000000000000000aaa1",
  originalDeployer: "0x000000000000000000000000000000000000aaa2",
  feePolicy: "0x000000000000000000000000000000000000aaa3",
  policy: {
    protocolFeeRecipient: "0x000000000000000000000000000000000000aaa4",
    protocolFeeShareBps: 2_500,
    buybackBurnBps: 1_000,
    hookFeeBps: 100,
    maxInternalPriceImpactBps: 300
  },
  feeEscrow: "0x000000000000000000000000000000000000aaa5",
  buybackVault: "0x000000000000000000000000000000000000aaa6",
  phantomQuote: 10n ** 18n,
  curveFeeBps: 100n,
  creatorTaxBps: 250n,
  buybackEnabled: false,
  graduationThreshold: 42n * 10n ** 17n,
  supply: 10n ** 27n,
  salt: `0x${Buffer.from("FIXTURE_SALT").toString("hex").padEnd(64, "0")}`,
  name: "Fixture Token",
  symbol: "FXT",
  logo: "ipfs://logo",
  description: "fixture",
  socials: {
    twitter: "x",
    telegram: "t",
    discord: "",
    website: "https://example.invalid",
    farcaster: ""
  }
};

test("prediction calldata is byte-identical to the Solidity ABI fixture", () => {
  assert.equal(encodePredictionCall(FIXTURE_DEPLOYMENT), fixture.calldata);
});

const FACTORY = "0x00000000000000000000000000000000000000f1" as Address;
const MEME_HOOK = "0x000000000000000000000000000000000000aaa3" as Address;

function stubClient(): PublicClient {
  const reads: Record<string, unknown> = {
    getLaunchConfig: {
      supply: FIXTURE_DEPLOYMENT.supply,
      curveFeeBps: FIXTURE_DEPLOYMENT.curveFeeBps,
      phantomQuote: FIXTURE_DEPLOYMENT.phantomQuote,
      graduationThreshold: FIXTURE_DEPLOYMENT.graduationThreshold,
      poolFee: 3_000,
      tickSpacing: 60,
      enabled: true
    },
    memeHook: MEME_HOOK,
    feeEscrow: FIXTURE_DEPLOYMENT.feeEscrow,
    buybackVault: FIXTURE_DEPLOYMENT.buybackVault,
    currentFeePolicy: FIXTURE_DEPLOYMENT.policy,
    poolManager: "0x000000000000000000000000000000000000bbb1",
    launchDeployer: "0x000000000000000000000000000000000000bbb2"
  };
  return {
    readContract: async (args: { functionName: string }) => {
      const value = reads[args.functionName];
      if (value === undefined) throw new Error(`unexpected read ${args.functionName}`);
      return value;
    }
  } as unknown as PublicClient;
}

test("assembleLaunchDeployment mirrors the factory's struct construction", async () => {
  const deployment = await assembleLaunchDeployment(stubClient(), {
    factory: FACTORY,
    params: {
      name: FIXTURE_DEPLOYMENT.name,
      symbol: FIXTURE_DEPLOYMENT.symbol,
      logo: FIXTURE_DEPLOYMENT.logo,
      description: FIXTURE_DEPLOYMENT.description,
      socials: FIXTURE_DEPLOYMENT.socials,
      creatorFeeRecipient: FIXTURE_DEPLOYMENT.creatorFeeRecipient,
      creatorTaxBps: Number(FIXTURE_DEPLOYMENT.creatorTaxBps),
      buybackEnabled: FIXTURE_DEPLOYMENT.buybackEnabled,
      salt: FIXTURE_DEPLOYMENT.salt
    },
    launchConfigId: 1n,
    pairToken: FIXTURE_DEPLOYMENT.pairToken,
    originalDeployer: FIXTURE_DEPLOYMENT.originalDeployer
  });
  assert.equal(encodePredictionCall(deployment), fixture.calldata);
});

test("a zero creatorFeeRecipient is substituted with the original deployer", async () => {
  const deployment = await assembleLaunchDeployment(stubClient(), {
    factory: FACTORY,
    params: {
      name: "n", symbol: "s", logo: "", description: "",
      socials: FIXTURE_DEPLOYMENT.socials,
      creatorFeeRecipient: "0x0000000000000000000000000000000000000000",
      creatorTaxBps: 0,
      buybackEnabled: false,
      salt: FIXTURE_DEPLOYMENT.salt
    },
    launchConfigId: 1n,
    pairToken: FIXTURE_DEPLOYMENT.pairToken,
    originalDeployer: FIXTURE_DEPLOYMENT.originalDeployer
  });
  assert.equal(deployment.creatorFeeRecipient, FIXTURE_DEPLOYMENT.originalDeployer);
});

test("raffle exclusions are unique and sorted ascending by numeric value", async () => {
  const curve = "0x000000000000000000000000000000000000cccc" as Address;
  const exclusions = await raffleExclusionsForLaunch(stubClient(), {
    factory: FACTORY, curve
  });
  const numeric = exclusions.map((address) => BigInt(address));
  for (let i = 1; i < numeric.length; i++) {
    assert.ok(numeric[i]! > numeric[i - 1]!, "sorted ascending and unique");
  }
  assert.ok(exclusions.some((address) => BigInt(address) === BigInt(curve)));
  assert.ok(exclusions.some((address) => BigInt(address) === BigInt(MEME_HOOK)));
});
