/*
 * Example usage of adonisjs-mongoose
 */

import { BaseModel } from 'adonisjs-mongoose'
import { Schema } from 'mongoose'

/**
 * Example 1: Simple User model using default connection
 */
export class User extends BaseModel {
  static schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  })
}

/**
 * Example 2: Log model using secondary connection
 */
export class Log extends BaseModel {
  // Specify a different connection
  static connection = 'mongodb_secondary'
  
  // Optionally specify collection name
  static collectionName = 'application_logs'

  static schema = new Schema({
    level: { type: String, enum: ['info', 'warning', 'error'], required: true },
    message: { type: String, required: true },
    metadata: Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now },
  })
}

/**
 * Example 3: Post model with references
 */
export class Post extends BaseModel {
  static schema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: String }],
    published: { type: Boolean, default: false },
    publishedAt: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  })
}

/**
 * Usage examples:
 */

// Creating documents
async function exampleUsage() {
  // Create a user
  const user = await User.create({
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashed_password',
  })

  // Find users
  const users = await User.find({ role: 'admin' })
  const oneUser = await User.findOne({ email: 'john@example.com' })
  const userById = await User.findById('507f1f77bcf86cd799439011')

  // Update user
  await User.updateOne(
    { email: 'john@example.com' },
    { $set: { name: 'John Smith' } }
  )

  // Delete user
  await User.deleteOne({ email: 'john@example.com' })

  // Using query builder
  const activeUsers = await User.find()
    .where('role').equals('user')
    .where('createdAt').gte(new Date('2024-01-01'))
    .sort({ createdAt: -1 })
    .limit(10)
    .exec()

  // Create post with reference
  const post = await Post.create({
    title: 'My First Post',
    content: 'This is the content',
    author: user._id,
    tags: ['javascript', 'adonisjs'],
  })

  // Find with population
  const posts = await Post.find()
    .populate('author')
    .exec()

  // Aggregation
  const stats = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
  ])

  // Using secondary connection (Log model)
  await Log.create({
    level: 'info',
    message: 'User created successfully',
    metadata: { userId: user._id },
  })

  // Direct access to mongoose connection
  const db = await import('#services/mongoose')
  const connection = db.default.connection() // default connection
  const secondaryConnection = db.default.connection('mongodb_secondary')

  // Use native mongoose model methods
  const UserModel = User.getModel()
  const document = new UserModel({ name: 'Jane', email: 'jane@example.com' })
  await document.save()
}

export default exampleUsage
