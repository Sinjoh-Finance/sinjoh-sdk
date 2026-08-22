import assert from "node:assert/strict";
import { test } from "node:test";
import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import type { Address, Hex, PublicClient } from "viem";
import { SinjohApiError, type SinjohApiClient, type SinjohApiClientV2_1 } from "@sinjoh/sdk";
import {
  createSinjohAgentServer,
  type SinjohWalletExecutor,
} from "../src/server.js";
import { errorResult } from "../src/serialize.js";

const ROUTER = "0x00000000000000000000000000000000000000aa" as Address;
const WETH = "0x00000000000000000000000000000000000000e1" as Address;
const SUBJECT = "0x00000000000000000000000000000000000000e2" as Address;
const ZERO = "0x0000000000000000000000000000000000000000" as Address;

/** A quiet single-bucket router, keyed the same way as the SDK planner tests. */
interface ChainHooks {
  onRead?: (args: { functionName: string; args?: readonly unknown[] }) => void;
  onCall?: (args: { account?: Address; to?: Address; data?: Hex; value?: bigint }) => void;
  onWait?: (hash: Hex) => void;
}

function stubChain(hooks: ChainHooks = {}): PublicClient {
  const routes: Record<string, unknown> = {
    "creator": ZERO,
    "protocolFeeRecipient": ZERO,
    "weth": WETH,
    "launchpadAdapter": ZERO,
    "subject": SUBJECT,
    "configHash": `0x${"11".repeat(32)}`,
    "initialized": true,
    "bound": true,
    "intakeAssetCount": 1n,
    "intakeAsset:[0]": [{ kind: 1, token: WETH }, WETH],
    "bucketCount": 1,
    "bucketInfo:[0]": [{ kind: 1, token: WETH }, WETH, 10000, 0n, 1n],
    "allocationInfo:[0,0]": [SUBJECT, 10000, false, false, "0x"],
    [`unaccountedBalance:["${WETH}"]`]: 41n,
    [`protocolOwed:["${WETH}"]`]: 0n,
    [`walletOwed:["${SUBJECT}","${WETH}"]`]: 0n
  };
  return {
    chain: { id: 4663 },
    readContract: async (args: { functionName: string; args?: readonly unknown[] }) => {
      hooks.onRead?.(args);
      if (args.functionName === "minimumOutput") return [12n, 1234];
      const key = args.args === undefined || args.args.length === 0
        ? args.functionName
        : `${args.functionName}:${JSON.stringify(args.args, (_, v) =>
          typeof v === "bigint" ? Number(v) : v)}`;
      if (key in routes) return routes[key];
      throw new Error(`unexpected read ${key}`);
    },
    call: async (args: { account?: Address; to?: Address; data?: Hex; value?: bigint }) => {
      hooks.onCall?.(args);
      return { data: "0x" };
    },
    waitForTransactionReceipt: async ({ hash }: { hash: Hex }) => {
      hooks.onWait?.(hash);
      return { status: "success", transactionHash: hash, blockNumber: 123n };
    },
  } as unknown as PublicClient;
}

async function connectedClient(
  hooks: ChainHooks = {},
  wallet?: SinjohWalletExecutor,
  apiOverrides: Partial<SinjohApiClientV2_1> = {},
): Promise<Client> {
  const server = createSinjohAgentServer({
    client: stubChain(hooks),
    manifest: {
      chainId: 4663,
      contracts: {
        raffleFactory: {
          address: "0xD030064fB83d14C97c22A6B63bF376552eBA7112" as Address
        }
      },
      dependencies: {
        weth: { address: WETH },
      },
      roles: {
        deployer: { address: ZERO, kind: "eoa" },
        governance: { address: SUBJECT, kind: "eoa" },
      },
    },
    api: {
      index: async () => ({
        service: "sinjoh-api", version: "1.0.0", chainId: 4663,
        network: "Robinhood Chain mainnet", auth: "keyless", endpoints: {},
        docs: "https://example.test/docs", openapi: "https://example.test/openapi",
        supportedLaunchpads: ["flap"],
      }),
      listLaunches: async () => ({
        chainId: 4663,
        launches: [],
        page: { number: 1, size: 25, hasMore: false },
      }),
      getLaunchRegistryHealth: async () => ({
        chainId: 4663,
        registry: { ok: true, indexed: 1 },
      }),
      getLaunchImageHealth: async () => ({
        chainId: 4663,
        images: { ok: true, registered: 1, canonical: 1, missing: 0 },
      }),
      ...apiOverrides,
    } as unknown as SinjohApiClient,
    ...(wallet === undefined ? {} : { wallet }),
  });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test", version: "0.0.1" });
  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport)
  ]);
  return client;
}

