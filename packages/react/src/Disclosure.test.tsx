/**
 * Disclosure — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/disclosure.md) is the source of truth; the tests
 * gate runs this file after every generation round. See generated/prompts/Disclosure.web.md.
 */
import { describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { Disclosure, type DisclosureProps } from './Disclosure';
import meta from './Disclosure.stories';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<DisclosureProps> = {}) {
  const onToggle = vi.fn();
  const props = { ...meta.args, ...given, onToggle } as ComponentProps<typeof Disclosure>;
  const utils = render(<Disclosure {...props} />);
  const user = userEvent.setup();
  const part = (name: string) => utils.container.querySelector<HTMLElement>(`[data-part="${name}"]`);
  return {
    ...utils,
    user,
    onToggle,
    props,
    root: () => utils.container.querySelector<HTMLElement>('[data-ds="Disclosure"]')!,
    trigger: () => part('trigger')!,
    panel: () => part('panel'),
  };
}

function rendersWithHeading(level: '2' | '3' | '4' | '5' | '6') {
  const s = setup({ headingLevel: level });
  expect(s.root()).toBeInTheDocument();
  const heading = screen.getByRole('heading', { level: Number(level) });
  expect(heading).toContainElement(s.trigger());
}

describe('Disclosure', () => {
  it('click-on-trigger-expands', async () => {
    const s = setup();
    await s.user.click(s.trigger());
    expect(s.onToggle).toHaveBeenCalledTimes(1);
    expect(s.onToggle).toHaveBeenCalledWith(true, 'pointer');
    expect(s.trigger()).toHaveAttribute('aria-expanded', 'true');
    expect(s.panel()).toBeVisible();
    expect(s.trigger()).toHaveAttribute('aria-controls', s.panel()!.id);
  });

  it('open-disclosure-collapses-on-click', async () => {
    const s = setup({ defaultOpen: true });
    await s.user.click(s.trigger());
    expect(s.onToggle).toHaveBeenCalledTimes(1);
    expect(s.onToggle).toHaveBeenCalledWith(false, 'pointer');
    expect(s.trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(s.panel()).toBeNull();
    expect(s.trigger()).not.toHaveAttribute('aria-controls');
  });

  it('disabled-trigger-does-not-toggle', async () => {
    const s = setup({ disabled: true });
    await s.user.click(s.trigger());
    expect(s.onToggle).not.toHaveBeenCalled();
    expect(s.trigger()).toHaveAttribute('aria-expanded', 'false');
    expect(s.trigger()).toHaveAttribute('aria-disabled', 'true');
  });

  it('disabled-trigger-stays-focusable', async () => {
    const s = setup({ disabled: true });
    expect(s.trigger()).not.toBeDisabled();
    await s.user.tab();
    expect(s.trigger()).toHaveFocus();
  });

  it('renders', () => {
    const s = setup();
    expect(s.root()).toBeInTheDocument();
  });

  it('renders-heading-level-2', () => rendersWithHeading('2'));
  it('renders-heading-level-3', () => rendersWithHeading('3'));
  it('renders-heading-level-4', () => rendersWithHeading('4'));
  it('renders-heading-level-5', () => rendersWithHeading('5'));
  it('renders-heading-level-6', () => rendersWithHeading('6'));

  it('has-accessible-name', () => {
    const s = setup();
    expect(screen.getByRole('button', { name: s.props.summary })).toBe(s.trigger());
  });

  it('control-is-focusable', () => {
    const s = setup();
    act(() => s.trigger().focus());
    expect(s.trigger()).toHaveFocus();
  });
});
