/**
 * <ds-icon> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode). See generated/prompts/Icon.lit.md.
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
  return { el };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-icon', () => {
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

  /* derived: a11y.requires. No `given` in the doc; the Default story's args are
     decorative (no label), so a label is set here to exercise the mechanism. */
  it('has-accessible-name', async () => {
    const { el } = await setup({ label: 'Warning: over quota' });
    expect(el.shadowRoot!.querySelector('svg')).toHaveAccessibleName('Warning: over quota');
  });
});
