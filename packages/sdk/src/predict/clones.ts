import type { Address, Hex } from "viem";

/**
 * The exact EIP-1167 minimal-proxy runtime bytecode for an implementation address.
 *
 * Every Sinjoh factory deploys clones; comparing `eth_getCode` of a deployed router,
 * adapter, or raffle against this value proves it proxies the expected implementation.
 * Address prediction itself is never re-derived off-chain: the factories expose
 * `predict*` views, and running the deployed code's own derivation via `eth_call` leaves
 * struct encoding as the only thing an off-chain caller can get wrong.
 */
export function expectedCloneRuntime(implementation: Address): Hex {
  return `0x363d3d373d3d3d363d73${implementation.slice(2).toLowerCase()}5af43d82803e903d91602b57fd5bf3`;
}
