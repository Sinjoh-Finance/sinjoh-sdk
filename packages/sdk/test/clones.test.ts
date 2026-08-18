import assert from "node:assert/strict";
import { test } from "node:test";
import { expectedCloneRuntime } from "../src/predict/clones.js";

test("produces the canonical EIP-1167 runtime for a known implementation", () => {
  // Independently constructed from the EIP-1167 specification, not from the implementation.
  assert.equal(
    expectedCloneRuntime("0xbEbEbEbEbEbEbebeBeBEBEbebebEbeBebeBebEbE"),
    "0x363d3d373d3d3d363d73bebebebebebebebebebebebebebebebebebebebe"
    + "5af43d82803e903d91602b57fd5bf3"
  );
});
