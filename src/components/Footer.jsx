import { Link } from 'react-router-dom';
import { theme } from '../config/theme';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>{theme.brandName}</h3>
          <p>Your trusted source for quality products.</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <nav className="footer-nav">
            <Link to="/products">Products</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </nav>
        </div>

        <div className="footer-section">
          <h4>Admin</h4>
          <nav className="footer-nav">
            <Link to="/admin">Admin Dashboard</Link>
          </nav>
        </div>

        <div className="footer-section">
          <h4>Connect</h4>
          <p>Stay updated with our latest products and offers.</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {currentYear} {theme.brandName}. All rights reserved.</p>
      </div>
    </footer>
  );
}
