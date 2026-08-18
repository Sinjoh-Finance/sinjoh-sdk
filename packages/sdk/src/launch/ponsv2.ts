import type { Abi, Address, Hex, PublicClient } from "viem";
import {
  sinjohFeeRouterFactoryAbi, sinjohPonsV2AdapterAbi, sinjohPonsV2AdapterFactoryAbi,
  sinjohRaffleRewardsAbi, sinjohRaffleRewardsFactoryAbi
} from "@sinjoh/abis";
import type { PreparedCall } from "../actions.js";
import { encodeRouterConfig, type RouterConfig } from "../codecs/router.js";
import { raffleConfigHash, type RaffleConfig } from "../codecs/raffle.js";
import {
  ponsV2FactoryPredictionAbi, predictLaunchAddresses, raffleExclusionsForLaunch, ZERO_ADDRESS,
  type PonsV2Socials
} from "../predict/ponsv2.js";

/**
 * The Pons v2 launch flow, in the exact order the production fork rehearsal
 * (`sinjoh-integration/test/ProductionPonsV2Raffle.fork.t.sol`) proves against mainnet:
 *
 *   1. predict the adapter        (adapterFactory.predictAddress)
 *   2. predict the router         (routerFactory.predictLaunchpadAddress)
 *   3. predict token + curve      (deployed deployer's own derivation, deployer = adapter)
 *   4. deploy the raffle          (exclusions built around the predicted curve)   [optional]
 *   5. deploy the router          (launchpadAdapter = adapter, raffle named as sink)
 *   6. deploy the adapter         (factory wires it to the router)
 *   7. launch through the adapter (predictions must all hold; adapter binds the router)
 *   8. bind the raffle            (raffle creator, once)                          [optional]
 *
 * The circularity is why this module exists: the raffle's immutable exclusions must name the
 * curve, and the router config must name the adapter and the raffle — none of which exist yet.
 * CREATE2 resolves the ordering, and every step's `verify` readback confirms the prediction
 * held. Configuration policy stays with the caller: `routerConfig` and `raffleConfig` are
 * callbacks receiving the predictions, because allocation layout is a creator decision the
 * SDK must not invent.
 *
 * A prediction holds only while the factory's owner-tunable terms hold; the plan pins
 * `expectedEconomics` so a launch whose terms moved reverts instead of landing on an
 * unpredicted curve. Simulate every step before signing, in order.
 */

export interface PonsV2LaunchTokenInput {
  name: string;
  symbol: string;
  logo: string;
  description: string;
  socials: PonsV2Socials;
  /** Zero routes creator revenue to the adapter (and so the router). */
  creatorFeeRecipient?: Address;
  creatorTaxBps: number;
  buybackEnabled: boolean;
  salt: Hex;
}

export interface PonsV2LaunchPlanInput {
  /** The account that will send the deploy and launch transactions. */
  creator: Address;
  adapterFactory: Address;
  routerFactory: Address;
  ponsFactory: Address;
  launchConfigId: bigint;
  /** Zero address for a native-quote launch. */
  pairToken: Address;
  adapterSalt: Hex;
  routerSalt: Hex;
  token: PonsV2LaunchTokenInput;
  developerBuy?: bigint;
  minTokensOut?: bigint;
  snipeTaxExemptions?: readonly Address[];
  /** Builds the immutable router policy around the predicted addresses. */
  routerConfig: (predicted: { adapter: Address; raffle?: Address }) => RouterConfig;
  raffle?: {
    factory: Address;
    salt: Hex;
    /** Builds the immutable raffle config around the canonical exclusion list. */
    config: (exclusions: Address[]) => RaffleConfig;
  };
}

export interface PonsV2LaunchStep {
  id: "deploy-raffle" | "deploy-router" | "deploy-adapter" | "launch" | "bind-raffle";
  call: PreparedCall;
  /** The readback that must hold after the step confirms. */
  verify: string;
}

export interface PonsV2LaunchPlan {
  predicted: {
    adapter: Address;
    router: Address;
    token: Address;
    curve: Address;
    raffle?: Address;
  };
  launchFee: bigint;
  expectedEconomics: Hex;
  routerConfigBytes: Hex;
  steps: PonsV2LaunchStep[];
}

