export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export interface Page {
  number: number;
  size: number;
  hasMore: boolean;
}

export interface PageOptions {
  page?: number;
  limit?: number;
}

export interface Amount {
  wei: string;
  formatted: string;
}

export interface ApiIndex {
  service: "sinjoh-api";
  version: string;
  chainId: number;
  network: string;
  auth: string;
  capacity: {
    dailyLimit: number;
    monthlyLimit: number;
    resetsAt: { daily: string; monthly: string };
  };
  endpoints: Record<string, string>;
  pagination: string;
  docs: string;
  openapi: string;
  supportedLaunchpads: string[];
}

export interface DeploymentRecord {
  chainId: number;
  type: string;
  address: `0x${string}`;
  transactionHash: `0x${string}`;
  deploymentBlock: string;
  runtimeCodeHash: `0x${string}`;
  verified: boolean;
  explorerUrl: string;
}

export interface LaunchRecord {
  id?: string;
  chainId: number;
  name: string | null;
  symbol: string | null;
  subject: `0x${string}`;
  creator: `0x${string}` | null;
  launchpad: string | null;
  feeRouter: `0x${string}` | null;
  adapter: `0x${string}` | null;
  deploymentBlock: string | null;
  features: { raffle: `0x${string}` | null };
}

export interface LaunchRegistryFailure {
  subject: string | null;
  code:
    | "missing_subject"
    | "malformed_address"
    | "malformed_config_hash"
    | "unsupported_launchpad"
    | "duplicate_subject"
    | "empty_index_projection"
    | "publication_failed";
}

export interface LaunchRegistryHealth {
  ok: boolean;
  error?: "reconciliation_unavailable";
  indexed: number;
  registered: number;
  visible: number;
  suppressed: number;
  promoted: number;
  inserted: number;
  missing: number;
  missingSubjects: `0x${string}`[];
  failures: LaunchRegistryFailure[];
  indexedByLaunchpad: Record<string, number>;
  visibleByLaunchpad: Record<string, number>;
  supportedLaunchpads: string[];
}

export interface RaffleSnapshot {
  chainId: number;
  token: {
    address: `0x${string}`;
    symbol: string | null;
    name: string | null;
    tokensPerTicket: string;
  };
  raffle: {
    address: `0x${string}`;
    prizeAsset: `0x${string}`;
    prizeAssetSymbol: string | null;
  };
  pool: Amount;
  nextPrize: Amount;
  nextDraw: {
    eligibleAt: number | null;
    secondsUntil: number;
    status: "counting_down" | "due";
  };
  latestRound: null | {
    id: number;
    state: string;
    totalTickets: string;
    prize: Amount;
    snapshotBlock: number;
    committedAt: number;
    drawnAt: number | null;
  };
  pendingRounds: number;
  config: Record<string, JsonValue>;
  fetchedAt: string;
}

export interface IndexedRecord {
  [key: string]: JsonValue;
}

export type EvmAddress = `0x${string}`;
export type HexValue = `0x${string}`;

export interface MarketRecord {
  subject: EvmAddress;
  launchpad: string;
  quoteAsset: EvmAddress;
  totalQuote: string;
  tradeCount: string;
  updatedAtBlock: string;
  updatedAtTimestamp: string;
}

export interface MarketHourRecord {
  launchpad: string;
  quoteAsset: EvmAddress;
  bucketStart: string;
  quoteTotal: string;
  tradeCount: string;
}

export interface MarketTradeRecord {
  launchpad: string;
  quoteAsset: EvmAddress;
  quoteAmount: string;
  blockNumber: string;
  transactionHash: HexValue;
  logIndex: number;
  timestamp: string;
}

export interface RaffleRecord {
  raffle: EvmAddress;
  creator: EvmAddress | null;
  subject: EvmAddress | null;
  configHash: HexValue;
  factory: EvmAddress | null;
  implementation: EvmAddress | null;
  attestor: EvmAddress | null;
  randomness: EvmAddress | null;
  prizeAsset: EvmAddress | null;
  protocolFeeRecipient: EvmAddress | null;
  taxRecipient: EvmAddress | null;
  tokensPerTicket: string | null;
  maxTicketsPerHolder: string | null;
  minPrize: string | null;
  maxPrize: string | null;
  prizeBps: number | null;
  recipientTaxBps: number | null;
  recycleTaxBps: number | null;
  minConfirmations: number | null;
  winnersPerRound: number | null;
  minRoundInterval: number | null;
  weightWindowBlocks: number | null;
  randomnessTimeout: number | null;
  claimWindow: number | null;
  basis: string | null;
  totalDeposited: string;
  totalNetDeposited: string;
  totalPrizesCommitted: string;
  totalPrizeInputSpent: string;
  totalPaidToWinners: string;
  totalProtocolFeeAccrued: string;
  totalProtocolFeeSent: string;
  totalTaxAccrued: string;
  totalTaxSent: string;
  totalRecycled: string;
  latestRoundId: string;
  updatedAtBlock: string;
}

