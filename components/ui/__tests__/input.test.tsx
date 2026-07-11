import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../input';

describe('Input', () => {
  it('renders input element', () => {
    render(<Input />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('accepts placeholder text', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('handles type prop', () => {
    render(<Input type="email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('accepts user input', async () => {
    const user = userEvent.setup();
    render(<Input />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    await user.type(input, 'hello world');

    expect(input.value).toBe('hello world');
  });

  it('handles value prop', () => {
    render(<Input value="initial value" onChange={() => {}} />);
    expect(screen.getByDisplayValue('initial value')).toBeInTheDocument();
  });

  it('respects disabled state', async () => {
    const user = userEvent.setup();
    render(<Input disabled />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();

    await user.type(input, 'text');
    expect((input as HTMLInputElement).value).toBe('');
  });

  it('calls onChange callback', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Input onChange={handleChange} />);
    await user.type(screen.getByRole('textbox'), 'test');

    expect(handleChange).toHaveBeenCalled();
  });
});
