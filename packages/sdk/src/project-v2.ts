import type {
  Address,
  ContractFunctionArgs,
  ContractFunctionReturnType,
  Hex,
  PublicClient,
} from "viem";
import {
  encodeAbiParameters,
  getAddress,
  isAddress,
  isHex,
  keccak256,
  stringToHex,
} from "viem";
import {
  projectLauncherV2Abi,
  projectRegistryV2Abi,
} from "@sinjoh/abis";

export { projectLauncherV2Abi, projectRegistryV2Abi } from "@sinjoh/abis";

export const ProjectModuleKey = {
  TOKEN: keccak256(stringToHex("TOKEN")),
  MULTISIG: keccak256(stringToHex("MULTISIG")),
  TIMELOCK: keccak256(stringToHex("TIMELOCK")),
  STAKING: keccak256(stringToHex("STAKING")),
  TREASURY: keccak256(stringToHex("TREASURY")),
  AIRDROP: keccak256(stringToHex("AIRDROP")),
  ROUTER: keccak256(stringToHex("ROUTER")),
  BANDS: keccak256(stringToHex("BANDS")),
  LIQUIDITY: keccak256(stringToHex("LIQUIDITY")),
} as const;

export const ProjectRouterActionType = {
  SEND: 0,
  SWAP_AND_SEND: 1,
  BURN_PROJECT_TOKEN: 2,
  ADD_LIQUIDITY: 3,
  FUND_AIRDROP: 4,
  FUND_RAFFLE: 5,
  FUND_TREASURY: 6,
  FUND_PROJECT_SINK: 7,
  SWAP_AND_FUND_TREASURY: 8,
  SWAP_AND_FUND_AIRDROP: 9,
  SWAP_AND_FUND_RAFFLE: 10,
  NORMALIZE_TO_ROUTE: 11,
} as const;

export interface ProjectRouterSwapConfig {
  outputAsset: Address;
  routeData: Hex;
  approvalProof: readonly Hex[];
}

export interface ProjectRouterSwapAndFundConfig extends ProjectRouterSwapConfig {
  fundingConfig: Hex;
}

export function encodeProjectRouterSwapConfig(config: ProjectRouterSwapConfig): Hex {
  return encodeAbiParameters(
    [{
      type: "tuple",
      components: [
        { name: "outputAsset", type: "address" },
        { name: "routeData", type: "bytes" },
        { name: "approvalProof", type: "bytes32[]" },
      ],
    }],
    [config],
  );
}

export function encodeProjectRouterSwapAndFundConfig(
  config: ProjectRouterSwapAndFundConfig,
): Hex {
  return encodeAbiParameters(
    [{
      type: "tuple",
      components: [
        { name: "outputAsset", type: "address" },
        { name: "routeData", type: "bytes" },
        { name: "approvalProof", type: "bytes32[]" },
        { name: "fundingConfig", type: "bytes" },
      ],
    }],
    [config],
  );
}

export type ProjectLaunchConfig = ContractFunctionArgs<
  typeof projectLauncherV2Abi,
  "view",
  "validateLaunchConfig"
>[0];

export type ProjectLaunchPreview = ContractFunctionReturnType<
  typeof projectLauncherV2Abi,
  "view",
  "validateLaunchConfig"
>;

export type ProjectRecord = ContractFunctionReturnType<
  typeof projectRegistryV2Abi,
  "view",
  "project"
>;

export function predictLaunch(
  client: PublicClient,
  launcher: import("viem").Address,
  config: ProjectLaunchConfig,
) {
  return client.readContract({
    address: launcher,
    abi: projectLauncherV2Abi,
    functionName: "predictLaunch",
    args: [config],
  });
}

export function validateLaunchConfig(
  client: PublicClient,
  launcher: import("viem").Address,
  config: ProjectLaunchConfig,
) {
  return client.readContract({
    address: launcher,
    abi: projectLauncherV2Abi,
    functionName: "validateLaunchConfig",
    args: [config],
  });
}

