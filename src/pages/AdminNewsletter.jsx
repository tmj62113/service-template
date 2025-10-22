import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getApiUrl } from '../config/api';

export default function AdminNewsletter() {
  const { isAuthenticated } = useAuth();
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, unsubscribed: 0, bySource: {} });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscribers();
      fetchStats();
    }
  }, [isAuthenticated, statusFilter, sourceFilter]);

  const fetchSubscribers = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (sourceFilter !== 'all') params.append('source', sourceFilter);

      const response = await fetch(getApiUrl(`/api/newsletter/subscribers?${params}`), {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscribers');
      }

      const data = await response.json();
      setSubscribers(data.subscribers || []);
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(getApiUrl('/api/newsletter/stats'), {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleDeleteSubscriber = async (id) => {
    if (!window.confirm('Are you sure you want to delete this subscriber?')) {
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/api/newsletter/subscribers/${id}`), {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete subscriber');
      }

      setSubscribers(prev => prev.filter(s => s._id !== id));
      fetchStats();
      alert('Subscriber deleted successfully');
    } catch (error) {
      console.error('Error deleting subscriber:', error);
      alert('Failed to delete subscriber. Please try again.');
    }
  };

  const handleExportEmails = async () => {
    try {
      const response = await fetch(getApiUrl('/api/newsletter/export'), {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to export emails');
      }

      const data = await response.json();
      const emailList = data.emails.join('\n');

      // Create and download a text file
      const blob = new Blob([emailList], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting emails:', error);
      alert('Failed to export emails. Please try again.');
    }
  };

  // Filter and search
  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch = !searchQuery ||
      sub.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSubscribers = filteredSubscribers.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="admin-newsletter">
        <div className="loading">Loading newsletter data...</div>
      </div>
    );
  }

  return (
    <div className="admin-newsletter">
      <div className="newsletter-container">
        {/* Header with Stats */}
        <div className="newsletter-header">
          <div>
            <h2>Newsletter Subscribers</h2>
            <p className="header-subtitle">Manage your newsletter subscribers</p>
          </div>
          <div className="header-actions">
            <button
              onClick={handleExportEmails}
              className="btn btn-secondary"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
              Export Emails
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total Subscribers</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a1a1a' }}>{stats.total}</div>
          </div>
          <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Active</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>{stats.active}</div>
          </div>
          <div className="stat-card" style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #e5e5e5' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Unsubscribed</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444' }}>{stats.unsubscribed}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters" style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <div className="search-box" style={{ flex: 1 }}>
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <select
            className="status-filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>
          <select
            className="status-filter"
            value={sourceFilter}
            onChange={(e) => {
              setSourceFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Sources</option>
            <option value="contact-form">Contact Form</option>
            <option value="footer">Footer</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Subscribers Table */}
        <div className="table-container">
          <table className="messages-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Source</th>
                <th>Status</th>
                <th>Subscribed Date</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentSubscribers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-messages">
                    No subscribers found
                  </td>
                </tr>
              ) : (
                currentSubscribers.map((subscriber) => (
                  <tr key={subscriber._id}>
                    <td>{subscriber.email}</td>
                    <td>{subscriber.source}</td>
                    <td>
                      <span className={`type-badge ${subscriber.status}`}>
                        {subscriber.status}
                      </span>
                    </td>
                    <td>
                      {new Date(subscriber.subscribedAt).toLocaleDateString()} {' '}
                      {new Date(subscriber.subscribedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteSubscriber(subscriber._id)}
                        className="btn btn-icon-only"
                        style={{ color: '#ef4444' }}
                        title="Delete subscriber"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredSubscribers.length > 0 && (
          <div className="pagination">
            <div className="pagination-info">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredSubscribers.length)} of {filteredSubscribers.length} subscribers
            </div>
            <div className="pagination-controls">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="btn btn-secondary btn-sm"
              >
                <span className="material-symbols-outlined">chevron_left</span>
                Previous
              </button>
              <div className="page-info">
                Page {currentPage} of {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="btn btn-secondary btn-sm"
              >
                Next
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
