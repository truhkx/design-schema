/**
 * Text — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/text.md) is the source of truth; the tests
 * gate runs this file after every generation round. See generated/prompts/Text.web.md.
 */
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Text, type TextProps } from './Text';
import meta from './Text.stories';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<TextProps> = {}) {
  const props = { ...meta.args, ...given } as TextProps;
  return render(<Text {...props} />);
}

describe('Text', () => {
  it('truncated-text-keeps-the-full-string-reachable', () => {
    const children = 'A sentence long enough to be clipped by its column.';
    const { container } = setup({ truncate: true, children });
    expect(container.querySelector('[data-ds="Text"]')).toHaveAttribute('title', children);
  });

  it('renders', () => {
    const { container } = setup();
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.size */
  it('renders-size-xs', () => {
    const { container } = setup({ size: 'xs' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-size-sm', () => {
    const { container } = setup({ size: 'sm' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-size-md', () => {
    const { container } = setup({ size: 'md' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-size-lg', () => {
    const { container } = setup({ size: 'lg' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-size-xl', () => {
    const { container } = setup({ size: 'xl' });
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.weight */
  it('renders-weight-regular', () => {
    const { container } = setup({ weight: 'regular' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-weight-medium', () => {
    const { container } = setup({ weight: 'medium' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-weight-semibold', () => {
    const { container } = setup({ weight: 'semibold' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-weight-bold', () => {
    const { container } = setup({ weight: 'bold' });
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.tone */
  it('renders-tone-default', () => {
    const { container } = setup({ tone: 'default' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-tone-strong', () => {
    const { container } = setup({ tone: 'strong' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-tone-muted', () => {
    const { container } = setup({ tone: 'muted' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-tone-danger', () => {
    const { container } = setup({ tone: 'danger' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-tone-on-action', () => {
    const { container } = setup({ tone: 'onAction' });
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

  /* derived: props.element */
  it('renders-element-p', () => {
    const { container } = setup({ element: 'p' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-element-span', () => {
    const { container } = setup({ element: 'span' });
    expect(container.firstChild).not.toBeNull();
  });
});
