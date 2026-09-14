import test from 'node:test';
import assert from 'node:assert/strict';
import {decodeFunctionData,parseAbi,keccak256,type Address,type PublicClient} from 'viem';
import {airdropCompositeAbi} from '../src/airdrop-strategy.js';
import {buildAirdropRebalanceCalls,encodeAirdropDeposit} from '../src/airdrop-rebalance.js';
import {verifyAirdropRecoveryRelease,type AirdropSleeveRelease} from '../src/airdrop-bank.js';
import type {YieldBankRebalanceExecution} from '../src/yield-banks.js';
const addr=(i:number)=>`0x${i.toString(16).padStart(40,'0')}` as Address;
const contract=(i:number)=>({address:addr(i),runtimeCodeHash:keccak256('0x0102')});
const release:AirdropSleeveRelease={version:'test',chainId:4663,manifestHash:keccak256('0x01'),catalogHash:keccak256('0x02'),maximumLossBps:200,collection:contract(10),nft:contract(11),allocator:contract(12),sleeve:contract(13),adapter:contract(14),vault:contract(15),registry:contract(16),escrow:contract(17),lpVault:contract(18),lpAdapter:contract(19),registrationPool:contract(20),lpPool:contract(21),priceHub:contract(22),payoutAsset:contract(23),governance:addr(24),airdropVault:contract(25),airdropRegistry:contract(26),targetBook:contract(27),executionLibrary:contract(28),stocks:[],airdrops:[1,2,3].map(i=>({id:`eip155:4663/erc20:${addr(i)}`,symbol:`A${i}`,decimals:18,minimumHoldingUnits:'1',token:contract(i),entryRoute:contract(30+i),exitRoute:contract(40+i),feed:contract(50+i),rewardAssets:[addr(23)],claimAdapters:[contract(60+i)],evidenceHash:keccak256('0x03'),enabled:true}))};
function fixture(n:number){
 const airdrops={mode:n===1?'single' as const:'basket' as const,weights:release.airdrops.slice(0,n).map((a,i)=>({assetId:a.id,weightBps:Math.floor(10000/n)+(i===0?10000%n:0)}))};
 const empty={minimumOutputs:[],adapterCalls:[]};const inactive={minimumOutput:0n,minimumShares:0n,routeData:'0x' as const,sleeveData:'0x' as const};
 const deposit=encodeAirdropDeposit({bank:334n,targetNonce:8n,minimumStockUnits:[],stockRouteData:[],minimumAirdropUnits:Array(n).fill(1n),airdropRouteData:Array(n).fill('0x'),minimumLPUnits:1n,lpData:'0x1234'});
 const execution:YieldBankRebalanceExecution={redemptions:[empty,empty,{minimumOutputs:[1n],adapterCalls:[]}],deltaPoolRedemption:empty,conversions:[],allocations:[inactive,{minimumOutput:1n,minimumShares:1n,routeData:'0x',sleeveData:deposit},{minimumOutput:1n,minimumShares:1n,routeData:'0x',sleeveData:'0x'}],minimumWethRecovered:1n,deadline:1200n};
 return {release,router:addr(29),bank:334n,owner:addr(99),wallet:addr(99),weights:{usdg:6000,lp:1000,stock:0,airdrop:3000},stocks:{mode:'single' as const,weights:[]},airdrops,validUntil:2000,now:1000,currentAllocatorRevision:4n,currentTargetNonce:7n,maximumLossBps:100,execution};
}
test('one, two and three tokens encode the reviewed basket followed by allocation and execution',()=>{
 for(const n of [1,2,3]){
  const input=fixture(n);const calls=buildAirdropRebalanceCalls(input);
  assert.deepEqual(calls.map(c=>c.to.toLowerCase()),[release.targetBook.address,release.allocator.address,input.router].map(a=>a.toLowerCase()));
  const target=decodeFunctionData({abi:airdropCompositeAbi,data:calls[0].data});assert.equal(target.functionName,'setTarget');
  if(target.functionName!=='setTarget')throw Error('wrong method');
  assert.equal(target.args[0],334n);assert.equal(target.args[1].airdrop,3000);assert.deepEqual(target.args[1].airdrops.weights,input.airdrops.weights.map(w=>w.weightBps));
  const decoded=decodeFunctionData({abi:parseAbi(['function setTargetAllocation(uint256,uint16[3],address,uint16,uint48)']),data:calls[1].data});
  assert.deepEqual(decoded.args,[334n,[0,4000,6000],release.registrationPool.address,100,2000]);
 }
});
test('changed owner, expiry, nonce, loss limit and disabled candidates cannot construct execution',()=>{
 const input=fixture(3);
 for(const patch of [{wallet:addr(98)},{validUntil:1000},{now:1200},{currentTargetNonce:8n},{currentAllocatorRevision:(1n<<64n)-1n},{maximumLossBps:201},{maximumLossBps:101,release:{...release,maximumLossBps:100 as const}},{release:{...release,airdrops:release.airdrops.map(a=>({...a,enabled:false}))}}])assert.throws(()=>buildAirdropRebalanceCalls({...input,...patch}));
 const bad=structuredClone(input);bad.execution.allocations[1].minimumOutput=0n;assert.throws(()=>buildAirdropRebalanceCalls(bad));
 const badExit=structuredClone(input);badExit.execution.deltaPoolRedemption.adapterCalls=[{adapter:addr(80),maxLossBps:200,data:'0x'}];assert.throws(()=>buildAirdropRebalanceCalls(badExit));
});
test('reward recovery checks permanent identity without relying on trading routes or price feeds',async()=>{
 const visited:string[]=[];
 const client={getChainId:async()=>4663,getCode:async({address}:{address:Address})=>{visited.push(address);return '0x0102';},readContract:async({address,functionName}:{address:Address;functionName:string})=>{
  if(functionName==='nft')return release.nft.address;if(functionName==='collection')return release.collection.address;if(functionName==='registry')return release.airdropRegistry.address;if(functionName==='catalogHash')return release.catalogHash;throw Error(`unexpected ${address} ${functionName}`);
 }} as unknown as PublicClient;
 await verifyAirdropRecoveryRelease(client,release,123n);
 assert.deepEqual(visited,[release.collection.address,release.nft.address,release.airdropVault.address,release.airdropRegistry.address]);
 await assert.rejects(verifyAirdropRecoveryRelease({...client,getChainId:async()=>1} as PublicClient,release,123n),/Invalid/);
 await assert.rejects(verifyAirdropRecoveryRelease({...client,getCode:async()=>'0x03'} as PublicClient,release,123n),/changed/);
});
