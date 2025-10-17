import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../stores/cartStore';
import { useToastStore } from '../../stores/toastStore';
import { theme } from '../../config/theme';

export default function Cart({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);
  const { items, removeItem, updateQuantity, getTotal, clearCart } =
    useCartStore();
  const { addToast } = useToastStore();

  // Focus management for modal
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousFocusRef.current = document.activeElement;

      // Focus the close button when modal opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    } else {
      // Return focus to previously focused element when modal closes
      previousFocusRef.current?.focus();
    }
  }, [isOpen]);

  // Trap focus within modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }

      // Trap focus within modal
      if (e.key === 'Tab') {
        const cartModal = document.querySelector('.cart-sidebar');
        if (!cartModal) return;

        const focusableElements = cartModal.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const formatPrice = (price) => {
    return `${theme.commerce.currencySymbol}${price.toFixed(2)}`;
  };

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('http://localhost:3001/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        addToast(error, 'error');
        setIsProcessing(false);
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      addToast('Failed to initiate checkout. Please try again.', 'error');
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="cart-overlay" onClick={onClose} aria-hidden="true"></div>
      <aside className="cart-sidebar" role="dialog" aria-label="Shopping cart" aria-modal="true">
        <div className="cart-header">
          <h2 id="cart-title">Shopping Cart</h2>
          <button
            ref={closeButtonRef}
            className="close-btn"
            onClick={onClose}
            aria-label="Close shopping cart"
          >
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>

        <div className="cart-content">
          {items.length === 0 ? (
            <div className="empty-cart">
              <p>Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {items.map((item) => (
                  <div key={item.id} className="cart-item">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cart-item-image"
                    />
                    <div className="cart-item-details">
                      <h3>{item.name}</h3>
                      <p className="cart-item-price">
                        {formatPrice(item.price)}
                      </p>

                      <div className="quantity-controls" role="group" aria-label={`Quantity for ${item.name}`}>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <span className="material-symbols-outlined" aria-hidden="true">remove</span>
                        </button>
                        <span aria-label={`Quantity: ${item.quantity}`}>{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <span className="material-symbols-outlined" aria-hidden="true">add</span>
                        </button>
                      </div>
                    </div>

                    <button
                      className="remove-btn"
                      onClick={() => removeItem(item.id)}
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">delete</span>
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="cart-footer">
                <div className="cart-total">
                  <span>Total:</span>
                  <span className="total-amount">
                    {formatPrice(getTotal())}
                  </span>
                </div>

                <button
                  className="checkout-btn"
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  aria-label="Proceed to checkout"
                >
                  {isProcessing ? 'Processing...' : 'Proceed to Checkout'}
                </button>
                <button className="clear-cart-btn" onClick={clearCart} aria-label="Clear all items from cart">
                  Clear Cart
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}