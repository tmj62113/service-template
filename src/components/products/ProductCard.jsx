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
    <article className="product-card" aria-label={`${product.name} product card`}>
      <button
        className="product-image-container"
        onClick={handleImageClick}
        aria-label={`View details for ${product.name}`}
      >
        <img src={product.image} alt={product.name} className="product-image" />
        {theme.features.showStock && product.stock > 0 && product.stock < 10 && (
          <span className="stock-badge" aria-label={`Only ${product.stock} items left in stock`}>
            Only {product.stock} left
          </span>
        )}
      </button>

      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <h3 className="product-name">{product.name}</h3>

        {theme.features.showRatings && (
          <div className="product-rating" aria-label={`Rated ${product.rating} out of 5 stars with ${product.reviews} reviews`}>
            <span className="stars" aria-hidden="true">
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
          <span className="product-price" aria-label={`Price: ${formatPrice(product.price)}`}>
            {formatPrice(product.price)}
          </span>
          <button
            className="add-to-cart-btn"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            aria-label={product.stock === 0 ? `${product.name} is out of stock` : `Add ${product.name} to cart`}
          >
            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </article>
  );
}