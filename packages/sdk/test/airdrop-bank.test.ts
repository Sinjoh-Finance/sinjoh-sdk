import test from 'node:test';
import assert from 'node:assert/strict';
import {getAddress,keccak256,type Address,type PublicClient} from 'viem';
import {readAirdropBankPosition,verifyAirdropSleeveRelease,type AirdropSleeveRelease} from '../src/airdrop-bank.js';
import {verifyStockSleeveRelease} from '../src/stock-bank.js';
const addr=(n:number)=>getAddress(`0x${(0xabcdef000000n+BigInt(n)).toString(16).padStart(40,'0')}`);
const hash=keccak256('0x0102');
const contract=(n:number)=>({address:addr(n),runtimeCodeHash:hash});
function fixture(){
 const release:AirdropSleeveRelease={version:'test',chainId:4663,manifestHash:keccak256('0x01'),catalogHash:keccak256('0x02'),maximumLossBps:500,collection:contract(10),nft:contract(11),allocator:contract(12),sleeve:contract(13),adapter:contract(14),vault:contract(15),registry:contract(16),escrow:contract(17),lpVault:contract(18),lpAdapter:contract(19),registrationPool:contract(20),lpPool:contract(21),priceHub:contract(22),payoutAsset:contract(23),governance:addr(24),airdropVault:contract(25),airdropRegistry:contract(26),targetBook:contract(27),executionLibrary:contract(28),
 stocks:[{symbol:'STOCK',token:contract(70),entryRoute:contract(71),exitRoute:contract(72),dividendRoute:contract(73),feed:contract(74)}],
 airdrops:[1,2,3].map(i=>({id:`eip155:4663/erc20:${addr(i).toLowerCase()}`,symbol:`A${i}`,decimals:18,minimumHoldingUnits:'1',token:contract(i),entryRoute:contract(30+i),exitRoute:contract(40+i),feed:contract(50+i),rewardAssets:[addr(23)],claimAdapters:[contract(60+i)],evidenceHash:keccak256('0x03'),enabled:true}))};
 const visited:Address[]=[],blocks:bigint[]=[];
 let held:Address[]=[],broken:Address|undefined;
 const binding=(v:{address:Address;runtimeCodeHash:string})=>[v.address,v.runtimeCodeHash];
 const client={getChainId:async()=>4663,getBlock:async()=>({number:100n,hash,timestamp:10000n}),getCode:async({address,blockNumber}:{address:Address;blockNumber:bigint})=>{visited.push(address);blocks.push(blockNumber);return address===broken?'0x00':'0x0102';},
 readContract:async({address,functionName,args=[],blockNumber}:{address:Address;functionName:string;args:unknown[];blockNumber:bigint})=>{
  blocks.push(blockNumber);const stock=release.stocks[0]!;const a=release.airdrops.find(a=>a.token.address===args[0]);
  switch(functionName){
   case 'collection':return release.collection.address;case 'allocator':return release.allocator.address;case 'portfolioAdapter':return release.adapter.address;
   case 'stockVault':return release.vault.address;case 'lpVault':return release.lpVault.address;case 'lpAdapter':return release.lpAdapter.address;
   case 'lpPool':return release.lpPool.address;case 'pool':return release.registrationPool.address;case 'payoutAsset':return release.payoutAsset.address;
   case 'registry':return address===release.airdropVault.address?release.airdropRegistry.address:release.registry.address;
   case 'escrow':return release.escrow.address;case 'collectionTimelock':case 'owner':return release.governance;
   case 'nft':return release.nft.address;case 'controller':case 'sleeve':return release.sleeve.address;
   case 'priceHub':return release.priceHub.address;case 'settler':return release.vault.address;
   case 'stockEntryRoute':return binding(stock.entryRoute);case 'stockExitRoute':return binding(stock.exitRoute);case 'dividendRoutes':return binding(stock.dividendRoute);
   case 'assets':return address===release.registry.address?[1n,1n,10000,false,release.manifestHash]:[hash,a!.evidenceHash,a!.decimals,a!.enabled];
   case 'feedDetails':return {feed:(a?.feed??stock.feed).address,supported:true,corporateActionPaused:false,heartbeat:120,gracePeriod:0,feedRuntimeCodeHash:hash,checkAssetOraclePause:true,weekdaysOnly:true};
   case 'maximumOperatorLossBps':return 500;case 'airdropVault':return release.airdropVault.address;case 'targetBook':return release.targetBook.address;
   case 'catalogHash':return release.catalogHash;case 'minimumHoldingUnits':return 1n;case 'claimRouteCount':return 1n;
   case 'claimRoute':return {adapter:a!.claimAdapters[0]!.address,codeHash:hash,reward:release.payoutAsset.address};
   case 'subject':return release.airdrops.find(a=>a.claimAdapters[0]!.address===address)!.token.address;case 'rewardAsset':return release.payoutAsset.address;
   case 'airdropEntryRoute':return binding(a!.entryRoute);case 'airdropExitRoute':return binding(a!.exitRoute);
   case 'bankAirdrops':return held;case 'bankAssets':return [];case 'ownerOf':return addr(99);case 'accountOf':return addr(98);
   case 'lpUnitsOf':case 'creditOf':return 0n;case 'targetOf':return {};case 'depositsPaused':return false;
   case 'principalOf':return 2n*10n**18n;case 'quoteUsd18':return [10n**18n,10000,0];case 'balanceOf':return BigInt(held.length)*2n*10n**36n;
   default:throw Error(`Unexpected ${functionName}`);
  }
 }} as unknown as PublicClient;
 return {client,release,visited,blocks,hold:(assets:Address[])=>{held=assets;},breakCode:(address:Address)=>{broken=address;}};
}
test('default release audit verifies every admitted asset and its dependencies at the pinned block',async()=>{
 const f=fixture();await verifyAirdropSleeveRelease(f.client,f.release,100n);
 for(const a of f.release.airdrops)for(const c of [a.token,a.entryRoute,a.exitRoute,a.feed,...a.claimAdapters])assert.ok(f.visited.includes(c.address));
 assert.ok(f.blocks.every(b=>b===100n));
});
test('scoped verification checks all core identities but isolates an unrelated unavailable token',async()=>{
 const f=fixture();f.breakCode(f.release.airdrops[2]!.feed.address);
 await verifyAirdropSleeveRelease(f.client,f.release,100n,{assetAddresses:[addr(1)]});
 assert.ok(f.visited.includes(f.release.targetBook.address));assert.ok(f.visited.includes(f.release.airdropVault.address));
 assert.ok(!f.visited.includes(f.release.airdrops[2]!.feed.address));
 await assert.rejects(verifyAirdropSleeveRelease(f.client,f.release,100n),/code changed/);
});
test('unknown scope cannot silently skip admission checks',async()=>{
 const f=fixture();await assert.rejects(verifyAirdropSleeveRelease(f.client,f.release,100n,{assetAddresses:[addr(999)]}),/unknown asset/);
});
test('position reads verify the union of held and newly selected tokens',async()=>{
 const f=fixture();f.hold([addr(2)]);const position=await readAirdropBankPosition(f.client,f.release,334n,{blockNumber:100n,verifyAssets:[addr(3)]});
 assert.equal(position.airdropValueUsd18,2n*10n**18n);
 assert.ok(f.visited.includes(f.release.airdrops[1]!.feed.address));assert.ok(f.visited.includes(f.release.airdrops[2]!.feed.address));
 assert.ok(!f.visited.includes(f.release.airdrops[0]!.feed.address));
 f.breakCode(f.release.airdrops[1]!.feed.address);
 await assert.rejects(readAirdropBankPosition(f.client,f.release,334n,{blockNumber:100n,verifyAssets:[addr(3)]}),/code changed/);
});
test('corrupt core dependencies and oversized held baskets always reject a scoped read',async()=>{
 const f=fixture();f.breakCode(f.release.executionLibrary.address);
 await assert.rejects(verifyAirdropSleeveRelease(f.client,f.release,100n,{assetAddresses:[]}),/code changed/);
 f.hold([addr(1),addr(2),addr(3),addr(4)]);
 await assert.rejects(readAirdropBankPosition(f.client,f.release,334n),/basket exceeds/);
});
test('V3 policy accepts the verified ETH/USD heartbeat while checking its actual TWAP source',async()=>{
 const f=fixture(),asset=f.release.airdrops[0]!;asset.oraclePolicy='v3-twap-underlier-1d';
 let heartbeat=86400,underlier='0x78F3556b67E17Df817D51Ef5a990cDaF09E8d3A9';
 const client={...f.client,readContract:async(p:{address:Address;functionName:string;args?:unknown[];blockNumber:bigint})=>{
  if(p.functionName==='feedDetails'&&p.args?.[0]===asset.token.address)return {feed:asset.feed.address,supported:true,corporateActionPaused:false,heartbeat,gracePeriod:0,feedRuntimeCodeHash:hash,weekdaysOnly:false,checkAssetOraclePause:false};
  if(p.address===asset.feed.address){const values:Record<string,unknown>={pairedAsset:asset.token.address,weth:'0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73',wethUsdFeed:underlier,twapWindow:1800,maxSpotDeviationBps:300};if(p.functionName in values)return values[p.functionName];}
  return f.client.readContract(p as never);
 }} as unknown as PublicClient;
 await verifyAirdropSleeveRelease(client,f.release,100n,{assetAddresses:[asset.token.address]});
 heartbeat=86401;await assert.rejects(verifyAirdropSleeveRelease(client,f.release,100n,{assetAddresses:[asset.token.address]}),/oracle binding/);
 heartbeat=86400;underlier=addr(999);await assert.rejects(verifyAirdropSleeveRelease(client,f.release,100n,{assetAddresses:[asset.token.address]}),/source policy/);
});
test('observed-market policy retains the strict two-minute subject freshness limit',async()=>{
 const f=fixture(),asset=f.release.airdrops[0]!;asset.oraclePolicy='observed-market-120s';let heartbeat=120;
 const client={...f.client,readContract:async(p:{address:Address;functionName:string;args?:unknown[];blockNumber:bigint})=>{
  if(p.functionName==='feedDetails'&&p.args?.[0]===asset.token.address)return {feed:asset.feed.address,supported:true,corporateActionPaused:false,heartbeat,gracePeriod:0,feedRuntimeCodeHash:hash,weekdaysOnly:false,checkAssetOraclePause:false};
  if(p.address===asset.feed.address){const values:Record<string,unknown>={subject:asset.token.address,MAX_AGE:120,WINDOW:1800,maxSpotDeviationBps:300};if(p.functionName in values)return values[p.functionName];}
  return f.client.readContract(p as never);
 }} as unknown as PublicClient;
 await verifyAirdropSleeveRelease(client,f.release,100n,{assetAddresses:[asset.token.address]});
 heartbeat=86400;await assert.rejects(verifyAirdropSleeveRelease(client,f.release,100n,{assetAddresses:[asset.token.address]}),/oracle binding/);
});

