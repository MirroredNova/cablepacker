import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ResultsGraphic from '@/components/pages/home/results/ResultsGraphic';
import { Circle } from '@/types/algorithm.types';

describe('ResultsGraphic', () => {
  // Sample test data
  const sampleBore: Circle = {
    radius: 1,
    coordinates: { x: 0, y: 0 },
    color: 'black',
    name: '',
    diameter: 0,
  };

  const sampleData: Circle[] = [
    {
      radius: 0.3,
      coordinates: { x: 0.5, y: 0.5 },
      color: 'red',
      name: '',
      diameter: 0,
    },
    {
      radius: 0.2,
      coordinates: { x: -0.5, y: 0.3 },
      color: 'blue',
      name: '',
      diameter: 0,
    },
    {
      radius: 0.25,
      coordinates: { x: 0.2, y: -0.4 },
      color: 'green',
      name: '',
      diameter: 0,
    },
  ];

  it('renders the component with bore and data circles', () => {
    render(<ResultsGraphic bore={sampleBore} data={sampleData} />);

    // Check container exists
    const container = document.querySelector('.ResultsGraphic');
    expect(container).toBeInTheDocument();

    // Check SVG element exists
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();

    // Count circles (1 bore + 3 data circles = 4 total)
    const circles = document.querySelectorAll('circle');
    expect(circles.length).toBe(4);
  });

  it('renders the bore circle with correct attributes', () => {
    render(<ResultsGraphic bore={sampleBore} data={sampleData} />);

    // Get all circles and find the one with fill="none" (the bore)
    const circles = document.querySelectorAll('circle');
    const boreCircle = Array.from(circles).find((circle) => circle.getAttribute('fill') === 'none');

    expect(boreCircle).toBeInTheDocument();
    expect(boreCircle?.getAttribute('cx')).toBe('0');
    expect(boreCircle?.getAttribute('cy')).toBe('0');
    expect(boreCircle?.getAttribute('r')).toBe('1.005'); // radius + strokeWidth/2
    expect(boreCircle?.getAttribute('stroke')).toBe('black');
    expect(boreCircle?.getAttribute('stroke-width')).toBe('0.01');
  });

  it('renders data circles with correct attributes and colors', () => {
    render(<ResultsGraphic bore={sampleBore} data={sampleData} />);

    // Get all circles except the bore circle
    const circles = document.querySelectorAll('circle');
    const dataCircles = Array.from(circles).filter((circle) => circle.getAttribute('fill') !== 'none');

    expect(dataCircles.length).toBe(3);

    // Check first data circle
    expect(dataCircles[0].getAttribute('cx')).toBe('0.5');
    expect(dataCircles[0].getAttribute('cy')).toBe('-0.5'); // y is inverted
    expect(dataCircles[0].getAttribute('r')).toBe('0.3');
    expect(dataCircles[0].getAttribute('fill')).toBe('red');

    // Check second data circle
    expect(dataCircles[1].getAttribute('cx')).toBe('-0.5');
    expect(dataCircles[1].getAttribute('cy')).toBe('-0.3'); // y is inverted
    expect(dataCircles[1].getAttribute('r')).toBe('0.2');
    expect(dataCircles[1].getAttribute('fill')).toBe('blue');

    // Check third data circle
    expect(dataCircles[2].getAttribute('cx')).toBe('0.2');
    expect(dataCircles[2].getAttribute('cy')).toBe('0.4'); // y is inverted
    expect(dataCircles[2].getAttribute('r')).toBe('0.25');
    expect(dataCircles[2].getAttribute('fill')).toBe('green');
  });

  it('calculates viewBox correctly to fit all circles', () => {
    render(<ResultsGraphic bore={sampleBore} data={sampleData} />);

    const svg = document.querySelector('svg');
    const viewBox = svg?.getAttribute('viewBox');

    // Calculate expected viewBox based on the provided algorithm
    const xMin = -1.005 - 0.01; // bore.x - (bore.radius + strokeWidth/2) - padding
    const xMax = 1.005 + 0.01; // bore.x + (bore.radius + strokeWidth/2) + padding
    const yMin = -1.005 - 0.01; // bore.y - (bore.radius + strokeWidth/2) - padding
    const yMax = 1.005 + 0.01; // bore.y + (bore.radius + strokeWidth/2) + padding
    const width = xMax - xMin;
    const height = yMax - yMin;

    const expectedViewBox = `${xMin} ${-yMax} ${width} ${height}`;
    expect(viewBox).toBe(expectedViewBox);
  });

  it('uses default black color when bore color is not provided', () => {
    const boreWithoutColor: Circle = {
      radius: 1,
      coordinates: { x: 0, y: 0 },
      name: '',
      diameter: 0,
    };

    render(<ResultsGraphic bore={boreWithoutColor} data={sampleData} />);

    const boreCircle = document.querySelector('circle[fill="none"]');
    expect(boreCircle?.getAttribute('stroke')).toBe('black');
  });

  it('handles an empty data array properly', () => {
    render(<ResultsGraphic bore={sampleBore} data={[]} />);

    // Should still render the bore circle
    const circles = document.querySelectorAll('circle');
    expect(circles.length).toBe(1);

    // Only the bore circle should exist
    const boreCircle = document.querySelector('circle[fill="none"]');
    expect(boreCircle).toBeInTheDocument();
  });

  it('maintains SVG aspect ratio correctly', () => {
    render(<ResultsGraphic bore={sampleBore} data={sampleData} />);

    const svg = document.querySelector('svg');
    expect(svg?.getAttribute('preserveAspectRatio')).toBe('xMidYMid meet');
  });

  it('renders Box component with correct className and styles', () => {
    render(<ResultsGraphic bore={sampleBore} data={sampleData} />);

    const box = document.querySelector('.ResultsGraphic');
    expect(box).toHaveStyle('min-width: 300px');
  });
});
