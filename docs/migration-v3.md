# Migrating to SDK 3

Version 3 introduces the successor standalone raffle configuration. Do not use its launch
planners against a previous-generation raffle factory. The planners verify
`hashConfig` compatibility before returning deployment transactions.

Every `RaffleStockReward` now requires `maxAmountInPerCall`, a positive `bigint`
that fits `uint128`. This bounds the WETH converted in one processing call; it
does not cap the total prize. Use the limit from the reviewed stock-route
configuration rather than selecting an arbitrary value. Stock payout processing
can require several transactions before final settlement.

`maxPrize` must be `0n`. The prize is the creator-selected percentage of the
available pool. Up to 64 stock rewards are supported.

Update all `@sinjoh/*` packages together to version 3. Regenerate deployment
bindings from the finalized, attested successor release when building a custom
distribution. SDK 3.0.0 includes factory
`0x1F3F41C97851F0bC9762Bc789eD0Ac82bff128F5` and active release
`raffle-successor-mainnet-20260911-2e01b6e`. Existing immutable raffles
continue using their original configuration and ABI.

Project V2 launches retain their deployed configuration and ABI. Their contracts
were not replaced by the standalone raffle deployment. `abiProjectV2SourceCommit`
records the independently compiled source for the six affected Project V2 launch
and raffle contracts; unrelated integrations retain the current ABI source. The
primary `abiSourceCommit` records the standalone successor release. Both source
trees are rebuilt in CI. Do not add the standalone payout-limit field to a
Project V2 stock reward configuration.
