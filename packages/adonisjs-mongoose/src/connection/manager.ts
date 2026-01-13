/*
 * adonisjs-mongoose
 *
 * (c) Najmus Sakib
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Emitter } from '@adonisjs/core/events'
import type { Logger } from '@adonisjs/core/logger'
import type {
  ConnectionNode,
  MongooseConnectionConfig,
  MongooseConnectionContract,
  ConnectionManagerContract,
} from '../types/main.js'
import { Connection } from './index.js'

/**
 * Connection manager manages multiple mongoose connections
 */
export class ConnectionManager implements ConnectionManagerContract {
  /**
   * List of managed connections
   */
  connections: Map<string, ConnectionNode> = new Map()

  /**
   * Orphan connections that were replaced
   */
  #orphanConnections: Set<MongooseConnectionContract> = new Set()

  constructor(
    public logger: Logger,
    public emitter: Emitter<any>
  ) {}

  /**
   * Handle connection event
   */
  #handleConnect(connection: MongooseConnectionContract): void {
    const internalConnection = this.get(connection.name)
    if (!internalConnection) {
      return
    }

    this.emitter.emit('mongodb:connection:connect', {
      connection: connection.name,
      state: 'open',
      timestamp: new Date(),
    })

    internalConnection.state = 'open'
  }

  /**
   * Handle disconnection event
   */
  #handleDisconnect(connection: MongooseConnectionContract): void {
    // Check if this is an orphan connection
    if (this.#orphanConnections.has(connection)) {
      this.#orphanConnections.delete(connection)
      this.emitter.emit('mongodb:connection:disconnect', {
        connection: connection.name,
        state: 'closed',
        timestamp: new Date(),
      })
      this.logger.trace({ connection: connection.name }, 'orphan connection cleaned up')
      return
    }

    const internalConnection = this.get(connection.name)
    if (!internalConnection) {
      return
    }

    this.emitter.emit('mongodb:connection:disconnect', {
      connection: connection.name,
      state: 'closed',
      timestamp: new Date(),
    })

    this.logger.trace({ connection: connection.name }, 'connection disconnected')
    delete internalConnection.connection
    internalConnection.state = 'closed'
  }

  /**
   * Handle connection error
   */
  #handleError(error: Error, connection: MongooseConnectionContract): void {
    this.emitter.emit('mongodb:connection:error', {
      connection: connection.name,
      error,
      timestamp: new Date(),
    })
  }

  /**
   * Monitor connection lifecycle events
   */
  #monitorConnection(connection: MongooseConnectionContract): void {
    connection.on('connected', (conn) => this.#handleConnect(conn))
    connection.on('disconnected', (conn) => this.#handleDisconnect(conn))
    connection.on('error', (error, conn) => this.#handleError(error, conn))
  }

  /**
   * Add a new connection to the manager
   */
  add(connectionName: string, config: MongooseConnectionConfig): void {
    if (this.has(connectionName)) {
      this.logger.trace({ connection: connectionName }, 'connection already exists, skipping add')
      return
    }

    this.logger.trace({ connection: connectionName }, 'adding connection to manager')

    this.connections.set(connectionName, {
      name: connectionName,
      config,
      state: 'registered',
    })
  }

  /**
   * Connect to a named connection
   */
  async connect(connectionName: string): Promise<void> {
    const connectionNode = this.connections.get(connectionName)

    if (!connectionNode) {
      throw new Error(
        `Connection "${connectionName}" is not registered. Make sure to add it first using manager.add()`
      )
    }

    // Already connected
    if (this.isConnected(connectionName)) {
      this.logger.trace({ connection: connectionName }, 'connection already established')
      return
    }

    // Create new connection instance
    connectionNode.state = 'connecting'
    connectionNode.connection = new Connection(
      connectionNode.name,
      connectionNode.config,
      this.logger
    )

    // Monitor the connection
    this.#monitorConnection(connectionNode.connection)

    // Establish connection
    await connectionNode.connection.connect()
  }

  /**
   * Get a connection node
   */
  get(connectionName: string): ConnectionNode | undefined {
    return this.connections.get(connectionName)
  }

  /**
   * Check if connection exists
   */
  has(connectionName: string): boolean {
    return this.connections.has(connectionName)
  }

  /**
   * Check if connection is connected
   */
  isConnected(connectionName: string): boolean {
    if (!this.has(connectionName)) {
      return false
    }

    const connection = this.get(connectionName)!
    return !!connection.connection && connection.state === 'open'
  }

  /**
   * Patch connection config
   */
  patch(connectionName: string, config: MongooseConnectionConfig): void {
    const connection = this.get(connectionName)

    // If connection doesn't exist, add it
    if (!connection) {
      return this.add(connectionName, config)
    }

    // Move current connection to orphans if it exists
    if (connection.connection) {
      this.#orphanConnections.add(connection.connection)
      connection.connection.disconnect().catch((error) => {
        this.logger.error(
          { connection: connectionName, err: error },
          'error disconnecting orphan connection'
        )
      })
    }

    // Update config and state
    connection.state = 'registered'
    connection.config = config
    delete connection.connection
  }

  /**
   * Close a connection
   */
  async close(connectionName: string, release: boolean = false): Promise<void> {
    if (this.isConnected(connectionName)) {
      const connection = this.get(connectionName)!
      connection.state = 'closing'
      await connection.connection!.disconnect()
    }

    if (release) {
      await this.release(connectionName)
    }
  }

  /**
   * Close all connections
   */
  async closeAll(release: boolean = false): Promise<void> {
    const closePromises = Array.from(this.connections.keys()).map((name) =>
      this.close(name, release)
    )
    await Promise.all(closePromises)
  }

  /**
   * Release a connection from the manager
   */
  async release(connectionName: string): Promise<void> {
    if (this.isConnected(connectionName)) {
      await this.close(connectionName, true)
    } else {
      this.connections.delete(connectionName)
    }
  }
}
