import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Logo from '@/components/ui/Logo';

describe('Logo Component', () => {
  it('renders the logo with correct attributes', () => {
    render(<Logo />);

    // Find the image
    const logoImage = screen.getByRole('img', { name: /alliant energy logo/i });

    // Check image attributes
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('src', '/logo.svg');
    expect(logoImage).toHaveAttribute('alt', 'Alliant Energy Logo');

    // Verify height attributes from MUI Box
    expect(logoImage).toHaveStyle({
      height: '120px',
      maxHeight: '120px',
    });
  });

  it('wraps the logo in a link to the homepage', () => {
    render(<Logo />);

    // Find the link
    const homeLink = screen.getByRole('link');

    // Check link attributes
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');

    // Verify the link contains the image
    const logoImage = screen.getByRole('img', { name: /alliant energy logo/i });
    expect(homeLink).toContainElement(logoImage);
  });
});
