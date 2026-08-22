# @sinjoh/sdk

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

## Safety rules

1. Call `verify()` before trusting packaged addresses and require every result to pass.
2. Review decoded immutable configuration before approving its configuration hash.
3. Keep `guardPreflight` route hashes and guard bytes unchanged; signatures bind those values.
4. Re-read or simulate immediately before signing because eligibility and owed amounts can change.
5. Keep RPC credentials outside source control and logs.

See the [workspace README](https://github.com/Sinjoh-Finance/sinjoh-sdk) for generation,
testing, MCP integration, and release status.
