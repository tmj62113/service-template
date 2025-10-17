import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AdminNewsletterCreate() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get('draftId');

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      fetchSubscriberCount();
      if (draftId) {
        loadDraft(draftId);
      }
    }
  }, [isAuthenticated, draftId]);

  const fetchSubscriberCount = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/newsletter/stats', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setSubscriberCount(data.active);
      }
    } catch (error) {
      console.error('Error fetching subscriber count:', error);
    }
  };

  const loadDraft = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/newsletter/drafts/${id}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to load draft');
      }

      const draft = await response.json();
      setSubject(draft.subject);
      setMessage(draft.message);
    } catch (error) {
      console.error('Error loading draft:', error);
      alert('Failed to load draft. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!subject || !message) {
      alert('Please fill in subject and message');
      return;
    }

    setSaving(true);

    try {
      const url = draftId
        ? `http://localhost:3001/api/newsletter/drafts/${draftId}`
        : 'http://localhost:3001/api/newsletter/drafts';

      const method = draftId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          subject,
          message,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save draft');
      }

      const result = await response.json();
      alert('Draft saved successfully!');

      // Navigate to drafts page with updated draft ID
      if (!draftId && result.draft?._id) {
        navigate(`/admin/newsletter/create?draftId=${result.draft._id}`, { replace: true });
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      alert('Failed to save draft. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSendNewsletter = async () => {
    if (!subject || !message) {
      alert('Please fill in subject and message');
      return;
    }

    // If this is a draft, send via the draft endpoint, otherwise use the direct send endpoint
    if (draftId) {
      if (!window.confirm(`Send this newsletter to all ${subscriberCount} active subscribers?`)) {
        return;
      }

      setSending(true);

      try {
        const response = await fetch(`http://localhost:3001/api/newsletter/drafts/${draftId}/send`, {
          method: 'POST',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to send newsletter');
        }

        const result = await response.json();
        alert(`Newsletter sent successfully to ${result.sent} subscribers!`);
        navigate('/admin/newsletter/sent');
      } catch (error) {
        console.error('Error sending newsletter:', error);
        alert('Failed to send newsletter. Please try again.');
      } finally {
        setSending(false);
      }
    } else {
      // Save as draft first, then send
      if (!window.confirm(`Send this newsletter to all ${subscriberCount} active subscribers?`)) {
        return;
      }

      setSending(true);

      try {
        // First save as draft
        const draftResponse = await fetch('http://localhost:3001/api/newsletter/drafts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            subject,
            message,
          }),
        });

        if (!draftResponse.ok) {
          throw new Error('Failed to save newsletter');
        }

        const draftResult = await draftResponse.json();
        const newDraftId = draftResult.draft._id;

        // Then send it
        const sendResponse = await fetch(`http://localhost:3001/api/newsletter/drafts/${newDraftId}/send`, {
          method: 'POST',
          credentials: 'include',
        });

        if (!sendResponse.ok) {
          throw new Error('Failed to send newsletter');
        }

        const sendResult = await sendResponse.json();
        alert(`Newsletter sent successfully to ${sendResult.sent} subscribers!`);
        navigate('/admin/newsletter/sent');
      } catch (error) {
        console.error('Error sending newsletter:', error);
        alert('Failed to send newsletter. Please try again.');
      } finally {
        setSending(false);
      }
    }
  };

  const handleCancel = () => {
    if (subject || message) {
      if (!window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        return;
      }
    }
    navigate('/admin/newsletter');
  };

  if (loading) {
    return (
      <div className="admin-newsletter-create">
        <div className="loading">Loading draft...</div>
      </div>
    );
  }

  return (
    <div className="admin-newsletter-create">
      <div className="newsletter-container">
        {/* Header */}
        <div className="newsletter-header">
          <div>
            <h2>{draftId ? 'Edit Newsletter Draft' : 'Create Newsletter'}</h2>
            <p className="header-subtitle">
              Compose and send newsletters to {subscriberCount} active subscribers
            </p>
          </div>
          <div className="header-actions">
            <button
              onClick={handleCancel}
              className="btn-secondary"
              disabled={saving || sending}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveDraft}
              className="btn-secondary"
              disabled={saving || sending || !subject || !message}
              style={{ marginLeft: '10px' }}
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={handleSendNewsletter}
              className="btn-primary"
              disabled={saving || sending || !subject || !message}
              style={{ marginLeft: '10px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
              {sending ? 'Sending...' : 'Send Newsletter'}
            </button>
          </div>
        </div>

        {/* Info Alert */}
        {subscriberCount > 0 && (
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px'
          }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#0369a1' }}>
              <strong>Recipients:</strong> This newsletter will be sent to {subscriberCount} active subscribers
            </p>
          </div>
        )}

        {subscriberCount === 0 && (
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            background: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: '8px'
          }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#92400e' }}>
              <strong>Warning:</strong> You have no active subscribers. Newsletters cannot be sent until you have subscribers.
            </p>
          </div>
        )}

        {/* Form */}
        <div style={{
          background: 'white',
          padding: '32px',
          borderRadius: '8px',
          border: '1px solid #e5e5e5'
        }}>
          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label htmlFor="newsletter-subject" style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#1a1a1a'
            }}>
              Subject *
            </label>
            <input
              id="newsletter-subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter newsletter subject"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
              }}
              disabled={saving || sending}
            />
          </div>

          <div className="form-group">
            <label htmlFor="newsletter-message" style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#1a1a1a'
            }}>
              Message *
            </label>
            <textarea
              id="newsletter-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={20}
              placeholder="Write your newsletter content here..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
                resize: 'vertical',
                fontFamily: 'inherit',
                lineHeight: '1.6'
              }}
              disabled={saving || sending}
            />
            <p style={{
              marginTop: '8px',
              fontSize: '13px',
              color: '#666'
            }}>
              Line breaks will be preserved in the email. You can use plain text or simple formatting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
