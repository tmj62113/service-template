import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Services.css';

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchServices();
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/services/meta/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        isActive: 'true',
        limit: '50'
      });

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`/api/services?${params}`);
      if (!response.ok) throw new Error('Failed to fetch services');

      const data = await response.json();
      setServices(data.services || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      fetchServices();
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/services/search/${encodeURIComponent(searchTerm)}`);
      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      setServices(data || []);
      setError(null);
    } catch (err) {
      console.error('Error searching services:', err);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (priceInCents) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(priceInCents / 100);
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  if (loading && services.length === 0) {
    return (
      <div className="services-page">
        <div className="services-loading">Loading services...</div>
      </div>
    );
  }

  return (
    <div className="services-page">
      <div className="services-header">
        <h1>Our Services</h1>
        <p className="services-subtitle">
          Professional coaching and consulting services tailored to your needs
        </p>
      </div>

      <div className="services-controls">
        {/* Search */}
        <form className="services-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                fetchServices();
              }}
              className="search-clear"
            >
              Clear
            </button>
          )}
        </form>

        {/* Category Filter */}
        <div className="services-filters">
          <button
            className={`filter-button ${selectedCategory === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCategory('all')}
          >
            All Services
          </button>
          {categories.map((category) => (
            <button
              key={category}
              className={`filter-button ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="services-error">
          {error}
        </div>
      )}

      {services.length === 0 && !loading ? (
        <div className="services-empty">
          <p>No services found.</p>
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                fetchServices();
              }}
              className="btn btn--secondary"
            >
              View All Services
            </button>
          )}
        </div>
      ) : (
        <div className="services-grid">
          {services.map((service) => (
            <div key={service._id} className="service-card">
              {service.image && (
                <div className="service-image">
                  <img src={service.image} alt={service.name} />
                </div>
              )}
              <div className="service-content">
                <div className="service-category">{service.category}</div>
                <h3 className="service-name">{service.name}</h3>
                <p className="service-description">
                  {service.description.length > 120
                    ? `${service.description.substring(0, 120)}...`
                    : service.description}
                </p>
                <div className="service-details">
                  <span className="service-duration">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13z"/>
                      <path d="M8 3.5a.5.5 0 01.5.5v4.21l2.65 1.53a.5.5 0 01-.5.87L7.85 8.85A.5.5 0 017.5 8.5V4a.5.5 0 01.5-.5z"/>
                    </svg>
                    {formatDuration(service.duration)}
                  </span>
                  <span className="service-price">{formatPrice(service.price)}</span>
                </div>
                <Link
                  to={`/services/${service._id}`}
                  className="service-book-button btn btn--primary"
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Services;
