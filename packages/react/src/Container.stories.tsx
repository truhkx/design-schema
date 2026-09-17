import type { Meta, StoryObj } from '@storybook/react-vite';
import { Container } from './Container';
import { Text } from './Text';

const content = <Text element="p">Container content.</Text>;

const meta: Meta<typeof Container> = {
  title: 'Container/React',
  component: Container,
  tags: ['autodocs'],
  args: {
    width: 'content',
    gutter: 'default',
    align: 'center',
    element: 'div',
    children: content,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* width */
export const WidthProse: Story = { args: { width: 'prose' } };
export const WidthContent: Story = { args: { width: 'content' } };
export const WidthPage: Story = { args: { width: 'page' } };
export const WidthFull: Story = { args: { width: 'full' } };

/* gutter */
export const GutterNarrow: Story = { args: { gutter: 'narrow' } };
export const GutterDefault: Story = { args: { gutter: 'default' } };
export const GutterWide: Story = { args: { gutter: 'wide' } };
export const GutterNone: Story = { args: { gutter: 'none' } };

/* align */
export const AlignCenter: Story = { args: { align: 'center' } };
export const AlignStart: Story = { args: { align: 'start' } };

/* element */
export const ElementDiv: Story = { args: { element: 'div' } };
export const ElementMain: Story = { args: { element: 'main' } };
export const ElementSection: Story = { args: { element: 'section' } };

/* examples — exactly each example's `given` as args; a string `children` is an illustrative label,
   rendered inside a Text rather than built as the Stack it names. */

/** The default page column for application screens, centered at the content measure. */
export const ApplicationScreen: Story = {
  args: { children: <Text element="p">A Stack of page regions</Text>, width: 'content' },
};

/** An article capped at the prose measure, about 65 characters a line. */
export const ReadingMeasure: Story = {
  args: { children: <Text element="p">An article</Text>, width: 'prose' },
};

/** A narrower measure inside an already padded parent, so the gutters are not applied twice. */
export const NestedSection: Story = {
  args: { children: <Text element="p">A narrower section</Text>, width: 'prose', gutter: 'none' },
};
