#!/usr/bin/env node

/**
 * Database Seeding Script
 *
 * Seeds the MongoDB database with sample data for development and testing.
 * This includes products, categories, and optionally an admin user.
 *
 * Usage:
 *   node scripts/seed-database.js          (seed all data)
 *   node scripts/seed-database.js --clear  (clear database first)
 *   node scripts/seed-database.js --help   (show help)
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
import Product from '../db/models/Product.js';
import User from '../db/models/User.js';
import connectDB from '../db/connection.js';

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

// Sample product data
const sampleProducts = [
  {
    name: 'Sunset Over Mountains',
    description: 'A vibrant oil painting capturing the golden hour over mountain peaks. Rich oranges and purples blend seamlessly to create a warm, inviting atmosphere.',
    price: 499.99,
    category: 'art',
    images: ['https://images.unsplash.com/photo-1560015534-cee980ba7e13?w=800'],
    stock: 3,
    featured: true,
    dimensions: '24" x 36"',
    medium: 'Oil on Canvas',
  },
  {
    name: 'Ocean Waves Abstract',
    description: 'An abstract interpretation of ocean waves using bold blues and whites. This piece brings the energy of the sea into any space.',
    price: 599.99,
    category: 'art',
    images: ['https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800'],
    stock: 2,
    featured: true,
    dimensions: '30" x 40"',
    medium: 'Acrylic on Canvas',
  },
  {
    name: 'Urban Landscape',
    description: 'A contemporary take on city architecture with geometric shapes and muted colors. Perfect for modern office spaces.',
    price: 449.99,
    category: 'art',
    images: ['https://images.unsplash.com/photo-1578926375605-eaf7559b46d5?w=800'],
    stock: 5,
    featured: false,
    dimensions: '20" x 30"',
    medium: 'Mixed Media',
  },
  {
    name: 'Forest Path',
    description: 'A serene forest scene with dappled sunlight filtering through tall trees. Creates a sense of peace and tranquility.',
    price: 379.99,
    category: 'art',
    images: ['https://images.unsplash.com/photo-1518893063132-36e46dbe2428?w=800'],
    stock: 4,
    featured: true,
    dimensions: '18" x 24"',
    medium: 'Watercolor',
  },
  {
    name: 'Abstract Expressions',
    description: 'Bold, expressive brushstrokes in vibrant reds, yellows, and blacks. A statement piece that demands attention.',
    price: 699.99,
    category: 'art',
    images: ['https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800'],
    stock: 1,
    featured: false,
    dimensions: '36" x 48"',
    medium: 'Oil on Canvas',
  },
  {
    name: 'Minimalist Circles',
    description: 'Simple geometric circles in black and white. A minimalist piece that complements any modern interior.',
    price: 299.99,
    category: 'art',
    images: ['https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800'],
    stock: 8,
    featured: false,
    dimensions: '16" x 20"',
    medium: 'Digital Print',
  },
  {
    name: 'Desert Dreams',
    description: 'Warm earth tones capture the essence of desert landscapes. Layers of texture create depth and interest.',
    price: 549.99,
    category: 'art',
    images: ['https://images.unsplash.com/photo-1549887534-1541e9326642?w=800'],
    stock: 3,
    featured: false,
    dimensions: '24" x 36"',
    medium: 'Acrylic on Canvas',
  },
  {
    name: 'Floral Burst',
    description: 'Vibrant flowers in full bloom with rich purples, pinks, and greens. Brings the beauty of nature indoors.',
    price: 429.99,
    category: 'art',
    images: ['https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800'],
    stock: 6,
    featured: true,
    dimensions: '20" x 24"',
    medium: 'Oil on Canvas',
  },
  {
    name: 'Monochrome Portrait',
    description: 'A striking black and white portrait study. Powerful contrasts and emotional depth.',
    price: 649.99,
    category: 'art',
    images: ['https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=800'],
    stock: 2,
    featured: false,
    dimensions: '24" x 30"',
    medium: 'Charcoal on Paper',
  },
  {
    name: 'Cosmic Wonder',
    description: 'An ethereal space-inspired piece with deep blues, purples, and sparkling whites. Evokes the mystery of the cosmos.',
    price: 799.99,
    category: 'art',
    images: ['https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=800'],
    stock: 1,
    featured: true,
    dimensions: '30" x 40"',
    medium: 'Mixed Media',
  },
];

// Admin user data (optional)
const adminUser = {
  email: 'admin@example.com',
  password: 'admin123', // Will be hashed
  role: 'admin',
};

async function clearDatabase() {
  console.log(`${colors.yellow}Clearing existing data...${colors.reset}`);

  await Product.deleteMany({});
  console.log(`${colors.green}  ✓ Cleared products${colors.reset}`);

  // Optionally clear users (commented out for safety)
  // await User.deleteMany({});
  // console.log(`${colors.green}  ✓ Cleared users${colors.reset}`);

  console.log();
}

async function seedProducts() {
  console.log(`${colors.cyan}Seeding products...${colors.reset}`);

  try {
    const products = await Product.insertMany(sampleProducts);
    console.log(`${colors.green}  ✓ Created ${products.length} products${colors.reset}`);

    // Show featured products
    const featuredCount = products.filter((p) => p.featured).length;
    console.log(`${colors.blue}  → ${featuredCount} featured products${colors.reset}`);

    return products;
  } catch (error) {
    console.error(`${colors.red}  ✗ Error seeding products: ${error.message}${colors.reset}`);
    throw error;
  }
}

async function seedAdminUser() {
  console.log(`${colors.cyan}Seeding admin user...${colors.reset}`);

  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });

    if (existingAdmin) {
      console.log(`${colors.yellow}  ⚠ Admin user already exists (${adminUser.email})${colors.reset}`);
      return existingAdmin;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminUser.password, 10);

    // Create admin user
    const admin = await User.create({
      email: adminUser.email,
      password: hashedPassword,
      role: adminUser.role,
    });

    console.log(`${colors.green}  ✓ Created admin user${colors.reset}`);
    console.log(`${colors.blue}     Email: ${adminUser.email}${colors.reset}`);
    console.log(`${colors.blue}     Password: ${adminUser.password}${colors.reset}`);
    console.log(`${colors.yellow}     ⚠ Change this password in production!${colors.reset}`);

    return admin;
  } catch (error) {
    console.error(`${colors.red}  ✗ Error seeding admin user: ${error.message}${colors.reset}`);
    throw error;
  }
}

async function showSummary(products) {
  console.log(`\n${colors.bright}${colors.green}Database Seeding Complete!${colors.reset}\n`);

  console.log(`${colors.cyan}Summary:${colors.reset}`);
  console.log(`  Products: ${products.length}`);
  console.log(`  Total Inventory Value: $${products.reduce((sum, p) => sum + p.price, 0).toFixed(2)}`);
  console.log(`  Featured Products: ${products.filter((p) => p.featured).length}`);
  console.log(`  Total Stock Units: ${products.reduce((sum, p) => sum + p.stock, 0)}`);

  console.log(`\n${colors.cyan}Categories:${colors.reset}`);
  const categories = [...new Set(products.map((p) => p.category))];
  categories.forEach((cat) => {
    const count = products.filter((p) => p.category === cat).length;
    console.log(`  ${cat}: ${count} products`);
  });

  console.log(`\n${colors.yellow}Next Steps:${colors.reset}`);
  console.log(`  1. Start the server: ${colors.bright}node server.js${colors.reset}`);
  console.log(`  2. Visit the shop: ${colors.bright}http://localhost:5173/shop${colors.reset}`);
  console.log(`  3. Login to admin: ${colors.bright}http://localhost:5173/admin${colors.reset}`);
  console.log(`     Email: admin@example.com`);
  console.log(`     Password: admin123`);
  console.log(`\n${colors.red}  ⚠ Remember to change the admin password!${colors.reset}\n`);
}

async function main() {
  const args = process.argv.slice(2);

  // Show help
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
${colors.bright}Database Seeding Script${colors.reset}

${colors.cyan}Usage:${colors.reset}
  node scripts/seed-database.js          Seed database with sample data
  node scripts/seed-database.js --clear  Clear existing data before seeding
  node scripts/seed-database.js --help   Show this help message

${colors.cyan}Options:${colors.reset}
  --clear    Delete all existing products before seeding
  --no-user  Skip creating admin user
  --help     Show this help message

${colors.cyan}Examples:${colors.reset}
  node scripts/seed-database.js          # Seed with sample data
  node scripts/seed-database.js --clear  # Clear and reseed
  node scripts/seed-database.js --no-user # Seed products only
    `);
    process.exit(0);
  }

  try {
    console.log(`${colors.bright}${colors.blue}
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║               Database Seeding Script                      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}\n`);

    // Connect to database
    console.log(`${colors.cyan}Connecting to MongoDB...${colors.reset}`);
    await connectDB();
    console.log(`${colors.green}  ✓ Connected successfully${colors.reset}\n`);

    // Clear database if --clear flag is present
    if (args.includes('--clear')) {
      await clearDatabase();
    }

    // Seed products
    const products = await seedProducts();
    console.log();

    // Seed admin user (unless --no-user flag is present)
    if (!args.includes('--no-user')) {
      await seedAdminUser();
    }

    // Show summary
    await showSummary(products);

    // Disconnect
    await mongoose.connection.close();
    console.log(`${colors.cyan}Database connection closed${colors.reset}\n`);

    process.exit(0);
  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}Error: ${error.message}${colors.reset}\n`);
    process.exit(1);
  }
}

main();
