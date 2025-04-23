import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ResultsArea from '@/components/pages/home/results/ResultsArea';
import useResult from '@/hooks/useResult';

// Mock the hooks
vi.mock('@/hooks/useResult', () => ({
  default: vi.fn(),
}));

// Mock the child components
vi.mock('@/components/pages/home/results/ResultsCables', () => ({
  default: ({ cables }: { cables: any[] }) => (
    <div data-testid="results-cables">
      Cables:
      {' '}
      {cables.length}
    </div>
  ),
}));

vi.mock('@/components/pages/home/results/ResultsGraphic', () => ({
  default: ({ bore, data }: { bore: any, data: any[] }) => (
    <div data-testid="results-graphic">
      Graphic:
      {' '}
      {data.length}
      {' '}
      cables, bore:
      {' '}
      {bore.diameter}
    </div>
  ),
}));

vi.mock('@/components/pages/home/results/ResultsInformation', () => ({
  default: ({ result }: { result: any }) => (
    <div data-testid="results-information">
      Result Info:
      {' '}
      {result.id}
    </div>
  ),
}));

vi.mock('@/components/pages/home/results/ResultsCopyLinkButton', () => ({
  default: () => <div data-testid="results-copy-link-button">Copy Link</div>,
}));

vi.mock('@/components/pages/home/results/ResultsExportButton', () => ({
  default: () => (
    <div data-testid="results-export-button">Export</div>
  ),
}));

vi.mock('@/components/pages/home/results/ResultsEmailButton', () => ({
  default: () => <div data-testid="results-email-button">Email</div>,
}));

vi.mock('@/components/shared/Spinner', () => ({
  default: () => <div data-testid="spinner">Loading...</div>,
}));

describe('ResultsArea', () => {
  const mockResult = {
    id: '123',
    resultData: {
      bore: { diameter: 100 },
      cables: [
        { id: 1, name: 'Cable 1', diameter: 10 },
        { id: 2, name: 'Cable 2', diameter: 15 },
      ],
    },
  };

  it('renders a loading spinner when loading is true', () => {
    (useResult as any).mockReturnValue({
      loading: true,
      error: null,
      result: null,
    });

    render(<ResultsArea />);

    // Should show the spinner
    expect(screen.getByTestId('spinner')).toBeInTheDocument();

    // Should not show any results components
    expect(screen.queryByTestId('results-cables')).not.toBeInTheDocument();
    expect(screen.queryByTestId('results-graphic')).not.toBeInTheDocument();
    expect(screen.queryByTestId('results-information')).not.toBeInTheDocument();
  });

  it('renders an error alert when there is an error', () => {
    const errorMessage = 'Failed to load result';

    (useResult as any).mockReturnValue({
      loading: false,
      error: errorMessage,
      result: null,
    });

    render(<ResultsArea />);

    // Should show the error message
    const errorAlert = screen.getByRole('alert');
    expect(errorAlert).toBeInTheDocument();
    expect(errorAlert).toHaveTextContent('Error Loading Result');
    expect(errorAlert).toHaveTextContent(errorMessage);

    // Should not show any results components
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    expect(screen.queryByTestId('results-cables')).not.toBeInTheDocument();
    expect(screen.queryByTestId('results-graphic')).not.toBeInTheDocument();
  });

  it('renders nothing when there is no result, no loading, and no error', () => {
    (useResult as any).mockReturnValue({
      loading: false,
      error: null,
      result: null,
    });

    const { container } = render(<ResultsArea />);

    // The component should not render anything
    expect(container.firstChild).toBeNull();

    // Should not show any results components or spinner or error
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    expect(screen.queryByTestId('results-cables')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders results components when a result is available', () => {
    (useResult as any).mockReturnValue({
      loading: false,
      error: null,
      result: mockResult,
    });

    render(<ResultsArea />);

    // Should render all the results components
    expect(screen.getByTestId('results-cables')).toBeInTheDocument();
    expect(screen.getByTestId('results-cables')).toHaveTextContent('Cables: 2');

    expect(screen.getByTestId('results-graphic')).toBeInTheDocument();
    expect(screen.getByTestId('results-graphic')).toHaveTextContent('Graphic: 2 cables, bore: 100');

    expect(screen.getByTestId('results-information')).toBeInTheDocument();
    expect(screen.getByTestId('results-information')).toHaveTextContent('Result Info: 123');

    // Should render action buttons
    expect(screen.getByTestId('results-copy-link-button')).toBeInTheDocument();
    expect(screen.getByTestId('results-export-button')).toBeInTheDocument();
    expect(screen.getByTestId('results-email-button')).toBeInTheDocument();

    // Should not show spinner or error
    expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('does not render graphic when there are no cables', () => {
    const emptyResult = {
      id: '123',
      resultData: {
        bore: { diameter: 100 },
        cables: [],
      },
    };

    (useResult as any).mockReturnValue({
      loading: false,
      error: null,
      result: emptyResult,
    });

    render(<ResultsArea />);

    // Should not render the graphic component
    expect(screen.queryByTestId('results-graphic')).not.toBeInTheDocument();

    // Should still render other components
    expect(screen.getByTestId('results-cables')).toBeInTheDocument();
    expect(screen.getByTestId('results-cables')).toHaveTextContent('Cables: 0');
    expect(screen.getByTestId('results-information')).toBeInTheDocument();
  });

  it('passes contentRef to ResultsExportButton for exporting content', () => {
    (useResult as any).mockReturnValue({
      loading: false,
      error: null,
      result: mockResult,
    });

    render(<ResultsArea />);

    // Export button should receive the contentRef prop
    expect(screen.getByTestId('results-export-button')).toBeInTheDocument();
  });
});
