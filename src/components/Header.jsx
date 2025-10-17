import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../config/theme';
import Cart from './cart/Cart';
import MobileMenu from './MobileMenu';

export default function Header() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const items = useCartStore((state) => state.items);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <header className="header" role="banner">
        <div className="header-content">
          <Link to="/" className="logo" aria-label="Home page">
            <img src={theme.logo} alt={theme.logoAlt} />
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav desktop-nav" role="navigation" aria-label="Main navigation">
            <Link to="/products">Shop</Link>
            <a href="/#about">About</a>
            <a href="/#contact">Contact</a>
            {user?.role === 'admin' && (
              <Link to="/admin" className="admin-nav-link" aria-label="Admin dashboard">
                <span className="material-symbols-outlined" aria-hidden="true">dashboard</span>
                Admin
              </Link>
            )}
          </nav>

          {/* Mobile/Desktop Actions */}
          <div className="header-actions">
            {isAuthenticated && (
              <div className="user-menu">
                <span className="user-name">{user?.name}</span>
                <button onClick={handleLogout} className="logout-button" aria-label="Logout">
                  Logout
                </button>
              </div>
            )}
            <button
              className="cart-button"
              onClick={() => setIsCartOpen(true)}
              aria-label={`Shopping cart with ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
            >
              <span className="material-symbols-outlined" aria-hidden="true">shopping_cart</span>
              {itemCount > 0 && (
                <span className="cart-badge" aria-hidden="true">{itemCount}</span>
              )}
            </button>

            {/* Mobile Menu - only visible on mobile */}
            <MobileMenu />
          </div>
        </div>
      </header>

      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}