function text(result: unknown): string {
  const content = (result as { content: { type: string; text: string }[] }).content;
  assert.ok(content.length > 0);
  return content[0]!.text;
}

test("exposes the full read/plan/validate tool surface", async () => {
  const client = await connectedClient();
  const { tools } = await client.listTools();
  const names = tools.map((tool) => tool.name).sort();
  assert.deepEqual(names, [
    "sinjoh_api_capabilities", "sinjoh_check_activation", "sinjoh_decode_error",
    "sinjoh_discover", "sinjoh_get", "sinjoh_history", "sinjoh_image_health",
    "sinjoh_manifest",
    "sinjoh_plan_flap_launch", "sinjoh_plan_letscash_integration",
    "sinjoh_plan_ponsv2_launch", "sinjoh_plan_router_work", "sinjoh_preflight_guard",
    "sinjoh_prepare_launch_image", "sinjoh_publish_launch_image",
    "sinjoh_registry_health", "sinjoh_router_snapshot", "sinjoh_validate_config", "sinjoh_verify_manifest",
    "sinjoh_wallet_activity"
  ]);
  for (const tool of tools) {
    assert.ok((tool.description ?? "").length > 40, `${tool.name} is documented`);
  }
  for (const name of ["sinjoh_api_capabilities", "sinjoh_discover", "sinjoh_get", "sinjoh_history", "sinjoh_wallet_activity"]) {
    const tool = tools.find((candidate) => candidate.name === name);
    assert.equal(tool?.annotations?.readOnlyHint, true, `${name} is annotated read-only`);
  }
  await client.close();
});

test("MCP prepares and publishes the exact signed launch image payload", async () => {
  let published: Parameters<SinjohApiClientV2_1["publishLaunchImage"]>[0] | undefined;
  const client = await connectedClient({}, undefined, {
    publishLaunchImage: async (input) => {
      published = input;
      return {
        chainId: 4663,
        subject: input.subject as Address,
        image: {
          url: "https://example.supabase.co/token.png",
          sha256: input.authorization.imageSha256,
          mimeType: input.authorization.imageMimeType,
          bytes: input.authorization.imageBytes,
          width: 32,
          height: 32,
          source: "signed",
          sourceUrl: null,
          launchpad: "pons-v2",
          storedAt: "2026-08-22T12:00:00.000Z",
        },
      };
    },
  });
  const png = Uint8Array.from(
    atob("iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAACXBIWXMAAAABAAAAAQBPJcTWAAAAEElEQVR4nGP8wwACLGCSAQANBAECv1AVswAAAABJRU5ErkJggg=="),
    (value) => value.charCodeAt(0),
  );
  const image = Buffer.from(png).toString("base64");
  const preparedResult = await client.callTool({
    name: "sinjoh_prepare_launch_image",
    arguments: {
      subject: SUBJECT,
      creator: ROUTER,
      imageBase64: image,
      issuedAt: 1_800_000_000,
      lifetimeSeconds: 300,
    },
  });
  const prepared = JSON.parse(text(preparedResult));
  assert.equal(prepared.authorization.subject.toLowerCase(), SUBJECT.toLowerCase());
  assert.equal(prepared.authorization.creator.toLowerCase(), ROUTER.toLowerCase());
  assert.equal(prepared.authorization.imageMimeType, "image/png");
  assert.equal(prepared.typedData.primaryType, "LaunchImageAuthorization");

  const signature = `0x${"11".repeat(65)}`;
  const publishedResult = await client.callTool({
    name: "sinjoh_publish_launch_image",
    arguments: {
      subject: SUBJECT,
      imageBase64: image,
      authorization: prepared.authorization,
      signature,
    },
  });
  assert.equal(publishedResult.isError, undefined);
  assert.equal(published?.subject, SUBJECT);
  assert.equal(published?.signature, signature);
  assert.equal(published?.authorization.imageSha256, prepared.authorization.imageSha256);
  await client.close();
});

