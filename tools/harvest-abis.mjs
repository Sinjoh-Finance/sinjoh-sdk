// Harvests ABIs from the Foundry packages' out/ directories into
// packages/abis/src/generated/. Only artifacts whose compilation target lives under a
// package's src/ are included: tests, scripts, mocks, and vendored libraries never ship.
// Run `forge build` in every package first; never edit the generated files by hand.
import { execSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..");
const outDir = join(here, "..", "packages", "abis", "src", "generated");

const PACKAGES = [
  "sinjoh-fee-router",
  "sinjoh-revenue-collector",
  "sinjoh-airdrop-distributor",
  "sinjoh-liquidity-manager",
  "sinjoh-funding-bands",
  "sinjoh-raffle-rewards",
  "sinjoh-randomness",
  "sinjoh-treasury-vault",
  "sinjoh-pons-v1-adapter",
  "sinjoh-launchpad-adapters"
];

function camel(name) {
  return name.charAt(0).toLowerCase() + name.slice(1);
}

function moduleName(pkg) {
  return pkg.replace(/^sinjoh-/, "").replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

/** contractName -> { abi, abiJson, firstPackage, packages: Set } */
const contracts = new Map();
const conflicts = [];

for (const pkg of PACKAGES) {
  const artifactRoot = join(repoRoot, pkg, "out");
  let sourceDirs;
  try {
    sourceDirs = readdirSync(artifactRoot, { withFileTypes: true });
  } catch {
    console.error(`missing ${pkg}/out — run forge build in ${pkg} first`);
    process.exit(1);
  }
  for (const dir of sourceDirs) {
    if (!dir.isDirectory() || !dir.name.endsWith(".sol")) continue;
    for (const file of readdirSync(join(artifactRoot, dir.name))) {
      if (!file.endsWith(".json")) continue;
      const artifact = JSON.parse(readFileSync(join(artifactRoot, dir.name, file), "utf8"));
      const target = artifact.metadata?.settings?.compilationTarget;
      if (!target) continue;
      const [sourcePath, contractName] = Object.entries(target)[0] ?? [];
      if (!sourcePath || !sourcePath.startsWith("src/")) continue;
      if (!Array.isArray(artifact.abi) || artifact.abi.length === 0) continue;
      // Copied interfaces are deliberately narrow per package and legitimately diverge;
      // consumers get the full surface from the concrete contract ABIs instead. Internal
      // libraries whose ABI is errors-only (SafeTransferLib, ...) carry nothing callable.
      // Deployed linked libraries (FundingBandMath, FundingBandV4) keep their external
      // functions and survive this filter.
      if (/^I[A-Z]/.test(contractName)) continue;
      if (!artifact.abi.some((item) => item.type === "function" || item.type === "event")) {
        continue;
      }
      const abiJson = JSON.stringify(artifact.abi);
      const existing = contracts.get(contractName);
      if (existing) {
        if (existing.abiJson !== abiJson) {
          conflicts.push(`${contractName}: ${existing.firstPackage} vs ${pkg}`);
        } else {
          existing.packages.add(pkg);
        }
        continue;
      }
      contracts.set(contractName, {
        abi: artifact.abi, abiJson, firstPackage: pkg, packages: new Set([pkg])
      });
    }
  }
}

if (conflicts.length > 0) {
  console.error("same contract name with diverging ABIs across packages:");
  for (const conflict of conflicts) console.error(`  - ${conflict}`);
  process.exit(1);
}

let sourceCommit = "unknown";
try {
  sourceCommit = execSync("git rev-parse HEAD", { cwd: repoRoot }).toString().trim();
} catch {
  // generated meta records "unknown" outside a git checkout
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const banner = `// GENERATED FILE - DO NOT EDIT.
// Harvested from Foundry build artifacts by tools/harvest-abis.mjs.
// Regenerate with: forge build (per package), then npm run generate (from sinjoh-sdk/).
`;

const byPackage = new Map(PACKAGES.map((pkg) => [pkg, []]));
for (const [name, entry] of [...contracts.entries()].sort(([a], [b]) => a.localeCompare(b))) {
  byPackage.get(entry.firstPackage).push([name, entry]);
}

const indexExports = [];
const summary = {};
for (const pkg of PACKAGES) {
  const entries = byPackage.get(pkg);
  if (entries.length === 0) continue;
  const module = moduleName(pkg);
  const lines = [banner];
  for (const [name, entry] of entries) {
    const shared = [...entry.packages].filter((p) => p !== pkg);
    if (shared.length > 0) {
      lines.push(`/** Identical copy also compiled in: ${shared.join(", ")}. */`);
    }
    lines.push(`export const ${camel(name)}Abi = ${JSON.stringify(entry.abi)} as const;\n`);
  }
  writeFileSync(join(outDir, `${module}.ts`), lines.join("\n"));
  indexExports.push(`export * from "./generated/${module}.js";`);
  summary[pkg] = entries.length;
}

writeFileSync(join(outDir, "meta.ts"), `${banner}
/** The monorepo commit the shipped ABIs were compiled from. */
export const abiSourceCommit = ${JSON.stringify(sourceCommit)};
export const abiContractCounts = ${JSON.stringify(summary, null, 2)} as const;
`);

writeFileSync(join(here, "..", "packages", "abis", "src", "index.ts"),
  `${banner}\nexport { abiContractCounts, abiSourceCommit } from "./generated/meta.js";\n${
    indexExports.join("\n")}\n`);

console.log(`harvested ${contracts.size} contracts:`);
for (const [pkg, count] of Object.entries(summary)) console.log(`  ${pkg}: ${count}`);
