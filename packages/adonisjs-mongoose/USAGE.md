# AdonisJS Mongoose - Usage Guide

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Environment Variables](#environment-variables)
- [Basic Usage](#basic-usage)
- [Multi-Connection Support](#multi-connection-support)
- [BaseModel](#basemodel)
- [Direct Database Access](#direct-database-access)
- [Best Practices](#best-practices)

## Installation

```bash
pnpm add adonisjs-mongoose mongoose
```

Or using npm:

```bash
npm install adonisjs-mongoose mongoose
```

Configure the package:

```bash
node ace configure adonisjs-mongoose
```

This will:

- Create `config/database.ts` configuration file
- Add provider to `.adonisrc.ts`
- Add environment variables to `.env`
- Add environment validation to `start/env.ts`
- Update `tsconfig.json` with types

## Configuration

The package creates a `config/database.ts` file:

```typescript
import { defineConfig } from 'adonisjs-mongoose'
import env from '#start/env'

const databaseConfig = defineConfig({
  connection: env.get('DEFAULT_MONGODB_CONNECTION'),

  connections: {
    mongodb: {
      uri: env.get('MONGODB_URI'),

      connection: {
        host: env.get('MONGODB_HOST'),
        port: env.get('MONGODB_PORT'),
        database: env.get('MONGODB_DATABASE'),
        user: env.get('MONGODB_USER'),
        password: env.get('MONGODB_PASSWORD'),
      },

      options: {
        // Mongoose connection options
      },

      debug: false,
    },
  },
})

export default databaseConfig
```

## Environment Variables

Add these to your `.env` file:

```env
DEFAULT_MONGODB_CONNECTION=mongodb

# Option 1: Use URI (recommended for production)
MONGODB_URI=mongodb://username:password@localhost:27017/mydb

# Option 2: Use individual options (for development)
MONGODB_HOST=127.0.0.1
MONGODB_PORT=27017
MONGODB_DATABASE=adonis
MONGODB_USER=
MONGODB_PASSWORD=
```

## Basic Usage

### Creating a Model

Create a model in `app/models/user.ts`:

```typescript
import { BaseModel } from 'adonisjs-mongoose'
import { Schema } from 'mongoose'

export default class User extends BaseModel {
  static schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    createdAt: { type: Date, default: Date.now },
  })
}
```

### Using the Model

```typescript
// Create
const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'hashed_password',
})

// Find
const users = await User.find()
const user = await User.findOne({ email: 'john@example.com' })
const userById = await User.findById('507f1f77bcf86cd799439011')

// Update
await User.updateOne({ email: 'john@example.com' }, { $set: { name: 'John Smith' } })

// Delete
await User.deleteOne({ email: 'john@example.com' })

// Query builder
const activeUsers = await User.find()
  .where('role')
  .equals('admin')
  .sort({ createdAt: -1 })
  .limit(10)
  .exec()
```

## Multi-Connection Support

### Configure Multiple Connections

Update `config/database.ts`:

```typescript
const databaseConfig = defineConfig({
  connection: 'mongodb',

  connections: {
    // Primary connection
    mongodb: {
      uri: env.get('MONGODB_URI'),
    },

    // Secondary connection (e.g., for logs)
    mongodb_logs: {
      uri: env.get('MONGODB_LOGS_URI'),
    },

    // Analytics database
    mongodb_analytics: {
      uri: env.get('MONGODB_ANALYTICS_URI'),
    },
  },
})
```

### Use Different Connections

```typescript
import { BaseModel } from 'adonisjs-mongoose'
import { Schema } from 'mongoose'

// Default connection (mongodb)
export class User extends BaseModel {
  static schema = new Schema({
    name: String,
    email: String,
  })
}

// Use logs connection
export class Log extends BaseModel {
  static connection = 'mongodb_logs'

  static schema = new Schema({
    level: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
  })
}

// Use analytics connection
export class PageView extends BaseModel {
  static connection = 'mongodb_analytics'
  static collectionName = 'page_views'

  static schema = new Schema({
    url: String,
    userId: Schema.Types.ObjectId,
    viewedAt: { type: Date, default: Date.now },
  })
}
```

## BaseModel

### Available Methods

All Mongoose model methods are available:

```typescript
// CRUD Operations
User.create(data)
User.insertMany([data1, data2])
User.find(query)
User.findOne(query)
User.findById(id)
User.findByIdAndUpdate(id, update)
User.findByIdAndDelete(id)
User.findOneAndUpdate(query, update)
User.findOneAndDelete(query)
User.updateOne(query, update)
User.updateMany(query, update)
User.deleteOne(query)
User.deleteMany(query)

// Counting
User.countDocuments(query)
User.estimatedDocumentCount()

// Other Operations
User.distinct(field)
User.exists(query)
User.where(field)
User.aggregate(pipeline)
User.bulkWrite(operations)
User.watch() // Change streams
```

### Getting Mongoose Model

```typescript
const UserModel = User.getModel()

// Use native mongoose methods
const doc = new UserModel({ name: 'Jane' })
await doc.save()
```

### Custom Collection Name

```typescript
export class User extends BaseModel {
  static collectionName = 'app_users'

  static schema = new Schema({
    // ...
  })
}
```

## Direct Database Access

### Access via Service

```typescript
import db from '@adonisjs/core/services/mongoose'

// Get default connection
const connection = db.connection()

// Get named connection
const logsConnection = db.connection('mongodb_logs')

// Use native mongoose methods
const User = connection.model('User', userSchema)
```

### In Controllers

```typescript
import db from '@adonisjs/core/services/mongoose'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  async index({ response }: HttpContext) {
    const connection = db.connection()
    const users = await connection.model('User').find()

    return response.json(users)
  }
}
```

## Best Practices

### 1. Model Organization

```
app/
  models/
    user.ts
    post.ts
    comment.ts
```

### 2. Schema Definitions

Use TypeScript interfaces for type safety:

```typescript
import { BaseModel } from 'adonisjs-mongoose'
import { Schema, Document } from 'mongoose'

interface IUser extends Document {
  name: string
  email: string
  password: string
}

export default class User extends BaseModel {
  static schema = new Schema<IUser>({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  })
}
```

### 3. Indexes

Define indexes in your schema:

```typescript
static schema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
})
```

### 4. Virtual Fields

```typescript
static schema = new Schema({
  firstName: String,
  lastName: String,
})

// Add in schema definition
static {
  this.schema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`
  })
}
```

### 5. Pre/Post Hooks

```typescript
static {
  this.schema.pre('save', async function() {
    // Hash password before saving
    if (this.isModified('password')) {
      this.password = await hash(this.password)
    }
  })
}
```

### 6. Connection Management

Connections are automatically managed by the provider. They are:

- Lazy-loaded (created when first accessed)
- Automatically closed on application shutdown
- Properly monitored and logged

### 7. Error Handling

```typescript
try {
  const user = await User.create({ email: 'duplicate@email.com' })
} catch (error) {
  if (error.code === 11000) {
    // Duplicate key error
    return response.conflict({ message: 'Email already exists' })
  }
  throw error
}
```

### 8. Transactions

```typescript
import db from '@adonisjs/core/services/mongoose'

const session = await User.startSession()
session.startTransaction()

try {
  await User.create([{ name: 'John' }], { session })
  await Post.create([{ title: 'Post' }], { session })

  await session.commitTransaction()
} catch (error) {
  await session.abortTransaction()
  throw error
} finally {
  session.endSession()
}
```

## Events

The package emits the following events:

```typescript
// start/events.ts
import emitter from '@adonisjs/core/services/emitter'

emitter.on('mongodb:connection:connect', (event) => {
  console.log(`Connected to ${event.connection}`)
})

emitter.on('mongodb:connection:disconnect', (event) => {
  console.log(`Disconnected from ${event.connection}`)
})

emitter.on('mongodb:connection:error', (event) => {
  console.error(`Connection error: ${event.error.message}`)
})
```

## Testing

For testing, you can clear model cache:

```typescript
import { test } from '@japa/runner'
import User from '#models/user'

test.group('Users', (group) => {
  group.each.setup(() => {
    User.clearCache()
  })

  test('create user', async ({ assert }) => {
    const user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
    })

    assert.exists(user._id)
  })
})
```
