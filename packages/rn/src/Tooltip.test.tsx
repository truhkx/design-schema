/**
 * Tooltip — behavior scenarios from the component doc, one test each, in the doc's
 * order. Every scenario here is a `renders: true` check (no click, focus or set
 * scenarios are declared for this component), so each test only asserts the tree
 * renders. See generated/prompts/Tooltip.rn.md.
 */
import * as React from 'react';
import { render } from '@testing-library/react-native';
import { Tooltip } from './Tooltip';
import type { TooltipProps } from './Tooltip';
import meta from './Tooltip.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<TooltipProps> = {}) {
  const props: TooltipProps = { ...(meta.args as TooltipProps), ...given };
  const utils = render(
    <ThemeProvider mode="light">
      <Tooltip {...props} />
    </ThemeProvider>,
  );
  return { ...utils, props };
}

describe('Tooltip', () => {
  /* derived: a11y.role */
  it('renders', () => {
    const t = setup();
    expect(t.toJSON()).not.toBeNull();
    expect(t.getByTestId('Tooltip')).toBeTruthy();
  });

  /* derived: props.placement */
  it('renders-placement-top', () => {
    const t = setup({ placement: 'top' });
    expect(t.toJSON()).not.toBeNull();
  });

  it('renders-placement-bottom', () => {
    const t = setup({ placement: 'bottom' });
    expect(t.toJSON()).not.toBeNull();
  });

  it('renders-placement-start', () => {
    const t = setup({ placement: 'start' });
    expect(t.toJSON()).not.toBeNull();
  });

  it('renders-placement-end', () => {
    const t = setup({ placement: 'end' });
    expect(t.toJSON()).not.toBeNull();
  });

  /* derived: props.delay */
  it('renders-delay-default', () => {
    const t = setup({ delay: 'default' });
    expect(t.toJSON()).not.toBeNull();
  });

  it('renders-delay-none', () => {
    const t = setup({ delay: 'none' });
    expect(t.toJSON()).not.toBeNull();
  });
});
