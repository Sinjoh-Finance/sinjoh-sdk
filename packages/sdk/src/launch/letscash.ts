import { getAddress, type Abi, type Address, type Hex, type PublicClient } from "viem";
import {
  sinjohFeeRouterFactoryAbi, sinjohLetsCashAdapterAbi, sinjohLetsCashAdapterFactoryAbi,
  sinjohRaffleRewardsAbi, sinjohRaffleRewardsFactoryAbi
} from "@sinjoh/abis";
import type { PreparedCall } from "../actions.js";
import { encodeRouterConfig, type RouterConfig } from "../codecs/router.js";
import { raffleConfigHash, type RaffleConfig } from "../codecs/raffle.js";

/**
 * The letscash.fun integration flow, in the order the production fork rehearsal
 * (`sinjoh-integration/test/ProductionLetsCashRaffle.fork.t.sol`) proves against mainnet.
 *
 * letscash differs from Pons v2 and Flap: the token launches on the UPSTREAM letscash
 * factory (the creator calls `mineSalt` then `launchWithFeeSplit`, naming the predicted
 * adapter as the 100% fee recipient), and only afterwards does the adapter `activate` bind
 * the subject and pool to the router. The Sinjoh-side plan therefore stops at the deployed
 * adapter; the upstream launch and the activate/bind follow-ups are returned as explicit
 * follow-up descriptions plus the `letscashActivate`/`raffleBind` builders, because their
 * arguments (subject, poolId) exist only after the upstream launch.
 */

/**
 * The exclusion list the rehearsal proves: the adapter and router (fee-path custody), the
 * letscash factory, the V4 PoolManager, and the hook. Sorted ascending, the raffle's rule.
 */
export function raffleExclusionsForLetsCashLaunch(args: {
  adapter: Address; router: Address; letscashFactory: Address; poolManager: Address;
  hook: Address;
}): Address[] {
  const unique = [...new Set([
    args.adapter, args.router, args.letscashFactory, args.poolManager, args.hook
  ].map((value) => getAddress(value)))];
  return unique.sort((a, b) => (BigInt(a) < BigInt(b) ? -1 : 1));
}

/** Binds a launched letscash token and pool to the adapter's router, once. */
export function letscashActivate(
  adapter: Address, subject: Address, poolId: Hex, configId: bigint
): PreparedCall {
  return {
    address: adapter, abi: sinjohLetsCashAdapterAbi as Abi, functionName: "activate",
    args: [subject, poolId, configId],
    description: "Activate the adapter for the launched subject and pool; binds the router"
  };
}

export interface LetsCashIntegrationPlanInput {
  creator: Address;
  adapterFactory: Address;
  routerFactory: Address;
  adapterSalt: Hex;
  routerSalt: Hex;
  letscash: {
    factory: Address;
    poolManager: Address;
    hook: Address;
  };
  routerConfig: (predicted: { adapter: Address; raffle?: Address }) => RouterConfig;
  raffle?: {
    factory: Address;
    salt: Hex;
    config: (exclusions: Address[]) => RaffleConfig;
  };
}

export interface LetsCashIntegrationStep {
  id: "deploy-raffle" | "deploy-router" | "deploy-adapter";
  call: PreparedCall;
  verify: string;
}

export interface LetsCashIntegrationPlan {
  predicted: { adapter: Address; router: Address; raffle?: Address };
  routerConfigBytes: Hex;
  steps: LetsCashIntegrationStep[];
  /** What must happen after these steps, in order; arguments exist only post-launch. */
  followUps: string[];
}

export async function planLetsCashIntegration(
  client: PublicClient, input: LetsCashIntegrationPlanInput
): Promise<LetsCashIntegrationPlan> {
  const [adapter, router] = await Promise.all([
    client.readContract({
      address: input.adapterFactory, abi: sinjohLetsCashAdapterFactoryAbi,
      functionName: "predictAddress", args: [input.creator, input.adapterSalt]
    }),
    client.readContract({
      address: input.routerFactory, abi: sinjohFeeRouterFactoryAbi,
      functionName: "predictLaunchpadAddress", args: [input.creator, input.routerSalt]
    })
  ]);

  const steps: LetsCashIntegrationStep[] = [];
  let raffle: Address | undefined;

  if (input.raffle !== undefined) {
    const exclusions = raffleExclusionsForLetsCashLaunch({
      adapter, router,
      letscashFactory: input.letscash.factory,
      poolManager: input.letscash.poolManager,
      hook: input.letscash.hook
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
        description: "Deploy the raffle around the letscash protocol-holder exclusions"
      },
      verify: `deployed address equals ${raffle}; every exclusion isExcluded`
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
      address: input.adapterFactory, abi: sinjohLetsCashAdapterFactoryAbi as Abi,
      functionName: "deploy", args: [input.creator, router, input.adapterSalt],
      description: "Deploy the adapter wired to the router"
    },
    verify: `deployed address equals ${adapter}`
  });

  const followUps = [
    `Launch on the upstream letscash factory (${input.letscash.factory}): mineSalt, then `
      + `launchWithFeeSplit with recipients=[${adapter}] and shares=[10000], sending `
      + "launchFee plus any developer buy.",
    `Call letscashActivate(${adapter}, subject, poolId, configId) — binds the router; then `
      + "verify router.subject() equals the launched token and adapter.feeRoutingIntact().",
    ...(raffle === undefined ? [] : [
      `Bind the raffle: raffleBind(${raffle}, subject), from the raffle creator, once.`
    ])
  ];

  return {
    predicted: { adapter, router, ...(raffle === undefined ? {} : { raffle }) },
    routerConfigBytes,
    steps,
    followUps
  };
}

/** Re-exported here so a letscash flow has its post-launch binder next to activate. */
export function raffleBind(raffle: Address, subject: Address): PreparedCall {
  return {
    address: raffle, abi: sinjohRaffleRewardsAbi as Abi, functionName: "bind",
    args: [subject],
    description: "Bind the raffle to the launched subject"
  };
}
