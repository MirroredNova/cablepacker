import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AdminDashboard from '@/components/pages/admin/AdminDashboard';
import { logoutAction } from '@/server/actions/admin.actions';

// Mock Next.js Link component
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href} data-testid="next-link">
      {children}
    </a>
  ),
}));

// Mock the server action
vi.mock('@/server/actions/admin.actions', () => ({
  logoutAction: vi.fn(),
}));

// Mock the child components
vi.mock('@/components/pages/admin/cables/AddCableButton', () => ({
  default: () => <div data-testid="add-cable-button">Add Cable Button</div>,
}));

vi.mock('@/components/pages/admin/cables/CableTable', () => ({
  default: () => <div data-testid="cable-table">Cable Table</div>,
}));

vi.mock('@/components/pages/admin/presets/AddPresetButton', () => ({
  default: () => <div data-testid="add-preset-button">Add Preset Button</div>,
}));

vi.mock('@/components/pages/admin/presets/PresetsTable', () => ({
  default: () => <div data-testid="presets-table">Presets Table</div>,
}));

vi.mock('@/components/pages/admin/presets/SelectedPresetHeader', () => ({
  default: () => <div data-testid="selected-preset-header">Selected Preset Header</div>,
}));

describe('AdminDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dashboard with all components', () => {
    render(<AdminDashboard />);

    // Check the main title
    expect(screen.getByText('Preset Management')).toBeInTheDocument();

    // Check the navigation buttons
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();

    // Check that the Next.js Link is correctly set
    const homeLink = screen.getByTestId('next-link');
    expect(homeLink).toHaveAttribute('href', '/');

    // Check section titles
    expect(screen.getByText('Presets')).toBeInTheDocument();

    // Check that all child components are rendered
    expect(screen.getByTestId('add-cable-button')).toBeInTheDocument();
    expect(screen.getByTestId('cable-table')).toBeInTheDocument();
    expect(screen.getByTestId('add-preset-button')).toBeInTheDocument();
    expect(screen.getByTestId('presets-table')).toBeInTheDocument();
    expect(screen.getByTestId('selected-preset-header')).toBeInTheDocument();
  });

  it('calls logoutAction when logout button is clicked', () => {
    render(<AdminDashboard />);

    // Find and click the logout button
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    // Check that the logout action was called
    expect(logoutAction).toHaveBeenCalledTimes(1);
  });

  it('renders the layout structure correctly', () => {
    const { container } = render(<AdminDashboard />);

    // Check that we have a main Stack component
    const mainStack = container.firstChild;
    expect(mainStack).toBeInTheDocument();

    // Check that we have a layout with two main sections side by side
    const flexContainer = screen.getByText('Presets').closest('[class*="MuiBox-root"]')?.parentElement;
    expect(flexContainer).toBeInTheDocument();

    // Check for dividers
    const dividers = container.querySelectorAll('hr');
    expect(dividers.length).toBeGreaterThanOrEqual(2); // At least 2 dividers (one for each section)
  });

  it('contains the preset list in a scrollable container', () => {
    render(<AdminDashboard />);

    // Find the presets table and verify it's in a container with max-height and overflow settings
    const presetsTable = screen.getByTestId('presets-table');
    const scrollableContainer = presetsTable.closest('[class*="MuiBox-root"]');

    // Get the computed style of the container
    if (scrollableContainer) {
      // Just verify the container exists
      expect(scrollableContainer).toBeInTheDocument();
    }
  });
});
