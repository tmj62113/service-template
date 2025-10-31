#!/usr/bin/env node

/**
 * Database Seeding Script - Service Booking Platform
 *
 * Seeds the MongoDB database with sample data for development and testing.
 * This includes services, staff members, and optionally an admin user.
 *
 * Usage:
 *   node scripts/seed-database.js          (seed all data)
 *   node scripts/seed-database.js --clear  (clear database first)
 *   node scripts/seed-database.js --help   (show help)
 */

import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
import { Service } from '../db/models/Service.js';
import { Staff } from '../db/models/Staff.js';
import { User } from '../db/models/User.js';
import { getDatabase } from '../db/connection.js';
// [LEGACY E-COMMERCE - DEPRECATED] import Product from '../db/models/Product.js';

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

// Sample staff data
const sampleStaff = [
  {
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '+1-555-0101',
    bio: 'Certified professional coach with 10+ years of experience helping individuals achieve their personal and professional goals. Specializes in career transitions and leadership development.',
    title: 'Senior Career Coach',
    specialties: ['Career Development', 'Leadership Coaching', 'Executive Coaching'],
    isActive: true,
    acceptingBookings: true,
    timeZone: 'America/New_York',
  },
  {
    name: 'Michael Chen',
    email: 'michael@example.com',
    phone: '+1-555-0102',
    bio: 'Licensed therapist specializing in cognitive behavioral therapy and mindfulness practices. Dedicated to helping clients develop healthy coping strategies and achieve mental wellness.',
    title: 'Licensed Therapist',
    specialties: ['CBT', 'Anxiety Management', 'Stress Reduction', 'Mindfulness'],
    isActive: true,
    acceptingBookings: true,
    timeZone: 'America/Los_Angeles',
  },
  {
    name: 'Emily Rodriguez',
    email: 'emily@example.com',
    phone: '+1-555-0103',
    bio: 'Certified personal trainer and nutrition specialist. Passionate about helping clients achieve their fitness goals through personalized workout plans and sustainable nutrition habits.',
    title: 'Certified Personal Trainer',
    specialties: ['Strength Training', 'Weight Loss', 'Nutrition Planning', 'HIIT'],
    isActive: true,
    acceptingBookings: true,
    timeZone: 'America/Chicago',
  },
  {
    name: 'David Kim',
    email: 'david@example.com',
    phone: '+1-555-0104',
    bio: 'Business consultant with expertise in strategy, operations, and digital transformation. Helps small to medium businesses optimize their processes and scale effectively.',
    title: 'Business Strategy Consultant',
    specialties: ['Business Strategy', 'Operations', 'Digital Transformation', 'Process Optimization'],
    isActive: true,
    acceptingBookings: true,
    timeZone: 'America/Denver',
  },
];

