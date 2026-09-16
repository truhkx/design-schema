/**
 * <ds-input> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode): the element is form-associated and uses
 * delegatesFocus, which jsdom does not implement. See generated/prompts/Input.lit.md.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import './Input.js';
import type { DsInput, InputChangeDetail, InputSize, InputType } from './Input.js';
import meta from './Input.stories.js';

type Given = Partial<Pick<DsInput, 'label' | 'name' | 'type' | 'size' | 'required' | 'disabled' | 'invalid' | 'error'>>;

/** copy.requiredIndicator */
const REQUIRED_INDICATOR = ' (required)';

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-input');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  document.body.append(el);
  await el.updateComplete;
  const root = el.shadowRoot!;
  return {
    el,
    props,
    label: () => root.querySelector<HTMLLabelElement>('[data-part=label]')!,
    field: () => root.querySelector<HTMLInputElement>('[data-part=field]')!,
    error: () => root.querySelector<HTMLElement>('[data-part=errorMessage]'),
  };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-input', () => {
  it('typing-reports-the-new-value', async () => {
    const s = await setup();
    const values: string[] = [];
    s.el.addEventListener('change', (event) => {
      values.push((event as CustomEvent<InputChangeDetail>).detail.value);
    });
    await userEvent.type(s.field(), 'a');
    expect(values).toEqual(['a']);
  });

  it('focus-is-reported', async () => {
    const s = await setup();
    let focused = 0;
    s.el.addEventListener('focus', () => {
      focused += 1;
    });
    s.field().focus();
    expect(focused).toBe(1);
  });

  it('required-is-shown-in-the-label', async () => {
    const s = await setup({ required: true });
    expect(s.label().textContent).toContain(REQUIRED_INDICATOR);
    expect(s.field().getAttribute('aria-required')).toBe('true');
  });

  it('error-is-announced-when-it-appears', async () => {
    const s = await setup({ error: 'Enter an email address like name@example.com' });
    expect(s.error()).not.toBeNull();
    expect(s.error()!.getAttribute('role')).toBe('alert');
  });

  it('disabled-stays-focusable-and-is-announced', async () => {
    const s = await setup({ disabled: true });
    expect(s.field().getAttribute('aria-disabled')).toBe('true');
    expect(s.field().hasAttribute('disabled')).toBe(false);
    s.el.focus();
    expect(s.el.shadowRoot!.activeElement).toBe(s.field());
  });

  /* derived: a11y.role */
  it('renders', async () => {
    const s = await setup();
    expect(s.field()).not.toBeNull();
  });

  /* derived: props.type */
  const types: InputType[] = ['text', 'email', 'password', 'number', 'search', 'tel', 'url'];
  for (const type of types) {
    it(`renders-type-${type}`, async () => {
      const s = await setup({ type });
      expect(s.field()).not.toBeNull();
    });
  }

  /* derived: props.size */
  const sizes: InputSize[] = ['sm', 'md'];
  for (const size of sizes) {
    it(`renders-size-${size}`, async () => {
      const s = await setup({ size });
      expect(s.field()).not.toBeNull();
    });
  }

  /* derived: a11y.requires */
  it('control-is-focusable', async () => {
    const s = await setup();
    s.el.focus();
    expect(document.activeElement).toBe(s.el);
    expect(s.el.shadowRoot!.activeElement).toBe(s.field());
  });

  it('error-is-identified', async () => {
    const s = await setup({ error: 'Fix this before continuing.' });
    expect(s.error()!.textContent).toContain('Fix this before continuing.');
    expect(s.el.invalid).toBe(true);
    expect(s.field().getAttribute('aria-invalid')).toBe('true');
  });
});
