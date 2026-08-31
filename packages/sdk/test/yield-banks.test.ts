import assert from "node:assert/strict";
import test from "node:test";
import {
  decodeAbiParameters, decodeFunctionData, decodeFunctionResult, encodeFunctionResult,
  keccak256, toBytes, type Address, type Hex,
} from "viem";
import {
  encodeYieldBankDeltaCollectionData,
  encodeYieldBankDeltaDepositData,
  encodeYieldBankDeltaExitData,
  encodeYieldBankDeltaWithdrawalData,
  prepareYieldBankBurn,
  openSeaCollectionUrl,
  prepareYieldBankAllocation,
  prepareYieldBankAdapterCollection,
  prepareYieldBankAdapterDeposit,
  prepareYieldBankAdapterExit,
  prepareYieldBankAdapterWithdrawal,
  prepareYieldBankClaim,
  prepareYieldBankNativeRoyaltySync,
  prepareYieldBankNftOwnershipAcceptance,
  prepareYieldBankNftOwnershipTransfer,
  prepareYieldBankRoyaltySync,
  prepareYieldBankSeaDropAllowListClear,
  prepareYieldBankSeaDropFeeRecipient,
  prepareYieldBankSeaDropPayer,
  prepareYieldBankSeaDropPayout,
  prepareYieldBankSeaDropPublicDrop,
  prepareYieldBankSeaDropSignedMintValidation,
  prepareYieldBankSeaDropTokenGatedDrop,
  prepareYieldBankSettle,
  prepareYieldBankSleeveRedemption,
  prepareYieldBankTargetAllocation,
  prepareYieldBankTargetExecution,
  prepareYieldBankTransfer,
  readYieldBankToken,
  validateYieldBankManifest,
  verifyYieldBankManifest,
  yieldBankNftAbi,
  yieldBankStrategyRegistryAbi,
  yieldBankMintStagesHash,
  type YieldBankManifestEntry,
  type YieldBankFeedBinding,
  type YieldBankReleaseManifest,
} from "../src/index.js";

const addresses = [
  "0x0000000000000000000000000000000000000001",
  "0x0000000000000000000000000000000000000002",
  "0x0000000000000000000000000000000000000003",
  "0x0000000000000000000000000000000000000004",
  "0x0000000000000000000000000000000000000005",
  "0x0000000000000000000000000000000000000006",
  "0x0000000000000000000000000000000000000007",
  "0x0000000000000000000000000000000000000008",
  "0x0000000000000000000000000000000000000009",
  "0x0000000000000000000000000000000000000010",
  "0x0000000000000000000000000000000000000011",
  "0x0000000000000000000000000000000000000012",
  "0x0000000000000000000000000000000000000013",
  "0x0000000000000000000000000000000000000014",
  "0x0000000000000000000000000000000000000015",
  "0x0000000000000000000000000000000000000016",
  "0x0000000000000000000000000000000000000017",
  "0x0000000000000000000000000000000000000018",
  "0x0000000000000000000000000000000000000019",
  "0x0000000000000000000000000000000000000020",
  "0x0000000000000000000000000000000000000021",
  "0x0000000000000000000000000000000000000022",
  "0x0000000000000000000000000000000000000023",
  "0x0000000000000000000000000000000000000024",
  "0x0000000000000000000000000000000000000025",
  "0x0000000000000000000000000000000000000026",
] as const satisfies readonly Address[];
const runtime = "0x60006000" as Hex;
const runtimeCodeHash = keccak256(runtime);
const deploymentTransaction = keccak256(toBytes("deployment"));
const entry = (address: Address): YieldBankManifestEntry => ({
  address, runtimeCodeHash, version: "1.0.0", provenance: "git:yield-banks-v1",
  deploymentTransaction, verificationTransaction: deploymentTransaction,
});
const feedBinding = (
  kind: "chainlink" | "delta-v3-twap",
  asset: Address,
  feed: Address,
  weekdaysOnly = false,
): YieldBankFeedBinding => ({
  kind, asset, feed: entry(feed),
  referenceSource: "0x0000000000000000000000000000000000000000",
  heartbeat: 86_400, gracePeriod: 0, maxDeviationBps: 100,
  weekdaysOnly, checkAssetOraclePause: weekdaysOnly,
  description: "TEST / USD", decimals: 8,
  sourceUrl: "https://docs.chain.link/data-feeds/price-feeds/addresses",
  observedAt: "2026-08-28T16:00:00Z",
  wethUsdFeed: "0x0000000000000000000000000000000000000000",
  twapWindow: 0, maxSpotDeviationBps: 0, comparisonAmount: "0", minimumLiquidity: "0",
});

