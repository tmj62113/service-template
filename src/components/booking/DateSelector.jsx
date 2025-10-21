import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { getMinBookableDate, getMaxBookableDate, isDatePast } from '../../utils/dateTimeUtils';
import './DateSelector.css';

/**
 * DateSelector component for booking flow
 * Allows users to select a date for their appointment
 */
function DateSelector({ selectedDate, onDateChange, maxAdvanceBooking = 60, excludeDates = [] }) {
  const [startDate, setStartDate] = useState(selectedDate || null);

  const handleDateChange = (date) => {
    setStartDate(date);
    if (onDateChange) {
      onDateChange(date);
    }
  };

  const minDate = getMinBookableDate();
  const maxDate = getMaxBookableDate(maxAdvanceBooking);

  // Filter out weekends if needed (can be customized based on business hours)
  const isWeekday = (date) => {
    const day = date.getDay();
    return day !== 0 && day !== 6; // Exclude Sunday (0) and Saturday (6)
  };

  return (
    <div className="date-selector">
      <h3 className="date-selector-title">Select a Date</h3>
      <div className="date-picker-wrapper">
        <DatePicker
          selected={startDate}
          onChange={handleDateChange}
          minDate={minDate}
          maxDate={maxDate}
          excludeDates={excludeDates}
          filterDate={isWeekday} // Only allow weekdays (customize as needed)
          inline
          calendarClassName="booking-calendar"
          monthsShown={1}
          showPopperArrow={false}
          dateFormat="MMMM d, yyyy"
        />
      </div>
      {startDate && (
        <div className="selected-date-display">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3.5 0a.5.5 0 01.5.5V1h8V.5a.5.5 0 011 0V1h1a2 2 0 012 2v11a2 2 0 01-2 2H2a2 2 0 01-2-2V3a2 2 0 012-2h1V.5a.5.5 0 01.5-.5zM2 2a1 1 0 00-1 1v1h14V3a1 1 0 00-1-1H2zm13 3H1v9a1 1 0 001 1h12a1 1 0 001-1V5z"/>
          </svg>
          <span>
            {startDate.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      )}
      <p className="date-selector-hint">
        Select a date to see available time slots
      </p>
    </div>
  );
}

export default DateSelector;
