import mongo from '#services/mongo'
import { HealthChecks } from '@adonisjs/core/health'
import { MongoConnectionCheck } from 'adonisjs-mongoose'

/**
 * Health checks for the app. `MongoConnectionCheck` pings a connection and
 * reports its state. We register one per configured connection.
 *
 * This module is imported lazily (from the `/health` route handler) so it
 * evaluates after the app is booted, when the `mongo` service is resolved.
 */
export const healthChecks = new HealthChecks().register([
  new MongoConnectionCheck(mongo),
  new MongoConnectionCheck(mongo, 'analytics'),
])
