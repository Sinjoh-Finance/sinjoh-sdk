import { encodeAbiParameters, encodeFunctionData, getAddress, parseAbi, parseAbiParameters, type Address, type Hex } from 'viem';

export const AIRDROP_CHAIN_ID = 4663;
export type AirdropSelection = { mode: 'single' | 'basket'; weights: readonly { assetId: string; weightBps: number }[] };
export type StrategyWeights = { usdg: number; lp: number; stock: number; airdrop: number };
export type AirdropCatalogAsset = { id: string; address: string; chainId: number; reviewDecision: string; allocationEnabled: boolean; symbol: string; name: string; rewardSymbols: string[]; rewardAddresses: string[]; frequency: string; rateLabel: string; holderYieldPercent: number | null; eligibility?: string };
const MAX_UINT256 = (1n << 256n) - 1n;
export function validateAirdropSelection(selection: AirdropSelection): void {
  const n = selection.weights.length;
  if (selection.mode !== 'single' && selection.mode !== 'basket') throw Error('Select Single or Basket.');
  if (selection.mode === 'single' ? n !== 1 : n < 2 || n > 3) throw Error('Select one token or a basket of two to three tokens.');
  const ids = new Set<string>(); let total = 0;
  for (const item of selection.weights) {
    if (!/^eip155:4663\/erc20:0x[0-9a-f]{40}$/.test(item.assetId) || item.assetId.endsWith('0x' + '0'.repeat(40))) throw Error('Invalid Robinhood Chain asset.');
    if (ids.has(item.assetId)) throw Error('Each token must be distinct.');
    ids.add(item.assetId);
    if (!Number.isInteger(item.weightBps) || item.weightBps <= 0 || item.weightBps > 10000) throw Error('Each token needs a positive percentage.');
    total += item.weightBps;
  }
  if (total !== 10000) throw Error('Basket percentages must total 100%.');
}
export function validateStrategyWeights(weights: StrategyWeights): void {
  const values = [weights.usdg, weights.lp, weights.stock, weights.airdrop];
  if (values.some(x => !Number.isInteger(x) || x < 0 || x > 10000) || values.reduce((a,b) => a+b,0) !== 10000) throw Error('USDG, LP, Stock and Airdrop must total 100%.');
}
export function allocateAirdropAmount(amount: bigint, selection: AirdropSelection): bigint[] {
  validateAirdropSelection(selection);
  if (amount <= 0n || amount > MAX_UINT256) throw Error('Invalid allocation amount.');
  let used = 0n;
  return selection.weights.map((item,i) => {
    const share = i === selection.weights.length - 1 ? amount - used : amount * BigInt(item.weightBps) / 10000n;
    used += share;
    if (share === 0n) throw Error('Allocation is too small for this basket.');
    return share;
  });
}
export function allocateStrategyAmount(amount: bigint, weights: StrategyWeights): Record<keyof StrategyWeights,bigint> {
  validateStrategyWeights(weights);
  if (amount < 0n || amount > MAX_UINT256) throw Error('Invalid bank amount.');
  const result = { usdg: 0n, lp: 0n, stock: 0n, airdrop: 0n };
  const active = (Object.keys(result) as (keyof StrategyWeights)[]).filter(key => weights[key] > 0);
  let used = 0n;
  for (const [i,key] of active.entries()) { result[key] = i === active.length - 1 ? amount - used : amount * BigInt(weights[key]) / 10000n; used += result[key]; }
  return result;
}
export type AirdropReleaseGate = { chainId: number; catalogHash: Hex; deployed: boolean; verifiedAssets: readonly string[]; paused: boolean; custodyEligibilityVerified: boolean; routesVerified: boolean; rewardsVerified: boolean };
export function assertAirdropExecutionReady(selection: AirdropSelection, catalog: readonly AirdropCatalogAsset[], release: AirdropReleaseGate): void {
  validateAirdropSelection(selection);
  if (release.chainId !== AIRDROP_CHAIN_ID || !/^0x[0-9a-f]{64}$/.test(release.catalogHash) || /^0x0+$/.test(release.catalogHash) || !release.deployed || release.paused || !release.custodyEligibilityVerified || !release.routesVerified || !release.rewardsVerified) throw Error('Airdrop execution is not available for this release.');
  for (const weight of selection.weights) {
    const matches = catalog.filter(a => a.id === weight.assetId); const a = matches[0];
    if (matches.length !== 1 || !a || a.reviewDecision !== 'Approve' || !a.allocationEnabled || a.chainId !== AIRDROP_CHAIN_ID || a.id !== `eip155:${AIRDROP_CHAIN_ID}/erc20:${a.address.toLowerCase()}` || !release.verifiedAssets.includes(a.id)) throw Error('Selected token has not passed execution verification.');
  }
}
export const airdropCustodyAbi = parseAbi([
  'function bank() view returns (uint256)', 'function subject() view returns (address)', 'function vault() view returns (address)',
  'function beneficiary() view returns (address)', 'function principal() view returns (uint256)',
  'function available(address) view returns (uint256)', 'function totalPaid(address) view returns (uint256)',
  'function collect(uint256 routeIndex,bytes proof)', 'function claim(address asset) returns (uint256)',
  'event RewardPaid(uint256 indexed bank,address indexed asset,address indexed beneficiary,uint256 amount)',
]);
export const airdropVaultAbi = parseAbi(['function custodyOf(uint256,address) view returns (address)', 'function principalOf(uint256,address) view returns (uint256)', 'function totalPrincipal(address) view returns (uint256)']);
export const airdropCompositeAbi = parseAbi([
  'struct Basket { address[] assets; uint16[] weights; }',
  'struct TargetInput { uint16 lp; uint16 stock; uint16 airdrop; Basket stocks; Basket airdrops; uint48 validUntil; }',
  'function setTarget(uint256 bank,TargetInput input)',
  'function targetOf(uint256) view returns ((address owner,uint64 nonce,uint48 validUntil,uint16 lpWeightBps,uint16 stockWeightBps,address[] assets,uint16[] weights,uint16 airdropWeightBps,address[] airdropAssets,uint16[] airdropWeights))',
  'function bankAirdrops(uint256) view returns (address[])', 'function airdropVault() view returns (address)',
]);
export type PonsClaimProof = { epoch: bigint; quoteAmount: bigint; nativeAmount: bigint; proof: readonly Hex[] };
export function encodePonsAirdropProof(claim: PonsClaimProof): Hex {
  if ([claim.epoch,claim.quoteAmount,claim.nativeAmount].some(n => n < 0n || n > MAX_UINT256) || claim.quoteAmount + claim.nativeAmount === 0n || claim.proof.length > 64 || claim.proof.some(p => !/^0x[0-9a-fA-F]{64}$/.test(p))) throw Error('Invalid Pons claim proof.');
  return encodeAbiParameters(parseAbiParameters('uint256,uint256,uint256,bytes32[]'),[claim.epoch,claim.quoteAmount,claim.nativeAmount,claim.proof]);
}
export function prepareAirdropPayout(custody: Address, asset: Address, expectedOwner: Address, actualOwner: Address) {
  if (getAddress(expectedOwner) !== getAddress(actualOwner)) throw Error('Bank ownership changed. Refresh rewards.');
  return { to: getAddress(custody), data: encodeFunctionData({ abi: airdropCustodyAbi, functionName: 'claim', args: [getAddress(asset)] }) };
}