function manifest(): YieldBankReleaseManifest {
  const keys = [
    "registry", "factoryDeployer", "factory", "collection", "nft", "accountImplementation", "proceedsVault", "distributor",
    "revenueRouter", "timelock", "allocator", "deltaPoolController", "priceHub",
    "strategyRegistry", "renderer", "coreSleeve", "marketMakingSleeve", "usdgSleeve",
    "rebalanceValueGuard",
  ] as const;
  const publicDrop = {
    mintPrice: "300000000000000",
    startTime: 1_786_214_195,
    endTime: 1_789_065_395,
    maxTotalMintableByWallet: 12,
    feeBps: 1_000,
    restrictFeeRecipients: true,
  } as const;
  const allowedFeeRecipients = [addresses[25]!] as const;
  const allowListMerkleRoot = `0x${"0".repeat(64)}` as Hex;
  const allowedPayers = [] as const;
  const tokenGatedDrops = [] as const;
  const signedMintValidations = [] as const;
  const release: YieldBankReleaseManifest = {
    schemaVersion: "1.1",
    chainId: 4663,
    collectionId: keccak256(toBytes("collection")),
    factoryVersion: keccak256(toBytes("factory-v1")),
    compiler: {
      version: "0.8.28", optimizerRuns: 200,
      sourceCommit: keccak256(toBytes("commit")),
      dependencyLockHash: keccak256(toBytes("lock")),
    },
    deployment: {
      factorySalt: keccak256(toBytes("factory-salt")),
      collectionSalt: keccak256(toBytes("collection-salt")),
      collectionConfigurationHash: keccak256(toBytes("configuration")),
      systemPlanHash: keccak256(toBytes("system-plan")),
      collectionCreationCodeHash: keccak256(toBytes("collection-creation-code")),
      metadataBaseUri: "ipfs://yield-banks/",
      metadataBaseUriHash: keccak256(toBytes("ipfs://yield-banks/")),
      contractUri: "ipfs://yield-banks/contract.json",
      contractUriHash: keccak256(toBytes("ipfs://yield-banks/contract.json")),
    },
    economics: {
      maxSupply: 777, secondaryRoyaltyBps: 650, primaryBackingBps: 7500, primaryCreatorBps: 1500,
      primarySinjohBps: 1000, exitTaxBps: 500,
      royaltyBackingBps: 6000, royaltyCreatorBps: 2000,
      royaltySinjohBps: 2000,
      coreWeightBps: 4000, marketMakingWeightBps: 3750, usdgWeightBps: 2250,
    },
    redemption: {
      token: "0x0000000000000000000000000000000000000000",
      amount: 0,
      tokenRuntimeCodeHash: `0x${"0".repeat(64)}` as Hex,
    },
    equityModel: {
      custody: "robinhood-stock-token",
      income: "balance-appreciation",
      disclosureUri: "https://example.com/yield-banks/equity-disclosure",
    },
    policyCaps: {
      core: { maximumStrategies: 1, maximumAdapterCapBps: 5000, maximumOperatorLossBps: 100 },
      marketMaking: { maximumStrategies: 1, maximumAdapterCapBps: 5000, maximumOperatorLossBps: 100 },
      usdg: { maximumStrategies: 1, maximumAdapterCapBps: 5000, maximumOperatorLossBps: 100 },
      deltaPoolFeed: {
        maximumHeartbeat: 86_400,
        maximumGracePeriod: 3_600,
        minimumTwapWindow: 1_800,
        maximumReferenceDeviationBps: 1_000,
        maximumSpotDeviationBps: 1_000,
      },
    },
    contracts: Object.fromEntries(keys.map((key, index) => [key, entry(addresses[index]!)])) as
      YieldBankReleaseManifest["contracts"],
    openSea: {
      collectionSlug: "sinjoh-yield-banks",
      collectionUrl: "https://opensea.io/collection/sinjoh-yield-banks/overview",
      mintStagesHash: yieldBankMintStagesHash(
        publicDrop, allowedFeeRecipients, allowListMerkleRoot, allowedPayers,
        tokenGatedDrops, signedMintValidations,
      ),
      publicDrop,
      allowListMerkleRoot,
      allowedFeeRecipients,
      allowedPayers,
      tokenGatedDrops,
      signedMintValidations,
      creatorPayoutAddress: addresses[6],
      observedPrimaryPlatformFeeBps: 1000,
      observedSecondaryRoyaltyBps: 650,
      observedSecondaryRoyaltyRecipient: addresses[8],
      observedAt: "2026-08-28T16:00:00Z",
    },
    dependencies: {
      WETH: entry("0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73"),
      USDG: entry("0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168"),
      seaDrop: entry("0x00005EA00Ac477B1030CE78506496e8C2dE24bf5"),
      seaport: entry("0x0000000000000068F116a894984e2DB1123eB395"),
      eligibilityPolicy: entry(addresses[4]),
      pairedAsset: entry(addresses[18]),
      deltaPositionBuilder: entry(addresses[19]),
      v3Factory: entry(addresses[20]),
      v3PositionManager: entry(addresses[21]),
    },
    equityAssets: [{
      ...entry(addresses[0]),
      implementationBinding: {
        kind: "beacon",
        beacon: addresses[1],
        beaconRuntimeCodeHash: runtimeCodeHash,
        implementation: addresses[2],
        implementationRuntimeCodeHash: runtimeCodeHash,
      },
    }],
    coreConstituents: [{
      asset: addresses[0], route: addresses[23], routeRuntimeCodeHash: runtimeCodeHash,
      weightBps: 10_000,
    }],
    adapters: {
      deltaV3LP: entry(addresses[22]),
      deltaEntryRoute: entry(addresses[23]),
      deltaExitRoute: entry(addresses[24]),
    },
    feeds: [
      feedBinding("chainlink", "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73", addresses[5]),
      feedBinding("chainlink", "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168", addresses[6]),
      feedBinding("chainlink", addresses[0], addresses[7], true),
      feedBinding("chainlink", addresses[18], addresses[8]),
    ],
    deltaInfrastructure: [{
      factory: addresses[20], positionManager: addresses[21], positionBuilder: addresses[19],
      weth: "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73",
      factoryRuntimeCodeHash: runtimeCodeHash,
      positionManagerRuntimeCodeHash: runtimeCodeHash,
      positionBuilderRuntimeCodeHash: runtimeCodeHash,
      routeCreationCodeHash: runtimeCodeHash,
      sleeveCreationCodeHash: runtimeCodeHash,
      adapterCreationCodeHash: runtimeCodeHash,
      feedCreationCodeHash: runtimeCodeHash,
      active: true,
    }],
    routeBindings: {
      allocations: [
        { inputAsset: "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73", sleeve: addresses[15], route: addresses[23], runtimeCodeHash },
        { inputAsset: "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73", sleeve: addresses[17], route: addresses[23], runtimeCodeHash },
      ],
      rebalances: [
        { inputAsset: "0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168", route: addresses[24], runtimeCodeHash },
        { inputAsset: addresses[18], route: addresses[24], runtimeCodeHash },
        { inputAsset: addresses[0], route: addresses[24], runtimeCodeHash },
      ],
    },
    roles: {
      creator: addresses[0], openSeaManager: addresses[9],
      sinjoh: addresses[1],
      allocationOperator: addresses[4], guardian: addresses[3], timelock: addresses[8],
    },
    auditHashes: [keccak256(toBytes("independent-audit"))],
  };
  release.dependencies.USDG = {
    ...release.dependencies.USDG,
    implementationBinding: {
      kind: "eip1967",
      implementation: addresses[3],
      implementationRuntimeCodeHash: runtimeCodeHash,
    },
  };
  release.dependencies.WETH = {
    ...release.dependencies.WETH,
    implementationBinding: {
      kind: "eip1967",
      implementation: addresses[2],
      implementationRuntimeCodeHash: runtimeCodeHash,
    },
  };
  return release;
}

