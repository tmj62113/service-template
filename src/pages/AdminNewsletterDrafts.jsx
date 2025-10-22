import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getApiUrl } from '../config/api';

export default function AdminNewsletterDrafts() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (isAuthenticated) {
      fetchDrafts();
    }
  }, [isAuthenticated, currentPage]);

  const fetchDrafts = async () => {
    try {
      const response = await fetch(getApiUrl(`/api/newsletter/drafts?page=${currentPage}&limit=${itemsPerPage}`), {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch drafts');
      }

      const data = await response.json();
      setDrafts(data.newsletters || []);
    } catch (error) {
      console.error('Error fetching drafts:', error);
      setDrafts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditDraft = (draftId) => {
    navigate(`/admin/newsletter/create?draftId=${draftId}`);
  };

  const handleDeleteDraft = async (id) => {
    if (!window.confirm('Are you sure you want to delete this draft?')) {
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/api/newsletter/drafts/${id}`), {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete draft');
      }

      setDrafts(prev => prev.filter(d => d._id !== id));
      alert('Draft deleted successfully');
    } catch (error) {
      console.error('Error deleting draft:', error);
      alert('Failed to delete draft. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="admin-newsletter-drafts">
        <div className="loading">Loading drafts...</div>
      </div>
    );
  }

  return (
    <div className="admin-newsletter-drafts">
      <div className="newsletter-container">
        {/* Header */}
        <div className="newsletter-header">
          <div>
            <h2>Newsletter Drafts</h2>
            <p className="header-subtitle">View and manage your newsletter drafts</p>
          </div>
          <div className="header-actions">
            <button
              onClick={() => navigate('/admin/newsletter/create')}
              className="btn btn-primary"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
              New Newsletter
            </button>
          </div>
        </div>

        {/* Drafts Table */}
        <div className="table-container">
          <table className="messages-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Created</th>
                <th>Last Updated</th>
                <th style={{ width: '60px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drafts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="no-messages">
                    <div style={{ padding: '40px', textAlign: 'center' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#999', marginBottom: '16px' }}>draft</span>
                      <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '16px' }}>No drafts found</p>
                      <p style={{ margin: 0, color: '#999', fontSize: '14px' }}>
                        Create a new newsletter to get started
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                drafts.map((draft) => (
                  <tr
                    key={draft._id}
                    onClick={() => handleEditDraft(draft._id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td>
                      <div style={{ fontWeight: '500', color: '#1a1a1a' }}>
                        {draft.subject}
                      </div>
                      <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                        {draft.message.substring(0, 100)}
                        {draft.message.length > 100 && '...'}
                      </div>
                    </td>
                    <td>
                      {new Date(draft.createdAt).toLocaleDateString()} {' '}
                      {new Date(draft.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td>
                      {new Date(draft.updatedAt).toLocaleDateString()} {' '}
                      {new Date(draft.updatedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDeleteDraft(draft._id)}
                        className="btn btn-icon-only"
                        style={{ color: '#ef4444' }}
                        title="Delete draft"
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
      </div>
    </div>
  );
}
