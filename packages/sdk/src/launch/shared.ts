import { getAddress, parseAbi, type Abi, type Address, type Hex, type PublicClient } from "viem";
import { sinjohFeeRouterFactoryAbi, sinjohRaffleRewardsFactoryAbi } from "@sinjoh/abis";
import type { PreparedCall } from "../actions.js";
import { encodeRouterConfig, type RouterConfig } from "../codecs/router.js";
import { raffleConfigHash, type RaffleConfig } from "../codecs/raffle.js";

/**
 * The pieces every launch flow shares: clone-address prediction, the raffle
 * deploy step, the router deploy step with its adapter-naming invariant, and the
 * adapter deploy step. One implementation, so a hardening lands in every flow at once.
 */

/** Every Sinjoh adapter factory exposes this identical prediction surface. */
const adapterFactoryPredictAbi = parseAbi([
  "function predictAddress(address creator, bytes32 userSalt) view returns (address)",
  "function deploy(address creator, address router, bytes32 userSalt) returns (address)"
]);

/** Dedupes (post-checksum) and sorts ascending by numeric value — the raffle's rule. */
export function sortedUniqueAddresses(addresses: readonly Address[]): Address[] {
  const unique = [...new Set(addresses.map((value) => getAddress(value)))];
  return unique.sort((a, b) => (BigInt(a) < BigInt(b) ? -1 : 1));
}

export async function predictAdapterAndRouter(client: PublicClient, args: {
  creator: Address; adapterFactory: Address; adapterSalt: Hex;
  routerFactory: Address; routerSalt: Hex;
}): Promise<{ adapter: Address; router: Address }> {
  const [adapter, router] = await Promise.all([
    client.readContract({
      address: args.adapterFactory, abi: adapterFactoryPredictAbi,
      functionName: "predictAddress", args: [args.creator, args.adapterSalt]
    }),
    client.readContract({
      address: args.routerFactory, abi: sinjohFeeRouterFactoryAbi,
      functionName: "predictLaunchpadAddress", args: [args.creator, args.routerSalt]
    })
  ]);
  return { adapter, router };
}

export interface LaunchStepCall {
  call: PreparedCall;
  verify: string;
}

/** Predicts the raffle from the config's canonical hash and prepares its deploy. */
export async function planRaffleDeploy(client: PublicClient, args: {
  factory: Address; salt: Hex; creator: Address; config: RaffleConfig; verifyExtra?: string;
}): Promise<{ raffle: Address; step: LaunchStepCall }> {
  const raffle = await client.readContract({
    address: args.factory, abi: sinjohRaffleRewardsFactoryAbi,
    functionName: "predictRaffle",
    args: [args.creator, args.salt, raffleConfigHash(args.config)]
  });
  return {
    raffle,
    step: {
      call: {
        address: args.factory, abi: sinjohRaffleRewardsFactoryAbi as Abi,
        functionName: "deployRaffle", args: [args.salt, args.config],
        description: "Deploy the raffle around the launch's protocol-holder exclusions"
      },
      verify: `deployed address equals ${raffle}; every configured exclusion isExcluded`
        + (args.verifyExtra === undefined ? "" : `; ${args.verifyExtra}`)
    }
  };
}

/** Validates the adapter-naming invariant, encodes, and prepares the router deploy. */
export function planRouterDeploy(args: {
  routerFactory: Address; creator: Address; salt: Hex; config: RouterConfig;
  adapter: Address; router: Address;
}): { routerConfigBytes: Hex; step: LaunchStepCall } {
  if (args.config.launchpadAdapter.toLowerCase() !== args.adapter.toLowerCase()) {
    throw new Error("routerConfig must set launchpadAdapter to the predicted adapter");
  }
  return {
    routerConfigBytes: encodeRouterConfig(args.config),
    step: {
      call: {
        address: args.routerFactory, abi: sinjohFeeRouterFactoryAbi as Abi,
        functionName: "deployForLaunchpad", args: [args.creator, args.salt, args.config],
        description: "Deploy the unbound router naming the predicted adapter"
      },
      verify: `deployed address equals ${args.router}`
    }
  };
}

export function planAdapterDeploy(args: {
  adapterFactory: Address; creator: Address; salt: Hex; adapter: Address; router: Address;
  verifyExtra?: string;
}): LaunchStepCall {
  return {
    call: {
      address: args.adapterFactory, abi: adapterFactoryPredictAbi as Abi,
      functionName: "deploy", args: [args.creator, args.router, args.salt],
      description: "Deploy the adapter wired to the router"
    },
    verify: `deployed address equals ${args.adapter}`
      + (args.verifyExtra === undefined ? "" : `; ${args.verifyExtra}`)
  };
}