export interface RaffleRoundRecord {
  roundId: string;
  state: string;
  rootHash: HexValue;
  totalTickets: string;
  prize: string;
  paidTotal: string;
  winnersPerRound: number;
  slotsPaid: number;
  returned: string | null;
  snapshotBlock: string;
  snapshotBlockHash: HexValue;
  requestId: HexValue;
  seed: string | null;
  committedAtBlock: string;
  drawnAtBlock: string | null;
  transactionHash: HexValue;
}

export interface RafflePrizeRecord {
  roundId: string;
  slot: number;
  holder: EvmAddress;
  gross: string;
  recipientTax: string;
  recycleTax: string;
  net: string;
  fundingAsset: EvmAddress | null;
  payoutAsset: EvmAddress | null;
  fundingSpent: string | null;
  payoutAmount: string | null;
  deferred: boolean;
  blockNumber: string;
  transactionHash: HexValue;
}

export interface AirdropAccountRecord {
  distributor: EvmAddress;
  accountId: HexValue;
  funder: EvmAddress;
  subject: EvmAddress;
  asset: EvmAddress;
  configHash: HexValue;
  minPayout: string;
  maxBatchSize: number;
  minConfirmations: number;
  totalFunded: string;
  totalPaid: string;
  latestEpochId: string;
  updatedAtBlock: string;
}

export interface AirdropEpochRecord {
  distributor: EvmAddress;
  accountId: HexValue;
  epochId: string;
  snapshotBlock: string;
  snapshotBlockHash: HexValue;
  rootHash: HexValue;
  rootSum: string;
  blockNumber: string;
  transactionHash: HexValue;
}

export interface LiquidityAccountRecord {
  manager: EvmAddress;
  accountId: HexValue;
  funder: EvmAddress;
  subject: EvmAddress;
  quoteAsset: EvmAddress;
  venue: number;
  configHash: HexValue;
  totalFunded: string;
  totalQuoteSpent: string;
  totalSubjectReceived: string;
  positionId: string | null;
  liquidity: string;
  feesQuote: string;
  feesSubject: string;
  updatedAtBlock: string;
}

export interface FundingBandsAccountRecord {
  manager: EvmAddress;
  accountId: HexValue;
  subject: EvmAddress;
  creator: EvmAddress;
  profileId: number;
  venue: number;
  quoteAsset: EvmAddress;
  launchSupply: string;
  subjectDecimals: number;
  ethUsdE8: string;
  oracleUpdatedAt: string;
  bandCount: number;
  totalDeposited: string;
  totalInvested: string;
  totalResidual: string;
  totalRealizedWeth: string;
  totalProtocolFee: string;
  totalNetWeth: string;
  totalSubjectProceeds: string;
  totalProceedsSent: string;
  updatedAtBlock: string;
}

export interface FundingBandRecord {
  manager: EvmAddress;
  accountId: HexValue;
  bandId: number;
  lowerMarketCapUsdE8: string;
  upperMarketCapUsdE8: string;
  lowerWethPerSubjectX128: string;
  upperWethPerSubjectX128: string;
  tickLower: number;
  tickUpper: number;
  destination: number;
  recipient: EvmAddress;
  status: string;
  deposited: string;
  invested: string;
  residual: string;
  positionId: string | null;
  liquidity: string;
  realizedWeth: string;
  protocolFee: string;
  netWeth: string;
  subjectProceeds: string;
  proceedsSentWeth: string;
  proceedsSentSubject: string;
  updatedAtBlock: string;
}

export interface RevenueBalanceRecord {
  collector: EvmAddress;
  asset: EvmAddress;
  totalReceived: string;
  totalForwarded: string;
  updatedAtBlock: string;
}

export interface RandomnessRequestRecord {
  adapter: EvmAddress;
  requestId: HexValue;
  consumer: EvmAddress;
  roundId: string;
  requestBlock: string;
  sealDeadlineBlock: string;
  entropy: HexValue | null;
  alpha: string | null;
  output: string | null;
  seed: string | null;
  prover: EvmAddress | null;
  state: string;
  updatedAtBlock: string;
}

export interface ProtocolEventRecord {
  family: string;
  eventName: string;
  contract: EvmAddress;
  accountId: HexValue | null;
  subject: EvmAddress | null;
  asset: EvmAddress | null;
  recipient: EvmAddress | null;
  amount0: string | null;
  amount1: string | null;
  amount2: string | null;
  reference: string | null;
  success: boolean | null;
  blockNumber: string;
  blockHash: HexValue;
  transactionHash: HexValue;
  logIndex: number;
  timestamp: string;
}

