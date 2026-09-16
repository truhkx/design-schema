/**
 * Fieldset — behavior scenarios from the component doc, one test each, in the doc's order.
 * The Default story's fields (Street and City Inputs) are the children.
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Fieldset } from './Fieldset';
import type { FieldsetProps } from './Fieldset';
import { Input } from './Input';
import meta from './Fieldset.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<FieldsetProps> = {}) {
  const props = { ...(meta.args as FieldsetProps), ...given };
  const utils = render(
    <ThemeProvider mode="light">
      <Fieldset {...props}>
        <Input label="Street" name="street" />
        <Input label="City" name="city" />
      </Fieldset>
    </ThemeProvider>,
  );
  return { ...utils, props, group: () => screen.getByTestId('Fieldset') };
}

describe('Fieldset', () => {
  it('the-legend-names-the-group', () => {
    setup({ legend: 'Delivery window' });
    expect(screen.getByText('Delivery window')).toBeOnTheScreen();
  });

  it('the-description-is-rendered', () => {
    setup({ description: 'We only ship within the EU.' });
    expect(screen.getByText('We only ship within the EU.')).toBeOnTheScreen();
  });

  /* derived */
  it('renders', () => {
    const s = setup();
    expect(s.group()).toBeOnTheScreen();
  });

  /* derived */
  it('renders-gap-tight', () => {
    const s = setup({ gap: 'tight' });
    expect(s.group()).toBeOnTheScreen();
  });

  /* derived */
  it('renders-gap-normal', () => {
    const s = setup({ gap: 'normal' });
    expect(s.group()).toBeOnTheScreen();
  });

  /* derived */
  it('renders-gap-loose', () => {
    const s = setup({ gap: 'loose' });
    expect(s.group()).toBeOnTheScreen();
  });

  /* derived */
  it('has-accessible-name', () => {
    const s = setup();
    expect(s.group()).toHaveAccessibleName(s.props.legend);
  });

  /* derived */
  it('error-is-identified', () => {
    setup({ error: 'Fix this before continuing.' });
    expect(screen.getByText('Fix this before continuing.')).toBeOnTheScreen();
  });
});
