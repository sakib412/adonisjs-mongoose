# 🚀 Quick Start - MongoDB Queries in AdonisJS API

This guide shows you how to query MongoDB using the `adonisjs-mongoose` library in your API app.

## ✅ What's Already Set Up

The `apps/api` application is ready with:

- ✅ Package installed: `adonisjs-mongoose`
- ✅ Provider registered in `adonisrc.ts`
- ✅ Config file: `config/mongoose.ts`
- ✅ Environment validation in `start/env.ts`
- ✅ Sample model: `app/models/product.ts`
- ✅ Controller with CRUD: `app/controllers/products_controller.ts`
- ✅ API routes: `start/routes.ts`

## 🎯 How to Query MongoDB

### Simple Example

```typescript
import Product from '#models/product'

// Find all products
const products = await Product.find()

// Find by ID
const product = await Product.findById('67890abc...')

// Create
const product = await Product.create({
  name: 'Gaming Laptop',
  price: 2499.99,
  category: 'electronics',
})

// Update
const updated = await Product.findByIdAndUpdate(id, { price: 2299.99 }, { new: true })

// Delete
await Product.findByIdAndDelete(id)
```

### In a Controller

```typescript
// app/controllers/products_controller.ts
import Product from '#models/product'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProductsController {
  async index({ response }: HttpContext) {
    const products = await Product.find()
    return response.json(products)
  }

  async store({ request, response }: HttpContext) {
    const data = request.only(['name', 'price', 'category'])
    const product = await Product.create(data)
    return response.created(product)
  }
}
```

## 🏃 Run the API

### 1. Make sure MongoDB is running

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or start your local MongoDB
mongod
```

### 2. Start the dev server

```bash
cd apps/api
pnpm dev
```

The API will be available at: `http://localhost:3333`

### 3. Test the API

```bash
# Create a product
curl -X POST http://localhost:3333/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gaming Laptop",
    "description": "High performance laptop",
    "price": 2499.99,
    "stock": 15,
    "category": "electronics"
  }'

# Get all products
curl http://localhost:3333/api/products

# With filters
curl "http://localhost:3333/api/products?category=electronics&minPrice=100"
```

Or use the `test.http` file in VS Code with REST Client extension!

## 📚 Available API Endpoints

| Method | Endpoint                   | Description                                  |
| ------ | -------------------------- | -------------------------------------------- |
| GET    | `/api/products`            | List all products (with filters, pagination) |
| GET    | `/api/products/:id`        | Get single product                           |
| POST   | `/api/products`            | Create product                               |
| PUT    | `/api/products/:id`        | Update product                               |
| DELETE | `/api/products/:id`        | Delete product                               |
| GET    | `/api/products/categories` | Get all categories                           |
| GET    | `/api/products/stats`      | Get statistics                               |

### Query Parameters for GET `/api/products`

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Text search in name/description
- `category` - Filter by category
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `sortBy` - Sort field (default: createdAt)
- `order` - Sort order: asc/desc (default: desc)

## 🌱 Seed Sample Data

Run the seeder to add sample products:

```bash
# From apps/api directory
node ace run database/seeders/seed_products.ts
```

This will create 8 sample products in your database.

## 📖 Common Query Patterns

### Find with Filters

```typescript
// Find by category
const products = await Product.find({ category: 'electronics' })

// Price range
const products = await Product.find({
  price: { $gte: 100, $lte: 1000 },
})

// Multiple conditions
const products = await Product.find({
  category: 'electronics',
  isActive: true,
  stock: { $gt: 0 },
})
```

### Search

```typescript
// Text search (requires text index)
const products = await Product.find({
  $text: { $search: 'laptop gaming' },
})

// Regex search
const products = await Product.find({
  name: { $regex: 'laptop', $options: 'i' },
})
```

### Pagination & Sorting

```typescript
const page = 1
const limit = 10
const skip = (page - 1) * limit

const products = await Product.find().skip(skip).limit(limit).sort({ createdAt: -1 })
```

### Aggregations

```typescript
const stats = await Product.aggregate([
  { $match: { isActive: true } },
  {
    $group: {
      _id: '$category',
      count: { $sum: 1 },
      avgPrice: { $avg: '$price' },
      totalStock: { $sum: '$stock' },
    },
  },
  { $sort: { count: -1 } },
])
```

### Count & Exists

```typescript
// Count documents
const count = await Product.countDocuments({ category: 'electronics' })

// Check if exists
const exists = await Product.exists({ email: 'test@example.com' })

// Get distinct values
const categories = await Product.distinct('category')
```

## 🔧 Create Your Own Model

1. Create model file `app/models/your_model.ts`:

```typescript
import { BaseModel } from 'adonisjs-mongoose'
import { Schema } from 'mongoose'

export default class YourModel extends BaseModel {
  static connection = 'primary'
  static collectionName = 'your_collection'

  static schema = new Schema(
    {
      // Your fields here
      name: { type: String, required: true },
      // ...
    },
    {
      timestamps: true,
    }
  )
}
```

2. Use in controller:

```typescript
import YourModel from '#models/your_model'

const items = await YourModel.find()
```

## 🎓 Learn More

- Full documentation: [apps/api/README.md](./README.md)
- Test file: [apps/api/test.http](./test.http)
- Example controller: [apps/api/app/controllers/products_controller.ts](./app/controllers/products_controller.ts)
- Example model: [apps/api/app/models/product.ts](./app/models/product.ts)

## 💡 Tips

1. **Use `.lean()`** for better performance when you don't need Mongoose document methods:

   ```typescript
   const products = await Product.find().lean()
   ```

2. **Add indexes** to your schema for better query performance:

   ```typescript
   static {
     this.schema.index({ email: 1 })
     this.schema.index({ name: 'text' })
   }
   ```

3. **Use aggregation** for complex queries and statistics:

   ```typescript
   const stats = await Product.aggregate([...])
   ```

4. **Handle errors** properly:
   ```typescript
   try {
     const product = await Product.findById(id)
   } catch (error) {
     if (error.name === 'CastError') {
       return response.badRequest({ message: 'Invalid ID' })
     }
     throw error
   }
   ```

Happy coding! 🎉
