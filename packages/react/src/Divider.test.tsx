/**
 * Divider — behavior scenarios from the component doc, one test each, in the doc's order.
 * Divider is non-interactive, so every scenario only asserts render.
 */
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Divider, type DividerProps } from './Divider';
import meta from './Divider.stories';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<DividerProps> = {}) {
  const props = { ...meta.args, ...given };
  return render(<Divider {...props} />);
}

describe('Divider', () => {
  /* derived: renders */
  it('renders', () => {
    const { container } = setup();
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.orientation */
  it('renders-orientation-horizontal', () => {
    const { container } = setup({ orientation: 'horizontal' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-orientation-vertical', () => {
    const { container } = setup({ orientation: 'vertical' });
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.spacing */
  it('renders-spacing-none', () => {
    const { container } = setup({ spacing: 'none' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-spacing-tight', () => {
    const { container } = setup({ spacing: 'tight' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-spacing-normal', () => {
    const { container } = setup({ spacing: 'normal' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-spacing-loose', () => {
    const { container } = setup({ spacing: 'loose' });
    expect(container.firstChild).not.toBeNull();
  });
});
