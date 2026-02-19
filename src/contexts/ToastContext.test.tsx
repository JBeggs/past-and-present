/**
 * Unit tests for ToastContext
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ToastProvider, useToast } from './ToastContext';

function TestConsumer() {
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  return (
    <div>
      <button data-testid="show-success" onClick={() => showSuccess('Success!')} />
      <button data-testid="show-error" onClick={() => showError('Error!')} />
      <button data-testid="show-warning" onClick={() => showWarning('Warning!')} />
      <button data-testid="show-info" onClick={() => showInfo('Info!')} />
    </div>
  );
}

describe('ToastContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('provides useToast hook', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );
    expect(screen.getByTestId('show-success')).toBeInTheDocument();
  });

  it('showSuccess displays success toast', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );
    act(() => {
      screen.getByTestId('show-success').click();
    });
    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Success!').closest('[data-cy="toast-success"]')).toBeInTheDocument();
  });

  it('showError displays error toast', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );
    act(() => {
      screen.getByTestId('show-error').click();
    });
    expect(screen.getByText('Error!')).toBeInTheDocument();
    expect(screen.getByText('Error!').closest('[data-cy="toast-error"]')).toBeInTheDocument();
  });

  it('showWarning displays warning toast', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );
    act(() => {
      screen.getByTestId('show-warning').click();
    });
    expect(screen.getByText('Warning!')).toBeInTheDocument();
  });

  it('showInfo displays info toast', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );
    act(() => {
      screen.getByTestId('show-info').click();
    });
    expect(screen.getByText('Info!')).toBeInTheDocument();
  });

  it('shows multiple toasts', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );
    act(() => {
      screen.getByTestId('show-success').click();
    });
    act(() => {
      screen.getByTestId('show-error').click();
    });
    expect(screen.getByText('Success!')).toBeInTheDocument();
    expect(screen.getByText('Error!')).toBeInTheDocument();
  });

  it('useToast throws when used outside ToastProvider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => {
      render(<TestConsumer />);
    }).toThrow('useToast must be used within a ToastProvider');
    consoleSpy.mockRestore();
  });
});
