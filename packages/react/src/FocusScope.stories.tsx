import type { Meta, StoryObj } from '@storybook/react-vite';
import { FocusScope } from './FocusScope';
import { Button } from './Button';
import { Text } from './Text';

const meta: Meta<typeof FocusScope> = {
  title: 'FocusScope/React',
  component: FocusScope,
  tags: ['autodocs'],
  args: {
    trapped: true,
    children: (
      <>
        <Text>Confirm your changes</Text>
        <Button label="Cancel" />
        <Button label="Continue" />
      </>
    ),
  },
};
export default meta;

type Story = StoryObj<typeof FocusScope>;

export const Default: Story = {};

export const AutoFocusFirst: Story = { args: { autoFocus: 'first' } };

export const AutoFocusLast: Story = { args: { autoFocus: 'last' } };

export const AutoFocusContainer: Story = { args: { autoFocus: 'container' } };

export const AutoFocusNone: Story = { args: { autoFocus: 'none' } };

/** A non-modal helper: focus moves in and restores on exit, but Tab is free to leave. */
export const TrappedFalse: Story = { args: { trapped: false } };

export const RestoreFocusFalse: Story = { args: { restoreFocus: false } };

export const ActiveFalse: Story = { args: { active: false } };

/** Present with three focusable descendants, for the keyboard gate to verify Tab wrapping both ways. */
export const Keyboard: Story = {
  args: {
    trapped: true,
    autoFocus: 'first',
    children: (
      <>
        <Button label="First" />
        <Button label="Second" />
        <Button label="Third" />
      </>
    ),
  },
};

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
    <FocusScope {...args}>
      <Text>{children}</Text>
      <Button label="Close" />
    </FocusScope>
  ),
};

export const NonModalDrawer: Story = {
  args: {
    children: 'A slide-in filter drawer',
    trapped: false,
    autoFocus: 'first',
  },
  render: ({ children, ...args }) => (
    <FocusScope {...args}>
      <Text>{children}</Text>
      <Button label="Apply filters" />
    </FocusScope>
  ),
};

export const ReadingFirst: Story = {
  args: {
    children: 'A long terms-of-service body with Accept and Decline Buttons',
    autoFocus: 'container',
  },
  render: ({ children, ...args }) => (
    <FocusScope {...args}>
      <Text>{children}</Text>
      <Button label="Accept" variant="primary" />
      <Button label="Decline" />
    </FocusScope>
  ),
};

export const PausedOuterScope: Story = {
  args: {
    children: 'A dialog body with a Menu open inside it',
    active: false,
  },
  render: ({ children, ...args }) => (
    <FocusScope {...args}>
      <Text>{children}</Text>
      <Button label="Options" />
    </FocusScope>
  ),
};
