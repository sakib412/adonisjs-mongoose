---
'adonisjs-mongoose': major
---

Make the connection lifecycle configurable: Mongo can now be a hard or soft dependency.

Two new top-level config flags in `config/mongoose.ts`:

- **`failFast`** (default `false`) — when `true`, an unreachable default connection crashes boot (hard dependency) and the health check reports a fatal `error`. When `false`, boot survives a Mongo outage and `MongoConnectionCheck` degrades to a non-fatal `warning`, so the rest of the app keeps serving.
- **`eager`** (default `true`) — open the default connection at boot to warm the pool (non-blocking unless `failFast`). Set `false` to connect lazily on first query.

`MongoConnectionCheck` now caps its probe with a `timeoutMs` (default `2000`, configurable via a 3rd constructor arg) so an unreachable server can't hang the health endpoint for the driver's full `serverSelectionTimeoutMS`.

**BREAKING:** the default boot behaviour changes. Previously the app always eagerly connected and crashed on an unreachable database at startup. The new default (`failFast: false`) no longer crashes boot on a Mongo outage. To keep the old fail-fast behaviour, set `failFast: true` in `config/mongoose.ts`.
