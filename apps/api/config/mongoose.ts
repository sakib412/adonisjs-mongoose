import { defineConfig } from 'adonisjs-mongoose'
import env from '#start/env'

const mongoConfig = defineConfig({
  connection: env.get('DEFAULT_MONGODB_CONNECTION', 'mongodb'),
  connections: {
    mongodb: {
      uri: env.get('MONGODB_URI'),
    },
    mongodb_secondary: {
      uri: env.get('MONGODB_SECONDARY_URI'),
    },
  },
})

export default mongoConfig
