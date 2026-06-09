# adonisjs-mongoose

[![npm version](https://img.shields.io/npm/v/adonisjs-mongoose.svg?logo=npm)](https://www.npmjs.com/package/adonisjs-mongoose)
[![npm downloads](https://img.shields.io/npm/dm/adonisjs-mongoose.svg?logo=npm)](https://www.npmjs.com/package/adonisjs-mongoose)
[![license](https://img.shields.io/npm/l/adonisjs-mongoose.svg)](https://github.com/sakib412/adonisjs-mongoose/blob/main/packages/adonisjs-mongoose/LICENSE)
[![AdonisJS](https://img.shields.io/badge/AdonisJS-v7-5A45FF.svg)](https://adonisjs.com)

Mongoose ODM integration for [AdonisJS](https://adonisjs.com), modelled on
`@adonisjs/lucid`: **config-driven multiple connections**, a
**container-managed connection manager**, a **type-safe model factory**, an
**ace command**, **REPL bindings** and a **health check**.

```ts
import { defineMongoModel } from '#services/mongo'

export const User = defineMongoModel('User', userSchema) // default connection
export const Event = defineMongoModel('Event', eventSchema, { connection: 'analytics' })
```

## Table of contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configure connections](#configure-connections)
- [Service alias](#service-alias)
- [Using connections](#using-connections)
- [Defining models](#defining-models)
- [Health check](#health-check)
- [REPL](#repl)
- [Multi-tenancy](#multi-tenancy)
- [API reference](#api-reference)
- [Demo app](#demo-app)
- [License](#license)

## Features

- 🔌 **Multiple connections** — declare any number of named connections in
  `config/mongoose.ts`, opened lazily and cached.
- 🛡️ **Connection-name type safety** — `mongo.connection(name)` and
  `defineMongoModel(..., { connection })` reject names that aren't configured,
  at compile time.
- 🏭 **Model factory** — `defineMongoModel()` compiles a schema on the right
  connection (no reliance on Mongoose's global model registry), so a model can
  target any database.
- ❤️ **Health check** — `MongoConnectionCheck` integrates with
  `@adonisjs/core/health`.
- 🧰 **Ace command** — `node ace make:mongo-model` scaffolds a model.
- 🐚 **REPL binding** — `loadMongo()` exposes the manager inside `node ace repl`.
- ♻️ **Lifecycle aware** — eagerly opens the default connection on web boot
  (fail-fast) and gracefully closes every connection on shutdown.

## Requirements

| | Version |
|---|---|
| AdonisJS | `^7.0.0` |
| Mongoose | `^9.0.0` |
| Node.js | `>= 24` |

`mongoose` is a **peer dependency** — the app provides it, so the package and
your app share a single Mongoose instance (required for the model registry to
behave).

## Installation

```sh
node ace add adonisjs-mongoose
```

This installs the package and runs the configure hook, which:

- publishes `config/mongoose.ts`,
- registers the provider and commands in `adonisrc.ts`,
- adds the `MONGO_URI` env var and its validation.

<details>
<summary>Manual installation</summary>

```sh
npm i adonisjs-mongoose mongoose
node ace configure adonisjs-mongoose
```

</details>

## Configure connections

`config/mongoose.ts` holds a default connection name and a map of named
connections. The `declare module` block is **required for connection-name type
safety** — it feeds the configured names into `mongo.connection(name)` and
`defineMongoModel(..., { connection })`.

> ⚠️ The module specifier must be **exactly** `'adonisjs-mongoose/types'`. A
> typo creates a separate, unmerged declaration: TypeScript reports no error,
> but connection names silently fall back to `string` (no safety).

```ts
import env from '#start/env'
import { defineConfig, type InferConnections } from 'adonisjs-mongoose'

const mongoConfig = defineConfig({
  connection: env.get('MONGO_CONNECTION', 'primary'),

  connections: {
    primary: {
      uri: env.get('MONGO_URI'),
      clientOptions: { maxPoolSize: 20 },
    },
    analytics: {
      uri: env.get('MONGO_ANALYTICS_URI'),
    },
  },
})

export default mongoConfig

declare module 'adonisjs-mongoose/types' {
  interface MongoConnections extends InferConnections<typeof mongoConfig> {}
}
```

`clientOptions` is forwarded verbatim to `mongoose.createConnection(uri, options)`
(pool sizing, timeouts, TLS, etc.).

## Service alias

Re-export the service under your app's alias so the rest of the app imports from
`#services/mongo` rather than the package subpaths:

```ts
// app/services/mongo.ts
export { default } from 'adonisjs-mongoose/services/main'
export { defineMongoModel } from 'adonisjs-mongoose/model'
```

## Using connections

```ts
import mongo from '#services/mongo' // or 'adonisjs-mongoose/services/main'

mongo.connection()             // default connection (mongoose.Connection)
mongo.connection('analytics')  // named — 'nope' is a compile error
await mongo.connect('analytics') // open + await readiness (fail fast)
```

Connections open **lazily** on first use. The provider eagerly opens the
**default** connection on web boot, so the app fails fast on a bad URI. In
non-web environments (ace commands, tests, queue workers) call
`await mongo.connect(name)` first if you need to fail fast before querying.

## Defining models

`defineMongoModel(name, schema, { connection? })` compiles the schema on the
chosen connection and returns a plain Mongoose `Model`, so the full Mongoose
query API is available.

```ts
import { Schema, type InferSchemaType } from 'mongoose'
import { defineMongoModel } from '#services/mongo' // or 'adonisjs-mongoose/model'

const schema = new Schema(
  { name: { type: String, required: true }, email: { type: String, required: true } },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
)

export type UserDoc = InferSchemaType<typeof schema>

// Omit `connection` to use the default connection.
export const User = defineMongoModel('User', schema)

// Target a named connection — unknown names are a compile error.
export const Event = defineMongoModel('Event', schema, { connection: 'analytics' })
```

Scaffold one with the ace command:

```sh
node ace make:mongo-model order --connection=analytics
```

> **Define models in modules imported after boot** (controllers, services,
> routes) — not in providers. A compiled model is cached per connection to
> avoid Mongoose's `OverwriteModelError`, so a schema-shape change is picked up
> on a full restart, not on HMR alone.

## Health check

`MongoConnectionCheck` plugs into `@adonisjs/core/health`. Import the module
**lazily** (from a route handler) so it evaluates after boot, when the service
is resolved:

```ts
// start/health.ts
import mongo from '#services/mongo'
import { HealthChecks } from '@adonisjs/core/health'
import { MongoConnectionCheck } from 'adonisjs-mongoose'

export const healthChecks = new HealthChecks().register([
  new MongoConnectionCheck(mongo),              // default connection
  new MongoConnectionCheck(mongo, 'analytics'), // a named connection
])
```

```ts
// start/routes.ts
router.get('/health', async ({ response }) => {
  const { healthChecks } = await import('#start/health')
  const report = await healthChecks.run()
  return response.status(report.isHealthy ? 200 : 503).send(report)
})
```

## REPL

```sh
node ace repl
> await loadMongo()        # exposes the manager as `mongo`
> await mongo.connect()
> mongo.report()
```

## Multi-tenancy

Models are **unscoped**. Mongoose has no declarative scopes, so every query must
filter the tenant explicitly, e.g. `User.find({ tenantId })`. This is
intentional and the caller's responsibility.

## API reference

| Import | Export | Description |
|---|---|---|
| `adonisjs-mongoose` | `defineConfig` | Define the Mongo config (identity helper with inference). |
| `adonisjs-mongoose` | `MongoManager` | The connection manager class. |
| `adonisjs-mongoose` | `MongoConnectionCheck` | Health check for a connection. |
| `adonisjs-mongoose` | _types_ | `MongoConfig`, `MongoConnectionConfig`, `MongoConnectionName`, `MongoConnections`, `MongoConnectionsList`, `MongoConnectionReport`, `MongoService`, `InferConnections`. |
| `adonisjs-mongoose/model` | `defineMongoModel` | Model factory bound to a managed connection. |
| `adonisjs-mongoose/services/main` | `default` | The resolved manager singleton (`MongoService`). |
| `adonisjs-mongoose/types` | — | Augmentation target for `MongoConnections`. |
| `adonisjs-mongoose/mongo_provider` | `default` | The service provider (registered in `adonisrc.ts`). |
| `adonisjs-mongoose/commands` | — | Ace commands loader. |

**Manager methods** (`mongo`):

| Method | Description |
|---|---|
| `connection(name?)` | Resolve a connection (creates + caches on first use). Defaults to the default connection. |
| `connect(name?)` | Open a connection and await its readiness. |
| `isManaged(name)` | Whether a connection has been instantiated. |
| `report()` | Snapshot of every instantiated connection's state. |
| `closeAll()` | Gracefully close all open connections (called on shutdown). |
| `defaultConnection` | The default connection name from config. |

## Demo app

A runnable AdonisJS v7 demo lives in [`apps/api`](../../apps/api) — it wires up
two connections (`primary` + `analytics`), a model on each, user CRUD, the
health endpoint, and a `/api/demo/multi-connection` route that proves the
connections are isolated. See its [README](../../apps/api/README.md).

## License

[MIT](./LICENSE) © Najmus Sakib
