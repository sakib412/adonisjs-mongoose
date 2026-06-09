import mongoose, { type Connection } from 'mongoose'
import type { Logger } from '@adonisjs/core/logger'
import type { MongoConfig, MongoConnectionReport, MongoConnectionsList } from './types.js'

const STATES: Record<number, MongoConnectionReport['state']> = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
}

/**
 * Connection manager — the Mongoose analogue of Lucid's `Database`.
 *
 * Holds the resolved config and lazily opens one `mongoose.Connection`
 * per configured name via `createConnection` (which returns immediately
 * and buffers operations until the socket is ready). Connections are
 * cached, so repeated `connection(name)` calls return the same instance.
 */
export class MongoManager<ConnectionsList extends MongoConnectionsList = MongoConnectionsList> {
  #connections = new Map<string, Connection>()

  constructor(
    private config: MongoConfig<ConnectionsList>,
    private logger?: Logger
  ) {
    // Fail fast on a misconfigured default rather than on first use.
    if (!config.connections[config.connection]) {
      throw new Error(
        `Default Mongo connection "${config.connection}" is not defined in config/mongoose`
      )
    }
  }

  /**
   * The default connection name from config.
   */
  get defaultConnection(): string {
    return this.config.connection
  }

  /**
   * Whether Mongo is configured as a hard dependency. Read by the provider
   * (to decide if a boot-time connection failure is fatal) and by
   * {@link MongoConnectionCheck} (to decide error vs warning severity).
   */
  get failFast(): boolean {
    return this.config.failFast ?? false
  }

  /**
   * Whether the default connection should be opened at boot rather than on
   * first use. Defaults to `true`.
   */
  get eager(): boolean {
    return this.config.eager ?? true
  }

  /**
   * Resolve a named connection, creating it on first access. Defaults to
   * the configured default connection. The name is constrained to the
   * configured connections (via {@link MongoConnections} augmentation).
   *
   * @throws Error if the name is not defined in `config/mongoose`.
   */
  connection<Name extends keyof ConnectionsList>(name?: Name): Connection {
    const resolved = (name ?? this.config.connection) as string

    const existing = this.#connections.get(resolved)
    if (existing) return existing

    const connectionConfig = this.config.connections[resolved]
    if (!connectionConfig) {
      throw new Error(`Mongo connection "${resolved}" is not defined in config/mongoose`)
    }

    const connection = mongoose.createConnection(
      connectionConfig.uri,
      connectionConfig.clientOptions
    )

    // Mongoose drops 'error' events with no listener, so post-connect
    // failures (dropped socket, auth expiry) would vanish. Surface them.
    connection.on('error', (error) => {
      this.logger?.error({ err: error, connection: resolved }, 'Mongo connection error')
    })

    this.#connections.set(resolved, connection)
    return connection
  }

  /**
   * Open a connection and await its readiness, then resolve. Useful at boot
   * to fail fast, or inside non-web environments (ace commands, tests,
   * queue workers) where connections are otherwise opened lazily on first
   * query. `asPromise()` resolves once the socket is actually connected —
   * until then Mongoose buffers operations rather than erroring.
   */
  async connect<Name extends keyof ConnectionsList>(name?: Name): Promise<Connection> {
    return this.connection(name).asPromise()
  }

  /**
   * Whether a connection has been instantiated (not necessarily ready).
   */
  isManaged(name: string): boolean {
    return this.#connections.has(name)
  }

  /**
   * Snapshot of every instantiated connection's state, for health checks.
   */
  report(): MongoConnectionReport[] {
    return [...this.#connections.entries()].map(([connection, conn]) => ({
      connection,
      readyState: conn.readyState,
      state: STATES[conn.readyState] ?? 'disconnected',
    }))
  }

  /**
   * Gracefully close all open connections. Called on app shutdown.
   * Uses allSettled so one failing close() does not leave the rest open,
   * and clears the cache regardless of individual failures.
   */
  async closeAll(): Promise<void> {
    try {
      await Promise.allSettled([...this.#connections.values()].map((c) => c.close()))
    } finally {
      this.#connections.clear()
    }
  }
}
