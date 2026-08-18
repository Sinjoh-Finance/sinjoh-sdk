import type { Address, Hex } from "viem";

/** One deployed contract (or third-party dependency) recorded in a manifest. */
export interface DeploymentEntry {
  address: Address;
  deploymentBlock?: number;
  deploymentTransaction?: Hex;
  /** keccak256 of the runtime bytecode, when recorded. Absent for third-party dependencies. */
  runtimeCodeHash?: Hex;
  purpose?: string;
  /** For factory/clone entries: the implementation behind the deployed address. */
  implementation?: Address;
  implementationRuntimeCodeHash?: Hex;
}

export interface ChainManifest {
  chainId: number;
  status: string;
  releaseCandidate: boolean;
  deployedAt: string | null;
  rpcUrl: string;
  explorerUrl: string;
  deployer: Address;
  governance: Address;
  /** Sinjoh-deployed contracts, keyed by their dotted manifest path. */
  contracts: Record<string, DeploymentEntry>;
  /** Verified third-party dependencies (Pons, Uniswap, WETH, ...), keyed the same way. */
  dependencies: Record<string, DeploymentEntry>;
  /** Manifest keys that are explicitly recorded as not deployed. */
  notDeployed: readonly string[];
}
