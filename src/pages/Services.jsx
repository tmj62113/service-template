import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Services.css';

const PRICE_FILTERS = [
  { id: 'all', label: 'All price ranges', matches: () => true },
  { id: 'under-100', label: 'Under $100', matches: (price) => price < 10000 },
  { id: '100-200', label: '$100 – $200', matches: (price) => price >= 10000 && price <= 20000 },
  { id: '200-400', label: '$200 – $400', matches: (price) => price > 20000 && price <= 40000 },
  { id: 'above-400', label: 'Above $400', matches: (price) => price > 40000 },
];

const DURATION_FILTERS = [
  { id: 'all', label: 'All durations', matches: () => true },
  { id: '30', label: 'Up to 30 minutes', matches: (duration) => duration <= 30 },
  { id: '60', label: 'Up to 60 minutes', matches: (duration) => duration <= 60 },
  { id: '90', label: 'Up to 90 minutes', matches: (duration) => duration <= 90 },
  { id: 'over-90', label: 'Over 90 minutes', matches: (duration) => duration > 90 },
];

const SORT_OPTIONS = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'duration-asc', label: 'Duration: Short to Long' },
  { id: 'duration-desc', label: 'Duration: Long to Short' },
];

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [selectedPriceFilter, setSelectedPriceFilter] = useState('all');
  const [selectedDurationFilter, setSelectedDurationFilter] = useState('all');
  const [sortOption, setSortOption] = useState('recommended');

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/services/meta/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  const fetchServices = useCallback(
    async (category = selectedCategory) => {
      const params = new URLSearchParams({
        isActive: 'true',
        limit: '50',
      });

      if (category !== 'all') {
        params.append('category', category);
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/services?${params}`);
        if (!response.ok) throw new Error('Failed to fetch services');

        const data = await response.json();
        setServices(data.services || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError('Failed to load services. Please try again later.');
        setServices([]);
      } finally {
        setLoading(false);
      }
    },
    [selectedCategory]
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleSearch = async (event) => {
    event.preventDefault();
    const trimmedTerm = searchTerm.trim();

    if (!trimmedTerm) {
      setIsSearchMode(false);
      fetchServices();
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/services/search/${encodeURIComponent(trimmedTerm)}`);
      if (!response.ok) throw new Error('Search failed');

      const data = await response.json();
      const results = Array.isArray(data) ? data : data.services || [];
      setServices(results);
      setError(null);
      setIsSearchMode(true);
    } catch (err) {
      console.error('Error searching services:', err);
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setIsSearchMode(false);
    fetchServices();
  };

  const handleCategorySelect = (category) => {
    const isSameCategory = selectedCategory === category;
    setSelectedCategory(category);
    setIsSearchMode(false);
    setSearchTerm('');

    if (isSameCategory) {
      fetchServices(category);
    }
  };

  const clearFilters = () => {
    const previousCategory = selectedCategory;
    const wasSearchMode = isSearchMode;

    setSelectedCategory('all');
    setSelectedPriceFilter('all');
    setSelectedDurationFilter('all');
    setSortOption('recommended');
    if (wasSearchMode) {
      setSearchTerm('');
      setIsSearchMode(false);
    }

    if (wasSearchMode || previousCategory === 'all') {
      fetchServices('all');
    }
  };

  const priceFilter = useMemo(
    () => PRICE_FILTERS.find((filter) => filter.id === selectedPriceFilter) ?? PRICE_FILTERS[0],
    [selectedPriceFilter]
  );

  const durationFilter = useMemo(
    () => DURATION_FILTERS.find((filter) => filter.id === selectedDurationFilter) ?? DURATION_FILTERS[0],
    [selectedDurationFilter]
  );

  const filteredServices = useMemo(() => {
    let results = services.filter((service) => {
      const priceMatch = priceFilter.matches(service.price ?? 0);
      const durationMatch = durationFilter.matches(service.duration ?? 0);
      return priceMatch && durationMatch;
    });

    if (isSearchMode && searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      results = results.filter((service) =>
        service.name?.toLowerCase().includes(term) ||
        service.description?.toLowerCase().includes(term)
      );
    }

    switch (sortOption) {
      case 'price-asc':
        results = [...results].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case 'price-desc':
        results = [...results].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case 'duration-asc':
        results = [...results].sort((a, b) => (a.duration ?? 0) - (b.duration ?? 0));
        break;
      case 'duration-desc':
        results = [...results].sort((a, b) => (b.duration ?? 0) - (a.duration ?? 0));
        break;
      default:
        break;
    }

    return results;
  }, [services, priceFilter, durationFilter, sortOption, isSearchMode, searchTerm]);

  const totalServicesCount = services.length;
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'all') count += 1;
    if (selectedPriceFilter !== 'all') count += 1;
    if (selectedDurationFilter !== 'all') count += 1;
    if (sortOption !== 'recommended') count += 1;
    if (isSearchMode && searchTerm.trim()) count += 1;
    return count;
  }, [selectedCategory, selectedPriceFilter, selectedDurationFilter, sortOption, isSearchMode, searchTerm]);

  const formatPrice = (priceInCents) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format((priceInCents ?? 0) / 100);
  };

  const formatDuration = (minutes) => {
    if (!minutes) {
      return '—';
    }

    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  if (loading && services.length === 0) {
    return (
      <div className="services-page section-container--wide">
        <div className="services-loading">Loading services...</div>
      </div>
    );
  }

  const showEmptyState = !loading && filteredServices.length === 0;

  return (
    <div className="services-page section-container--wide">
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
            onChange={(event) => setSearchTerm(event.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            Search
          </button>
          {searchTerm && (
            <button
              type="button"
              onClick={clearSearch}
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
            onClick={() => handleCategorySelect('all')}
          >
            All Services
          </button>
          {categories.map((category) => (
            <button
              key={category}
              className={`filter-button ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => handleCategorySelect(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="services-toolbar">
          <div className="services-toolbar-controls">
            <label className="filter-control">
              <span className="filter-label">Price</span>
              <select
                aria-label="Filter by price"
                value={selectedPriceFilter}
                onChange={(event) => setSelectedPriceFilter(event.target.value)}
              >
                {PRICE_FILTERS.map((filter) => (
                  <option key={filter.id} value={filter.id}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="filter-control">
              <span className="filter-label">Duration</span>
              <select
                aria-label="Filter by duration"
                value={selectedDurationFilter}
                onChange={(event) => setSelectedDurationFilter(event.target.value)}
              >
                {DURATION_FILTERS.map((filter) => (
                  <option key={filter.id} value={filter.id}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="filter-control">
              <span className="filter-label">Sort</span>
              <select
                aria-label="Sort services"
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value)}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="services-toolbar-meta">
            <div className="services-results-summary">
              Showing <strong>{filteredServices.length}</strong>
              {totalServicesCount ? (
                <>
                  {' '}of <strong>{totalServicesCount}</strong> services
                </>
              ) : null}
            </div>
            {activeFilterCount > 0 && (
              <button type="button" className="services-clear-filters" onClick={clearFilters}>
                Clear filters ({activeFilterCount})
              </button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="services-error">
          {error}
        </div>
      )}

      {showEmptyState ? (
        <div className="services-empty">
          <p>No services match your filters.</p>
          {(isSearchMode || searchTerm) && (
            <button onClick={clearSearch} className="btn btn-secondary">
              View All Services
            </button>
          )}
        </div>
      ) : (
        <div className="services-grid">
          {filteredServices.map((service) => (
            <div key={service._id} className="service-card" data-testid="service-card">
              {service.image && (
                <div className="service-image">
                  <img src={service.image} alt={service.name} />
                </div>
              )}
              <div className="service-content">
                <div className="service-category">{service.category}</div>
                <h3 className="service-name">{service.name}</h3>
                <p className="service-description">
                  {service.description && service.description.length > 120
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
                  className="service-book-button btn btn-primary"
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
