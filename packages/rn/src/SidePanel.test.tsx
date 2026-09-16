/**
 * SidePanel — behavior scenarios from the component doc, one test each, in the doc's
 * order. `non-dismissible-still-reports-escape` is scoped to web and lit, so it has
 * no test here. See generated/prompts/SidePanel.rn.md.
 */
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { SidePanel } from './SidePanel';
import type { SidePanelProps } from './SidePanel';
import meta from './SidePanel.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<SidePanelProps> = {}) {
  const onOpenChange = jest.fn();
  const props: SidePanelProps = { ...(meta.args as SidePanelProps), onOpenChange, ...given };
  const utils = render(
    <ThemeProvider mode="light">
      <SidePanel {...props} />
    </ThemeProvider>,
  );
  return { ...utils, props, onOpenChange };
}

describe('SidePanel', () => {
  it('close-button-fires-on-open-change', () => {
    const d = setup({ open: true });
    fireEvent.press(screen.getByLabelText('Close'));
    expect(d.onOpenChange).toHaveBeenCalled();
  });

  it('the-close-button-works-without-the-swipe', () => {
    const d = setup({ open: true, swipeable: false });
    fireEvent.press(screen.getByLabelText('Close'));
    expect(d.onOpenChange).toHaveBeenCalled();
  });

  it('non-dismissible-scrim-tap-does-nothing', () => {
    const d = setup({ open: true, dismissible: false });
    fireEvent.press(screen.getByTestId('SidePanel.scrim'));
    expect(d.onOpenChange).not.toHaveBeenCalled();
  });

  it('the-heading-is-rendered', () => {
    setup({ open: true, heading: 'Your cart' });
    expect(screen.getByText('Your cart')).toBeTruthy();
  });

  /* derived: a11y.role */
  it('renders', () => {
    setup();
    expect(screen.getByTestId('SidePanel')).toBeTruthy();
  });

  /* derived: props.side */
  it('renders-side-start', () => {
    setup({ side: 'start' });
    expect(screen.getByTestId('SidePanel')).toBeTruthy();
  });

  it('renders-side-end', () => {
    setup({ side: 'end' });
    expect(screen.getByTestId('SidePanel')).toBeTruthy();
  });

  /* derived: props.width */
  it('renders-width-narrow', () => {
    setup({ width: 'narrow' });
    expect(screen.getByTestId('SidePanel')).toBeTruthy();
  });

  it('renders-width-default', () => {
    setup({ width: 'default' });
    expect(screen.getByTestId('SidePanel')).toBeTruthy();
  });

  it('renders-width-wide', () => {
    setup({ width: 'wide' });
    expect(screen.getByTestId('SidePanel')).toBeTruthy();
  });

  /* derived: props.persistent */
  it('renders-persistent-never', () => {
    setup({ persistent: 'never' });
    expect(screen.getByTestId('SidePanel')).toBeTruthy();
  });

  it('renders-persistent-content', () => {
    setup({ persistent: 'content' });
    expect(screen.getByTestId('SidePanel')).toBeTruthy();
  });

  it('renders-persistent-page', () => {
    setup({ persistent: 'page' });
    expect(screen.getByTestId('SidePanel')).toBeTruthy();
  });

  /* derived: props.role */
  it('renders-role-complementary', () => {
    setup({ role: 'complementary' });
    expect(screen.getByTestId('SidePanel')).toBeTruthy();
  });

  it('renders-role-navigation', () => {
    setup({ role: 'navigation' });
    expect(screen.getByTestId('SidePanel')).toBeTruthy();
  });

  /* derived: a11y.requires */
  it('has-accessible-name', () => {
    const d = setup();
    expect(screen.getByLabelText(d.props.heading)).toBeTruthy();
  });
});
