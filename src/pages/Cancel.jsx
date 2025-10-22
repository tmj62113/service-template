import { useNavigate } from 'react-router-dom';

function Cancel() {
  const navigate = useNavigate();

  return (
    <div className="cancel-container">
      <div className="cancel-content">
        <div className="cancel-icon">
          <span className="material-symbols-outlined">cancel</span>
        </div>
        <h1>Payment Cancelled</h1>
        <p>Your payment was not processed.</p>
        <p className="cancel-message">
          No charges have been made. You can return to your cart to try again.
        </p>
        <div className="cancel-actions">
          <button onClick={() => navigate('/checkout')} className="btn btn-primary">
            Return to Checkout
          </button>
          <button onClick={() => navigate('/')} className="btn btn-secondary">
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cancel;