export function predictExistingTokenLaunch(
  client: PublicClient,
  launcher: import("viem").Address,
  config: ProjectLaunchConfig,
  subject: import("viem").Address,
) {
  return client.readContract({
    address: launcher,
    abi: projectLauncherV2Abi,
    functionName: "predictExistingTokenLaunch",
    args: [config, subject],
  });
}

export function predictProjectModuleAddress(
  client: PublicClient,
  launcher: Address,
  creator: Address,
  userSalt: Hex,
  moduleKey: Hex,
) {
  return client.readContract({
    address: launcher,
    abi: projectLauncherV2Abi,
    functionName: "predictModuleAddress",
    args: [creator, userSalt, moduleKey],
  });
}

export function validateExistingTokenLaunchConfig(
  client: PublicClient,
  launcher: import("viem").Address,
  config: ProjectLaunchConfig,
  subject: import("viem").Address,
) {
  return client.readContract({
    address: launcher,
    abi: projectLauncherV2Abi,
    functionName: "validateExistingTokenLaunchConfig",
    args: [config, subject],
  });
}

export function projectRecord(
  client: PublicClient,
  registry: import("viem").Address,
  projectId: import("viem").Hex,
) {
  return client.readContract({
    address: registry,
    abi: projectRegistryV2Abi,
    functionName: "project",
    args: [projectId],
  });
}

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const BURN_ADDRESS = "0x000000000000000000000000000000000000dead";
const BYTES32 = /^0x[0-9a-fA-F]{64}$/;
const textEncoder = new TextEncoder();

/**
 * A complete platform-reviewed configuration. Infrastructure addresses, proofs, routes, module
 * dependencies, and protocol defaults belong here—not in a creator form.
 */
export interface ProjectLaunchPreset {
  id: string;
  protocolVersion: string;
  config: ProjectLaunchConfig;
}

/** Fields the creator actually owns in the normal launch journey. */
export interface CreatorLaunchChoices {
  creator: Address;
  name: string;
  symbol: string;
  totalSupply: bigint;
  salt: Hex;
  tokenAllocations: readonly {
    recipient: Address;
    amount: bigint;
  }[];
  metadataURI?: string;
  /** Required only by MULTISIG profiles. The builder sorts and de-duplicates them. */
  multisigSigners?: readonly [Address, Address, Address];
  /** Required only when Staking is enabled. Zero explicitly selects no guardian. */
  stakingGuardian?: Address;
  /** Required only when Airdrop is enabled. */
  airdropAttestor?: Address;
  /** Required only when Raffle is enabled. */
  raffleAttestor?: Address;
}

/**
 * Creator-owned fields for a launchpad token that Project V2 registers rather than mints.
 * Existing-token launches must carry no Project token allocations because the launchpad owns
 * supply creation and distribution.
 */
export type CreatorExistingTokenLaunchChoices = Omit<
  CreatorLaunchChoices,
  "tokenAllocations"
> & {
  tokenAllocations?: readonly [];
};

/**
 * Hydrates one reviewed launch preset without exposing protocol plumbing to the creator.
 * The returned tuple can be passed directly to `validateLaunchConfig`, then `launch`.
 */
export function buildLaunchFromPreset(
  preset: ProjectLaunchPreset,
  choices: CreatorLaunchChoices,
): ProjectLaunchConfig {
  return buildLaunchFromPresetInternal(preset, choices, false);
}

/**
 * Hydrates a reviewed preset for `launchExistingToken`. The same participant validation as the
 * direct launch builder applies, but the returned config always has an empty allocation list as
 * required by ProjectLaunchValidatorV2.
 */
export function buildExistingTokenLaunchFromPreset(
  preset: ProjectLaunchPreset,
  choices: CreatorExistingTokenLaunchChoices,
): ProjectLaunchConfig {
  if (choices.tokenAllocations && choices.tokenAllocations.length !== 0) {
    throw new RangeError("Existing-token launches cannot include Project token allocations");
  }
  return buildLaunchFromPresetInternal(
    preset,
    { ...choices, tokenAllocations: [] },
    true,
  );
}