test("MCP fails clearly when an injected 2.0 API client lacks image capabilities", async () => {
  const client = await connectedClient({}, undefined, {
    getLaunchImageHealth: undefined,
    publishLaunchImage: undefined,
  } as unknown as Partial<SinjohApiClientV2_1>);
  const result = await client.callTool({ name: "sinjoh_image_health", arguments: {} });
  assert.equal(result.isError, true);
  assert.match(text(result), /does not support launch image health/);
  await client.close();
});

test("public API MCP tools return structured content", async () => {
  const client = await connectedClient();
  const result = await client.callTool({ name: "sinjoh_api_capabilities", arguments: {} });
  assert.equal(JSON.parse(text(result)).service, "sinjoh-api");
  assert.equal((result.structuredContent as { chainId?: number } | undefined)?.chainId, 4663);

  const launches = await client.callTool({
    name: "sinjoh_discover",
    arguments: { resource: "launches", limit: 10 },
  });
  assert.deepEqual(JSON.parse(text(launches)).launches, []);
  await client.close();
});

test("MCP errors preserve API status, code, and request identity", () => {
  const result = errorResult(new SinjohApiError(429, "rate_limited", "slow down", "request-7"));
  assert.deepEqual(result.structuredContent, {
    name: "SinjohApiError",
    message: "slow down",
    status: 429,
    code: "rate_limited",
    requestId: "request-7",
  });
  assert.doesNotThrow(() => JSON.stringify(result));
});

test("manifest lookup returns entries and rejects unknown keys", async () => {
  const client = await connectedClient();
  const all = JSON.parse(text(await client.callTool({
    name: "sinjoh_manifest", arguments: {}
  })));
  assert.deepEqual(all, {
    chainId: 4663,
    keys: ["raffleFactory", "dependencies.weth", "roles.deployer", "roles.governance"],
  });

  const dependency = JSON.parse(text(await client.callTool({
    name: "sinjoh_manifest", arguments: { key: "dependencies.weth" }
  })));
  assert.equal(dependency.address, WETH);
  const role = JSON.parse(text(await client.callTool({
    name: "sinjoh_manifest", arguments: { key: "roles.deployer" }
  })));
  assert.equal(role.kind, "eoa");

  const missing = await client.callTool({
    name: "sinjoh_manifest", arguments: { key: "nope" }
  });
  assert.equal(missing.isError, true);
  await client.close();
});

test("plan_router_work serializes amounts as decimal strings in every MCP payload", async () => {
  const client = await connectedClient();
  const result = await client.callTool({
    name: "sinjoh_plan_router_work", arguments: { router: ROUTER }
  });
  const plan = JSON.parse(text(result));
  assert.equal(plan.actions.length, 1);
  assert.equal(plan.actions[0].kind, "sync");
  assert.equal(plan.actions[0].amount, "41", "bigint crossed the wire as a decimal string");
  assert.equal(plan.router.subject, SUBJECT);
  assert.doesNotThrow(() => JSON.stringify(result), "the stdio transport can serialize structuredContent");
  assert.equal(
    (result.structuredContent as { actions: Array<{ amount: string }> }).actions[0]?.amount,
    "41",
  );
  await client.close();
});

test("preflight_guard forwards the route hash and guard data", async () => {
  let minimumOutputArgs: readonly unknown[] | undefined;
  const client = await connectedClient({ onRead: (args) => {
    if (args.functionName === "minimumOutput") minimumOutputArgs = args.args;
  }});
  const routeHash = `0x${"ab".repeat(32)}`;
  const result = JSON.parse(text(await client.callTool({
    name: "sinjoh_preflight_guard",
    arguments: {
      guard: ZERO,
      subject: SUBJECT,
      assetIn: SUBJECT,
      assetOut: WETH,
      amountIn: "99",
      routeHash,
      guardData: "0x1234"
    }
  })));
  assert.deepEqual(result, { status: "ok", minOut: "12", validUntil: 1234 });
  assert.deepEqual(minimumOutputArgs, [SUBJECT, SUBJECT, WETH, 99n, routeHash, "0x1234"]);
  await client.close();
});

