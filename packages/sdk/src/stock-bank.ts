import { getAddress, keccak256, parseAbi, type Address, type Hex, type PublicClient } from 'viem';
import { stockCompositeSleeveAbi, stockCompositeLPAdapterAbi, stockDividendVaultAbi, stockCorporateActionRegistryAbi, stockDividendEscrowAbi } from './generated/stock-abis.js';

export type StockReleaseContract = { address: Address; runtimeCodeHash: Hex };
/** Deployment identities are supplied by a versioned application release, never a browser request. */
export type StockSleeveRelease = {
  version: string; chainId: 4663; manifestHash: Hex;
  collection: StockReleaseContract; nft: StockReleaseContract; allocator: StockReleaseContract;
  sleeve: StockReleaseContract; adapter: StockReleaseContract; vault: StockReleaseContract;
  registry: StockReleaseContract; escrow: StockReleaseContract; lpVault: StockReleaseContract;
  lpAdapter: StockReleaseContract; registrationPool: StockReleaseContract; lpPool: StockReleaseContract;
  priceHub: StockReleaseContract; payoutAsset: StockReleaseContract; governance: Address;
  stocks: readonly { symbol: string; token: StockReleaseContract; entryRoute: StockReleaseContract; exitRoute: StockReleaseContract; dividendRoute: StockReleaseContract; feed: StockReleaseContract;
    /** Existing assets retain their original immutable admission evidence when a release expands. */
    admissionManifestHash?: Hex;
  }[];
};
const collectionAbi = parseAbi(['function accountOf(uint256) view returns (address)', 'function nft() view returns (address)', 'function collectionTimelock() view returns (address)']);
const nftAbi = parseAbi(['function ownerOf(uint256) view returns (address)']);
const priceAbi = parseAbi(['function quoteUsd18(address) view returns (uint256,uint48,uint8)']);
const registryTuple = parseAbi(['function assets(address) view returns (uint256,uint64,uint48,bool,bytes32)']);
const addressEqual = (a: string, b: string) => getAddress(a) === getAddress(b);
const requireAddress = (a: string, b: string, name: string) => { if (!addressEqual(a, b)) throw new Error(`Stock release ${name} binding changed.`); };

