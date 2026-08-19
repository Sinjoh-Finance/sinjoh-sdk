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

/** A text-content MCP tool result. */
export function textResult(value: unknown): {
  content: { type: "text"; text: string }[];
  structuredContent?: Record<string, unknown>;
} {
  return {
    content: [{ type: "text", text: toJson(value) }],
    ...(typeof value === "object" && value !== null && !Array.isArray(value)
      ? { structuredContent: value as Record<string, unknown> }
      : {}),
  };
}

/** An MCP error result carrying the failure as readable text. */
export function errorResult(error: unknown): {
  content: { type: "text"; text: string }[];
  isError: true;
} {
  const message = error instanceof Error ? error.message : String(error);
  return { content: [{ type: "text", text: message }], isError: true };
}
