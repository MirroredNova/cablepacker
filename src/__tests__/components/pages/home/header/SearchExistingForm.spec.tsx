import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SearchExistingForm from '@/components/pages/home/header/SearchExistingForm';
import useResult from '@/hooks/useResult';
import { getResultByIdAction } from '@/server/actions/results.actions';

// Mock the hooks and server actions
vi.mock('@/hooks/useResult', () => ({
  default: vi.fn(),
}));

vi.mock('@/server/actions/results.actions', () => ({
  getResultByIdAction: vi.fn(),
}));

// Mock the Spinner component
vi.mock('@/components/shared/Spinner', () => ({
  default: () => <div data-testid="spinner">Loading...</div>,
}));

describe('SearchExistingForm', () => {
  // Mock values and functions
  const mockSetResult = vi.fn();
  const mockSetLoading = vi.fn();
  const mockSetError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation for useResult
    (useResult as any).mockReturnValue({
      setResult: mockSetResult,
      loading: false,
      setLoading: mockSetLoading,
      error: null,
      setError: mockSetError,
    });

    // Default mock implementation for getResultByIdAction
    (getResultByIdAction as any).mockResolvedValue({
      success: true,
      data: { id: '123', result: 'test result' },
    });
  });

  it('renders the search form with input field and search button', () => {
    render(<SearchExistingForm />);

    // Check for the text input field
    const inputField = screen.getByLabelText('Search Existing Result ID');
    expect(inputField).toBeInTheDocument();
    expect(inputField).toHaveValue('');

    // Check for the search button
    const searchButton = screen.getByRole('button', { name: 'Search' });
    expect(searchButton).toBeInTheDocument();
    expect(searchButton).toBeDisabled(); // Button should be disabled initially (empty input)
  });

  it('enables the search button when search ID is entered', () => {
    render(<SearchExistingForm />);

    const inputField = screen.getByLabelText('Search Existing Result ID');
    const searchButton = screen.getByRole('button', { name: 'Search' });

    // Initial state - button should be disabled
    expect(searchButton).toBeDisabled();

    // Enter a search ID
    fireEvent.change(inputField, { target: { value: '123' } });

    // Button should now be enabled
    expect(searchButton).not.toBeDisabled();
    expect(inputField).toHaveValue('123');
  });

  it('disables input field and shows spinner when loading', () => {
    // Mock loading state
    (useResult as any).mockReturnValue({
      setResult: mockSetResult,
      loading: true,
      setLoading: mockSetLoading,
      error: null,
      setError: mockSetError,
    });

    render(<SearchExistingForm />);

    // Input field should be disabled
    const inputField = screen.getByLabelText('Search Existing Result ID');
    expect(inputField).toBeDisabled();

    // The error is because the endIcon adds "Loading..." to the accessible name
    // So we need to check for button content instead of accessible name
    const searchButton = screen.getByText('Searching...');
    expect(searchButton.closest('button')).toBeDisabled();

    // Spinner should be visible
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('shows error state on the input when there is an error', () => {
    // Mock error state
    (useResult as any).mockReturnValue({
      setResult: mockSetResult,
      loading: false,
      setLoading: mockSetLoading,
      error: 'Result not found',
      setError: mockSetError,
    });

    render(<SearchExistingForm />);

    // Input field should have error state
    const inputField = screen.getByLabelText('Search Existing Result ID');
    expect(inputField).toHaveAttribute('aria-invalid', 'true');
  });

  it('clears error when user types in the input field', () => {
    // Mock error state
    (useResult as any).mockReturnValue({
      setResult: mockSetResult,
      loading: false,
      setLoading: mockSetLoading,
      error: 'Result not found',
      setError: mockSetError,
    });

    render(<SearchExistingForm />);

    // Type in the input field
    const inputField = screen.getByLabelText('Search Existing Result ID');
    fireEvent.change(inputField, { target: { value: '456' } });

    // setError should be called with null
    expect(mockSetError).toHaveBeenCalledWith(null);
  });

  it('submits the form and calls getResultByIdAction with the search ID', async () => {
    render(<SearchExistingForm />);

    // Enter a search ID
    const inputField = screen.getByLabelText('Search Existing Result ID');
    fireEvent.change(inputField, { target: { value: '123' } });

    // Submit the form
    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);

    // Check that setLoading(true) was called
    expect(mockSetLoading).toHaveBeenCalledWith(true);

    // Check that setError(null) was called
    expect(mockSetError).toHaveBeenCalledWith(null);

    // Check that getResultByIdAction was called with the correct ID
    expect(getResultByIdAction).toHaveBeenCalledWith('123');

    // Wait for the async operation to complete
    await waitFor(() => {
      // Check that setResult was called with the correct data
      expect(mockSetResult).toHaveBeenCalledWith({ id: '123', result: 'test result' }, true);

      // Check that setSearchId was called to clear the input
      expect(inputField).toHaveValue('');

      // Check that setLoading(false) was called
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });
  });

  it('handles error when the API returns an error', async () => {
    // Mock API returning an error
    (getResultByIdAction as any).mockResolvedValue({
      success: false,
      error: 'Result not found',
    });

    render(<SearchExistingForm />);

    // Enter a search ID
    const inputField = screen.getByLabelText('Search Existing Result ID');
    fireEvent.change(inputField, { target: { value: '999' } });

    // Submit the form
    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);

    // Wait for the async operation to complete
    await waitFor(() => {
      // Check that setError was called with the error message
      expect(mockSetError).toHaveBeenCalledWith('Result not found');

      // Check that setLoading(false) was called
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });
  });

  it('handles exception when the API throws an error', async () => {
    // Mock API throwing an error
    const errorMessage = 'Network error';
    (getResultByIdAction as any).mockRejectedValue(new Error(errorMessage));

    // Spy on console.error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<SearchExistingForm />);

    // Enter a search ID
    const inputField = screen.getByLabelText('Search Existing Result ID');
    fireEvent.change(inputField, { target: { value: '999' } });

    // Submit the form
    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);

    // Wait for the async operation to complete
    await waitFor(() => {
      // Check that console.error was called
      expect(consoleSpy).toHaveBeenCalled();

      // Check that setError was called with the error message
      expect(mockSetError).toHaveBeenCalledWith(errorMessage);

      // Check that setLoading(false) was called
      expect(mockSetLoading).toHaveBeenCalledWith(false);
    });

    // Restore console.error
    consoleSpy.mockRestore();
  });

  it('trims the search ID before submitting', async () => {
    render(<SearchExistingForm />);

    // Enter a search ID with whitespace
    const inputField = screen.getByLabelText('Search Existing Result ID');
    fireEvent.change(inputField, { target: { value: '  123  ' } });

    // Submit the form
    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);

    // Check that getResultByIdAction was called with the trimmed ID
    expect(getResultByIdAction).toHaveBeenCalledWith('123');
  });
});
