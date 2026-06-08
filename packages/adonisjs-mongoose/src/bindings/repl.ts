import type { ApplicationService } from '@adonisjs/core/types'
import type { Repl } from '@adonisjs/core/repl'

function setupReplState(repl: Repl, key: string, value: unknown) {
  repl.server!.context[key] = value
  repl.notify(`Loaded ${key}. You can access it using the "${repl.colors.underline(key)}" variable`)
}

/**
 * Register REPL helpers, mirroring how `@adonisjs/lucid` exposes `db`.
 * Available after `node ace repl` → call `loadMongo()`.
 */
export function defineReplBindings(app: ApplicationService, repl: Repl) {
  repl.addMethod(
    'loadMongo',
    async () => {
      const mongo = await app.container.make('mongo')
      setupReplState(repl, 'mongo', mongo)
    },
    { description: 'Load the Mongo manager to the "mongo" property' }
  )
}
