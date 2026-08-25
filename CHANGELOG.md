# Changelog

All notable changes to the Sinjoh SDK are documented here. This project follows
[Semantic Versioning](https://semver.org/).

## 2.2.0 - 2026-08-25

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
