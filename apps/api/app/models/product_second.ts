import { BaseModel } from 'adonisjs-mongoose'
import { Schema } from 'mongoose'

export default class Product2 extends BaseModel {
  static connection = 'secondary' // Uses MongoDB connection from config/mongoose.ts
  static collectionName = 'products'

  static schema = new Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
      stock: {
        type: Number,
        default: 0,
        min: 0,
      },
      category: {
        type: String,
        required: true,
        index: true,
      },
      tags: [String],
      isActive: {
        type: Boolean,
        default: true,
      },
      images: [String],
    },
    {
      timestamps: true,
    }
  )

  // Add indexes for better query performance
  static {
    this.schema.index({ name: 'text', description: 'text' })
    this.schema.index({ category: 1, price: 1 })
    this.schema.index({ isActive: 1 })
  }
}
