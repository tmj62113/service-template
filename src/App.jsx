import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import ParadeOfHearts from './pages/ParadeOfHearts';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
// Service booking pages
import Services from './pages/Services';
import ServiceDetail from './pages/ServiceDetail';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import Login from './pages/Login';
import AdminOverview from './pages/AdminOverview';
import AdminProducts from './pages/AdminProducts';
import AdminMessages from './pages/AdminMessages';
import AdminOrders from './pages/AdminOrders';
import AdminCustomers from './pages/AdminCustomers';
import AdminSettings from './pages/AdminSettings';
import AdminSearch from './pages/AdminSearch';
import AdminNewsletter from './pages/AdminNewsletter';
import AdminNewsletterCreate from './pages/AdminNewsletterCreate';
import AdminNewsletterDrafts from './pages/AdminNewsletterDrafts';
import AdminNewsletterSent from './pages/AdminNewsletterSent';
import AdminSecurity from './pages/AdminSecurity';
import AdminIPBlocking from './pages/AdminIPBlocking';
import AdminAuditLogs from './pages/AdminAuditLogs';
import Unsubscribe from './pages/Unsubscribe';
import OrderDetail from './pages/OrderDetail';
import CustomerDetail from './pages/CustomerDetail';
import TestUtilities from './pages/TestUtilities';
import StyleGuide from './pages/StyleGuide';
import PrivacyPolicy from './pages/PrivacyPolicy';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import ToastContainer from './components/toast/ToastContainer';
import CookieConsent from './components/CookieConsent';
import SkipToContent from './components/SkipToContent';
import { getCSSVariables } from './config/theme';
import { initializeAnalytics, trackPageView } from './utils/analytics';

// Component to track page views on route changes
function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return null;
}

function App() {
  // Apply theme CSS variables
  const themeStyles = getCSSVariables();

  // Initialize analytics on mount
  useEffect(() => {
    initializeAnalytics();
  }, []);

  return (
    <BrowserRouter>
      <AnalyticsTracker />
      <AuthProvider>
        <Routes>
          {/* Public routes with main site layout */}
          <Route
            path="/*"
            element={
              <div style={themeStyles} className="app-container">
                <SkipToContent />
                <Header />
                <main id="main-content" role="main">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/parade-of-hearts" element={<ParadeOfHearts />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/services/:id" element={<ServiceDetail />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/success" element={<Success />} />
                    <Route path="/cancel" element={<Cancel />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/unsubscribe" element={<Unsubscribe />} />
                    <Route path="/test-utilities" element={<TestUtilities />} />
                    <Route path="/style-guide" element={<StyleGuide />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    {/* Catch-all route for 404 - must be last */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
                <ToastContainer />
                <CookieConsent />
              </div>
            }
          />

          {/* Admin routes with admin layout */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminOverview />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="customers" element={<AdminCustomers />} />
            <Route path="customers/:email/:name" element={<CustomerDetail />} />
            <Route path="newsletter" element={<AdminNewsletter />} />
            <Route path="newsletter/create" element={<AdminNewsletterCreate />} />
            <Route path="newsletter/drafts" element={<AdminNewsletterDrafts />} />
            <Route path="newsletter/sent" element={<AdminNewsletterSent />} />
            <Route path="security" element={<AdminSecurity />} />
            <Route path="security/ip-blocking" element={<AdminIPBlocking />} />
            <Route path="security/audit-logs" element={<AdminAuditLogs />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="search" element={<AdminSearch />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;