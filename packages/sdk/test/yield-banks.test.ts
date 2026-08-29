import assert from "node:assert/strict";
import test from "node:test";
import { decodeAbiParameters, keccak256, toBytes, type Address, type Hex } from "viem";
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
  prepareYieldBankSettle,
  prepareYieldBankSleeveRedemption,
  prepareYieldBankTransfer,
  validateYieldBankManifest,
  verifyYieldBankManifest,
  type YieldBankManifestEntry,
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

function manifest(): YieldBankReleaseManifest {
  const keys = [
    "registry", "factoryDeployer", "factory", "collection", "nft", "accountImplementation", "proceedsVault", "distributor",
    "revenueRouter", "operationsReserve", "timelock", "allocator", "priceHub",
    "strategyRegistry", "renderer", "coreSleeve", "marketMakingSleeve", "usdgSleeve",
  ] as const;
  return {
    schemaVersion: "1.0",
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
      maxSupply: 777, primaryBackingBps: 7500, primaryCreatorBps: 1200,
      primarySinjohBps: 800, primaryOperationsBps: 500, exitTaxBps: 500,
      royaltyBackingBps: 6000, royaltyCreatorBps: 2000,
      royaltySinjohBps: 1000, royaltyOperationsBps: 1000,
      coreWeightBps: 4000, marketMakingWeightBps: 3750, usdgWeightBps: 2250,
    },
    policyCaps: {
      core: { maximumStrategies: 1, maximumAdapterCapBps: 5000, maximumOperatorLossBps: 100 },
      marketMaking: { maximumStrategies: 1, maximumAdapterCapBps: 5000, maximumOperatorLossBps: 100 },
      usdg: { maximumStrategies: 1, maximumAdapterCapBps: 5000, maximumOperatorLossBps: 100 },
    },
    contracts: Object.fromEntries(keys.map((key, index) => [key, entry(addresses[index]!)])) as
      YieldBankReleaseManifest["contracts"],
    openSea: {
      collectionSlug: "sinjoh-yield-banks",
      collectionUrl: "https://opensea.io/collection/sinjoh-yield-banks/overview",
      mintStagesHash: keccak256(toBytes("mint-stages")),
      creatorPayoutAddress: addresses[6],
      observedPrimaryPlatformFeeBps: 1000,
      observedAt: "2026-08-28T16:00:00Z",
    },
    dependencies: {
      WETH: entry("0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73"),
      USDG: entry("0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168"),
      seaDrop: entry("0x00005EA00Ac477B1030CE78506496e8C2dE24bf5"),
      seaport: entry("0x0000000000000068F116a894984e2DB1123eB395"),
      INJOH: entry(addresses[18]),
      deltaPositionBuilder: entry(addresses[19]),
      v3Factory: entry(addresses[20]),
      v3PositionManager: entry(addresses[21]),
    },
    stockTokens: [entry(addresses[0])],
    adapters: {
      deltaV3LP: entry(addresses[22]),
      deltaEntryRoute: entry(addresses[23]),
      deltaExitRoute: entry(addresses[24]),
    },
    feeds: { stockTokenOne: entry(addresses[5]) },
    pools: { injohWeth: entry(addresses[25]) },
    delta: {
      adapter: addresses[22], injoh: addresses[18], pool: addresses[25],
      positionBuilder: addresses[19], factory: addresses[20],
      positionManager: addresses[21], entryRoute: addresses[23], exitRoute: addresses[24],
      maximumPositions: 8, adapterCapBps: 4_000,
    },
    roles: {
      creator: addresses[0], sinjoh: addresses[1], operations: addresses[2],
      allocationOperator: addresses[4], guardian: addresses[3], timelock: addresses[8],
    },
    auditHashes: [keccak256(toBytes("independent-audit"))],
  };
}

