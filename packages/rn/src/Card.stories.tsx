import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
import { Card } from './Card';
import { Link } from './Link';
import { Text } from './Text';
import { withTheme } from './decorators';

const meta: Meta<typeof Card> = {
  title: 'Card/React Native',
  component: Card,
  decorators: [withTheme()],
  args: {
    children: <Text>Body content.</Text>,
    heading: 'Card title',
    headingLevel: '3',
    headerActions: undefined,
    footer: undefined,
    inset: 'md',
    surface: 'default',
    interactive: false,
    focusable: false,
  },
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {};

// headingLevel
export const HeadingLevel2: Story = { args: { headingLevel: '2' } };
export const HeadingLevel3: Story = { args: { headingLevel: '3' } };
export const HeadingLevel4: Story = { args: { headingLevel: '4' } };
export const HeadingLevel5: Story = { args: { headingLevel: '5' } };
export const HeadingLevel6: Story = { args: { headingLevel: '6' } };

// inset
export const InsetSm: Story = { args: { inset: 'sm' } };
export const InsetMd: Story = { args: { inset: 'md' } };
export const InsetLg: Story = { args: { inset: 'lg' } };

// surface
export const SurfaceDefault: Story = { args: { surface: 'default' } };
export const SurfaceSubtle: Story = { args: { surface: 'subtle' } };

// notable states
export const NoHeading: Story = { args: { heading: undefined } };

export const WithHeaderActions: Story = {
  args: {
    headerActions: <Button label="Edit" variant="ghost" size="sm" />,
  },
};

export const WithFooter: Story = {
  args: {
    footer: (
      <>
        <Button label="Save" variant="primary" />
        <Button label="Cancel" variant="secondary" />
      </>
    ),
  },
};

export const Interactive: Story = {
  args: {
    interactive: true,
    heading: 'Growth plan',
    children: (
      <>
        <Text>10 seats, unlimited projects, priority support.</Text>
        <Link href="/plans/growth" label="View plan" />
      </>
    ),
  },
};

export const Focusable: Story = {
  args: { focusable: true },
};

export const WithOverrides: Story = {
  args: {
    overrides: { radius: 'radius.full', border: 'color.border.strong' },
  },
};
