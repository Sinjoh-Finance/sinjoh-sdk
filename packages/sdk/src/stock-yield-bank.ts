import { getAddress, type PublicClient } from 'viem';
import { readYieldBankToken, type YieldBankReadClient, type YieldBankReleaseManifest } from './yield-banks.js';
import { readStockBankPosition, type StockSleeveRelease } from './stock-bank.js';
/** Product view for an activated Stock release. Composite receipts are indexed to each
 * bank's assets; applying their ownership ratio to the shared LP leg would misattribute LP. */
export async function readStockYieldBankToken(client: PublicClient, manifest: YieldBankReleaseManifest, release: StockSleeveRelease, bank: bigint) {
  if (getAddress(manifest.contracts.collection.address) !== getAddress(release.collection.address)) throw new Error('Stock release belongs to a different collection.');
  const block = await client.getBlock();
  const blockNumber = block.number;
  const pinned: YieldBankReadClient = {
    readContract: ((args: Parameters<PublicClient['readContract']>[0]) => client.readContract({ ...args, blockNumber })) as PublicClient['readContract'],
    getCode: args => client.getCode({ address: args.address, blockNumber }),
    getStorageAt: args => client.getStorageAt({ address: args.address, slot: args.slot, blockNumber }),
  };
  const [view, stockPosition] = await Promise.all([readYieldBankToken(pinned, manifest, bank), readStockBankPosition(client, release, bank, { blockNumber })]);
  if (getAddress(view.owner) !== getAddress(stockPosition.owner) || getAddress(view.account) !== getAddress(stockPosition.account)) throw new Error('Stock bank identity did not reconcile.');
  const composite = view.sleeves.find(s => getAddress(s.sleeve) === getAddress(release.sleeve.address));
  if (composite && (composite.pending !== 0n || composite.held !== stockPosition.receiptUnits36)) throw new Error('Stock receipt did not reconcile.');
  const valueFor = (address: string) => view.sleeves.find(s => getAddress(s.sleeve) === getAddress(address))?.positionUsd18 ?? 0n;
  const stockValue = valueFor(manifest.contracts.coreSleeve.address) + stockPosition.stockValueUsd18;
  const usdgValue = valueFor(manifest.contracts.usdgSleeve.address);
  const total = view.portfolioValueUsd18;
  const stockBps = total === 0n ? 0n : stockValue * 10000n / total;
  const usdgBps = total === 0n ? 0n : usdgValue * 10000n / total;
  if ((await client.getBlock({ blockNumber })).hash !== block.hash) throw new Error('Bank snapshot reorganized.');
  return {
    ...view, blockNumber, blockHash: block.hash, stockPosition,
    currentAllocationBps: [Number(stockBps), total === 0n ? 0 : Number(10000n - stockBps - usdgBps), Number(usdgBps)] as const,
    // Detailed Stock and LP custody is in stockPosition. The generic pro-rata adapter
    // estimate is intentionally omitted for this bank-indexed sleeve.
    sleeves: view.sleeves.map(s => getAddress(s.sleeve) === getAddress(release.sleeve.address) ? { ...s, proRataUnderlying: [], strategyPositions: [] } : s),
  };
}