test("host wallet execution simulates before signing and can wait for a receipt", async () => {
  const steps: string[] = [];
  const hash = `0x${"42".repeat(32)}` as Hex;
  const client = await connectedClient({
    onCall: () => steps.push("simulate"),
    onWait: (seenHash) => {
      assert.equal(seenHash, hash);
      steps.push("receipt");
    },
  }, {
    account: SUBJECT,
    chainId: 4663,
    sendTransaction: async ({ account, chainId, to, data, value }) => {
      assert.equal(account, SUBJECT);
      assert.equal(chainId, 4663);
      assert.equal(to, ROUTER);
      assert.equal(data, "0x1234");
      assert.equal(value, 7n);
      steps.push("sign");
      return hash;
    },
  });

  const { tools } = await client.listTools();
  const execute = tools.find((tool) => tool.name === "sinjoh_execute_transaction");
  assert.equal(execute?.annotations?.readOnlyHint, false);
  assert.equal(execute?.annotations?.destructiveHint, true);
  assert.equal(execute?.annotations?.idempotentHint, false);

  const wireResult = await client.callTool({
    name: "sinjoh_execute_transaction",
    arguments: { to: ROUTER, data: "0x1234", value: "7", waitForReceipt: true },
  });
  const result = JSON.parse(text(wireResult));
  assert.equal(result.transactionHash, hash);
  assert.equal(result.status, "confirmed");
  assert.equal(result.receipt.status, "success");
  assert.equal(result.receipt.blockNumber, "123");
  assert.doesNotThrow(() => JSON.stringify(wireResult), "confirmed receipts are safe on stdio");
  assert.deepEqual(steps, ["simulate", "sign", "receipt"]);
  await client.close();
});

test("wallet execution refuses account changes between simulation and signing", async () => {
  let signed = false;
  const wallet: SinjohWalletExecutor = {
    account: SUBJECT,
    chainId: 4663,
    sendTransaction: async () => {
      signed = true;
      return `0x${"44".repeat(32)}` as Hex;
    },
  };
  const client = await connectedClient({
    onCall: () => { wallet.account = WETH; },
  }, wallet);
  const result = await client.callTool({
    name: "sinjoh_execute_transaction",
    arguments: { to: ROUTER, data: "0x1234" },
  });
  assert.equal(result.isError, true);
  assert.equal(signed, false);
  await client.close();
});

test("wallet execution rejects a public client bound to another chain", () => {
  const client = stubChain();
  Object.assign(client, { chain: { id: 999 } });
  assert.throws(() => createSinjohAgentServer({
    client,
    manifest: { chainId: 4663, contracts: {} },
    wallet: {
      account: SUBJECT,
      chainId: 4663,
      sendTransaction: async () => `0x${"45".repeat(32)}` as Hex,
    },
  }), /client chain 999/);
});

test("registry health and fee-router filtering are exposed through MCP", async () => {
  const feeRouter = ROUTER;
  let seenFeeRouter: string | undefined;
  const server = createSinjohAgentServer({
    client: stubChain(),
    manifest: { chainId: 4663, contracts: {} },
    api: {
      listLaunches: async (options: Parameters<SinjohApiClient["listLaunches"]>[0]) => {
        seenFeeRouter = options?.feeRouter;
        return { chainId: 4663, launches: [], page: { number: 1, size: 25, hasMore: false } };
      },
      getLaunchRegistryHealth: async () => ({
        chainId: 4663,
        registry: { ok: false, missing: 1 },
      }),
    } as unknown as SinjohApiClient,
  });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test", version: "0.0.1" });
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  await client.callTool({
    name: "sinjoh_discover",
    arguments: { resource: "launches", feeRouter },
  });
  assert.equal(seenFeeRouter, feeRouter);
  const health = JSON.parse(text(await client.callTool({
    name: "sinjoh_registry_health", arguments: {},
  })));
  assert.equal(health.registry.ok, false);
  await client.close();
});

