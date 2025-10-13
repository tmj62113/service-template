import dotenv from 'dotenv';
dotenv.config();

import { Product } from '../db/models/Product.js';

const products = [
  {
    id: 1,
    name: "Premium Wireless Headphones",
    price: 299.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
    category: "Electronics",
    description: "High-quality wireless headphones with noise cancellation and premium sound.",
    stock: 15,
    rating: 4.5,
    reviews: 128,
    status: "Available",
  },
  {
    id: 2,
    name: "Smart Watch Pro",
    price: 399.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
    category: "Electronics",
    description: "Advanced smartwatch with health tracking and notifications.",
    stock: 8,
    rating: 4.7,
    reviews: 256,
    status: "Available",
  },
  {
    id: 3,
    name: "Minimalist Backpack",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop",
    category: "Accessories",
    description: "Sleek and functional backpack perfect for daily commute.",
    stock: 24,
    rating: 4.3,
    reviews: 89,
    status: "Available",
  },
  {
    id: 4,
    name: "Professional Camera",
    price: 1299.99,
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=500&h=500&fit=crop",
    category: "Electronics",
    description: "Professional-grade camera for stunning photography.",
    stock: 5,
    rating: 4.8,
    reviews: 342,
    status: "Available",
  },
  {
    id: 5,
    name: "Leather Wallet",
    price: 49.99,
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&h=500&fit=crop",
    category: "Accessories",
    description: "Genuine leather wallet with RFID protection.",
    stock: 42,
    rating: 4.4,
    reviews: 167,
    status: "Available",
  },
  {
    id: 6,
    name: "Running Shoes",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop",
    category: "Footwear",
    description: "Comfortable running shoes with superior cushioning.",
    stock: 18,
    rating: 4.6,
    reviews: 203,
    status: "Available",
  },
  {
    id: 7,
    name: "Sunglasses",
    price: 159.99,
    image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop",
    category: "Accessories",
    description: "Polarized sunglasses with UV protection.",
    stock: 31,
    rating: 4.2,
    reviews: 94,
    status: "Available",
  },
  {
    id: 8,
    name: "Bluetooth Speaker",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&h=500&fit=crop",
    category: "Electronics",
    description: "Portable waterproof speaker with 12-hour battery life.",
    stock: 27,
    rating: 4.5,
    reviews: 178,
    status: "Available",
  },
];

async function migrateProducts() {
  try {
    console.log('🚀 Starting product migration...');

    // Check if products already exist
    const existingProducts = await Product.findAll({ limit: 1 });
    if (existingProducts.products.length > 0) {
      console.log('⚠️  Products already exist in database. Skipping migration.');
      console.log('   Delete existing products first if you want to re-migrate.');
      process.exit(0);
    }

    // Insert each product
    for (const product of products) {
      const created = await Product.create(product);
      console.log(`✅ Created: ${created.name}`);
    }

    console.log(`\n🎉 Successfully migrated ${products.length} products!`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateProducts();
