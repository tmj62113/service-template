import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function CustomerDetail() {
  const { email, name } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [editedShippingName, setEditedShippingName] = useState('');
  const [editedAddress, setEditedAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCustomer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, name]);

  async function fetchCustomer() {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/customers/${encodeURIComponent(email)}/${encodeURIComponent(name)}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch customer details');
      }
      const data = await response.json();
      setCustomer(data);
      setEditedName(data.name);
      setEditedEmail(data.email);
      setEditedShippingName(data.mostRecentShippingName || '');
      setEditedAddress(data.mostRecentShippingAddress || {
        line1: '',
        line2: '',
        city: '',
        state: '',
        postal_code: '',
        country: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedName(customer.name);
    setEditedEmail(customer.email);
    setEditedShippingName(customer.mostRecentShippingName || '');
    setEditedAddress(customer.mostRecentShippingAddress || {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: ''
    });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedName(customer.name);
    setEditedEmail(customer.email);
    setEditedShippingName(customer.mostRecentShippingName || '');
    setEditedAddress(customer.mostRecentShippingAddress || {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: ''
    });
  };

  const handleSaveEdit = async () => {
    if (!editedName.trim() || !editedEmail.trim()) {
      alert('Name and email are required');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`http://localhost:3001/api/customers/${encodeURIComponent(email)}/${encodeURIComponent(name)}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newName: editedName,
          newEmail: editedEmail,
          newShippingName: editedShippingName,
          newShippingAddress: editedAddress,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update customer');
      }

      // Navigate to the new URL with updated email and name
      navigate(`/admin/customers/${encodeURIComponent(editedEmail)}/${encodeURIComponent(editedName)}`, { replace: true });

      setIsEditing(false);
      alert('Customer details updated successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="customer-detail-container">
        <div className="loading">Loading customer details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customer-detail-container">
        <div className="error">Error: {error}</div>
        <button onClick={() => navigate('/admin/customers')} className="back-button">
          <span className="material-symbols-outlined">arrow_back</span> Back to Customers
        </button>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="customer-detail-container">
        <div className="error">Customer not found</div>
        <button onClick={() => navigate('/admin/customers')} className="back-button">
          <span className="material-symbols-outlined">arrow_back</span> Back to Customers
        </button>
      </div>
    );
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatAddress = (address) => {
    if (!address) return 'N/A';
    return (
      <>
        {address.line1}
        {address.line2 && (
          <>
            <br />
            {address.line2}
          </>
        )}
        <br />
        {address.city}, {address.state} {address.postal_code}
        <br />
        {address.country}
      </>
    );
  };

  return (
    <div className="customer-detail-container">
      <button onClick={() => navigate('/admin/customers')} className="back-button">
        <span className="material-symbols-outlined">arrow_back</span> Back to Customers
      </button>

      <div className="customer-detail-grid">
        {/* Customer Information */}
        <div className="detail-section full-width">
          <div className="section-header">
            <h2>Customer Information</h2>
            {isEditing ? (
              <div className="edit-buttons">
                <button onClick={handleSaveEdit} disabled={saving} className="save-btn">
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={handleCancelEdit} disabled={saving} className="cancel-btn">
                  Cancel
                </button>
              </div>
            ) : (
              <button onClick={handleEditClick} className="edit-btn">
                <span className="material-symbols-outlined">edit</span>
                Edit
              </button>
            )}
          </div>

          <div className="customer-info-grid">
            <div className="info-group">
              <label>Name:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="edit-input"
                />
              ) : (
                <span>{customer.name}</span>
              )}
            </div>
            <div className="info-group">
              <label>Email:</label>
              {isEditing ? (
                <input
                  type="email"
                  value={editedEmail}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  className="edit-input"
                />
              ) : (
                <span>{customer.email}</span>
              )}
            </div>
            <div className="info-group">
              <label>Shipping Name:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedShippingName}
                  onChange={(e) => setEditedShippingName(e.target.value)}
                  className="edit-input"
                  placeholder="Recipient name"
                />
              ) : (
                <span>{customer.mostRecentShippingName || 'N/A'}</span>
              )}
            </div>
            <div className="info-group">
              <label>Address Line 1:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedAddress.line1}
                  onChange={(e) => setEditedAddress({ ...editedAddress, line1: e.target.value })}
                  className="edit-input"
                  placeholder="Street address"
                />
              ) : (
                <span>{customer.mostRecentShippingAddress?.line1 || 'N/A'}</span>
              )}
            </div>
            <div className="info-group">
              <label>Address Line 2:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedAddress.line2 || ''}
                  onChange={(e) => setEditedAddress({ ...editedAddress, line2: e.target.value })}
                  className="edit-input"
                  placeholder="Apt, suite, etc. (optional)"
                />
              ) : (
                <span>{customer.mostRecentShippingAddress?.line2 || 'N/A'}</span>
              )}
            </div>
            <div className="info-group">
              <label>City:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedAddress.city}
                  onChange={(e) => setEditedAddress({ ...editedAddress, city: e.target.value })}
                  className="edit-input"
                  placeholder="City"
                />
              ) : (
                <span>{customer.mostRecentShippingAddress?.city || 'N/A'}</span>
              )}
            </div>
            <div className="info-group">
              <label>State:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedAddress.state}
                  onChange={(e) => setEditedAddress({ ...editedAddress, state: e.target.value })}
                  className="edit-input"
                  placeholder="State"
                />
              ) : (
                <span>{customer.mostRecentShippingAddress?.state || 'N/A'}</span>
              )}
            </div>
            <div className="info-group">
              <label>Postal Code:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedAddress.postal_code}
                  onChange={(e) => setEditedAddress({ ...editedAddress, postal_code: e.target.value })}
                  className="edit-input"
                  placeholder="Postal code"
                />
              ) : (
                <span>{customer.mostRecentShippingAddress?.postal_code || 'N/A'}</span>
              )}
            </div>
            <div className="info-group">
              <label>Country:</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedAddress.country}
                  onChange={(e) => setEditedAddress({ ...editedAddress, country: e.target.value })}
                  className="edit-input"
                  placeholder="Country"
                />
              ) : (
                <span>{customer.mostRecentShippingAddress?.country || 'N/A'}</span>
              )}
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="detail-section full-width">
          <h2>Order History</h2>
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total</th>
                <th>Items</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {customer.orders.map((order) => {
                const shortId = `ORD-${order._id.slice(-8).toUpperCase()}`;
                return (
                  <tr key={order._id}>
                    <td className="order-id">{shortId}</td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      <span className={`status-badge status-${order.orderStatus || order.paymentStatus}`}>
                        {order.orderStatus === 'delivered' ? 'Delivered' :
                         order.orderStatus === 'in_transit' ? 'In Transit' :
                         order.orderStatus === 'shipped' ? 'Shipped' :
                         order.paymentStatus}
                      </span>
                    </td>
                    <td className="order-total">{formatCurrency(order.total)}</td>
                    <td>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</td>
                    <td>
                      <button
                        className="view-order-btn"
                        onClick={() => navigate(`/admin/orders/${shortId}`)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="order-stats">
            <div className="stat-card">
              <span className="stat-label">First Order</span>
              <span className="stat-value">{formatDate(customer.firstOrderDate)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Last Order</span>
              <span className="stat-value">{formatDate(customer.lastOrderDate)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Average Order Value</span>
              <span className="stat-value amount">{formatCurrency(customer.totalSpent / customer.totalOrders)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total Orders</span>
              <span className="stat-value">{customer.totalOrders}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total Spent</span>
              <span className="stat-value amount">{formatCurrency(customer.totalSpent)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
