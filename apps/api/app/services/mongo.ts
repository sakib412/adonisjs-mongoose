/**
 * App-level alias for the adonisjs-mongoose service.
 *
 * Re-exporting here lets the rest of the app import from the short
 * `#services/mongo` alias instead of the package subpaths:
 *
 *   import mongo, { defineMongoModel } from '#services/mongo'
 *
 * - default export   → the connection manager (MongoService)
 * - defineMongoModel  → the model factory
 */
export { default } from 'adonisjs-mongoose/services/main'
export { defineMongoModel } from 'adonisjs-mongoose/model'
