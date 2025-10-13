import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creatingShipment, setCreatingShipment] = useState(false);

  useEffect(() => {
    fetchOrder();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function fetchOrder() {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/orders/${id}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }
      const data = await response.json();
      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="order-detail-container">
        <div className="loading">Loading order details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-detail-container">
        <div className="error">Error: {error}</div>
        <button onClick={() => navigate('/admin/orders')} className="back-button">
          <span className="material-symbols-outlined">arrow_back</span> Back to Orders
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-container">
        <div className="error">Order not found</div>
        <button onClick={() => navigate('/admin/orders')} className="back-button">
          <span className="material-symbols-outlined">arrow_back</span> Back to Orders
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

  const handleCreateShipment = async () => {
    if (!window.confirm('Create shipping label for this order?')) {
      return;
    }

    setCreatingShipment(true);
    try {
      const response = await fetch(`http://localhost:3001/api/orders/${id}/create-shipment`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create shipment');
      }

      const data = await response.json();

      // Update local order state with new tracking info
      setOrder({
        ...order,
        trackingNumber: data.shipment.trackingNumber,
        carrier: data.shipment.carrier,
        shippingLabelUrl: data.shipment.shippingLabelUrl,
        trackingUrlProvider: data.shipment.trackingUrlProvider,
        orderStatus: 'shipped',
        fulfillmentStatus: 'fulfilled',
      });

      alert('Shipment created successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setCreatingShipment(false);
    }
  };

  return (
    <div className="order-detail-container">
      <button onClick={() => navigate('/admin/orders')} className="back-button">
        <span className="material-symbols-outlined">arrow_back</span> Back to Orders
      </button>

      <div className="order-detail-header">
        <h1>Order ORD-{order._id.slice(-8).toUpperCase()}</h1>
        <div className="order-meta">
          <span className="order-date">Ordered: {formatDate(order.createdAt)}</span>
          <span className={`status-badge status-${order.orderStatus || order.paymentStatus}`}>
            {order.orderStatus === 'delivered' ? 'Delivered' :
             order.orderStatus === 'in_transit' ? 'In Transit' :
             order.orderStatus === 'shipped' ? 'Shipped' :
             order.paymentStatus}
          </span>
        </div>
      </div>

      <div className="order-detail-grid">
        {/* Customer Information */}
        <div className="detail-section">
          <h2>Customer Information</h2>
          <div className="info-group">
            <label>Name:</label>
            <span>{order.customerName}</span>
          </div>
          <div className="info-group">
            <label>Email:</label>
            <span>{order.customerEmail}</span>
          </div>
        </div>

        {/* Payment Information */}
        <div className="detail-section">
          <h2>Payment Information</h2>
          <div className="info-group">
            <label>Status:</label>
            <span className={`status-${order.paymentStatus}`}>
              {order.paymentStatus}
            </span>
          </div>
          <div className="info-group">
            <label>Total:</label>
            <span className="amount">
              ${order.total.toFixed(2)} {order.currency.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="detail-section">
          <h2>Shipping Address</h2>
          <div className="address">
            <strong>{order.shippingName}</strong>
            <br />
            {formatAddress(order.shippingAddress)}
          </div>
        </div>

        {/* Billing Address */}
        <div className="detail-section">
          <h2>Billing Address</h2>
          <div className="address">{formatAddress(order.billingAddress)}</div>
        </div>

        {/* Shipping & Tracking */}
        <div className="detail-section full-width">
          <div className="shipping-header">
            <h2>Shipping & Tracking</h2>
            {!order.trackingNumber && (
              <button
                className="create-shipment-btn"
                onClick={handleCreateShipment}
                disabled={creatingShipment}
              >
                {creatingShipment ? 'Creating...' : 'Create Shipment'}
              </button>
            )}
          </div>

          {order.trackingNumber ? (
            <div className="tracking-info">
              <div className="info-group">
                <label>Tracking Number:</label>
                <span className="monospace tracking-number">{order.trackingNumber}</span>
              </div>
              <div className="info-group">
                <label>Carrier:</label>
                <span>{order.carrier}</span>
              </div>
              {order.trackingUrlProvider && (
                <div className="info-group">
                  <label>Track Shipment:</label>
                  <a
                    href={order.trackingUrlProvider}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tracking-link"
                  >
                    View Tracking Details →
                  </a>
                </div>
              )}
              {order.shippingLabelUrl && (
                <div className="info-group">
                  <label>Shipping Label:</label>
                  <a
                    href={order.shippingLabelUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="label-link"
                  >
                    Download Label (PDF) →
                  </a>
                </div>
              )}
            </div>
          ) : (
            <p className="no-tracking">
              No shipping label created yet. Click "Create Shipment" to generate a shipping label and tracking number.
            </p>
          )}
        </div>

        {/* Order Items */}
        <div className="detail-section full-width">
          <h2>Order Items</h2>
          <table className="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>${item.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="2">
                  <strong>Total:</strong>
                </td>
                <td>
                  <strong>${order.total.toFixed(2)}</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Stripe Information */}
        <div className="detail-section full-width">
          <h2>Stripe Information</h2>
          <div className="info-group">
            <label>Payment Intent ID:</label>
            <span className="monospace">{order.paymentIntentId}</span>
          </div>
          <div className="info-group">
            <label>Session ID:</label>
            <span className="monospace">{order.sessionId}</span>
          </div>
          <div className="info-group">
            <label>Customer ID:</label>
            <span className="monospace">{order.customerId || 'N/A (Guest Checkout)'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
