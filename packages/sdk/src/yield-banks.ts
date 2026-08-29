import {
  encodeFunctionData, getAddress, keccak256, stringToHex, toHex,
  type Address, type Hex, type PublicClient,
} from "viem";

export const yieldBankCollectionAbi = [
  { type: "function", name: "state", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { type: "function", name: "liveSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "mintedSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "maxSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  ...[
    "primaryBackingBps", "primaryCreatorBps", "primarySinjohBps", "primaryOperationsBps",
    "coreWeightBps", "marketMakingWeightBps", "usdgWeightBps",
  ].map((name) => ({ type: "function", name, stateMutability: "view", inputs: [], outputs: [{ type: "uint16" }] } as const)),
  { type: "function", name: "accountOf", stateMutability: "view", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ type: "address" }] },
  { type: "function", name: "tokenState", stateMutability: "view", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ type: "uint8" }] },
  { type: "function", name: "nft", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "distributor", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "proceedsVault", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "claimPrimary", stateMutability: "nonpayable", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [] },
  { type: "function", name: "settle", stateMutability: "nonpayable", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [] },
  { type: "function", name: "settleBatch", stateMutability: "nonpayable", inputs: [{ name: "tokenIds", type: "uint256[]" }], outputs: [] },
  { type: "function", name: "burnToken", stateMutability: "nonpayable", inputs: [{ name: "tokenId", type: "uint256" }, { name: "proof", type: "bytes" }], outputs: [] },
] as const;

export const yieldBankNftAbi = [
  { type: "function", name: "ownerOf", stateMutability: "view", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ type: "address" }] },
  { type: "function", name: "tokenURI", stateMutability: "view", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ type: "string" }] },
  { type: "function", name: "maxSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "seaDrop", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "safeTransferFrom", stateMutability: "nonpayable", inputs: [{ name: "from", type: "address" }, { name: "to", type: "address" }, { name: "tokenId", type: "uint256" }], outputs: [] },
] as const;

export const yieldBankRevenueRouterAbi = [
  ...[
    "royaltyBackingBps", "royaltyCreatorBps", "royaltySinjohBps", "royaltyOperationsBps",
  ].map((name) => ({ type: "function", name, stateMutability: "view", inputs: [], outputs: [{ type: "uint16" }] } as const)),
] as const;

export const yieldBankProceedsVaultAbi = [
  { type: "function", name: "pendingBackingOf", stateMutability: "view", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "primaryStateOf", stateMutability: "view", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ type: "uint8" }] },
  { type: "function", name: "receiptCount", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "accountedNative", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "totalPendingBacking", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "totalAllocatedBacking", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "allocationOperator", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "allocationPaused", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { type: "function", name: "allocateReceipts", stateMutability: "nonpayable", inputs: [
    { name: "firstReceiptId", type: "uint256" }, { name: "lastReceiptId", type: "uint256" },
    { name: "calls", type: "tuple[3]", components: [
      { name: "minimumOutput", type: "uint256" }, { name: "minimumShares", type: "uint256" },
      { name: "routeData", type: "bytes" }, { name: "sleeveData", type: "bytes" },
    ] },
  ], outputs: [] },
] as const;

