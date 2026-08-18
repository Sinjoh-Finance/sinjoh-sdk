import { sinjohPonsV2AdapterAbi } from "@sinjoh/abis";
import type { Address, Hex, PublicClient } from "viem";
import type { ReadClient } from "./client.js";
import { expectedCloneRuntime } from "./predict/clones.js";
import { readRouterIdentity, readRouterSnapshot } from "./reads.js";

/**
 * The activation checklist: a launch is shown as active only when every wiring check passes
 * against live chain state. A UI or agent must run this after the launch transactions land
 * and again whenever upstream state could have moved — previously received value stays
 * governed by Sinjoh even when an upstream integration goes inactive.
 */

export interface ActivationCheck {
  name: string;
  ok: boolean;
  detail: string;
}

export interface ActivationReport {
  state: "active" | "inactive";
  checks: ActivationCheck[];
}

export type CodeReadClient = ReadClient & Pick<PublicClient, "getCode">;

/** Wiring checks for a Pons v2 adapter-owned launch. */
export async function checkPonsV2Activation(client: CodeReadClient, args: {
  adapter: Address;
  router: Address;
  /** From the manifest: the adapter implementation the factory clones. */
  adapterImplementation?: Address;
  /** From the manifest: the router implementation the factory clones. */
  routerImplementation?: Address;
}): Promise<ActivationReport> {
  const checks: ActivationCheck[] = [];
  const adapterAt = { address: args.adapter, abi: sinjohPonsV2AdapterAbi } as const;

  const [adapterSubject, adapterRouter, adapterLaunched, adapterInitialized] =
    await Promise.all([
      client.readContract({ ...adapterAt, functionName: "subject" }),
      client.readContract({ ...adapterAt, functionName: "router" }),
      client.readContract({ ...adapterAt, functionName: "launched" }),
      client.readContract({ ...adapterAt, functionName: "initialized" })
    ]);
  const router = await readRouterIdentity(client, args.router);

  checks.push({
    name: "adapter initialized and launched",
    ok: adapterInitialized && adapterLaunched,
    detail: `initialized=${adapterInitialized} launched=${adapterLaunched}`
  });
  checks.push({
    name: "adapter points at the router",
    ok: adapterRouter.toLowerCase() === args.router.toLowerCase(),
    detail: `adapter.router()=${adapterRouter}`
  });
  checks.push({
    name: "router bound to the adapter's subject",
    ok: router.bound && router.initialized
      && router.subject.toLowerCase() === adapterSubject.toLowerCase(),
    detail: `router.subject()=${router.subject} adapter.subject()=${adapterSubject}`
  });
  checks.push({
    name: "router names the adapter as launchpadAdapter",
    ok: router.launchpadAdapter.toLowerCase() === args.adapter.toLowerCase(),
    detail: `router.launchpadAdapter()=${router.launchpadAdapter}`
  });

  const snapshot = await readRouterSnapshot(client, args.router);
  const intake = new Set(snapshot.intakeAssets.map((asset) => asset.toLowerCase()));
  checks.push({
    name: "router intake covers subject and WETH",
    ok: intake.has(adapterSubject.toLowerCase()) && intake.has(router.weth.toLowerCase()),
    detail: `intakeAssets=[${snapshot.intakeAssets.join(", ")}]`
  });

  for (const [label, address, implementation] of [
    ["adapter", args.adapter, args.adapterImplementation],
    ["router", args.router, args.routerImplementation]
  ] as const) {
    if (implementation === undefined) continue;
    const code: Hex | undefined = await client.getCode({ address });
    const expected = expectedCloneRuntime(implementation);
    checks.push({
      name: `${label} runtime is the expected clone`,
      ok: code !== undefined && code.toLowerCase() === expected.toLowerCase(),
      detail: `expected EIP-1167 proxy for ${implementation}`
    });
  }

  return {
    state: checks.every((check) => check.ok) ? "active" : "inactive",
    checks
  };
}
