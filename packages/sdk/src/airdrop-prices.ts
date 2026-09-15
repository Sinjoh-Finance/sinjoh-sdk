import {
 decodeFunctionResult, encodeAbiParameters, encodeFunctionData, getAddress, hashTypedData,
 keccak256, parseAbi, parseAbiParameters, recoverTypedDataAddress,
 type Abi, type Address, type Hex, type PublicClient,
} from 'viem';

export const airdropPriceAbi = parseAbi([
 'struct Observation { address feed; int24 tick; uint48 timestamp; uint64 blockNumber; bytes32 blockHash; uint128 lowestLiquidity; bytes32 evidenceHash; }',
 'struct Read { address target; bytes data; }',
 'function publishSigned(Observation[] observations,uint48 validUntil,bytes signature) returns(uint256)',
 'function read(Observation[] observations,uint48 validUntil,bytes signature,Read[] calls) returns(bytes[])',
 'function observer() view returns(address)',
 'function publisher() view returns(address)',
]);
export type PreparedObservation = {
 feed: Address; tick: number; timestamp: number; blockNumber: bigint;
 blockHash: Hex; lowestLiquidity: bigint; evidenceHash: Hex;
};
export type AirdropPricePreparation = {
 chainId: 4663; publisher: Address; blockNumber: bigint; blockHash: Hex;
 observations: PreparedObservation[]; validUntil: number; signature: Hex;
};
export type AirdropPriceRelease = {
 publisher: { address: Address; runtimeCodeHash: Hex };
 reader: { address: Address; runtimeCodeHash: Hex };
 observer: Address; feeds: readonly Address[]; endpoint?: string;
};
const observationType = parseAbiParameters('(address feed,int24 tick,uint48 timestamp,uint64 blockNumber,bytes32 blockHash,uint128 lowestLiquidity,bytes32 evidenceHash)[]');
export function airdropPriceTypedData(publisher: Address, observations: readonly PreparedObservation[], validUntil: number) {
 return {
  domain: { name: 'Sinjoh Airdrop Prices', version: '1', chainId: 4663, verifyingContract: publisher },
  types: { PricePreparation: [{ name: 'observationsHash', type: 'bytes32' }, { name: 'validUntil', type: 'uint48' }] },
  primaryType: 'PricePreparation' as const,
  message: { observationsHash: keccak256(encodeAbiParameters(observationType, [observations])), validUntil },
 };
}
export function airdropPriceDigest(publisher: Address, observations: readonly PreparedObservation[], validUntil: number): Hex {
 return hashTypedData(airdropPriceTypedData(publisher, observations, validUntil));
}
/** Service responses are untrusted until checked against the release and the canonical block.
 * This authorizes price data only; it never authorizes a portfolio trade or reward payout. */
export async function verifyAirdropPricePreparation(client: PublicClient, release: AirdropPriceRelease, preparation: AirdropPricePreparation): Promise<void> {
 const p = preparation;
 if (await client.getChainId() !== 4663 || p.chainId !== 4663 || getAddress(p.publisher) !== getAddress(release.publisher.address) || p.observations.length < 1 || p.observations.length > 100 || new Set(p.observations.map(o => getAddress(o.feed))).size !== p.observations.length) throw Error('Invalid price preparation.');
 const block = await client.getBlock({ blockNumber: p.blockNumber });
 if (block.hash !== p.blockHash || !Number.isSafeInteger(p.validUntil) || BigInt(p.validUntil) < block.timestamp || BigInt(p.validUntil) > block.timestamp + 120n) throw Error('Price preparation expired or reorganized.');
 for (const o of p.observations) {
  if (!release.feeds.some(f => getAddress(f) === getAddress(o.feed)) || !Number.isInteger(o.tick) || Math.abs(o.tick) > 887272 || !Number.isSafeInteger(o.timestamp) || BigInt(o.timestamp) > block.timestamp || block.timestamp - BigInt(o.timestamp) > 90n || o.blockNumber < 0n || o.blockNumber > p.blockNumber - 12n || o.lowestLiquidity <= 0n || !/^0x[0-9a-fA-F]{64}$/.test(o.blockHash) || /^0x0+$/.test(o.blockHash) || !/^0x[0-9a-fA-F]{64}$/.test(o.evidenceHash) || /^0x0+$/.test(o.evidenceHash)) throw Error('Unapproved or stale price observation.');
 }
 if (getAddress(await recoverTypedDataAddress({ ...airdropPriceTypedData(p.publisher, p.observations, p.validUntil), signature: p.signature })) !== getAddress(release.observer)) throw Error('Invalid price signature.');
 for (const binding of [release.publisher, release.reader]) {
  const code = await client.getCode({ address: binding.address, blockNumber: p.blockNumber });
  if (!code || keccak256(code).toLowerCase() !== binding.runtimeCodeHash.toLowerCase()) throw Error('Price preparation contract changed.');
 }
 const [observer, publisher] = await Promise.all([
  client.readContract({ address: release.publisher.address, abi: airdropPriceAbi, functionName: 'observer', blockNumber: p.blockNumber }),
  client.readContract({ address: release.reader.address, abi: airdropPriceAbi, functionName: 'publisher', blockNumber: p.blockNumber }),
 ]);
 if (getAddress(observer) !== getAddress(release.observer) || getAddress(publisher) !== getAddress(p.publisher)) throw Error('Price preparation authority changed.');
 if ((await client.getBlock({ blockNumber: p.blockNumber })).hash !== p.blockHash) throw Error('Price preparation reorganized.');
}

