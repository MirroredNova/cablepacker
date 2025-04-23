import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ResultsExportButton from '@/components/pages/home/results/ResultsExportButton';
import useResult from '@/hooks/useResult';
import { exportResultToPdf } from '@/client/utils/pdfExport.utils';

// Mock the hooks and utilities
vi.mock('@/hooks/useResult', () => ({
  default: vi.fn(),
}));

vi.mock('@/client/utils/pdfExport.utils', () => ({
  exportResultToPdf: vi.fn(),
}));

// Mock Material UI icons
vi.mock('@mui/icons-material/DownloadOutlined', () => ({
  default: () => <div data-testid="download-icon">Download Icon</div>,
}));

describe('ResultsExportButton', () => {
  // Mock contentRef
  const mockContentRef = { current: document.createElement('div') };

  beforeEach(() => {
    // Default useResult mock implementation
    (useResult as any).mockReturnValue({
      result: { id: 'abc123' },
    });

    // Mock successful PDF export by default
    vi.mocked(exportResultToPdf).mockResolvedValue(undefined);

    // Silence console.error for expected error tests
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Ensure real timers are restored
    vi.useRealTimers();
  });

  it('renders a button with the correct text and icon', () => {
    render(<ResultsExportButton contentRef={mockContentRef} />);

    // Check that the button exists
    const button = screen.getByRole('button', { name: /export pdf/i });
    expect(button).toBeInTheDocument();

    // Check for the icon
    const icon = screen.getByTestId('download-icon');
    expect(icon).toBeInTheDocument();
  });

  it('calls exportResultToPdf with correct parameters when clicked', async () => {
    const mockResult = { id: 'abc123', someData: 'test data' };
    (useResult as any).mockReturnValue({
      result: mockResult,
    });

    render(<ResultsExportButton contentRef={mockContentRef} />);

    // Click the button
    const button = screen.getByRole('button', { name: /export pdf/i });
    fireEvent.click(button);

    // Check that exportResultToPdf was called with the correct parameters
    expect(exportResultToPdf).toHaveBeenCalledWith(mockResult, mockContentRef);
  });

  it('disables the button and shows "Generating..." text while exporting', async () => {
    // Mock slow PDF export
    vi.mocked(exportResultToPdf).mockImplementation(() => new Promise((resolve) => {
      setTimeout(resolve, 100);
    }));

    render(<ResultsExportButton contentRef={mockContentRef} />);

    // Click the button
    const button = screen.getByRole('button', { name: /export pdf/i });
    fireEvent.click(button);

    // Check that button text changed and button is disabled
    expect(screen.getByRole('button', { name: /generating/i })).toBeInTheDocument();
    expect(button).toBeDisabled();

    // Wait for the export to complete
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /export pdf/i })).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });
  });

  it('shows an error when result is null', async () => {
    // Mock no result being available
    (useResult as any).mockReturnValue({
      result: null,
    });

    render(<ResultsExportButton contentRef={mockContentRef} />);

    // Click the button
    const button = screen.getByRole('button', { name: /export pdf/i });
    fireEvent.click(button);

    // Check for error message
    const errorMessage = await screen.findByText('No result available to export.');
    expect(errorMessage).toBeInTheDocument();
  });

  it('shows an error when exportResultToPdf throws an error', async () => {
    // Mock exportResultToPdf to throw an error
    vi.mocked(exportResultToPdf).mockRejectedValue(new Error('Export failed'));

    render(<ResultsExportButton contentRef={mockContentRef} />);

    // Click the button
    const button = screen.getByRole('button', { name: /export pdf/i });
    fireEvent.click(button);

    // Check for error message
    const errorMessage = await screen.findByText('Failed to generate PDF. Please try again.');
    expect(errorMessage).toBeInTheDocument();
  });

  it('closes the error message when the close button is clicked', async () => {
    // Mock no result being available to trigger error
    (useResult as any).mockReturnValue({
      result: null,
    });

    render(<ResultsExportButton contentRef={mockContentRef} />);

    // Click the button to trigger the error
    const button = screen.getByRole('button', { name: /export pdf/i });
    fireEvent.click(button);

    // Find the error message
    const errorMessage = await screen.findByText('No result available to export.');
    expect(errorMessage).toBeInTheDocument();

    // Click the close button
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    // Wait for the error to be removed from the DOM
    await waitFor(() => {
      expect(screen.queryByText('No result available to export.')).not.toBeInTheDocument();
    });
  });

  it('auto-closes the error message after the timeout', async () => {
    // Use fake timers
    vi.useFakeTimers();

    // Mock no result being available to trigger error
    (useResult as any).mockReturnValue({
      result: null,
    });

    const { rerender } = render(<ResultsExportButton contentRef={mockContentRef} />);

    // Click the button to trigger the error
    const button = screen.getByRole('button', { name: /export pdf/i });
    fireEvent.click(button);

    // Verify error message appears
    expect(screen.getByText('No result available to export.')).toBeInTheDocument();

    // Run all pending timers
    await vi.runAllTimersAsync();

    // Force a re-render to reflect state updates after timers
    rerender(<ResultsExportButton contentRef={mockContentRef} />);

    // Verify error message is gone
    expect(screen.queryByText('No result available to export.')).not.toBeInTheDocument();
  }, 10000); // Increase timeout

  it('resets the exporting state even if an error occurs', async () => {
    // Mock exportResultToPdf to throw an error
    vi.mocked(exportResultToPdf).mockRejectedValue(new Error('Export failed'));

    render(<ResultsExportButton contentRef={mockContentRef} />);

    // Click the button
    const button = screen.getByRole('button', { name: /export pdf/i });
    fireEvent.click(button);

    // Wait for the error to appear and check that button is re-enabled
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /export pdf/i })).toBeInTheDocument();
      expect(button).not.toBeDisabled();
    });
  });
});
