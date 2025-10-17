import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send new login alert email
 * @param {Object} params
 * @param {string} params.email - User email
 * @param {string} params.name - User name
 * @param {string} params.ipAddress - IP address of login
 * @param {string} params.userAgent - User agent string
 * @param {Date} params.timestamp - Login timestamp
 */
export async function sendNewLoginAlert({ email, name, ipAddress, userAgent, timestamp }) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Mark J Peterson Art Security <onboarding@resend.dev>',
      to: email,
      subject: 'New Login to Your Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: #ffffff; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #1f2937; margin-top: 0; border-bottom: 2px solid #c0a679; padding-bottom: 16px;">New Login Detected</h2>

            <p style="color: #4b5563; line-height: 1.6; margin: 20px 0;">
              Hi ${name},
            </p>

            <p style="color: #4b5563; line-height: 1.6; margin: 20px 0;">
              We detected a new login to your Mark J Peterson Art account. If this was you, no action is needed.
            </p>

            <div style="background-color: #f3f4f6; border-radius: 6px; padding: 16px; margin: 24px 0;">
              <p style="margin: 8px 0; color: #374151;"><strong>Time:</strong> ${new Date(timestamp).toLocaleString('en-US', {
                dateStyle: 'full',
                timeStyle: 'long'
              })}</p>
              <p style="margin: 8px 0; color: #374151;"><strong>IP Address:</strong> ${ipAddress}</p>
              <p style="margin: 8px 0; color: #374151;"><strong>Device:</strong> ${userAgent}</p>
            </div>

            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>⚠️ Didn't recognize this login?</strong><br>
                Someone may have accessed your account. Please log in immediately and change your password.
              </p>
            </div>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin" style="display: inline-block; padding: 12px 32px; background-color: #c0a679; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">
                View Account Security
              </a>
            </div>

            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                This is an automated security alert from Mark J Peterson Art. You're receiving this because you have an admin account.
              </p>
            </div>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('❌ Failed to send new login alert:', error);
      return false;
    }

    console.log('📧 New login alert sent:', data.id);
    return true;
  } catch (error) {
    console.error('❌ Error sending new login alert:', error);
    return false;
  }
}

/**
 * Send account lockout alert email
 * @param {Object} params
 * @param {string} params.email - User email
 * @param {string} params.name - User name
 * @param {Date} params.lockedUntil - When account will be unlocked
 * @param {number} params.failedAttempts - Number of failed attempts
 */
