import dotenv from 'dotenv';
dotenv.config();

import { User } from '../db/models/User.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  try {
    console.log('\n=== Create Admin User ===\n');

    const name = await question('Enter admin name: ');
    const email = await question('Enter admin email: ');
    const password = await question('Enter password: ');

    if (!name || !email || !password) {
      console.log('\n❌ All fields are required');
      rl.close();
      process.exit(1);
    }

    const user = await User.create({
      name,
      email,
      password
    });

    console.log('\n✅ Admin user created successfully!');
    console.log(`Name: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`ID: ${user._id}\n`);

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating admin user:', error.message);

    // Show validation errors if they exist
    if (error.validationErrors && error.validationErrors.length > 0) {
      console.error('\nPassword requirements:');
      error.validationErrors.forEach(err => console.error(`  - ${err}`));
    }

    rl.close();
    process.exit(1);
  }
}

createAdmin();
