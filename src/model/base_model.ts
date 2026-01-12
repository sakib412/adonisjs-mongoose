/*
 * adonisjs-mongoose
 *
 * (c) Your Name
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Connection as MongooseConnection, Model, Schema, Document } from 'mongoose'
import type { DatabaseContract } from '../types/main.js'

/**
 * Base model for all mongoose models
 * Provides connection management and model registry
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
   */
  static schema: Schema

  /**
   * Compiled mongoose models cache
   * Key: connection name, Value: compiled model
   */
  private static modelCache: Map<string, Model<any>> = new Map()

  /**
   * Get the connection instance for this model
   */
  static getConnection(): MongooseConnection {
    const connectionName = this.connection || this.$db.primaryConnectionName
    return this.$db.connection(connectionName)
  }

  /**
   * Get the compiled mongoose model
   */
  static getModel<T = Document>(): Model<T> {
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
    const model = connection.model<T>(this.name, this.schema, collectionName)
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
   * Proxy static methods to mongoose model
   */

  static find(...args: Parameters<Model<any>['find']>) {
    return this.getModel().find(...args)
  }

  static findOne(...args: Parameters<Model<any>['findOne']>) {
    return this.getModel().findOne(...args)
  }

  static findById(...args: Parameters<Model<any>['findById']>) {
    return this.getModel().findById(...args)
  }

  static findByIdAndUpdate(...args: Parameters<Model<any>['findByIdAndUpdate']>) {
    return this.getModel().findByIdAndUpdate(...args)
  }

  static findByIdAndDelete(...args: Parameters<Model<any>['findByIdAndDelete']>) {
    return this.getModel().findByIdAndDelete(...args)
  }

  static findOneAndUpdate(...args: Parameters<Model<any>['findOneAndUpdate']>) {
    return this.getModel().findOneAndUpdate(...args)
  }

  static findOneAndDelete(...args: Parameters<Model<any>['findOneAndDelete']>) {
    return this.getModel().findOneAndDelete(...args)
  }

  static findOneAndReplace(...args: Parameters<Model<any>['findOneAndReplace']>) {
    return this.getModel().findOneAndReplace(...args)
  }

  static create(...args: Parameters<Model<any>['create']>) {
    return this.getModel().create(...args)
  }

  static insertMany(...args: Parameters<Model<any>['insertMany']>) {
    return this.getModel().insertMany(...args)
  }

  static updateOne(...args: Parameters<Model<any>['updateOne']>) {
    return this.getModel().updateOne(...args)
  }

  static updateMany(...args: Parameters<Model<any>['updateMany']>) {
    return this.getModel().updateMany(...args)
  }

  static deleteOne(...args: Parameters<Model<any>['deleteOne']>) {
    return this.getModel().deleteOne(...args)
  }

  static deleteMany(...args: Parameters<Model<any>['deleteMany']>) {
    return this.getModel().deleteMany(...args)
  }

  static countDocuments(...args: Parameters<Model<any>['countDocuments']>) {
    return this.getModel().countDocuments(...args)
  }

  static estimatedDocumentCount(...args: Parameters<Model<any>['estimatedDocumentCount']>) {
    return this.getModel().estimatedDocumentCount(...args)
  }

  static distinct(...args: Parameters<Model<any>['distinct']>) {
    return this.getModel().distinct(...args)
  }

  static exists(...args: Parameters<Model<any>['exists']>) {
    return this.getModel().exists(...args)
  }

  static where(...args: Parameters<Model<any>['where']>) {
    return this.getModel().where(...args)
  }

  static aggregate(...args: Parameters<Model<any>['aggregate']>) {
    return this.getModel().aggregate(...args)
  }

  static bulkWrite(...args: Parameters<Model<any>['bulkWrite']>) {
    return this.getModel().bulkWrite(...args)
  }

  static watch(...args: Parameters<Model<any>['watch']>) {
    return this.getModel().watch(...args)
  }

  static hydrate(...args: Parameters<Model<any>['hydrate']>) {
    return this.getModel().hydrate(...args)
  }

  static populate(...args: Parameters<Model<any>['populate']>) {
    return this.getModel().populate(...args)
  }

  static startSession(...args: Parameters<Model<any>['startSession']>) {
    return this.getModel().startSession(...args)
  }
}
