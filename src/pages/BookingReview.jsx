import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useBookingStore from '../stores/bookingStore';
import BookingSummary from '../components/booking/BookingSummary';
import '../styles/BookingReview.css';

/**
 * BookingReview page - Review booking details before payment
 * Collects client information and validates before proceeding to payment
 */
function BookingReview() {
  const navigate = useNavigate();

  // Local state
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState(null);
  const [staff, setStaff] = useState(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState(null);

  // Booking store
  const {
    selectedService,
    selectedStaff,
    selectedDate,
    selectedTimeSlot,
    clientInfo,
    setClientInfo,
    canProceedToPayment,
    getBookingData
  } = useBookingStore();

  // Validate booking data exists
  useEffect(() => {
    const validateBooking = async () => {
      try {
        setLoading(true);

        // Check if we have required booking data
        if (!selectedService || !selectedDate || !selectedTimeSlot) {
          setError('Booking information is incomplete. Please start over.');
          setLoading(false);
          return;
        }

        setService(selectedService);

        // Fetch staff details if selected
        if (selectedStaff) {
          const response = await fetch(`/api/staff/${selectedStaff}`);
          if (response.ok) {
            const staffData = await response.json();
            setStaff(staffData);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading booking review:', err);
        setError('Failed to load booking information.');
        setLoading(false);
      }
    };

    validateBooking();
  }, [selectedService, selectedStaff, selectedDate, selectedTimeSlot]);

  // Handle client info changes
  const handleClientInfoChange = (newClientInfo) => {
    setClientInfo(newClientInfo);
  };

  // Handle terms checkbox
  const handleTermsChange = (checked) => {
    setAgreedToTerms(checked);
  };

  // Handle edit - go back to booking flow
  const handleEdit = () => {
    navigate('/book' + window.location.search);
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/book' + window.location.search);
  };

  // Validate form completion
  const isFormValid = () => {
    return (
      clientInfo.name.trim() !== '' &&
      clientInfo.email.trim() !== '' &&
      clientInfo.phone.trim() !== '' &&
      agreedToTerms
    );
  };

  // Handle proceed to payment
  const handleProceedToPayment = async () => {
    if (!isFormValid()) {
      alert('Please fill in all required fields and agree to the terms.');
      return;
    }

    if (!canProceedToPayment()) {
      alert('Booking information is incomplete.');
      return;
    }

    try {
      setLoading(true);

      // Get booking data from store
      const bookingData = getBookingData();

      if (!bookingData) {
        throw new Error('Invalid booking data');
      }

      // Fetch CSRF token
      const csrfResponse = await fetch('/api/csrf-token', {
        credentials: 'include', // Include cookies for CSRF
      });
      const { csrfToken } = await csrfResponse.json();

      // Create Stripe checkout session
      const response = await fetch('/api/create-booking-checkout', {
        method: 'POST',
        credentials: 'include', // Include cookies for CSRF validation
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err) {
      console.error('Error creating checkout session:', err);
      alert('Failed to proceed to payment. Please try again.');
      setLoading(false);
    }
  };

  // Loading state
  if (loading && !service) {
    return (
      <div className="booking-review section-container--narrow">
        <div className="review-loading">
          <div className="spinner"></div>
          <p>Loading booking details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="booking-review section-container--narrow">
        <div className="review-error">
          <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 15A7 7 0 118 1a7 7 0 010 14zm0 1A8 8 0 108 0a8 8 0 000 16z"/>
            <path d="M7.002 11a1 1 0 112 0 1 1 0 01-2 0zM7.1 4.995a.905.905 0 111.8 0l-.35 3.507a.552.552 0 01-1.1 0L7.1 4.995z"/>
          </svg>
          <h2>Booking Not Available</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => navigate('/services')}>
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-review section-container--narrow">
      {/* Header */}
      <div className="review-header">
          <button className="back-button" onClick={handleBack}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M15 8a.5.5 0 00-.5-.5H2.707l3.147-3.146a.5.5 0 10-.708-.708l-4 4a.5.5 0 000 .708l4 4a.5.5 0 00.708-.708L2.707 8.5H14.5A.5.5 0 0015 8z"/>
            </svg>
            Back
          </button>
        </div>

        {/* Progress indicator */}
        <div className="booking-progress">
          <div className="progress-step completed">
            <div className="step-number">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.854 3.646a.5.5 0 010 .708l-7 7a.5.5 0 01-.708 0l-3.5-3.5a.5.5 0 11.708-.708L6.5 10.293l6.646-6.647a.5.5 0 01.708 0z"/>
              </svg>
            </div>
            <span>Select Date</span>
          </div>
          <div className="progress-step completed">
            <div className="step-number">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M13.854 3.646a.5.5 0 010 .708l-7 7a.5.5 0 01-.708 0l-3.5-3.5a.5.5 0 11.708-.708L6.5 10.293l6.646-6.647a.5.5 0 01.708 0z"/>
              </svg>
            </div>
            <span>Select Time</span>
          </div>
          <div className="progress-step active">
            <div className="step-number">3</div>
            <span>Review & Pay</span>
          </div>
        </div>

        {/* Summary */}
        <BookingSummary
          service={service}
          staff={staff}
          selectedDate={selectedDate}
          selectedTimeSlot={selectedTimeSlot}
          clientInfo={clientInfo}
          onClientInfoChange={handleClientInfoChange}
          agreedToTerms={agreedToTerms}
          onTermsChange={handleTermsChange}
          onEdit={handleEdit}
        />

        {/* Actions */}
        <div className="review-actions">
          <button
            className="btn btn-primary btn-lg"
            onClick={handleProceedToPayment}
            disabled={!isFormValid() || loading}
          >
            {loading ? (
              <>
                <div className="button-spinner"></div>
                Processing...
              </>
            ) : (
              <>
                Proceed to Payment
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" d="M1 8a.5.5 0 01.5-.5h11.793l-3.147-3.146a.5.5 0 01.708-.708l4 4a.5.5 0 010 .708l-4 4a.5.5 0 01-.708-.708L13.293 8.5H1.5A.5.5 0 011 8z"/>
                </svg>
              </>
            )}
          </button>
          <p className="secure-payment-note">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M5.338 1.59a61.44 61.44 0 00-2.837.856.481.481 0 00-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.725 10.725 0 002.287 2.233c.346.244.652.42.893.533.12.057.218.095.293.118a.55.55 0 00.101.025.615.615 0 00.1-.025c.076-.023.174-.061.294-.118.24-.113.547-.29.893-.533a10.726 10.726 0 002.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 00-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524zM5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 011.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.775 11.775 0 01-2.517 2.453 7.159 7.159 0 01-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7.158 7.158 0 01-1.048-.625 11.777 11.777 0 01-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 012.185 1.43 62.456 62.456 0 015.072.56z"/>
              <path d="M10.854 5.146a.5.5 0 010 .708l-3 3a.5.5 0 01-.708 0l-1.5-1.5a.5.5 0 11.708-.708L7.5 7.793l2.646-2.647a.5.5 0 01.708 0z"/>
            </svg>
            Secure payment processed by Stripe
          </p>
        </div>
    </div>
  );
}

export default BookingReview;
