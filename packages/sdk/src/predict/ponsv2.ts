import {
  encodeAbiParameters, encodeFunctionData, getAddress, parseAbi,
  type Address, type Hex, type PublicClient
} from "viem";

/**
 * Pre-launch prediction of a Pons v2 launch's token and curve addresses, and
 * the raffle exclusion list built from them.
 *
 * A raffle's exclusion list is immutable and must name the bonding curve — the
 * dominant holder in every pre-graduation snapshot — but the curve exists only
 * after the launch. CREATE2 resolves the ordering: both addresses derive from
 * the launch parameters, so the flow predicts here, deploys the raffle around
 * the prediction, and only then launches.
 *
 * The assembly mirrors `PonsV2LaunchFactory._launchToken` and the Solidity
 * twin `PonsV2LaunchPrediction.sol`, which a mainnet-fork test proves equal to
 * a real launch. The CREATE2 derivation itself always executes on the deployed
 * deployer via `eth_call`; the only thing this module can get wrong is the
 * struct encoding, which `ponsv2-predict.test.ts` pins byte-for-byte against a
 * fixture generated from the Solidity ABI.
 *
 * A prediction holds only while the factory's owner-tunable terms hold. Every
 * launch must pin `expectedEconomics = previewLaunchEconomics(...)` so a launch
 * whose terms moved after prediction reverts instead of landing on an
 * unpredicted curve address.
 */

export const ponsV2FactoryPredictionAbi = parseAbi([
  "function launchDeployer() view returns (address)",
  "function memeHook() view returns (address)",
  "function feeEscrow() view returns (address)",
  "function buybackVault() view returns (address)",
  "function poolManager() view returns (address)",
  "function getLaunchConfig(uint256 id) view returns ((uint256 supply,uint256 curveFeeBps,uint256 phantomQuote,uint256 graduationThreshold,uint24 poolFee,int24 tickSpacing,bool enabled))",
  "function pairTokenEconomics(address pairToken) view returns (uint256 phantomQuote,uint256 graduationThreshold,uint8 decimals)",
  "function previewLaunchEconomics(uint256 launchConfigId,address pairToken) view returns (bytes32)",
  "function launchFee() view returns (uint256)"
]);

export const ponsV2MemeHookAbi = parseAbi([
  "function currentFeePolicy() view returns ((address protocolFeeRecipient,uint16 protocolFeeShareBps,uint16 buybackBurnBps,uint16 hookFeeBps,uint16 maxInternalPriceImpactBps))"
]);

export const ponsV2LaunchDeployerAbi = parseAbi([
  "function predictLaunchAddresses((address pairToken,address creatorFeeRecipient,address originalDeployer,address feePolicy,(address protocolFeeRecipient,uint16 protocolFeeShareBps,uint16 buybackBurnBps,uint16 hookFeeBps,uint16 maxInternalPriceImpactBps) policy,address feeEscrow,address buybackVault,uint256 phantomQuote,uint256 curveFeeBps,uint256 creatorTaxBps,bool buybackEnabled,uint256 graduationThreshold,uint256 supply,bytes32 salt,string name,string symbol,string logo,string description,(string twitter,string telegram,string discord,string website,string farcaster) socials) params) view returns (address token,address curve)",
  "function predictProjectLaunchAddresses((address pairToken,address creatorFeeRecipient,address originalDeployer,address feePolicy,(address protocolFeeRecipient,uint16 protocolFeeShareBps,uint16 buybackBurnBps,uint16 hookFeeBps,uint16 maxInternalPriceImpactBps) policy,address feeEscrow,address buybackVault,uint256 phantomQuote,uint256 curveFeeBps,uint256 creatorTaxBps,bool buybackEnabled,uint256 graduationThreshold,uint256 supply,bytes32 salt,string name,string symbol,string logo,string description,(string twitter,string telegram,string discord,string website,string farcaster) socials) params,bytes projectTokenData) view returns (address token,address curve)"
]);

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

export interface PonsV2Socials {
  twitter: string;
  telegram: string;
  discord: string;
  website: string;
  farcaster: string;
}

