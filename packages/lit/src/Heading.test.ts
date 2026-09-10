/**
 * <ds-heading> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode).
 */
import { beforeEach, describe, expect, it } from 'vitest';
import './Heading.js';
import type { DsHeading } from './Heading.js';
import meta from './Heading.stories.js';

type Given = Partial<Pick<DsHeading, 'level' | 'size' | 'align'>>;

/** The Default story's args plus the scenario's `given`, as properties (and slot text) on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-heading');
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

describe('ds-heading', () => {
  it('renders', async () => {
    const { el } = await setup();
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  /* derived: props.level */
  it('renders-level-1', async () => {
    const { el } = await setup({ level: '1' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-level-2', async () => {
    const { el } = await setup({ level: '2' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-level-3', async () => {
    const { el } = await setup({ level: '3' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-level-4', async () => {
    const { el } = await setup({ level: '4' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-level-5', async () => {
    const { el } = await setup({ level: '5' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-level-6', async () => {
    const { el } = await setup({ level: '6' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  /* derived: props.size */
  it('renders-size-4xl', async () => {
    const { el } = await setup({ size: '4xl' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-size-3xl', async () => {
    const { el } = await setup({ size: '3xl' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-size-2xl', async () => {
    const { el } = await setup({ size: '2xl' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-size-xl', async () => {
    const { el } = await setup({ size: 'xl' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-size-lg', async () => {
    const { el } = await setup({ size: 'lg' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-size-md', async () => {
    const { el } = await setup({ size: 'md' });
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
});
