import { McpServer } from "@modelcontextprotocol/server";
import { readFileSync } from "node:fs";
import { z } from "zod";
import type { Address, Hex, PublicClient } from "viem";
import { allVerified, verifyManifest, type ChainManifest } from "@sinjoh/deployments";
import {
  airdropSinkConfigHash, checkPonsV2Activation, decodeSinjohError,
  createSinjohApiClient,
  encodeAirdropSinkConfig, encodeLiquiditySinkConfig, encodeRaffleConfig, encodeRouterConfig,
  liquiditySinkConfigHash, planFlapLaunch, planLetsCashIntegration, planPonsV2Launch,
  planRouterWork, preflightMinimumOutput, raffleConfigHash, readRouterSnapshot,
  routerConfigHash, validateAirdropSinkConfig, validateLiquiditySinkConfig,
  validateRaffleConfig, validateRouterConfig, type CodeReadClient,
  type SinjohApiClient
} from "@sinjoh/sdk";
import {
  airdropSinkConfigFromWire, flapTokenParamsFromWire, liquiditySinkConfigFromWire,
  raffleConfigFromWire, resolvePlaceholders, routerConfigFromWire
} from "./configs.js";
import { errorResult, textResult } from "./serialize.js";

/**
 * The Sinjoh agent surface. Prepared calls always remain portable wallet-ready data. A host
 * may additionally inject a wallet executor, in which case the server exposes a guarded
 * simulate-then-submit tool without ever receiving or storing raw key material. Amounts cross
 * the wire as decimal strings.
 */

export interface SinjohAgentContext {
  client: PublicClient;
  manifest: Pick<ChainManifest, "chainId" | "contracts"> & Partial<Pick<ChainManifest, "dependencies">>;
  /** Defaults to the keyless production API client. */
  api?: SinjohApiClient;
  /** Optional host-owned wallet. When present, the server can simulate and submit calls. */
  wallet?: SinjohWalletExecutor;
}

export interface SinjohWalletExecutor {
  account: Address;
  chainId: number;
  sendTransaction(request: {
    account: Address;
    chainId: number;
    to: Address;
    data: Hex;
    value: bigint;
  }): Promise<Hex>;
}

function agentVersion() {
  for (const relative of ["../../package.json", "../package.json"]) {
    try {
      return (JSON.parse(readFileSync(new URL(relative, import.meta.url), "utf8")) as {
        version: string;
      }).version;
    } catch (error) {
      if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
    }
  }
  throw new Error("could not locate @sinjoh/agent package.json");
}

const AGENT_VERSION = agentVersion();

const address = z.string().regex(/^0x[0-9a-fA-F]{40}$/).describe("20-byte hex address");
const hex = z.string().regex(/^0x[0-9a-fA-F]*$/).describe("hex bytes");
const bytes32 = z.string().regex(/^0x[0-9a-fA-F]{64}$/).describe("32-byte hex value");
const page = z.number().int().min(1).max(10_000).optional();
const limit = z.number().int().min(1).max(100).optional();
const READ_ONLY = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: true,
} as const;

