/**
 * <ds-text> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode).
 */
import { beforeEach, describe, expect, it } from 'vitest';
import './Text.js';
import type { DsText } from './Text.js';
import meta from './Text.stories.js';

type Given = Partial<Pick<DsText, 'size' | 'weight' | 'tone' | 'align' | 'element'>>;

/** The Default story's args plus the scenario's `given`, as properties (and slot text) on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-text');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (key === 'text' || value === undefined) continue;
    (el as unknown as Record<string, unknown>)[key] = value;
  }
  el.textContent = String(meta.args?.text ?? '');
  document.body.append(el);
  await el.updateComplete;
  return { el };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-text', () => {
  it('renders', async () => {
    const { el } = await setup();
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

  /* derived: props.weight */
  it('renders-weight-regular', async () => {
    const { el } = await setup({ weight: 'regular' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-weight-medium', async () => {
    const { el } = await setup({ weight: 'medium' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-weight-semibold', async () => {
    const { el } = await setup({ weight: 'semibold' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-weight-bold', async () => {
    const { el } = await setup({ weight: 'bold' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  /* derived: props.tone */
  it('renders-tone-default', async () => {
    const { el } = await setup({ tone: 'default' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-tone-strong', async () => {
    const { el } = await setup({ tone: 'strong' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-tone-muted', async () => {
    const { el } = await setup({ tone: 'muted' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-tone-danger', async () => {
    const { el } = await setup({ tone: 'danger' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-tone-onAction', async () => {
    const { el } = await setup({ tone: 'onAction' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  /* derived: props.align */
  it('renders-align-start', async () => {
    const { el } = await setup({ align: 'start' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-align-center', async () => {
    const { el } = await setup({ align: 'center' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-align-end', async () => {
    const { el } = await setup({ align: 'end' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  /* derived: props.element */
  it('renders-element-p', async () => {
    const { el } = await setup({ element: 'p' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-element-span', async () => {
    const { el } = await setup({ element: 'span' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });
});
