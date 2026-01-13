# Type Augmentation

This package supports module augmentation for type-safe connection access across your application.

## Augmenting Connection Types

Create a file in your types directory (e.g., `types/mongoose.ts`) and augment the `MongooseConnections` interface:

```typescript
/**
 * types/mongoose.ts
 */
import type { MongooseConnectionConfig } from 'adonisjs-mongoose'

declare module 'adonisjs-mongoose/types' {
  interface MongooseConnections {
    mongodb: MongooseConnectionConfig
    mongodb_logs: MongooseConnectionConfig
    mongodb_analytics: MongooseConnectionConfig
  }
}
```

## Benefits

Once you augment the types, you get:

### 1. Type-safe Connection Names

```typescript
import db from '#services/mongoose_service'

// ✅ TypeScript knows these connections exist
const main = db.connection('mongodb')
const logs = db.connection('mongodb_logs')
const analytics = db.connection('mongodb_analytics')

// ❌ TypeScript error: connection doesn't exist
const invalid = db.connection('nonexistent')
```

### 2. Autocomplete Support

Your IDE will provide autocomplete for all configured connection names.

### 3. Config Type Safety

When using `defineConfig`, the connection names are validated:

```typescript
import { defineConfig } from 'adonisjs-mongoose'

export default defineConfig({
  // ✅ 'mongodb' is defined in MongooseConnections
  connection: 'mongodb',

  connections: {
    mongodb: {
      uri: 'mongodb://localhost:27017/main',
    },
    mongodb_logs: {
      uri: 'mongodb://localhost:27017/logs',
    },
    mongodb_analytics: {
      uri: 'mongodb://localhost:27017/analytics',
    },
  },
})
```

## Full Example

**Step 1:** Create types file

```typescript
// types/mongoose.ts
import type { MongooseConnectionConfig } from 'adonisjs-mongoose'

declare module 'adonisjs-mongoose/types' {
  interface MongooseConnections {
    mongodb: MongooseConnectionConfig
    mongodb_logs: MongooseConnectionConfig
  }
}
```

**Step 2:** Configure connections

```typescript
// config/database.ts
import { defineConfig } from 'adonisjs-mongoose'
import env from '#start/env'

export default defineConfig({
  connection: 'mongodb',
  connections: {
    mongodb: {
      uri: env.get('MONGODB_URI'),
    },
    mongodb_logs: {
      uri: env.get('MONGODB_LOGS_URI'),
    },
  },
})
```

**Step 3:** Use with type safety

```typescript
// app/models/user.ts
import { BaseModel } from 'adonisjs-mongoose'
import { Schema } from 'mongoose'

export default class User extends BaseModel {
  static schema = new Schema({
    name: String,
    email: String,
  })
}

// app/controllers/users_controller.ts
import User from '#models/user'
import db from '#services/mongoose_service'

export default class UsersController {
  async index() {
    // Uses default connection
    const users = await User.find()

    // Switch to logs connection
    User.useConnection('mongodb_logs')
    const loggedUsers = await User.find()

    // Direct connection access with type safety
    const logsDb = db.connection('mongodb_logs')
    return logsDb
  }
}
```

## Without Type Augmentation

If you don't augment the types, the package still works but without type safety:

```typescript
// Still works, but no autocomplete or type checking
const connection = db.connection('any-string-here')
```

## Recommended Setup

1. Create `types/mongoose.ts` in your project root
2. Add all your configured connections to the interface
3. Ensure this file is included in your `tsconfig.json` via `include` or `files`
4. Restart your TypeScript server in your IDE

This approach follows the same pattern as other AdonisJS packages like `@adonisjs/redis` and `@adonisjs/lucid`.
