/**
 * Popover — behavior scenarios from the component doc, one test each, in the doc's
 * order. On native a click is `fireEvent.press`; the test renderer's window is wider
 * than `layout.maxWidth.prose`, so the anchored panel (not BottomSheet) is what renders.
 * `escape-closes-a-modal-popover` is scoped to web and lit, so it has no test here.
 * A closed Modal renders nothing, so the root testID `Popover` is the panel itself.
 * See generated/prompts/Popover.rn.md.
 */
import * as React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react-native';
import { Popover } from './Popover';
import type { PopoverProps } from './Popover';
import meta from './Popover.stories';
import { ThemeProvider } from './theme';

/** The Default story's consumer: owns `open`, starting true, and writes `onOpenChange` back into it. */
function OpenPopover(props: PopoverProps): React.JSX.Element {
  const [open, setOpen] = React.useState(true);
  return (
    <Popover
      {...props}
      open={open}
      onOpenChange={(next, reason) => {
        setOpen(next);
        props.onOpenChange?.(next, reason);
      }}
    />
  );
}

/** The Default story (open, filter-panel args) plus the scenario's `given`, with the event spied. A given `open` controls it directly. */
function setup(given: Partial<PopoverProps> = {}) {
  const onOpenChange = jest.fn();
  const props: PopoverProps = { ...(meta.args as PopoverProps), onOpenChange, ...given };
  const utils = render(
    <ThemeProvider mode="light">{given.open !== undefined ? <Popover {...props} /> : <OpenPopover {...props} />}</ThemeProvider>,
  );
  return { ...utils, props, onOpenChange };
}

describe('Popover', () => {
  it('close-button-fires-on-open-change', () => {
    const p = setup({ open: true });
    fireEvent.press(within(screen.getByTestId('Popover.closeButton')).getByLabelText('Close'));
    expect(p.onOpenChange).toHaveBeenCalledWith(false, 'close-button');
  });

  it('the-panel-is-named-by-its-heading', () => {
    setup({ open: true, heading: 'Filters' });
    // Asserted on props, not `getByRole`: the panel groups focusable controls, so it is
    // not itself an `accessible` host element and the ByRole query cannot reach it.
    const panel = screen.getByTestId('Popover');
    expect(panel.props.role).toBe('dialog');
    expect(panel.props.accessibilityLabel).toBe('Filters');
  });

  /* derived: a11y.role */
  it('renders', () => {
    setup();
    expect(screen.getByTestId('Popover')).toBeOnTheScreen();
  });

  /* derived: props.headingLevel */
  it('renders-heading-level-2', () => {
    setup({ headingLevel: '2' });
    expect(screen.getByTestId('Popover')).toBeOnTheScreen();
  });

  it('renders-heading-level-3', () => {
    setup({ headingLevel: '3' });
    expect(screen.getByTestId('Popover')).toBeOnTheScreen();
  });

  it('renders-heading-level-4', () => {
    setup({ headingLevel: '4' });
    expect(screen.getByTestId('Popover')).toBeOnTheScreen();
  });

  /* derived: props.placement */
  it('renders-placement-bottom-start', () => {
    setup({ placement: 'bottom-start' });
    expect(screen.getByTestId('Popover')).toBeOnTheScreen();
  });

  it('renders-placement-bottom', () => {
    setup({ placement: 'bottom' });
    expect(screen.getByTestId('Popover')).toBeOnTheScreen();
  });

  it('renders-placement-bottom-end', () => {
    setup({ placement: 'bottom-end' });
    expect(screen.getByTestId('Popover')).toBeOnTheScreen();
  });

  it('renders-placement-top-start', () => {
    setup({ placement: 'top-start' });
    expect(screen.getByTestId('Popover')).toBeOnTheScreen();
  });

  it('renders-placement-top', () => {
    setup({ placement: 'top' });
    expect(screen.getByTestId('Popover')).toBeOnTheScreen();
  });

  it('renders-placement-top-end', () => {
    setup({ placement: 'top-end' });
    expect(screen.getByTestId('Popover')).toBeOnTheScreen();
  });

  it('renders-placement-start', () => {
    setup({ placement: 'start' });
    expect(screen.getByTestId('Popover')).toBeOnTheScreen();
  });

  it('renders-placement-end', () => {
    setup({ placement: 'end' });
    expect(screen.getByTestId('Popover')).toBeOnTheScreen();
  });

  /* derived: props.initialFocus */
  it('renders-initial-focus-first', () => {
    setup({ initialFocus: 'first' });
    expect(screen.getByTestId('Popover')).toBeOnTheScreen();
  });

  it('renders-initial-focus-none', () => {
    setup({ initialFocus: 'none' });
    expect(screen.getByTestId('Popover')).toBeOnTheScreen();
  });

  /* derived: a11y.requires — the open Default panel is named */
  it('has-accessible-name', () => {
    setup();
    expect(screen.getByTestId('Popover').props.accessibilityLabel).toBe('Filters');
  });
});
