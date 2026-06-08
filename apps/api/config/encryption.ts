import env from '#start/env'
import { defineConfig, drivers } from '@adonisjs/core/encryption'

/**
 * The encryption config holds the application key used for encrypting
 * cookies, generating signed URLs and the "encryption" module.
 *
 * Since AdonisJS v7 the app key lives here (it used to be exported from
 * "config/app.ts"). Keep the key secret — losing or changing it makes
 * previously encrypted data undecryptable.
 */
export default defineConfig({
  default: 'legacy',
  list: {
    legacy: drivers.legacy({
      keys: [env.get('APP_KEY')],
    }),
  },
})
