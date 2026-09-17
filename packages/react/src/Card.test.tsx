/**
 * Card — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/card.md) is the source of truth; the tests
 * gate runs this file after every generation round. See generated/prompts/Card.web.md.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ComponentProps } from 'react';
import { render, screen } from '@testing-library/react';
import { Card, type CardProps } from './Card';
import meta, { Default } from './Card.stories';

afterEach(() => {
  vi.restoreAllMocks();
});

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<CardProps> = {}) {
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  const props = { ...meta.args, ...Default.args, ...given } as ComponentProps<typeof Card>;
  const utils = render(<Card {...props} />);
  const root = () => utils.container.querySelector<HTMLElement>('[data-ds="Card"]')!;
  return { ...utils, props, root };
}

/** True when the element can take focus: script focus lands on it. */
function canFocus(el: HTMLElement): boolean {
  el.focus();
  const focused = document.activeElement === el;
  el.blur();
  return focused;
}

describe('Card', () => {
  it('heading-is-rendered-as-a-heading', () => {
    setup({ heading: 'Team plan' });
    expect(screen.getByText('Team plan')).toBeTruthy();
    expect(screen.getByRole('heading', { name: 'Team plan' })).toBeTruthy();
  });

  it('a-card-with-a-heading-is-an-article', () => {
    setup({ heading: 'Team plan' });
    expect(screen.getByRole('article', { name: 'Team plan' })).toBeTruthy();
  });

  it('interactive-adds-no-focus-stop', () => {
    const { root } = setup({ interactive: true });
    expect(root().hasAttribute('tabindex')).toBe(false);
    expect(canFocus(root())).toBe(false);
  });

  it('focusable-takes-scripted-focus-only', () => {
    const { root } = setup({ focusable: true });
    expect(root().getAttribute('tabindex')).toBe('-1');
    expect(canFocus(root())).toBe(true);
  });

  /* derived: a11y.role */
  it('renders', () => {
    const { root } = setup();
    expect(root()).not.toBeNull();
  });

  /* derived: props.headingLevel */
  it('renders-heading-level-2', () => {
    const { root } = setup({ headingLevel: '2' });
    expect(root()).not.toBeNull();
  });

  it('renders-heading-level-3', () => {
    const { root } = setup({ headingLevel: '3' });
    expect(root()).not.toBeNull();
  });

  it('renders-heading-level-4', () => {
    const { root } = setup({ headingLevel: '4' });
    expect(root()).not.toBeNull();
  });

  it('renders-heading-level-5', () => {
    const { root } = setup({ headingLevel: '5' });
    expect(root()).not.toBeNull();
  });

  it('renders-heading-level-6', () => {
    const { root } = setup({ headingLevel: '6' });
    expect(root()).not.toBeNull();
  });

  /* derived: props.inset */
  it('renders-inset-sm', () => {
    const { root } = setup({ inset: 'sm' });
    expect(root()).not.toBeNull();
  });

  it('renders-inset-md', () => {
    const { root } = setup({ inset: 'md' });
    expect(root()).not.toBeNull();
  });

  it('renders-inset-lg', () => {
    const { root } = setup({ inset: 'lg' });
    expect(root()).not.toBeNull();
  });

  /* derived: props.surface */
  it('renders-surface-default', () => {
    const { root } = setup({ surface: 'default' });
    expect(root()).not.toBeNull();
  });

  it('renders-surface-subtle', () => {
    const { root } = setup({ surface: 'subtle' });
    expect(root()).not.toBeNull();
  });
});
