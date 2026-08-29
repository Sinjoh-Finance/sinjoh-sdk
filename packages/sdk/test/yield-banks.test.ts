import assert from "node:assert/strict";
import test from "node:test";
import { keccak256, toBytes, type Address, type Hex } from "viem";
import {
  prepareYieldBankBurn,
  openSeaCollectionUrl,
  prepareYieldBankAllocation,
  prepareYieldBankAdapterCollection,
  prepareYieldBankAdapterDeposit,
  prepareYieldBankAdapterExit,
  prepareYieldBankAdapterWithdrawal,
  prepareYieldBankClaim,
  prepareYieldBankSettle,
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
    },
    stockTokens: [entry(addresses[0])],
    adapters: {},
    feeds: { stockTokenOne: entry(addresses[5]) },
    pools: {},
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
    readContract: async ({ functionName }: { functionName: string }) => {
      if (functionName === "factoryVersion") return release.factoryVersion;
      if (functionName === "collectionCreationCodeHash") return release.deployment.collectionCreationCodeHash;
      if (functionName === "systemPlanHash") return release.deployment.systemPlanHash;
      if (functionName === "collections") return [
        release.contracts.factory.address, release.factoryVersion,
        release.deployment.collectionConfigurationHash, release.contracts.collection.runtimeCodeHash,
        1n, true,
      ];
      if (functionName in release.economics) {
        return release.economics[functionName as keyof typeof release.economics];
      }
      throw new Error(`unexpected ${functionName}`);
    },
  } as never, release);
  assert.equal(results.length, 39);
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
  assert.equal(settle.value, 0n);
  assert.equal(transfer.value, 0n);
  assert.equal(burn.value, 0n);
  assert.equal(claim.value, 0n);
  assert.equal(allocation.value, 0n);
  assert.equal(adapterDeposit.value, 0n);
  assert.equal(adapterWithdrawal.value, 0n);
  assert.equal(adapterCollection.value, 0n);
  assert.equal(adapterExit.value, 0n);
  assert.throws(
    () => prepareYieldBankAllocation(addresses[4], 1n, 2n, [
      { ...guarded, minimumOutput: 0n }, guarded, guarded,
    ]),
    /positive minimum output/,
  );
  assert.notEqual(settle.data, burn.data);
  assert.equal(openSeaCollectionUrl("sinjoh-yield-banks"), "https://opensea.io/collection/sinjoh-yield-banks/overview");
});
