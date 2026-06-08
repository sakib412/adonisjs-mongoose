import type { ApplicationService } from '@adonisjs/core/types'
import { MongoManager } from '../manager.js'
import type { MongoConfig, MongoService } from '../types.js'

declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    mongo: MongoService
  }
}

/**
 * Wires Mongoose into AdonisJS, parallel to `@adonisjs/lucid`'s
 * database provider.
 *
 * - `register()` binds the {@link MongoManager} singleton from
 *   `config/mongo`.
 * - `start()` eagerly opens the default connection in the `web`
 *   environment so the app fails fast on a bad URI (ace commands skip
 *   this and connect on demand).
 * - `boot()` registers REPL helpers when running `node ace repl`.
 * - `shutdown()` closes every open connection.
 */
export default class MongoProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.singleton('mongo', async (resolver) => {
      const config = this.app.config.get<MongoConfig>('mongo')
      const logger = await resolver.make('logger')
      // The runtime manager is connection-agnostic; the container binding
      // is typed as MongoService so resolved instances carry the user's
      // augmented connection names.
      return new MongoManager(config, logger) as MongoService
    })
  }

  async boot() {
    if (this.app.getEnvironment() === 'repl') {
      const { defineReplBindings } = await import('../bindings/repl.js')
      defineReplBindings(this.app, await this.app.container.make('repl'))
    }
  }

  async start() {
    if (this.app.getEnvironment() !== 'web') return
    const mongo = await this.app.container.make('mongo')
    await mongo.connect()
  }

  async shutdown() {
    const mongo = await this.app.container.make('mongo')
    await mongo.closeAll()
  }
}
