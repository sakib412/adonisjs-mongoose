/*
 * adonisjs-mongoose
 *
 * (c) Najmus Sakib
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Database } from '../src/database/main.js'

/**
 * Returns the mongoose database instance from the container
 */
let db: Database

await app.booted(async () => {
  db = await app.container.make('mongoose.db')
})

export { db as default }