function buildLaunchFromPresetInternal(
  preset: ProjectLaunchPreset,
  choices: CreatorLaunchChoices,
  externalSubject: boolean,
): ProjectLaunchConfig {
  if (preset.id.trim().length === 0) throw new RangeError("Launch preset ID cannot be empty");
  if (preset.protocolVersion.trim().length === 0) {
    throw new RangeError("Launch preset protocol version cannot be empty");
  }
  if (preset.config.modules?.raffle && (
    preset.config.raffle.creator.toLowerCase() !== ZERO_ADDRESS
      || preset.config.raffle.randomness.toLowerCase() !== ZERO_ADDRESS
      || preset.config.raffle.protocolFeeRecipient.toLowerCase() !== ZERO_ADDRESS
  )) {
    throw new RangeError(
      "The selected Raffle preset is not compatible with this release. Refresh the launch profile",
    );
  }
  assertUsableAddress(choices.creator, "Creator");
  if (choices.name.trim().length === 0) throw new RangeError("Token name cannot be empty");
  if (choices.symbol.trim().length === 0) throw new RangeError("Token symbol cannot be empty");
  if (choices.totalSupply <= 0n) throw new RangeError("Total supply must be greater than zero");
  if (!BYTES32.test(choices.salt)) throw new RangeError("Launch salt must be exactly 32 bytes");
  const tokenAllocations = externalSubject
    ? []
    : validateTokenAllocations(choices.tokenAllocations, choices.totalSupply);

  const metadataURI = choices.metadataURI ?? "";
  if (textEncoder.encode(metadataURI).length > 512) {
    throw new RangeError("Metadata URI cannot exceed 512 UTF-8 bytes");
  }

  const tokenGovernance = {
    ...preset.config.governance.tokenGovernance,
    // Reference supply is immutable project identity, not platform policy.
    referenceSupply: choices.totalSupply,
  };
  let multisigSigners = preset.config.governance.multisigSigners;
  if (preset.config.governanceMode === 0) {
    if (!choices.multisigSigners) {
      throw new RangeError("This launch profile requires exactly three multisig signers");
    }
    const normalized = choices.multisigSigners
      .map((signer, index) => {
        assertUsableAddress(signer, `Multisig signer ${index + 1}`);
        return signer;
      })
      .sort((left, right) => left.toLowerCase().localeCompare(right.toLowerCase()));
    if (new Set(normalized.map((signer) => signer.toLowerCase())).size !== 3) {
      throw new RangeError("Multisig signers must be unique");
    }
    multisigSigners = normalized as [Address, Address, Address];
  }

  let stakingGuardian = preset.config.staking.guardian;
  if (preset.config.modules.staking) {
    if (choices.stakingGuardian === undefined) {
      throw new RangeError("This launch profile requires an explicit Staking guardian choice");
    }
    assertOptionalAddress(choices.stakingGuardian, "Staking guardian");
    stakingGuardian = choices.stakingGuardian;
  }

  let airdropAttestor = preset.config.airdrop.attestor;
  if (preset.config.modules.airdrop) {
    if (!choices.airdropAttestor) {
      throw new RangeError("This launch profile requires an Airdrop attestor");
    }
    assertUsableAddress(choices.airdropAttestor, "Airdrop attestor");
    if (choices.airdropAttestor.toLowerCase() === choices.creator.toLowerCase()) {
      throw new RangeError("The Airdrop attestor must be independent from the creator");
    }
    airdropAttestor = choices.airdropAttestor;
  }

  let raffleAttestor = preset.config.raffle.attestor;
  if (preset.config.modules.raffle) {
    if (!choices.raffleAttestor) {
      throw new RangeError("This launch profile requires a Raffle attestor");
    }
    assertUsableAddress(choices.raffleAttestor, "Raffle attestor");
    raffleAttestor = choices.raffleAttestor;
  }

  const routerRoutes = (preset.config.routerRoutes ?? []).map((route) => ({
    ...route,
    actions: route.actions.map((action) => ({
      ...action,
      // A zero recipient on a reviewed wallet-payment action is a creator placeholder.
      // Module placeholders use their dedicated action types and remain zero for the Launcher.
      recipient: (
        (action.actionType === 0 || action.actionType === 1)
        && action.recipient.toLowerCase() === ZERO_ADDRESS
      ) ? choices.creator : action.recipient,
    })),
  }));

  return {
    ...preset.config,
    creator: choices.creator,
    name: choices.name.trim(),
    symbol: choices.symbol.trim(),
    totalSupply: choices.totalSupply,
    salt: choices.salt,
    tokenAllocations,
    routerRoutes,
    metadataURI,
    governance: {
      ...preset.config.governance,
      multisigSigners,
      tokenGovernance,
    },
    staking: {
      ...preset.config.staking,
      guardian: stakingGuardian,
    },
    airdrop: {
      ...preset.config.airdrop,
      attestor: airdropAttestor,
    },
    raffle: {
      ...preset.config.raffle,
      attestor: raffleAttestor,
    },
  };
}

