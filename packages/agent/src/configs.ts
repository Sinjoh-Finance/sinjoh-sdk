import type { Address, Hex } from "viem";
import type {
  AirdropSinkConfig, FlapTokenInputParams, LiquiditySinkConfig, PonsProjectLaunchRequest,
  ProjectLaunchConfig, RaffleConfig, RouterConfig
} from "@sinjoh/sdk";
import { projectLauncherV2Abi, sinjohPonsV2ProjectAdapterAbi } from "@sinjoh/abis";

/**
 * Wire-format converters: configurations arrive over MCP as JSON, so every bigint field is a
 * decimal string. Conversion is explicit per field — nothing is inferred from the shape of a
 * value, because encoding identity is the one thing this SDK must never guess about.
 */

type Json = Record<string, unknown>;

type AbiParameterShape = {
  name?: string;
  type: string;
  components?: readonly AbiParameterShape[];
};

function fromAbiWire(parameter: AbiParameterShape, value: unknown, field: string): unknown {
  const array = parameter.type.match(/^(.*)\[([0-9]*)\]$/);
  if (array) {
    if (!Array.isArray(value)) throw new Error(`${field} must be an array`);
    const expected = array[2] === "" ? undefined : Number(array[2]);
    if (expected !== undefined && value.length !== expected) {
      throw new Error(`${field} must contain exactly ${expected} values`);
    }
    return value.map((item, index) => fromAbiWire(
      { ...parameter, type: array[1]! }, item, `${field}[${index}]`,
    ));
  }
  if (parameter.type === "tuple") {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      throw new Error(`${field} must be an object`);
    }
    const record = value as Record<string, unknown>;
    return Object.fromEntries((parameter.components ?? []).map((component) => {
      if (!component.name) throw new Error(`${field} contains an unnamed tuple field`);
      if (!(component.name in record)) throw new Error(`${field}.${component.name} is required`);
      return [
        component.name,
        fromAbiWire(component, record[component.name], `${field}.${component.name}`),
      ];
    }));
  }
  const integer = parameter.type.match(/^u?int([0-9]*)$/);
  if (integer) {
    const bits = integer[1] === "" ? 256 : Number(integer[1]);
    if (bits <= 48) {
      const parsed = typeof value === "number" ? value : Number(value);
      if (!Number.isSafeInteger(parsed) || parsed < 0) {
        throw new Error(`${field} must be a non-negative safe integer`);
      }
      return parsed;
    }
    return big(value, field);
  }
  return value;
}

function functionInput(
  abi: readonly unknown[], functionName: string, inputIndex: number,
): AbiParameterShape {
  const fn = abi.find((item) => {
    const candidate = item as { type?: string; name?: string };
    return candidate.type === "function" && candidate.name === functionName;
  }) as { inputs?: readonly AbiParameterShape[] } | undefined;
  const input = fn?.inputs?.[inputIndex];
  if (!input) throw new Error(`ABI input ${functionName}[${inputIndex}] is unavailable`);
  return input;
}

export function projectLaunchConfigFromWire(wire: Json): ProjectLaunchConfig {
  return fromAbiWire(
    functionInput(projectLauncherV2Abi, "validateLaunchConfig", 0), wire, "config",
  ) as ProjectLaunchConfig;
}

export function ponsProjectLaunchRequestFromWire(wire: Json): PonsProjectLaunchRequest {
  return fromAbiWire(
    functionInput(sinjohPonsV2ProjectAdapterAbi, "launch", 0), wire, "request",
  ) as PonsProjectLaunchRequest;
}

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

export function flapTokenParamsFromWire(wire: Json): FlapTokenInputParams {
  const params = structuredClone(wire) as unknown as FlapTokenInputParams;
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
