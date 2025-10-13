import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ToastContainer from './ToastContainer';
import { useToastStore } from '../../stores/toastStore';

// Mock the toast store
vi.mock('../../stores/toastStore', () => ({
  useToastStore: vi.fn(),
}));

describe('ToastContainer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without toasts', () => {
    useToastStore.mockImplementation((selector) =>
      selector({ toasts: [] })
    );

    const { container } = render(<ToastContainer />);
    const toastContainer = container.querySelector('.toast-container');

    expect(toastContainer).toBeInTheDocument();
    expect(toastContainer.children).toHaveLength(0);
  });

  it('renders single toast', () => {
    useToastStore.mockImplementation((selector) =>
      selector({
        toasts: [
          { id: 1, message: 'Test message', type: 'success' },
        ],
      })
    );

    render(<ToastContainer />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders multiple toasts', () => {
    useToastStore.mockImplementation((selector) =>
      selector({
        toasts: [
          { id: 1, message: 'First toast', type: 'success' },
          { id: 2, message: 'Second toast', type: 'error' },
          { id: 3, message: 'Third toast', type: 'info' },
        ],
      })
    );

    render(<ToastContainer />);
    expect(screen.getByText('First toast')).toBeInTheDocument();
    expect(screen.getByText('Second toast')).toBeInTheDocument();
    expect(screen.getByText('Third toast')).toBeInTheDocument();
  });
});