import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, type TemplateResult } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Splitter.js';
import './Box.js';
import './Button.js';
import './Stack.js';
import type { SplitterOrientation, SplitterStackBelow } from './Splitter.js';

interface SplitterArgs {
  label: string;
  primary: string;
  secondary: string;
  orientation: SplitterOrientation;
  defaultSize: number;
  minSize: number;
  maxSize: number;
  step: number;
  collapsible: boolean;
  defaultCollapsed: boolean;
  persistKey: string | undefined;
  stackBelow: SplitterStackBelow;
}

const frame = (content: TemplateResult): TemplateResult => html`
  <div style="block-size: 20rem; border: var(--border-width-thin) solid var(--color-border);">${content}</div>
`;

const splitter = (args: SplitterArgs, primary: TemplateResult, secondary: TemplateResult): TemplateResult => html`
  <ds-splitter
    label=${args.label}
    orientation=${args.orientation}
    default-size=${args.defaultSize}
    min-size=${args.minSize}
    max-size=${args.maxSize}
    step=${args.step}
    ?collapsible=${args.collapsible}
    ?default-collapsed=${args.defaultCollapsed}
    persist-key=${ifDefined(args.persistKey)}
    stack-below=${args.stackBelow}
  >
    <ds-box slot="primary" inset="md">${primary}</ds-box>
    <ds-box slot="secondary" inset="md">${secondary}</ds-box>
  </ds-splitter>
`;

const meta: Meta<SplitterArgs> = {
  title: 'Splitter/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['size-change', 'size-change-end', 'collapse-change'] },
  },
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    stackBelow: { control: 'select', options: ['prose', 'content', 'never'] },
    collapsible: { control: 'boolean' },
    defaultCollapsed: { control: 'boolean' },
  },
  args: {
    label: 'Sidebar width',
    primary: 'A navigation tree',
    secondary: 'The selected document',
    orientation: 'horizontal',
    defaultSize: 30,
    minSize: 10,
    maxSize: 90,
    step: 2,
    collapsible: false,
    defaultCollapsed: false,
    persistKey: undefined,
    stackBelow: 'prose',
  },
  render: (args) => frame(splitter(args, html`${args.primary}`, html`${args.secondary}`)),
};

export default meta;
type Story = StoryObj<SplitterArgs>;

export const Default: Story = {};

/* orientation */
export const OrientationHorizontal: Story = { args: { orientation: 'horizontal' } };
export const OrientationVertical: Story = { args: { orientation: 'vertical' } };

/* stackBelow */
export const StackBelowProse: Story = { args: { stackBelow: 'prose' } };
export const StackBelowContent: Story = { args: { stackBelow: 'content' } };
export const StackBelowNever: Story = { args: { stackBelow: 'never' } };

/* states */
export const Collapsible: Story = { args: { collapsible: true } };
export const Collapsed: Story = { args: { collapsible: true, defaultCollapsed: true } };

/* examples */
export const SidebarAndContent: Story = {
  args: {
    label: 'Sidebar width',
    primary: 'A navigation tree',
    secondary: 'The selected document',
    defaultSize: 25,
    persistKey: 'app-sidebar',
  },
};

export const CollapsibleNavigation: Story = {
  args: {
    label: 'Sidebar width',
    primary: 'A navigation tree',
    secondary: 'The selected document',
    collapsible: true,
    minSize: 15,
  },
};

export const EditorOverPreview: Story = {
  args: {
    label: 'Editor height',
    primary: 'The editor',
    secondary: 'The preview',
    orientation: 'vertical',
    defaultSize: 60,
  },
};

export const NeverStackingWorkbench: Story = {
  args: {
    label: 'List width',
    primary: 'The result list',
    secondary: 'The detail view',
    stackBelow: 'never',
    step: 5,
  },
};

/**
 * The separator between two panes holding three focusable buttons, with the collapse button, so the keyboard
 * gate can exercise Tab, arrows, Home/End, Enter and F6. `stackBelow: never` keeps the separator rendered at
 * narrow test widths.
 */
export const Keyboard: Story = {
  args: { collapsible: true, stackBelow: 'never' },
  render: (args) =>
    frame(
      splitter(
        args,
        html`<ds-stack gap="tight">
          <ds-button label="First"></ds-button>
          <ds-button label="Second"></ds-button>
        </ds-stack>`,
        html`<ds-stack gap="tight"><ds-button label="Third"></ds-button></ds-stack>`,
      ),
    ),
};
