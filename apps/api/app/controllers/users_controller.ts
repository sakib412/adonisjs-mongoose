import type { HttpContext } from '@adonisjs/core/http'
import { User } from '#models/mongo/user'

/**
 * CRUD over the `User` model, which is bound to the default (`primary`)
 * Mongo connection via `defineMongoModel`. The model is a plain Mongoose
 * model, so all of Mongoose's query API is available.
 */
export default class UsersController {
  /**
   * GET /api/users — list users (most recent first).
   */
  async index({ response }: HttpContext) {
    const users = await User.find().sort({ created_at: -1 }).lean()
    return response.ok({ data: users })
  }

  /**
   * POST /api/users — create a user.
   */
  async store({ request, response }: HttpContext) {
    const data = request.only(['name', 'email'])
    const user = await User.create(data)
    return response.created({ data: user })
  }

  /**
   * GET /api/users/:id — fetch a single user.
   */
  async show({ params, response }: HttpContext) {
    const user = await User.findById(params.id).lean()
    if (!user) {
      return response.notFound({ message: 'User not found' })
    }
    return response.ok({ data: user })
  }

  /**
   * PUT /api/users/:id — update a user.
   */
  async update({ params, request, response }: HttpContext) {
    const data = request.only(['name', 'email'])
    const user = await User.findByIdAndUpdate(params.id, data, {
      new: true,
      runValidators: true,
    }).lean()

    if (!user) {
      return response.notFound({ message: 'User not found' })
    }
    return response.ok({ data: user })
  }

  /**
   * DELETE /api/users/:id — delete a user.
   */
  async destroy({ params, response }: HttpContext) {
    const user = await User.findByIdAndDelete(params.id).lean()
    if (!user) {
      return response.notFound({ message: 'User not found' })
    }
    return response.ok({ message: 'User deleted' })
  }
}
