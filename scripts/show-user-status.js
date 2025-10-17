import dotenv from 'dotenv';
dotenv.config();

import { getDatabase } from '../db/connection.js';

async function showUserStatus() {
  try {
    const db = await getDatabase();
    const usersCollection = db.collection('users');

    const users = await usersCollection.find({}).toArray();

    if (users.length === 0) {
      console.log('No users found in database');
      process.exit(0);
    }

    console.log('\n👥 User Account Status:\n');

    for (const user of users) {
      const failedAttempts = user.failedLoginAttempts || 0;
      const isLocked = user.lockoutUntil && user.lockoutUntil > new Date();

      console.log('━'.repeat(60));
      console.log(`📧 Email: ${user.email}`);
      console.log(`👤 Name: ${user.name}`);
      console.log(`🔑 Role: ${user.role}`);
      console.log(`❌ Failed Attempts: ${failedAttempts}/5`);
      console.log(`🔒 Is Locked: ${isLocked ? '🔴 YES' : '🟢 NO'}`);

      if (isLocked) {
        const minutesRemaining = Math.ceil((user.lockoutUntil - new Date()) / 1000 / 60);
        console.log(`⏰ Locked Until: ${user.lockoutUntil.toLocaleString()}`);
        console.log(`⏳ Minutes Remaining: ${minutesRemaining}`);
      }

      if (user.lastLoginAt) {
        console.log(`📅 Last Login: ${user.lastLoginAt.toLocaleString()}`);
      }
      console.log('');
    }

    console.log('━'.repeat(60));
    console.log('\n💡 To unlock an account, run:');
    console.log('   node scripts/unlock-account.js <email>\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

showUserStatus();
