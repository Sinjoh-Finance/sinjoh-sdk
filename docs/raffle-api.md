# Raffle API migration

The raffle API is now one capability group in the full Sinjoh API.

Use the current documentation:

- [API reference](./api.md#raffles)
- [Getting started](./getting-started.md)
- [OpenAPI 3.1](../openapi/sinjoh-api.yaml)

New integrations should use `/v1/raffles`. The original `/v1/tokens` routes
remain as deprecated compatibility aliases.
