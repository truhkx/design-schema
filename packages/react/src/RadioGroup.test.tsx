/**
 * RadioGroup — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/radio-group.md) is the source of truth.
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ComponentProps } from 'react';
import { RadioGroup, type RadioGroupProps } from './RadioGroup';
import meta from './RadioGroup.stories';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<RadioGroupProps> = {}) {
  const onChange = vi.fn();
  const props = { ...meta.args, ...given, onChange } as ComponentProps<typeof RadioGroup>;
  const utils = render(<RadioGroup {...props} />);
  const user = userEvent.setup();
  return {
    ...utils,
    user,
    onChange,
    props,
    group: () => utils.container.querySelector('[data-ds="RadioGroup"]') as HTMLFieldSetElement,
    radio: () => screen.getAllByRole('radio')[0]!,
  };
}

describe('RadioGroup', () => {
  it('click-on-an-option-reports-its-value', async () => {
    const s = setup();
    await s.user.click(s.radio());
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange).toHaveBeenCalledWith('standard');
  });

  it('click-on-an-option-label-selects-it', async () => {
    const s = setup();
    const label = s.container.querySelector('[data-part="radioLabel"]') as HTMLElement;
    await s.user.click(label);
    expect(s.onChange).toHaveBeenCalledTimes(1);
    expect(s.onChange).toHaveBeenCalledWith('standard');
  });

  it('disabled-option-cannot-be-selected', async () => {
    const s = setup({
      options: [
        { value: 'standard', label: 'Standard', disabled: true },
        { value: 'express', label: 'Express' },
      ],
    });
    await s.user.click(s.radio());
    expect(s.onChange).not.toHaveBeenCalled();
  });

  it('disabled-group-is-inert', async () => {
    const s = setup({ disabled: true });
    await s.user.click(s.radio());
    expect(s.onChange).not.toHaveBeenCalled();
    expect(s.group()).toHaveAttribute('aria-disabled', 'true');
  });

  it('required-is-shown-in-the-legend', () => {
    const s = setup({ required: true });
    const legend = s.container.querySelector('legend');
    expect(legend?.textContent).toBe(`${s.props.label} (required)`);
  });

  it('invalid-renders-the-invalid-copy', () => {
    const s = setup({ invalid: true });
    expect(screen.getByText(`${s.props.label} is not valid.`)).toBeInTheDocument();
    expect(s.group()).toHaveAttribute('aria-invalid', 'true');
  });

  it('renders', () => {
    const s = setup();
    expect(s.group()).not.toBeNull();
  });

  it('renders-orientation-vertical', () => {
    const s = setup({ orientation: 'vertical' });
    expect(s.group()).not.toBeNull();
  });

  it('renders-orientation-horizontal', () => {
    const s = setup({ orientation: 'horizontal' });
    expect(s.group()).not.toBeNull();
  });

  it('error-is-identified', () => {
    const s = setup({ error: 'Fix this before continuing.' });
    expect(screen.getByText('Fix this before continuing.')).toBeInTheDocument();
    expect(s.group()).toHaveAttribute('aria-invalid', 'true');
  });
});
