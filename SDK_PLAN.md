# Sinjoh SDK Development Plan

Last updated: 2026-08-18
Status: in progress — Phases 0–2 complete (`sinjoh-sdk/` workspace:
`@sinjoh/abis`, `@sinjoh/deployments`, `@sinjoh/merkle` — the package the
plan below calls `@sinjoh/trees` — with the keeper consuming
`@sinjoh/merkle`; `@sinjoh/sdk` carries the codecs, prediction, error
decoding, client setup, live read layer, and guard preflights). Phase 3
is partially landed: prepared-action builders for the full permissionless
lifecycle, the router work planner, the Pons v2 activation checklist, and
the step-typed Pons v2 launch flow (`planPonsV2Launch`, ported from the
production fork rehearsal's ordering), plus a CI workflow enforcing
generated-source drift checks and the keeper's shared-package suite.
Flap and letscash flows are landed (`planFlapLaunch`,
`planLetsCashIntegration`), each ported from its production fork
rehearsal; pools.trade deliberately waits for a rehearsal of its own in
`sinjoh-integration` before a flow ships. Remaining for Phase 3: that
pools.trade rehearsal + flow, and the mainnet-fork rehearsals replayed
through the SDK — fork tests need RPC egress the development sandbox does
not have, so they must run in an environment with `RH_RPC_URL` access.
Phase 4's core is landed: `@sinjoh/agent` (the `sinjoh-mcp` stdio MCP
server over the read/plan/preflight/validate/prepare surface, tested over
an in-memory transport), the `llms.txt` protocol digest, and an example
script; generated reference docs remain. Fixture regeneration is one
command (`npm run fixtures` in `sinjoh-sdk/`). Publishing remains gated
on the license and npm-scope decisions.

The 2026-08-18 hardening pass also closes the principal trust-boundary gaps:
local config validation mirrors initializer limits, launch planners reject
known-reverting parameter combinations, router plans carry contract-capped
amounts and exact guard-preflight inputs, clients enforce chain/manifest
identity, implementation hashes are verified, and Merkle proof verification
recomputes domain-bound leaf preimages.

## Purpose

Plan the design and delivery of an official Sinjoh SDK for the immutable Sinjoh
protocols on Robinhood Chain (mainnet `4663`, testnet `46630`). The SDK's target
audience is:

1. **Developers** building UIs, dashboards, launch wizards, and integrations
   against the deployed contracts.
2. **Agents** — autonomous keepers, bots, and LLM-driven agents that discover
   pending protocol work, simulate it, and submit permissionless maintenance
   transactions, or that orchestrate launches end to end.

Both audiences need the same three things the repository does not currently
export: authoritative ABIs, authoritative addresses, and correct
byte-exact configuration encoding. Everything else builds on those.

## Current state (survey findings, 2026-08-18)

- **No SDK-like code exists.** A case-insensitive search for "sdk" finds no
  Sinjoh code. All three TypeScript packages (`sinjoh-keeper`,
  `sinjoh-indexer`, `sinjoh-market-indexer`) are `"private": true`.
- **No ABI artifacts are exported.** `**/out/` is gitignored in every Foundry
  package and no `foundry.toml` sets `extra_output`. The only machine-readable
  ABIs are the hand-written, deliberately partial viem ABIs in
  `sinjoh-keeper/src/abis.ts` (~40 exports covering only what the keeper
  calls) plus event-signature strings in the two Envio `config.yaml` files and
  selected function descriptors in `clear-signing/*.json`.
- **Addresses have three independent hand-synced sources**:
  `mainnet-deployments.json` (root, 40 KB, nothing imports it), the keeper's
  per-launch manifests in `sinjoh-keeper/config/*.json`, and inline
  `ENVIO_*` defaults in `sinjoh-indexer/config.yaml`.
