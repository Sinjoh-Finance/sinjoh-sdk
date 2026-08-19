# Changelog

All notable changes to the Sinjoh SDK are documented here. This project follows
[Semantic Versioning](https://semver.org/).

## 1.0.0 - 2026-08-19

The first stable public release.

### Added

- Typed ABIs and a provenance-pinned Robinhood Chain mainnet deployment manifest.
- Live runtime-code verification for packaged contract addresses and implementations.
- Byte-exact router, raffle, airdrop, and liquidity configuration codecs.
- Deterministic airdrop and raffle Merkle-sum trees pinned to Solidity fixtures.
- Pons v2, Flap, and letscash.fun launch planners; lifecycle prepared calls; router
  work planning; activation checks; guard preflights; and typed error guidance.
- A signer-free MCP server for read, plan, validate, preflight, and prepare workflows.
- Apache-2.0 licensing, package provenance, deterministic release gates, and public
  developer documentation.

### Security

- The SDK never stores keys, signs transactions, or submits them.
- Packaged deployment addresses are treated as untrusted until their live runtime
  hashes pass verification.
- Guarded prepared calls remain non-executable templates until a fresh preflight
  floor is inserted and the result is simulated.
