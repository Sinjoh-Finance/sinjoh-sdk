import { decodeAbiParameters, encodeAbiParameters, encodeFunctionData, getAddress, parseAbiParameters, type Address, type Hex } from 'viem';
import { airdropCompositeAbi, validateAirdropSelection, validateStrategyWeights, type AirdropSelection, type StrategyWeights } from './airdrop-strategy.js';
import { validateStockSelection, type StockSelection } from './stock-strategy.js';
import { prepareYieldBankTargetAllocation, prepareYieldBankTargetExecution, type YieldBankRebalanceExecution } from './yield-banks.js';
import { stockOwnerExecutionRouterAbi } from './stock-rebalance.js';
import type { AirdropSleeveRelease } from './airdrop-bank.js';
export const airdropDepositTuple = parseAbiParameters('(uint256 bank,uint64 targetNonce,uint256[] minimumStockUnits,bytes[] stockRouteData,uint256[] minimumAirdropUnits,bytes[] airdropRouteData,uint256 minimumLPUnits,bytes lpData)');
export const airdropRedemptionTuple = parseAbiParameters('(uint256[] minimumStockWeth,bytes[] stockRouteData,uint256[] minimumAirdropWeth,bytes[] airdropRouteData,uint256 minimumLPWeth,bytes lpData)');
export function encodeAirdropDeposit(input: { bank:bigint; targetNonce:bigint; minimumStockUnits:readonly bigint[]; stockRouteData:readonly Hex[]; minimumAirdropUnits:readonly bigint[]; airdropRouteData:readonly Hex[]; minimumLPUnits:bigint; lpData:Hex }): Hex { return encodeAbiParameters(airdropDepositTuple,[input]); }
export function encodeAirdropRedemption(input: { minimumStockWeth:readonly bigint[]; stockRouteData:readonly Hex[]; minimumAirdropWeth:readonly bigint[]; airdropRouteData:readonly Hex[]; minimumLPWeth:bigint; lpData:Hex }): Hex { return encodeAbiParameters(airdropRedemptionTuple,[input]); }
export function buildAirdropRebalanceCalls(input: {
 release:AirdropSleeveRelease; router:Address; bank:bigint; owner:Address; wallet:Address;
 weights:StrategyWeights; stocks:StockSelection; airdrops:AirdropSelection; validUntil:number; now:number;
 currentAllocatorRevision:bigint; currentTargetNonce:bigint; maximumLossBps:number; execution:YieldBankRebalanceExecution;
}) {
 const {release,weights,stocks,airdrops}=input;
 validateStrategyWeights(weights);
 if(getAddress(input.owner)!==getAddress(input.wallet) || input.bank<=0n)throw Error('The current NFT owner must sign.');
 if(!Number.isSafeInteger(input.now)||!Number.isSafeInteger(input.validUntil)||input.validUntil<=input.now||input.validUntil>input.now+86400)throw Error('Invalid target expiry.');
 if(!Number.isInteger(input.maximumLossBps)||input.maximumLossBps<0||input.maximumLossBps>release.maximumLossBps)throw Error('Invalid rebalance loss limit.');
 if(input.currentAllocatorRevision<0n||input.currentAllocatorRevision>=(1n<<64n)-1n||input.currentTargetNonce<0n||input.currentTargetNonce>=(1n<<64n)-1n)throw Error('Invalid target revision.');
 if(input.execution.deadline<=BigInt(input.now)||input.execution.deadline>BigInt(Math.min(input.validUntil,input.now+600)))throw Error('Refresh the rebalance quote.');
 if(weights.stock>0)validateStockSelection(stocks);else if(stocks.weights.length)throw Error('Clear the inactive Stock basket.');
 if(weights.airdrop>0)validateAirdropSelection(airdrops);else if(airdrops.weights.length)throw Error('Clear the inactive Airdrop basket.');
 for(const s of stocks.weights)if(!release.stocks.some(a=>s.assetId===`eip155:4663/erc20:${a.token.address.toLowerCase()}`))throw Error('Stock is not admitted.');
 for(const s of airdrops.weights)if(!release.airdrops.some(a=>a.id===s.assetId&&a.enabled))throw Error('Airdrop token is not enabled.');
 const combined=weights.lp+weights.stock+weights.airdrop;
 if(combined===0)throw Error('Use the existing USDG exit flow.');
 const [deposit]=decodeAbiParameters(airdropDepositTuple,input.execution.allocations[1].sleeveData);
 if(deposit.bank!==input.bank||deposit.targetNonce!==input.currentTargetNonce+1n||deposit.minimumStockUnits.length!==stocks.weights.length||deposit.stockRouteData.length!==stocks.weights.length||deposit.minimumAirdropUnits.length!==airdrops.weights.length||deposit.airdropRouteData.length!==airdrops.weights.length||[...deposit.minimumStockUnits,...deposit.minimumAirdropUnits].some(n=>n<=0n)||(weights.lp>0?deposit.minimumLPUnits<=0n:deposit.minimumLPUnits!==0n||deposit.lpData!=='0x'))throw Error('Execution does not match the reviewed baskets.');
 const allocatorWeights=[0,combined,weights.usdg] as const;
 for(let i=0;i<3;i++) { const a=input.execution.allocations[i]!;if(allocatorWeights[i]===0 ? a.minimumOutput!==0n||a.minimumShares!==0n : a.minimumOutput<=0n||a.minimumShares<=0n)throw Error('Execution allocations do not match the review.'); }
 for(const redemption of [...input.execution.redemptions,input.execution.deltaPoolRedemption])for(const c of redemption.adapterCalls)if(c.maxLossBps>input.maximumLossBps)throw Error('Exit exceeds the owner loss limit.');
 prepareYieldBankTargetExecution(release.allocator.address,input.bank,input.currentAllocatorRevision+1n,input.execution);
 const basket=(s:StockSelection|AirdropSelection)=>({assets:s.weights.map(w=>getAddress(w.assetId.split(':').at(-1)!)),weights:s.weights.map(w=>w.weightBps)});
 const target={to:release.targetBook.address,value:0n,data:encodeFunctionData({abi:airdropCompositeAbi,functionName:'setTarget',args:[input.bank,{lp:weights.lp,stock:weights.stock,airdrop:weights.airdrop,stocks:basket(stocks),airdrops:basket(airdrops),validUntil:input.validUntil}]})};
 const allocation=prepareYieldBankTargetAllocation(release.allocator.address,input.bank,allocatorWeights,release.registrationPool.address,input.maximumLossBps,BigInt(input.validUntil));
 const execute={to:getAddress(input.router),value:0n,data:encodeFunctionData({abi:stockOwnerExecutionRouterAbi,functionName:'executeOwnerAllocation',args:[input.bank,input.currentAllocatorRevision+1n,input.execution]})};
 return [target,allocation,execute] as const;
}
