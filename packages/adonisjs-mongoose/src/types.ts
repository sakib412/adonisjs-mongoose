import type { ConnectOptions } from 'mongoose'
import type { MongoManager } from './manager.js'

/**
 * Configuration for a single named Mongoose connection.
 */
export interface MongoConnectionConfig {
  /**
   * MongoDB connection string, e.g. `mongodb://localhost:27017/app`.
   */
  uri: string

  /**
   * Options forwarded verbatim to `mongoose.createConnection(uri, options)`.
   * Pool sizing, timeouts, TLS, etc.
   */
  clientOptions?: ConnectOptions
}

/**
 * Shape every connection map must satisfy.
 */
export type MongoConnectionsList = Record<string, MongoConnectionConfig>

/**
 * Top-level config object, mirroring the shape of `config/database.ts`
 * (Lucid). One default connection name + a map of named connections.
 */
export interface MongoConfig<Connections extends MongoConnectionsList = MongoConnectionsList> {
  /**
   * Name of the connection used when `mongo.connection()` is called
   * without an explicit name. Typed as `string` (not `keyof Connections`)
   * so it can be sourced from `env.get(...)`.
   */
  connection: string

  /**
   * Map of connection name -> connection config.
   */
  connections: Connections
}

/**
 * Interface augmented by the user inside `config/mongo.ts` to register the
 * available connection names, e.g.
 *
 * ```ts
 * declare module 'adonisjs-mongoose/types' {
 *   interface MongoConnections extends InferConnections<typeof mongoConfig> {}
 * }
 * ```
 *
 * Once augmented, `mongo.connection(name)` and `defineMongoModel(..., {connection})`
 * reject names that are not configured.
 *
 * ⚠️ The module specifier MUST be exactly `'adonisjs-mongoose/types'`.
 * A typo creates a separate, unmerged declaration: TypeScript reports no
 * error, but connection names silently fall back to `string` (no safety).
 * Without any augmentation, {@link MongoConnectionName} is `string`.
 */
export interface MongoConnections {}

/**
 * Infers the connection map from a config object, for the module
 * augmentation above.
 */
export type InferConnections<T extends { connections: MongoConnectionsList }> = T['connections']

/**
 * Resolved set of connection names: the augmented union when the user has
 * registered connections, or `string` before augmentation.
 */
export type MongoConnectionName = [keyof MongoConnections] extends [never]
  ? string
  : keyof MongoConnections

/**
 * The container-bound manager type. Carries the user's registered
 * connections (via {@link MongoConnections}) so the resolved `mongo`
 * service is connection-name type-safe.
 */
export interface MongoService extends MongoManager<
  MongoConnections extends MongoConnectionsList ? MongoConnections : never
> {}

/**
 * Health report entry for a single connection.
 */
export interface MongoConnectionReport {
  connection: string
  /** Mongoose `readyState`: 0 disconnected, 1 connected, 2 connecting, 3 disconnecting. */
  readyState: number
  state: 'connected' | 'connecting' | 'disconnecting' | 'disconnected'
}
