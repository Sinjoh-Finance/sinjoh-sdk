// Regenerates every Solidity-produced golden fixture the SDK pins against and copies it
// into the consuming package. Mirrors sinjoh-keeper's `npm run fixtures`: fixtures are
// copies of reference output, never hand-edited on either side. Requires forge + the
// pinned solc; run from sinjoh-sdk/.
import { execSync } from "node:child_process";
import { copyFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, "..", "..");

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
    "sinjoh-sdk/packages/merkle/test/fixtures/ticket-tree.json"],
  ["sinjoh-raffle-rewards/test/fixtures/slot-indices.json",
    "sinjoh-sdk/packages/merkle/test/fixtures/slot-indices.json"],
  ["sinjoh-raffle-rewards/test/fixtures/config-hash.json",
    "sinjoh-sdk/packages/sdk/test/fixtures/config-hash.json"],
  ["sinjoh-fee-router/test/fixtures/ponsv2-prediction.json",
    "sinjoh-sdk/packages/sdk/test/fixtures/ponsv2-prediction.json"],
  ["sinjoh-fee-router/test/fixtures/router-config.json",
    "sinjoh-sdk/packages/sdk/test/fixtures/router-config.json"],
  ["sinjoh-airdrop-distributor/test/fixtures/airdrop-sink-config.json",
    "sinjoh-sdk/packages/sdk/test/fixtures/airdrop-sink-config.json"],
  ["sinjoh-liquidity-manager/test/fixtures/liquidity-sink-config.json",
    "sinjoh-sdk/packages/sdk/test/fixtures/liquidity-sink-config.json"],
  ["sinjoh-randomness/test/fixtures/ecvrf-proofs.json",
    "sinjoh-keeper/test/fixtures/ecvrf-proofs.json"],
  ["sinjoh-raffle-rewards/test/fixtures/ticket-tree.json",
    "sinjoh-keeper/test/fixtures/ticket-tree.json"],
  ["sinjoh-raffle-rewards/test/fixtures/slot-indices.json",
    "sinjoh-keeper/test/fixtures/slot-indices.json"],
  ["sinjoh-raffle-rewards/test/fixtures/config-hash.json",
    "sinjoh-keeper/test/fixtures/config-hash.json"],
  ["sinjoh-fee-router/test/fixtures/ponsv2-prediction.json",
    "sinjoh-keeper/test/fixtures/ponsv2-prediction.json"]
];

for (const generator of GENERATORS) {
  console.log(`forge test --match-contract ${generator.match} (${generator.package})`);
  execSync(`forge test --match-contract ${generator.match}`, {
    cwd: join(repoRoot, generator.package), stdio: "inherit"
  });
}

for (const [source, destination] of COPIES) {
  mkdirSync(dirname(join(repoRoot, destination)), { recursive: true });
  copyFileSync(join(repoRoot, source), join(repoRoot, destination));
  console.log(`copied ${source} -> ${destination}`);
}
console.log("fixtures synchronized; run npm test to confirm parity");
