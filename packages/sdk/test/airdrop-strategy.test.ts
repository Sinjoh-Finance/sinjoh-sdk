import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeAbiParameters, parseAbiParameters } from 'viem';
import { validateAirdropSelection, validateStrategyWeights, allocateAirdropAmount, allocateStrategyAmount, encodePonsAirdropProof, assertAirdropExecutionReady, prepareAirdropPayout, type AirdropSelection } from '../src/airdrop-strategy.js';
const ids = [1,2,3,4].map(n => `eip155:4663/erc20:0x${String(n).padStart(40,'0')}`);
const selection = (weights: number[]): AirdropSelection => ({mode: weights.length === 1 ? 'single' : 'basket',weights:weights.map((weightBps,i)=>({assetId:ids[i]!,weightBps}))});
test('single and two/three token baskets sum exactly, including dust',()=>{
  assert.deepEqual(allocateAirdropAmount(101n,selection([5000,5000])),[50n,51n]);
  assert.deepEqual(allocateAirdropAmount(100n,selection([3334,3333,3333])),[33n,33n,34n]);
  assert.deepEqual(allocateAirdropAmount(1n,selection([10000])),[1n]);
});
test('invalid count, duplicate, malformed, cross-chain and zero-weight selections fail',()=>{
  for(const weights of [[],[5000],[10000,0],[5000,4999],[2500,2500,2500,2500],[-1,10001],[5000.5,4999.5]]) assert.throws(()=>validateAirdropSelection(selection(weights)));
  const s=selection([5000,5000]);s.weights[1]!.assetId=s.weights[0]!.assetId;assert.throws(()=>validateAirdropSelection(s));
  for(const id of ['eip155:1/erc20:0x'+ '1'.repeat(40),'eip155:4663/erc20:0x'+'0'.repeat(40),'INJOH']) assert.throws(()=>validateAirdropSelection({mode:'single',weights:[{assetId:id,weightBps:10000}]}));
});
test('too-small and overflowing allocations fail',()=>{
  for(const amount of [-1n,0n,1n,2n,1n<<256n]) assert.throws(()=>allocateAirdropAmount(amount,selection([3334,3333,3333])));
});
test('four sleeve rebalance conserves every base unit',()=>{
  for(let i=1;i<1000;i++) {
    const weights={usdg:i,lp:1000,stock:2000,airdrop:7000-i};
    const total=BigInt(i)*19731n+17n; const result=allocateStrategyAmount(total,weights);
    assert.equal(Object.values(result).reduce((a,b)=>a+b,0n),total);
    const parts=allocateAirdropAmount(result.airdrop,selection([i,3000,7000-i]));
    assert.equal(parts.reduce((a,b)=>a+b,0n),result.airdrop);
  }
  assert.throws(()=>validateStrategyWeights({usdg:5000,lp:3000,stock:2000,airdrop:1}));
});
test('catalog approval alone cannot enable allocation',()=>{
  assert.throws(()=>assertAirdropExecutionReady(selection([10000]),[],{chainId:4663,catalogHash:'0x'+'1'.repeat(64) as `0x${string}`,deployed:false,paused:false,verifiedAssets:ids,custodyEligibilityVerified:true,routesVerified:true,rewardsVerified:true}));
});
test('Pons proof encoding preserves exact uint256 quantities',()=>{
  const input={epoch:1060n,quoteAmount:743824186919858n,nativeAmount:0n,proof:['0x'+'1'.repeat(64) as `0x${string}`]};
  const output=decodeAbiParameters(parseAbiParameters('uint256,uint256,uint256,bytes32[]'),encodePonsAirdropProof(input));
  assert.deepEqual(output,[input.epoch,input.quoteAmount,input.nativeAmount,input.proof]);
  assert.throws(()=>encodePonsAirdropProof({...input,proof:Array(65).fill(input.proof[0])}));
});
test('claim preparation rejects ownership changes and has no arbitrary payout recipient',()=>{
  const a='0x'+'1'.repeat(40) as `0x${string}`;const b='0x'+'2'.repeat(40) as `0x${string}`;
  assert.throws(()=>prepareAirdropPayout(a,b,a,b));
  const call=prepareAirdropPayout(a,b,a,a);assert.equal(call.to,a);assert.equal(call.data.length,74);
});
