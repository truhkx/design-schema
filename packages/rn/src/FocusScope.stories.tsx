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
function ConfirmContent(): React.JSX.Element {
  return (
    <Stack gap="normal" align="start">
      <Text>Confirm your changes</Text>
      <Button label="Cancel" />
      <Button label="Continue" />
    </Stack>
  );
}

/**
 * A trigger plus a scope that starts open, so `autoFocus` has something to do on load and
 * `restoreFocus` something to return to on close. The trigger is wrapped in a
 * `View collapsable={false}` because `Button` takes no ref, which is the pattern
 * `returnFocusTo` expects.
 */
function FocusScopeDemo({ content, ...props }: Partial<FocusScopeProps> & { content: React.ReactNode }): React.JSX.Element {
  const [open, setOpen] = React.useState(true);
  const triggerRef = React.useRef<ViewInstance>(null);
  return (
    <Stack gap="loose" align="start">
      <View ref={triggerRef} collapsable={false}>
        <Button label="Open panel" onPress={() => setOpen(true)} />
      </View>
      {open ? (
        <FocusScope {...props} returnFocusTo={triggerRef}>
          <Stack gap="normal" align="start">
            {content}
            <Button label="Close panel" onPress={() => setOpen(false)} />
          </Stack>
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
  render: ({ children, ...args }) => <FocusScopeDemo {...args} content={children} />,
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
/** A non-modal helper: focus moves in and restores on exit, but nothing is hidden from the screen reader. */
export const NotTrapped: Story = { args: { trapped: false } };
export const NoRestoreFocus: Story = { args: { restoreFocus: false } };
export const Inactive: Story = { args: { active: false } };

/**
 * The examples' `children` are descriptions of content; each story passes that description as
 * text and renders the controls it names beside it.
 */
export const ModalTakeover: Story = {
  args: {
    children: 'A full-screen onboarding overlay with its own close Button',
    trapped: true,
    autoFocus: 'first',
  },
  render: ({ children, ...args }) => (
    <FocusScopeDemo
      {...args}
      content={
        <>
          <Text>{String(children)}</Text>
          <Button label="Close" />
        </>
      }
    />
  ),
};

export const NonModalDrawer: Story = {
  args: {
    children: 'A slide-in filter drawer',
    trapped: false,
    autoFocus: 'first',
  },
  render: ({ children, ...args }) => (
    <FocusScopeDemo
      {...args}
      content={
        <>
          <Text>{String(children)}</Text>
          <Button label="Apply filters" />
        </>
      }
    />
  ),
};

export const ReadingFirst: Story = {
  args: {
    children: 'A long terms-of-service body with Accept and Decline Buttons',
    autoFocus: 'container',
  },
  render: ({ children, ...args }) => (
    <FocusScopeDemo
      {...args}
      content={
        <>
          <Text>{String(children)}</Text>
          <Button label="Accept" variant="primary" />
          <Button label="Decline" />
        </>
      }
    />
  ),
};

export const PausedOuterScope: Story = {
  args: {
    children: 'A dialog body with a Menu open inside it',
    active: false,
  },
  render: ({ children, ...args }) => (
    <FocusScopeDemo
      {...args}
      content={
        <>
          <Text>{String(children)}</Text>
          <Button label="Options" />
        </>
      }
    />
  ),
};

/**
 * Open with its trigger and three focusable children, for the axe gate and manual keyboard
 * checks on react-native-web. Tab is not confined on this platform — a stated platform limit.
 */
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
                <Button label="First" />
                <Button label="Second" />
                <Button label="Third" onPress={() => setOpen(false)} />
              </Stack>
            </FocusScope>
          ) : null}
        </Stack>
      );
    }
    return <Open />;
  },
};
