import type { Meta, StoryObj } from '@storybook/react';
import { Preferences } from './Preferences';
import { withTheme } from '../src/decorators';

const meta: Meta<typeof Preferences> = {
  title: 'Demo/Preferences/React Native',
  component: Preferences,
  decorators: [withTheme()],
  args: {
    digest: 'weekly',
    mentions: true,
    comments: false,
    paused: false,
    storageUsedGb: 8.2,
    storageQuotaGb: 10,
    submitting: false,
  },
};

export default meta;

type Story = StoryObj<typeof Preferences>;

export const Default: Story = {};

/** No digest chosen: the required RadioGroup reports its error on submit. */
export const NoDigestSelected: Story = { args: { digest: undefined } };

export const Submitting: Story = { args: { submitting: true } };
