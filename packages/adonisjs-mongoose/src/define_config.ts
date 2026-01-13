/*
 * adonisjs-mongoose
 *
 * (c) Najmus Sakib
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RuntimeException } from '@poppinss/utils'
import type { MongooseConnectionsList } from './types/main.js'

/**
 * Define config for mongoose connections
 *
 * @param config - Mongoose configuration object
 *
 * @example
 * ```ts
 * export default defineConfig({
 *   connection: 'mongodb',
 *   connections: {
 *     mongodb: {
 *       uri: 'mongodb://localhost:27017/mydb',
 *       options: {}
 *     },
 *     mongodb_secondary: {
 *       connection: {
 *         host: 'localhost',
 *         port: 27017,
 *         database: 'secondary'
 *       }
 *     }
 *   }
 * })
 * ```
 */
export function defineConfig<Connections extends MongooseConnectionsList>(config: {
  connection: keyof Connections
  connections: Connections
}): {
  connection: keyof Connections
  connections: Connections
} {
  if (!config) {
    throw new RuntimeException('Invalid config. It must be an object')
  }

  if (!config.connections) {
    throw new RuntimeException('Missing "connections" property in the mongoose config file')
  }

  if (!config.connection) {
    throw new RuntimeException(
      'Missing "connection" property in mongoose config. Specify a default connection to use'
    )
  }

  if (!config.connections[config.connection]) {
    throw new RuntimeException(
      `Missing "connections.${String(
        config.connection
      )}". It is referenced by the "default" mongoose connection`
    )
  }

  return config
}
