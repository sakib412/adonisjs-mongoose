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
export async function configure(command: Configure) {
  const codemods = await command.createCodemods()

  /**
   * Publish config file
   */
  await codemods.makeUsingStub(stubsRoot, 'config/mongoose.stub', {})

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
    MONGODB_URI: 'mongodb://localhost:27017/adonisjs',
  })

  /**
   * Add environment variable validations
   */
  await codemods.defineEnvValidations({
    leadingComment: 'Variables for configuring the MongoDB connection',
    variables: {
      DEFAULT_MONGODB_CONNECTION: `Env.schema.enum(['mongodb'] as const)`,
      MONGODB_URI: `Env.schema.string()`,
    },
  })
}
