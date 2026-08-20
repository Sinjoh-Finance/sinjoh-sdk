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
`sinjohGovernorAbi`, plus `sinjohLaunchStakingEngineAbi`, `addressGovernanceControllerAbi`,
`governanceControllerFactoryAbi`, `governedAbi`, `immutableGovernanceControllerAbi`, and
`stakedVotesAdapterAbi`. These upgrade exports are source/ABI artifacts only except for the
independently deployed `SinjohLaunchStakingEngine` described below.

`sinjohAirdropDistributorAbi` remains the default standard airdrop surface and does not require
staking. `sinjohStakingEngineAbi` is the separate optional surface for staking-driven,
claim-based distributions. Its zero-stake epochs roll pending rewards into a later eligible
window. `stakingEngineAbi` exposes simple raw-balance staking: one token equals one reward unit
and one non-delegated vote, `stake` adds to the balance, and `unstake` immediately removes any
available portion. There are no tiers, locks, multipliers, or cooldowns. Timestamp checkpoints
preserve completed epoch and governance snapshots after a later unstake. `yieldBasketAbi`
exposes token-specific reward routes and the governed, fully-paused adapter write-off/recovery
lifecycle, plus governance-only recovery for non-deposit tokens received outside a verified
harvest. `feeRouterV2Abi` exposes per-route escrow balances, permissionless retry, and governed
recovery so one paused or reverting destination does not freeze unrelated fee routes.

`sinjohLaunchStakingEngineAbi` is the production platform surface for new launches that opt into
staking-required airdrops. It is a shared multi-token contract: every launched token is its own
staking subject, one staked token is one reward unit, and unstaking is immediate. Reward accounts
are isolated by fee router, subject, and payout asset. The reviewed Robinhood Chain deployment is
available as `mainnet.contracts.launchStakingEngine` from `@sinjoh/deployments`. It is unrelated
to the older single-token `$INJOH` deployment.

## Provenance

`abiSourceCommit` records the repository commit used to generate the package.
`abiContractCounts` records the number of contracts harvested from each Foundry package.
Generation includes only compilation targets under each package's `src/` directory; tests,
scripts, mocks, copied interfaces, and vendored libraries are excluded.

Do not edit generated files. From the repository's `sinjoh-sdk` directory, build the Foundry
packages and run `npm run generate`. CI fails when committed ABIs drift from build output.

See the [SDK workspace documentation](https://github.com/Sinjoh-Finance/sinjoh-sdk)
for the package map and release status.
