/**
 * Component tests for Toast
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ToastComponent from './Toast';

describe('Toast', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders message and type', () => {
    render(
      <ToastComponent
        toast={{ id: '1', message: 'Success!', type: 'success' }}
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('has data-cy for success type', () => {
    render(
      <ToastComponent
        toast={{ id: '1', message: 'Done', type: 'success' }}
        onClose={mockOnClose}
      />
    );
    const toast = document.querySelector('[data-cy="toast-success"]');
    expect(toast).toBeInTheDocument();
    expect(toast).toHaveTextContent('Done');
  });

  it('calls onClose when close button clicked', () => {
    render(
      <ToastComponent
        toast={{ id: 't1', message: 'Test', type: 'info' }}
        onClose={mockOnClose}
      />
    );
    fireEvent.click(screen.getByRole('button'));
    expect(mockOnClose).toHaveBeenCalledWith('t1');
  });

  it('auto-dismisses after duration with fake timers', () => {
    vi.useFakeTimers();
    render(
      <ToastComponent
        toast={{ id: 't2', message: 'Auto', type: 'success', duration: 1000 }}
        onClose={mockOnClose}
      />
    );
    expect(mockOnClose).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    expect(mockOnClose).toHaveBeenCalledWith('t2');
    vi.useRealTimers();
  });

  it('does not auto-dismiss when duration is 0', () => {
    vi.useFakeTimers();
    render(
      <ToastComponent
        toast={{ id: 't3', message: 'No auto', type: 'warning', duration: 0 }}
        onClose={mockOnClose}
      />
    );
    vi.advanceTimersByTime(10000);
    expect(mockOnClose).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
