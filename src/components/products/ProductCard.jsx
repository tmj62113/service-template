import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';
import { theme } from '../../config/theme';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  const handleImageClick = () => {
    navigate(`/products/${product._id || product.id}`);
  };

  const formatPrice = (price) => {
    return `${theme.commerce.currencySymbol}${price.toFixed(2)}`;
  };

  return (
    <div className="product-card">
      <div className="product-image-container" onClick={handleImageClick}>
        <img src={product.image} alt={product.name} className="product-image" />
        {theme.features.showStock && product.stock > 0 && product.stock < 10 && (
          <span className="stock-badge">Only {product.stock} left</span>
        )}
      </div>

      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>

        {theme.features.showRatings && (
          <div className="product-rating">
            <span className="stars">
              {[...Array(Math.floor(product.rating))].map((_, i) => (
                <span key={i} className="material-symbols-outlined">star</span>
              ))}
            </span>
            <span className="rating-text">
              {product.rating} ({product.reviews})
            </span>
          </div>
        )}

        <p className="product-description">{product.description}</p>

        <div className="product-footer">
          <span className="product-price">{formatPrice(product.price)}</span>
          <button
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}