- **The hardest integration problem is already solved twice, but not
  packaged**: the circular predict/deploy/bind launch ordering
  (predict router → predict Pons v2 curve/token → build raffle config around
  the predicted curve → deploy raffle → deploy router naming raffle as sink →
  launch → verify readbacks). The normative on-chain reference is
  `sinjoh-integration/test/ProductionPonsV2Raffle.fork.t.sol`; its off-chain
  twins are `sinjoh-keeper/src/ponsv2/predict.ts` and
  `sinjoh-keeper/src/ponsv2/raffle-launch.ts`, fixture-pinned to the Solidity
  encodings.
- **Golden fixtures exist and are reusable**: `ticket-tree.json`,
  `slot-indices.json`, `config-hash.json`, `ecvrf-proofs.json`,
  `ponsv2-prediction.json`, mirrored between Solidity packages and the keeper
  via `npm run fixtures`.
- **Read infrastructure**: Envio GraphQL (deployment `sinjoh`, plus the
  split-out `sinjoh-market` history indexer), the Supabase
  `public_launches` view (the only anonymous curated-metadata surface, served
  by the UI's `/api/launches`), and direct RPC. The keeper deliberately
  exposes no read API.
- **Stack conventions to inherit**: viem `2.55.10` (exact-pinned; no ethers,
  no typechain, no wagmi in this repo), strict TypeScript 7, ESM, Node ≥ 22,
  Foundry-only Solidity builds.
- ⚠️ **Documentation contradiction to resolve during Phase 0**: `README.md`
  and `UI-NOTES.md` still state that mainnet has not been deployed, while
  `mainnet-deployments.json` (`status: "core-infrastructure-deployed"`,
  `releaseCandidate: true`), the treasury README, and the indexer defaults
  carry live chain-`4663` addresses. The deployment manifest and indexer
  config are treated as authoritative; the prose is stale and must be updated
  before the SDK's docs cite it.

## Design principles

These mirror the rules the contracts themselves enforce, as specified in the
per-package `SPEC.md` files and the operational handoffs (`UI-NOTES.md`,
`KEEPER_REQUIREMENTS.md`). (`STRATEGY.md` is historical and is not a
normative reference for the SDK.)

1. **Manifest-driven, never hard-coded.** Every client loads a versioned,
   chain-specific deployment manifest with addresses and expected runtime code
   hashes. The SDK ships the canonical manifests and a verifier
   (`eth_getCode` hash check) but accepts user-supplied manifests of the same
   schema. Testnet addresses are never fallbacks for mainnet.
2. **Live chain state is authoritative.** Reads reconcile to contract getters
   at a confirmed block; events and indexer data are history/notification
   only. The SDK must make the "never derive pending balances only from
   events" rule the easy path.
3. **Byte-exact encoding is a first-class citizen.** Router `Config`, airdrop
   sink config, liquidity sink config, and raffle `Config` must match Solidity
   `abi.encode` exactly (enums as `uint8`, exclusions sorted by 20-byte
   numeric value). Every codec has an accompanying `hash`/`predict` helper and
   an on-chain readback verifier (`configHash`, `hashConfig`,
   `predictAddress`). Fixture parity tests gate every release.
4. **Simulation before signature, one action per transaction.** All write
   helpers return prepared, simulatable transaction requests; the SDK never
   custodies keys and never batches unrelated protocol actions. Signing is the
   caller's concern (browser wallet, keeper key, or agent-held signer).
5. **Typed errors and explicit states.** Decode the protocol's custom errors
   (`OracleNotReady`, `ExcessivePriceDeviation`, `InvalidInterval`,
   `ConfigurationMismatch`, `CreatorTaxTooHigh`, …) into typed results with
   the actionable messages already specified in `UI-NOTES.md`. Model the
   lifecycle as the explicit state machine `UI-NOTES.md` defines
   (`Router deployed, subject unbound`, `Inactive upstream`,
   `Bucket conversion ready`, …) instead of a generic pending flag.
6. **Amounts are `bigint` end to end.** Raw integer units and basis points
   everywhere; formatting is a leaf concern.
7. **Trust boundaries are visible in the API.** Permissionless calls,
   creator-only calls, attestor-only calls, and upstream-Pons-authority calls
   are separated by module and documented per function. Signed-floor guards
   (`floorDigest`) expose digest computation and read-only
   `minimumOutput`/`spotQuote`/`quoteAtTwap` preflights, but the SDK does not
   sign quote floors — that key stays with the keeper's quote signer.
8. **Agent-legible by construction.** Everything a human reads has a
   machine-readable twin: JSON schemas for manifests and configs, discriminated
   unions for states and errors, deterministic pure functions for planning
   ("what work is pending on this router?"), and docs generated from the same
   type definitions. This is what makes the SDK serve LLM agents without a
   separate product.

## Proposed packages

A new `sinjoh-sdk/` workspace in this monorepo (npm workspace, independent of
the Foundry packages, matching the repo's package-independence rule):

| Package | Contents |
|---|---|
| `@sinjoh/abis` | Complete generated ABIs + event definitions + custom error definitions for every Sinjoh contract and the verified third-party surfaces (Pons v1/v2, Flap, pools.trade, letscash.fun, Uniswap v3/v4 subset). Generated from Foundry `out/` at a pinned source commit; `as const` typed for viem inference. No runtime code. |
| `@sinjoh/deployments` | Typed chain manifests (mainnet `4663`, testnet `46630`): addresses, deployment blocks, runtime code hashes, dependency addresses, route-profile registry, schema version. Generated from `mainnet-deployments.json` after that file gains a JSON schema. Includes the `verifyManifest(client)` code-hash checker. |
| `@sinjoh/sdk` (core) | viem-based clients and pure helpers: config codecs, prediction, launch orchestration, lifecycle actions, read layer, guard preflights, error decoding, work planner. Depends on the two packages above and `viem` only. |
| `@sinjoh/merkle` | The deterministic Merkle-sum implementations promoted out of the keeper: airdrop tree (`sinjoh-keeper/src/airdrop/merkle.ts`), raffle ticket tree (`src/raffle/tree.ts`), and proof verification, pinned to the existing golden fixtures. Optional home for the ECVRF verifier-side helpers (never the prover key). |
| `@sinjoh/agent` (later phase) | Agent-facing surface on top of core: an MCP server exposing read/plan/simulate tools, plus prompt-ready protocol documentation (`llms.txt`-style) generated from the SDK's own types and the SPEC files. |

The keeper migrates to consume `@sinjoh/abis`, `@sinjoh/deployments`, and
`@sinjoh/merkle` so there is exactly one implementation of each encoding, with
the keeper's production usage acting as a continuous integration test of the
SDK.

## Core SDK module breakdown (`@sinjoh/sdk`)

1. **Client setup** — `createSinjohClient({ chain, transport | publicClient,
   manifest? })`; wraps a viem public client; optional wallet client for
   writes. Multi-RPC read verification (two independently configured
   endpoints) exposed for snapshot-sensitive flows, matching the keeper
   requirement.
2. **Config codecs** — encode/decode/hash for `RouterTypes.Config`, airdrop
   sink config `(minPayout, maxBatchSize, minConfirmations, exclusions[])`,
   liquidity sink config (15-field tuple), `RaffleTypes.Config`, funding-bands
   `BandConfig[]`. Each with validation of the documented hard limits (bucket
   bps sum, 1–8 buckets, 1–16 allocations, byte-size caps, exclusion sorting,
   `quoteSwapBps` 4,500–5,500, …) so invalid configs fail locally with
   readable errors before any RPC call.
3. **Prediction** — `predictRouter`, `predictLaunchpadAdapter` (per family),
   `predictRaffle` + `hashConfig`, Pons v2 curve/token prediction
   (port of `src/ponsv2/predict.ts`), pools.trade `predictSubject`,
   EIP-1167 `expectedCloneRuntime`. All pure where possible.
4. **Launch orchestration** — resumable, step-typed flows per launchpad
   family (Pons v1, Pons v2 with optional raffle and funding-bands escrow,
   Flap, pools.trade instant/LBP, letscash activation), each step yielding a
   prepared transaction + expected readbacks, following
   `ProductionPonsV2Raffle.fork.t.sol` step for step. Includes the activation
   checklist (adapter/router/subject/redirect/collection-path checks) as a
   single `verifyActivation()` returning the explicit state.
5. **Lifecycle actions** — collect/forward, `sync`, `processBucket` tranche
   sizing (`min(bucketInputOwed, maxAmountInPerCall)`), `sendProtocolFee`,
   `sendWallet`, `fundSink`, `claimPonsV2Fees`, liquidity `mint`/`collect`/
   `sendFee`, airdrop `push` batch construction, raffle `claim`/`expireRound`/
   `abandonRound`/`deliverOwed`, randomness `seal`/`fulfill`/`deliver`
   (prover excluded), revenue-collector `forward`/`forwardAll`.
6. **Work planner** — the read-side twin of the keeper's eligibility logic:
   given a manifest and a router/account, return the list of currently
   eligible permissionless actions with amounts, guard preflight results, and
   the lifecycle state label. This is the primary agent entry point.
7. **Guard preflights** — `minimumOutput`, `quoteAtTwap`, `spotQuote`,
   oracle-readiness and interval checks, mapped to the typed
   `OracleNotReady` / `Price moved` / `Interval not elapsed` outcomes.
8. **Read layer** — three explicit tiers, never conflated: live RPC getters
   (the reads table in `UI-NOTES.md`), Envio GraphQL typed queries for the
   indexed entities (`Launch`, `RaffleRound`, `AirdropEpoch`,
   `MarketVolumeHour`, …), and the Supabase `public_launches` view. Indexer
   lag is surfaced, and a `reconcile()` helper re-checks indexer-derived
   pending amounts against contract state at a confirmed block.
9. **Error decoding** — full custom-error ABI registry with the
   message mapping from `UI-NOTES.md`, plus upstream Pons authorization
   failures.

Out of scope for the SDK (deliberately): key custody, the ECVRF prover key,
attestor signing, quote-floor signing, gas reimbursement, and any server-side
write API. The keeper remains the operational reference for those.

## Delivery phases and gates

Phase gating follows the repo's existing culture: each phase has tests and an
explicit review gate before the next begins.

### Phase 0 — Source-of-truth groundwork (in the existing packages)

1. Add ABI artifact generation to each Foundry package
   (`extra_output = ["abi"]` or a harvest script over `out/`), pinned to a
   recorded source commit, with a check that regenerating is clean.
2. Write a JSON schema for `mainnet-deployments.json`, normalize its shape
   (the `fundingBands`/`raffleOperations` nesting is currently ad hoc), and
   validate in CI.
3. Reconcile the stale "no mainnet" prose in `README.md`/`UI-NOTES.md` with
   the deployment manifest.
4. Decide the open questions below (naming, registry, licensing).

Gate: generated ABIs and validated manifests exist for every deployed
contract in `currentInfrastructure`, byte-derived from the pinned commit.

### Phase 1 — `@sinjoh/abis`, `@sinjoh/deployments`, `@sinjoh/merkle`

1. Scaffold the `sinjoh-sdk/` workspace (strict TS, ESM, Node ≥ 22, viem
   peer dependency).
2. Generate the two artifact packages from Phase 0 outputs; add the
   code-hash manifest verifier.
3. Promote the keeper's tree/Merkle modules into `@sinjoh/merkle` and repoint
   the keeper to it.
4. Port all existing golden fixtures as the packages' test suites.

Gate: keeper `npm test`/`typecheck`/`build` green while consuming the new
packages; fixture parity 100%.

### Phase 2 — Core read layer, codecs, prediction

1. Config codecs with local validation and hash/readback verification.
2. Prediction module (router/adapter/raffle/curve), ported from the keeper
   and validated against `ponsv2-prediction.json` and, on fork, against the
   live factories.
3. Client setup, live-read surface, error decoding, guard preflights.
4. Read-only fork tests against Robinhood mainnet RPC (same
   `RH_RPC_URL`-gated pattern as `sinjoh-integration`).

Gate: for a live launch (e.g. one of the keeper's production manifests), the
SDK reproduces every predicted address, config hash, and pending-work read
that the keeper computes.

### Phase 3 — Actions, work planner, launch orchestration

1. Prepared-transaction builders for the full lifecycle action set, each
   simulated in fork tests.
2. Work planner returning eligible actions + states; cross-checked against
   keeper behavior on the same manifests.
3. Resumable launch flows per family, replaying
   `ProductionPonsV2Raffle.fork.t.sol` (and the Flap/letscash fork tests)
   through the SDK on a mainnet fork.
4. Explicit-state machine types and activation checklist.

Gate: an end-to-end fork rehearsal — launch, route fees, fund sinks, commit
and push an airdrop epoch (build-only trees), raffle round claim — driven
entirely through SDK calls.

### Phase 4 — Agent surface and documentation

1. `@sinjoh/agent`: MCP server exposing read/plan/simulate/prepare tools
   (no signing), suitable for Claude/other agent runtimes; every tool result
   carries the explicit state labels and typed errors.
2. Generated reference docs + task-oriented guides (launch wizard, keeper-in-
   twenty-lines, holder dashboard), plus an `llms.txt` protocol digest
   generated from SPEC files and SDK types.
3. Example projects: minimal UI read integration; minimal agent that finds
   and simulates pending router work.

Gate: an agent with only the MCP tools and generated docs can, unaided,
enumerate pending work on a live router and produce a correct simulated
transaction set.

### Phase 5 — Hardening and release

1. Versioning policy: SDK semver, with each release pinning
   (ABI version, deployment-manifest version, source commit) — the same
   triple `UI-NOTES.md` requires of the frontend manifest.
2. Publish pipeline (registry per Phase 0 decision), provenance/signed
   releases, CHANGELOG discipline.
3. Security review pass: no secrets in artifacts, no signing surprises,
   dependency audit, and a review of the agent tool surface for
   prompt-injection-resistant output framing.
4. Migrate `sinjoh-indexer` config defaults to derive from
   `@sinjoh/deployments` where practical, ending the three-way address sync.

Gate: first public release; keeper and (external) UI both consuming
published versions.

## Testing strategy

- **Fixture parity** — every codec, hash, tree, and prediction is pinned to
  the existing golden fixtures; fixtures remain generated by the Solidity
  reference implementations, mirrored by script as today.
- **Fork tests** — `RH_RPC_URL`-gated tests against Robinhood mainnet, reusing
  the `sinjoh-integration` rehearsal scenarios as the acceptance suite.
- **Keeper as canary** — the keeper's production use of the shared packages
  continuously validates the SDK against real operations.
- **Contract-drift detection** — CI regenerates ABIs from the pinned commit
  and fails on drift; the manifest verifier fails on runtime code-hash
  mismatch.

## Open questions (need owner decisions before Phase 1)

1. **npm scope and registry** — is `@sinjoh/*` on public npm the intent, and
   is the scope available? Public registry vs. GitHub Packages?
2. **License** — the repo currently has no top-level LICENSE; the SDK needs
   one before publishing.
3. **Repo placement** — this plan assumes `sinjoh-sdk/` inside the monorepo
   (keeps fixtures and fork tests adjacent). A separate repo would decouple
   release cadence but re-create the artifact-sync problem the SDK exists to
   solve.
4. **Third-party ABI redistribution** — confirm we may redistribute the
   verified Pons/Flap/pools.trade/letscash ABI subsets in `@sinjoh/abis`
   (they are on-chain-verified, but licensing posture should be explicit).
5. **Launchpad coverage for v1** — all five families from day one, or
   Pons v1 + Pons v2 (+ raffle) first with Flap/pools.trade/letscash in a
   fast-follow?
6. **Testnet manifest** — testnet `46630` contracts predate the hardened
   revision; does the SDK ship the historical testnet manifest, wait for the
   fresh release-candidate testnet sweep, or mark it explicitly
   `historical`?
7. **Supabase surface** — should `public_launches` be consumed directly by
   the SDK, or only via the UI's `/api/launches` so the Supabase project
   stays an internal detail?