test("Yield Banks manifest validates immutable economics and live code", async () => {
  const release = manifest();
  validateYieldBankManifest(release);
  const results = await verifyYieldBankManifest({
    getCode: async () => runtime,
    readContract: async ({ address, functionName }: { address: Address; functionName: string }) => {
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
      if (functionName === "collection") return release.contracts.collection.address;
      if (functionName === "seaDrop") return release.dependencies.seaDrop.address;
      if (functionName === "royaltyReceiver") return release.contracts.revenueRouter.address;
      if (functionName === "ROYALTY_BPS") return 500n;
      if (functionName in release.economics) {
        return release.economics[functionName as keyof typeof release.economics];
      }
      const deltaAddresses: Record<string, Address> = {
        sleeve: release.contracts.marketMakingSleeve.address,
        accountingAsset: release.dependencies.WETH.address,
        injoh: release.delta.injoh,
        priceHub: release.contracts.priceHub.address,
        pool: release.delta.pool,
        factory: release.delta.factory,
        positionManager: release.delta.positionManager,
        positionBuilder: release.delta.positionBuilder,
        entryRoute: release.delta.entryRoute,
        exitRoute: release.delta.exitRoute,
      };
      if (functionName in deltaAddresses) return deltaAddresses[functionName];
      if (functionName === "maximumPositions") return BigInt(release.delta.maximumPositions);
      if (functionName === "recordOf") return [
        release.delta.adapter, release.adapters.deltaV3LP!.runtimeCodeHash,
        keccak256(toBytes("YIELD_BANK_MARKET_MAKING")), release.dependencies.WETH.address,
        1n, 1n,
      ];
      if (functionName === "adapterState") return 3n;
      if (functionName === "adapterCapBps") return BigInt(release.delta.adapterCapBps);
      throw new Error(`unexpected ${functionName}`);
    },
  } as never, release);
  assert.equal(results.length, 79);
  assert.ok(results.every((result) => result.ok));

  release.economics.exitTaxBps = 501 as 500;
  assert.throws(() => validateYieldBankManifest(release), /economics mismatch/);
});

test("Yield Banks manifest binds OpenSea payout and hosted collection", () => {
  const release = manifest();
  release.openSea.creatorPayoutAddress = addresses[5];
  assert.throws(() => validateYieldBankManifest(release), /creatorPayoutAddress/);
  release.openSea.creatorPayoutAddress = release.contracts.proceedsVault.address;
  release.openSea.collectionUrl = "https://example.com/collection/sinjoh-yield-banks/overview";
  assert.throws(() => validateYieldBankManifest(release), /collectionUrl/);
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
    addresses[5], 10n, addresses[3], addresses[3], 1n,
  );
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
  assert.throws(
    () => prepareYieldBankAllocation(addresses[4], 1n, 2n, [
      { ...guarded, minimumOutput: 0n }, guarded, guarded,
    ]),
    /positive minimum output/,
  );
  assert.notEqual(settle.data, burn.data);
  assert.throws(() => prepareYieldBankSettle(collection, 0n), /positive/);
  assert.throws(() => prepareYieldBankBurn(collection, 0n), /positive/);
  assert.equal(openSeaCollectionUrl("sinjoh-yield-banks"), "https://opensea.io/collection/sinjoh-yield-banks/overview");
});

test("Delta operator calldata encodes every manual position and slippage decision", () => {
  const deposit = encodeYieldBankDeltaDepositData({
    wethToConvert: 25n,
    minimumInjohOut: 24n,
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
    { name: "minimumInjohOut", type: "uint256" },
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
    minimumInjohOut: 1n,
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
    actions: [action], injohToConvert: 40n, minimumWethOut: 38n,
    wethToReturn: 88n, routeData: "0xab", deadline: 1_800_000_001n,
  }), /^0x[0-9a-f]+$/);
  assert.match(encodeYieldBankDeltaCollectionData([7n, 8n]), /^0x[0-9a-f]+$/);
  assert.match(encodeYieldBankDeltaExitData({
    actions: [action], deadline: 1_800_000_002n,
  }), /^0x[0-9a-f]+$/);
  assert.throws(() => encodeYieldBankDeltaCollectionData([7n, 7n]), /unique positive/);
  assert.throws(() => encodeYieldBankDeltaDepositData({
    wethToConvert: 1n, minimumInjohOut: 1n, routeData: "0x",
    rungs: [{
      tickLower: -60, tickUpper: 60, amount0: 1n, amount1: 0n,
      amount0Minimum: 2n, amount1Minimum: 0n,
    }],
    minimumCurrentTick: -60, maximumCurrentTick: 60, deadline: 1n,
  }), /invalid Delta rung/);
});
