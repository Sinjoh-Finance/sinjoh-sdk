# Sinjoh API reference

The Sinjoh API is a read-only JSON interface to public protocol data on
Robinhood Chain mainnet. It combines live contract reads with indexed history.
No API key is required.

```text
https://api.sinjoh.com
```

For a first request, see [Getting started](./getting-started.md). For task-based
examples, see [How to query Sinjoh](./how-to-query-sinjoh.md). The complete
machine-readable contract is [OpenAPI 3.1](../openapi/sinjoh-api.yaml).

## API contract

| Property | Value |
| --- | --- |
| Version | `v1` |
| Chain | Robinhood Chain mainnet, chain ID `4663` |
| Methods | `GET`, `OPTIONS` |
| Default access | 60 accepted requests per minute per IP |
| Keyed access | Send a key only as `x-api-key` |
| Pagination | `page` defaults to `1`; `limit` defaults to `25` and accepts `1`–`100` |
| Amount encoding | Exact base-unit integers are decimal strings |
| Address encoding | `0x`-prefixed EVM addresses |

Never parse an amount such as `totalFunded` with JavaScript `Number`. Use
`BigInt(value)`. Display-oriented raffle amounts also include a decimal
`formatted` value.

## Service discovery

### `GET /v1`

Returns the API version, network, endpoint catalog, capacity windows, and links
to this reference and the OpenAPI document.

```bash
curl "https://api.sinjoh.com/v1"
```

## Contracts

### `GET /v1/contracts`

Lists canonical deployment records. Optional `type` performs an exact contract
type match.

```bash
curl "https://api.sinjoh.com/v1/contracts?type=SinjohRaffleRewardsFactory"
```

Each record includes the address, deployment transaction and block, runtime
code hash, verification state, and Blockscout URL.

### `GET /v1/contracts/{address}`

Returns one registered deployment or `404 contract_not_found`.

## Launches

### `GET /v1/launches`

Lists active launches from the registry. Optional filters:

| Query | Meaning |
| --- | --- |
| `launchpad` | Exact launchpad identifier such as `pons-v2`, `flap`, or `letscash` |
| `creator` | Creator address |
| `page`, `limit` | Pagination |

Each launch includes its subject token, creator, launchpad, fee router, adapter,
deployment block, and feature addresses.

### `GET /v1/launches/{subject}`

Returns the registered launch for a subject token address.

## Markets

### `GET /v1/markets/{subject}`

Returns indexed lifetime quote volume, trade count, update position, and recent
hourly volume buckets for a subject.

### `GET /v1/markets/{subject}/trades`

Lists indexed trades newest first. A trade records the quote amount, launchpad,
quote asset, block, transaction, log index, and timestamp.

Market values describe observed on-chain events. They are not executable quotes
and must not be used as minimum output values for a transaction.

## Raffles

### `GET /v1/raffles`

Lists raffle configurations and indexed lifetime totals, including deposits,
committed prizes, winner payments, protocol fees, taxes, and recycling.

### `GET /v1/raffles/{subject}`

Reads the associated raffle contract live and returns:

- subject and raffle addresses;
- available pool and next prize;
- next eligible draw time;
- latest round and pending-round count;
- immutable raffle configuration.

`nextDraw.status` is `counting_down` or `due`. A draw is keeper-driven, so `due`
means eligible, not guaranteed at an exact timestamp.

### `GET /v1/raffles/{subject}/rounds`

Lists indexed rounds newest first, including state, ticket total, prize, paid
total, snapshot block and hash, randomness request ID, and transaction.

### `GET /v1/raffles/{subject}/prizes`

Lists paid and deferred prizes newest first. Stock rewards may have different
funding and payout assets. `deferred: true` means a winning settlement succeeded
but delivery must be retried.

## Airdrops

### `GET /v1/airdrops/accounts`

Lists configured airdrop accounts with funder, subject, asset, immutable config
hash, payout constraints, total funding, total paid, and latest epoch.

### `GET /v1/airdrops/accounts/{accountId}`

Returns one account. `accountId` is a 32-byte hex value.

### `GET /v1/airdrops/accounts/{accountId}/epochs`

Lists committed Merkle-sum epochs newest first, including snapshot block and
hash, root hash, root sum, and commit transaction.

This endpoint does not publish private keeper artifacts or turn a cumulative
allocation into a claim. Sinjoh holder airdrops are push-only.

## Liquidity

### `GET /v1/liquidity/accounts`

Lists liquidity accounts with venue, assets, funding, swaps, position, liquidity,
and collected fee totals.

