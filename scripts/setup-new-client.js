#!/usr/bin/env node

/**
 * Template Branding Removal Script
 *
 * This interactive script helps you remove the default template branding
 * and replace it with your own business information.
 *
 * Usage: node scripts/setup-new-client.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Promisify readline question
function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

// Template branding to search for and replace
const TEMPLATE_BRANDING = {
  businessName: 'Mark J Peterson Art',
  businessNameShort: 'Mark Peterson',
  artistName: 'Mark J. Peterson',
  domain: 'markjpetersonart.com',
  email: 'mark@markjpetersonart.com',
  description: 'Contemporary art by Mark J. Peterson',
  tagline: 'Bold, expressive artwork',
};

// Files to update (relative to project root)
const FILES_TO_UPDATE = [
  'package.json',
  'README.md',
  'src/config/theme.js',
  'src/components/layout/Header.jsx',
  'src/components/layout/Footer.jsx',
  'src/pages/Home.jsx',
  'src/pages/About.jsx',
  'src/pages/Contact.jsx',
  'public/index.html',
  'PRIVACY_POLICY.md',
  'TERMS_OF_SERVICE.md',
];

console.log(`${colors.bright}${colors.blue}
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║        E-Commerce Template Setup Wizard                    ║
║                                                            ║
║  This script will help you customize the template for      ║
║  your business by replacing all default branding.          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}\n`);

async function collectClientInfo() {
  console.log(`${colors.cyan}Let's gather your business information:\n${colors.reset}`);

  const clientInfo = {};

  clientInfo.businessName = await question(
    `${colors.bright}Business Name:${colors.reset} (e.g., "Acme Art Gallery") `
  );

  clientInfo.businessNameShort = await question(
    `${colors.bright}Short Business Name:${colors.reset} (e.g., "Acme") [${clientInfo.businessName}] `
  ) || clientInfo.businessName;

  clientInfo.ownerName = await question(
    `${colors.bright}Owner/Artist Name:${colors.reset} (e.g., "Jane Smith") `
  );

  clientInfo.domain = await question(
    `${colors.bright}Domain Name:${colors.reset} (e.g., "acmeart.com") `
  );

  clientInfo.email = await question(
    `${colors.bright}Contact Email:${colors.reset} (e.g., "info@acmeart.com") `
  );

  clientInfo.description = await question(
    `${colors.bright}Business Description:${colors.reset} (e.g., "Contemporary art gallery") `
  );

  clientInfo.tagline = await question(
    `${colors.bright}Business Tagline:${colors.reset} (e.g., "Where art comes alive") [Optional] `
  ) || '';

  console.log(`\n${colors.yellow}Review your information:${colors.reset}`);
  console.log(`Business Name: ${clientInfo.businessName}`);
  console.log(`Short Name: ${clientInfo.businessNameShort}`);
  console.log(`Owner: ${clientInfo.ownerName}`);
  console.log(`Domain: ${clientInfo.domain}`);
  console.log(`Email: ${clientInfo.email}`);
  console.log(`Description: ${clientInfo.description}`);
  console.log(`Tagline: ${clientInfo.tagline || '(none)'}\n`);

  const confirm = await question(
    `${colors.bright}Is this correct? (yes/no):${colors.reset} `
  );

  if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
    console.log(`${colors.red}Setup cancelled. Please run the script again.${colors.reset}`);
    process.exit(0);
  }

  return clientInfo;
}

function replaceInFile(filePath, replacements) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`${colors.yellow}  ⚠ File not found: ${filePath}${colors.reset}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Apply all replacements
    for (const [oldValue, newValue] of Object.entries(replacements)) {
      if (content.includes(oldValue)) {
        // Use regex with global flag to replace all occurrences
        const regex = new RegExp(oldValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        content = content.replace(regex, newValue);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`${colors.green}  ✓ Updated: ${filePath}${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.blue}  - No changes needed: ${filePath}${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.log(`${colors.red}  ✗ Error updating ${filePath}: ${error.message}${colors.reset}`);
    return false;
  }
}

function createReplacementMap(clientInfo) {
  return {
    [TEMPLATE_BRANDING.businessName]: clientInfo.businessName,
    [TEMPLATE_BRANDING.businessNameShort]: clientInfo.businessNameShort,
    [TEMPLATE_BRANDING.artistName]: clientInfo.ownerName,
    [TEMPLATE_BRANDING.domain]: clientInfo.domain,
    [TEMPLATE_BRANDING.email]: clientInfo.email,
    [TEMPLATE_BRANDING.description]: clientInfo.description,
    ...(clientInfo.tagline && { [TEMPLATE_BRANDING.tagline]: clientInfo.tagline }),
  };
}

async function updateFiles(clientInfo) {
  console.log(`\n${colors.cyan}Updating files with your branding...${colors.reset}\n`);

  const replacements = createReplacementMap(clientInfo);
  let updatedCount = 0;

  for (const file of FILES_TO_UPDATE) {
    const filePath = path.join(projectRoot, file);
    if (replaceInFile(filePath, replacements)) {
      updatedCount++;
    }
  }

  console.log(`\n${colors.green}${colors.bright}✓ Updated ${updatedCount} files successfully!${colors.reset}\n`);
}

async function updatePackageJson(clientInfo) {
  console.log(`${colors.cyan}Updating package.json metadata...${colors.reset}\n`);

  const packageJsonPath = path.join(projectRoot, 'package.json');

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Update package.json fields
    packageJson.name = clientInfo.businessName.toLowerCase().replace(/\s+/g, '-');
    packageJson.description = clientInfo.description;
    packageJson.author = clientInfo.ownerName;

    if (packageJson.repository) {
      delete packageJson.repository; // User should add their own
    }

    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8');
    console.log(`${colors.green}  ✓ Updated package.json${colors.reset}\n`);
  } catch (error) {
    console.log(`${colors.red}  ✗ Error updating package.json: ${error.message}${colors.reset}\n`);
  }
}

async function createEnvReminder() {
  console.log(`${colors.yellow}${colors.bright}⚠ IMPORTANT NEXT STEPS:${colors.reset}\n`);

  console.log(`${colors.cyan}1. Update your .env file with your own credentials:${colors.reset}`);
  console.log(`   - MongoDB connection string`);
  console.log(`   - Stripe API keys`);
  console.log(`   - Cloudinary credentials`);
  console.log(`   - Resend API key`);
  console.log(`   - JWT secret\n`);

  console.log(`${colors.cyan}2. Update legal documents:${colors.reset}`);
  console.log(`   - PRIVACY_POLICY.md`);
  console.log(`   - TERMS_OF_SERVICE.md`);
  console.log(`   - Add your business address and legal entity info\n`);

  console.log(`${colors.cyan}3. Replace images and assets:${colors.reset}`);
  console.log(`   - public/logo.png (your logo)`);
  console.log(`   - public/favicon.ico (your favicon)`);
  console.log(`   - public/og-image.png (Open Graph image for social sharing)\n`);

  console.log(`${colors.cyan}4. Customize theme colors:${colors.reset}`);
  console.log(`   - Edit src/config/theme.js`);
  console.log(`   - Update primary, secondary, and accent colors\n`);

  console.log(`${colors.cyan}5. Review and customize:${colors.reset}`);
  console.log(`   - src/pages/About.jsx (your story)`);
  console.log(`   - src/components/layout/Footer.jsx (footer links)\n`);

  console.log(`${colors.green}${colors.bright}Setup complete! 🎉${colors.reset}\n`);
  console.log(`Run ${colors.bright}npm run dev${colors.reset} to start your customized application.\n`);
}

async function main() {
  try {
    const clientInfo = await collectClientInfo();
    await updateFiles(clientInfo);
    await updatePackageJson(clientInfo);
    await createEnvReminder();

    rl.close();
  } catch (error) {
    console.error(`${colors.red}Error during setup: ${error.message}${colors.reset}`);
    rl.close();
    process.exit(1);
  }
}

main();
