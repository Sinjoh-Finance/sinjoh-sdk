import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const packagePaths = [
  "package.json",
  "packages/abis/package.json",
  "packages/deployments/package.json",
  "packages/merkle/package.json",
  "packages/sdk/package.json",
  "packages/agent/package.json",
];

const root = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const tag = process.argv[2] ?? `v${root.version}`;
assert.match(tag, /^v\d+\.\d+\.\d+$/, "release tag must be vMAJOR.MINOR.PATCH");
const expectedVersion = tag.slice(1);

for (const path of packagePaths) {
  const packageJson = JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), "utf8"));
  assert.equal(packageJson.version, expectedVersion, `${path} version must match ${tag}`);
  assert.equal(packageJson.license, "Apache-2.0", `${path} must declare Apache-2.0`);
  if (path !== "package.json") {
    assert.notEqual(packageJson.private, true, `${path} must not be private`);
    assert.equal(packageJson.publishConfig?.access, "public", `${path} must publish publicly`);
  }
}

const sdk = JSON.parse(await readFile(new URL("../packages/sdk/package.json", import.meta.url), "utf8"));
const agent = JSON.parse(await readFile(new URL("../packages/agent/package.json", import.meta.url), "utf8"));
for (const [name, version] of Object.entries({ ...sdk.dependencies, ...agent.dependencies })) {
  if (name.startsWith("@sinjoh/")) {
    assert.equal(version, expectedVersion, `${name} must be pinned to ${expectedVersion}`);
  }
}

console.log(`Release metadata is consistent for ${tag}.`);
