#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createSinjohClient } from "@sinjoh/sdk";
import { createSinjohAgentServer } from "./server.js";

/**
 * Stdio MCP entrypoint. Configuration is environment-only:
 *   SINJOH_RPC_URL   — RPC endpoint (defaults to the public Robinhood mainnet RPC)
 *   SINJOH_CHAIN_ID  — 4663 (default); 46630 requires an API-supplied manifest
 *
 * The server holds no keys and cannot sign; it is safe to hand to an agent as-is.
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
  manifest: sinjoh.manifest
});

await server.connect(new StdioServerTransport());
