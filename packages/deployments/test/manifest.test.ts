import { strict as assert } from "node:assert";
import { test } from "node:test";
import { getAddress, keccak256, type Address, type Hex } from "viem";
import { mainnet } from "../src/generated/mainnet.js";
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
      unhashed: { address: "0x4444444444444444444444444444444444444444" as Address }
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
      if (address === manifest.contracts.proxy.implementation) return "0xbeef";
      if (address === manifest.dependencies.upstream.address) return "0xbeef";
      return code;
    }
  };
  const results = await verifyManifest(client, manifest);
  assert.equal(results.length, 6, "contracts, dependencies, and implementations are verified");
  const byKey = new Map(results.map((result) => [result.key, result]));
  assert.equal(byKey.get("good")?.ok, true);
  assert.equal(byKey.get("bad")?.ok, false);
  assert.equal(byKey.get("empty")?.ok, false);
  assert.equal(byKey.get("empty")?.actual, null);
  assert.equal(byKey.get("proxy")?.ok, true);
  assert.equal(byKey.get("proxy.implementation")?.ok, true);
  assert.equal(byKey.get("dependencies.upstream")?.ok, false);
  assert.equal(allVerified(results), false);
  assert.equal(allVerified([byKey.get("good")!]), true);
  assert.equal(allVerified([]), false, "empty verification never passes");
  await assert.rejects(
    verifyManifest(client, manifest, { keys: ["missing"] }), /no entry/
  );
});
