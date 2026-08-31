# @sinjoh/sdk

Project Launcher V2 profiles keep platform-reviewed policy separate from project identity.
`ProjectLaunchPreset` is the versioned policy template; `buildLaunchFromPreset` injects the
creator, token supply and allocations, multisig signers, guardians, and attestors supplied for
the individual project before validation or wallet submission.

The high-level TypeScript SDK for the immutable Sinjoh protocols on Robinhood Chain. It validates
and encodes immutable configuration, verifies deployed code, reads live protocol state, plans
launches and permissionless work, and returns prepared calls. It never holds keys, signs, or
submits blockchain transactions. Its API client also supports an explicit creator-signed upload
of canonical token artwork; no upload occurs unless the caller invokes that method.

## Install

```sh
npm install @sinjoh/sdk viem
```

Node.js 22 or newer and viem 2.55.10 or newer within major version 2 are required.

## Connect and verify

```ts
import { allVerified, createSinjohClient, planRouterWork } from "@sinjoh/sdk";
import type { Address } from "viem";

const sinjoh = createSinjohClient({
  rpcUrl: process.env["ROBINHOOD_RPC_URL"]
    ?? "https://rpc.mainnet.chain.robinhood.com"
});

const verification = await sinjoh.verify();
if (!allVerified(verification)) {
  throw new Error("Sinjoh manifest does not match live runtime code");
}

const router = process.env["SINJOH_ROUTER"];
if (!router) throw new Error("SINJOH_ROUTER is required");

const work = await planRouterWork(sinjoh.public, router as Address);
```

Plans are snapshots. Simulate the selected prepared call immediately before signing. A guarded
call is only a template until `preflightMinimumOutput` succeeds and its floor replaces the
placeholder minimum.

## Public surface

- Client and chains: `createSinjohClient`, `robinhoodMainnet`, `robinhoodTestnet`.
- Public data API: `createSinjohApiClient`, typed methods for every v1 route, and
  structured `SinjohApiError` failures. It defaults to `https://api.sinjoh.com`.
- Configuration codecs: router, raffle, holder-airdrop, launch-staking, and liquidity sink encode, hash, decode
  where supported, and initializer-level validation functions.
- Reads and planning: router identity/snapshot reads, `planRouterWork`, guard preflight, TWAP
  quote reads, and Pons v2 activation checks.
- Launch planning: Pons v2, Flap, and letscash.fun prediction and ordered prepared-call plans.
  Every indexed, subject-bound launch is reconciled into the public registry automatically,
  including launches prepared by the SDK rather than Sinjoh's web UI.
- Prepared lifecycle calls: router, adapter, collector, holder airdrop, launch staking, liquidity, raffle, and randomness
  actions, each limited to one protocol action per call.
- Prediction and diagnostics: Pons v2 launch assembly, EIP-1167 clone runtime construction,
  custom-error decoding, and operator guidance.

Pons v1 and pools.trade contracts are available from `@sinjoh/abis` and
`@sinjoh/deployments`, but this package does not yet expose equivalent end-to-end launch planners
for them.

## Query public protocol data

```ts
import { createSinjohApiClient } from "@sinjoh/sdk";

const api = createSinjohApiClient();
const { launches } = await api.listLaunches({ limit: 10 });
const history = await api.listEvents({ family: "raffle", limit: 25 });
```

To publish token artwork after the subject has been indexed, validate and hash the exact bytes,
have the indexed creator sign the returned EIP-712 typed data, then upload those same bytes:

```ts
import {
  createSinjohApiClient,
  prepareLaunchImageAuthorization,
} from "@sinjoh/sdk";

const prepared = await prepareLaunchImageAuthorization({
  chainId: 4663,
  subject,
  creator,
  image,
});
const signature = await walletClient.signTypedData(prepared.typedData);
await createSinjohApiClient().publishLaunchImage({
  subject,
  image: prepared.image,
  authorization: prepared.authorization,
  signature,
});
```

The API client needs no RPC provider. Use it for discovery, aggregates, and
history; use `createSinjohClient` for live contract reads, verification, planning,
and prepared calls. See the [API reference](../../docs/api.md).

## Yield Banks owner allocations

`readYieldBankToken` returns the NFT owner, current per-sleeve USD18 value, current percentage mix,
saved target, owner maximum adapter-withdrawal-loss limit, expiry, and target execution revision. A holder calls
`prepareYieldBankTargetAllocation` with three integer basis-point weights totaling 10,000 and must
also provide the maximum adapter withdrawal loss and expiry. That transaction records intent but does not
move funds. Each revision is executable only once. The manual allocation operator uses
`prepareYieldBankTargetExecution` with the expected revision, complete sleeve unwind data, reverse
conversions, separate slippage floors, adapter loss limits, and a deadline no later than the owner&apos;s expiry. A new
owner request is required for any later rebalance.
Release verification also requires the manifest's exact WETH entry routes and reverse-to-WETH
rebalance routes to match the allocator's live codehash-bound mappings.
It also rejects an OpenSea-observed secondary royalty percentage or recipient that differs from the
collection's immutable rate and revenue router.

Every release manifest also declares the equity custody model, income behavior, and an HTTPS
disclosure. The sleeve accepts only reviewed ERC-20 assets; the SDK does not infer that a token is a
legal share or that it pays a separate cash dividend.

`prepareYieldBankBurn` and `prepareYieldBankSleeveRedemption` both accept eligibility proof bytes.
The same policy-approved holder can therefore receive restricted sleeve shares during an NFT burn
and later redeem those shares without an empty-proof mismatch.

## Safety rules

1. Call `verify()` before trusting packaged addresses and require every result to pass.
2. Review decoded immutable configuration before approving its configuration hash.
3. Keep `guardPreflight` route hashes and guard bytes unchanged; signatures bind those values.
4. Re-read or simulate immediately before signing because eligibility and owed amounts can change.
5. Keep RPC credentials outside source control and logs.

See the [workspace README](https://github.com/Sinjoh-Finance/sinjoh-sdk) for generation,
testing, MCP integration, and release status.
