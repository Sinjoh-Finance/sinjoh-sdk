# Contributing

Thank you for helping improve the Sinjoh SDK.

## Development setup

Use Node.js 22 or newer and npm 10 or newer.

```sh
npm ci
npm run typecheck
npm test
npm run build
npm run pack:check
```

The standard test suite must remain deterministic and must not require RPC
access, wallet keys, or other secrets.

## Generated sources

Generated ABI and deployment sources are committed. Build the sibling
`sinjoh-contracts` repository first, then run:

```sh
npm run generate
```

Commit generated changes together with the source change that requires them.
Do not hand-edit files marked as generated. The recorded ABI source commit must
identify the exact `sinjoh-contracts` revision used to build the artifacts.

## Pull requests

- Keep signing and transaction submission outside the SDK.
- Add deterministic tests for behavior changes.
- Preserve chain, address, and runtime-code verification boundaries.
- Never commit RPC credentials, wallet keys, signing material, or production
  configuration.
- Report suspected vulnerabilities through the private process in
  [`SECURITY.md`](./SECURITY.md), not in a public issue.

Unless explicitly stated otherwise, contributions submitted for inclusion are
licensed under the Apache License, Version 2.0, on the terms in [`LICENSE`](./LICENSE).