export async function planPonsV2Launch(
  client: PublicClient, input: PonsV2LaunchPlanInput
): Promise<PonsV2LaunchPlan> {
  // 1-2. Both clone addresses ignore their configuration.
  const [adapter, router] = await Promise.all([
    client.readContract({
      address: input.adapterFactory, abi: sinjohPonsV2AdapterFactoryAbi,
      functionName: "predictAddress", args: [input.creator, input.adapterSalt]
    }),
    client.readContract({
      address: input.routerFactory, abi: sinjohFeeRouterFactoryAbi,
      functionName: "predictLaunchpadAddress", args: [input.creator, input.routerSalt]
    })
  ]);

  // Pin the factory's live terms into the launch so moved terms revert.
  const [expectedEconomics, launchFee] = await Promise.all([
    client.readContract({
      address: input.ponsFactory, abi: ponsV2FactoryPredictionAbi,
      functionName: "previewLaunchEconomics", args: [input.launchConfigId, input.pairToken]
    }),
    client.readContract({
      address: input.ponsFactory, abi: ponsV2FactoryPredictionAbi, functionName: "launchFee"
    })
  ]);

  // 3. The launch, initiated by the yet-undeployed adapter.
  const creatorFeeRecipient = input.token.creatorFeeRecipient ?? ZERO_ADDRESS;
  const { token, curve } = await predictLaunchAddresses(client, {
    factory: input.ponsFactory,
    params: {
      name: input.token.name,
      symbol: input.token.symbol,
      logo: input.token.logo,
      description: input.token.description,
      socials: input.token.socials,
      creatorFeeRecipient,
      creatorTaxBps: input.token.creatorTaxBps,
      buybackEnabled: input.token.buybackEnabled,
      salt: input.token.salt
    },
    launchConfigId: input.launchConfigId,
    pairToken: input.pairToken,
    originalDeployer: adapter
  });

  const steps: PonsV2LaunchStep[] = [];
  let raffle: Address | undefined;

  // 4. The raffle is configured around addresses that do not exist yet.
  if (input.raffle !== undefined) {
    const exclusions = await raffleExclusionsForLaunch(client, {
      factory: input.ponsFactory, curve, extra: [adapter]
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
        description: "Deploy the raffle around the predicted curve's exclusion list"
      },
      verify: `deployed address equals ${raffle} and isExcluded(${curve}) is true`
    });
  }

  // 5. Router names the adapter and (optionally) the raffle sink.
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

  // 6. The factory wires the adapter to the router.
  steps.push({
    id: "deploy-adapter",
    call: {
      address: input.adapterFactory, abi: sinjohPonsV2AdapterFactoryAbi as Abi,
      functionName: "deploy", args: [input.creator, router, input.adapterSalt],
      description: "Deploy the adapter wired to the router"
    },
    verify: `deployed address equals ${adapter}`
  });

  // 7. Launch through the adapter; it binds the router in the same transaction.
  const developerBuy = input.developerBuy ?? 0n;
  steps.push({
    id: "launch",
    call: {
      address: adapter, abi: sinjohPonsV2AdapterAbi as Abi, functionName: "launch",
      args: [
        {
          name: input.token.name,
          symbol: input.token.symbol,
          logo: input.token.logo,
          description: input.token.description,
          socials: input.token.socials,
          creatorFeeRecipient,
          creatorTaxBps: input.token.creatorTaxBps,
          buybackEnabled: input.token.buybackEnabled,
          expectedEconomics,
          salt: input.token.salt
        },
        input.launchConfigId, input.pairToken, developerBuy,
        input.minTokensOut ?? 0n, input.snipeTaxExemptions ?? []
      ],
      value: launchFee + developerBuy,
      description: "Launch the token through the adapter with the exact live launch fee"
    },
    verify: `returned (token, curve) equal (${token}, ${curve}) and router.subject() is bound`
  });

  // 8. The raffle binds to the launched token, once, by its creator.
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
    predicted: { adapter, router, token, curve, ...(raffle === undefined ? {} : { raffle }) },
    launchFee,
    expectedEconomics,
    routerConfigBytes,
    steps
  };
}
