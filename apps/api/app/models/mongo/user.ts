import { Schema, type InferSchemaType } from 'mongoose'
import { defineMongoModel } from '#services/mongo'

const schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    minimize: false,
  }
)

export type UserDoc = InferSchemaType<typeof schema>

/**
 * Bound to the default connection (`primary`) — no `connection` option.
 */
export const User = defineMongoModel('User', schema)
