/**
 * JSON serialization for tool results. Amounts are bigint end to end inside the SDK;
 * on the wire they become decimal strings, never floats.
 */
export function toJson(value: unknown): string {
  return JSON.stringify(
    value,
    (_key, entry: unknown) => (typeof entry === "bigint" ? entry.toString() : entry),
    2
  );
}

/** Convert SDK values into the exact JSON-safe shape sent over MCP transports. */
export function toJsonValue<T = unknown>(value: T): T {
  return JSON.parse(toJson(value)) as T;
}

/** A text-content MCP tool result. */
export function textResult(value: unknown): {
  content: { type: "text"; text: string }[];
  structuredContent?: Record<string, unknown>;
} {
  const normalized = toJsonValue(value);
  return {
    content: [{ type: "text", text: JSON.stringify(normalized, null, 2) }],
    ...(typeof normalized === "object" && normalized !== null && !Array.isArray(normalized)
      ? { structuredContent: normalized as Record<string, unknown> }
      : {}),
  };
}

/** An MCP error result carrying the failure as readable text. */
export function errorResult(error: unknown): {
  content: { type: "text"; text: string }[];
  structuredContent: Record<string, unknown>;
  isError: true;
} {
  const message = error instanceof Error ? error.message : String(error);
  const record = typeof error === "object" && error !== null
    ? error as Record<string, unknown>
    : {};
  const details = toJsonValue({
    name: error instanceof Error ? error.name : "Error",
    message,
    ...(typeof record.status === "number" ? { status: record.status } : {}),
    ...(typeof record.code === "string" ? { code: record.code } : {}),
    ...(typeof record.requestId === "string" || record.requestId === null
      ? { requestId: record.requestId }
      : {}),
  });
  return {
    content: [{ type: "text", text: message }],
    structuredContent: details,
    isError: true,
  };
}
