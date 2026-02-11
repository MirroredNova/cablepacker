import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ResultsCables from '@/components/pages/home/results/ResultsCables';
import { Circle, Point } from '@/types/algorithm.types';

describe('ResultsCables', () => {
  // Sample test data with correct types
  const sampleCables: Circle[] = [
    {
      name: 'Cable A',
      diameter: 2.0,
      radius: 1.0,
      coordinates: { x: 10, y: 10 } as Point,
      color: '#ff0000',
    },
    {
      name: 'Cable B',
      diameter: 3.5,
      radius: 1.75,
      coordinates: { x: 20, y: 20 } as Point,
      color: '#00ff00',
    },
    {
      name: 'Cable A',
      diameter: 2.0,
      radius: 1.0,
      coordinates: { x: 30, y: 30 } as Point,
      color: '#ff0000',
    }, // Duplicate of first cable
    {
      name: 'Cable C',
      diameter: 1.5,
      radius: 0.75,
      coordinates: { x: 40, y: 40 } as Point,
      color: '#0000ff',
    },
  ];

  it('renders the component with a heading', () => {
    render(<ResultsCables cables={sampleCables} />);

    // Check that the heading is rendered
    expect(screen.getByText('Cables')).toBeInTheDocument();
  });

  it('renders a table with the correct headers', () => {
    render(<ResultsCables cables={sampleCables} />);

    // Check for table headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Diameter')).toBeInTheDocument();
    expect(screen.getByText('Quantity')).toBeInTheDocument();
    expect(screen.getByText('Color')).toBeInTheDocument();
  });

  it('correctly groups cables by name and diameter', () => {
    render(<ResultsCables cables={sampleCables} />);

    // We should have 3 unique cables (Cable A appears twice but should be grouped)
    const rows = screen.getAllByRole('row');
    // +1 for the header row
    expect(rows).toHaveLength(4);

    // Check Cable A row
    expect(screen.getByText('Cable A')).toBeInTheDocument();
    // Find the row containing Cable A to check its values
    const cableARow = rows.find((row) => row.textContent?.includes('Cable A'));
    expect(cableARow).toBeDefined();
    expect(cableARow?.textContent).toContain('2.0'); // diameter
    expect(cableARow?.textContent).toContain('2'); // quantity

    // Check Cable B row
    expect(screen.getByText('Cable B')).toBeInTheDocument();
    const cableBRow = rows.find((row) => row.textContent?.includes('Cable B'));
    expect(cableBRow).toBeDefined();
    expect(cableBRow?.textContent).toContain('3.5'); // diameter
    expect(cableBRow?.textContent).toContain('1'); // quantity

    // Check Cable C row
    expect(screen.getByText('Cable C')).toBeInTheDocument();
    const cableCRow = rows.find((row) => row.textContent?.includes('Cable C'));
    expect(cableCRow).toBeDefined();
    expect(cableCRow?.textContent).toContain('1.5'); // diameter
    expect(cableCRow?.textContent).toContain('1'); // quantity
  });

  it('renders color boxes with the correct colors', () => {
    render(<ResultsCables cables={sampleCables} />);

    // Find all the color boxes
    const colorBoxes = document.querySelectorAll('[title]');
    expect(colorBoxes).toHaveLength(3);

    // Check for specific color boxes with correct titles
    const cableAColorBox = document.querySelector('[title="Cable A (2in)"]');
    expect(cableAColorBox).toBeInTheDocument();
    expect(cableAColorBox).toHaveStyle('background-color: #ff0000');

    const cableBColorBox = document.querySelector('[title="Cable B (3.5in)"]');
    expect(cableBColorBox).toBeInTheDocument();
    expect(cableBColorBox).toHaveStyle('background-color: #00ff00');

    const cableCColorBox = document.querySelector('[title="Cable C (1.5in)"]');
    expect(cableCColorBox).toBeInTheDocument();
    expect(cableCColorBox).toHaveStyle('background-color: #0000ff');
  });

  it('formats diameters to one decimal place', () => {
    // Add a cable with more decimal places
    const cablesWithExtraDecimals: Circle[] = [
      ...sampleCables,
      {
        name: 'Cable D',
        diameter: 4.567,
        radius: 2.2835,
        coordinates: { x: 50, y: 50 } as Point,
        color: '#ffff00',
      },
    ];

    render(<ResultsCables cables={cablesWithExtraDecimals} />);

    // Check that the diameter is correctly formatted to one decimal place
    expect(screen.getByText('4.567')).toBeInTheDocument();
  });

  it('handles empty cables array', () => {
    render(<ResultsCables cables={[]} />);

    // Check that the heading is still rendered
    expect(screen.getByText('Cables')).toBeInTheDocument();

    // Check that the table headers are rendered
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Diameter')).toBeInTheDocument();
    expect(screen.getByText('Quantity')).toBeInTheDocument();
    expect(screen.getByText('Color')).toBeInTheDocument();

    // Check that no cable rows are rendered (only the header row)
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(1);
  });

  it('correctly handles cables with same name but different diameters', () => {
    const cablesWithSameName: Circle[] = [
      {
        name: 'Cable X',
        diameter: 2.0,
        radius: 1.0,
        coordinates: { x: 10, y: 10 } as Point,
        color: '#ff0000',
      },
      {
        name: 'Cable X',
        diameter: 3.0,
        radius: 1.5,
        coordinates: { x: 20, y: 20 } as Point,
        color: '#00ff00',
      },
    ];

    render(<ResultsCables cables={cablesWithSameName} />);

    // We should have 2 different cables
    const rows = screen.getAllByRole('row');
    // +1 for the header row
    expect(rows).toHaveLength(3);

    // There should be two "Cable X" entries (one for each diameter)
    const cableXEntries = screen.getAllByText('Cable X');
    expect(cableXEntries).toHaveLength(2);

    // Check for both diameters
    expect(screen.getByText('2.000')).toBeInTheDocument();
    expect(screen.getByText('3.000')).toBeInTheDocument();
  });
});
