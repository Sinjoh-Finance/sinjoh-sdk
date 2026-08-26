# v1 to v2 migration changelog

This is the short migration checklist for an application built against Sinjoh `1.1.3` and moving
to `2.2.5`. The API keeps its `/v1` URL; the package major changes because wallet execution and
deployment verification now fail closed when chain, account, or implementation state is ambiguous.

## Upgrade

Upgrade every Sinjoh package your application uses together:

```sh
npm install \
  @sinjoh/abis@2.2.5 \
  @sinjoh/agent@2.2.5 \
  @sinjoh/deployments@2.2.5 \
  @sinjoh/merkle@2.2.5 \
  @sinjoh/sdk@2.2.5 \
  viem@^2.55.10
```

Version 2 requires Node.js 22 or newer, ESM, and viem 2.55.10 or newer within major version 2.
Remove packages from the command if your application does not import them.

## What changed

| Surface | v2 change | Integration action |
| --- | --- | --- |
| Contracts and deployments | The production manifest now includes Project Launcher V2, its Registry, launch validator, launchpad adapters, governed modules, and the complete routed-asset implementation. The active Project generation launches through the public-indexed Pons V2 factory and locker; its Funding Bands verifier accepts the exact current ordinary and Project adapter runtimes. Every displaced Project, Funding Bands, Pons adapter, and buyback generation remains under an explicit historical key. Routes can send directly, swap, buy back and burn, fund Treasury/Airdrop/Raffle/liquidity/project sinks, and normalize into another route. | Read current and historical addresses and integration proofs from `@sinjoh/deployments`; do not retain copied v1 addresses or hand-build proofs. Run `verifyManifest` or `createSinjohClient().verify()` before use. |
| Deployment verification | Verification now checks every classified contract, dependency, EOA role, implementation hash, and active EIP-1967 or beacon implementation binding. Missing or contradictory trust metadata fails instead of being skipped. | Update custom manifests with explicit authority kinds and implementation bindings. Treat any failed or empty verification result as a hard stop. |
| ABIs | `@sinjoh/abis` adds the Project V2 Launcher, validator, Registry, Router, Treasury, staking, Airdrop, Raffle, liquid-votes wrapper, and remaining module ABIs. Project launch previews include `liquidVotes`, and Pons Project launch requests include the complete Funding Bands plan. | Recompile generated calls against the v2 ABI types. Import generated ABI values such as `projectLauncherV2Abi`, `projectLiquidVotesWrapperV2Abi`, and `projectRegistryV2Abi`; do not retain a locally copied ABI. |
| SDK | `@sinjoh/sdk` adds reviewed Project presets, deterministic prediction, complete route encoders, existing-token launches, Project Registry reads, provenance manifests, exact Pons Project launch assembly/simulation/verification, and one-for-one liquid-votes wrapper deposit/withdraw helpers. | Build creator input with `buildLaunchFromPreset` or `buildExistingTokenLaunchFromPreset`, validate it against the packaged Launcher, then assemble and simulate the exact launch transaction before signing. Use the wrapper helpers when a Project selects liquid token-holder governance. |
| Wallet-enabled agent embeddings | Wallet execution must use a public client bound to an explicit chain. The executor receives the snapshotted `request.account` and `request.chainId`; it must submit with those exact values. | Stop re-reading mutable wallet account or chain state inside the executor. Reject a mismatch before submission. The standalone MCP server still stores no key and cannot submit. |
| Public API | The service release is API 1.3.1, but paths remain under `/v1`. Discovery adds `supportedLaunchpads`; launches may include `image` and `features.projectV2`; Project records include governance and module addresses, including `router`. Event `reference` is now `string | null`, and registry health exposes more failure codes. | Keep the existing base URL. Regenerate API types, parse exact amounts with `BigInt`, accept historical/non-Project launches without `features.projectV2`, and do not assume optional fields exist on rows written before their release. |
| Token artwork | v2.1+ adds creator-signed PNG/JPEG/WebP publication and image-health reads. | Use `prepareLaunchImageAuthorization`, sign its exact EIP-712 payload as the indexed creator, then call `publishLaunchImage` with the unchanged bytes. |

## Project V2 launch flow

1. Load the active `mainnet` manifest from `@sinjoh/deployments` and require live verification to
   pass.
2. Load a platform-reviewed `ProjectLaunchPreset`. Keep infrastructure addresses, adapter proofs,
   routes, and module policy in that preset rather than creator form state.
3. Hydrate creator-owned fields with `buildLaunchFromPreset`, or use
   `buildExistingTokenLaunchFromPreset` for a launchpad-minted token.
4. Call `validateLaunchConfig` and `predictLaunch` against the packaged Launcher. For an existing
   token, use the corresponding `validateExistingTokenLaunchConfig` and
   `predictExistingTokenLaunch` helpers.
5. For Pons, use `assemblePonsProjectLaunchTransaction`, simulate from the creator account, and
   run `verifyPonsProjectLaunchTransaction` immediately before wallet submission.
6. After confirmation, persist `buildProjectLaunchManifest` output and read the immutable record
   through `projectRecord` or `GET /v1/launches/{subject}`.

## Breaking-change checklist

- [ ] Runtime is Node.js 22+, ESM, with viem 2.55.10+ in major version 2.
- [ ] All installed `@sinjoh/*` packages use the same `2.2.5` release line.
- [ ] Packaged or custom deployments pass the stricter live verification.
- [ ] An embedded wallet executor submits with the supplied account and chain ID.
- [ ] API decoding accepts `ProtocolEventRecord.reference` as `string | null`.
- [ ] Launch rendering handles absent historical `image` and `features.projectV2` values.
- [ ] Project routes and adapter proofs come from the active attested release.
- [ ] The exact final transaction is simulated immediately before the creator signs.

For the complete release history, see the [changelog](../CHANGELOG.md). For field-level API
details, see the [API reference](./api.md).
