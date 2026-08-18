import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  AssetKind, encodeRouterConfig, routerConfigHash, validateRouterConfig, type RouterConfig
} from "../src/codecs/router.js";

const fixture = JSON.parse(
  readFileSync(new URL("./fixtures/router-config.json", import.meta.url), "utf8")
) as { encoded: string; configHash: string };

/** The exact Config GenerateRouterConfigFixture.t.sol encodes in the fee-router package. */
const FIXTURE_CONFIG: RouterConfig = {
  creator: "0x00000000000000000000000000000000c0ffee01",
  protocolFeeRecipient: "0x00000000000000000000000000000000c0ffee02",
  weth: "0x000000000000000000000000000000000000eee1",
  launchpadAdapter: "0x00000000000000000000000000000000c0ffee03",
  normalizations: [{
    asset: { kind: AssetKind.FIXED_ERC20, token: "0x000000000000000000000000000000000000f100" },
    route: { adapter: "0x000000000000000000000000000000000000f101", routeData: "0x1234" },
    priceGuard: "0x000000000000000000000000000000000000f102",
    maxAmountInPerCall: 10n ** 18n
  }],
  buckets: [
    {
      output: { kind: AssetKind.FIXED_ERC20, token: "0x000000000000000000000000000000000000eee1" },
      bps: 6_000,
      route: { adapter: "0x0000000000000000000000000000000000000000", routeData: "0x" },
      priceGuard: "0x0000000000000000000000000000000000000000",
      maxAmountInPerCall: 5n * 10n ** 18n,
      allocations: [
        {
          destination: "0x000000000000000000000000000000000000f201",
          bps: 7_000, isSink: false, creatorMayRepoint: true, sinkConfig: "0x"
        },
        {
          destination: "0x000000000000000000000000000000000000f202",
          bps: 3_000, isSink: true, creatorMayRepoint: false, sinkConfig: "0xdeadbeef"
        }
      ]
    },
    {
      output: { kind: AssetKind.SUBJECT, token: "0x0000000000000000000000000000000000000000" },
      bps: 4_000,
      route: { adapter: "0x000000000000000000000000000000000000f301", routeData: "0xabcd" },
      priceGuard: "0x000000000000000000000000000000000000f302",
      maxAmountInPerCall: 3n * 10n ** 18n,
      allocations: [{
        destination: "0x000000000000000000000000000000000000f401",
        bps: 10_000, isSink: false, creatorMayRepoint: false, sinkConfig: "0x"
      }]
    }
  ]
};

test("config encoding is byte-identical to the fee-router package's abi.encode", () => {
  assert.equal(encodeRouterConfig(FIXTURE_CONFIG), fixture.encoded);
});

test("configHash matches the fee-router package's keccak", () => {
  assert.equal(routerConfigHash(FIXTURE_CONFIG), fixture.configHash);
});

test("a valid config produces no issues", () => {
  assert.deepEqual(validateRouterConfig(FIXTURE_CONFIG), []);
});

test("hard limits are enforced locally", () => {
  const broken = structuredClone(FIXTURE_CONFIG);
  broken.buckets[0]!.bps = 5_000; // sum 9,000
  assert.match(validateRouterConfig(broken).join("; "), /bucket bps must total 10,000/);

  const badAllocations = structuredClone(FIXTURE_CONFIG);
  badAllocations.buckets[1]!.allocations[0]!.bps = 9_999;
  assert.match(
    validateRouterConfig(badAllocations).join("; "), /allocation bps must total 10,000/
  );

  const badKind = structuredClone(FIXTURE_CONFIG);
  badKind.buckets[1]!.output.token = FIXTURE_CONFIG.weth;
  assert.match(validateRouterConfig(badKind).join("; "), /requires a zero token/);

  const noBuckets = structuredClone(FIXTURE_CONFIG);
  noBuckets.buckets = [];
  assert.match(validateRouterConfig(noBuckets).join("; "), /buckets must number 1 to 8/);

  const oversized = structuredClone(FIXTURE_CONFIG);
  oversized.normalizations[0]!.route.routeData = `0x${"00".repeat(1_025)}`;
  assert.match(validateRouterConfig(oversized).join("; "), /exceeds 1024 bytes/);

  const strayConfig = structuredClone(FIXTURE_CONFIG);
  strayConfig.buckets[1]!.allocations[0]!.sinkConfig = "0x01";
  assert.match(validateRouterConfig(strayConfig).join("; "), /non-sink allocation/);

  assert.throws(() => encodeRouterConfig(noBuckets), /invalid router config/);
});

test("local validation mirrors the router's pure initializer invariants", () => {
  const zeroCap = structuredClone(FIXTURE_CONFIG);
  zeroCap.normalizations[0]!.maxAmountInPerCall = 0n;
  assert.match(validateRouterConfig(zeroCap).join("; "), /greater than zero/);

  const wethNormalization = structuredClone(FIXTURE_CONFIG);
  wethNormalization.normalizations[0]!.asset.token = FIXTURE_CONFIG.weth;
  assert.match(validateRouterConfig(wethNormalization).join("; "), /cannot duplicate WETH/);

  const duplicateOutput = structuredClone(FIXTURE_CONFIG);
  duplicateOutput.buckets[1]!.output = structuredClone(duplicateOutput.buckets[0]!.output);
  assert.match(validateRouterConfig(duplicateOutput).join("; "), /duplicate bucket output/);

  const guardedIdentity = structuredClone(FIXTURE_CONFIG);
  guardedIdentity.buckets[0]!.priceGuard = FIXTURE_CONFIG.normalizations[0]!.priceGuard;
  assert.match(validateRouterConfig(guardedIdentity).join("; "), /priceGuard must be zero/);

  const repointableSink = structuredClone(FIXTURE_CONFIG);
  repointableSink.buckets[0]!.allocations[1]!.creatorMayRepoint = true;
  assert.match(validateRouterConfig(repointableSink).join("; "), /sink allocations cannot/);
});
