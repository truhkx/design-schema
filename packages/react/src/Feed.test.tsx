/**
 * Feed — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/feed.md) is the source of truth; the tests
 * gate runs this file after every generation round. See generated/prompts/Feed.web.md.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Feed, type FeedProps } from './Feed';
import meta from './Feed.stories';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<FeedProps> = {}) {
  const props = { ...meta.args, ...given } as FeedProps;
  return render(<Feed {...props} />);
}

describe('Feed', () => {
  /* derived: a11y.role */
  it('renders', () => {
    const { container } = setup();
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.headingLevel */
  it('renders-headingLevel-2', () => {
    const { container } = setup({ headingLevel: '2' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-headingLevel-3', () => {
    const { container } = setup({ headingLevel: '3' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-headingLevel-4', () => {
    const { container } = setup({ headingLevel: '4' });
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: a11y.requires */
  it('has-accessible-name', () => {
    const props = { ...meta.args } as FeedProps;
    setup();
    expect(screen.getByRole('feed', { name: props.label })).toHaveAccessibleName();
  });
});
