import { defineConfig } from 'adonisjs-mongoose'
import env from '#start/env'

const mongoConfig = defineConfig({
  connection: env.get('DEFAULT_MONGODB_CONNECTION', 'primary'),
  connections: {
    primary: {
      uri: env.get('MONGODB_URI'),
    },
    secondary: {
      uri: env.get('MONGODB_SECONDARY_URI'),
    },
  },
})

export default mongoConfig
