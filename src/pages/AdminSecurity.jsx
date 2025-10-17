import { useState, useEffect } from 'react';

export default function AdminSecurity() {
  const [stats, setStats] = useState(null);
  const [failedLogins, setFailedLogins] = useState([]);
  const [securityEvents, setSecurityEvents] = useState([]);
  const [suspiciousIPs, setSuspiciousIPs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    fetchSecurityData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSecurityData, 30000);
    return () => clearInterval(interval);
  }, [timeRange]);

  const fetchSecurityData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Calculate date range
      const now = new Date();
      const startDate = new Date(now - getTimeRangeMs(timeRange));

      // Fetch statistics
      const statsRes = await fetch(
        `http://localhost:3001/api/audit-logs/stats?startDate=${startDate.toISOString()}`,
        { headers, credentials: 'include' }
      );
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch failed logins
      const failedRes = await fetch(
        `http://localhost:3001/api/audit-logs?eventType=login_failed&limit=20&startDate=${startDate.toISOString()}`,
        { headers, credentials: 'include' }
      );
      const failedData = await failedRes.json();
      setFailedLogins(failedData.logs || []);

      // Fetch security events
      const eventsRes = await fetch(
        `http://localhost:3001/api/audit-logs/security-events?limit=15&startDate=${startDate.toISOString()}`,
        { headers, credentials: 'include' }
      );
      const eventsData = await eventsRes.json();
      setSecurityEvents(eventsData.events || []);

      // Calculate suspicious IPs from failed logins
      calculateSuspiciousIPs(failedData.logs || []);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching security data:', error);
      setLoading(false);
    }
  };

  const getTimeRangeMs = (range) => {
    const ranges = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
    };
    return ranges[range] || ranges['24h'];
  };

  const calculateSuspiciousIPs = (logs) => {
    const ipMap = {};
    logs.forEach(log => {
      if (!ipMap[log.ipAddress]) {
        ipMap[log.ipAddress] = {
          count: 0,
          emails: new Set(),
          lastAttempt: log.timestamp,
        };
      }
      ipMap[log.ipAddress].count++;
      if (log.metadata?.email) {
        ipMap[log.ipAddress].emails.add(log.metadata.email);
      }
      if (new Date(log.timestamp) > new Date(ipMap[log.ipAddress].lastAttempt)) {
        ipMap[log.ipAddress].lastAttempt = log.timestamp;
      }
    });

    // Filter suspicious (5+ attempts)
    const suspicious = Object.entries(ipMap)
      .filter(([ip, data]) => data.count >= 5)
      .map(([ip, data]) => ({
        ip,
        count: data.count,
        emails: Array.from(data.emails),
        lastAttempt: data.lastAttempt,
      }))
      .sort((a, b) => b.count - a.count);

    setSuspiciousIPs(suspicious);
  };

  const getEventEmoji = (eventType) => {
    const emojiMap = {
      login_failed: '❌',
      login_success: '✅',
      account_locked: '🔒',
      suspicious_activity: '⚠️',
      password_changed: '🔑',
      password_reset_requested: '🔐',
      password_reset_completed: '🔓',
      two_fa_enabled: '🛡️',
      two_fa_disabled: '⚡',
      csrf_token_invalid: '🚫',
      two_fa_code_sent: '📧',
      two_fa_verified: '✓',
    };
    return emojiMap[eventType] || '📝';
  };

  const getStatusColor = (eventType) => {
    if (eventType.includes('failed') || eventType.includes('locked')) return 'error';
    if (eventType.includes('success') || eventType.includes('enabled')) return 'success';
    if (eventType.includes('changed') || eventType.includes('reset')) return 'warning';
    return 'info';
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatEventType = (eventType) => {
    return eventType.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div className="admin-content">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p>Loading security data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-content">
        <div className="admin-header">
          <h1>Security Dashboard</h1>
          <div className="admin-actions">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="form-input"
              style={{ width: '150px' }}
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <button onClick={fetchSecurityData} className="btn btn--secondary">
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="security-stats-grid">
          <div className="stat-card" title="Total number of security-related events (logins, password changes, 2FA actions, etc.) logged in the selected time range">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>Total Events</h3>
              <p className="stat-value">{stats?.totalLogs || 0}</p>
              <p className="stat-description">All security events logged</p>
            </div>
          </div>

          <div className="stat-card" title={`Percentage of successful security events vs failures. ${stats?.successRate >= 90 ? '90%+ is excellent - very few security failures' : stats?.successRate >= 70 ? '70-89% is good - some failures but under control' : 'Below 70% indicates high failure rate - possible attack'}`}>
            <div className="stat-icon">
              {stats?.successRate >= 90 ? '✅' : stats?.successRate >= 70 ? '⚠️' : '❌'}
            </div>
            <div className="stat-content">
              <h3>Success Rate</h3>
              <p className="stat-value">{stats?.successRate?.toFixed(1) || 0}%</p>
              <p className="stat-description">
                {stats?.successRate >= 90 ? 'Excellent security health' : stats?.successRate >= 70 ? 'Good - monitor failures' : 'High failure rate - investigate'}
              </p>
            </div>
          </div>

          <div className="stat-card" title="Number of failed login attempts in the selected time range. Multiple failures from the same IP may indicate a brute force attack">
            <div className="stat-icon">❌</div>
            <div className="stat-content">
              <h3>Failed Logins</h3>
              <p className="stat-value">{failedLogins.length}</p>
              <p className="stat-description">Login attempts denied</p>
            </div>
          </div>

          <div className="stat-card" title="IP addresses with 5+ failed login attempts in the selected time range. These IPs should be investigated and potentially blocked">
            <div className="stat-icon">⚠️</div>
            <div className="stat-content">
              <h3>Suspicious IPs</h3>
              <p className="stat-value">{suspiciousIPs.length}</p>
              <p className="stat-description">IPs with 5+ failed attempts</p>
            </div>
          </div>
        </div>

        {/* Event Type Breakdown */}
        {stats?.eventTypeCounts && Object.keys(stats.eventTypeCounts).length > 0 && (
          <div className="admin-section">
            <h2>Event Type Breakdown</h2>
            <div className="event-breakdown">
              {Object.entries(stats.eventTypeCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .map(([eventType, count]) => (
                  <div key={eventType} className="event-breakdown-item">
                    <span className="event-emoji">{getEventEmoji(eventType)}</span>
                    <span className="event-name">{formatEventType(eventType)}</span>
                    <span className="event-count">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Suspicious IP Addresses */}
        {suspiciousIPs.length > 0 && (
          <div className="admin-section alert-section">
            <h2>⚠️ Suspicious IP Addresses (5+ Failed Attempts)</h2>
            <div className="suspicious-ips">
              {suspiciousIPs.map((ipData) => (
                <div key={ipData.ip} className="suspicious-ip-card">
                  <div className="ip-header">
                    <strong>{ipData.ip}</strong>
                    <span className="badge badge--error">{ipData.count} attempts</span>
                  </div>
                  <div className="ip-details">
                    <p><strong>Targeted Emails:</strong> {ipData.emails.join(', ')}</p>
                    <p><strong>Last Attempt:</strong> {formatTimestamp(ipData.lastAttempt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Failed Login Attempts */}
        <div className="admin-section">
          <h2>❌ Recent Failed Login Attempts</h2>
          {failedLogins.length === 0 ? (
            <p className="empty-state">✅ No failed login attempts in this time range</p>
          ) : (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Email</th>
                    <th>IP Address</th>
                    <th>User Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {failedLogins.map((log) => (
                    <tr key={log._id}>
                      <td>{formatTimestamp(log.timestamp)}</td>
                      <td>{log.metadata?.email || 'N/A'}</td>
                      <td><code>{log.ipAddress}</code></td>
                      <td className="user-agent-cell" title={log.userAgent}>
                        {log.userAgent?.substring(0, 50)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Security Events */}
        <div className="admin-section">
          <h2>🔐 Recent Security Events</h2>
          {securityEvents.length === 0 ? (
            <p className="empty-state">✅ No security events to display</p>
          ) : (
            <div className="security-timeline">
              {securityEvents.map((event) => (
                <div key={event._id} className={`timeline-item timeline-item--${getStatusColor(event.eventType)}`}>
                  <div className="timeline-marker">
                    {getEventEmoji(event.eventType)}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <strong>{formatEventType(event.eventType)}</strong>
                      <span className="timeline-time">{formatTimestamp(event.timestamp)}</span>
                    </div>
                    <div className="timeline-details">
                      <p>IP: <code>{event.ipAddress}</code></p>
                      {event.metadata?.email && <p>Email: {event.metadata.email}</p>}
                      {event.metadata?.reason && <p>Reason: {event.metadata.reason}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security Recommendations */}
        <div className="admin-section security-tips">
          <h2>💡 Security Best Practices</h2>
          <ul>
            <li>✅ Monitor failed login attempts regularly</li>
            <li>✅ Block IPs with 5+ failed attempts within 24 hours</li>
            <li>✅ Enable 2FA for all admin accounts</li>
            <li>✅ Change passwords every 90 days</li>
            <li>✅ Review audit logs weekly for suspicious activity</li>
            <li>✅ Keep this dashboard open during high-traffic periods</li>
          </ul>
        </div>
      </div>
  );
}
