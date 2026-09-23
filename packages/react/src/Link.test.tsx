/**
 * Link — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/link.md) is the source of truth; the tests
 * gate runs this file after every generation round. See generated/prompts/Link.web.md.
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { MouseEvent } from 'react';
import { Link, type LinkProps } from './Link';
import meta from './Link.stories';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<LinkProps> = {}) {
  // jsdom does not implement navigation; prevent it so the click does not log.
  const onClick = vi.fn((event: MouseEvent<HTMLAnchorElement>) => event.preventDefault());
  const props = { ...meta.args, ...given, onClick } as LinkProps;
  const utils = render(<Link {...props} />);
  const user = userEvent.setup();
  return {
    ...utils,
    user,
    onClick,
    props,
    control: () => screen.getByRole('link'),
  };
}

describe('Link', () => {
  /* Activation with pointer, Enter, or assistive technology navigates to href; onPress fires first. */
  it('click-fires-on-press', async () => {
    const s = setup();
    await s.user.click(s.control());
    expect(s.onClick).toHaveBeenCalledTimes(1);
  });

  /* The accessible name is the visible text plus copy.externalSuffix. */
  it('external-link-announces-that-it-leaves', () => {
    const s = setup({ external: true, label: 'View the billing history' });
    expect(s.control().textContent).toContain(' (opens in new tab)');
    expect(screen.getByRole('link', { name: 'View the billing history (opens in new tab)' })).toBe(s.control());
  });

  /* external sets target="_blank" and rel="noopener noreferrer". */
  it('external-link-opens-a-new-tab', () => {
    const s = setup({ external: true });
    expect(s.control()).toHaveAttribute('target', '_blank');
    expect(s.control()).toHaveAttribute('rel', 'noopener noreferrer');
  });

  /* download is present and valueless. */
  it('download-asks-the-browser-to-save', () => {
    const s = setup({ download: true });
    expect(s.control()).toHaveAttribute('download', '');
  });

  /* current announces the link as the page the user is on. */
  it('current-marks-the-page', () => {
    const s = setup({ current: true });
    expect(s.control()).toHaveAttribute('aria-current', 'page');
  });

  it('renders', () => {
    const s = setup();
    expect(s.container.querySelector('[data-ds="Link"]')).not.toBeNull();
  });

  it('renders-tone-default', () => {
    const s = setup({ tone: 'default' });
    expect(s.container.querySelector('[data-ds="Link"]')).not.toBeNull();
  });

  it('renders-tone-inherit', () => {
    const s = setup({ tone: 'inherit' });
    expect(s.container.querySelector('[data-ds="Link"]')).not.toBeNull();
  });

  it('has-accessible-name', () => {
    const s = setup();
    expect(s.control()).toHaveAccessibleName();
  });

  it('control-is-focusable', async () => {
    const s = setup();
    await s.user.tab();
    expect(s.control()).toHaveFocus();
  });
});
