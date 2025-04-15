import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Spinner from '@/components/shared/Spinner';

describe('Spinner Component', () => {
  it('renders a circular progress with default styling', () => {
    render(<Spinner />);

    // Find the circular progress
    const spinner = screen.getByRole('progressbar');

    // Check that it exists
    expect(spinner).toBeInTheDocument();

    // Check size
    expect(spinner).toHaveStyle({
      width: '20px',
      height: '20px',
    });

    // Verify it doesn't have the positioning styles
    expect(spinner).not.toHaveStyle({
      position: 'absolute',
      top: '55%',
      left: '90%',
    });
  });

  it('applies positioning styles when select prop is true', () => {
    render(<Spinner select />);

    // Find the circular progress
    const spinner = screen.getByRole('progressbar');

    // Check that it exists
    expect(spinner).toBeInTheDocument();

    // Verify it has the correct positioning styles
    expect(spinner).toHaveStyle({
      position: 'absolute',
      top: '55%',
      left: '90%',
      marginTop: '-12px',
      marginLeft: '-12px',
    });
  });
});
