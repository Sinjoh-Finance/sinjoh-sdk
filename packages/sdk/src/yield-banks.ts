import {
  encodeAbiParameters, encodeFunctionData, getAddress, keccak256, stringToHex, toHex,
  type Address, type Hex, type PublicClient,
} from "viem";

export const yieldBankCollectionAbi = [
  { type: "function", name: "collectionId", stateMutability: "view", inputs: [], outputs: [{ type: "bytes32" }] },
  { type: "function", name: "state", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { type: "function", name: "liveSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "mintedSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "maxSupply", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "secondaryRoyaltyBps", stateMutability: "view", inputs: [], outputs: [{ type: "uint96" }] },
  ...[
    "primaryBackingBps", "primaryCreatorBps", "primarySinjohBps", "primaryOperationsBps",
    "coreWeightBps", "marketMakingWeightBps", "usdgWeightBps",
  ].map((name) => ({ type: "function", name, stateMutability: "view", inputs: [], outputs: [{ type: "uint16" }] } as const)),
  { type: "function", name: "accountOf", stateMutability: "view", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ type: "address" }] },
  { type: "function", name: "tokenState", stateMutability: "view", inputs: [{ name: "tokenId", type: "uint256" }], outputs: [{ type: "uint8" }] },
  { type: "function", name: "nft", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "distributor", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "proceedsVault", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "portfolioAllocator", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "accountImplementation", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "eligibilityPolicy", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  ...[
    "creator", "openSeaManager", "sinjohFeeRecipient", "operationsReserve", "revenueRouter",
    "collectionTimelock", "guardian",
  ].map((name) => ({ type: "function", name, stateMutability: "view", inputs: [], outputs: [{ type: "address" }] } as const)),
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
  { type: "function", name: "collection", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "royaltyReceiver", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "royaltyBps", stateMutability: "view", inputs: [], outputs: [{ type: "uint96" }] },
  { type: "function", name: "owner", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "updatePublicDrop", stateMutability: "nonpayable", inputs: [
    { name: "impl", type: "address" }, { name: "value", type: "tuple", components: [
      { name: "mintPrice", type: "uint80" }, { name: "startTime", type: "uint48" },
      { name: "endTime", type: "uint48" }, { name: "maxTotalMintableByWallet", type: "uint16" },
      { name: "feeBps", type: "uint16" }, { name: "restrictFeeRecipients", type: "bool" },
    ] },
  ], outputs: [] },
  { type: "function", name: "updateAllowList", stateMutability: "nonpayable", inputs: [
    { name: "impl", type: "address" }, { name: "value", type: "tuple", components: [
      { name: "merkleRoot", type: "bytes32" }, { name: "publicKeyURIs", type: "string[]" },
      { name: "allowListURI", type: "string" },
    ] },
  ], outputs: [] },
  { type: "function", name: "updateTokenGatedDrop", stateMutability: "nonpayable", inputs: [
    { name: "impl", type: "address" }, { name: "token", type: "address" },
    { name: "value", type: "tuple", components: [
      { name: "mintPrice", type: "uint80" }, { name: "maxTotalMintableByWallet", type: "uint16" },
      { name: "startTime", type: "uint48" }, { name: "endTime", type: "uint48" },
      { name: "dropStageIndex", type: "uint8" }, { name: "maxTokenSupplyForStage", type: "uint32" },
      { name: "feeBps", type: "uint16" }, { name: "restrictFeeRecipients", type: "bool" },
    ] },
  ], outputs: [] },
  { type: "function", name: "updateCreatorPayoutAddress", stateMutability: "nonpayable", inputs: [
    { name: "impl", type: "address" }, { name: "value", type: "address" },
  ], outputs: [] },
  { type: "function", name: "updateAllowedFeeRecipient", stateMutability: "nonpayable", inputs: [
    { name: "impl", type: "address" }, { name: "value", type: "address" },
    { name: "allowed", type: "bool" },
  ], outputs: [] },
  { type: "function", name: "updateSignedMintValidationParams", stateMutability: "nonpayable", inputs: [
    { name: "impl", type: "address" }, { name: "signer", type: "address" },
    { name: "value", type: "tuple", components: [
      { name: "minMintPrice", type: "uint80" },
      { name: "maxMaxTotalMintableByWallet", type: "uint24" },
      { name: "minStartTime", type: "uint40" }, { name: "maxEndTime", type: "uint40" },
      { name: "maxMaxTokenSupplyForStage", type: "uint40" },
      { name: "minFeeBps", type: "uint16" }, { name: "maxFeeBps", type: "uint16" },
    ] },
  ], outputs: [] },
  { type: "function", name: "updatePayer", stateMutability: "nonpayable", inputs: [
    { name: "impl", type: "address" }, { name: "payer", type: "address" },
    { name: "allowed", type: "bool" },
  ], outputs: [] },
  { type: "function", name: "transferOwnership", stateMutability: "nonpayable", inputs: [
    { name: "newOwner", type: "address" },
  ], outputs: [] },
  { type: "function", name: "acceptOwnership", stateMutability: "nonpayable", inputs: [], outputs: [] },
  { type: "function", name: "safeTransferFrom", stateMutability: "nonpayable", inputs: [{ name: "from", type: "address" }, { name: "to", type: "address" }, { name: "tokenId", type: "uint256" }], outputs: [] },
] as const;

export const yieldBankRevenueRouterAbi = [
  ...[
    "royaltyBackingBps", "royaltyCreatorBps", "royaltySinjohBps", "royaltyOperationsBps",
  ].map((name) => ({ type: "function", name, stateMutability: "view", inputs: [], outputs: [{ type: "uint16" }] } as const)),
  { type: "function", name: "syncRoyalty", stateMutability: "nonpayable", inputs: [{ name: "asset", type: "address" }, { name: "sourceData", type: "bytes" }], outputs: [{ name: "amount", type: "uint256" }] },
  { type: "function", name: "syncNativeRoyalty", stateMutability: "nonpayable", inputs: [{ name: "sourceData", type: "bytes" }], outputs: [{ name: "amount", type: "uint256" }] },
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
  { type: "function", name: "maximumStrategies", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { type: "function", name: "maximumAdapterCapBps", stateMutability: "view", inputs: [], outputs: [{ type: "uint16" }] },
  { type: "function", name: "maximumOperatorLossBps", stateMutability: "view", inputs: [], outputs: [{ type: "uint16" }] },
  { type: "function", name: "totalAssetsUsd18", stateMutability: "view", inputs: [], outputs: [{ name: "value", type: "uint256" }, { name: "pricedAt", type: "uint48" }] },
  { type: "function", name: "activeStrategyCount", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "depositsPaused", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  { type: "function", name: "eligibilityPolicy", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "inventoryAssets", stateMutability: "view", inputs: [], outputs: [{ type: "address[]" }] },
  { type: "function", name: "adapters", stateMutability: "view", inputs: [], outputs: [{ type: "address[]" }] },
  { type: "function", name: "adapterState", stateMutability: "view", inputs: [{ name: "adapter", type: "address" }], outputs: [{ type: "uint8" }] },
  { type: "function", name: "adapterCapBps", stateMutability: "view", inputs: [{ name: "adapter", type: "address" }], outputs: [{ type: "uint16" }] },
  { type: "function", name: "redeem", stateMutability: "nonpayable", inputs: [
    { name: "shares", type: "uint256" }, { name: "receiver", type: "address" },
    { name: "owner", type: "address" }, { name: "mode", type: "uint8" },
    { name: "minimumOutput", type: "uint256" }, { name: "proof", type: "bytes" },
  ], outputs: [{ name: "assets", type: "address[]" }, { name: "amounts", type: "uint256[]" }] },
] as const;

export const yieldBankErc20Abi = [
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "approve", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }] },
] as const;

