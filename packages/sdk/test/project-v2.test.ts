import assert from "node:assert/strict";
import test from "node:test";
import { decodeAbiParameters, type Address, type Hex } from "viem";
import {
  assemblePonsProjectLaunchTransaction,
  buildExistingTokenLaunchFromPreset,
  buildLaunchFromPreset,
  encodeProjectRouterSwapAndFundConfig,
  encodeProjectRouterSwapConfig,
  ProjectModuleKey,
  ProjectRouterActionType,
  predictProjectModuleAddress,
  projectLauncherV2Abi,
  projectRegistryV2Abi,
  verifyPonsProjectLaunchTransaction,
  type ProjectLaunchConfig,
} from "../src/index.js";

const zero = "0x0000000000000000000000000000000000000000" as Address;

function participantPreset(modules: { staking: boolean; airdrop: boolean; raffle: boolean }) {
  return {
    id: "participant-bound",
    protocolVersion: "2.0.0",
    config: {
      creator: zero,
      name: "",
      symbol: "",
      totalSupply: 0n,
      salt: `0x${"00".repeat(32)}`,
      governanceMode: 0,
      voteSource: 0,
      modules: {
        treasury: false,
        router: true,
        basket: false,
        fundingBands: false,
        liquidity: false,
        ...modules,
      },
      tokenAllocations: [],
      governance: {
        multisigSigners: [zero, zero, zero],
        tokenGovernance: {
          votingDelay: 3_600,
          votingPeriod: 259_200,
          proposalThresholdBps: 100,
          quorumBps: 1_000,
          timelockDelay: 86_400,
          referenceSupply: 0n,
        },
      },
      staking: { guardian: zero, lockDuration: 86_400n },
      airdrop: { attestor: zero, eligibilityMode: 0, additionalExclusions: [] },
      treasury: { basketAllocationBps: 0, basketRouteAssets: [] },
      routerRoutes: [],
      basket: {
        cadence: 0,
        eligibilityMode: 0,
        governanceUpdatesEnabled: false,
        burnTaxBps: 0,
        burnTaxDestination: 0,
        burnPriceSubject: 0n,
        airdropAccountConfig: "0x",
        allocation: { inputAssets: [], targets: [], swapLegs: [] },
      },
      basketERC4626Vaults: [],
      bands: {
        quoteAsset: zero,
        marketCapGuard: zero,
        positionAdapter: zero,
        twapWindow: 0,
        quoteUsdOracle: zero,
        confirmationPeriod: 0,
        maximumObservationAge: 0,
        integrationApprovalProof: [],
      },
      raffle: {
        creator: zero,
        attestor: zero,
        randomness: zero,
        prizeAsset: zero,
        protocolFeeRecipient: zero,
        taxRecipient: zero,
        tokensPerTicket: 1n,
        maxTicketsPerHolder: 1n,
        minPrize: 1n,
        maxPrize: 1n,
        prizeBps: 10_000,
        recipientTaxBps: 0,
        recycleTaxBps: 0,
        minConfirmations: 1,
        winnersPerRound: 1,
        minRoundInterval: 3_600,
        weightWindowBlocks: 1,
        randomnessTimeout: 3_600,
        claimWindow: 86_400,
        basis: 0,
        exclusions: [],
        stockRewards: [],
      },
      launchProfile: { canonicalPool: zero, additionalCustodyExclusions: [] },
      metadataURI: "",
    } as unknown as ProjectLaunchConfig,
  };
}

test("public SDK exports the canonical Project V2 launch and Registry ABIs", () => {
  assert.equal(projectLauncherV2Abi.some((item) => item.type === "function" && item.name === "launch"), true);
  assert.equal(projectRegistryV2Abi.some((item) => item.type === "function" && item.name === "project"), true);
});

test("exports immutable Project module keys and complete Router action values", () => {
  assert.match(ProjectModuleKey.ROUTER, /^0x[0-9a-f]{64}$/);
  assert.equal(ProjectRouterActionType.FUND_TREASURY, 6);
  assert.equal(ProjectRouterActionType.SWAP_AND_FUND_TREASURY, 8);
  assert.equal(ProjectRouterActionType.SWAP_AND_FUND_AIRDROP, 9);
  assert.equal(ProjectRouterActionType.SWAP_AND_FUND_RAFFLE, 10);
});

