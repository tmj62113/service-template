import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { formatDate, formatTimeSlot, formatDuration, formatPrice, generateICalContent, downloadICalFile } from '../utils/dateTimeUtils';
import useBookingStore from '../stores/bookingStore';
import '../styles/BookingConfirmation.css';

/**
 * BookingConfirmation page - Success page after booking payment
 * Displays confirmation and booking details
 */
function BookingConfirmation() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [service, setService] = useState(null);
  const [staff, setStaff] = useState(null);
  const [error, setError] = useState(null);

  const { resetBooking } = useBookingStore();

  useEffect(() => {
    // Reset booking store on mount
    resetBooking();

    const fetchBookingDetails = async () => {
      if (!sessionId) {
        setError('No booking session found.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch booking by session ID
        const response = await fetch(`/api/bookings/session/${sessionId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch booking details');
        }

        const bookingData = await response.json();
        setBooking(bookingData);

        // Fetch service details
        if (bookingData.serviceId) {
          const serviceResponse = await fetch(`/api/services/${bookingData.serviceId}`);
          if (serviceResponse.ok) {
            const serviceData = await serviceResponse.json();
            setService(serviceData);
          }
        }

        // Fetch staff details
        if (bookingData.staffId) {
          const staffResponse = await fetch(`/api/staff/${bookingData.staffId}`);
          if (staffResponse.ok) {
            const staffData = await staffResponse.json();
            setStaff(staffData);
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching booking:', err);
        setError('Failed to load booking confirmation. Please check your email for details.');
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [sessionId, resetBooking]);

  // Handle add to calendar
  const handleAddToCalendar = () => {
    if (!booking || !service) return;

    const iCalContent = generateICalContent({
      id: booking._id,
      serviceName: service.name,
      startDateTime: booking.startDateTime,
      endDateTime: booking.endDateTime,
      location: 'Online', // TODO: Get from service or booking
      description: service.description || ''
    });

    downloadICalFile(iCalContent, `booking-${booking._id}.ics`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="booking-confirmation">
        <div className="confirmation-loading">
          <div className="spinner"></div>
          <p>Loading confirmation details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !booking) {
    return (
      <div className="booking-confirmation">
        <div className="confirmation-error">
          <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 15A7 7 0 118 1a7 7 0 010 14zm0 1A8 8 0 108 0a8 8 0 000 16z"/>
            <path d="M7.002 11a1 1 0 112 0 1 1 0 01-2 0zM7.1 4.995a.905.905 0 111.8 0l-.35 3.507a.552.552 0 01-1.1 0L7.1 4.995z"/>
          </svg>
          <h2>Confirmation Not Available</h2>
          <p>{error || 'Booking details not found.'}</p>
          <p className="error-hint">
            Don't worry! You should receive a confirmation email shortly.
          </p>
          <Link to="/services" className="btn btn--primary">
            Back to Services
          </Link>
        </div>
      </div>
    );
  }

  const startDate = new Date(booking.startDateTime);
  const endDate = new Date(booking.endDateTime);

  return (
    <div className="booking-confirmation">
      <div className="confirmation-container">
        {/* Success Icon */}
        <div className="confirmation-success-icon">
          <svg width="64" height="64" viewBox="0 0 16 16" fill="currentColor">
            <path d="M16 8A8 8 0 110 8a8 8 0 0116 0zm-3.97-3.03a.75.75 0 00-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 00-1.06 1.06L6.97 11.03a.75.75 0 001.079-.02l3.992-4.99a.75.75 0 00-.01-1.05z"/>
          </svg>
        </div>

        {/* Success Message */}
        <div className="confirmation-header">
          <h1>Booking Confirmed!</h1>
          <p className="confirmation-subtitle">
            Your appointment has been successfully booked and payment confirmed.
          </p>
          <p className="confirmation-email-notice">
            A confirmation email has been sent to{' '}
            <strong>{booking.clientInfo.email}</strong>
          </p>
        </div>

        {/* Booking Details */}
        <div className="confirmation-details">
          <h2>Appointment Details</h2>

          {/* Service Info */}
          {service && (
            <div className="detail-card">
              <div className="detail-row">
                <div className="detail-icon">
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M2 2a2 2 0 012-2h8a2 2 0 012 2v13.5a.5.5 0 01-.777.416L8 13.101l-5.223 2.815A.5.5 0 012 15.5V2zm2-1a1 1 0 00-1 1v12.566l4.723-2.482a.5.5 0 01.554 0L13 14.566V2a1 1 0 00-1-1H4z"/>
                  </svg>
                </div>
                <div className="detail-content">
                  <div className="detail-label">Service</div>
                  <div className="detail-value">{service.name}</div>
                  {service.category && (
                    <span className="service-badge">{service.category}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Date & Time */}
          <div className="detail-card">
            <div className="detail-row">
              <div className="detail-icon">
                <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M11 6.5a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1z"/>
                  <path d="M3.5 0a.5.5 0 01.5.5V1h8V.5a.5.5 0 011 0V1h1a2 2 0 012 2v11a2 2 0 01-2 2H2a2 2 0 01-2-2V3a2 2 0 012-2h1V.5a.5.5 0 01.5-.5zM1 4v10a1 1 0 001 1h12a1 1 0 001-1V4H1z"/>
                </svg>
              </div>
              <div className="detail-content">
                <div className="detail-label">Date & Time</div>
                <div className="detail-value">{formatDate(startDate, 'EEEE, MMMM d, yyyy')}</div>
                <div className="detail-value">
                  {formatTimeSlot(startDate.toTimeString().substring(0, 5))} -{' '}
                  {formatTimeSlot(endDate.toTimeString().substring(0, 5))}
                </div>
                <div className="detail-meta">
                  {formatDuration(booking.duration)} • {booking.timeZone}
                </div>
              </div>
            </div>
          </div>

          {/* Staff Info */}
          {staff && (
            <div className="detail-card">
              <div className="detail-row">
                <div className="detail-icon">
                  {staff.photo ? (
                    <img src={staff.photo} alt={staff.name} className="staff-photo" />
                  ) : (
                    <div className="staff-initial">
                      {staff.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="detail-content">
                  <div className="detail-label">With</div>
                  <div className="detail-value">{staff.name}</div>
                  {staff.title && <div className="detail-meta">{staff.title}</div>}
                </div>
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="detail-card">
            <div className="detail-row">
              <div className="detail-icon">
                <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718H4zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73l.348.086z"/>
                </svg>
              </div>
              <div className="detail-content">
                <div className="detail-label">Payment</div>
                <div className="detail-value">{formatPrice(booking.amount)}</div>
                <div className="detail-meta payment-status">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M13.854 3.646a.5.5 0 010 .708l-7 7a.5.5 0 01-.708 0l-3.5-3.5a.5.5 0 11.708-.708L6.5 10.293l6.646-6.647a.5.5 0 01.708 0z"/>
                  </svg>
                  Payment Confirmed
                </div>
              </div>
            </div>
          </div>

          {/* Confirmation Number */}
          <div className="confirmation-number">
            <span className="label">Confirmation Number:</span>
            <span className="value">{booking._id}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="confirmation-actions">
          <button className="btn btn--primary" onClick={handleAddToCalendar}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3.5 0a.5.5 0 01.5.5V1h8V.5a.5.5 0 011 0V1h1a2 2 0 012 2v11a2 2 0 01-2 2H2a2 2 0 01-2-2V3a2 2 0 012-2h1V.5a.5.5 0 01.5-.5zM1 4v10a1 1 0 001 1h12a1 1 0 001-1V4H1z"/>
            </svg>
            Add to Calendar
          </button>
          <Link to="/services" className="btn btn--secondary">
            Book Another Service
          </Link>
          <Link to="/" className="btn btn--outline">
            Return to Home
          </Link>
        </div>

        {/* Help Text */}
        <div className="confirmation-help">
          <h3>What's Next?</h3>
          <ul>
            <li>You'll receive a confirmation email with all the details</li>
            <li>A reminder will be sent 24 hours before your appointment</li>
            {booking.cancellationPolicy && (
              <li>
                You can cancel or reschedule up to{' '}
                {booking.cancellationPolicy.hoursBeforeStart} hours before your appointment
              </li>
            )}
            <li>If you have any questions, please contact us</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default BookingConfirmation;
