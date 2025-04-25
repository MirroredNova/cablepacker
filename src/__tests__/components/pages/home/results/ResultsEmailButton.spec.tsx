import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ResultsEmailButton from '@/components/pages/home/results/ResultsEmailButton';
import useResult from '@/hooks/useResult';

// Mock the hooks
vi.mock('@/hooks/useResult', () => ({
  default: vi.fn(),
}));

// Mock Material UI icons
vi.mock('@mui/icons-material/AttachEmail', () => ({
  default: () => <div data-testid="attach-email-icon">Email Icon</div>,
}));

describe('ResultsEmailButton', () => {
  // Original window.location and window.open implementations
  const originalLocation = window.location;
  const originalOpen = window.open;

  // Mock window.open
  const mockWindowOpen = vi.fn();

  beforeEach(() => {
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        origin: 'https://example.com',
      },
      writable: true,
    });

    // Mock window.open
    window.open = mockWindowOpen;

    // Default useResult mock implementation with sample data
    (useResult as any).mockReturnValue({
      result: {
        id: 'abc123',
        boreDiameter: 4.5,
        resultData: {
          cables: [{ id: 'cable1' }, { id: 'cable2' }],
        },
      },
    });

    // Silence console.error for expected error tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Restore window.location and window.open
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
    window.open = originalOpen;

    // Ensure real timers are restored
    vi.useRealTimers();
  });

  it('renders a button with the correct text and icon', () => {
    render(<ResultsEmailButton />);

    // Check that the button exists
    const button = screen.getByRole('button', { name: /send email/i });
    expect(button).toBeInTheDocument();

    // Check for the icon
    const icon = screen.getByTestId('attach-email-icon');
    expect(icon).toBeInTheDocument();
  });

  it('creates and opens correct mailto link when button is clicked', () => {
    render(<ResultsEmailButton />);

    // Click the button
    const button = screen.getByRole('button', { name: /send email/i });
    fireEvent.click(button);

    // Verify window.open was called with the correct URL
    expect(mockWindowOpen).toHaveBeenCalledTimes(1);
    const mailtoUrl = mockWindowOpen.mock.calls[0][0];

    // Check that it's a mailto link
    expect(mailtoUrl).toMatch(/^mailto:/);

    // Check that it contains the expected components
    expect(mailtoUrl).toContain('subject=Cable%20Bore%20Configuration%20-%20abc123');
    expect(mailtoUrl).toContain('Result%20ID%3A%20abc123');
    expect(mailtoUrl).toContain('Bore%20Diameter%3A%204.500%20in');
    expect(mailtoUrl).toContain('Number%20of%20Cables%3A%202');
    expect(mailtoUrl).toContain('https%3A%2F%2Fexample.com%2Fabc123');
  });

  it('shows an error message when result data is not available', async () => {
    // Mock no result being available
    (useResult as any).mockReturnValue({
      result: null,
    });

    render(<ResultsEmailButton />);

    // Click the button
    const button = screen.getByRole('button', { name: /send email/i });
    fireEvent.click(button);

    // Check for error message
    const errorMessage = await screen.findByText('Result data is not available');
    expect(errorMessage).toBeInTheDocument();

    // Verify window.open was not called
    expect(mockWindowOpen).not.toHaveBeenCalled();
  });

  it('shows an error message when window.open throws an error', async () => {
    // Mock window.open to throw an error
    window.open = vi.fn(() => {
      throw new Error('Failed to open email client');
    });

    render(<ResultsEmailButton />);

    // Click the button
    const button = screen.getByRole('button', { name: /send email/i });
    fireEvent.click(button);

    // Check for error message
    const errorMessage = await screen.findByText('Failed to open email client');
    expect(errorMessage).toBeInTheDocument();
  });

  it('closes the error message when the close button is clicked', async () => {
    // Mock no result being available to trigger error
    (useResult as any).mockReturnValue({
      result: null,
    });

    render(<ResultsEmailButton />);

    // Click the button to trigger the error
    const button = screen.getByRole('button', { name: /send email/i });
    fireEvent.click(button);

    // Find the error message
    const errorMessage = await screen.findByText('Result data is not available');
    expect(errorMessage).toBeInTheDocument();

    // Click the close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    // Wait for the error to be removed from the DOM
    await waitFor(() => {
      expect(screen.queryByText('Result data is not available')).not.toBeInTheDocument();
    });
  });

  it('auto-closes the error message after the timeout', async () => {
    // Use fake timers
    vi.useFakeTimers();

    // Mock no result being available to trigger error
    (useResult as any).mockReturnValue({
      result: null,
    });

    const { rerender } = render(<ResultsEmailButton />);

    // Click the button to trigger the error
    const button = screen.getByRole('button', { name: /send email/i });
    fireEvent.click(button);

    // Verify error message appears
    expect(screen.getByText('Result data is not available')).toBeInTheDocument();

    // Run all pending timers
    await vi.runAllTimersAsync();

    // Force a re-render to reflect state updates after timers
    rerender(<ResultsEmailButton />);

    // Verify error message is gone
    expect(screen.queryByText('Result data is not available')).not.toBeInTheDocument();
  }, 10000); // Increase timeout

  it('handles missing resultData.cables gracefully', () => {
    // Mock result with missing resultData.cables
    (useResult as any).mockReturnValue({
      result: {
        id: 'abc123',
        boreDiameter: 4.5,
        resultData: {},
      },
    });

    render(<ResultsEmailButton />);

    // Click the button
    const button = screen.getByRole('button', { name: /send email/i });
    fireEvent.click(button);

    // Verify window.open was called (no error thrown)
    expect(mockWindowOpen).toHaveBeenCalledTimes(1);

    // Check that the email body contains the correct number of cables (0)
    const mailtoUrl = mockWindowOpen.mock.calls[0][0];
    expect(mailtoUrl).toContain('Number%20of%20Cables%3A%200');
  });
});