test("encodes Solidity-identical Project Router swap configurations", () => {
  const outputAsset = "0x0000000000000000000000000000000000009000" as Address;
  const proof = `0x${"12".repeat(32)}` as Hex;
  const swap = encodeProjectRouterSwapConfig({
    outputAsset,
    routeData: "0xaabb",
    approvalProof: [proof],
  });
  const [decodedSwap] = decodeAbiParameters(
    [{
      type: "tuple",
      components: [
        { name: "outputAsset", type: "address" },
        { name: "routeData", type: "bytes" },
        { name: "approvalProof", type: "bytes32[]" },
      ],
    }],
    swap,
  );
  assert.equal(decodedSwap.outputAsset, outputAsset);
  assert.equal(decodedSwap.routeData, "0xaabb");
  assert.deepEqual(decodedSwap.approvalProof, [proof]);

  const swapAndFund = encodeProjectRouterSwapAndFundConfig({
    outputAsset,
    routeData: "0xaabb",
    approvalProof: [proof],
    fundingConfig: "0xccdd",
  });
  const [decodedSwapAndFund] = decodeAbiParameters(
    [{
      type: "tuple",
      components: [
        { name: "outputAsset", type: "address" },
        { name: "routeData", type: "bytes" },
        { name: "approvalProof", type: "bytes32[]" },
        { name: "fundingConfig", type: "bytes" },
      ],
    }],
    swapAndFund,
  );
  assert.equal(decodedSwapAndFund.outputAsset, outputAsset);
  assert.equal(decodedSwapAndFund.fundingConfig, "0xccdd");
});

test("predicts a Project module through the canonical Launcher view", async () => {
  const calls: unknown[] = [];
  const expected = "0x0000000000000000000000000000000000007000" as Address;
  const client = {
    readContract: async (call: unknown) => {
      calls.push(call);
      return expected;
    },
  } as unknown as Parameters<typeof predictProjectModuleAddress>[0];
  const launcher = "0x0000000000000000000000000000000000007100" as Address;
  const creator = "0x0000000000000000000000000000000000007200" as Address;
  const salt = `0x${"34".repeat(32)}` as Hex;

  assert.equal(
    await predictProjectModuleAddress(
      client,
      launcher,
      creator,
      salt,
      ProjectModuleKey.ROUTER,
    ),
    expected,
  );
  assert.deepEqual(calls, [{
    address: launcher,
    abi: projectLauncherV2Abi,
    functionName: "predictModuleAddress",
    args: [creator, salt, ProjectModuleKey.ROUTER],
  }]);
});

test("materializes project participants from choices instead of platform policy", () => {
  const config = buildLaunchFromPreset(
    participantPreset({ staking: true, airdrop: true, raffle: true }),
    {
      creator: "0x0000000000000000000000000000000000001000",
      name: "Project",
      symbol: "PRJ",
      totalSupply: 10n,
      salt: `0x${"22".repeat(32)}`,
      tokenAllocations: [
        { recipient: "0x0000000000000000000000000000000000001000", amount: 10n },
      ],
      multisigSigners: [
        "0x0000000000000000000000000000000000003000",
        "0x0000000000000000000000000000000000001000",
        "0x0000000000000000000000000000000000002000",
      ],
      stakingGuardian: zero,
      airdropAttestor: "0x0000000000000000000000000000000000004000",
      raffleAttestor: "0x0000000000000000000000000000000000005000",
    },
  );

  assert.deepEqual(config.governance.multisigSigners, [
    "0x0000000000000000000000000000000000001000",
    "0x0000000000000000000000000000000000002000",
    "0x0000000000000000000000000000000000003000",
  ]);
  assert.equal(config.governance.tokenGovernance.referenceSupply, 10n);
  assert.equal(config.staking.guardian, zero);
  assert.equal(config.airdrop.attestor, "0x0000000000000000000000000000000000004000");
  assert.equal(config.raffle.attestor, "0x0000000000000000000000000000000000005000");
});

test("requires project participants only when their module is enabled", () => {
  assert.throws(() => buildLaunchFromPreset(
    participantPreset({ staking: false, airdrop: false, raffle: true }),
    {
      creator: "0x0000000000000000000000000000000000001000",
      name: "Project",
      symbol: "PRJ",
      totalSupply: 10n,
      salt: `0x${"33".repeat(32)}`,
      tokenAllocations: [
        { recipient: "0x0000000000000000000000000000000000001000", amount: 10n },
      ],
      multisigSigners: [
        "0x0000000000000000000000000000000000001000",
        "0x0000000000000000000000000000000000002000",
        "0x0000000000000000000000000000000000003000",
      ],
    },
  ), /Raffle attestor/);
});

test("builds an existing-token config with no Project allocation mint", () => {
  const config = buildExistingTokenLaunchFromPreset(
    participantPreset({ staking: true, airdrop: true, raffle: true }),
    {
      creator: "0x0000000000000000000000000000000000001000",
      name: "Pons Project",
      symbol: "PONS",
      totalSupply: 1_000_000n,
      salt: `0x${"44".repeat(32)}`,
      multisigSigners: [
        "0x0000000000000000000000000000000000003000",
        "0x0000000000000000000000000000000000001000",
        "0x0000000000000000000000000000000000002000",
      ],
      stakingGuardian: zero,
      airdropAttestor: "0x0000000000000000000000000000000000004000",
      raffleAttestor: "0x0000000000000000000000000000000000005000",
    },
  );

  assert.deepEqual(config.tokenAllocations, []);
  assert.equal(config.governance.tokenGovernance.referenceSupply, 1_000_000n);
  assert.deepEqual(config.governance.multisigSigners, [
    "0x0000000000000000000000000000000000001000",
    "0x0000000000000000000000000000000000002000",
    "0x0000000000000000000000000000000000003000",
  ]);
});

