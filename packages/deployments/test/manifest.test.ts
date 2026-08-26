import { strict as assert } from "node:assert";
import { test } from "node:test";
import { getAddress, keccak256, type Address, type Hex } from "viem";
import { mainnet } from "../src/generated/mainnet.js";
import type { DeploymentEntry } from "../src/types.js";
import { allVerified, verifyManifest, type CodeReader } from "../src/verify.js";

const ADDRESS = /^0x[0-9a-fA-F]{40}$/;
const HASH32 = /^0x[0-9a-f]{64}$/;

test("mainnet manifest identifies Robinhood Chain", () => {
  assert.equal(mainnet.chainId, 4663);
  assert.ok(mainnet.rpcUrl.startsWith("https://"));
  assert.ok(mainnet.explorerUrl.startsWith("https://"));
});

test("every contract entry is checksummed with well-formed metadata", () => {
  const entries = Object.entries(mainnet.contracts);
  assert.ok(entries.length >= 30, `only ${entries.length} contracts`);
  for (const [key, entry] of entries) {
    assert.ok(ADDRESS.test(entry.address), `${key} address`);
    assert.equal(entry.address, getAddress(entry.address), `${key} checksum`);
    const record = entry as { runtimeCodeHash?: string; deploymentBlock?: number };
    if (record.runtimeCodeHash !== undefined) {
      assert.ok(HASH32.test(record.runtimeCodeHash), `${key} runtimeCodeHash`);
    }
    if (record.deploymentBlock !== undefined) {
      assert.ok(Number.isInteger(record.deploymentBlock) && record.deploymentBlock > 0,
        `${key} deploymentBlock`);
    }
  }
  for (const [key, entry] of [
    ...Object.entries(mainnet.contracts),
    ...Object.entries(mainnet.dependencies).map(([key, entry]) => [`dependencies.${key}`, entry] as const),
    ...Object.entries(mainnet.roles).map(([key, entry]) => [`roles.${key}`, entry] as const),
  ]) {
    const classified = entry as DeploymentEntry;
    assert.ok(classified.runtimeCodeHash || classified.kind === "eoa",
      `${key} must be contract-hashed or EOA`);
    if (classified.kind === "eoa") {
      assert.equal(classified.runtimeCodeHash, undefined, `${key} EOA hash`);
    }
  }
});

test("core infrastructure is present under stable keys", () => {
  for (const key of [
    "agnosticFeeRouterFactory", "revenueCollector", "airdropDistributor",
    "liquidityManagerV3", "raffleFactory", "ecvrfRandomness", "fundingBands.manager",
    "launchStakingEngine"
  ]) {
    assert.ok(key in mainnet.contracts, `missing ${key}`);
  }
  assert.ok("weth" in mainnet.dependencies, "missing weth dependency");
});

test("Project V2 uses the public-Pons production generation", () => {
  assert.equal(mainnet.contracts["projectV2.launcher"]?.address,
    "0xbf9c48Bd4784016065613Fbde7bbc2BcA017FA7E");
  assert.equal(mainnet.contracts["projectV2.registry"]?.address,
    "0xc8297e34aD37A8A6D9f237Eda996Ee207d23188A");
  assert.equal(mainnet.contracts["projectV2.deploymentEngine"]?.address,
    "0xf94acC8857e4EF5Be78aB6D53c8CbdDDBF22F460");
  assert.equal(mainnet.contracts["projectV2.launchValidator"]?.address,
    "0xe746519A82BD3E8356b502A5083e8873a3f15099");
  assert.equal(mainnet.contracts["projectV2.ponsProjectAdapterFactory"]?.address,
    "0x37617C7603032b6a8437365d1582Fcb0B003501F");
  assert.equal(mainnet.contracts["projectV2.ponsProjectAdapterImplementation"]?.address,
    "0xF4a58F32200dc92D86D3f02CA1F2c909F1366Cb6");
  assert.equal(
    mainnet.contracts[
      "projectV2Generations.project-v2-gascap-20260825-3d6dd81.launcher"
    ]?.address,
    "0x2260655205Ad66D1034d3C8afA46E6168C9C48Ff",
  );
  assert.equal(
    mainnet.contracts[
      "projectV2Generations.project-v2-routing-complete-20260825-3b5dc15.launcher"
    ]?.address,
    "0x4b748848f16DAA81D09d8743Ced4A9604bc7de69",
  );
});

test("ordinary Pons V2 uses one coherent current buyback generation", () => {
  assert.equal(mainnet.contracts.ponsV2PairBuybackAdapter?.address,
    "0x1BE0E8F04221329FDfea34f41a1832a80c2c147c");
  assert.equal(mainnet.contracts.ponsV2PairBuybackPriceGuard?.address,
    "0x902A6Fa8Ca273aAB186633FF27879Cd3703F6AED");
  assert.equal(
    mainnet.contracts[
      "ponsV2PairBuybackHistoricalGenerations.indexedLegacyFactory.adapter"
    ]?.address,
    "0xfAB57a5fE409B4503A1a09fD7DC80e6ffB85Abb8",
  );
  assert.equal(
    mainnet.contracts[
      "ponsV2PairBuybackHistoricalGenerations.indexedLegacyFactory.priceGuard"
    ]?.address,
    "0x69768f0b41A5A51aB23b23ccfbE9e3122Ac0DA8b",
  );
});

