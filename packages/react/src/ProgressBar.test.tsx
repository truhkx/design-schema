/**
 * ProgressBar — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/progress-bar.md) is the source of truth; the tests
 * gate runs this file after every generation round. See generated/prompts/ProgressBar.web.md.
 */
import type { ComponentProps } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from './ProgressBar';
import meta from './ProgressBar.stories';

type Props = ComponentProps<typeof ProgressBar>;

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<Props> = {}) {
  const props = { ...meta.args, ...given } as Props;
  return { ...render(<ProgressBar {...props} />), props };
}

describe('ProgressBar', () => {
  it('the-bar-reports-its-value-and-range', () => {
    setup({ value: 42, min: 0, max: 100 });
    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBe('42');
    expect(bar.getAttribute('aria-valuemin')).toBe('0');
    expect(bar.getAttribute('aria-valuemax')).toBe('100');
  });

  it('the-bar-is-never-focusable', () => {
    const { container } = setup();
    const bar = screen.getByRole('progressbar');
    expect(bar).not.toHaveAttribute('tabindex');
    bar.focus();
    expect(bar).not.toHaveFocus();
    const root = container.querySelector<HTMLElement>('[data-ds="ProgressBar"]')!;
    root.focus();
    expect(root).not.toHaveFocus();
  });

  it('a-hidden-label-is-still-the-accessible-name', () => {
    const { props } = setup({ hideLabel: true });
    expect(screen.getByRole('progressbar', { name: props.label })).toBeTruthy();
  });

  it('the-label-names-the-task', () => {
    setup({ label: 'Importing contacts' });
    expect(screen.getByText('Importing contacts')).toBeTruthy();
  });

  it('renders', () => {
    const { container } = setup();
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.tone */
  it('renders-tone-neutral', () => {
    const { container } = setup({ tone: 'neutral' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-tone-success', () => {
    const { container } = setup({ tone: 'success' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-tone-danger', () => {
    const { container } = setup({ tone: 'danger' });
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.announce */
  it('renders-announce-none', () => {
    const { container } = setup({ announce: 'none' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-announce-milestones', () => {
    const { container } = setup({ announce: 'milestones' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-announce-complete', () => {
    const { container } = setup({ announce: 'complete' });
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: a11y.requires */
  it('has-accessible-name', () => {
    const { props } = setup();
    expect(screen.getByRole('progressbar', { name: props.label })).toBeTruthy();
  });
});
