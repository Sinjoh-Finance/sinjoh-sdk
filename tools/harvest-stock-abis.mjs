import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const contracts = resolve(process.argv[2] ?? resolve(root, '../sinjoh-contracts/sinjoh-contracts-v2'));
const names = ['StockCompositeSleeve', 'StockCompositeLPAdapter', 'StockDividendVault', 'StockDividendEscrow', 'StockCorporateActionRegistry'];
const lines = ['// Generated from Foundry artifacts by tools/harvest-stock-abis.mjs. Do not edit.'];
for (const name of names) {
  const artifact = JSON.parse(readFileSync(resolve(contracts, `out/${name}.sol/${name}.json`), 'utf8'));
  if (!artifact.abi?.length) throw new Error(`Missing ABI: ${name}; build contracts first`);
  lines.push(`export const ${name[0].toLowerCase() + name.slice(1)}Abi = ${JSON.stringify(artifact.abi)} as const;`);
}
writeFileSync(resolve(root, 'packages/sdk/src/generated/stock-abis.ts'), lines.join('\n') + '\n');
