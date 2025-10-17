/**
 * Environment Variable Validation
 *
 * Validates that all required environment variables are set.
 * Server will fail to start if any are missing in production.
 *
 * For template users: Update the required array if you add new services
 */

/**
 * Validate required environment variables
 * Server should fail to start if any are missing in production
 */
export function validateRequiredEnv() {
  const required = [
    'JWT_SECRET',
    'MONGODB_URI',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'RESEND_API_KEY',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'CLIENT_URL'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('\n❌ FATAL: Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    console.error('\nServer cannot start without these variables.');
    console.error('Please check your .env file and ensure all required variables are set.\n');
    process.exit(1);
  }

  // Validate JWT_SECRET strength in production
  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_SECRET.length < 32) {
      console.error('\n❌ FATAL: JWT_SECRET must be at least 32 characters in production');
      console.error('Current length:', process.env.JWT_SECRET.length);
      console.error('\nGenerate a strong secret with: openssl rand -base64 32\n');
      process.exit(1);
    }
  }

  console.log('✅ All required environment variables are set');
}

/**
 * Validate optional but recommended environment variables
 * Logs warnings but doesn't prevent server startup
 */
export function validateOptionalEnv() {
  const recommended = {
    'EMAIL_FROM': 'Custom email sender address',
    'SENTRY_DSN': 'Error tracking service',
    'NODE_ENV': 'Environment (development/production)'
  };

  const missing = Object.keys(recommended).filter(key => !process.env[key]);

  if (missing.length > 0 && process.env.NODE_ENV === 'production') {
    console.warn('\n⚠️  Warning: Missing recommended environment variables:');
    missing.forEach(key => {
      console.warn(`   - ${key}: ${recommended[key]}`);
    });
    console.warn('');
  }
}