test("launch staking pins the reviewed multi-token deployment", () => {
  const entry = mainnet.contracts.launchStakingEngine;
  assert.equal(entry.address, "0x1f20bF432206C133C08FCCaC4857B22e2327CE2b");
  assert.equal(entry.deploymentTransaction,
    "0x2271aaa33905873d5dd0486e042cb5118e3703460205016edf5c2cb37ccc1bbd");
  assert.equal(entry.deploymentBlock, 41666632);
  assert.equal(entry.runtimeCodeHash,
    "0x4da43ef12471fdfefd88fdb3eebf47dbe13aee37ddb752bc7ab2a92f26876d34");
});

test("verifyManifest compares live code hashes and flags mismatches", async () => {
  const code = "0x60016001" as Hex;
  const manifest = {
    contracts: {
      good: {
        address: "0x1111111111111111111111111111111111111111" as Address,
        runtimeCodeHash: keccak256(code)
      },
      bad: {
        address: "0x2222222222222222222222222222222222222222" as Address,
        runtimeCodeHash: keccak256("0xdeadbeef" as Hex)
      },
      empty: {
        address: "0x3333333333333333333333333333333333333333" as Address,
        runtimeCodeHash: keccak256(code)
      },
      proxy: {
        address: "0x5555555555555555555555555555555555555555" as Address,
        implementation: "0x6666666666666666666666666666666666666666" as Address,
        runtimeCodeHash: keccak256(code),
        implementationRuntimeCodeHash: keccak256("0xbeef" as Hex)
      },
      unhashed: { address: "0x4444444444444444444444444444444444444444" as Address },
      eoa: {
        address: "0x8888888888888888888888888888888888888888" as Address,
        kind: "eoa" as const,
      }
    },
    dependencies: {
      upstream: {
        address: "0x7777777777777777777777777777777777777777" as Address,
        runtimeCodeHash: keccak256("0xcafe" as Hex),
      },
    },
  };
  const client: CodeReader = {
    getCode: async ({ address }) => {
      if (address === manifest.contracts.empty.address) return undefined;
      if (address === manifest.contracts.eoa.address) return undefined;
      if (address === manifest.contracts.proxy.implementation) return "0xbeef";
      if (address === manifest.dependencies.upstream.address) return "0xbeef";
      return code;
    }
  };
  const results = await verifyManifest(client, manifest);
  assert.equal(results.length, 8, "every address, dependency, and implementation is verified");
  const byKey = new Map(results.map((result) => [result.key, result]));
  assert.equal(byKey.get("good")?.ok, true);
  assert.equal(byKey.get("bad")?.ok, false);
  assert.equal(byKey.get("empty")?.ok, false);
  assert.equal(byKey.get("empty")?.actual, null);
  assert.equal(byKey.get("proxy")?.ok, true);
  assert.equal(byKey.get("proxy.implementation")?.ok, true);
  assert.equal(byKey.get("dependencies.upstream")?.ok, false);
  assert.equal(byKey.get("unhashed")?.expectedKind, "unclassified");
  assert.equal(byKey.get("unhashed")?.ok, false);
  assert.equal(byKey.get("eoa")?.expectedKind, "eoa");
  assert.equal(byKey.get("eoa")?.ok, true);
  assert.equal(allVerified(results), false);
  assert.equal(allVerified([byKey.get("good")!]), true);
  assert.equal(allVerified([]), false, "empty verification never passes");
  await assert.rejects(
    verifyManifest(client, manifest, { keys: ["missing"] }), /no entry/
  );
  await assert.rejects(
    verifyManifest(client, {
      contracts: {
        contradictory: {
          address: "0x9999999999999999999999999999999999999999" as Address,
          kind: "eoa",
          runtimeCodeHash: keccak256(code),
        },
      },
    }),
    /classified as eoa/,
  );
  await assert.rejects(
    verifyManifest(client, {
      contracts: {
        incompleteProxy: {
          address: "0x9999999999999999999999999999999999999999" as Address,
          runtimeCodeHash: keccak256(code),
          implementation: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as Address,
        },
      },
    }),
    /implementation address but no implementation hash/,
  );
});

test("verifyManifest binds EIP-1967 proxies and beacons to their active implementations", async () => {
  const code = "0x60016001" as Hex;
  const implementation = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as Address;
  const word = `0x${"0".repeat(24)}${implementation.slice(2)}` as Hex;
  const manifest = {
    contracts: {
      proxy: {
        address: "0x1111111111111111111111111111111111111111" as Address,
        runtimeCodeHash: keccak256(code),
        implementation,
        implementationRuntimeCodeHash: keccak256(code),
        implementationBinding: { kind: "eip1967" as const, slot: `0x${"22".repeat(32)}` as Hex },
      },
      beacon: {
        address: "0x2222222222222222222222222222222222222222" as Address,
        runtimeCodeHash: keccak256(code),
        implementation,
        implementationRuntimeCodeHash: keccak256(code),
        implementationBinding: { kind: "beacon" as const },
      },
    },
  };
  const client: CodeReader = {
    getCode: async () => code,
    getStorageAt: async () => word,
    call: async () => ({ data: word }),
  };
  const results = await verifyManifest(client, manifest);
  const bindings = results.filter((result) => result.expectedKind === "implementation-binding");
  assert.equal(bindings.length, 2);
  assert.ok(bindings.every((result) => result.ok));
  assert.ok(allVerified(results));

  const mismatched = await verifyManifest({
    ...client,
    call: async () => ({ data: `0x${"0".repeat(24)}${"cc".repeat(20)}` as Hex }),
  }, manifest, { keys: ["beacon"] });
  assert.equal(mismatched.at(-1)?.expectedKind, "implementation-binding");
  assert.equal(mismatched.at(-1)?.ok, false);
  assert.equal(allVerified(mismatched), false);
});
