/**
 * <ds-icon> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode). See generated/prompts/Icon.lit.md.
 *
 * Icon has no interaction, focus or animation, so the derived scenarios only assert render; the
 * three scenarios written in the doc are about what assistive technology sees, which on Lit is the
 * <svg> in the shadow root (the host is a plain element with no role of its own).
 */
import { beforeEach, describe, expect, it } from 'vitest';
import './Icon.js';
import type { DsIcon } from './Icon.js';
import meta from './Icon.stories.js';

type Given = Partial<Pick<DsIcon, 'name' | 'size' | 'inline' | 'label'>>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-icon');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  document.body.append(el);
  await el.updateComplete;
  const glyph = el.shadowRoot!.querySelector('svg')!;
  return { el, glyph };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-icon', () => {
  /**
   * Decorative icons carry no information the adjacent text does not, so "Save" is announced as
   * "Save", not "check mark Save" (WCAG 1.1.1).
   */
  it('unlabelled-icon-is-hidden-from-assistive-technology', async () => {
    const { glyph } = await setup();
    expect(glyph.getAttribute('aria-hidden')).toBe('true');
  });

  /** When set, the icon is exposed as an image with this name; the aria-hidden of the decorative case is gone. */
  it('label-makes-the-icon-meaningful', async () => {
    const { glyph } = await setup({ name: 'warning', label: 'Warning: over quota' });
    expect(glyph.getAttribute('role')).toBe('img');
    expect(glyph.getAttribute('aria-hidden')).toBeNull();
    expect(glyph).toHaveAccessibleName('Warning: over quota');
  });

  /** An empty string is the decorative case, not an authoring error: the icon stays hidden. */
  it('empty-label-is-decorative', async () => {
    const { glyph } = await setup({ name: 'check', label: '' });
    expect(glyph.getAttribute('aria-hidden')).toBe('true');
  });

  /* derived: anatomy.glyph */
  it('renders', async () => {
    const { el } = await setup();
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  /* derived: props.name */
  it('renders-name-check', async () => {
    const { el } = await setup({ name: 'check' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-name-dash', async () => {
    const { el } = await setup({ name: 'dash' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-name-chevron-right', async () => {
    const { el } = await setup({ name: 'chevron-right' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-name-chevron-down', async () => {
    const { el } = await setup({ name: 'chevron-down' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-name-chevron-up', async () => {
    const { el } = await setup({ name: 'chevron-up' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-name-chevron-left', async () => {
    const { el } = await setup({ name: 'chevron-left' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-name-close', async () => {
    const { el } = await setup({ name: 'close' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-name-plus', async () => {
    const { el } = await setup({ name: 'plus' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-name-minus', async () => {
    const { el } = await setup({ name: 'minus' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-name-info', async () => {
    const { el } = await setup({ name: 'info' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-name-success', async () => {
    const { el } = await setup({ name: 'success' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-name-warning', async () => {
    const { el } = await setup({ name: 'warning' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-name-danger', async () => {
    const { el } = await setup({ name: 'danger' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-name-external', async () => {
    const { el } = await setup({ name: 'external' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-name-ellipsis', async () => {
    const { el } = await setup({ name: 'ellipsis' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-name-search', async () => {
    const { el } = await setup({ name: 'search' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-name-arrow-right', async () => {
    const { el } = await setup({ name: 'arrow-right' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-name-arrow-left', async () => {
    const { el } = await setup({ name: 'arrow-left' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-name-calendar', async () => {
    const { el } = await setup({ name: 'calendar' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-name-menu', async () => {
    const { el } = await setup({ name: 'menu' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-name-list', async () => {
    const { el } = await setup({ name: 'list' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-name-grid', async () => {
    const { el } = await setup({ name: 'grid' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-name-play', async () => {
    const { el } = await setup({ name: 'play' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-name-pause', async () => {
    const { el } = await setup({ name: 'pause' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-name-folder', async () => {
    const { el } = await setup({ name: 'folder' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-name-file', async () => {
    const { el } = await setup({ name: 'file' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  /* derived: props.size */
  it('renders-size-xs', async () => {
    const { el } = await setup({ size: 'xs' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-size-sm', async () => {
    const { el } = await setup({ size: 'sm' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-size-md', async () => {
    const { el } = await setup({ size: 'md' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-size-lg', async () => {
    const { el } = await setup({ size: 'lg' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-size-xl', async () => {
    const { el } = await setup({ size: 'xl' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  /* derived: a11y.requires */
  it('has-accessible-name', async () => {
    const { glyph } = await setup({ label: 'Accessible name' });
    expect(glyph).toHaveAccessibleName('Accessible name');
  });
});
