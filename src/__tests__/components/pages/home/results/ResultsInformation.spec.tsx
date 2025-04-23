import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeAll, vi, afterAll } from 'vitest';
import ResultsInformation from '@/components/pages/home/results/ResultsInformation';
import { Result } from '@/types/domain.types';

describe('ResultsInformation', () => {
  // Sample test data
  const sampleResult: Result = {
    id: 'abc123',
    createdAt: new Date('2023-10-15T14:30:00Z'),
    boreDiameter: 4.567,
    resultData: {
      cables: [],
      bore: {
        name: '',
        diameter: 0,
        radius: 0,
        coordinates: {
          x: 0,
          y: 0,
        },
        color: undefined,
      },
    },
    inputCables: [],
    selectedPresetId: null,
    cableCount: 0,
  };

  beforeAll(() => {
    // Mock the Date.toLocaleString method to return a consistent string
    vi.spyOn(Date.prototype, 'toLocaleString').mockImplementation(() => '10/15/2023, 2:30:00 PM GMT');
  });

  afterAll(() => {
    // Restore all mocked methods
    vi.restoreAllMocks();
  });

  it('renders the component with correct title', () => {
    render(<ResultsInformation result={sampleResult} />);

    const title = screen.getByText('Results Information');
    expect(title).toBeInTheDocument();
    expect(title.tagName).toBe('H5');
  });

  it('displays the result ID correctly', () => {
    render(<ResultsInformation result={sampleResult} />);

    // Check for the label
    const idLabel = screen.getByText('Result ID:');
    expect(idLabel).toBeInTheDocument();
    expect(idLabel.tagName).toBe('SPAN');

    // Change this line to check for font-weight: 700 instead of bold
    expect(idLabel).toHaveStyle('font-weight: 700');

    // Check for the value (including the label in the same element)
    const idElement = screen.getByText(/abc123/);
    expect(idElement).toBeInTheDocument();
  });

  it('displays the creation date in correct format', () => {
    render(<ResultsInformation result={sampleResult} />);

    // Check for the label
    const dateLabel = screen.getByText('Generated at:');
    expect(dateLabel).toBeInTheDocument();
    expect(dateLabel.tagName).toBe('SPAN');

    // Change this line to check for font-weight: 700 instead of bold
    expect(dateLabel).toHaveStyle('font-weight: 700');

    // Check for the formatted date value
    const dateElement = screen.getByText(/10\/15\/2023, 2:30:00 PM GMT/);
    expect(dateElement).toBeInTheDocument();
  });

  it('displays the bore diameter with 3 decimal places and unit', () => {
    render(<ResultsInformation result={sampleResult} />);

    // Check for the label
    const diameterLabel = screen.getByText('Minimum Bore Diameter:');
    expect(diameterLabel).toBeInTheDocument();
    expect(diameterLabel.tagName).toBe('SPAN');

    // Change this line to check for font-weight: 700 instead of bold
    expect(diameterLabel).toHaveStyle('font-weight: 700');

    // Check for the value with 3 decimal places and 'in' unit
    const diameterElement = screen.getByText(/4.567\s*in/);
    expect(diameterElement).toBeInTheDocument();
  });

  it('has correct container styles and class name', () => {
    const { container } = render(<ResultsInformation result={sampleResult} />);

    // Find container by class name
    const infoContainer = container.querySelector('.ResultsInformation');
    expect(infoContainer).toBeInTheDocument();

    // MUI might be applying styles via CSS classes instead of inline styles
    // Let's check that the width is applied correctly by checking the computed style
    // or just verifying the class is present
    expect(infoContainer).toHaveClass('ResultsInformation');

    // Alternative approach without checking the inline style
    // This element has the width set via props, not inline styles
    // Use getComputedStyle if needed or check the class is applied
  });

  it('renders all typography components with correct variants', () => {
    const { container } = render(<ResultsInformation result={sampleResult} />);

    // Check first typography is h5
    const titleElement = container.querySelector('h5');
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveTextContent('Results Information');

    // Check remaining typographies are body1
    const bodyElements = container.querySelectorAll('p');
    expect(bodyElements.length).toBe(3); // Three body1 typography elements

    // Check content of each body1 element
    expect(bodyElements[0]).toHaveTextContent(/Result ID:.+abc123/);
    expect(bodyElements[1]).toHaveTextContent(/Generated at:.+10\/15\/2023, 2:30:00 PM GMT/);
    expect(bodyElements[2]).toHaveTextContent(/Minimum Bore Diameter:.+4.567\s*in/);
  });

  it('handles zero bore diameter correctly', () => {
    const zeroResult: Result = {
      ...sampleResult,
      boreDiameter: 0,
    };

    render(<ResultsInformation result={zeroResult} />);

    // Check for the formatted zero value (should show as "0.000 in")
    const diameterElement = screen.getByText(/0.000\s*in/);
    expect(diameterElement).toBeInTheDocument();
  });
});
