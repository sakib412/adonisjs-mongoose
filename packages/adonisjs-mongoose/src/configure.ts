import type Configure from '@adonisjs/core/commands/configure'
import { stubsRoot } from './stubs/main.js'

/**
 * Configure hook run by `node ace add adonisjs-mongoose` (or
 * `node ace configure adonisjs-mongoose`).
 *
 * - Publishes `config/mongoose.ts`.
 * - Registers the provider and commands in `adonisrc.ts`.
 * - Defines the `MONGO_URI` env var + its validation.
 */
export async function configure(command: Configure) {
  const codemods = await command.createCodemods()

  await codemods.makeUsingStub(stubsRoot, 'config/mongoose.stub', {})

  await codemods.updateRcFile((rcFile) => {
    rcFile.addProvider('adonisjs-mongoose/mongo_provider')
    rcFile.addCommand('adonisjs-mongoose/commands')
  })

  await codemods.defineEnvVariables({
    MONGO_URI: 'mongodb://localhost:27017/app',
  })

  await codemods.defineEnvValidations({
    variables: {
      MONGO_URI: 'Env.schema.string()',
    },
    leadingComment: 'Variables for adonisjs-mongoose',
  })
}
