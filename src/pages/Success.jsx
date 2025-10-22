import { useNavigate } from 'react-router-dom';

// Note: This page is deprecated for service booking.
// Use BookingConfirmation page instead for service bookings.
function Success() {
  const navigate = useNavigate();

  return (
    <div className="success-container" style={{ padding: '80px 20px', textAlign: 'center' }}>
      <h2>Success</h2>
      <p>Thank you! Your booking has been confirmed.</p>
      <button onClick={() => navigate('/services')} className="btn btn-primary">
        Browse Services
      </button>
    </div>
  );
}

export default Success;