test("wallet execution never signs a reverting simulation", async () => {
  let signed = false;
  const client = await connectedClient({
    onCall: () => { throw new Error("execution reverted"); },
  }, {
    account: SUBJECT,
    chainId: 4663,
    sendTransaction: async () => {
      signed = true;
      return `0x${"42".repeat(32)}` as Hex;
    },
  });

  const result = await client.callTool({
    name: "sinjoh_execute_transaction",
    arguments: { to: ROUTER, data: "0x1234" },
  });
  assert.equal(result.isError, true);
  assert.equal(signed, false);
  await client.close();
});

test("receipt polling failure returns the submitted hash to prevent duplicate signing", async () => {
  const hash = `0x${"43".repeat(32)}` as Hex;
  const client = await connectedClient({
    onWait: () => { throw new Error("receipt timeout"); },
  }, {
    account: SUBJECT,
    chainId: 4663,
    sendTransaction: async () => hash,
  });

  const result = await client.callTool({
    name: "sinjoh_execute_transaction",
    arguments: { to: ROUTER, data: "0x1234", waitForReceipt: true },
  });
  const body = JSON.parse(text(result));
  assert.notEqual(result.isError, true);
  assert.equal(body.status, "submitted");
  assert.equal(body.transactionHash, hash);
  assert.equal(body.receiptError, "receipt timeout");
  await client.close();
});

test("validate_config round-trips the raffle golden fixture offline", async () => {
  const client = await connectedClient();
  const result = JSON.parse(text(await client.callTool({
    name: "sinjoh_validate_config",
    arguments: {
      kind: "raffle",
      config: {
        creator: "0x000000000000000000000000000000000000ab01",
        attestor: "0x000000000000000000000000000000000000ab02",
        randomness: "0x000000000000000000000000000000000000ab03",
        prizeAsset: "0x000000000000000000000000000000000000ab04",
        protocolFeeRecipient: "0x000000000000000000000000000000000000ab05",
        taxRecipient: "0x000000000000000000000000000000000000ab06",
        tokensPerTicket: "10000000000000000000000",
        maxTicketsPerHolder: "50",
        minPrize: "1",
        maxPrize: "0",
        prizeBps: 500, recipientTaxBps: 700, recycleTaxBps: 300, minConfirmations: 1,
        winnersPerRound: 4, minRoundInterval: 3600, weightWindowBlocks: 900,
        randomnessTimeout: 7200, claimWindow: 604800, basis: 1,
        exclusions: [
          "0x0000000000000000000000000000000000a11c00",
          "0x0000000000000000000000000000000000b0b000"
        ],
        stockRewards: [{
          asset: "0x0000000000000000000000000000000000c0de00",
          swapAdapter: "0x0000000000000000000000000000000000c0de01",
          priceGuard: "0x0000000000000000000000000000000000c0de02",
          routeData: "0x0000000000000000000000000000000000000000000000000000000000002710",
          guardData: "0x"
        }]
      }
    }
  })));
  assert.deepEqual(result.issues, []);
  assert.equal(
    result.configHash,
    "0x265a277ee9569bf9d29a6a0c6f511e9025e82f8afe3c597ebd74ced30ec4fc49",
    "matches the Solidity-generated fixture hash"
  );
  await client.close();
});

test("validate_config surfaces issues instead of encoding invalid configs", async () => {
  const client = await connectedClient();
  const result = JSON.parse(text(await client.callTool({
    name: "sinjoh_validate_config",
    arguments: {
      kind: "airdrop-sink",
      config: { minPayout: "0", maxBatchSize: 99, minConfirmations: 0, exclusions: [] }
    }
  })));
  assert.ok(result.issues.length >= 3);
  assert.equal(result.encoded, undefined);
  await client.close();
});

test("decode_error names a Sinjoh error and flags unknown selectors", async () => {
  const client = await connectedClient();
  const unknown = JSON.parse(text(await client.callTool({
    name: "sinjoh_decode_error", arguments: { data: "0xdeadbeef" }
  })));
  assert.deepEqual(unknown, { notFound: true });
  await client.close();
});
