import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminCustomers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/customers', {
        credentials: 'include',
      });
      const data = await response.json();
      setCustomers(data.customers || []);
    } catch (err) {
      console.error('Failed to load customers:', err);
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
    return <div className="loading">Loading customers...</div>;
  }

  return (
    <div className="admin-customers">
      <div className="customers-header">
        <h2>Customers</h2>
      </div>

      <div className="customers-table-container">
        <table className="customers-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Total Orders</th>
              <th>Total Spent</th>
              <th>Last Order</th>
            </tr>
          </thead>
          <tbody>
            {customers && customers.map((customer, index) => (
              <tr
                key={`${customer.email}-${customer.name}-${index}`}
                onClick={() => navigate(`/admin/customers/${encodeURIComponent(customer.email)}/${encodeURIComponent(customer.name)}`)}
                style={{ cursor: 'pointer' }}
              >
                <td data-label="Name">{customer.name}</td>
                <td data-label="Email">{customer.email}</td>
                <td data-label="Total Orders">{customer.totalOrders}</td>
                <td className="customer-total" data-label="Total Spent">
                  {formatCurrency(customer.totalSpent)}
                </td>
                <td data-label="Last Order">{formatDate(customer.lastOrderDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && (
          <div className="no-data">No customers found</div>
        )}
      </div>
    </div>
  );
}
