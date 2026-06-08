import { BaseCheck, Result } from '@adonisjs/core/health'
import type { HealthCheckResult } from '@adonisjs/core/types/health'
import type { MongoManager } from '../manager.js'
import type { MongoConnectionName, MongoService } from '../types.js'

/**
 * Health check that pings a Mongo connection and reports its state.
 *
 * Register it in `start/health.ts` (which runs at boot, so the resolved
 * `mongo` service is available):
 *
 * @example
 * import {MongoConnectionCheck} from 'adonisjs-mongoose'
 * import mongo from '#services/mongo'
 *
 * export const healthChecks = new HealthChecks().register([
 *   new MongoConnectionCheck(mongo),
 *   new MongoConnectionCheck(mongo, 'analytics'),
 * ])
 */
export class MongoConnectionCheck extends BaseCheck {
  name: string
  #connectionName: string

  constructor(
    private manager: MongoService,
    connectionName?: MongoConnectionName
  ) {
    super()
    this.#connectionName = (connectionName as string) ?? manager.defaultConnection
    this.name = `Mongo connection (${this.#connectionName})`
  }

  async run(): Promise<HealthCheckResult> {
    try {
      const connection = (this.manager as MongoManager).connection(this.#connectionName)

      // `db.admin().ping()` is the cheapest round-trip that proves the
      // socket is alive, not just that mongoose buffered the request.
      await connection.asPromise()
      await connection.db?.admin().ping()

      return Result.ok(`Mongo connection "${this.#connectionName}" is healthy`).mergeMetaData({
        connection: this.#connectionName,
      })
    } catch (error) {
      return Result.failed(
        `Mongo connection "${this.#connectionName}" is unreachable`,
        error instanceof Error ? error : new Error(String(error))
      )
    }
  }
}
