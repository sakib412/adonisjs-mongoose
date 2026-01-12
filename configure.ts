/*
 * adonisjs-mongoose
 *
 * (c) Najmus Sakib
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type Configure from '@adonisjs/core/commands/configure'
import { stubsRoot } from './stubs/main.js'

/**
 * Configures the package
 */
export async function configure(command: typeof Configure) {
  const codemods = await command.createCodemods()

  /**
   * Publish config file
   */
  await codemods.makeUsingStub(stubsRoot, 'config/database.stub', {})

  /**
   * Register provider
   */
  await codemods.updateRcFile((rcFile) => {
    rcFile.addProvider('adonisjs-mongoose/providers/mongoose_provider')
  })

  /**
   * Add environment variables
   */
  await codemods.defineEnvVariables({
    DEFAULT_MONGODB_CONNECTION: 'mongodb',
    MONGODB_URI: '',
    MONGODB_HOST: '127.0.0.1',
    MONGODB_PORT: '27017',
    MONGODB_DATABASE: 'adonis',
    MONGODB_USER: '',
    MONGODB_PASSWORD: '',
  })

  /**
   * Add environment variable validations
   */
  await codemods.defineEnvValidations({
    leadingComment: 'Variables for configuring the MongoDB connection',
    variables: {
      DEFAULT_MONGODB_CONNECTION: `Env.schema.string()`,
      MONGODB_URI: `Env.schema.string.optional()`,
      MONGODB_HOST: `Env.schema.string({ format: 'host' })`,
      MONGODB_PORT: `Env.schema.number()`,
      MONGODB_DATABASE: `Env.schema.string()`,
      MONGODB_USER: `Env.schema.string.optional()`,
      MONGODB_PASSWORD: `Env.schema.string.optional()`,
    },
  })

  /**
   * Add types to tsconfig.json
   */
  await codemods.updateTsConfig((tsConfig) => {
    tsConfig.merge({
      compilerOptions: {
        types: ['adonisjs-mongoose/types'],
      },
    })
  })
}
