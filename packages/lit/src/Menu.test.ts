/**
 * <ds-menu> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode): the element uses delegatesFocus and the
 * Popover API, neither of which jsdom implements.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import './Menu.js';
import type { DsMenu } from './Menu.js';
import meta from './Menu.stories.js';

type Given = Partial<Pick<DsMenu, 'label' | 'items' | 'triggerVariant' | 'triggerIcon' | 'iconOnly' | 'placement' | 'open'>>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-menu');
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
    trigger: () => root.querySelector<HTMLElement>('ds-button')!,
    nativeTrigger: () => root.querySelector('ds-button')!.shadowRoot!.querySelector<HTMLButtonElement>('button')!,
  };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-menu', () => {
  /* derived: anatomy */
  it('renders', async () => {
    const { el } = await setup();
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  /* derived: props.triggerVariant */
  it('renders-triggerVariant-ghost', async () => {
    const { el } = await setup({ triggerVariant: 'ghost' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-triggerVariant-secondary', async () => {
    const { el } = await setup({ triggerVariant: 'secondary' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-triggerVariant-primary', async () => {
    const { el } = await setup({ triggerVariant: 'primary' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  /* derived: props.triggerIcon */
  it('renders-triggerIcon-ellipsis', async () => {
    const { el } = await setup({ triggerIcon: 'ellipsis' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-triggerIcon-chevron-down', async () => {
    const { el } = await setup({ triggerIcon: 'chevron-down' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-triggerIcon-none', async () => {
    const { el } = await setup({ triggerIcon: 'none' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  /* derived: props.placement */
  it('renders-placement-bottom-start', async () => {
    const { el } = await setup({ placement: 'bottom-start' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-placement-bottom-end', async () => {
    const { el } = await setup({ placement: 'bottom-end' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-placement-top-start', async () => {
    const { el } = await setup({ placement: 'top-start' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  it('renders-placement-top-end', async () => {
    const { el } = await setup({ placement: 'top-end' });
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  /* derived: a11y.requires */
  it('has-accessible-name', async () => {
    const { nativeTrigger, props } = await setup();
    expect(nativeTrigger()).toHaveAccessibleName(props.label);
  });

  it('control-is-focusable', async () => {
    const { el, trigger } = await setup();
    el.focus();
    expect(document.activeElement).toBe(el);
    expect(el.shadowRoot!.activeElement).toBe(trigger());
  });
});