test("Viem decodes StrategyRegistry records by their named tuple fields", () => {
  const encoded = encodeFunctionResult({
    abi: yieldBankStrategyRegistryAbi,
    functionName: "recordOf",
    result: {
      implementation: addresses[22],
      runtimeCodeHash,
      sleeveCategory: keccak256(toBytes("YIELD_BANK_MARKET_MAKING")),
      accountingAsset: "0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73",
      state: 1,
      registeredAt: 7,
    },
  });
  const decoded = decodeFunctionResult({
    abi: yieldBankStrategyRegistryAbi, functionName: "recordOf", data: encoded,
  });
  assert.equal(Array.isArray(decoded), false);
  assert.equal(decoded.implementation, addresses[22]);
  assert.equal(decoded.runtimeCodeHash, runtimeCodeHash);
  assert.equal(decoded.state, 1);
});

test("Yield Banks manifest validates immutable economics and live code", async () => {
  const release = manifest();
  validateYieldBankManifest(release);
  const results = await verifyYieldBankManifest({
    getCode: async () => runtime,
    getStorageAt: async ({ address }: { address: Address }) => {
      const expected = address.toLowerCase() === release.dependencies.USDG.address.toLowerCase()
        ? release.dependencies.USDG.implementationBinding!
        : address.toLowerCase() === release.dependencies.WETH.address.toLowerCase()
          ? release.dependencies.WETH.implementationBinding!
          : release.equityAssets[0]!.implementationBinding!;
      if (expected.kind === "immutable") throw new Error("unexpected immutable binding fixture");
      const target = expected.kind === "beacon" ? expected.beacon : expected.implementation;
      return `0x${target.slice(2).padStart(64, "0")}` as Hex;
    },
    readContract: async ({ address, functionName, args }: { address: Address; functionName: string; args?: readonly unknown[] }) => {
      if (functionName === "factoryVersion") return release.factoryVersion;
      if (functionName === "collectionCreationCodeHash") return release.deployment.collectionCreationCodeHash;
      if (functionName === "systemPlanHash") return release.deployment.systemPlanHash;
      if (functionName === "collections") return [
        release.contracts.factory.address, release.factoryVersion,
        release.deployment.collectionConfigurationHash, release.contracts.collection.runtimeCodeHash,
        1n, true,
      ];
      if (functionName === "collectionId") return release.collectionId;
      if (functionName === "maxSupply") return BigInt(release.economics.maxSupply);
      if (functionName === "nft") return release.contracts.nft.address;
      if (functionName === "distributor") return release.contracts.distributor.address;
      if (functionName === "proceedsVault") return release.contracts.proceedsVault.address;
      if (functionName === "portfolioAllocator") return release.contracts.allocator.address;
      if (functionName === "accountImplementation") return release.contracts.accountImplementation.address;
      if (functionName === "eligibilityPolicy") return release.dependencies.eligibilityPolicy.address;
      if (functionName === "creator") return release.roles.creator;
      if (functionName === "openSeaManager") return release.roles.openSeaManager;
      if (functionName === "sinjohFeeRecipient") return release.roles.sinjoh;
      if (functionName === "revenueRouter") return release.contracts.revenueRouter.address;
      if (functionName === "collectionTimelock") return release.roles.timelock;
      if (functionName === "guardian") return release.roles.guardian;
      if (functionName === "collection") return release.contracts.collection.address;
      if (functionName === "seaDrop") return release.dependencies.seaDrop.address;
      if (functionName === "royaltyReceiver") return release.contracts.revenueRouter.address;
      if (functionName === "royaltyBps") return BigInt(release.economics.secondaryRoyaltyBps);
      if (functionName === "owner") return release.roles.timelock;
      if (functionName === "getCreatorPayoutAddress") return release.contracts.proceedsVault.address;
      if (functionName === "getPublicDrop") return {
        ...release.openSea.publicDrop,
        mintPrice: BigInt(release.openSea.publicDrop.mintPrice),
      };
      if (functionName === "getAllowedFeeRecipients") return release.openSea.allowedFeeRecipients;
      if (functionName === "getAllowListMerkleRoot") return release.openSea.allowListMerkleRoot;
      if (functionName === "getPayers") return release.openSea.allowedPayers;
      if (functionName === "getSigners") return [];
      if (functionName === "getTokenGatedAllowedTokens") return [];
      if (functionName === "implementation") {
        const binding = release.equityAssets[0]!.implementationBinding!;
        if (binding.kind !== "beacon") throw new Error("expected beacon fixture");
        return binding.implementation;
      }
      if ([release.contracts.coreSleeve.address, release.contracts.marketMakingSleeve.address,
        release.contracts.usdgSleeve.address].some(
        (sleeve) => sleeve.toLowerCase() === address.toLowerCase(),
      ) && ["maximumStrategies", "maximumAdapterCapBps", "maximumOperatorLossBps"]
        .includes(functionName)) {
        const policy = address.toLowerCase() === release.contracts.coreSleeve.address.toLowerCase()
          ? release.policyCaps.core
          : address.toLowerCase() === release.contracts.marketMakingSleeve.address.toLowerCase()
            ? release.policyCaps.marketMaking
            : release.policyCaps.usdg;
        return policy[functionName as keyof typeof policy];
      }
      if (functionName in release.economics) {
        return release.economics[functionName as keyof typeof release.economics];
      }
      const infrastructure = release.deltaInfrastructure[0]!;
      if (functionName === "deltaPoolController") {
        return release.contracts.deltaPoolController.address;
      }
      const controllerCaps: Record<string, number> = {
        maximumAdapterCapBps: release.policyCaps.marketMaking.maximumAdapterCapBps,
        maximumOperatorLossBps: release.policyCaps.marketMaking.maximumOperatorLossBps,
        maximumPoolFeedHeartbeat: release.policyCaps.deltaPoolFeed.maximumHeartbeat,
        maximumPoolFeedGracePeriod: release.policyCaps.deltaPoolFeed.maximumGracePeriod,
        minimumPoolTwapWindow: release.policyCaps.deltaPoolFeed.minimumTwapWindow,
        maximumPoolReferenceDeviationBps:
          release.policyCaps.deltaPoolFeed.maximumReferenceDeviationBps,
        maximumPoolSpotDeviationBps: release.policyCaps.deltaPoolFeed.maximumSpotDeviationBps,
      };
      if (address.toLowerCase() === release.contracts.deltaPoolController.address.toLowerCase()
        && functionName in controllerCaps) return controllerCaps[functionName];
      if (functionName === "isRegistrar") return true;
      if (functionName === "infrastructureOfFactory") return [
        infrastructure.positionManager,
        infrastructure.positionBuilder,
        infrastructure.factoryRuntimeCodeHash,
        infrastructure.positionManagerRuntimeCodeHash,
        infrastructure.positionBuilderRuntimeCodeHash,
        infrastructure.routeCreationCodeHash,
        infrastructure.sleeveCreationCodeHash,
        infrastructure.adapterCreationCodeHash,
        infrastructure.feedCreationCodeHash,
        infrastructure.active,
      ];
      const controllerAddresses: Record<string, Address> = {
        allocator: release.contracts.allocator.address,
        collection: release.contracts.collection.address,
        timelock: release.roles.timelock,
        guardian: release.roles.guardian,
        weth: release.dependencies.WETH.address,
        eligibilityPolicy: release.dependencies.eligibilityPolicy.address,
        priceHub: release.contracts.priceHub.address,
        strategyRegistry: release.contracts.strategyRegistry.address,
      };
      if (address.toLowerCase() === release.contracts.deltaPoolController.address.toLowerCase()
        && functionName in controllerAddresses) return controllerAddresses[functionName];
      if (functionName === "weth" || functionName === "WETH9") {
        return release.dependencies.WETH.address;
      }
      if (functionName === "rebalanceValueGuard") {
        return release.contracts.rebalanceValueGuard.address;
      }
      if (functionName === "uniFactory") return infrastructure.factory;
      if (functionName === "positionManager") return infrastructure.positionManager;
      if (functionName === "factory") return infrastructure.factory;
      if (functionName === "routeBinding") {
        const binding = release.routeBindings.allocations.find((entry) =>
          entry.inputAsset.toLowerCase() === String(args?.[0]).toLowerCase()
          && entry.sleeve.toLowerCase() === String(args?.[1]).toLowerCase());
        if (binding) return [binding.route, binding.runtimeCodeHash];
      }
      if (functionName === "rebalanceRoute") {
        const binding = release.routeBindings.rebalances.find((entry) =>
          entry.inputAsset.toLowerCase() === String(args?.[0]).toLowerCase());
        if (binding) return [binding.route, binding.runtimeCodeHash];
      }
      throw new Error(`unexpected ${functionName}`);
    },
  } as never, release);
  assert.ok(results.length > 110);
  assert.ok(results.every((result) => result.ok), JSON.stringify(
    results.filter((result) => !result.ok), null, 2,
  ));

  release.economics.exitTaxBps = 501 as 500;
  assert.throws(() => validateYieldBankManifest(release), /economics mismatch/);
});

