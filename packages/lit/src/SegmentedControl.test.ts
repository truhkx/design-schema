/**
 * <ds-segmented-control> — behavior scenarios from the component doc, one test each, in the doc's order.
 * Runs in headless Chromium (Vitest browser mode).
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { userEvent } from 'vitest/browser';
import './SegmentedControl.js';
import type { DsSegmentedControl, SegmentedControlChangeDetail, SegmentedControlSize } from './SegmentedControl.js';
import meta from './SegmentedControl.stories.js';

type Given = Partial<Pick<DsSegmentedControl, 'label' | 'options' | 'value' | 'defaultValue' | 'iconOnly' | 'size' | 'fill'>>;

/** The Default story's args plus the scenario's `given`, as properties on a fresh element. */
async function setup(given: Given = {}) {
  const el = document.createElement('ds-segmented-control');
  const props = { ...meta.args, ...given };
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) (el as unknown as Record<string, unknown>)[key] = value;
  }
  const change = vi.fn<(event: CustomEvent<SegmentedControlChangeDetail>) => void>();
  el.addEventListener('change', change as unknown as EventListener);
  document.body.append(el);
  await el.updateComplete;
  const root = el.shadowRoot!;
  return {
    el,
    change,
    props,
    group: () => root.querySelector<HTMLElement>('[data-part=group]')!,
    segments: () => Array.from(root.querySelectorAll<HTMLButtonElement>('[data-part=segment]')),
    segment: () => root.querySelector<HTMLButtonElement>('[data-part=segment]')!,
    checked: () => root.querySelector<HTMLButtonElement>('[data-part=segment][aria-checked=true]')!,
  };
}

const LIST_GRID = [
  { value: 'list', label: 'List' },
  { value: 'grid', label: 'Grid' },
];

beforeEach(() => {
  document.body.replaceChildren();
});

describe('ds-segmented-control', () => {
  it('click-selects-a-segment', async () => {
    const s = await setup({ options: LIST_GRID, defaultValue: 'grid' });
    await userEvent.click(s.segment());
    await s.el.updateComplete;
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.change.mock.calls[0]?.[0].detail).toEqual({ value: 'list' });
  });

  it('arrow-moves-and-selects', async () => {
    const s = await setup({ options: LIST_GRID, defaultValue: 'list' });
    s.checked().focus();
    await userEvent.keyboard('{ArrowRight}');
    await s.el.updateComplete;
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.change.mock.calls[0]?.[0].detail).toEqual({ value: 'grid' });
    expect(s.el.shadowRoot!.activeElement).toBe(s.segments()[1]);
  });

  it('arrow-wraps-from-the-last-segment', async () => {
    const s = await setup({ options: LIST_GRID, defaultValue: 'grid' });
    s.checked().focus();
    await userEvent.keyboard('{ArrowRight}');
    await s.el.updateComplete;
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.checked()).toBe(s.segments()[0]);
  });

  it('disabled-segment-is-not-selectable', async () => {
    const s = await setup({
      options: [
        { value: 'list', label: 'List', disabled: true },
        { value: 'grid', label: 'Grid' },
      ],
      defaultValue: 'grid',
    });
    // Playwright will not click a disabled control on its own; a person can try.
    await userEvent.click(s.segment(), { force: true });
    await s.el.updateComplete;
    expect(s.change).not.toHaveBeenCalled();
    expect(s.segment()).toHaveAttribute('aria-checked', 'false');
  });

  it('arrow-skips-disabled-segments', async () => {
    const s = await setup({
      options: [
        { value: 'list', label: 'List' },
        { value: 'grid', label: 'Grid', disabled: true },
        { value: 'table', label: 'Table' },
      ],
      defaultValue: 'list',
    });
    s.checked().focus();
    await userEvent.keyboard('{ArrowRight}');
    await s.el.updateComplete;
    expect(s.change).toHaveBeenCalledTimes(1);
    expect(s.change.mock.calls[0]?.[0].detail).toEqual({ value: 'table' });
  });

  /* derived */
  it('renders', async () => {
    const s = await setup();
    expect(s.group()).not.toBeNull();
    expect(s.segments()).toHaveLength(s.el.options.length);
  });

  for (const size of ['sm', 'md'] as SegmentedControlSize[]) {
    it(`renders-size-${size}`, async () => {
      const s = await setup({ size });
      expect(s.group()).not.toBeNull();
      expect(s.el).toHaveAttribute('size', size);
    });
  }

  it('has-accessible-name', async () => {
    const s = await setup();
    expect(s.group()).toHaveAccessibleName(s.props.label);
  });
});
