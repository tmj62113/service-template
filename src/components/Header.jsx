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
      <header className="header">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>MJ PETERSON ART</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav desktop-nav">
            <Link to="/products">Products</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" className="admin-nav-link">
                <span className="material-symbols-outlined">dashboard</span>
                Admin
              </Link>
            )}
          </nav>

          {/* Mobile/Desktop Actions */}
          <div className="header-actions">
            {isAuthenticated && (
              <div className="user-menu">
                <span className="user-name">{user?.name}</span>
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
              </div>
            )}
            <button
              className="cart-button"
              onClick={() => setIsCartOpen(true)}
            >
              <span className="material-symbols-outlined">shopping_cart</span>
              {itemCount > 0 && (
                <span className="cart-badge">{itemCount}</span>
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