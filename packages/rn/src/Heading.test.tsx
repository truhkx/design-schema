/**
 * Heading — behavior scenarios from the component doc, one test each, in the doc's
 * order: the two header-role scenarios first, then the derived `renders: true` checks.
 */
import * as React from 'react';
import { render } from '@testing-library/react-native';
import { Heading } from './Heading';
import type { HeadingProps } from './Heading';
import meta from './Heading.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`. */
function setup(given: Partial<HeadingProps> = {}) {
  const props: HeadingProps = { ...(meta.args as HeadingProps), ...given };
  const utils = render(
    <ThemeProvider mode="light">
      <Heading {...props} />
    </ThemeProvider>,
  );
  return { ...utils, props };
}

describe('Heading', () => {
  it('level-puts-the-heading-in-the-outline', () => {
    const s = setup({ level: '3' });
    expect(s.getByTestId('Heading').props.accessibilityRole).toBe('header');
  });

  it('size-does-not-change-the-outline', () => {
    const s = setup({ level: '2', size: 'md' });
    expect(s.getByTestId('Heading').props.accessibilityRole).toBe('header');
  });

  it('renders', () => {
    const s = setup();
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.level */
  it('renders-level-1', () => {
    const s = setup({ level: '1' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-level-2', () => {
    const s = setup({ level: '2' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-level-3', () => {
    const s = setup({ level: '3' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-level-4', () => {
    const s = setup({ level: '4' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-level-5', () => {
    const s = setup({ level: '5' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-level-6', () => {
    const s = setup({ level: '6' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.size */
  it('renders-size-4xl', () => {
    const s = setup({ size: '4xl' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-size-3xl', () => {
    const s = setup({ size: '3xl' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-size-2xl', () => {
    const s = setup({ size: '2xl' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-size-xl', () => {
    const s = setup({ size: 'xl' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-size-lg', () => {
    const s = setup({ size: 'lg' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-size-md', () => {
    const s = setup({ size: 'md' });
    expect(s.toJSON()).not.toBeNull();
  });

  /* derived: props.align */
  it('renders-align-start', () => {
    const s = setup({ align: 'start' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-align-center', () => {
    const s = setup({ align: 'center' });
    expect(s.toJSON()).not.toBeNull();
  });

  it('renders-align-end', () => {
    const s = setup({ align: 'end' });
    expect(s.toJSON()).not.toBeNull();
  });
});

/* Platform-own coverage the doc asks for: behavior scenarios take only canonical values. */
describe('Heading level handling', () => {
  function fontSizeOf(s: ReturnType<typeof setup>): unknown {
    return s.getByTestId('Heading').props.style.fontSize;
  }

  it('accepts a numeric level with the same result as the string', () => {
    const numeric = fontSizeOf(setup({ level: 4 }));
    const text = fontSizeOf(setup({ level: '4' }));
    expect(numeric).toBe(text);
  });

  it('falls back to level 2 on an invalid level and warns once for the lifetime', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      const fallback = fontSizeOf(setup({ level: '2' }));
      const s = setup({ level: '7' as HeadingProps['level'] });
      expect(fontSizeOf(s)).toBe(fallback);
      expect(s.getByTestId('Heading').props.accessibilityRole).toBe('header');
      s.rerender(
        <ThemeProvider mode="light">
          <Heading {...s.props} level={'9' as HeadingProps['level']} />
        </ThemeProvider>,
      );
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn).toHaveBeenCalledWith('Heading: level 7 is not one of 1–6; rendering as level 2.');
    } finally {
      warn.mockRestore();
    }
  });

  it('writes a marginBlockEnd override of space.0 out as a margin of 0', () => {
    const s = setup({ overrides: { marginBlockEnd: 'space.0' } });
    expect(s.getByTestId('Heading').props.style.marginBottom).toBe(0);
  });
});