test("Yield Bank token reads named allocation tuples in Viem's object shape", async () => {
  const release = manifest();
  const target = {
    requester: addresses[2],
    deltaPool: "0x0000000000000000000000000000000000000000" as Address,
    coreWeightBps: 2_500,
    marketMakingWeightBps: 0,
    usdgWeightBps: 7_500,
    maximumAdapterLossBps: 100,
    revision: 4n,
    executedRevision: 3n,
    requestedAt: 1_700_000_000,
    validUntil: 1_700_003_600,
    executedAt: 1_699_999_000,
  } as const;
  const view = await readYieldBankToken({
    readContract: async ({ functionName }: { functionName: string }) => {
      if (functionName === "state") return 1n;
      if (functionName === "tokenState") return 2n;
      if (functionName === "liveSupply" || functionName === "mintedSupply") return 10n;
      if (functionName === "maxSupply") return BigInt(release.economics.maxSupply);
      if (functionName === "accountOf") return addresses[1];
      if (functionName === "ownerOf") return addresses[2];
      if (functionName === "tokenURI") return "ipfs://yield-banks/42";
      if (functionName === "pendingBackingOf") return 0n;
      if (functionName === "primaryStateOf") return 2n;
      if (functionName === "allocationTargetOf") return target;
      if (functionName === "activeDeltaPoolOf") {
        return "0x0000000000000000000000000000000000000000";
      }
      if (functionName === "balanceOf") return 100n;
      if (functionName === "pending" || functionName === "cumulativeSettled") return 0n;
      if (functionName === "totalSupply") return 1_000n;
      if (functionName === "totalAssetsUsd18") return [1_000_000n, 1_700_000_000n];
      if (functionName === "activeStrategyCount") return 0n;
      if (functionName === "depositsPaused") return false;
      if (functionName === "inventoryAssets" || functionName === "adapters") return [];
      if (functionName === "solvent") return true;
      throw new Error(`unexpected ${functionName}`);
    },
  } as never, release, 42n, { now: 1_700_000_100 });

  assert.deepEqual(view.allocationTarget, { ...target, pending: true });
  assert.equal(view.portfolioValueUsd18, 300_000n);
  assert.deepEqual(view.currentAllocationBps, [3_333, 3_333, 3_334]);
});

