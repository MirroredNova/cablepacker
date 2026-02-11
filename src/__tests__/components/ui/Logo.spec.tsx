import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Logo from '@/components/ui/Logo';

describe('Logo Component', () => {
  it('renders the logo with correct attributes', () => {
    render(<Logo />);

    // Find the image
    const logoImage = screen.getByRole('img', { name: /cable packer logo/i });

    // Check image attributes
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute('src', '/logo.png');
    expect(logoImage).toHaveAttribute('alt', 'Cable Packer Logo');

    // Verify brand text is rendered
    expect(screen.getByRole('heading', { name: /cable packer/i, level: 1 })).toBeInTheDocument();
  });

  it('wraps the logo in a link to the homepage', () => {
    render(<Logo />);

    // Find the link
    const homeLink = screen.getByRole('link');

    // Check link attributes
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');

    // Verify the link contains the image
    const logoImage = screen.getByRole('img', { name: /cable packer logo/i });
    expect(homeLink).toContainElement(logoImage);
  });
});
