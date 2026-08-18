import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";
import { test } from "node:test";
import type { Address, Hex } from "viem";
import {
  buildRaffleTree, ownerOfIndex, raffleEmptyLeafHash, raffleLeafHash, verifyRaffleProof,
  winningIndex, type RaffleTreeParams
} from "../src/raffle.js";

interface TreeFixture {
  chainId: number; raffle: Address; roundId: number; snapshotBlock: number;
  root: Hex; rootSum: number; emptyLeaf: Hex;
  leaves: {
    holder: Address; tickets: number; offset: number; leafHash: Hex;
    proof: { siblingHash: Hex; siblingSum: number; siblingIsLeft: boolean }[];
  }[];
}

interface SlotFixture {
  chainId: number; raffle: Address; roundId: number; seed: string;
  totalTickets: number; indices: number[];
}

const fixture: TreeFixture = JSON.parse(
  readFileSync(new URL("./fixtures/ticket-tree.json", import.meta.url), "utf8")
);
const slots: SlotFixture = JSON.parse(
  readFileSync(new URL("./fixtures/slot-indices.json", import.meta.url), "utf8")
);

const params: RaffleTreeParams = {
  chainId: fixture.chainId,
  raffle: fixture.raffle,
  roundId: BigInt(fixture.roundId),
  snapshotBlock: BigInt(fixture.snapshotBlock)
};
const leaves = fixture.leaves.map((leaf) => ({
  holder: leaf.holder, tickets: BigInt(leaf.tickets)
}));

test("reproduces the root, sum, and every proof from the Solidity reference", () => {
  const tree = buildRaffleTree(params, leaves);
  assert.equal(tree.root, fixture.root, "root");
  assert.equal(tree.rootSum.toString(), fixture.rootSum.toString(), "root sum");
  assert.equal(tree.leaves.length, fixture.leaves.length);

  for (let i = 0; i < tree.leaves.length; i++) {
    const built = tree.leaves[i]!;
    const expected = fixture.leaves[i]!;
    assert.equal(built.leafHash, expected.leafHash, `leaf ${i} hash`);
    assert.equal(built.offset.toString(), expected.offset.toString(), `leaf ${i} offset`);
    assert.equal(built.proof.length, expected.proof.length, `leaf ${i} proof length`);
    for (let j = 0; j < built.proof.length; j++) {
      assert.equal(built.proof[j]!.siblingHash, expected.proof[j]!.siblingHash);
      assert.equal(
        built.proof[j]!.siblingSum.toString(), expected.proof[j]!.siblingSum.toString()
      );
      assert.equal(built.proof[j]!.siblingIsLeft, expected.proof[j]!.siblingIsLeft);
    }
  }
});

test("padding leaf matches the reference", () => {
  assert.equal(raffleEmptyLeafHash(BigInt(fixture.roundId)), fixture.emptyLeaf);
});

test("every proof verifies and yields its interval start", () => {
  const tree = buildRaffleTree(params, leaves);
  for (const leaf of tree.leaves) {
    const result = verifyRaffleProof(params, leaf, tree.root, tree.rootSum);
    assert.ok(result.valid, `proof for ${leaf.holder}`);
    assert.equal(result.offset, leaf.offset);
  }
});

test("intervals partition the whole ticket range with no gaps or overlaps", () => {
  const tree = buildRaffleTree(params, leaves);
  const seen = new Set<string>();
  for (let index = 0n; index < tree.rootSum; index++) {
    const owner = ownerOfIndex(tree, index);
    assert.ok(owner, `index ${index} has no owner`);
    seen.add(`${index}:${owner.holder}`);
  }
  assert.equal(seen.size, Number(tree.rootSum));
  assert.equal(ownerOfIndex(tree, tree.rootSum), undefined);
});

test("a tampered sum breaks verification", () => {
  const tree = buildRaffleTree(params, leaves);
  const leaf = structuredClone(tree.leaves[0]!);
  leaf.proof[0]!.siblingSum += 1n;
  assert.equal(verifyRaffleProof(params, leaf, tree.root, tree.rootSum).valid, false);
});

test("verification binds the holder preimage, not only the stored leaf hash", () => {
  const tree = buildRaffleTree(params, leaves);
  const leaf = { ...tree.leaves[0]!, holder: tree.leaves[1]!.holder };
  assert.equal(verifyRaffleProof(params, leaf, tree.root, tree.rootSum).valid, false);
});

test("rejects unsorted, duplicate, or zero-ticket leaves", () => {
  assert.throws(() => buildRaffleTree(params, [leaves[1]!, leaves[0]!]), /sorted ascending/);
  assert.throws(() => buildRaffleTree(params, [leaves[0]!, leaves[0]!]), /sorted ascending/);
  assert.throws(
    () => buildRaffleTree(params, [{ holder: leaves[0]!.holder, tickets: 0n }]), /no tickets/
  );
  assert.throws(() => buildRaffleTree(params, []), /no eligible holders/);
});

test("leaf hashing is bound to the raffle, round, and snapshot", () => {
  const base = raffleLeafHash(params, leaves[0]!.holder, leaves[0]!.tickets);
  const other = raffleLeafHash(
    { ...params, roundId: params.roundId + 1n }, leaves[0]!.holder, leaves[0]!.tickets
  );
  assert.notEqual(base, other);
});

test("winning indices match the contract's derivation", () => {
  for (let slot = 0; slot < slots.indices.length; slot++) {
    const index = winningIndex({
      chainId: slots.chainId,
      raffle: slots.raffle,
      roundId: BigInt(slots.roundId),
      slot,
      seed: BigInt(slots.seed),
      totalTickets: BigInt(slots.totalTickets)
    });
    assert.equal(index.toString(), slots.indices[slot]!.toString(), `slot ${slot}`);
  }
});
