# Read Sinjoh protocol data in five minutes

You will discover a live Sinjoh launch, inspect its protocol addresses, and read
its raffle state. These discovery routes are public and read-only, so you need no wallet or key;
the separate artwork publication route requires a creator signature.

## What you need

- Node.js 22 or a browser with `fetch`
- Internet access
- No API key, wallet, or RPC account

## Step 1: Confirm the service

```bash
curl "https://api.sinjoh.com/v1"
```

The response names `sinjoh-api`, chain ID `4663`, and the available capability
groups.

## Step 2: Discover a launch

```bash
curl "https://api.sinjoh.com/v1/launches?limit=1"
```

Copy the first `subject` value. It is the token address used by market and raffle
routes.

## Step 3: Read its raffle

Replace the placeholder with that subject address:

```bash
curl "https://api.sinjoh.com/v1/raffles/0xSUBJECT"
```

If the launch has a raffle, you receive its live pool, next prize, draw status,
latest round, and configuration. A launch without a raffle returns
`404 raffle_not_found`; choose another launch whose `features.raffle` is not
`null`.

## Step 4: Use the typed SDK

Install the package after the public npm release:

```bash
npm install @sinjoh/sdk viem
```

```ts
import { createSinjohApiClient } from "@sinjoh/sdk";

const api = createSinjohApiClient();
const { launches } = await api.listLaunches({ limit: 10 });
const launch = launches.find((value) => value.features.raffle !== null);

if (!launch) throw new Error("No raffle launch is currently registered.");

const raffle = await api.getRaffle(launch.subject);
console.log({
  symbol: raffle.token.symbol,
  pool: raffle.pool.formatted,
  nextPrize: raffle.nextPrize.formatted,
  draw: raffle.nextDraw.status,
});
```

Save this as `example.ts` and run it with a TypeScript runner or compile it with
your project.

## What you built

You now have a keyless integration that discovers launches from the registry and
reads time-sensitive state directly from the associated contract. Continue with
[How to query Sinjoh](./how-to-query-sinjoh.md) for event feeds, wallet history,
and pagination, or use the [API reference](./api.md) for every route.
