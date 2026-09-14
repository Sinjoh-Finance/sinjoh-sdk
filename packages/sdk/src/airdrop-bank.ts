import { getAddress, keccak256, parseAbi, type Address, type Hex, type PublicClient } from 'viem';
import { stockCompositeSleeveAbi, stockCompositeLPAdapterAbi, stockDividendVaultAbi, stockCorporateActionRegistryAbi, stockDividendEscrowAbi } from './generated/stock-abis.js';
import { airdropCompositeAbi, airdropVaultAbi } from './airdrop-strategy.js';
import { verifyStockSleeveRelease, type StockSleeveRelease, type StockReleaseContract } from './stock-bank.js';
export type AirdropSleeveRelease = StockSleeveRelease & {
 catalogHash: Hex; maximumLossBps: 50 | 100 | 200; airdropVault: StockReleaseContract; airdropRegistry: StockReleaseContract; targetBook: StockReleaseContract; executionLibrary: StockReleaseContract;
 airdrops: readonly { id:string; symbol:string; decimals:number; minimumHoldingUnits:string; token:StockReleaseContract; entryRoute:StockReleaseContract; exitRoute:StockReleaseContract; feed:StockReleaseContract; rewardAssets:readonly Address[]; claimAdapters:readonly StockReleaseContract[]; evidenceHash:Hex; enabled:boolean }[];
};
const collectionAbi=parseAbi(['function accountOf(uint256) view returns(address)']);
const nftAbi=parseAbi(['function ownerOf(uint256) view returns(address)']);
const priceAbi=parseAbi(['function quoteUsd18(address) view returns(uint256,uint48,uint8)']);
const registryTuple=parseAbi(['function assets(address) view returns(uint256,uint64,uint48,bool,bytes32)']);
const identityAbi=parseAbi(['function controller() view returns(address)','function collection() view returns(address)','function registry() view returns(address)','function owner() view returns(address)','function catalogHash() view returns(bytes32)','function sleeve() view returns(address)','function targetBook() view returns(address)','function airdropEntryRoute(address) view returns(address,bytes32)','function airdropExitRoute(address) view returns(address,bytes32)','function assets(address) view returns(bytes32,bytes32,uint8,bool)','function airdropVault() view returns(address)','function maximumOperatorLossBps() view returns(uint16)','function nft() view returns(address)','function minimumHoldingUnits(address) view returns(uint256)']);
const feedAbi=parseAbi(['function feedDetails(address) view returns ((address feed,address referenceSource,uint32 heartbeat,uint32 gracePeriod,uint16 maxDeviationBps,uint8 decimals,bytes32 feedRuntimeCodeHash,bytes32 referenceRuntimeCodeHash,bytes32 feedDescriptionHash,bool supported,bool corporateActionPaused,bool weekdaysOnly,bool checkAssetOraclePause))']);
const claimAbi=parseAbi(['function claimRouteCount(address) view returns(uint256)','function claimRoute(address,uint256) view returns((address adapter,bytes32 codeHash,address reward))','function subject() view returns(address)','function rewardAsset() view returns(address)']);
const addressEqual=(a:string,b:string)=>getAddress(a)===getAddress(b);
export async function verifyAirdropSleeveRelease(client:PublicClient,release:AirdropSleeveRelease,blockNumber:bigint) {
 await verifyStockSleeveRelease(client,release,blockNumber);
 if(![50,100,200].includes(release.maximumLossBps)||await client.readContract({address:release.sleeve.address,abi:identityAbi,functionName:'maximumOperatorLossBps',blockNumber})!==release.maximumLossBps)throw Error('Airdrop loss protection changed.');
 if(release.airdrops.length<1 || release.airdrops.length>100 || new Set(release.airdrops.map(a=>getAddress(a.token.address))).size!==release.airdrops.length)throw Error('Invalid Airdrop release inventory.');
 const contracts=[release.airdropVault,release.airdropRegistry,release.targetBook,release.executionLibrary,...release.airdrops.flatMap(a=>[a.token,a.entryRoute,a.exitRoute,a.feed,...a.claimAdapters])];
 for(let i=0;i<contracts.length;i+=4)await Promise.all(contracts.slice(i,i+4).map(async c=>{
  const code=await client.getCode({address:c.address,blockNumber});
  if(!code || code==='0x' || keccak256(code).toLowerCase()!==c.runtimeCodeHash.toLowerCase())throw Error('Airdrop release code changed.');
 }));
 const bindings=[
  [release.airdropVault.address,'controller',release.sleeve.address], [release.airdropVault.address,'collection',release.collection.address],
  [release.airdropVault.address,'registry',release.airdropRegistry.address], [release.airdropRegistry.address,'owner',release.governance],
  [release.sleeve.address,'airdropVault',release.airdropVault.address], [release.targetBook.address,'sleeve',release.sleeve.address], [release.sleeve.address,'targetBook',release.targetBook.address],
 ] as const;
 for(const [address,functionName,expected] of bindings){const actual=await client.readContract({address,abi:identityAbi,functionName,blockNumber});if(!addressEqual(actual,expected))throw Error('Airdrop release identity changed.');}
 if((await client.readContract({address:release.airdropRegistry.address,abi:identityAbi,functionName:'catalogHash',blockNumber})).toLowerCase()!==release.catalogHash.toLowerCase())throw Error('Airdrop catalog binding changed.');
 for(const asset of release.airdrops){
  if(!/^[1-9][0-9]*$/.test(asset.minimumHoldingUnits)||BigInt(asset.minimumHoldingUnits)>=(1n<<256n))throw Error('Invalid Airdrop holding threshold.');
  const minimum=await client.readContract({address:release.airdropRegistry.address,abi:identityAbi,functionName:'minimumHoldingUnits',args:[asset.token.address],blockNumber});
  if(minimum!==BigInt(asset.minimumHoldingUnits))throw Error('Airdrop holding eligibility changed.');
  const feed=await client.readContract({address:release.priceHub.address,abi:feedAbi,functionName:'feedDetails',args:[asset.token.address],blockNumber});
  if(!addressEqual(feed.feed,asset.feed.address)||!feed.supported||feed.corporateActionPaused||feed.heartbeat===0||feed.heartbeat>3600||feed.gracePeriod!==0||feed.feedRuntimeCodeHash.toLowerCase()!==asset.feed.runtimeCodeHash.toLowerCase())throw Error('Airdrop oracle binding changed.');
  const count=await client.readContract({address:release.airdropRegistry.address,abi:claimAbi,functionName:'claimRouteCount',args:[asset.token.address],blockNumber});
  if(count!==BigInt(asset.claimAdapters.length)||count===0n||count>8n)throw Error('Airdrop claim routes changed.');
  for(const [i,adapter] of asset.claimAdapters.entries()){
   const [route,subject,reward]=await Promise.all([
    client.readContract({address:release.airdropRegistry.address,abi:claimAbi,functionName:'claimRoute',args:[asset.token.address,BigInt(i)],blockNumber}),
    client.readContract({address:adapter.address,abi:claimAbi,functionName:'subject',blockNumber}),
    client.readContract({address:adapter.address,abi:claimAbi,functionName:'rewardAsset',blockNumber}),
   ]);
   if(!addressEqual(route.adapter,adapter.address)||route.codeHash.toLowerCase()!==adapter.runtimeCodeHash.toLowerCase()||!addressEqual(subject,asset.token.address)||!addressEqual(route.reward,reward)||!asset.rewardAssets.some(a=>addressEqual(a,reward)))throw Error('Airdrop claim adapter binding changed.');
  }
  if(asset.id!==`eip155:4663/erc20:${asset.token.address.toLowerCase()}` || !Number.isInteger(asset.decimals) || asset.decimals<0 || asset.decimals>18)throw Error('Invalid Airdrop asset identity.');
  const state=await client.readContract({address:release.airdropRegistry.address,abi:identityAbi,functionName:'assets',args:[asset.token.address],blockNumber});
  if(state[0].toLowerCase()!==asset.token.runtimeCodeHash.toLowerCase() || state[1].toLowerCase()!==asset.evidenceHash.toLowerCase() || state[2]!==asset.decimals || state[3]!==asset.enabled)throw Error('Airdrop asset admission changed.');
  for(const [functionName,expected] of [['airdropEntryRoute',asset.entryRoute],['airdropExitRoute',asset.exitRoute]] as const){
   const route=await client.readContract({address:release.sleeve.address,abi:identityAbi,functionName,args:[asset.token.address],blockNumber});
   if(!addressEqual(route[0],expected.address)||route[1].toLowerCase()!==expected.runtimeCodeHash.toLowerCase())throw Error('Airdrop trading route changed.');
  }
 }
}

