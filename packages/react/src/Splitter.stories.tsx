import type { Meta, StoryObj } from '@storybook/react';
import { Splitter } from './Splitter';
import { Stack } from './Stack';
import { Text } from './Text';
import { Link } from './Link';
import { Button } from './Button';

const primaryContent = (
  <Stack element="nav" gap="tight">
    <Text element="p" weight="medium">
      Sections
    </Text>
    <Link href="#" label="Overview" />
    <Link href="#" label="Reports" />
    <Link href="#" label="Settings" />
  </Stack>
);

const secondaryContent = (
  <Stack gap="normal">
    <Text element="p" weight="medium">
      Overview
    </Text>
    <Text element="p">Select a section from the sidebar to see its detail here.</Text>
  </Stack>
);

const meta = {
  title: 'Splitter/React',
  component: Splitter,
  args: {
    label: 'Sidebar width',
    orientation: 'horizontal',
    primary: primaryContent,
    secondary: secondaryContent,
    defaultSize: 30,
    minSize: 10,
    maxSize: 90,
    step: 2,
    collapsible: false,
    stackBelow: 'prose',
  },
} satisfies Meta<typeof Splitter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* orientation */
export const OrientationHorizontal: Story = { args: { orientation: 'horizontal' } };
export const OrientationVertical: Story = {
  args: {
    orientation: 'vertical',
    label: 'Preview height',
    primary: (
      <Stack gap="normal">
        <Text element="p" weight="medium">
          Editor
        </Text>
        <Text element="p">Code goes here.</Text>
      </Stack>
    ),
    secondary: (
      <Stack gap="normal">
        <Text element="p" weight="medium">
          Preview
        </Text>
        <Text element="p">Rendered output goes here.</Text>
      </Stack>
    ),
  },
};

/* stackBelow */
export const StackBelowProse: Story = { args: { stackBelow: 'prose' } };
export const StackBelowContent: Story = { args: { stackBelow: 'content' } };
export const StackBelowNever: Story = { args: { stackBelow: 'never' } };

/* notable states */
export const Collapsible: Story = { args: { collapsible: true } };

export const Collapsed: Story = { args: { collapsible: true, collapsed: true } };

export const WithPersistKey: Story = {
  args: { collapsible: true, persistKey: 'demo-splitter-sidebar' },
};

/** Open/present with at least three focusable children, for the keyboard gate. */
export const Keyboard: Story = {
  args: {
    collapsible: true,
    primary: (
      <Stack element="nav" gap="tight">
        <Link href="#" label="Overview" />
        <Link href="#" label="Reports" />
      </Stack>
    ),
    secondary: <Button label="Detail action" variant="secondary" size="sm" />,
  },
};
