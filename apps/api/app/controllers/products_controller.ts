import Product from '#models/product'
import Product2 from '#models/product_second'
import type { HttpContext } from '@adonisjs/core/http'

export default class ProductsController {
  /**
   * GET /api/products
   * List products with filtering, search, and pagination
   */
  async index({ request, response }: HttpContext) {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      order = 'desc',
    } = request.qs()

    // Build query
    const query: any = { isActive: true }

    if (search) {
      query.$text = { $search: search }
    }

    if (category) {
      query.category = category
    }

    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = parseFloat(minPrice)
      if (maxPrice) query.price.$lte = parseFloat(maxPrice)
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit)

    // Execute queries
    const [products, total] = await Promise.all([
      Product.find(query)
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
        .lean(),
      Product.countDocuments(query),
    ])

    return response.json({
      success: true,
      data: products,
      meta: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    })
  }

  /**
   * GET /api/products/:id
   * Get single product
   */
  async show({ params, response }: HttpContext) {
    try {
      const product = await Product.findById(params.id)

      if (!product) {
        return response.notFound({
          success: false,
          message: 'Product not found',
        })
      }

      return response.json({
        success: true,
        data: product,
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        message: 'Invalid product ID',
      })
    }
  }

  /**
   * POST /api/products
   * Create new product
   */
  async store({ request, response }: HttpContext) {
    try {
      const data = request.only([
        'name',
        'description',
        'price',
        'stock',
        'category',
        'tags',
        'images',
      ])

      const product = await Product.create(data)

      return response.created({
        success: true,
        message: 'Product created successfully',
        data: product,
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        message: 'Failed to create product',
        error: error.message,
      })
    }
  }

  /**
   * PUT /api/products/:id
   * Update product
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const data = request.only([
        'name',
        'description',
        'price',
        'stock',
        'category',
        'tags',
        'images',
        'isActive',
      ])

      const product = await Product.findByIdAndUpdate(params.id, data, {
        new: true,
        runValidators: true,
      })

      if (!product) {
        return response.notFound({
          success: false,
          message: 'Product not found',
        })
      }

      return response.json({
        success: true,
        message: 'Product updated successfully',
        data: product,
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        message: 'Failed to update product',
        error: error.message,
      })
    }
  }

  /**
   * DELETE /api/products/:id
   * Delete product (soft delete)
   */
  async destroy({ params, response }: HttpContext) {
    try {
      // Soft delete - mark as inactive
      const product = await Product.findByIdAndUpdate(params.id, { isActive: false }, { new: true })

      if (!product) {
        return response.notFound({
          success: false,
          message: 'Product not found',
        })
      }

      return response.json({
        success: true,
        message: 'Product deleted successfully',
      })
    } catch (error) {
      return response.badRequest({
        success: false,
        message: 'Failed to delete product',
        error: error.message,
      })
    }
  }

  /**
   * GET /api/products/categories
   * Get all unique categories
   */
  async categories({ response }: HttpContext) {
    const categories = await Product.distinct('category')

    return response.json({
      success: true,
      data: categories,
    })
  }

  /**
   * GET /api/products/stats
   * Get product statistics by category
   */
  async stats({ response }: HttpContext) {
    const stats = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          totalStock: { $sum: '$stock' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      { $sort: { count: -1 } },
    ])

    return response.json({
      success: true,
      data: stats,
    })
  }

  async testSecondaryConnection({ response }: HttpContext) {
    const products = await Product2.find().limit(10).lean()

    // insert some dummy data
    await Product2.create({
      name: 'Secondary Product',
      description: 'This product is stored in the secondary database',
      price: 99.99,
      category: 'Secondary',
    })

    return response.json({
      success: true,
      data: products,
    })
  }
}
