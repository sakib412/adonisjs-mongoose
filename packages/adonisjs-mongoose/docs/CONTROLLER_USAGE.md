# Querying Data from Controllers

This guide shows how to query MongoDB data from your AdonisJS controllers using the mongoose provider.

## Method 1: Using BaseModel (Recommended)

### Step 1: Create a Model

```typescript
// app/models/user.ts
import { BaseModel } from 'adonisjs-mongoose'
import { Schema } from 'mongoose'

export default class User extends BaseModel {
  static collectionName = 'users'

  static schema = new Schema(
    {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      age: { type: Number },
      isActive: { type: Boolean, default: true },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    },
    {
      timestamps: true,
    }
  )
}
```

### Step 2: Use in Controller

```typescript
// app/controllers/users_controller.ts
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  /**
   * Get all users
   */
  async index({ response }: HttpContext) {
    const users = await User.find()
    return response.json(users)
  }

  /**
   * Get a single user
   */
  async show({ params, response }: HttpContext) {
    const user = await User.findById(params.id)

    if (!user) {
      return response.notFound({ message: 'User not found' })
    }

    return response.json(user)
  }

  /**
   * Create a user
   */
  async store({ request, response }: HttpContext) {
    const data = request.only(['name', 'email', 'age'])
    const user = await User.create(data)

    return response.created(user)
  }

  /**
   * Update a user
   */
  async update({ params, request, response }: HttpContext) {
    const data = request.only(['name', 'email', 'age'])

    const user = await User.findByIdAndUpdate(params.id, data, { new: true, runValidators: true })

    if (!user) {
      return response.notFound({ message: 'User not found' })
    }

    return response.json(user)
  }

  /**
   * Delete a user
   */
  async destroy({ params, response }: HttpContext) {
    const user = await User.findByIdAndDelete(params.id)

    if (!user) {
      return response.notFound({ message: 'User not found' })
    }

    return response.json({ message: 'User deleted successfully' })
  }

  /**
   * Search users
   */
  async search({ request, response }: HttpContext) {
    const { query, isActive } = request.qs()

    const users = await User.find({
      $and: [
        query
          ? {
              $or: [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } },
              ],
            }
          : {},
        isActive !== undefined ? { isActive } : {},
      ],
    }).limit(20)

    return response.json(users)
  }

  /**
   * Pagination example
   */
  async paginate({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 10)
    const skip = (page - 1) * limit

    const [users, total] = await Promise.all([
      User.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(),
    ])

    return response.json({
      data: users,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    })
  }

  /**
   * Aggregation example
   */
  async stats({ response }: HttpContext) {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$isActive',
          count: { $sum: 1 },
          avgAge: { $avg: '$age' },
        },
      },
    ])

    return response.json(stats)
  }
}
```

## Method 2: Using Database Service

```typescript
// app/controllers/posts_controller.ts
import db from '#services/mongoose_service'
import type { HttpContext } from '@adonisjs/core/http'
import { Schema } from 'mongoose'

// Define schema inline or import from models
const postSchema = new Schema({
  title: String,
  content: String,
  author: String,
  tags: [String],
  createdAt: { type: Date, default: Date.now },
})

export default class PostsController {
  async index({ response }: HttpContext) {
    // Get connection and create/get model
    const connection = db.connection()
    const Post = connection.model('Post', postSchema)

    const posts = await Post.find().sort({ createdAt: -1 })
    return response.json(posts)
  }

  async store({ request, response }: HttpContext) {
    const connection = db.connection()
    const Post = connection.model('Post', postSchema)

    const post = await Post.create(request.only(['title', 'content', 'author', 'tags']))
    return response.created(post)
  }
}
```

## Method 3: Multiple Connections

```typescript
// app/controllers/logs_controller.ts
import { BaseModel } from 'adonisjs-mongoose'
import db from '#services/mongoose_service'
import { Schema } from 'mongoose'
import type { HttpContext } from '@adonisjs/core/http'

// Log model using secondary connection
class Log extends BaseModel {
  static connection = 'mongodb_logs'
  static collectionName = 'application_logs'

  static schema = new Schema({
    level: { type: String, enum: ['info', 'warn', 'error'], required: true },
    message: String,
    metadata: Schema.Types.Mixed,
    timestamp: { type: Date, default: Date.now },
  })
}

export default class LogsController {
  /**
   * Get logs from dedicated logs connection
   */
  async index({ request, response }: HttpContext) {
    const level = request.input('level')

    const query = level ? { level } : {}
    const logs = await Log.find(query).sort({ timestamp: -1 }).limit(100)

    return response.json(logs)
  }

  /**
   * Switch between connections dynamically
   */
  async compare({ response }: HttpContext) {
    // Query from main database
    const mainConnection = db.connection('mongodb')
    const User = mainConnection.model('User')
    const userCount = await User.countDocuments()

    // Query from logs database
    const logsConnection = db.connection('mongodb_logs')
    const LogModel = logsConnection.model('Log')
    const logCount = await LogModel.countDocuments()

    return response.json({
      users: userCount,
      logs: logCount,
    })
  }
}
```

