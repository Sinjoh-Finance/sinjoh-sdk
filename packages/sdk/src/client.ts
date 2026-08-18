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
  manifest: Pick<ChainManifest, "contracts">;
  /** Compares recorded runtime code hashes against the live chain; run before trusting reads. */
  verify(keys?: readonly string[]): Promise<VerificationResult[]>;
}

export interface CreateSinjohClientOptions {
  /** An existing viem public client; otherwise one is created from `rpcUrl`. */
  publicClient?: PublicClient;
  rpcUrl?: string;
  chainId?: 4663 | 46630;
  /** Defaults to the packaged mainnet manifest; supply your own of the same schema to pin. */
  manifest?: Pick<ChainManifest, "contracts">;
}

/**
 * Binds a public client to a deployment manifest. The manifest is data, not trust: call
 * `verify()` (and check every result) before acting on the addresses it names.
 */
export function createSinjohClient(options: CreateSinjohClientOptions = {}): SinjohClient {
  const chainId = options.chainId ?? 4663;
  const chain = chainId === 4663 ? robinhoodMainnet : robinhoodTestnet;
  const publicClient = options.publicClient ?? createPublicClient({
    chain,
    transport: http(options.rpcUrl ?? chain.rpcUrls.default.http[0])
  });
  const manifest = options.manifest
    ?? (chainId === 4663
      ? mainnet
      : (() => { throw new Error("no packaged testnet manifest; supply one explicitly"); })());
  return {
    chainId,
    public: publicClient,
    manifest,
    verify: (keys) => verifyManifest(
      publicClient, manifest, keys === undefined ? {} : { keys }
    )
  };
}
