/**
 * <ds-breadcrumb> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode). See generated/prompts/Breadcrumb.lit.md.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import './Breadcrumb.js';
import type { DsBreadcrumb, BreadcrumbNavigateDetail } from './Breadcrumb.js';
import meta from './Breadcrumb.stories.js';

type Given = Partial<Pick<DsBreadcrumb, 'items' | 'label' | 'collapse'>>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-breadcrumb');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  document.body.append(el);
  await el.updateComplete;
  const root = el.shadowRoot!;
  return {
    el,
    props,
    nav: () => root.querySelector<HTMLElement>('[data-part=nav]')!,
    links: () => [...root.querySelectorAll<HTMLElement>('[data-part=link]')],
    current: () => root.querySelector<HTMLElement>('[data-part=current]'),
  };
}

/** Text of a node including the shadow roots of composed children (ds-link renders its label there). */
function deepText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? '';
  const children = node instanceof Element && node.shadowRoot ? [...node.shadowRoot.childNodes] : [...node.childNodes];
  return children.map(deepText).join(' ');
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-breadcrumb', () => {
  it('click-on-an-ancestor-reports-navigation', async () => {
    const b = await setup();
    const events: CustomEvent<BreadcrumbNavigateDetail>[] = [];
    b.el.addEventListener('navigate', (event) => {
      events.push(event as CustomEvent<BreadcrumbNavigateDetail>);
      // Keep the test page in place: cancelling navigate cancels the native click.
      event.preventDefault();
    });
    const link = b.links()[0]!;
    await (link as HTMLElement & { updateComplete: Promise<boolean> }).updateComplete;
    link.shadowRoot!.querySelector<HTMLAnchorElement>('a')!.click();
    expect(events).toHaveLength(1);
    expect(events[0]!.detail.index).toBe(0);
    expect(events[0]!.detail.item).toEqual(b.props.items![0]);
    expect(events[0]!.detail.originalEvent.defaultPrevented).toBe(true);
  });

  it('the-last-item-is-the-current-page', async () => {
    const b = await setup();
    expect(b.current()).not.toBeNull();
    expect(b.current()!.getAttribute('aria-current')).toBe('page');
  });

  it('an-uncollapsed-trail-shows-every-ancestor', async () => {
    const b = await setup({
      collapse: false,
      items: [
        { label: 'Docs', href: '/docs' },
        { label: 'Components', href: '/docs/components' },
        { label: 'Navigation', href: '/docs/components/navigation' },
        { label: 'Breadcrumb', href: '/docs/components/navigation/breadcrumb' },
        { label: 'Keyboard' },
      ],
    });
    await Promise.all(b.links().map((l) => (l as HTMLElement & { updateComplete: Promise<boolean> }).updateComplete));
    const text = deepText(b.el);
    expect(text).toContain('Components');
    expect(text).toContain('Navigation');
  });

  /* derived */
  it('renders', async () => {
    const b = await setup();
    expect(b.nav()).not.toBeNull();
  });

  it('has-accessible-name', async () => {
    const b = await setup({ label: 'Accessible name' });
    expect(b.nav()).toHaveAccessibleName('Accessible name');
  });
});
