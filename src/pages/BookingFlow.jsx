import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useBookingStore from '../stores/bookingStore';
import {
  formatDate,
  formatDuration,
  formatPrice,
  formatTimeSlot,
  getDateLabel,
  calculateEndTime
} from '../utils/dateTimeUtils';
import '../styles/BookingFlow.css';

const WIZARD_STEPS = [
  { id: 1, title: 'Service', description: 'Choose what you need' },
  { id: 2, title: 'Team', description: 'Select a provider' },
  { id: 3, title: 'Date', description: 'Pick a placeholder date' },
  { id: 4, title: 'Time', description: 'Select a placeholder time' },
  { id: 5, title: 'Details', description: 'Review the summary' }
];

function BookingProgress({ steps, currentStep, isStepComplete }) {
  return (
    <div className="wizard-progress" data-testid="booking-progress">
      {steps.map((step) => {
        const isCompleted = step.id < currentStep;
        const isActive = step.id === currentStep;
        const isReady = !isActive && !isCompleted && isStepComplete(step.id);

        const className = [
          'progress-step',
          isCompleted ? 'completed' : '',
          isActive ? 'active' : '',
          isReady ? 'ready' : ''
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <div
            key={step.id}
            className={className}
            aria-current={isActive ? 'step' : undefined}
          >
            <div className="step-number">
              {isCompleted ? (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M13.485 1.929a1 1 0 010 1.414l-7.07 7.071a1 1 0 01-1.415 0L2.515 8.93a1 1 0 111.414-1.414l1.071 1.07 6.364-6.364a1 1 0 011.414 0z" />
                </svg>
              ) : (
                step.id
              )}
            </div>
            <div className="step-text">
              <span className="step-label">{step.title}</span>
              <span className="step-description">{step.description}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ServiceSelectionStep({ services, status, error, selectedService, onSelect, onRetry }) {
  if (status === 'loading') {
    return (
      <div className="wizard-card">
        <h2>Choose a service</h2>
        <p className="wizard-subtitle">Loading available services…</p>
        <div className="wizard-skeleton-grid" role="status" aria-live="polite">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="wizard-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="wizard-card">
        <h2>Choose a service</h2>
        <p className="wizard-subtitle error-text">{error || 'We could not load services right now.'}</p>
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  }

  if (!services.length) {
    return (
      <div className="wizard-card">
        <h2>Choose a service</h2>
        <p className="wizard-subtitle">No services are currently available for booking.</p>
      </div>
    );
  }

  return (
    <div className="wizard-card">
      <h2>Choose a service</h2>
      <p className="wizard-subtitle">Select the experience you would like to book.</p>
      <div className="wizard-grid">
        {services.map((service) => {
          const isSelected = selectedService?._id === service._id;

          return (
            <button
              type="button"
              key={service._id}
              className={`wizard-option ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(service)}
              aria-pressed={isSelected}
            >
              <div className="option-header">
                <span className="option-category">{service.category || 'Service'}</span>
                <span className="option-price">{formatPrice(service.price)}</span>
              </div>
              <h3>{service.name}</h3>
              <p className="option-description">{service.shortDescription || service.description}</p>
              <div className="option-footer">
                <span className="option-meta">{formatDuration(service.duration)}</span>
                {isSelected && <span className="option-selected">Selected</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StaffSelectionStep({
  status,
  error,
  staffMembers,
  selectedStaff,
  onSelect,
  onRetry,
  serviceSelected
}) {
  if (!serviceSelected) {
    return (
      <div className="wizard-card">
        <h2>Select a team member</h2>
        <p className="wizard-subtitle">Choose a service first to view available providers.</p>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="wizard-card">
        <h2>Select a team member</h2>
        <p className="wizard-subtitle">Checking team availability…</p>
        <div className="wizard-skeleton-grid" role="status" aria-live="polite">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="wizard-skeleton" />
          ))}
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="wizard-card">
        <h2>Select a team member</h2>
        <p className="wizard-subtitle error-text">{error || 'Unable to load staff for this service.'}</p>
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  }

  if (!staffMembers.length) {
    return (
      <div className="wizard-card">
        <h2>Select a team member</h2>
        <p className="wizard-subtitle">No team members are available for this service.</p>
      </div>
    );
  }

  return (
    <div className="wizard-card">
      <h2>Select a team member</h2>
      <p className="wizard-subtitle">We'll make sure they're available for your session.</p>
      <div className="wizard-grid">
        {staffMembers.map((member) => {
          const isSelected = selectedStaff === member._id;

          return (
            <button
              type="button"
              key={member._id}
              className={`wizard-option ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(member._id)}
              aria-pressed={isSelected}
            >
              <div className="option-header">
                <span className="option-category">{member.title || 'Team Member'}</span>
              </div>
              <h3>{member.name}</h3>
              <p className="option-description">{member.bio || 'Trusted professional ready to help you achieve your goals.'}</p>
              <div className="option-footer">
                <span className="option-meta">{member.specialty || 'General expertise'}</span>
                {isSelected && <span className="option-selected">Selected</span>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DateSelectionPlaceholder({ selectedDate, onSelect, placeholderDates }) {
  return (
    <div className="wizard-card">
      <h2>Choose a placeholder date</h2>
      <p className="wizard-subtitle">Our live calendar will appear in Part 2. For now, pick the date that fits best.</p>
      <div className="wizard-grid compact">
        {placeholderDates.map((entry) => {
          const isSelected = selectedDate && new Date(selectedDate).toDateString() === entry.date.toDateString();
          return (
            <button
              type="button"
              key={entry.id}
              className={`wizard-option ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(entry.date)}
              aria-pressed={isSelected}
            >
              <h3>{entry.label}</h3>
              <p className="option-description">{entry.formatted}</p>
              {isSelected && <span className="option-selected">Selected</span>}
            </button>
          );
        })}
      </div>
      <div className="placeholder-note">
        More availability options are coming soon with the full calendar integration.
      </div>
    </div>
  );
}

function TimeSelectionPlaceholder({ selectedTimeSlot, onSelect, placeholderSlots, serviceDuration }) {
  return (
    <div className="wizard-card">
      <h2>Pick a placeholder time</h2>
      <p className="wizard-subtitle">Select the time of day that works. We'll confirm exact slots in Part 2.</p>
      <div className="wizard-grid compact">
        {placeholderSlots.map((slot) => {
          const isSelected = selectedTimeSlot?.startTime === slot.startTime;
          return (
            <button
              type="button"
              key={slot.id}
              className={`wizard-option ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelect(slot)}
              aria-pressed={isSelected}
            >
              <h3>{formatTimeSlot(slot.startTime)}</h3>
              <p className="option-description">
                {formatTimeSlot(slot.endTime)} • {formatDuration(serviceDuration)} session
              </p>
              {isSelected && <span className="option-selected">Selected</span>}
            </button>
          );
        })}
      </div>
      <div className="placeholder-note">
        Exact availability will be confirmed once the live scheduling calendar is connected.
      </div>
    </div>
  );
}

function SummaryStep({ service, staff, selectedDate, selectedTimeSlot, timezone, onEditStep }) {
  if (!service || !selectedDate || !selectedTimeSlot) {
    return (
      <div className="wizard-card">
        <h2>Review your details</h2>
        <p className="wizard-subtitle">Complete the earlier steps to see a summary of your booking.</p>
      </div>
    );
  }

  return (
    <div className="wizard-card">
      <h2>Review your details</h2>
      <p className="wizard-subtitle">Confirm everything looks right before continuing to the review page.</p>

      <div className="summary-section">
        <div className="summary-header">
          <h3>Service</h3>
          <button type="button" className="link-button" onClick={() => onEditStep(1)}>
            Change
          </button>
        </div>
        <div className="summary-content">
          <h4>{service.name}</h4>
          <p>{formatDuration(service.duration)} • {formatPrice(service.price)}</p>
        </div>
      </div>

      <div className="summary-section">
        <div className="summary-header">
          <h3>Team member</h3>
          <button type="button" className="link-button" onClick={() => onEditStep(2)}>
            Change
          </button>
        </div>
        <div className="summary-content">
          <h4>{staff ? staff.name : 'Any available team member'}</h4>
          {staff?.title && <p>{staff.title}</p>}
        </div>
      </div>

      <div className="summary-section">
        <div className="summary-header">
          <h3>Date & Time</h3>
          <button type="button" className="link-button" onClick={() => onEditStep(3)}>
            Change
          </button>
        </div>
        <div className="summary-content">
          <h4>{formatDate(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}</h4>
          <p>{formatTimeSlot(selectedTimeSlot.startTime)} — {formatTimeSlot(selectedTimeSlot.endTime)} ({timezone})</p>
        </div>
      </div>

      <div className="summary-section notice">
        <p>We'll confirm the exact availability and send booking details in the next step.</p>
      </div>
    </div>
  );
}

function BookingFlow() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    services,
    servicesStatus,
    servicesError,
    setServices,
    setServicesStatus,
    setServicesError,
    staffMembers,
    staffStatus,
    staffError,
    setStaffMembers,
    setStaffStatus,
    setStaffError,
    selectedService,
    setSelectedService,
    selectedStaff,
    setSelectedStaff,
    selectedDate,
    setSelectedDate,
    selectedTimeSlot,
    setSelectedTimeSlot,
    timezone,
    currentStep,
    setCurrentStep,
    goToNextStep,
    goToPreviousStep,
    isStepComplete,
    canProceedToReview
  } = useBookingStore();

  const serviceIdFromQuery = searchParams.get('service');
  const staffIdFromQuery = searchParams.get('staff');

  const loadServices = useCallback(async () => {
    setServicesStatus('loading');
    setServicesError(null);

    try {
      const params = new URLSearchParams({ isActive: 'true', limit: '50' });
      const response = await fetch(`/api/services?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const data = await response.json();
      setServices(data.services || []);
      setServicesStatus('success');
    } catch (error) {
      console.error('Error loading services', error);
      setServices([]);
      setServicesStatus('error');
      setServicesError('Unable to load services at the moment.');
    }
  }, [setServices, setServicesError, setServicesStatus]);

  const loadStaff = useCallback(async () => {
    if (!selectedService) {
      setStaffMembers([]);
      setStaffStatus('idle');
      return;
    }

    setStaffStatus('loading');
    setStaffError(null);

    try {
      const params = new URLSearchParams({
        serviceId: selectedService._id,
        isActive: 'true',
        acceptingBookings: 'true'
      });

      const response = await fetch(`/api/staff?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch staff');
      }

      const data = await response.json();
      const staffList = Array.isArray(data) ? data : [];
      setStaffMembers(staffList);
      setStaffStatus('success');

      if (staffList.length === 1) {
        setSelectedStaff(staffList[0]._id);
      }
    } catch (error) {
      console.error('Error loading staff', error);
      setStaffMembers([]);
      setStaffStatus('error');
      setStaffError('Unable to load team members at the moment.');
    }
  }, [selectedService, setStaffError, setStaffMembers, setStaffStatus, setSelectedStaff]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  useEffect(() => {
    if (selectedService) {
      loadStaff();
    }
  }, [selectedService, loadStaff]);

  useEffect(() => {
    if (servicesStatus !== 'success' || !services.length || !serviceIdFromQuery) {
      return;
    }

    if (!selectedService || selectedService._id !== serviceIdFromQuery) {
      const match = services.find((service) => service._id === serviceIdFromQuery);
      if (match) {
        setSelectedService(match);
        setCurrentStep(2);
      }
    }
  }, [servicesStatus, services, serviceIdFromQuery, selectedService, setSelectedService, setCurrentStep]);

  useEffect(() => {
    if (
      staffStatus !== 'success' ||
      !staffMembers.length ||
      !staffIdFromQuery ||
      selectedStaff === staffIdFromQuery
    ) {
      return;
    }

    const match = staffMembers.find((member) => member._id === staffIdFromQuery);
    if (match) {
      setSelectedStaff(match._id);
      if (currentStep < 3) {
        setCurrentStep(3);
      }
    }
  }, [staffStatus, staffMembers, staffIdFromQuery, selectedStaff, setSelectedStaff, currentStep, setCurrentStep]);

  const placeholderDates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 5 }).map((_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() + index + 1);
      return {
        id: index,
        date,
        label: getDateLabel(date),
        formatted: formatDate(date, 'MMMM d, yyyy')
      };
    });
  }, []);

  const placeholderSlots = useMemo(() => {
    const baseTimes = ['09:00', '11:30', '14:00', '16:30'];
    const duration = selectedService?.duration || 60;
    return baseTimes.map((startTime, index) => ({
      id: index,
      startTime,
      endTime: calculateEndTime(startTime, duration)
    }));
  }, [selectedService]);

  const selectedStaffMember = staffMembers.find((member) => member._id === selectedStaff);

  const isLastStep = currentStep === 5;
  const primaryButtonDisabled = !isStepComplete(currentStep);

  const handlePrimaryAction = () => {
    if (primaryButtonDisabled) {
      return;
    }

    if (isLastStep) {
      if (canProceedToReview()) {
        navigate('/booking/review');
      }
      return;
    }

    goToNextStep();
  };

  const handleBackAction = () => {
    if (currentStep === 1) {
      navigate('/services');
      return;
    }

    goToPreviousStep();
  };

  const handleEditStep = (step) => {
    setCurrentStep(step);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <ServiceSelectionStep
            services={services}
            status={servicesStatus}
            error={servicesError}
            selectedService={selectedService}
            onSelect={setSelectedService}
            onRetry={loadServices}
          />
        );
      case 2:
        return (
          <StaffSelectionStep
            status={staffStatus}
            error={staffError}
            staffMembers={staffMembers}
            selectedStaff={selectedStaff}
            onSelect={setSelectedStaff}
            onRetry={loadStaff}
            serviceSelected={Boolean(selectedService)}
          />
        );
      case 3:
        return (
          <DateSelectionPlaceholder
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
            placeholderDates={placeholderDates}
          />
        );
      case 4:
        return (
          <TimeSelectionPlaceholder
            selectedTimeSlot={selectedTimeSlot}
            onSelect={setSelectedTimeSlot}
            placeholderSlots={placeholderSlots}
            serviceDuration={selectedService?.duration || 60}
          />
        );
      case 5:
      default:
        return (
          <SummaryStep
            service={selectedService}
            staff={selectedStaffMember}
            selectedDate={selectedDate}
            selectedTimeSlot={selectedTimeSlot}
            timezone={timezone}
            onEditStep={handleEditStep}
          />
        );
    }
  };

  return (
    <div className="booking-flow section-container--wide">
      <div className="wizard-container">
        <div className="wizard-header">
          <button type="button" className="back-button" onClick={handleBackAction}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M15 8a.75.75 0 01-.75.75H3.56l3.22 3.22a.75.75 0 11-1.06 1.06l-4.5-4.5a.75.75 0 010-1.06l4.5-4.5a.75.75 0 011.06 1.06L3.56 7.25h10.69A.75.75 0 0115 8z"
              />
            </svg>
            {currentStep === 1 ? 'Back to services' : 'Previous step'}
          </button>
          <div className="wizard-title">
            <h1>Book your appointment</h1>
            <p>Follow the guided steps to reserve time with our team.</p>
          </div>
          {selectedService && (
            <div className="wizard-selection">
              <div>
                <span className="selection-label">Selected service</span>
                <p className="selection-value">{selectedService.name}</p>
              </div>
              <div>
                <span className="selection-label">Duration</span>
                <p className="selection-value">{formatDuration(selectedService.duration)}</p>
              </div>
              <div>
                <span className="selection-label">Price</span>
                <p className="selection-value">{formatPrice(selectedService.price)}</p>
              </div>
            </div>
          )}
        </div>

        <BookingProgress steps={WIZARD_STEPS} currentStep={currentStep} isStepComplete={isStepComplete} />

        <div className="wizard-step" data-testid={`booking-step-${currentStep}`}>
          {renderStep()}
        </div>

        <div className="wizard-actions">
          <button type="button" className="btn btn-secondary" onClick={handleBackAction}>
            Back
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handlePrimaryAction}
            disabled={primaryButtonDisabled}
          >
            {isLastStep ? 'Continue to review' : 'Next step'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default BookingFlow;