export async function verifyStockSleeveRelease(client: PublicClient, release: StockSleeveRelease, blockNumber: bigint) {
  if (await client.getChainId() !== release.chainId || release.chainId !== 4663 || !/^0x[0-9a-fA-F]{64}$/.test(release.manifestHash) || /^0x0+$/.test(release.manifestHash) || release.stocks.length < 1 || release.stocks.length > 64) throw new Error('Invalid Stock deployment release.');
  if (new Set(release.stocks.map(s => getAddress(s.token.address))).size !== release.stocks.length) throw new Error('Duplicate Stock token in release.');
  const contracts: StockReleaseContract[] = [release.collection, release.nft, release.allocator, release.sleeve, release.adapter, release.vault, release.registry, release.escrow, release.lpVault, release.lpAdapter, release.registrationPool, release.lpPool, release.priceHub, release.payoutAsset, ...release.stocks.flatMap(s => [s.token, s.entryRoute, s.exitRoute, s.dividendRoute, s.feed])];
  const bindings = new Map<Address, Hex>();
  for (const c of contracts) {
    const address = getAddress(c.address);
    if (!/^0x[0-9a-fA-F]{64}$/.test(c.runtimeCodeHash) || /^0x0+$/.test(c.runtimeCodeHash) || /^0x0+$/.test(address)) throw new Error('Stock release contains an undeployed contract.');
    const prior = bindings.get(address);
    if (prior && prior.toLowerCase() !== c.runtimeCodeHash.toLowerCase()) throw new Error('Conflicting Stock runtime binding.');
    bindings.set(address, c.runtimeCodeHash);
  }
  // Limit RPC bursts while checking every dependency at the same canonical block.
  const entries = [...bindings.entries()];
  for (let i = 0; i < entries.length; i += 4) await Promise.all(entries.slice(i, i + 4).map(async ([address, expected]) => {
    const code = await client.getCode({ address, blockNumber });
    if (!code || code === '0x' || keccak256(code).toLowerCase() !== expected.toLowerCase()) throw new Error(`Stock contract runtime changed: ${address}`);
  }));
  const [collection, allocator, adapter, vault, lpVault, lpAdapter, lpPool, pool, payout, registry, escrow, governance] = await Promise.all([
    client.readContract({ address: release.sleeve.address, abi: stockCompositeSleeveAbi, functionName: 'collection', blockNumber }),
    client.readContract({ address: release.sleeve.address, abi: stockCompositeSleeveAbi, functionName: 'allocator', blockNumber }),
    client.readContract({ address: release.sleeve.address, abi: stockCompositeSleeveAbi, functionName: 'portfolioAdapter', blockNumber }),
    client.readContract({ address: release.sleeve.address, abi: stockCompositeSleeveAbi, functionName: 'stockVault', blockNumber }),
    client.readContract({ address: release.adapter.address, abi: stockCompositeLPAdapterAbi, functionName: 'lpVault', blockNumber }),
    client.readContract({ address: release.adapter.address, abi: stockCompositeLPAdapterAbi, functionName: 'lpAdapter', blockNumber }),
    client.readContract({ address: release.adapter.address, abi: stockCompositeLPAdapterAbi, functionName: 'lpPool', blockNumber }),
    client.readContract({ address: release.adapter.address, abi: stockCompositeLPAdapterAbi, functionName: 'pool', blockNumber }),
    client.readContract({ address: release.vault.address, abi: stockDividendVaultAbi, functionName: 'payoutAsset', blockNumber }),
    client.readContract({ address: release.vault.address, abi: stockDividendVaultAbi, functionName: 'registry', blockNumber }),
    client.readContract({ address: release.vault.address, abi: stockDividendVaultAbi, functionName: 'escrow', blockNumber }),
    client.readContract({ address: release.collection.address, abi: collectionAbi, functionName: 'collectionTimelock', blockNumber }),
  ]);
  for (const [actual, expected, name] of [[collection, release.collection.address, 'collection'], [allocator, release.allocator.address, 'allocator'], [adapter, release.adapter.address, 'adapter'], [vault, release.vault.address, 'vault'], [lpVault, release.lpVault.address, 'LP vault'], [lpAdapter, release.lpAdapter.address, 'LP adapter'], [lpPool, release.lpPool.address, 'invested LP pool'], [pool, release.registrationPool.address, 'registration pool'], [payout, release.payoutAsset.address, 'payout asset'], [registry, release.registry.address, 'registry'], [escrow, release.escrow.address, 'escrow'], [governance, release.governance, 'governance']]) requireAddress(actual!, expected!, name!);
  const ownershipAbi = parseAbi(['function owner() view returns (address)']);
  const [nft, controller, vaultOwner, registryOwner, hub, payoutNft, settler] = await Promise.all([
    client.readContract({ address: release.collection.address, abi: collectionAbi, functionName: 'nft', blockNumber }),
    client.readContract({ address: release.vault.address, abi: stockDividendVaultAbi, functionName: 'controller', blockNumber }),
    client.readContract({ address: release.vault.address, abi: ownershipAbi, functionName: 'owner', blockNumber }),
    client.readContract({ address: release.registry.address, abi: ownershipAbi, functionName: 'owner', blockNumber }),
    client.readContract({ address: release.vault.address, abi: stockDividendVaultAbi, functionName: 'priceHub', blockNumber }),
    client.readContract({ address: release.escrow.address, abi: stockDividendEscrowAbi, functionName: 'nft', blockNumber }),
    client.readContract({ address: release.escrow.address, abi: stockDividendEscrowAbi, functionName: 'settler', blockNumber }),
  ]);
  for (const [actual, expected, name] of [[nft, release.nft.address, 'NFT'], [controller, release.sleeve.address, 'custody controller'], [vaultOwner, release.governance, 'vault owner'], [registryOwner, release.governance, 'corporate action owner'], [hub, release.priceHub.address, 'price hub'], [payoutNft, release.nft.address, 'payout NFT'], [settler, release.vault.address, 'cash settler']]) requireAddress(actual!, expected!, name!);
  const feedConfigAbi = parseAbi(['function feedDetails(address) view returns ((address feed,address referenceSource,uint32 heartbeat,uint32 gracePeriod,uint16 maxDeviationBps,uint8 decimals,bytes32 feedRuntimeCodeHash,bytes32 referenceRuntimeCodeHash,bytes32 feedDescriptionHash,bool supported,bool corporateActionPaused,bool weekdaysOnly,bool checkAssetOraclePause))']);
  for (const stock of release.stocks) {
    const admissionHash = stock.admissionManifestHash ?? release.manifestHash;
    if (!/^0x[0-9a-fA-F]{64}$/.test(admissionHash) || /^0x0+$/.test(admissionHash)) throw new Error(`${stock.symbol} has invalid admission evidence.`);
    const [entry, exit, dividend, state, feed] = await Promise.all([
      client.readContract({ address: release.sleeve.address, abi: stockCompositeSleeveAbi, functionName: 'stockEntryRoute', args: [stock.token.address], blockNumber }),
      client.readContract({ address: release.sleeve.address, abi: stockCompositeSleeveAbi, functionName: 'stockExitRoute', args: [stock.token.address], blockNumber }),
      client.readContract({ address: release.vault.address, abi: stockDividendVaultAbi, functionName: 'dividendRoutes', args: [stock.token.address], blockNumber }),
      client.readContract({ address: release.registry.address, abi: registryTuple, functionName: 'assets', args: [stock.token.address], blockNumber }),
      client.readContract({ address: release.priceHub.address, abi: feedConfigAbi, functionName: 'feedDetails', args: [stock.token.address], blockNumber }),
    ]);
    for (const [binding, expected] of [[entry, stock.entryRoute], [exit, stock.exitRoute], [dividend, stock.dividendRoute]] as const) {
      requireAddress(binding[0], expected.address, `${stock.symbol} route`);
      if (binding[1].toLowerCase() !== expected.runtimeCodeHash.toLowerCase()) throw new Error(`${stock.symbol} route runtime binding changed.`);
    }
    requireAddress(feed.feed, stock.feed.address, `${stock.symbol} price feed`);
    if (state[4].toLowerCase() !== admissionHash.toLowerCase() || !feed.supported || !feed.checkAssetOraclePause || !feed.weekdaysOnly || feed.heartbeat > 86400 || feed.gracePeriod !== 0 || feed.feedRuntimeCodeHash.toLowerCase() !== stock.feed.runtimeCodeHash.toLowerCase()) throw new Error(`${stock.symbol} admission or oracle configuration changed.`);
  }

}

