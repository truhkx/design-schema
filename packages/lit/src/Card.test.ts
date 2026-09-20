/**
 * <ds-card> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode).
 */
import { beforeEach, describe, expect, it } from 'vitest';
import './Card.js';
import './Text.js';
import './Link.js';
import type { DsCard } from './Card.js';
import meta from './Card.stories.js';

type CardProp = 'heading' | 'headingLevel' | 'inset' | 'surface' | 'interactive' | 'focusable';
type Given = Partial<Pick<DsCard, CardProp>> & { children?: string };

const CARD_PROPS: CardProp[] = ['heading', 'headingLevel', 'inset', 'surface', 'interactive', 'focusable'];

/**
 * The Default story's args plus the scenario's `given`, rendered the way the story renders its
 * body: an interactive card's body is the single Link that is its target, otherwise Text.
 */
async function setup(given: Given = {}): Promise<{ el: DsCard }> {
  const args = { ...meta.args, ...given };
  const el = document.createElement('ds-card');
  for (const prop of CARD_PROPS) {
    const value = args[prop];
    if (value !== undefined) (el as unknown as Record<string, unknown>)[prop] = value;
  }
  const children = String(args.children ?? '');
  if (el.interactive) {
    const link = document.createElement('ds-link');
    link.setAttribute('href', '#card');
    link.setAttribute('label', children);
    el.append(link);
  } else {
    const text = document.createElement('ds-text');
    text.textContent = children;
    el.append(text);
  }
  document.body.append(el);
  await el.updateComplete;
  return { el };
}

const rendered = (el: DsCard): void => {
  expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
};

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-card', () => {
  it('heading-is-rendered-as-a-heading', async () => {
    const { el } = await setup({ heading: 'Team plan' });
    const heading = el.shadowRoot!.querySelector('ds-heading');
    expect(heading).not.toBeNull();
    expect(heading!.textContent).toContain('Team plan');
    expect(heading!.getAttribute('level')).toBe(meta.args!.headingLevel);
  });

  it('a-card-with-a-heading-is-an-article', async () => {
    const { el } = await setup({ heading: 'Team plan' });
    expect(el.getAttribute('role')).toBe('article');
    expect(el.getAttribute('aria-label')).toBe('Team plan');
  });

  it('interactive-adds-no-focus-stop', async () => {
    const { el } = await setup({
      heading: 'September invoice',
      children: 'A Link to the invoice',
      interactive: true,
    });
    expect(el.hasAttribute('tabindex')).toBe(false);
    el.focus();
    expect(document.activeElement).not.toBe(el);
  });

  it('focusable-takes-scripted-focus-only', async () => {
    const { el } = await setup({ focusable: true });
    expect(el.getAttribute('tabindex')).toBe('-1');
    el.focus();
    expect(document.activeElement).toBe(el);
  });

  /* derived */
  it('renders', async () => {
    rendered((await setup()).el);
  });

  it('renders-heading-level-2', async () => {
    rendered((await setup({ headingLevel: '2' })).el);
  });

  it('renders-heading-level-3', async () => {
    rendered((await setup({ headingLevel: '3' })).el);
  });

  it('renders-heading-level-4', async () => {
    rendered((await setup({ headingLevel: '4' })).el);
  });

  it('renders-heading-level-5', async () => {
    rendered((await setup({ headingLevel: '5' })).el);
  });

  it('renders-heading-level-6', async () => {
    rendered((await setup({ headingLevel: '6' })).el);
  });

  it('renders-inset-sm', async () => {
    rendered((await setup({ inset: 'sm' })).el);
  });

  it('renders-inset-md', async () => {
    rendered((await setup({ inset: 'md' })).el);
  });

  it('renders-inset-lg', async () => {
    rendered((await setup({ inset: 'lg' })).el);
  });

  it('renders-surface-default', async () => {
    rendered((await setup({ surface: 'default' })).el);
  });

  it('renders-surface-subtle', async () => {
    rendered((await setup({ surface: 'subtle' })).el);
  });
});
