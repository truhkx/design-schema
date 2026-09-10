/**
 * <ds-toast> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode).
 */
import { beforeEach, describe, expect, it } from 'vitest';
import './Toast.js';
import type { DsToast } from './Toast.js';
import meta from './Toast.stories.js';

type Given = Partial<Pick<DsToast, 'message' | 'tone' | 'actionLabel' | 'duration' | 'dismissible'>>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-toast');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  document.body.append(el);
  await el.updateComplete;
  return { el, props };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-toast', () => {
  it('renders', async () => {
    const { el } = await setup();
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  /* derived: props.tone */
  it('renders-tone-neutral', async () => {
    const { el } = await setup({ tone: 'neutral' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-tone-success', async () => {
    const { el } = await setup({ tone: 'success' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-tone-warning', async () => {
    const { el } = await setup({ tone: 'warning' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-tone-danger', async () => {
    const { el } = await setup({ tone: 'danger' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  /* derived: props.duration */
  it('renders-duration-short', async () => {
    const { el } = await setup({ duration: 'short' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-duration-long', async () => {
    const { el } = await setup({ duration: 'long' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-duration-persistent', async () => {
    const { el } = await setup({ duration: 'persistent' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  /* derived: a11y.requires. The host carries the "status"/"alert" role and its
     accessible name through ElementInternals, set to `message`. */
  it('has-accessible-name', async () => {
    const { el, props } = await setup();
    expect(el).toHaveAccessibleName(props.message);
  });
});
