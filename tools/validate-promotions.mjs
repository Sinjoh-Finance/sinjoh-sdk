#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { validatePromotionEnvelope } from "./promotion-schema.mjs";

const repoRoot = resolve(import.meta.dirname, "..");
const deploymentManifest = readFileSync(resolve(repoRoot, "mainnet-deployments.json"));
const deploymentManifestSha256 = createHash("sha256").update(deploymentManifest).digest("hex");
const requireActive = process.argv.includes("--require-active");

for (const channel of ["candidate", "active"]) {
  const file = resolve(repoRoot, `config/releases/${channel}.json`);
  const lock = resolve(repoRoot, `config/releases/${channel}.sha256`);
  if (!existsSync(file) && !existsSync(lock)) {
    if (channel === "active" && requireActive) throw new Error("active promotion and lock are required for release");
    continue;
  }
  if (!existsSync(file) || !existsSync(lock)) throw new Error(`${channel} promotion and lock must coexist`);
  const contents = readFileSync(file);
  const actual = createHash("sha256").update(contents).digest("hex");
  const expected = readFileSync(lock, "utf8").trim().split(/\s+/, 1)[0]?.toLowerCase();
  if (actual !== expected) throw new Error(`${channel} promotion digest mismatch`);
  const promotion = JSON.parse(contents);
  validatePromotionEnvelope(promotion, channel);
  if (!promotion.consumers?.sdk?.contracts) throw new Error(`${channel} promotion lacks SDK bindings`);
  if (requireActive && channel === "active" && promotion.chainId !== 4663) {
    throw new Error("SDK releases require a Robinhood mainnet active promotion");
  }
  if (promotion.chainId === 4663 && promotion.source.deploymentManifestSha256 !== deploymentManifestSha256) {
    throw new Error(`${channel} promotion does not match the SDK deployment registry`);
  }
  console.log(`SDK promotion: ${promotion.releaseId} ${channel} ${actual}`);
}
