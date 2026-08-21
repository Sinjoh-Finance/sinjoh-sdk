import { type Abi, type Address, type Hex, type PublicClient } from "viem";
import { sinjohLetsCashAdapterAbi, sinjohRaffleRewardsAbi } from "@sinjoh/abis";
import type { PreparedCall } from "../actions.js";
import type { RouterConfig } from "../codecs/router.js";
import type { RaffleConfig } from "../codecs/raffle.js";
import {
  planAdapterDeploy, planRaffleDeploy, planRouterDeploy, predictAdapterAndRouter,
  sortedUniqueAddresses
} from "./shared.js";

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
 * arguments (subject, poolId) exist only after the upstream launch. Once activation binds the
 * indexed subject, the Sinjoh public API automatically reconciles the chain projection into its
 * launch registry. Builders do not publish or hand launch details to an operator.
 */

/**
 * The exclusion list the rehearsal proves: the adapter and router (fee-path custody), the
 * letscash factory, the V4 PoolManager, and the hook. Sorted ascending, the raffle's rule.
 */
export function raffleExclusionsForLetsCashLaunch(args: {
  adapter: Address; router: Address; letscashFactory: Address; poolManager: Address;
  hook: Address;
}): Address[] {
  return sortedUniqueAddresses([
    args.adapter, args.router, args.letscashFactory, args.poolManager, args.hook
  ]);
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

/** Binds a raffle to its launched subject, once, from the raffle creator. */
export function raffleBind(raffle: Address, subject: Address): PreparedCall {
  return {
    address: raffle, abi: sinjohRaffleRewardsAbi as Abi, functionName: "bind",
    args: [subject],
    description: "Bind the raffle to the launched subject"
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
  const { adapter, router } = await predictAdapterAndRouter(client, input);

  const steps: LetsCashIntegrationStep[] = [];
  let raffle: Address | undefined;

  if (input.raffle !== undefined) {
    const exclusions = raffleExclusionsForLetsCashLaunch({
      adapter, router,
      letscashFactory: input.letscash.factory,
      poolManager: input.letscash.poolManager,
      hook: input.letscash.hook
    });
    const planned = await planRaffleDeploy(client, {
      factory: input.raffle.factory, salt: input.raffle.salt, creator: input.creator,
      config: input.raffle.config(exclusions)
    });
    raffle = planned.raffle;
    steps.push({ id: "deploy-raffle", ...planned.step });
  }

  const routerDeploy = planRouterDeploy({
    routerFactory: input.routerFactory, creator: input.creator, salt: input.routerSalt,
    config: input.routerConfig({ adapter, ...(raffle === undefined ? {} : { raffle }) }),
    adapter, router
  });
  steps.push({ id: "deploy-router", ...routerDeploy.step });

  steps.push({
    id: "deploy-adapter",
    ...planAdapterDeploy({
      adapterFactory: input.adapterFactory, creator: input.creator, salt: input.adapterSalt,
      adapter, router
    })
  });

  const followUps = [
    `Launch on the upstream letscash factory (${input.letscash.factory}): mineSalt, then `
      + `launchWithFeeSplit with recipients=[${adapter}] and shares=[10000], sending `
      + "launchFee plus any developer buy.",
    `Call letscashActivate(${adapter}, subject, poolId, configId) — binds the router; then `
      + "verify router.subject() equals the launched token and adapter.feeRoutingIntact().",
    ...(raffle === undefined ? [] : [
      `Bind the raffle: raffleBind(${raffle}, subject), from the raffle creator, once.`
    ]),
    "Registry publication is automatic after the indexer observes the activated subject. "
      + "Verify discovery with GET https://api.sinjoh.com/v1/launches/{subject}; allow normal "
      + "confirmation and indexing lag before retrying. No manual publication is required."
  ];

  return {
    predicted: { adapter, router, ...(raffle === undefined ? {} : { raffle }) },
    routerConfigBytes: routerDeploy.routerConfigBytes,
    steps,
    followUps
  };
}