export async function sendAccountLockoutAlert({ email, name, lockedUntil, failedAttempts }) {
  try {
    const minutesLocked = Math.ceil((new Date(lockedUntil) - new Date()) / 60000);

    const { data, error } = await resend.emails.send({
      from: 'Mark J Peterson Art Security <onboarding@resend.dev>',
      to: email,
      subject: '⚠️ Account Temporarily Locked',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: #ffffff; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #dc2626; margin-top: 0; border-bottom: 2px solid #dc2626; padding-bottom: 16px;">⚠️ Account Locked</h2>

            <p style="color: #4b5563; line-height: 1.6; margin: 20px 0;">
              Hi ${name},
            </p>

            <p style="color: #4b5563; line-height: 1.6; margin: 20px 0;">
              Your account has been temporarily locked due to ${failedAttempts} failed login attempts.
            </p>

            <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="margin: 0; color: #991b1b; font-size: 16px; font-weight: 600;">
                Account will unlock in ${minutesLocked} minutes
              </p>
              <p style="margin: 8px 0 0 0; color: #991b1b; font-size: 14px;">
                Unlocks at: ${new Date(lockedUntil).toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </p>
            </div>

            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>⚠️ If this wasn't you:</strong><br>
                Someone may be trying to access your account. After the lockout period, please log in and change your password immediately.
              </p>
            </div>

            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                This is an automated security alert from Mark J Peterson Art. If you need immediate assistance, please contact support.
              </p>
            </div>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('❌ Failed to send account lockout alert:', error);
      return false;
    }

    console.log('📧 Account lockout alert sent:', data.id);
    return true;
  } catch (error) {
    console.error('❌ Error sending account lockout alert:', error);
    return false;
  }
}

/**
 * Send 2FA enabled alert email
 * @param {Object} params
 * @param {string} params.email - User email
 * @param {string} params.name - User name
 * @param {string} params.ipAddress - IP address where 2FA was enabled
 * @param {Date} params.timestamp - When 2FA was enabled
 */
export async function send2FAEnabledAlert({ email, name, ipAddress, timestamp }) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Mark J Peterson Art Security <onboarding@resend.dev>',
      to: email,
      subject: '✅ Two-Factor Authentication Enabled',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: #ffffff; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #059669; margin-top: 0; border-bottom: 2px solid #059669; padding-bottom: 16px;">✅ 2FA Enabled</h2>

            <p style="color: #4b5563; line-height: 1.6; margin: 20px 0;">
              Hi ${name},
            </p>

            <p style="color: #4b5563; line-height: 1.6; margin: 20px 0;">
              Two-factor authentication (2FA) has been enabled on your account. This adds an extra layer of security.
            </p>

            <div style="background-color: #d1fae5; border-left: 4px solid #059669; padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="margin: 0; color: #065f46; font-size: 14px;">
                <strong>✓ Your account is now more secure</strong><br>
                You'll receive a verification code via email each time you log in.
              </p>
            </div>

            <div style="background-color: #f3f4f6; border-radius: 6px; padding: 16px; margin: 24px 0;">
              <p style="margin: 8px 0; color: #374151;"><strong>Enabled at:</strong> ${new Date(timestamp).toLocaleString('en-US', {
                dateStyle: 'full',
                timeStyle: 'long'
              })}</p>
              <p style="margin: 8px 0; color: #374151;"><strong>IP Address:</strong> ${ipAddress}</p>
            </div>

            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>⚠️ Didn't enable 2FA?</strong><br>
                Someone may have accessed your account. Please log in immediately and secure your account.
              </p>
            </div>

            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                This is an automated security alert from Mark J Peterson Art.
              </p>
            </div>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('❌ Failed to send 2FA enabled alert:', error);
      return false;
    }

    console.log('📧 2FA enabled alert sent:', data.id);
    return true;
  } catch (error) {
    console.error('❌ Error sending 2FA enabled alert:', error);
    return false;
  }
}

/**
 * Send 2FA disabled alert email
 * @param {Object} params
 * @param {string} params.email - User email
 * @param {string} params.name - User name
 * @param {string} params.ipAddress - IP address where 2FA was disabled
 * @param {Date} params.timestamp - When 2FA was disabled
 */
export async function send2FADisabledAlert({ email, name, ipAddress, timestamp }) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Mark J Peterson Art Security <onboarding@resend.dev>',
      to: email,
      subject: '⚠️ Two-Factor Authentication Disabled',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: #ffffff; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #dc2626; margin-top: 0; border-bottom: 2px solid #dc2626; padding-bottom: 16px;">⚠️ 2FA Disabled</h2>

            <p style="color: #4b5563; line-height: 1.6; margin: 20px 0;">
              Hi ${name},
            </p>

            <p style="color: #4b5563; line-height: 1.6; margin: 20px 0;">
              Two-factor authentication (2FA) has been disabled on your account.
            </p>

            <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="margin: 0; color: #991b1b; font-size: 14px;">
                <strong>⚠️ Security Reduced</strong><br>
                Your account is now less secure without 2FA protection.
              </p>
            </div>

            <div style="background-color: #f3f4f6; border-radius: 6px; padding: 16px; margin: 24px 0;">
              <p style="margin: 8px 0; color: #374151;"><strong>Disabled at:</strong> ${new Date(timestamp).toLocaleString('en-US', {
                dateStyle: 'full',
                timeStyle: 'long'
              })}</p>
              <p style="margin: 8px 0; color: #374151;"><strong>IP Address:</strong> ${ipAddress}</p>
            </div>

            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>⚠️ Didn't disable 2FA?</strong><br>
                Someone may have compromised your account. Please log in immediately, re-enable 2FA, and change your password.
              </p>
            </div>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin" style="display: inline-block; padding: 12px 32px; background-color: #dc2626; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Re-enable 2FA
              </a>
            </div>

            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                This is an automated security alert from Mark J Peterson Art.
              </p>
            </div>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('❌ Failed to send 2FA disabled alert:', error);
      return false;
    }

    console.log('📧 2FA disabled alert sent:', data.id);
    return true;
  } catch (error) {
    console.error('❌ Error sending 2FA disabled alert:', error);
    return false;
  }
}

