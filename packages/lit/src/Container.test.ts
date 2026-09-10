/**
 * <ds-container> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Container has no interactive behavior (a11y.role: none), so every scenario only asserts render.
 * Runs in headless Chromium (Vitest browser mode). See generated/prompts/Container.lit.md.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import './Container.js';
import type { DsContainer } from './Container.js';
import meta from './Container.stories.js';

type Given = Partial<Pick<DsContainer, 'width' | 'gutter' | 'align' | 'element'>>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-container');
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

describe('ds-container', () => {
  /* derived: a11y.role */
  it('renders', async () => {
    const { el } = await setup();
    expect(el.shadowRoot!.querySelector('slot')).not.toBeNull();
  });

  /* derived: props.width */
  it('renders-width-prose', async () => {
    const { el } = await setup({ width: 'prose' });
    expect(el).toHaveAttribute('width', 'prose');
  });

  it('renders-width-content', async () => {
    const { el } = await setup({ width: 'content' });
    expect(el).toHaveAttribute('width', 'content');
  });

  it('renders-width-page', async () => {
    const { el } = await setup({ width: 'page' });
    expect(el).toHaveAttribute('width', 'page');
  });

  it('renders-width-full', async () => {
    const { el } = await setup({ width: 'full' });
    expect(el).toHaveAttribute('width', 'full');
  });

  /* derived: props.gutter */
  it('renders-gutter-narrow', async () => {
    const { el } = await setup({ gutter: 'narrow' });
    expect(el).toHaveAttribute('gutter', 'narrow');
  });

  it('renders-gutter-default', async () => {
    const { el } = await setup({ gutter: 'default' });
    expect(el).toHaveAttribute('gutter', 'default');
  });

  it('renders-gutter-wide', async () => {
    const { el } = await setup({ gutter: 'wide' });
    expect(el).toHaveAttribute('gutter', 'wide');
  });

  it('renders-gutter-none', async () => {
    const { el } = await setup({ gutter: 'none' });
    expect(el).toHaveAttribute('gutter', 'none');
  });

  /* derived: props.align */
  it('renders-align-center', async () => {
    const { el } = await setup({ align: 'center' });
    expect(el).toHaveAttribute('align', 'center');
  });

  it('renders-align-start', async () => {
    const { el } = await setup({ align: 'start' });
    expect(el).toHaveAttribute('align', 'start');
  });

  /* derived: props.element */
  it('renders-element-div', async () => {
    const { el } = await setup({ element: 'div' });
    expect(el.shadowRoot!.querySelector('slot')).not.toBeNull();
  });

  it('renders-element-main', async () => {
    const { el } = await setup({ element: 'main' });
    expect(el.shadowRoot!.querySelector('slot')).not.toBeNull();
  });

  it('renders-element-section', async () => {
    const { el } = await setup({ element: 'section' });
    expect(el.shadowRoot!.querySelector('slot')).not.toBeNull();
  });
});