test("Yield Bank token fails closed when the active Delta pool has no controller foundation", async () => {
  const release = manifest();
  const unknownPool = "0x00000000000000000000000000000000000000ff" as Address;
  await assert.rejects(() => readYieldBankToken({
    readContract: async ({ functionName }: { functionName: string }) => {
      if (functionName === "state" || functionName === "tokenState") return 1n;
      if (functionName === "liveSupply" || functionName === "mintedSupply") return 1n;
      if (functionName === "maxSupply") return BigInt(release.economics.maxSupply);
      if (functionName === "accountOf" || functionName === "ownerOf") return addresses[1];
      if (functionName === "tokenURI") return "ipfs://yield-banks/1";
      if (functionName === "pendingBackingOf" || functionName === "primaryStateOf") return 0n;
      if (functionName === "allocationTargetOf") return {
        requester: addresses[1], deltaPool: unknownPool, coreWeightBps: 0,
        marketMakingWeightBps: 10_000, usdgWeightBps: 0, maximumAdapterLossBps: 100,
        revision: 1n, executedRevision: 1n, requestedAt: 1, validUntil: 2, executedAt: 1,
      };
      if (functionName === "activeDeltaPoolOf") return unknownPool;
      if (functionName === "foundationOf") return [
        "0x0000000000000000000000000000000000000000",
        "0x0000000000000000000000000000000000000000",
        `0x${"0".repeat(64)}`, `0x${"0".repeat(64)}`, `0x${"0".repeat(64)}`,
      ];
      throw new Error(`unexpected ${functionName}`);
    },
  } as never, release, 1n), /active Delta pool .* has no controller foundation/);
});

