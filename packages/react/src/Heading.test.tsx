/**
 * Heading — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/heading.md) is the source of truth; the tests
 * gate runs this file after every generation round. See generated/prompts/Heading.web.md.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Heading, type HeadingProps } from './Heading';
import meta from './Heading.stories';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<HeadingProps> = {}) {
  const props = { ...meta.args, ...given } as HeadingProps;
  return render(<Heading {...props} />);
}

describe('Heading', () => {
  it('level-puts-the-heading-in-the-outline', () => {
    setup({ level: '3' });
    const heading = screen.getByRole('heading', { level: 3 });
    expect(heading.tagName).toBe('H3');
  });

  it('size-does-not-change-the-outline', () => {
    setup({ level: '2', size: 'md' });
    // The smallest size is applied, and the element is still the h2 the outline needs.
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.tagName).toBe('H2');
    expect(heading).toHaveClass('ds-heading--size-md');
  });

  it('renders', () => {
    const { container } = setup();
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.level */
  it('renders-level-1', () => {
    const { container } = setup({ level: '1' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-level-2', () => {
    const { container } = setup({ level: '2' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-level-3', () => {
    const { container } = setup({ level: '3' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-level-4', () => {
    const { container } = setup({ level: '4' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-level-5', () => {
    const { container } = setup({ level: '5' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-level-6', () => {
    const { container } = setup({ level: '6' });
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.size */
  it('renders-size-4xl', () => {
    const { container } = setup({ size: '4xl' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-size-3xl', () => {
    const { container } = setup({ size: '3xl' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-size-2xl', () => {
    const { container } = setup({ size: '2xl' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-size-xl', () => {
    const { container } = setup({ size: 'xl' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-size-lg', () => {
    const { container } = setup({ size: 'lg' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-size-md', () => {
    const { container } = setup({ size: 'md' });
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.align */
  it('renders-align-start', () => {
    const { container } = setup({ align: 'start' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-align-center', () => {
    const { container } = setup({ align: 'center' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-align-end', () => {
    const { container } = setup({ align: 'end' });
    expect(container.firstChild).not.toBeNull();
  });
});
