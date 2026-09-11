import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Splitter.js';
import './Button.js';
import type { SplitterOrientation, SplitterStackBelow } from './Splitter.js';

interface SplitterArgs {
  label: string;
  orientation: SplitterOrientation;
  defaultSize: number;
  minSize: number;
  maxSize: number;
  step: number;
  collapsible: boolean;
  persistKey?: string | undefined;
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
  },
  args: {
    label: 'Sidebar width',
    orientation: 'horizontal',
    defaultSize: 30,
    minSize: 10,
    maxSize: 90,
    step: 2,
    collapsible: false,
    persistKey: undefined,
    stackBelow: 'prose',
  },
  render: (args) => html`
    <div style="block-size: 20rem; border: var(--border-width-thin) solid var(--color-border);">
      <ds-splitter
        label=${args.label}
        orientation=${args.orientation}
        default-size=${args.defaultSize}
        min-size=${args.minSize}
        max-size=${args.maxSize}
        step=${args.step}
        ?collapsible=${args.collapsible}
        persist-key=${ifDefined(args.persistKey)}
        stack-below=${args.stackBelow}
      >
        <nav slot="primary" style="padding: var(--space-3);">Navigation</nav>
        <main slot="secondary" style="padding: var(--space-3);">Content</main>
      </ds-splitter>
    </div>
  `,
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

export const Collapsible: Story = { args: { collapsible: true } };

export const WithPersistKey: Story = { args: { persistKey: 'storybook-splitter-demo' } };

/**
 * Renders the separator with three focusable children across its two panes (two
 * buttons in the primary pane, one in the secondary), plus a collapse button, so
 * the keyboard gate can verify Tab, arrows, Home/End, Enter and F6.
 */
export const Keyboard: Story = {
  args: { collapsible: true },
  render: (args) => html`
    <div style="block-size: 20rem; border: var(--border-width-thin) solid var(--color-border);">
      <ds-splitter
        label=${args.label}
        orientation=${args.orientation}
        default-size=${args.defaultSize}
        min-size=${args.minSize}
        max-size=${args.maxSize}
        step=${args.step}
        ?collapsible=${args.collapsible}
        stack-below=${args.stackBelow}
      >
        <nav slot="primary" style="padding: var(--space-3);">
          <ds-button label="First"></ds-button>
          <ds-button label="Second"></ds-button>
        </nav>
        <main slot="secondary" style="padding: var(--space-3);">
          <ds-button label="Third"></ds-button>
        </main>
      </ds-splitter>
    </div>
  `,
};
