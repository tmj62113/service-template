import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { theme } from "../config/theme";
import { getApiUrl } from "../config/api";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [notificationCount, setNotificationCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState({
    newOrders: [],
    lowStock: [],
    soldOut: []
  });
  const [viewedNotifications, setViewedNotifications] = useState(() => {
    const saved = localStorage.getItem('viewedNotifications');
    return saved ? JSON.parse(saved) : { orders: [], products: [] };
  });

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(getApiUrl('/api/messages'), {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          const messagesArray = Array.isArray(data) ? data : (data.messages || []);
          const unread = messagesArray.filter(m => m.status === 'unread').length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    if (user?.role === 'admin') {
      fetchUnreadCount();

      // Listen for message status updates
      const handleMessageUpdate = () => {
        fetchUnreadCount();
      };
      window.addEventListener('messageStatusUpdated', handleMessageUpdate);

      // Poll for updates every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);

      return () => {
        clearInterval(interval);
        window.removeEventListener('messageStatusUpdated', handleMessageUpdate);
      };
    }
  }, [user]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          fetch(getApiUrl('/api/orders'), { credentials: 'include' }),
          fetch(getApiUrl('/api/products'), { credentials: 'include' })
        ]);

        if (ordersRes.ok && productsRes.ok) {
          const [ordersData, productsData] = await Promise.all([
            ordersRes.json(),
            productsRes.json()
          ]);

          // Get new/pending orders
          const newOrders = (ordersData.orders || []).filter(o =>
            o.orderStatus === 'pending' || o.orderStatus === 'processing'
          );

          // Get low stock (≤10) and sold out (0) inventory
          const lowStock = productsData.products.filter(p =>
            p.stock > 0 && p.stock <= 10
          );

          const soldOut = productsData.products.filter(p =>
            p.stock === 0
          );

          // Filter out viewed notifications
          const unseenOrders = newOrders.filter(o => !viewedNotifications.orders.includes(o._id));
          const unseenLowStock = lowStock.filter(p => !viewedNotifications.products.includes(p._id));
          const unseenSoldOut = soldOut.filter(p => !viewedNotifications.products.includes(p._id));

          setNotifications({ newOrders, lowStock, soldOut });
          setNotificationCount(unseenOrders.length + unseenLowStock.length + unseenSoldOut.length);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (user?.role === 'admin') {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 5000); // Poll every 5 seconds for faster updates
      return () => clearInterval(interval);
    }
  }, [user, viewedNotifications]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const markOrderAsViewed = (orderId) => {
    const updated = {
      ...viewedNotifications,
      orders: [...viewedNotifications.orders, orderId]
    };
    setViewedNotifications(updated);
    localStorage.setItem('viewedNotifications', JSON.stringify(updated));
  };

  const markProductAsViewed = (productId) => {
    const updated = {
      ...viewedNotifications,
      products: [...viewedNotifications.products, productId]
    };
    setViewedNotifications(updated);
    localStorage.setItem('viewedNotifications', JSON.stringify(updated));
  };

  return (
    <div className="admin-layout">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="mobile-menu-overlay"
          onClick={closeMobileMenu}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${isMobileMenuOpen ? "mobile-open" : ""}`}
      >
        <div className="sidebar-header">
          <div className="company-logo">
            <img src={theme.logo} alt={theme.brandName} />
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link
            to="/admin"
            className={`nav-item ${
              isActive("/admin") && location.pathname === "/admin"
                ? "active"
                : ""
            }`}
            onClick={closeMobileMenu}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Overview</span>
          </Link>

          <Link
            to="/admin/products"
            className={`nav-item ${
              isActive("/admin/products") ? "active" : ""
            }`}
            onClick={closeMobileMenu}
          >
            <span className="material-symbols-outlined">inventory_2</span>
            <span>Products</span>
          </Link>

          <Link
            to="/admin/orders"
            className={`nav-item ${isActive("/admin/orders") ? "active" : ""}`}
            onClick={closeMobileMenu}
          >
            <span className="material-symbols-outlined">description</span>
            <span>Orders</span>
          </Link>

          <Link
            to="/admin/customers"
            className={`nav-item ${
              isActive("/admin/customers") ? "active" : ""
            }`}
            onClick={closeMobileMenu}
          >
            <span className="material-symbols-outlined">people</span>
            <span>Customers</span>
          </Link>

          <Link
            to="/admin/messages"
            className={`nav-item ${
              isActive("/admin/messages") ? "active" : ""
            }`}
            onClick={closeMobileMenu}
          >
            <span className="material-symbols-outlined">chat</span>
            <span>Messages</span>
            {unreadCount > 0 && (
              <span className="nav-badge">{unreadCount}</span>
            )}
          </Link>

          <div className="nav-group">
            <Link
              to="/admin/security"
              className={`nav-item ${
                isActive("/admin/security") ? "active" : ""
              }`}
              onClick={closeMobileMenu}
            >
              <span className="material-symbols-outlined">shield</span>
              <span>Security</span>
            </Link>
            {isActive("/admin/security") && (
              <div className="nav-subitems">
                <Link
                  to="/admin/security"
                  className={`nav-subitem ${
                    location.pathname === "/admin/security" ? "active" : ""
                  }`}
                  onClick={closeMobileMenu}
                >
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/admin/security/ip-blocking"
                  className={`nav-subitem ${
                    location.pathname === "/admin/security/ip-blocking" ? "active" : ""
                  }`}
                  onClick={closeMobileMenu}
                >
                  <span>IP Blocking</span>
                </Link>
                <Link
                  to="/admin/security/audit-logs"
                  className={`nav-subitem ${
                    location.pathname === "/admin/security/audit-logs" ? "active" : ""
                  }`}
                  onClick={closeMobileMenu}
                >
                  <span>Audit Logs</span>
                </Link>
              </div>
            )}
          </div>

          <div className="nav-group">
            <Link
              to="/admin/newsletter"
              className={`nav-item ${
                isActive("/admin/newsletter") ? "active" : ""
              }`}
              onClick={closeMobileMenu}
            >
              <span className="material-symbols-outlined">mail</span>
              <span>Newsletter</span>
            </Link>
            {isActive("/admin/newsletter") && (
              <div className="nav-subitems">
                <Link
                  to="/admin/newsletter/create"
                  className={`nav-subitem ${
                    location.pathname === "/admin/newsletter/create" ? "active" : ""
                  }`}
                  onClick={closeMobileMenu}
                >
                  <span>Create Newsletter</span>
                </Link>
                <Link
                  to="/admin/newsletter/drafts"
                  className={`nav-subitem ${
                    location.pathname === "/admin/newsletter/drafts" ? "active" : ""
                  }`}
                  onClick={closeMobileMenu}
                >
                  <span>Drafts</span>
                </Link>
                <Link
                  to="/admin/newsletter/sent"
                  className={`nav-subitem ${
                    location.pathname === "/admin/newsletter/sent" ? "active" : ""
                  }`}
                  onClick={closeMobileMenu}
                >
                  <span>Sent Newsletters</span>
                </Link>
              </div>
            )}
          </div>
        </nav>

        <div className="sidebar-footer">
          <Link to="/" className="sidebar-link" target="_blank" rel="noopener noreferrer">
            <span className="material-symbols-outlined">storefront</span>
            View Store
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-header">
          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>

          <div className="header-left">
            <h1>Welcome back, {user?.name || "Admin"}</h1>
            <p className="header-subtitle">
              Here are today's stats from your online store!
            </p>
          </div>
          <div className="header-right">
            <div className="search-box">
              <span className="material-symbols-outlined">search</span>
              <input
                type="text"
                placeholder="Search"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchValue.trim()) {
                    navigate(`/admin/search?q=${encodeURIComponent(searchValue.trim())}`);
                  }
                }}
              />
            </div>
            <div className="notification-wrapper">
              <button
                className="notification-btn"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              >
                <span className="material-symbols-outlined">notifications</span>
                {notificationCount > 0 && (
                  <span className="notification-badge">{notificationCount}</span>
                )}
              </button>

              {isNotificationOpen && (() => {
                // Filter out viewed notifications
                const unseenOrders = notifications.newOrders.filter(o => !viewedNotifications.orders.includes(o._id));
                const unseenLowStock = notifications.lowStock.filter(p => !viewedNotifications.products.includes(p._id));
                const unseenSoldOut = notifications.soldOut.filter(p => !viewedNotifications.products.includes(p._id));

                return (
                  <div className="notification-dropdown">
                    <div className="notification-header">
                      <h3>Notifications</h3>
                      <span className="notification-count">{notificationCount}</span>
                    </div>

                    <div className="notification-list">
                      {notificationCount === 0 ? (
                        <div className="notification-empty">
                          <span className="material-symbols-outlined">notifications_off</span>
                          <p>No notifications</p>
                        </div>
                      ) : (
                        <>
                          {unseenOrders.length > 0 && (
                            <div className="notification-section">
                              <h4>New Orders ({unseenOrders.length})</h4>
                              {unseenOrders.slice(0, 3).map(order => (
                                <Link
                                  key={order._id}
                                  to={`/admin/orders/${order._id}`}
                                  className="notification-item"
                                  onClick={() => {
                                    markOrderAsViewed(order._id);
                                    setIsNotificationOpen(false);
                                  }}
                                >
                                  <span className="material-symbols-outlined">shopping_cart</span>
                                  <div className="notification-content">
                                    <p className="notification-title">Order #{order._id.slice(-8).toUpperCase()}</p>
                                    <p className="notification-subtitle">{order.customerEmail}</p>
                                  </div>
                                </Link>
                              ))}
                              {unseenOrders.length > 3 && (
                                <Link to="/admin/orders" className="view-all-link" onClick={() => setIsNotificationOpen(false)}>
                                  View all orders →
                                </Link>
                              )}
                            </div>
                          )}

                          {unseenLowStock.length > 0 && (
                            <div className="notification-section">
                              <h4>Low Stock ({unseenLowStock.length})</h4>
                              {unseenLowStock.slice(0, 3).map(product => (
                                <Link
                                  key={product._id}
                                  to={`/admin/products?productId=${product._id}`}
                                  className="notification-item"
                                  onClick={() => {
                                    markProductAsViewed(product._id);
                                    setIsNotificationOpen(false);
                                  }}
                                >
                                  <span className="material-symbols-outlined">warning</span>
                                  <div className="notification-content">
                                    <p className="notification-title">{product.name}</p>
                                    <p className="notification-subtitle">{product.stock} left in stock</p>
                                  </div>
                                </Link>
                              ))}
                              {unseenLowStock.length > 3 && (
                                <Link to="/admin/products" className="view-all-link" onClick={() => setIsNotificationOpen(false)}>
                                  View all products →
                                </Link>
                              )}
                            </div>
                          )}

                          {unseenSoldOut.length > 0 && (
                            <div className="notification-section">
                              <h4>Sold Out ({unseenSoldOut.length})</h4>
                              {unseenSoldOut.slice(0, 3).map(product => (
                                <Link
                                  key={product._id}
                                  to={`/admin/products?productId=${product._id}`}
                                  className="notification-item"
                                  onClick={() => {
                                    markProductAsViewed(product._id);
                                    setIsNotificationOpen(false);
                                  }}
                                >
                                  <span className="material-symbols-outlined">error</span>
                                  <div className="notification-content">
                                    <p className="notification-title">{product.name}</p>
                                    <p className="notification-subtitle">Out of stock</p>
                                  </div>
                                </Link>
                              ))}
                              {unseenSoldOut.length > 3 && (
                                <Link to="/admin/products" className="view-all-link" onClick={() => setIsNotificationOpen(false)}>
                                  View all products →
                                </Link>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="profile-wrapper">
              <div
                className="user-profile"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                    user?.name || "Admin"
                  )}&background=1a1a1a&color=fff`}
                  alt="User"
                />
                <span>{user?.name || "Admin"}</span>
                <span className="material-symbols-outlined">expand_more</span>
              </div>

              {isProfileOpen && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        user?.name || "Admin"
                      )}&background=1a1a1a&color=fff`}
                      alt="User"
                    />
                    <div>
                      <p className="profile-name">{user?.name || "Admin"}</p>
                      <p className="profile-email">{user?.email || ""}</p>
                    </div>
                  </div>
                  <div className="profile-dropdown-menu">
                    <Link
                      to="/admin/settings"
                      className="profile-menu-item"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <span className="material-symbols-outlined">settings</span>
                      <span>Settings</span>
                    </Link>
                    <button
                      className="profile-menu-item logout"
                      onClick={handleLogout}
                    >
                      <span className="material-symbols-outlined">logout</span>
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