function validateTokenAllocations(
  allocations: CreatorLaunchChoices["tokenAllocations"],
  totalSupply: bigint,
) {
  if (allocations.length === 0 || allocations.length > 16) {
    throw new RangeError("Token allocations must contain between 1 and 16 recipients");
  }

  const seen = new Set<string>();
  let allocated = 0n;
  const validated = allocations.map((allocation, index) => {
    assertUsableAddress(allocation.recipient, `Allocation ${index + 1} recipient`);
    if (allocation.amount <= 0n) {
      throw new RangeError(`Allocation ${index + 1} amount must be greater than zero`);
    }
    const normalized = allocation.recipient.toLowerCase();
    if (seen.has(normalized)) {
      throw new RangeError(`Allocation ${index + 1} duplicates an earlier recipient`);
    }
    seen.add(normalized);
    allocated += allocation.amount;
    return { recipient: allocation.recipient, amount: allocation.amount };
  });
  if (allocated !== totalSupply) {
    throw new RangeError("Token allocations must add up to the total supply exactly");
  }
  return validated;
}

/** Corrective, user-facing copy for the Launcher's stable custom error names. */
export function launchErrorMessage(errorName: string): string {
  return launchErrorMessages[errorName] ?? "This launch configuration is no longer valid. Review it and try again.";
}

const launchErrorMessages: Readonly<Record<string, string>> = {
  InvalidCreator: "Choose a valid creator wallet.",
  CreatorMustLaunch: "Connect the creator wallet selected for this project.",
  InvalidTokenMetadata: "Enter both a token name and symbol.",
  InvalidMetadataURI: "Shorten the metadata link to 512 bytes or fewer.",
  InvalidTotalSupply: "Make the token allocations add up to the total supply exactly.",
  InvalidTokenAllocations: "Add between 1 and 16 token allocation recipients.",
  InvalidTokenAllocation: "Every token allocation needs a valid recipient and a positive amount.",
  DuplicateTokenAllocation: "Combine duplicate token recipients into one allocation.",
  AllocationToCustody: "A launch custody contract cannot receive the initial token allocation.",
  InvalidModuleDependencies: "One selected feature requires another feature that is currently disabled.",
  InvalidGovernanceConfiguration: "Review the selected governance settings and signers.",
  InvalidStakingConfiguration: "Choose a valid staking lock and optional guardian.",
  InvalidAirdropConfiguration: "Review the Airdrop mode and attestor settings.",
  InvalidTreasuryConfiguration: "Review the Treasury Basket allocation settings.",
  InvalidBasketConfiguration: "The selected Basket preset or asset set is not available.",
  InvalidBandsConfiguration: "The selected Funding Bands profile is not available.",
  InvalidRaffleConfiguration: "The selected Raffle profile is unavailable. Refresh and try again.",
  InvalidRouterPlaceholder: "A Router destination requires a module that is not enabled.",
  CreatorExcluded: "The creator wallet cannot be excluded from this project's holder benefits.",
  ModuleDeploymentMismatch: "Address verification failed. Do not submit this launch; refresh the release profile.",
};

