/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import Test from '#models/test'

const ProductsController = () => import('#controllers/products_controller')

router.get('/', async () => {
  const test = await Test.find()

  return {
    data: test,
  }
})

router.get('/test', async (ctx) => {
  const res = await Test.insertOne({ name: 'Test Name', status: 'active', isActive: true })
  return ctx.response.status(201).send(res)
})

// MongoDB Product API routes
router
  .group(() => {
    // Get product statistics (must be before :id route)
    router.get('/products/stats', [ProductsController, 'stats'])
    router.get('/products/categories', [ProductsController, 'categories'])

    // CRUD routes
    router.get('/products', [ProductsController, 'index'])
    router.get('/products/:id', [ProductsController, 'show'])
    router.post('/products', [ProductsController, 'store'])
    router.put('/products/:id', [ProductsController, 'update'])
    router.delete('/products/:id', [ProductsController, 'destroy'])

    // secondary DB product routes
    router.get('/products_secondary', [ProductsController, 'testSecondaryConnection'])
  })
  .prefix('/api')
