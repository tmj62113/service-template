import { Link } from 'react-router-dom';
import { useState } from 'react';
import { theme } from '../config/theme';
import { resetCookieConsent } from './CookieConsent';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          source: 'footer',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe');
      }

      setSubscribed(true);
      setEmail('');
      setTimeout(() => {
        setSubscribed(false);
      }, 5000);
    } catch (err) {
      console.error('Error subscribing to newsletter:', err);
      setError('Failed to subscribe. Please try again.');
    }
  };

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-content">
        <div className="footer-section">
          <img src={theme.logo} alt={theme.logoAlt} className="footer-logo" />
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <nav className="footer-nav">
            <Link to="/parade-of-hearts">Parade of Hearts</Link>
            <Link to="/gallery">Gallery</Link>
            <Link to="/products">Products</Link>
            <Link to="/about">About</Link>
            <a href="/#contact">Contact</a>
          </nav>
        </div>

        <div className="footer-section">
          <h4>Admin</h4>
          <nav className="footer-nav">
            <Link to="/admin">Dashboard</Link>
          </nav>
        </div>

        <div className="footer-section">
          <h4>Newsletter</h4>
          {subscribed ? (
            <p className="newsletter-success">Thank you for subscribing!</p>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="newsletter-input"
                required
              />
              <button type="submit" className="newsletter-btn">
                Subscribe
              </button>
              {error && <p className="newsletter-error">{error}</p>}
            </form>
          )}
          <div className="social-links">
            {theme.social.facebook && (
              <a href={theme.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
            )}
            {theme.social.instagram && (
              <a href={theme.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            )}
            {theme.social.youtube && (
              <a href={theme.social.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} {theme.brandName}. All rights reserved.</p>
        <div className="footer-legal-links">
          <Link to="/privacy-policy">Privacy Policy</Link>
          <span className="separator">|</span>
          <button onClick={resetCookieConsent} className="cookie-settings-link">
            Change Cookie Settings
          </button>
        </div>
      </div>
    </footer>
  );
}
