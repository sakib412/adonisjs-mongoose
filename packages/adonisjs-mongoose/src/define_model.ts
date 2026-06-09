import type { InferSchemaType, Model, Schema } from 'mongoose'
import type { MongoManager } from './manager.js'
import type { MongoConnectionName } from './types.js'
import mongo from './services/main.js'

/**
 * Options for {@link defineMongoModel}.
 */
export interface DefineMongoModelOptions {
  /**
   * Name of the connection (from `config/mongoose`) this model binds to.
   * Constrained to the configured connection names; unknown names are a
   * compile error. Defaults to the configured default connection.
   */
  connection?: MongoConnectionName
}

/**
 * Define a Mongoose model bound to a managed connection — the canonical
 * way to declare a model with this package (the analogue of extending
 * Lucid's `BaseModel`).
 *
 * Instead of the global `mongoose.model()` registry, the schema is
 * compiled on the named connection from the manager, so a model can
 * target any configured database.
 *
 * NOTE: an already-compiled model is reused (see below), so changing a
 * schema's shape requires a full server restart — HMR alone will keep
 * serving the previously compiled model.
 *
 * @example
 * const pageSchema = new Schema({ ... })
 * export const Page = defineMongoModel('Page', pageSchema, { connection: 'primary' })
 */
export function defineMongoModel<TSchema extends Schema>(
  name: string,
  schema: TSchema,
  options: DefineMongoModelOptions = {}
): Model<InferSchemaType<TSchema>> {
  if (!mongo) {
    throw new Error(
      `Cannot define Mongo model "${name}" before the app is booted. ` +
        'Define models in modules imported after boot (controllers, services, routes), not in providers.'
    )
  }

  // The public `connection` option is type-checked against the user's
  // configured names; internally we resolve via the connection-agnostic
  // manager so this compiles whether or not the user augmented the list.
  const connection = (mongo as MongoManager).connection(options.connection)

  // Reuse an already-compiled model (avoids Mongoose's OverwriteModelError
  // when the same connection is reused across HMR reloads). Trade-off: a
  // schema change is only picked up after a full restart.
  const existing = connection.models[name] as Model<InferSchemaType<TSchema>> | undefined

  return existing ?? connection.model<InferSchemaType<TSchema>>(name, schema)
}
