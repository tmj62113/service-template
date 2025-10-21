import { formatDate, formatTimeSlot, formatDuration, formatPrice } from '../../utils/dateTimeUtils';
import './BookingSummary.css';

/**
 * BookingSummary component displays a summary of the booking details
 * Shows service info, selected time, pricing, and collects client information
 */
function BookingSummary({
  service,
  staff,
  selectedDate,
  selectedTimeSlot,
  clientInfo,
  onClientInfoChange,
  agreedToTerms,
  onTermsChange,
  onEdit
}) {
  // Handle input changes
  const handleInputChange = (field, value) => {
    onClientInfoChange({
      ...clientInfo,
      [field]: value
    });
  };

  // Calculate end time
  const getEndTime = () => {
    if (!selectedTimeSlot || !service) return null;

    const [hours, minutes] = selectedTimeSlot.startTime.split(':');
    const startDate = new Date(selectedDate);
    startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + service.duration);

    return formatTimeSlot(endDate.toTimeString().substring(0, 5));
  };

  return (
    <div className="booking-summary">
      <h2 className="summary-title">Review Your Booking</h2>
      <p className="summary-subtitle">
        Please review your appointment details and provide your information
      </p>

      {/* Appointment Details */}
      <div className="summary-section">
        <div className="section-header">
          <h3>Appointment Details</h3>
          <button className="edit-button" onClick={() => onEdit('datetime')}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M12.146.146a.5.5 0 01.708 0l3 3a.5.5 0 010 .708l-10 10a.5.5 0 01-.168.11l-5 2a.5.5 0 01-.65-.65l2-5a.5.5 0 01.11-.168l10-10zM11.207 2.5L13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 01.5.5v.5h.5a.5.5 0 01.5.5v.5h.293l6.293-6.293zm-9.761 5.175l-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 015 12.5V12h-.5a.5.5 0 01-.5-.5V11h-.5a.5.5 0 01-.468-.325z"/>
            </svg>
            Edit
          </button>
        </div>

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
              <div className="detail-value">
                {formatDate(selectedDate, 'EEEE, MMMM d, yyyy')}
              </div>
              <div className="detail-value">
                {formatTimeSlot(selectedTimeSlot.startTime)} - {getEndTime()}
              </div>
            </div>
          </div>

          <div className="detail-row">
            <div className="detail-icon">
              <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 3.5a.5.5 0 01.5.5v4.21l2.65 1.53a.5.5 0 01-.5.87L7.85 8.85A.5.5 0 017.5 8.5V4a.5.5 0 01.5-.5z"/>
                <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13z"/>
              </svg>
            </div>
            <div className="detail-content">
              <div className="detail-label">Duration</div>
              <div className="detail-value">{formatDuration(service.duration)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Details */}
      <div className="summary-section">
        <div className="section-header">
          <h3>Service</h3>
        </div>

        <div className="service-card">
          {service.image && (
            <img
              src={service.image}
              alt={service.name}
              className="service-image"
            />
          )}
          <div className="service-details">
            <h4>{service.name}</h4>
            {service.category && (
              <span className="service-category">{service.category}</span>
            )}
            {service.description && (
              <p className="service-description">{service.description}</p>
            )}
          </div>
        </div>

        {staff && (
          <div className="staff-card">
            <div className="staff-avatar">
              {staff.photo ? (
                <img src={staff.photo} alt={staff.name} />
              ) : (
                <div className="staff-initial">
                  {staff.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="staff-details">
              <div className="staff-name">{staff.name}</div>
              {staff.title && <div className="staff-title">{staff.title}</div>}
            </div>
          </div>
        )}
      </div>

      {/* Client Information */}
      <div className="summary-section">
        <div className="section-header">
          <h3>Your Information</h3>
        </div>

        <form className="client-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              className="form-input"
              value={clientInfo.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={clientInfo.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="john@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Phone Number <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="phone"
              className="form-input"
              value={clientInfo.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="(555) 123-4567"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes" className="form-label">
              Additional Notes <span className="optional">(optional)</span>
            </label>
            <textarea
              id="notes"
              className="form-textarea"
              value={clientInfo.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Any special requests or information we should know..."
              rows="4"
            />
          </div>
        </form>
      </div>

      {/* Cancellation Policy */}
      {service.cancellationPolicy && (
        <div className="summary-section">
          <div className="policy-card">
            <div className="policy-icon">
              <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 15A7 7 0 118 1a7 7 0 010 14zm0 1A8 8 0 108 0a8 8 0 000 16z"/>
                <path d="M7.002 11a1 1 0 112 0 1 1 0 01-2 0zM7.1 4.995a.905.905 0 111.8 0l-.35 3.507a.552.552 0 01-1.1 0L7.1 4.995z"/>
              </svg>
            </div>
            <div className="policy-content">
              <h4>Cancellation Policy</h4>
              <p>
                Cancellations must be made at least {service.cancellationPolicy.hoursBeforeStart} hours
                before your appointment to receive a {service.cancellationPolicy.refundPercentage}% refund.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Terms and Conditions */}
      <div className="summary-section">
        <div className="terms-checkbox">
          <input
            type="checkbox"
            id="terms"
            checked={agreedToTerms}
            onChange={(e) => onTermsChange(e.target.checked)}
          />
          <label htmlFor="terms">
            I agree to the{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer">
              Terms and Conditions
            </a>{' '}
            and{' '}
            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>
          </label>
        </div>
      </div>

      {/* Price Summary */}
      <div className="price-summary">
        <div className="price-row">
          <span>Subtotal</span>
          <span>{formatPrice(service.price)}</span>
        </div>
        <div className="price-row total">
          <span>Total</span>
          <span>{formatPrice(service.price)}</span>
        </div>
      </div>
    </div>
  );
}

export default BookingSummary;
