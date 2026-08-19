// Regenerates every Solidity-produced golden fixture the SDK pins against and copies it
// into this SDK. Fixtures are copies of reference output, never hand-edited.
// Requires a sibling sinjoh-contracts checkout, forge, and the pinned solc.
import { execSync } from "node:child_process";
import { copyFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const sdkRoot = join(here, "..");
const contractsRoot = resolve(
  process.env.SINJOH_CONTRACTS_ROOT ?? join(sdkRoot, "..", "sinjoh-contracts"),
);

const GENERATORS = [
  { package: "sinjoh-randomness", match: "GenerateFixtures" },
  { package: "sinjoh-raffle-rewards", match: "GenerateFixtures" },
  { package: "sinjoh-fee-router", match: "GeneratePonsV2Fixtures" },
  { package: "sinjoh-fee-router", match: "GenerateRouterConfigFixture" },
  { package: "sinjoh-airdrop-distributor", match: "GenerateSinkConfigFixture" },
  { package: "sinjoh-liquidity-manager", match: "GenerateSinkConfigFixture" }
];

// Every package that pins a copy of a regenerated fixture gets a fresh copy — including
// the keeper, whose own `npm run fixtures` covers only the ecvrf/tree subset. Refreshing
// a source without every consumer leaves a twin testing against a stale expectation.
const COPIES = [
  ["sinjoh-raffle-rewards/test/fixtures/ticket-tree.json",
    "packages/merkle/test/fixtures/ticket-tree.json"],
  ["sinjoh-raffle-rewards/test/fixtures/slot-indices.json",
    "packages/merkle/test/fixtures/slot-indices.json"],
  ["sinjoh-raffle-rewards/test/fixtures/config-hash.json",
    "packages/sdk/test/fixtures/config-hash.json"],
  ["sinjoh-fee-router/test/fixtures/ponsv2-prediction.json",
    "packages/sdk/test/fixtures/ponsv2-prediction.json"],
  ["sinjoh-fee-router/test/fixtures/router-config.json",
    "packages/sdk/test/fixtures/router-config.json"],
  ["sinjoh-airdrop-distributor/test/fixtures/airdrop-sink-config.json",
    "packages/sdk/test/fixtures/airdrop-sink-config.json"],
  ["sinjoh-liquidity-manager/test/fixtures/liquidity-sink-config.json",
    "packages/sdk/test/fixtures/liquidity-sink-config.json"]
];

for (const generator of GENERATORS) {
  console.log(`forge test --match-contract ${generator.match} (${generator.package})`);
  execSync(`forge test --match-contract ${generator.match}`, {
    cwd: join(contractsRoot, generator.package), stdio: "inherit"
  });
}

for (const [source, destination] of COPIES) {
  mkdirSync(dirname(join(sdkRoot, destination)), { recursive: true });
  copyFileSync(join(contractsRoot, source), join(sdkRoot, destination));
  console.log(`copied ${source} -> ${destination}`);
}
console.log("fixtures synchronized; run npm test to confirm parity");
