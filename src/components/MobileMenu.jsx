import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../config/theme';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        className="mobile-menu-button"
        onClick={toggleMenu}
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
      >
        <div className={`hamburger ${isOpen ? 'open' : ''}`} aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      {/* Overlay */}
      {isOpen && <div className="mobile-menu-overlay" onClick={toggleMenu} aria-hidden="true" />}

      {/* Slide-in Menu */}
      <nav
        className={`mobile-menu ${isOpen ? 'open' : ''}`}
        role="navigation"
        aria-label="Mobile navigation"
        aria-hidden={!isOpen}
      >
        <div className="mobile-menu-header">
          <h2>{theme.brandName}</h2>
          <button
            className="mobile-menu-close"
            onClick={toggleMenu}
            aria-label="Close navigation menu"
          >
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>

        <div className="mobile-menu-nav">
          <Link
            to="/"
            className={location.pathname === '/' ? 'active' : ''}
          >
            Home
          </Link>
          <Link
            to="/services"
            className={location.pathname === '/services' ? 'active' : ''}
          >
            Services
          </Link>
          <Link
            to="/about"
            className={location.pathname === '/about' ? 'active' : ''}
          >
            About
          </Link>
          <a href="/#contact" onClick={toggleMenu}>
            Contact
          </a>
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className={`admin-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
              aria-label="Admin dashboard"
            >
              <span className="material-symbols-outlined" aria-hidden="true">dashboard</span>
              Admin Dashboard
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}
