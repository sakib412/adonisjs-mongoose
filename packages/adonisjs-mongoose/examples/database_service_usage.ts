/*
 * Example: Using Database Service for Direct Queries
 */

import db from '#services/mongoose_service'
import type { HttpContext } from '@adonisjs/core/http'
import { Schema } from 'mongoose'

export default class AnalyticsController {
  /**
   * Query using database service directly
   */
  async dashboard({ response }: HttpContext) {
    // Get default connection
    const connection = db.connection()

    // Define or get existing models
    const User = connection.model(
      'User',
      new Schema({
        name: String,
        email: String,
        createdAt: Date,
      })
    )

    const Post = connection.model(
      'Post',
      new Schema({
        title: String,
        authorId: Schema.Types.ObjectId,
        createdAt: Date,
      })
    )

    // Run parallel queries
    const [userCount, postCount, recentUsers] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).lean(),
    ])

    return response.json({
      stats: {
        users: userCount,
        posts: postCount,
      },
      recentUsers,
    })
  }

  /**
   * Query from multiple connections
   */
  async compare({ response }: HttpContext) {
    // Main database
    const mainDb = db.connection('mongodb')
    const User = mainDb.model('User')
    const userCount = await User.countDocuments()

    // Logs database
    const logsDb = db.connection('mongodb_logs')
    const Log = logsDb.model(
      'Log',
      new Schema({
        level: String,
        message: String,
        timestamp: Date,
      })
    )
    const logCount = await Log.countDocuments()

    // Analytics database
    const analyticsDb = db.connection('mongodb_analytics')
    const Event = analyticsDb.model(
      'Event',
      new Schema({
        type: String,
        data: Schema.Types.Mixed,
        timestamp: Date,
      })
    )
    const eventCount = await Event.countDocuments()

    return response.json({
      databases: {
        main: { users: userCount },
        logs: { logs: logCount },
        analytics: { events: eventCount },
      },
    })
  }

  /**
   * Raw connection for advanced operations
   */
  async rawQuery({ response }: HttpContext) {
    const connection = db.connection()

    // Access native MongoDB driver
    const rawDb = connection.getClient()

    // Run native MongoDB commands
    const collections = await rawDb.db.listCollections().toArray()
    const stats = await rawDb.db.stats()

    return response.json({
      collections: collections.map((c) => c.name),
      stats: {
        collections: stats.collections,
        dataSize: stats.dataSize,
        indexSize: stats.indexSize,
      },
    })
  }

  /**
   * Using transactions
   */
  async transfer({ request, response }: HttpContext) {
    const { fromUserId, toUserId, amount } = request.only(['fromUserId', 'toUserId', 'amount'])

    const connection = db.connection()
    const session = await connection.startSession()

    try {
      await session.withTransaction(async () => {
        const Account = connection.model('Account')

        // Deduct from sender
        const sender = await Account.findByIdAndUpdate(
          fromUserId,
          { $inc: { balance: -amount } },
          { session, new: true }
        )

        if (!sender || sender.balance < 0) {
          throw new Error('Insufficient balance')
        }

        // Add to receiver
        await Account.findByIdAndUpdate(toUserId, { $inc: { balance: amount } }, { session })
      })

      return response.json({ message: 'Transfer successful' })
    } catch (error) {
      return response.badRequest({
        message: 'Transfer failed',
        error: error.message,
      })
    } finally {
      await session.endSession()
    }
  }

  /**
   * Aggregation pipeline
   */
  async usersByCountry({ response }: HttpContext) {
    const connection = db.connection()
    const User = connection.model('User')

    const result = await User.aggregate([
      // Match active users
      { $match: { isActive: true } },

      // Group by country
      {
        $group: {
          _id: '$country',
          count: { $sum: 1 },
          avgAge: { $avg: '$age' },
        },
      },

      // Sort by count descending
      { $sort: { count: -1 } },

      // Limit to top 10
      { $limit: 10 },

      // Reshape output
      {
        $project: {
          country: '$_id',
          userCount: '$count',
          averageAge: { $round: ['$avgAge', 2] },
          _id: 0,
        },
      },
    ])

    return response.json(result)
  }

  /**
   * Bulk operations
   */
  async bulkUpdate({ request, response }: HttpContext) {
    const updates = request.input('updates', [])

    const connection = db.connection()
    const User = connection.model('User')

    // Build bulk operations
    const bulkOps = updates.map((update: any) => ({
      updateOne: {
        filter: { _id: update.id },
        update: { $set: update.data },
      },
    }))

    const result = await User.bulkWrite(bulkOps)

    return response.json({
      matched: result.matchedCount,
      modified: result.modifiedCount,
      upserted: result.upsertedCount,
    })
  }

  /**
   * Text search
   */
  async search({ request, response }: HttpContext) {
    const query = request.input('q')

    const connection = db.connection()
    const User = connection.model('User')

    const results = await User.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } })

    return response.json(results)
  }

  /**
   * Geospatial query
   */
  async nearby({ request, response }: HttpContext) {
    const { lat, lng, maxDistance } = request.only(['lat', 'lng', 'maxDistance'])

    const connection = db.connection()
    const Store = connection.model(
      'Store',
      new Schema({
        name: String,
        location: {
          type: { type: String, enum: ['Point'], default: 'Point' },
          coordinates: [Number],
        },
      })
    )

    const stores = await Store.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [lng, lat],
          },
          $maxDistance: maxDistance || 5000,
        },
      },
    })

    return response.json(stores)
  }
}
