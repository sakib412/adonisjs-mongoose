# API App - Using adonisjs-mongoose

This is a complete AdonisJS API application demonstrating how to use the `adonisjs-mongoose` library for MongoDB queries.

## Setup

### 1. Install Dependencies

From the monorepo root:

```bash
pnpm install
```

### 2. Configure Environment

Copy the example env file:

```bash
cd apps/api
cp .env.example .env
```

Update `.env` with your MongoDB connection:

```env
MONGODB_URI=mongodb://localhost:27017/api_app
DEFAULT_MONGODB_CONNECTION=primary
```

### 3. Start MongoDB

Make sure MongoDB is running locally:

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or use your local MongoDB installation
mongod
```

### 4. Start Development Server

```bash
pnpm dev
```

The API will be available at `http://localhost:3333`

## API Endpoints

### Products API

All endpoints are prefixed with `/api`

| Method | Endpoint                   | Description                                   |
| ------ | -------------------------- | --------------------------------------------- |
| GET    | `/api/products`            | List all products with filtering & pagination |
| GET    | `/api/products/:id`        | Get single product by ID                      |
| POST   | `/api/products`            | Create a new product                          |
| PUT    | `/api/products/:id`        | Update a product                              |
| DELETE | `/api/products/:id`        | Delete a product (soft delete)                |
| GET    | `/api/products/categories` | Get all unique categories                     |
| GET    | `/api/products/stats`      | Get statistics by category                    |

## Usage Examples

### List Products

```bash
# Get all products
curl http://localhost:3333/api/products

# With pagination
curl "http://localhost:3333/api/products?page=1&limit=10"

# With search
curl "http://localhost:3333/api/products?search=laptop"

# With category filter
curl "http://localhost:3333/api/products?category=electronics"

# With price range
curl "http://localhost:3333/api/products?minPrice=100&maxPrice=1000"

# With sorting
curl "http://localhost:3333/api/products?sortBy=price&order=asc"

# Combined filters
curl "http://localhost:3333/api/products?category=electronics&minPrice=500&page=1&limit=20"
```

### Get Single Product

```bash
curl http://localhost:3333/api/products/YOUR_PRODUCT_ID
```

### Create Product

```bash
curl -X POST http://localhost:3333/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gaming Laptop",
    "description": "High-performance gaming laptop with RTX 4090",
    "price": 2499.99,
    "stock": 15,
    "category": "electronics",
    "tags": ["gaming", "laptop", "high-end"],
    "images": ["image1.jpg", "image2.jpg"]
  }'
```

### Update Product

```bash
curl -X PUT http://localhost:3333/api/products/YOUR_PRODUCT_ID \
  -H "Content-Type: application/json" \
  -d '{
    "price": 2299.99,
    "stock": 10
  }'
```

### Delete Product

```bash
curl -X DELETE http://localhost:3333/api/products/YOUR_PRODUCT_ID
```

### Get Categories

```bash
curl http://localhost:3333/api/products/categories
```

### Get Statistics

```bash
curl http://localhost:3333/api/products/stats
```

## Code Structure

```
apps/api/
├── app/
│   ├── controllers/
│   │   └── products_controller.ts   # API controller with all CRUD operations
│   └── models/
│       ├── product.ts                # MongoDB model using BaseModel
│       └── user.ts                   # PostgreSQL model using Lucid
├── config/
│   ├── database.ts                   # PostgreSQL config (Lucid)
│   └── mongoose.ts                   # MongoDB config (Mongoose)
├── start/
│   └── routes.ts                     # API routes definition
├── .env                              # Environment variables
└── package.json
```

## How It Works

### 1. Model Definition (`app/models/product.ts`)

```typescript
import { BaseModel } from 'adonisjs-mongoose'
import { Schema } from 'mongoose'

export default class Product extends BaseModel {
  static collectionName = 'products'

  static schema = new Schema(
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      // ... more fields
    },
    {
      timestamps: true,
    }
  )
}
```

### 2. Controller Queries (`app/controllers/products_controller.ts`)

```typescript
import Product from '#models/product'

// Find all
const products = await Product.find()

// Find by ID
const product = await Product.findById(id)

// Create
const product = await Product.create(data)

// Update
const product = await Product.findByIdAndUpdate(id, data, { new: true })

// Delete
const product = await Product.findByIdAndDelete(id)

// Complex queries
const products = await Product.find({ category: 'electronics', price: { $gte: 100 } })
  .skip(10)
  .limit(20)
  .sort({ createdAt: -1 })

// Aggregations
const stats = await Product.aggregate([
  { $match: { isActive: true } },
  { $group: { _id: '$category', count: { $sum: 1 } } },
])
```

### 3. Routes (`start/routes.ts`)

```typescript
import router from '@adonisjs/core/services/router'
const ProductsController = () => import('#controllers/products_controller')

router
  .group(() => {
    router.get('/products', [ProductsController, 'index'])
    router.post('/products', [ProductsController, 'store'])
    // ... more routes
  })
  .prefix('/api')
```

## Testing with REST Client

Create a file `test.http` in the project root:

```http
### Get all products
GET http://localhost:3333/api/products

### Get products with filters
GET http://localhost:3333/api/products?category=electronics&minPrice=100&maxPrice=1000

### Create product
POST http://localhost:3333/api/products
Content-Type: application/json

{
  "name": "Mechanical Keyboard",
  "description": "RGB mechanical gaming keyboard",
  "price": 149.99,
  "stock": 50,
  "category": "electronics",
  "tags": ["gaming", "keyboard", "rgb"]
}

### Get categories
GET http://localhost:3333/api/products/categories

### Get statistics
GET http://localhost:3333/api/products/stats
```

## Features Demonstrated

- ✅ **CRUD Operations** - Create, Read, Update, Delete
- ✅ **Filtering** - By category, price range, search text
- ✅ **Pagination** - Page and limit support
- ✅ **Sorting** - Dynamic field sorting
- ✅ **Search** - Full-text search using MongoDB text indexes
- ✅ **Aggregations** - Statistics and grouping
- ✅ **Soft Delete** - Mark as inactive instead of removing
- ✅ **Validation** - Mongoose schema validation
- ✅ **Indexes** - Performance optimization

## Development Tips

### Using Multiple Connections

Update your model to use a different connection:

```typescript
export default class Log extends BaseModel {
  static connection = 'secondary' // Uses secondary MongoDB connection
  static collectionName = 'logs'
  // ...
}
```

### Adding Validation

Use Vine for request validation:

```typescript
import vine from '@vinejs/vine'

const createProductValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(3),
    price: vine.number().positive(),
    category: vine.string()
  })
)

async store({ request, response }: HttpContext) {
  const data = await request.validateUsing(createProductValidator)
  const product = await Product.create(data)
  return response.created(product)
}
```

## Next Steps

- Add authentication with `@adonisjs/auth`
- Add rate limiting
- Add API documentation with Swagger
- Add unit tests with `@japa/runner`
- Deploy to production

## Learn More

- [AdonisJS Documentation](https://docs.adonisjs.com)
- [Mongoose Documentation](https://mongoosejs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
