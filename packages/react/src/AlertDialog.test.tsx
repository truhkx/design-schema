/**
 * AlertDialog — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/alert-dialog.md) is the source of truth; the tests
 * gate runs this file after every generation round. See generated/prompts/AlertDialog.web.md.
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AlertDialog, type AlertDialogProps } from './AlertDialog';
import meta from './AlertDialog.stories';

function setup(given: Partial<AlertDialogProps> = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const props = {
    ...meta.args,
    open: true,
    heading: 'Delete 3 files?',
    description: 'They will be removed from all shared folders. This cannot be undone.',
    confirmLabel: 'Delete files',
    onConfirm,
    onCancel,
    ...given,
  } as AlertDialogProps;
  const utils = render(<AlertDialog {...props} />);
  return {
    ...utils,
    onConfirm,
    onCancel,
    props,
    dialog: () => document.body.querySelector('[data-ds="AlertDialog"]') as HTMLElement,
  };
}

describe('AlertDialog', () => {
  /* derived: a11y.role */
  it('renders', () => {
    const d = setup();
    expect(d.dialog()).not.toBeNull();
  });

  /* derived: props.tone */
  it('renders-tone-danger', () => {
    const d = setup({ tone: 'danger' });
    expect(d.dialog()).not.toBeNull();
  });

  it('renders-tone-warning', () => {
    const d = setup({ tone: 'warning' });
    expect(d.dialog()).not.toBeNull();
  });

  it('renders-tone-info', () => {
    const d = setup({ tone: 'info' });
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