export function parseAirdropPricePreparation(raw: unknown): AirdropPricePreparation | null {
 if (raw === null) return null;
 if (!raw || typeof raw !== 'object') throw Error('Invalid price preparation response.');
 const p = raw as Record<string, unknown>;
 const uint = (v: unknown, bits: number): bigint => {
  if (typeof v !== 'string' || !/^\d{1,78}$/.test(v) || BigInt(v) >= 1n << BigInt(bits)) throw Error('Invalid price integer.');
  return BigInt(v);
 };
 const hash = (v: unknown): Hex => {
  if (typeof v !== 'string' || !/^0x[0-9a-fA-F]{64}$/.test(v) || /^0x0+$/.test(v)) throw Error('Invalid price hash.');
  return v as Hex;
 };
 if (p.chainId !== 4663 || typeof p.publisher !== 'string' || !Array.isArray(p.observations) || p.observations.length < 1 || p.observations.length > 100 || !Number.isSafeInteger(p.validUntil) || typeof p.signature !== 'string' || !/^0x[0-9a-fA-F]{130}$/.test(p.signature)) throw Error('Invalid price preparation fields.');
 const observations = p.observations.map((value: unknown): PreparedObservation => {
  if (!value || typeof value !== 'object') throw Error('Invalid observation.');
  const o = value as Record<string, unknown>;
  if (typeof o.feed !== 'string' || !Number.isInteger(o.tick) || Math.abs(o.tick as number) > 887272 || !Number.isSafeInteger(o.timestamp) || (o.timestamp as number) < 0 || (o.timestamp as number) >= 2 ** 48) throw Error('Invalid observation fields.');
  return { feed: getAddress(o.feed), tick: o.tick as number, timestamp: o.timestamp as number, blockNumber: uint(o.blockNumber, 64), blockHash: hash(o.blockHash), lowestLiquidity: uint(o.lowestLiquidity, 128), evidenceHash: hash(o.evidenceHash) };
 });
 return { chainId: 4663, publisher: getAddress(p.publisher), blockNumber: uint(p.blockNumber, 64), blockHash: hash(p.blockHash), observations, validUntil: p.validUntil as number, signature: p.signature as Hex };
}

export async function fetchAirdropPreparedClient(client: PublicClient, release: AirdropPriceRelease, blockNumber: bigint, subjects: readonly Address[] = [], fetcher: typeof fetch = fetch): Promise<{ client: PublicClient; preparation: AirdropPricePreparation | null }> {
 if (!release.endpoint || subjects.length > 3) throw Error('Price preparation service unavailable.');
 const url = new URL(release.endpoint);
 if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(url.hostname))) throw Error('Invalid price preparation endpoint.');
 const response = await fetcher(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ blockNumber: String(blockNumber), subjects }), signal: AbortSignal.timeout(45000), redirect: 'error' });
 if (!response.ok) throw Error('Current market prices could not be prepared. Retry shortly.');
 const reader = response.body?.getReader();
 if (!reader) throw Error('Empty price preparation response.');
 let size = 0; const chunks: Uint8Array[] = [];
 try { for (;;) { const part = await reader.read(); if (part.done) break; size += part.value.length; if (size > 150000) throw Error('Price response is too large.'); chunks.push(part.value); } } finally { await reader.cancel(); }
 const bytes = new Uint8Array(size); let offset = 0;
 for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
 const raw = JSON.parse(new TextDecoder().decode(bytes));
 const block = await client.getBlock({ blockNumber });
 if (raw.blockNumber !== String(blockNumber) || raw.blockHash !== block.hash) throw Error('Market snapshot changed. Refresh before continuing.');
 const preparation = parseAirdropPricePreparation(raw.preparation);
 if (!preparation) {
  // A missing preparation cannot authorize prices or trading. Normal contract
  // reads below retain their existing freshness checks and fail if prices are needed.
  return { client, preparation: null };
 }
 if (preparation.blockNumber !== blockNumber || preparation.blockHash !== block.hash) throw Error('Price preparation snapshot mismatch.');
 await verifyAirdropPricePreparation(client, release, preparation);
 return { client: withAirdropPreparedReads(client, release.reader.address, preparation), preparation };
}

/** Read-only facade. Each call executes signed preparations inside eth_call, so viewing
 * a bank neither broadcasts transactions nor requires an observer ETH balance. Only
 * explicitly pinned readContract calls are supported; wallet actions use the real client. */
export function withAirdropPreparedReads(client: PublicClient, reader: Address, p: AirdropPricePreparation): PublicClient {
 const readContract = async (parameters: { address: Address; abi: Abi; functionName: string; args?: readonly unknown[]; blockNumber?: bigint; account?: unknown; blockTag?: unknown }) => {
  if (parameters.blockNumber !== p.blockNumber || parameters.account !== undefined || parameters.blockTag !== undefined) throw Error('Prepared reads require the same explicit block and no caller-dependent state.');
  const callData = encodeFunctionData({ abi: parameters.abi, functionName: parameters.functionName, args: parameters.args });
  const data = encodeFunctionData({ abi: airdropPriceAbi, functionName: 'read', args: [p.observations, p.validUntil, p.signature, [{ target: parameters.address, data: callData }]] });
  const result = await client.call({ to: reader, data, blockNumber: p.blockNumber, gas: 31_000_000n });
  if (!result.data) throw Error('Price simulation returned no data.');
  const results = decodeFunctionResult({ abi: airdropPriceAbi, functionName: 'read', data: result.data });
  if (results.length !== 1) throw Error('Invalid prepared read result.');
  return decodeFunctionResult({ abi: parameters.abi, functionName: parameters.functionName, data: results[0]! });
 };
 return { ...client, readContract } as PublicClient;
}

export function airdropPricePreparationCall(p: AirdropPricePreparation) {
 return { to: p.publisher, value: 0n, data: encodeFunctionData({ abi: airdropPriceAbi, functionName: 'publishSigned', args: [p.observations, p.validUntil, p.signature] }) };
}
