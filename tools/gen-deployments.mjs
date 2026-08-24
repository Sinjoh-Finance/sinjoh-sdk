// Generates packages/deployments/src/generated/mainnet.ts from mainnet-deployments.json.
// The JSON stays the hand-maintained source of truth; this derives a typed, checksummed,
// validated view of it. Never edit the generated file by hand.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { getAddress } from "viem";

const here = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(here, "..", "mainnet-deployments.json");
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
for (const key of ["rpcUrl", "explorerUrl", "status"]) {
  if (typeof raw[key] !== "string" || raw[key].length === 0) fail(`missing ${key}`);
}

function role(name) {
  const value = raw[name];
  if (typeof value === "string" && ADDRESS.test(value)) {
    return { address: getAddress(value), kind: "eoa" };
  }
  if (!value || typeof value !== "object" || Array.isArray(value)
    || typeof value.address !== "string" || !ADDRESS.test(value.address)
    || value.kind !== "eoa" || value.runtimeCodeHash !== undefined
    || value.implementation !== undefined || value.implementationRuntimeCodeHash !== undefined
    || value.implementationBinding !== undefined) {
    fail(`${name}: must be an address classified as eoa`);
    return { address: "0x0000000000000000000000000000000000000000", kind: "eoa" };
  }
  return { address: getAddress(value.address), kind: "eoa" };
}

const deployerRole = role("deployer");
const governanceRole = role("governance");

/**
 * Walks a manifest section collecting deployment entries: any object with a valid `address`
 * becomes an entry keyed by its dotted path. Bare address strings are rejected so every
 * trust-bearing address explicitly carries a runtime hash or an EOA classification.
 */
function collect(section, prefix, into) {
  const explicitEoaPaths = new Set([
    "fundingBands.deployer",
    "fundingBands.governance",
    "fundingBands.operations.keeper",
    "raffleOperations.attestor",
    "raffleOperations.ecvrfProver",
  ]);
  for (const [key, value] of Object.entries(section)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      if (ADDRESS.test(value)) {
        const siblingHash = section[`${key}RuntimeCodeHash`];
        if (typeof siblingHash === "string" && HASH32.test(siblingHash)) {
          into[path] = {
            address: getAddress(value),
            runtimeCodeHash: siblingHash.toLowerCase(),
          };
        } else if (explicitEoaPaths.has(path)) {
          into[path] = { address: getAddress(value), kind: "eoa" };
        } else {
          fail(`${path}: address must declare runtimeCodeHash or kind eoa`);
        }
      }
      else if (value.startsWith("0x") && !HASH32.test(value)) {
        fail(`${path}: invalid hex value ${value}`);
      }
      continue; // notes, dates, commit hashes
    }
    if (value === null || typeof value !== "object" || Array.isArray(value)) continue;
    if (Object.hasOwn(value, "address") && typeof value.address !== "string") {
      fail(`${path}: invalid address`);
      continue;
    }
    if (typeof value.address === "string") {
      if (!ADDRESS.test(value.address)) {
        fail(`${path}: invalid address ${value.address}`);
        continue;
      }
      const entry = { address: getAddress(value.address) };
      if (value.kind !== undefined && value.kind !== "contract" && value.kind !== "eoa") {
        fail(`${path}: invalid kind`);
      } else if (value.kind !== undefined) {
        entry.kind = value.kind;
      }
      if (value.deploymentBlock !== undefined) {
        if (!Number.isInteger(value.deploymentBlock) || value.deploymentBlock < 0) {
          fail(`${path}: invalid deploymentBlock`);
        } else entry.deploymentBlock = value.deploymentBlock;
      }
      if (value.deploymentTransaction !== undefined) {
        if (typeof value.deploymentTransaction !== "string"
          || !HASH32.test(value.deploymentTransaction)) {
          fail(`${path}: invalid deploymentTransaction`);
        } else entry.deploymentTransaction = value.deploymentTransaction.toLowerCase();
      }
      if (value.runtimeCodeHash !== undefined) {
        if (typeof value.runtimeCodeHash !== "string" || !HASH32.test(value.runtimeCodeHash)) {
          fail(`${path}: invalid runtimeCodeHash`);
        }
        else entry.runtimeCodeHash = value.runtimeCodeHash.toLowerCase();
      }
      if (value.kind === "eoa" && value.runtimeCodeHash !== undefined) {
        fail(`${path}: eoa cannot carry runtimeCodeHash`);
      }
      if (value.kind !== "eoa" && value.runtimeCodeHash === undefined) {
        fail(`${path}: contract is missing runtimeCodeHash`);
      }
      if (typeof value.purpose === "string") entry.purpose = value.purpose;
      if (value.implementation !== undefined) {
        if (typeof value.implementation !== "string" || !ADDRESS.test(value.implementation)) {
          fail(`${path}: invalid implementation`);
        } else {
          entry.implementation = getAddress(value.implementation);
        }
      }
      if (value.implementationRuntimeCodeHash !== undefined) {
        if (typeof value.implementationRuntimeCodeHash !== "string"
          || !HASH32.test(value.implementationRuntimeCodeHash)) {
          fail(`${path}: invalid implementationRuntimeCodeHash`);
        } else {
          entry.implementationRuntimeCodeHash =
            value.implementationRuntimeCodeHash.toLowerCase();
        }
      }
      if ((value.implementation === undefined)
        !== (value.implementationRuntimeCodeHash === undefined)) {
        fail(`${path}: implementation and implementationRuntimeCodeHash must be paired`);
      }
      if (value.implementationBinding !== undefined) {
        const binding = value.implementationBinding;
        if (!binding || typeof binding !== "object" || Array.isArray(binding)
          || (binding.kind !== "beacon" && binding.kind !== "eip1967")
          || (binding.kind === "eip1967"
            && (typeof binding.slot !== "string" || !HASH32.test(binding.slot)))
          || value.implementation === undefined) {
          fail(`${path}: invalid implementationBinding`);
        } else {
          entry.implementationBinding = binding.kind === "beacon"
            ? { kind: "beacon" }
            : { kind: "eip1967", slot: binding.slot.toLowerCase() };
        }
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
// Regenerate with: npm run generate:deployments.
`;

const body = `${banner}
export const mainnet = {
  chainId: ${raw.chainId},
  status: ${JSON.stringify(raw.status)},
  releaseCandidate: ${JSON.stringify(raw.releaseCandidate === true)},
  deployedAt: ${JSON.stringify(raw.deployedAt ?? null)},
  rpcUrl: ${JSON.stringify(raw.rpcUrl)},
  explorerUrl: ${JSON.stringify(raw.explorerUrl)},
  deployer: ${JSON.stringify(deployerRole.address)},
  governance: ${JSON.stringify(governanceRole.address)},
  roles: ${literal({ deployer: deployerRole, governance: governanceRole }, 2)},
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
