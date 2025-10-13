import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Toast from './Toast';
import { useToastStore } from '../../stores/toastStore';

// Mock the toast store
vi.mock('../../stores/toastStore', () => ({
  useToastStore: vi.fn(() => ({
    removeToast: vi.fn(),
  })),
}));

describe('Toast', () => {
  const mockRemoveToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useToastStore.mockImplementation((selector) => {
      if (typeof selector === 'function') {
        return selector({ removeToast: mockRemoveToast });
      }
      return mockRemoveToast;
    });
  });

  it('renders toast with message', () => {
    render(<Toast id={1} message="Test message" type="success" />);
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders success toast with correct icon', () => {
    const { container } = render(<Toast id={1} message="Success" type="success" />);
    const icon = container.querySelector('.toast-icon');
    expect(icon).toHaveTextContent('check_circle');
  });

  it('renders error toast with correct icon', () => {
    const { container } = render(<Toast id={1} message="Error" type="error" />);
    const icon = container.querySelector('.toast-icon');
    expect(icon).toHaveTextContent('cancel');
  });

  it('renders warning toast with correct icon', () => {
    const { container } = render(<Toast id={1} message="Warning" type="warning" />);
    const icon = container.querySelector('.toast-icon');
    expect(icon).toHaveTextContent('warning');
  });

  it('renders info toast with correct icon', () => {
    const { container } = render(<Toast id={1} message="Info" type="info" />);
    const icon = container.querySelector('.toast-icon');
    expect(icon).toHaveTextContent('info');
  });

  it('applies correct CSS class for toast type', () => {
    const { container } = render(
      <Toast id={1} message="Test" type="success" />
    );
    const toast = container.querySelector('.toast');
    expect(toast).toHaveClass('toast-success');
  });

  it('calls removeToast when close button is clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<Toast id={123} message="Test" type="info" />);

    const closeButton = container.querySelector('.toast-close');
    await user.click(closeButton);

    // Wait for animation
    await new Promise((resolve) => setTimeout(resolve, 350));

    expect(mockRemoveToast).toHaveBeenCalledWith(123);
  });

  it('has exit animation class when closing', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Toast id={1} message="Test" type="info" />
    );

    const closeButton = container.querySelector('.toast-close');
    await user.click(closeButton);

    const toast = container.querySelector('.toast');
    expect(toast).toHaveClass('toast-exit');
  });
});