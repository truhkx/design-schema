/**
 * <ds-input> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode): the element is form-associated and uses
 * delegatesFocus, which jsdom does not implement. See generated/prompts/Input.lit.md.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import './Input.js';
import type { DsInput, InputType } from './Input.js';
import meta from './Input.stories.js';

type Given = Partial<Pick<DsInput, 'label' | 'name' | 'type' | 'required' | 'disabled' | 'invalid' | 'error'>>;

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
    field: () => root.querySelector<HTMLInputElement>('[part=field]')!,
    error: () => root.querySelector<HTMLElement>('[part=error]')!,
  };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-input', () => {
  it('renders', async () => {
    const s = await setup();
    expect(s.field()).not.toBeNull();
  });

  const types: InputType[] = ['text', 'email', 'password', 'number', 'search', 'tel', 'url'];
  for (const type of types) {
    it(`renders-type-${type}`, async () => {
      const s = await setup({ type });
      expect(s.field()).not.toBeNull();
    });
  }

  it('control-is-focusable', async () => {
    const s = await setup();
    s.el.focus();
    expect(document.activeElement).toBe(s.el);
    expect(s.el.shadowRoot!.activeElement).toBe(s.field());
  });

  it('error-is-identified', async () => {
    const s = await setup({ error: 'Fix this before continuing.' });
    expect(s.error().textContent).toContain('Fix this before continuing.');
    expect(s.el.invalid).toBe(true);
  });
});
