/*
 * adonisjs-mongoose
 *
 * (c) Your Name
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { EventEmitter } from 'node:events'
import mongoose, { Connection as MongooseConnection } from 'mongoose'
import type { Logger } from '@adonisjs/core/logger'
import type { MongooseConnectionConfig, MongooseConnectionContract } from '../types/main.js'

/**
 * Connection class manages a single mongoose connection
 */
export class Connection extends EventEmitter implements MongooseConnectionContract {
  /**
   * Native mongoose connection instance
   */
  #connection?: MongooseConnection

  /**
   * Connection state tracking
   */
  #state: 'idle' | 'connecting' | 'connected' | 'disconnecting' | 'disconnected' = 'idle'

  constructor(
    public readonly name: string,
    public readonly config: MongooseConnectionConfig,
    private logger: Logger
  ) {
    super()
    this.#validateConfig()
  }

  /**
   * Validates the connection config
   */
  #validateConfig(): void {
    if (!this.config.uri && !this.config.connection) {
      throw new Error(
        `Connection "${this.name}" must have either "uri" or "connection" options defined`
      )
    }

    if (this.config.connection && !this.config.uri) {
      const { host, database } = this.config.connection
      if (!host || !database) {
        throw new Error(
          `Connection "${this.name}" must have "host" and "database" defined when using connection options`
        )
      }
    }
  }

  /**
   * Builds the connection URI from individual options
   */
  #buildConnectionUri(): string {
    if (this.config.uri) {
      return this.config.uri
    }

    const { host, port, database, user, password } = this.config.connection!
    const auth = user && password ? `${user}:${password}@` : ''
    const portString = port ? `:${port}` : ''
    
    return `mongodb://${auth}${host}${portString}/${database}`
  }

  /**
   * Setup event listeners for the connection
   */
  #monitorConnection(): void {
    if (!this.#connection) {
      return
    }

    this.#connection.on('connected', () => {
      this.#state = 'connected'
      this.logger.trace({ connection: this.name }, 'mongoose connection established')
      this.emit('connected', this)
    })

    this.#connection.on('error', (error: Error) => {
      this.logger.error(
        { connection: this.name, err: error },
        'mongoose connection error'
      )
      this.emit('error', error, this)
    })

    this.#connection.on('disconnected', () => {
      this.#state = 'disconnected'
      this.logger.trace({ connection: this.name }, 'mongoose connection disconnected')
      this.emit('disconnected', this)
    })

    this.#connection.on('reconnected', () => {
      this.logger.trace({ connection: this.name }, 'mongoose connection reconnected')
    })

    this.#connection.on('close', () => {
      this.logger.trace({ connection: this.name }, 'mongoose connection closed')
    })
  }

  /**
   * Get the native mongoose connection
   */
  get connection(): MongooseConnection {
    if (!this.#connection) {
      throw new Error(`Connection "${this.name}" is not established. Call connect() first.`)
    }
    return this.#connection
  }

  /**
   * Check if connection is ready
   */
  get ready(): boolean {
    return this.#state === 'connected' && this.#connection?.readyState === 1
  }

  /**
   * Get connection state
   */
  get state(): string {
    if (!this.#connection) {
      return 'idle'
    }

    // Mongoose connection states:
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting']
    return states[this.#connection.readyState] || 'unknown'
  }

  /**
   * Connect to MongoDB
   */
  async connect(): Promise<void> {
    if (this.#state === 'connected' || this.#state === 'connecting') {
      this.logger.trace(
        { connection: this.name },
        'connection already established or in progress'
      )
      return
    }

    try {
      this.#state = 'connecting'
      const uri = this.#buildConnectionUri()
      
      this.logger.trace({ connection: this.name }, 'connecting to mongodb')

      // Enable debug mode if configured
      if (this.config.debug) {
        mongoose.set('debug', true)
      }

      // Create connection
      this.#connection = mongoose.createConnection(uri, this.config.options)
      
      // Setup monitoring
      this.#monitorConnection()

      // Wait for connection to be ready
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error(`Connection "${this.name}" timeout`))
        }, 30000) // 30 seconds timeout

        this.#connection!.asPromise()
          .then(() => {
            clearTimeout(timeout)
            resolve()
          })
          .catch((error) => {
            clearTimeout(timeout)
            reject(error)
          })
      })

      this.logger.info({ connection: this.name }, 'mongoose connection established')
    } catch (error) {
      this.#state = 'disconnected'
      this.logger.error(
        { connection: this.name, err: error },
        'failed to establish mongoose connection'
      )
      throw error
    }
  }

  /**
   * Disconnect from MongoDB
   */
  async disconnect(): Promise<void> {
    if (!this.#connection || this.#state === 'disconnected') {
      return
    }

    try {
      this.#state = 'disconnecting'
      this.logger.trace({ connection: this.name }, 'disconnecting mongoose connection')
      
      await this.#connection.close()
      
      this.#connection = undefined
      this.#state = 'disconnected'
      
      this.logger.info({ connection: this.name }, 'mongoose connection closed')
    } catch (error) {
      this.logger.error(
        { connection: this.name, err: error },
        'error while closing mongoose connection'
      )
      throw error
    }
  }
}
