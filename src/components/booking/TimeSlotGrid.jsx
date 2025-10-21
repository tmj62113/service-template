import { formatTimeSlot, groupSlotsByPeriod } from '../../utils/dateTimeUtils';
import './TimeSlotGrid.css';

/**
 * TimeSlotGrid component displays available time slots grouped by period
 * Shows Morning, Afternoon, and Evening slots
 */
function TimeSlotGrid({ slots, selectedSlot, onSlotSelect, loading }) {
  if (loading) {
    return (
      <div className="time-slot-grid">
        <h3 className="time-slot-title">Available Times</h3>
        <div className="time-slot-loading">
          <div className="spinner"></div>
          <p>Loading available time slots...</p>
        </div>
      </div>
    );
  }

  if (!slots || slots.length === 0) {
    return (
      <div className="time-slot-grid">
        <h3 className="time-slot-title">Available Times</h3>
        <div className="time-slot-empty">
          <svg width="48" height="48" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13z"/>
            <path d="M8 3.5a.5.5 0 01.5.5v4.21l2.65 1.53a.5.5 0 01-.5.87L7.85 8.85A.5.5 0 017.5 8.5V4a.5.5 0 01.5-.5z"/>
          </svg>
          <p>No available time slots for this date.</p>
          <p className="time-slot-empty-hint">Please try selecting a different date.</p>
        </div>
      </div>
    );
  }

  const groupedSlots = groupSlotsByPeriod(slots);

  const renderPeriod = (title, periodSlots, icon) => {
    if (periodSlots.length === 0) return null;

    return (
      <div className="time-slot-period">
        <h4 className="period-title">
          <span className="period-icon">{icon}</span>
          {title}
        </h4>
        <div className="time-slot-buttons">
          {periodSlots.map((slot, index) => {
            const isSelected =
              selectedSlot &&
              selectedSlot.startTime === slot.startTime &&
              selectedSlot.endTime === slot.endTime;

            return (
              <button
                key={`${slot.startTime}-${index}`}
                className={`time-slot-button ${isSelected ? 'selected' : ''}`}
                onClick={() => onSlotSelect(slot)}
              >
                <span className="slot-time">{formatTimeSlot(slot.startTime)}</span>
                {isSelected && (
                  <svg
                    className="slot-check"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                  >
                    <path d="M13.854 3.646a.5.5 0 010 .708l-7 7a.5.5 0 01-.708 0l-3.5-3.5a.5.5 0 11.708-.708L6.5 10.293l6.646-6.647a.5.5 0 01.708 0z"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="time-slot-grid">
      <h3 className="time-slot-title">Available Times</h3>
      <p className="time-slot-subtitle">
        {slots.length} time {slots.length === 1 ? 'slot' : 'slots'} available
      </p>

      <div className="time-slot-periods">
        {renderPeriod(
          'Morning',
          groupedSlots.morning,
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 11a3 3 0 110-6 3 3 0 010 6zm0 1a4 4 0 100-8 4 4 0 000 8zM8 0a.5.5 0 01.5.5v2a.5.5 0 01-1 0v-2A.5.5 0 018 0zm0 13a.5.5 0 01.5.5v2a.5.5 0 01-1 0v-2A.5.5 0 018 13zm8-5a.5.5 0 01-.5.5h-2a.5.5 0 010-1h2a.5.5 0 01.5.5zM3 8a.5.5 0 01-.5.5h-2a.5.5 0 010-1h2A.5.5 0 013 8zm10.657-5.657a.5.5 0 010 .707l-1.414 1.415a.5.5 0 11-.707-.708l1.414-1.414a.5.5 0 01.707 0zm-9.193 9.193a.5.5 0 010 .707L3.05 13.657a.5.5 0 01-.707-.707l1.414-1.414a.5.5 0 01.707 0zm9.193 2.121a.5.5 0 01-.707 0l-1.414-1.414a.5.5 0 01.707-.707l1.414 1.414a.5.5 0 010 .707zM4.464 4.465a.5.5 0 01-.707 0L2.343 3.05a.5.5 0 11.707-.707l1.414 1.414a.5.5 0 010 .708z"/>
          </svg>
        )}

        {renderPeriod(
          'Afternoon',
          groupedSlots.afternoon,
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 12a4 4 0 100-8 4 4 0 000 8zM8 0a.5.5 0 01.5.5v2a.5.5 0 01-1 0v-2A.5.5 0 018 0zm0 13a.5.5 0 01.5.5v2a.5.5 0 01-1 0v-2A.5.5 0 018 13zm8-5a.5.5 0 01-.5.5h-2a.5.5 0 010-1h2a.5.5 0 01.5.5zM3 8a.5.5 0 01-.5.5h-2a.5.5 0 010-1h2A.5.5 0 013 8z"/>
          </svg>
        )}

        {renderPeriod(
          'Evening',
          groupedSlots.evening,
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6 .278a.768.768 0 01.08.858 7.208 7.208 0 00-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.527 0 1.04-.055 1.533-.16a.787.787 0 01.81.316.733.733 0 01-.031.893A8.349 8.349 0 018.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.752.752 0 016 .278z"/>
          </svg>
        )}
      </div>

      {selectedSlot && (
        <div className="time-slot-selected">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M13.854 3.646a.5.5 0 010 .708l-7 7a.5.5 0 01-.708 0l-3.5-3.5a.5.5 0 11.708-.708L6.5 10.293l6.646-6.647a.5.5 0 01.708 0z"/>
          </svg>
          <span>
            Selected: {formatTimeSlot(selectedSlot.startTime)}
            {selectedSlot.endTime && ` - ${formatTimeSlot(selectedSlot.endTime)}`}
          </span>
        </div>
      )}
    </div>
  );
}

export default TimeSlotGrid;
