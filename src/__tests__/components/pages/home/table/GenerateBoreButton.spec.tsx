import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import GenerateBoreButton from '@/components/pages/home/table/GenerateBoreButton';
import usePreset from '@/hooks/usePreset';
import useResult from '@/hooks/useResult';
import useTable from '@/hooks/useTable';
import { generateBoreAction } from '@/server/actions/bore.actions';

// Mock hooks and dependencies
vi.mock('@/hooks/usePreset', () => ({
  default: vi.fn(),
}));

vi.mock('@/hooks/useResult', () => ({
  default: vi.fn(),
}));

vi.mock('@/hooks/useTable', () => ({
  default: vi.fn(),
}));

vi.mock('@/server/actions/bore.actions', () => ({
  generateBoreAction: vi.fn(),
}));

vi.mock('@/components/shared/Spinner', () => ({
  default: () => <div data-testid="spinner">Loading...</div>,
}));

// Mock console.error to prevent test output clutter
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

describe('GenerateBoreButton', () => {
  const mockSetResult = vi.fn();
  const mockSetTableError = vi.fn();
  const mockSetHasChangedSinceGeneration = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    (usePreset as any).mockReturnValue({
      selectedPreset: { id: 'preset-123', name: 'Test Preset' },
    });

    (useResult as any).mockReturnValue({
      setResult: mockSetResult,
    });

    (useTable as any).mockReturnValue({
      tableData: [{ id: 'cable-1', quantity: 3 }],
      setError: mockSetTableError,
      hasChangedSinceGeneration: true,
      setHasChangedSinceGeneration: mockSetHasChangedSinceGeneration,
    });

    // Default mock for generate action
    (generateBoreAction as any).mockResolvedValue({
      success: true,
      data: { id: 'result-123', boreDiameter: 4.75 },
    });
  });

  it('renders with "Generate Bore" text when not loading', () => {
    render(<GenerateBoreButton />);

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Calculate');
    expect(button).not.toBeDisabled();
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
  });

  it('disables button when tableData is empty', () => {
    // Mock empty tableData
    (useTable as any).mockReturnValue({
      tableData: [],
      setError: mockSetTableError,
      hasChangedSinceGeneration: true,
      setHasChangedSinceGeneration: mockSetHasChangedSinceGeneration,
    });

    render(<GenerateBoreButton />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('disables button when hasChangedSinceGeneration is false', () => {
    // Mock hasChangedSinceGeneration = false
    (useTable as any).mockReturnValue({
      tableData: [{ id: 'cable-1', quantity: 3 }],
      setError: mockSetTableError,
      hasChangedSinceGeneration: false,
      setHasChangedSinceGeneration: mockSetHasChangedSinceGeneration,
    });

    render(<GenerateBoreButton />);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('calls generateBoreAction with correct parameters when clicked', async () => {
    render(<GenerateBoreButton />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Should call generateBoreAction with tableData and presetId
    await waitFor(() => {
      expect(generateBoreAction).toHaveBeenCalledWith(
        [{ id: 'cable-1', quantity: 3 }],
        'preset-123',
      );
    });
  });

  it('shows loading state during generation', async () => {
    // Make the action slow to resolve
    (generateBoreAction as any).mockImplementation(() => new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: { id: 'result-123', boreDiameter: 4.75 },
        });
      }, 100); // Small delay to ensure we can check the loading state
    }));

    render(<GenerateBoreButton />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Button should show "Calculating..." and be disabled
    expect(button).toHaveTextContent('Calculating');
    expect(button).toBeDisabled();
    expect(screen.getByTestId('spinner')).toBeInTheDocument();

    // Wait for generation to complete
    await waitFor(() => {
      expect(button).toHaveTextContent('Calculate');
      expect(button).not.toBeDisabled();
    });
  });

  it('calls setResult on successful generation', async () => {
    const mockResultData = { id: 'result-123', boreDiameter: 4.75 };

    (generateBoreAction as any).mockResolvedValue({
      success: true,
      data: mockResultData,
    });

    render(<GenerateBoreButton />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSetResult).toHaveBeenCalledWith(mockResultData, true);
      expect(mockSetHasChangedSinceGeneration).toHaveBeenCalledWith(false);
    });
  });

  it('sets error when generation fails', async () => {
    const errorMessage = 'Failed to generate bore';

    (generateBoreAction as any).mockResolvedValue({
      success: false,
      error: errorMessage,
    });

    render(<GenerateBoreButton />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSetTableError).toHaveBeenCalledWith({ message: errorMessage });
      expect(console.error).toHaveBeenCalledWith('Error generating bore:', errorMessage);
      expect(mockSetResult).not.toHaveBeenCalled();
    });
  });

  it('handles unexpected errors during generation', async () => {
    const errorObj = new Error('Network error');

    (generateBoreAction as any).mockRejectedValue(errorObj);

    render(<GenerateBoreButton />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockSetTableError).toHaveBeenCalledWith({ message: 'An unexpected error occurred' });
      expect(console.error).toHaveBeenCalledWith('Unexpected error:', errorObj);
      expect(mockSetResult).not.toHaveBeenCalled();
    });
  });

  it('passes null as presetId when no preset is selected', async () => {
    // Mock no selected preset
    (usePreset as any).mockReturnValue({
      selectedPreset: null,
    });

    render(<GenerateBoreButton />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(generateBoreAction).toHaveBeenCalledWith(
        [{ id: 'cable-1', quantity: 3 }],
        null,
      );
    });
  });

  it('resets loading state even when there is an error', async () => {
    (generateBoreAction as any).mockRejectedValue(new Error('Test error'));

    render(<GenerateBoreButton />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Initially in loading state
    expect(button).toHaveTextContent('Calculating');
    expect(button).toBeDisabled();

    // Should reset to non-loading state after error
    await waitFor(() => {
      expect(button).toHaveTextContent('Calculate');
      expect(button).not.toBeDisabled();
    });
  });
});
