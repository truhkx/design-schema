/**
 * <ds-toolbar> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode). See generated/prompts/Toolbar.lit.md.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import './Toolbar.js';
import './Button.js';
import type { DsToolbar } from './Toolbar.js';
import meta from './Toolbar.stories.js';

type Given = Partial<Pick<DsToolbar, 'label' | 'orientation' | 'overflow' | 'size' | 'density'>>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element with three Buttons. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-toolbar');
  const { children: _children, ...args } = meta.args ?? {};
  const props = { ...args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  for (const label of ['Bold', 'Italic', 'Underline']) {
    const button = document.createElement('ds-button');
    button.setAttribute('label', label);
    button.setAttribute('overflow-label', label);
    el.append(button);
  }
  document.body.append(el);
  await el.updateComplete;
  return { el, props };
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-toolbar', () => {
  it('horizontal-is-the-reported-orientation', async () => {
    const { el } = await setup();
    expect(el).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('vertical-toolbar-reports-its-orientation', async () => {
    const { el } = await setup({ orientation: 'vertical' });
    expect(el).toHaveAttribute('aria-orientation', 'vertical');
  });

  /* derived */
  it('renders', async () => {
    const { el } = await setup();
    expect(el).toHaveAttribute('data-ds', 'Toolbar');
    expect(el).toHaveAttribute('role', 'toolbar');
    expect(el.shadowRoot).not.toBeNull();
    // Every entry reaches a per-entry slot: the toolbar renders one <slot> per child rather than a single default slot.
    for (const child of Array.from(el.children)) {
      expect((child as HTMLElement).assignedSlot).not.toBeNull();
    }
  });

  /* derived: props.orientation */
  it('renders-orientation-horizontal', async () => {
    const { el } = await setup({ orientation: 'horizontal' });
    expect(el).toHaveAttribute('orientation', 'horizontal');
  });

  it('renders-orientation-vertical', async () => {
    const { el } = await setup({ orientation: 'vertical' });
    expect(el).toHaveAttribute('orientation', 'vertical');
  });

  /* derived: props.overflow */
  it('renders-overflow-wrap', async () => {
    const { el } = await setup({ overflow: 'wrap' });
    expect(el).toHaveAttribute('overflow', 'wrap');
  });

  it('renders-overflow-menu', async () => {
    const { el } = await setup({ overflow: 'menu' });
    expect(el).toHaveAttribute('overflow', 'menu');
  });

  it('renders-overflow-scroll', async () => {
    const { el } = await setup({ overflow: 'scroll' });
    expect(el).toHaveAttribute('overflow', 'scroll');
  });

  /* derived: props.size */
  it('renders-size-sm', async () => {
    const { el } = await setup({ size: 'sm' });
    expect(el).toHaveAttribute('size', 'sm');
  });

  it('renders-size-md', async () => {
    const { el } = await setup({ size: 'md' });
    expect(el).toHaveAttribute('size', 'md');
  });

  /* derived: props.density */
  it('renders-density-compact', async () => {
    const { el } = await setup({ density: 'compact' });
    expect(el).toHaveAttribute('density', 'compact');
  });

  it('renders-density-comfortable', async () => {
    const { el } = await setup({ density: 'comfortable' });
    expect(el).toHaveAttribute('density', 'comfortable');
  });

  /* derived: a11y.requires accessible-name */
  it('has-accessible-name', async () => {
    const { el, props } = await setup();
    expect(el).toHaveAccessibleName(props.label);
  });
});
