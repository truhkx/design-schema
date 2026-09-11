import type { Preview } from '@storybook/react-vite';
import React from 'react';
import { ThemeProvider } from '../src/theme';
import { modeGlobal } from '../../../storybook/shared/mode';

// RN components read tokens from ThemeProvider, not CSS, so the mode global
// drives the provider here instead of a data-mode attribute.
const preview: Preview = {
  globalTypes: { mode: modeGlobal },
  decorators: [
    (Story, context) => (
      <ThemeProvider mode={(context.globals.mode as 'light' | 'dark') ?? 'light'}>
        <Story />
      </ThemeProvider>
    ),
  ],
  parameters: { layout: 'padded' },
};
export default preview;
