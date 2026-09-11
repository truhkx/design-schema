/**
 * Switch — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/switch.md) is the source of truth; the tests
 * gate runs this file after every generation round. See generated/prompts/Switch.web.md.
 */
import { describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch, type SwitchProps } from './Switch';
import meta from './Switch.stories';
import type { ComponentProps } from 'react';

const DESCRIPTION = 'Sends a daily summary at 9:00.';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<SwitchProps> = {}) {
  const onChange = vi.fn();
  const props = { ...meta.args, ...given, onChange };
  const utils = render(<Switch {...(props as ComponentProps<typeof Switch>)} />);
  const user = userEvent.setup();
  return {
    ...utils,
    user,
    onChange,
    props,
    track: () => screen.getByRole('switch'),
    label: () => screen.getByText(props.label!),
    description: () => screen.getByText(DESCRIPTION),
    rerender: (next: Partial<SwitchProps>) => utils.rerender(<Switch {...(props as ComponentProps<typeof Switch>)} {...next} />),
  };
}

describe('Switch', () => {
  it('click-on-track-toggles-on', async () => {
    const s = setup();
    await s.user.click(s.track());
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange).toHaveBeenCalledWith(true, expect.anything());
    expect(s.track()).toBeChecked();
  });

  it('click-on-label-toggles', async () => {
    const s = setup();
    await s.user.click(s.label());
    expect(s.onChange).toHaveBeenCalledWith(true, expect.anything());
    expect(s.track()).toBeChecked();
  });

  it('click-on-description-toggles', async () => {
    const s = setup({ description: DESCRIPTION });
    await s.user.click(s.description());
    expect(s.onChange).toHaveBeenCalledWith(true, expect.anything());
    expect(s.track()).toBeChecked();
  });

  it('space-toggles', async () => {
    const s = setup();
    act(() => s.track().focus());
    await s.user.keyboard('[Space]');
    expect(s.onChange).toHaveBeenCalledWith(true, expect.anything());
    expect(s.track()).toBeChecked();
  });

  it('enter-is-ignored', async () => {
    const s = setup();
    act(() => s.track().focus());
    await s.user.keyboard('{Enter}');
    expect(s.onChange).not.toHaveBeenCalled();
    expect(s.track()).not.toBeChecked();
  });

  it('toggles-back-off', async () => {
    const s = setup({ defaultChecked: true });
    await s.user.click(s.track());
    expect(s.onChange).toHaveBeenCalledWith(false, expect.anything());
    expect(s.track()).not.toBeChecked();
  });

  it('disabled-does-not-toggle', async () => {
    const s = setup({ disabled: true });
    await s.user.click(s.track());
    expect(s.onChange).not.toHaveBeenCalled();
    expect(s.track()).not.toBeChecked();
    expect(s.track()).toHaveAttribute('aria-disabled', 'true');
  });

  it('disabled-stays-focusable', () => {
    const s = setup({ disabled: true });
    act(() => s.track().focus());
    expect(s.track()).toHaveFocus();
  });

  it('controlled-follows-prop', async () => {
    const s = setup({ checked: false });
    await s.user.click(s.track());
    expect(s.onChange).toHaveBeenCalledWith(true, expect.anything());
    expect(s.track()).not.toBeChecked();
  });

  it('controlled-updates-on-set', () => {
    const s = setup({ checked: false });
    s.rerender({ checked: true });
    expect(s.track()).toBeChecked();
  });

  it('description-is-rendered', () => {
    setup({ description: DESCRIPTION });
    expect(screen.getByText(DESCRIPTION)).toBeInTheDocument();
  });

  /* derived: a11y.role */
  it('renders', () => {
    setup();
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  /* derived: props.labelPosition */
  it('renders-labelposition-start', () => {
    setup({ labelPosition: 'start' });
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  it('renders-labelposition-end', () => {
    setup({ labelPosition: 'end' });
    expect(screen.getByRole('switch')).toBeInTheDocument();
  });

  /* derived: a11y.requires */
  it('has-accessible-name', () => {
    const s = setup();
    expect(screen.getByRole('switch', { name: s.props.label! })).toHaveAccessibleName();
  });

  it('control-is-focusable', () => {
    const s = setup();
    act(() => s.track().focus());
    expect(s.track()).toHaveFocus();
  });
});
