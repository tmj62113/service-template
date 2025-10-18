import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getApiUrl } from '../config/api';

export default function AdminSearch() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState({
    products: [],
    orders: [],
    customers: [],
    messages: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      searchAll(query);
    } else {
      setLoading(false);
    }
  }, [query]);

  const searchAll = async (searchTerm) => {
    setLoading(true);
    try {
      const [productsRes, ordersRes, customersRes, messagesRes] = await Promise.all([
        fetch(getApiUrl('/api/products'), { credentials: 'include' }),
        fetch(getApiUrl('/api/orders'), { credentials: 'include' }),
        fetch(getApiUrl('/api/customers'), { credentials: 'include' }),
        fetch(getApiUrl('/api/messages'), { credentials: 'include' })
      ]);

      const [productsData, ordersData, customersData, messagesData] = await Promise.all([
        productsRes.json(),
        ordersRes.json(),
        customersRes.json(),
        messagesRes.json()
      ]);

      const term = searchTerm.toLowerCase();

      // Filter products
      const products = (productsData.products || []).filter(p =>
        p.name.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term) ||
        p._id.slice(-8).toUpperCase().includes(term.toUpperCase())
      );

      // Filter orders
      const orders = (ordersData.orders || []).filter(o => {
        const orderId = o._id.slice(-8).toUpperCase();
        const searchUpper = term.toUpperCase();
        // Remove "ORD-" prefix if present
        const searchWithoutPrefix = searchUpper.replace(/^ORD-/, '');

        return (
          orderId.includes(searchWithoutPrefix) ||
          o._id.toUpperCase().includes(searchWithoutPrefix) ||
          o.customerEmail?.toLowerCase().includes(term) ||
          o.status?.toLowerCase().includes(term)
        );
      });

      // Filter customers
      const customers = (customersData.customers || []).filter(c =>
        c.name?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term)
      );

      // Filter messages
      const messagesArray = Array.isArray(messagesData) ? messagesData : (messagesData.messages || []);
      const messages = messagesArray.filter(m =>
        m.name?.toLowerCase().includes(term) ||
        m.email?.toLowerCase().includes(term) ||
        m.subject?.toLowerCase().includes(term) ||
        m.message?.toLowerCase().includes(term)
      );

      setResults({ products, orders, customers, messages });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!query) {
    return (
      <div className="admin-search">
        <h2>Search</h2>
        <p>Enter a search term in the search box above to find products, orders, customers, and messages.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Searching...</div>;
  }

  const totalResults = results.products.length + results.orders.length + results.customers.length + results.messages.length;

  return (
    <div className="admin-search">
      <div className="search-header">
        <h2>Search Results for "{query}"</h2>
        <p>{totalResults} total result{totalResults !== 1 ? 's' : ''}</p>
      </div>

      {totalResults === 0 && (
        <div className="no-results">
          <p>No results found. Try a different search term.</p>
        </div>
      )}

      {results.products.length > 0 && (
        <div className="search-section">
          <h3>Products ({results.products.length})</h3>
          <div className="results-list">
            {results.products.map(product => (
              <Link to={`/admin/products?productId=${product._id}`} key={product._id} className="result-item">
                <div className="result-icon">
                  <span className="material-symbols-outlined">inventory_2</span>
                </div>
                <div className="result-content">
                  <h4>{product.name}</h4>
                  <p>{product.category} • {formatCurrency(product.price)} • Stock: {product.stock}</p>
                </div>
                <div className="result-meta">
                  <span className={`status-badge status-${product.status.toLowerCase().replace(' ', '-')}`}>
                    {product.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {results.orders.length > 0 && (
        <div className="search-section">
          <h3>Orders ({results.orders.length})</h3>
          <div className="results-list">
            {results.orders.map(order => (
              <Link to={`/admin/orders/${order._id}`} key={order._id} className="result-item">
                <div className="result-icon">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <div className="result-content">
                  <h4>Order #{order._id.slice(-8).toUpperCase()}</h4>
                  <p>{order.customerEmail} • {formatDate(order.createdAt)}</p>
                </div>
                <div className="result-meta">
                  <span className="result-amount">{formatCurrency(order.total)}</span>
                  <span className={`status-badge status-${order.status?.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {results.customers.length > 0 && (
        <div className="search-section">
          <h3>Customers ({results.customers.length})</h3>
          <div className="results-list">
            {results.customers.map(customer => (
              <Link to={`/admin/customers/${encodeURIComponent(customer.email)}/${encodeURIComponent(customer.name || 'Unknown')}`} key={customer._id} className="result-item">
                <div className="result-icon">
                  <span className="material-symbols-outlined">person</span>
                </div>
                <div className="result-content">
                  <h4>{customer.name || 'Unknown'}</h4>
                  <p>{customer.email}</p>
                </div>
                <div className="result-meta">
                  <span className="result-stat">{customer.totalOrders || 0} orders</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {results.messages.length > 0 && (
        <div className="search-section">
          <h3>Messages ({results.messages.length})</h3>
          <div className="results-list">
            {results.messages.map(message => (
              <Link to={`/admin/messages`} key={message._id} className="result-item">
                <div className="result-icon">
                  <span className="material-symbols-outlined">chat</span>
                </div>
                <div className="result-content">
                  <h4>{message.subject || 'No subject'}</h4>
                  <p>{message.name} • {message.email} • {formatDate(message.createdAt)}</p>
                </div>
                <div className="result-meta">
                  <span className={`status-badge status-${message.status}`}>
                    {message.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
