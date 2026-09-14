import assert from 'node:assert/strict';
import { test } from 'node:test';
import { decodeAbiParameters, decodeFunctionData, parseAbiParameters, type Address } from 'viem';
import { buildStockTargetCall, encodeStockDeposit, encodeStockLPDeposit, stockAllocatorWeights, stockCompositeSleeveAbi, stockPortfolioFunding, stockReceiptValueUsd18 } from '../src/stock-sleeve.js';
import type { StockSelection } from '../src/stock-strategy.js';
const sleeve = '0x1111111111111111111111111111111111111111' as Address;
const assets = ['0x2222222222222222222222222222222222222222', '0x3333333333333333333333333333333333333333', '0x4444444444444444444444444444444444444444'];
const selection: StockSelection = { mode: 'basket', weights: assets.map((asset, i) => ({ assetId: `eip155:4663/erc20:${asset}`, weightBps: i === 0 ? 3334 : 3333 })) };
test('user Stock percentage never enters the immutable pooled core slot', () => {
 const weights = { stockBps: 3001, lpBps: 1999, usdgBps: 5000 };
 assert.deepEqual(stockAllocatorWeights(weights), [0, 5000, 5000]);
 const call = buildStockTargetCall({ sleeve, bank: 334n, weights, selection, now: 1800000000, validUntil: 1800000300, chainId: 4663 });
 const decoded = decodeFunctionData({ abi: stockCompositeSleeveAbi, data: call.data });
 assert.equal(decoded.functionName, 'setTarget');
 assert.deepEqual(decoded.args, [334n, 1999, 3001, true, assets, [3334, 3333, 3333], 1800000300]);
});
test('nested allocation conserves every unit with uneven bank and basket percentages', () => {
 for (let i = 10n; i < 200n; ++i) {
  const result = stockPortfolioFunding(i, { stockBps: 3001, lpBps: 1999, usdgBps: 5000 }, selection);
  assert.equal(result.lp + result.stock + result.usdg, i);
  assert.equal(result.constituents.reduce((a, b) => a + b), result.stock);
  assert.equal(result.lp, result.combined * 1999n / 5000n);
 }
});
test('invalid owner intent cannot be encoded as an executable target', () => {
 const input = { sleeve, bank: 334n, weights: { stockBps: 3000, lpBps: 2000, usdgBps: 5000 }, selection, now: 1000, validUntil: 1300, chainId: 4663 };
 assert.throws(() => buildStockTargetCall({ ...input, chainId: 1 }), /different chain/);
 assert.throws(() => buildStockTargetCall({ ...input, validUntil: 1000 }), /lifetime/);
 assert.throws(() => buildStockTargetCall({ ...input, validUntil: 100000 }), /lifetime/);
 assert.throws(() => buildStockTargetCall({ ...input, weights: { ...input.weights, stockBps: 2900 } }), /total/);
 assert.throws(() => buildStockTargetCall({ ...input, selection: { mode: 'single', weights: selection.weights } }), /Select one/);
});
test('stock and LP calldata preserve Solidity tuple layout and positive execution minima', () => {
 const lpData = encodeStockLPDeposit(95n, 1n, '0x1234');
 const encoded = encodeStockDeposit({ bank: 334n, targetNonce: 1n, minimumStockUnits: [123n], stockRouteData: ['0x'], minimumLPUnits: 1n, lpData });
 const [decoded] = decodeAbiParameters(parseAbiParameters('(uint256 bank,uint64 targetNonce,uint256[] minimumStockUnits,bytes[] stockRouteData,uint256 minimumLPUnits,bytes lpData)'), encoded);
 assert.equal(decoded.bank, 334n); assert.equal(decoded.lpData, lpData);
 assert.deepEqual(decodeAbiParameters(parseAbiParameters('(uint256, uint256, bytes)'), lpData), [[95n, 1n, '0x1234']]);
 assert.throws(() => encodeStockDeposit({ bank: 334n, targetNonce: 0n, minimumStockUnits: [123n], stockRouteData: ['0x'], minimumLPUnits: 0n, lpData: '0x' }), /Invalid/);
 assert.equal(stockReceiptValueUsd18(123n * 10n ** 36n), 123n * 10n ** 18n);
});
