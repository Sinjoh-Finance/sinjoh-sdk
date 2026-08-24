#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { validatePromotionEnvelope } from "./promotion-schema.mjs";

const repoRoot = resolve(import.meta.dirname, "..");
const deploymentManifest = JSON.parse(
  readFileSync(resolve(repoRoot, "mainnet-deployments.json"), "utf8"),
);
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
  if (promotion.chainId === 4663) {
    const localEntries = new Map();
    const collect = (value) => {
      if (!value || typeof value !== "object" || Array.isArray(value)) return;
      if (typeof value.address === "string" && typeof value.runtimeCodeHash === "string") {
        localEntries.set(
          `${value.address.toLowerCase()}:${value.runtimeCodeHash.toLowerCase()}`,
          true,
        );
      }
      for (const nested of Object.values(value)) collect(nested);
    };
    collect(deploymentManifest);
    for (const [name, entry] of Object.entries(promotion.consumers.sdk.contracts)) {
      const identity = `${entry.address.toLowerCase()}:${entry.runtimeCodeHash.toLowerCase()}`;
      if (!localEntries.has(identity)) {
        throw new Error(`${channel} SDK binding ${name} does not match the SDK deployment registry`);
      }
    }
  }
  console.log(`SDK promotion: ${promotion.releaseId} ${channel} ${actual}`);
}
