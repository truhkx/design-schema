import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Disclosure } from './Disclosure';
import { Text } from './Text';
import { withTheme } from './decorators';

const meta: Meta<typeof Disclosure> = {
  title: 'Disclosure/React Native',
  component: Disclosure,
  decorators: [withTheme()],
  args: {
    summary: 'Advanced options',
    defaultOpen: false,
    disabled: false,
    keepMounted: false,
    headingLevel: undefined,
  },
  render: (args) => (
    <Disclosure {...args}>
      <Text>These settings apply to every project in the workspace and can be changed later.</Text>
    </Disclosure>
  ),
};

export default meta;

type Story = StoryObj<typeof Disclosure>;

export const Default: Story = {};

export const Open: Story = { args: { defaultOpen: true } };

// headingLevel
export const HeadingLevel2: Story = { args: { headingLevel: '2', summary: 'What happens if I cancel?' } };
export const HeadingLevel3: Story = { args: { headingLevel: '3', summary: 'What happens if I cancel?' } };
export const HeadingLevel4: Story = { args: { headingLevel: '4', summary: 'What happens if I cancel?' } };
export const HeadingLevel5: Story = { args: { headingLevel: '5', summary: 'What happens if I cancel?' } };
export const HeadingLevel6: Story = { args: { headingLevel: '6', summary: 'What happens if I cancel?' } };

export const Disabled: Story = { args: { disabled: true } };

/** The panel stays mounted (hidden) while closed, so form fields inside keep registering. */
export const KeepMounted: Story = { args: { keepMounted: true } };
