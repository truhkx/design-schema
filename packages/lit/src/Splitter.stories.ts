import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
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
  // The splitter fills its parent, so a vertical one needs a parent with a definite height; the
  // frame is a plain, non-focusable box.
  render: (args) => html`
    <div style="block-size: var(--layout-max-width-prose); border: var(--border-width-thin) solid var(--color-border);">
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
        <ds-box slot="primary" inset="md">${args.primary}</ds-box>
        <ds-box slot="secondary" inset="md">${args.secondary}</ds-box>
      </ds-splitter>
    </div>
  `,
};

export default meta;
type Story = StoryObj<SplitterArgs>;

export const Default: Story = {};

/* orientation */
export const OrientationHorizontal: Story = { args: { orientation: 'horizontal' } };
export const OrientationVertical: Story = {
  args: { orientation: 'vertical', label: 'Preview height', primary: 'Editor', secondary: 'Preview' },
};

/* stackBelow */
export const StackBelowProse: Story = { args: { stackBelow: 'prose' } };
export const StackBelowContent: Story = { args: { stackBelow: 'content' } };
export const StackBelowNever: Story = { args: { stackBelow: 'never' } };

/* notable states */
export const Collapsible: Story = { args: { collapsible: true } };
export const Collapsed: Story = { args: { collapsible: true, defaultCollapsed: true } };

/**
 * Present with its separator, collapse Button and at least three focusable children, for the
 * keyboard gate: Tab, arrows, Home/End, Enter and F6. `stackBelow: never` keeps the separator
 * rendered at the narrow widths the gate runs at — a stacked splitter renders none.
 */
export const Keyboard: Story = {
  args: { collapsible: true, stackBelow: 'never' },
  render: (args) => html`
    <div style="block-size: var(--layout-max-width-prose); border: var(--border-width-thin) solid var(--color-border);">
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
        <ds-box slot="primary" inset="md">
          <ds-stack gap="normal" align="start">
            <ds-button label="Overview" variant="secondary" size="sm"></ds-button>
            <ds-button label="Reports" variant="secondary" size="sm"></ds-button>
          </ds-stack>
        </ds-box>
        <ds-box slot="secondary" inset="md">
          <ds-button label="Detail action" variant="secondary" size="sm"></ds-button>
        </ds-box>
      </ds-splitter>
    </div>
  `,
};

/* examples */
export const SidebarAndContent: Story = {
  args: {
    label: 'Sidebar width',
    primary: 'A navigation tree',
    secondary: 'The selected document',
    defaultSize: 25,
    persistKey: 'app-sidebar',
    // Pinned so the story shows the split itself: a stacked splitter renders no separator.
    stackBelow: 'never',
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
