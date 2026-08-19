# How to query Sinjoh

These recipes cover the three common integration jobs: building a protocol
catalog, reading history, and showing wallet-attributed activity.

## Prerequisites

- Base URL `https://api.sinjoh.com`
- An API key only if your integration needs a higher minute limit
- `BigInt` support for exact amount arithmetic

## Build a launch and contract catalog

1. List active launches:

   ```bash
   curl "https://api.sinjoh.com/v1/launches?limit=100"
   ```

2. Resolve a deployment record:

   ```bash
   curl "https://api.sinjoh.com/v1/contracts/0xCONTRACT"
   ```

3. Link users to the returned `explorerUrl` instead of constructing an explorer
   URL yourself.

### Verification

Every contract record should include `runtimeCodeHash`, `deploymentBlock`, and
`verified`. Treat the registry as discovery data; the SDK can independently
compare runtime code with the packaged manifest.

## Read paginated protocol history

1. Request a bounded page:

   ```bash
   curl "https://api.sinjoh.com/v1/events?family=raffle&page=1&limit=25"
   ```

2. Continue while `page.hasMore` is `true`.

3. De-duplicate records by their block, transaction, and log identity if new
   blocks can arrive during the crawl.

### Verification

Confirm every item has `blockNumber`, `transactionHash`, and `logIndex`. Exact
event amounts are strings.

## Show wallet-attributed activity

1. Request the wallet endpoint:

   ```bash
   curl "https://api.sinjoh.com/v1/wallets/0xWALLET/activity?limit=50"
   ```

2. Render `events` as general protocol history and `rafflePrizes` as prize
   settlement history.

3. Label the result as activity. Do not label it "claimable rewards."

### Verification

The response includes the note `This is attributed indexed activity, not a
claimability oracle.` Keep the same distinction in your UI.

## Use a higher-rate key

Send a key only in a header:

```bash
curl -H "x-api-key: YOUR_KEY" "https://api.sinjoh.com/v1/events"
```

Never put a key in a query string. Browser history, access logs, analytics, and
referrer headers can retain URLs.

## Troubleshooting

| Symptom | Action |
| --- | --- |
| `400 invalid_address` | Send a complete 20-byte EVM address |
| `400 invalid_bytes32` | Send a `0x`-prefixed 32-byte account ID |
| `401 invalid_api_key` | Remove the header for anonymous access or request a replacement key |
| `404 *_not_found` | Confirm the chain is `4663` and the resource is registered |
| `429 rate_limited` | Wait for `retry-after` or use an approved key |
| `429 global_capacity_exhausted` | Wait until the reported UTC reset |
| `502` or `503` | Retry with exponential backoff and jitter |

See the [API reference](./api.md) for the full endpoint and error contract.
