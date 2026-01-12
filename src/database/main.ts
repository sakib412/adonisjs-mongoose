/*
 * adonisjs-mongoose
 *
 * (c) Your Name
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Connection as MongooseConnection } from 'mongoose'
import Macroable from '@poppinss/macroable'
import type { Emitter } from '@adonisjs/core/events'
import type { Logger } from '@adonisjs/core/logger'
import type {
  DatabaseConfig,
  DatabaseContract,
  ConnectionManagerContract,
  ConnectionNode,
} from '../types/main.js'
import { ConnectionManager } from '../connection/manager.js'

/**
 * Database class manages multiple mongoose connections and provides
 * a clean API to access them
 */
export class Database extends Macroable implements DatabaseContract {
  /**
   * Connection manager instance
   */
  manager: ConnectionManagerContract

  /**
   * Primary connection name
   */
  primaryConnectionName: string

  constructor(
    public config: DatabaseConfig,
    private logger: Logger,
    private emitter: Emitter<any>
  ) {
    super()
    
    this.manager = new ConnectionManager(this.logger, this.emitter)
    this.primaryConnectionName = this.config.connection

    this.#registerConnections()
  }

  /**
   * Register all connections with the manager
   */
  #registerConnections(): void {
    Object.keys(this.config.connections).forEach((name) => {
      this.manager.add(name, this.config.connections[name])
    })
  }

  /**
   * Get raw connection node from manager
   */
  getRawConnection(name: string): ConnectionNode | undefined {
    return this.manager.get(name)
  }

  /**
   * Get a connection instance
   * If no connection name is provided, returns the primary connection
   */
  connection(connectionName: string = this.primaryConnectionName): MongooseConnection {
    /**
     * Return the connection from cache when it exists
     */
    const rawConnection = this.getRawConnection(connectionName)
    if (!rawConnection) {
      throw new Error(
        `Connection "${connectionName}" is not configured. Check your database config`
      )
    }

    /**
     * Connect if not already connected
     */
    if (!this.manager.isConnected(connectionName)) {
      this.logger.trace(
        { connection: connectionName },
        'establishing connection for the first time'
      )
      this.manager.connect(connectionName).catch((error) => {
        this.logger.error(
          { connection: connectionName, err: error },
          'failed to establish connection'
        )
        throw error
      })
    }

    /**
     * Wait for connection to be ready and return it
     */
    const connection = rawConnection.connection
    if (!connection) {
      throw new Error(
        `Connection "${connectionName}" is not ready. This is likely a connection timing issue.`
      )
    }

    return connection.connection
  }
}
