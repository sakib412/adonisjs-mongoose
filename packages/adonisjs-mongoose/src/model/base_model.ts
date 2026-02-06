/*
 * adonisjs-mongoose
 *
 * (c) Najmus Sakib
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@poppinss/utils'
import type { Connection as MongooseConnection, Model, Schema } from 'mongoose'
import type { DatabaseContract } from '../types/main.js'

/**
 * Base model for all mongoose models in AdonisJS
 * Provides connection management and model registry
 *
 * @example
 * ```ts
 * import { Schema } from 'mongoose'
 * import { BaseModel } from '@ezycourse/adonisjs-mongoose'
 *
 * export default class User extends BaseModel {
 *   static schema = new Schema({
 *     name: { type: String, required: true },
 *     email: { type: String, required: true, unique: true }
 *   })
 * }
 *
 * // Usage
 * const users = await User.find({ name: 'John' })
 * ```
 * @deprecated this will not give type safety, create model only via connection.model(...) from this package.
 */

export class BaseModel {
  /**
   * Database instance (injected by provider)
   */
  static $db: DatabaseContract

  /**
   * Connection name for this model
   * Defaults to primary connection if not specified
   */
  static connection?: string

  /**
   * Collection name
   * If not specified, mongoose will use the pluralized model name
   */
  static collectionName?: string

  /**
   * Mongoose schema definition
   * Must be defined in child classes
   */
  static schema: Schema

  /**
   * Compiled mongoose models cache (shared across all models)
   * Key: "{connectionName}:{modelName}", Value: compiled model
   */
  private static modelCache: Map<string, Model<any>> = new Map()

  /**
   * Get the connection instance for this model
   *
   * @throws {Error} If database is not initialized or connection not found
   */
  static getConnection(): MongooseConnection {
    if (!this.$db) {
      throw new Exception(
        'Database not initialized. Ensure DatabaseProvider is registered in your AdonisJS application.'
      )
    }

    const connectionName = this.connection || this.$db.primaryConnectionName
    const conn = this.$db.connection(connectionName)

    if (!conn) {
      throw new Error(
        `Connection "${connectionName}" not found. Check your database configuration.`
      )
    }

    return conn
  }

  /**
   * Get the compiled mongoose model
   *
   * @throws {Error} If schema is not defined
   */
  static getModel() {
    if (!this.schema) {
      throw new Error(
        `Schema not defined for model ${this.name}. Define a static schema property in your model class.`
      )
    }

    const connectionName = this.connection || this.$db.primaryConnectionName
    const cacheKey = `${connectionName}:${this.name}`

    // Return cached model if exists
    if (this.modelCache.has(cacheKey)) {
      return this.modelCache.get(cacheKey)!
    }

    // Get connection
    const connection = this.getConnection()

    // Get collection name
    const collectionName = this.collectionName || undefined

    // Compile and cache model
    const model = connection.model(this.name, this.schema, collectionName)
    this.modelCache.set(cacheKey, model)

    return model
  }

  /**
   * Clear the model cache (useful for testing)
   */
  static clearCache(): void {
    this.modelCache.clear()
  }

  /**
   * Create a new document instance
   *
   * @param data - Initial document data
   * @returns New document instance
   */
  static new(data?: Record<string, any>) {
    const Model = this.getModel()
    return new Model(data)
  }

  /**
   * Proxy static methods to mongoose model
   */

  static find(...args: Parameters<Model<any>['find']>): ReturnType<Model<any>['find']> {
    return this.getModel().find(...args)
  }

  static findOne(...args: Parameters<Model<any>['findOne']>): ReturnType<Model<any>['findOne']> {
    return this.getModel().findOne(...args)
  }

  static findById(...args: Parameters<Model<any>['findById']>): ReturnType<Model<any>['findById']> {
    return this.getModel().findById(...args)
  }

  static findByIdAndUpdate(
    ...args: Parameters<Model<any>['findByIdAndUpdate']>
  ): ReturnType<Model<any>['findByIdAndUpdate']> {
    return this.getModel().findByIdAndUpdate(...args)
  }

  static findByIdAndDelete(
    ...args: Parameters<Model<any>['findByIdAndDelete']>
  ): ReturnType<Model<any>['findByIdAndDelete']> {
    return this.getModel().findByIdAndDelete(...args)
  }

