import type { Preview } from '@storybook/react-vite';
import '@design-schema/tokens/calm-precise/css';
import { withMode, modeGlobal } from '../../../storybook/shared/mode';

const preview: Preview = {
  globalTypes: { mode: modeGlobal },
  decorators: [withMode],
  parameters: { layout: 'padded', a11y: { config: { rules: [{ id: 'color-contrast', enabled: true }] } } },
};
export default preview;
