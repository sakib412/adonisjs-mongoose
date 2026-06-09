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
 *   `config/mongoose`.
 * - `start()` opens the default connection in the `web` environment, with
 *   behaviour driven by the `eager` and `failFast` config flags (see the
 *   method for the matrix). Ace commands skip this and connect on demand.
 * - `boot()` registers REPL helpers when running `node ace repl`.
 * - `shutdown()` closes every open connection.
 */
export default class MongoProvider {
  constructor(protected app: ApplicationService) {}

  register() {
    this.app.container.singleton('mongo', async (resolver) => {
      const config = this.app.config.get<MongoConfig>('mongoose')
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

  /**
   * Open the default connection at boot, in the `web` environment only.
   *
   * | `eager` | `failFast` | behaviour                                          |
   * | ------- | ---------- | -------------------------------------------------- |
   * | `false` | (any)      | no-op — connect lazily on first query              |
   * | `true`  | `false`    | non-blocking connect; a failure only logs (default)|
   * | `true`  | `true`     | awaited connect; a failure throws and crashes boot |
   *
   * Non-`web` environments (ace, tests, repl, queue workers) always connect
   * on demand.
   */
  async start() {
    if (this.app.getEnvironment() !== 'web') return

    const mongo = await this.app.container.make('mongo')
    if (!mongo.eager) return

    if (mongo.failFast) {
      // Hard dependency: block boot until connected, surfacing a bad URI or
      // an unreachable server as a startup crash.
      await mongo.connect()
      return
    }

    // Soft dependency: warm the pool without blocking boot. The driver keeps
    // retrying in the background, so we only log the initial failure rather
    // than letting an unhandled rejection take the process down.
    const logger = await this.app.container.make('logger')
    mongo.connect().catch((error) => {
      logger.error({ err: error }, 'Eager Mongo connection failed; will retry in the background')
    })
  }

  async shutdown() {
    const mongo = await this.app.container.make('mongo')
    await mongo.closeAll()
  }
}
