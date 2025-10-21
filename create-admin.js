import 'dotenv/config';
import { User } from './db/models/User.js';
import { getDatabase, closeConnection } from './db/connection.js';

async function createAdminUser() {
  try {
    // Connect to database
    await getDatabase();
    console.log('✅ Connected to MongoDB');

    // Admin user credentials
    const adminData = {
      email: 'admin@markjpetersonart.com',
      password: 'MarkPeterson2025!',  // Strong password that meets all requirements
      name: 'Admin User',
      role: 'admin',
      phone: null,
      timeZone: 'America/New_York'
    };

    // Create admin user
    const admin = await User.create(adminData);

    console.log('\n🎉 Admin user created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Email:', adminData.email);
    console.log('Password:', adminData.password);
    console.log('\n🔗 Login URL: http://localhost:5173/admin');
    console.log('\n⚠️  IMPORTANT: Change this password after first login!\n');

  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('\n⚠️  Admin user already exists!');
      console.log('\n📋 Existing Admin Credentials:');
      console.log('Email: admin@markjpetersonart.com');
      console.log('Password: MarkPeterson2025!');
      console.log('\n🔗 Login URL: http://localhost:5173/admin\n');
    } else if (error.validationErrors) {
      console.error('\n❌ Password validation failed:');
      error.validationErrors.forEach(err => console.error('  -', err));
    } else {
      console.error('\n❌ Error creating admin user:', error.message);
    }
  } finally {
    // Close database connection
    await closeConnection();
    process.exit(0);
  }
}

createAdminUser();
