# @sinjoh/agent

An MCP server exposing the Sinjoh SDK's read, plan, preflight, validate, and prepare surface
to agents. It holds no keys and cannot sign or submit — every tool returns data, and prepared
calls are simulated and submitted by whatever actually holds a signer.

## Run

```sh
# defaults to the public Robinhood mainnet RPC and the packaged manifest
SINJOH_RPC_URL=https://rpc.mainnet.chain.robinhood.com npx sinjoh-mcp
```

Register in an MCP client (e.g. Claude Code):

```json
{
  "mcpServers": {
    "sinjoh": {
      "command": "npx",
      "args": ["sinjoh-mcp"],
      "env": { "SINJOH_RPC_URL": "https://rpc.mainnet.chain.robinhood.com" }
    }
  }
}
```

## Tools

| Tool | What it does |
|---|---|
| `sinjoh_manifest` | Deployed addresses from the packaged manifest |
| `sinjoh_verify_manifest` | Live runtime code-hash verification |
| `sinjoh_router_snapshot` | A router's full immutable structure and binding state |
| `sinjoh_plan_router_work` | Every currently eligible permissionless action, with amounts and prepared calls |
| `sinjoh_preflight_guard` | Immutable swap floor with explicit oracle/interval/price states |
| `sinjoh_check_activation` | Launch wiring checklist incl. EIP-1167 clone verification |
| `sinjoh_validate_config` | Offline validation + canonical encoding + configHash for router/raffle/sink configs |
| `sinjoh_plan_ponsv2_launch` | The full predict/deploy/bind launch ordering as prepared calls with readbacks |
| `sinjoh_plan_flap_launch` | The Flap launch ordering, with the vanity token salt verified against the deployed implementation |
| `sinjoh_plan_letscash_integration` | The Sinjoh side of a letscash integration, with post-launch activate/bind follow-ups |
| `sinjoh_decode_error` | Revert data to named error plus operator guidance |

`llms.txt` in this package is the protocol digest an agent should load alongside the tools.

## Conventions

Amounts cross the wire as decimal strings. Configuration objects carry bigint fields as
decimal strings. In `sinjoh_plan_ponsv2_launch`, the router config may use `"$ADAPTER"` and
`"$RAFFLE"` placeholders for addresses that only exist after prediction, and the raffle
config omits `exclusions` — the canonical list is computed from the predicted curve.
