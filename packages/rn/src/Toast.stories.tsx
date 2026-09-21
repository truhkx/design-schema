import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import { Stack } from './Stack';
import { Toast, ToastProvider, useToast } from './Toast';
import { withTheme } from './decorators';

const meta: Meta<typeof Toast> = {
  title: 'Toast/React Native',
  component: Toast,
  decorators: [withTheme({ fit: true })],
  // No `duration`: the stories that carry an action or a danger tone are persistent anyway,
  // and inheriting `short` here would make each of them warn.
  args: {
    message: 'Message sent',
    tone: 'neutral',
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
export const ToneDanger: Story = { args: { tone: 'danger', message: 'Upload failed' } };

// duration
export const DurationShort: Story = { args: { duration: 'short' } };
export const DurationLong: Story = { args: { duration: 'long' } };
export const DurationPersistent: Story = { args: { duration: 'persistent' } };

// examples
/** The reason most reversible actions need no AlertDialog; an action makes the toast persistent. */
export const UndoADelete: Story = {
  args: { message: '3 files moved to Archive', actionLabel: 'Undo', duration: 'persistent' },
};
/** The plain confirmation of something the user did not have to watch. */
export const Saved: Story = { args: { message: 'Changes saved', tone: 'success' } };
/** A result that arrived on its own, with one way to look at it. */
export const BackgroundResult: Story = { args: { message: 'Export ready', actionLabel: 'View' } };
/** A danger toast, persistent so nobody misses the one they needed. */
export const FailedUpload: Story = {
  args: { message: 'Upload failed', tone: 'danger', actionLabel: 'Retry', duration: 'persistent' },
};

// notable states
export const NotDismissible: Story = { args: { dismissible: false } };

export const WithOverrides: Story = {
  args: { overrides: { radius: 'radius.full', maxWidth: 'layout.maxWidth.content' } },
};

/** The imperative API: `useToast()` inside a `ToastProvider`; `dismiss()` clears every toast on cleanup. */
export const WithProvider: Story = {
  render: (args) => {
    function Trigger(): React.JSX.Element {
      const { toast, dismiss } = useToast();
      React.useEffect(() => () => dismiss(), [dismiss]);
      return <Button label="Show toast" onPress={() => void toast({ ...args })} />;
    }
    return (
      <ToastProvider>
        <Trigger />
      </ToastProvider>
    );
  },
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
