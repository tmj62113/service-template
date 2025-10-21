import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useBookingStore from '../stores/bookingStore';
import DateSelector from '../components/booking/DateSelector';
import TimeSlotGrid from '../components/booking/TimeSlotGrid';
import { formatDuration, formatPrice } from '../utils/dateTimeUtils';
import './BookingFlow.css';

/**
 * BookingFlow page - Main booking experience
 * Step 1: Select date
 * Step 2: Select time slot
 * Step 3: Review and payment (separate page)
 */
function BookingFlow() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Local state for UI
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState(null);
  const [service, setService] = useState(null);
  const [staff, setStaff] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Booking store
  const {
    selectedDate,
    selectedTimeSlot,
    setSelectedService,
    setSelectedStaff,
    setSelectedDate,
    setSelectedTimeSlot,
    setAvailableSlots: setStoreSlots,
    canProceedToReview
  } = useBookingStore();

  // Get service and staff IDs from URL
  const serviceId = searchParams.get('service');
  const staffId = searchParams.get('staff');

  // Fetch service and staff details on mount
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!serviceId) {
          setError('No service selected. Please select a service first.');
          setLoading(false);
          return;
        }

        // Fetch service details
        const serviceResponse = await fetch(`/api/services/${serviceId}`);
        if (!serviceResponse.ok) {
          throw new Error('Failed to fetch service details');
        }
        const serviceData = await serviceResponse.json();
        setService(serviceData);
        setSelectedService(serviceData);

        // Fetch staff details if provided
        if (staffId) {
          const staffResponse = await fetch(`/api/staff/${staffId}`);
          if (!staffResponse.ok) {
            throw new Error('Failed to fetch staff details');
          }
          const staffData = await staffResponse.json();
          setStaff(staffData);
          setSelectedStaff(staffId);
        } else if (serviceData.staffIds && serviceData.staffIds.length > 0) {
          // Use first available staff member
          setSelectedStaff(serviceData.staffIds[0]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching booking details:', err);
        setError('Failed to load booking information. Please try again.');
        setLoading(false);
      }
    };

    fetchDetails();
  }, [serviceId, staffId, setSelectedService, setSelectedStaff]);

  // Fetch available slots when date changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedDate || !service) return;

      try {
        setLoadingSlots(true);

        // Determine which staff to check availability for
        const checkStaffId = staffId || (service.staffIds && service.staffIds.length > 0 ? service.staffIds[0] : null);

        if (!checkStaffId) {
          setError('No staff available for this service.');
          setLoadingSlots(false);
          return;
        }

        // Format date as YYYY-MM-DD
        const dateString = selectedDate.toISOString().split('T')[0];

        // Fetch available slots from API
        const params = new URLSearchParams({
          staffId: checkStaffId,
          date: dateString,
          duration: service.duration.toString()
        });

        const response = await fetch(`/api/availability/slots?${params}`);
        if (!response.ok) {
          throw new Error('Failed to fetch available slots');
        }

        const data = await response.json();
        setAvailableSlots(data.slots || []);
        setStoreSlots(data.slots || []);
        setLoadingSlots(false);
      } catch (err) {
        console.error('Error fetching slots:', err);
        setError('Failed to load available time slots. Please try again.');
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate, service, staffId, setStoreSlots]);

  // Handle date selection
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTimeSlot(null); // Reset time slot when date changes
  };

  // Handle time slot selection
  const handleSlotSelect = (slot) => {
    setSelectedTimeSlot(slot);
  };

  // Handle continue to review
  const handleContinue = () => {
    if (canProceedToReview()) {
      navigate('/booking/review');
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (serviceId) {
      navigate(`/services/${serviceId}`);
    } else {
      navigate('/services');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="booking-flow">
        <div className="booking-loading">
          <div className="spinner"></div>
          <p>Loading booking information...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !service) {
    return (
      <div className="booking-flow">
        <div className="booking-error">
          <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 15A7 7 0 118 1a7 7 0 010 14zm0 1A8 8 0 108 0a8 8 0 000 16z"/>
            <path d="M7.002 11a1 1 0 112 0 1 1 0 01-2 0zM7.1 4.995a.905.905 0 111.8 0l-.35 3.507a.552.552 0 01-1.1 0L7.1 4.995z"/>
          </svg>
          <h2>Booking Not Available</h2>
          <p>{error}</p>
          <button className="btn btn--primary" onClick={handleBack}>
            Back to Services
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-flow">
      <div className="booking-container">
        {/* Header with service info */}
        <div className="booking-header">
          <button className="back-button" onClick={handleBack}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M15 8a.5.5 0 00-.5-.5H2.707l3.147-3.146a.5.5 0 10-.708-.708l-4 4a.5.5 0 000 .708l4 4a.5.5 0 00.708-.708L2.707 8.5H14.5A.5.5 0 0015 8z"/>
            </svg>
            Back
          </button>

          <div className="booking-service-summary">
            <h1>Book Your Appointment</h1>
            <div className="service-info">
              <h2>{service?.name}</h2>
              <div className="service-meta">
                <span className="meta-item">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 3.5a.5.5 0 01.5.5v4.21l2.65 1.53a.5.5 0 01-.5.87L7.85 8.85A.5.5 0 017.5 8.5V4a.5.5 0 01.5-.5z"/>
                    <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13z"/>
                  </svg>
                  {formatDuration(service?.duration)}
                </span>
                <span className="meta-item">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M4 10.781c.148 1.667 1.513 2.85 3.591 3.003V15h1.043v-1.216c2.27-.179 3.678-1.438 3.678-3.3 0-1.59-.947-2.51-2.956-3.028l-.722-.187V3.467c1.122.11 1.879.714 2.07 1.616h1.47c-.166-1.6-1.54-2.748-3.54-2.875V1H7.591v1.233c-1.939.23-3.27 1.472-3.27 3.156 0 1.454.966 2.483 2.661 2.917l.61.162v4.031c-1.149-.17-1.94-.8-2.131-1.718H4zm3.391-3.836c-1.043-.263-1.6-.825-1.6-1.616 0-.944.704-1.641 1.8-1.828v3.495l-.2-.05zm1.591 1.872c1.287.323 1.852.859 1.852 1.769 0 1.097-.826 1.828-2.2 1.939V8.73l.348.086z"/>
                  </svg>
                  {formatPrice(service?.price)}
                </span>
              </div>
              {staff && (
                <div className="staff-info">
                  <span className="staff-label">With:</span>
                  <span className="staff-name">{staff.name}</span>
                  {staff.title && <span className="staff-title">• {staff.title}</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="booking-progress">
          <div className="progress-step active">
            <div className="step-number">1</div>
            <span>Select Date</span>
          </div>
          <div className={`progress-step ${selectedDate ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <span>Select Time</span>
          </div>
          <div className={`progress-step ${selectedTimeSlot ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span>Review & Pay</span>
          </div>
        </div>

        {/* Booking steps */}
        <div className="booking-steps">
          {/* Step 1: Date Selection */}
          <div className="booking-step">
            <DateSelector
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
              maxAdvanceBooking={service?.maxAdvanceBooking || 60}
            />
          </div>

          {/* Step 2: Time Slot Selection */}
          {selectedDate && (
            <div className="booking-step">
              <TimeSlotGrid
                slots={availableSlots}
                selectedSlot={selectedTimeSlot}
                onSlotSelect={handleSlotSelect}
                loading={loadingSlots}
              />
            </div>
          )}

          {/* Error message */}
          {error && service && (
            <div className="booking-error-message">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 15A7 7 0 118 1a7 7 0 010 14zm0 1A8 8 0 108 0a8 8 0 000 16z"/>
                <path d="M7.002 11a1 1 0 112 0 1 1 0 01-2 0zM7.1 4.995a.905.905 0 111.8 0l-.35 3.507a.552.552 0 01-1.1 0L7.1 4.995z"/>
              </svg>
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Continue button */}
        {selectedTimeSlot && (
          <div className="booking-actions">
            <button
              className="btn btn--primary btn--lg"
              onClick={handleContinue}
              disabled={!canProceedToReview()}
            >
              Continue to Review
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path fillRule="evenodd" d="M1 8a.5.5 0 01.5-.5h11.793l-3.147-3.146a.5.5 0 01.708-.708l4 4a.5.5 0 010 .708l-4 4a.5.5 0 01-.708-.708L13.293 8.5H1.5A.5.5 0 011 8z"/>
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingFlow;
