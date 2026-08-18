import assert from "node:assert/strict";
import { test } from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { Address, PublicClient } from "viem";
import { createSinjohAgentServer } from "../src/server.js";

const ROUTER = "0x00000000000000000000000000000000000000aa" as Address;
const WETH = "0x00000000000000000000000000000000000000e1" as Address;
const SUBJECT = "0x00000000000000000000000000000000000000e2" as Address;
const ZERO = "0x0000000000000000000000000000000000000000" as Address;

/** A quiet single-bucket router, keyed the same way as the SDK planner tests. */
function stubChain(): PublicClient {
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
      const key = args.args === undefined || args.args.length === 0
        ? args.functionName
        : `${args.functionName}:${JSON.stringify(args.args, (_, v) =>
          typeof v === "bigint" ? Number(v) : v)}`;
      if (key in routes) return routes[key];
      throw new Error(`unexpected read ${key}`);
    }
  } as unknown as PublicClient;
}

async function connectedClient(): Promise<Client> {
  const server = createSinjohAgentServer({
    client: stubChain(),
    manifest: {
      contracts: {
        raffleFactory: {
          address: "0xD030064fB83d14C97c22A6B63bF376552eBA7112" as Address
        }
      }
    },
    chainId: 4663
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
    "sinjoh_check_activation", "sinjoh_decode_error", "sinjoh_manifest",
    "sinjoh_plan_ponsv2_launch", "sinjoh_plan_router_work", "sinjoh_preflight_guard",
    "sinjoh_router_snapshot", "sinjoh_validate_config", "sinjoh_verify_manifest"
  ]);
  for (const tool of tools) {
    assert.ok((tool.description ?? "").length > 40, `${tool.name} is documented`);
  }
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
