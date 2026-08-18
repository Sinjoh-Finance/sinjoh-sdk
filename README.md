# Sinjoh SDK

TypeScript SDK workspace for the immutable Sinjoh protocols on Robinhood
Chain. See [`../SDK_PLAN.md`](../SDK_PLAN.md) for the full plan and phase
gates.

All packages are `"private": true` until the license and npm scope
decisions in the plan are made. Nothing here is publishable yet.

## Packages

| Package | Purpose |
|---|---|
| [`@sinjoh/abis`](./packages/abis) | Generated, viem-typed ABIs for every Sinjoh contract, harvested from Foundry build output at a pinned source commit. |
| [`@sinjoh/deployments`](./packages/deployments) | Typed chain manifests generated from `mainnet-deployments.json`, plus the runtime code-hash manifest verifier. |
| [`@sinjoh/trees`](./packages/trees) | The deterministic Merkle-sum trees (airdrop epochs, raffle ticket intervals) and the winning-index derivation, pinned to the Solidity-generated golden fixtures. |

## Regenerating

Generated sources are committed. To regenerate them:

```sh
# 1. Build every Foundry package (requires forge + solc 0.8.28)
for p in ../sinjoh-*/foundry.toml; do (cd "$(dirname "$p")" && forge build); done

# 2. Harvest ABIs and deployment manifests
npm run generate
```

CI must fail if regeneration produces a diff (`git diff --exit-code` after
`npm run generate`): the generated sources are derived, never hand-edited.

## Conventions

Same as the rest of the repository: strict TypeScript (NodeNext, ES2022),
ESM, Node >= 22, `viem` pinned at the keeper's exact version, `tsx --test`
with `node:test`. Amounts are `bigint` end to end.
