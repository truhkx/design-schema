/**
 * Feed — behavior scenarios from the component doc, one test each, in the doc's
 * order. Every scenario in the spec is a `renders: true` or accessible-name check,
 * so each test only asserts the tree renders or that the accessible name is set.
 * See generated/prompts/Feed.rn.md.
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Feed } from './Feed';
import type { FeedProps } from './Feed';
import meta from './Feed.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<FeedProps> = {}) {
  const props: FeedProps = { ...(meta.args as FeedProps), ...given };
  const utils = render(
    <ThemeProvider mode="light">
      <Feed {...props} />
    </ThemeProvider>,
  );
  return { ...utils, props };
}

describe('Feed', () => {
  /* derived */
  it('renders', () => {
    const f = setup();
    expect(f.toJSON()).not.toBeNull();
  });

  /* derived: props.headingLevel */
  it('renders-headingLevel-2', () => {
    const f = setup({ headingLevel: '2' });
    expect(f.toJSON()).not.toBeNull();
  });

  it('renders-headingLevel-3', () => {
    const f = setup({ headingLevel: '3' });
    expect(f.toJSON()).not.toBeNull();
  });

  it('renders-headingLevel-4', () => {
    const f = setup({ headingLevel: '4' });
    expect(f.toJSON()).not.toBeNull();
  });

  /* derived: a11y.requires */
  it('has-accessible-name', () => {
    const f = setup();
    expect(screen.getByLabelText(f.props.label)).toBeTruthy();
  });
});
