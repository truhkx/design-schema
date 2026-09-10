/**
 * <ds-card> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode).
 */
import { beforeEach, describe, expect, it } from 'vitest';
import './Card.js';
import './Text.js';
import type { DsCard } from './Card.js';
import meta from './Card.stories.js';

type Given = Partial<Pick<DsCard, 'heading' | 'headingLevel' | 'inset' | 'surface' | 'interactive'>>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element with body content. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-card');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  const body = document.createElement('ds-text');
  body.textContent = 'Choose which updates you want to hear about, and how.';
  el.append(body);
  document.body.append(el);
  await el.updateComplete;
  return { el };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-card', () => {
  /* derived: a11y.role */
  it('renders', async () => {
    const { el } = await setup();
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  /* derived: props.headingLevel */
  it('renders-headinglevel-2', async () => {
    const { el } = await setup({ headingLevel: '2' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-headinglevel-3', async () => {
    const { el } = await setup({ headingLevel: '3' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-headinglevel-4', async () => {
    const { el } = await setup({ headingLevel: '4' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-headinglevel-5', async () => {
    const { el } = await setup({ headingLevel: '5' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-headinglevel-6', async () => {
    const { el } = await setup({ headingLevel: '6' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  /* derived: props.inset */
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

  /* derived: props.surface */
  it('renders-surface-default', async () => {
    const { el } = await setup({ surface: 'default' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-surface-subtle', async () => {
    const { el } = await setup({ surface: 'subtle' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });
});
