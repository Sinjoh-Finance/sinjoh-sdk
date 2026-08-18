import { strict as assert } from "node:assert";
import { test } from "node:test";
import type { Address, Hex } from "viem";
import {
  airdropLeafHash, buildAirdropTree, verifyAirdropProof, type AirdropTreeParams
} from "../src/airdrop.js";

const params: AirdropTreeParams = {
  chainId: 4663,
  distributor: "0xa1d65242ba6dfa7537166a54879bb18a3bcbc379" as Address,
  accountId: `0x${"11".repeat(32)}` as Hex,
  epochId: 3n,
  snapshotBlock: 9_000_000n
};

function entitlements(entries: [Address, bigint][]): ReadonlyMap<Address, bigint> {
  return new Map(entries);
}

const HOLDERS: [Address, bigint][] = [
  ["0x1111111111111111111111111111111111111111" as Address, 100n],
  ["0x2222222222222222222222222222222222222222" as Address, 250n],
  ["0x3333333333333333333333333333333333333333" as Address, 1n],
  ["0x4444444444444444444444444444444444444444" as Address, 999_999_999_999n],
  ["0x5555555555555555555555555555555555555555" as Address, 42n]
];

test("root sum equals the summed entitlements and every proof verifies", () => {
  const tree = buildAirdropTree(params, entitlements(HOLDERS));
  const total = HOLDERS.reduce((sum, [, amount]) => sum + amount, 0n);
  assert.equal(tree.rootSum, total);
  assert.equal(tree.leaves.length, HOLDERS.length);
  for (const leaf of tree.leaves) {
    assert.ok(verifyAirdropProof(params, leaf, tree.rootHash, tree.rootSum), leaf.holder);
  }
});

test("leaf order is canonical regardless of input order", () => {
  const forward = buildAirdropTree(params, entitlements(HOLDERS));
  const reversed = buildAirdropTree(params, entitlements([...HOLDERS].reverse()));
  assert.equal(forward.rootHash, reversed.rootHash);
  assert.deepEqual(
    forward.leaves.map((leaf) => leaf.holder),
    reversed.leaves.map((leaf) => leaf.holder)
  );
});

test("odd leaf counts promote the unpaired node instead of padding", () => {
  const three = buildAirdropTree(params, entitlements(HOLDERS.slice(0, 3)));
  const lastLeaf = three.leaves[2]!;
  assert.ok(verifyAirdropProof(params, lastLeaf, three.rootHash, three.rootSum));
  assert.ok(
    lastLeaf.proof.length < three.leaves[0]!.proof.length + 2,
    "promoted node should not gain padding siblings"
  );
});

test("a single holder is the root", () => {
  const single = buildAirdropTree(params, entitlements([HOLDERS[0]!]));
  assert.equal(single.rootHash, single.leaves[0]!.hash);
  assert.equal(single.rootSum, HOLDERS[0]![1]);
  assert.equal(single.leaves[0]!.proof.length, 0);
});

test("a tampered amount or foreign root fails verification", () => {
  const tree = buildAirdropTree(params, entitlements(HOLDERS));
  const tampered = structuredClone(tree.leaves[0]!);
  tampered.cumulativeAmount += 1n;
  assert.equal(verifyAirdropProof(params, tampered, tree.rootHash, tree.rootSum), false);
  assert.equal(
    verifyAirdropProof(params, tree.leaves[0]!, tree.rootHash, tree.rootSum + 1n), false
  );
});

test("leaf hashing is domain-bound to distributor, account, epoch, and snapshot", () => {
  const base = airdropLeafHash(params, HOLDERS[0]![0], HOLDERS[0]![1]);
  for (const variant of [
    { ...params, chainId: 46630 },
    { ...params, epochId: params.epochId + 1n },
    { ...params, snapshotBlock: params.snapshotBlock + 1n },
    { ...params, accountId: `0x${"22".repeat(32)}` as Hex }
  ]) {
    assert.notEqual(airdropLeafHash(variant, HOLDERS[0]![0], HOLDERS[0]![1]), base);
  }
});

test("rejects an empty entitlement set", () => {
  assert.throws(() => buildAirdropTree(params, new Map()), /empty tree/);
});

test("rejects duplicate-case holders and nonpositive entitlements", () => {
  const holder = HOLDERS[0]![0];
  assert.throws(() => buildAirdropTree(params, entitlements([
    [holder, 1n], [holder.toUpperCase() as Address, 2n]
  ])), /unique ignoring case/);
  assert.throws(() => buildAirdropTree(params, entitlements([[holder, 0n]])), /positive/);
});

test("verification binds the holder preimage, not only the stored leaf hash", () => {
  const tree = buildAirdropTree(params, entitlements(HOLDERS));
  const tampered = { ...tree.leaves[0]!, holder: HOLDERS[1]![0] };
  assert.equal(verifyAirdropProof(params, tampered, tree.rootHash, tree.rootSum), false);
});
