# @sinjoh/abis

Generated, viem-typed ABIs for the Sinjoh contracts on Robinhood Chain. Use this package when
you need the canonical callable surface without importing the higher-level SDK.

## Install

```sh
npm install @sinjoh/abis viem
```

## Use an ABI

```ts
import { sinjohFeeRouterAbi } from "@sinjoh/abis";
import type { Address, PublicClient } from "viem";

export function readRouterSubject(client: PublicClient, router: Address) {
  return client.readContract({
    address: router,
    abi: sinjohFeeRouterAbi,
    functionName: "subject"
  });
}
```

Every ABI export is a TypeScript `as const` value, so viem infers function names, arguments,
and return types. Contract names use lower camel case followed by `Abi`, such as
`sinjohRaffleRewardsAbi` and `sinjohPonsV2AdapterAbi`. The governed protocol upgrade is
exported in the same package, including `feeRouterV2Abi`, `stakingEngineAbi`,
`sinjohStakingEngineAbi`, `yieldBasketAbi`, `dynamicFundingBandsAbi`, and
`sinjohGovernorAbi`, plus `addressGovernanceControllerAbi`,
`governanceControllerFactoryAbi`, `governedAbi`, `immutableGovernanceControllerAbi`, and
`stakedVotesAdapterAbi`. These upgrade exports are source/ABI artifacts only: the deployment
manifest contains no production addresses for them.

`sinjohAirdropDistributorAbi` remains the default standard airdrop surface and does not require
staking. `sinjohStakingEngineAbi` is the separate optional surface for staking-driven,
claim-based distributions. Its empty-weight epochs roll pending rewards into a later eligible
window. Staking checkpoints and the ERC-5805 adapter use timestamp timepoints; reward and voting
weight become zero at the exact unlock timestamp even before principal is withdrawn. Epoch reads
separate their conservative checkpoint time from the actual eligibility time. `yieldBasketAbi`
exposes token-specific reward routes and the governed, fully-paused adapter write-off/recovery
lifecycle.

## Provenance

`abiSourceCommit` records the repository commit used to generate the package.
`abiContractCounts` records the number of contracts harvested from each Foundry package.
Generation includes only compilation targets under each package's `src/` directory; tests,
scripts, mocks, copied interfaces, and vendored libraries are excluded.

Do not edit generated files. From the repository's `sinjoh-sdk` directory, build the Foundry
packages and run `npm run generate`. CI fails when committed ABIs drift from build output.

See the [SDK workspace documentation](https://github.com/Sinjoh-Finance/sinjoh-sdk)
for the package map and release status.
