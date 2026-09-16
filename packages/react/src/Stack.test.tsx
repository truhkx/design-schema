/**
 * Stack — behavior scenarios from the component doc, one test each, in the doc's order.
 * Stack has no interactive behavior (a11y.role: none): the two authored scenarios assert the
 * semantics `element` renders, and every derived scenario only asserts render.
 */
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Stack, type StackProps } from './Stack';
import meta from './Stack.stories';
import type { ComponentProps } from 'react';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<StackProps> = {}) {
  const props = { ...meta.args, ...given };
  return render(<Stack {...(props as ComponentProps<typeof Stack>)} />);
}

describe('Stack', () => {
  it('nav-element-is-a-navigation-landmark', () => {
    const { getByRole } = setup({ element: 'nav' });
    expect(getByRole('navigation').getAttribute('data-ds')).toBe('Stack');
  });

  it('list-element-is-a-list', () => {
    const { getByRole, getAllByRole } = setup({ element: 'ul' });
    expect(getByRole('list').getAttribute('data-ds')).toBe('Stack');
    // each child is wrapped in an `li`, so assistive technology counts the items
    expect(getAllByRole('listitem')).toHaveLength(3);
  });

  /* derived: a11y.role */
  it('renders', () => {
    const { container } = setup();
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.direction */
  it('renders-direction-vertical', () => {
    const { container } = setup({ direction: 'vertical' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-direction-horizontal', () => {
    const { container } = setup({ direction: 'horizontal' });
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.gap */
  it('renders-gap-none', () => {
    const { container } = setup({ gap: 'none' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-gap-tight', () => {
    const { container } = setup({ gap: 'tight' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-gap-normal', () => {
    const { container } = setup({ gap: 'normal' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-gap-loose', () => {
    const { container } = setup({ gap: 'loose' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-gap-section', () => {
    const { container } = setup({ gap: 'section' });
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

  it('renders-align-stretch', () => {
    const { container } = setup({ align: 'stretch' });
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.justify */
  it('renders-justify-start', () => {
    const { container } = setup({ justify: 'start' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-justify-center', () => {
    const { container } = setup({ justify: 'center' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-justify-end', () => {
    const { container } = setup({ justify: 'end' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-justify-between', () => {
    const { container } = setup({ justify: 'between' });
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.element */
  it('renders-element-div', () => {
    const { container } = setup({ element: 'div' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-element-section', () => {
    const { container } = setup({ element: 'section' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-element-nav', () => {
    const { container } = setup({ element: 'nav' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-element-ul', () => {
    const { container } = setup({ element: 'ul' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-element-ol', () => {
    const { container } = setup({ element: 'ol' });
    expect(container.firstChild).not.toBeNull();
  });
});
