import { encodeAbiParameters, getAddress, keccak256, parseAbi, zeroAddress, zeroHash, type Address, type Hex, type PublicClient } from 'viem';
import type { StockReleaseContract } from './stock-bank.js';

/** Reviewed dependencies for an execution-market accounting reference. This is
 * not an independent fair-value oracle or an executable quote. Owner minimums
 * and a full transaction simulation remain mandatory in the execution builder. */
type MarketReferenceBase = {
  quoteToken: StockReleaseContract;
  minimumLiquidity: string;
};
export type AirdropMarketReference = MarketReferenceBase & (
  | { kind: 'v3'; pool: StockReleaseContract; factory: StockReleaseContract; fee: number }
  | { kind: 'v4'; stateView: StockReleaseContract; poolManager: StockReleaseContract; hook: StockReleaseContract | null;
      poolKey: { currency0: Address; currency1: Address; fee: number; tickSpacing: number; hooks: Address } }
);
export type AirdropMarketPolicy = 'execution-market-v3' | 'execution-market-v4';

const abi = parseAbi([
  'function subject() view returns(address)', 'function quoteAsset() view returns(address)',
  'function priceHub() view returns(address)', 'function minimumLiquidity() view returns(uint128)',
  'function subjectScale() view returns(uint256)', 'function quoteScale() view returns(uint256)',
  'function subjectIsToken0() view returns(bool)', 'function subjectHash() view returns(bytes32)',
  'function quoteHash() view returns(bytes32)', 'function hubHash() view returns(bytes32)',
  'function decimals() view returns(uint8)', 'function pool() view returns(address)',
  'function poolHash() view returns(bytes32)', 'function token0() view returns(address)',
  'function token1() view returns(address)', 'function factory() view returns(address)',
  'function fee() view returns(uint24)', 'function getPool(address,address,uint24) view returns(address)',
  'function stateView() view returns(address)', 'function poolManager() view returns(address)',
  'function hook() view returns(address)', 'function poolId() view returns(bytes32)',
  'function viewHash() view returns(bytes32)', 'function managerHash() view returns(bytes32)',
  'function hookHash() view returns(bytes32)',
]);
const WETH: Address = '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73';
const same = (a: unknown, b: unknown) => String(a).toLowerCase() === String(b).toLowerCase();
const fail = (): never => { throw Error('Airdrop market reference binding changed.'); };
const uint = (n: number, max: number) => Number.isInteger(n) && n >= 0 && n <= max;

export function airdropMarketPoolId(key: Extract<AirdropMarketReference, {kind:'v4'}>['poolKey']): Hex {
  return keccak256(encodeAbiParameters([{type:'tuple',components:[
    {name:'currency0',type:'address'},{name:'currency1',type:'address'},{name:'fee',type:'uint24'},
    {name:'tickSpacing',type:'int24'},{name:'hooks',type:'address'},
  ]}],[key]));
}

/** Pin every dependency and immutable to one block. This only verifies source
 * identity; current liquidity/pricing and executable output are checked separately. */
export async function verifyAirdropMarketReference(client: PublicClient, input: {
  policy: AirdropMarketPolicy; reference: AirdropMarketReference;
  token: StockReleaseContract; feed: StockReleaseContract; priceHub: StockReleaseContract; decimals: number;
}, blockNumber: bigint): Promise<void> {
  const {reference:r, token, feed, priceHub} = input;
  if (!r || (input.policy === 'execution-market-v3' ? r.kind !== 'v3' : input.policy !== 'execution-market-v4' || r.kind !== 'v4')
    || !/^[1-9][0-9]*$/.test(r.minimumLiquidity) || BigInt(r.minimumLiquidity) >= 1n << 128n
    || !uint(input.decimals, 18) || same(token.address,r.quoteToken.address)) fail();
  const dependencies = [token,feed,priceHub,r.quoteToken,...(r.kind==='v3' ? [r.pool,r.factory] : [r.stateView,r.poolManager,...(r.hook?[r.hook]:[])])];
  // Keep concurrency bounded on public RPCs. Repeated block reads may be deduplicated
  // by the caller, but are never trusted across blocks or review/confirmation actions.
  for (let i=0;i<dependencies.length;i+=4) await Promise.all(dependencies.slice(i,i+4).map(async d=>{
    if (!d || same(d.address,zeroAddress) || !/^0x[0-9a-fA-F]{64}$/.test(d.runtimeCodeHash) || same(d.runtimeCodeHash,zeroHash)) fail();
    const code=await client.getCode({address:getAddress(d.address),blockNumber});
    if (!code || code==='0x' || !same(keccak256(code),d.runtimeCodeHash)) fail();
  }));
  const read = (address: Address, functionName: typeof abi[number]['name']) => client.readContract({address,abi,functionName,blockNumber});
  const expect = async (address: Address, values: Record<string,unknown>) => {
    const entries=Object.entries(values);
    for(let i=0;i<entries.length;i+=4)await Promise.all(entries.slice(i,i+4).map(async([name,value])=>{
      if(!same(await read(address,name as typeof abi[number]['name']),value))fail();
    }));
  };
  const quoteDecimals=Number(await read(r.quoteToken.address,'decimals'));
  if(!uint(quoteDecimals,18))fail();
  await expect(token.address,{decimals:input.decimals});
  await expect(feed.address,{subject:token.address,quoteAsset:r.quoteToken.address,priceHub:priceHub.address,
    minimumLiquidity:r.minimumLiquidity,subjectScale:10n**BigInt(input.decimals),quoteScale:10n**BigInt(quoteDecimals),
    subjectHash:token.runtimeCodeHash,quoteHash:r.quoteToken.runtimeCodeHash,hubHash:priceHub.runtimeCodeHash,decimals:18});
  if(r.kind==='v3'){
    if(!uint(r.fee,0xffffff))fail();
    const [token0,token1]=[token.address,r.quoteToken.address].sort((a,b)=>BigInt(a)<BigInt(b)?-1:1) as [Address,Address];
    await expect(feed.address,{pool:r.pool.address,poolHash:r.pool.runtimeCodeHash,subjectIsToken0:same(token0,token.address)});
    await expect(r.pool.address,{token0,token1,factory:r.factory.address,fee:r.fee});
    const canonical=await client.readContract({address:r.factory.address,abi,functionName:'getPool',args:[token0,token1,r.fee],blockNumber});
    if(!same(canonical,r.pool.address))fail();
  }else{
    const k=r.poolKey;
    if(!k || !uint(k.fee,0xffffff) || !Number.isInteger(k.tickSpacing) || k.tickSpacing<=0 || k.tickSpacing>0x7fffff
      || BigInt(k.currency0)>=BigInt(k.currency1) || !same(k.hooks,r.hook?.address??zeroAddress))fail();
    const quote=same(k.currency0,zeroAddress) ? (same(r.quoteToken.address,WETH)?zeroAddress:fail()) : r.quoteToken.address;
    if(!((same(k.currency0,token.address)&&same(k.currency1,quote))||(same(k.currency1,token.address)&&same(k.currency0,quote))))fail();
    await expect(feed.address,{stateView:r.stateView.address,poolManager:r.poolManager.address,hook:k.hooks,
      viewHash:r.stateView.runtimeCodeHash,managerHash:r.poolManager.runtimeCodeHash,
      poolId:airdropMarketPoolId(k),subjectIsToken0:same(k.currency0,token.address),...(r.hook?{hookHash:r.hook.runtimeCodeHash}:{})});
    await expect(r.stateView.address,{poolManager:r.poolManager.address});
  }
}
