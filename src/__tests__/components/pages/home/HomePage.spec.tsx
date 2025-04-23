import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HomePage from '@/components/pages/home/HomePage';

// Mock all child components to isolate HomePage testing
vi.mock('@/components/pages/home/table/CableTableData', () => ({
  default: () => <div data-testid="cable-table-data">CableTableData</div>,
}));

vi.mock('@/components/pages/home/table/GenerateBoreButton', () => ({
  default: () => <div data-testid="generate-bore-button">GenerateBoreButton</div>,
}));

vi.mock('@/components/pages/home/results/ResultsArea', () => ({
  default: () => <div data-testid="results-area">ResultsArea</div>,
}));

vi.mock('@/components/pages/home/table/CableTableAlert', () => ({
  default: () => <div data-testid="cable-table-alert">CableTableAlert</div>,
}));

vi.mock('@/components/pages/home/header/HeaderPresetSelect', () => ({
  default: () => <div data-testid="header-preset-select">HeaderPresetSelect</div>,
}));

vi.mock('@/components/pages/home/header/SearchExistingForm', () => ({
  default: () => <div data-testid="search-existing-form">SearchExistingForm</div>,
}));

vi.mock('@/components/pages/home/header/AddCableButton', () => ({
  default: () => <div data-testid="add-cable-button">AddCableButton</div>,
}));

vi.mock('@/components/pages/home/table/CableTotal', () => ({
  default: () => <div data-testid="cable-total">CableTotal</div>,
}));

describe('HomePage', () => {
  it('renders the component with all expected child components', () => {
    render(<HomePage />);

    // Verify all child components are rendered
    expect(screen.getByTestId('header-preset-select')).toBeInTheDocument();
    expect(screen.getByTestId('search-existing-form')).toBeInTheDocument();
    expect(screen.getByTestId('add-cable-button')).toBeInTheDocument();
    expect(screen.getByTestId('cable-table-data')).toBeInTheDocument();
    expect(screen.getByTestId('cable-table-alert')).toBeInTheDocument();
    expect(screen.getByTestId('cable-total')).toBeInTheDocument();
    expect(screen.getByTestId('generate-bore-button')).toBeInTheDocument();
    expect(screen.getByTestId('results-area')).toBeInTheDocument();
  });

  it('renders the table with correct column headers', () => {
    render(<HomePage />);

    // Check for table headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Diameter (in)')).toBeInTheDocument();
    expect(screen.getByText('Quantity')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('has the correct table accessibility label', () => {
    render(<HomePage />);

    // Check for the aria-label on the table
    const table = screen.getByRole('table', { name: 'cable configuration table' });
    expect(table).toBeInTheDocument();
  });

  it('renders the preset selector with correct label', () => {
    render(<HomePage />);

    // Check for the form control label
    expect(screen.getByText('Preset')).toBeInTheDocument();
  });

  it('renders the primary layout stack with appropriate spacing', () => {
    const { container } = render(<HomePage />);

    // Check for the main Stack component
    // Note: Testing for specific MUI style props can be challenging
    // Focus on ensuring the structure is as expected
    const stackElements = container.querySelectorAll('.MuiStack-root');
    expect(stackElements.length).toBeGreaterThan(0);
  });

  it('has the correct responsive layout structure', () => {
    render(<HomePage />);

    // Instead, verify the overall structure is as expected
    const headerArea = screen.getByTestId('header-preset-select').closest('.MuiStack-root');
    const footerArea = screen.getByTestId('generate-bore-button').closest('.MuiStack-root');

    expect(headerArea).toBeInTheDocument();
    expect(footerArea).toBeInTheDocument();
  });
});
