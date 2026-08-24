import {
  decodeFunctionData,
  encodeFunctionData,
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

/** Encodes the exact canonical adapter transaction that the creator wallet will sign. */
export function assemblePonsProjectLaunchTransaction(parameters: {
  adapter: Address;
  request: PonsProjectLaunchRequest;
  value: bigint;
}): PonsProjectLaunchTransaction {
  if (parameters.value < 0n) throw new RangeError("Launch transaction value cannot be negative");
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
