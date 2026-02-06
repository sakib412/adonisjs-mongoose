import db from 'adonisjs-mongoose/services/db'
import { Schema } from 'mongoose'

const connection = db.connection('secondary')

const TestSchema = new Schema(
  {
    name: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

const Test = connection.model('TestModel', TestSchema)

export default Test
