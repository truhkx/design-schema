/**
 * <ds-box> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode). See generated/prompts/Box.lit.md.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import './Box.js';
import type { DsBox } from './Box.js';
import meta, { Default } from './Box.stories.js';

type Given = Partial<Pick<DsBox, 'inset' | 'insetBlock' | 'insetInline' | 'surface' | 'border' | 'radius' | 'element'>> & {
  children?: string;
};

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-box');
  const { children, ...props } = { ...meta.args, ...Default.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  /* `children` is slotted content (HTMLElement.children is read-only), so it goes in as text. */
  if (children !== undefined) el.textContent = children;
  document.body.append(el);
  await el.updateComplete;
  return { el };
}

/** A `renders` scenario on Lit: the host is connected and its shadow root holds the slot. */
function expectRenders(el: DsBox): void {
  expect(el.isConnected).toBe(true);
  expect(el.shadowRoot!.querySelector('slot')).not.toBeNull();
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-box', () => {
  it('nav-element-carries-navigation-semantics', async () => {
    const { el } = await setup({ element: 'nav' });
    expect(el).toHaveRole('navigation');
  });

  it('article-element-carries-article-semantics', async () => {
    const { el } = await setup({ element: 'article' });
    expect(el).toHaveRole('article');
  });

  /* derived: a11y.role */
  it('renders', async () => {
    const { el } = await setup();
    expectRenders(el);
  });

  /* derived: props.inset */
  it('renders-inset-none', async () => {
    const { el } = await setup({ inset: 'none' });
    expectRenders(el);
  });

  it('renders-inset-sm', async () => {
    const { el } = await setup({ inset: 'sm' });
    expectRenders(el);
  });

  it('renders-inset-md', async () => {
    const { el } = await setup({ inset: 'md' });
    expectRenders(el);
  });

  it('renders-inset-lg', async () => {
    const { el } = await setup({ inset: 'lg' });
    expectRenders(el);
  });

  it('renders-inset-xl', async () => {
    const { el } = await setup({ inset: 'xl' });
    expectRenders(el);
  });

  /* derived: props.insetBlock */
  it('renders-inset-block-none', async () => {
    const { el } = await setup({ insetBlock: 'none' });
    expectRenders(el);
  });

  it('renders-inset-block-sm', async () => {
    const { el } = await setup({ insetBlock: 'sm' });
    expectRenders(el);
  });

  it('renders-inset-block-md', async () => {
    const { el } = await setup({ insetBlock: 'md' });
    expectRenders(el);
  });

  it('renders-inset-block-lg', async () => {
    const { el } = await setup({ insetBlock: 'lg' });
    expectRenders(el);
  });

  it('renders-inset-block-xl', async () => {
    const { el } = await setup({ insetBlock: 'xl' });
    expectRenders(el);
  });

  /* derived: props.insetInline */
  it('renders-inset-inline-none', async () => {
    const { el } = await setup({ insetInline: 'none' });
    expectRenders(el);
  });

  it('renders-inset-inline-sm', async () => {
    const { el } = await setup({ insetInline: 'sm' });
    expectRenders(el);
  });

  it('renders-inset-inline-md', async () => {
    const { el } = await setup({ insetInline: 'md' });
    expectRenders(el);
  });

  it('renders-inset-inline-lg', async () => {
    const { el } = await setup({ insetInline: 'lg' });
    expectRenders(el);
  });

  it('renders-inset-inline-xl', async () => {
    const { el } = await setup({ insetInline: 'xl' });
    expectRenders(el);
  });

  /* derived: props.surface */
  it('renders-surface-none', async () => {
    const { el } = await setup({ surface: 'none' });
    expectRenders(el);
  });

  it('renders-surface-default', async () => {
    const { el } = await setup({ surface: 'default' });
    expectRenders(el);
  });

  it('renders-surface-subtle', async () => {
    const { el } = await setup({ surface: 'subtle' });
    expectRenders(el);
  });

  it('renders-surface-strong', async () => {
    const { el } = await setup({ surface: 'strong' });
    expectRenders(el);
  });

  /* derived: props.radius */
  it('renders-radius-none', async () => {
    const { el } = await setup({ radius: 'none' });
    expectRenders(el);
  });

  it('renders-radius-sm', async () => {
    const { el } = await setup({ radius: 'sm' });
    expectRenders(el);
  });

  it('renders-radius-md', async () => {
    const { el } = await setup({ radius: 'md' });
    expectRenders(el);
  });

  it('renders-radius-lg', async () => {
    const { el } = await setup({ radius: 'lg' });
    expectRenders(el);
  });

  it('renders-radius-full', async () => {
    const { el } = await setup({ radius: 'full' });
    expectRenders(el);
  });

  /* derived: props.element */
  it('renders-element-div', async () => {
    const { el } = await setup({ element: 'div' });
    expectRenders(el);
  });

  it('renders-element-section', async () => {
    const { el } = await setup({ element: 'section' });
    expectRenders(el);
  });

  it('renders-element-article', async () => {
    const { el } = await setup({ element: 'article' });
    expectRenders(el);
  });

  it('renders-element-aside', async () => {
    const { el } = await setup({ element: 'aside' });
    expectRenders(el);
  });

  it('renders-element-header', async () => {
    const { el } = await setup({ element: 'header' });
    expectRenders(el);
  });

  it('renders-element-footer', async () => {
    const { el } = await setup({ element: 'footer' });
    expectRenders(el);
  });

  it('renders-element-main', async () => {
    const { el } = await setup({ element: 'main' });
    expectRenders(el);
  });

  it('renders-element-nav', async () => {
    const { el } = await setup({ element: 'nav' });
    expectRenders(el);
  });
});
