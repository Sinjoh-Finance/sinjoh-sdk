# Deployment promotion locks

Candidate and active files are exact attested artifacts from
`Sinjoh-Finance/sinjoh-contracts`. Import with `npm run release:import`; never
edit them manually. CI requires a mainnet promotion's deployment-manifest digest
to match this repository's `mainnet-deployments.json`, which then generates the
typed `@sinjoh/deployments` registry.