export interface PonsV2TokenParams {
  name: string;
  symbol: string;
  logo: string;
  description: string;
  socials: PonsV2Socials;
  creatorFeeRecipient: Address;
  creatorTaxBps: number;
  buybackEnabled: boolean;
  salt: Hex;
}

export interface PonsV2FeePolicySnapshot {
  protocolFeeRecipient: Address;
  protocolFeeShareBps: number;
  buybackBurnBps: number;
  hookFeeBps: number;
  maxInternalPriceImpactBps: number;
}

export interface PonsV2LaunchDeployment {
  pairToken: Address;
  creatorFeeRecipient: Address;
  originalDeployer: Address;
  feePolicy: Address;
  policy: PonsV2FeePolicySnapshot;
  feeEscrow: Address;
  buybackVault: Address;
  phantomQuote: bigint;
  curveFeeBps: bigint;
  creatorTaxBps: bigint;
  buybackEnabled: boolean;
  graduationThreshold: bigint;
  supply: bigint;
  salt: Hex;
  name: string;
  symbol: string;
  logo: string;
  description: string;
  socials: PonsV2Socials;
}

export interface PonsV2ProjectTokenDeploymentData {
  tokenFactory: Address;
  registry: Address;
  votingExclusionConfigurator: Address;
  votingExclusions: readonly Address[];
}

/**
 * Mirrors `PonsV2LaunchFactory._launchToken`'s construction of the deployment
 * struct from live factory state. `originalDeployer` is the account that will
 * initiate the launch at the factory: the launchpad adapter for adapter-owned
 * launches (itself predictable via `SinjohPonsV2AdapterFactory.predictAddress`),
 * or whichever router or EOA calls `launchToken` directly.
 */
export async function assembleLaunchDeployment(client: PublicClient, args: {
  factory: Address;
  params: PonsV2TokenParams;
  launchConfigId: bigint;
  pairToken: Address;
  originalDeployer: Address;
}): Promise<PonsV2LaunchDeployment> {
  const factory = { address: args.factory, abi: ponsV2FactoryPredictionAbi } as const;
  const [config, memeHook, feeEscrow, buybackVault] = await Promise.all([
    client.readContract({ ...factory, functionName: "getLaunchConfig", args: [args.launchConfigId] }),
    client.readContract({ ...factory, functionName: "memeHook" }),
    client.readContract({ ...factory, functionName: "feeEscrow" }),
    client.readContract({ ...factory, functionName: "buybackVault" }),
  ]);
  const policy = await client.readContract({
    address: memeHook, abi: ponsV2MemeHookAbi, functionName: "currentFeePolicy",
  });

  let phantomQuote = config.phantomQuote;
  let graduationThreshold = config.graduationThreshold;
  if (args.pairToken !== ZERO_ADDRESS) {
    // An ERC-20 quote asset prices in its own decimals, so it carries its own
    // phantom reserve and threshold.
    const [pairPhantom, pairThreshold] = await client.readContract({
      ...factory, functionName: "pairTokenEconomics", args: [args.pairToken],
    });
    phantomQuote = pairPhantom;
    graduationThreshold = pairThreshold;
  }

  return {
    pairToken: args.pairToken,
    // The factory substitutes the initiating account for a zero recipient, and
    // the recipient is a curve constructor argument, so the substitution
    // changes the predicted address.
    creatorFeeRecipient: args.params.creatorFeeRecipient === ZERO_ADDRESS
      ? args.originalDeployer
      : args.params.creatorFeeRecipient,
    originalDeployer: args.originalDeployer,
    feePolicy: memeHook,
    policy: {
      protocolFeeRecipient: policy.protocolFeeRecipient,
      protocolFeeShareBps: policy.protocolFeeShareBps,
      buybackBurnBps: policy.buybackBurnBps,
      hookFeeBps: policy.hookFeeBps,
      maxInternalPriceImpactBps: policy.maxInternalPriceImpactBps,
    },
    feeEscrow,
    buybackVault,
    phantomQuote,
    curveFeeBps: config.curveFeeBps,
    creatorTaxBps: BigInt(args.params.creatorTaxBps),
    buybackEnabled: args.params.buybackEnabled,
    graduationThreshold,
    supply: config.supply,
    salt: args.params.salt,
    name: args.params.name,
    symbol: args.params.symbol,
    logo: args.params.logo,
    description: args.params.description,
    socials: args.params.socials,
  };
}