export function createSinjohAgentServer(context: SinjohAgentContext): McpServer {
  const server = new McpServer(
    { name: "sinjoh", version: AGENT_VERSION },
    {
      instructions: "Use API tools for discovery and indexed history. Use chain tools for "
        + "live verification, reads, planning, and prepared calls. Wallet activity is not a "
        + "claimability oracle. Prepared calls are wallet-ready. Transaction execution is "
        + "available only when the host injects its own wallet executor; the server stores no key."
    }
  );
  const { client, manifest } = context;
  const api = context.api ?? createSinjohApiClient();
  const clientChainId = client.chain?.id;
  if (clientChainId !== undefined && clientChainId !== manifest.chainId) {
    throw new Error(`client chain ${clientChainId} does not match manifest chain ${manifest.chainId}`);
  }
  if (context.wallet && clientChainId === undefined) {
    throw new Error("wallet execution requires a public client bound to an explicit chain");
  }
  if (context.wallet && context.wallet.chainId !== manifest.chainId) {
    throw new Error(`wallet chain ${context.wallet.chainId} does not match manifest chain ${manifest.chainId}`);
  }

  server.registerTool("sinjoh_manifest", {
    description: "Look up deployed Sinjoh contract addresses from the packaged manifest. "
      + "Returns one entry when key is given, otherwise all keys. Addresses are data, not "
      + "trust: run sinjoh_verify_manifest before acting on them.",
    inputSchema: { key: z.string().optional().describe("manifest key, e.g. raffleFactory") }
  }, async ({ key }) => {
    if (key === undefined) {
      return textResult({ chainId: manifest.chainId, keys: Object.keys(manifest.contracts) });
    }
    const entry = manifest.contracts[key];
    return entry === undefined
      ? errorResult(new Error(`no manifest entry named ${key}`))
      : textResult({ key, ...entry });
  });

  server.registerTool("sinjoh_verify_manifest", {
    description: "Compare the manifest's recorded runtime code hashes against the live chain. "
      + "Every ok=false result means the address must not be trusted.",
    inputSchema: { keys: z.array(z.string()).optional() }
  }, async ({ keys }) => {
    try {
      const results = await verifyManifest(
        client, manifest, keys === undefined ? {} : { keys }
      );
      return textResult({ allVerified: allVerified(results), results });
    } catch (error) {
      return errorResult(error);
    }
  });

  server.registerTool("sinjoh_router_snapshot", {
    description: "Read a fee router's full live structure: identity, binding state, intake "
      + "assets, buckets, conversion routes with per-call caps and guards, and allocations.",
    inputSchema: { router: address }
  }, async ({ router }) => {
    try {
      return textResult(await readRouterSnapshot(client, router as Address));
    } catch (error) {
      return errorResult(error);
    }
  });

  server.registerTool("sinjoh_plan_router_work", {
    description: "Enumerate every currently eligible permissionless action on a router: "
      + "sync, bucket conversion tranches, protocol-fee delivery, wallet delivery, and sink "
      + "funding, each with its amount, state label, and a prepared call. Actions flagged "
      + "needsGuardPreflight must pass sinjoh_preflight_guard before submission. Plans are "
      + "snapshots: re-simulate immediately before submitting.",
    inputSchema: { router: address }
  }, async ({ router }) => {
    try {
      return textResult(await planRouterWork(client, router as Address));
    } catch (error) {
      return errorResult(error);
    }
  });

  server.registerTool("sinjoh_preflight_guard", {
    description: "Ask an immutable price guard for a swap's minimum output. Returns ok with "
      + "the floor, or an explicit oracle-not-ready / price-moved / interval-locked state "
      + "with operator guidance. Forward routeHash and signed guardData from the work plan. "
      + "Callers may raise the floor at execution, never lower it.",
    inputSchema: {
      guard: address, subject: address, assetIn: address, assetOut: address,
      amountIn: z.string().regex(/^\d+$/).describe("raw input amount as a decimal string"),
      routeHash: bytes32.optional(),
      guardData: hex.optional().describe("guard-specific bytes, including any required signature")
    }
  }, async (args) => {
    try {
      return textResult(await preflightMinimumOutput(client, {
        guard: args.guard as Address,
        subject: args.subject as Address,
        assetIn: args.assetIn as Address,
        assetOut: args.assetOut as Address,
        amountIn: BigInt(args.amountIn),
        ...(args.routeHash === undefined ? {} : { routeHash: args.routeHash as Hex }),
        ...(args.guardData === undefined ? {} : { guardData: args.guardData as Hex })
      }));
    } catch (error) {
      return errorResult(error);
    }
  });

  server.registerTool("sinjoh_check_activation", {
    description: "Run the launch activation checklist for a Pons v2 adapter/router pair: "
      + "wiring, subject binding, intake coverage, and (when implementations are given) "
      + "EIP-1167 clone runtime verification. Show a launch as active only when every check "
      + "passes.",
    inputSchema: {
      adapter: address, router: address,
      adapterImplementation: address.optional(), routerImplementation: address.optional()
    }
  }, async (args) => {
    try {
      return textResult(await checkPonsV2Activation(client as unknown as CodeReadClient, {
        adapter: args.adapter as Address,
        router: args.router as Address,
        ...(args.adapterImplementation === undefined
          ? {} : { adapterImplementation: args.adapterImplementation as Address }),
        ...(args.routerImplementation === undefined
          ? {} : { routerImplementation: args.routerImplementation as Address })
      }));
    } catch (error) {
      return errorResult(error);
    }
  });

  server.registerTool("sinjoh_decode_error", {
    description: "Decode revert data against every Sinjoh custom error. Returns the error "
      + "name, arguments, and operator guidance, or notFound for selectors no Sinjoh "
      + "contract defines.",
    inputSchema: { data: hex }
  }, async ({ data }) => {
    const decoded = decodeSinjohError(data as Hex);
    return textResult(decoded ?? { notFound: true });
  });

  server.registerTool("sinjoh_validate_config", {
    description: "Validate and canonically encode an immutable Sinjoh configuration without "
      + "touching the chain. kind selects the codec; config carries bigint fields as decimal "
      + "strings. Returns issues (empty when valid), the exact encoded bytes, and their "
      + "keccak hash — the identity that gates CREATE2 addresses and first-fund freezing.",
    inputSchema: {
      kind: z.enum(["router", "raffle", "airdrop-sink", "liquidity-sink"]),
      config: z.record(z.string(), z.unknown())
    }
  }, async ({ kind, config }) => {
    try {
      switch (kind) {
        case "router": {
          const parsed = routerConfigFromWire(config);
          const issues = validateRouterConfig(parsed);
          return textResult(issues.length > 0 ? { issues } : {
            issues, encoded: encodeRouterConfig(parsed), configHash: routerConfigHash(parsed)
          });
        }
        case "raffle": {
          const parsed = raffleConfigFromWire(config);
          const issues = validateRaffleConfig(parsed);
          return textResult(issues.length > 0 ? { issues } : {
            issues, encoded: encodeRaffleConfig(parsed), configHash: raffleConfigHash(parsed)
          });
        }
        case "airdrop-sink": {
          const parsed = airdropSinkConfigFromWire(config);
          const issues = validateAirdropSinkConfig(parsed);
          return textResult(issues.length > 0 ? { issues } : {
            issues, encoded: encodeAirdropSinkConfig(parsed),
            configHash: airdropSinkConfigHash(parsed)
          });
        }
        case "liquidity-sink": {
          const parsed = liquiditySinkConfigFromWire(config);
          const issues = validateLiquiditySinkConfig(parsed);
          return textResult(issues.length > 0 ? { issues } : {
            issues, encoded: encodeLiquiditySinkConfig(parsed),
            configHash: liquiditySinkConfigHash(parsed)
          });
        }
      }
    } catch (error) {
      return errorResult(error);
    }
  });

  server.registerTool("sinjoh_plan_ponsv2_launch", {
    description: "Plan a complete Pons v2 launch in the production rehearsal's order: resolve "
      + "every CREATE2 prediction (adapter, router, token, curve, optional raffle), then "
      + "return ordered prepared calls with expected readbacks. routerConfig may use "
      + "\"$ADAPTER\" and \"$RAFFLE\" as destinations/launchpadAdapter; raffle.config omits "
      + "exclusions (the canonical list is computed from the predicted curve). Bigint fields "
      + "are decimal strings. Simulate each step in order before signing; nothing here "
      + "submits.",
    inputSchema: {
      creator: address,
      adapterFactory: address, routerFactory: address, ponsFactory: address,
      launchConfigId: z.string().regex(/^\d+$/),
      pairToken: address,
      adapterSalt: bytes32, routerSalt: bytes32,
      token: z.object({
        name: z.string(), symbol: z.string(), logo: z.string(), description: z.string(),
        socials: z.object({
          twitter: z.string(), telegram: z.string(), discord: z.string(),
          website: z.string(), farcaster: z.string()
        }),
        creatorFeeRecipient: address.optional(),
        creatorTaxBps: z.number().int(), buybackEnabled: z.boolean(), salt: bytes32
      }),
      developerBuy: z.string().regex(/^\d+$/).optional(),
      routerConfig: z.record(z.string(), z.unknown()),
      raffle: z.object({
        factory: address, salt: bytes32,
        config: z.record(z.string(), z.unknown())
          .describe("RaffleConfig without exclusions; bigints as decimal strings")
      }).optional()
    }
  }, async (args) => {
    try {
      const routerTemplate = routerConfigFromWire(args.routerConfig);
      const plan = await planPonsV2Launch(client, {
        creator: args.creator as Address,
        adapterFactory: args.adapterFactory as Address,
        routerFactory: args.routerFactory as Address,
        ponsFactory: args.ponsFactory as Address,
        launchConfigId: BigInt(args.launchConfigId),
        pairToken: args.pairToken as Address,
        adapterSalt: args.adapterSalt as Hex,
        routerSalt: args.routerSalt as Hex,
        token: {
          name: args.token.name,
          symbol: args.token.symbol,
          logo: args.token.logo,
          description: args.token.description,
          socials: args.token.socials,
          creatorTaxBps: args.token.creatorTaxBps,
          buybackEnabled: args.token.buybackEnabled,
          salt: args.token.salt as Hex,
          ...(args.token.creatorFeeRecipient === undefined
            ? {} : { creatorFeeRecipient: args.token.creatorFeeRecipient as Address })
        },
        ...(args.developerBuy === undefined
          ? {} : { developerBuy: BigInt(args.developerBuy) }),
        routerConfig: (predicted) => resolvePlaceholders(routerTemplate, predicted),
        ...(args.raffle === undefined ? {} : {
          raffle: {
            factory: args.raffle.factory as Address,
            salt: args.raffle.salt as Hex,
            config: (exclusions: Address[]) => ({
              ...raffleConfigFromWire(args.raffle!.config),
              exclusions
            })
          }
        })
      });
      return textResult(plan);
    } catch (error) {
      return errorResult(error);
    }
  });

  server.registerTool("sinjoh_plan_flap_launch", {
    description: "Plan a complete Flap launch in the production rehearsal's order. The "
      + "vanity token salt is verified against the deployed adapter implementation's own "
      + "CREATE2 derivation before anything immutable is planned. routerConfig may use "
      + "\"$ADAPTER\"/\"$RAFFLE\" placeholders; raffle.config omits exclusions (computed "
      + "from the predicted V2 pair). Bigint fields are decimal strings. Nothing submits.",
    inputSchema: {
      creator: address,
      adapterFactory: address, adapterImplementation: address, routerFactory: address,
      adapterSalt: bytes32, routerSalt: bytes32,
      tokenSalt: bytes32, tokenPredictedAddress: address,
      tokenParams: z.record(z.string(), z.unknown())
        .describe("NewTokenV6Params without salt; bigints as decimal strings"),
      reviewedPortalConfigHash: bytes32,
      expectedFlapFeeRate: z.number().int(),
      minDeveloperBuyOut: z.string().regex(/^\d+$/).optional(),
      flap: z.object({
        portal: address, v2Factory: address, v2PairInitCodeHash: bytes32, weth: address,
        liquidityManager: address, buybackAdapter: address
      }),
      routerConfig: z.record(z.string(), z.unknown()),
      raffle: z.object({
        factory: address, salt: bytes32, config: z.record(z.string(), z.unknown())
      }).optional()
    }
  }, async (args) => {
    try {
      const routerTemplate = routerConfigFromWire(args.routerConfig);
      const plan = await planFlapLaunch(client, {
        creator: args.creator as Address,
        adapterFactory: args.adapterFactory as Address,
        adapterImplementation: args.adapterImplementation as Address,
        routerFactory: args.routerFactory as Address,
        adapterSalt: args.adapterSalt as Hex,
        routerSalt: args.routerSalt as Hex,
        token: {
          salt: args.tokenSalt as Hex,
          predictedAddress: args.tokenPredictedAddress as Address,
          params: flapTokenParamsFromWire(args.tokenParams)
        },
        reviewedPortalConfigHash: args.reviewedPortalConfigHash as Hex,
        expectedFlapFeeRate: args.expectedFlapFeeRate,
        ...(args.minDeveloperBuyOut === undefined
          ? {} : { minDeveloperBuyOut: BigInt(args.minDeveloperBuyOut) }),
        flap: {
          portal: args.flap.portal as Address,
          v2Factory: args.flap.v2Factory as Address,
          v2PairInitCodeHash: args.flap.v2PairInitCodeHash as Hex,
          weth: args.flap.weth as Address,
          liquidityManager: args.flap.liquidityManager as Address,
          buybackAdapter: args.flap.buybackAdapter as Address
        },
        routerConfig: (predicted) => resolvePlaceholders(routerTemplate, predicted),
        ...(args.raffle === undefined ? {} : {
          raffle: {
            factory: args.raffle.factory as Address,
            salt: args.raffle.salt as Hex,
            config: (exclusions: Address[]) => ({
              ...raffleConfigFromWire(args.raffle!.config),
              exclusions
            })
          }
        })
      });
      return textResult(plan);
    } catch (error) {
      return errorResult(error);
    }
  });

  server.registerTool("sinjoh_plan_letscash_integration", {
    description: "Plan the Sinjoh side of a letscash.fun integration: predict adapter and "
      + "router, deploy the raffle/router/adapter. The token launches on the UPSTREAM "
      + "letscash factory afterwards (adapter as 100% fee recipient), then activate/bind — "
      + "returned as explicit followUps because their arguments exist only post-launch. "
      + "routerConfig may use \"$ADAPTER\"/\"$RAFFLE\" placeholders; raffle.config omits "
      + "exclusions. Nothing submits.",
    inputSchema: {
      creator: address,
      adapterFactory: address, routerFactory: address,
      adapterSalt: bytes32, routerSalt: bytes32,
      letscash: z.object({ factory: address, poolManager: address, hook: address }),
      routerConfig: z.record(z.string(), z.unknown()),
      raffle: z.object({
        factory: address, salt: bytes32, config: z.record(z.string(), z.unknown())
      }).optional()
    }
  }, async (args) => {
    try {
      const routerTemplate = routerConfigFromWire(args.routerConfig);
      const plan = await planLetsCashIntegration(client, {
        creator: args.creator as Address,
        adapterFactory: args.adapterFactory as Address,
        routerFactory: args.routerFactory as Address,
        adapterSalt: args.adapterSalt as Hex,
        routerSalt: args.routerSalt as Hex,
        letscash: {
          factory: args.letscash.factory as Address,
          poolManager: args.letscash.poolManager as Address,
          hook: args.letscash.hook as Address
        },
        routerConfig: (predicted) => resolvePlaceholders(routerTemplate, predicted),
        ...(args.raffle === undefined ? {} : {
          raffle: {
            factory: args.raffle.factory as Address,
            salt: args.raffle.salt as Hex,
            config: (exclusions: Address[]) => ({
              ...raffleConfigFromWire(args.raffle!.config),
              exclusions
            })
          }
        })
      });
      return textResult(plan);
    } catch (error) {
      return errorResult(error);
    }
  });

  server.registerTool("sinjoh_api_capabilities", {
    description: "Discover the production Sinjoh API version, chain, capacity windows, "
      + "documentation, and complete endpoint catalog. Call this when choosing which public "
      + "data tool to use.",
    inputSchema: z.object({}),
    annotations: READ_ONLY,
  }, async () => {
    try {
      return textResult(await api.index());
    } catch (error) {
      return errorResult(error);
    }
  });

  server.registerTool("sinjoh_discover", {
    description: "List a public Sinjoh resource group. Results are indexed or registry data, "
      + "paginated newest-first where ordering applies, and exact integer amounts remain strings.",
    inputSchema: z.object({
      resource: z.enum([
        "contracts", "launches", "raffles", "airdrops", "liquidity",
        "funding-bands", "revenue", "randomness",
      ]),
      page,
      limit,
      launchpad: z.string().optional().describe("launches only"),
      creator: address.optional().describe("launches only"),
      feeRouter: address.optional().describe("launches only"),
      contractType: z.string().optional().describe("contracts only"),
    }),
    annotations: READ_ONLY,
  }, async (args) => {
    const paging = {
      ...(args.page === undefined ? {} : { page: args.page }),
      ...(args.limit === undefined ? {} : { limit: args.limit }),
    };
    try {
      switch (args.resource) {
        case "contracts":
          return textResult(await api.listContracts({
            ...paging,
            ...(args.contractType === undefined ? {} : { type: args.contractType }),
          }));
        case "launches":
          return textResult(await api.listLaunches({
            ...paging,
            ...(args.launchpad === undefined ? {} : { launchpad: args.launchpad }),
            ...(args.creator === undefined ? {} : { creator: args.creator }),
            ...(args.feeRouter === undefined ? {} : { feeRouter: args.feeRouter }),
          }));
        case "raffles": return textResult(await api.listRaffles(paging));
        case "airdrops": return textResult(await api.listAirdropAccounts(paging));
        case "liquidity": return textResult(await api.listLiquidityAccounts(paging));
        case "funding-bands": return textResult(await api.listFundingBandsAccounts(paging));
        case "revenue": return textResult(await api.listRevenueBalances(paging));
        case "randomness": return textResult(await api.listRandomnessRequests(paging));
      }
    } catch (error) {
      return errorResult(error);
    }
  });

  server.registerTool("sinjoh_get", {
    description: "Get one Sinjoh resource. contract identifiers are addresses; launch, market, "
      + "and raffle identifiers are subject-token addresses; account identifiers are bytes32.",
    inputSchema: z.object({
      resource: z.enum([
        "contract", "launch", "market", "raffle", "airdrop-account",
        "liquidity-account", "funding-bands-account",
      ]),
      identifier: z.string().min(1),
      page,
      limit,
    }),
    annotations: READ_ONLY,
  }, async (args) => {
    const paging = {
      ...(args.page === undefined ? {} : { page: args.page }),
      ...(args.limit === undefined ? {} : { limit: args.limit }),
    };
    try {
      switch (args.resource) {
        case "contract": return textResult(await api.getContract(args.identifier));
        case "launch": return textResult(await api.getLaunch(args.identifier));
        case "market": return textResult(await api.getMarket(args.identifier, paging));
        case "raffle": return textResult(await api.getRaffle(args.identifier));
        case "airdrop-account": return textResult(await api.getAirdropAccount(args.identifier));
        case "liquidity-account": return textResult(await api.getLiquidityAccount(args.identifier));
        case "funding-bands-account": return textResult(await api.getFundingBandsAccount(args.identifier));
      }
    } catch (error) {
      return errorResult(error);
    }
  });

  server.registerTool("sinjoh_history", {
    description: "Read bounded indexed history. market-trades, raffle-rounds, raffle-prizes, "
      + "airdrop-epochs, and funding-bands require the matching subject or account identifier. "
      + "events accepts exact-match protocol filters.",
    inputSchema: z.object({
      resource: z.enum([
        "market-trades", "raffle-rounds", "raffle-prizes", "airdrop-epochs",
        "funding-bands", "events",
      ]),
      identifier: z.string().optional(),
      page,
      limit,
      family: z.string().optional(),
      eventName: z.string().optional(),
      accountId: bytes32.optional(),
      subject: address.optional(),
      asset: address.optional(),
      recipient: address.optional(),
    }),
    annotations: READ_ONLY,
  }, async (args) => {
    const paging = {
      ...(args.page === undefined ? {} : { page: args.page }),
      ...(args.limit === undefined ? {} : { limit: args.limit }),
    };
    const requireIdentifier = () => {
      if (!args.identifier) throw new Error(`${args.resource} requires identifier`);
      return args.identifier;
    };
    try {
      switch (args.resource) {
        case "market-trades": return textResult(await api.listMarketTrades(requireIdentifier(), paging));
        case "raffle-rounds": return textResult(await api.listRaffleRounds(requireIdentifier(), paging));
        case "raffle-prizes": return textResult(await api.listRafflePrizes(requireIdentifier(), paging));
        case "airdrop-epochs": return textResult(await api.listAirdropEpochs(requireIdentifier(), paging));
        case "funding-bands": return textResult(await api.listFundingBands(requireIdentifier(), paging));
        case "events": return textResult(await api.listEvents({
          ...paging,
          ...(args.family === undefined ? {} : { family: args.family }),
          ...(args.eventName === undefined ? {} : { eventName: args.eventName }),
          ...(args.accountId === undefined ? {} : { accountId: args.accountId }),
          ...(args.subject === undefined ? {} : { subject: args.subject }),
          ...(args.asset === undefined ? {} : { asset: args.asset }),
          ...(args.recipient === undefined ? {} : { recipient: args.recipient }),
        }));
      }
    } catch (error) {
      return errorResult(error);
    }
  });

  server.registerTool("sinjoh_wallet_activity", {
    description: "Read wallet-attributed protocol events and raffle prize settlements. "
      + "This is historical attribution, not proof that a reward is currently claimable.",
    inputSchema: z.object({ address, page, limit }),
    annotations: READ_ONLY,
  }, async (args) => {
    try {
      return textResult(await api.getWalletActivity(args.address, {
        ...(args.page === undefined ? {} : { page: args.page }),
        ...(args.limit === undefined ? {} : { limit: args.limit }),
      }));
    } catch (error) {
      return errorResult(error);
    }
  });

  server.registerTool("sinjoh_registry_health", {
    description: "Reconcile the indexed launch projection with the public registry and return "
      + "the full diagnostic body even when publication is currently unhealthy.",
    inputSchema: z.object({}),
    annotations: READ_ONLY,
  }, async () => {
    try {
      return textResult(await api.getLaunchRegistryHealth());
    } catch (error) {
      return errorResult(error);
    }
  });

  if (context.wallet) {
    const wallet = context.wallet;
    server.registerTool("sinjoh_execute_transaction", {
      description: "Simulate a prepared transaction against the live chain, then ask the "
        + "host-injected wallet to sign and submit it. The tool rejects a reverting simulation "
        + "before requesting a signature. It accepts only destination, calldata, and native "
        + "value; the server never receives raw private keys.",
      inputSchema: z.object({
        to: address.describe("transaction destination from a Sinjoh prepared call"),
        data: hex.describe("transaction calldata from a Sinjoh prepared call"),
        value: z.string().regex(/^\d+$/).default("0")
          .describe("native token value in wei as a decimal string"),
        waitForReceipt: z.boolean().default(true)
          .describe("wait for a mined receipt before returning"),
      }),
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
        idempotentHint: false,
        openWorldHint: true,
      },
    }, async (args) => {
      const simulatedAccount = wallet.account;
      const simulatedChainId = wallet.chainId;
      const request = {
        account: simulatedAccount,
        to: args.to as Address,
        data: args.data as Hex,
        value: BigInt(args.value),
      };
      try {
        await client.call(request);
      } catch (error) {
        return errorResult(error);
      }
      if (wallet.chainId !== simulatedChainId || wallet.chainId !== manifest.chainId) {
        return errorResult(new Error(
          `wallet chain changed to ${wallet.chainId} after simulation; expected ${manifest.chainId}`,
        ));
      }
      if (wallet.account.toLowerCase() !== simulatedAccount.toLowerCase()) {
        return errorResult(new Error(
          `wallet account changed to ${wallet.account} after simulation; expected ${simulatedAccount}`,
        ));
      }

      let transactionHash: Hex;
      try {
        transactionHash = await wallet.sendTransaction({
          account: simulatedAccount,
          chainId: simulatedChainId,
          to: request.to,
          data: request.data,
          value: request.value,
        });
      } catch (error) {
        return errorResult(error);
      }

      const submitted = {
        chainId: manifest.chainId,
        account: simulatedAccount,
        transactionHash,
      };
      if (!args.waitForReceipt) return textResult({ ...submitted, status: "submitted" });

      try {
        const receipt = await client.waitForTransactionReceipt({ hash: transactionHash });
        return textResult({ ...submitted, status: "confirmed", receipt });
      } catch (error) {
        // Submission is irreversible even when receipt polling fails. Return the hash as a
        // successful submitted result so an agent reconciles it instead of signing twice.
        const receiptError = error instanceof Error ? error.message : String(error);
        return textResult({ ...submitted, status: "submitted", receiptError });
      }
    });
  }

  return server;
}