export const yieldBankDistributorAbi = [
  { type: "function", name: "distributionAssets", stateMutability: "view", inputs: [], outputs: [{ type: "address[]" }] },
  { type: "function", name: "pending", stateMutability: "view", inputs: [{ name: "tokenId", type: "uint256" }, { name: "asset", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "cumulativeSettled", stateMutability: "view", inputs: [{ name: "tokenId", type: "uint256" }, { name: "asset", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "accountedBalance", stateMutability: "view", inputs: [{ name: "asset", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "solvent", stateMutability: "view", inputs: [{ name: "asset", type: "address" }], outputs: [{ type: "bool" }] },
] as const;

export const yieldBankAccountAbi = [
  { type: "function", name: "trackedAssets", stateMutability: "view", inputs: [], outputs: [{ type: "address[]" }] },
] as const;

export const yieldBankSleeveAbi = [
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "totalSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "totalAssetsUsd18", stateMutability: "view", inputs: [], outputs: [{ name: "value", type: "uint256" }, { name: "pricedAt", type: "uint48" }] },
  { type: "function", name: "activeStrategyCount", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "depositsPaused", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { type: "function", name: "inventoryAssets", stateMutability: "view", inputs: [], outputs: [{ type: "address[]" }] },
  { type: "function", name: "adapters", stateMutability: "view", inputs: [], outputs: [{ type: "address[]" }] },
] as const;

export const yieldBankErc20Abi = [
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "approve", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }] },
] as const;

export const yieldBankStrategyAdapterAbi = [
  { type: "function", name: "accountingAsset", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "totalManagedAssets", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
] as const;

export const yieldBankAllocatorAbi = [
  { type: "function", name: "depositToAdapter", stateMutability: "nonpayable", inputs: [
    { name: "sleeve", type: "address" }, { name: "adapter", type: "address" },
    { name: "assets", type: "uint256" }, { name: "minPositionUnits", type: "uint256" },
    { name: "data", type: "bytes" },
  ], outputs: [{ name: "positionUnits", type: "uint256" }] },
  { type: "function", name: "withdrawFromAdapter", stateMutability: "nonpayable", inputs: [
    { name: "sleeve", type: "address" }, { name: "adapter", type: "address" },
    { name: "assets", type: "uint256" }, { name: "maxLossBps", type: "uint16" },
    { name: "data", type: "bytes" },
  ], outputs: [{ name: "assetsReturned", type: "uint256" }] },
  { type: "function", name: "collectAdapter", stateMutability: "nonpayable", inputs: [
    { name: "sleeve", type: "address" }, { name: "adapter", type: "address" },
    { name: "data", type: "bytes" },
  ], outputs: [{ name: "assets", type: "address[]" }, { name: "amounts", type: "uint256[]" }] },
  { type: "function", name: "exitAdapter", stateMutability: "nonpayable", inputs: [
    { name: "sleeve", type: "address" }, { name: "adapter", type: "address" },
    { name: "maxLossBps", type: "uint16" }, { name: "data", type: "bytes" },
  ], outputs: [{ name: "assets", type: "address[]" }, { name: "amounts", type: "uint256[]" }] },
] as const;

export const yieldBankSystemFactoryAbi = [
  { type: "function", name: "factoryVersion", stateMutability: "view", inputs: [], outputs: [{ type: "bytes32" }] },
  { type: "function", name: "collectionCreationCodeHash", stateMutability: "view", inputs: [], outputs: [{ type: "bytes32" }] },
  { type: "function", name: "systemPlanHash", stateMutability: "view", inputs: [], outputs: [{ type: "bytes32" }] },
] as const;

export const yieldBankProtocolRegistryAbi = [
  { type: "function", name: "collections", stateMutability: "view", inputs: [{ name: "collection", type: "address" }], outputs: [
    { name: "factory", type: "address" }, { name: "factoryVersion", type: "bytes32" },
    { name: "configurationHash", type: "bytes32" }, { name: "runtimeCodeHash", type: "bytes32" },
    { name: "registeredAt", type: "uint48" }, { name: "registered", type: "bool" },
  ] },
] as const;

export interface YieldBankManifestEntry {
  address: Address;
  runtimeCodeHash: Hex;
  version: string;
  provenance: string;
  deploymentTransaction: Hex;
  verificationTransaction: Hex;
  auditHash?: Hex;
}

export interface YieldBankReleaseManifest {
  schemaVersion: "1.0";
  chainId: 4663 | 46630;
  collectionId: Hex;
  factoryVersion: Hex;
  compiler: { version: string; optimizerRuns: number; sourceCommit: Hex; dependencyLockHash: Hex };
  deployment: {
    factorySalt: Hex;
    collectionSalt: Hex;
    collectionConfigurationHash: Hex;
    systemPlanHash: Hex;
    collectionCreationCodeHash: Hex;
    metadataBaseUri: string;
    metadataBaseUriHash: Hex;
    contractUri: string;
    contractUriHash: Hex;
  };
  economics: {
    maxSupply: number;
    primaryBackingBps: number;
    primaryCreatorBps: number;
    primarySinjohBps: number;
    primaryOperationsBps: number;
    royaltyBackingBps: number;
    royaltyCreatorBps: number;
    royaltySinjohBps: number;
    royaltyOperationsBps: number;
    exitTaxBps: 500;
    coreWeightBps: number;
    marketMakingWeightBps: number;
    usdgWeightBps: number;
  };
  policyCaps: Record<"core" | "marketMaking" | "usdg", {
    maximumStrategies: number;
    maximumAdapterCapBps: number;
    maximumOperatorLossBps: number;
  }>;
  openSea: {
    collectionSlug: string;
    collectionUrl: string;
    mintStagesHash: Hex;
    creatorPayoutAddress: Address;
    observedPrimaryPlatformFeeBps: number;
    observedAt: string;
  };
  contracts: Record<
    | "registry" | "factoryDeployer" | "factory" | "collection" | "nft" | "accountImplementation" | "proceedsVault"
    | "distributor" | "revenueRouter" | "operationsReserve" | "timelock"
    | "allocator" | "priceHub" | "strategyRegistry" | "renderer" | "coreSleeve"
    | "marketMakingSleeve" | "usdgSleeve",
    YieldBankManifestEntry
  >;
  dependencies: Record<"WETH" | "USDG" | "seaDrop" | "seaport", YieldBankManifestEntry>
    & Record<string, YieldBankManifestEntry>;
  stockTokens: readonly YieldBankManifestEntry[];
  adapters: Record<string, YieldBankManifestEntry>;
  feeds: Record<string, YieldBankManifestEntry>;
  pools: Record<string, YieldBankManifestEntry>;
  roles: Record<"creator" | "sinjoh" | "operations" | "allocationOperator" | "guardian" | "timelock", Address>;
  auditHashes: readonly Hex[];
}

export interface YieldBankManifestVerification {
  path: string;
  address: Address;
  expectedCodeHash: Hex;
  actualCodeHash: Hex | null;
  ok: boolean;
}

export type YieldBankReadClient = Pick<PublicClient, "readContract" | "getCode">;

export interface YieldBankAssetEntitlement {
  asset: Address;
  settled: bigint;
  pending: bigint;
  cumulativeSettled: bigint;
  exitTaxEstimate: bigint;
}

export interface YieldBankSleeveView extends YieldBankAssetEntitlement {
  sleeve: Address;
  totalSupply: bigint;
  totalAssetsUsd18: bigint;
  pricedAt: number;
  navStale: boolean;
  activeStrategyCount: bigint;
  depositsPaused: boolean;
  inventoryAssets: readonly Address[];
  adapters: readonly Address[];
  proRataUnderlying: readonly YieldBankUnderlyingPosition[];
  strategyPositions: readonly YieldBankStrategyPosition[];
}

export interface YieldBankUnderlyingPosition {
  asset: Address;
  sleeveBalance: bigint;
  tokenAmount: bigint;
}

export interface YieldBankStrategyPosition {
  adapter: Address;
  accountingAsset: Address;
  managedAssets: bigint;
  tokenAmount: bigint;
}

export interface YieldBankTokenView {
  collection: Address;
  nft: Address;
  distributor: Address;
  account: Address;
  tokenId: bigint;
  owner: Address;
  collectionState: number;
  tokenState: number;
  liveSupply: bigint;
  mintedSupply: bigint;
  maxSupply: bigint;
  proceedsVault: Address;
  pendingBacking: bigint;
  primaryState: number;
  tokenUri: string;
  sleeves: readonly YieldBankSleeveView[];
  proofOfBackingSolvent: boolean;
}

const requiredContractKeys = [
  "registry", "factoryDeployer", "factory", "collection", "nft", "accountImplementation", "proceedsVault", "distributor",
  "revenueRouter", "operationsReserve", "timelock", "allocator", "priceHub",
  "strategyRegistry", "renderer", "coreSleeve", "marketMakingSleeve", "usdgSleeve",
] as const;

const WETH = "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73" as Address;
const USDG = "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168" as Address;
const ROBINHOOD_SEADROP = "0x00005EA00Ac477B1030CE78506496e8C2dE24bf5" as Address;
const SEAPORT_1_6 = "0x0000000000000068F116a894984e2DB1123eB395" as Address;

export function validateYieldBankManifest(manifest: YieldBankReleaseManifest): void {
  if (manifest.schemaVersion !== "1.0") throw new Error("unsupported Yield Banks manifest schema");
  if (manifest.chainId !== 4663 && manifest.chainId !== 46630) throw new Error("unsupported chain");
  for (const [name, hash] of Object.entries({
    factoryVersion: manifest.factoryVersion,
    factorySalt: manifest.deployment.factorySalt,
    collectionSalt: manifest.deployment.collectionSalt,
    collectionConfigurationHash: manifest.deployment.collectionConfigurationHash,
    systemPlanHash: manifest.deployment.systemPlanHash,
    collectionCreationCodeHash: manifest.deployment.collectionCreationCodeHash,
    metadataBaseUriHash: manifest.deployment.metadataBaseUriHash,
    contractUriHash: manifest.deployment.contractUriHash,
  })) validateBytes32(name, hash);
  const zeroBytes32 = `0x${"0".repeat(64)}`;
  if (manifest.deployment.factorySalt === zeroBytes32
      || manifest.deployment.collectionSalt === zeroBytes32) {
    throw new Error("deployment salts must be nonzero");
  }
  if (!manifest.deployment.metadataBaseUri || !manifest.deployment.contractUri
      || keccak256(stringToHex(manifest.deployment.metadataBaseUri)).toLowerCase()
        !== manifest.deployment.metadataBaseUriHash.toLowerCase()
      || keccak256(stringToHex(manifest.deployment.contractUri)).toLowerCase()
        !== manifest.deployment.contractUriHash.toLowerCase()) {
    throw new Error("metadata URI provenance mismatch");
  }
  const economics = manifest.economics;
  const configuredBps = [
    economics.primaryBackingBps, economics.primaryCreatorBps, economics.primarySinjohBps,
    economics.primaryOperationsBps, economics.royaltyBackingBps, economics.royaltyCreatorBps,
    economics.royaltySinjohBps, economics.royaltyOperationsBps, economics.coreWeightBps,
    economics.marketMakingWeightBps, economics.usdgWeightBps,
  ];
  if (!Number.isSafeInteger(economics.maxSupply) || economics.maxSupply <= 0
    || configuredBps.some((value) => !Number.isInteger(value) || value < 0 || value > 10_000)
    || economics.primaryBackingBps <= 0
    || economics.primaryBackingBps + economics.primaryCreatorBps
      + economics.primarySinjohBps + economics.primaryOperationsBps !== 10_000
    || economics.royaltyBackingBps <= 0
    || economics.royaltyBackingBps + economics.royaltyCreatorBps
      + economics.royaltySinjohBps + economics.royaltyOperationsBps !== 10_000
    || economics.coreWeightBps <= 0 || economics.marketMakingWeightBps <= 0
    || economics.usdgWeightBps <= 0
    || economics.coreWeightBps + economics.marketMakingWeightBps
      + economics.usdgWeightBps !== 10_000
    || economics.exitTaxBps !== 500) {
    throw new Error("Yield Banks immutable economics mismatch");
  }
  for (const [name, policy] of Object.entries(manifest.policyCaps)) {
    if (!Number.isInteger(policy.maximumStrategies)
      || policy.maximumStrategies < 0 || policy.maximumStrategies > 8
      || !Number.isInteger(policy.maximumAdapterCapBps)
      || policy.maximumAdapterCapBps < 0 || policy.maximumAdapterCapBps > 10_000
      || !Number.isInteger(policy.maximumOperatorLossBps)
      || policy.maximumOperatorLossBps < 0 || policy.maximumOperatorLossBps > 10_000
      || (policy.maximumStrategies !== 0 && policy.maximumAdapterCapBps === 0)) {
      throw new Error(`policyCaps.${name} is invalid`);
    }
  }
  if (!/^[a-z0-9][a-z0-9-]*$/.test(manifest.openSea.collectionSlug)) {
    throw new Error("openSea.collectionSlug is invalid");
  }
  let collectionUrl: URL;
  try { collectionUrl = new URL(manifest.openSea.collectionUrl); }
  catch { throw new Error("openSea.collectionUrl is invalid"); }
  if (collectionUrl.protocol !== "https:" || collectionUrl.hostname !== "opensea.io"
    || collectionUrl.pathname !== `/collection/${manifest.openSea.collectionSlug}/overview`) {
    throw new Error("openSea.collectionUrl must identify the recorded OpenSea collection overview");
  }
  validateBytes32("openSea.mintStagesHash", manifest.openSea.mintStagesHash);
  if (getAddress(manifest.openSea.creatorPayoutAddress)
      !== getAddress(manifest.contracts.proceedsVault.address)) {
    throw new Error("openSea.creatorPayoutAddress must equal contracts.proceedsVault.address");
  }
  if (!Number.isInteger(manifest.openSea.observedPrimaryPlatformFeeBps)
      || manifest.openSea.observedPrimaryPlatformFeeBps < 0
      || manifest.openSea.observedPrimaryPlatformFeeBps > 10_000) {
    throw new Error("openSea.observedPrimaryPlatformFeeBps must be in 0..10000");
  }
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(manifest.openSea.observedAt)) {
    throw new Error("openSea.observedAt must be an ISO-8601 UTC timestamp");
  }
  for (const key of requiredContractKeys) validateEntry(`contracts.${key}`, manifest.contracts[key]);
  const requiredDependencies = { WETH, USDG, seaDrop: ROBINHOOD_SEADROP, seaport: SEAPORT_1_6 };
  for (const [key, expected] of Object.entries(requiredDependencies)) {
    const dependency = manifest.dependencies[key];
    if (!dependency) throw new Error(`dependencies.${key} is missing`);
    validateEntry(`dependencies.${key}`, dependency);
    if (getAddress(dependency.address) !== getAddress(expected)) {
      throw new Error(`dependencies.${key} address mismatch`);
    }
  }
  if (manifest.stockTokens.length < 1) throw new Error("at least one Stock Token is required");
  manifest.stockTokens.forEach((entry, index) => validateEntry(`stockTokens.${index}`, entry));
  if (Object.keys(manifest.feeds).length < 1) throw new Error("reviewed feeds are required");
  for (const [group, entries] of Object.entries({
    dependencies: manifest.dependencies,
    adapters: manifest.adapters,
    feeds: manifest.feeds,
    pools: manifest.pools,
  })) {
    for (const [key, entry] of Object.entries(entries)) validateEntry(`${group}.${key}`, entry);
  }
  for (const [role, address] of Object.entries(manifest.roles)) {
    if (getAddress(address) === "0x0000000000000000000000000000000000000000") {
      throw new Error(`roles.${role} is zero`);
    }
  }
  if (manifest.auditHashes.length === 0) throw new Error("audit hashes are required");
  manifest.auditHashes.forEach((hash, index) => validateBytes32(`auditHashes.${index}`, hash));
}

export async function verifyYieldBankManifest(
  client: YieldBankReadClient,
  manifest: YieldBankReleaseManifest,
): Promise<YieldBankManifestVerification[]> {
  validateYieldBankManifest(manifest);
  const entries: [string, YieldBankManifestEntry][] = [];
  for (const [group, records] of Object.entries({
    contracts: manifest.contracts, dependencies: manifest.dependencies,
    adapters: manifest.adapters, feeds: manifest.feeds, pools: manifest.pools,
  })) {
    for (const [key, entry] of Object.entries(records)) entries.push([`${group}.${key}`, entry]);
  }
  manifest.stockTokens.forEach((entry, index) => entries.push([`stockTokens.${index}`, entry]));
  const codeResults = await Promise.all(entries.map(async ([path, entry]) => {
    const code = await client.getCode({ address: entry.address });
    const actualCodeHash = code && code !== "0x" ? keccak256(code) : null;
    return {
      path, address: entry.address, expectedCodeHash: entry.runtimeCodeHash, actualCodeHash,
      ok: actualCodeHash?.toLowerCase() === entry.runtimeCodeHash.toLowerCase(),
    };
  }));
  const factory = manifest.contracts.factory.address;
  const [factoryVersion, collectionCreationCodeHash, systemPlanHash, collectionRecord] = await Promise.all([
    read<Hex>(client, factory, yieldBankSystemFactoryAbi, "factoryVersion"),
    read<Hex>(client, factory, yieldBankSystemFactoryAbi, "collectionCreationCodeHash"),
    read<Hex>(client, factory, yieldBankSystemFactoryAbi, "systemPlanHash"),
    read<readonly [Address, Hex, Hex, Hex, bigint, boolean]>(
      client, manifest.contracts.registry.address, yieldBankProtocolRegistryAbi,
      "collections", [manifest.contracts.collection.address],
    ),
  ]);
  const economicsKeys = [
    "primaryBackingBps", "primaryCreatorBps", "primarySinjohBps", "primaryOperationsBps",
    "coreWeightBps", "marketMakingWeightBps", "usdgWeightBps",
  ] as const;
  const royaltyEconomicsKeys = [
    "royaltyBackingBps", "royaltyCreatorBps", "royaltySinjohBps", "royaltyOperationsBps",
  ] as const;
  const onchainEconomics = await Promise.all(economicsKeys.map((key) =>
    read<number>(client, manifest.contracts.collection.address, yieldBankCollectionAbi, key)));
  const onchainRoyaltyEconomics = await Promise.all(royaltyEconomicsKeys.map((key) =>
    read<number>(client, manifest.contracts.revenueRouter.address, yieldBankRevenueRouterAbi, key)));
  const commitments: [string, Hex, Hex][] = [
    ["factory.factoryVersion", manifest.factoryVersion, factoryVersion],
    ["factory.collectionCreationCodeHash", manifest.deployment.collectionCreationCodeHash, collectionCreationCodeHash],
    ["factory.systemPlanHash", manifest.deployment.systemPlanHash, systemPlanHash],
    ["registry.collectionConfigurationHash", manifest.deployment.collectionConfigurationHash, collectionRecord[2]],
  ];
  const commitmentResults = commitments.map(([path, expectedCodeHash, actualCodeHash]) => ({
    path,
    address: path.startsWith("registry.") ? manifest.contracts.registry.address : factory,
    expectedCodeHash,
    actualCodeHash,
    ok: expectedCodeHash.toLowerCase() === actualCodeHash.toLowerCase(),
  }));
  const economicsResults = economicsKeys.map((key, index) => {
    const expected = toHex(manifest.economics[key], { size: 32 });
    const actual = toHex(onchainEconomics[index]!, { size: 32 });
    return {
      path: `collection.${key}`,
      address: manifest.contracts.collection.address,
      expectedCodeHash: expected,
      actualCodeHash: actual,
      ok: expected === actual,
    };
  });
  const royaltyEconomicsResults = royaltyEconomicsKeys.map((key, index) => {
    const expected = toHex(manifest.economics[key], { size: 32 });
    const actual = toHex(onchainRoyaltyEconomics[index]!, { size: 32 });
    return {
      path: `revenueRouter.${key}`,
      address: manifest.contracts.revenueRouter.address,
      expectedCodeHash: expected,
      actualCodeHash: actual,
      ok: expected === actual,
    };
  });
  return codeResults.concat(commitmentResults, economicsResults, royaltyEconomicsResults);
}

export async function readYieldBankToken(
  client: YieldBankReadClient,
  manifest: YieldBankReleaseManifest,
  tokenId: bigint,
  options: { staleAfterSeconds?: number; now?: number } = {},
): Promise<YieldBankTokenView> {
  validateYieldBankManifest(manifest);
  if (tokenId < 1n || tokenId > BigInt(manifest.economics.maxSupply)) throw new Error(`tokenId must be in 1..${manifest.economics.maxSupply}`);
  const collection = manifest.contracts.collection.address;
  const nft = manifest.contracts.nft.address;
  const distributor = manifest.contracts.distributor.address;
  const proceedsVault = manifest.contracts.proceedsVault.address;
  const [collectionState, tokenState, liveSupply, mintedSupply, maxSupply, account, owner, tokenUri, pendingBacking, primaryState] = await Promise.all([
    read<bigint>(client, collection, yieldBankCollectionAbi, "state"),
    read<bigint>(client, collection, yieldBankCollectionAbi, "tokenState", [tokenId]),
    read<bigint>(client, collection, yieldBankCollectionAbi, "liveSupply"),
    read<bigint>(client, collection, yieldBankCollectionAbi, "mintedSupply"),
    read<bigint>(client, collection, yieldBankCollectionAbi, "maxSupply"),
    read<Address>(client, collection, yieldBankCollectionAbi, "accountOf", [tokenId]),
    read<Address>(client, nft, yieldBankNftAbi, "ownerOf", [tokenId]),
    read<string>(client, nft, yieldBankNftAbi, "tokenURI", [tokenId]),
    read<bigint>(client, proceedsVault, yieldBankProceedsVaultAbi, "pendingBackingOf", [tokenId]),
    read<bigint>(client, proceedsVault, yieldBankProceedsVaultAbi, "primaryStateOf", [tokenId]),
  ]);
  const sleeveAddresses = [
    manifest.contracts.coreSleeve.address,
    manifest.contracts.marketMakingSleeve.address,
    manifest.contracts.usdgSleeve.address,
  ];
  const now = options.now ?? Math.floor(Date.now() / 1000);
  const staleAfter = options.staleAfterSeconds ?? 86_400;
  const sleeves = await Promise.all(sleeveAddresses.map(async (sleeve) => {
    const [settled, pending, cumulativeSettled, totalSupply, navTuple, activeStrategyCount,
      depositsPaused, inventoryAssets, adapters, solvent] = await Promise.all([
      read<bigint>(client, sleeve, yieldBankSleeveAbi, "balanceOf", [account]),
      read<bigint>(client, distributor, yieldBankDistributorAbi, "pending", [tokenId, sleeve]),
      read<bigint>(client, distributor, yieldBankDistributorAbi, "cumulativeSettled", [tokenId, sleeve]),
      read<bigint>(client, sleeve, yieldBankSleeveAbi, "totalSupply"),
      read<readonly [bigint, bigint]>(client, sleeve, yieldBankSleeveAbi, "totalAssetsUsd18"),
      read<bigint>(client, sleeve, yieldBankSleeveAbi, "activeStrategyCount"),
      read<boolean>(client, sleeve, yieldBankSleeveAbi, "depositsPaused"),
      read<readonly Address[]>(client, sleeve, yieldBankSleeveAbi, "inventoryAssets"),
      read<readonly Address[]>(client, sleeve, yieldBankSleeveAbi, "adapters"),
      read<boolean>(client, distributor, yieldBankDistributorAbi, "solvent", [sleeve]),
    ]);
    const [totalAssetsUsd18, pricedAtRaw] = navTuple;
    const pricedAt = Number(pricedAtRaw);
    const entitlement = settled + pending;
    const proRataUnderlying = await Promise.all(inventoryAssets.map(async (asset) => {
      const sleeveBalance = await read<bigint>(
        client, asset, yieldBankErc20Abi, "balanceOf", [sleeve],
      );
      return {
        asset,
        sleeveBalance,
        tokenAmount: totalSupply === 0n ? 0n : sleeveBalance * entitlement / totalSupply,
      };
    }));
    const strategyPositions = await Promise.all(adapters.map(async (adapter) => {
      const [adapterAccountingAsset, managedAssets] = await Promise.all([
        read<Address>(client, adapter, yieldBankStrategyAdapterAbi, "accountingAsset"),
        read<bigint>(client, adapter, yieldBankStrategyAdapterAbi, "totalManagedAssets"),
      ]);
      return {
        adapter,
        accountingAsset: adapterAccountingAsset,
        managedAssets,
        tokenAmount: totalSupply === 0n ? 0n : managedAssets * entitlement / totalSupply,
      };
    }));
    return {
      sleeve, asset: sleeve, settled, pending, cumulativeSettled,
      exitTaxEstimate: liveSupply === 1n ? 0n : entitlement * 500n / 10_000n,
      totalSupply, totalAssetsUsd18, pricedAt,
      navStale: pricedAt === 0 || now - pricedAt > staleAfter,
      activeStrategyCount, depositsPaused, inventoryAssets, adapters,
      proRataUnderlying, strategyPositions,
      solvent,
    };
  }));
  return {
    collection, nft, distributor, account, tokenId, owner,
    collectionState: Number(collectionState), tokenState: Number(tokenState), liveSupply, mintedSupply,
    maxSupply, proceedsVault, pendingBacking, primaryState: Number(primaryState), tokenUri,
    sleeves: sleeves.map(({ solvent: _solvent, ...sleeve }) => sleeve),
    proofOfBackingSolvent: sleeves.every(({ solvent }) => solvent),
  };
}

export function openSeaCollectionUrl(slug: string): string {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) throw new Error("invalid OpenSea collection slug");
  return `https://opensea.io/collection/${slug}/overview`;
}

export function openSeaAssetUrl(nft: Address, tokenId: bigint): string {
  if (tokenId < 1n) throw new Error("tokenId must be positive");
  return `https://opensea.io/assets/robinhood/${getAddress(nft)}/${tokenId}`;
}

export interface YieldBankAllocationCall { minimumOutput: bigint; minimumShares: bigint; routeData: Hex; sleeveData: Hex }
export function prepareYieldBankAllocation(vault: Address, firstReceiptId: bigint, lastReceiptId: bigint, calls: readonly [YieldBankAllocationCall, YieldBankAllocationCall, YieldBankAllocationCall]) {
  if (firstReceiptId < 1n || lastReceiptId < firstReceiptId || lastReceiptId - firstReceiptId + 1n > 20n) throw new Error("invalid receipt range");
  if (calls.some((call) => call.minimumOutput <= 0n || call.minimumShares <= 0n)) {
    throw new Error("every allocation leg requires positive minimum output and share floors");
  }
  return { to: vault, data: encodeFunctionData({ abi: yieldBankProceedsVaultAbi, functionName: "allocateReceipts", args: [firstReceiptId, lastReceiptId, calls] }), value: 0n } as const;
}

export function prepareYieldBankClaim(collection: Address, tokenId: bigint) {
  if (tokenId < 1n) throw new Error("tokenId must be positive");
  return { to: collection, data: encodeFunctionData({ abi: yieldBankCollectionAbi, functionName: "claimPrimary", args: [tokenId] }), value: 0n } as const;
}

export function prepareYieldBankSettle(collection: Address, tokenId: bigint) {
  return { to: collection, data: encodeFunctionData({ abi: yieldBankCollectionAbi, functionName: "settle", args: [tokenId] }), value: 0n } as const;
}

export function prepareYieldBankTransfer(
  nft: Address,
  from: Address,
  to: Address,
  tokenId: bigint,
  maxSupply: bigint,
) {
  if (tokenId < 1n || tokenId > maxSupply) throw new Error(`tokenId must be in 1..${maxSupply}`);
  return {
    to: nft,
    data: encodeFunctionData({
      abi: yieldBankNftAbi, functionName: "safeTransferFrom", args: [from, to, tokenId],
    }),
    value: 0n,
  } as const;
}

export function prepareYieldBankBurn(collection: Address, tokenId: bigint, proof: Hex = "0x") {
  return { to: collection, data: encodeFunctionData({ abi: yieldBankCollectionAbi, functionName: "burnToken", args: [tokenId, proof] }), value: 0n } as const;
}

export function prepareYieldBankAdapterDeposit(
  allocator: Address,
  sleeve: Address,
  adapter: Address,
  assets: bigint,
  minPositionUnits: bigint,
  data: Hex = "0x",
) {
  if (assets <= 0n || minPositionUnits <= 0n) throw new Error("adapter deposit requires positive bounds");
  return {
    to: allocator,
    data: encodeFunctionData({
      abi: yieldBankAllocatorAbi,
      functionName: "depositToAdapter",
      args: [sleeve, adapter, assets, minPositionUnits, data],
    }),
    value: 0n,
  } as const;
}

export function prepareYieldBankAdapterWithdrawal(
  allocator: Address,
  sleeve: Address,
  adapter: Address,
  assets: bigint,
  maxLossBps: number,
  data: Hex = "0x",
) {
  validateLossBps(maxLossBps);
  if (assets <= 0n) throw new Error("adapter withdrawal requires positive assets");
  return {
    to: allocator,
    data: encodeFunctionData({
      abi: yieldBankAllocatorAbi,
      functionName: "withdrawFromAdapter",
      args: [sleeve, adapter, assets, maxLossBps, data],
    }),
    value: 0n,
  } as const;
}

export function prepareYieldBankAdapterCollection(
  allocator: Address,
  sleeve: Address,
  adapter: Address,
  data: Hex = "0x",
) {
  return {
    to: allocator,
    data: encodeFunctionData({
      abi: yieldBankAllocatorAbi,
      functionName: "collectAdapter",
      args: [sleeve, adapter, data],
    }),
    value: 0n,
  } as const;
}

export function prepareYieldBankAdapterExit(
  allocator: Address,
  sleeve: Address,
  adapter: Address,
  maxLossBps: number,
  data: Hex = "0x",
) {
  validateLossBps(maxLossBps);
  return {
    to: allocator,
    data: encodeFunctionData({
      abi: yieldBankAllocatorAbi,
      functionName: "exitAdapter",
      args: [sleeve, adapter, maxLossBps, data],
    }),
    value: 0n,
  } as const;
}

function validateLossBps(value: number): void {
  if (!Number.isInteger(value) || value < 0 || value > 10_000) {
    throw new Error("maxLossBps must be integer basis points");
  }
}

function validateEntry(path: string, entry: YieldBankManifestEntry | undefined): void {
  if (!entry) throw new Error(`${path} is missing`);
  getAddress(entry.address);
  if (!/^0x[0-9a-fA-F]{64}$/.test(entry.runtimeCodeHash)) {
    throw new Error(`${path}.runtimeCodeHash must be bytes32`);
  }
  if (!entry.version || !entry.provenance) throw new Error(`${path} provenance is missing`);
  validateBytes32(`${path}.deploymentTransaction`, entry.deploymentTransaction);
  validateBytes32(`${path}.verificationTransaction`, entry.verificationTransaction);
}

function validateBytes32(path: string, value: Hex): void {
  if (!/^0x[0-9a-fA-F]{64}$/.test(value)) throw new Error(`${path} must be bytes32`);
}

async function read<T>(
  client: Pick<PublicClient, "readContract">,
  address: Address,
  abi: readonly unknown[],
  functionName: string,
  args?: readonly unknown[],
): Promise<T> {
  return client.readContract({ address, abi, functionName, args } as never) as Promise<T>;
}