// Sample services data (will be linked to staff after creation)
const sampleServices = [
  {
    name: '60-Minute Career Coaching Session',
    description: 'One-on-one career coaching session focused on your professional development, career transitions, or leadership skills. Includes personalized action plan and follow-up resources.',
    category: 'Individual',
    duration: 60,
    price: 15000, // $150.00 in cents
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800',
    isActive: true,
    bufferTime: 15,
    maxAdvanceBooking: 60,
    cancellationPolicy: {
      hoursBeforeStart: 24,
      refundPercentage: 100,
    },
  },
  {
    name: 'Initial Therapy Consultation',
    description: 'First-time consultation to discuss your mental health goals, assess your needs, and create a personalized treatment plan. A safe, confidential space to begin your wellness journey.',
    category: 'Individual',
    duration: 90,
    price: 18000, // $180.00 in cents
    image: 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=800',
    isActive: true,
    bufferTime: 30,
    maxAdvanceBooking: 30,
    cancellationPolicy: {
      hoursBeforeStart: 48,
      refundPercentage: 100,
    },
  },
  {
    name: 'Personal Training Session',
    description: 'Customized one-on-one training session tailored to your fitness goals. Includes exercise instruction, form correction, and motivation to help you reach your potential.',
    category: 'Individual',
    duration: 60,
    price: 9500, // $95.00 in cents
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
    isActive: true,
    bufferTime: 15,
    maxAdvanceBooking: 45,
    cancellationPolicy: {
      hoursBeforeStart: 12,
      refundPercentage: 50,
    },
  },
  {
    name: 'Business Strategy Consultation',
    description: 'In-depth business consultation to analyze your current operations, identify growth opportunities, and develop actionable strategies for your business success.',
    category: 'Individual',
    duration: 120,
    price: 25000, // $250.00 in cents
    image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800',
    isActive: true,
    bufferTime: 30,
    maxAdvanceBooking: 90,
    cancellationPolicy: {
      hoursBeforeStart: 48,
      refundPercentage: 100,
    },
  },
  {
    name: '30-Minute Check-In Session',
    description: 'Quick follow-up session for existing clients. Perfect for progress updates, addressing specific questions, or maintaining momentum between longer sessions.',
    category: 'Individual',
    duration: 30,
    price: 7500, // $75.00 in cents
    image: 'https://images.unsplash.com/photo-1551836022-4c4c79ecde51?w=800',
    isActive: true,
    bufferTime: 10,
    maxAdvanceBooking: 30,
    cancellationPolicy: {
      hoursBeforeStart: 24,
      refundPercentage: 100,
    },
  },
  {
    name: 'Group Fitness Class',
    description: 'High-energy group fitness class combining cardio, strength training, and core work. Maximum 10 participants for personalized attention in a motivating group environment.',
    category: 'Group',
    duration: 45,
    price: 3500, // $35.00 in cents
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
    isActive: true,
    bufferTime: 15,
    maxAdvanceBooking: 14,
    cancellationPolicy: {
      hoursBeforeStart: 6,
      refundPercentage: 0,
    },
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

  const db = await getDatabase();

  await db.collection('services').deleteMany({});
  console.log(`${colors.green}  ✓ Cleared services${colors.reset}`);

  await db.collection('staff').deleteMany({});
  console.log(`${colors.green}  ✓ Cleared staff${colors.reset}`);

  // Optionally clear users (commented out for safety)
  // await db.collection('users').deleteMany({});
  // console.log(`${colors.green}  ✓ Cleared users${colors.reset}`);

  console.log();
}

async function seedStaff() {
  console.log(`${colors.cyan}Seeding staff members...${colors.reset}`);

  try {
    const staffRecords = [];
    for (const staffData of sampleStaff) {
      const staff = await Staff.create(staffData);
      staffRecords.push(staff);
    }
    console.log(`${colors.green}  ✓ Created ${staffRecords.length} staff members${colors.reset}`);

    // Show active staff
    const activeCount = staffRecords.filter((s) => s.isActive && s.acceptingBookings).length;
    console.log(`${colors.blue}  → ${activeCount} accepting bookings${colors.reset}`);

    return staffRecords;
  } catch (error) {
    console.error(`${colors.red}  ✗ Error seeding staff: ${error.message}${colors.reset}`);
    throw error;
  }
}

async function seedServices(staffMembers) {
  console.log(`${colors.cyan}Seeding services...${colors.reset}`);

  try {
    // Assign staff to services based on their specialties
    const servicesWithStaff = sampleServices.map((service, index) => {
      // Assign 1-2 staff members per service
      const assignedStaff = [];

      if (service.name.includes('Career Coaching')) {
        assignedStaff.push(staffMembers[0]._id); // Sarah Johnson
      } else if (service.name.includes('Therapy')) {
        assignedStaff.push(staffMembers[1]._id); // Michael Chen
      } else if (service.name.includes('Training') || service.name.includes('Fitness')) {
        assignedStaff.push(staffMembers[2]._id); // Emily Rodriguez
      } else if (service.name.includes('Business')) {
        assignedStaff.push(staffMembers[3]._id); // David Kim
      } else if (service.name.includes('Check-In')) {
        // Check-in sessions available with all coaches
        assignedStaff.push(staffMembers[0]._id, staffMembers[1]._id, staffMembers[3]._id);
      }

      return {
        ...service,
        staffIds: assignedStaff,
      };
    });

    const serviceRecords = [];
    for (const serviceData of servicesWithStaff) {
      const service = await Service.create(serviceData);
      serviceRecords.push(service);
    }
    console.log(`${colors.green}  ✓ Created ${serviceRecords.length} services${colors.reset}`);

    // Show service categories
    const categories = [...new Set(serviceRecords.map((s) => s.category))];
    categories.forEach((cat) => {
      const count = serviceRecords.filter((s) => s.category === cat).length;
      console.log(`${colors.blue}  → ${count} ${cat} service(s)${colors.reset}`);
    });

    return serviceRecords;
  } catch (error) {
    console.error(`${colors.red}  ✗ Error seeding services: ${error.message}${colors.reset}`);
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

async function showSummary(staff, services) {
  console.log(`\n${colors.bright}${colors.green}Database Seeding Complete!${colors.reset}\n`);

  console.log(`${colors.cyan}Summary:${colors.reset}`);
  console.log(`  Staff Members: ${staff.length}`);
  console.log(`  Services Available: ${services.length}`);
  console.log(`  Active Staff: ${staff.filter((s) => s.isActive && s.acceptingBookings).length}`);

  // Calculate total revenue potential (average price * services)
  const avgPrice = services.reduce((sum, s) => sum + s.price, 0) / services.length / 100;
  console.log(`  Average Service Price: $${avgPrice.toFixed(2)}`);

  console.log(`\n${colors.cyan}Service Categories:${colors.reset}`);
  const categories = [...new Set(services.map((s) => s.category))];
  categories.forEach((cat) => {
    const count = services.filter((s) => s.category === cat).length;
    const catServices = services.filter((s) => s.category === cat);
    const avgDuration = catServices.reduce((sum, s) => sum + s.duration, 0) / catServices.length;
    console.log(`  ${cat}: ${count} service(s), avg ${avgDuration} min`);
  });

  console.log(`\n${colors.cyan}Staff Details:${colors.reset}`);
  staff.forEach((member) => {
    const assignedServices = services.filter((s) => s.staffIds.some((id) => id.equals(member._id)));
    console.log(`  ${member.name} (${member.title})`);
    console.log(`    → ${assignedServices.length} service(s) assigned`);
  });

  console.log(`\n${colors.yellow}Next Steps:${colors.reset}`);
  console.log(`  1. Start the server: ${colors.bright}node server.js${colors.reset}`);
  console.log(`  2. Visit the services: ${colors.bright}http://localhost:5173/services${colors.reset}`);
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
${colors.bright}Database Seeding Script - Service Booking Platform${colors.reset}

${colors.cyan}Usage:${colors.reset}
  node scripts/seed-database.js          Seed database with sample data
  node scripts/seed-database.js --clear  Clear existing data before seeding
  node scripts/seed-database.js --help   Show this help message

${colors.cyan}Options:${colors.reset}
  --clear    Delete all existing services and staff before seeding
  --no-user  Skip creating admin user
  --help     Show this help message

${colors.cyan}What gets seeded:${colors.reset}
  - 4 sample staff members (coaches, therapists, trainers, consultants)
  - 6 sample services (individual and group sessions)
  - 1 admin user (optional)

${colors.cyan}Examples:${colors.reset}
  node scripts/seed-database.js          # Seed with sample data
  node scripts/seed-database.js --clear  # Clear and reseed
  node scripts/seed-database.js --no-user # Seed services/staff only
    `);
    process.exit(0);
  }

  try {
    console.log(`${colors.bright}${colors.blue}
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║       Database Seeding Script - Service Booking            ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}\n`);

    // Connect to database
    console.log(`${colors.cyan}Connecting to MongoDB...${colors.reset}`);
    await getDatabase();
    console.log(`${colors.green}  ✓ Connected successfully${colors.reset}\n`);

    // Clear database if --clear flag is present
    if (args.includes('--clear')) {
      await clearDatabase();
    }

    // Seed staff first (services depend on staff IDs)
    const staff = await seedStaff();
    console.log();

    // Seed services (with staff assignments)
    const services = await seedServices(staff);
    console.log();

    // Seed admin user (unless --no-user flag is present)
    if (!args.includes('--no-user')) {
      await seedAdminUser();
    }

    // Show summary
    await showSummary(staff, services);

    // Note: Connection is managed by the connection module
    console.log(`${colors.cyan}Seeding complete${colors.reset}\n`);

    process.exit(0);
  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}Error: ${error.message}${colors.reset}\n`);
    process.exit(1);
  }
}

main();
