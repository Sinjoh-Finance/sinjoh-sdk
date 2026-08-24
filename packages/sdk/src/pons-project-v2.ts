import {
  decodeFunctionData,
  encodeFunctionData,
  isAddress,
  type Address,
  type ContractFunctionArgs,
  type Hex,
  type PublicClient,
} from "viem";
import {
  sinjohPonsV2AdapterFactoryAbi,
  sinjohPonsV2ProjectAdapterAbi,
} from "@sinjoh/abis";

export {
  sinjohPonsV2AdapterFactoryAbi,
  sinjohPonsV2ProjectAdapterAbi,
} from "@sinjoh/abis";

export type PonsProjectLaunchRequest = ContractFunctionArgs<
  typeof sinjohPonsV2ProjectAdapterAbi,
  "payable",
  "launch"
>[0];

export interface PonsProjectLaunchTransaction {
  to: Address;
  data: Hex;
  value: bigint;
}

/** Token custody locations used before and after a Pons bonding curve graduates. */
export interface PonsGraduationCustody {
  curve: Address;
  locker: Address;
  poolManager: Address;
}

/**
 * Ensures Project V2 excludes every Pons custody address that can hold supply across graduation.
 * The adapter repeats this check onchain against the live Pons factory.
 */
export function assertPonsGraduationCustodyExclusions(parameters: {
  adapter: Address;
  request: PonsProjectLaunchRequest;
  graduationCustody: PonsGraduationCustody;
}): void {
  const required = [
    parameters.adapter,
    parameters.graduationCustody.curve,
    parameters.graduationCustody.locker,
    parameters.graduationCustody.poolManager,
  ];
  required.forEach((address, index) => {
    if (!isAddress(address) || /^0x0{40}$/i.test(address)) {
      throw new RangeError(`Pons custody address ${index + 1} must be a usable address`);
    }
  });
  if (new Set(required.map((address) => address.toLowerCase())).size !== required.length) {
    throw new RangeError("Pons adapter, curve, locker, and PoolManager must be distinct");
  }

  const exclusions = new Set(
    parameters.request.project.launchProfile.additionalCustodyExclusions
      .map((address) => address.toLowerCase()),
  );
  for (const address of required) {
    if (!exclusions.has(address.toLowerCase())) {
      throw new RangeError(`Missing Pons custody exclusion ${address}`);
    }
  }
}

/** Encodes the exact canonical adapter transaction that the creator wallet will sign. */
export function assemblePonsProjectLaunchTransaction(parameters: {
  adapter: Address;
  request: PonsProjectLaunchRequest;
  graduationCustody: PonsGraduationCustody;
  value: bigint;
}): PonsProjectLaunchTransaction {
  if (parameters.value < 0n) throw new RangeError("Launch transaction value cannot be negative");
  assertPonsGraduationCustodyExclusions(parameters);
  return {
    to: parameters.adapter,
    data: encodeFunctionData({
      abi: sinjohPonsV2ProjectAdapterAbi,
      functionName: "launch",
      args: [parameters.request],
    }),
    value: parameters.value,
  };
}

/**
 * Rejects any selector, tuple, target, or native-value mutation after assembly. This is intended
 * to run immediately before wallet submission, after simulation has succeeded.
 */
export function verifyPonsProjectLaunchTransaction(
  transaction: PonsProjectLaunchTransaction,
  expected: {
    adapter: Address;
    request: PonsProjectLaunchRequest;
    graduationCustody: PonsGraduationCustody;
    value: bigint;
  },
): void {
  if (transaction.to.toLowerCase() !== expected.adapter.toLowerCase()) {
    throw new Error("Project launch transaction target changed after assembly");
  }
  if (transaction.value !== expected.value) {
    throw new Error("Project launch transaction value changed after assembly");
  }
  const expectedData = assemblePonsProjectLaunchTransaction(expected).data;
  if (transaction.data.toLowerCase() !== expectedData.toLowerCase()) {
    throw new Error("Project launch transaction calldata changed after assembly");
  }
  const decoded = decodeFunctionData({
    abi: sinjohPonsV2ProjectAdapterAbi,
    data: transaction.data,
  });
  if (decoded.functionName !== "launch" || decoded.args?.length !== 1) {
    throw new Error("Project launch transaction does not decode to one canonical launch request");
  }
}

/** Simulates the exact verified payload from the same creator account that will submit it. */
export function simulatePonsProjectLaunchTransaction(
  client: PublicClient,
  account: Address,
  transaction: PonsProjectLaunchTransaction,
) {
  return client.call({
    account,
    to: transaction.to,
    data: transaction.data,
    value: transaction.value,
  });
}
