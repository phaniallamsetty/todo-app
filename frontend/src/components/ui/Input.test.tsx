import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
  it('renders label', () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('links label to input via htmlFor', () => {
    render(<Input label="Username" />);
    const input = screen.getByRole('textbox');
    const label = screen.getByText('Username');
    expect(label).toHaveAttribute('for', input.id);
  });

  it('displays error message', () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid email');
  });

  it('marks input invalid when error present', () => {
    render(<Input label="Email" error="Required" />);
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('displays helper text when no error', () => {
    render(<Input label="Password" helperText="Min 8 characters" />);
    expect(screen.getByText('Min 8 characters')).toBeInTheDocument();
  });

  it('hides helper text when error shown', () => {
    render(<Input label="Password" error="Too short" helperText="Min 8 characters" />);
    expect(screen.queryByText('Min 8 characters')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Too short');
  });
});
