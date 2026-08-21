# Changelog

All notable changes to the Sinjoh SDK are documented here. This project follows
[Semantic Versioning](https://semver.org/).

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
