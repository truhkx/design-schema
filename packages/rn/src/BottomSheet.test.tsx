/**
 * BottomSheet — behavior scenarios from the component doc, one test each, in the doc's
 * order. `non-dismissible-still-reports-escape` is scoped to web and lit, so it has no
 * test here. The scenarios describe the phone presentation, so the window is set
 * narrower than `layout.maxWidth.prose` (Jest's default 750-wide window presents as
 * Dialog). See generated/prompts/BottomSheet.rn.md.
 */
import * as React from 'react';
import { Dimensions } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { BottomSheet } from './BottomSheet';
import type { BottomSheetProps } from './BottomSheet';
import meta from './BottomSheet.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<BottomSheetProps> = {}) {
  const onClose = jest.fn();
  const props: BottomSheetProps = { ...(meta.args as BottomSheetProps), onClose, ...given };
  const utils = render(
    <ThemeProvider mode="light">
      <BottomSheet {...props} />
    </ThemeProvider>,
  );
  return { ...utils, props, onClose };
}

const PHONE = { width: 390, height: 844, scale: 3, fontScale: 1 }; // literal-ok: a phone window for the test, not a design size

beforeAll(() => {
  Dimensions.set({ window: PHONE, screen: PHONE });
});

describe('BottomSheet', () => {
  it('close-button-fires-on-close', () => {
    const d = setup({ open: true });
    fireEvent.press(screen.getByLabelText('Close'));
    expect(d.onClose).toHaveBeenCalled();
  });

  it('the-close-button-works-without-the-drag-gesture', () => {
    const d = setup({ open: true, dragToDismiss: false });
    fireEvent.press(screen.getByLabelText('Close'));
    expect(d.onClose).toHaveBeenCalled();
  });

  it('non-dismissible-scrim-tap-does-nothing', () => {
    const d = setup({ open: true, dismissible: false });
    fireEvent.press(screen.getByTestId('BottomSheet.scrim'));
    expect(d.onClose).not.toHaveBeenCalled();
  });

  it('hidden-heading-is-still-the-accessible-name', () => {
    const d = setup({ open: true, hideHeading: true });
    expect(screen.getByLabelText(d.props.heading)).toBeTruthy();
  });

  it('closed-sheet-renders-nothing', () => {
    const d = setup({ open: false });
    expect(screen.queryByTestId('BottomSheet')).toBeNull();
    expect(screen.queryByText(d.props.heading)).toBeNull();
  });

  /* derived: a11y.role */
  it('renders', () => {
    setup();
    expect(screen.getByTestId('BottomSheet')).toBeTruthy();
  });

  /* derived: props.height */
  it('renders-height-content', () => {
    setup({ height: 'content' });
    expect(screen.getByTestId('BottomSheet')).toBeTruthy();
  });

  it('renders-height-half', () => {
    setup({ height: 'half' });
    expect(screen.getByTestId('BottomSheet')).toBeTruthy();
  });

  it('renders-height-full', () => {
    setup({ height: 'full' });
    expect(screen.getByTestId('BottomSheet')).toBeTruthy();
  });

  /* derived: a11y.requires */
  it('has-accessible-name', () => {
    const d = setup();
    expect(screen.getByLabelText(d.props.heading)).toBeTruthy();
  });
});
