import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HeaderPresetSelect from '@/components/pages/home/header/HeaderPresetSelect';
import usePreset from '@/hooks/usePreset';
import useResult from '@/hooks/useResult';
import useTable from '@/hooks/useTable';
import { Preset } from '@/types/domain.types';

// Mock the hooks
vi.mock('@/hooks/usePreset', () => ({
  default: vi.fn(),
}));

vi.mock('@/hooks/useResult', () => ({
  default: vi.fn(),
}));

vi.mock('@/hooks/useTable', () => ({
  default: vi.fn(),
}));

// Mock the Spinner component
vi.mock('@/components/shared/Spinner', () => ({
  default: ({ select }: { select?: boolean }) => (
    <div data-testid="spinner" data-select={select ? 'true' : 'false'}>
      Loading...
    </div>
  ),
}));

// Mock the ArrowDropDownIcon
vi.mock('@mui/icons-material/ArrowDropDown', () => ({
  default: () => <div data-testid="arrow-icon">Arrow Icon</div>,
}));

describe('HeaderPresetSelect', () => {
  // Sample presets for testing
  const mockPresets: Preset[] = [
    {
      id: 1,
      name: 'Preset 1',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    {
      id: 2,
      name: 'Preset 2',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
  ];

  // Mock functions
  const mockSetSelectedPreset = vi.fn();
  const mockResetTableData = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    (usePreset as any).mockReturnValue({
      presets: mockPresets,
      selectedPreset: null,
      setSelectedPreset: mockSetSelectedPreset,
      presetsLoaded: true,
      loading: false,
    });

    (useResult as any).mockReturnValue({
      loading: false,
    });

    (useTable as any).mockReturnValue({
      resetTableData: mockResetTableData,
    });
  });

  // Helper function to get the select component by ID instead of role+name
  const getSelect = () => screen.getByRole('combobox');

  it('renders a select component with presets', async () => {
    render(<HeaderPresetSelect />);

    // The select should be in the document
    const select = getSelect();
    expect(select).toBeInTheDocument();

    // Open the dropdown to check options
    fireEvent.mouseDown(select);

    // Check that all options are rendered
    expect(screen.getByText('None')).toBeInTheDocument();
    expect(screen.getByText('Preset 1')).toBeInTheDocument();
    expect(screen.getByText('Preset 2')).toBeInTheDocument();
  });

  it('shows the selected preset name when a preset is selected', () => {
    // Mock a selected preset
    (usePreset as any).mockReturnValue({
      presets: mockPresets,
      selectedPreset: mockPresets[0],
      setSelectedPreset: mockSetSelectedPreset,
      presetsLoaded: true,
      loading: false,
    });

    render(<HeaderPresetSelect />);

    // The select should display the selected preset name
    const select = getSelect();
    expect(select).toHaveTextContent('Preset 1');
  });

  it('shows empty value when no preset is selected', () => {
    render(<HeaderPresetSelect />);

    const select = getSelect();
    expect(select.textContent?.length).toBeLessThan(2);
  });

  it('calls setSelectedPreset and resetTableData when a new preset is selected', () => {
    render(<HeaderPresetSelect />);

    // Open the dropdown
    const select = getSelect();
    fireEvent.mouseDown(select);

    // Select a preset
    fireEvent.click(screen.getByText('Preset 2'));

    // Check that the functions were called with correct arguments
    expect(mockSetSelectedPreset).toHaveBeenCalledTimes(1);
    expect(mockSetSelectedPreset).toHaveBeenCalledWith(mockPresets[1]);
    expect(mockResetTableData).toHaveBeenCalledTimes(1);
  });

  it('is disabled when loading', () => {
    // Mock loading state
    (usePreset as any).mockReturnValue({
      presets: mockPresets,
      selectedPreset: null,
      setSelectedPreset: mockSetSelectedPreset,
      presetsLoaded: true,
      loading: true,
    });

    render(<HeaderPresetSelect />);

    // Check for disabled attribute directly
    const selectElement = document.querySelector('.MuiInputBase-root');
    expect(selectElement).toHaveClass('Mui-disabled');
  });

  it('is disabled when presets are not loaded', () => {
    // Mock presets not loaded
    (usePreset as any).mockReturnValue({
      presets: mockPresets,
      selectedPreset: null,
      setSelectedPreset: mockSetSelectedPreset,
      presetsLoaded: false,
      loading: false,
    });

    render(<HeaderPresetSelect />);

    // Check for disabled attribute directly
    const selectElement = document.querySelector('.MuiInputBase-root');
    expect(selectElement).toHaveClass('Mui-disabled');
  });

  it('is disabled when result is loading', () => {
    // Mock result loading
    (useResult as any).mockReturnValue({
      loading: true,
    });

    render(<HeaderPresetSelect />);

    // Check for disabled attribute directly
    const selectElement = document.querySelector('.MuiInputBase-root');
    expect(selectElement).toHaveClass('Mui-disabled');
  });

  it('shows spinner icon when loading', () => {
    // Mock loading state
    (usePreset as any).mockReturnValue({
      presets: mockPresets,
      selectedPreset: null,
      setSelectedPreset: mockSetSelectedPreset,
      presetsLoaded: false,
      loading: true,
    });

    render(<HeaderPresetSelect />);

    // The spinner should be visible
    const spinner = screen.getByTestId('spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveAttribute('data-select', 'true');

    // The arrow icon should not be visible
    expect(screen.queryByTestId('arrow-icon')).not.toBeInTheDocument();
  });

  it('shows arrow icon when not loading', () => {
    render(<HeaderPresetSelect />);

    // The arrow icon should be visible
    const arrowIcon = screen.getByTestId('arrow-icon');
    expect(arrowIcon).toBeInTheDocument();

    // The spinner should not be visible
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
  });
});
