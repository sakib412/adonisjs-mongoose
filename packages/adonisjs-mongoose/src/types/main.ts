/*
 * adonisjs-mongoose
 *
 * (c) Najmus Sakib
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { EventEmitter } from 'node:events'
import type { Connection as MongooseConnection, ConnectOptions } from 'mongoose'
import type { Emitter } from '@adonisjs/core/events'
import type { Logger } from '@adonisjs/core/logger'

/**
 * MongoDB connection options - supports both URI and individual options
 */
export type MongoDBConnectionNode = {
  host?: string
  port?: number
  database?: string
  user?: string
  password?: string
}

/**
 * Mongoose connection config
 */
export type MongooseConnectionConfig = {
  /**
   * MongoDB connection URI (e.g., mongodb://localhost:27017/mydb)
   * Takes precedence over individual connection options
   */
  uri?: string

  /**
   * Individual connection options (used if uri is not provided)
   */
  connection?: MongoDBConnectionNode

  /**
   * Mongoose connection options
   * @see https://mongoosejs.com/docs/connections.html#options
   */
  options?: ConnectOptions

  /**
   * Enable debug mode
   */
  debug?: boolean
}

/**
 * Record of multiple Mongoose connections defined in the user configuration.
 * Keys are connection names, values are mongoose connection configurations.
 *
 * @example
 * ```ts
 * const connections: MongooseConnectionsList = {
 *   mongodb: {
 *     uri: 'mongodb://localhost:27017/mydb'
 *   },
 *   mongodb_logs: {
 *     connection: {
 *       host: 'logs.mongodb.com',
 *       port: 27017,
 *       database: 'logs'
 *     }
 *   }
 * }
 * ```
 */
export type MongooseConnectionsList = Record<string, MongooseConnectionConfig>

/**
 * Interface for defining available Mongoose connections.
 * This is augmented by users to provide type-safe connection access.
 *
 * @example
 * ```ts
 * declare module 'adonisjs-mongoose/types' {
 *   interface MongooseConnections {
 *     mongodb: MongooseConnectionConfig
 *     mongodb_logs: MongooseConnectionConfig
 *     mongodb_analytics: MongooseConnectionConfig
 *   }
 * }
 * ```
 */
export interface MongooseConnections {}

/**
 * Main database configuration
 */
export type DatabaseConfig = {
  /**
   * Default connection name
   */
  connection: string

  /**
   * All available connections
   */
  connections: {
    [key: string]: MongooseConnectionConfig
  }
}

/**
 * Connection node state within the connection manager
 */
export type ConnectionNode = {
  name: string
  config: MongooseConnectionConfig
  connection?: MongooseConnectionContract
  state: 'registered' | 'connecting' | 'open' | 'closing' | 'closed'
}

/**
 * Connection contract represents a single mongoose connection
 */
export interface MongooseConnectionContract extends EventEmitter {
  /**
   * Connection name
   */
  readonly name: string

  /**
   * Native mongoose connection
   */
  readonly connection: MongooseConnection

  /**
   * Connection config
   */
  readonly config: MongooseConnectionConfig

  /**
   * Check if connection is ready
   */
  readonly ready: boolean

  /**
   * Connection state
   */
  readonly state: string

  /**
   * List of emitted events
   */
  on(event: 'connected', callback: (connection: MongooseConnectionContract) => void): this
  on(event: 'error', callback: (error: Error, connection: MongooseConnectionContract) => void): this
  on(event: 'disconnected', callback: (connection: MongooseConnectionContract) => void): this

  /**
   * Make mongoose connection
   */
  connect(): Promise<void>

  /**
   * Disconnect mongoose
   */
  disconnect(): Promise<void>
}

/**
 * Connection manager to manage multiple mongoose connections
 */
export interface ConnectionManagerContract {
  /**
   * List of registered connections
   */
  connections: Map<string, ConnectionNode>

  /**
   * Logger instance
   */
  logger: Logger

  /**
   * Event emitter
   */
  emitter: Emitter<any>

  /**
   * Add a new connection to the manager
   */
  add(connectionName: string, config: MongooseConnectionConfig): void

  /**
   * Connect to a named connection
   */
  connect(connectionName: string): Promise<void>

  /**
   * Get a connection node
   */
  get(connectionName: string): ConnectionNode | undefined

  /**
   * Check if a connection exists
   */
  has(connectionName: string): boolean

  /**
   * Check if a connection is connected
   */
  isConnected(connectionName: string): boolean

  /**
   * Close a connection
   */
  close(connectionName: string, release?: boolean): Promise<void>

  /**
   * Close all connections
   */
  closeAll(release?: boolean): Promise<void>

  /**
   * Release a connection from the manager
   */
  release(connectionName: string): Promise<void>

  /**
   * Patch connection config
   */
  patch(connectionName: string, config: MongooseConnectionConfig): void
}

/**
 * Database service contract
 */
export interface DatabaseContract {
  /**
   * Connection manager instance
   */
  manager: ConnectionManagerContract

  /**
   * Primary connection name
   */
  primaryConnectionName: string

  /**
   * Database config
   */
  config: DatabaseConfig

  /**
   * Get a connection instance
   */
  connection(connectionName?: string): MongooseConnection

  /**
   * Get the raw connection node
   */
  getRawConnection(name: string): ConnectionNode | undefined
}

/**
 * Event node shape for db events
 */
export type DbEventNode = {
  connection: string
  timestamp: Date
}

export type DbConnectionEventNode = DbEventNode & {
  state: string
}

export type DbErrorEventNode = DbEventNode & {
  error: Error
}

/**
 * Mongoose service interface representing the singleton instance registered with the IoC container.
 * Extends Database with the user-defined connections from module augmentation.
 *
 * @example
 * ```ts
 * // In your application
 * const db = await app.container.make('mongoose.db')
 *
 * // Type-safe connection access
 * const mainConnection = db.connection('mongodb')
 * const logsConnection = db.connection('mongodb_logs')
 * ```
 */
export interface MongooseService extends DatabaseContract {}
