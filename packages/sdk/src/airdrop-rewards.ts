import { getAddress, parseAbi, zeroAddress, type Address, type PublicClient } from 'viem';
import { airdropCustodyAbi, airdropVaultAbi } from './airdrop-strategy.js';
import { verifyAirdropRecoveryRelease, type AirdropSleeveRelease } from './airdrop-bank.js';
const identityAbi=parseAbi(['function collection() view returns(address)','function registry() view returns(address)','function subject() view returns(address)','function bank() view returns(uint256)','function vault() view returns(address)']);
export type AirdropRewardBalance={subject:Address;symbol:string;custody:Address;beneficiary:Address;asset:Address;available:bigint;paid:bigint;blockNumber:bigint};
/** Includes exited holdings: their permanent custody can receive delayed rewards. A read
 * failure is surfaced, never translated into a zero balance. No offchain reward estimates. */
export async function readAirdropRewards(client:PublicClient,release:AirdropSleeveRelease,bank:bigint):Promise<AirdropRewardBalance[]> {
 if(bank<=0n)throw Error('Invalid bank.');
 const block=await client.getBlock();await verifyAirdropRecoveryRelease(client,release,block.number);
 const results:AirdropRewardBalance[]=[];
 for(let offset=0;offset<release.airdrops.length;offset+=4){
  const groups=await Promise.all(release.airdrops.slice(offset,offset+4).map(async item=>{
   const custody=await client.readContract({address:release.airdropVault.address,abi:airdropVaultAbi,functionName:'custodyOf',args:[bank,item.token.address],blockNumber:block.number});
   if(custody===zeroAddress)return [];
   const [subject,custodyBank,vault,collection,registry,beneficiary]=await Promise.all([
    client.readContract({address:custody,abi:identityAbi,functionName:'subject',blockNumber:block.number}),
    client.readContract({address:custody,abi:identityAbi,functionName:'bank',blockNumber:block.number}),
    client.readContract({address:custody,abi:identityAbi,functionName:'vault',blockNumber:block.number}),
    client.readContract({address:custody,abi:identityAbi,functionName:'collection',blockNumber:block.number}),
    client.readContract({address:custody,abi:identityAbi,functionName:'registry',blockNumber:block.number}),
    client.readContract({address:custody,abi:airdropCustodyAbi,functionName:'beneficiary',blockNumber:block.number}),
   ]);
   if(custodyBank!==bank||getAddress(subject)!==getAddress(item.token.address)||getAddress(vault)!==getAddress(release.airdropVault.address)||getAddress(collection)!==getAddress(release.collection.address)||getAddress(registry)!==getAddress(release.airdropRegistry.address))throw Error('Airdrop custody identity changed.');
   const assets=[...new Set([...item.rewardAssets,zeroAddress].map(getAddress))];
   return Promise.all(assets.map(async asset=>{
    const [available,paid]=await Promise.all([
     client.readContract({address:custody,abi:airdropCustodyAbi,functionName:'available',args:[asset],blockNumber:block.number}),
     client.readContract({address:custody,abi:airdropCustodyAbi,functionName:'totalPaid',args:[asset],blockNumber:block.number}),
    ]);
    return {subject,symbol:item.symbol,custody,beneficiary,asset,available,paid,blockNumber:block.number};
   }));
  }));results.push(...groups.flat());
 }
 if((await client.getBlock({blockNumber:block.number})).hash!==block.hash)throw Error('Reward snapshot reorganized. Refresh before claiming.');
 return results;
}
