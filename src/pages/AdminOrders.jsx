import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/orders', {
        credentials: 'include',
      });
      const data = await response.json();
      setOrders(data.orders);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="admin-orders">
      <div className="orders-header">
        <h2>Orders</h2>
      </div>

      <div className="orders-table-container">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const shortId = `ORD-${order._id.slice(-8).toUpperCase()}`;
              return (
                <tr key={order._id} onClick={() => navigate(`/admin/orders/${shortId}`)}>
                  <td className="order-id" data-label="Order ID">{shortId}</td>
                <td data-label="Customer">{order.customerName}</td>
                <td data-label="Date">{formatDate(order.createdAt)}</td>
                <td data-label="Status">
                  <span className={`status-badge status-${order.orderStatus || order.paymentStatus}`}>
                    {order.orderStatus === 'delivered' ? 'Delivered' :
                     order.orderStatus === 'in_transit' ? 'In Transit' :
                     order.orderStatus === 'shipped' ? 'Shipped' :
                     order.paymentStatus}
                  </span>
                </td>
                <td className="order-total" data-label="Total">{formatCurrency(order.total)}</td>
                <td data-label="Actions">
                  <button className="action-btn">
                    <span className="material-symbols-outlined">more_vert</span>
                  </button>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="no-data">No orders found</div>
        )}
      </div>
    </div>
  );
}