test("Yield Banks manifest binds OpenSea payout and hosted collection", () => {
  const release = manifest();
  release.openSea.creatorPayoutAddress = addresses[5];
  assert.throws(() => validateYieldBankManifest(release), /creatorPayoutAddress/);
  release.openSea.creatorPayoutAddress = release.contracts.proceedsVault.address;
  release.openSea.collectionUrl = "https://example.com/collection/sinjoh-yield-banks/overview";
  assert.throws(() => validateYieldBankManifest(release), /collectionUrl/);
  release.openSea.collectionUrl = "https://opensea.io/collection/sinjoh-yield-banks/overview";
  release.openSea.observedSecondaryRoyaltyBps += 1;
  assert.throws(() => validateYieldBankManifest(release), /observedSecondaryRoyaltyBps/);
  release.openSea.observedSecondaryRoyaltyBps = release.economics.secondaryRoyaltyBps;
  release.openSea.observedSecondaryRoyaltyRecipient = addresses[7];
  assert.throws(() => validateYieldBankManifest(release), /observedSecondaryRoyaltyRecipient/);
});

test("Yield Banks release validation rejects network, proxy, equity, and SeaDrop drift", () => {
  const wrongNetwork = manifest();
  (wrongNetwork as { chainId: number }).chainId = 46_630;
  assert.throws(() => validateYieldBankManifest(wrongNetwork), /mainnet chain 4663/);

  const missingProxyBinding = manifest();
  delete missingProxyBinding.dependencies.USDG.implementationBinding;
  assert.throws(() => validateYieldBankManifest(missingProxyBinding), /implementationBinding is required/);

  const wrongEquityAccounting = manifest();
  wrongEquityAccounting.equityModel.income = "cash-distribution";
  assert.throws(() => validateYieldBankManifest(wrongEquityAccounting), /balance-appreciation/);

  const publicStageDrift = manifest();
  publicStageDrift.openSea.publicDrop.maxTotalMintableByWallet += 1;
  assert.throws(() => validateYieldBankManifest(publicStageDrift), /mintStagesHash/);

  const undeclaredPayer = manifest();
  undeclaredPayer.openSea.allowedPayers = [addresses[24]!];
  assert.throws(() => validateYieldBankManifest(undeclaredPayer), /mintStagesHash/);

  const unsafeAllowlist = manifest();
  unsafeAllowlist.openSea.allowListMerkleRoot = keccak256(toBytes("unsafe-allowlist"));
  unsafeAllowlist.openSea.mintStagesHash = yieldBankMintStagesHash(
    unsafeAllowlist.openSea.publicDrop,
    unsafeAllowlist.openSea.allowedFeeRecipients,
    unsafeAllowlist.openSea.allowListMerkleRoot,
  );
  assert.throws(() => validateYieldBankManifest(unsafeAllowlist), /empty SeaDrop allowlist root/);
});

test("SeaDrop commitment is deterministic across every enumerable mint path", () => {
  const release = manifest();
  const gated = [
    {
      allowedNftToken: addresses[20]!, mintPrice: "200000000000000", maxTotalMintableByWallet: 2,
      startTime: 1_786_214_195, endTime: 1_789_065_395, dropStageIndex: 2,
      maxTokenSupplyForStage: 100, feeBps: 1_000, restrictFeeRecipients: true,
    },
    {
      allowedNftToken: addresses[19]!, mintPrice: "100000000000000", maxTotalMintableByWallet: 1,
      startTime: 1_786_214_195, endTime: 1_789_065_395, dropStageIndex: 1,
      maxTokenSupplyForStage: 50, feeBps: 500, restrictFeeRecipients: false,
    },
  ] as const;
  const signed = [{
    signer: addresses[22]!, minMintPrice: "100000000000000",
    maxMaxTotalMintableByWallet: 4, minStartTime: 1_786_214_195,
    maxEndTime: 1_789_065_395, maxMaxTokenSupplyForStage: 100,
    minFeeBps: 500, maxFeeBps: 1_000,
  }] as const;
  const hash = yieldBankMintStagesHash(
    release.openSea.publicDrop, release.openSea.allowedFeeRecipients,
    release.openSea.allowListMerkleRoot, [addresses[24]!, addresses[23]!], gated, signed,
  );
  const reordered = yieldBankMintStagesHash(
    release.openSea.publicDrop, release.openSea.allowedFeeRecipients,
    release.openSea.allowListMerkleRoot, [addresses[23]!, addresses[24]!],
    [gated[1], gated[0]], signed,
  );
  assert.equal(hash, reordered);
  assert.throws(() => yieldBankMintStagesHash(
    release.openSea.publicDrop, release.openSea.allowedFeeRecipients,
    release.openSea.allowListMerkleRoot, [], [{ ...gated[0], feeBps: 10_000 }], signed,
  ), /invalid token-gated/);
});

