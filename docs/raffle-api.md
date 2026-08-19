# Sinjoh Raffle API

The Sinjoh Raffle API is a public, read-only JSON view of live raffle contracts on
Robinhood Chain mainnet (`chainId` 4663).

- Base URL: [`https://api.sinjoh.com`](https://api.sinjoh.com)
- Service status and route index: [`GET /v1`](https://api.sinjoh.com/v1)
- OpenAPI: [`openapi/raffle-api.yaml`](../openapi/raffle-api.yaml)
- Authentication: none for the default anonymous tier

The API is a convenience layer. Contract state remains authoritative, and every value can also
be read directly with `@sinjoh/abis`, `@sinjoh/deployments`, and viem.

## First request

```sh
curl --fail-with-body https://api.sinjoh.com/v1/tokens
```

```ts
type TokenList = {
  chainId: 4663;
  tokens: Array<{
    address: `0x${string}`;
    symbol: string | null;
    name: string | null;
    raffle: `0x${string}`;
  }>;
};

const response = await fetch("https://api.sinjoh.com/v1/tokens");
if (!response.ok) throw new Error(`Sinjoh API returned ${response.status}`);
const body = await response.json() as TokenList;
```

## Endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /v1` | Service metadata, route index, and global budget reset times. |
| `GET /v1/tokens` | Tokens with a configured holder raffle. |
| `GET /v1/tokens/{address}` | Live pool, prize, draw timing, round, and configuration snapshot. |
| `GET /v1/tokens/{address}/winners?limit=25` | Paid `PrizePaid` history, newest first. |

The winner-history `limit` is clamped to 1–100 and defaults to 25.

## Exact amounts and state

Token amounts contain an exact decimal-string `wei` value and a display-only `formatted` value.
Use `BigInt(amount.wei)` for arithmetic; JavaScript `Number` cannot safely represent all uint256
values.

Draw intervals are minimums, not schedules. `nextDraw.status` is `counting_down` or `due`; a due
draw is waiting for permissionless keeper work. Round state is `committed`, `drawn`, `settled`,
`expired`, or `abandoned`.

The winners endpoint reports completed payouts only. It is not a claimable-rewards endpoint and
does not expose pending Merkle proofs or deferred balances.

## Rate limits

Anonymous callers receive 60 requests per minute per IP. Approved API keys may receive a higher
per-minute limit and are sent only in the `x-api-key` header. Never put keys in a query string.

Accepted requests also consume a shared service budget. The response headers report both tiers:

```text
x-ratelimit-limit: 60
x-ratelimit-remaining: 59
x-sinjoh-daily-limit: 10000
x-sinjoh-daily-remaining: 9999
x-sinjoh-daily-reset: 2026-08-20T00:00:00+00:00
x-sinjoh-monthly-limit: 250000
x-sinjoh-monthly-remaining: 249999
x-sinjoh-monthly-reset: 2026-09-01T00:00:00+00:00
```

A client limit returns `429 rate_limited` with `retry-after: 60`. An exhausted global budget
returns `429 global_capacity_exhausted` with `retry-after` set to the applicable UTC reset.
Poll snapshots every 15–30 seconds; responses are cached briefly and raffle draws are hourly.

## Errors

Errors have a stable machine-readable slug and a human message:

```json
{
  "error": "token_not_found",
  "message": "No launch registered for 0x... on chain 4663."
}
```

| Status | Slug | Handling |
| ---: | --- | --- |
| 400 | `invalid_address` | Correct the path address. |
| 401 | `invalid_api_key` | Remove or replace the key. Anonymous access remains available. |
| 404 | `not_found`, `token_not_found`, `no_raffle` | Correct the route/token or treat the raffle as unavailable. |
| 429 | `rate_limited`, `global_capacity_exhausted` | Honor `retry-after`. |
| 502 | `upstream_error` | Retry with backoff; live chain data was temporarily unavailable. |
| 503 | `rate_limit_unavailable`, `capacity_check_unavailable` | Retry with backoff; the API fails closed when a budget check is unavailable. |

The API supports browser `GET` and `OPTIONS` requests with permissive CORS. Browser-embedded API
keys are visible to users; use the anonymous tier or proxy a key through your own backend.

## Direct-chain alternative

Applications that require no hosted dependency can read the verified contracts directly. Start
with the packaged manifest, require runtime verification to pass, then use the typed raffle ABI:

```ts
import { sinjohRaffleRewardsAbi } from "@sinjoh/abis";
import { allVerified, mainnet, verifyManifest } from "@sinjoh/deployments";
import { createPublicClient, http } from "viem";

const client = createPublicClient({ transport: http(mainnet.rpcUrl) });
const verification = await verifyManifest(client, mainnet);
if (!allVerified(verification)) throw new Error("deployment verification failed");

// Use sinjohRaffleRewardsAbi with a raffle address returned by the manifest or API.
void sinjohRaffleRewardsAbi;
```

For protocol-level payout semantics and proof handling, see the
[contract integration guide](https://github.com/Sinjoh-Finance/sinjoh-contracts/blob/main/RAFFLE-INTEGRATION.md).
