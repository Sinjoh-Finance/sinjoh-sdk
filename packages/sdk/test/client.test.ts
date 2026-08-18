import assert from "node:assert/strict";
import { test } from "node:test";
import type { Address, PublicClient } from "viem";
import { createSinjohClient } from "../src/client.js";

const CONTRACT = "0x00000000000000000000000000000000000000aa" as Address;

function publicClient(chainId: number): PublicClient {
  return {
    chain: { id: chainId },
    readContract: async () => undefined,
    getCode: async () => "0x"
  } as unknown as PublicClient;
}

test("derives the chain from an existing public client", () => {
  const client = createSinjohClient({
    publicClient: publicClient(46630),
    manifest: { chainId: 46630, contracts: { example: { address: CONTRACT } } }
  });
  assert.equal(client.chainId, 46630);
  assert.equal(client.manifest.chainId, 46630);
});

test("rejects explicit client and manifest chain mismatches", () => {
  assert.throws(() => createSinjohClient({
    publicClient: publicClient(46630),
    chainId: 4663
  }), /does not match publicClient chain/);

  assert.throws(() => createSinjohClient({
    publicClient: publicClient(4663),
    manifest: { chainId: 46630, contracts: {} }
  }), /manifest chain 46630 does not match client chain 4663/);
});

test("rejects unsupported public-client chains", () => {
  assert.throws(() => createSinjohClient({
    publicClient: publicClient(1)
  }), /unsupported chainId 1/);
});
