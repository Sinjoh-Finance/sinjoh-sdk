/** Stock strategy primitives. No custody, signing, event authentication or execution authority. */
export type StockMode = "single" | "basket";
export type StockWeight = { assetId: string; weightBps: number };
export type StockSelection = { mode: StockMode; weights: readonly StockWeight[] };
export type StockCatalogAsset = {
  assetId: string; symbol: string; name: string; tokenAddress: string;
  chainId: number; allocationEnabled: boolean; cadence: string;
  rate: string; currency: string; basis: string; source: string;
  rateSource: string; evidenceLevel: string; rateNote: string;
};
const UINT256_MAX = (1n << 256n) - 1n;
function uint(value: bigint) {
  if (value < 0n || value > UINT256_MAX) throw new Error("Amount exceeds uint256 bounds.");
}
/** Decimal input without floating point or scientific notation. */
export function parseStockAmount(value: string, decimals: number): bigint {
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 18) throw new Error("Invalid decimals.");
  if (!/^\d+(\.\d+)?$/.test(value)) throw new Error("Enter a positive decimal amount.");
  const [whole, fraction = ""] = value.split(".");
  if (fraction.length > decimals) throw new Error(`Use at most ${decimals} decimal places.`);
  const result = BigInt(whole!) * 10n ** BigInt(decimals) + BigInt(fraction.padEnd(decimals, "0") || "0");
  uint(result);
  return result;
}
export function stockWeightBps(percent: string): number {
  const bps = parseStockAmount(percent, 2);
  if (bps > 10_000n) throw new Error("A weight cannot exceed 100%.");
  return Number(bps);
}
export function equalStockWeights(assetIds: readonly string[]): StockWeight[] {
  if (assetIds.length < 1 || assetIds.length > 3) throw new Error("Choose one to three stocks.");
  const base = Math.floor(10_000 / assetIds.length);
  return assetIds.map((assetId, index) => ({ assetId, weightBps: base + (index === 0 ? 10_000 % assetIds.length : 0) }));
}
export function validateStockSelection(selection: StockSelection): void {
  const { mode, weights } = selection;
  if (mode !== "single" && mode !== "basket") throw new Error("Unknown stock format.");
  if ((mode === "single" && weights.length !== 1) || (mode === "basket" && (weights.length < 2 || weights.length > 3))) {
    throw new Error(mode === "single" ? "Select one stock." : "Select two or three stocks.");
  }
  const ids = new Set<string>();
  let total = 0;
  for (const { assetId, weightBps } of weights) {
    if (!/^eip155:[1-9]\d*\/erc20:0x[0-9a-f]{40}$/.test(assetId) || assetId.endsWith(`0x${"0".repeat(40)}`)) throw new Error("Invalid canonical asset identifier.");
    if (ids.has(assetId)) throw new Error("Each stock must be distinct.");
    ids.add(assetId);
    if (!Number.isInteger(weightBps) || weightBps <= 0 || weightBps > 10_000) throw new Error("Every weight must be greater than 0%.");
    total += weightBps;
  }
  if (total !== 10_000) throw new Error("Weights must total exactly 100%.");
}
/** Last constituent receives currency dust; result sums exactly to the input. */
export function allocateStockAmount(amount: bigint, selection: StockSelection): bigint[] {
  uint(amount);
  if (amount === 0n) throw new Error("Allocation amount must be positive.");
  validateStockSelection(selection);
  let used = 0n;
  const result = selection.weights.map(({ weightBps }, index) => {
    const share = index === selection.weights.length - 1 ? amount - used : amount * BigInt(weightBps) / 10_000n;
    used += share;
    return share;
  });
  if (result.some(value => value === 0n)) throw new Error("Allocation is too small for these weights.");
  return result;
}
/** Only valid after an isolated cash-dividend multiplier transition has been authenticated.
 * Price updates and splits must never call this as an income trigger. Rounds down into income.
 */
export function dividendReserveUnits(principal: bigint, before: bigint, after: bigint): bigint {
  uint(principal); uint(before); uint(after);
  if (before === 0n || after < before) throw new Error("Invalid cash-dividend multiplier transition.");
  return principal * (after - before) / after;
}
/** Raw-token feed price already includes the multiplier; do not multiply it again. */
export function stockTokenValue(rawUnits: bigint, tokenDecimals: number, priceUsd18: bigint): bigint {
  uint(rawUnits); uint(priceUsd18);
  if (!Number.isInteger(tokenDecimals) || tokenDecimals < 0 || tokenDecimals > 18) throw new Error("Invalid decimals.");
  const value = rawUnits * priceUsd18 / 10n ** BigInt(tokenDecimals);
  uint(value);
  return value;
}
export type StockExecutionGate = {
  releaseApproved: boolean; chainId: number; manifestHash: string;
  custodyVerified: boolean; eventAttributionVerified: boolean;
  quotesVerified: boolean; payoutIntegrationVerified: boolean;
};
/** Fail-closed admission check. Gate data must come from a trusted release artifact, never a request body.
 * This is a client preflight, not a replacement for onchain authorization or binding verification.
 */
export function assertStockExecutionReady(selection: StockSelection, assets: readonly StockCatalogAsset[], gate: StockExecutionGate): void {
  validateStockSelection(selection);
  if (!gate.releaseApproved || !gate.custodyVerified || !gate.eventAttributionVerified || !gate.quotesVerified || !gate.payoutIntegrationVerified || !/^0x[0-9a-f]{64}$/.test(gate.manifestHash) || /^0x0+$/.test(gate.manifestHash)) {
    throw new Error("Stock strategy is not approved for live execution.");
  }
  for (const item of selection.weights) {
    const matches = assets.filter(asset => asset.assetId === item.assetId);
    const asset = matches[0];
    if (matches.length !== 1 || !asset || !asset.allocationEnabled || asset.chainId !== gate.chainId || asset.cadence === "not-established" || asset.assetId !== `eip155:${asset.chainId}/erc20:${asset.tokenAddress.toLowerCase()}`) {
      throw new Error("Selected stock is unavailable for live allocation.");
    }
  }
}
