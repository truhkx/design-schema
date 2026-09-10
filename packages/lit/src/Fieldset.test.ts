/**
 * <ds-fieldset> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode). See generated/prompts/Fieldset.lit.md.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import './Fieldset.js';
import './Stack.js';
import './Input.js';
import type { DsFieldset, FieldsetGap } from './Fieldset.js';
import meta from './Fieldset.stories.js';

type Given = Partial<Pick<DsFieldset, 'legend' | 'description' | 'error' | 'disabled' | 'gap'>>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-fieldset');
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
    group: () => root.querySelector<HTMLFieldSetElement>('[part=group]')!,
    errorMessage: () => root.querySelector<HTMLElement>('[part=errorMessage]')!,
  };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-fieldset', () => {
  /* derived: a11y.role */
  it('renders', async () => {
    const s = await setup();
    expect(s.group()).not.toBeNull();
  });

  /* derived: props.gap */
  const gaps: FieldsetGap[] = ['tight', 'normal', 'loose'];
  for (const gap of gaps) {
    it(`renders-gap-${gap}`, async () => {
      const s = await setup({ gap });
      expect(s.group()).not.toBeNull();
    });
  }

  /* derived: a11y.requires */
  it('has-accessible-name', async () => {
    const s = await setup();
    expect(s.group()).toHaveAccessibleName(s.props.legend);
  });

  /* derived: a11y.requires */
  it('error-is-identified', async () => {
    const s = await setup({ error: 'Fix this before continuing.' });
    expect(s.errorMessage().textContent).toContain('Fix this before continuing.');
    expect(s.group()).toHaveAttribute('aria-invalid', 'true');
  });
});
