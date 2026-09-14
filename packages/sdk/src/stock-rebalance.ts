import { decodeAbiParameters, encodeFunctionData, getAddress, parseAbi, parseAbiParameters, type Address } from 'viem';
import { buildStockTargetCall, stockAllocatorWeights, type StockOwnerCall, type StockPortfolioWeights } from './stock-sleeve.js';
import { prepareYieldBankTargetAllocation, prepareYieldBankTargetExecution, type YieldBankRebalanceExecution } from './yield-banks.js';
import type { StockSelection } from './stock-strategy.js';
import type { StockSleeveRelease } from './stock-bank.js';
export const stockOwnerExecutionRouterAbi = parseAbi([
  'function executeOwnerAllocation(uint256 tokenId,uint64 expectedRevision,((uint256[] minimumOutputs,(address adapter,uint16 maxLossBps,bytes data)[] adapterCalls)[3] redemptions,(uint256[] minimumOutputs,(address adapter,uint16 maxLossBps,bytes data)[] adapterCalls) deltaPoolRedemption,(address asset,uint256 minimumWethOut,bytes routeData)[] conversions,(uint256 minimumOutput,uint256 minimumShares,bytes routeData,bytes sleeveData)[3] allocations,uint256 minimumWethRecovered,uint256 deadline) execution) returns (uint256 wethRecovered,uint256[3] shares)',
]);
/** The calls must be sent by the NFT owner's wallet in order. If atomic wallet calls are
 * unavailable, re-read ownership, both nonces and expiry between confirmations. A saved
 * target alone never moves money. This helper grants no signing or execution authority. */
export function buildStockRebalanceCalls(input: {
  release: StockSleeveRelease; router: Address; bank: bigint; owner: Address; wallet: Address;
  weights: StockPortfolioWeights; selection: StockSelection; validUntil: number; now: number;
  currentAllocatorRevision: bigint; currentStockNonce: bigint; maximumLossBps: number;
  execution: YieldBankRebalanceExecution;
}): readonly StockOwnerCall[] {
  if (getAddress(input.owner) !== getAddress(input.wallet)) throw new Error('The wallet must own this Piggy Bank.');
  if (!Number.isInteger(input.maximumLossBps) || input.maximumLossBps < 0 || input.maximumLossBps > 500) throw new Error('Invalid owner loss limit.');
  if (input.currentAllocatorRevision < 0n || input.currentAllocatorRevision >= (1n << 64n) - 1n || input.currentStockNonce < 0n || input.currentStockNonce >= (1n << 64n) - 1n) throw new Error('Invalid target revision.');
  if (input.execution.deadline <= BigInt(input.now) || input.execution.deadline > BigInt(input.validUntil) || input.execution.deadline > BigInt(input.now + 600)) throw new Error('Refresh the rebalance quote.');
  for (const item of input.selection.weights) if (!input.release.stocks.some(s => item.assetId === `eip155:${input.release.chainId}/erc20:${s.token.address.toLowerCase()}`)) throw new Error('Stock is not in the deployed release.');
  const target = buildStockTargetCall({ sleeve: input.release.sleeve.address, bank: input.bank, weights: input.weights, selection: input.selection, validUntil: input.validUntil, now: input.now, chainId: input.release.chainId });
  const [deposit] = decodeAbiParameters(parseAbiParameters('(uint256 bank,uint64 targetNonce,uint256[] minimumStockUnits,bytes[] stockRouteData,uint256 minimumLPUnits,bytes lpData)'), input.execution.allocations[1].sleeveData);
  if (deposit.bank !== input.bank || deposit.targetNonce !== input.currentStockNonce + 1n || deposit.minimumStockUnits.length !== input.selection.weights.length || deposit.stockRouteData.length !== input.selection.weights.length || deposit.minimumStockUnits.some(v => v <= 0n) || (input.weights.lpBps > 0 && deposit.minimumLPUnits <= 0n) || (input.weights.lpBps === 0 && (deposit.minimumLPUnits !== 0n || deposit.lpData !== '0x'))) throw new Error('Stock execution does not match the reviewed bank and basket.');
  const allocatorWeights = stockAllocatorWeights(input.weights);
  for (let i = 0; i < 3; ++i) {
    const allocation = input.execution.allocations[i]!;
    if (allocatorWeights[i] === 0 ? allocation.minimumOutput !== 0n || allocation.minimumShares !== 0n : allocation.minimumOutput <= 0n || allocation.minimumShares <= 0n) throw new Error('Execution allocations do not match the reviewed portfolio.');
  }
  for (const redemption of [...input.execution.redemptions, input.execution.deltaPoolRedemption]) for (const call of redemption.adapterCalls) if (call.maxLossBps > input.maximumLossBps) throw new Error('An exit exceeds the owner loss limit.');
  // Reuse the allocator SDK's structural and minima checks, then target the unchanged
  // self-service router. The legacy AndDeploy helper expects a different adapter ABI.
  prepareYieldBankTargetExecution(input.release.allocator.address, input.bank, input.currentAllocatorRevision + 1n, input.execution);
  const allocation = prepareYieldBankTargetAllocation(input.release.allocator.address, input.bank, allocatorWeights, input.release.registrationPool.address, input.maximumLossBps, BigInt(input.validUntil));
  const execute: StockOwnerCall = { to: getAddress(input.router), value: 0n, data: encodeFunctionData({ abi: stockOwnerExecutionRouterAbi, functionName: 'executeOwnerAllocation', args: [input.bank, input.currentAllocatorRevision + 1n, input.execution] }) };
  return [target, allocation, execute];
}
