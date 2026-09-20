/**
 * Divider — behavior scenarios from the component doc, one test each, in the doc's order.
 */
import type { ComponentProps } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Divider } from './Divider';
import meta from './Divider.stories';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<ComponentProps<typeof Divider>> = {}) {
  const props = { ...meta.args, ...given } as ComponentProps<typeof Divider>;
  return render(<Divider {...props} />);
}

function root(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>('[data-ds="Divider"]');
  expect(el).not.toBeNull();
  return el!;
}

describe('Divider', () => {
  it('decorative-divider-is-hidden-from-assistive-technology', () => {
    const { container } = setup();
    expect(root(container).getAttribute('aria-hidden')).toBe('true');
  });

  it('semantic-divider-is-a-separator', () => {
    const { container } = setup({ semantic: true });
    const separator = screen.getByRole('separator');
    expect(separator).toBe(root(container));
    expect(separator.getAttribute('aria-orientation')).toBe('horizontal');
  });

  it('label-is-read-and-makes-the-divider-semantic', () => {
    const { container } = setup({ label: 'or' });
    expect(screen.getByText('or')).toBeTruthy();
    const separator = screen.getByRole('separator');
    expect(separator).toBe(root(container));
    // The name comes from aria-labelledby: separator children are presentational.
    expect(screen.getByRole('separator', { name: 'or' })).toBe(separator);
  });

  /* derived: renders */
  it('renders', () => {
    const { container } = setup();
    root(container);
  });

  /* derived: props.orientation */
  it('renders-orientation-horizontal', () => {
    const { container } = setup({ orientation: 'horizontal' });
    root(container);
  });

  it('renders-orientation-vertical', () => {
    const { container } = setup({ orientation: 'vertical' });
    root(container);
  });

  /* derived: props.spacing */
  it('renders-spacing-none', () => {
    const { container } = setup({ spacing: 'none' });
    root(container);
  });

  it('renders-spacing-tight', () => {
    const { container } = setup({ spacing: 'tight' });
    root(container);
  });

  it('renders-spacing-normal', () => {
    const { container } = setup({ spacing: 'normal' });
    root(container);
  });

  it('renders-spacing-loose', () => {
    const { container } = setup({ spacing: 'loose' });
    root(container);
  });
});
