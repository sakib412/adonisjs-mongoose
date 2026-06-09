import { args, BaseCommand, flags } from '@adonisjs/core/ace'
import { stubsRoot } from '../stubs/main.js'

/**
 * Scaffolds a Mongoose model into `app/models/mongo`, mirroring Lucid's
 * `make:model`.
 *
 * @example
 * node ace make:mongo-model order
 * node ace make:mongo-model event --connection=analytics
 */
export default class MakeMongoModel extends BaseCommand {
  static commandName = 'make:mongo-model'
  static description = 'Make a new Mongoose model bound to a Mongo connection'

  @args.string({ description: 'Name of the model class' })
  declare name: string

  @flags.string({
    description: 'Mongo connection (from config/mongoose) the model binds to',
  })
  declare connection?: string

  @flags.boolean({ description: 'Overwrite the model file if it already exists' })
  declare force?: boolean

  @flags.string({
    description: 'Use the contents of the given file as the generated output',
  })
  declare contentsFrom?: string

  async run() {
    const codemods = await this.createCodemods()
    codemods.overwriteExisting = this.force === true

    // Precompute the (optional) options argument so the stub stays free of
    // conditional templating.
    const optionsArg = this.connection ? `, {connection: '${this.connection}'}` : ''

    await codemods.makeUsingStub(
      stubsRoot,
      'make/mongo_model/main.stub',
      {
        flags: this.parsed.flags,
        optionsArg,
        entity: this.app.generators.createEntity(this.name),
      },
      { contentsFromFile: this.contentsFrom }
    )
  }
}
