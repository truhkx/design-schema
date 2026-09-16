/**
 * SegmentedControl — behavior scenarios from the component doc, one test each, in the
 * doc's order. The arrow-key scenarios are web/Lit only (the parser narrows them). A
 * click on "segment" is a press on the first segment.
 */
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SegmentedControl } from './SegmentedControl';
import type { SegmentedControlProps } from './SegmentedControl';
import meta from './SegmentedControl.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<SegmentedControlProps> = {}) {
  const onChange = jest.fn();
  const props: SegmentedControlProps = { ...(meta.args as SegmentedControlProps), ...given, onChange };
  const utils = render(
    <ThemeProvider mode="light">
      <SegmentedControl {...props} />
    </ThemeProvider>,
  );
  return {
    ...utils,
    onChange,
    props,
    firstSegment: () => screen.getAllByRole('radio')[0]!,
  };
}

describe('SegmentedControl', () => {
  it('click-selects-a-segment', () => {
    const s = setup({
      options: [
        { value: 'list', label: 'List' },
        { value: 'grid', label: 'Grid' },
      ],
      defaultValue: 'grid',
    });
    fireEvent.press(s.firstSegment());
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange).toHaveBeenCalledWith('list');
    expect(s.firstSegment()).toBeChecked();
  });

  it('disabled-segment-is-not-selectable', () => {
    const s = setup({
      options: [
        { value: 'list', label: 'List', disabled: true },
        { value: 'grid', label: 'Grid' },
      ],
      defaultValue: 'grid',
    });
    fireEvent.press(s.firstSegment());
    expect(s.onChange).not.toHaveBeenCalled();
    expect(s.firstSegment()).not.toBeChecked();
  });

  it('renders', () => {
    setup();
    expect(screen.getByTestId('SegmentedControl')).toBeOnTheScreen();
  });

  it.each(['sm', 'md'] as const)('renders-size-%s', (size) => {
    setup({ size });
    expect(screen.getByTestId('SegmentedControl')).toBeOnTheScreen();
  });

  it('has-accessible-name', () => {
    const s = setup();
    // The group is not `accessible` (that would merge its segments into one stop), so
    // getByRole cannot reach it; assert the role and name on the root itself.
    const group = screen.getByTestId('SegmentedControl');
    expect(group).toHaveProp('accessibilityRole', 'radiogroup');
    expect(group).toHaveAccessibleName(s.props.label);
  });
});
