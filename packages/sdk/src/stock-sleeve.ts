import { encodeAbiParameters, encodeFunctionData, getAddress, parseAbiParameters, zeroAddress, type Address, type Hex } from 'viem';
import { validateStockSelection, allocateStockAmount, type StockSelection } from './stock-strategy.js';
import { stockCompositeSleeveAbi } from './generated/stock-abis.js';
export * from './generated/stock-abis.js';

export type StockPortfolioWeights = { usdgBps: number; lpBps: number; stockBps: number };
export type StockOwnerCall = { to: Address; data: Hex; value: 0n };
const uint256Max = (1n << 256n) - 1n;
const amount = (value: bigint, positive = false) => { if (value < (positive ? 1n : 0n) || value > uint256Max) throw new Error('Invalid uint256 amount'); };
const bps = (value: number) => { if (!Number.isInteger(value) || value < 0 || value > 10000) throw new Error('Invalid basis points'); };
export function validateStockPortfolio(weights: StockPortfolioWeights) {
  bps(weights.usdgBps); bps(weights.lpBps); bps(weights.stockBps);
  if (weights.usdgBps + weights.lpBps + weights.stockBps !== 10000) throw new Error('Portfolio percentages must total 100%.');
}
/** Existing allocator slots remain [core, dynamic, USDG]. Stock and LP are isolated inside
 * the registered composite destination; the displayed Stock percentage is never sent to core. */
export function stockAllocatorWeights(weights: StockPortfolioWeights): readonly [number, number, number] {
  validateStockPortfolio(weights);
  return [0, weights.lpBps + weights.stockBps, weights.usdgBps];
}
export function stockPortfolioFunding(wethRecovered: bigint, weights: StockPortfolioWeights, selection: StockSelection) {
  amount(wethRecovered, true); validateStockPortfolio(weights);
  if (weights.stockBps === 0) throw new Error('Use the existing USDG/LP flow when Stock is zero.');
  const combined = wethRecovered * BigInt(weights.stockBps + weights.lpBps) / 10000n;
  const lp = combined * BigInt(weights.lpBps) / BigInt(weights.stockBps + weights.lpBps);
  const stock = combined - lp;
  return { combined, lp, stock, usdg: wethRecovered - combined, constituents: allocateStockAmount(stock, selection) };
}
export function buildStockTargetCall(input: { sleeve: Address; bank: bigint; weights: StockPortfolioWeights; selection: StockSelection; validUntil: number; now: number; chainId: number }): StockOwnerCall {
  amount(input.bank, true); validateStockPortfolio(input.weights); validateStockSelection(input.selection);
  if (input.weights.stockBps === 0 || !Number.isSafeInteger(input.now) || !Number.isSafeInteger(input.validUntil) || input.validUntil <= input.now || input.validUntil > input.now + 86400 || input.validUntil >= 2 ** 48) throw new Error('Invalid Stock target lifetime or allocation.');
  const assets = input.selection.weights.map(item => {
    if (!item.assetId.startsWith(`eip155:${input.chainId}/erc20:`)) throw new Error('Stock belongs to a different chain.');
    return getAddress(item.assetId.split('/erc20:')[1]!);
  });
  const to = getAddress(input.sleeve);
  if (to === zeroAddress) throw new Error('Stock sleeve is not deployed.');
  return { to, value: 0n, data: encodeFunctionData({ abi: stockCompositeSleeveAbi, functionName: 'setTarget', args: [input.bank, input.weights.lpBps, input.weights.stockBps, input.selection.mode === 'basket', assets, input.selection.weights.map(w => w.weightBps), input.validUntil] }) };
}
const depositType = parseAbiParameters('(uint256 bank,uint64 targetNonce,uint256[] minimumStockUnits,bytes[] stockRouteData,uint256 minimumLPUnits,bytes lpData)');
const redemptionType = parseAbiParameters('(uint256[] minimumStockWeth,bytes[] stockRouteData,uint256 minimumLPWeth,bytes lpData)');
export function encodeStockDeposit(input: { bank: bigint; targetNonce: bigint; minimumStockUnits: readonly bigint[]; stockRouteData: readonly Hex[]; minimumLPUnits: bigint; lpData: Hex }): Hex {
  amount(input.bank, true); amount(input.minimumLPUnits);
  if (input.targetNonce < 1n || input.targetNonce >= 1n << 64n || input.minimumStockUnits.length < 1 || input.minimumStockUnits.length > 3 || input.minimumStockUnits.length !== input.stockRouteData.length) throw new Error('Invalid stock deposit.');
  input.minimumStockUnits.forEach(v => amount(v, true));
  if (input.minimumLPUnits === 0n && input.lpData !== '0x') throw new Error('LP deployment requires LP allocation.');
  return encodeAbiParameters(depositType, [input]);
}
export function encodeStockRedemption(input: { minimumStockWeth: readonly bigint[]; stockRouteData: readonly Hex[]; minimumLPWeth: bigint; lpData: Hex }): Hex {
  amount(input.minimumLPWeth);
  if (input.minimumStockWeth.length < 1 || input.minimumStockWeth.length > 3 || input.minimumStockWeth.length !== input.stockRouteData.length) throw new Error('Invalid stock redemption.');
  input.minimumStockWeth.forEach(v => amount(v, true));
  if (input.minimumLPWeth === 0n && input.lpData !== '0x') throw new Error('Unexpected LP redemption data.');
  return encodeAbiParameters(redemptionType, [input]);
}
export function encodeStockLPDeposit(assetsToDeploy: bigint, minimumPositionUnits: bigint, adapterData: Hex): Hex {
  amount(assetsToDeploy, true); amount(minimumPositionUnits, true);
  return encodeAbiParameters(parseAbiParameters('(uint256 assetsToDeploy,uint256 minimumPositionUnits,bytes adapterData)'), [{ assetsToDeploy, minimumPositionUnits, adapterData }]);
}
export function stockReceiptValueUsd18(receiptUnits36: bigint): bigint { amount(receiptUnits36); return receiptUnits36 / 10n ** 18n; }
/** One USD is 10^36 receipt units. Formatting the receipt as an 18-decimal token is incorrect. */
export const stockReceiptDecimals = 36 as const;
