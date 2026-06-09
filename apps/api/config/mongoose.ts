import env from '#start/env'
import { defineConfig, type InferConnections } from 'adonisjs-mongoose'

/**
 * Mongo connections for the demo app.
 *
 * - `primary`   — the default connection (application data).
 * - `analytics` — a second connection pointing at a different database,
 *                 used to show connection isolation.
 */
const mongoConfig = defineConfig({
  connection: env.get('MONGO_CONNECTION', 'primary'),

  // Treat Mongo as a hard dependency. When true, a failed connection crashes
  // boot (if `eager`) and the health check reports a fatal error. Leave false
  // when Mongo backs only part of the app: boot survives an outage and the
  // health check degrades to a non-fatal warning.
  failFast: false,

  // Open the default connection at boot (non-blocking unless `failFast`) to
  // warm the pool. Set false to connect lazily on first query instead.
  eager: true,

  connections: {
    primary: {
      uri: env.get('MONGO_URI'),
      clientOptions: {
        maxPoolSize: 20,
      },
    },

    analytics: {
      uri: env.get('MONGO_ANALYTICS_URI'),
    },
  },
})

export default mongoConfig

/**
 * Registers the configured connection names with the package types so that
 * `mongo.connection(name)` and `defineMongoModel(..., { connection })` reject
 * unknown names at compile time. The module specifier MUST be exactly
 * 'adonisjs-mongoose/types' — a typo silently disables this safety.
 */
declare module 'adonisjs-mongoose/types' {
  interface MongoConnections extends InferConnections<typeof mongoConfig> {}
}
