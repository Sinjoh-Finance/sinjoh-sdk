import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFile, mkdir, mkdtemp, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";

const repositoryRoot = resolve(import.meta.dirname, "../../..");

async function runGenerator(
  dependencies: Record<string, unknown>,
  currentInfrastructure: Record<string, unknown> = {},
) {
  const root = await mkdtemp(join(tmpdir(), "sinjoh-deployment-generator-"));
  const script = join(root, "tools", "gen-deployments.mjs");
  await mkdir(dirname(script), { recursive: true });
  await mkdir(join(root, "packages", "deployments", "src", "generated"), { recursive: true });
  await copyFile(join(repositoryRoot, "tools", "gen-deployments.mjs"), script);
  await symlink(join(repositoryRoot, "node_modules"), join(root, "node_modules"));
  await writeFile(join(root, "mainnet-deployments.json"), JSON.stringify({
    chainId: 4663,
    rpcUrl: "https://rpc.test",
    explorerUrl: "https://explorer.test",
    deployer: { address: "0x1111111111111111111111111111111111111111", kind: "eoa" },
    governance: { address: "0x2222222222222222222222222222222222222222", kind: "eoa" },
    status: "test",
    currentInfrastructure,
    dependencies,
  }));
  return spawnSync(process.execPath, [script], { encoding: "utf8" });
}

test("deployment generation rejects malformed or unclassified trust metadata", async () => {
  for (const [value, expected] of [
    [{ bad: "0x123" }, /bad: invalid hex value/],
    [{ bad: { address: 7 } }, /bad: invalid address/],
    [{ bad: { address: "0x3333333333333333333333333333333333333333", deploymentTransaction: 7 } },
      /bad: invalid deploymentTransaction/],
    [{ bad: { address: "0x3333333333333333333333333333333333333333" } },
      /bad: contract is missing runtimeCodeHash/],
    [{ bad: {
      address: "0x3333333333333333333333333333333333333333",
      runtimeCodeHash: `0x${"11".repeat(32)}`,
      implementation: "0x4444444444444444444444444444444444444444",
    } }, /implementation and implementationRuntimeCodeHash must be paired/],
    [{ bad: {
      address: "0x3333333333333333333333333333333333333333",
      runtimeCodeHash: `0x${"11".repeat(32)}`,
      implementationBinding: { kind: "beacon" },
    } }, /invalid implementationBinding/],
  ] as const) {
    const result = await runGenerator(value);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, expected);
  }
});

test("deployment generation accepts the canonical companion-hash manifest shape", async () => {
  const currentInfrastructure = Object.fromEntries(Array.from({ length: 30 }, (_, index) => [
    `contract${index}`,
    {
      address: `0x${(index + 1).toString(16).padStart(40, "0")}`,
      runtimeCodeHash: `0x${(index + 1).toString(16).padStart(64, "0")}`,
    },
  ]));
  const result = await runGenerator({
    factory: "0x3333333333333333333333333333333333333333",
    factoryRuntimeCodeHash: `0x${"11".repeat(32)}`,
  }, currentInfrastructure);
  assert.equal(result.status, 0, result.stderr);
});

test("deployment generation classifies Funding Bands historical authority roles as EOAs", async () => {
  const currentInfrastructure: Record<string, unknown> = Object.fromEntries(Array.from({ length: 30 }, (_, index) => [
    `contract${index}`,
    {
      address: `0x${(index + 1).toString(16).padStart(40, "0")}`,
      runtimeCodeHash: `0x${(index + 1).toString(16).padStart(64, "0")}`,
    },
  ]));
  currentInfrastructure["fundingBandsHistoricalGenerations"] = {
    "funding-bands-single-adapter": {
      deployer: "0x3333333333333333333333333333333333333333",
      governance: "0x4444444444444444444444444444444444444444",
      operations: { keeper: "0x5555555555555555555555555555555555555555" },
    },
  };
  const result = await runGenerator({}, currentInfrastructure);
  assert.equal(result.status, 0, result.stderr);
});

test("deployment generation rejects contradictory authority role metadata", async () => {
  const root = await mkdtemp(join(tmpdir(), "sinjoh-deployment-role-generator-"));
  const script = join(root, "tools", "gen-deployments.mjs");
  await mkdir(dirname(script), { recursive: true });
  await mkdir(join(root, "packages", "deployments", "src", "generated"), { recursive: true });
  await copyFile(join(repositoryRoot, "tools", "gen-deployments.mjs"), script);
  await symlink(join(repositoryRoot, "node_modules"), join(root, "node_modules"));
  await writeFile(join(root, "mainnet-deployments.json"), JSON.stringify({
    chainId: 4663,
    rpcUrl: "https://rpc.test",
    explorerUrl: "https://explorer.test",
    deployer: {
      address: "0x1111111111111111111111111111111111111111",
      kind: "eoa",
      runtimeCodeHash: `0x${"11".repeat(32)}`,
    },
    governance: { address: "0x2222222222222222222222222222222222222222", kind: "eoa" },
    status: "test",
    currentInfrastructure: {},
    dependencies: {},
  }));
  const result = spawnSync(process.execPath, [script], { encoding: "utf8" });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /deployer: must be an address classified as eoa/);
});
