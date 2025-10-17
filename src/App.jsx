import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
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
import Unsubscribe from './pages/Unsubscribe';
import OrderDetail from './pages/OrderDetail';
import CustomerDetail from './pages/CustomerDetail';
import TestUtilities from './pages/TestUtilities';
import StyleGuide from './pages/StyleGuide';
import ProtectedRoute from './components/ProtectedRoute';
import ToastContainer from './components/toast/ToastContainer';
import { getCSSVariables } from './config/theme';

function App() {
  // Apply theme CSS variables
  const themeStyles = getCSSVariables();

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes with main site layout */}
          <Route
            path="/*"
            element={
              <div style={themeStyles} className="app-container">
                <Header />
                <main>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/success" element={<Success />} />
                    <Route path="/cancel" element={<Cancel />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/unsubscribe" element={<Unsubscribe />} />
                    <Route path="/test-utilities" element={<TestUtilities />} />
                    <Route path="/style-guide" element={<StyleGuide />} />
                  </Routes>
                </main>
                <Footer />
                <ToastContainer />
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
            <Route path="settings" element={<AdminSettings />} />
            <Route path="search" element={<AdminSearch />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;