#!/usr/bin/env node
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { validatePromotionEnvelope } from "./promotion-schema.mjs";

const repoRoot = resolve(import.meta.dirname, "..");
const argument = (name) => {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
};
const source = argument("--file");
const expectedSha256 = argument("--sha256")?.toLowerCase();
const channel = argument("--channel");
const attestationBundle = argument("--attestation-bundle");
if (!source) throw new Error("--file is required");
if (!/^[0-9a-f]{64}$/.test(expectedSha256 ?? "")) throw new Error("--sha256 must be lowercase hex");
if (!["candidate", "active"].includes(channel)) throw new Error("--channel must be candidate or active");

const contents = readFileSync(resolve(source));
const verifyArguments = [
  "attestation", "verify", resolve(source),
  "--repo", "Sinjoh-Finance/sinjoh-contracts",
  "--signer-workflow", "Sinjoh-Finance/sinjoh-contracts/.github/workflows/publish-promotion.yml",
];
if (attestationBundle) verifyArguments.push("--bundle", resolve(attestationBundle));
execFileSync("gh", verifyArguments, { stdio: "inherit" });
const actualSha256 = createHash("sha256").update(contents).digest("hex");
if (actualSha256 !== expectedSha256) throw new Error("promotion digest mismatch");
const promotion = JSON.parse(contents);
validatePromotionEnvelope(promotion, channel);
if (!promotion.consumers?.sdk?.contracts) throw new Error("promotion has no SDK binding");

const destination = resolve(repoRoot, "config/releases");
mkdirSync(destination, { recursive: true });
writeFileSync(resolve(destination, `${channel}.json`), contents);
writeFileSync(resolve(destination, `${channel}.sha256`), `${actualSha256}  ${channel}.json\n`);
console.log(`imported ${promotion.releaseId} as ${channel} (${actualSha256})`);
