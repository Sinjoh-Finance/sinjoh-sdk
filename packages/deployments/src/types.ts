import type { Address, Hex } from "viem";

/** One deployed contract (or third-party dependency) recorded in a manifest. */
export interface DeploymentEntry {
  address: Address;
  /** Explicitly distinguishes no-code operational accounts from contracts. */
  kind?: "contract" | "eoa";
  deploymentBlock?: number;
  deploymentTransaction?: Hex;
  /** keccak256 of the runtime bytecode. Required for contract entries. */
  runtimeCodeHash?: Hex;
  purpose?: string;
  /** For factory/clone entries: the implementation behind the deployed address. */
  implementation?: Address;
  implementationRuntimeCodeHash?: Hex;
  /** How an upgradeable proxy/beacon exposes its currently active implementation. */
  implementationBinding?:
    | { kind: "eip1967"; slot: Hex }
    | { kind: "beacon" };
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
  /** Explicitly classified authority identities, also exposed by the address aliases above. */
  roles: Record<"deployer" | "governance", DeploymentEntry>;
  /** Sinjoh-deployed contracts, keyed by their dotted manifest path. */
  contracts: Record<string, DeploymentEntry>;
  /** Verified third-party dependencies (Pons, Uniswap, WETH, ...), keyed the same way. */
  dependencies: Record<string, DeploymentEntry>;
  /** Manifest keys that are explicitly recorded as not deployed. */
  notDeployed: readonly string[];
}
