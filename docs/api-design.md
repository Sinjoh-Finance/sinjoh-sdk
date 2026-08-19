# Why the API complements the SDK

Sinjoh contracts are public state machines. A public API should make their data
easier to consume without becoming a second source of protocol truth.

## The problem

Raw RPC is good at answering a current contract read. It is poor at answering
questions such as "show every raffle round," "sum volume by hour," or "list all
events attributed to this wallet." Reconstructing those answers requires log
scanning, reorg handling, address discovery, and protocol-specific decoding.

Putting every contract read behind a centralized server creates the opposite
problem: integrations become dependent on that server even when the chain can
answer directly.

## The approach

```text
                         current state
Consumer ── @sinjoh/sdk ───────────────► Robinhood Chain RPC
    │                                           │
    │ indexed lists and history                 │ events
    ▼                                           ▼
api.sinjoh.com ──► Envio projection ◄───────────┘
    │
    └────────────► direct RPC for live raffle snapshots
```

- The SDK owns contract ABIs, byte-exact codecs, deployment manifests, reads,
  planning, and prepared calls.
- The API owns discovery, indexed lists, aggregates, and normalized history.
- Live raffle snapshots read the contract because countdown and pool state can
  be newer than an indexer.
- Historical routes read Envio, which handles ordering and chain reorganizations.
- Supabase holds the curated launch and deployment registries plus atomic usage
  budgets. It does not replace on-chain state.

## Trust boundaries

An API response proves only what the API observed. Before submitting value-moving
transactions, read and simulate against the chain. Use SDK manifest verification
when an address affects a transaction.

Wallet activity is deliberately not called claimability. A paid raffle event, a
deferred payout, and a pending Merkle entitlement have different proofs and
settlement paths. Combining them under "claimable" would create false balances.

## Trade-offs

The split architecture gives developers fast lists and trust-minimized live
reads, but they must understand which layer answered a question. The API makes
that distinction at the route level and returns block or transaction identity on
indexed records.

Page-number pagination is easy to use but not a frozen snapshot. New blocks can
shift records between pages. Consumers doing complete exports must de-duplicate.

Anonymous access lowers integration friction but exposes shared infrastructure
to abuse. Per-client limits and daily/monthly circuit breakers bound that risk.

## Alternatives considered

**Proxy every RPC read.** Rejected because it adds availability and trust
dependencies without improving simple contract reads.

**Expose Envio GraphQL directly as the public product.** Rejected because it
leaks indexer schema choices, offers no stable REST contract, and makes usage
controls harder to apply consistently.

**Keep a raffle-only API.** Rejected as the long-term public shape because the
existing protocol projection already covers launches, markets, routing,
airdrops, liquidity, revenue, Funding Bands, raffles, and randomness.

## Related

- [API reference](./api.md)
- [Getting started](./getting-started.md)
- [How to query Sinjoh](./how-to-query-sinjoh.md)
