/**
 * <ds-link> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode): the element uses delegatesFocus, which
 * jsdom does not implement. See generated/prompts/Link.lit.md.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import './Link.js';
import type { DsLink } from './Link.js';
import meta from './Link.stories.js';

type Given = Partial<Pick<DsLink, 'href' | 'label' | 'external' | 'tone' | 'download'>>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-link');
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
    anchor: () => root.querySelector<HTMLAnchorElement>('[part=anchor]')!,
  };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-link', () => {
  /* derived: a11y.role */
  it('renders', async () => {
    const l = await setup();
    expect(l.anchor()).not.toBeNull();
  });

  /* derived: props.tone */
  it('renders-tone-default', async () => {
    const l = await setup({ tone: 'default' });
    expect(l.anchor()).not.toBeNull();
  });

  it('renders-tone-inherit', async () => {
    const l = await setup({ tone: 'inherit' });
    expect(l.anchor()).not.toBeNull();
  });

  /* derived: a11y.requires */
  it('has-accessible-name', async () => {
    const l = await setup();
    expect(l.anchor()).toHaveAccessibleName(l.props.label);
  });

  it('control-is-focusable', async () => {
    const l = await setup();
    l.el.focus();
    expect(document.activeElement).toBe(l.el);
    expect(l.el.shadowRoot!.activeElement).toBe(l.anchor());
  });
});