/** The exact eth_call payload; exposed so the fixture test can pin the bytes. */
export function encodePredictionCall(deployment: PonsV2LaunchDeployment): Hex {
  return encodeFunctionData({
    abi: ponsV2LaunchDeployerAbi,
    functionName: "predictLaunchAddresses",
    args: [deployment],
  });
}

/** Predicts token and curve by running the deployed deployer's own derivation. */
export async function predictLaunchAddresses(client: PublicClient, args: {
  factory: Address;
  params: PonsV2TokenParams;
  launchConfigId: bigint;
  pairToken: Address;
  originalDeployer: Address;
}): Promise<{ token: Address; curve: Address; deployment: PonsV2LaunchDeployment }> {
  const deployment = await assembleLaunchDeployment(client, args);
  const launchDeployer = await client.readContract({
    address: args.factory, abi: ponsV2FactoryPredictionAbi, functionName: "launchDeployer",
  });
  const [token, curve] = await client.readContract({
    address: launchDeployer,
    abi: ponsV2LaunchDeployerAbi,
    functionName: "predictLaunchAddresses",
    args: [deployment],
  });
  return { token, curve, deployment };
}

/** Predicts the canonical Project-token variant used by the atomic Pons Project V2 adapter. */
export async function predictProjectLaunchAddresses(client: PublicClient, args: {
  factory: Address;
  params: PonsV2TokenParams;
  launchConfigId: bigint;
  pairToken: Address;
  originalDeployer: Address;
  project: PonsV2ProjectTokenDeploymentData;
}): Promise<{
  token: Address;
  curve: Address;
  deployment: PonsV2LaunchDeployment;
  projectTokenData: Hex;
}> {
  const deployment = await assembleLaunchDeployment(client, args);
  const launchDeployer = await client.readContract({
    address: args.factory,
    abi: ponsV2FactoryPredictionAbi,
    functionName: "launchDeployer",
  });
  const projectTokenData = encodeAbiParameters(
    [{
      type: "tuple",
      components: [
        { name: "tokenFactory", type: "address" },
        { name: "registry", type: "address" },
        { name: "votingExclusionConfigurator", type: "address" },
        { name: "votingExclusions", type: "address[]" },
      ],
    }],
    [args.project],
  );
  const [token, curve] = await client.readContract({
    address: launchDeployer,
    abi: ponsV2LaunchDeployerAbi,
    functionName: "predictProjectLaunchAddresses",
    args: [deployment, projectTokenData],
  });
  return { token, curve, deployment, projectTokenData };
}

/**
 * The complete configured exclusion list a raffle over this launch requires:
 * the predicted curve plus every static Pons v2 contract that holds subject
 * tokens (factory during the Swept phase, the V4 PoolManager after graduation,
 * the buyback vault's five-year vest, the hook's transient balances). Sorted
 * ascending and unique, which is the raffle's canonical-configuration rule.
 * Zero, dEaD, the raffle, and the subject are excluded on-chain automatically.
 */
export async function raffleExclusionsForLaunch(client: PublicClient, args: {
  factory: Address;
  curve: Address;
  /** Additional recommended exclusions, e.g. the launch adapter. */
  extra?: readonly Address[];
}): Promise<Address[]> {
  const factory = { address: args.factory, abi: ponsV2FactoryPredictionAbi } as const;
  const [poolManager, buybackVault, memeHook] = await Promise.all([
    client.readContract({ ...factory, functionName: "poolManager" }),
    client.readContract({ ...factory, functionName: "buybackVault" }),
    client.readContract({ ...factory, functionName: "memeHook" }),
  ]);
  const unique = [...new Set(
    [args.curve, args.factory, poolManager, buybackVault, memeHook, ...(args.extra ?? [])]
      .map((value) => getAddress(value)),
  )];
  return unique.sort((a, b) => (BigInt(a) < BigInt(b) ? -1 : 1));
}
