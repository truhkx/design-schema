/**
 * Switch — behavior scenarios from the component doc, one test each, in the doc's order.
 * Keyboard and focus scenarios are web/Lit only (the parser narrows them); a click on the
 * native Switch is a `valueChange`. See generated/prompts/Switch.rn.md.
 */
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Switch } from './Switch';
import type { SwitchProps } from './Switch';
import meta from './Switch.stories';
import { ThemeProvider } from './theme';

const DESCRIPTION = 'Sends a daily summary at 9:00.';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<SwitchProps> = {}) {
  const onValueChange = jest.fn();
  const props: SwitchProps = { ...(meta.args as SwitchProps), ...given, onValueChange };
  const tree = (p: SwitchProps) => (
    <ThemeProvider mode="light">
      <Switch {...p} />
    </ThemeProvider>
  );
  const utils = render(tree(props));
  return {
    ...utils,
    onValueChange,
    props,
    track: () => screen.getByRole('switch'),
    label: () => screen.getByText(props.label),
    description: () => screen.getByText(DESCRIPTION),
    rerender: (next: Partial<SwitchProps>) => utils.rerender(tree({ ...props, ...next })),
  };
}

describe('Switch', () => {
  it('click-on-track-toggles-on', () => {
    const s = setup();
    fireEvent(s.track(), 'valueChange', true);
    expect(s.onValueChange).toHaveBeenCalledTimes(1);
    expect(s.onValueChange).toHaveBeenCalledWith(true);
    expect(s.track()).toBeChecked();
  });

  it('click-on-label-toggles', () => {
    const s = setup();
    fireEvent.press(s.label());
    expect(s.onValueChange).toHaveBeenCalledWith(true);
    expect(s.track()).toBeChecked();
  });

  it('click-on-description-toggles', () => {
    const s = setup({ description: DESCRIPTION });
    fireEvent.press(s.description());
    expect(s.onValueChange).toHaveBeenCalledWith(true);
    expect(s.track()).toBeChecked();
  });

  it('toggles-back-off', () => {
    const s = setup({ defaultChecked: true });
    fireEvent(s.track(), 'valueChange', false);
    expect(s.onValueChange).toHaveBeenCalledWith(false);
    expect(s.track()).not.toBeChecked();
  });

  it('disabled-does-not-toggle', () => {
    const s = setup({ disabled: true });
    fireEvent(s.track(), 'valueChange', true);
    expect(s.onValueChange).not.toHaveBeenCalled();
    expect(s.track()).not.toBeChecked();
    expect(s.track()).toBeDisabled();
  });

  it('controlled-follows-prop', () => {
    const s = setup({ checked: false });
    fireEvent(s.track(), 'valueChange', true);
    expect(s.onValueChange).toHaveBeenCalledWith(true);
    expect(s.track()).not.toBeChecked();
  });

  it('controlled-updates-on-set', () => {
    const s = setup({ checked: false });
    s.rerender({ checked: true });
    expect(s.track()).toBeChecked();
  });

  it('description-is-rendered', () => {
    setup({ description: DESCRIPTION });
    expect(screen.getByText(DESCRIPTION)).toBeOnTheScreen();
  });

  it('label-at-the-end-still-toggles-the-row', () => {
    const s = setup({ labelPosition: 'end' });
    fireEvent.press(s.label());
    expect(s.onValueChange).toHaveBeenCalledWith(true);
    expect(s.track()).toBeChecked();
  });

  /* derived: a11y.role */
  it('renders', () => {
    setup();
    expect(screen.getByRole('switch')).toBeOnTheScreen();
  });

  /* derived: props.labelPosition */
  it('renders-label-position-start', () => {
    setup({ labelPosition: 'start' });
    expect(screen.getByRole('switch')).toBeOnTheScreen();
  });

  it('renders-label-position-end', () => {
    setup({ labelPosition: 'end' });
    expect(screen.getByRole('switch')).toBeOnTheScreen();
  });

  /* derived: a11y.requires */
  it('has-accessible-name', () => {
    const s = setup();
    expect(screen.getByRole('switch', { name: s.props.label })).toBeOnTheScreen();
  });
});
