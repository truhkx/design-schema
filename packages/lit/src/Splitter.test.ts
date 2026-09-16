/**
 * <ds-splitter> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode). The browser viewport is narrower than
 * layout.maxWidth.prose, so each element is given an inline size wider than it; otherwise the
 * horizontal splitter stacks and renders no separator.
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import './Splitter.js';
import type { DsSplitter, SplitterCollapseChangeDetail, SplitterSizeChangeDetail } from './Splitter.js';
import meta from './Splitter.stories.js';

type Given = Partial<
  Pick<
    DsSplitter,
    | 'label'
    | 'orientation'
    | 'defaultSize'
    | 'minSize'
    | 'maxSize'
    | 'step'
    | 'collapsible'
    | 'defaultCollapsed'
    | 'stackBelow'
  >
>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-splitter');
  el.style.inlineSize = '200vw';
  el.style.blockSize = '50vh';
  const { primary, secondary, ...args } = meta.args ?? {};
  const props = { ...args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  const primaryEl = document.createElement('div');
  primaryEl.slot = 'primary';
  primaryEl.textContent = primary ?? '';
  const secondaryEl = document.createElement('div');
  secondaryEl.slot = 'secondary';
  secondaryEl.textContent = secondary ?? '';
  el.append(primaryEl, secondaryEl);

  const sizeChange = vi.fn<(event: CustomEvent<SplitterSizeChangeDetail>) => void>();
  const sizeChangeEnd = vi.fn<(event: CustomEvent<SplitterSizeChangeDetail>) => void>();
  const collapseChange = vi.fn<(event: CustomEvent<SplitterCollapseChangeDetail>) => void>();
  el.addEventListener('size-change', sizeChange as unknown as EventListener);
  el.addEventListener('size-change-end', sizeChangeEnd as unknown as EventListener);
  el.addEventListener('collapse-change', collapseChange as unknown as EventListener);
  document.body.append(el);
  await el.updateComplete;
  const root = el.shadowRoot!;
  return {
    el,
    props,
    sizeChange,
    sizeChangeEnd,
    collapseChange,
    separator: () => root.querySelector<HTMLElement>('[role=separator]')!,
    part: (name: string) => root.querySelector<HTMLElement>(`[data-part=${name}]`),
  };
}

async function pressOn(target: HTMLElement, key: string) {
  target.focus();
  await userEvent.keyboard(`{${key}}`);
}

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-splitter', () => {
  it('arrow-grows-the-primary-pane', async () => {
    const s = await setup({ defaultSize: 50 });
    await pressOn(s.separator(), 'ArrowRight');
    expect(s.sizeChange).toHaveBeenCalled();
    expect(s.sizeChangeEnd).toHaveBeenCalled();
  });

  it('arrow-shrinks-the-primary-pane', async () => {
    const s = await setup({ defaultSize: 50 });
    await pressOn(s.separator(), 'ArrowLeft');
    expect(s.sizeChange).toHaveBeenCalled();
    expect(s.sizeChangeEnd).toHaveBeenCalled();
  });

  it('home-sets-the-primary-pane-to-its-minimum', async () => {
    const s = await setup({ defaultSize: 50, minSize: 20 });
    await pressOn(s.separator(), 'Home');
    expect(s.sizeChange).toHaveBeenCalled();
    expect(s.sizeChange.mock.calls.at(-1)?.[0].detail.size).toBe(20);
  });

  it('end-sets-the-primary-pane-to-its-maximum', async () => {
    const s = await setup({ defaultSize: 50, maxSize: 80 });
    await pressOn(s.separator(), 'End');
    expect(s.sizeChange).toHaveBeenCalled();
    expect(s.sizeChange.mock.calls.at(-1)?.[0].detail.size).toBe(80);
  });

  it('enter-collapses-a-collapsible-pane', async () => {
    const s = await setup({ collapsible: true, defaultSize: 40 });
    await pressOn(s.separator(), 'Enter');
    expect(s.collapseChange).toHaveBeenCalled();
    expect(s.collapseChange.mock.calls.at(-1)?.[0].detail.collapsed).toBe(true);
  });

  it('enter-does-nothing-when-the-pane-cannot-collapse', async () => {
    const s = await setup();
    await pressOn(s.separator(), 'Enter');
    expect(s.collapseChange).not.toHaveBeenCalled();
  });

  it('the-collapse-button-collapses-the-pane', async () => {
    const s = await setup({ collapsible: true, defaultSize: 40 });
    const button = s.part('collapseButton');
    expect(button).toBeTruthy();
    await userEvent.click(button!);
    expect(s.collapseChange).toHaveBeenCalled();
  });

  it('a-collapsed-pane-ignores-the-arrow-keys', async () => {
    const s = await setup({ collapsible: true, defaultCollapsed: true });
    await pressOn(s.separator(), 'ArrowRight');
    expect(s.sizeChange).not.toHaveBeenCalled();
  });

  it('renders', async () => {
    const s = await setup();
    expect(s.part('primaryPane')).toBeTruthy();
    expect(s.part('secondaryPane')).toBeTruthy();
    expect(s.separator()).toBeTruthy();
  });

  it('renders-orientation-horizontal', async () => {
    const s = await setup({ orientation: 'horizontal' });
    expect(s.separator()).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('renders-orientation-vertical', async () => {
    const s = await setup({ orientation: 'vertical' });
    expect(s.separator()).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('renders-stack-below-prose', async () => {
    const s = await setup({ stackBelow: 'prose' });
    expect(s.part('primaryPane')).toBeTruthy();
  });

  it('renders-stack-below-content', async () => {
    const s = await setup({ stackBelow: 'content' });
    expect(s.part('primaryPane')).toBeTruthy();
  });

  it('renders-stack-below-never', async () => {
    const s = await setup({ stackBelow: 'never' });
    expect(s.part('primaryPane')).toBeTruthy();
    expect(s.separator()).toBeTruthy();
  });

  it('has-accessible-name', async () => {
    const s = await setup();
    expect(s.separator()).toHaveAccessibleName(s.props.label!);
  });
});