export async function readStockBankPosition(client: PublicClient, release: StockSleeveRelease, bank: bigint, options: { blockNumber?: bigint } = {}) {
  if (bank <= 0n) throw new Error('Invalid Piggy Bank.');
  const block = await client.getBlock(options.blockNumber === undefined ? {} : { blockNumber: options.blockNumber });
  const blockNumber = block.number;
  await verifyStockSleeveRelease(client, release, blockNumber);
  const [owner, account, assets, lpUnits, target, paused] = await Promise.all([
    client.readContract({ address: release.nft.address, abi: nftAbi, functionName: 'ownerOf', args: [bank], blockNumber }),
    client.readContract({ address: release.collection.address, abi: collectionAbi, functionName: 'accountOf', args: [bank], blockNumber }),
    client.readContract({ address: release.sleeve.address, abi: stockCompositeSleeveAbi, functionName: 'bankAssets', args: [bank], blockNumber }),
    client.readContract({ address: release.sleeve.address, abi: stockCompositeSleeveAbi, functionName: 'lpUnitsOf', args: [bank], blockNumber }),
    client.readContract({ address: release.sleeve.address, abi: stockCompositeSleeveAbi, functionName: 'targetOf', args: [bank], blockNumber }),
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
  const difference = receipt / 10n ** 18n - stockValueUsd18 - lpValueUsd18;
  if (difference < 0n || difference > BigInt(holdings.length + 1)) throw new Error('Bank Stock custody does not reconcile to its receipt.');
  const ownerCashCredit = await client.readContract({ address: release.escrow.address, abi: stockDividendEscrowAbi, functionName: 'creditOf', args: [owner], blockNumber });
  if ((await client.getBlock({ blockNumber })).hash !== block.hash) throw new Error('Bank snapshot reorganized. Refresh before confirming.');
  return { bank, owner, account, blockNumber, blockHash: block.hash, timestamp: block.timestamp, ownerCashCredit, holdings, target, depositsPaused: paused, lpUnits, stockValueUsd18, lpValueUsd18, receiptUnits36: receipt };
}
