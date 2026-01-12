/*
 * adonisjs-mongoose
 *
 * (c) Your Name
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { DatabaseConfig } from './main.js'

/**
 * Helper to define database config with type safety
 */
export function defineConfig(config: DatabaseConfig): DatabaseConfig {
  return config
}
