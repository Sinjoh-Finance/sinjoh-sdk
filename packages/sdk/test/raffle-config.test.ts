import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  encodeRaffleConfig, raffleConfigHash, validateRaffleConfig, type RaffleConfig
} from "../src/codecs/raffle.js";

const fixture = JSON.parse(
  readFileSync(new URL("./fixtures/config-hash.json", import.meta.url), "utf8")
) as { encoded: string; configHash: string };

/** The exact Config GenerateFixtures.t.sol encodes in the raffle package. */
const FIXTURE_CONFIG: RaffleConfig = {
  creator: "0x000000000000000000000000000000000000ab01",
  attestor: "0x000000000000000000000000000000000000ab02",
  randomness: "0x000000000000000000000000000000000000ab03",
  prizeAsset: "0x000000000000000000000000000000000000ab04",
  protocolFeeRecipient: "0x000000000000000000000000000000000000ab05",
  taxRecipient: "0x000000000000000000000000000000000000ab06",
  tokensPerTicket: 10_000n * 10n ** 18n,
  maxTicketsPerHolder: 50n,
  minPrize: 1n,
  maxPrize: 0n,
  prizeBps: 500,
  recipientTaxBps: 700,
  recycleTaxBps: 300,
  minConfirmations: 1,
  winnersPerRound: 4,
  minRoundInterval: 3_600,
  weightWindowBlocks: 900,
  randomnessTimeout: 7_200,
  claimWindow: 604_800,
  basis: 1,
  exclusions: [
    "0x0000000000000000000000000000000000a11c00",
    "0x0000000000000000000000000000000000b0b000"
  ],
  stockRewards: [{
    asset: "0x0000000000000000000000000000000000c0de00",
    swapAdapter: "0x0000000000000000000000000000000000c0de01",
    priceGuard: "0x0000000000000000000000000000000000c0de02",
    routeData: "0x0000000000000000000000000000000000000000000000000000000000002710",
    guardData: "0x"
  }]
};

test("config encoding is byte-identical to the raffle package's abi.encode", () => {
  assert.equal(encodeRaffleConfig(FIXTURE_CONFIG), fixture.encoded);
});

test("configHash matches the raffle package's keccak", () => {
  assert.equal(raffleConfigHash(FIXTURE_CONFIG), fixture.configHash);
});

test("unsorted exclusions and unknown bases are rejected locally", () => {
  assert.deepEqual(validateRaffleConfig(FIXTURE_CONFIG), []);
  assert.match(
    validateRaffleConfig({
      ...FIXTURE_CONFIG,
      exclusions: [FIXTURE_CONFIG.exclusions[1]!, FIXTURE_CONFIG.exclusions[0]!]
    }).join("; "),
    /sorted ascending/
  );
  assert.match(validateRaffleConfig({ ...FIXTURE_CONFIG, basis: 2 }).join("; "), /basis/);
  assert.throws(
    () => encodeRaffleConfig({ ...FIXTURE_CONFIG, basis: 2 }), /invalid raffle config/
  );
});

test("local validation mirrors the raffle initializer's hard limits", () => {
  assert.match(
    validateRaffleConfig({ ...FIXTURE_CONFIG, tokensPerTicket: 0n }).join("; "),
    /tokensPerTicket/
  );
  assert.match(
    validateRaffleConfig({ ...FIXTURE_CONFIG, recipientTaxBps: 3_000, recycleTaxBps: 2_001 })
      .join("; "),
    /at most 5,000/
  );
  assert.match(
    validateRaffleConfig({ ...FIXTURE_CONFIG, winnersPerRound: 17 }).join("; "),
    /winnersPerRound/
  );
  assert.match(
    validateRaffleConfig({ ...FIXTURE_CONFIG, basis: 0, weightWindowBlocks: 1 }).join("; "),
    /SNAPSHOT basis/
  );
  assert.match(
    validateRaffleConfig({
      ...FIXTURE_CONFIG,
      stockRewards: [{ ...FIXTURE_CONFIG.stockRewards[0]!, asset: FIXTURE_CONFIG.prizeAsset }]
    }).join("; "),
    /differ from prizeAsset/
  );
});
