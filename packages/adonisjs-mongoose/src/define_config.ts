import type { MongoConfig, MongoConnectionConfig } from './types.js'

/**
 * Type-safe config builder, used inside `config/mongoose.ts`.
 *
 * Mirrors `defineConfig` from `@adonisjs/lucid`. Preserves the literal
 * connection names so `mongo.connection('analytics')` is autocompleted
 * and type-checked against the configured connections.
 *
 * @example
 * export default defineConfig({
 *   connection: env.get('MONGO_CONNECTION', 'primary'),
 *   connections: {
 *     primary: { uri: env.get('MONGO_URI') },
 *     analytics: { uri: env.get('MONGO_ANALYTICS_URI') },
 *   },
 * })
 */
export function defineConfig<Connections extends Record<string, MongoConnectionConfig>>(
  config: MongoConfig<Connections>
): MongoConfig<Connections> {
  return config
}
