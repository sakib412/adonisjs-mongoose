/**
 * Public entry point.
 *
 * Kept free of any module that resolves the container (the manager
 * accessor and model factory), so `node ace configure` — which imports
 * this entry before the provider is registered — never triggers a
 * premature `container.make('mongo')`. Those live on subpaths:
 * `adonisjs-mongoose/services/main` and `/model`.
 */
export { configure } from './configure.js'
export { stubsRoot } from './stubs/main.js'
export { defineConfig } from './define_config.js'
export { MongoManager } from './manager.js'
export { MongoConnectionCheck } from './checks/connection_check.js'
export type {
  InferConnections,
  MongoConfig,
  MongoConnectionConfig,
  MongoConnectionName,
  MongoConnectionReport,
  MongoConnections,
  MongoConnectionsList,
  MongoService,
} from './types.js'
