import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getApiUrl } from '../config/api';

export default function AdminSearch() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState({
    services: [],
    bookings: [],
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
      const [servicesRes, bookingsRes, customersRes, messagesRes] = await Promise.all([
        fetch(getApiUrl('/api/services'), { credentials: 'include' }),
        fetch(getApiUrl('/api/bookings'), { credentials: 'include' }),
        fetch(getApiUrl('/api/customers'), { credentials: 'include' }),
        fetch(getApiUrl('/api/messages'), { credentials: 'include' })
      ]);

      const [servicesData, bookingsData, customersData, messagesData] = await Promise.all([
        servicesRes.json(),
        bookingsRes.json(),
        customersData.json(),
        messagesRes.json()
      ]);

      const term = searchTerm.toLowerCase();

      // Filter services
      const services = (servicesData.services || []).filter(s =>
        s.name.toLowerCase().includes(term) ||
        s.category.toLowerCase().includes(term) ||
        s._id.slice(-8).toUpperCase().includes(term.toUpperCase())
      );

      // Filter bookings
      const bookings = (bookingsData.bookings || []).filter(b => {
        const bookingId = b._id.slice(-8).toUpperCase();
        const searchUpper = term.toUpperCase();
        // Remove "BKG-" prefix if present
        const searchWithoutPrefix = searchUpper.replace(/^BKG-/, '');

        return (
          bookingId.includes(searchWithoutPrefix) ||
          b._id.toUpperCase().includes(searchWithoutPrefix) ||
          b.clientInfo?.email?.toLowerCase().includes(term) ||
          b.status?.toLowerCase().includes(term)
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

      setResults({ services, bookings, customers, messages });
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
        <p>Enter a search term in the search box above to find services, bookings, customers, and messages.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="loading">Searching...</div>;
  }

  const totalResults = results.services.length + results.bookings.length + results.customers.length + results.messages.length;

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

      {results.services.length > 0 && (
        <div className="search-section">
          <h3>Services ({results.services.length})</h3>
          <div className="results-list">
            {results.services.map(service => (
              <Link to={`/admin/services?serviceId=${service._id}`} key={service._id} className="result-item">
                <div className="result-icon">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <div className="result-content">
                  <h4>{service.name}</h4>
                  <p>{service.category} • {formatCurrency(service.price)} • {service.duration} min</p>
                </div>
                <div className="result-meta">
                  <span className={`status-badge status-${service.isActive ? 'active' : 'inactive'}`}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {results.bookings.length > 0 && (
        <div className="search-section">
          <h3>Bookings ({results.bookings.length})</h3>
          <div className="results-list">
            {results.bookings.map(booking => (
              <Link to={`/admin/bookings/${booking._id}`} key={booking._id} className="result-item">
                <div className="result-icon">
                  <span className="material-symbols-outlined">event</span>
                </div>
                <div className="result-content">
                  <h4>Booking #{booking._id.slice(-8).toUpperCase()}</h4>
                  <p>{booking.clientInfo?.email} • {formatDate(booking.createdAt)}</p>
                </div>
                <div className="result-meta">
                  <span className="result-amount">{formatCurrency(booking.amount / 100)}</span>
                  <span className={`status-badge status-${booking.status?.toLowerCase()}`}>
                    {booking.status}
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
                  <span className="result-stat">{customer.totalBookings || 0} bookings</span>
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
