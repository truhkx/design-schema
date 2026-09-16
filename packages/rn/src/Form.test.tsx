/**
 * Form — behavior scenarios from the component doc, one test each, in the doc's order.
 * `label-names-the-form-landmark` is web-only (the parser narrows it), so only the
 * derived render scenarios run here. See generated/prompts/Form.rn.md.
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Form } from './Form';
import type { FormProps } from './Form';
import meta, { Default } from './Form.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`, rendered through the story's render, with a mock for every event prop. */
function setup(given: Partial<FormProps> = {}) {
  const onSubmit = jest.fn();
  const onInvalid = jest.fn();
  const props = { ...(meta.args as FormProps), ...(Default.args as Partial<FormProps>), ...given, onSubmit, onInvalid };
  const renderStory = meta.render as (args: FormProps) => React.JSX.Element;
  const utils = render(<ThemeProvider mode="light">{renderStory(props)}</ThemeProvider>);
  return { ...utils, onSubmit, onInvalid, props, root: () => screen.getByTestId('Form') };
}

describe('Form', () => {
  it('renders', () => {
    const s = setup();
    expect(s.root()).toBeTruthy();
  });

  it('renders-validate-submit', () => {
    const s = setup({ validate: 'submit' });
    expect(s.root()).toBeTruthy();
  });

  it('renders-validate-blur', () => {
    const s = setup({ validate: 'blur' });
    expect(s.root()).toBeTruthy();
  });

  it('renders-validate-change', () => {
    const s = setup({ validate: 'change' });
    expect(s.root()).toBeTruthy();
  });
});
