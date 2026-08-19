# @sinjoh/merkle

Deterministic Merkle-sum trees for Sinjoh airdrop epochs and raffle ticket intervals. The
implementation is byte-pinned to Solidity-generated fixtures and uses `bigint` for every amount,
sum, round, epoch, and block number.

## Install

```sh
npm install @sinjoh/merkle viem
```

## Build and verify an airdrop tree

```ts
import { buildAirdropTree, verifyAirdropProof } from "@sinjoh/merkle";
import type { Address, Hex } from "viem";

const params = {
  chainId: 4663,
  distributor: "0x1111111111111111111111111111111111111111" as Address,
  accountId: (`0x${"22".repeat(32)}`) as Hex,
  epochId: 1n,
  snapshotBlock: 12_345n
};

const tree = buildAirdropTree(params, new Map<Address, bigint>([
  ["0x3333333333333333333333333333333333333333", 100n],
  ["0x4444444444444444444444444444444444444444", 250n]
]));

if (!verifyAirdropProof(params, tree.leaves[0]!, tree.rootHash, tree.rootSum)) {
  throw new Error("invalid proof");
}
```

## Tree rules

- Airdrop entries are sorted by lowercase holder address. Duplicate-case holders, empty trees,
  and nonpositive entitlements are rejected. Odd nodes are promoted without padding.
- Raffle leaves must already be sorted by holder, unique, and nonzero. The tree pads to the next
  power of two with the contract's round-bound empty leaf.
- Proof verification recomputes the leaf preimage from the supplied domain parameters. A stored
  leaf hash alone is never trusted.
- Raffle proof verification returns the interval offset derived from left-sibling sums.

## API

- Airdrop: `buildAirdropTree`, `verifyAirdropProof`, `airdropLeafHash`, `airdropNodeHash`.
- Raffle: `buildRaffleTree`, `verifyRaffleProof`, `raffleLeafHash`, `raffleNodeHash`,
  `raffleEmptyLeafHash`, `ownerOfIndex`, `winningIndex`.
- The package exports the parameter, leaf, proof-element, and built-tree types for both trees.

See the [SDK workspace documentation](https://github.com/Sinjoh-Finance/sinjoh-sdk)
for the package map and fixture regeneration workflow.
