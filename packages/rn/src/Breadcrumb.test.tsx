/**
 * Breadcrumb — behavior scenarios from the component doc, one test each, in the doc's order.
 * On native a click is `fireEvent.press` and the handler receives `(item, index)`.
 */
import * as React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Breadcrumb } from './Breadcrumb';
import type { BreadcrumbProps } from './Breadcrumb';
import meta from './Breadcrumb.stories';
import { ThemeProvider } from './theme';

/** The Default story's args plus the scenario's `given`, with a mock for every event prop. */
function setup(given: Partial<BreadcrumbProps> = {}) {
  const onNavigate = jest.fn();
  const props: BreadcrumbProps = { ...(meta.args as BreadcrumbProps), ...given, onNavigate };
  const utils = render(
    <ThemeProvider mode="light">
      <Breadcrumb {...props} />
    </ThemeProvider>,
  );
  return { ...utils, onNavigate, props, container: () => screen.getByTestId('Breadcrumb') };
}

describe('Breadcrumb', () => {
  it('click-on-an-ancestor-reports-navigation', () => {
    const s = setup();
    fireEvent.press(screen.getAllByRole('link')[0]!);
    expect(s.onNavigate).toHaveBeenCalledTimes(1);
    expect(s.onNavigate).toHaveBeenCalledWith(s.props.items[0], 0);
  });

  it('an-uncollapsed-trail-shows-every-ancestor', () => {
    setup({
      collapse: false,
      items: [
        { label: 'Docs', href: '/docs' },
        { label: 'Components', href: '/docs/components' },
        { label: 'Navigation', href: '/docs/components/navigation' },
        { label: 'Breadcrumb', href: '/docs/components/navigation/breadcrumb' },
        { label: 'Keyboard' },
      ],
    });
    expect(screen.getByText('Components')).toBeTruthy();
    expect(screen.getByText('Navigation')).toBeTruthy();
  });

  it('renders', () => {
    const s = setup();
    expect(s.toJSON()).not.toBeNull();
  });

  it('has-accessible-name', () => {
    const s = setup({ label: 'Accessible name' });
    expect(s.container()).toHaveAccessibleName('Accessible name');
  });
});
