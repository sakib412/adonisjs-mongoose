# AdonisJS Mongoose

Mongoose provider for AdonisJS 6 with multi-connection support, similar to Lucid but using Mongoose ODM.

## Features

- 🔌 Multi-connection support
- 🎯 Default connection with easy switching
- 🏗️ BaseModel similar to Lucid
- 🔄 Proper AdonisJS lifecycle management
- 🌍 Environment variable support
- 📦 TypeScript support

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

const mongoConfig = defineConfig({
  connection: env.get('DEFAULT_MONGODB_CONNECTION', 'mongodb'),
  connections: {
    mongodb: {
      uri: env.get('MONGODB_URI'),
      // or individual options
      host: env.get('MONGODB_HOST'),
      port: env.get('MONGODB_PORT'),
      database: env.get('MONGODB_DATABASE'),
      user: env.get('MONGODB_USER'),
      password: env.get('MONGODB_PASSWORD'),
      options: {
        // Additional mongoose connection options
      },
    },
    mongodb_secondary: {
      uri: env.get('MONGODB_SECONDARY_URI'),
    },
  },
})

export default mongoConfig
```

## Usage

### Using the Database Service

```typescript
import db from '@adonisjs/core/services/mongoose'

// Use default connection
const users = await db.connection().model('User').find()

// Use named connection
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
