import {
  encodePacked, getAddress, keccak256, type Abi, type Address, type Hex, type PublicClient
} from "viem";
import {
  sinjohFeeRouterFactoryAbi, sinjohFlapAdapterAbi, sinjohFlapAdapterFactoryAbi,
  sinjohRaffleRewardsAbi, sinjohRaffleRewardsFactoryAbi
} from "@sinjoh/abis";
import type { PreparedCall } from "../actions.js";
import { encodeRouterConfig, type RouterConfig } from "../codecs/router.js";
import { raffleConfigHash, type RaffleConfig } from "../codecs/raffle.js";

/**
 * The Flap launch flow, in the exact order the production fork rehearsal
 * (`sinjoh-integration/test/ProductionFlapRaffle.fork.t.sol`) proves against mainnet:
 * predict adapter -> predict router -> predict token (the caller's pre-mined vanity salt
 * against the Portal's CREATE2 domain) -> deploy raffle around the predicted V2 pair ->
 * deploy router -> deploy adapter -> launch through the adapter (binds atomically) ->
 * bind raffle.
 *
 * Two Flap-specific safety pins carry into the launch call itself: the reviewed Portal
 * configuration hash and the expected Flap fee rate — the adapter reverts if either drifted
 * between review and launch.
 */

/** Mirrors `IFlapPortalTypes.NewTokenV6Params`; order and widths are load-bearing. */
export interface FlapTokenParams {
  name: string;
  symbol: string;
  meta: string;
  dexThresh: number;
  salt: Hex;
  migratorType: number;
  quoteToken: Address;
  quoteAmt: bigint;
  beneficiary: Address;
  permitData: Hex;
  extensionID: Hex;
  extensionData: Hex;
  dexId: number;
  lpFeeProfile: number;
  buyTaxRate: number;
  sellTaxRate: number;
  taxDuration: bigint;
  antiFarmerDuration: bigint;
  mktBps: number;
  deflationBps: number;
  dividendBps: number;
  lpBps: number;
  minimumShareBalance: bigint;
  dividendToken: Address;
  commissionReceiver: Address;
  tokenVersion: number;
}

/** Canonical Uniswap-V2 `pairFor`: the pool that will hold post-graduation liquidity. */
export function predictUniswapV2Pair(args: {
  factory: Address; initCodeHash: Hex; tokenA: Address; tokenB: Address;
}): Address {
  const [token0, token1] = BigInt(args.tokenA) < BigInt(args.tokenB)
    ? [args.tokenA, args.tokenB]
    : [args.tokenB, args.tokenA];
  const salt = keccak256(encodePacked(["address", "address"], [token0, token1]));
  const digest = keccak256(encodePacked(
    ["bytes1", "address", "bytes32", "bytes32"],
    ["0xff", args.factory, salt, args.initCodeHash]
  ));
  return getAddress(`0x${digest.slice(-40)}`);
}

/**
 * The complete exclusion list a raffle over a Flap launch requires: every Flap contract
 * that holds the subject — the Portal (pre-graduation supply), the predicted V2 pair
 * (post-graduation liquidity), the V2 liquidity manager and buyback adapter (transient
 * balances), the adapter factory, and the adapter. Sorted ascending, the raffle's rule.
 */
export function raffleExclusionsForFlapLaunch(args: {
  portal: Address; predictedPair: Address; liquidityManager: Address;
  buybackAdapter: Address; adapterFactory: Address; adapter: Address;
}): Address[] {
  const unique = [...new Set([
    args.portal, args.predictedPair, args.liquidityManager, args.buybackAdapter,
    args.adapterFactory, args.adapter
  ].map((value) => getAddress(value)))];
  return unique.sort((a, b) => (BigInt(a) < BigInt(b) ? -1 : 1));
}

export interface FlapLaunchPlanInput {
  creator: Address;
  adapterFactory: Address;
  routerFactory: Address;
  adapterSalt: Hex;
  routerSalt: Hex;
  /** Vanity salt pre-mined against the live Portal's CREATE2 domain, and its result. */
  token: { salt: Hex; predictedAddress: Address; params: Omit<FlapTokenParams, "salt"> };
  /** Reviewed upstream state pinned into the launch; the adapter reverts on drift. */
  reviewedPortalConfigHash: Hex;
  expectedFlapFeeRate: number;
  minDeveloperBuyOut?: bigint;
  launchValue?: bigint;
  flap: {
    portal: Address;
    v2Factory: Address;
    v2PairInitCodeHash: Hex;
    weth: Address;
    liquidityManager: Address;
    buybackAdapter: Address;
  };
  routerConfig: (predicted: { adapter: Address; raffle?: Address }) => RouterConfig;
  raffle?: {
    factory: Address;
    salt: Hex;
    config: (exclusions: Address[]) => RaffleConfig;
  };
}

