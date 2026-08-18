import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { Address, Hex, PublicClient } from "viem";
import { allVerified, verifyManifest, type ChainManifest } from "@sinjoh/deployments";
import {
  airdropSinkConfigHash, checkPonsV2Activation, decodeSinjohError,
  encodeAirdropSinkConfig, encodeLiquiditySinkConfig, encodeRaffleConfig, encodeRouterConfig,
  liquiditySinkConfigHash, planFlapLaunch, planLetsCashIntegration, planPonsV2Launch,
  planRouterWork, preflightMinimumOutput, raffleConfigHash, readRouterSnapshot,
  routerConfigHash, validateAirdropSinkConfig, validateLiquiditySinkConfig,
  validateRaffleConfig, validateRouterConfig, type CodeReadClient
} from "@sinjoh/sdk";
import {
  airdropSinkConfigFromWire, flapTokenParamsFromWire, liquiditySinkConfigFromWire,
  raffleConfigFromWire, resolvePlaceholders, routerConfigFromWire
} from "./configs.js";
import { errorResult, textResult } from "./serialize.js";

/**
 * The Sinjoh agent surface: every tool is read, plan, validate, or prepare — none signs or
 * submits. Prepared calls come back as data for the caller to simulate and (if it holds a
 * signer) submit itself. Amounts cross the wire as decimal strings.
 */

export interface SinjohAgentContext {
  client: PublicClient;
  manifest: Pick<ChainManifest, "contracts">;
  chainId: number;
}

const address = z.string().regex(/^0x[0-9a-fA-F]{40}$/).describe("20-byte hex address");
const hex = z.string().regex(/^0x[0-9a-fA-F]*$/).describe("hex bytes");

export function createSinjohAgentServer(context: SinjohAgentContext): McpServer {
  const server = new McpServer({ name: "sinjoh", version: "0.0.1" });
  const { client, manifest } = context;

  server.registerTool("sinjoh_manifest", {
    description: "Look up deployed Sinjoh contract addresses from the packaged manifest. "
      + "Returns one entry when key is given, otherwise all keys. Addresses are data, not "
      + "trust: run sinjoh_verify_manifest before acting on them.",
    inputSchema: { key: z.string().optional().describe("manifest key, e.g. raffleFactory") }
  }, async ({ key }) => {
    if (key === undefined) {
      return textResult({ chainId: context.chainId, keys: Object.keys(manifest.contracts) });
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
      + "with operator guidance. Callers may raise the floor at execution, never lower it.",
    inputSchema: {
      guard: address, subject: address, assetIn: address, assetOut: address,
      amountIn: z.string().regex(/^\d+$/).describe("raw input amount as a decimal string")
    }
  }, async (args) => {
    try {
      return textResult(await preflightMinimumOutput(client, {
        guard: args.guard as Address,
        subject: args.subject as Address,
        assetIn: args.assetIn as Address,
        assetOut: args.assetOut as Address,
        amountIn: BigInt(args.amountIn)
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
      adapterSalt: hex, routerSalt: hex,
      token: z.object({
        name: z.string(), symbol: z.string(), logo: z.string(), description: z.string(),
        socials: z.object({
          twitter: z.string(), telegram: z.string(), discord: z.string(),
          website: z.string(), farcaster: z.string()
        }),
        creatorFeeRecipient: address.optional(),
        creatorTaxBps: z.number().int(), buybackEnabled: z.boolean(), salt: hex
      }),
      developerBuy: z.string().regex(/^\d+$/).optional(),
      routerConfig: z.record(z.string(), z.unknown()),
      raffle: z.object({
        factory: address, salt: hex,
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
      adapterSalt: hex, routerSalt: hex,
      tokenSalt: hex, tokenPredictedAddress: address,
      tokenParams: z.record(z.string(), z.unknown())
        .describe("NewTokenV6Params without salt; bigints as decimal strings"),
      reviewedPortalConfigHash: hex,
      expectedFlapFeeRate: z.number().int(),
      minDeveloperBuyOut: z.string().regex(/^\d+$/).optional(),
      launchValue: z.string().regex(/^\d+$/).optional(),
      flap: z.object({
        portal: address, v2Factory: address, v2PairInitCodeHash: hex, weth: address,
        liquidityManager: address, buybackAdapter: address
      }),
      routerConfig: z.record(z.string(), z.unknown()),
      raffle: z.object({
        factory: address, salt: hex, config: z.record(z.string(), z.unknown())
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
        ...(args.launchValue === undefined ? {} : { launchValue: BigInt(args.launchValue) }),
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
      adapterSalt: hex, routerSalt: hex,
      letscash: z.object({ factory: address, poolManager: address, hook: address }),
      routerConfig: z.record(z.string(), z.unknown()),
      raffle: z.object({
        factory: address, salt: hex, config: z.record(z.string(), z.unknown())
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

  return server;
}
