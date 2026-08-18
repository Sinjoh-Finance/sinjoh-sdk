import {
  encodeAbiParameters, keccak256, stringToHex, type Address, type Hex
} from "viem";

/**
 * The cumulative Merkle-sum tree committed by `SinjohAirdropDistributor.commitEpoch`.
 *
 * This must stay byte-identical to the distributor's `leafHash`/`nodeHash` and to the keeper's
 * epoch builder (`sinjoh-keeper/src/airdrop/merkle.ts`). Unlike the raffle tree, the airdrop
 * tree is unpadded: an odd node at any level is promoted unchanged to the next level.
 */

const LEAF_DOMAIN = keccak256(stringToHex("SINJOH_AIRDROP_LEAF_V1"));
const NODE_DOMAIN = keccak256(stringToHex("SINJOH_AIRDROP_NODE_V1"));

export interface AirdropTreeParams {
  chainId: number;
  distributor: Address;
  accountId: Hex;
  epochId: bigint;
  snapshotBlock: bigint;
}

export interface AirdropProofElement {
  siblingHash: Hex;
  siblingSum: bigint;
  siblingIsLeft: boolean;
}

export interface AirdropLeaf {
  holder: Address;
  cumulativeAmount: bigint;
  hash: Hex;
  proof: AirdropProofElement[];
}

export interface BuiltAirdropTree {
  rootHash: Hex;
  rootSum: bigint;
  leaves: AirdropLeaf[];
}

export function airdropLeafHash(
  params: AirdropTreeParams, holder: Address, cumulativeAmount: bigint
): Hex {
  return keccak256(encodeAbiParameters([
    { type: "bytes32" }, { type: "uint256" }, { type: "address" }, { type: "bytes32" },
    { type: "uint64" }, { type: "uint64" }, { type: "address" }, { type: "uint256" }
  ], [LEAF_DOMAIN, BigInt(params.chainId), params.distributor, params.accountId,
    params.epochId, params.snapshotBlock, holder, cumulativeAmount]));
}

export function airdropNodeHash(
  leftHash: Hex, leftSum: bigint, rightHash: Hex, rightSum: bigint
): Hex {
  return keccak256(encodeAbiParameters([
    { type: "bytes32" }, { type: "bytes32" }, { type: "uint256" },
    { type: "bytes32" }, { type: "uint256" }
  ], [NODE_DOMAIN, leftHash, leftSum, rightHash, rightSum]));
}

interface Node { hash: Hex; sum: bigint; leaves: number[] }

/**
 * Builds the epoch tree from cumulative entitlements. Entries are sorted ascending by
 * lowercased holder address, matching the keeper's canonical leaf order.
 */
export function buildAirdropTree(
  params: AirdropTreeParams, entitlements: ReadonlyMap<Address, bigint>
): BuiltAirdropTree {
  const entries = [...entitlements].sort(([a], [b]) =>
    a.toLowerCase().localeCompare(b.toLowerCase()));
  if (entries.length === 0) throw new Error("cannot build an empty tree");
  const proofs: AirdropProofElement[][] = entries.map(() => []);
  const leaves: AirdropLeaf[] = entries.map(([holder, amount]) => ({
    holder,
    cumulativeAmount: amount,
    hash: airdropLeafHash(params, holder, amount),
    proof: []
  }));
  let level: Node[] = leaves.map((leaf, index) => ({
    hash: leaf.hash, sum: leaf.cumulativeAmount, leaves: [index]
  }));
  while (level.length > 1) {
    const next: Node[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      if (!left) throw new Error("tree invariant");
      const right = level[i + 1];
      if (!right) { next.push(left); continue; }
      for (const index of left.leaves) proofs[index]?.push({
        siblingHash: right.hash, siblingSum: right.sum, siblingIsLeft: false
      });
      for (const index of right.leaves) proofs[index]?.push({
        siblingHash: left.hash, siblingSum: left.sum, siblingIsLeft: true
      });
      next.push({
        hash: airdropNodeHash(left.hash, left.sum, right.hash, right.sum),
        sum: left.sum + right.sum, leaves: [...left.leaves, ...right.leaves]
      });
    }
    level = next;
  }
  for (let i = 0; i < leaves.length; i++) {
    const leaf = leaves[i];
    if (leaf) leaf.proof = proofs[i] ?? [];
  }
  const root = level[0];
  if (!root) throw new Error("tree invariant");
  return { rootHash: root.hash, rootSum: root.sum, leaves };
}

export function verifyAirdropProof(
  leaf: AirdropLeaf, rootHash: Hex, rootSum: bigint
): boolean {
  let hash = leaf.hash;
  let sum = leaf.cumulativeAmount;
  for (const element of leaf.proof) {
    hash = element.siblingIsLeft
      ? airdropNodeHash(element.siblingHash, element.siblingSum, hash, sum)
      : airdropNodeHash(hash, sum, element.siblingHash, element.siblingSum);
    sum += element.siblingSum;
  }
  return hash === rootHash && sum === rootSum;
}
