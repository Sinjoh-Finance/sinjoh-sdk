#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createSinjohClient } from "@sinjoh/sdk";
import { createSinjohAgentServer } from "./server.js";

/**
 * Stdio MCP entrypoint. Configuration is environment-only:
 *   SINJOH_RPC_URL   — RPC endpoint (defaults to the public Robinhood mainnet RPC)
 *   SINJOH_CHAIN_ID  — 4663 (default) or 46630 (requires a supplied manifest; not yet wired)
 *
 * The server holds no keys and cannot sign; it is safe to hand to an agent as-is.
 */
const rpcUrl = process.env["SINJOH_RPC_URL"]?.trim();
const sinjoh = createSinjohClient(rpcUrl === undefined || rpcUrl === ""
  ? {}
  : { rpcUrl });

const server = createSinjohAgentServer({
  client: sinjoh.public,
  manifest: sinjoh.manifest,
  chainId: sinjoh.chainId
});

await server.connect(new StdioServerTransport());
