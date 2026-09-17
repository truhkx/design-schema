/**
 * Toolbar — behavior scenarios from the component doc, one test each, in the doc's order.
 * The aria-orientation and single-tab-stop scenarios are web/Lit only (the parser narrows
 * them); native has no orientation state and no roving focus.
 */
import * as React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Toolbar, ToolbarGroup } from './Toolbar';
import type { ToolbarProps } from './Toolbar';
import meta from './Toolbar.stories';
import { Button } from './Button';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<ToolbarProps> = {}) {
  const props = { ...(meta.args as Omit<ToolbarProps, 'children'>), ...given };
  const utils = render(
    <ThemeProvider mode="light">
      <Toolbar {...props}>
        <ToolbarGroup label="Text style">
          <Button label="Bold" variant="ghost" />
          <Button label="Italic" variant="ghost" />
        </ToolbarGroup>
        <ToolbarGroup label="Insert">
          <Button label="Insert link" variant="ghost" />
        </ToolbarGroup>
      </Toolbar>
    </ThemeProvider>,
  );
  return { ...utils, props, container: () => screen.getByTestId('Toolbar') };
}

let warn: jest.SpyInstance;
beforeEach(() => {
  warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => {
  warn.mockRestore();
});

describe('Toolbar', () => {
  /* derived */
  it('renders', () => {
    const s = setup();
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived */
  it('renders-orientation-horizontal', () => {
    const s = setup({ orientation: 'horizontal' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived */
  it('renders-orientation-vertical', () => {
    const s = setup({ orientation: 'vertical' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived */
  it('renders-overflow-wrap', () => {
    const s = setup({ overflow: 'wrap' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived */
  it('renders-overflow-menu', () => {
    const s = setup({ overflow: 'menu' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived */
  it('renders-overflow-scroll', () => {
    const s = setup({ overflow: 'scroll' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived */
  it('renders-size-sm', () => {
    const s = setup({ size: 'sm' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived */
  it('renders-size-md', () => {
    const s = setup({ size: 'md' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived */
  it('renders-density-compact', () => {
    const s = setup({ density: 'compact' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived */
  it('renders-density-comfortable', () => {
    const s = setup({ density: 'comfortable' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived */
  it('has-accessible-name', () => {
    const s = setup();
    expect(s.container().props.accessibilityRole).toBe('toolbar');
    expect(s.container().props.accessibilityLabel).toBe(s.props.label);
  });
});
