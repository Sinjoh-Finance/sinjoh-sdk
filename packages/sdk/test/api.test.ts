import assert from "node:assert/strict";
import test from "node:test";
import { createSinjohApiClient, SinjohApiError } from "../src/api.js";
import { prepareLaunchImageAuthorization } from "../src/images.js";

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

test("registry health rejects an unrelated middleware HTTP 503", async () => {
  const api = createSinjohApiClient({
    fetch: async () => Response.json(
      { error: "rate_limit_unavailable", message: "capacity guard unavailable" },
      { status: 503 },
    ),
  });
  await assert.rejects(
    () => api.getLaunchRegistryHealth(),
    (error: unknown) => error instanceof SinjohApiError
      && error.status === 503
      && error.code === "rate_limit_unavailable",
  );
});

test("image health preserves conforming 503 diagnostics but rejects unrelated failures", async () => {
  const diagnostic = {
    chainId: 4663,
    images: {
      ok: false,
      registered: 2,
      canonical: 1,
      missing: 1,
      noSource: 0,
      failed: 1,
      repaired: 0,
      missingSubjects: ["0x0000000000000000000000000000000000000001"],
      noSourceSubjects: [],
      failures: [{ subject: "0x0000000000000000000000000000000000000001", code: "recovery_failed" }],
      byLaunchpad: { flap: { registered: 2, canonical: 1, missing: 1, noSource: 0 } },
    },
  };
  const diagnosticsApi = createSinjohApiClient({
    fetch: async () => Response.json(diagnostic, { status: 503 }),
  });
  assert.deepEqual(await diagnosticsApi.getLaunchImageHealth(), diagnostic);

  const unrelatedApi = createSinjohApiClient({
    fetch: async () => Response.json({ error: "rate_limit_unavailable" }, { status: 503 }),
  });
  await assert.rejects(
    () => unrelatedApi.getLaunchImageHealth(),
    (error: unknown) => error instanceof SinjohApiError && error.code === "rate_limit_unavailable",
  );
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

test("API client wraps a null JSON error body", async () => {
  const api = createSinjohApiClient({
    fetch: async () => Response.json(null, { status: 503 }),
  });
  await assert.rejects(
    () => api.index(),
    (error: unknown) => error instanceof SinjohApiError
      && error.status === 503
      && error.code === "request_failed",
  );
});

test("API client publishes creator-signed artwork as multipart data", async () => {
  let requested = "";
  let requestInit: RequestInit | undefined;
  const api = createSinjohApiClient({
    baseUrl: "https://example.test",
    apiKey: "key-1",
    fetch: async (input, init) => {
      requested = String(input);
      requestInit = init;
      return Response.json({ chainId: 4663, subject: "0x1", image: { url: "https://cdn.test/image.png" } });
    },
  });
  const image = Uint8Array.from(
    atob("iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAIAAAD91JpzAAAACXBIWXMAAAABAAAAAQBPJcTWAAAAEElEQVR4nGP8wwACLGCSAQANBAECv1AVswAAAABJRU5ErkJggg=="),
    (value) => value.charCodeAt(0),
  );
  const identity = {
    chainId: 4663,
    subject: "0x0000000000000000000000000000000000000001" as const,
    creator: "0x0000000000000000000000000000000000000002" as const,
    issuedAt: 1_800_000_000,
  };
  const { authorization } = await prepareLaunchImageAuthorization({
    ...identity,
    image,
    lifetimeSeconds: 300,
  });
  await api.publishLaunchImage({
    subject: authorization.subject,
    image,
    authorization,
    signature: `0x${"22".repeat(65)}`,
  });
  assert.equal(requested, `https://example.test/v1/launches/${authorization.subject}/image`);
  assert.equal(requestInit?.method, "POST");
  assert.deepEqual(requestInit?.headers, { "x-api-key": "key-1" });
  assert.ok(requestInit?.body instanceof FormData);
  const form = requestInit.body as FormData;
  assert.equal(form.get("signature"), `0x${"22".repeat(65)}`);
  assert.deepEqual(JSON.parse(String(form.get("authorization"))), authorization);
  assert.ok(form.get("file") instanceof Blob);
});
