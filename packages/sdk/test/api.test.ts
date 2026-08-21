import assert from "node:assert/strict";
import test from "node:test";
import { createSinjohApiClient, SinjohApiError } from "../src/api.js";

test("API client builds encoded, bounded public routes", async () => {
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  const fetch = async (input: string | URL | Request, init?: RequestInit) => {
    requests.push({ url: String(input), ...(init === undefined ? {} : { init }) });
    return new Response(JSON.stringify({ chainId: 4663, events: [], page: { number: 2, size: 10, hasMore: false } }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  const api = createSinjohApiClient({ baseUrl: "https://example.test/", apiKey: "secret", fetch });
  await api.listEvents({ page: 2, limit: 10, family: "raffle", recipient: "0xabc" });

  assert.equal(
    requests[0]?.url,
    "https://example.test/v1/events?page=2&limit=10&family=raffle&recipient=0xabc",
  );
  assert.deepEqual(requests[0]?.init?.headers, { "x-api-key": "secret" });
});

test("API client encodes path segments", async () => {
  let requested = "";
  const api = createSinjohApiClient({
    fetch: async (input) => {
      requested = String(input);
      return new Response(JSON.stringify({ launch: {} }), { status: 200 });
    },
  });
  await api.getLaunch("address/with spaces");
  assert.equal(requested, "https://api.sinjoh.com/v1/launches/address%2Fwith%20spaces");
});

test("API client exposes registry parity and fee-router launch filtering", async () => {
  const requests: string[] = [];
  const api = createSinjohApiClient({
    baseUrl: "https://example.test",
    fetch: async (input) => {
      requests.push(String(input));
      return Response.json({ chainId: 4663, registry: { ok: true } });
    },
  });

  await api.getLaunchRegistryHealth();
  await api.listLaunches({ feeRouter: "0xabc", limit: 100 });

  assert.deepEqual(requests, [
    "https://example.test/v1/health/registry",
    "https://example.test/v1/launches?feeRouter=0xabc&limit=100",
  ]);
});

test("registry health preserves a conforming diagnostic body on HTTP 503", async () => {
  const diagnostic = {
    chainId: 4663,
    registry: {
      ok: false,
      indexed: 2,
      registered: 1,
      visible: 1,
      suppressed: 0,
      promoted: 0,
      inserted: 0,
      missing: 1,
      missingSubjects: ["0x0000000000000000000000000000000000000001"],
      failures: [],
      indexedByLaunchpad: { flap: 2 },
      visibleByLaunchpad: { flap: 1 },
      supportedLaunchpads: ["flap"],
    },
  };
  const api = createSinjohApiClient({
    fetch: async () => Response.json(diagnostic, { status: 503 }),
  });
  assert.deepEqual(await api.getLaunchRegistryHealth(), diagnostic);
});

test("API client returns stable structured errors", async () => {
  const api = createSinjohApiClient({
    fetch: async () => new Response(
      JSON.stringify({ error: "invalid_address", message: "bad address" }),
      { status: 400, headers: { "x-request-id": "request-1" } },
    ),
  });
  await assert.rejects(
    () => api.getContract("bad"),
    (error: unknown) => {
      assert.ok(error instanceof SinjohApiError);
      assert.equal(error.status, 400);
      assert.equal(error.code, "invalid_address");
      assert.equal(error.requestId, "request-1");
      return true;
    },
  );
});

test("API client rejects non-JSON upstream responses", async () => {
  const api = createSinjohApiClient({
    fetch: async () => new Response("gateway error", { status: 502 }),
  });
  await assert.rejects(
    () => api.index(),
    (error: unknown) => error instanceof SinjohApiError && error.code === "invalid_response",
  );
});
