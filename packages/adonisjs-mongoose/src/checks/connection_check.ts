import { BaseCheck, Result } from '@adonisjs/core/health'
import type { HealthCheckResult } from '@adonisjs/core/types/health'
import type { MongoManager } from '../manager.js'
import type { MongoConnectionName, MongoService } from '../types.js'

/**
 * Health check that pings a Mongo connection and reports its state.
 *
 * Severity follows the connection's `failFast` config: when Mongo is a hard
 * dependency (`failFast: true`) an unreachable connection reports a fatal
 * `error`; otherwise it reports a non-fatal `warning`, so the overall report
 * stays healthy while surfacing the degradation.
 *
 * The probe is capped by `timeoutMs` (default 2000) so a down server cannot
 * hang the health endpoint for the driver's full `serverSelectionTimeoutMS`.
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
 *   new MongoConnectionCheck(mongo, 'analytics', 5000), // custom probe timeout
 * ])
 */
export class MongoConnectionCheck extends BaseCheck {
  name: string
  #connectionName: string
  #timeoutMs: number

  constructor(
    private manager: MongoService,
    connectionName?: MongoConnectionName,
    timeoutMs: number = 2000
  ) {
    super()
    this.#connectionName = (connectionName as string) ?? manager.defaultConnection
    this.#timeoutMs = timeoutMs
    this.name = `Mongo connection (${this.#connectionName})`
  }

  async run(): Promise<HealthCheckResult> {
    try {
      const connection = (this.manager as MongoManager).connection(this.#connectionName)

      // `db.admin().ping()` is the cheapest round-trip that proves the
      // socket is alive, not just that mongoose buffered the request. Cap it
      // with a timeout so a dead server doesn't stall the health endpoint.
      await this.#withTimeout(
        (async () => {
          await connection.asPromise()
          await connection.db?.admin().ping()
        })()
      )

      return Result.ok(`Mongo connection "${this.#connectionName}" is healthy`).mergeMetaData({
        connection: this.#connectionName,
      })
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error))
      const message = `Mongo connection "${this.#connectionName}" is unreachable`

      // Hard dependency -> fatal error (report becomes unhealthy). Soft
      // dependency -> warning (report stays healthy, degradation surfaced).
      return this.manager.failFast
        ? Result.failed(message, err)
        : Result.warning(message).mergeMetaData({
            connection: this.#connectionName,
            error: { message: err.message },
          })
    }
  }

  /**
   * Race a probe against the configured timeout so an unreachable server
   * rejects in `timeoutMs` rather than after the driver's server-selection
   * window (30s by default).
   */
  #withTimeout<T>(promise: Promise<T>): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () =>
          reject(
            new Error(
              `Mongo connection "${this.#connectionName}" did not respond within ${this.#timeoutMs}ms`
            )
          ),
        this.#timeoutMs
      )
    })
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer)) as Promise<T>
  }
}
