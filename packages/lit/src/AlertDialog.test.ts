/**
 * <ds-alert-dialog> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode): the element wraps a native <dialog> and
 * uses delegatesFocus, which jsdom does not implement.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import './AlertDialog.js';
import type { DsAlertDialog } from './AlertDialog.js';
import meta from './AlertDialog.stories.js';

type Given = Partial<Pick<DsAlertDialog, 'open' | 'heading' | 'description' | 'tone' | 'confirmLabel' | 'cancelLabel' | 'confirmDisabled'>>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-alert-dialog');
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

describe('ds-alert-dialog', () => {
  /* derived: anatomy */
  it('renders', async () => {
    const { el } = await setup();
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  /* derived: props.tone */
  it('renders-tone-danger', async () => {
    const { el } = await setup({ tone: 'danger' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-tone-warning', async () => {
    const { el } = await setup({ tone: 'warning' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-tone-info', async () => {
    const { el } = await setup({ tone: 'info' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  /* derived: a11y.requires */
  it('has-accessible-name', async () => {
    const { el } = await setup();
    const dialog = el.shadowRoot!.querySelector('dialog')!;
    expect(dialog).toHaveAccessibleName(el.heading);
  });

  it('control-is-focusable', async () => {
    const { el } = await setup();
    const cancelButton = el.shadowRoot!.querySelector('.cancel');
    expect(document.activeElement).toBe(cancelButton);
  });
});
