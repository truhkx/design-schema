import type { Meta, StoryObj } from '@storybook/react-vite';
import { SignIn } from './SignIn';
import { withTheme } from '../src/decorators';

const meta: Meta<typeof SignIn> = {
  title: 'Demo/Sign in/React Native',
  component: SignIn,
  decorators: [withTheme()],
  args: {
    submitting: false,
  },
};

export default meta;

type Story = StoryObj<typeof SignIn>;

export const Default: Story = {};

export const Submitting: Story = { args: { submitting: true } };
