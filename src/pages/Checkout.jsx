import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { useToastStore } from '../stores/toastStore';

function Checkout() {
  const navigate = useNavigate();
  const { items, getTotal } = useCartStore();
  const { addToast } = useToastStore();

  const handleCheckout = async () => {
    try {
      // Call backend API to create Stripe Checkout Session
      const response = await fetch('/api/create-checkout-session', {
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
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      addToast('Failed to initiate checkout. Please try again.', 'error');
    }
  };

  if (items.length === 0) {
    return (
      <div className="checkout-container">
        <div className="checkout-empty">
          <h2>Your cart is empty</h2>
          <p>Add some items to your cart before checking out.</p>
          <button onClick={() => navigate('/')} className="btn-primary">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>

      <div className="checkout-summary">
        <h2>Order Summary</h2>
        <div className="checkout-items">
          {items.map((item) => (
            <div key={item.id} className="checkout-item">
              <div className="checkout-item-info">
                <h3>{item.name}</h3>
                <p className="checkout-item-quantity">Quantity: {item.quantity}</p>
              </div>
              <p className="checkout-item-price">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>

        <div className="checkout-total">
          <h3>Total</h3>
          <p className="checkout-total-amount">${getTotal().toFixed(2)}</p>
        </div>

        <button onClick={handleCheckout} className="btn-checkout">
          Proceed to Payment
        </button>

        <button onClick={() => navigate('/cart')} className="btn-secondary">
          Back to Cart
        </button>
      </div>
    </div>
  );
}

export default Checkout;
