import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ResultsCopyLinkButton from '@/components/pages/home/results/ResultsCopyLinkButton';
import useResult from '@/hooks/useResult';

// Mock the hooks
vi.mock('@/hooks/useResult', () => ({
  default: vi.fn(),
}));

// Mock Material UI icons
vi.mock('@mui/icons-material/ContentCopy', () => ({
  default: () => <div data-testid="content-copy-icon">Copy Icon</div>,
}));

describe('ResultsCopyLinkButton', () => {
  // Original window.location implementation
  const originalLocation = window.location;

  // Mock clipboard API
  const mockClipboard = {
    writeText: vi.fn(),
  };

  beforeEach(() => {
    // Mock navigator.clipboard
    Object.defineProperty(navigator, 'clipboard', {
      value: mockClipboard,
      writable: true,
    });

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        ...originalLocation,
        origin: 'https://example.com',
      },
      writable: true,
    });

    // Default useResult mock implementation
    (useResult as any).mockReturnValue({
      result: { id: 'abc123' },
    });
  });

  afterEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Restore window.location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });

    // Ensure real timers are restored
    vi.useRealTimers();
  });

  it('renders a button with the correct text and icon', () => {
    render(<ResultsCopyLinkButton />);

    // Check that the button exists
    const button = screen.getByRole('button', { name: /copy link/i });
    expect(button).toBeInTheDocument();

    // Check for the icon
    const icon = screen.getByTestId('content-copy-icon');
    expect(icon).toBeInTheDocument();
  });

  it('copies the correct URL to clipboard when clicked', async () => {
    render(<ResultsCopyLinkButton />);

    // Click the button
    const button = screen.getByRole('button', { name: /copy link/i });
    fireEvent.click(button);

    // Check that clipboard.writeText was called with the correct URL
    expect(mockClipboard.writeText).toHaveBeenCalledWith('https://example.com/abc123');
  });

  it('shows a success message when link is copied', async () => {
    render(<ResultsCopyLinkButton />);

    // Click the button
    const button = screen.getByRole('button', { name: /copy link/i });
    fireEvent.click(button);

    // Check for success message
    const successAlert = await screen.findByText('Link copied to clipboard');
    expect(successAlert).toBeInTheDocument();
  });

  it('shows an error message when clipboard API throws synchronously', async () => {
    // Mock clipboard API to throw an error synchronously
    mockClipboard.writeText.mockImplementationOnce(() => {
      throw new Error('Clipboard error');
    });

    render(<ResultsCopyLinkButton />);

    // Click the button
    const button = screen.getByRole('button', { name: /copy link/i });
    fireEvent.click(button);

    // Look for error message by direct text search instead of using role+find
    const errorMessage = await screen.findByText(/Failed to copy link to clipboard/i);
    expect(errorMessage).toBeInTheDocument();
  });

  it('closes the success snackbar when close button is clicked', async () => {
    render(<ResultsCopyLinkButton />);

    // Click the button to trigger the success message
    const button = screen.getByRole('button', { name: /copy link/i });
    fireEvent.click(button);

    // Find the success message
    const successAlert = await screen.findByText('Link copied to clipboard');
    expect(successAlert).toBeInTheDocument();

    // Click the close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    // Wait for the snackbar to be removed from the DOM
    await waitFor(() => {
      expect(screen.queryByText('Link copied to clipboard')).not.toBeInTheDocument();
    });
  });

  it('closes the error snackbar when close button is clicked', async () => {
    // Mock clipboard API to throw an error
    mockClipboard.writeText.mockImplementationOnce(() => {
      throw new Error('Clipboard error');
    });

    render(<ResultsCopyLinkButton />);

    // Click the button to trigger the error message
    const button = screen.getByRole('button', { name: /copy link/i });
    fireEvent.click(button);

    // Find the error message directly by text
    const errorMessage = await screen.findByText(/Failed to copy link to clipboard/i);
    expect(errorMessage).toBeInTheDocument();

    // Click the close button - in case there are multiple, get the one near our error
    const closeButton = screen.getAllByRole('button', { name: /close/i })[0];
    fireEvent.click(closeButton);

    // Wait for the snackbar to be removed
    await waitFor(() => {
      expect(screen.queryByText(/Failed to copy link to clipboard/i)).not.toBeInTheDocument();
    });
  });

  it('handles missing result data gracefully', async () => {
    // Mock no result being available
    (useResult as any).mockReturnValue({
      result: null,
    });

    render(<ResultsCopyLinkButton />);

    // Click the button
    const button = screen.getByRole('button', { name: /copy link/i });
    fireEvent.click(button);

    // Check that clipboard.writeText was called with an empty string
    expect(mockClipboard.writeText).toHaveBeenCalledWith('');
  });

  it('auto-closes the success snackbar after the timeout', async () => {
    // Use fake timers
    vi.useFakeTimers();

    // Render without act - we'll use it for specific state updates
    const { rerender } = render(<ResultsCopyLinkButton />);

    // Click the button (this is a user event, so fireEvent is appropriate)
    const button = screen.getByRole('button', { name: /copy link/i });
    fireEvent.click(button);

    // Verify snackbar appears
    expect(screen.getByText('Link copied to clipboard')).toBeInTheDocument();

    // Wait for the auto-close timeout - this is what we need to fix
    // 1. Use a precise time advance (MUI typically uses 6000ms for auto-close)
    act(() => {
      vi.advanceTimersByTime(6000);
    });

    // 2. Force a synchronous update cycle to process any pending state changes
    act(() => {
      rerender(<ResultsCopyLinkButton />);
    });

    // 3. Run any remaining timers for animation or transitions
    act(() => {
      vi.runAllTimers();
    });

    // 4. Force another synchronous update to ensure DOM reflects latest state
    act(() => {
      rerender(<ResultsCopyLinkButton />);
    });

    // Now check if the snackbar is gone
    expect(screen.queryByText('Link copied to clipboard')).not.toBeInTheDocument();
  }, 10000);

  // Optional: Test button disabled state if implemented in the component
  it('handles the button state appropriately when result is null', () => {
    // Mock no result being available
    (useResult as any).mockReturnValue({
      result: null,
    });

    render(<ResultsCopyLinkButton />);

    // Button should still be present
    const button = screen.getByRole('button', { name: /copy link/i });
    expect(button).toBeInTheDocument();
  });
});
