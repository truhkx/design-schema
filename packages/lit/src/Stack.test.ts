/**
 * <ds-stack> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Stack has no interactive behavior (a11y.role: none): the two `element` scenarios assert the
 * semantics the wrapper renders, and every derived scenario only asserts render.
 * Runs in headless Chromium (Vitest browser mode). See generated/prompts/Stack.lit.md.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import './Stack.js';
import './Text.js';
import type { DsStack } from './Stack.js';
import meta from './Stack.stories.js';

type Given = Partial<Pick<DsStack, 'direction' | 'gap' | 'align' | 'justify' | 'wrap' | 'element'>>;

/**
 * The Default story's args plus the scenario's `given`, as properties on a fresh element,
 * with the Default story's three Text children.
 */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-stack');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  for (const label of ['First item', 'Second item', 'Third item']) {
    const text = document.createElement('ds-text');
    text.textContent = label;
    el.append(text);
  }
  document.body.append(el);
  await el.updateComplete;
  return { el };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-stack', () => {
  it('nav-element-is-a-navigation-landmark', async () => {
    const { el } = await setup({ element: 'nav' });
    /* a native <nav> is the navigation landmark; no role attribute is needed */
    const nav = el.shadowRoot!.querySelector('nav');
    expect(nav).not.toBeNull();
    expect(page.getByRole('navigation').elements()).toContain(nav);
  });

  it('list-element-is-a-list', async () => {
    const { el } = await setup({ element: 'ul' });
    const list = el.shadowRoot!.querySelector('ul');
    expect(list).not.toBeNull();
    expect(page.getByRole('list').elements()).toContain(list);
    expect(page.getByRole('listitem').elements()).toHaveLength(3);
    /* each child is wrapped in an li, so assistive technology counts the items */
    const items = el.shadowRoot!.querySelectorAll<HTMLSlotElement>('li[role="listitem"][part="item"] > slot');
    expect(items).toHaveLength(3);
    items.forEach((slot, i) => expect(slot.assignedNodes()).toEqual([el.children[i]]));
  });

  /* derived: a11y.role */
  it('renders', async () => {
    const { el } = await setup();
    expect(el.shadowRoot!.childElementCount).toBeGreaterThan(0);
  });

  /* derived: props.direction */
  it('renders-direction-vertical', async () => {
    const { el } = await setup({ direction: 'vertical' });
    expect(el).toHaveAttribute('direction', 'vertical');
  });

  it('renders-direction-horizontal', async () => {
    const { el } = await setup({ direction: 'horizontal' });
    expect(el).toHaveAttribute('direction', 'horizontal');
  });

  /* derived: props.gap */
  it('renders-gap-none', async () => {
    const { el } = await setup({ gap: 'none' });
    expect(el).toHaveAttribute('gap', 'none');
  });

  it('renders-gap-tight', async () => {
    const { el } = await setup({ gap: 'tight' });
    expect(el).toHaveAttribute('gap', 'tight');
  });

  it('renders-gap-normal', async () => {
    const { el } = await setup({ gap: 'normal' });
    expect(el).toHaveAttribute('gap', 'normal');
  });

  it('renders-gap-loose', async () => {
    const { el } = await setup({ gap: 'loose' });
    expect(el).toHaveAttribute('gap', 'loose');
  });

  it('renders-gap-section', async () => {
    const { el } = await setup({ gap: 'section' });
    expect(el).toHaveAttribute('gap', 'section');
  });

  /* derived: props.align */
  it('renders-align-start', async () => {
    const { el } = await setup({ align: 'start' });
    expect(el).toHaveAttribute('align', 'start');
  });

  it('renders-align-center', async () => {
    const { el } = await setup({ align: 'center' });
    expect(el).toHaveAttribute('align', 'center');
  });

  it('renders-align-end', async () => {
    const { el } = await setup({ align: 'end' });
    expect(el).toHaveAttribute('align', 'end');
  });

  it('renders-align-stretch', async () => {
    const { el } = await setup({ align: 'stretch' });
    expect(el).toHaveAttribute('align', 'stretch');
  });

  /* derived: props.justify */
  it('renders-justify-start', async () => {
    const { el } = await setup({ justify: 'start' });
    expect(el).toHaveAttribute('justify', 'start');
  });

  it('renders-justify-center', async () => {
    const { el } = await setup({ justify: 'center' });
    expect(el).toHaveAttribute('justify', 'center');
  });

  it('renders-justify-end', async () => {
    const { el } = await setup({ justify: 'end' });
    expect(el).toHaveAttribute('justify', 'end');
  });

  it('renders-justify-between', async () => {
    const { el } = await setup({ justify: 'between' });
    expect(el).toHaveAttribute('justify', 'between');
  });

  /* derived: props.element (web, lit) */
  it('renders-element-div', async () => {
    const { el } = await setup({ element: 'div' });
    expect(el.shadowRoot!.querySelector('slot')).not.toBeNull();
  });

  it('renders-element-section', async () => {
    const { el } = await setup({ element: 'section' });
    expect(el.shadowRoot!.querySelector('section')).not.toBeNull();
  });

  it('renders-element-nav', async () => {
    const { el } = await setup({ element: 'nav' });
    expect(el.shadowRoot!.querySelector('nav')).not.toBeNull();
  });

  it('renders-element-ul', async () => {
    const { el } = await setup({ element: 'ul' });
    expect(el.shadowRoot!.querySelector('ul[role="list"]')).not.toBeNull();
  });

  it('renders-element-ol', async () => {
    const { el } = await setup({ element: 'ol' });
    expect(el.shadowRoot!.querySelector('ol[role="list"]')).not.toBeNull();
  });
});
