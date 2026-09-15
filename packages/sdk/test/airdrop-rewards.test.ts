import test from 'node:test';
import assert from 'node:assert/strict';
import { keccak256, zeroAddress, type Address, type PublicClient } from 'viem';
import { readAirdropRewards } from '../src/airdrop-rewards.js';
import type { AirdropSleeveRelease } from '../src/airdrop-bank.js';
const address=(n:number)=>`0x${n.toString(16).padStart(40,'0')}` as Address;
const hash=keccak256('0x0102'),binding=(n:number)=>({address:address(n),runtimeCodeHash:hash});
function fixture(){
 const release={chainId:4663,catalogHash:hash,collection:binding(10),nft:binding(11),airdropVault:binding(12),airdropRegistry:binding(13),airdrops:[1,2,3].map(n=>({token:binding(n),symbol:`T${n}`,rewardAssets:[address(5)]}))} as unknown as AirdropSleeveRelease;
 const reads:{functionName:string;args:readonly unknown[];blockNumber:bigint}[]=[];
 let owner=address(99),treasury=address(90),reorg=false;
 const client={getChainId:async()=>4663,getCode:async()=>'0x0102',getBlock:async({blockNumber}:{blockNumber?:bigint}={})=>({number:100n,hash:reorg&&blockNumber?keccak256('0x03'):hash}),
 readContract:async({functionName,args=[],blockNumber}:{functionName:string;args:readonly unknown[];blockNumber:bigint})=>{
 reads.push({functionName,args,blockNumber});
 switch(functionName){
 case 'nft':return release.nft.address;case 'collection':return release.collection.address;
 case 'registry':return release.airdropRegistry.address;case 'catalogHash':return release.catalogHash;
 case 'treasuryOf':return treasury;case 'vault':return release.airdropVault.address;
 case 'bank':return 334n;case 'beneficiary':return owner;case 'hasHeld':return [address(1),address(2)].includes(args[0] as Address);
 case 'available':return args[0]===address(5)?7n:args[0]===address(1)?2n:0n;
 case 'totalPaid':return args[0]===address(5)?9n:0n;
 default:throw Error(`Unexpected dependency ${functionName}`);
 }
 }} as unknown as PublicClient;
 return {client,release,reads,setOwner:(v:Address)=>owner=v,setTreasury:(v:Address)=>treasury=v,reorg:()=>reorg=true};
}
test('shared rewards appear once and invested-token surpluses are discoverable',async()=>{
 const f=fixture(),rows=await readAirdropRewards(f.client,f.release,334n);
 assert.deepEqual(rows.map(r=>r.asset),[zeroAddress,address(1),address(2),address(5)]);
 assert.equal(rows.filter(r=>r.asset===address(5)).length,1);
 assert.equal(rows.find(r=>r.asset===address(5))?.available,7n);
 assert.equal(rows.find(r=>r.asset===address(1))?.available,2n);
 assert.equal(f.reads.filter(r=>r.functionName==='treasuryOf').length,1);
 assert.ok(f.reads.every(r=>r.blockNumber===100n));
});
test('former holdings use the current beneficiary without any pricing dependency',async()=>{
 const f=fixture();f.setOwner(address(98));const rows=await readAirdropRewards(f.client,f.release,334n);
 assert.ok(rows.every(r=>r.beneficiary===address(98)));
 assert.ok(rows.some(r=>r.asset===address(2)));
 assert.ok(!f.reads.some(r=>['quoteUsd18','bankAirdrops','feedDetails'].includes(r.functionName)));
});
test('absent treasury returns no rewards and a reorganized read is rejected',async()=>{
 const f=fixture();f.setTreasury(zeroAddress);assert.deepEqual(await readAirdropRewards(f.client,f.release,334n),[]);
 f.reorg();await assert.rejects(readAirdropRewards(f.client,f.release,334n),/reorganized/);
});
test('a failed token read is surfaced rather than reported as zero',async()=>{
 const f=fixture(),original=f.client.readContract;
 const client={...f.client,readContract:async(p:Parameters<typeof original>[0])=>{if(p.functionName==='available')throw Error('Token read failed');return original(p);}} as PublicClient;
 await assert.rejects(readAirdropRewards(client,f.release,334n),/Token read failed/);
});