function assertUsableAddress(address: Address, label: string): void {
  const normalized = address.toLowerCase();
  if (!isAddress(address) || normalized === ZERO_ADDRESS || normalized === BURN_ADDRESS) {
    throw new RangeError(`${label} must be a valid non-burn address`);
  }
}

function assertOptionalAddress(address: Address, label: string): void {
  if (!isAddress(address) || address.toLowerCase() === BURN_ADDRESS) {
    throw new RangeError(`${label} must be the zero address or a valid non-burn address`);
  }
}

type JsonPrimitive = boolean | null | number | string;
export type JsonValue = JsonPrimitive | readonly JsonValue[] | { readonly [key: string]: JsonValue };

export interface ProjectReleaseReference {
  gitCommit: string;
  buildHash: string;
  launcher: Address;
  registry: Address;
}

export interface ProjectLaunchManifestV1 {
  schemaVersion: "1.0";
  chainId: string;
  transactionHash: Hex;
  blockNumber: string;
  release: ProjectReleaseReference;
  launchConfigHash: Hex;
  projectId: Hex;
  subject: Address;
  creator: Address;
  controller: Address;
  enabledModules: string;
  configuration: JsonValue;
  predictedAddresses: JsonValue;
  registryRecord: JsonValue;
}

/**
 * Produces a JSON-safe project provenance artifact after launch. The caller supplies the exact
 * preflight result and Registry readback; any address, identity, mode, supply, or module mismatch
 * fails before an artifact can be published.
 */
export function buildProjectLaunchManifest(parameters: {
  chainId: bigint;
  transactionHash: Hex;
  blockNumber: bigint;
  release: ProjectReleaseReference;
  config: ProjectLaunchConfig;
  preview: ProjectLaunchPreview;
  record: ProjectRecord;
  registeredLaunchConfigHash: Hex;
}): ProjectLaunchManifestV1 {
  const { config, preview, record, release } = parameters;
  if (parameters.chainId <= 0n) throw new RangeError("Chain ID must be greater than zero");
  if (parameters.blockNumber < 0n) throw new RangeError("Block number cannot be negative");
  assertBytes32(parameters.transactionHash, "Transaction hash");
  assertBytes32(parameters.registeredLaunchConfigHash, "Registered launch config hash");
  assertReleaseReference(release);

  if (preview.launchConfigHash.toLowerCase() !== parameters.registeredLaunchConfigHash.toLowerCase()) {
    throw new Error("Registry launch config hash does not match the validated preflight");
  }
  if (preview.projectId.toLowerCase() !== record.projectId.toLowerCase()) {
    throw new Error("Registry project ID does not match the validated preflight");
  }
  assertSameAddress(preview.addresses.subject, record.subject, "subject");
  assertSameAddress(preview.addresses.controller, record.controller, "controller");
  assertSameAddress(config.creator, record.creator, "creator");
  if (BigInt(preview.enabledModules) !== BigInt(record.enabledModules)) {
    throw new Error("Registry enabled modules do not match the validated preflight");
  }
  if (BigInt(config.totalSupply) !== BigInt(record.referenceSupply)) {
    throw new Error("Registry reference supply does not match the launch configuration");
  }
  if (Number(config.governanceMode) !== Number(record.governanceMode)) {
    throw new Error("Registry governance mode does not match the launch configuration");
  }

  const addressPairs: readonly [Address, Address, string][] = [
    [preview.addresses.multisigAccount, record.multisigAccount, "Multisig Account"],
    [preview.addresses.tokenGovernor, record.tokenGovernor, "Token Governor"],
    [preview.addresses.tokenTimelock, record.tokenTimelock, "Token Timelock"],
    [preview.addresses.voteSource, record.voteSource, "vote source"],
    [preview.addresses.treasury, record.treasury, "Treasury"],
    [preview.addresses.router, record.router, "Router"],
    [preview.addresses.stakingPool, record.stakingPool, "Staking Pool"],
    [preview.addresses.posNft, record.posNft, "PoS NFT"],
    [preview.addresses.airdrop, record.airdrop, "Airdrop"],
    [preview.addresses.raffle, record.raffle, "Raffle"],
    [preview.addresses.liquidityManager, record.liquidityManager, "Liquidity Manager"],
    [preview.addresses.fundingBands, record.fundingBands, "Funding Bands"],
    [preview.addresses.basketManager, record.basketManager, "Basket Manager"],
  ];
  for (const [predicted, registered, label] of addressPairs) {
    assertSameAddress(predicted, registered, label);
  }
  if (BigInt(preview.addresses.primaryBasketId) !== BigInt(record.primaryBasketId)) {
    throw new Error("Registry primary Basket ID does not match the validated preflight");
  }
  assertSameAddress(config.launchProfile.canonicalPool, record.canonicalPool, "canonical pool");

  return {
    schemaVersion: "1.0",
    chainId: parameters.chainId.toString(),
    transactionHash: parameters.transactionHash,
    blockNumber: parameters.blockNumber.toString(),
    release: {
      ...release,
      launcher: getAddress(release.launcher),
      registry: getAddress(release.registry),
    },
    launchConfigHash: parameters.registeredLaunchConfigHash,
    projectId: record.projectId,
    subject: getAddress(record.subject),
    creator: getAddress(record.creator),
    controller: getAddress(record.controller),
    enabledModules: BigInt(record.enabledModules).toString(),
    configuration: jsonValue(config),
    predictedAddresses: jsonValue(preview.addresses),
    registryRecord: jsonValue(record),
  };
}

