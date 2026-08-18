// Generates packages/deployments/src/generated/mainnet.ts from ../mainnet-deployments.json.
// The JSON stays the hand-maintained source of truth; this derives a typed, checksummed,
// validated view of it. Never edit the generated file by hand.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { getAddress } from "viem";

const here = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(here, "..", "..", "mainnet-deployments.json");
const outDir = join(here, "..", "packages", "deployments", "src", "generated");
const outPath = join(outDir, "mainnet.ts");

const raw = JSON.parse(readFileSync(sourcePath, "utf8"));

const ADDRESS = /^0x[0-9a-fA-F]{40}$/;
const HASH32 = /^0x[0-9a-f]{64}$/i;

const problems = [];
function fail(message) {
  problems.push(message);
}

if (raw.chainId !== 4663) fail(`unexpected chainId ${raw.chainId}`);
for (const key of ["rpcUrl", "explorerUrl", "deployer", "governance", "status"]) {
  if (typeof raw[key] !== "string" || raw[key].length === 0) fail(`missing ${key}`);
}

/**
 * Walks a manifest section collecting deployment entries: any object with a valid `address`
 * becomes an entry keyed by its dotted path; bare address strings become address-only entries.
 */
function collect(section, prefix, into) {
  for (const [key, value] of Object.entries(section)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      if (ADDRESS.test(value)) into[path] = { address: getAddress(value) };
      continue; // notes, dates, commit hashes
    }
    if (value === null || typeof value !== "object" || Array.isArray(value)) continue;
    if (typeof value.address === "string") {
      if (!ADDRESS.test(value.address)) {
        fail(`${path}: invalid address ${value.address}`);
        continue;
      }
      const entry = { address: getAddress(value.address) };
      if (value.deploymentBlock !== undefined) {
        if (!Number.isInteger(value.deploymentBlock) || value.deploymentBlock < 0) {
          fail(`${path}: invalid deploymentBlock`);
        } else entry.deploymentBlock = value.deploymentBlock;
      }
      if (typeof value.deploymentTransaction === "string") {
        if (!HASH32.test(value.deploymentTransaction)) {
          fail(`${path}: invalid deploymentTransaction`);
        } else entry.deploymentTransaction = value.deploymentTransaction.toLowerCase();
      }
      if (typeof value.runtimeCodeHash === "string") {
        if (!HASH32.test(value.runtimeCodeHash)) fail(`${path}: invalid runtimeCodeHash`);
        else entry.runtimeCodeHash = value.runtimeCodeHash.toLowerCase();
      }
      if (typeof value.purpose === "string") entry.purpose = value.purpose;
      if (typeof value.implementation === "string" && ADDRESS.test(value.implementation)) {
        entry.implementation = getAddress(value.implementation);
      }
      if (typeof value.implementationRuntimeCodeHash === "string"
        && HASH32.test(value.implementationRuntimeCodeHash)) {
        entry.implementationRuntimeCodeHash =
          value.implementationRuntimeCodeHash.toLowerCase();
      }
      into[path] = entry;
      continue;
    }
    collect(value, path, into);
  }
}

const contracts = {};
collect(raw.currentInfrastructure ?? {}, "", contracts);
if (Object.keys(contracts).length < 30) {
  fail(`only ${Object.keys(contracts).length} contract entries collected; expected 30+`);
}

const dependencies = {};
collect(raw.dependencies ?? {}, "", dependencies);
collect(raw.letscashDependencies ?? {}, "letscash", dependencies);

const notDeployed = Object.keys(raw.notDeployed ?? {});

if (problems.length > 0) {
  console.error("mainnet-deployments.json failed validation:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}

function literal(value, indent) {
  return JSON.stringify(value, null, 2)
    .split("\n")
    .map((line, i) => (i === 0 ? line : " ".repeat(indent) + line))
    .join("\n");
}

const banner = `// GENERATED FILE - DO NOT EDIT.
// Derived from mainnet-deployments.json by tools/gen-deployments.mjs.
// Regenerate with: npm run generate (from sinjoh-sdk/).
`;

const body = `${banner}
export const mainnet = {
  chainId: ${raw.chainId},
  status: ${JSON.stringify(raw.status)},
  releaseCandidate: ${JSON.stringify(raw.releaseCandidate === true)},
  deployedAt: ${JSON.stringify(raw.deployedAt ?? null)},
  rpcUrl: ${JSON.stringify(raw.rpcUrl)},
  explorerUrl: ${JSON.stringify(raw.explorerUrl)},
  deployer: ${JSON.stringify(getAddress(raw.deployer))},
  governance: ${JSON.stringify(getAddress(raw.governance))},
  contracts: ${literal(contracts, 2)},
  dependencies: ${literal(dependencies, 2)},
  notDeployed: ${literal(notDeployed, 2)}
} as const;
`;

mkdirSync(outDir, { recursive: true });
writeFileSync(outPath, body);
console.log(
  `wrote ${outPath}: ${Object.keys(contracts).length} contracts, ` +
  `${Object.keys(dependencies).length} dependencies`
);
