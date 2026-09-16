import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './Container.js';
import './Text.js';
import type { ContainerAlign, ContainerElement, ContainerGutter, ContainerWidth } from './Container.js';

interface ContainerArgs {
  children: string;
  width: ContainerWidth;
  gutter: ContainerGutter;
  align: ContainerAlign;
  element: ContainerElement;
}

const WIDTHS: ContainerWidth[] = ['prose', 'content', 'page', 'full'];
const GUTTERS: ContainerGutter[] = ['narrow', 'default', 'wide', 'none'];
const ALIGNS: ContainerAlign[] = ['center', 'start'];
const ELEMENTS: ContainerElement[] = ['div', 'main', 'section'];

const meta: Meta<ContainerArgs> = {
  title: 'Container/Lit',
  tags: ['autodocs'],
  argTypes: {
    width: { control: 'select', options: WIDTHS },
    gutter: { control: 'select', options: GUTTERS },
    align: { control: 'select', options: ALIGNS },
    element: { control: 'select', options: ELEMENTS },
  },
  args: {
    children: 'Container content',
    width: 'content',
    gutter: 'default',
    align: 'center',
    element: 'div',
  },
  render: (args) => html`
    <ds-container width=${args.width} gutter=${args.gutter} align=${args.align} element=${args.element}>
      <ds-text>${args.children}</ds-text>
    </ds-container>
  `,
};

export default meta;
type Story = StoryObj<ContainerArgs>;

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

/* examples */
export const ApplicationScreen: Story = {
  args: { children: 'A Stack of page regions', width: 'content' },
};
export const ReadingMeasure: Story = {
  args: { children: 'An article', width: 'prose' },
};
export const NestedSection: Story = {
  args: { children: 'A narrower section', width: 'prose', gutter: 'none' },
};