export const yieldBankStrategyAdapterAbi = [
  { type: "function", name: "accountingAsset", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { type: "function", name: "totalManagedAssets", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "totalPositionUnits", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
] as const;

export const yieldBankDeltaAdapterAbi = [
  ...[
    "sleeve", "accountingAsset", "injoh", "priceHub", "pool", "factory",
    "positionManager", "positionBuilder", "entryRoute", "exitRoute",
  ].map((name) => ({
    type: "function", name, stateMutability: "view", inputs: [], outputs: [{ type: "address" }],
  } as const)),
  { type: "function", name: "maximumPositions", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
] as const;

export const yieldBankStrategyRegistryAbi = [
  { type: "function", name: "recordOf", stateMutability: "view", inputs: [{ name: "adapter", type: "address" }], outputs: [{ type: "tuple", components: [
    { name: "implementation", type: "address" }, { name: "runtimeCodeHash", type: "bytes32" },
    { name: "sleeveCategory", type: "bytes32" }, { name: "accountingAsset", type: "address" },
    { name: "state", type: "uint8" }, { name: "registeredAt", type: "uint48" },
  ] }] },
] as const;

export const yieldBankAllocatorAbi = [
  { type: "function", name: "routeBinding", stateMutability: "view", inputs: [
    { name: "inputAsset", type: "address" }, { name: "sleeve", type: "address" },
  ], outputs: [{ name: "route", type: "address" }, { name: "runtimeCodeHash", type: "bytes32" }] },
  { type: "function", name: "rebalanceRoute", stateMutability: "view", inputs: [
    { name: "inputAsset", type: "address" },
  ], outputs: [{ name: "route", type: "address" }, { name: "runtimeCodeHash", type: "bytes32" }] },
  { type: "function", name: "allocationTargetOf", stateMutability: "view", inputs: [
    { name: "tokenId", type: "uint256" },
  ], outputs: [{ name: "target", type: "tuple", components: [
    { name: "requester", type: "address" },
    { name: "coreWeightBps", type: "uint16" },
    { name: "marketMakingWeightBps", type: "uint16" },
    { name: "usdgWeightBps", type: "uint16" },
    { name: "maximumAdapterLossBps", type: "uint16" },
    { name: "revision", type: "uint64" },
    { name: "executedRevision", type: "uint64" },
    { name: "requestedAt", type: "uint48" },
    { name: "validUntil", type: "uint48" },
    { name: "executedAt", type: "uint48" },
  ] }] },
  { type: "function", name: "setTargetAllocation", stateMutability: "nonpayable", inputs: [
    { name: "tokenId", type: "uint256" }, { name: "weights", type: "uint16[3]" },
    { name: "maximumAdapterLossBps", type: "uint16" }, { name: "validUntil", type: "uint48" },
  ], outputs: [{ name: "revision", type: "uint64" }] },
  { type: "function", name: "executeTargetAllocation", stateMutability: "nonpayable", inputs: [
    { name: "tokenId", type: "uint256" },
    { name: "expectedRevision", type: "uint64" },
    { name: "execution", type: "tuple", components: [
      { name: "redemptions", type: "tuple[3]", components: [
        { name: "minimumOutputs", type: "uint256[]" },
        { name: "adapterCalls", type: "tuple[]", components: [
          { name: "adapter", type: "address" }, { name: "maxLossBps", type: "uint16" },
          { name: "data", type: "bytes" },
        ] },
      ] },
      { name: "conversions", type: "tuple[]", components: [
        { name: "asset", type: "address" }, { name: "minimumWethOut", type: "uint256" },
        { name: "routeData", type: "bytes" },
      ] },
      { name: "allocations", type: "tuple[3]", components: [
        { name: "minimumOutput", type: "uint256" }, { name: "minimumShares", type: "uint256" },
        { name: "routeData", type: "bytes" }, { name: "sleeveData", type: "bytes" },
      ] },
      { name: "minimumWethRecovered", type: "uint256" }, { name: "deadline", type: "uint256" },
    ] },
  ], outputs: [
    { name: "wethRecovered", type: "uint256" }, { name: "shares", type: "uint256[3]" },
  ] },
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

export const yieldBankSeaDropReadAbi = [
  { type: "function", name: "getCreatorPayoutAddress", stateMutability: "view", inputs: [{ name: "nftContract", type: "address" }], outputs: [{ type: "address" }] },
  { type: "function", name: "getAllowListMerkleRoot", stateMutability: "view", inputs: [{ name: "nftContract", type: "address" }], outputs: [{ type: "bytes32" }] },
  { type: "function", name: "getAllowedFeeRecipients", stateMutability: "view", inputs: [{ name: "nftContract", type: "address" }], outputs: [{ type: "address[]" }] },
  { type: "function", name: "getPayers", stateMutability: "view", inputs: [{ name: "nftContract", type: "address" }], outputs: [{ type: "address[]" }] },
  { type: "function", name: "getSigners", stateMutability: "view", inputs: [{ name: "nftContract", type: "address" }], outputs: [{ type: "address[]" }] },
  { type: "function", name: "getTokenGatedAllowedTokens", stateMutability: "view", inputs: [{ name: "nftContract", type: "address" }], outputs: [{ type: "address[]" }] },
  { type: "function", name: "getTokenGatedDrop", stateMutability: "view", inputs: [{ name: "nftContract", type: "address" }, { name: "allowedNftToken", type: "address" }], outputs: [{ type: "tuple", components: [
    { name: "mintPrice", type: "uint80" },
    { name: "maxTotalMintableByWallet", type: "uint16" },
    { name: "startTime", type: "uint48" }, { name: "endTime", type: "uint48" },
    { name: "dropStageIndex", type: "uint8" },
    { name: "maxTokenSupplyForStage", type: "uint32" },
    { name: "feeBps", type: "uint16" },
    { name: "restrictFeeRecipients", type: "bool" },
  ] }] },
  { type: "function", name: "getSignedMintValidationParams", stateMutability: "view", inputs: [{ name: "nftContract", type: "address" }, { name: "signer", type: "address" }], outputs: [{ type: "tuple", components: [
    { name: "minMintPrice", type: "uint80" },
    { name: "maxMaxTotalMintableByWallet", type: "uint24" },
    { name: "minStartTime", type: "uint40" }, { name: "maxEndTime", type: "uint40" },
    { name: "maxMaxTokenSupplyForStage", type: "uint40" },
    { name: "minFeeBps", type: "uint16" }, { name: "maxFeeBps", type: "uint16" },
  ] }] },
  { type: "function", name: "getPublicDrop", stateMutability: "view", inputs: [{ name: "nftContract", type: "address" }], outputs: [{ type: "tuple", components: [
    { name: "mintPrice", type: "uint80" }, { name: "startTime", type: "uint48" },
    { name: "endTime", type: "uint48" }, { name: "maxTotalMintableByWallet", type: "uint16" },
    { name: "feeBps", type: "uint16" }, { name: "restrictFeeRecipients", type: "bool" },
  ] }] },
] as const;

export interface YieldBankPublicDrop {
  mintPrice: string;
  startTime: number;
  endTime: number;
  maxTotalMintableByWallet: number;
  feeBps: number;
  restrictFeeRecipients: boolean;
}

export interface YieldBankTokenGatedDrop {
  allowedNftToken: Address;
  mintPrice: string;
  maxTotalMintableByWallet: number;
  startTime: number;
  endTime: number;
  dropStageIndex: number;
  maxTokenSupplyForStage: number;
  feeBps: number;
  restrictFeeRecipients: boolean;
}

export interface YieldBankSignedMintValidation {
  signer: Address;
  minMintPrice: string;
  maxMaxTotalMintableByWallet: number;
  minStartTime: number;
  maxEndTime: number;
  maxMaxTokenSupplyForStage: number;
  minFeeBps: number;
  maxFeeBps: number;
}

export interface YieldBankSeaDropPublicDropConfig {
  mintPrice: bigint;
  startTime: number;
  endTime: number;
  maxTotalMintableByWallet: number;
  feeBps: number;
  restrictFeeRecipients: boolean;
}

export interface YieldBankSeaDropTokenGatedDropConfig {
  mintPrice: bigint;
  maxTotalMintableByWallet: number;
  startTime: number;
  endTime: number;
  dropStageIndex: number;
  maxTokenSupplyForStage: number;
  feeBps: number;
  restrictFeeRecipients: boolean;
}

export interface YieldBankSeaDropSignedMintConfig {
  minMintPrice: bigint;
  maxMaxTotalMintableByWallet: number;
  minStartTime: number;
  maxEndTime: number;
  maxMaxTokenSupplyForStage: number;
  minFeeBps: number;
  maxFeeBps: number;
}

export interface YieldBankManifestEntry {
  address: Address;
  runtimeCodeHash: Hex;
  version: string;
  provenance: string;
  deploymentTransaction: Hex;
  verificationTransaction: Hex;
  auditHash?: Hex;
  implementationBinding?:
    | { kind: "immutable" }
    | { kind: "eip1967"; implementation: Address; implementationRuntimeCodeHash: Hex }
    | {
      kind: "beacon";
      beacon: Address;
      beaconRuntimeCodeHash: Hex;
      implementation: Address;
      implementationRuntimeCodeHash: Hex;
    };
}

export interface YieldBankReleaseManifest {
  schemaVersion: "1.0";
  chainId: 4663;
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
    secondaryRoyaltyBps: number;
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
  equityModel: {
    custody: "onchain-tokenized-equity" | "offchain-custody-receipt";
    income: "balance-appreciation" | "cash-distribution" | "mixed";
    disclosureUri: string;
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
    publicDrop: YieldBankPublicDrop;
    allowListMerkleRoot: Hex;
    allowedFeeRecipients: readonly Address[];
    allowedPayers: readonly Address[];
    tokenGatedDrops: readonly YieldBankTokenGatedDrop[];
    signedMintValidations: readonly YieldBankSignedMintValidation[];
    creatorPayoutAddress: Address;
    observedPrimaryPlatformFeeBps: number;
    observedSecondaryRoyaltyBps: number;
    observedSecondaryRoyaltyRecipient: Address;
    observedAt: string;
  };
  contracts: Record<
    | "registry" | "factoryDeployer" | "factory" | "collection" | "nft" | "accountImplementation" | "proceedsVault"
    | "distributor" | "revenueRouter" | "operationsReserve" | "timelock"
    | "allocator" | "priceHub" | "strategyRegistry" | "renderer" | "coreSleeve"
    | "marketMakingSleeve" | "usdgSleeve",
    YieldBankManifestEntry
  >;
  dependencies: Record<"WETH" | "USDG" | "seaDrop" | "seaport" | "eligibilityPolicy", YieldBankManifestEntry>
    & Record<string, YieldBankManifestEntry>;
  equityAssets: readonly YieldBankManifestEntry[];
  adapters: Record<string, YieldBankManifestEntry>;
  feeds: Record<string, YieldBankManifestEntry>;
  pools: Record<string, YieldBankManifestEntry>;
  delta: YieldBankDeltaManifestBindings;
  routeBindings: {
    allocations: readonly YieldBankAllocationRouteBinding[];
    rebalances: readonly YieldBankRebalanceRouteBinding[];
  };
  roles: Record<"creator" | "openSeaManager" | "sinjoh" | "operations" | "allocationOperator" | "guardian" | "timelock", Address>;
  auditHashes: readonly Hex[];
}

export interface YieldBankAllocationRouteBinding {
  inputAsset: Address;
  sleeve: Address;
  route: Address;
  runtimeCodeHash: Hex;
}

export interface YieldBankRebalanceRouteBinding {
  inputAsset: Address;
  route: Address;
  runtimeCodeHash: Hex;
}

export interface YieldBankDeltaManifestBindings {
  adapter: Address;
  injoh: Address;
  pool: Address;
  positionBuilder: Address;
  factory: Address;
  positionManager: Address;
  entryRoute: Address;
  exitRoute: Address;
  maximumPositions: number;
  adapterCapBps: number;
}

export interface YieldBankManifestVerification {
  path: string;
  address: Address;
  expectedCodeHash: Hex;
  actualCodeHash: Hex | null;
  ok: boolean;
}

export type YieldBankReadClient = Pick<PublicClient, "readContract" | "getCode" | "getStorageAt">;

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
  positionUsd18: bigint;
}

export interface YieldBankAllocationTarget {
  requester: Address;
  coreWeightBps: number;
  marketMakingWeightBps: number;
  usdgWeightBps: number;
  maximumAdapterLossBps: number;
  revision: bigint;
  executedRevision: bigint;
  requestedAt: number;
  validUntil: number;
  executedAt: number;
  pending: boolean;
}

interface YieldBankAllocationTargetResult {
  requester: Address;
  coreWeightBps: number;
  marketMakingWeightBps: number;
  usdgWeightBps: number;
  maximumAdapterLossBps: number;
  revision: bigint;
  executedRevision: bigint;
  requestedAt: number;
  validUntil: number;
  executedAt: number;
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

export interface YieldBankDeltaRung {
  tickLower: number;
  tickUpper: number;
  amount0: bigint;
  amount1: bigint;
  amount0Minimum: bigint;
  amount1Minimum: bigint;
}

export interface YieldBankDeltaLiquidityAction {
  tokenId: bigint;
  liquidity: bigint;
  amount0Minimum: bigint;
  amount1Minimum: bigint;
}

export interface YieldBankDeltaDepositData {
  wethToConvert: bigint;
  minimumInjohOut: bigint;
  routeData: Hex;
  rungs: readonly YieldBankDeltaRung[];
  minimumCurrentTick: number;
  maximumCurrentTick: number;
  deadline: bigint;
}

export interface YieldBankDeltaWithdrawalData {
  actions: readonly YieldBankDeltaLiquidityAction[];
  injohToConvert: bigint;
  minimumWethOut: bigint;
  wethToReturn: bigint;
  routeData: Hex;
  deadline: bigint;
}

export interface YieldBankDeltaExitData {
  actions: readonly YieldBankDeltaLiquidityAction[];
  deadline: bigint;
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
  allocationTarget: YieldBankAllocationTarget;
  portfolioValueUsd18: bigint;
  currentAllocationBps: readonly [number, number, number];
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
const EIP1967_IMPLEMENTATION_SLOT =
  "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc" as Hex;
const EIP1967_BEACON_SLOT =
  "0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50" as Hex;

export function validateYieldBankManifest(manifest: YieldBankReleaseManifest): void {
  if (manifest.schemaVersion !== "1.0") throw new Error("unsupported Yield Banks manifest schema");
  if (manifest.chainId !== 4663) throw new Error("Yield Banks release manifests require Robinhood mainnet chain 4663");
  for (const [name, hash] of Object.entries({
    collectionId: manifest.collectionId,
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
    economics.secondaryRoyaltyBps,
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
  if (!manifest.equityModel
    || !["onchain-tokenized-equity", "offchain-custody-receipt"].includes(manifest.equityModel.custody)
    || !["balance-appreciation", "cash-distribution", "mixed"].includes(manifest.equityModel.income)) {
    throw new Error("equityModel must explicitly describe custody and income behavior");
  }
  if (manifest.equityModel.custody === "onchain-tokenized-equity"
    && manifest.equityModel.income !== "balance-appreciation") {
    throw new Error("Robinhood Stock Token income must use the multiplier-aware balance-appreciation model");
  }
  try {
    const disclosure = new URL(manifest.equityModel.disclosureUri);
    if (disclosure.protocol !== "https:") throw new Error();
  } catch {
    throw new Error("equityModel.disclosureUri must be an HTTPS URL");
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
  validatePublicDrop(manifest.openSea.publicDrop, manifest.openSea.allowedFeeRecipients);
  validateBytes32("openSea.allowListMerkleRoot", manifest.openSea.allowListMerkleRoot);
  if (manifest.openSea.allowListMerkleRoot !== `0x${"0".repeat(64)}`) {
    throw new Error("YieldBankNFT requires an empty SeaDrop allowlist root");
  }
  canonicalUniqueAddresses("openSea.allowedPayers", manifest.openSea.allowedPayers);
  validateTokenGatedDrops(manifest.openSea.tokenGatedDrops,
    manifest.openSea.allowedFeeRecipients);
  validateSignedMintValidations(manifest.openSea.signedMintValidations);
  if (yieldBankMintStagesHash(
    manifest.openSea.publicDrop,
    manifest.openSea.allowedFeeRecipients,
    manifest.openSea.allowListMerkleRoot,
    manifest.openSea.allowedPayers,
    manifest.openSea.tokenGatedDrops,
    manifest.openSea.signedMintValidations,
  ).toLowerCase() !== manifest.openSea.mintStagesHash.toLowerCase()) {
    throw new Error("openSea.mintStagesHash does not bind every recorded SeaDrop mint path");
  }
  if (getAddress(manifest.openSea.creatorPayoutAddress)
      !== getAddress(manifest.contracts.proceedsVault.address)) {
    throw new Error("openSea.creatorPayoutAddress must equal contracts.proceedsVault.address");
  }
  if (!Number.isInteger(manifest.openSea.observedPrimaryPlatformFeeBps)
      || manifest.openSea.observedPrimaryPlatformFeeBps < 0
      || manifest.openSea.observedPrimaryPlatformFeeBps > 10_000) {
    throw new Error("openSea.observedPrimaryPlatformFeeBps must be in 0..10000");
  }
  if (manifest.openSea.observedPrimaryPlatformFeeBps !== manifest.openSea.publicDrop.feeBps) {
    throw new Error("openSea observed primary fee must match the onchain public drop fee");
  }
  if (manifest.openSea.observedSecondaryRoyaltyBps !== manifest.economics.secondaryRoyaltyBps) {
    throw new Error("openSea.observedSecondaryRoyaltyBps must equal economics.secondaryRoyaltyBps");
  }
  if (getAddress(manifest.openSea.observedSecondaryRoyaltyRecipient)
      !== getAddress(manifest.contracts.revenueRouter.address)) {
    throw new Error("openSea.observedSecondaryRoyaltyRecipient must equal contracts.revenueRouter.address");
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
  validateEntry("dependencies.eligibilityPolicy", manifest.dependencies.eligibilityPolicy);
  validateImplementationBinding("dependencies.USDG", manifest.dependencies.USDG, true);
  if (manifest.dependencies.USDG.implementationBinding?.kind !== "eip1967") {
    throw new Error("dependencies.USDG must bind its active EIP-1967 implementation");
  }
  if (manifest.equityAssets.length < 1) throw new Error("at least one reviewed equity asset is required");
  manifest.equityAssets.forEach((entry, index) => {
    validateEntry(`equityAssets.${index}`, entry);
    validateImplementationBinding(`equityAssets.${index}`, entry, true);
    if (manifest.equityModel.custody === "onchain-tokenized-equity"
      && entry.implementationBinding?.kind !== "beacon") {
      throw new Error(`equityAssets.${index} must bind its Stock Token beacon implementation`);
    }
  });
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
  const delta = manifest.delta;
  if (!delta || !Number.isInteger(delta.maximumPositions) || delta.maximumPositions < 1
    || delta.maximumPositions > 64 || !Number.isInteger(delta.adapterCapBps)
    || delta.adapterCapBps < 1
    || delta.adapterCapBps > manifest.policyCaps.marketMaking.maximumAdapterCapBps
    || manifest.policyCaps.marketMaking.maximumStrategies < 1) {
    throw new Error("Delta policy bindings are invalid");
  }
  const containsAddress = (entries: Record<string, YieldBankManifestEntry>, address: Address) =>
    Object.values(entries).some((entry) => getAddress(entry.address) === getAddress(address));
  for (const [field, entries] of [
    ["adapter", manifest.adapters], ["entryRoute", manifest.adapters],
    ["exitRoute", manifest.adapters], ["pool", manifest.pools],
    ["injoh", manifest.dependencies], ["positionBuilder", manifest.dependencies],
    ["factory", manifest.dependencies], ["positionManager", manifest.dependencies],
  ] as const) {
    if (!containsAddress(entries, delta[field])) {
      throw new Error(`delta.${field} is not bound to its manifest group`);
    }
  }
  if (getAddress(delta.injoh) === getAddress(manifest.dependencies.WETH.address)) {
    throw new Error("delta.injoh must differ from WETH");
  }
  if (!manifest.routeBindings || !Array.isArray(manifest.routeBindings.allocations)
    || !Array.isArray(manifest.routeBindings.rebalances)) {
    throw new Error("routeBindings are required");
  }
  const routeEntries = [
    ...Object.values(manifest.dependencies), ...manifest.equityAssets,
    ...Object.values(manifest.adapters), ...Object.values(manifest.pools),
  ];
  const routeEntry = (address: Address) => routeEntries.find((entry) =>
    getAddress(entry.address) === getAddress(address));
  const allocationKeys = new Set<string>();
  for (const [index, binding] of manifest.routeBindings.allocations.entries()) {
    getAddress(binding.inputAsset);
    getAddress(binding.sleeve);
    getAddress(binding.route);
    validateBytes32(`routeBindings.allocations.${index}.runtimeCodeHash`, binding.runtimeCodeHash);
    const key = `${getAddress(binding.inputAsset)}:${getAddress(binding.sleeve)}`;
    if (allocationKeys.has(key)) throw new Error(`duplicate allocation route ${key}`);
    allocationKeys.add(key);
    const entry = routeEntry(binding.route);
    if (!entry || entry.runtimeCodeHash.toLowerCase() !== binding.runtimeCodeHash.toLowerCase()) {
      throw new Error(`allocation route ${binding.route} is not a matching manifest dependency`);
    }
  }
  for (const sleeve of [manifest.contracts.coreSleeve.address, manifest.contracts.usdgSleeve.address]) {
    const key = `${getAddress(manifest.dependencies.WETH.address)}:${getAddress(sleeve)}`;
    if (!allocationKeys.has(key)) throw new Error(`missing WETH allocation route for ${sleeve}`);
  }
  const rebalanceKeys = new Set<string>();
  for (const [index, binding] of manifest.routeBindings.rebalances.entries()) {
    getAddress(binding.inputAsset);
    getAddress(binding.route);
    validateBytes32(`routeBindings.rebalances.${index}.runtimeCodeHash`, binding.runtimeCodeHash);
    const key = getAddress(binding.inputAsset);
    if (rebalanceKeys.has(key)) throw new Error(`duplicate rebalance route ${key}`);
    rebalanceKeys.add(key);
    const entry = routeEntry(binding.route);
    if (!entry || entry.runtimeCodeHash.toLowerCase() !== binding.runtimeCodeHash.toLowerCase()) {
      throw new Error(`rebalance route ${binding.route} is not a matching manifest dependency`);
    }
  }
  for (const asset of [manifest.dependencies.USDG.address, delta.injoh,
    ...manifest.equityAssets.map((entry) => entry.address)]) {
    if (!rebalanceKeys.has(getAddress(asset))) {
      throw new Error(`missing WETH rebalance route for ${asset}`);
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
  manifest.equityAssets.forEach((entry, index) => entries.push([`equityAssets.${index}`, entry]));
  const codeResults = await Promise.all(entries.map(async ([path, entry]) => {
    const code = await client.getCode({ address: entry.address });
    const actualCodeHash = code && code !== "0x" ? keccak256(code) : null;
    return {
      path, address: entry.address, expectedCodeHash: entry.runtimeCodeHash, actualCodeHash,
      ok: actualCodeHash?.toLowerCase() === entry.runtimeCodeHash.toLowerCase(),
    };
  }));
  const implementationResults = (await Promise.all(entries.map(([path, entry]) =>
    verifyImplementationBinding(client, path, entry)))).flat();
  const factory = manifest.contracts.factory.address;
  const [factoryVersion, collectionCreationCodeHash, systemPlanHash, collectionRecord,
    collectionId, collectionMaxSupply, collectionNft, collectionDistributor,
    collectionProceedsVault, collectionPortfolioAllocator, collectionAccountImplementation,
    collectionSecondaryRoyaltyBps, collectionEligibilityPolicy, collectionCreator,
    collectionOpenSeaManager, collectionSinjohFeeRecipient, collectionOperationsReserve,
    collectionRevenueRouter, collectionTimelock, collectionGuardian,
    nftMaxSupply, nftCollection, nftSeaDrop, royaltyReceiver,
    royaltyBps, nftOwner, seaDropCreatorPayout, seaDropPublicDrop, seaDropAllowListMerkleRoot,
    seaDropAllowedFeeRecipients, seaDropAllowedPayers, seaDropSigners,
    seaDropTokenGatedTokens] = await Promise.all([
    read<Hex>(client, factory, yieldBankSystemFactoryAbi, "factoryVersion"),
    read<Hex>(client, factory, yieldBankSystemFactoryAbi, "collectionCreationCodeHash"),
    read<Hex>(client, factory, yieldBankSystemFactoryAbi, "systemPlanHash"),
    read<readonly [Address, Hex, Hex, Hex, bigint, boolean]>(
      client, manifest.contracts.registry.address, yieldBankProtocolRegistryAbi,
      "collections", [manifest.contracts.collection.address],
    ),
    read<Hex>(client, manifest.contracts.collection.address, yieldBankCollectionAbi, "collectionId"),
    read<bigint>(client, manifest.contracts.collection.address, yieldBankCollectionAbi, "maxSupply"),
    read<Address>(client, manifest.contracts.collection.address, yieldBankCollectionAbi, "nft"),
    read<Address>(client, manifest.contracts.collection.address, yieldBankCollectionAbi, "distributor"),
    read<Address>(client, manifest.contracts.collection.address, yieldBankCollectionAbi, "proceedsVault"),
    read<Address>(client, manifest.contracts.collection.address, yieldBankCollectionAbi, "portfolioAllocator"),
    read<Address>(client, manifest.contracts.collection.address, yieldBankCollectionAbi, "accountImplementation"),
    read<bigint>(client, manifest.contracts.collection.address, yieldBankCollectionAbi, "secondaryRoyaltyBps"),
    read<Address>(client, manifest.contracts.collection.address, yieldBankCollectionAbi, "eligibilityPolicy"),
    read<Address>(client, manifest.contracts.collection.address, yieldBankCollectionAbi, "creator"),
    read<Address>(client, manifest.contracts.collection.address, yieldBankCollectionAbi, "openSeaManager"),
    read<Address>(client, manifest.contracts.collection.address, yieldBankCollectionAbi, "sinjohFeeRecipient"),
    read<Address>(client, manifest.contracts.collection.address, yieldBankCollectionAbi, "operationsReserve"),
    read<Address>(client, manifest.contracts.collection.address, yieldBankCollectionAbi, "revenueRouter"),
    read<Address>(client, manifest.contracts.collection.address, yieldBankCollectionAbi, "collectionTimelock"),
    read<Address>(client, manifest.contracts.collection.address, yieldBankCollectionAbi, "guardian"),
    read<bigint>(client, manifest.contracts.nft.address, yieldBankNftAbi, "maxSupply"),
    read<Address>(client, manifest.contracts.nft.address, yieldBankNftAbi, "collection"),
    read<Address>(client, manifest.contracts.nft.address, yieldBankNftAbi, "seaDrop"),
    read<Address>(client, manifest.contracts.nft.address, yieldBankNftAbi, "royaltyReceiver"),
    read<bigint>(client, manifest.contracts.nft.address, yieldBankNftAbi, "royaltyBps"),
    read<Address>(client, manifest.contracts.nft.address, yieldBankNftAbi, "owner"),
    read<Address>(client, manifest.dependencies.seaDrop.address, yieldBankSeaDropReadAbi,
      "getCreatorPayoutAddress", [manifest.contracts.nft.address]),
    read<{
      mintPrice: bigint; startTime: bigint; endTime: bigint;
      maxTotalMintableByWallet: bigint; feeBps: bigint; restrictFeeRecipients: boolean;
    }>(client, manifest.dependencies.seaDrop.address, yieldBankSeaDropReadAbi,
      "getPublicDrop", [manifest.contracts.nft.address]),
    read<Hex>(client, manifest.dependencies.seaDrop.address, yieldBankSeaDropReadAbi,
      "getAllowListMerkleRoot", [manifest.contracts.nft.address]),
    read<readonly Address[]>(client, manifest.dependencies.seaDrop.address, yieldBankSeaDropReadAbi,
      "getAllowedFeeRecipients", [manifest.contracts.nft.address]),
    read<readonly Address[]>(client, manifest.dependencies.seaDrop.address, yieldBankSeaDropReadAbi,
      "getPayers", [manifest.contracts.nft.address]),
    read<readonly Address[]>(client, manifest.dependencies.seaDrop.address, yieldBankSeaDropReadAbi,
      "getSigners", [manifest.contracts.nft.address]),
    read<readonly Address[]>(client, manifest.dependencies.seaDrop.address, yieldBankSeaDropReadAbi,
      "getTokenGatedAllowedTokens", [manifest.contracts.nft.address]),
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
  const sleevePolicies = [
    ["core", manifest.contracts.coreSleeve.address],
    ["marketMaking", manifest.contracts.marketMakingSleeve.address],
    ["usdg", manifest.contracts.usdgSleeve.address],
  ] as const;
  const onchainSleevePolicies = await Promise.all(sleevePolicies.map(async ([key, sleeve]) => ({
    key,
    sleeve,
    maximumStrategies: await read<number>(client, sleeve, yieldBankSleeveAbi, "maximumStrategies"),
    maximumAdapterCapBps: await read<number>(client, sleeve, yieldBankSleeveAbi, "maximumAdapterCapBps"),
    maximumOperatorLossBps: await read<number>(client, sleeve, yieldBankSleeveAbi, "maximumOperatorLossBps"),
    eligibilityPolicy: await read<Address>(client, sleeve, yieldBankSleeveAbi, "eligibilityPolicy"),
  })));
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
  const valueResult = (path: string, address: Address, expected: Hex, actual: Hex) => ({
    path, address, expectedCodeHash: expected, actualCodeHash: actual,
    ok: expected.toLowerCase() === actual.toLowerCase(),
  });
  const addressWord = (address: Address) => toHex(BigInt(getAddress(address)), { size: 32 });
  const topologyResults = [
    valueResult("collection.collectionId", manifest.contracts.collection.address,
      manifest.collectionId, collectionId),
    valueResult("collection.maxSupply", manifest.contracts.collection.address,
      toHex(manifest.economics.maxSupply, { size: 32 }), toHex(collectionMaxSupply, { size: 32 })),
    valueResult("collection.secondaryRoyaltyBps", manifest.contracts.collection.address,
      toHex(manifest.economics.secondaryRoyaltyBps, { size: 32 }), toHex(collectionSecondaryRoyaltyBps, { size: 32 })),
    valueResult("collection.nft", manifest.contracts.collection.address,
      addressWord(manifest.contracts.nft.address), addressWord(collectionNft)),
    valueResult("collection.distributor", manifest.contracts.collection.address,
      addressWord(manifest.contracts.distributor.address), addressWord(collectionDistributor)),
    valueResult("collection.proceedsVault", manifest.contracts.collection.address,
      addressWord(manifest.contracts.proceedsVault.address), addressWord(collectionProceedsVault)),
    valueResult("collection.portfolioAllocator", manifest.contracts.collection.address,
      addressWord(manifest.contracts.allocator.address), addressWord(collectionPortfolioAllocator)),
    valueResult("collection.accountImplementation", manifest.contracts.collection.address,
      addressWord(manifest.contracts.accountImplementation.address), addressWord(collectionAccountImplementation)),
    valueResult("collection.eligibilityPolicy", manifest.contracts.collection.address,
      addressWord(manifest.dependencies.eligibilityPolicy.address), addressWord(collectionEligibilityPolicy)),
    valueResult("collection.creator", manifest.contracts.collection.address,
      addressWord(manifest.roles.creator), addressWord(collectionCreator)),
    valueResult("collection.openSeaManager", manifest.contracts.collection.address,
      addressWord(manifest.roles.openSeaManager), addressWord(collectionOpenSeaManager)),
    valueResult("collection.sinjohFeeRecipient", manifest.contracts.collection.address,
      addressWord(manifest.roles.sinjoh), addressWord(collectionSinjohFeeRecipient)),
    valueResult("collection.operationsReserve", manifest.contracts.collection.address,
      addressWord(manifest.roles.operations), addressWord(collectionOperationsReserve)),
    valueResult("collection.revenueRouter", manifest.contracts.collection.address,
      addressWord(manifest.contracts.revenueRouter.address), addressWord(collectionRevenueRouter)),
    valueResult("collection.collectionTimelock", manifest.contracts.collection.address,
      addressWord(manifest.roles.timelock), addressWord(collectionTimelock)),
    valueResult("collection.guardian", manifest.contracts.collection.address,
      addressWord(manifest.roles.guardian), addressWord(collectionGuardian)),
    valueResult("nft.maxSupply", manifest.contracts.nft.address,
      toHex(manifest.economics.maxSupply, { size: 32 }), toHex(nftMaxSupply, { size: 32 })),
    valueResult("nft.collection", manifest.contracts.nft.address,
      addressWord(manifest.contracts.collection.address), addressWord(nftCollection)),
    valueResult("nft.seaDrop", manifest.contracts.nft.address,
      addressWord(manifest.dependencies.seaDrop.address), addressWord(nftSeaDrop)),
    valueResult("nft.royaltyReceiver", manifest.contracts.nft.address,
      addressWord(manifest.contracts.revenueRouter.address), addressWord(royaltyReceiver)),
    valueResult("nft.royaltyBps", manifest.contracts.nft.address,
      toHex(manifest.economics.secondaryRoyaltyBps, { size: 32 }), toHex(royaltyBps, { size: 32 })),
    valueResult("nft.owner", manifest.contracts.nft.address,
      addressWord(manifest.roles.timelock), addressWord(nftOwner)),
    valueResult("seaDrop.creatorPayoutAddress", manifest.dependencies.seaDrop.address,
      addressWord(manifest.contracts.proceedsVault.address), addressWord(seaDropCreatorPayout)),
    valueResult("registry.factory", manifest.contracts.registry.address,
      addressWord(manifest.contracts.factory.address), addressWord(collectionRecord[0])),
    valueResult("registry.factoryVersion", manifest.contracts.registry.address,
      manifest.factoryVersion, collectionRecord[1]),
    valueResult("registry.runtimeCodeHash", manifest.contracts.registry.address,
      manifest.contracts.collection.runtimeCodeHash, collectionRecord[3]),
    valueResult("registry.registered", manifest.contracts.registry.address,
      toHex(1, { size: 32 }), toHex(collectionRecord[5] ? 1 : 0, { size: 32 })),
  ];
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
  const sleevePolicyResults = onchainSleevePolicies.flatMap((actual) => {
    const expected = manifest.policyCaps[actual.key];
    const results = (["maximumStrategies", "maximumAdapterCapBps", "maximumOperatorLossBps"] as const)
      .map((field) => valueResult(
        `policyCaps.${actual.key}.${field}`,
        actual.sleeve,
        toHex(expected[field], { size: 32 }),
        toHex(actual[field], { size: 32 }),
      ));
    results.push(valueResult(
      `policyCaps.${actual.key}.eligibilityPolicy`, actual.sleeve,
      addressWord(manifest.dependencies.eligibilityPolicy.address),
      addressWord(actual.eligibilityPolicy),
    ));
    return results;
  });
  const recordedRecipients = canonicalAddresses(manifest.openSea.allowedFeeRecipients);
  const actualRecipients = canonicalAddresses(seaDropAllowedFeeRecipients);
  const recordedPayers = canonicalAddresses(manifest.openSea.allowedPayers);
  const actualPayers = canonicalAddresses(seaDropAllowedPayers);
  const recordedSigners = canonicalAddresses(
    manifest.openSea.signedMintValidations.map((params) => params.signer),
  );
  const actualSigners = canonicalAddresses(seaDropSigners);
  const recordedTokenGatedTokens = canonicalAddresses(
    manifest.openSea.tokenGatedDrops.map((stage) => stage.allowedNftToken),
  );
  const actualTokenGatedTokens = canonicalAddresses(seaDropTokenGatedTokens);
  const [actualTokenGatedDrops, actualSignedMintValidations] = await Promise.all([
    Promise.all(recordedTokenGatedTokens.map((token) => read<{
      mintPrice: bigint; maxTotalMintableByWallet: bigint; startTime: bigint; endTime: bigint;
      dropStageIndex: bigint; maxTokenSupplyForStage: bigint; feeBps: bigint;
      restrictFeeRecipients: boolean;
    }>(client, manifest.dependencies.seaDrop.address, yieldBankSeaDropReadAbi,
      "getTokenGatedDrop", [manifest.contracts.nft.address, token]))),
    Promise.all(recordedSigners.map((signer) => read<{
      minMintPrice: bigint; maxMaxTotalMintableByWallet: bigint; minStartTime: bigint;
      maxEndTime: bigint; maxMaxTokenSupplyForStage: bigint; minFeeBps: bigint; maxFeeBps: bigint;
    }>(client, manifest.dependencies.seaDrop.address, yieldBankSeaDropReadAbi,
      "getSignedMintValidationParams", [manifest.contracts.nft.address, signer]))),
  ]);
  const seaDropResults = [
    valueResult("seaDrop.publicDrop.mintPrice", manifest.dependencies.seaDrop.address,
      toHex(BigInt(manifest.openSea.publicDrop.mintPrice), { size: 32 }),
      toHex(seaDropPublicDrop.mintPrice, { size: 32 })),
    ...(["startTime", "endTime", "maxTotalMintableByWallet", "feeBps"] as const).map(
      (field) => valueResult(`seaDrop.publicDrop.${field}`, manifest.dependencies.seaDrop.address,
        toHex(manifest.openSea.publicDrop[field], { size: 32 }),
        toHex(seaDropPublicDrop[field], { size: 32 })),
    ),
    valueResult("seaDrop.publicDrop.restrictFeeRecipients", manifest.dependencies.seaDrop.address,
      toHex(manifest.openSea.publicDrop.restrictFeeRecipients ? 1 : 0, { size: 32 }),
      toHex(seaDropPublicDrop.restrictFeeRecipients ? 1 : 0, { size: 32 })),
    valueResult("seaDrop.allowListMerkleRoot", manifest.dependencies.seaDrop.address,
      manifest.openSea.allowListMerkleRoot, seaDropAllowListMerkleRoot),
    valueResult("seaDrop.allowedFeeRecipients", manifest.dependencies.seaDrop.address,
      keccak256(stringToHex(recordedRecipients.join(","))),
      keccak256(stringToHex(actualRecipients.join(",")))),
    valueResult("seaDrop.allowedPayers", manifest.dependencies.seaDrop.address,
      keccak256(stringToHex(recordedPayers.join(","))),
      keccak256(stringToHex(actualPayers.join(",")))),
    valueResult("seaDrop.signers", manifest.dependencies.seaDrop.address,
      keccak256(stringToHex(recordedSigners.join(","))),
      keccak256(stringToHex(actualSigners.join(",")))),
    valueResult("seaDrop.tokenGatedTokens", manifest.dependencies.seaDrop.address,
      keccak256(stringToHex(recordedTokenGatedTokens.join(","))),
      keccak256(stringToHex(actualTokenGatedTokens.join(",")))),
  ];
  const canonicalTokenGatedDrops = validateTokenGatedDrops(
    manifest.openSea.tokenGatedDrops, manifest.openSea.allowedFeeRecipients,
  );
  for (let index = 0; index < canonicalTokenGatedDrops.length; index += 1) {
    const expected = canonicalTokenGatedDrops[index]!;
    const actual = actualTokenGatedDrops[index]!;
    seaDropResults.push(
      valueResult(`seaDrop.tokenGatedDrops.${index}.mintPrice`, manifest.dependencies.seaDrop.address,
        toHex(BigInt(expected.mintPrice), { size: 32 }), toHex(actual.mintPrice, { size: 32 })),
      ...(["maxTotalMintableByWallet", "startTime", "endTime", "dropStageIndex",
        "maxTokenSupplyForStage", "feeBps"] as const).map((field) => valueResult(
        `seaDrop.tokenGatedDrops.${index}.${field}`, manifest.dependencies.seaDrop.address,
        toHex(expected[field], { size: 32 }), toHex(actual[field], { size: 32 }),
      )),
      valueResult(`seaDrop.tokenGatedDrops.${index}.restrictFeeRecipients`,
        manifest.dependencies.seaDrop.address,
        toHex(expected.restrictFeeRecipients ? 1 : 0, { size: 32 }),
        toHex(actual.restrictFeeRecipients ? 1 : 0, { size: 32 })),
    );
  }
  const canonicalSignedMintValidations = validateSignedMintValidations(
    manifest.openSea.signedMintValidations,
  );
  for (let index = 0; index < canonicalSignedMintValidations.length; index += 1) {
    const expected = canonicalSignedMintValidations[index]!;
    const actual = actualSignedMintValidations[index]!;
    seaDropResults.push(
      valueResult(`seaDrop.signedMintValidations.${index}.minMintPrice`,
        manifest.dependencies.seaDrop.address,
        toHex(BigInt(expected.minMintPrice), { size: 32 }),
        toHex(actual.minMintPrice, { size: 32 })),
      ...(["maxMaxTotalMintableByWallet", "minStartTime", "maxEndTime",
        "maxMaxTokenSupplyForStage", "minFeeBps", "maxFeeBps"] as const).map(
        (field) => valueResult(`seaDrop.signedMintValidations.${index}.${field}`,
          manifest.dependencies.seaDrop.address, toHex(expected[field], { size: 32 }),
          toHex(actual[field], { size: 32 })),
      ),
    );
  }
  const deltaBindings = [
    ["sleeve", manifest.contracts.marketMakingSleeve.address],
    ["accountingAsset", manifest.dependencies.WETH.address],
    ["injoh", manifest.delta.injoh],
    ["priceHub", manifest.contracts.priceHub.address],
    ["pool", manifest.delta.pool],
    ["factory", manifest.delta.factory],
    ["positionManager", manifest.delta.positionManager],
    ["positionBuilder", manifest.delta.positionBuilder],
    ["entryRoute", manifest.delta.entryRoute],
    ["exitRoute", manifest.delta.exitRoute],
  ] as const;
  const [deltaActualAddresses, maximumPositions, strategyRecord, adapterState, adapterCapBps] =
    await Promise.all([
      Promise.all(deltaBindings.map(([functionName]) => read<Address>(
        client, manifest.delta.adapter, yieldBankDeltaAdapterAbi, functionName,
      ))),
      read<bigint>(client, manifest.delta.adapter, yieldBankDeltaAdapterAbi, "maximumPositions"),
      read<readonly [Address, Hex, Hex, Address, bigint, bigint]>(
        client, manifest.contracts.strategyRegistry.address, yieldBankStrategyRegistryAbi,
        "recordOf", [manifest.delta.adapter],
      ),
      read<bigint>(client, manifest.contracts.marketMakingSleeve.address, yieldBankSleeveAbi,
        "adapterState", [manifest.delta.adapter]),
      read<bigint>(client, manifest.contracts.marketMakingSleeve.address, yieldBankSleeveAbi,
        "adapterCapBps", [manifest.delta.adapter]),
    ]);
  const deltaResults = deltaBindings.map(([field, expected], index) => valueResult(
    `delta.${field}`, manifest.delta.adapter, addressWord(expected),
    addressWord(deltaActualAddresses[index]!),
  ));
  deltaResults.push(valueResult(
    "delta.maximumPositions", manifest.delta.adapter,
    toHex(manifest.delta.maximumPositions, { size: 32 }), toHex(maximumPositions, { size: 32 }),
  ));
  const strategyExpected = [
    addressWord(manifest.delta.adapter),
    Object.values(manifest.adapters).find((entry) =>
      getAddress(entry.address) === getAddress(manifest.delta.adapter))!.runtimeCodeHash,
    keccak256(stringToHex("YIELD_BANK_MARKET_MAKING")),
    addressWord(manifest.dependencies.WETH.address),
    toHex(1, { size: 32 }),
  ];
  const strategyActual = [
    addressWord(strategyRecord[0]), strategyRecord[1], strategyRecord[2],
    addressWord(strategyRecord[3]), toHex(strategyRecord[4], { size: 32 }),
  ];
  ["implementation", "runtimeCodeHash", "sleeveCategory", "accountingAsset", "state"]
    .forEach((field, index) => deltaResults.push(valueResult(
      `strategyRegistry.${field}`, manifest.contracts.strategyRegistry.address,
      strategyExpected[index]!, strategyActual[index]!,
    )));
  deltaResults.push(valueResult(
    "marketMakingSleeve.adapterState", manifest.contracts.marketMakingSleeve.address,
    toHex(3, { size: 32 }), toHex(adapterState, { size: 32 }),
  ));
  deltaResults.push(valueResult(
    "marketMakingSleeve.adapterCapBps", manifest.contracts.marketMakingSleeve.address,
    toHex(manifest.delta.adapterCapBps, { size: 32 }), toHex(adapterCapBps, { size: 32 }),
  ));
  const allocationRouteResults = (await Promise.all(
    manifest.routeBindings.allocations.map(async (binding) => ({
      binding,
      actual: await read<readonly [Address, Hex]>(
        client, manifest.contracts.allocator.address, yieldBankAllocatorAbi,
        "routeBinding", [binding.inputAsset, binding.sleeve],
      ),
    })),
  )).flatMap(({ binding, actual }) => [
    valueResult(
      `allocator.routeBinding.${binding.inputAsset}.${binding.sleeve}.route`,
      manifest.contracts.allocator.address, addressWord(binding.route), addressWord(actual[0]),
    ),
    valueResult(
      `allocator.routeBinding.${binding.inputAsset}.${binding.sleeve}.runtimeCodeHash`,
      manifest.contracts.allocator.address, binding.runtimeCodeHash, actual[1],
    ),
  ]);
  const rebalanceRouteResults = (await Promise.all(
    manifest.routeBindings.rebalances.map(async (binding) => ({
      binding,
      actual: await read<readonly [Address, Hex]>(
        client, manifest.contracts.allocator.address, yieldBankAllocatorAbi,
        "rebalanceRoute", [binding.inputAsset],
      ),
    })),
  )).flatMap(({ binding, actual }) => [
    valueResult(
      `allocator.rebalanceRoute.${binding.inputAsset}.route`,
      manifest.contracts.allocator.address, addressWord(binding.route), addressWord(actual[0]),
    ),
    valueResult(
      `allocator.rebalanceRoute.${binding.inputAsset}.runtimeCodeHash`,
      manifest.contracts.allocator.address, binding.runtimeCodeHash, actual[1],
    ),
  ]);
  return codeResults.concat(
    implementationResults,
    commitmentResults, topologyResults, economicsResults, royaltyEconomicsResults,
    sleevePolicyResults, seaDropResults, deltaResults,
    allocationRouteResults, rebalanceRouteResults,
  );
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
  const [collectionState, tokenState, liveSupply, mintedSupply, maxSupply, account, owner, tokenUri,
    pendingBacking, primaryState, rawAllocationTarget] = await Promise.all([
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
    read<YieldBankAllocationTargetResult>(
      client, manifest.contracts.allocator.address, yieldBankAllocatorAbi,
      "allocationTargetOf", [tokenId],
    ),
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
      positionUsd18: totalSupply === 0n ? 0n : totalAssetsUsd18 * entitlement / totalSupply,
      solvent,
    };
  }));
  const portfolioValueUsd18 = sleeves.reduce((total, sleeve) => total + sleeve.positionUsd18, 0n);
  const currentAllocationBps = allocationBpsFromValues(
    sleeves.map((sleeve) => sleeve.positionUsd18) as [bigint, bigint, bigint],
  );
  const allocationTarget: YieldBankAllocationTarget = {
    requester: rawAllocationTarget.requester,
    coreWeightBps: Number(rawAllocationTarget.coreWeightBps),
    marketMakingWeightBps: Number(rawAllocationTarget.marketMakingWeightBps),
    usdgWeightBps: Number(rawAllocationTarget.usdgWeightBps),
    maximumAdapterLossBps: Number(rawAllocationTarget.maximumAdapterLossBps),
    revision: rawAllocationTarget.revision,
    executedRevision: rawAllocationTarget.executedRevision,
    requestedAt: Number(rawAllocationTarget.requestedAt),
    validUntil: Number(rawAllocationTarget.validUntil),
    executedAt: Number(rawAllocationTarget.executedAt),
    pending: rawAllocationTarget.revision > rawAllocationTarget.executedRevision,
  };
  return {
    collection, nft, distributor, account, tokenId, owner,
    collectionState: Number(collectionState), tokenState: Number(tokenState), liveSupply, mintedSupply,
    maxSupply, proceedsVault, pendingBacking, primaryState: Number(primaryState), tokenUri,
    sleeves: sleeves.map(({ solvent: _solvent, ...sleeve }) => sleeve),
    allocationTarget, portfolioValueUsd18, currentAllocationBps,
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

/** Canonical commitment to every enumerable SeaDrop mint path and authorization set. */
export function yieldBankMintStagesHash(
  publicDrop: YieldBankPublicDrop,
  allowedFeeRecipients: readonly Address[],
  allowListMerkleRoot: Hex = `0x${"0".repeat(64)}`,
  allowedPayers: readonly Address[] = [],
  tokenGatedDrops: readonly YieldBankTokenGatedDrop[] = [],
  signedMintValidations: readonly YieldBankSignedMintValidation[] = [],
): Hex {
  validatePublicDrop(publicDrop, allowedFeeRecipients);
  validateBytes32("allowListMerkleRoot", allowListMerkleRoot);
  const canonicalPayers = canonicalUniqueAddresses("allowedPayers", allowedPayers);
  const canonicalTokenGatedDrops = validateTokenGatedDrops(tokenGatedDrops, allowedFeeRecipients);
  const canonicalSignedMintValidations = validateSignedMintValidations(signedMintValidations);
  return keccak256(encodeAbiParameters(
    [
      { type: "tuple", components: [
        { name: "mintPrice", type: "uint80" }, { name: "startTime", type: "uint48" },
        { name: "endTime", type: "uint48" },
        { name: "maxTotalMintableByWallet", type: "uint16" },
        { name: "feeBps", type: "uint16" },
        { name: "restrictFeeRecipients", type: "bool" },
      ] },
      { type: "bytes32" }, { type: "address[]" }, { type: "address[]" },
      { type: "tuple[]", components: [
        { name: "allowedNftToken", type: "address" }, { name: "mintPrice", type: "uint80" },
        { name: "maxTotalMintableByWallet", type: "uint16" },
        { name: "startTime", type: "uint48" }, { name: "endTime", type: "uint48" },
        { name: "dropStageIndex", type: "uint8" },
        { name: "maxTokenSupplyForStage", type: "uint32" },
        { name: "feeBps", type: "uint16" },
        { name: "restrictFeeRecipients", type: "bool" },
      ] },
      { type: "tuple[]", components: [
        { name: "signer", type: "address" }, { name: "minMintPrice", type: "uint80" },
        { name: "maxMaxTotalMintableByWallet", type: "uint24" },
        { name: "minStartTime", type: "uint40" }, { name: "maxEndTime", type: "uint40" },
        { name: "maxMaxTokenSupplyForStage", type: "uint40" },
        { name: "minFeeBps", type: "uint16" }, { name: "maxFeeBps", type: "uint16" },
      ] },
    ],
    [
      { ...publicDrop, mintPrice: BigInt(publicDrop.mintPrice) },
      allowListMerkleRoot,
      canonicalAddresses(allowedFeeRecipients),
      canonicalPayers,
      canonicalTokenGatedDrops.map((stage) => ({
        ...stage, mintPrice: BigInt(stage.mintPrice),
      })),
      canonicalSignedMintValidations.map((params) => ({
        ...params, minMintPrice: BigInt(params.minMintPrice),
      })),
    ],
  ));
}

export interface YieldBankAllocationCall { minimumOutput: bigint; minimumShares: bigint; routeData: Hex; sleeveData: Hex }

export interface YieldBankAdapterRedemptionCall {
  adapter: Address;
  maxLossBps: number;
  data: Hex;
}

export interface YieldBankSleeveRedemptionCall {
  minimumOutputs: readonly bigint[];
  adapterCalls: readonly YieldBankAdapterRedemptionCall[];
}

export interface YieldBankRebalanceConversionCall {
  asset: Address;
  minimumWethOut: bigint;
  routeData: Hex;
}

export interface YieldBankRebalanceExecution {
  redemptions: readonly [
    YieldBankSleeveRedemptionCall,
    YieldBankSleeveRedemptionCall,
    YieldBankSleeveRedemptionCall,
  ];
  conversions: readonly YieldBankRebalanceConversionCall[];
  allocations: readonly [YieldBankAllocationCall, YieldBankAllocationCall, YieldBankAllocationCall];
  minimumWethRecovered: bigint;
  deadline: bigint;
}

/** Encodes the paid public stage that OpenSea Studio submits through the NFT contract. */
export function prepareYieldBankSeaDropPublicDrop(
  nft: Address,
  seaDrop: Address,
  publicDrop: YieldBankSeaDropPublicDropConfig,
) {
  validateSeaDropPublicDropConfig(publicDrop);
  return {
    to: getAddress(nft),
    data: encodeFunctionData({
      abi: yieldBankNftAbi,
      functionName: "updatePublicDrop",
      args: [getAddress(seaDrop), publicDrop],
    }),
    value: 0n,
  } as const;
}

/** YieldBankNFT intentionally permits only clearing SeaDrop's opaque-price allowlist path. */
export function prepareYieldBankSeaDropAllowListClear(nft: Address, seaDrop: Address) {
  return {
    to: getAddress(nft),
    data: encodeFunctionData({
      abi: yieldBankNftAbi,
      functionName: "updateAllowList",
      args: [getAddress(seaDrop), {
        merkleRoot: `0x${"0".repeat(64)}` as Hex,
        publicKeyURIs: [],
        allowListURI: "",
      }],
    }),
    value: 0n,
  } as const;
}

export function prepareYieldBankSeaDropTokenGatedDrop(
  nft: Address,
  seaDrop: Address,
  allowedNftToken: Address,
  stage: YieldBankSeaDropTokenGatedDropConfig,
) {
  validateSeaDropTokenGatedDropConfig(stage);
  return {
    to: getAddress(nft),
    data: encodeFunctionData({
      abi: yieldBankNftAbi,
      functionName: "updateTokenGatedDrop",
      args: [getAddress(seaDrop), getAddress(allowedNftToken), stage],
    }),
    value: 0n,
  } as const;
}

export function prepareYieldBankSeaDropSignedMintValidation(
  nft: Address,
  seaDrop: Address,
  signer: Address,
  validation: YieldBankSeaDropSignedMintConfig,
) {
  validateSeaDropSignedMintConfig(validation);
  return {
    to: getAddress(nft),
    data: encodeFunctionData({
      abi: yieldBankNftAbi,
      functionName: "updateSignedMintValidationParams",
      args: [getAddress(seaDrop), getAddress(signer), validation],
    }),
    value: 0n,
  } as const;
}

export function prepareYieldBankSeaDropPayout(
  nft: Address,
  seaDrop: Address,
  proceedsVault: Address,
) {
  return prepareYieldBankNftAddressUpdate(
    nft, "updateCreatorPayoutAddress", seaDrop, proceedsVault,
  );
}

export function prepareYieldBankSeaDropFeeRecipient(
  nft: Address,
  seaDrop: Address,
  feeRecipient: Address,
  allowed: boolean,
) {
  return {
    to: getAddress(nft),
    data: encodeFunctionData({
      abi: yieldBankNftAbi,
      functionName: "updateAllowedFeeRecipient",
      args: [getAddress(seaDrop), getAddress(feeRecipient), allowed],
    }),
    value: 0n,
  } as const;
}

export function prepareYieldBankSeaDropPayer(
  nft: Address,
  seaDrop: Address,
  payer: Address,
  allowed: boolean,
) {
  return {
    to: getAddress(nft),
    data: encodeFunctionData({
      abi: yieldBankNftAbi,
      functionName: "updatePayer",
      args: [getAddress(seaDrop), getAddress(payer), allowed],
    }),
    value: 0n,
  } as const;
}

/** First half of the mandatory OpenSea-manager to timelock Ownable2Step handoff. */
export function prepareYieldBankNftOwnershipTransfer(nft: Address, timelock: Address) {
  const target = getAddress(timelock);
  if (target === "0x0000000000000000000000000000000000000000") {
    throw new Error("timelock must be nonzero");
  }
  return {
    to: getAddress(nft),
    data: encodeFunctionData({
      abi: yieldBankNftAbi, functionName: "transferOwnership", args: [target],
    }),
    value: 0n,
  } as const;
}

/** Timelock target call that completes the Ownable2Step handoff. */
export function prepareYieldBankNftOwnershipAcceptance(nft: Address) {
  return {
    to: getAddress(nft),
    data: encodeFunctionData({ abi: yieldBankNftAbi, functionName: "acceptOwnership" }),
    value: 0n,
  } as const;
}

export function prepareYieldBankAllocation(vault: Address, firstReceiptId: bigint, lastReceiptId: bigint, calls: readonly [YieldBankAllocationCall, YieldBankAllocationCall, YieldBankAllocationCall]) {
  if (firstReceiptId < 1n || lastReceiptId < firstReceiptId || lastReceiptId - firstReceiptId + 1n > 20n) throw new Error("invalid receipt range");
  if (calls.some((call) => call.minimumOutput <= 0n || call.minimumShares <= 0n)) {
    throw new Error("every allocation leg requires positive minimum output and share floors");
  }
  return { to: vault, data: encodeFunctionData({ abi: yieldBankProceedsVaultAbi, functionName: "allocateReceipts", args: [firstReceiptId, lastReceiptId, calls] }), value: 0n } as const;
}

/** Prepares an allocation-operator royalty synchronization with fresh guarded route data. */
export function prepareYieldBankRoyaltySync(
  revenueRouter: Address,
  asset: Address,
  sourceData: Hex,
) {
  if (!/^0x(?:[0-9a-fA-F]{2})+$/.test(sourceData)) {
    throw new Error("royalty synchronization requires nonempty guarded route data");
  }
  return {
    to: revenueRouter,
    data: encodeFunctionData({
      abi: yieldBankRevenueRouterAbi,
      functionName: "syncRoyalty",
      args: [getAddress(asset), sourceData],
    }),
    value: 0n,
  } as const;
}

/** Prepares native royalty synchronization; only the backing tranche is wrapped to WETH. */
export function prepareYieldBankNativeRoyaltySync(revenueRouter: Address, sourceData: Hex) {
  if (!/^0x(?:[0-9a-fA-F]{2})+$/.test(sourceData)) {
    throw new Error("native royalty synchronization requires nonempty guarded route data");
  }
  return {
    to: revenueRouter,
    data: encodeFunctionData({
      abi: yieldBankRevenueRouterAbi,
      functionName: "syncNativeRoyalty",
      args: [sourceData],
    }),
    value: 0n,
  } as const;
}

/** Prepares the NFT owner's target allocation request. Execution remains a separate manual operator action. */
export function prepareYieldBankTargetAllocation(
  allocator: Address,
  tokenId: bigint,
  weights: readonly [number, number, number],
  maximumAdapterLossBps: number,
  validUntil: bigint,
) {
  if (tokenId < 1n) throw new Error("tokenId must be positive");
  validateAllocationWeights(weights);
  validateLossBps(maximumAdapterLossBps);
  if (validUntil <= 0n || validUntil > (1n << 48n) - 1n) {
    throw new Error("allocation target expiry must fit uint48");
  }
  return {
    to: allocator,
    data: encodeFunctionData({
      abi: yieldBankAllocatorAbi,
      functionName: "setTargetAllocation",
      args: [tokenId, weights, maximumAdapterLossBps, Number(validUntil)],
    }),
    value: 0n,
  } as const;
}

/** Encodes the reviewed slippage, adapter-unwind, and route inputs for manual execution. */
export function prepareYieldBankTargetExecution(
  allocator: Address,
  tokenId: bigint,
  expectedRevision: bigint,
  execution: YieldBankRebalanceExecution,
) {
  if (tokenId < 1n || expectedRevision < 1n) {
    throw new Error("tokenId and expectedRevision must be positive");
  }
  if (execution.deadline <= 0n || execution.minimumWethRecovered <= 0n) {
    throw new Error("rebalance requires a positive deadline and WETH recovery floor");
  }
  if (execution.conversions.length > 24) throw new Error("rebalance supports at most 24 conversions");
  const conversionAssets = new Set<string>();
  for (const conversion of execution.conversions) {
    const asset = getAddress(conversion.asset);
    if (conversion.minimumWethOut <= 0n || conversionAssets.has(asset)) {
      throw new Error("rebalance conversions require unique assets and positive WETH floors");
    }
    conversionAssets.add(asset);
  }
  for (const redemption of execution.redemptions) {
    if (redemption.minimumOutputs.some((amount) => amount < 0n)) {
      throw new Error("redemption output floors cannot be negative");
    }
    const adapters = new Set<string>();
    for (const adapterCall of redemption.adapterCalls) {
      validateLossBps(adapterCall.maxLossBps);
      const adapter = getAddress(adapterCall.adapter);
      if (adapters.has(adapter)) throw new Error("adapter redemption calls must be unique per sleeve");
      adapters.add(adapter);
    }
  }
  for (const allocation of execution.allocations) {
    if (allocation.minimumOutput < 0n || allocation.minimumShares < 0n
      || (allocation.minimumOutput === 0n) !== (allocation.minimumShares === 0n)) {
      throw new Error("each active allocation requires both output and share floors");
    }
  }
  return {
    to: allocator,
    data: encodeFunctionData({
      abi: yieldBankAllocatorAbi,
      functionName: "executeTargetAllocation",
      args: [tokenId, expectedRevision, execution],
    }),
    value: 0n,
  } as const;
}

export function prepareYieldBankClaim(collection: Address, tokenId: bigint) {
  if (tokenId < 1n) throw new Error("tokenId must be positive");
  return { to: collection, data: encodeFunctionData({ abi: yieldBankCollectionAbi, functionName: "claimPrimary", args: [tokenId] }), value: 0n } as const;
}

export function prepareYieldBankSettle(collection: Address, tokenId: bigint) {
  if (tokenId < 1n) throw new Error("tokenId must be positive");
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
  if (tokenId < 1n) throw new Error("tokenId must be positive");
  return { to: collection, data: encodeFunctionData({ abi: yieldBankCollectionAbi, functionName: "burnToken", args: [tokenId, proof] }), value: 0n } as const;
}

export function prepareYieldBankSleeveRedemption(
  sleeve: Address,
  shares: bigint,
  receiver: Address,
  owner: Address,
  minimumOutput: bigint,
  proof: Hex = "0x",
) {
  if (shares <= 0n || minimumOutput <= 0n) {
    throw new Error("sleeve redemption requires positive shares and minimum output");
  }
  return {
    to: sleeve,
    data: encodeFunctionData({
      abi: yieldBankSleeveAbi,
      functionName: "redeem",
      args: [shares, receiver, owner, 0, minimumOutput, proof],
    }),
    value: 0n,
  } as const;
}

const deltaRungComponents = [
  { name: "tickLower", type: "int24" },
  { name: "tickUpper", type: "int24" },
  { name: "amount0", type: "uint256" },
  { name: "amount1", type: "uint256" },
  { name: "amount0Min", type: "uint256" },
  { name: "amount1Min", type: "uint256" },
] as const;

const deltaLiquidityActionComponents = [
  { name: "tokenId", type: "uint256" },
  { name: "liquidity", type: "uint128" },
  { name: "amount0Minimum", type: "uint256" },
  { name: "amount1Minimum", type: "uint256" },
] as const;

/** Encodes the exact manual inputs consumed by DeltaV3LPAdapter.deposit. */
export function encodeYieldBankDeltaDepositData(params: YieldBankDeltaDepositData): Hex {
  validateDeltaTick(params.minimumCurrentTick, "minimumCurrentTick");
  validateDeltaTick(params.maximumCurrentTick, "maximumCurrentTick");
  if (params.minimumCurrentTick > params.maximumCurrentTick || params.deadline <= 0n
    || params.wethToConvert < 0n || params.minimumInjohOut < 0n
    || (params.wethToConvert === 0n) !== (params.minimumInjohOut === 0n)) {
    throw new Error("invalid Delta deposit bounds");
  }
  if (params.rungs.length < 1 || params.rungs.length > 64) {
    throw new Error("Delta deposit requires 1..64 rungs");
  }
  params.rungs.forEach((rung, index) => {
    validateDeltaTick(rung.tickLower, `rungs.${index}.tickLower`);
    validateDeltaTick(rung.tickUpper, `rungs.${index}.tickUpper`);
    if (rung.tickLower >= rung.tickUpper || rung.amount0 < 0n || rung.amount1 < 0n
      || (rung.amount0 === 0n && rung.amount1 === 0n)
      || rung.amount0Minimum < 0n || rung.amount1Minimum < 0n
      || rung.amount0Minimum > rung.amount0 || rung.amount1Minimum > rung.amount1) {
      throw new Error(`invalid Delta rung ${index}`);
    }
  });
  return encodeAbiParameters(
    [{ type: "tuple", components: [
      { name: "wethToConvert", type: "uint256" },
      { name: "minimumInjohOut", type: "uint256" },
      { name: "routeData", type: "bytes" },
      { name: "rungs", type: "tuple[]", components: deltaRungComponents },
      { name: "minimumCurrentTick", type: "int24" },
      { name: "maximumCurrentTick", type: "int24" },
      { name: "deadline", type: "uint256" },
    ] }],
    [{
      wethToConvert: params.wethToConvert,
      minimumInjohOut: params.minimumInjohOut,
      routeData: params.routeData,
      rungs: params.rungs.map((rung) => ({
        tickLower: rung.tickLower,
        tickUpper: rung.tickUpper,
        amount0: rung.amount0,
        amount1: rung.amount1,
        amount0Min: rung.amount0Minimum,
        amount1Min: rung.amount1Minimum,
      })),
      minimumCurrentTick: params.minimumCurrentTick,
      maximumCurrentTick: params.maximumCurrentTick,
      deadline: params.deadline,
    }],
  );
}

/** Encodes explicit liquidity burns, conversion, and WETH return for a manual withdrawal. */
export function encodeYieldBankDeltaWithdrawalData(params: YieldBankDeltaWithdrawalData): Hex {
  validateDeltaActions(params.actions);
  if (params.deadline <= 0n || params.injohToConvert < 0n || params.minimumWethOut < 0n
    || params.wethToReturn <= 0n
    || (params.injohToConvert === 0n) !== (params.minimumWethOut === 0n)) {
    throw new Error("invalid Delta withdrawal bounds");
  }
  return encodeAbiParameters(
    [{ type: "tuple", components: [
      { name: "actions", type: "tuple[]", components: deltaLiquidityActionComponents },
      { name: "injohToConvert", type: "uint256" },
      { name: "minimumWethOut", type: "uint256" },
      { name: "wethToReturn", type: "uint256" },
      { name: "routeData", type: "bytes" },
      { name: "deadline", type: "uint256" },
    ] }],
    [{ ...params, actions: params.actions.map((action) => ({ ...action })) }],
  );
}

/** Encodes an explicit, duplicate-free position list for fee collection. */
export function encodeYieldBankDeltaCollectionData(tokenIds: readonly bigint[]): Hex {
  if (tokenIds.length === 0 || tokenIds.some((tokenId) => tokenId <= 0n)
    || new Set(tokenIds).size !== tokenIds.length) {
    throw new Error("Delta collection requires unique positive token IDs");
  }
  return encodeAbiParameters([{ type: "uint256[]" }], [tokenIds]);
}

/** Encodes the complete position list required by DeltaV3LPAdapter.exitAll. */
export function encodeYieldBankDeltaExitData(params: YieldBankDeltaExitData): Hex {
  validateDeltaActions(params.actions);
  if (params.deadline <= 0n) throw new Error("Delta exit requires a positive deadline");
  return encodeAbiParameters(
    [{ type: "tuple", components: [
      { name: "actions", type: "tuple[]", components: deltaLiquidityActionComponents },
      { name: "deadline", type: "uint256" },
    ] }],
    [{ actions: params.actions.map((action) => ({ ...action })), deadline: params.deadline }],
  );
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

function validateAllocationWeights(weights: readonly [number, number, number]): void {
  if (weights.some((weight) => !Number.isInteger(weight) || weight < 0 || weight > 10_000)
    || weights[0] + weights[1] + weights[2] !== 10_000) {
    throw new Error("allocation weights must be integer basis points totaling 10000");
  }
}

function allocationBpsFromValues(
  values: readonly [bigint, bigint, bigint],
): readonly [number, number, number] {
  const total = values[0] + values[1] + values[2];
  if (total === 0n) return [0, 0, 0];
  const core = Number(values[0] * 10_000n / total);
  const marketCumulative = Number((values[0] + values[1]) * 10_000n / total);
  return [core, marketCumulative - core, 10_000 - marketCumulative];
}

function validateDeltaActions(actions: readonly YieldBankDeltaLiquidityAction[]): void {
  const ids = new Set<bigint>();
  actions.forEach((action, index) => {
    if (action.tokenId <= 0n || action.liquidity <= 0n
      || action.liquidity > (1n << 128n) - 1n
      || action.amount0Minimum < 0n || action.amount1Minimum < 0n
      || ids.has(action.tokenId)) {
      throw new Error(`invalid Delta liquidity action ${index}`);
    }
    ids.add(action.tokenId);
  });
}

function validateDeltaTick(tick: number, path: string): void {
  if (!Number.isInteger(tick) || tick < -8_388_608 || tick > 8_388_607) {
    throw new Error(`${path} must fit int24`);
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

function validateImplementationBinding(
  path: string,
  entry: YieldBankManifestEntry,
  required: boolean,
): void {
  const binding = entry.implementationBinding;
  if (!binding) {
    if (required) throw new Error(`${path}.implementationBinding is required`);
    return;
  }
  if (!["immutable", "eip1967", "beacon"].includes(binding.kind)) {
    throw new Error(`${path}.implementationBinding is invalid`);
  }
  if (binding.kind === "immutable") return;
  getAddress(binding.implementation);
  validateBytes32(`${path}.implementationBinding.implementationRuntimeCodeHash`,
    binding.implementationRuntimeCodeHash);
  if (binding.kind === "beacon") {
    getAddress(binding.beacon);
    validateBytes32(`${path}.implementationBinding.beaconRuntimeCodeHash`,
      binding.beaconRuntimeCodeHash);
  }
}

function validatePublicDrop(
  publicDrop: YieldBankPublicDrop,
  allowedFeeRecipients: readonly Address[],
): void {
  if (!publicDrop || typeof publicDrop.mintPrice !== "string") {
    throw new Error("openSea.publicDrop is required");
  }
  let mintPrice: bigint;
  try { mintPrice = BigInt(publicDrop.mintPrice); }
  catch { throw new Error("openSea.publicDrop.mintPrice must be a decimal uint80 string"); }
  const uint48Max = 2 ** 48 - 1;
  if (!/^\d+$/.test(publicDrop.mintPrice) || mintPrice < 1n || mintPrice > (1n << 80n) - 1n
    || !Number.isSafeInteger(publicDrop.startTime) || publicDrop.startTime < 0
    || publicDrop.startTime > uint48Max
    || !Number.isSafeInteger(publicDrop.endTime) || publicDrop.endTime <= publicDrop.startTime
    || publicDrop.endTime > uint48Max
    || !Number.isInteger(publicDrop.maxTotalMintableByWallet)
    || publicDrop.maxTotalMintableByWallet < 1
    || publicDrop.maxTotalMintableByWallet > 65_535
    || !Number.isInteger(publicDrop.feeBps) || publicDrop.feeBps < 0
    || publicDrop.feeBps >= 10_000) {
    throw new Error("openSea.publicDrop is invalid");
  }
  if (typeof publicDrop.restrictFeeRecipients !== "boolean"
    || !Array.isArray(allowedFeeRecipients)) {
    throw new Error("openSea public drop recipient restriction is invalid");
  }
  const canonical = canonicalUniqueAddresses("openSea.allowedFeeRecipients", allowedFeeRecipients);
  if (publicDrop.restrictFeeRecipients && canonical.length === 0) {
    throw new Error("restricted SeaDrop stages require an allowed fee recipient");
  }
}

function validateSeaDropPublicDropConfig(value: YieldBankSeaDropPublicDropConfig): void {
  validateUint("mintPrice", value.mintPrice, 80, true);
  validateNumberUint("startTime", value.startTime, 48);
  validateNumberUint("endTime", value.endTime, 48);
  if (value.endTime <= value.startTime) throw new Error("public drop endTime must follow startTime");
  validateNumberUint("maxTotalMintableByWallet", value.maxTotalMintableByWallet, 16, true);
  validatePaidFeeBps(value.feeBps);
  if (typeof value.restrictFeeRecipients !== "boolean") {
    throw new Error("restrictFeeRecipients must be boolean");
  }
}

function validateSeaDropTokenGatedDropConfig(value: YieldBankSeaDropTokenGatedDropConfig): void {
  validateUint("mintPrice", value.mintPrice, 80, true);
  validateNumberUint("maxTotalMintableByWallet", value.maxTotalMintableByWallet, 16, true);
  validateNumberUint("startTime", value.startTime, 48);
  validateNumberUint("endTime", value.endTime, 48);
  if (value.endTime <= value.startTime) throw new Error("token-gated endTime must follow startTime");
  validateNumberUint("dropStageIndex", value.dropStageIndex, 8);
  validateNumberUint("maxTokenSupplyForStage", value.maxTokenSupplyForStage, 32, true);
  validatePaidFeeBps(value.feeBps);
  if (typeof value.restrictFeeRecipients !== "boolean") {
    throw new Error("restrictFeeRecipients must be boolean");
  }
}

function validateSeaDropSignedMintConfig(value: YieldBankSeaDropSignedMintConfig): void {
  validateUint("minMintPrice", value.minMintPrice, 80, true);
  validateNumberUint("maxMaxTotalMintableByWallet", value.maxMaxTotalMintableByWallet, 24, true);
  validateNumberUint("minStartTime", value.minStartTime, 40);
  validateNumberUint("maxEndTime", value.maxEndTime, 40);
  if (value.maxEndTime <= value.minStartTime) {
    throw new Error("signed-mint maxEndTime must follow minStartTime");
  }
  validateNumberUint("maxMaxTokenSupplyForStage", value.maxMaxTokenSupplyForStage, 40, true);
  validatePaidFeeBps(value.maxFeeBps);
  if (!Number.isInteger(value.minFeeBps) || value.minFeeBps < 0
    || value.minFeeBps > value.maxFeeBps) {
    throw new Error("signed-mint fee bounds are invalid");
  }
}

function validateUint(name: string, value: bigint, bits: number, positive = false): void {
  if (typeof value !== "bigint" || value < (positive ? 1n : 0n) || value >= 1n << BigInt(bits)) {
    throw new Error(`${name} must fit uint${bits}${positive ? " and be positive" : ""}`);
  }
}

function validateNumberUint(name: string, value: number, bits: number, positive = false): void {
  if (!Number.isSafeInteger(value) || value < (positive ? 1 : 0)
    || BigInt(value) >= 1n << BigInt(bits)) {
    throw new Error(`${name} must fit uint${bits}${positive ? " and be positive" : ""}`);
  }
}

function validatePaidFeeBps(value: number): void {
  if (!Number.isInteger(value) || value < 0 || value >= 10_000) {
    throw new Error("SeaDrop feeBps must be an integer below 10000");
  }
}

function prepareYieldBankNftAddressUpdate(
  nft: Address,
  functionName: "updateCreatorPayoutAddress",
  seaDrop: Address,
  value: Address,
) {
  const target = getAddress(value);
  if (target === "0x0000000000000000000000000000000000000000") {
    throw new Error("SeaDrop address value must be nonzero");
  }
  return {
    to: getAddress(nft),
    data: encodeFunctionData({
      abi: yieldBankNftAbi, functionName, args: [getAddress(seaDrop), target],
    }),
    value: 0n,
  } as const;
}

function canonicalUniqueAddresses(path: string, addresses: readonly Address[]): Address[] {
  if (!Array.isArray(addresses)) throw new Error(`${path} must be an array`);
  const canonical = canonicalAddresses(addresses);
  if (canonical.length !== addresses.length) throw new Error(`${path} must be unique`);
  return canonical;
}

function validateTokenGatedDrops(
  drops: readonly YieldBankTokenGatedDrop[],
  allowedFeeRecipients: readonly Address[],
): YieldBankTokenGatedDrop[] {
  if (!Array.isArray(drops)) throw new Error("openSea.tokenGatedDrops must be an array");
  const uint48Max = 2 ** 48 - 1;
  const canonical = drops.map((drop) => ({
    ...drop, allowedNftToken: getAddress(drop.allowedNftToken),
  })).sort((left, right) => left.allowedNftToken.toLowerCase()
    .localeCompare(right.allowedNftToken.toLowerCase()));
  if (new Set(canonical.map((drop) => drop.allowedNftToken)).size !== canonical.length) {
    throw new Error("openSea.tokenGatedDrops must use unique allowed NFT tokens");
  }
  for (const drop of canonical) {
    let mintPrice: bigint;
    try { mintPrice = BigInt(drop.mintPrice); }
    catch { throw new Error(`invalid token-gated mint price for ${drop.allowedNftToken}`); }
    if (!/^\d+$/.test(drop.mintPrice) || mintPrice < 1n || mintPrice > (1n << 80n) - 1n
      || !Number.isInteger(drop.maxTotalMintableByWallet)
      || drop.maxTotalMintableByWallet < 1 || drop.maxTotalMintableByWallet > 65_535
      || !Number.isSafeInteger(drop.startTime) || drop.startTime < 0
      || drop.startTime > uint48Max || !Number.isSafeInteger(drop.endTime)
      || drop.endTime <= drop.startTime || drop.endTime > uint48Max
      || !Number.isInteger(drop.dropStageIndex) || drop.dropStageIndex < 0
      || drop.dropStageIndex > 255 || !Number.isInteger(drop.maxTokenSupplyForStage)
      || drop.maxTokenSupplyForStage < 1 || drop.maxTokenSupplyForStage > 4_294_967_295
      || !Number.isInteger(drop.feeBps) || drop.feeBps < 0 || drop.feeBps >= 10_000
      || typeof drop.restrictFeeRecipients !== "boolean") {
      throw new Error(`invalid token-gated SeaDrop stage for ${drop.allowedNftToken}`);
    }
    if (drop.restrictFeeRecipients && allowedFeeRecipients.length === 0) {
      throw new Error(`restricted token-gated stage ${drop.allowedNftToken} requires a fee recipient`);
    }
  }
  return canonical;
}

function validateSignedMintValidations(
  validations: readonly YieldBankSignedMintValidation[],
): YieldBankSignedMintValidation[] {
  if (!Array.isArray(validations)) {
    throw new Error("openSea.signedMintValidations must be an array");
  }
  const uint40Max = 2 ** 40 - 1;
  const canonical = validations.map((params) => ({
    ...params, signer: getAddress(params.signer),
  })).sort((left, right) => left.signer.toLowerCase().localeCompare(right.signer.toLowerCase()));
  if (new Set(canonical.map((params) => params.signer)).size !== canonical.length) {
    throw new Error("openSea.signedMintValidations must use unique signers");
  }
  for (const params of canonical) {
    let minMintPrice: bigint;
    try { minMintPrice = BigInt(params.minMintPrice); }
    catch { throw new Error(`invalid signed-mint price for ${params.signer}`); }
    if (!/^\d+$/.test(params.minMintPrice) || minMintPrice < 1n
      || minMintPrice > (1n << 80n) - 1n
      || !Number.isInteger(params.maxMaxTotalMintableByWallet)
      || params.maxMaxTotalMintableByWallet < 1
      || params.maxMaxTotalMintableByWallet > 16_777_215
      || !Number.isSafeInteger(params.minStartTime) || params.minStartTime < 0
      || params.minStartTime > uint40Max || !Number.isSafeInteger(params.maxEndTime)
      || params.maxEndTime <= params.minStartTime || params.maxEndTime > uint40Max
      || !Number.isSafeInteger(params.maxMaxTokenSupplyForStage)
      || params.maxMaxTokenSupplyForStage < 1
      || params.maxMaxTokenSupplyForStage > uint40Max
      || !Number.isInteger(params.minFeeBps) || params.minFeeBps < 0
      || !Number.isInteger(params.maxFeeBps) || params.maxFeeBps < params.minFeeBps
      || params.maxFeeBps >= 10_000) {
      throw new Error(`invalid SeaDrop signed-mint validation for ${params.signer}`);
    }
  }
  return canonical;
}

function canonicalAddresses(addresses: readonly Address[]): Address[] {
  return [...new Set(addresses.map((address) => getAddress(address)))]
    .sort((left, right) => left.toLowerCase().localeCompare(right.toLowerCase()));
}

async function verifyImplementationBinding(
  client: YieldBankReadClient,
  path: string,
  entry: YieldBankManifestEntry,
): Promise<YieldBankManifestVerification[]> {
  const binding = entry.implementationBinding;
  if (!binding || binding.kind === "immutable") return [];
  const wordToAddress = (word: Hex | undefined): Address => getAddress(
    `0x${(word ?? `0x${"0".repeat(64)}`).slice(-40)}`,
  );
  const results: YieldBankManifestVerification[] = [];
  let implementation: Address;
  if (binding.kind === "eip1967") {
    implementation = wordToAddress(await client.getStorageAt({
      address: entry.address, slot: EIP1967_IMPLEMENTATION_SLOT,
    }));
    results.push({
      path: `${path}.implementationBinding`, address: entry.address,
      expectedCodeHash: toHex(BigInt(binding.implementation), { size: 32 }),
      actualCodeHash: toHex(BigInt(implementation), { size: 32 }),
      ok: getAddress(implementation) === getAddress(binding.implementation),
    });
  } else {
    const beacon = wordToAddress(await client.getStorageAt({
      address: entry.address, slot: EIP1967_BEACON_SLOT,
    }));
    const beaconCode = await client.getCode({ address: beacon });
    const beaconCodeHash = beaconCode && beaconCode !== "0x" ? keccak256(beaconCode) : null;
    results.push({
      path: `${path}.beaconBinding`, address: entry.address,
      expectedCodeHash: toHex(BigInt(binding.beacon), { size: 32 }),
      actualCodeHash: toHex(BigInt(beacon), { size: 32 }),
      ok: getAddress(beacon) === getAddress(binding.beacon),
    }, {
      path: `${path}.beaconRuntimeCodeHash`, address: beacon,
      expectedCodeHash: binding.beaconRuntimeCodeHash,
      actualCodeHash: beaconCodeHash,
      ok: beaconCodeHash?.toLowerCase() === binding.beaconRuntimeCodeHash.toLowerCase(),
    });
    implementation = await read<Address>(client, beacon, [
      { type: "function", name: "implementation", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
    ] as const, "implementation");
    results.push({
      path: `${path}.implementationBinding`, address: beacon,
      expectedCodeHash: toHex(BigInt(binding.implementation), { size: 32 }),
      actualCodeHash: toHex(BigInt(implementation), { size: 32 }),
      ok: getAddress(implementation) === getAddress(binding.implementation),
    });
  }
  const implementationCode = await client.getCode({ address: implementation });
  const implementationCodeHash = implementationCode && implementationCode !== "0x"
    ? keccak256(implementationCode) : null;
  results.push({
    path: `${path}.implementationRuntimeCodeHash`, address: implementation,
    expectedCodeHash: binding.implementationRuntimeCodeHash,
    actualCodeHash: implementationCodeHash,
    ok: implementationCodeHash?.toLowerCase()
      === binding.implementationRuntimeCodeHash.toLowerCase(),
  });
  return results;
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