export async function readAirdropBankPosition(client: PublicClient, release: AirdropSleeveRelease, bank: bigint, options: { blockNumber?: bigint } = {}) {
  if (bank <= 0n) throw new Error('Invalid Piggy Bank.');
  const block = await client.getBlock(options.blockNumber === undefined ? {} : { blockNumber: options.blockNumber });
  const blockNumber = block.number;
  await verifyAirdropSleeveRelease(client, release, blockNumber);
  const [owner, account, assets, lpUnits, target, paused] = await Promise.all([
    client.readContract({ address: release.nft.address, abi: nftAbi, functionName: 'ownerOf', args: [bank], blockNumber }),
    client.readContract({ address: release.collection.address, abi: collectionAbi, functionName: 'accountOf', args: [bank], blockNumber }),
    client.readContract({ address: release.sleeve.address, abi: stockCompositeSleeveAbi, functionName: 'bankAssets', args: [bank], blockNumber }),
    client.readContract({ address: release.sleeve.address, abi: stockCompositeSleeveAbi, functionName: 'lpUnitsOf', args: [bank], blockNumber }),
    client.readContract({ address: release.targetBook.address, abi: airdropCompositeAbi, functionName: 'targetOf', args: [bank], blockNumber }),
    client.readContract({ address: release.sleeve.address, abi: stockCompositeSleeveAbi, functionName: 'depositsPaused', blockNumber }),
  ]);
  const lpPrice = lpUnits > 0n ? await client.readContract({ address: release.adapter.address, abi: stockCompositeLPAdapterAbi, functionName: 'lpUnitPriceUsd18', blockNumber }) : [10n ** 18n, block.timestamp] as const;
  const holdings = await Promise.all(assets.map(async asset => {
    const admitted = release.stocks.find(s => addressEqual(s.token.address, asset));
    if (!admitted) throw new Error('Bank holds a stock outside the current release.');
    const [position, state, quote] = await Promise.all([
      client.readContract({ address: release.vault.address, abi: stockDividendVaultAbi, functionName: 'positions', args: [bank, asset], blockNumber }),
      client.readContract({ address: release.registry.address, abi: registryTuple, functionName: 'assets', args: [asset], blockNumber }),
      client.readContract({ address: release.priceHub.address, abi: priceAbi, functionName: 'quoteUsd18', args: [asset], blockNumber }),
    ]);
    if (quote[2] !== 0 || quote[0] === 0n) throw new Error(`Price unavailable for ${admitted.symbol}.`);
    // Also catches issuer pause and unclassified active multiplier transitions.
    await client.readContract({ address: release.registry.address, abi: stockCorporateActionRegistryAbi, functionName: 'requireCurrent', args: [asset, false], blockNumber });
    return { asset, symbol: admitted.symbol, principalUnits: position[0], reservedDividendUnits: position[1], checkpointSequence: position[3], latestSequence: state[1], checkpointRequired: position[3] !== state[1],
      valueUsd18: (position[0] + position[1]) * quote[0] / 10n ** 18n, priceUsd18: quote[0], pricedAt: quote[1] };
  }));
  const receipt = await client.readContract({ address: release.sleeve.address, abi: stockCompositeSleeveAbi, functionName: 'balanceOf', args: [account], blockNumber });
  const stockValueUsd18 = holdings.reduce((sum, h) => sum + h.valueUsd18, 0n);
  const lpValueUsd18 = lpUnits * lpPrice[0] / 10n ** 18n;
  const airdropAssets = await client.readContract({address:release.sleeve.address,abi:airdropCompositeAbi,functionName:'bankAirdrops',args:[bank],blockNumber});
  const airdropHoldings = await Promise.all(airdropAssets.map(async asset => {
    const admitted=release.airdrops.find(a=>addressEqual(a.token.address,asset));
    if(!admitted) throw Error('Bank holds an Airdrop token outside the release.');
    const [units,quote]=await Promise.all([
      client.readContract({address:release.airdropVault.address,abi:airdropVaultAbi,functionName:'principalOf',args:[bank,asset],blockNumber}),
      client.readContract({address:release.priceHub.address,abi:priceAbi,functionName:'quoteUsd18',args:[asset],blockNumber}),
    ]);
    if(quote[0]===0n || quote[2]!==0)throw Error(`Price unavailable for ${admitted.symbol}.`);
    return {asset,symbol:admitted.symbol,principalUnits:units,decimals:admitted.decimals,priceUsd18:quote[0],valueUsd18:units*quote[0]/10n**BigInt(admitted.decimals)};
  }));
  const airdropValueUsd18=airdropHoldings.reduce((sum,h)=>sum+h.valueUsd18,0n);
  const difference = receipt / 10n ** 18n - stockValueUsd18 - lpValueUsd18 - airdropValueUsd18;
  if (difference < 0n || difference > BigInt(holdings.length + airdropHoldings.length + 1)) throw new Error('Bank Stock custody does not reconcile to its receipt.');
  const ownerCashCredit = await client.readContract({ address: release.escrow.address, abi: stockDividendEscrowAbi, functionName: 'creditOf', args: [owner], blockNumber });
  if ((await client.getBlock({ blockNumber })).hash !== block.hash) throw new Error('Bank snapshot reorganized. Refresh before confirming.');
  return { bank, owner, account, blockNumber, blockHash: block.hash, timestamp: block.timestamp, ownerCashCredit, airdropHoldings, airdropValueUsd18, holdings, target, depositsPaused: paused, lpUnits, stockValueUsd18, lpValueUsd18, receiptUnits36: receipt };
}

