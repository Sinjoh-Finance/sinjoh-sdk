import { strict as assert } from "node:assert";
import { test } from "node:test";
import { parseStockAmount, stockWeightBps, equalStockWeights, validateStockSelection, allocateStockAmount, dividendReserveUnits, stockTokenValue, assertStockExecutionReady } from "../src/stock-strategy.js";
const ids = [1, 2, 3, 4].map(n => `eip155:4663/erc20:0x${n.toString().padStart(40, "0")}`);
const basket = { mode: "basket" as const, weights: equalStockWeights(ids.slice(0, 3)) };
test("exact decimal parsing and thirds conserve capital", () => {
  assert.equal(parseStockAmount("2500.01", 6), 2500010000n);
  assert.equal(stockWeightBps("33.34"), 3334);
  assert.deepEqual(basket.weights.map(w => w.weightBps), [3334, 3333, 3333]);
  const amounts = allocateStockAmount(2500010000n, basket);
  assert.equal(amounts.reduce((a, b) => a + b, 0n), 2500010000n);
  for (const invalid of ["-1", "1e3", "NaN", "", "1.001"]) assert.throws(() => stockWeightBps(invalid));
  assert.throws(() => allocateStockAmount(1n, basket));
});
test("reject malformed allocations", () => {
  assert.throws(() => validateStockSelection({ mode: "basket", weights: equalStockWeights([ids[0]!, ids[0]!]) }));
  assert.throws(() => validateStockSelection({ ...basket, mode: "single" }));
  assert.throws(() => validateStockSelection({ mode: "basket", weights: [{ assetId: ids[0]!, weightBps: 5000 }, { assetId: ids[1]!, weightBps: 4999 }] }));
  assert.throws(() => equalStockWeights(ids));
});
test("dividend carve-out preserves principal share equivalents and rounds down", () => {
  const q = 10n * 10n ** 18n;
  const reserved = dividendReserveUnits(q, 100n, 102n);
  assert.equal(reserved, 196078431372549019n);
  assert.ok((q - reserved) * 102n >= q * 100n);
  assert.ok((q - reserved - 1n) * 102n < q * 100n);
  assert.equal(dividendReserveUnits(q, 100n, 100n), 0n);
  assert.throws(() => dividendReserveUnits(q, 102n, 100n));
  assert.throws(() => dividendReserveUnits(q, 0n, 100n));
  assert.equal(stockTokenValue(q, 18, 102n * 10n ** 18n), 1020n * 10n ** 18n);
});
test("production admission cannot be enabled by selection alone", () => {
  assert.throws(() => assertStockExecutionReady(basket, [], { releaseApproved: false, chainId: 4663, manifestHash: `0x${"1".repeat(64)}`, custodyVerified: true, eventAttributionVerified: true, quotesVerified: true, payoutIntegrationVerified: true }));
  assert.throws(() => assertStockExecutionReady(basket, [], { releaseApproved: true, chainId: 4663, manifestHash: `0x${"1".repeat(64)}`, custodyVerified: true, eventAttributionVerified: true, quotesVerified: true, payoutIntegrationVerified: true }));
});
