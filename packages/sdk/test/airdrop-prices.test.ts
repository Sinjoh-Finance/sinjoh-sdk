import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeFunctionData, encodeFunctionResult, getAddress, keccak256, parseAbi, type Address, type PublicClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { airdropPriceAbi, airdropPriceTypedData, parseAirdropPricePreparation, verifyAirdropPricePreparation, withAirdropPreparedReads, type AirdropPricePreparation } from '../src/airdrop-prices.js';
const address=(n:number)=>getAddress(`0x${n.toString(16).padStart(40,'0')}`);
const hash=keccak256('0x01');
// Public unfunded fixture used solely for local cryptographic tests.
const signer=privateKeyToAccount(`0x${'03'.repeat(32)}`);
async function fixture(){
 const p:AirdropPricePreparation={chainId:4663,publisher:address(10),blockNumber:100n,blockHash:hash,observations:[{feed:address(11),tick:1,timestamp:9990,blockNumber:88n,blockHash:hash,lowestLiquidity:100n,evidenceHash:hash}],validUntil:10090,signature:'0x'};
 p.signature=await signer.signTypedData(airdropPriceTypedData(p.publisher,p.observations,p.validUntil));
 const release={publisher:{address:address(10),runtimeCodeHash:hash},reader:{address:address(12),runtimeCodeHash:hash},observer:signer.address,feeds:[address(11)]};
 const client={getChainId:async()=>4663,getBlock:async()=>({number:100n,timestamp:10000n,hash}),getCode:async()=>'0x01',readContract:async({functionName}:{functionName:string})=>functionName==='observer'?signer.address:p.publisher} as unknown as PublicClient;
 return {p,release,client};
}
test('a signed preparation is bound to its observer, feed, block and expiry',async()=>{
 const f=await fixture();await verifyAirdropPricePreparation(f.client,f.release,f.p);
 await assert.rejects(verifyAirdropPricePreparation(f.client,f.release,{...f.p,validUntil:10091}),/signature/);
 await assert.rejects(verifyAirdropPricePreparation(f.client,f.release,{...f.p,blockHash:keccak256('0x02')}),/reorganized/);
 await assert.rejects(verifyAirdropPricePreparation(f.client,f.release,{...f.p,observations:[{...f.p.observations[0]!,feed:address(99)}]}),/Unapproved/);
 await assert.rejects(verifyAirdropPricePreparation(f.client,f.release,{...f.p,observations:[...f.p.observations,...f.p.observations]}),/Invalid/);
});
test('wire parsing preserves exact integers and rejects malformed payloads',async()=>{
 const f=await fixture(),raw=JSON.parse(JSON.stringify(f.p,(_,v)=>typeof v==='bigint'?v.toString():v));
 assert.deepEqual(parseAirdropPricePreparation(raw),f.p);
 assert.throws(()=>parseAirdropPricePreparation({...raw,blockNumber:100}));
 assert.throws(()=>parseAirdropPricePreparation({...raw,signature:'0x01'}));
 assert.throws(()=>parseAirdropPricePreparation({...raw,observations:[{...raw.observations[0],lowestLiquidity:(1n<<128n).toString()}]}));
});
test('prepared portfolio reads use eth_call and static read calldata, never send a transaction',async()=>{
 const f=await fixture();const abi=parseAbi(['function balanceOf(address) view returns(uint256)']);
 let called=0;
 const client={...f.client,call:async(q:{to:Address;data:`0x${string}`;blockNumber:bigint})=>{
  called++;assert.equal(q.to,f.release.reader.address);assert.equal(q.blockNumber,100n);
  const decoded=decodeFunctionData({abi:airdropPriceAbi,data:q.data});assert.equal(decoded.functionName,'read');
  if(decoded.functionName!=='read')throw Error('Wrong simulation');
  assert.equal(decoded.args[3][0]!.target,address(20));
  return {data:encodeFunctionResult({abi:airdropPriceAbi,functionName:'read',result:[encodeFunctionResult({abi,functionName:'balanceOf',result:42n})]})};
 }} as unknown as PublicClient;
 const prepared=withAirdropPreparedReads(client,f.release.reader.address,f.p);
 assert.equal(await prepared.readContract({address:address(20),abi,functionName:'balanceOf',args:[address(99)],blockNumber:100n}),42n);
 await assert.rejects(prepared.readContract({address:address(20),abi,functionName:'balanceOf',args:[address(99)],blockNumber:101n}),/same explicit block/);
 assert.equal(called,1);
});
