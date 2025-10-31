import { describe, it, expect, beforeEach } from 'vitest';
import useBookingStore from './bookingStore';

describe('bookingStore', () => {
  beforeEach(() => {
    useBookingStore.getState().resetBooking();
  });

  it('initializes with default values', () => {
    const state = useBookingStore.getState();
    expect(state.selectedService).toBeNull();
    expect(state.selectedStaff).toBeNull();
    expect(state.selectedDate).toBeNull();
    expect(state.selectedTimeSlot).toBeNull();
    expect(state.currentStep).toBe(1);
    expect(state.servicesStatus).toBe('idle');
    expect(state.staffStatus).toBe('idle');
  });

  it('setSelectedService resets dependent selections', () => {
    const mockService = { _id: 'service-1', name: 'Coaching', duration: 60, price: 15000 };

    const store = useBookingStore.getState();
    store.setSelectedStaff('staff-1');
    store.setSelectedDate(new Date('2025-01-01T10:00:00Z'));
    store.setSelectedTimeSlot({ startTime: '09:00', endTime: '10:00' });
    store.setCurrentStep(4);

    useBookingStore.getState().setSelectedService(mockService);

    const state = useBookingStore.getState();
    expect(state.selectedService).toEqual(mockService);
    expect(state.selectedStaff).toBeNull();
    expect(state.selectedDate).toBeNull();
    expect(state.selectedTimeSlot).toBeNull();
    expect(state.currentStep).toBe(1);
  });

  it('setSelectedDate clears selected time slot', () => {
    const store = useBookingStore.getState();
    store.setSelectedTimeSlot({ startTime: '10:00', endTime: '11:00' });
    store.setSelectedDate(new Date('2025-02-02T00:00:00Z'));

    const state = useBookingStore.getState();
    expect(state.selectedDate).toBeInstanceOf(Date);
    expect(state.selectedTimeSlot).toBeNull();
  });

  it('determines step completion accurately', () => {
    const store = useBookingStore.getState();
    const service = { _id: 'svc', name: 'Session', duration: 45, price: 12000 };

    expect(store.isStepComplete(1)).toBe(false);

    store.setSelectedService(service);
    store.setSelectedStaff('staff-1');
    store.setSelectedDate(new Date('2025-03-10T00:00:00Z'));
    store.setSelectedTimeSlot({ startTime: '13:00', endTime: '13:45' });

    const updated = useBookingStore.getState();
    expect(updated.isStepComplete(1)).toBe(true);
    expect(updated.isStepComplete(2)).toBe(true);
    expect(updated.isStepComplete(3)).toBe(true);
    expect(updated.isStepComplete(4)).toBe(true);
    expect(updated.isStepComplete(5)).toBe(true);
  });

  it('limits advancing beyond the last step', () => {
    const store = useBookingStore.getState();
    for (let i = 0; i < 10; i += 1) {
      store.goToNextStep();
    }

    expect(useBookingStore.getState().currentStep).toBe(5);
  });

  it('does not go below the first step when going back', () => {
    const store = useBookingStore.getState();
    store.goToPreviousStep();
    store.goToPreviousStep();

    expect(useBookingStore.getState().currentStep).toBe(1);
  });

  it('resetBooking clears the store state', () => {
    const store = useBookingStore.getState();
    store.setSelectedService({ _id: 'service-1', name: 'Session', duration: 60, price: 20000 });
    store.setSelectedStaff('staff-1');
    store.setSelectedDate(new Date('2025-01-05T00:00:00Z'));
    store.setSelectedTimeSlot({ startTime: '09:00', endTime: '10:00' });
    store.setServices([{ _id: 'service-1' }]);
    store.setStaffMembers([{ _id: 'staff-1' }]);

    useBookingStore.getState().resetBooking();

    const state = useBookingStore.getState();
    expect(state.selectedService).toBeNull();
    expect(state.selectedStaff).toBeNull();
    expect(state.selectedDate).toBeNull();
    expect(state.selectedTimeSlot).toBeNull();
    expect(state.services).toEqual([]);
    expect(state.staffMembers).toEqual([]);
    expect(state.currentStep).toBe(1);
  });

  it('stores service catalog data correctly', () => {
    const services = [
      { _id: 'svc-1', name: 'Strategy Session' },
      { _id: 'svc-2', name: 'Coaching Intensive' }
    ];

    const store = useBookingStore.getState();
    store.setServices(services);
    store.setServicesStatus('success');

    const state = useBookingStore.getState();
    expect(state.services).toEqual(services);
    expect(state.servicesStatus).toBe('success');
  });

  it('stores staff directory data correctly', () => {
    const staffMembers = [
      { _id: 'staff-1', name: 'Alex Rivera' },
      { _id: 'staff-2', name: 'Jordan Kim' }
    ];

    const store = useBookingStore.getState();
    store.setStaffMembers(staffMembers);
    store.setStaffStatus('loading');
    store.setStaffError('');

    const state = useBookingStore.getState();
    expect(state.staffMembers).toEqual(staffMembers);
    expect(state.staffStatus).toBe('loading');
    expect(state.staffError).toBe('');
  });

  it('returns null booking data when selections are incomplete', () => {
    const store = useBookingStore.getState();
    expect(store.getBookingData()).toBeNull();

    store.setSelectedService({ _id: 'svc-1', name: 'Session', duration: 60, price: 10000 });
    expect(store.getBookingData()).toBeNull();
  });

  it('returns formatted booking data when selections are complete', () => {
    const service = { _id: 'svc-1', name: 'Session', duration: 60, price: 10000 };
    const date = new Date('2025-04-10T00:00:00Z');

    const store = useBookingStore.getState();
    store.setSelectedService(service);
    store.setSelectedStaff('staff-1');
    store.setSelectedDate(date);
    store.setSelectedTimeSlot({ startTime: '09:00', endTime: '10:00' });

    const data = store.getBookingData();
    expect(data).not.toBeNull();
    expect(data.serviceId).toBe('svc-1');
    expect(data.staffId).toBe('staff-1');
    expect(data.duration).toBe(60);
    expect(data.amount).toBe(10000);
  });

  it('evaluates review readiness correctly', () => {
    const store = useBookingStore.getState();
    expect(store.canProceedToReview()).toBe(false);

    store.setSelectedService({ _id: 'svc-1', name: 'Session', duration: 60, price: 15000 });
    store.setSelectedDate(new Date('2025-06-01T00:00:00Z'));
    store.setSelectedTimeSlot({ startTime: '10:00', endTime: '11:00' });

    expect(store.canProceedToReview()).toBe(true);
    expect(store.isStepComplete(5)).toBe(true);
  });

  it('clamps current step within valid range', () => {
    const store = useBookingStore.getState();
    store.setCurrentStep(7);
    expect(useBookingStore.getState().currentStep).toBe(5);

    store.setCurrentStep(-2);
    expect(useBookingStore.getState().currentStep).toBe(1);
  });
});
