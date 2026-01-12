/*
 * adonisjs-mongoose
 *
 * (c) Your Name
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const stubsRoot = join(fileURLToPath(import.meta.url), '../..')