/** Stable serialization for storage, signing, or hashing. Object keys are sorted recursively. */
export function serializeProjectLaunchManifest(manifest: ProjectLaunchManifestV1): string {
  return JSON.stringify(sortJson(manifest as unknown as JsonValue));
}

export function projectLaunchManifestHash(manifest: ProjectLaunchManifestV1): Hex {
  return keccak256(stringToHex(serializeProjectLaunchManifest(manifest)));
}

function jsonValue(value: unknown): JsonValue {
  if (typeof value === "bigint") return value.toString();
  if (value === null || typeof value === "boolean" || typeof value === "number" || typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) return value.map(jsonValue);
  if (typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, jsonValue(child)]));
  }
  throw new TypeError(`Launch manifest cannot encode ${typeof value}`);
}

function sortJson(value: JsonValue): JsonValue {
  if (Array.isArray(value)) return value.map(sortJson);
  if (value !== null && typeof value === "object") {
    const record = value as { readonly [key: string]: JsonValue };
    return Object.fromEntries(
      Object.keys(record).sort().map((key) => [key, sortJson(record[key] as JsonValue)]),
    );
  }
  return value;
}

function assertReleaseReference(release: ProjectReleaseReference): void {
  if (!/^(0x)?(?:[0-9a-fA-F]{40}|[0-9a-fA-F]{64})$/.test(release.gitCommit)) {
    throw new RangeError("Release git commit must be a 20-byte or 32-byte commit hash");
  }
  if (!/^(0x)?[0-9a-fA-F]{64}$/.test(release.buildHash)) {
    throw new RangeError("Release build hash must be 32 bytes");
  }
  assertAddress(release.launcher, "Release Launcher");
  assertAddress(release.registry, "Release Registry");
}

function assertSameAddress(left: Address, right: Address, label: string): void {
  if (left.toLowerCase() !== right.toLowerCase()) {
    throw new Error(`Registry ${label} does not match the validated preflight`);
  }
}

function assertAddress(value: Address, label: string): void {
  if (!isAddress(value) || /^0x0{40}$/i.test(value)) {
    throw new RangeError(`${label} must be a valid nonzero address`);
  }
}

function assertBytes32(value: Hex, label: string): void {
  if (!isHex(value) || value.length !== 66) throw new RangeError(`${label} must be exactly 32 bytes`);
}
