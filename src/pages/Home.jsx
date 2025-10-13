import { Link } from 'react-router-dom';
import { theme } from '../config/theme';

export default function Home() {
  return (
    <div className="home-container">
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to {theme.brandName}</h1>
          <p className="hero-subtitle">
            Discover our curated collection of premium products
          </p>
          <Link to="/products" className="hero-cta">
            Shop Now
          </Link>
        </div>
      </section>

      <section className="features">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <span className="material-symbols-outlined">local_shipping</span>
            </div>
            <h3>Free Shipping</h3>
            <p>On orders over $100</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <span className="material-symbols-outlined">lock</span>
            </div>
            <h3>Secure Payment</h3>
            <p>100% secure transactions</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <span className="material-symbols-outlined">autorenew</span>
            </div>
            <h3>Easy Returns</h3>
            <p>30-day return policy</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <span className="material-symbols-outlined">support_agent</span>
            </div>
            <h3>24/7 Support</h3>
            <p>Dedicated customer service</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to get started?</h2>
        <p>Browse our collection and find your perfect product today</p>
        <Link to="/products" className="cta-button">
          View All Products
        </Link>
      </section>
    </div>
  );
}