# Repository Migration

This repository was extracted with `git-filter-repo` from the private
`Sinjoh-Finance/sinjoh-legacy` monorepo.

- Legacy freeze tag: `provenance/pre-reorganization-2026-08-18`
- Original freeze commit: `01628f65885e732ffb7a2d84dce2f4065221e048`
- Filtered freeze commit: `8c3abf496da0f91f8cfc8203d55ccf645ae720e8`
- Extraction date: 2026-08-18

The extraction promoted `sinjoh-sdk/` to the repository root and retained the
SDK plan, deployment snapshot, provenance record, and SDK CI history. Contract
fixture and ABI regeneration uses a sibling `sinjoh-contracts` checkout or the
`SINJOH_CONTRACTS_ROOT` environment variable.
