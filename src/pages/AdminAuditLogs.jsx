import { useState, useEffect } from 'react';

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    eventType: '',
    userId: '',
    startDate: '',
    endDate: '',
    limit: 50,
  });
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [filters, page]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Build query string
      const params = new URLSearchParams();
      if (filters.eventType) params.append('eventType', filters.eventType);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      params.append('limit', filters.limit);
      params.append('skip', page * filters.limit);

      const response = await fetch(
        `http://localhost:3001/api/audit-logs?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }

      const data = await response.json();
      setLogs(data.logs || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(0); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      eventType: '',
      userId: '',
      startDate: '',
      endDate: '',
      limit: 50,
    });
    setPage(0);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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

  const getEventIcon = (eventType) => {
    const iconMap = {
      login_success: '✅',
      login_failed: '❌',
      logout: '🚪',
      password_changed: '🔑',
      password_reset_requested: '🔐',
      password_reset_completed: '🔓',
      two_fa_enabled: '🛡️',
      two_fa_disabled: '⚡',
      two_fa_code_sent: '📧',
      two_fa_verified: '✓',
      session_created: '🆕',
      session_deleted: '🗑️',
      all_sessions_deleted: '🧹',
      product_created: '➕',
      product_updated: '✏️',
      product_deleted: '🗑️',
      product_image_uploaded: '🖼️',
      order_status_changed: '📦',
      order_fulfilled: '✅',
      shipment_created: '🚚',
      customer_updated: '👤',
      message_status_changed: '💬',
      message_deleted: '🗑️',
      message_email_sent: '📧',
      newsletter_sent: '📰',
      newsletter_draft_created: '📝',
      newsletter_draft_updated: '✏️',
      newsletter_draft_deleted: '🗑️',
      subscriber_deleted: '🗑️',
      account_locked: '🔒',
      suspicious_activity: '⚠️',
      csrf_token_invalid: '🚫',
    };
    return iconMap[eventType] || '📝';
  };

  const getStatusColor = (success) => {
    return success ? 'success' : 'error';
  };

  if (loading && logs.length === 0) {
    return (
      <div className="admin-content">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p>Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h1>Audit Logs</h1>
        <div className="admin-actions">
          <button onClick={fetchLogs} className="btn btn--secondary">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-section">
        <h2>Filters</h2>
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="form-group">
            <label htmlFor="eventType">Event Type</label>
            <select
              id="eventType"
              name="eventType"
              value={filters.eventType}
              onChange={handleFilterChange}
              className="form-input"
            >
              <option value="">All Events</option>
              <optgroup label="Authentication">
                <option value="login_success">Login Success</option>
                <option value="login_failed">Login Failed</option>
                <option value="logout">Logout</option>
                <option value="password_changed">Password Changed</option>
                <option value="password_reset_requested">Password Reset Requested</option>
                <option value="password_reset_completed">Password Reset Completed</option>
              </optgroup>
              <optgroup label="Two-Factor Auth">
                <option value="two_fa_enabled">2FA Enabled</option>
                <option value="two_fa_disabled">2FA Disabled</option>
                <option value="two_fa_code_sent">2FA Code Sent</option>
                <option value="two_fa_verified">2FA Verified</option>
              </optgroup>
              <optgroup label="Security">
                <option value="account_locked">Account Locked</option>
                <option value="suspicious_activity">Suspicious Activity</option>
                <option value="csrf_token_invalid">CSRF Token Invalid</option>
              </optgroup>
              <optgroup label="Sessions">
                <option value="session_created">Session Created</option>
                <option value="session_deleted">Session Deleted</option>
                <option value="all_sessions_deleted">All Sessions Deleted</option>
              </optgroup>
              <optgroup label="Products">
                <option value="product_created">Product Created</option>
                <option value="product_updated">Product Updated</option>
                <option value="product_deleted">Product Deleted</option>
              </optgroup>
              <optgroup label="Orders">
                <option value="order_status_changed">Order Status Changed</option>
                <option value="order_fulfilled">Order Fulfilled</option>
                <option value="shipment_created">Shipment Created</option>
              </optgroup>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="startDate">Start Date</label>
            <input
              type="datetime-local"
              id="startDate"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date</label>
            <input
              type="datetime-local"
              id="endDate"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="limit">Results Per Page</label>
            <select
              id="limit"
              name="limit"
              value={filters.limit}
              onChange={handleFilterChange}
              className="form-input"
            >
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <button onClick={clearFilters} className="btn btn--secondary">
            Clear Filters
          </button>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="admin-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p>
            Showing {logs.length} log entries
            {page > 0 && ` (Page ${page + 1})`}
          </p>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="btn btn--secondary btn--sm"
            >
              ← Previous
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={logs.length < filters.limit}
              className="btn btn--secondary btn--sm"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="admin-section">
        <h2>Log Entries</h2>
        {logs.length === 0 ? (
          <p className="empty-state">No logs found matching the selected filters.</p>
        ) : (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Event</th>
                  <th>Status</th>
                  <th>IP Address</th>
                  <th>User</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{getEventIcon(log.eventType)}</span>
                        <span>{formatEventType(log.eventType)}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge--${getStatusColor(log.success)}`}>
                        {log.success ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td>
                      <code>{log.ipAddress}</code>
                    </td>
                    <td>
                      {log.userId ? (
                        <span title={log.userId}>{log.userId.slice(-8)}</span>
                      ) : (
                        <span className="text-muted">Anonymous</span>
                      )}
                    </td>
                    <td>
                      {log.metadata && Object.keys(log.metadata).length > 0 ? (
                        <details style={{ cursor: 'pointer' }}>
                          <summary>View Details</summary>
                          <pre style={{
                            fontSize: '0.75rem',
                            marginTop: '0.5rem',
                            padding: '0.5rem',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '4px',
                            overflow: 'auto',
                            maxWidth: '300px'
                          }}>
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </details>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination Controls (Bottom) */}
      {logs.length > 0 && (
        <div className="admin-section">
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="btn btn--secondary"
            >
              ← Previous Page
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={logs.length < filters.limit}
              className="btn btn--secondary"
            >
              Next Page →
            </button>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="admin-section security-tips">
        <h2>💡 Audit Log Tips</h2>
        <ul>
          <li>✅ Use filters to find specific events or time periods</li>
          <li>✅ Failed login attempts indicate potential security threats</li>
          <li>✅ Review suspicious activity events immediately</li>
          <li>✅ Track changes to sensitive data (products, orders, customers)</li>
          <li>✅ Logs are automatically cleaned up after 90 days</li>
          <li>✅ Export important logs for compliance or investigation</li>
          <li>⚠️ Regular review helps identify security patterns and issues</li>
        </ul>
      </div>
    </div>
  );
}
