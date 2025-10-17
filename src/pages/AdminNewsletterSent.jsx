import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AdminNewsletterSent() {
  const { isAuthenticated } = useAuth();
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNewsletter, setSelectedNewsletter] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (isAuthenticated) {
      fetchSentNewsletters();
    }
  }, [isAuthenticated, currentPage]);

  const fetchSentNewsletters = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/newsletter/sent?page=${currentPage}&limit=${itemsPerPage}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sent newsletters');
      }

      const data = await response.json();
      setNewsletters(data.newsletters || []);
    } catch (error) {
      console.error('Error fetching sent newsletters:', error);
      setNewsletters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewNewsletter = (newsletter) => {
    setSelectedNewsletter(newsletter);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="admin-newsletter-sent">
        <div className="loading">Loading sent newsletters...</div>
      </div>
    );
  }

  return (
    <div className="admin-newsletter-sent">
      <div className="newsletter-container">
        {/* Header */}
        <div className="newsletter-header">
          <div>
            <h2>Sent Newsletters</h2>
            <p className="header-subtitle">View previously sent newsletters</p>
          </div>
        </div>

        {/* Newsletters Table */}
        <div className="table-container">
          <table className="messages-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Sent Date</th>
                <th>Recipients</th>
              </tr>
            </thead>
            <tbody>
              {newsletters.length === 0 ? (
                <tr>
                  <td colSpan="3" className="no-messages">
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#999', marginBottom: '16px' }}>mail</span>
                      <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '16px' }}>No sent newsletters</p>
                      <p style={{ margin: 0, color: '#999', fontSize: '14px' }}>
                        Newsletters you send will appear here
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                newsletters.map((newsletter) => (
                  <tr
                    key={newsletter._id}
                    onClick={() => handleViewNewsletter(newsletter)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ fontWeight: '500', color: '#1a1a1a' }}>
                        {newsletter.subject}
                      </div>
                      <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                        {newsletter.message.substring(0, 100)}
                        {newsletter.message.length > 100 && '...'}
                      </div>
                    </td>
                    <td>
                      {new Date(newsletter.sentAt).toLocaleDateString()} {' '}
                      {new Date(newsletter.sentAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td>
                      <span className="type-badge" style={{
                        background: '#10b981',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '13px',
                        fontWeight: '500'
                      }}>
                        {newsletter.recipientCount}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Newsletter Modal */}
      {showModal && selectedNewsletter && (
        <>
          <div className="modal-overlay" onClick={() => setShowModal(false)}></div>
          <div className="message-modal" style={{ maxWidth: '800px' }}>
            <div className="modal-header">
              <div className="modal-title">
                <h3>Newsletter Details</h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="modal-close"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="modal-content">
              {/* Subject */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontWeight: '600', color: '#666', marginBottom: '8px', fontSize: '13px' }}>
                  SUBJECT
                </label>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a' }}>
                  {selectedNewsletter.subject}
                </div>
              </div>

              {/* Metadata */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
                marginBottom: '24px',
                padding: '16px',
                background: '#f9fafb',
                borderRadius: '6px'
              }}>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#666', marginBottom: '4px', fontSize: '12px' }}>
                    SENT DATE
                  </label>
                  <div style={{ fontSize: '14px', color: '#1a1a1a' }}>
                    {new Date(selectedNewsletter.sentAt).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#666', marginBottom: '4px', fontSize: '12px' }}>
                    SENT TIME
                  </label>
                  <div style={{ fontSize: '14px', color: '#1a1a1a' }}>
                    {new Date(selectedNewsletter.sentAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: '600', color: '#666', marginBottom: '4px', fontSize: '12px' }}>
                    RECIPIENTS
                  </label>
                  <div style={{ fontSize: '14px', color: '#10b981', fontWeight: '600' }}>
                    {selectedNewsletter.recipientCount}
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <label style={{ display: 'block', fontWeight: '600', color: '#666', marginBottom: '8px', fontSize: '13px' }}>
                  MESSAGE
                </label>
                <div style={{
                  padding: '16px',
                  background: '#ffffff',
                  border: '1px solid #e5e5e5',
                  borderRadius: '6px',
                  whiteSpace: 'pre-wrap',
                  lineHeight: '1.6',
                  color: '#1a1a1a',
                  maxHeight: '400px',
                  overflowY: 'auto'
                }}>
                  {selectedNewsletter.message}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
