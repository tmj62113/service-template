import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import SEO from '../components/SEO';
import '../styles/NotFound.css';

/**
 * NotFound - 404 Error Page
 *
 * Displayed when a user navigates to a route that doesn't exist.
 * Provides helpful navigation options and search functionality.
 */
export default function NotFound() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to products page with search query
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Suggested navigation links
  const suggestions = [
    {
      icon: 'home',
      label: 'Homepage',
      description: 'Start from the beginning',
      path: '/'
    },
    {
      icon: 'palette',
      label: 'Browse Artwork',
      description: 'Explore our full collection',
      path: '/products'
    },
    {
      icon: 'info',
      label: 'About the Artist',
      description: 'Learn more about Mark J Peterson',
      path: '/about'
    },
    {
      icon: 'mail',
      label: 'Contact Us',
      description: 'Get in touch with questions',
      path: '/#contact'
    }
  ];

  return (
    <div className="not-found section-container">
      <SEO
        title="Page Not Found"
        description="The page you're looking for could not be found. Browse our artwork collection or return to the homepage."
      />

      <div className="not-found__container container container--sm">
        {/* Error illustration */}
        <div className="not-found__illustration" aria-hidden="true">
          <span className="not-found__number">404</span>
          <span className="material-symbols-outlined not-found__icon">
            search_off
          </span>
        </div>

        {/* Heading */}
        <h1 className="not-found__title">
          Page Not Found
        </h1>

        <p className="not-found__description">
          We couldn't find the page you're looking for. It may have been moved, deleted, or the link might be incorrect.
        </p>

        {/* Search box */}
        <div className="not-found__search">
          <h2 className="not-found__search-title">
            Search for artwork
          </h2>
          <form onSubmit={handleSearch} className="not-found__search-form">
            <div className="not-found__search-input-wrapper">
              <span className="material-symbols-outlined not-found__search-icon">
                search
              </span>
              <input
                type="text"
                className="not-found__search-input"
                placeholder="Search by title, style, or theme..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search for artwork"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!searchQuery.trim()}
            >
              Search
            </button>
          </form>
        </div>

        {/* Suggested links */}
        <div className="not-found__suggestions">
          <h2 className="not-found__suggestions-title">
            Where would you like to go?
          </h2>

          <div className="not-found__suggestions-grid">
            {suggestions.map((suggestion) => (
              <Link
                key={suggestion.path}
                to={suggestion.path}
                className="not-found__suggestion-card"
                aria-label={`Navigate to ${suggestion.label}`}
              >
                <span className="material-symbols-outlined not-found__suggestion-icon">
                  {suggestion.icon}
                </span>
                <div className="not-found__suggestion-content">
                  <h3 className="not-found__suggestion-label">
                    {suggestion.label}
                  </h3>
                  <p className="not-found__suggestion-description">
                    {suggestion.description}
                  </p>
                </div>
                <span className="material-symbols-outlined not-found__suggestion-arrow">
                  arrow_forward
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Back button */}
        <div className="not-found__back">
          <button
            onClick={() => navigate(-1)}
            className="btn btn-secondary"
            aria-label="Go back to previous page"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
