import dotenv from 'dotenv';
dotenv.config();

import { User } from '../db/models/User.js';
import { getDatabase } from '../db/connection.js';

async function unlockAccount() {
  try {
    // Get email from command line argument
    const email = process.argv[2];

    if (!email) {
      console.error('❌ Please provide an email address');
      console.log('Usage: node scripts/unlock-account.js <email>');
      process.exit(1);
    }

    // Connect to database
    await getDatabase();

    // Get current lockout info
    const lockInfo = await User.getLockoutInfo(email);
    console.log('\n📊 Current Account Status:');
    console.log('  Email:', email);
    console.log('  Failed Attempts:', lockInfo.failedAttempts);
    console.log('  Is Locked:', lockInfo.isLocked);
    console.log('  Remaining Attempts:', lockInfo.remainingAttempts);
    if (lockInfo.lockoutUntil) {
      console.log('  Locked Until:', lockInfo.lockoutUntil);
    }

    // Unlock the account
    await User.unlockAccount(email);

    console.log('\n✅ Account unlocked successfully!');
    console.log('  Failed attempts reset to 0');
    console.log('  Account lockout removed');
    console.log(`\n${email} can now login normally.\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error unlocking account:', error);
    process.exit(1);
  }
}

unlockAccount();
