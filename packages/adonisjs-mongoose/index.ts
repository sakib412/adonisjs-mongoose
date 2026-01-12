/*
 * adonisjs-mongoose
 *
 * (c) Najmus Sakib
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export { configure } from './configure.js'
export { defineConfig } from './src/define_config.js'
export { Database } from './src/database/main.js'
export { BaseModel } from './src/model/base_model.js'
export { Connection } from './src/connection/index.js'
export { ConnectionManager } from './src/connection/manager.js'

/**
 * Export types
 */
export type {
  DatabaseConfig,
  MongooseConnectionConfig,
  MongoDBConnectionNode,
  DatabaseContract,
  MongooseConnectionContract,
  ConnectionManagerContract,
  ConnectionNode,
  DbEventNode,
  DbConnectionEventNode,
  DbErrorEventNode,
} from './src/types/main.js'
