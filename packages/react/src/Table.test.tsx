/**
 * Table — behavior scenarios from the component doc, one test each, in the doc's order.
 * The doc (site/src/content/docs/components/table.md) is the source of truth; the tests
 * gate runs this file after every generation round. See generated/prompts/Table.web.md.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Table, type TableProps } from './Table';
import meta from './Table.stories';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<TableProps> = {}) {
  const props = { ...meta.args, ...given } as TableProps;
  return render(<Table {...props} />);
}

describe('Table', () => {
  /* derived: a11y.role */
  it('renders', () => {
    const { container } = setup();
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.selectable */
  it('renders-selectable-none', () => {
    const { container } = setup({ selectable: 'none' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-selectable-single', () => {
    const { container } = setup({ selectable: 'single' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-selectable-multiple', () => {
    const { container } = setup({ selectable: 'multiple' });
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.responsive */
  it('renders-responsive-stack', () => {
    const { container } = setup({ responsive: 'stack' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-responsive-scroll', () => {
    const { container } = setup({ responsive: 'scroll' });
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.maxHeight */
  it('renders-maxHeight-none', () => {
    const { container } = setup({ maxHeight: 'none' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-maxHeight-viewport', () => {
    const { container } = setup({ maxHeight: 'viewport' });
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: props.density */
  it('renders-density-compact', () => {
    const { container } = setup({ density: 'compact' });
    expect(container.firstChild).not.toBeNull();
  });

  it('renders-density-comfortable', () => {
    const { container } = setup({ density: 'comfortable' });
    expect(container.firstChild).not.toBeNull();
  });

  /* derived: a11y.requires.accessible-name */
  it('has-accessible-name', () => {
    setup();
    expect(screen.getByRole('table', { name: meta.args.caption })).toHaveAccessibleName();
  });
});