/**
 * Send password reset request email
 * @param {Object} params
 * @param {string} params.email - User email
 * @param {string} params.name - User name
 * @param {string} params.resetToken - Password reset token
 */
export async function sendPasswordResetEmail({ email, name, resetToken }) {
  try {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    const { data, error } = await resend.emails.send({
      from: 'Mark J Peterson Art Security <onboarding@resend.dev>',
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: #ffffff; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #1f2937; margin-top: 0; border-bottom: 2px solid #c0a679; padding-bottom: 16px;">Password Reset Request</h2>

            <p style="color: #4b5563; line-height: 1.6; margin: 20px 0;">
              Hi ${name},
            </p>

            <p style="color: #4b5563; line-height: 1.6; margin: 20px 0;">
              We received a request to reset your password for your Mark J Peterson Art account. Click the button below to create a new password.
            </p>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="display: inline-block; padding: 12px 32px; background-color: #c0a679; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Reset Password
              </a>
            </div>

            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>⚠️ Important Security Information</strong><br>
                This link will expire in 1 hour for security purposes.<br>
                If you didn't request this password reset, please ignore this email.
              </p>
            </div>

            <div style="background-color: #f3f4f6; border-radius: 6px; padding: 16px; margin: 24px 0;">
              <p style="margin: 0; color: #374151; font-size: 12px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #c0a679; word-break: break-all;">${resetUrl}</a>
              </p>
            </div>

            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                This is an automated message from Mark J Peterson Art. If you didn't request a password reset, you can safely ignore this email.
              </p>
            </div>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('❌ Failed to send password reset email:', error);
      return false;
    }

    console.log('📧 Password reset email sent:', data.id);
    return true;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    return false;
  }
}

/**
 * Send password changed confirmation email
 * @param {Object} params
 * @param {string} params.email - User email
 * @param {string} params.name - User name
 * @param {string} params.ipAddress - IP address where password was changed
 * @param {Date} params.timestamp - When password was changed
 */
export async function sendPasswordChangedAlert({ email, name, ipAddress, timestamp }) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Mark J Peterson Art Security <onboarding@resend.dev>',
      to: email,
      subject: '✅ Password Changed Successfully',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: #ffffff; border-radius: 8px; padding: 32px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #059669; margin-top: 0; border-bottom: 2px solid #059669; padding-bottom: 16px;">✅ Password Changed</h2>

            <p style="color: #4b5563; line-height: 1.6; margin: 20px 0;">
              Hi ${name},
            </p>

            <p style="color: #4b5563; line-height: 1.6; margin: 20px 0;">
              Your password has been successfully changed. If this was you, no further action is needed.
            </p>

            <div style="background-color: #d1fae5; border-left: 4px solid #059669; padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="margin: 0; color: #065f46; font-size: 14px;">
                <strong>✓ Your account remains secure</strong><br>
                Your password has been updated successfully.
              </p>
            </div>

            <div style="background-color: #f3f4f6; border-radius: 6px; padding: 16px; margin: 24px 0;">
              <p style="margin: 8px 0; color: #374151;"><strong>Changed at:</strong> ${new Date(timestamp).toLocaleString('en-US', {
                dateStyle: 'full',
                timeStyle: 'long'
              })}</p>
              <p style="margin: 8px 0; color: #374151;"><strong>IP Address:</strong> ${ipAddress}</p>
            </div>

            <div style="background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="margin: 0; color: #991b1b; font-size: 14px;">
                <strong>⚠️ Didn't change your password?</strong><br>
                Someone may have accessed your account. Please contact support immediately and secure your account.
              </p>
            </div>

            <div style="text-align: center; margin: 32px 0;">
              <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin" style="display: inline-block; padding: 12px 32px; background-color: #059669; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">
                View Account Security
              </a>
            </div>

            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                This is an automated security alert from Mark J Peterson Art.
              </p>
            </div>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('❌ Failed to send password changed alert:', error);
      return false;
    }

    console.log('📧 Password changed alert sent:', data.id);
    return true;
  } catch (error) {
    console.error('❌ Error sending password changed alert:', error);
    return false;
  }
}
