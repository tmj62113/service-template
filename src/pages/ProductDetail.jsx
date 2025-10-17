import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { theme } from '../config/theme';
import SEO, { generateProductStructuredData, generateBreadcrumbStructuredData } from '../components/SEO';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:3001/api/products/${id}`);

        if (!response.ok) {
          throw new Error('Product not found');
        }

        const data = await response.json();
        setProduct(data);
      } catch (err) {
        console.error('Failed to load product:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="product-detail-container">
        <div className="loading">Loading product...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-container">
        <div className="product-not-found">
          <h2>Product not found</h2>
          <button onClick={() => navigate('/products')} className="btn-back">
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product);
  };

  const formatPrice = (price) => {
    return `${theme.commerce.currencySymbol}${price.toFixed(2)}`;
  };

  // Generate structured data for SEO
  const breadcrumbs = [
    { name: 'Home', url: `${window.location.origin}/` },
    { name: 'Shop', url: `${window.location.origin}/products` },
    { name: product.name, url: window.location.href }
  ];

  return (
    <div className="product-detail-container">
      <SEO
        title={product.name}
        description={product.description}
        type="product"
        image={product.image}
        keywords={[product.category, product.name, 'art print', 'artwork']}
        structuredData={[
          generateProductStructuredData(product),
          generateBreadcrumbStructuredData(breadcrumbs)
        ]}
      />
      <button onClick={() => navigate('/products')} className="btn-back-link">
        <span className="material-symbols-outlined">arrow_back</span> Back to Products
      </button>

      <div className="product-detail-layout">
        {/* Product Image */}
        <div className="product-detail-image-section">
          <div className="product-detail-image-container">
            <img
              src={product.image}
              alt={product.name}
              className="product-detail-image"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="product-detail-info-section">
          <div className="product-detail-header">
            <span className="product-detail-category">{product.category}</span>
            <h1 className="product-detail-name">{product.name}</h1>

            {theme.features.showRatings && (
              <div className="product-detail-rating">
                <span className="stars">
                  {[...Array(Math.floor(product.rating))].map((_, i) => (
                    <span key={`filled-${i}`} className="material-symbols-outlined">star</span>
                  ))}
                  {[...Array(5 - Math.floor(product.rating))].map((_, i) => (
                    <span key={`empty-${i}`} className="material-symbols-outlined star-outline">star</span>
                  ))}
                </span>
                <span className="rating-text">
                  {product.rating} ({product.reviews} reviews)
                </span>
              </div>
            )}

            <div className="product-detail-price">
              {formatPrice(product.price)}
            </div>
          </div>

          <div className="product-detail-description">
            <h3>Product Details</h3>
            <p>{product.description}</p>
          </div>

          {theme.features.showStock && (
            <div className="product-detail-stock">
              {product.stock > 0 ? (
                <span className={product.stock < 10 ? 'stock-low' : 'stock-available'}>
                  {product.stock < 10
                    ? `Only ${product.stock} left in stock`
                    : 'In Stock'}
                </span>
              ) : (
                <span className="stock-out">Out of Stock</span>
              )}
            </div>
          )}

          <div className="product-detail-actions">
            <button
              className="btn-add-to-cart-large"
              onClick={handleAddToCart}
              disabled={product.stock === 0}
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>

          {/* Additional Product Information */}
          <div className="product-detail-features">
            <h3>Features</h3>
            <ul>
              <li>High-quality construction</li>
              <li>Premium materials</li>
              <li>Satisfaction guaranteed</li>
              <li>Free shipping on orders over $100</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
