/**
 * Tabs — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/tabs.md) is the source of truth.
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { Tabs, type TabsProps } from './Tabs';
import meta from './Tabs.stories';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<TabsProps> = {}) {
  const onChange = vi.fn();
  const props = { ...meta.args, ...given, onChange } as ComponentProps<typeof Tabs>;
  const utils = render(<Tabs {...props} />);
  const user = userEvent.setup();
  return {
    ...utils,
    user,
    onChange,
    props,
    root: () => utils.container.querySelector('[data-ds="Tabs"]') as HTMLDivElement,
    tab: () => screen.getAllByRole('tab')[0]!,
  };
}

describe('Tabs', () => {
  it('click-selects-a-tab', async () => {
    const s = setup({ defaultValue: 'activity' });
    await s.user.click(s.tab());
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange).toHaveBeenCalledWith('overview');
  });

  it('clicking-the-selected-tab-changes-nothing', async () => {
    const s = setup({ defaultValue: 'overview' });
    await s.user.click(s.tab());
    expect(s.onChange).not.toHaveBeenCalled();
  });

  it('the-selected-tab-is-marked-selected', () => {
    const s = setup({ defaultValue: 'overview' });
    expect(s.tab()).toHaveAttribute('aria-selected', 'true');
  });

  it('arrow-selects-under-automatic-activation', async () => {
    const s = setup({ activation: 'automatic' });
    s.tab().focus();
    await s.user.keyboard('{ArrowRight}');
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange).toHaveBeenCalledWith('activity');
  });

  it('manual-activation-does-not-select-on-arrow', async () => {
    const s = setup({ activation: 'manual' });
    s.tab().focus();
    await s.user.keyboard('{ArrowRight}');
    expect(s.onChange).not.toHaveBeenCalled();
  });

  it('a-disabled-tab-cannot-be-selected', async () => {
    const s = setup({
      tabs: [
        { id: 'overview', label: 'Overview', disabled: true },
        { id: 'activity', label: 'Activity' },
      ],
      defaultValue: 'activity',
    });
    await s.user.click(s.tab());
    expect(s.onChange).not.toHaveBeenCalled();
  });

  it('renders', () => {
    expect(setup().root()).not.toBeNull();
  });

  it('renders-activation-automatic', () => {
    expect(setup({ activation: 'automatic' }).root()).not.toBeNull();
  });

  it('renders-activation-manual', () => {
    expect(setup({ activation: 'manual' }).root()).not.toBeNull();
  });

  it('renders-orientation-horizontal', () => {
    expect(setup({ orientation: 'horizontal' }).root()).not.toBeNull();
  });

  it('renders-orientation-vertical', () => {
    expect(setup({ orientation: 'vertical' }).root()).not.toBeNull();
  });

  it('renders-fit-start', () => {
    expect(setup({ fit: 'start' }).root()).not.toBeNull();
  });

  it('renders-fit-fill', () => {
    expect(setup({ fit: 'fill' }).root()).not.toBeNull();
  });

  it('has-accessible-name', () => {
    const s = setup();
    expect(screen.getByRole('tablist', { name: s.props.label })).toBeInTheDocument();
  });
});
