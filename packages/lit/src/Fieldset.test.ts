/**
 * <ds-fieldset> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode). See generated/prompts/Fieldset.lit.md.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import './Fieldset.js';
import './Stack.js';
import './Text.js';
import './Input.js';
import type { DsFieldset, FieldsetGap } from './Fieldset.js';
import meta from './Fieldset.stories.js';

type Given = Partial<Pick<DsFieldset, 'legend' | 'description' | 'error' | 'disabled' | 'gap'>>;
const PROPS = ['legend', 'description', 'error', 'disabled', 'gap'] as const;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element with two fields. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-fieldset');
  const props: Given & { legend: string } = { ...meta.args, ...given } as Given & { legend: string };
  for (const key of PROPS) {
    const value = props[key];
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  for (const [name, label] of [
    ['street', 'Street'],
    ['city', 'City'],
  ] as const) {
    const input = document.createElement('ds-input');
    input.setAttribute('name', name);
    input.setAttribute('label', label);
    el.append(input);
  }
  document.body.append(el);
  await el.updateComplete;
  const root = el.shadowRoot!;
  return {
    el,
    props,
    group: () => root.querySelector<HTMLFieldSetElement>('[data-part=group]')!,
    /** Visible text of the shadow tree, including slotted text inside composed ds-text elements. */
    text: () => {
      const parts: string[] = [];
      for (const node of root.querySelectorAll('legend, [data-part=description], [data-part=errorMessage]')) {
        parts.push(node.textContent ?? '');
      }
      return parts.join(' ');
    },
    alert: () => root.querySelector<HTMLElement>('[role=alert]'),
  };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-fieldset', () => {
  it('the-legend-names-the-group', async () => {
    const s = await setup({ legend: 'Delivery window' });
    expect(s.text()).toContain('Delivery window');
    expect(s.group()).toHaveAccessibleName('Delivery window');
  });

  it('the-description-is-rendered', async () => {
    const s = await setup({ description: 'We only ship within the EU.' });
    expect(s.text()).toContain('We only ship within the EU.');
  });

  it('a-group-error-is-announced', async () => {
    const s = await setup({ error: 'End date must be after start date.' });
    expect(s.alert()).not.toBeNull();
    expect(s.el.shadowRoot!.querySelectorAll('[role=alert]')).toHaveLength(1);
  });

  it('a-disabled-group-is-marked-disabled', async () => {
    const s = await setup({ disabled: true });
    expect(s.group()).toHaveAttribute('aria-disabled', 'true');
  });

  /* derived */
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
    expect(s.text()).toContain('Fix this before continuing.');
    expect(s.group()).toHaveAttribute('aria-invalid', 'true');
  });
});
