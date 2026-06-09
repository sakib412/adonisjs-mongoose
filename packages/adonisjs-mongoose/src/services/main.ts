import app from '@adonisjs/core/services/app'
import type { MongoService } from '../types.js'

/**
 * Resolved {@link MongoManager} singleton — the package's public service,
 * mirroring `@adonisjs/lucid/services/db`.
 *
 * Resolution is deferred until the app is booted (so importing this module
 * during `node ace configure`, before the provider is registered, is
 * harmless). By the time application code reaches a query, the manager is
 * assigned.
 *
 * @example
 * import mongo from 'adonisjs-mongoose/services/main'
 * mongo.connection('analytics').collection('events')
 */
let mongo: MongoService

await app.booted(async () => {
  try {
    mongo = await app.container.make('mongo')
  } catch (error) {
    throw new Error(
      'Failed to resolve the Mongo manager. Ensure "adonisjs-mongoose/mongo_provider" ' +
        'is registered in adonisrc.ts and config/mongoose.ts exists. Cause: ' +
        (error instanceof Error ? error.message : String(error))
    )
  }
})

export { mongo as default }
