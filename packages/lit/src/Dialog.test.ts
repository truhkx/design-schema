/**
 * <ds-dialog> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode): the element wraps a native <dialog> and
 * uses delegatesFocus, which jsdom does not implement.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import './Dialog.js';
import './Input.js';
import './Button.js';
import type { DsDialog } from './Dialog.js';
import meta from './Dialog.stories.js';

/** The deepest focused element: `document.activeElement` is a shadow host while focus is inside its shadow tree. */
function deepActiveElement(): Element | null {
  let el: Element | null = document.activeElement;
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
  return el;
}

type Given = Partial<Pick<DsDialog, 'open' | 'heading' | 'description' | 'size' | 'dismissible' | 'initialFocus'>>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element with a body control and footer. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-dialog');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }

  const input = document.createElement('ds-input') as HTMLElement & { label: string; name: string; value: string };
  input.label = 'Project name';
  input.name = 'projectName';
  input.value = 'Untitled project';
  el.append(input);

  const primary = document.createElement('ds-button') as HTMLElement & { label: string; variant: string };
  primary.slot = 'footer';
  primary.label = 'Rename';
  primary.variant = 'primary';
  const cancel = document.createElement('ds-button') as HTMLElement & { label: string; variant: string };
  cancel.slot = 'footer';
  cancel.label = 'Cancel';
  cancel.variant = 'ghost';
  el.append(primary, cancel);

  document.body.append(el);
  await el.updateComplete;
  return { el, input, primary, cancel };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-dialog', () => {
  /* derived: anatomy */
  it('renders', async () => {
    const { el } = await setup();
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  /* derived: props.size */
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

  /* derived: props.initialFocus */
  it('renders-initialfocus-first', async () => {
    const { el } = await setup({ initialFocus: 'first' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-initialfocus-title', async () => {
    const { el } = await setup({ initialFocus: 'title' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-initialfocus-close', async () => {
    const { el } = await setup({ initialFocus: 'close' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  /* derived: a11y.requires */
  it('has-accessible-name', async () => {
    const { el } = await setup();
    const dialog = el.shadowRoot!.querySelector('dialog')!;
    expect(dialog).toHaveAccessibleName(el.heading);
  });

  it('control-is-focusable', async () => {
    const { input } = await setup();
    expect(deepActiveElement()).toBe(input);
  });
});
