/**
 * Container — behavior scenarios from the component doc, one test each, in the doc's order.
 * Container has no interactive behavior (a11y.role: none), so every scenario only asserts render.
 */
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Container, type ContainerProps } from './Container';
import meta from './Container.stories';
import type { ComponentProps } from 'react';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<ContainerProps> = {}) {
  const props = { ...meta.args, ...given };
  return render(<Container {...(props as ComponentProps<typeof Container>)} />);
}

describe('Container', () => {
  /* derived: a11y.role */
  it('renders', () => {
    const { container } = setup();
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.width */
  it('renders-width-prose', () => {
    const { container } = setup({ width: 'prose' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-width-content', () => {
    const { container } = setup({ width: 'content' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-width-page', () => {
    const { container } = setup({ width: 'page' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-width-full', () => {
    const { container } = setup({ width: 'full' });
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.gutter */
  it('renders-gutter-narrow', () => {
    const { container } = setup({ gutter: 'narrow' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-gutter-default', () => {
    const { container } = setup({ gutter: 'default' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-gutter-wide', () => {
    const { container } = setup({ gutter: 'wide' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-gutter-none', () => {
    const { container } = setup({ gutter: 'none' });
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.align */
  it('renders-align-center', () => {
    const { container } = setup({ align: 'center' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-align-start', () => {
    const { container } = setup({ align: 'start' });
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.element */
  it('renders-element-div', () => {
    const { container } = setup({ element: 'div' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-element-main', () => {
    const { container } = setup({ element: 'main' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-element-section', () => {
    const { container } = setup({ element: 'section' });
    expect(container.firstChild).not.toBeNull();
  });
});
