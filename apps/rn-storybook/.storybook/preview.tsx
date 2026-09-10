import * as React from 'react';
import { View } from 'react-native';
import type { Preview } from '@storybook/react';
import { addons } from '@storybook/preview-api';
import { ThemeProvider, useTheme } from '@design-schema/rn';
import { THEME_EVENT, current } from './theme';
import type { ThemeSelection } from './theme';

/** Follows the Theme addon panel: re-renders the story inside ThemeProvider whenever the selection changes. */
function useSelection(): ThemeSelection {
  const [selection, setSelection] = React.useState<ThemeSelection>(current.value);
  React.useEffect(() => {
    const channel = addons.getChannel();
    const onChange = (next: ThemeSelection) => setSelection(next);
    channel.on(THEME_EVENT, onChange);
    return () => channel.off(THEME_EVENT, onChange);
  }, []);
  return selection;
}

function Frame({ children }: { children: React.ReactNode }) {
  const { tokens } = useTheme();
  return <View style={{ flex: 1, backgroundColor: tokens.colorBackground, padding: tokens.spaceLg }}>{children}</View>;
}

const preview: Preview = {
  decorators: [
    (Story) => {
      const { mode } = useSelection();
      return (
        <ThemeProvider mode={mode}>
          <Frame>
            <Story />
          </Frame>
        </ThemeProvider>
      );
    },
  ],
  parameters: {
    backgrounds: { default: 'plain', values: [{ name: 'plain', value: 'transparent' }] },
  },
};

export default preview;
