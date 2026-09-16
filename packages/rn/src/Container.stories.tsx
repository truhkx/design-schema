import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Container } from './Container';
import { Text } from './Text';
import { withTheme } from './decorators';

const meta: Meta<typeof Container> = {
  title: 'Container/React Native',
  component: Container,
  decorators: [withTheme()],
  args: {
    children: <Text>Container content</Text>,
    width: 'content',
    gutter: 'default',
    align: 'center',
  },
};

export default meta;

type Story = StoryObj<typeof Container>;

export const Default: Story = {};

// width
export const WidthProse: Story = { args: { width: 'prose' } };
export const WidthContent: Story = { args: { width: 'content' } };
export const WidthPage: Story = { args: { width: 'page' } };
export const WidthFull: Story = { args: { width: 'full' } };

// gutter
export const GutterNarrow: Story = { args: { gutter: 'narrow' } };
export const GutterDefault: Story = { args: { gutter: 'default' } };
export const GutterWide: Story = { args: { gutter: 'wide' } };
export const GutterNone: Story = { args: { gutter: 'none' } };

// align
export const AlignCenter: Story = { args: { align: 'center' } };
export const AlignStart: Story = { args: { align: 'start' } };

// notable states
export const WithOverrides: Story = {
  args: { overrides: { maxWidth: 'layout.maxWidth.page', paddingInline: 'layout.gutter.wide' } },
};

// examples
/** The default page column for application screens, centered at the content measure. */
export const ApplicationScreen: Story = {
  args: { children: <Text>A Stack of page regions</Text>, width: 'content' },
};

/** An article capped at the prose measure, about 65 characters a line. */
export const ReadingMeasure: Story = {
  args: { children: <Text>An article</Text>, width: 'prose' },
};

/** A narrower measure inside an already padded parent, so the gutters are not applied twice. */
export const NestedSection: Story = {
  args: { children: <Text>A narrower section</Text>, width: 'prose', gutter: 'none' },
};