test("OpenSea setup and ownership handoff calldata decodes to the exact NFT calls", () => {
  const nft = addresses[1];
  const seaDrop = "0x00005EA00Ac477B1030CE78506496e8C2dE24bf5" as Address;
  const publicDrop = {
    mintPrice: 300_000_000_000_000n, startTime: 1_786_214_195,
    endTime: 1_789_065_395, maxTotalMintableByWallet: 12,
    feeBps: 1_000, restrictFeeRecipients: true,
  } as const;
  const calls = [
    prepareYieldBankSeaDropPublicDrop(nft, seaDrop, publicDrop),
    prepareYieldBankSeaDropAllowListClear(nft, seaDrop),
    prepareYieldBankSeaDropTokenGatedDrop(nft, seaDrop, addresses[2], {
      mintPrice: 200_000_000_000_000n, maxTotalMintableByWallet: 2,
      startTime: 1_786_214_195, endTime: 1_789_065_395,
      dropStageIndex: 1, maxTokenSupplyForStage: 100,
      feeBps: 1_000, restrictFeeRecipients: true,
    }),
    prepareYieldBankSeaDropSignedMintValidation(nft, seaDrop, addresses[3], {
      minMintPrice: 100_000_000_000_000n, maxMaxTotalMintableByWallet: 4,
      minStartTime: 1_786_214_195, maxEndTime: 1_789_065_395,
      maxMaxTokenSupplyForStage: 100, minFeeBps: 500, maxFeeBps: 1_000,
    }),
    prepareYieldBankSeaDropPayout(nft, seaDrop, addresses[4]),
    prepareYieldBankSeaDropFeeRecipient(nft, seaDrop, addresses[5], true),
    prepareYieldBankSeaDropPayer(nft, seaDrop, addresses[6], true),
    prepareYieldBankNftOwnershipTransfer(nft, addresses[7]),
    prepareYieldBankNftOwnershipAcceptance(nft),
  ];
  assert.deepEqual(calls.map((call) => decodeFunctionData({
    abi: yieldBankNftAbi, data: call.data,
  }).functionName), [
    "updatePublicDrop", "updateAllowList", "updateTokenGatedDrop",
    "updateSignedMintValidationParams", "updateCreatorPayoutAddress",
    "updateAllowedFeeRecipient", "updatePayer", "transferOwnership", "acceptOwnership",
  ]);
  assert.ok(calls.every((call) => call.to === nft && call.value === 0n));
  const decodedPublicDrop = decodeFunctionData({ abi: yieldBankNftAbi, data: calls[0]!.data });
  assert.deepEqual(decodedPublicDrop.args, [seaDrop, publicDrop]);
  assert.throws(() => prepareYieldBankSeaDropPublicDrop(nft, seaDrop, {
    ...publicDrop, mintPrice: 0n,
  }), /positive/);
  assert.throws(
    () => prepareYieldBankNftOwnershipTransfer(
      nft, "0x0000000000000000000000000000000000000000",
    ),
    /nonzero/,
  );
});

test("Yield Banks wallet and operator calls match the OpenSea-first flow", () => {
  const collection = addresses[1];
  const settle = prepareYieldBankSettle(collection, 42n);
  const transfer = prepareYieldBankTransfer(addresses[2], addresses[3], addresses[4], 42n, 777n);
  const burn = prepareYieldBankBurn(collection, 42n);
  const claim = prepareYieldBankClaim(collection, 42n);
  const guarded = { minimumOutput: 1n, minimumShares: 1n, routeData: "0x", sleeveData: "0x" } as const;
  const allocation = prepareYieldBankAllocation(addresses[4], 1n, 2n, [guarded, guarded, guarded]);
  const adapterDeposit = prepareYieldBankAdapterDeposit(addresses[4], addresses[5], addresses[6], 10n, 9n);
  const adapterWithdrawal = prepareYieldBankAdapterWithdrawal(addresses[4], addresses[5], addresses[6], 10n, 100);
  const adapterCollection = prepareYieldBankAdapterCollection(addresses[4], addresses[5], addresses[6]);
  const adapterExit = prepareYieldBankAdapterExit(addresses[4], addresses[5], addresses[6], 100);
  const sleeveRedemption = prepareYieldBankSleeveRedemption(
    addresses[5], 10n, addresses[3], addresses[3], [1n],
  );
  const targetAllocation = prepareYieldBankTargetAllocation(
    addresses[11], 42n, [2_500, 0, 7_500],
    "0x0000000000000000000000000000000000000000", 100, 1_900_000_000n,
  );
  const royaltySync = prepareYieldBankRoyaltySync(addresses[11], addresses[1], "0x1234");
  const nativeRoyaltySync = prepareYieldBankNativeRoyaltySync(addresses[11], "0x1234");
  const emptyAllocation = {
    minimumOutput: 0n, minimumShares: 0n, routeData: "0x", sleeveData: "0x",
  } as const;
  const targetExecution = prepareYieldBankTargetExecution(addresses[11], 42n, 3n, {
    redemptions: [
      { minimumOutputs: [1n], adapterCalls: [] },
      { minimumOutputs: [1n], adapterCalls: [] },
      { minimumOutputs: [1n], adapterCalls: [] },
    ],
    deltaPoolRedemption: { minimumOutputs: [], adapterCalls: [] },
    conversions: [{ asset: addresses[1], minimumWethOut: 1n, routeData: "0x" }],
    allocations: [
      { minimumOutput: 1n, minimumShares: 1n, routeData: "0x", sleeveData: "0x" },
      emptyAllocation,
      { minimumOutput: 1n, minimumShares: 1n, routeData: "0x", sleeveData: "0x" },
    ],
    minimumWethRecovered: 1n,
    deadline: 1_800_000_000n,
  });
  assert.equal(settle.value, 0n);
  assert.equal(transfer.value, 0n);
  assert.equal(burn.value, 0n);
  assert.equal(claim.value, 0n);
  assert.equal(allocation.value, 0n);
  assert.equal(adapterDeposit.value, 0n);
  assert.equal(adapterWithdrawal.value, 0n);
  assert.equal(adapterCollection.value, 0n);
  assert.equal(adapterExit.value, 0n);
  assert.equal(sleeveRedemption.value, 0n);
  assert.equal(targetAllocation.value, 0n);
  assert.equal(royaltySync.value, 0n);
  assert.equal(nativeRoyaltySync.value, 0n);
  assert.equal(targetExecution.value, 0n);
  assert.throws(
    () => prepareYieldBankAllocation(addresses[4], 1n, 2n, [
      { ...guarded, minimumOutput: 0n }, guarded, guarded,
    ]),
    /positive minimum output/,
  );
  assert.notEqual(settle.data, burn.data);
  assert.throws(() => prepareYieldBankSettle(collection, 0n), /positive/);
  assert.throws(() => prepareYieldBankBurn(collection, 0n), /positive/);
  assert.throws(
    () => prepareYieldBankTargetAllocation(
      addresses[11], 42n, [5_000, 5_000, 1],
      "0x0000000000000000000000000000000000000000", 100, 1_900_000_000n,
    ),
    /totaling 10000/,
  );
  assert.equal(openSeaCollectionUrl("sinjoh-yield-banks"), "https://opensea.io/collection/sinjoh-yield-banks/overview");
});

