import { create } from 'zustand';

const createInitialState = () => ({
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
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  currentStep: 1,
  services: [],
  servicesStatus: 'idle', // idle | loading | success | error
  servicesError: null,
  staffMembers: [],
  staffStatus: 'idle', // idle | loading | success | error
  staffError: null
});

/**
 * Zustand store for managing booking flow state
 * Handles service selection, provider selection, scheduling placeholders, and booking details
 */
const useBookingStore = create((set, get) => ({
  ...createInitialState(),

  // Selected service
  setSelectedService: (service) =>
    set(() => ({
      selectedService: service,
      selectedStaff: null,
      staffMembers: [],
      staffStatus: 'idle',
      staffError: null,
      selectedDate: null,
      selectedTimeSlot: null,
      currentStep: 1
    })),

  // Selected staff (optional)
  setSelectedStaff: (staffId) => set({ selectedStaff: staffId }),

  // Selected date
  setSelectedDate: (date) =>
    set({
      selectedDate: date,
      selectedTimeSlot: null
    }),

  // Selected time slot
  setSelectedTimeSlot: (slot) => set({ selectedTimeSlot: slot }),

  // Available time slots for selected date
  setAvailableSlots: (slots) => set({ availableSlots: slots }),

  // Loading state for fetching slots
  setLoadingSlots: (loading) => set({ loadingSlots: loading }),

  // Client information
  setClientInfo: (info) =>
    set({ clientInfo: { ...get().clientInfo, ...info } }),

  // User's timezone
  setTimezone: (tz) => set({ timezone: tz }),

  // Wizard step controls
  setCurrentStep: (step) =>
    set({ currentStep: Math.min(Math.max(step, 1), 5) }),
  goToNextStep: () =>
    set((state) => ({ currentStep: Math.min(state.currentStep + 1, 5) })),
  goToPreviousStep: () =>
    set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),

  // Service catalog state
  setServices: (services) => set({ services }),
  setServicesStatus: (status) => set({ servicesStatus: status }),
  setServicesError: (error) => set({ servicesError: error }),

  // Staff directory state
  setStaffMembers: (members) => set({ staffMembers: members }),
  setStaffStatus: (status) => set({ staffStatus: status }),
  setStaffError: (error) => set({ staffError: error }),

  // Reset all booking data
  resetBooking: () => set(() => ({ ...createInitialState() })),

  // Get complete booking data for submission
  getBookingData: () => {
    const state = get();

    if (!state.selectedService || !state.selectedDate || !state.selectedTimeSlot) {
      return null;
    }

    const [hours, minutes] = state.selectedTimeSlot.startTime.split(':');
    const startDateTime = new Date(state.selectedDate);
    startDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

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
    return Boolean(state.selectedService && state.selectedDate && state.selectedTimeSlot);
  },

  canProceedToPayment: () => {
    const state = get();
    return Boolean(
      state.clientInfo.name &&
      state.clientInfo.email &&
      state.canProceedToReview()
    );
  },

  isStepComplete: (stepNumber) => {
    const state = get();
    switch (stepNumber) {
      case 1:
        return Boolean(state.selectedService);
      case 2:
        return Boolean(state.selectedService && state.selectedStaff);
      case 3:
        return Boolean(state.selectedService && state.selectedStaff && state.selectedDate);
      case 4:
        return Boolean(
          state.selectedService &&
          state.selectedStaff &&
          state.selectedDate &&
          state.selectedTimeSlot
        );
      case 5:
        return state.canProceedToReview();
      default:
        return false;
    }
  }
}));

export default useBookingStore;
