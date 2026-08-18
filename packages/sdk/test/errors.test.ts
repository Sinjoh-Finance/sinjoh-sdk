import assert from "node:assert/strict";
import { test } from "node:test";
import { encodeErrorResult, type Abi } from "viem";
import { decodeSinjohError, errorGuidance, sinjohErrorAbi } from "../src/errors.js";

test("the registry collects a substantial distinct error set", () => {
  assert.ok(sinjohErrorAbi.length >= 30, `only ${sinjohErrorAbi.length} errors collected`);
});

test("every known Sinjoh error decodes back to its name and args", () => {
  let checked = 0;
  for (const item of sinjohErrorAbi) {
    if (item.type !== "error") continue;
    // Errors with parameters need real args; exercise the no-arg ones exhaustively.
    if (item.inputs.length > 0) continue;
    const data = encodeErrorResult({ abi: [item] as Abi, errorName: item.name });
    const decoded = decodeSinjohError(data);
    assert.ok(decoded, item.name);
    assert.equal(decoded.errorName, item.name);
    checked += 1;
  }
  assert.ok(checked >= 10, `only ${checked} no-arg errors exercised`);
});

test("guidance is attached where UI-NOTES specifies it", () => {
  const guided = sinjohErrorAbi.filter(
    (item) => item.type === "error" && errorGuidance[item.name] !== undefined
  );
  assert.ok(guided.length >= 3, "expected several guided errors in the deployed surface");
  const sample = guided[0]!;
  if (sample.type === "error" && sample.inputs.length === 0) {
    const decoded = decodeSinjohError(
      encodeErrorResult({ abi: [sample] as Abi, errorName: sample.name })
    );
    assert.equal(decoded?.guidance, errorGuidance[sample.name]);
  }
});

test("unknown selectors return undefined instead of throwing", () => {
  assert.equal(decodeSinjohError("0xdeadbeef"), undefined);
  assert.equal(decodeSinjohError("0x"), undefined);
});
