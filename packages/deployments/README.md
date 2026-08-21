# @sinjoh/deployments

Typed Sinjoh deployment manifests plus live runtime-code verification. The package currently
ships the Robinhood Chain mainnet manifest (`chainId` 4663), generated from the repository's
canonical `mainnet-deployments.json`.

## Install

```sh
npm install @sinjoh/deployments viem
```

## Verify before using an address

```ts
import { allVerified, mainnet, verifyManifest } from "@sinjoh/deployments";
import { createPublicClient, http } from "viem";

const client = createPublicClient({
  transport: http(mainnet.rpcUrl)
});

const results = await verifyManifest(client, mainnet);
if (!allVerified(results)) {
  throw new Error("Sinjoh manifest does not match live runtime code");
}

const routerFactory = mainnet.contracts["agnosticFeeRouterFactory"];
if (!routerFactory) throw new Error("router factory is absent from the manifest");

const launchStaking = mainnet.contracts["launchStakingEngine"];
if (!launchStaking) throw new Error("launch staking is absent from the manifest");
```

A manifest is data, not a trust anchor. `verifyManifest` checks every contract, dependency,
implementation, and authority role. Contracts must match their recorded runtime hash; roles
explicitly classified as EOAs must have no code. Missing or contradictory classification fails
closed rather than being skipped. Upgradeable dependencies also verify their active EIP-1967
slot or beacon `implementation()` binding, so a storage-only upgrade cannot pass on proxy bytecode
alone. `allVerified([])` returns `false`.

## API

- `mainnet`: generated `ChainManifest` for Robinhood Chain mainnet.
- `verifyManifest(client, manifest, { keys? })`: reads live bytecode and returns one
  `VerificationResult` per checked address.
- `allVerified(results)`: true only when the result set is nonempty and every check passed.
- `ChainManifest`, `DeploymentEntry`, `CodeReader`, `VerificationResult`: public TypeScript types.

See the [SDK workspace documentation](https://github.com/Sinjoh-Finance/sinjoh-sdk)
for the package map and safety model.
