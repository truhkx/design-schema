import type { Preview } from '@storybook/web-components';
import '@design-schema/tokens/calm-precise/css';
import { withMode, modeGlobal } from '../../../storybook/shared/mode';
import '../src/index';

const preview: Preview = {
  globalTypes: { mode: modeGlobal },
  decorators: [withMode],
  parameters: { layout: 'padded' },
};
export default preview;
