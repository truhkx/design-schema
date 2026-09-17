/**
 * <ds-form> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode). See generated/prompts/Form.lit.md.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import './Form.js';
import type { DsForm } from './Form.js';
import meta from './Form.stories.js';

type Given = Partial<Pick<DsForm, 'name' | 'label' | 'validate' | 'disabled' | 'errorSummary'>>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-form');
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
    container: () => root.querySelector<HTMLFormElement>('[data-part=container]'),
  };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-form', () => {
  it('label-names-the-form-landmark', async () => {
    const f = await setup({ label: 'Sign in' });
    expect(f.el.getAttribute('role')).toBe('form');
    expect(f.el.getAttribute('aria-label')).toBe('Sign in');
    expect(f.el.hasAttribute('aria-labelledby')).toBe(false);
  });

  it('renders', async () => {
    const f = await setup();
    expect(f.el.isConnected).toBe(true);
    expect(f.container()).not.toBeNull();
  });

  it('renders-validate-submit', async () => {
    const f = await setup({ validate: 'submit' });
    expect(f.el.validate).toBe('submit');
    expect(f.container()).not.toBeNull();
  });

  it('renders-validate-blur', async () => {
    const f = await setup({ validate: 'blur' });
    expect(f.el.validate).toBe('blur');
    expect(f.container()).not.toBeNull();
  });

  it('renders-validate-change', async () => {
    const f = await setup({ validate: 'change' });
    expect(f.el.validate).toBe('change');
    expect(f.container()).not.toBeNull();
  });
});
