import test from 'node:test';
import assert from 'node:assert/strict';
import {getAddress,keccak256,zeroAddress,type Address,type PublicClient} from 'viem';
import {airdropMarketPoolId,verifyAirdropMarketReference,type AirdropMarketReference} from '../src/airdrop-market-reference.js';

const address=(n:number)=>getAddress(`0x${BigInt(n).toString(16).padStart(40,'0')}`);
const code='0x0102',hash=keccak256(code);
const contract=(n:number)=>({address:address(n),runtimeCodeHash:hash});
function fixture(kind:'v3'|'v4',native=false){
 const token=contract(10),feed=contract(20),priceHub=contract(30);
 const quoteToken=native?{address:'0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73' as Address,runtimeCodeHash:hash}:contract(5);
 const reference:AirdropMarketReference=kind==='v3'
  ?{kind,quoteToken,minimumLiquidity:'100',pool:contract(40),factory:contract(50),fee:3000}
  :{kind,quoteToken,minimumLiquidity:'100',stateView:contract(60),poolManager:contract(70),hook:contract(80),poolKey:{currency0:native?zeroAddress:quoteToken.address,currency1:token.address,fee:0x800000,tickSpacing:60,hooks:address(80)}};
 const input={policy:kind==='v3'?'execution-market-v3' as const:'execution-market-v4' as const,reference,token,feed,priceHub,decimals:18};
 const values=new Map<string,unknown>();const set=(a:Address,name:string,value:unknown)=>values.set(`${a.toLowerCase()}:${name}`,value);
 for(const [name,value]of Object.entries({subject:token.address,quoteAsset:quoteToken.address,priceHub:priceHub.address,minimumLiquidity:100n,subjectScale:10n**18n,quoteScale:10n**18n,subjectHash:hash,quoteHash:hash,hubHash:hash,decimals:18,subjectIsToken0:false}))set(feed.address,name,value);
 set(token.address,'decimals',18);set(quoteToken.address,'decimals',18);
 if(reference.kind==='v3'){
  set(feed.address,'pool',reference.pool.address);set(feed.address,'poolHash',hash);
  for(const [name,value]of Object.entries({token0:quoteToken.address,token1:token.address,factory:reference.factory.address,fee:3000}))set(reference.pool.address,name,value);
  set(reference.factory.address,'getPool',reference.pool.address);
 }else{
  for(const[name,value]of Object.entries({stateView:reference.stateView.address,poolManager:reference.poolManager.address,hook:reference.hook!.address,viewHash:hash,managerHash:hash,hookHash:hash,poolId:airdropMarketPoolId(reference.poolKey)}))set(feed.address,name,value);
  set(reference.stateView.address,'poolManager',reference.poolManager.address);
 }
 const blocks:bigint[]=[],calls:{name:string;args?:unknown[]}[]=[];let broken:Address|undefined;
 const client={getCode:async(p:{address:Address;blockNumber:bigint})=>{blocks.push(p.blockNumber);return p.address===broken?'0x0304':code;},readContract:async(p:{address:Address;functionName:string;args?:unknown[];blockNumber:bigint})=>{
  blocks.push(p.blockNumber);calls.push({name:p.functionName,...(p.args?{args:p.args}:{})});const key=`${p.address.toLowerCase()}:${p.functionName}`;
  assert(values.has(key),`Unexpected read ${key}`);return values.get(key);
 }}as unknown as PublicClient;
 return{input,reference,client,blocks,calls,set,breakCode:(a:Address)=>{broken=a;}};
}
for(const kind of ['v3','v4'] as const)test(`${kind} verifies the pinned market and all its dependencies at one block`,async()=>{
 const f=fixture(kind);await verifyAirdropMarketReference(f.client,f.input,123n);assert(f.blocks.length>20);assert(f.blocks.every(b=>b===123n));
 if(kind==='v3')assert.deepEqual(f.calls.find(c=>c.name==='getPool')!.args,[address(5),address(10),3000]);
});
test('V4 permits native ETH only through the chain WETH identity',async()=>{
 const f=fixture('v4',true);await verifyAirdropMarketReference(f.client,f.input,123n);
 f.reference.quoteToken=contract(6);await assert.rejects(verifyAirdropMarketReference(f.client,f.input,123n));
});
test('canonical V3 factory membership is checked separately from runtime code',async()=>{
 const f=fixture('v3');assert(f.reference.kind==='v3');f.set(f.reference.factory.address,'getPool',address(999));
 await assert.rejects(verifyAirdropMarketReference(f.client,f.input,123n),/binding changed/);
});
test('source metadata cannot hide changed code, a substituted underlier or different minimum liquidity',async()=>{
 for(const kind of ['v3','v4'] as const){
  for(const name of ['subject','quoteAsset','priceHub','minimumLiquidity','subjectScale','quoteScale','subjectHash','hubHash','quoteHash','subjectIsToken0']){
   const f=fixture(kind);f.set(f.input.feed.address,name,name==='subjectIsToken0'?true:0);
   await assert.rejects(verifyAirdropMarketReference(f.client,f.input,123n),/binding changed/,name);
  }
  const f=fixture(kind);f.breakCode(f.reference.quoteToken.address);await assert.rejects(verifyAirdropMarketReference(f.client,f.input,123n),/binding changed/);
 }
});
test('V4 rejects changed key, manager, state reader and hook',async()=>{
 for(const name of ['poolId','stateView','poolManager','hook','viewHash','managerHash','hookHash']){
  const f=fixture('v4');f.set(f.input.feed.address,name,0);await assert.rejects(verifyAirdropMarketReference(f.client,f.input,123n),/binding changed/,name);
 }
 const f=fixture('v4');assert(f.reference.kind==='v4');f.reference.hook=null;await assert.rejects(verifyAirdropMarketReference(f.client,f.input,123n),/binding changed/);
 const manager=fixture('v4');assert(manager.reference.kind==='v4');manager.set(manager.reference.stateView.address,'poolManager',address(999));await assert.rejects(verifyAirdropMarketReference(manager.client,manager.input,123n),/binding changed/);
});
test('malformed market metadata cannot select a more permissive fallback',async()=>{
 for(const value of ['0','-1','1.5',String(1n<<128n)]){
  const f=fixture('v3');f.reference.minimumLiquidity=value;await assert.rejects(verifyAirdropMarketReference(f.client,f.input,123n),/binding changed/);
 }
 const f=fixture('v3');f.input.policy='execution-market-v4';await assert.rejects(verifyAirdropMarketReference(f.client,f.input,123n),/binding changed/);
 const badDecimals=fixture('v4');badDecimals.input.decimals=19;await assert.rejects(verifyAirdropMarketReference(badDecimals.client,badDecimals.input,123n),/binding changed/);
});
