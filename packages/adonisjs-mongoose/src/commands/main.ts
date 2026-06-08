import { ListLoader } from '@adonisjs/core/ace'
import type { CommandMetaData } from '@adonisjs/core/types/ace'
import MakeMongoModel from './make_mongo_model.js'

/**
 * Commands loader for the `commands` array in `adonisrc.ts`. Exposes the
 * `LoadersContract` shape (getMetaData/getCommand) the ace kernel expects
 * from a lazily-imported commands module.
 */
const loader = new ListLoader([MakeMongoModel])

export function getMetaData(): Promise<CommandMetaData[]> {
  return loader.getMetaData()
}

export function getCommand(metaData: CommandMetaData) {
  return loader.getCommand(metaData)
}
