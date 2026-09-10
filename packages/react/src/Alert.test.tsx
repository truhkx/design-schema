/**
 * Alert — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/alert.md) is the source of truth; the tests
 * gate runs this file after every generation round. See generated/prompts/Alert.web.md.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert, type AlertProps } from './Alert';
import meta from './Alert.stories';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<AlertProps> = {}) {
  const props = { ...meta.args, ...given } as AlertProps;
  return render(<Alert {...props} />);
}

describe('Alert', () => {
  /* derived: a11y.role */
  it('renders', () => {
    const { container } = setup();
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.tone */
  it('renders-tone-info', () => {
    const { container } = setup({ tone: 'info' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-tone-success', () => {
    const { container } = setup({ tone: 'success' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-tone-warning', () => {
    const { container } = setup({ tone: 'warning' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-tone-danger', () => {
    const { container } = setup({ tone: 'danger' });
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.live */
  it('renders-live-status', () => {
    const { container } = setup({ live: 'status' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-live-alert', () => {
    const { container } = setup({ live: 'alert' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-live-off', () => {
    const { container } = setup({ live: 'off' });
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: a11y.requires */
  it('has-accessible-name', () => {
    setup();
    expect(screen.getByRole('status', { name: meta.args!.heading as string })).toHaveAccessibleName();
  });
});