/** Claim recovery depends only on permanent custody identity, not entry routes or prices. */
export async function verifyAirdropRecoveryRelease(client:PublicClient,release:AirdropSleeveRelease,blockNumber:bigint) {
 if(await client.getChainId()!==4663||release.chainId!==4663||!/^0x[0-9a-fA-F]{64}$/.test(release.catalogHash)||/^0x0+$/.test(release.catalogHash)||release.airdrops.length<1||release.airdrops.length>100||new Set(release.airdrops.map(a=>getAddress(a.token.address))).size!==release.airdrops.length)throw Error('Invalid Airdrop recovery release.');
 for(const c of [release.collection,release.nft,release.airdropVault,release.airdropRegistry]) {
  const code=await client.getCode({address:c.address,blockNumber});
  if(!code||code==='0x'||keccak256(code).toLowerCase()!==c.runtimeCodeHash.toLowerCase())throw Error('Airdrop recovery contract changed.');
 }
 for(const [address,functionName,expected] of [
  [release.collection.address,'nft',release.nft.address],
  [release.airdropVault.address,'collection',release.collection.address],
  [release.airdropVault.address,'registry',release.airdropRegistry.address],
 ] as const) {
  const actual=await client.readContract({address,abi:identityAbi,functionName,blockNumber});
  if(!addressEqual(actual,expected))throw Error('Airdrop recovery binding changed.');
 }
 if((await client.readContract({address:release.airdropRegistry.address,abi:identityAbi,functionName:'catalogHash',blockNumber})).toLowerCase()!==release.catalogHash.toLowerCase())throw Error('Airdrop recovery catalog changed.');
}
