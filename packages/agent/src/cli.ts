#!/usr/bin/env node
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { createSinjohApiClient, createSinjohClient } from "@sinjoh/sdk";
import { createSinjohAgentServer } from "./server.js";

/**
 * Stdio MCP entrypoint. Configuration is environment-only:
 *   SINJOH_RPC_URL   — RPC endpoint (defaults to the public Robinhood mainnet RPC)
 *   SINJOH_CHAIN_ID  — 4663 (default); 46630 requires an API-supplied manifest
 *   SINJOH_API_URL   — public data API (defaults to https://api.sinjoh.com)
 *   SINJOH_API_KEY   — optional higher-rate API key; never required for normal use
 *
 * The standalone server holds no keys. Wallet execution is available only to embedding hosts
 * that inject a SinjohWalletExecutor through the library API.
 */
const rpcUrl = process.env["SINJOH_RPC_URL"]?.trim();
const chainIdValue = process.env["SINJOH_CHAIN_ID"]?.trim() ?? "4663";
if (chainIdValue !== "4663" && chainIdValue !== "46630") {
  throw new Error("SINJOH_CHAIN_ID must be 4663 or 46630");
}
const chainId = Number(chainIdValue) as 4663 | 46630;
const sinjoh = createSinjohClient({
  chainId,
  ...(rpcUrl === undefined || rpcUrl === "" ? {} : { rpcUrl })
});

const server = createSinjohAgentServer({
  client: sinjoh.public,
  manifest: sinjoh.manifest,
  api: createSinjohApiClient({
    ...(process.env["SINJOH_API_URL"]?.trim()
      ? { baseUrl: process.env["SINJOH_API_URL"]!.trim() }
      : {}),
    ...(process.env["SINJOH_API_KEY"]?.trim()
      ? { apiKey: process.env["SINJOH_API_KEY"]!.trim() }
      : {}),
  })
});

await serveStdio(() => server);