test('signed-price inventory handles mixed-case addresses and rejects omissions or authority changes',async()=>{
 const f=fixture();
 for(const asset of f.release.airdrops)asset.oraclePolicy='observed-market-120s';
 const publisher=contract(200),reader=contract(201),observer=addr(202);
 f.release.pricePreparation={publisher,reader,observer,feeds:f.release.airdrops.map(a=>a.feed.address)};
 let authority=observer;
 const client={...f.client,readContract:async(p:{address:Address;functionName:string;args?:unknown[];blockNumber:bigint})=>{
  if(p.functionName==='observer')return authority;
  if(p.functionName==='publisher')return publisher.address;
  return f.client.readContract(p as never);
 }} as unknown as PublicClient;
 await verifyAirdropSleeveRelease(client,f.release,100n,{assetAddresses:[]});
 assert.ok(f.visited.includes(publisher.address));assert.ok(f.visited.includes(reader.address));
 f.release.pricePreparation.feeds=f.release.pricePreparation.feeds.slice(1);
 await assert.rejects(verifyAirdropSleeveRelease(client,f.release,100n,{assetAddresses:[]}),/inventory/);
 f.release.pricePreparation.feeds=f.release.airdrops.map(a=>a.feed.address);
 authority=addr(203);
 await assert.rejects(verifyAirdropSleeveRelease(client,f.release,100n,{assetAddresses:[]}),/binding/);
});