test("Delta operator calldata encodes every manual position and slippage decision", () => {
  const deposit = encodeYieldBankDeltaDepositData({
    wethToConvert: 25n,
    minimumPairedAssetOut: 24n,
    routeData: "0x1234",
    rungs: [{
      tickLower: -600, tickUpper: 0, amount0: 10n, amount1: 15n,
      amount0Minimum: 9n, amount1Minimum: 14n,
    }, {
      tickLower: 0, tickUpper: 600, amount0: 15n, amount1: 10n,
      amount0Minimum: 14n, amount1Minimum: 9n,
    }],
    minimumCurrentTick: -60,
    maximumCurrentTick: 60,
    deadline: 1_800_000_000n,
  });
  const [decoded] = decodeAbiParameters([{ type: "tuple", components: [
    { name: "wethToConvert", type: "uint256" },
    { name: "minimumPairedAssetOut", type: "uint256" },
    { name: "routeData", type: "bytes" },
    { name: "rungs", type: "tuple[]", components: [
      { name: "tickLower", type: "int24" }, { name: "tickUpper", type: "int24" },
      { name: "amount0", type: "uint256" }, { name: "amount1", type: "uint256" },
      { name: "amount0Min", type: "uint256" }, { name: "amount1Min", type: "uint256" },
    ] },
    { name: "minimumCurrentTick", type: "int24" },
    { name: "maximumCurrentTick", type: "int24" },
    { name: "deadline", type: "uint256" },
  ] }], deposit);
  assert.equal(decoded.wethToConvert, 25n);
  assert.equal(decoded.rungs.length, 2);
  assert.equal(decoded.rungs[1]!.amount1Min, 9n);
  assert.equal(decoded.maximumCurrentTick, 60);

  assert.match(encodeYieldBankDeltaDepositData({
    wethToConvert: 2n,
    minimumPairedAssetOut: 1n,
    routeData: "0x",
    rungs: [{
      tickLower: -600, tickUpper: 600, amount0: 1n, amount1: 1n,
      amount0Minimum: 1n, amount1Minimum: 1n,
    }, {
      tickLower: -300, tickUpper: 300, amount0: 1n, amount1: 1n,
      amount0Minimum: 1n, amount1Minimum: 1n,
    }],
    minimumCurrentTick: -60,
    maximumCurrentTick: 60,
    deadline: 1_800_000_000n,
  }), /^0x[0-9a-f]+$/);

  const action = {
    tokenId: 7n, liquidity: 1_000n, amount0Minimum: 50n, amount1Minimum: 40n,
  } as const;
  assert.match(encodeYieldBankDeltaWithdrawalData({
    actions: [action], pairedAssetToConvert: 40n, minimumWethOut: 38n,
    wethToReturn: 88n, routeData: "0xab", deadline: 1_800_000_001n,
  }), /^0x[0-9a-f]+$/);
  assert.match(encodeYieldBankDeltaCollectionData([7n, 8n]), /^0x[0-9a-f]+$/);
  assert.match(encodeYieldBankDeltaExitData({
    actions: [action], deadline: 1_800_000_002n,
  }), /^0x[0-9a-f]+$/);
  assert.throws(() => encodeYieldBankDeltaCollectionData([7n, 7n]), /unique positive/);
  assert.throws(() => encodeYieldBankDeltaDepositData({
    wethToConvert: 1n, minimumPairedAssetOut: 1n, routeData: "0x",
    rungs: [{
      tickLower: -60, tickUpper: 60, amount0: 1n, amount1: 0n,
      amount0Minimum: 2n, amount1Minimum: 0n,
    }],
    minimumCurrentTick: -60, maximumCurrentTick: 60, deadline: 1n,
  }), /invalid Delta rung/);
});
