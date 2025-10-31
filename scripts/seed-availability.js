import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

import { Availability } from '../db/models/Availability.js';
import { Staff } from '../db/models/Staff.js';
import { getDatabase } from '../db/connection.js';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
};

async function createAvailability() {
  console.log(`${colors.cyan}Creating availability schedules for staff...${colors.reset}\n`);

  try {
    await getDatabase();
    console.log(`${colors.green}✓ Connected to database${colors.reset}\n`);

    // Get all staff
    const { staff } = await Staff.findAll({ limit: 100 });
    console.log(`${colors.blue}Found ${staff.length} staff members${colors.reset}\n`);

    for (const member of staff) {
      console.log(`${colors.cyan}Creating schedule for ${member.name}...${colors.reset}`);

      // Standard Monday-Friday 9am-5pm schedule
      const schedule = [
        { dayOfWeek: 1, timeSlots: [{ startTime: '09:00', endTime: '17:00' }] }, // Monday
        { dayOfWeek: 2, timeSlots: [{ startTime: '09:00', endTime: '17:00' }] }, // Tuesday
        { dayOfWeek: 3, timeSlots: [{ startTime: '09:00', endTime: '17:00' }] }, // Wednesday
        { dayOfWeek: 4, timeSlots: [{ startTime: '09:00', endTime: '17:00' }] }, // Thursday
        { dayOfWeek: 5, timeSlots: [{ startTime: '09:00', endTime: '17:00' }] }, // Friday
      ];

      const availability = await Availability.create({
        staffId: member._id.toString(),
        schedule,
        exceptions: [],
        overrides: [],
        effectiveFrom: new Date(),
        effectiveTo: null, // Indefinite
      });

      console.log(`${colors.green}  ✓ Created availability schedule (ID: ${availability._id})${colors.reset}`);
    }

    console.log(`\n${colors.green}All availability schedules created successfully!${colors.reset}\n`);
    console.log(`${colors.yellow}Staff are now available:${colors.reset}`);
    console.log(`  Monday-Friday: 9:00 AM - 5:00 PM`);
    console.log(`  Weekends: Unavailable\n`);

    process.exit(0);
  } catch (error) {
    console.error(`${colors.yellow}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

createAvailability();
