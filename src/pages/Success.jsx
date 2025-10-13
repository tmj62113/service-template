import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';

function Success() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCartStore();
  const [orderNumber, setOrderNumber] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (sessionId) {
        try {
          // Fetch order by session ID to get the order _id
          const response = await fetch(
            `http://localhost:3001/api/orders/session/${sessionId}`,
            {
              credentials: 'include',
            }
          );

          if (response.ok) {
            const data = await response.json();
            // Format order number like in admin: ORD-{last8chars}
            const formattedOrderNumber = `ORD-${data.order._id.slice(-8).toUpperCase()}`;
            setOrderNumber(formattedOrderNumber);
          }
        } catch (error) {
          console.error('Failed to fetch order details:', error);
        } finally {
          setLoading(false);
        }

        // Clear the cart after successful payment
        clearCart();
      } else {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [sessionId, clearCart]);

  return (
    <div className="success-container">
      <div className="success-content">
        <div className="success-icon">
          <span className="material-symbols-outlined">check_circle</span>
        </div>
        <h1>Payment Successful!</h1>
        <p>Thank you for your purchase.</p>
        <div className="success-message">
          {!loading && orderNumber && (
            <p className="session-id">Order Number: {orderNumber}</p>
          )}
          <p>A confirmation email will be sent to you shortly.</p>
        </div>
        <div className="success-actions">
          <button onClick={() => navigate('/')} className="btn-primary">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default Success;
