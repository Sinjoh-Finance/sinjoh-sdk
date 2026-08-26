# Sinjoh SDK

[![CI](https://github.com/Sinjoh-Finance/sinjoh-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/Sinjoh-Finance/sinjoh-sdk/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)
[![npm](https://img.shields.io/npm/v/@sinjoh/sdk.svg)](https://www.npmjs.com/package/@sinjoh/sdk)

TypeScript SDK workspace for the immutable Sinjoh protocols on Robinhood
Chain. It provides deterministic planning and validation building blocks for applications,
keepers, and agents, plus an explicit creator-authorized API upload for canonical token artwork.
It never holds keys, signs, or submits blockchain transactions.

> Release status: stable `2.2.5` source and package metadata, licensed under
> Apache-2.0. Tagged releases are published to npm through GitHub OIDC trusted
> publishing, with build provenance, after all deterministic release gates pass.

## Requirements

- Node.js 22 or newer
- npm 10 or newer
- ESM (`"type": "module"`)
- `viem` 2.55.10 or newer within major version 2 for packages that declare it as a peer

## Quick start

Install the core SDK and its peer dependency:

```sh
npm install @sinjoh/sdk viem
```

Bind a client to the packaged mainnet manifest, verify the deployed runtime code, then plan
permissionless router work:

```ts
import { allVerified, createSinjohClient, planRouterWork } from "@sinjoh/sdk";
import type { Address } from "viem";

const sinjoh = createSinjohClient({
  rpcUrl: process.env["ROBINHOOD_RPC_URL"]
    ?? "https://rpc.mainnet.chain.robinhood.com"
});

const verification = await sinjoh.verify();
if (!allVerified(verification)) {
  throw new Error("Sinjoh deployment manifest does not match live runtime code");
}

const router = process.env["SINJOH_ROUTER"];
if (!router) throw new Error("SINJOH_ROUTER is required");

const plan = await planRouterWork(sinjoh.public, router as Address);
```

Replace the example router with the launch's router address. Every plan is a snapshot. Simulate
the selected prepared call immediately before signing, and never submit a guarded template until
its successful preflight floor has replaced the structural placeholder.

## Packages

| Package | Purpose |
|---|---|
| [`@sinjoh/abis`](./packages/abis) | Generated, viem-typed ABIs for every Sinjoh contract, harvested from Foundry build output at a pinned source commit. |
| [`@sinjoh/deployments`](./packages/deployments) | Typed chain manifests generated from `mainnet-deployments.json`, plus runtime code-hash verification for deployed entries and their recorded implementations. |
| [`@sinjoh/merkle`](./packages/merkle) | Deterministic Merkle-sum trees (airdrop epochs, raffle ticket intervals) and winning-index derivation, pinned to Solidity-generated golden fixtures. Proof verification requires the tree domain parameters and recomputes the leaf preimage. |
| [`@sinjoh/agent`](./packages/agent) | MCP server exposing public data and the SDK's read/plan/preflight/validate/prepare surface (`sinjoh-mcp`, stdio), plus simulate-first submission when an embedding host injects its wallet. The standalone command holds no keys. Ships `llms.txt`, the protocol digest an agent loads alongside the tools. |
| [`@sinjoh/sdk`](./packages/sdk) | Core SDK: the typed public API client, byte-exact configuration codecs (router, raffle, airdrop/liquidity sinks) with initializer-level validation, Project V2 preset hydration and launch verification, launch prediction, clone verification, error decoding, chain-bound clients, live reads, guard preflights, prepared lifecycle calls, work planning, and activation checks. The SDK never signs or submits. |

High-level launch planners currently cover Pons v2, Flap, and letscash.fun. Pons v1 and
pools.trade contracts are available through the generated ABIs and deployment manifest, but do
not yet have equivalent end-to-end launch planners. This distinction is intentional and should
remain explicit in application UI.

Project V2 launch builders support complete multi-step routes, including direct delivery,
buyback-and-burn, token conversion, Treasury, Airdrop, Raffle, liquidity, and project-sink
funding. The package encodes every action with its exact adapter proof and validates the complete
configuration through the deployed Launcher before a wallet is asked to sign.

## Public API and documentation

The Sinjoh API is live at [`https://api.sinjoh.com/v1`](https://api.sinjoh.com/v1).
It covers contracts, launches, markets, raffles, airdrops, liquidity, Funding Bands,
revenue, randomness, normalized events, wallet-attributed history, and creator-signed
canonical launch artwork. No key is required for normal use.

- [Five-minute tutorial](./docs/getting-started.md)
- [Task recipes](./docs/how-to-query-sinjoh.md)
- [v1 to v2 migration](./docs/migrate-v1-to-v2.md)
- [Complete API reference](./docs/api.md)
- [API design and trust boundaries](./docs/api-design.md)
- [OpenAPI 3.1](./openapi/sinjoh-api.yaml)

## Safety model

- Treat deployment manifests as untrusted data until `verify()` confirms every runtime hash.
- Treat work plans as snapshots. State can change between planning, simulation, and inclusion.
- Forward `guardPreflight` inputs exactly. Signed guard data binds the route and amount.
- Keep RPC credentials in environment variables and out of logs, source files, and MCP config
  committed to version control.
- Configuration hashes are identities for immutable deployments. Validate and review the decoded
  configuration before using a hash in a launch.
- The core SDK never signs or submits. The MCP server can request signing only through a
  host-injected wallet executor and always simulates first; the standalone command stores no key.

## Development

From this directory:

```sh
npm ci
npm run typecheck
npm test
npm run build
npm run pack:check
```

The normal test suite is RPC-free and deterministic. Live fork acceptance tests belong to the
owning Foundry packages and require an explicitly supplied Robinhood Chain RPC URL.

## Regenerating

Generated sources are committed. To regenerate them:

```sh
# 1. Build every Foundry package (requires forge + solc 0.8.28)
for p in ../sinjoh-contracts/sinjoh-*/foundry.toml; do
  (cd "$(dirname "$p")" && forge build)
done

# 2. Harvest ABIs and deployment manifests
npm run generate
```

CI must fail if regeneration produces a diff (`git diff --exit-code` after
`npm run generate`): the generated sources are derived, never hand-edited.

## Conventions

Same as the rest of the repository: strict TypeScript (NodeNext, ES2022),
ESM, Node >= 22, `viem` pinned at the keeper's exact version, `tsx --test`
with `node:test`. Amounts are `bigint` end to end.

Router work plans are snapshots. Guarded actions include a `guardPreflight` object containing
the exact subject, assets, amount, route hash, and guard bytes to pass to
`preflightMinimumOutput`. Their prepared calls contain only a structural placeholder floor;
replace it with the successful preflight floor and simulate immediately before signing.

See [`SDK_PLAN.md`](./SDK_PLAN.md) for the historical delivery plan and explicitly deferred
coverage. The code, tests, package READMEs, and this README define the supported public surface.

## Contributing and license

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the development and generated-source workflow.
This repository is licensed under the [Apache License 2.0](./LICENSE). Attribution notices are
recorded in [`NOTICE`](./NOTICE).
