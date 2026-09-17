import * as React from 'react';
import { View } from 'react-native';
import type { ViewInstance } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import { FocusScope } from './FocusScope';
import type { FocusScopeProps } from './FocusScope';
import { Stack } from './Stack';
import { Text } from './Text';
import { withTheme } from './decorators';

/** The Default story's content: a Text and two Buttons. */
function ConfirmContent({ onClose }: { onClose?: (() => void) | undefined }): React.JSX.Element {
  return (
    <Stack gap="normal" align="start">
      <Text>Confirm your changes</Text>
      <Button label="Cancel" onPress={onClose} />
      <Button label="Continue" onPress={onClose} />
    </Stack>
  );
}

/**
 * A trigger plus a scope that starts open, so autoFocus has something to do on load and
 * restoreFocus on close. An example's `children` arg is a description of the content, so a
 * string is shown as the panel text above the same two Buttons.
 */
function FocusScopeDemo({ children, ...props }: Partial<FocusScopeProps>): React.JSX.Element {
  const [open, setOpen] = React.useState(true);
  const triggerRef = React.useRef<ViewInstance>(null);
  const close = (): void => setOpen(false);
  return (
    <Stack gap="loose" align="start">
      <View ref={triggerRef} collapsable={false}>
        <Button label="Open panel" onPress={() => setOpen(true)} />
      </View>
      {open ? (
        <FocusScope returnFocusTo={triggerRef} {...props}>
          {typeof children === 'string' ? (
            <Stack gap="normal" align="start">
              <Text>{children}</Text>
              <Button label="Cancel" onPress={close} />
              <Button label="Continue" onPress={close} />
            </Stack>
          ) : (
            <ConfirmContent onClose={close} />
          )}
        </FocusScope>
      ) : null}
    </Stack>
  );
}

const meta: Meta<typeof FocusScope> = {
  title: 'FocusScope/React Native',
  component: FocusScope,
  decorators: [withTheme()],
  args: {
    children: <ConfirmContent />,
    trapped: true,
    autoFocus: 'first',
    restoreFocus: true,
    active: true,
  },
  render: (args) => <FocusScopeDemo {...args} />,
};

export default meta;

type Story = StoryObj<typeof FocusScope>;

export const Default: Story = {};

// autoFocus
export const AutoFocusFirst: Story = { args: { autoFocus: 'first' } };
export const AutoFocusLast: Story = { args: { autoFocus: 'last' } };
export const AutoFocusContainer: Story = { args: { autoFocus: 'container' } };
export const AutoFocusNone: Story = { args: { autoFocus: 'none' } };

// notable states
export const NotTrapped: Story = { args: { trapped: false } };
export const NoRestoreFocus: Story = { args: { restoreFocus: false } };
export const Inactive: Story = { args: { active: false } };

// examples
export const ModalTakeover: Story = {
  args: { children: 'A full-screen onboarding overlay with its own close Button', trapped: true, autoFocus: 'first' },
};
export const NonModalDrawer: Story = {
  args: { children: 'A slide-in filter drawer', trapped: false, autoFocus: 'first' },
};
export const ReadingFirst: Story = {
  args: { children: 'A long terms-of-service body with Accept and Decline Buttons', autoFocus: 'container' },
};
export const PausedOuterScope: Story = {
  args: { children: 'A dialog body with a Menu open inside it', active: false },
};

/** Open with its trigger and three focusable children, for the axe gate and manual keyboard checks. */
export const Keyboard: Story = {
  render: () => {
    function Open(): React.JSX.Element {
      const [open, setOpen] = React.useState(true);
      const triggerRef = React.useRef<ViewInstance>(null);
      return (
        <Stack gap="loose" align="start">
          <View ref={triggerRef} collapsable={false}>
            <Button label="Open panel" onPress={() => setOpen(true)} />
          </View>
          {open ? (
            <FocusScope trapped autoFocus="first" restoreFocus active returnFocusTo={triggerRef}>
              <Stack gap="normal" align="start">
                <Button label="First action" />
                <Button label="Second action" />
                <Button label="Close" onPress={() => setOpen(false)} />
              </Stack>
            </FocusScope>
          ) : null}
        </Stack>
      );
    }
    return <Open />;
  },
};
