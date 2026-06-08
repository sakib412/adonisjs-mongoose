import { Schema, type InferSchemaType } from 'mongoose'
import { defineMongoModel } from '#services/mongo'

const schema = new Schema(
  {
    name: { type: String, required: true },
    value: { type: String },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    minimize: false,
  }
)

export type EventDoc = InferSchemaType<typeof schema>

/**
 * Bound to the `analytics` connection — a separate database. Passing an
 * unconfigured name here (e.g. `{ connection: 'nope' }`) is a compile error.
 */
export const Event = defineMongoModel('Event', schema, { connection: 'analytics' })