  static findOneAndUpdate(
    ...args: Parameters<Model<any>['findOneAndUpdate']>
  ): ReturnType<Model<any>['findOneAndUpdate']> {
    return this.getModel().findOneAndUpdate(...args)
  }

  static findOneAndDelete(
    ...args: Parameters<Model<any>['findOneAndDelete']>
  ): ReturnType<Model<any>['findOneAndDelete']> {
    return this.getModel().findOneAndDelete(...args)
  }

  static findOneAndReplace(
    ...args: Parameters<Model<any>['findOneAndReplace']>
  ): ReturnType<Model<any>['findOneAndReplace']> {
    return this.getModel().findOneAndReplace(...args)
  }

  static create(...args: Parameters<Model<any>['create']>): ReturnType<Model<any>['create']> {
    return this.getModel().create(...args)
  }

  static insertMany(
    ...args: Parameters<Model<any>['insertMany']>
  ): ReturnType<Model<any>['insertMany']> {
    return this.getModel().insertMany(...args)
  }

  static updateOne(
    ...args: Parameters<Model<any>['updateOne']>
  ): ReturnType<Model<any>['updateOne']> {
    return this.getModel().updateOne(...args)
  }

  static updateMany(
    ...args: Parameters<Model<any>['updateMany']>
  ): ReturnType<Model<any>['updateMany']> {
    return this.getModel().updateMany(...args)
  }

  static deleteOne(
    ...args: Parameters<Model<any>['deleteOne']>
  ): ReturnType<Model<any>['deleteOne']> {
    return this.getModel().deleteOne(...args)
  }

  static deleteMany(
    ...args: Parameters<Model<any>['deleteMany']>
  ): ReturnType<Model<any>['deleteMany']> {
    return this.getModel().deleteMany(...args)
  }

  static replaceOne(
    ...args: Parameters<Model<any>['replaceOne']>
  ): ReturnType<Model<any>['replaceOne']> {
    return this.getModel().replaceOne(...args)
  }

  static countDocuments(
    ...args: Parameters<Model<any>['countDocuments']>
  ): ReturnType<Model<any>['countDocuments']> {
    return this.getModel().countDocuments(...args)
  }

  static estimatedDocumentCount(
    ...args: Parameters<Model<any>['estimatedDocumentCount']>
  ): ReturnType<Model<any>['estimatedDocumentCount']> {
    return this.getModel().estimatedDocumentCount(...args)
  }

  static distinct(...args: Parameters<Model<any>['distinct']>): ReturnType<Model<any>['distinct']> {
    return this.getModel().distinct(...args)
  }

  static exists(...args: Parameters<Model<any>['exists']>): ReturnType<Model<any>['exists']> {
    return this.getModel().exists(...args)
  }

  static where(...args: Parameters<Model<any>['where']>): ReturnType<Model<any>['where']> {
    return this.getModel().where(...args)
  }

  static aggregate(
    ...args: Parameters<Model<any>['aggregate']>
  ): ReturnType<Model<any>['aggregate']> {
    return this.getModel().aggregate(...args)
  }

  static bulkWrite(
    ...args: Parameters<Model<any>['bulkWrite']>
  ): ReturnType<Model<any>['bulkWrite']> {
    return this.getModel().bulkWrite(...args)
  }

  static watch(...args: Parameters<Model<any>['watch']>): ReturnType<Model<any>['watch']> {
    return this.getModel().watch(...args)
  }

  static hydrate(...args: Parameters<Model<any>['hydrate']>): ReturnType<Model<any>['hydrate']> {
    return this.getModel().hydrate(...args)
  }

  static populate(...args: Parameters<Model<any>['populate']>): ReturnType<Model<any>['populate']> {
    return this.getModel().populate(...args)
  }

  static startSession(
    ...args: Parameters<Model<any>['startSession']>
  ): ReturnType<Model<any>['startSession']> {
    return this.getModel().startSession(...args)
  }

  static validate(...args: Parameters<Model<any>['validate']>): ReturnType<Model<any>['validate']> {
    return this.getModel().validate(...args)
  }
}