export class SinjohApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId: string | null;

  constructor(status: number, code: string, message: string, requestId: string | null) {
    super(message);
    this.name = "SinjohApiError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

export interface CreateSinjohApiClientOptions {
  /** Defaults to the production, read-only Sinjoh API. */
  baseUrl?: string;
  /** Optional higher-rate key. It is sent only in the x-api-key header. */
  apiKey?: string;
  /** Supply a custom fetch implementation for tests, tracing, or non-browser runtimes. */
  fetch?: typeof globalThis.fetch;
}

export interface SinjohApiClient {
  index(): Promise<ApiIndex>;
  getLaunchRegistryHealth(): Promise<{ chainId: number; registry: LaunchRegistryHealth }>;
  listContracts(options?: PageOptions & { type?: string }): Promise<{ contracts: DeploymentRecord[]; page: Page }>;
  getContract(address: string): Promise<{ contract: DeploymentRecord }>;
  listLaunches(options?: PageOptions & { launchpad?: string; creator?: string; feeRouter?: string }): Promise<{ chainId: number; launches: LaunchRecord[]; page: Page }>;
  getLaunch(subject: string): Promise<{ launch: LaunchRecord }>;
  getMarket(subject: string, options?: PageOptions): Promise<{ chainId: number; market: MarketRecord; hours: MarketHourRecord[]; page: Page }>;
  listMarketTrades(subject: string, options?: PageOptions): Promise<{ chainId: number; subject: string; trades: MarketTradeRecord[]; page: Page }>;
  listRaffles(options?: PageOptions): Promise<{ chainId: number; raffles: RaffleRecord[]; page: Page }>;
  getRaffle(subject: string): Promise<RaffleSnapshot>;
  listRaffleRounds(subject: string, options?: PageOptions): Promise<{ chainId: number; subject: string; raffle: string; rounds: RaffleRoundRecord[]; page: Page }>;
  listRafflePrizes(subject: string, options?: PageOptions): Promise<{ chainId: number; subject: string; raffle: string; prizes: RafflePrizeRecord[]; page: Page }>;
  listAirdropAccounts(options?: PageOptions): Promise<{ chainId: number; accounts: AirdropAccountRecord[]; page: Page }>;
  getAirdropAccount(accountId: string): Promise<{ chainId: number; account: AirdropAccountRecord }>;
  listAirdropEpochs(accountId: string, options?: PageOptions): Promise<{ chainId: number; accountId: string; epochs: AirdropEpochRecord[]; page: Page }>;
  listLiquidityAccounts(options?: PageOptions): Promise<{ chainId: number; accounts: LiquidityAccountRecord[]; page: Page }>;
  getLiquidityAccount(accountId: string): Promise<{ chainId: number; account: LiquidityAccountRecord }>;
  listFundingBandsAccounts(options?: PageOptions): Promise<{ chainId: number; accounts: FundingBandsAccountRecord[]; page: Page }>;
  getFundingBandsAccount(accountId: string): Promise<{ chainId: number; account: FundingBandsAccountRecord }>;
  listFundingBands(accountId: string, options?: PageOptions): Promise<{ chainId: number; accountId: string; bands: FundingBandRecord[]; page: Page }>;
  listRevenueBalances(options?: PageOptions): Promise<{ chainId: number; balances: RevenueBalanceRecord[]; page: Page }>;
  listRandomnessRequests(options?: PageOptions): Promise<{ chainId: number; requests: RandomnessRequestRecord[]; page: Page }>;
  listEvents(options?: PageOptions & {
    family?: string;
    eventName?: string;
    accountId?: string;
    subject?: string;
    asset?: string;
    recipient?: string;
  }): Promise<{ chainId: number; events: ProtocolEventRecord[]; page: Page }>;
  getWalletActivity(address: string, options?: PageOptions): Promise<{
    chainId: number;
    wallet: string;
    events: ProtocolEventRecord[];
    rafflePrizes: RafflePrizeRecord[];
    page: Page;
    note: string;
  }>;
}

function query(options: object = {}) {
  const values = new URLSearchParams();
  for (const [key, value] of Object.entries(options) as Array<[string, unknown]>) {
    if (value !== undefined) values.set(key, String(value));
  }
  const encoded = values.toString();
  return encoded ? `?${encoded}` : "";
}

function segment(value: string) {
  return encodeURIComponent(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isLaunchRegistryHealthEnvelope(value: unknown): value is {
  chainId: number;
  registry: LaunchRegistryHealth;
} {
  if (!isRecord(value) || !Number.isInteger(value.chainId) || !isRecord(value.registry)) return false;
  const registry = value.registry;
  const counts = [
    registry.indexed, registry.registered, registry.visible, registry.suppressed,
    registry.promoted, registry.inserted, registry.missing,
  ];
  const validCountMap = (candidate: unknown) => isRecord(candidate)
    && Object.values(candidate).every((count) => Number.isInteger(count) && Number(count) >= 0);
  return typeof registry.ok === "boolean"
    && counts.every((count) => Number.isInteger(count) && Number(count) >= 0)
    && Array.isArray(registry.missingSubjects)
    && registry.missingSubjects.every((subject) => typeof subject === "string")
    && Array.isArray(registry.failures)
    && registry.failures.every((failure) => isRecord(failure)
      && (typeof failure.subject === "string" || failure.subject === null)
      && typeof failure.code === "string")
    && validCountMap(registry.indexedByLaunchpad)
    && validCountMap(registry.visibleByLaunchpad)
    && Array.isArray(registry.supportedLaunchpads)
    && registry.supportedLaunchpads.every((launchpad) => typeof launchpad === "string");
}

export function createSinjohApiClient(
  options: CreateSinjohApiClientOptions = {},
): SinjohApiClient {
  const baseUrl = (options.baseUrl ?? "https://api.sinjoh.com").replace(/\/+$/, "");
  const fetchFn = options.fetch ?? globalThis.fetch;
  if (typeof fetchFn !== "function") throw new Error("A Fetch API implementation is required.");

  async function get<T>(
    path: string,
    acceptErrorBody?: (status: number, body: unknown) => boolean,
  ): Promise<T> {
    const response = await fetchFn(`${baseUrl}${path}`, {
      method: "GET",
      ...(options.apiKey ? { headers: { "x-api-key": options.apiKey } } : {}),
    });
    const requestId = response.headers.get("x-request-id");
    let body: unknown;
    try {
      body = await response.json();
    } catch {
      throw new SinjohApiError(response.status, "invalid_response", "The Sinjoh API returned invalid JSON.", requestId);
    }
    if (!response.ok && !acceptErrorBody?.(response.status, body)) {
      const error = isRecord(body) ? body : {};
      throw new SinjohApiError(
        response.status,
        typeof error.error === "string" ? error.error : "request_failed",
        typeof error.message === "string" ? error.message : `Sinjoh API request failed with HTTP ${response.status}.`,
        requestId,
      );
    }
    return body as T;
  }

  return {
    index: () => get("/v1"),
    getLaunchRegistryHealth: () => get(
      "/v1/health/registry",
      (status, body) => status === 503 && isLaunchRegistryHealthEnvelope(body),
    ),
    listContracts: (value = {}) => get(`/v1/contracts${query(value)}`),
    getContract: (address) => get(`/v1/contracts/${segment(address)}`),
    listLaunches: (value = {}) => get(`/v1/launches${query(value)}`),
    getLaunch: (subject) => get(`/v1/launches/${segment(subject)}`),
    getMarket: (subject, value = {}) => get(`/v1/markets/${segment(subject)}${query(value)}`),
    listMarketTrades: (subject, value = {}) => get(`/v1/markets/${segment(subject)}/trades${query(value)}`),
    listRaffles: (value = {}) => get(`/v1/raffles${query(value)}`),
    getRaffle: (subject) => get(`/v1/raffles/${segment(subject)}`),
    listRaffleRounds: (subject, value = {}) => get(`/v1/raffles/${segment(subject)}/rounds${query(value)}`),
    listRafflePrizes: (subject, value = {}) => get(`/v1/raffles/${segment(subject)}/prizes${query(value)}`),
    listAirdropAccounts: (value = {}) => get(`/v1/airdrops/accounts${query(value)}`),
    getAirdropAccount: (accountId) => get(`/v1/airdrops/accounts/${segment(accountId)}`),
    listAirdropEpochs: (accountId, value = {}) => get(`/v1/airdrops/accounts/${segment(accountId)}/epochs${query(value)}`),
    listLiquidityAccounts: (value = {}) => get(`/v1/liquidity/accounts${query(value)}`),
    getLiquidityAccount: (accountId) => get(`/v1/liquidity/accounts/${segment(accountId)}`),
    listFundingBandsAccounts: (value = {}) => get(`/v1/funding-bands/accounts${query(value)}`),
    getFundingBandsAccount: (accountId) => get(`/v1/funding-bands/accounts/${segment(accountId)}`),
    listFundingBands: (accountId, value = {}) => get(`/v1/funding-bands/accounts/${segment(accountId)}/bands${query(value)}`),
    listRevenueBalances: (value = {}) => get(`/v1/revenue/balances${query(value)}`),
    listRandomnessRequests: (value = {}) => get(`/v1/randomness/requests${query(value)}`),
    listEvents: (value = {}) => get(`/v1/events${query(value)}`),
    getWalletActivity: (address, value = {}) => get(`/v1/wallets/${segment(address)}/activity${query(value)}`),
  };
}
