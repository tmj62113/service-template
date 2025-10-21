import { create } from 'zustand';

/**
 * Zustand store for managing booking flow state
 * Handles service selection, date/time selection, and booking details
 */
const useBookingStore = create((set, get) => ({
  // Selected service
  selectedService: null,
  setSelectedService: (service) => set({ selectedService: service }),

  // Selected staff (optional)
  selectedStaff: null,
  setSelectedStaff: (staffId) => set({ selectedStaff: staffId }),

  // Selected date
  selectedDate: null,
  setSelectedDate: (date) => set({
    selectedDate: date,
    selectedTimeSlot: null // Reset time slot when date changes
  }),

  // Selected time slot
  selectedTimeSlot: null,
  setSelectedTimeSlot: (slot) => set({ selectedTimeSlot: slot }),

  // Available time slots for selected date
  availableSlots: [],
  setAvailableSlots: (slots) => set({ availableSlots: slots }),

  // Loading state for fetching slots
  loadingSlots: false,
  setLoadingSlots: (loading) => set({ loadingSlots: loading }),

  // Client information
  clientInfo: {
    name: '',
    email: '',
    phone: '',
    notes: ''
  },
  setClientInfo: (info) => set({ clientInfo: { ...get().clientInfo, ...info } }),

  // User's timezone
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  setTimezone: (tz) => set({ timezone: tz }),

  // Current step in booking flow
  currentStep: 1, // 1: Date/Time, 2: Review, 3: Payment, 4: Confirmation
  setCurrentStep: (step) => set({ currentStep: step }),

  // Reset all booking data
  resetBooking: () => set({
    selectedService: null,
    selectedStaff: null,
    selectedDate: null,
    selectedTimeSlot: null,
    availableSlots: [],
    loadingSlots: false,
    clientInfo: {
      name: '',
      email: '',
      phone: '',
      notes: ''
    },
    currentStep: 1
  }),

  // Get complete booking data for submission
  getBookingData: () => {
    const state = get();

    if (!state.selectedService || !state.selectedDate || !state.selectedTimeSlot) {
      return null;
    }

    const [hours, minutes] = state.selectedTimeSlot.startTime.split(':');
    const startDateTime = new Date(state.selectedDate);
    startDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + state.selectedService.duration);

    return {
      serviceId: state.selectedService._id,
      staffId: state.selectedStaff,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
      timeZone: state.timezone,
      duration: state.selectedService.duration,
      amount: state.selectedService.price,
      currency: 'USD',
      clientInfo: state.clientInfo
    };
  },

  // Validate if ready to proceed to next step
  canProceedToReview: () => {
    const state = get();
    return !!(state.selectedService && state.selectedDate && state.selectedTimeSlot);
  },

  canProceedToPayment: () => {
    const state = get();
    return !!(
      state.clientInfo.name &&
      state.clientInfo.email &&
      state.canProceedToReview()
    );
  }
}));

export default useBookingStore;
