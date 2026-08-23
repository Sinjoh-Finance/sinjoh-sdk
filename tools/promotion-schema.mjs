export function validatePromotionEnvelope(promotion, channel) {
  if (promotion?.schemaVersion !== 1) throw new Error("unsupported promotion schemaVersion");
  if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]{2,79}$/.test(promotion.releaseId ?? "")) {
    throw new Error("invalid promotion releaseId");
  }
  if (promotion.channel !== channel || !["candidate", "active"].includes(channel)) {
    throw new Error("promotion channel mismatch");
  }
  const expectedNetwork =
    promotion.chainId === 4663
      ? "robinhood-mainnet"
      : promotion.chainId === 46630
        ? "robinhood-testnet"
        : undefined;
  if (!expectedNetwork || promotion.network !== expectedNetwork) {
    throw new Error("unsupported promotion chain/network");
  }
  const source = promotion.source;
  if (source?.repository !== "Sinjoh-Finance/sinjoh-contracts") throw new Error("untrusted promotion source");
  if (!/^[0-9a-f]{40}$/.test(source?.commit ?? "")) throw new Error("invalid source commit");
  if (!/^[0-9a-f]{64}$/.test(source?.releaseManifestSha256 ?? "")) throw new Error("invalid release digest");
  if (!/^[0-9a-f]{64}$/.test(source?.deploymentManifestSha256 ?? "")) throw new Error("invalid deployment digest");
  const contracts = Object.entries(promotion.contracts ?? {});
  if (contracts.length === 0) throw new Error("promotion contains no contracts");
  for (const [path, contract] of contracts) {
    if (!/^0x[0-9a-fA-F]{40}$/.test(contract?.address ?? "")) throw new Error(`${path} has an invalid address`);
    if (!/^0x[0-9a-fA-F]{64}$/.test(contract?.runtimeCodeHash ?? "")) throw new Error(`${path} has no runtime code hash`);
  }
  if (!promotion.consumers || typeof promotion.consumers !== "object") throw new Error("promotion contains no consumers");
}

