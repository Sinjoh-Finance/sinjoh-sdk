# Changelog

All notable changes to the Sinjoh SDK are documented here. This project follows
[Semantic Versioning](https://semver.org/).

## 2.2.5 - 2026-08-25

### Added

- Added the generated `ProjectLiquidVotesWrapperV2` ABI and typed one-for-one
  `depositFor` / `withdrawTo` transaction helpers for Project governance.
- Added Project Airdrop and Raffle agnostic-router funding overloads and the
  Project Pons adapter Funding Bands plan to the generated contract ABIs.

### Changed

- Project launch previews now expose the deterministic `liquidVotes` address,
  and Project Pons launch requests encode the complete Funding Bands plan.
- Regenerated all contract ABIs from reviewed implementation source commit
  `91aa7e53fc5da3c8dd78e789820ce983f1c3483a` so every workspace package shares
  one source provenance and ABI digest.

### Tests

- Added exact Project launch-request coverage for the IssaDAO configuration,
  including Treasury and staking modules, staked voting, 4% creator tax,
  0.01 ETH developer buy, and the two Funding Bands allocations.

## 2.2.4 - 2026-08-25

### Fixed

- Promoted the coherent ordinary Pons V2 buyback generation: adapter
  `0x1BE0E8F04221329FDfea34f41a1832a80c2c147c` and price guard
  `0x902A6Fa8Ca273aAB186633FF27879Cd3703F6AED` now occupy the canonical deployment
  keys used by integrations.
- Preserved the prior indexed-factory adapter and price guard under the historical-generation
  deployment keys so existing integrations can continue to verify earlier launches.

## 2.2.3 - 2026-08-25

### Fixed

- Promoted the Project V2 launch validator that rejects raffle funding routes when the routed
  output asset differs from the immutable raffle prize asset.
- Updated generated Project V2 ABIs and production deployment bindings to source commit
  `41dbce2d050abe958e604c236c0346e69be231ff`, while preserving both prior production
  generations under their historical deployment keys.

### Tests

- Pinned the successor Launcher, Registry, deployment engine, launch validator, and Pons Project
  adapter addresses in the deployment-manifest regression suite.

## 2.2.2 - 2026-08-25

### Fixed

- Promoted the gas-bounded Project V2 Launcher and Registry release so full Project launches can
  register every selected governed module within the production transaction gas cap.
- Updated the generated Project V2 ABIs and production deployment bindings to source commit
  `3d6dd815ff326a40bee04caa833b5ccd61de0f44`, while preserving the prior production generation
  under its historical deployment keys.

### Tests

- Pinned the successor Launcher, Registry, deployment engine, and launch validator addresses in
  the deployment-manifest regression suite.

## 2.2.1 - 2026-08-25

### Added

- Added Project V2 Launcher and Registry ABIs, reviewed preset hydration, deterministic module
  prediction, exact Pons launch-transaction assembly and verification, and launch provenance
  manifests.
- Added complete Project V2 routed-action encoding for direct sends, swaps, buyback-and-burn,
  Treasury, Airdrop, Raffle, liquidity, project-sink funding, and normalization chains.
- Added attested candidate/active promotion imports and generated consumer deployment bindings.

### Changed

- Generated ABIs and deployment packages now track the complete-routing Project V2 production
  release, including the four-leaf Pons integration proof.
- Project V2 preset materialization now resolves creator wallet placeholders while preserving
  module-specific Launcher placeholders.

### Tests

- Added byte-exact routed-action codec tests, Treasury-recipient coverage, four-leaf proof
  coverage, Pons launch assembly verification, and release-promotion validation.

## 2.1.0 - 2026-08-22

### Added

- Added creator-signed launch-artwork preparation and publication in the SDK and MCP, using
  short-lived EIP-712 authorization over the exact image hash, type, and byte count.
- Added canonical image records to launch responses and image-reconciliation health diagnostics,
  including a separate state for launches whose creator intentionally supplied no artwork.

### Changed

- Validate PNG, JPEG, and WebP structure and dimensions before requesting a creator signature;
  immutable publication remains limited to 2 MB and 4096 by 4096 pixels.
- Documented automatic launchpad-specific recovery into Sinjoh-controlled content-addressed
  storage and the UI fallback contract for launches without artwork.

## 2.0.0 - 2026-08-21

This major release intentionally fails closed where 1.x accepted ambiguous API, wallet, or
deployment state. Wallet embeddings must use a chain-bound client and honor the snapshotted
account/chain passed to their executor. Custom manifests should classify authority roles and all
contract dependencies; verification results now include EOA and active-implementation checks.

### Added

- Added MCP registry-health discovery and fee-router filtering, including structured API error
  details that agents can branch on reliably.
- Added dependency runtime verification to the default manifest safety check.
- Added active-implementation binding checks for EIP-1967 and beacon dependencies.

### Changed

- Validate MCP simulation against a snapshotted chain and account, pass that binding to the
  host executor, and report provider outages separately from on-chain guard reverts.
- Wallet-enabled embeddings now require a chain-bound public client. Their executor must submit
  with the supplied `request.account` and `request.chainId`; the host remains the final signing
  and authorization boundary.
- Expanded API types and OpenAPI discovery for dynamic launchpads and arbitrary event references.
- Hardened immutable package releases by regenerating and diff-checking ABIs and deployments at
  the tag being published.

### Fixed

- Made every MCP result JSON-safe before transport, including confirmed receipts with bigint
  fields, so a submitted transaction always returns its hash instead of timing out after broadcast.
- Preserved full registry-health diagnostics on HTTP 503 responses.
- Rejected malformed deployment trust metadata instead of silently dropping it during generation.

## 1.1.3 - 2026-08-21

### Added

- Added typed registry-parity health checks so integrations can detect any indexed launch that
  has not reached public discovery.
- Added `feeRouter` filtering to launch-list queries for canonical router authorization.

### Changed

- Documented the registry health contract, its unhealthy `503` response, and all publication
  failure codes in the OpenAPI specification.

## 1.1.2 - 2026-08-21

### Fixed

- Removed the manual registry handoff added in 1.1.1. The platform now reconciles every indexed,
  subject-bound launch into public discovery automatically across all supported launchpads.

## 1.1.1 - 2026-08-21

### Fixed

- Let’s Cash integration plans now make the separate Sinjoh registry publication handoff
  explicit after activation, preventing fully indexed launches from being omitted from
  `public_launches`.

## 1.1.0 - 2026-08-20

### Added

- `sinjohLaunchStakingEngineAbi`, generated from the merged contracts source commit.
- The verified Robinhood Chain deployment at
  `mainnet.contracts.launchStakingEngine`, including its transaction, block, and runtime hash.

### Changed

- Documented the launch-only staking surface separately from both standard holder airdrops and
  the older single-token `$INJOH` staking deployment.

## 1.0.0 - 2026-08-19

The first stable public release.

### Added

- Typed ABIs and a provenance-pinned Robinhood Chain mainnet deployment manifest.
- Live runtime-code verification for packaged contract addresses and implementations.
- Byte-exact router, raffle, airdrop, and liquidity configuration codecs.
- Deterministic airdrop and raffle Merkle-sum trees pinned to Solidity fixtures.
- Pons v2, Flap, and letscash.fun launch planners; lifecycle prepared calls; router
  work planning; activation checks; guard preflights; and typed error guidance.
- An MCP server for public data, read, plan, validate, preflight, and prepare workflows,
  with optional simulate-first submission through a host-injected wallet.
- A typed client for the full public Sinjoh API, covering every protocol data group.
- Apache-2.0 licensing, package provenance, deterministic release gates, and public
  developer documentation.

### Security

- The core SDK never stores keys, signs transactions, or submits them. The MCP server accepts
  only a host-owned wallet executor, checks its chain, and simulates before requesting a signature.
- Packaged deployment addresses are treated as untrusted until their live runtime
  hashes pass verification.
- Guarded prepared calls remain non-executable templates until a fresh preflight
  floor is inserted and the result is simulated.