test('additive Stock releases preserve earlier immutable admission evidence in Stock and Airdrop',async()=>{
 const f=fixture(),original=f.release.manifestHash,newHash=keccak256('0x1234');
 f.release.stocks[0]!.admissionManifestHash=original;
 f.release.stocks=[...f.release.stocks,{symbol:'NEW',token:contract(80),entryRoute:contract(81),exitRoute:contract(82),dividendRoute:contract(83),feed:contract(84)}];
 f.release.manifestHash=newHash;
 const client={...f.client,readContract:async(p:{address:Address;functionName:string;args?:unknown[];blockNumber:bigint})=>{
  const stock=f.release.stocks.find(s=>s.token.address===p.args?.[0]);
  if(stock){
   if(p.functionName==='assets'&&p.address===f.release.registry.address)return [1n,0n,10000,true,stock.symbol==='NEW'?newHash:original];
   const route=p.functionName==='stockEntryRoute'?stock.entryRoute:p.functionName==='stockExitRoute'?stock.exitRoute:p.functionName==='dividendRoutes'?stock.dividendRoute:undefined;
   if(route)return [route.address,route.runtimeCodeHash];
   if(p.functionName==='feedDetails')return {feed:stock.feed.address,supported:true,heartbeat:86400,gracePeriod:0,feedRuntimeCodeHash:hash,checkAssetOraclePause:true,weekdaysOnly:true};
  }
  return f.client.readContract(p as never);
 }} as unknown as PublicClient;
 await verifyStockSleeveRelease(client,f.release,100n);
 await verifyAirdropSleeveRelease(client,f.release,100n);
 delete f.release.stocks[0]!.admissionManifestHash;
 await assert.rejects(verifyStockSleeveRelease(client,f.release,100n),/admission/);
 f.release.stocks[0]!.admissionManifestHash=newHash;
 await assert.rejects(verifyAirdropSleeveRelease(client,f.release,100n),/admission/);
 f.release.stocks[0]!.admissionManifestHash=original;
 f.release.stocks[1]!.admissionManifestHash=original;
 await assert.rejects(verifyStockSleeveRelease(client,f.release,100n),/admission/);
 f.release.stocks[1]!.admissionManifestHash='0x'+'0'.repeat(64) as `0x${string}`;
 await assert.rejects(verifyStockSleeveRelease(client,f.release,100n),/invalid admission/);
});
