import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { Stack } from './Stack';
import { Toast } from './Toast';
import { withTheme } from './decorators';

const meta: Meta<typeof Toast> = {
  title: 'Toast/React Native',
  component: Toast,
  decorators: [withTheme({ fit: true })],
  args: {
    message: 'Message sent',
    tone: 'neutral',
    duration: 'short',
    dismissible: true,
  },
};

export default meta;

type Story = StoryObj<typeof Toast>;

export const Default: Story = {};

// tone
export const ToneNeutral: Story = { args: { tone: 'neutral', message: 'Link copied' } };
export const ToneSuccess: Story = { args: { tone: 'success', message: 'Changes saved' } };
export const ToneWarning: Story = { args: { tone: 'warning', message: 'Connection unstable' } };
export const ToneDanger: Story = {
  args: { tone: 'danger', message: 'Upload failed', duration: 'persistent' },
};

// duration
export const DurationShort: Story = { args: { duration: 'short' } };
export const DurationLong: Story = { args: { duration: 'long' } };
export const DurationPersistent: Story = { args: { duration: 'persistent', message: '3 files deleted', actionLabel: 'Undo' } };

// notable states
export const WithAction: Story = {
  args: { message: '3 files moved to Archive', actionLabel: 'Undo', duration: 'persistent' },
};

export const NotDismissible: Story = { args: { dismissible: false } };

export const WithOverrides: Story = {
  args: { overrides: { radius: 'radius.full', maxWidth: 'layout.maxWidth.content' } },
};

/** Open with its trigger and several focusable children, for the axe gate and manual keyboard checks. */
export const Keyboard: Story = {
  render: (args) => {
    function Demo(): React.JSX.Element {
      const [visible, setVisible] = React.useState(true);
      return (
        <Stack gap="loose" align="start">
          <Button label="Show toasts" onPress={() => setVisible(true)} />
          {visible ? (
            <Stack gap="tight" align="start">
              <Toast {...args} message="3 files deleted" actionLabel="Undo" duration="persistent" onDismiss={() => setVisible(false)} />
              <Toast {...args} message="Export ready" tone="success" actionLabel="View" duration="persistent" />
            </Stack>
          ) : null}
        </Stack>
      );
    }
    return <Demo />;
  },
};
