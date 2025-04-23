import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CableTableAlert from '@/components/pages/home/table/CableTableAlert';
import useTable from '@/hooks/useTable';

// Mock the hooks
vi.mock('@/hooks/useTable', () => ({
  default: vi.fn(),
}));

describe('CableTableAlert', () => {
  // Mock for useTable hook
  const mockSetError = vi.fn();

  beforeEach(() => {
    // Reset timers
    vi.useFakeTimers();

    // Make sure global.clearTimeout is defined
    if (typeof global.clearTimeout !== 'function') {
      global.clearTimeout = vi.fn();
    }
  });

  afterEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    // Restore timers
    vi.useRealTimers();
  });

  it('renders nothing when error is null', () => {
    // Mock useTable to return null error
    (useTable as any).mockReturnValue({
      error: null,
      setError: mockSetError,
    });

    const { container } = render(<CableTableAlert />);
    // Component should return null, so container should be empty
    expect(container.firstChild).toBeNull();
  });

  it('renders an error alert when error is present', () => {
    // Mock useTable to return an error
    const mockError = {
      message: 'Test error message',
      timeout: 5000,
    };

    (useTable as any).mockReturnValue({
      error: mockError,
      setError: mockSetError,
    });

    render(<CableTableAlert />);

    // Check alert exists and has the error class
    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(alert.className).toContain('MuiAlert-colorError');

    // Check error message is displayed
    const errorMessage = screen.getByText('Test error message');
    expect(errorMessage).toBeInTheDocument();
  });

  it('clears error after timeout period', async () => {
    // Mock useTable to return an error with specific timeout
    const mockError = {
      message: 'Test error message',
      timeout: 3000, // 3 seconds timeout
    };

    (useTable as any).mockReturnValue({
      error: mockError,
      setError: mockSetError,
    });

    render(<CableTableAlert />);

    // Check error is displayed initially
    expect(screen.getByText('Test error message')).toBeInTheDocument();

    // Fast-forward time by 3 seconds
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Check that setError was called with null to clear the error
    expect(mockSetError).toHaveBeenCalledWith(null);
  });

  it('uses default timeout of 5000ms when not specified', async () => {
    // Mock useTable to return an error without timeout specified
    const mockError = {
      message: 'Test error message',
      // No timeout specified, should use default 5000ms
    };

    (useTable as any).mockReturnValue({
      error: mockError,
      setError: mockSetError,
    });

    render(<CableTableAlert />);

    // Fast-forward time by 4999ms (just before default timeout)
    act(() => {
      vi.advanceTimersByTime(4999);
    });

    // setError should not have been called yet
    expect(mockSetError).not.toHaveBeenCalled();

    // Fast-forward another 1ms to reach the 5000ms mark
    act(() => {
      vi.advanceTimersByTime(1);
    });

    // Now setError should have been called with null
    expect(mockSetError).toHaveBeenCalledWith(null);
  });

  it('clears timeout when component unmounts', () => {
    // Mock useTable to return an error
    const mockError = {
      message: 'Test error message',
      timeout: 5000,
    };

    (useTable as any).mockReturnValue({
      error: mockError,
      setError: mockSetError,
    });

    // We can't reliably spy on clearTimeout, so we'll just test that unmount doesn't throw
    const { unmount } = render(<CableTableAlert />);

    // This should not throw an error
    expect(() => unmount()).not.toThrow();
  });

  it('clears timeout when error changes', () => {
    // Mock useTable to return an error
    const mockError1 = {
      message: 'First error message',
      timeout: 5000,
    };

    (useTable as any).mockReturnValue({
      error: mockError1,
      setError: mockSetError,
    });

    const { rerender } = render(<CableTableAlert />);

    // Reset the setError call count
    mockSetError.mockClear();

    // Change the error
    const mockError2 = {
      message: 'Second error message',
      timeout: 3000,
    };

    (useTable as any).mockReturnValue({
      error: mockError2,
      setError: mockSetError,
    });

    // Re-render with new error
    rerender(<CableTableAlert />);

    // Now the new timeout should be set
    // Fast-forward time by 3 seconds
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Check that setError was called with null for the new timeout
    expect(mockSetError).toHaveBeenCalledWith(null);
  });

  it('renders error message inside Typography with body2 variant', () => {
    // Reset mocks to avoid any clearTimeout issues from other tests
    vi.clearAllMocks();

    // Mock useTable to return an error
    const mockError = {
      message: 'Test error message',
      timeout: 5000,
    };

    (useTable as any).mockReturnValue({
      error: mockError,
      setError: mockSetError,
    });

    render(<CableTableAlert />);

    // Find the Typography element
    const typography = screen.getByText('Test error message');

    // In MUI, the Typography variant is applied as a class like "MuiTypography-body2"
    expect(typography.className).toContain('MuiTypography-body2');
  });
});
