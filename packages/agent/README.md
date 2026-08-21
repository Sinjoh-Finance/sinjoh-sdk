# @sinjoh/agent

An MCP server exposing Sinjoh public data plus the SDK's verify, read, plan,
preflight, validate, prepare, and optional transaction-execution surface to agents.
The standalone server holds no keys. Embedded hosts may inject a wallet executor;
when they do, the server exposes a simulate-first signing tool. API tools remain
explicitly read-only and return structured content.

## Run

```sh
# defaults to the public Robinhood mainnet RPC and the packaged manifest
SINJOH_RPC_URL=https://rpc.mainnet.chain.robinhood.com \
  npx --yes --package @sinjoh/agent sinjoh-mcp
```

Register in an MCP client (e.g. Claude Code):

```json
{
  "mcpServers": {
    "sinjoh": {
      "command": "npx",
      "args": ["--yes", "--package", "@sinjoh/agent", "sinjoh-mcp"],
      "env": { "SINJOH_RPC_URL": "https://rpc.mainnet.chain.robinhood.com" }
    }
  }
}
```

Node.js 22 or newer is required. `SINJOH_CHAIN_ID` defaults to mainnet (`4663`). Testnet
(`46630`) requires a caller-supplied deployment manifest and is therefore available through the
library API, not the standalone CLI's packaged defaults.

`SINJOH_API_URL` defaults to `https://api.sinjoh.com`. Normal API reads are
keyless. Set `SINJOH_API_KEY` only when an approved integration needs a higher
minute limit; keep it in the MCP host's secret environment, not its committed
configuration.

Before acting on any manifest address, call `sinjoh_verify_manifest` and require
`allVerified: true`. A failed or missing runtime hash is a hard stop.

## Tools

| Tool | What it does |
|---|---|
| `sinjoh_api_capabilities` | Production API version, capacity, documentation, and route catalog |
| `sinjoh_registry_health` | Reconcile and report indexed-versus-public launch coverage, including per-launchpad failures |
| `sinjoh_discover` | Paginated contracts, launches, raffles, airdrops, liquidity, Funding Bands, revenue, or randomness |
| `sinjoh_get` | One contract, launch, market, raffle, or protocol account |
| `sinjoh_history` | Bounded market, raffle, airdrop, Funding Bands, or normalized event history |
| `sinjoh_wallet_activity` | Wallet-attributed events and raffle prizes; never presented as claimability |
| `sinjoh_manifest` | Deployed addresses from the packaged manifest |
| `sinjoh_verify_manifest` | Live runtime code-hash verification |
| `sinjoh_router_snapshot` | A router's full immutable structure and binding state |
| `sinjoh_plan_router_work` | Every eligible permissionless action, with contract-capped amounts, prepared calls, and exact guard-preflight inputs |
| `sinjoh_preflight_guard` | Immutable swap floor with explicit oracle/interval/price states and a distinct provider-unavailable result; accepts route hash and signed guard bytes |
| `sinjoh_check_activation` | Launch wiring checklist incl. EIP-1167 clone verification |
| `sinjoh_validate_config` | Offline validation + canonical encoding + configHash for router/raffle/sink configs |
| `sinjoh_plan_ponsv2_launch` | The full predict/deploy/bind launch ordering as prepared calls with readbacks |
| `sinjoh_plan_flap_launch` | The Flap launch ordering, with the vanity token salt verified against the deployed implementation |
| `sinjoh_plan_letscash_integration` | The Sinjoh side of a letscash integration, with post-launch activate, bind, and registry-publication follow-ups |
| `sinjoh_decode_error` | Revert data to named error plus operator guidance |
| `sinjoh_execute_transaction` | Simulate, then sign and submit through a host-injected wallet; available only when a wallet is configured |

`llms.txt` in this package is the protocol digest an agent should load alongside
the tools. The server uses the stable MCP 2026 protocol SDK and emits both JSON
text and `structuredContent` for object results.

## Wallet execution

The standalone `sinjoh-mcp` command deliberately has no private-key option. An agent that already
has a separate wallet tool can submit the `to`, `data`, and `value` returned by Sinjoh planning
tools through that wallet. An application embedding this package can instead inject a
`SinjohWalletExecutor` into `createSinjohAgentServer`. The executor owns account policy and
approval UX and transaction policy; Sinjoh checks the chain ID and simulates each transaction
before asking it to sign. The execution tool is marked destructive and non-idempotent so MCP
clients can require explicit confirmation. Treat the injected wallet's `sendTransaction`
implementation as the final authorization boundary: enforce destination, value, session, and
spending limits there, and honor the supplied `request.account` and `request.chainId` when
submitting. Wallet execution requires
a public client with an explicit chain matching the manifest; do not re-read mutable provider
account or chain state inside the executor.
Raw private keys never cross the Sinjoh interface. If receipt polling times out after submission,
the tool returns `status: "submitted"` with the transaction hash so the agent can reconcile that
hash instead of signing a duplicate transaction.

## Conventions

Amounts cross the wire as decimal strings. Configuration objects carry bigint fields as
decimal strings. In `sinjoh_plan_ponsv2_launch`, the router config may use `"$ADAPTER"` and
`"$RAFFLE"` placeholders for addresses that only exist after prediction, and the raffle
config omits `exclusions` — the canonical list is computed from the predicted curve.

For any planned action carrying `guardPreflight`, forward that object unchanged to
`sinjoh_preflight_guard`. The planned transaction is a template until the returned floor is
inserted and the call is simulated. Never submit its placeholder floor.

Use the API tools for discovery, aggregates, and history. Use the chain tools for
live verification, reads, planning, and prepared calls. See the public
[Sinjoh API reference](../../docs/api.md) for field-level semantics.
