import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApiUrl } from '../config/api';

export default function ClientDetail() {
  const { clientId } = useParams();
  const navigate = useNavigate();

  // Client data
  const [client, setClient] = useState(null);
  const [stats, setStats] = useState(null);
  const [bookings, setBookings] = useState([]);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    timeZone: '',
    clientNotes: '',
    communicationPreferences: {
      emailReminders: true,
      smsReminders: false
    }
  });
  const [saving, setSaving] = useState(false);

  // Block/Unblock
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [blocking, setBlocking] = useState(false);

  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch client profile, stats, and bookings in parallel
      const [clientRes, statsRes, bookingsRes] = await Promise.all([
        fetch(getApiUrl(`/api/clients/${clientId}`), { credentials: 'include' }),
        fetch(getApiUrl(`/api/clients/${clientId}/stats`), { credentials: 'include' }),
        fetch(getApiUrl(`/api/clients/${clientId}/bookings`), { credentials: 'include' })
      ]);

      if (!clientRes.ok || !statsRes.ok || !bookingsRes.ok) {
        throw new Error('Failed to fetch client data');
      }

      const clientData = await clientRes.json();
      const statsData = await statsRes.json();
      const bookingsData = await bookingsRes.json();

      setClient(clientData);
      setStats(statsData);
      setBookings(bookingsData.bookings || []);

      // Initialize edit form with client data
      setEditForm({
        name: clientData.name || '',
        email: clientData.email || '',
        phone: clientData.phone || '',
        timeZone: clientData.timeZone || 'America/New_York',
        clientNotes: clientData.clientNotes || '',
        communicationPreferences: clientData.communicationPreferences || {
          emailReminders: true,
          smsReminders: false
        }
      });
    } catch (err) {
      console.error('Error fetching client data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form to original client data
    setEditForm({
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      timeZone: client.timeZone || 'America/New_York',
      clientNotes: client.clientNotes || '',
      communicationPreferences: client.communicationPreferences || {
        emailReminders: true,
        smsReminders: false
      }
    });
  };

  const handleSaveEdit = async () => {
    if (!editForm.name.trim() || !editForm.email.trim()) {
      alert('Name and email are required');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(getApiUrl(`/api/clients/${clientId}`), {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update client');
      }

      const updatedClient = await response.json();
      setClient(updatedClient);
      setIsEditing(false);
      alert('Client profile updated successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleBlockClient = async () => {
    if (!blockReason.trim()) {
      alert('Please provide a reason for blocking this client');
      return;
    }

    setBlocking(true);
    try {
      const response = await fetch(getApiUrl(`/api/clients/${clientId}/block`), {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: blockReason })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to block client');
      }

      alert('Client blocked successfully');
      setShowBlockModal(false);
      setBlockReason('');
      fetchClientData(); // Refresh data
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setBlocking(false);
    }
  };

  const handleUnblockClient = async () => {
    if (!confirm('Are you sure you want to unblock this client?')) {
      return;
    }

    try {
      const response = await fetch(getApiUrl(`/api/clients/${clientId}/unblock`), {
        method: 'PUT',
        credentials: 'include'
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to unblock client');
      }

      alert('Client unblocked successfully');
      fetchClientData(); // Refresh data
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (cents) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'confirmed': 'status-confirmed',
      'completed': 'status-completed',
      'cancelled': 'status-cancelled',
      'pending': 'status-pending',
      'no-show': 'status-no-show'
    };
    return statusMap[status] || 'status-pending';
  };

  if (loading) {
    return (
      <div className="client-detail-container">
        <div className="loading">Loading client details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="client-detail-container">
        <div className="error">Error: {error}</div>
        <button onClick={() => navigate('/admin/clients')} className="back-button btn btn--secondary">
          <span className="material-symbols-outlined">arrow_back</span> Back to Clients
        </button>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="client-detail-container">
        <div className="error">Client not found</div>
        <button onClick={() => navigate('/admin/clients')} className="back-button btn btn--secondary">
          <span className="material-symbols-outlined">arrow_back</span> Back to Clients
        </button>
      </div>
    );
  }

  return (
    <div className="client-detail-container customer-detail-container">
      <button onClick={() => navigate('/admin/clients')} className="back-button btn btn--secondary">
        <span className="material-symbols-outlined">arrow_back</span> Back to Clients
      </button>

      <div className="client-detail-grid customer-detail-grid">
        {/* Client Information */}
        <div className="detail-section full-width">
          <div className="section-header">
            <h2>Client Information</h2>
            <div className="header-actions">
              {!client.isActive && (
                <span className="status-badge status-blocked">Blocked</span>
              )}
              {isEditing ? (
                <div className="edit-buttons">
                  <button onClick={handleSaveEdit} disabled={saving} className="btn btn--primary">
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button onClick={handleCancelEdit} disabled={saving} className="btn btn--secondary">
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <button onClick={handleEditClick} className="btn btn--secondary">
                    <span className="material-symbols-outlined">edit</span>
                    Edit
                  </button>
                  {client.isActive ? (
                    <button onClick={() => setShowBlockModal(true)} className="btn btn--danger">
                      <span className="material-symbols-outlined">block</span>
                      Block Client
                    </button>
                  ) : (
                    <button onClick={handleUnblockClient} className="btn btn--success">
                      <span className="material-symbols-outlined">check_circle</span>
                      Unblock Client
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="client-info-grid customer-info-grid">
            <div className="info-group">
              <label>Name:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="edit-input"
                  required
                />
              ) : (
                <span>{client.name}</span>
              )}
            </div>

            <div className="info-group">
              <label>Email:</label>
              {isEditing ? (
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="edit-input"
                  required
                />
              ) : (
                <span>{client.email}</span>
              )}
            </div>

            <div className="info-group">
              <label>Phone:</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  className="edit-input"
                  placeholder="Phone number"
                />
              ) : (
                <span>{client.phone || 'N/A'}</span>
              )}
            </div>

            <div className="info-group">
              <label>Time Zone:</label>
              {isEditing ? (
                <select
                  value={editForm.timeZone}
                  onChange={(e) => setEditForm({ ...editForm, timeZone: e.target.value })}
                  className="edit-input"
                >
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Denver">Mountain Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                </select>
              ) : (
                <span>{client.timeZone || 'N/A'}</span>
              )}
            </div>

            <div className="info-group full-width">
              <label>Email Reminders:</label>
              {isEditing ? (
                <input
                  type="checkbox"
                  checked={editForm.communicationPreferences.emailReminders}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    communicationPreferences: {
                      ...editForm.communicationPreferences,
                      emailReminders: e.target.checked
                    }
                  })}
                />
              ) : (
                <span>{client.communicationPreferences?.emailReminders ? 'Enabled' : 'Disabled'}</span>
              )}
            </div>

            <div className="info-group full-width">
              <label>SMS Reminders:</label>
              {isEditing ? (
                <input
                  type="checkbox"
                  checked={editForm.communicationPreferences.smsReminders}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    communicationPreferences: {
                      ...editForm.communicationPreferences,
                      smsReminders: e.target.checked
                    }
                  })}
                />
              ) : (
                <span>{client.communicationPreferences?.smsReminders ? 'Enabled' : 'Disabled'}</span>
              )}
            </div>

            <div className="info-group full-width">
              <label>Client Notes (Admin Only):</label>
              {isEditing ? (
                <textarea
                  value={editForm.clientNotes}
                  onChange={(e) => setEditForm({ ...editForm, clientNotes: e.target.value })}
                  className="edit-input"
                  rows="3"
                  placeholder="Internal notes about this client..."
                />
              ) : (
                <span>{client.clientNotes || 'No notes'}</span>
              )}
            </div>

            {!client.isActive && client.blockedReason && (
              <div className="info-group full-width blocked-reason">
                <label>Blocked Reason:</label>
                <span className="error-text">{client.blockedReason}</span>
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="detail-section full-width">
            <h2>Statistics</h2>
            <div className="stat-cards order-stats">
              <div className="stat-card">
                <span className="stat-label">Total Bookings</span>
                <span className="stat-value">{stats.totalBookings}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Completed</span>
                <span className="stat-value">{stats.completedBookings}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Upcoming</span>
                <span className="stat-value">{stats.upcomingBookings}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Cancelled</span>
                <span className="stat-value">{stats.cancelledBookings}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">No-Shows</span>
                <span className="stat-value">{stats.noShowBookings}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Total Spent</span>
                <span className="stat-value amount">{formatCurrency(stats.totalAmountCents)}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Avg Booking Value</span>
                <span className="stat-value amount">{formatCurrency(stats.averageBookingValueCents)}</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">First Booking</span>
                <span className="stat-value">{stats.firstBookingDate ? formatDate(stats.firstBookingDate) : 'N/A'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Booking History */}
        <div className="detail-section full-width">
          <h2>Booking History</h2>
          {bookings.length > 0 ? (
            <div className="bookings-table-container">
              <table className="bookings-table orders-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Staff</th>
                    <th>Date & Time</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td data-label="Service">{booking.serviceName}</td>
                      <td data-label="Staff">{booking.staffName}</td>
                      <td data-label="Date & Time">{formatDate(booking.startDateTime)}</td>
                      <td data-label="Duration">{booking.duration} min</td>
                      <td data-label="Status">
                        <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td data-label="Amount" className="order-total">
                        {formatCurrency(booking.amount || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-data">No bookings found for this client.</div>
          )}
        </div>
      </div>

      {/* Block Client Modal */}
      {showBlockModal && (
        <div className="modal-overlay" onClick={() => setShowBlockModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Block Client</h3>
            <p>Please provide a reason for blocking this client:</p>
            <textarea
              value={blockReason}
              onChange={(e) => setBlockReason(e.target.value)}
              placeholder="Reason for blocking..."
              rows="4"
              className="block-reason-textarea"
            />
            <div className="modal-actions">
              <button
                onClick={handleBlockClient}
                disabled={blocking || !blockReason.trim()}
                className="btn btn--danger"
              >
                {blocking ? 'Blocking...' : 'Block Client'}
              </button>
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setBlockReason('');
                }}
                disabled={blocking}
                className="btn btn--secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
