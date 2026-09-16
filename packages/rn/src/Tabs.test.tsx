/**
 * Tabs — behavior scenarios from the component doc, one test each, in the doc's order.
 * `the-selected-tab-is-marked-selected` is web-only and the arrow-key scenarios are
 * web/Lit only (the parser narrows them). A click on "tab" is a press on the first tab.
 */
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Tabs, TabPanel } from './Tabs';
import type { TabsProps } from './Tabs';
import meta from './Tabs.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`, one TabPanel per tab, with a mock for every event prop. */
function setup(given: Partial<TabsProps> = {}) {
  const onChange = jest.fn();
  const base = { ...(meta.args as TabsProps), ...given };
  const props: TabsProps = {
    ...base,
    onChange,
    children: base.tabs.map((tab) => (
      <TabPanel key={tab.id} id={tab.id}>
        {null}
      </TabPanel>
    )),
  };
  const utils = render(
    <ThemeProvider mode="light">
      <Tabs {...props} />
    </ThemeProvider>,
  );
  return {
    ...utils,
    onChange,
    props,
    firstTab: () => screen.getAllByRole('tab')[0]!,
  };
}

describe('Tabs', () => {
  it('click-selects-a-tab', () => {
    const s = setup({ defaultValue: 'activity' });
    fireEvent.press(s.firstTab());
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange).toHaveBeenCalledWith('overview');
    expect(s.firstTab()).toBeSelected();
  });

  it('clicking-the-selected-tab-changes-nothing', () => {
    const s = setup({ defaultValue: 'overview' });
    fireEvent.press(s.firstTab());
    expect(s.onChange).not.toHaveBeenCalled();
    expect(s.firstTab()).toBeSelected();
  });

  it('a-disabled-tab-cannot-be-selected', () => {
    const s = setup({
      tabs: [
        { id: 'overview', label: 'Overview', disabled: true },
        { id: 'activity', label: 'Activity' },
      ],
      defaultValue: 'activity',
    });
    fireEvent.press(s.firstTab());
    expect(s.onChange).not.toHaveBeenCalled();
    expect(s.firstTab()).not.toBeSelected();
  });

  it('renders', () => {
    setup();
    expect(screen.getByTestId('Tabs')).toBeOnTheScreen();
  });

  it.each(['automatic', 'manual'] as const)('renders-activation-%s', (activation) => {
    setup({ activation });
    expect(screen.getByTestId('Tabs')).toBeOnTheScreen();
  });

  it.each(['horizontal', 'vertical'] as const)('renders-orientation-%s', (orientation) => {
    setup({ orientation });
    expect(screen.getByTestId('Tabs')).toBeOnTheScreen();
  });

  it.each(['start', 'fill'] as const)('renders-fit-%s', (fit) => {
    setup({ fit });
    expect(screen.getByTestId('Tabs')).toBeOnTheScreen();
  });

  it('has-accessible-name', () => {
    const s = setup();
    // getByRole only matches accessibility elements, and an `accessible` tablist would
    // merge its tabs into one stop on iOS; assert the role and name on the list itself.
    const list = screen.getByTestId('Tabs.tablist');
    expect(list).toHaveProp('accessibilityRole', 'tablist');
    expect(list).toHaveAccessibleName(s.props.label);
  });
});