### `GET /v1/liquidity/accounts/{accountId}`

Returns one account by its 32-byte ID.

## Funding Bands

### `GET /v1/funding-bands/accounts`

Lists account-level funding and settlement totals, launch valuation inputs,
oracle timestamp, venue, and band count.

### `GET /v1/funding-bands/accounts/{accountId}`

Returns one Funding Bands account.

### `GET /v1/funding-bands/accounts/{accountId}/bands`

Lists its bands in ascending band order. Each band includes market-cap bounds,
price bounds, ticks, destination, recipient, lifecycle state, funding, liquidity,
realized proceeds, protocol fee, and delivered proceeds.

## Revenue

### `GET /v1/revenue/balances`

Lists lifetime received and forwarded totals by collector and asset.

## Randomness

### `GET /v1/randomness/requests`

Lists verifiable-randomness requests newest first, from request through sealing,
proof acceptance, and seed delivery.

## Protocol events

### `GET /v1/events`

Returns the normalized cross-protocol event feed. Optional exact-match filters:

| Query | Type |
| --- | --- |
| `family` | string |
| `eventName` | string |
| `accountId` | 32-byte hex |
| `subject` | address |
| `asset` | address |
| `recipient` | address |

`amount0`, `amount1`, and `amount2` are event-specific exact integers. Interpret
them using the source event named by `family` and `eventName`; the normalized
feed does not assign one universal denomination to those slots.

## Wallet activity

### `GET /v1/wallets/{address}/activity`

Returns recipient-attributed protocol events and raffle prizes for a wallet.
This is history, not a claimability oracle. It does not prove that the wallet can
claim an airdrop or raffle prize now.

## Pagination

Every list returns:

```json
{
  "page": {
    "number": 1,
    "size": 25,
    "hasMore": true
  }
}
```

Request the next page with `?page=2&limit=25`. Pages are snapshots of a live
index. New blocks can move records between pages while you paginate. Consumers
that need a reproducible dataset should record block and transaction identifiers
and de-duplicate by entity identity.

## Rate and capacity headers

Accepted responses and routed errors include:

```text
x-ratelimit-limit
x-ratelimit-remaining
x-sinjoh-daily-limit
x-sinjoh-daily-remaining
x-sinjoh-daily-reset
x-sinjoh-monthly-limit
x-sinjoh-monthly-remaining
x-sinjoh-monthly-reset
x-sinjoh-api-version
```

The public service has global daily and monthly circuit breakers. A client that
receives `429` must honor `retry-after`.

## Errors

Errors have a stable machine slug and a human message:

```json
{
  "error": "invalid_address",
  "message": "\"bad\" is not a valid address."
}
```

| Status | Slug | Meaning |
| ---: | --- | --- |
| 400 | `invalid_address` | Address syntax is invalid |
| 400 | `invalid_bytes32` | Account ID syntax is invalid |
| 400 | `invalid_query` | Pagination or filter input is invalid |
| 401 | `invalid_api_key` | Presented key is unknown or revoked |
| 404 | `*_not_found` | Requested resource is not indexed or registered |
| 429 | `rate_limited` | Per-client minute budget is exhausted |
| 429 | `global_capacity_exhausted` | Daily or monthly service budget is exhausted |
| 502 | `indexer_error` / `upstream_error` | An upstream returned an invalid result |
| 503 | `indexer_unavailable` | Indexed history is temporarily unavailable |
| 503 | `rate_limit_unavailable` | Client limiter could not be checked |
| 503 | `capacity_check_unavailable` | Global capacity could not be checked |

## SDK

`@sinjoh/sdk` exposes every route through `createSinjohApiClient`:

```ts
import { createSinjohApiClient } from "@sinjoh/sdk";

const api = createSinjohApiClient();
const { launches } = await api.listLaunches({ limit: 10 });
const raffle = await api.getRaffle(launches[0].subject);
```

The client throws `SinjohApiError`, which carries `status`, `code`, and an
optional `requestId`.

## Compatibility routes

The original raffle-only routes remain available during migration:

```text
GET /v1/tokens
GET /v1/tokens/{subject}
GET /v1/tokens/{subject}/winners
```

They return `deprecation: true` and a successor link. New integrations must use
`/v1/raffles`.

## Related

- [Getting started](./getting-started.md)
- [How to query Sinjoh](./how-to-query-sinjoh.md)
- [Why the API complements the SDK](./api-design.md)
- [OpenAPI 3.1](../openapi/sinjoh-api.yaml)
