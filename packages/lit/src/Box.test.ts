/**
 * <ds-box> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode). See generated/prompts/Box.lit.md.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import './Box.js';
import type { DsBox } from './Box.js';
import meta from './Box.stories.js';

type Given = Partial<Pick<DsBox, 'inset' | 'insetBlock' | 'insetInline' | 'surface' | 'border' | 'radius' | 'element'>> & {
  children?: string;
};

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-box');
  const { children, ...props } = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  /* `children` is slotted content (HTMLElement.children is read-only), so it goes in as text. */
  if (children !== undefined) el.textContent = children;
  document.body.append(el);
  await el.updateComplete;
  return { el };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-box', () => {
  /* derived: a11y.role */
  it('renders', async () => {
    const { el } = await setup();
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  /* derived: props.inset */
  it('renders-inset-none', async () => {
    const { el } = await setup({ inset: 'none' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-inset-sm', async () => {
    const { el } = await setup({ inset: 'sm' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-inset-md', async () => {
    const { el } = await setup({ inset: 'md' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-inset-lg', async () => {
    const { el } = await setup({ inset: 'lg' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-inset-xl', async () => {
    const { el } = await setup({ inset: 'xl' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  /* derived: props.insetBlock */
  it('renders-inset-block-none', async () => {
    const { el } = await setup({ insetBlock: 'none' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-inset-block-sm', async () => {
    const { el } = await setup({ insetBlock: 'sm' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-inset-block-md', async () => {
    const { el } = await setup({ insetBlock: 'md' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-inset-block-lg', async () => {
    const { el } = await setup({ insetBlock: 'lg' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-inset-block-xl', async () => {
    const { el } = await setup({ insetBlock: 'xl' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  /* derived: props.insetInline */
  it('renders-inset-inline-none', async () => {
    const { el } = await setup({ insetInline: 'none' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-inset-inline-sm', async () => {
    const { el } = await setup({ insetInline: 'sm' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-inset-inline-md', async () => {
    const { el } = await setup({ insetInline: 'md' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-inset-inline-lg', async () => {
    const { el } = await setup({ insetInline: 'lg' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-inset-inline-xl', async () => {
    const { el } = await setup({ insetInline: 'xl' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  /* derived: props.surface */
  it('renders-surface-none', async () => {
    const { el } = await setup({ surface: 'none' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-surface-default', async () => {
    const { el } = await setup({ surface: 'default' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-surface-subtle', async () => {
    const { el } = await setup({ surface: 'subtle' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-surface-strong', async () => {
    const { el } = await setup({ surface: 'strong' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  /* derived: props.radius */
  it('renders-radius-none', async () => {
    const { el } = await setup({ radius: 'none' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-radius-sm', async () => {
    const { el } = await setup({ radius: 'sm' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-radius-md', async () => {
    const { el } = await setup({ radius: 'md' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-radius-lg', async () => {
    const { el } = await setup({ radius: 'lg' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-radius-full', async () => {
    const { el } = await setup({ radius: 'full' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  /* derived: props.element */
  it('renders-element-div', async () => {
    const { el } = await setup({ element: 'div' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-element-section', async () => {
    const { el } = await setup({ element: 'section' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-element-article', async () => {
    const { el } = await setup({ element: 'article' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-element-aside', async () => {
    const { el } = await setup({ element: 'aside' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-element-header', async () => {
    const { el } = await setup({ element: 'header' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-element-footer', async () => {
    const { el } = await setup({ element: 'footer' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-element-main', async () => {
    const { el } = await setup({ element: 'main' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-element-nav', async () => {
    const { el } = await setup({ element: 'nav' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });
});
