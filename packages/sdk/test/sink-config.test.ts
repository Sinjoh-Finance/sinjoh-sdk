import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  airdropSinkConfigHash, decodeAirdropSinkConfig, decodeLiquiditySinkConfig,
  encodeAirdropSinkConfig, encodeLiquiditySinkConfig, FeeMode, liquiditySinkConfigHash,
  validateAirdropSinkConfig, validateLiquiditySinkConfig, Venue,
  type AirdropSinkConfig, type LiquiditySinkConfig
} from "../src/codecs/sinks.js";

const airdropFixture = JSON.parse(
  readFileSync(new URL("./fixtures/airdrop-sink-config.json", import.meta.url), "utf8")
) as { encoded: string; configHash: string };
const liquidityFixture = JSON.parse(
  readFileSync(new URL("./fixtures/liquidity-sink-config.json", import.meta.url), "utf8")
) as { encoded: string; configHash: string };

/** The exact Config GenerateSinkConfigFixture.t.sol encodes in the airdrop package. */
const AIRDROP_CONFIG: AirdropSinkConfig = {
  minPayout: 1_000_000n,
  maxBatchSize: 32,
  minConfirmations: 4,
  exclusions: [
    "0x00000000000000000000000000000000000000e1",
    "0x00000000000000000000000000000000000000e2",
    "0x00000000000000000000000000000000000000e3"
  ]
};

/** The exact Config GenerateSinkConfigFixture.t.sol encodes in the liquidity package. */
const LIQUIDITY_CONFIG: LiquiditySinkConfig = {
  venue: Venue.UNISWAP_V4,
  quoteAsset: "0x000000000000000000000000000000000000d101",
  poolFee: 3_000,
  tickSpacing: 60,
  hooks: "0x000000000000000000000000000000000000d102",
  swapAdapter: "0x000000000000000000000000000000000000d103",
  priceGuard: "0x000000000000000000000000000000000000d104",
  swapRouteData: "0x00000000000000000000000000000000000000000000000000000001000276a4",
  quoteSwapBps: 5_000,
  maxMintSlippageBps: 300,
  minNotionalPerMint: 10n ** 16n,
  maxNotionalPerMint: 10n * 10n ** 18n,
  minMintInterval: 3_600,
  feeMode: FeeMode.RECYCLE,
  feeRecipient: "0x0000000000000000000000000000000000000000"
};

test("airdrop sink encoding is byte-identical to the distributor's abi.encode", () => {
  assert.equal(encodeAirdropSinkConfig(AIRDROP_CONFIG), airdropFixture.encoded);
  assert.equal(airdropSinkConfigHash(AIRDROP_CONFIG), airdropFixture.configHash);
});

test("liquidity sink encoding is byte-identical to the manager's abi.encode", () => {
  assert.equal(encodeLiquiditySinkConfig(LIQUIDITY_CONFIG), liquidityFixture.encoded);
  assert.equal(liquiditySinkConfigHash(LIQUIDITY_CONFIG), liquidityFixture.configHash);
});

test("both codecs round-trip through decode", () => {
  const airdrop = decodeAirdropSinkConfig(encodeAirdropSinkConfig(AIRDROP_CONFIG));
  assert.equal(airdrop.minPayout, AIRDROP_CONFIG.minPayout);
  assert.equal(airdrop.maxBatchSize, AIRDROP_CONFIG.maxBatchSize);
  assert.equal(airdrop.exclusions.length, 3);

  const liquidity = decodeLiquiditySinkConfig(encodeLiquiditySinkConfig(LIQUIDITY_CONFIG));
  assert.equal(liquidity.venue, LIQUIDITY_CONFIG.venue);
  assert.equal(liquidity.tickSpacing, LIQUIDITY_CONFIG.tickSpacing);
  assert.equal(liquidity.minNotionalPerMint, LIQUIDITY_CONFIG.minNotionalPerMint);
  assert.equal(liquidity.feeMode, LIQUIDITY_CONFIG.feeMode);
});

test("airdrop sink limits are enforced locally", () => {
  assert.match(
    validateAirdropSinkConfig({ ...AIRDROP_CONFIG, minPayout: 0n }).join("; "),
    /minPayout/
  );
  assert.match(
    validateAirdropSinkConfig({ ...AIRDROP_CONFIG, maxBatchSize: 65 }).join("; "),
    /maxBatchSize/
  );
  assert.match(
    validateAirdropSinkConfig({ ...AIRDROP_CONFIG, minConfirmations: 0 }).join("; "),
    /minConfirmations/
  );
  assert.match(
    validateAirdropSinkConfig({
      ...AIRDROP_CONFIG,
      exclusions: [AIRDROP_CONFIG.exclusions[1]!, AIRDROP_CONFIG.exclusions[0]!]
    }).join("; "),
    /strictly ascending/
  );
  assert.throws(
    () => encodeAirdropSinkConfig({ ...AIRDROP_CONFIG, minPayout: 0n }),
    /invalid airdrop sink config/
  );
});

test("liquidity sink limits are enforced locally", () => {
  assert.match(
    validateLiquiditySinkConfig({
      ...LIQUIDITY_CONFIG, venue: Venue.UNISWAP_V3
    }).join("; "),
    /v3 requires zero hooks/
  );
  assert.match(
    validateLiquiditySinkConfig({ ...LIQUIDITY_CONFIG, quoteSwapBps: 4_499 }).join("; "),
    /quoteSwapBps/
  );
  assert.match(
    validateLiquiditySinkConfig({ ...LIQUIDITY_CONFIG, maxMintSlippageBps: 501 }).join("; "),
    /maxMintSlippageBps/
  );
  assert.match(
    validateLiquiditySinkConfig({ ...LIQUIDITY_CONFIG, swapRouteData: "0x" }).join("; "),
    /swapRouteData/
  );
  assert.match(
    validateLiquiditySinkConfig({
      ...LIQUIDITY_CONFIG, maxNotionalPerMint: 1n
    }).join("; "),
    /maxNotionalPerMint/
  );
  assert.match(
    validateLiquiditySinkConfig({ ...LIQUIDITY_CONFIG, feeMode: FeeMode.CREATOR }).join("; "),
    /feeRecipient must be nonzero/
  );
  assert.match(
    validateLiquiditySinkConfig({ ...LIQUIDITY_CONFIG, tickSpacing: 0 }).join("; "),
    /v4 requires positive tickSpacing/
  );
  assert.match(
    validateLiquiditySinkConfig({
      ...LIQUIDITY_CONFIG,
      swapAdapter: "0x0000000000000000000000000000000000000000"
    }).join("; "),
    /swapAdapter must be nonzero/
  );
});
