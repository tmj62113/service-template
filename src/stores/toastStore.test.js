import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useToastStore } from './toastStore';

describe('toastStore', () => {
  beforeEach(() => {
    // Clear toasts before each test
    useToastStore.getState().clearToasts();
    vi.clearAllTimers();
  });

  it('initializes with empty toasts array', () => {
    const { toasts } = useToastStore.getState();
    expect(toasts).toEqual([]);
  });

  it('adds a toast with message and type', () => {
    const { addToast } = useToastStore.getState();
    addToast('Test message', 'success');

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('Test message');
    expect(toasts[0].type).toBe('success');
    expect(toasts[0].id).toBeDefined();
  });

  it('defaults to info type when type is not specified', () => {
    const { addToast } = useToastStore.getState();
    addToast('Test message');

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);
    expect(toasts[0].type).toBe('info');
  });

  it('adds multiple toasts', () => {
    const { addToast } = useToastStore.getState();
    addToast('First toast', 'success');
    addToast('Second toast', 'error');

    const { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(2);
    expect(toasts[0].message).toBe('First toast');
    expect(toasts[1].message).toBe('Second toast');
  });

  it('generates unique IDs for each toast', () => {
    const { addToast } = useToastStore.getState();
    addToast('Toast 1');
    addToast('Toast 2');

    const { toasts } = useToastStore.getState();
    expect(toasts[0].id).not.toBe(toasts[1].id);
  });

  it('removes a toast by ID', () => {
    const { addToast, removeToast } = useToastStore.getState();
    const id = addToast('Test toast');

    let { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(1);

    removeToast(id);
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('removes only the specified toast', () => {
    const { addToast, removeToast } = useToastStore.getState();
    const id1 = addToast('Toast 1');
    addToast('Toast 2');

    removeToast(id1);
    const { toasts } = useToastStore.getState();

    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('Toast 2');
  });

  it('clears all toasts', () => {
    const { addToast, clearToasts } = useToastStore.getState();
    addToast('Toast 1');
    addToast('Toast 2');
    addToast('Toast 3');

    let { toasts } = useToastStore.getState();
    expect(toasts).toHaveLength(3);

    clearToasts();
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('auto-removes toast after 3 seconds', () => {
    vi.useFakeTimers();
    const { addToast } = useToastStore.getState();

    addToast('Test toast');
    expect(useToastStore.getState().toasts).toHaveLength(1);

    // Fast-forward time by 3 seconds
    vi.advanceTimersByTime(3000);

    expect(useToastStore.getState().toasts).toHaveLength(0);
    vi.useRealTimers();
  });

  it('returns toast ID when adding', () => {
    const { addToast } = useToastStore.getState();
    const id = addToast('Test toast');

    expect(id).toBeDefined();
    expect(typeof id).toBe('number');
  });
});