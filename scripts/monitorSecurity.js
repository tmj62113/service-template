#!/usr/bin/env node

/**
 * Security Monitoring Script
 * Monitors failed login attempts and security events
 *
 * Usage:
 *   node scripts/monitorSecurity.js
 *   node scripts/monitorSecurity.js --watch    (continuous monitoring)
 *   node scripts/monitorSecurity.js --ip 192.168.1.100
 */

import dotenv from 'dotenv';
dotenv.config();

import { AuditLog, AuditEventType } from '../db/models/AuditLog.js';

// Parse command line arguments
const args = process.argv.slice(2);
const watchMode = args.includes('--watch');
const ipIndex = args.indexOf('--ip');
const targetIP = ipIndex !== -1 ? args[ipIndex + 1] : null;

/**
 * Display failed login attempts
 */
async function displayFailedLogins(limit = 20) {
  console.log('\n🚨 Recent Failed Login Attempts\n' + '='.repeat(80));

  const filters = {
    eventType: AuditEventType.LOGIN_FAILED,
    limit,
  };

  if (targetIP) {
    filters.ipAddress = targetIP;
  }

  const failedLogins = await AuditLog.find(filters);

  if (failedLogins.length === 0) {
    console.log('✅ No failed login attempts found');
    return;
  }

  failedLogins.forEach((log, index) => {
    const time = new Date(log.timestamp).toLocaleString();
    const email = log.metadata?.email || 'unknown';
    console.log(`${index + 1}. [${time}]`);
    console.log(`   Email: ${email}`);
    console.log(`   IP: ${log.ipAddress}`);
    console.log(`   User Agent: ${log.userAgent.substring(0, 60)}...`);
    console.log('');
  });
}

/**
 * Display suspicious IP addresses
 */
async function displaySuspiciousIPs() {
  console.log('\n⚠️  Suspicious IP Addresses (5+ failed attempts in 24h)\n' + '='.repeat(80));

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
  const failedLogins = await AuditLog.find({
    eventType: AuditEventType.LOGIN_FAILED,
    limit: 1000,
  });

  // Group by IP address
  const ipCounts = {};
  failedLogins.forEach(log => {
    if (!ipCounts[log.ipAddress]) {
      ipCounts[log.ipAddress] = {
        count: 0,
        emails: new Set(),
        lastAttempt: log.timestamp,
      };
    }
    ipCounts[log.ipAddress].count++;
    if (log.metadata?.email) {
      ipCounts[log.ipAddress].emails.add(log.metadata.email);
    }
    if (log.timestamp > ipCounts[log.ipAddress].lastAttempt) {
      ipCounts[log.ipAddress].lastAttempt = log.timestamp;
    }
  });

  // Filter suspicious IPs (5+ attempts)
  const suspicious = Object.entries(ipCounts)
    .filter(([ip, data]) => data.count >= 5)
    .sort((a, b) => b[1].count - a[1].count);

  if (suspicious.length === 0) {
    console.log('✅ No suspicious IP addresses detected');
    return;
  }

  suspicious.forEach(([ip, data], index) => {
    console.log(`${index + 1}. IP: ${ip}`);
    console.log(`   Failed Attempts: ${data.count}`);
    console.log(`   Targeted Emails: ${Array.from(data.emails).join(', ')}`);
    console.log(`   Last Attempt: ${new Date(data.lastAttempt).toLocaleString()}`);
    console.log('');
  });

  console.log(`\n🔒 Consider blocking these IPs in your firewall or rate limiter`);
}

/**
 * Display recent security events
 */
async function displaySecurityEvents(limit = 10) {
  console.log('\n🔐 Recent Security Events\n' + '='.repeat(80));

  const events = await AuditLog.getRecentSecurityEvents(limit);

  if (events.length === 0) {
    console.log('✅ No recent security events');
    return;
  }

  events.forEach((event, index) => {
    const time = new Date(event.timestamp).toLocaleString();
    const emoji = getEventEmoji(event.eventType);
    console.log(`${index + 1}. ${emoji} ${event.eventType.toUpperCase()}`);
    console.log(`   Time: ${time}`);
    console.log(`   IP: ${event.ipAddress}`);
    if (event.metadata?.email) {
      console.log(`   Email: ${event.metadata.email}`);
    }
    console.log('');
  });
}

/**
 * Display audit log statistics
 */
async function displayStats() {
  console.log('\n📊 Audit Log Statistics (Last 30 Days)\n' + '='.repeat(80));

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const stats = await AuditLog.getStats({
    startDate: thirtyDaysAgo,
  });

  console.log(`Total Events: ${stats.totalLogs}`);
  console.log(`Success Rate: ${stats.successRate.toFixed(2)}%\n`);

  console.log('Event Type Breakdown:');
  Object.entries(stats.eventTypeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([eventType, count]) => {
      const emoji = getEventEmoji(eventType);
      console.log(`  ${emoji} ${eventType.padEnd(30)} ${count}`);
    });
}

/**
 * Get emoji for event type
 */
function getEventEmoji(eventType) {
  const emojiMap = {
    login_failed: '❌',
    login_success: '✅',
    account_locked: '🔒',
    suspicious_activity: '⚠️',
    password_changed: '🔑',
    two_fa_enabled: '🛡️',
    two_fa_disabled: '⚡',
    csrf_token_invalid: '🚫',
  };
  return emojiMap[eventType] || '📝';
}

/**
 * Run monitoring report
 */
async function runMonitoring() {
  console.clear();
  console.log('╔' + '═'.repeat(78) + '╗');
  console.log('║' + ' Security Monitoring Dashboard'.padEnd(78) + '║');
  console.log('║' + ` ${new Date().toLocaleString()}`.padEnd(78) + '║');
  console.log('╚' + '═'.repeat(78) + '╝');

  try {
    await displayStats();
    await displayFailedLogins(20);
    await displaySuspiciousIPs();
    await displaySecurityEvents(15);

    console.log('\n' + '='.repeat(80));
    console.log('Monitoring complete at ' + new Date().toLocaleString());

    if (watchMode) {
      console.log('Refreshing in 60 seconds... (Press Ctrl+C to exit)');
    }
  } catch (error) {
    console.error('❌ Error running monitoring:', error);
  }
}

/**
 * Main execution
 */
async function main() {
  if (watchMode) {
    console.log('Starting continuous monitoring (refreshes every 60 seconds)...\n');
    await runMonitoring();
    setInterval(runMonitoring, 60000); // Every 60 seconds
  } else {
    await runMonitoring();
    process.exit(0);
  }
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
