# AdonisJS Mongoose

Mongoose provider for AdonisJS 6 with multi-connection support, similar to Lucid but using Mongoose ODM.

## Features

- 🔌 Multi-connection support
- 🎯 Type-safe configuration with validation
- 🏗️ BaseModel similar to Lucid
- 🔄 Proper AdonisJS lifecycle management
- 🌍 Environment variable support
- 📦 Full TypeScript support with module augmentation

## Installation

```bash
pnpm add adonisjs-mongoose mongoose
```

Or using npm:

```bash
npm install adonisjs-mongoose mongoose
```

## Configuration

Configure the package:

```bash
node ace configure adonisjs-mongoose
```

This will create a `config/database.ts` file:

```typescript
import { defineConfig } from 'adonisjs-mongoose'
import env from '#start/env'

const databaseConfig = defineConfig({
  connection: env.get('DEFAULT_MONGODB_CONNECTION', 'mongodb'),
  connections: {
    mongodb: {
      uri: env.get('MONGODB_URI'),
      // or individual options
      connection: {
        host: env.get('MONGODB_HOST'),
        port: env.get('MONGODB_PORT'),
        database: env.get('MONGODB_DATABASE'),
        user: env.get('MONGODB_USER'),
        password: env.get('MONGODB_PASSWORD'),
      },
      options: {
        // Additional mongoose connection options
      },
    },
    mongodb_secondary: {
      uri: env.get('MONGODB_SECONDARY_URI'),
    },
  },
})

export default databaseConfig
```

The `defineConfig` function validates your configuration at startup and provides:

- Runtime validation for required properties
- Type-safe connection names with generics
- Ensures default connection exists in connections list

### Type Safety

For enhanced type safety, augment the module types in your application:

```typescript
// types/mongoose.ts
import type { MongooseConnectionConfig } from 'adonisjs-mongoose'

declare module 'adonisjs-mongoose/types' {
  interface MongooseConnections {
    mongodb: MongooseConnectionConfig
    mongodb_secondary: MongooseConnectionConfig
  }
}
```

See [TYPE_AUGMENTATION.md](./docs/TYPE_AUGMENTATION.md) for more details.

## Usage

### Using the Database Service

```typescript
import db from '#services/mongoose_service'

// Use default connection
const users = await db.connection().model('User').find()

// Use named connection (type-safe with augmentation)
const logs = await db.connection('mongodb_secondary').model('Log').find()
```

### Using BaseModel

```typescript
import { BaseModel } from 'adonisjs-mongoose'
import { Schema } from 'mongoose'

export default class User extends BaseModel {
  // Optional: specify connection (defaults to primary)
  static connection = 'mongodb'

  // Optional: specify collection name
  static collectionName = 'users'

  // Define schema
  static schema = new Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    password: String,
    createdAt: { type: Date, default: Date.now },
  })
}

// Usage
const user = new User({ name: 'John', email: 'john@example.com' })
await user.save()

const users = await User.find()
const user = await User.findOne({ email: 'john@example.com' })
```

## License

MIT
