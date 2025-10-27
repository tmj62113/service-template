import { Link } from 'react-router-dom';
import { theme } from '../config/theme';
import { resetCookieConsent } from './CookieConsent';
import '../styles/components/Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer-container">
        <div className="footer-main">
          <div className="footer-cta">
            <h2>Ready to transform your business?</h2>
            <Link to="/services" className="btn btn-primary btn-lg">
              Work with us
            </Link>
          </div>

          <div className="footer-nav-columns">
            <nav className="footer-nav-column">
              <Link to="/services">Services</Link>
              <Link to="/about">About</Link>
              <Link to="/contact">Contact</Link>
            </nav>

            <nav className="footer-nav-column">
              <Link to="/privacy-policy">Privacy Policy</Link>
              <button onClick={resetCookieConsent} className="footer-link-button">
                Cookie Settings
              </button>
            </nav>
          </div>
        </div>

        <div className="footer-watermark" aria-hidden="true">
          clockwork
        </div>

        <div className="footer-bottom">
          <img src="/clockwork_logo.png" alt="Clockwork" className="footer-logo" />
          <p>All rights reserved®. {currentYear}</p>
        </div>
      </div>
    </footer>
  );
}
