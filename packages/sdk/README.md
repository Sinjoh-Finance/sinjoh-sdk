# @sinjoh/sdk

The high-level TypeScript SDK for the immutable Sinjoh protocols on Robinhood Chain. It validates
and encodes immutable configuration, verifies deployed code, reads live protocol state, plans
launches and permissionless work, and returns prepared calls. It never holds keys, signs, or
submits transactions.

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
- Configuration codecs: router, raffle, airdrop-sink, and liquidity-sink encode, hash, decode
  where supported, and initializer-level validation functions.
- Reads and planning: router identity/snapshot reads, `planRouterWork`, guard preflight, TWAP
  quote reads, and Pons v2 activation checks.
- Launch planning: Pons v2, Flap, and letscash.fun prediction and ordered prepared-call plans.
- Prepared lifecycle calls: router, adapter, collector, airdrop, liquidity, raffle, and randomness
  actions, each limited to one protocol action per call.
- Prediction and diagnostics: Pons v2 launch assembly, EIP-1167 clone runtime construction,
  custom-error decoding, and operator guidance.

Pons v1 and pools.trade contracts are available from `@sinjoh/abis` and
`@sinjoh/deployments`, but this package does not yet expose equivalent end-to-end launch planners
for them.

## Safety rules

1. Call `verify()` before trusting packaged addresses and require every result to pass.
2. Review decoded immutable configuration before approving its configuration hash.
3. Keep `guardPreflight` route hashes and guard bytes unchanged; signatures bind those values.
4. Re-read or simulate immediately before signing because eligibility and owed amounts can change.
5. Keep RPC credentials outside source control and logs.

See the [workspace README](https://github.com/Sinjoh-Finance/sinjoh-sdk) for generation,
testing, MCP integration, and release status.
