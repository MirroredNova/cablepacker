import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SelectedPresetHeader from '@/components/pages/admin/presets/SelectedPresetHeader';
import useAdmin from '@/hooks/useAdmin';
import { Preset } from '@/types/domain.types';

// Mock the useAdmin hook
vi.mock('@/hooks/useAdmin', () => ({
  default: vi.fn(),
}));

describe('SelectedPresetHeader', () => {
  it('displays "Select a preset" when no preset is selected', () => {
    (useAdmin as any).mockReturnValue({
      selectedPreset: null,
    });

    render(<SelectedPresetHeader />);

    expect(screen.getByText('Select a preset')).toBeInTheDocument();
  });

  it('displays the selected preset name when a preset is selected', () => {
    const mockPreset: Preset = {
      id: 1,
      name: 'Test Preset',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    };

    (useAdmin as any).mockReturnValue({
      selectedPreset: mockPreset,
    });

    render(<SelectedPresetHeader />);

    expect(screen.getByText('Cables in Test Preset')).toBeInTheDocument();
  });
});