test("keeps direct-launch allocation validation separate from existing-token launches", () => {
  const choices = {
    creator: "0x0000000000000000000000000000000000001000" as Address,
    name: "Project",
    symbol: "PRJ",
    totalSupply: 10n,
    salt: `0x${"55".repeat(32)}` as `0x${string}`,
    multisigSigners: [
      "0x0000000000000000000000000000000000001000",
      "0x0000000000000000000000000000000000002000",
      "0x0000000000000000000000000000000000003000",
    ] as const,
  };

  assert.throws(
    () => buildLaunchFromPreset(
      participantPreset({ staking: false, airdrop: false, raffle: false }),
      { ...choices, tokenAllocations: [] },
    ),
    /between 1 and 16/,
  );
  assert.deepEqual(
    buildExistingTokenLaunchFromPreset(
      participantPreset({ staking: false, airdrop: false, raffle: false }),
      choices,
    ).tokenAllocations,
    [],
  );
});

test("materializes creator-bound SEND route placeholders", () => {
  const preset = participantPreset({ staking: false, airdrop: false, raffle: false });
  preset.config = {
    ...preset.config,
    routerRoutes: [{
      inputAsset: "0x0000000000000000000000000000000000009000",
      actions: [{
        actionType: 0,
        allocationBps: 10_000,
        recipient: zero,
        adapter: zero,
        priceGuard: zero,
        actionConfig: "0x",
      }],
    }],
  } as ProjectLaunchConfig;
  const config = buildExistingTokenLaunchFromPreset(preset, {
    creator: "0x0000000000000000000000000000000000001000",
    name: "Project",
    symbol: "PRJ",
    totalSupply: 10n,
    salt: `0x${"66".repeat(32)}`,
    multisigSigners: [
      "0x0000000000000000000000000000000000001000",
      "0x0000000000000000000000000000000000002000",
      "0x0000000000000000000000000000000000003000",
    ],
  });
  assert.equal(
    config.routerRoutes[0]!.actions[0]!.recipient,
    "0x0000000000000000000000000000000000001000",
  );
});

test("verifies the exact assembled canonical adapter payload", () => {
  const adapter = "0x0000000000000000000000000000000000008000" as Address;
  const graduationCustody = {
    curve: "0x0000000000000000000000000000000000008100",
    locker: "0x0000000000000000000000000000000000008200",
    poolManager: "0x0000000000000000000000000000000000008300",
  } as const;
  const baseConfig = buildExistingTokenLaunchFromPreset(
    participantPreset({ staking: false, airdrop: false, raffle: false }),
    {
      creator: "0x0000000000000000000000000000000000001000",
      name: "Project",
      symbol: "PRJ",
      totalSupply: 10n,
      salt: `0x${"77".repeat(32)}`,
      multisigSigners: [
        "0x0000000000000000000000000000000000001000",
        "0x0000000000000000000000000000000000002000",
        "0x0000000000000000000000000000000000003000",
      ],
    },
  );
  const config = {
    ...baseConfig,
    launchProfile: {
      ...baseConfig.launchProfile,
      additionalCustodyExclusions: [
        adapter,
        graduationCustody.curve,
        graduationCustody.locker,
        graduationCustody.poolManager,
      ],
    },
  } as ProjectLaunchConfig;
  const request = {
    token: {
      name: "Project",
      symbol: "PRJ",
      logo: "",
      description: "",
      socials: { twitter: "", telegram: "", discord: "", website: "", farcaster: "" },
      creatorFeeRecipient: "0x0000000000000000000000000000000000008000",
      creatorTaxBps: 0,
      buybackEnabled: false,
      expectedEconomics: `0x${"88".repeat(32)}`,
      salt: `0x${"77".repeat(32)}`,
    },
    launchConfigId: 0n,
    pairToken: zero,
    developerBuy: 0n,
    minTokensOut: 0n,
    snipeTaxExemptions: [],
    project: config,
    launchpadApprovalProof: [],
  } as const;
  const transaction = assemblePonsProjectLaunchTransaction({
    adapter,
    request,
    graduationCustody,
    value: 1n,
  });
  assert.doesNotThrow(() => verifyPonsProjectLaunchTransaction(transaction, {
    adapter,
    request,
    graduationCustody,
    value: 1n,
  }));
  assert.throws(() => verifyPonsProjectLaunchTransaction(
    { ...transaction, value: 2n },
    {
      adapter,
      request,
      graduationCustody,
      value: 1n,
    },
  ), /value changed/);
  assert.throws(() => assemblePonsProjectLaunchTransaction({
    adapter,
    request: {
      ...request,
      project: {
        ...config,
        launchProfile: {
          ...config.launchProfile,
          additionalCustodyExclusions: [
            adapter,
            graduationCustody.curve,
            graduationCustody.locker,
          ],
        },
      },
    },
    graduationCustody,
    value: 1n,
  }), /Missing Pons custody exclusion 0x0000000000000000000000000000000000008300/);
});
