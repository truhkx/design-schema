/**
 * CtaButton — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/button.md) is the source of truth; the tests
 * gate runs this file after every generation round. See generated/prompts/CtaButton.web.md.
 */
import { describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CtaButton, type CtaButtonProps } from './CtaButton';
import meta from './CtaButton.stories';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<CtaButtonProps> = {}) {
  const onClick = vi.fn();
  const onTrack = vi.fn();
  const props = { ...meta.args, ...given, onClick, onTrack } as CtaButtonProps;
  const utils = render(<CtaButton {...props} />);
  const user = userEvent.setup();
  return {
    ...utils,
    user,
    onClick,
    onTrack,
    props,
    control: () => screen.getByRole('button'),
  };
}

describe('CtaButton', () => {
  it('click-fires-on-press', async () => {
    const s = setup();
    await s.user.click(s.control());
    expect(s.onClick).toHaveBeenCalledTimes(1);
  });

  /* Activation fires onPress exactly once per pointer click, Enter key, Space key, or
     assistive-technology activation. */
  it('enter-activates', async () => {
    const s = setup();
    act(() => s.control().focus());
    await s.user.keyboard('{Enter}');
    expect(s.onClick).toHaveBeenCalledTimes(1);
  });

  it('space-activates', async () => {
    const s = setup();
    act(() => s.control().focus());
    await s.user.keyboard('[Space]');
    expect(s.onClick).toHaveBeenCalledTimes(1);
  });

  it('disabled-does-not-fire', async () => {
    const s = setup({ disabled: true });
    await s.user.click(s.control());
    expect(s.onClick).not.toHaveBeenCalled();
    expect(s.control()).toHaveAttribute('aria-disabled', 'true');
  });

  /* aria-disabled, not the native attribute, so the button stays in the tab order and can be
     discovered. */
  it('disabled-stays-focusable', () => {
    const s = setup({ disabled: true });
    expect(s.control()).not.toHaveAttribute('disabled');
    act(() => s.control().focus());
    expect(s.control()).toHaveFocus();
  });

  /* While loading is true the button announces itself as busy and ignores further activation, but
     keeps its size so the layout does not shift. */
  it('loading-announces-busy-and-ignores-activation', async () => {
    const s = setup({ loading: true });
    await s.user.click(s.control());
    expect(s.onClick).not.toHaveBeenCalled();
    expect(s.control()).toHaveAttribute('aria-busy', 'true');
  });

  it('expanded-is-reported', () => {
    const s = setup({ expanded: true });
    expect(s.control()).toHaveAttribute('aria-expanded', 'true');
  });

  /* iconOnly hides the visible label, and label becomes the accessible name. */
  it('icon-only-keeps-its-name', () => {
    setup({ iconOnly: true, accessibleName: 'Open menu' });
    expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
  });

  it('press-tracks', async () => {
    const s = setup({ track: 'signup', label: 'Sign up' });
    await s.user.click(s.control());
    expect(s.onTrack).toHaveBeenCalledTimes(1);
    expect(s.onTrack).toHaveBeenCalledWith('signup', 'Sign up');
  });

  /* derived: a11y.role */
  it('renders', () => {
    setup();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  /* derived: props.emphasis */
  it('renders-variant-primary', () => {
    setup({ emphasis: 'primary' });
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders-variant-secondary', () => {
    setup({ emphasis: 'secondary' });
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders-variant-ghost', () => {
    setup({ emphasis: 'ghost' });
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders-variant-danger', () => {
    setup({ emphasis: 'danger' });
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  /* derived: props.size */
  it('renders-size-sm', () => {
    setup({ size: 'sm' });
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders-size-md', () => {
    setup({ size: 'md' });
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders-size-lg', () => {
    setup({ size: 'lg' });
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  /* derived: props.type */
  it('renders-type-button', () => {
    setup({ type: 'button' });
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('renders-type-submit', () => {
    setup({ type: 'submit' });
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  /* derived: a11y.requires */
  it('has-accessible-name', () => {
    const s = setup();
    expect(screen.getByRole('button', { name: s.props.label })).toHaveAccessibleName();
  });

  it('control-is-focusable', () => {
    const s = setup();
    act(() => s.control().focus());
    expect(s.control()).toHaveFocus();
  });
});
