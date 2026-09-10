import type { Meta, StoryObj } from '@storybook/react';
import { ProfileSettings } from './ProfileSettings';
import { withTheme } from '../src/decorators';

const meta: Meta<typeof ProfileSettings> = {
  title: 'Demo/Profile settings/React Native',
  component: ProfileSettings,
  decorators: [withTheme()],
  args: {
    displayName: 'Avery Chen',
    email: 'avery@example.com',
    submitting: false,
  },
};

export default meta;

type Story = StoryObj<typeof ProfileSettings>;

export const Default: Story = {};

/** Nothing pre-filled: both fields report their required error on submit. */
export const Empty: Story = { args: { displayName: undefined, email: undefined } };

export const Submitting: Story = { args: { submitting: true } };
