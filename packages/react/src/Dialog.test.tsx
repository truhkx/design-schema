/**
 * Dialog — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/dialog.md) is the source of truth; the tests
 * gate runs this file after every generation round. See generated/prompts/Dialog.web.md.
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dialog, type DialogProps } from './Dialog';
import { Input } from './Input';
import meta from './Dialog.stories';

const BODY = <Input label="Project name" name="projectName" defaultValue="Q3 roadmap" />;

function setup(given: Partial<DialogProps> = {}) {
  const onClose = vi.fn();
  const onOpened = vi.fn();
  const props = {
    ...meta.args,
    open: true,
    heading: 'Rename project',
    children: BODY,
    onClose,
    onOpened,
    ...given,
  } as DialogProps;
  const utils = render(<Dialog {...props} />);
  return {
    ...utils,
    onClose,
    onOpened,
    props,
    dialog: () => document.body.querySelector('[data-ds="Dialog"]') as HTMLElement,
  };
}

describe('Dialog', () => {
  /* derived: a11y.role */
  it('renders', () => {
    const d = setup();
    expect(d.dialog()).not.toBeNull();
  });

  /* derived: props.size */
  it('renders-size-sm', () => {
    const d = setup({ size: 'sm' });
    expect(d.dialog()).not.toBeNull();
  });

  it('renders-size-md', () => {
    const d = setup({ size: 'md' });
    expect(d.dialog()).not.toBeNull();
  });

  it('renders-size-lg', () => {
    const d = setup({ size: 'lg' });
    expect(d.dialog()).not.toBeNull();
  });

  /* derived: props.initialFocus */
  it('renders-initialFocus-first', () => {
    const d = setup({ initialFocus: 'first' });
    expect(d.dialog()).not.toBeNull();
  });

  it('renders-initialFocus-title', () => {
    const d = setup({ initialFocus: 'title' });
    expect(d.dialog()).not.toBeNull();
  });

  it('renders-initialFocus-close', () => {
    const d = setup({ initialFocus: 'close' });
    expect(d.dialog()).not.toBeNull();
  });

  /* derived: a11y.requires */
  it('has-accessible-name', () => {
    const d = setup();
    expect(screen.getByRole('heading', { level: 2, name: d.props.heading })).toBeInTheDocument();
    expect(d.dialog()).toHaveAttribute('aria-labelledby');
  });

  it('control-is-focusable', () => {
    const d = setup();
    expect(d.dialog()?.contains(document.activeElement)).toBe(true);
  });
});
