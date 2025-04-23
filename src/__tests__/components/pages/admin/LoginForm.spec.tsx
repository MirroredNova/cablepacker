import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginForm from '@/components/pages/admin/LoginForm';

// Mock the server action
vi.mock('@/server/actions/admin.actions', () => ({
  signInAction: vi.fn(),
}));

describe('LoginForm', () => {
  it('renders the login form with title', () => {
    render(<LoginForm />);
    // Use a more specific query to target just the heading
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
  });

  it('includes username and password input fields', () => {
    render(<LoginForm />);

    // Username field
    const usernameLabel = screen.getByLabelText('Username');
    expect(usernameLabel).toBeInTheDocument();
    expect(usernameLabel).toHaveAttribute('type', 'username');
    expect(usernameLabel).toHaveAttribute('name', 'username');
    expect(usernameLabel).toHaveAttribute('required');
    expect(usernameLabel).toHaveAttribute('id', 'username');
    expect(usernameLabel).toHaveAttribute('placeholder', 'username');
    expect(usernameLabel).toHaveAttribute('autocomplete', 'username');

    // Password field
    const passwordLabel = screen.getByLabelText('Password');
    expect(passwordLabel).toBeInTheDocument();
    expect(passwordLabel).toHaveAttribute('type', 'password');
    expect(passwordLabel).toHaveAttribute('name', 'password');
    expect(passwordLabel).toHaveAttribute('required');
    expect(passwordLabel).toHaveAttribute('id', 'password');
    expect(passwordLabel).toHaveAttribute('placeholder', '••••••••');
    expect(passwordLabel).toHaveAttribute('autocomplete', 'current-password');
  });

  it('has a sign in button', () => {
    render(<LoginForm />);

    const signInButton = screen.getByRole('button', { name: 'Sign in' });
    expect(signInButton).toBeInTheDocument();
    expect(signInButton).toHaveAttribute('type', 'submit');
  });

  it('sets up the form with the correct action', () => {
    const { container } = render(<LoginForm />);

    // Use querySelector instead of getByRole since the form element doesn't have an explicit role
    const form = container.querySelector('form');
    expect(form).toBeInTheDocument();

    // Check the form's action attribute is set
    expect(form).toHaveAttribute('action');

    // We can't directly compare functions in the attribute, but we can check it's present
    const actionAttr = form!.getAttribute('action');
    expect(actionAttr).not.toBeNull();
  });

  it('renders a form with the proper markup structure', () => {
    const { container } = render(<LoginForm />);

    // Check overall form structure
    const outerStack = container.firstChild;
    expect(outerStack).toBeInTheDocument();

    // Note: Material-UI creates nested FormControl elements
    // 2 outer FormControls (one for each field) and 2 inner ones for TextField components
    const formControls = container.querySelectorAll('.MuiFormControl-root');
    expect(formControls.length).toBe(4); // Updated to match actual DOM structure

    // Check if both outer fields have the fullWidth prop applied
    const fullWidthControls = container.querySelectorAll('.MuiFormControl-fullWidth');
    expect(fullWidthControls.length).toBe(2);
  });

  it('correctly sets up accessibility attributes', () => {
    render(<LoginForm />);

    // Check that labels are properly associated with inputs
    const usernameLabel = screen.getByText('Username');
    expect(usernameLabel).toHaveAttribute('for', 'username');

    const passwordLabel = screen.getByText('Password');
    expect(passwordLabel).toHaveAttribute('for', 'password');

    // Check required attribute instead of aria-required
    // Material-UI TextField uses the 'required' attribute directly
    const usernameInput = screen.getByLabelText('Username');
    expect(usernameInput).toHaveAttribute('required');

    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput).toHaveAttribute('required');
  });
});
