import { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';

export default function AdminIPBlocking() {
  const [blockedIPs, setBlockedIPs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockForm, setBlockForm] = useState({
    ipAddress: '',
    reason: '',
    expiresAt: '',
    isPermanent: true,
  });

  useEffect(() => {
    fetchBlockedIPs();
    fetchStats();
  }, []);

  const fetchBlockedIPs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/api/blocked-ips'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch blocked IPs');
      }

      const data = await response.json();
      setBlockedIPs(data.blocks || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching blocked IPs:', error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('/api/blocked-ips/stats'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleBlockFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'isPermanent') {
      setBlockForm(prev => ({
        ...prev,
        isPermanent: checked,
        expiresAt: checked ? '' : prev.expiresAt
      }));
    } else {
      setBlockForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleBlockIP = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const payload = {
        ipAddress: blockForm.ipAddress.trim(),
        reason: blockForm.reason.trim() || 'Blocked by admin',
      };

      // Only include expiresAt if not permanent
      if (!blockForm.isPermanent && blockForm.expiresAt) {
        payload.expiresAt = blockForm.expiresAt;
      }

      const response = await fetch(getApiUrl('/api/blocked-ips'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to block IP');
      }

      // Reset form and refresh list
      setBlockForm({
        ipAddress: '',
        reason: '',
        expiresAt: '',
        isPermanent: true,
      });
      setShowBlockForm(false);
      await fetchBlockedIPs();
      await fetchStats();
      alert('IP address blocked successfully');
    } catch (error) {
      console.error('Error blocking IP:', error);
      alert(error.message);
    }
  };

  const handleUnblock = async (blockId) => {
    if (!confirm('Are you sure you want to unblock this IP address?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl(`/api/blocked-ips/${blockId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to unblock IP');
      }

      await fetchBlockedIPs();
      await fetchStats();
      alert('IP address unblocked successfully');
    } catch (error) {
      console.error('Error unblocking IP:', error);
      alert('Failed to unblock IP address');
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getBlockTypeLabel = (block) => {
    if (!block.expiresAt) {
      return <span className="badge badge--error">Permanent</span>;
    }

    const expiresAt = new Date(block.expiresAt);
    const now = new Date();

    if (expiresAt > now) {
      return <span className="badge badge--warning">Temporary</span>;
    }

    return <span className="badge" style={{ backgroundColor: '#999' }}>Expired</span>;
  };

  if (loading) {
    return (
      <div className="admin-content">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <p>Loading blocked IPs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-content">
      <div className="admin-header">
        <h1>IP Blocking Management</h1>
        <div className="admin-actions">
          <button
            onClick={() => setShowBlockForm(!showBlockForm)}
            className="btn btn--primary"
          >
            {showBlockForm ? '✕ Cancel' : '🚫 Block IP Address'}
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="security-stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🚫</div>
            <div className="stat-content">
              <h3>Total Blocked</h3>
              <p className="stat-value">{stats.totalBlocks || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔒</div>
            <div className="stat-content">
              <h3>Permanent Blocks</h3>
              <p className="stat-value">{stats.permanentBlocks || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏰</div>
            <div className="stat-content">
              <h3>Temporary Blocks</h3>
              <p className="stat-value">{stats.temporaryBlocks || 0}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⌛</div>
            <div className="stat-content">
              <h3>Expired Blocks</h3>
              <p className="stat-value">{stats.expiredBlocks || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Block IP Form */}
      {showBlockForm && (
        <div className="admin-section">
          <h2>Block New IP Address</h2>
          <form onSubmit={handleBlockIP} className="form-grid">
            <div className="form-group">
              <label htmlFor="ipAddress">IP Address *</label>
              <input
                type="text"
                id="ipAddress"
                name="ipAddress"
                value={blockForm.ipAddress}
                onChange={handleBlockFormChange}
                placeholder="e.g., 192.168.1.100"
                className="form-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reason">Reason</label>
              <input
                type="text"
                id="reason"
                name="reason"
                value={blockForm.reason}
                onChange={handleBlockFormChange}
                placeholder="e.g., Multiple failed login attempts"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isPermanent"
                  checked={blockForm.isPermanent}
                  onChange={handleBlockFormChange}
                />
                <span>Permanent Block</span>
              </label>
            </div>

            {!blockForm.isPermanent && (
              <div className="form-group">
                <label htmlFor="expiresAt">Expires At</label>
                <input
                  type="datetime-local"
                  id="expiresAt"
                  name="expiresAt"
                  value={blockForm.expiresAt}
                  onChange={handleBlockFormChange}
                  className="form-input"
                  required={!blockForm.isPermanent}
                />
              </div>
            )}

            <div className="form-actions">
              <button type="submit" className="btn btn--primary">
                Block IP Address
              </button>
              <button
                type="button"
                onClick={() => setShowBlockForm(false)}
                className="btn btn--secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Blocked IPs List */}
      <div className="admin-section">
        <h2>Blocked IP Addresses</h2>
        {blockedIPs.length === 0 ? (
          <p className="empty-state">✅ No IP addresses are currently blocked</p>
        ) : (
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>IP Address</th>
                  <th>Type</th>
                  <th>Reason</th>
                  <th>Blocked At</th>
                  <th>Expires At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {blockedIPs.map((block) => (
                  <tr key={block._id}>
                    <td>
                      <code>{block.ipAddress}</code>
                    </td>
                    <td>{getBlockTypeLabel(block)}</td>
                    <td>{block.reason}</td>
                    <td>{formatTimestamp(block.createdAt)}</td>
                    <td>
                      {block.expiresAt ? (
                        formatTimestamp(block.expiresAt)
                      ) : (
                        <span className="text-muted">Never</span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleUnblock(block._id)}
                        className="btn btn--sm btn--secondary"
                      >
                        Unblock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Information Section */}
      <div className="admin-section security-tips">
        <h2>💡 IP Blocking Best Practices</h2>
        <ul>
          <li>✅ Block IPs after 5+ failed login attempts within 24 hours</li>
          <li>✅ Use temporary blocks (24-48 hours) for suspicious activity</li>
          <li>✅ Use permanent blocks only for confirmed malicious actors</li>
          <li>✅ Document reasons for blocking to track patterns</li>
          <li>✅ Review blocked IPs regularly to remove false positives</li>
          <li>✅ Expired blocks are automatically cleaned up daily at 3 AM</li>
          <li>⚠️ Be cautious blocking IP ranges or proxies (may affect legitimate users)</li>
        </ul>
      </div>
    </div>
  );
}
