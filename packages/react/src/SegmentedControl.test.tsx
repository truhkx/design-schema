/**
 * SegmentedControl — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/segmented-control.md) is the source of truth.
 */
import { describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { SegmentedControl, type SegmentedControlProps } from './SegmentedControl';
import meta from './SegmentedControl.stories';

const LIST_GRID = [
  { value: 'list', label: 'List' },
  { value: 'grid', label: 'Grid' },
];

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<SegmentedControlProps> = {}) {
  const onChange = vi.fn();
  const props = { ...meta.args, ...given, onChange } as ComponentProps<typeof SegmentedControl>;
  const utils = render(<SegmentedControl {...props} />);
  const user = userEvent.setup();
  return {
    ...utils,
    user,
    onChange,
    props,
    group: () => utils.container.querySelector<HTMLElement>('[data-ds="SegmentedControl"]')!,
    segment: () => utils.container.querySelector<HTMLElement>('[data-part="segment"]')!,
    selected: () => utils.container.querySelector<HTMLElement>('[data-part="segment"][aria-checked="true"]')!,
  };
}

describe('SegmentedControl', () => {
  it('click-selects-a-segment', async () => {
    const s = setup({ options: LIST_GRID, defaultValue: 'grid' });
    await s.user.click(s.segment());
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange).toHaveBeenCalledWith('list');
  });

  it('arrow-moves-and-selects', async () => {
    const s = setup({ options: LIST_GRID, defaultValue: 'list' });
    act(() => s.selected().focus());
    await s.user.keyboard('{ArrowRight}');
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange).toHaveBeenCalledWith('grid');
    expect(screen.getByRole('radio', { name: 'Grid' })).toHaveFocus();
  });

  it('arrow-wraps-from-the-last-segment', async () => {
    const s = setup({ options: LIST_GRID, defaultValue: 'grid' });
    act(() => s.selected().focus());
    await s.user.keyboard('{ArrowRight}');
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange).toHaveBeenCalledWith('list');
    expect(screen.getByRole('radio', { name: 'List' })).toHaveFocus();
  });

  it('disabled-segment-is-not-selectable', async () => {
    const s = setup({
      options: [
        { value: 'list', label: 'List', disabled: true },
        { value: 'grid', label: 'Grid' },
      ],
      defaultValue: 'grid',
    });
    await s.user.click(s.segment());
    expect(s.onChange).not.toHaveBeenCalled();
  });

  it('renders', () => {
    const s = setup();
    expect(s.group()).not.toBeNull();
  });

  it('renders-size-sm', () => {
    const s = setup({ size: 'sm' });
    expect(s.group()).not.toBeNull();
  });

  it('renders-size-md', () => {
    const s = setup({ size: 'md' });
    expect(s.group()).not.toBeNull();
  });

  it('has-accessible-name', () => {
    const s = setup();
    expect(screen.getByRole('radiogroup', { name: s.props.label })).toBe(s.group());
  });
});
