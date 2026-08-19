import assert from "node:assert/strict";
import { test } from "node:test";
import { Client, InMemoryTransport } from "@modelcontextprotocol/client";
import type { Address, Hex, PublicClient } from "viem";
import type { SinjohApiClient } from "@sinjoh/sdk";
import {
  createSinjohAgentServer,
  type SinjohWalletExecutor,
} from "../src/server.js";

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
): Promise<Client> {
  const server = createSinjohAgentServer({
    client: stubChain(hooks),
    manifest: {
      chainId: 4663,
      contracts: {
        raffleFactory: {
          address: "0xD030064fB83d14C97c22A6B63bF376552eBA7112" as Address
        }
      }
    },
    api: {
      index: async () => ({
        service: "sinjoh-api", version: "1.0.0", chainId: 4663,
        network: "Robinhood Chain mainnet", auth: "keyless", endpoints: {},
        docs: "https://example.test/docs", openapi: "https://example.test/openapi",
      }),
      listLaunches: async () => ({
        chainId: 4663,
        launches: [],
        page: { number: 1, size: 25, hasMore: false },
      }),
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
    "sinjoh_discover", "sinjoh_get", "sinjoh_history", "sinjoh_manifest",
    "sinjoh_plan_flap_launch", "sinjoh_plan_letscash_integration",
    "sinjoh_plan_ponsv2_launch", "sinjoh_plan_router_work", "sinjoh_preflight_guard",
    "sinjoh_router_snapshot", "sinjoh_validate_config", "sinjoh_verify_manifest",
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

test("manifest lookup returns entries and rejects unknown keys", async () => {
  const client = await connectedClient();
  const all = JSON.parse(text(await client.callTool({
    name: "sinjoh_manifest", arguments: {}
  })));
  assert.deepEqual(all, { chainId: 4663, keys: ["raffleFactory"] });

  const missing = await client.callTool({
    name: "sinjoh_manifest", arguments: { key: "nope" }
  });
  assert.equal(missing.isError, true);
  await client.close();
});

test("plan_router_work serializes amounts as decimal strings", async () => {
  const client = await connectedClient();
  const plan = JSON.parse(text(await client.callTool({
    name: "sinjoh_plan_router_work", arguments: { router: ROUTER }
  })));
  assert.equal(plan.actions.length, 1);
  assert.equal(plan.actions[0].kind, "sync");
  assert.equal(plan.actions[0].amount, "41", "bigint crossed the wire as a decimal string");
  assert.equal(plan.router.subject, SUBJECT);
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
    sendTransaction: async ({ to, data, value }) => {
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

  const result = JSON.parse(text(await client.callTool({
    name: "sinjoh_execute_transaction",
    arguments: { to: ROUTER, data: "0x1234", value: "7", waitForReceipt: true },
  })));
  assert.equal(result.transactionHash, hash);
  assert.equal(result.status, "confirmed");
  assert.equal(result.receipt.status, "success");
  assert.equal(result.receipt.blockNumber, "123");
  assert.deepEqual(steps, ["simulate", "sign", "receipt"]);
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
