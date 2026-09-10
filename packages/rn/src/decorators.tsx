import * as React from 'react';
import { View } from 'react-native';
import type { ViewStyle } from 'react-native';
import type { Decorator } from '@storybook/react';
import { ThemeProvider, useTheme } from './theme';
import type { ThemeModeSetting } from './theme';

export interface WithThemeOptions {
  /** Color mode for the story. Defaults to the Storybook "Mode" toolbar global (light/dark), falling back to `system`. */
  mode?: ThemeModeSetting;
  /** When `true`, children take their natural width instead of stretching (for buttons). */
  fit?: boolean;
}

function Frame({ children, fit }: { children: React.ReactNode; fit: boolean }): React.JSX.Element {
  const { tokens } = useTheme();
  const style: ViewStyle = {
    backgroundColor: tokens.colorBackground,
    padding: tokens.spaceLg,
    alignItems: fit ? 'flex-start' : 'stretch',
  };
  return <View style={style}>{children}</View>;
}

/**
 * Wraps a story in `ThemeProvider` and a page-background frame so every story is
 * rendered with real tokens. Stories run under react-native-web.
 */
export function withTheme({ mode, fit = false }: WithThemeOptions = {}): Decorator {
  const decorator: Decorator = (Story, context) => (
    <ThemeProvider mode={mode ?? ((context.globals.mode as ThemeModeSetting | undefined) ?? 'system')}>
      <Frame fit={fit}>
        <Story />
      </Frame>
    </ThemeProvider>
  );
  return decorator;
}
