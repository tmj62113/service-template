import { useNavigate } from 'react-router-dom';

// Note: This page is deprecated for service booking.
// Use BookingReview page instead for service bookings.
function Checkout() {
  const navigate = useNavigate();

  return (
    <div className="checkout-container" style={{ padding: '80px 20px', textAlign: 'center' }}>
      <h2>Checkout</h2>
      <p>This page is no longer used for service bookings.</p>
      <button onClick={() => navigate('/services')} className="btn btn--primary">
        Browse Services
      </button>
    </div>
  );
}

export default Checkout;
