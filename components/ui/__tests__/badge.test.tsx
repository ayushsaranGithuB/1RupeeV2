import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '../badge';

describe('Badge', () => {
  it('renders badge with text', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('applies default variant styles', () => {
    const { container } = render(<Badge>Default</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('applies variant styles correctly', () => {
    const { container: primaryContainer } = render(
      <Badge variant="default">Primary</Badge>
    );
    const primaryBadge = primaryContainer.firstChild;
    expect(primaryBadge).toHaveClass('bg-primary');

    const { container: secondaryContainer } = render(
      <Badge variant="secondary">Secondary</Badge>
    );
    const secondaryBadge = secondaryContainer.firstChild;
    expect(secondaryBadge).toHaveClass('bg-secondary');
  });

  it('renders with different content', () => {
    render(<Badge>Custom Label</Badge>);
    expect(screen.getByText('Custom Label')).toBeInTheDocument();
  });

  it('applies badge classes', () => {
    const { container } = render(<Badge>Test</Badge>);
    const badge = container.firstChild;
    expect(badge).toHaveClass('rounded-full', 'px-2.5', 'py-0.5', 'text-xs', 'font-semibold');
  });
});
