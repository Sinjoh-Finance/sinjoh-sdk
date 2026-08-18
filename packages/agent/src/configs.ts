import type { Address, Hex } from "viem";
import type {
  AirdropSinkConfig, FlapTokenParams, LiquiditySinkConfig, RaffleConfig, RouterConfig
} from "@sinjoh/sdk";

/**
 * Wire-format converters: configurations arrive over MCP as JSON, so every bigint field is a
 * decimal string. Conversion is explicit per field — nothing is inferred from the shape of a
 * value, because encoding identity is the one thing this SDK must never guess about.
 */

type Json = Record<string, unknown>;

function big(value: unknown, field: string): bigint {
  if (typeof value === "bigint") return value;
  if (typeof value === "number" && Number.isSafeInteger(value)) return BigInt(value);
  if (typeof value === "string" && /^\d+$/.test(value)) return BigInt(value);
  throw new Error(`${field} must be a decimal-string or integer amount`);
}

export function routerConfigFromWire(wire: Json): RouterConfig {
  const config = structuredClone(wire) as unknown as RouterConfig;
  for (const [i, normalization] of (config.normalizations ?? []).entries()) {
    normalization.maxAmountInPerCall = big(
      normalization.maxAmountInPerCall, `normalizations[${i}].maxAmountInPerCall`
    );
  }
  for (const [i, bucket] of (config.buckets ?? []).entries()) {
    bucket.maxAmountInPerCall = big(
      bucket.maxAmountInPerCall, `buckets[${i}].maxAmountInPerCall`
    );
  }
  return config;
}

export function raffleConfigFromWire(wire: Json): RaffleConfig {
  const config = structuredClone(wire) as unknown as RaffleConfig;
  config.tokensPerTicket = big(config.tokensPerTicket, "tokensPerTicket");
  config.maxTicketsPerHolder = big(config.maxTicketsPerHolder, "maxTicketsPerHolder");
  config.minPrize = big(config.minPrize, "minPrize");
  config.maxPrize = big(config.maxPrize, "maxPrize");
  return config;
}

export function airdropSinkConfigFromWire(wire: Json): AirdropSinkConfig {
  const config = structuredClone(wire) as unknown as AirdropSinkConfig;
  config.minPayout = big(config.minPayout, "minPayout");
  return config;
}

export function liquiditySinkConfigFromWire(wire: Json): LiquiditySinkConfig {
  const config = structuredClone(wire) as unknown as LiquiditySinkConfig;
  config.minNotionalPerMint = big(config.minNotionalPerMint, "minNotionalPerMint");
  config.maxNotionalPerMint = big(config.maxNotionalPerMint, "maxNotionalPerMint");
  return config;
}

export function flapTokenParamsFromWire(wire: Json): Omit<FlapTokenParams, "salt"> {
  const params = structuredClone(wire) as unknown as Omit<FlapTokenParams, "salt">;
  params.quoteAmt = big(params.quoteAmt, "quoteAmt");
  params.taxDuration = big(params.taxDuration, "taxDuration");
  params.antiFarmerDuration = big(params.antiFarmerDuration, "antiFarmerDuration");
  params.minimumShareBalance = big(params.minimumShareBalance, "minimumShareBalance");
  return params;
}

/**
 * Placeholder substitution for launch planning: a raffle and adapter do not exist when the
 * router config is written, so destinations may name "$RAFFLE" or "$ADAPTER" and are resolved
 * against the plan's predictions before encoding.
 */
export function resolvePlaceholders(
  config: RouterConfig, predicted: { adapter: Address; raffle?: Address }
): RouterConfig {
  const resolved = structuredClone(config);
  const substitute = (value: string): Address => {
    if (value === "$ADAPTER") return predicted.adapter;
    if (value === "$RAFFLE") {
      if (predicted.raffle === undefined) {
        throw new Error("routerConfig names $RAFFLE but no raffle is being planned");
      }
      return predicted.raffle;
    }
    return value as Address;
  };
  resolved.launchpadAdapter = substitute(resolved.launchpadAdapter);
  for (const bucket of resolved.buckets) {
    for (const allocation of bucket.allocations) {
      allocation.destination = substitute(allocation.destination);
    }
  }
  return resolved;
}

export type { Hex };
