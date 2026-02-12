import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SearchExistingForm from '@/components/pages/home/header/SearchExistingForm';
import useResult from '@/hooks/useResult';

// Mock the hooks
vi.mock('@/hooks/useResult', () => ({
  default: vi.fn(),
}));

// Mock the Spinner component
vi.mock('@/components/shared/Spinner', () => ({
  default: () => <div data-testid="spinner">Loading...</div>,
}));

describe('SearchExistingForm', () => {
  // Mock values and functions
  const mockFetchResult = vi.fn();
  const mockSetError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation for useResult
    (useResult as any).mockReturnValue({
      loading: false,
      error: null,
      setError: mockSetError,
      fetchResult: mockFetchResult,
    });

    // Default mock implementation for fetchResult
    mockFetchResult.mockResolvedValue(true);
  });

  it('renders the search form with input field and search button', () => {
    render(<SearchExistingForm />);

    // Check for the text input field
    const inputField = screen.getByLabelText('Result ID');
    expect(inputField).toBeInTheDocument();
    expect(inputField).toHaveValue('');

    // Check for the search button
    const searchButton = screen.getByRole('button', { name: 'Search' });
    expect(searchButton).toBeInTheDocument();
    expect(searchButton).toBeDisabled(); // Button should be disabled initially (empty input)
  });

  it('enables the search button when search ID is entered', () => {
    render(<SearchExistingForm />);

    const inputField = screen.getByLabelText('Result ID');
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
      loading: true,
      error: null,
      setError: mockSetError,
      fetchResult: mockFetchResult,
    });

    render(<SearchExistingForm />);

    // Input field should be disabled
    const inputField = screen.getByLabelText('Result ID');
    expect(inputField).toBeDisabled();

    const searchButton = screen.getByText('Searching');
    expect(searchButton.closest('button')).toBeDisabled();

    // Spinner should be visible
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toBeInTheDocument();
  });

  it('shows error state on the input when there is an error', () => {
    // Mock error state
    (useResult as any).mockReturnValue({
      loading: false,
      error: 'Result not found',
      setError: mockSetError,
      fetchResult: mockFetchResult,
    });

    render(<SearchExistingForm />);

    // Input field should have error state
    const inputField = screen.getByLabelText('Result ID');
    expect(inputField).toHaveAttribute('aria-invalid', 'true');
  });

  it('clears error when user types in the input field', () => {
    // Mock error state
    (useResult as any).mockReturnValue({
      loading: false,
      error: 'Result not found',
      setError: mockSetError,
      fetchResult: mockFetchResult,
    });

    render(<SearchExistingForm />);

    // Type in the input field
    const inputField = screen.getByLabelText('Result ID');
    fireEvent.change(inputField, { target: { value: '456' } });

    // setError should be called with null
    expect(mockSetError).toHaveBeenCalledWith(null);
  });

  it('submits the form and calls fetchResult with the search ID', async () => {
    render(<SearchExistingForm />);

    // Enter a search ID
    const inputField = screen.getByLabelText('Result ID');
    fireEvent.change(inputField, { target: { value: '123' } });

    // Submit the form
    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);

    // Check that fetchResult was called with the correct ID
    expect(mockFetchResult).toHaveBeenCalledWith('123', 'push');

    // Wait for the async operation to complete
    await waitFor(() => {
      // Check that setSearchId was called to clear the input
      expect(inputField).toHaveValue('');
    });
  });

  it('keeps input value when fetchResult returns false', async () => {
    mockFetchResult.mockResolvedValue(false);

    render(<SearchExistingForm />);

    // Enter a search ID
    const inputField = screen.getByLabelText('Result ID');
    fireEvent.change(inputField, { target: { value: '999' } });

    // Submit the form
    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(mockFetchResult).toHaveBeenCalledWith('999', 'push');
      expect(inputField).toHaveValue('999');
    });
  });

  it('trims the search ID before submitting', async () => {
    render(<SearchExistingForm />);

    // Enter a search ID with whitespace
    const inputField = screen.getByLabelText('Result ID');
    fireEvent.change(inputField, { target: { value: '  123  ' } });

    // Submit the form
    const searchButton = screen.getByRole('button', { name: 'Search' });
    fireEvent.click(searchButton);

    // Check that fetchResult was called with the trimmed ID
    expect(mockFetchResult).toHaveBeenCalledWith('123', 'push');
  });
});
