import type { Meta, StoryObj } from '@storybook/react';
import { FocusScope } from './FocusScope';
import { Button } from './Button';

const meta: Meta<typeof FocusScope> = {
  title: 'FocusScope/React',
  component: FocusScope,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<typeof FocusScope>;

const ThreeButtons = () => (
  <>
    <Button label="First" />
    <Button label="Second" />
    <Button label="Third" />
  </>
);

export const Default: Story = {
  render: () => (
    <FocusScope>
      <ThreeButtons />
    </FocusScope>
  ),
};

export const AutoFocusFirst: Story = {
  render: () => (
    <FocusScope autoFocus="first">
      <ThreeButtons />
    </FocusScope>
  ),
};

export const AutoFocusLast: Story = {
  render: () => (
    <FocusScope autoFocus="last">
      <ThreeButtons />
    </FocusScope>
  ),
};

export const AutoFocusContainer: Story = {
  render: () => (
    <FocusScope autoFocus="container">
      <ThreeButtons />
    </FocusScope>
  ),
};

export const AutoFocusNone: Story = {
  render: () => (
    <FocusScope autoFocus="none">
      <ThreeButtons />
    </FocusScope>
  ),
};

/** A non-modal helper: focus moves in and restores on exit, but Tab is free to leave. */
export const NotTrapped: Story = {
  render: () => (
    <FocusScope trapped={false}>
      <ThreeButtons />
    </FocusScope>
  ),
};

/** Open/present with its focusable descendants, for the keyboard gate to verify Tab wrapping. */
export const Keyboard: Story = {
  render: () => (
    <FocusScope trapped autoFocus="first">
      <ThreeButtons />
    </FocusScope>
  ),
};