## Advanced Queries

### Complex Filtering

```typescript
export default class ProductsController {
  async filter({ request, response }: HttpContext) {
    const { category, minPrice, maxPrice, inStock } = request.qs()

    const query: any = {}

    if (category) query.category = category
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }
    if (inStock !== undefined) query.inStock = inStock === 'true'

    const products = await Product.find(query)
    return response.json(products)
  }
}
```

### Population (Relations)

```typescript
// app/models/post.ts
import { BaseModel } from 'adonisjs-mongoose'
import { Schema } from 'mongoose'

export default class Post extends BaseModel {
  static collectionName = 'posts'

  static schema = new Schema({
    title: String,
    content: String,
    authorId: { type: Schema.Types.ObjectId, ref: 'User' },
    comments: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User' },
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  })
}

// In controller
export default class PostsController {
  async show({ params, response }: HttpContext) {
    const post = await Post.findById(params.id)
      .populate('authorId', 'name email')
      .populate('comments.userId', 'name')

    return response.json(post)
  }
}
```

### Transactions

```typescript
export default class OrdersController {
  async create({ request, response }: HttpContext) {
    const connection = db.connection()
    const session = await connection.startSession()

    try {
      await session.withTransaction(async () => {
        const Order = connection.model('Order')
        const Product = connection.model('Product')

        // Create order
        const order = await Order.create([request.only(['userId', 'items', 'total'])], { session })

        // Update product stock
        for (const item of request.input('items')) {
          await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stock: -item.quantity } },
            { session }
          )
        }

        return order
      })

      return response.created({ message: 'Order created successfully' })
    } catch (error) {
      return response.badRequest({ message: 'Transaction failed', error })
    } finally {
      await session.endSession()
    }
  }
}
```

## Best Practices

### 1. Use BaseModel for Reusable Models

```typescript
// ✅ Good - Reusable across application
class User extends BaseModel {
  static schema = new Schema({
    /* ... */
  })
}

// Use in multiple places
const users = await User.find()
```

### 2. Validate Input

```typescript
import { vine } from '@vinejs/vine'

export default class UsersController {
  async store({ request, response }: HttpContext) {
    const validator = vine.compile(
      vine.object({
        name: vine.string().minLength(3),
        email: vine.string().email(),
        age: vine.number().min(18),
      })
    )

    const data = await request.validateUsing(validator)
    const user = await User.create(data)

    return response.created(user)
  }
}
```

### 3. Handle Errors

```typescript
export default class UsersController {
  async show({ params, response }: HttpContext) {
    try {
      const user = await User.findById(params.id)

      if (!user) {
        return response.notFound({ message: 'User not found' })
      }

      return response.json(user)
    } catch (error) {
      if (error.name === 'CastError') {
        return response.badRequest({ message: 'Invalid user ID' })
      }
      throw error
    }
  }
}
```

### 4. Use Lean Queries for Performance

```typescript
// Returns plain JavaScript objects instead of Mongoose documents
const users = await User.find().lean()
```

### 5. Add Indexes for Performance

```typescript
export default class User extends BaseModel {
  static schema = new Schema({
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String, index: true },
  })

  // Or add compound indexes
  static {
    this.schema.index({ name: 1, createdAt: -1 })
  }
}
```

## Quick Reference

| Operation  | Code                                                     |
| ---------- | -------------------------------------------------------- |
| Find all   | `await Model.find()`                                     |
| Find by ID | `await Model.findById(id)`                               |
| Find one   | `await Model.findOne({ email: 'user@example.com' })`     |
| Create     | `await Model.create({ name: 'John' })`                   |
| Update     | `await Model.findByIdAndUpdate(id, data, { new: true })` |
| Delete     | `await Model.findByIdAndDelete(id)`                      |
| Count      | `await Model.countDocuments()`                           |
| Exists     | `await Model.exists({ email: 'user@example.com' })`      |
| Aggregate  | `await Model.aggregate([...])`                           |

## Next Steps

- Check [examples/](../examples/) for more code samples
- Read [BaseModel documentation](./BASE_MODEL.md) for all available methods
- See [Multi-Connection Guide](./MULTI_CONNECTION.md) for connection switching
