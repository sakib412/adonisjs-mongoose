/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| Routes for the adonisjs-mongoose demo. Controllers and the health module
| are imported lazily so their modules (which touch the Mongo service and
| define models) evaluate after the app is booted.
|
*/

import router from '@adonisjs/core/services/router'

const UsersController = () => import('#controllers/users_controller')

/**
 * Landing route — lists the demo endpoints.
 */
router.get('/', async () => {
  return {
    package: 'adonisjs-mongoose',
    endpoints: {
      health: 'GET /health',
      users: 'GET|POST /api/users, GET|PUT|DELETE /api/users/:id',
      multiConnection: 'GET /api/demo/multi-connection',
    },
  }
})

/**
 * Health check — runs every registered MongoConnectionCheck.
 */
router.get('/health', async ({ response }) => {
  const { healthChecks } = await import('#start/health')
  const report = await healthChecks.run()
  return response.status(report.isHealthy ? 200 : 503).send(report)
})

/**
 * User CRUD — backed by a model on the default (`primary`) connection.
 */
router
  .group(() => {
    router.get('/users', [UsersController, 'index'])
    router.post('/users', [UsersController, 'store'])
    router.get('/users/:id', [UsersController, 'show'])
    router.put('/users/:id', [UsersController, 'update'])
    router.delete('/users/:id', [UsersController, 'destroy'])
  })
  .prefix('/api')

/**
 * Multi-connection isolation demo.
 *
 * Writes an event to the `analytics` connection, then reports the database
 * each connection is bound to along with document counts — proving the two
 * connections are isolated (different databases) even on the same server.
 */
router.get('/api/demo/multi-connection', async () => {
  const { default: mongo } = await import('#services/mongo')
  const { User } = await import('#models/mongo/user')
  const { Event } = await import('#models/mongo/event')

  await Event.create({ name: 'multi-connection.viewed', value: new Date().toISOString() })

  const [userCount, eventCount] = await Promise.all([
    User.estimatedDocumentCount(),
    Event.estimatedDocumentCount(),
  ])

  return {
    primary: {
      database: mongo.connection('primary').name,
      users: userCount,
    },
    analytics: {
      database: mongo.connection('analytics').name,
      events: eventCount,
    },
    isolated: mongo.connection('primary').name !== mongo.connection('analytics').name,
  }
})
