/**
 * Table — behavior scenarios from the component doc, one test each, in the doc's
 * order. Every scenario in the spec is a `renders: true` or accessible-name check,
 * so each test only asserts the tree renders or that the accessible name is set.
 * See generated/prompts/Table.rn.md.
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Table } from './Table';
import type { TableProps } from './Table';
import meta from './Table.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<TableProps> = {}) {
  const props: TableProps = { ...(meta.args as TableProps), ...given };
  const utils = render(
    <ThemeProvider mode="light">
      <Table {...props} />
    </ThemeProvider>,
  );
  return { ...utils, props };
}

describe('Table', () => {
  /* derived */
  it('renders', () => {
    const t = setup();
    expect(t.toJSON()).not.toBeNull();
  });

  /* derived: props.selectable */
  it('renders-selectable-none', () => {
    const t = setup({ selectable: 'none' });
    expect(t.toJSON()).not.toBeNull();
  });

  it('renders-selectable-single', () => {
    const t = setup({ selectable: 'single' });
    expect(t.toJSON()).not.toBeNull();
  });

  it('renders-selectable-multiple', () => {
    const t = setup({ selectable: 'multiple' });
    expect(t.toJSON()).not.toBeNull();
  });

  /* derived: props.responsive */
  it('renders-responsive-stack', () => {
    const t = setup({ responsive: 'stack' });
    expect(t.toJSON()).not.toBeNull();
  });

  it('renders-responsive-scroll', () => {
    const t = setup({ responsive: 'scroll' });
    expect(t.toJSON()).not.toBeNull();
  });

  /* derived: props.maxHeight */
  it('renders-maxHeight-none', () => {
    const t = setup({ maxHeight: 'none' });
    expect(t.toJSON()).not.toBeNull();
  });

  it('renders-maxHeight-viewport', () => {
    const t = setup({ maxHeight: 'viewport' });
    expect(t.toJSON()).not.toBeNull();
  });

  /* derived: props.density */
  it('renders-density-compact', () => {
    const t = setup({ density: 'compact' });
    expect(t.toJSON()).not.toBeNull();
  });

  it('renders-density-comfortable', () => {
    const t = setup({ density: 'comfortable' });
    expect(t.toJSON()).not.toBeNull();
  });

  /* derived: a11y.requires */
  it('has-accessible-name', () => {
    const t = setup();
    expect(screen.getByLabelText(t.props.caption)).toBeTruthy();
  });
});
