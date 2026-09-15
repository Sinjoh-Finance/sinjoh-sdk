import { getAddress, parseAbi, zeroAddress, type Address, type PublicClient } from 'viem';
import { airdropCustodyAbi, airdropVaultAbi } from './airdrop-strategy.js';
import { verifyAirdropRecoveryRelease, type AirdropSleeveRelease } from './airdrop-bank.js';
const identityAbi = parseAbi([
 'function collection() view returns(address)', 'function registry() view returns(address)',
 'function bank() view returns(uint256)', 'function vault() view returns(address)',
 'function hasHeld(address) view returns(bool)',
]);
export type AirdropRewardBalance = {
 custody: Address; beneficiary: Address; asset: Address;
 available: bigint; paid: bigint; blockNumber: bigint;
};
export type UnavailableAirdropReward = Pick<AirdropRewardBalance, 'custody' | 'beneficiary' | 'asset' | 'blockNumber'>;
export type AirdropRewardInventory = {
 balances: AirdropRewardBalance[];
 /** A failed balance read is unknown, never zero. These assets must not be offered for claiming. */
 unavailableAssets: UnavailableAirdropReward[];
};
/** Read one balance per reward asset from the bank's permanent basket treasury.
 * Include exited subjects and subject-token surpluses. Shared rewards are not attributed
 * to a particular basket token: the common treasury cannot establish that attribution. */
export async function readAirdropRewardInventory(client: PublicClient, release: AirdropSleeveRelease, bank: bigint): Promise<AirdropRewardInventory> {
 if (bank <= 0n) throw Error('Invalid bank.');
 const block = await client.getBlock();
 await verifyAirdropRecoveryRelease(client, release, block.number);
 const custody = await client.readContract({ address: release.airdropVault.address, abi: airdropVaultAbi, functionName: 'treasuryOf', args: [bank], blockNumber: block.number });
 const results: AirdropRewardBalance[] = [];
 const unavailableAssets: UnavailableAirdropReward[] = [];
 if (custody !== zeroAddress) {
  const [custodyBank, vault, collection, registry, beneficiary] = await Promise.all([
   client.readContract({ address: custody, abi: identityAbi, functionName: 'bank', blockNumber: block.number }),
   client.readContract({ address: custody, abi: identityAbi, functionName: 'vault', blockNumber: block.number }),
   client.readContract({ address: custody, abi: identityAbi, functionName: 'collection', blockNumber: block.number }),
   client.readContract({ address: custody, abi: identityAbi, functionName: 'registry', blockNumber: block.number }),
   client.readContract({ address: custody, abi: airdropCustodyAbi, functionName: 'beneficiary', blockNumber: block.number }),
  ]);
  if (custodyBank !== bank || getAddress(vault) !== getAddress(release.airdropVault.address) || getAddress(collection) !== getAddress(release.collection.address) || getAddress(registry) !== getAddress(release.airdropRegistry.address)) throw Error('Airdrop treasury identity changed.');
  const assets = new Set<Address>([zeroAddress]);
  for (let offset = 0; offset < release.airdrops.length; offset += 4) {
   await Promise.all(release.airdrops.slice(offset, offset + 4).map(async item => {
    const held = await client.readContract({ address: custody, abi: identityAbi, functionName: 'hasHeld', args: [item.token.address], blockNumber: block.number });
    if (held) for (const asset of [item.token.address, ...item.rewardAssets]) assets.add(getAddress(asset));
   }));
  }
  const unique = [...assets].sort();
  for (let offset = 0; offset < unique.length; offset += 4) {
   const group = unique.slice(offset, offset + 4);
   const reads = await Promise.allSettled(group.map(async asset => {
    const [available, paid] = await Promise.all([
     client.readContract({ address: custody, abi: airdropCustodyAbi, functionName: 'available', args: [asset], blockNumber: block.number }),
     client.readContract({ address: custody, abi: airdropCustodyAbi, functionName: 'totalPaid', args: [asset], blockNumber: block.number }),
    ]);
    return { custody, beneficiary, asset, available, paid, blockNumber: block.number };
   }));
   reads.forEach((read, index) => {
    if (read.status === 'fulfilled') results.push(read.value);
    else unavailableAssets.push({ custody, beneficiary, asset: group[index]!, blockNumber: block.number });
   });
  }
 }
 if ((await client.getBlock({ blockNumber: block.number })).hash !== block.hash) throw Error('Reward snapshot reorganized. Refresh before claiming.');
 return { balances: results, unavailableAssets };
}

/** Strict compatibility API. Use readAirdropRewardInventory to display independently verified rewards. */
export async function readAirdropRewards(client: PublicClient, release: AirdropSleeveRelease, bank: bigint): Promise<AirdropRewardBalance[]> {
 const inventory = await readAirdropRewardInventory(client, release, bank);
 if (inventory.unavailableAssets.length) throw Error('Airdrop token read failed. Some reward balances could not be verified.');
 return inventory.balances;
}