export interface FlapLaunchStep {
  id: "deploy-raffle" | "deploy-router" | "deploy-adapter" | "launch" | "bind-raffle";
  call: PreparedCall;
  verify: string;
}

export interface FlapLaunchPlan {
  predicted: {
    adapter: Address;
    router: Address;
    token: Address;
    v2Pair: Address;
    raffle?: Address;
  };
  routerConfigBytes: Hex;
  steps: FlapLaunchStep[];
}

export async function planFlapLaunch(
  client: PublicClient, input: FlapLaunchPlanInput
): Promise<FlapLaunchPlan> {
  const [adapter, router] = await Promise.all([
    client.readContract({
      address: input.adapterFactory, abi: sinjohFlapAdapterFactoryAbi,
      functionName: "predictAddress", args: [input.creator, input.adapterSalt]
    }),
    client.readContract({
      address: input.routerFactory, abi: sinjohFeeRouterFactoryAbi,
      functionName: "predictLaunchpadAddress", args: [input.creator, input.routerSalt]
    })
  ]);

  const token = input.token.predictedAddress;
  const v2Pair = predictUniswapV2Pair({
    factory: input.flap.v2Factory,
    initCodeHash: input.flap.v2PairInitCodeHash,
    tokenA: token,
    tokenB: input.flap.weth
  });

  const steps: FlapLaunchStep[] = [];
  let raffle: Address | undefined;

  if (input.raffle !== undefined) {
    const exclusions = raffleExclusionsForFlapLaunch({
      portal: input.flap.portal,
      predictedPair: v2Pair,
      liquidityManager: input.flap.liquidityManager,
      buybackAdapter: input.flap.buybackAdapter,
      adapterFactory: input.adapterFactory,
      adapter
    });
    const raffleConfig = input.raffle.config(exclusions);
    raffle = await client.readContract({
      address: input.raffle.factory, abi: sinjohRaffleRewardsFactoryAbi,
      functionName: "predictRaffle",
      args: [input.creator, input.raffle.salt, raffleConfigHash(raffleConfig)]
    });
    steps.push({
      id: "deploy-raffle",
      call: {
        address: input.raffle.factory, abi: sinjohRaffleRewardsFactoryAbi as Abi,
        functionName: "deployRaffle", args: [input.raffle.salt, raffleConfig],
        description: "Deploy the raffle around the Portal and predicted V2 pair exclusions"
      },
      verify: `deployed address equals ${raffle}; isExcluded holds for the Portal and ${v2Pair}`
    });
  }

  const routerConfig = input.routerConfig({
    adapter, ...(raffle === undefined ? {} : { raffle })
  });
  if (routerConfig.launchpadAdapter.toLowerCase() !== adapter.toLowerCase()) {
    throw new Error("routerConfig must set launchpadAdapter to the predicted adapter");
  }
  const routerConfigBytes = encodeRouterConfig(routerConfig);
  steps.push({
    id: "deploy-router",
    call: {
      address: input.routerFactory, abi: sinjohFeeRouterFactoryAbi as Abi,
      functionName: "deployForLaunchpad",
      args: [input.creator, input.routerSalt, routerConfig],
      description: "Deploy the unbound router naming the predicted adapter"
    },
    verify: `deployed address equals ${router}`
  });

  steps.push({
    id: "deploy-adapter",
    call: {
      address: input.adapterFactory, abi: sinjohFlapAdapterFactoryAbi as Abi,
      functionName: "deploy", args: [input.creator, router, input.adapterSalt],
      description: "Deploy the adapter wired to the router"
    },
    verify: `deployed address equals ${adapter}; adapter.predictSubject(tokenSalt) equals `
      + `${token}; adapter.portalConfigHash() equals the reviewed hash`
  });

  steps.push({
    id: "launch",
    call: {
      address: adapter, abi: sinjohFlapAdapterAbi as Abi, functionName: "launch",
      args: [
        { ...input.token.params, salt: input.token.salt },
        input.reviewedPortalConfigHash,
        input.expectedFlapFeeRate,
        input.minDeveloperBuyOut ?? 0n
      ],
      ...(input.launchValue === undefined ? {} : { value: input.launchValue }),
      description: "Launch through the adapter with the reviewed Portal config and fee rate "
        + "pinned; the adapter binds the router atomically"
    },
    verify: `returned subject equals ${token} and router.subject() is bound`
  });

  if (input.raffle !== undefined && raffle !== undefined) {
    steps.push({
      id: "bind-raffle",
      call: {
        address: raffle, abi: sinjohRaffleRewardsAbi as Abi, functionName: "bind",
        args: [token],
        description: "Bind the raffle to the launched subject"
      },
      verify: `raffle.subject() equals ${token}`
    });
  }

  return {
    predicted: { adapter, router, token, v2Pair, ...(raffle === undefined ? {} : { raffle }) },
    routerConfigBytes,
    steps
  };
}
