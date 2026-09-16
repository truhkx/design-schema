/**
 * Breadcrumb — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/breadcrumb.md) is the source of truth; the tests
 * gate runs this file after every generation round. See generated/prompts/Breadcrumb.web.md.
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { MouseEvent } from 'react';
import { Breadcrumb, type BreadcrumbItem, type BreadcrumbProps } from './Breadcrumb';
import meta from './Breadcrumb.stories';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<BreadcrumbProps> = {}) {
  // jsdom does not implement navigation; prevent it so the click does not log.
  const onNavigate = vi.fn((_item: BreadcrumbItem, _index: number, event: MouseEvent<HTMLAnchorElement>) =>
    event.preventDefault(),
  );
  const props = { ...meta.args, ...given, onNavigate } as BreadcrumbProps;
  const utils = render(<Breadcrumb {...props} />);
  const user = userEvent.setup();
  return { ...utils, user, onNavigate, props };
}

describe('Breadcrumb', () => {
  /* Each ancestor is a Link that fires onNavigate, so a client-side router can intercept it. */
  it('click-on-an-ancestor-reports-navigation', async () => {
    const s = setup();
    const link = s.getAllByRole('link')[0]!;
    await s.user.click(link);
    expect(s.onNavigate).toHaveBeenCalledTimes(1);
    expect(s.onNavigate.mock.calls[0]![1]).toBe(0);
  });

  /* The last item is plain text carrying aria-current="page", never a link. */
  it('the-last-item-is-the-current-page', () => {
    const s = setup();
    const current = s.container.querySelector('[data-part="current"]');
    expect(current).not.toBeNull();
    expect(current!.getAttribute('aria-current')).toBe('page');
    expect(current!.closest('a')).toBeNull();
  });

  /* A navigation landmark with a name that distinguishes it from other navigations. */
  it('the-trail-is-a-named-navigation-landmark', () => {
    setup({ label: 'Docs breadcrumb' });
    const nav = screen.getByRole('navigation');
    expect(nav.getAttribute('aria-label')).toBe('Docs breadcrumb');
  });

  /* With collapse off a long trail stays in full rather than folding its middle behind an ellipsis. */
  it('an-uncollapsed-trail-shows-every-ancestor', () => {
    setup({
      collapse: false,
      items: [
        { label: 'Docs', href: '/docs' },
        { label: 'Components', href: '/docs/components' },
        { label: 'Navigation', href: '/docs/components/navigation' },
        { label: 'Breadcrumb', href: '/docs/components/navigation/breadcrumb' },
        { label: 'Keyboard' },
      ],
    });
    expect(screen.getByText('Components')).toBeTruthy();
    expect(screen.getByText('Navigation')).toBeTruthy();
  });

  it('renders', () => {
    const s = setup();
    expect(s.container.querySelector('[data-ds="Breadcrumb"]')).not.toBeNull();
  });

  it('has-accessible-name', () => {
    setup({ label: 'Accessible name' });
    expect(screen.getByRole('navigation', { name: 'Accessible name' })).toBeTruthy();
  });
});
