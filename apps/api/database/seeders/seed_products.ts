/**
 * Seed script to add sample products to MongoDB
 * Run with: node ace run:script seed_products
 */

import Product from '#models/product'

const sampleProducts = [
  {
    name: 'Gaming Laptop',
    description: 'High-performance gaming laptop with RTX 4090',
    price: 2499.99,
    stock: 15,
    category: 'electronics',
    tags: ['gaming', 'laptop', 'high-end'],
    images: ['laptop1.jpg', 'laptop2.jpg'],
  },
  {
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical gaming keyboard with cherry MX switches',
    price: 149.99,
    stock: 50,
    category: 'electronics',
    tags: ['gaming', 'keyboard', 'rgb', 'mechanical'],
    images: ['keyboard1.jpg'],
  },
  {
    name: 'Office Chair',
    description: 'Ergonomic office chair with lumbar support',
    price: 299.99,
    stock: 25,
    category: 'furniture',
    tags: ['office', 'chair', 'ergonomic'],
    images: ['chair1.jpg', 'chair2.jpg'],
  },
  {
    name: 'Standing Desk',
    description: 'Adjustable height standing desk',
    price: 599.99,
    stock: 10,
    category: 'furniture',
    tags: ['office', 'desk', 'adjustable'],
    images: ['desk1.jpg'],
  },
  {
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with precision sensor',
    price: 79.99,
    stock: 100,
    category: 'electronics',
    tags: ['mouse', 'wireless', 'office'],
    images: ['mouse1.jpg'],
  },
  {
    name: 'Monitor 27"',
    description: '4K UHD monitor with HDR support',
    price: 449.99,
    stock: 30,
    category: 'electronics',
    tags: ['monitor', '4k', 'display'],
    images: ['monitor1.jpg', 'monitor2.jpg'],
  },
  {
    name: 'USB-C Hub',
    description: 'Multi-port USB-C hub with HDMI and ethernet',
    price: 59.99,
    stock: 75,
    category: 'electronics',
    tags: ['usb', 'hub', 'adapter'],
    images: ['hub1.jpg'],
  },
  {
    name: 'Desk Lamp',
    description: 'LED desk lamp with adjustable brightness',
    price: 39.99,
    stock: 40,
    category: 'furniture',
    tags: ['lamp', 'led', 'office'],
    images: ['lamp1.jpg'],
  },
]

try {
  console.log('🌱 Seeding products...')

  // Clear existing products
  await Product.deleteMany({})
  console.log('✨ Cleared existing products')

  // Insert sample products
  const products = await Product.insertMany(sampleProducts)
  console.log(`✅ Successfully created ${products.length} products`)

  // Display created products
  console.log('\n📦 Created products:')
  products.forEach((product: any) => {
    console.log(`  - ${product.name} ($${product.price}) [${product.category}]`)
  })

  console.log('\n✨ Seeding complete!')
} catch (error) {
  console.error('❌ Error seeding products:', error)
  throw error
}
