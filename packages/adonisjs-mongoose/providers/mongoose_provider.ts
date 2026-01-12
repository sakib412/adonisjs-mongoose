/*
 * adonisjs-mongoose
 *
 * (c) Najmus Sakib
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { ApplicationService } from '@adonisjs/core/types'
import type { DatabaseConfig, DbConnectionEventNode, DbErrorEventNode } from '../src/types/main.js'
import { Database } from '../src/database/main.js'
import { BaseModel } from '../src/model/base_model.js'

/**
 * Extending AdonisJS types
 */
declare module '@adonisjs/core/types' {
  export interface ContainerBindings {
    'mongoose.db': Database
  }

  export interface EventsList {
    'mongodb:connection:connect': DbConnectionEventNode
    'mongodb:connection:disconnect': DbConnectionEventNode
    'mongodb:connection:error': DbErrorEventNode
  }
}

/**
 * Mongoose service provider for AdonisJS
 */
export default class MongooseServiceProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register bindings to the container
   */
  register(): void {
    this.app.container.singleton(Database, async (resolver) => {
      const configProvider = this.app.config.get<DatabaseConfig>('database')
      const emitter = await resolver.make('emitter')
      const logger = await resolver.make('logger')

      const db = new Database(configProvider, logger, emitter)
      return db
    })

    this.app.container.alias('mongoose.db', Database)
  }

  /**
   * The container bindings have booted
   */
  async boot(): Promise<void> {
    const db = await this.app.container.make('mongoose.db')

    // Inject database instance into BaseModel
    BaseModel.$db = db

    // Setup event listeners if needed
    await this.#setupEventListeners(db)
  }

  /**
   * The application has been booted
   */
  async start(): Promise<void> {
    // Optionally connect to default connection on start
    // const db = await this.app.container.make('mongoose.db')
    // await db.manager.connect(db.primaryConnectionName)
  }

  /**
   * The process has been started
   */
  async ready(): Promise<void> {
    // Hook for when application is ready
  }

  /**
   * Prepare application for shutdown
   */
  async shutdown(): Promise<void> {
    const db = await this.app.container.make('mongoose.db')
    await db.manager.closeAll()
  }

  /**
   * Setup event listeners for logging and debugging
   */
  // @ts-expect-error will use later private field syntax
  async #setupEventListeners(db: Database): Promise<void> {
    const emitter = await this.app.container.make('emitter')
    const logger = await this.app.container.make('logger')

    // Log connection events in development
    if (this.app.inDev) {
      emitter.on('mongodb:connection:connect', (event: DbConnectionEventNode) => {
        logger.info(`MongoDB connection "${event.connection}" established`)
      })

      emitter.on('mongodb:connection:disconnect', (event: DbConnectionEventNode) => {
        logger.info(`MongoDB connection "${event.connection}" disconnected`)
      })

      emitter.on('mongodb:connection:error', (event: DbErrorEventNode) => {
        logger.error(`MongoDB connection "${event.connection}" error: ${event.error.message}`)
      })
    }
  }
}
