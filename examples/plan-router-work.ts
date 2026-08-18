/**
 * Minimal agent loop, read-only: verify the manifest, then enumerate every eligible
 * permissionless action on a router and preflight the guarded ones.
 *
 * Run:  npx tsx examples/plan-router-work.ts <router-address>
 * Env:  SINJOH_RPC_URL (defaults to the public Robinhood mainnet RPC)
 */
import {
  allVerified, createSinjohClient, planRouterWork, preflightMinimumOutput
} from "@sinjoh/sdk";
import type { Address } from "viem";

const router = process.argv[2] as Address | undefined;
if (router === undefined) {
  console.error("usage: tsx examples/plan-router-work.ts <router-address>");
  process.exit(1);
}

const rpcUrl = process.env["SINJOH_RPC_URL"]?.trim();
const sinjoh = createSinjohClient(rpcUrl ? { rpcUrl } : {});

const verification = await sinjoh.verify(["agnosticFeeRouterFactory", "revenueCollector"]);
if (!allVerified(verification)) {
  console.error("manifest verification failed:", verification);
  process.exit(1);
}

const plan = await planRouterWork(sinjoh.public, router);
console.log(`router ${router} — subject ${plan.router.subject}`);
if (plan.actions.length === 0) {
  console.log("no eligible work");
  process.exit(0);
}
for (const action of plan.actions) {
  console.log(`- [${action.state}] ${action.kind} ${action.amount} of ${action.asset}`);
  if (action.guardPreflight !== undefined) {
    const floor = await preflightMinimumOutput(sinjoh.public, action.guardPreflight);
    console.log(`  guard: ${JSON.stringify(floor, (_, v) =>
      typeof v === "bigint" ? v.toString() : v)}`);
  }
}
console.log("\nSimulate each prepared call before signing; this script submits nothing.");
