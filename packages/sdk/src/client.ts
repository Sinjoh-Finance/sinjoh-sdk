import { createPublicClient, http, type PublicClient } from "viem";
import {
  mainnet, verifyManifest, type ChainManifest, type VerificationResult
} from "@sinjoh/deployments";
import { robinhoodMainnet, robinhoodTestnet } from "./chains.js";

/** The single read surface every SDK helper needs; any viem PublicClient satisfies it. */
export type ReadClient = Pick<PublicClient, "readContract">;

export interface SinjohClient {
  chainId: number;
  public: PublicClient;
  manifest: Pick<ChainManifest, "chainId" | "contracts">
    & Partial<Pick<ChainManifest, "dependencies" | "roles">>;
  /** Compares recorded runtime code hashes against the live chain; run before trusting reads. */
  verify(keys?: readonly string[]): Promise<VerificationResult[]>;
}

export interface CreateSinjohClientOptions {
  /** An existing viem public client; otherwise one is created from `rpcUrl`. */
  publicClient?: PublicClient;
  rpcUrl?: string;
  chainId?: 4663 | 46630;
  /** Defaults to the packaged mainnet manifest; supply your own of the same schema to pin. */
  manifest?: Pick<ChainManifest, "chainId" | "contracts">
    & Partial<Pick<ChainManifest, "dependencies" | "roles">>;
}

/**
 * Binds a public client to a deployment manifest. The manifest is data, not trust: call
 * `verify()` (and check every result) before acting on the addresses it names.
 */
export function createSinjohClient(options: CreateSinjohClientOptions = {}): SinjohClient {
  const clientChainId = options.publicClient?.chain?.id;
  if (options.chainId !== undefined && clientChainId !== undefined
    && options.chainId !== clientChainId) {
    throw new Error(
      `chainId ${options.chainId} does not match publicClient chain ${clientChainId}`
    );
  }
  const chainId = options.chainId ?? clientChainId ?? 4663;
  if (chainId !== 4663 && chainId !== 46630) {
    throw new Error(`unsupported chainId ${chainId}; expected 4663 or 46630`);
  }
  const chain = chainId === 4663 ? robinhoodMainnet : robinhoodTestnet;
  const publicClient = options.publicClient ?? createPublicClient({
    chain,
    transport: http(options.rpcUrl ?? chain.rpcUrls.default.http[0])
  });
  const manifest = options.manifest
    ?? (chainId === 4663
      ? mainnet
      : (() => { throw new Error("no packaged testnet manifest; supply one explicitly"); })());
  if (manifest.chainId !== chainId) {
    throw new Error(`manifest chain ${manifest.chainId} does not match client chain ${chainId}`);
  }
  return {
    chainId,
    public: publicClient,
    manifest,
    verify: (keys) => verifyManifest(
      publicClient, manifest, keys === undefined ? {} : { keys }
    )
  };
}
