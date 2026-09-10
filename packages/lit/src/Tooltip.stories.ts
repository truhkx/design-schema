import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './Tooltip.js';
import './Button.js';
import './Icon.js';
import type { TooltipDelay, TooltipPlacement } from './Tooltip.js';

interface TooltipArgs {
  content: string;
  placement: TooltipPlacement;
  describes: boolean;
  delay: TooltipDelay;
}

const meta: Meta<TooltipArgs> = {
  title: 'Tooltip/Lit',
  tags: ['autodocs'],
  argTypes: {
    placement: { control: 'select', options: ['top', 'bottom', 'start', 'end'] },
    describes: { control: 'boolean' },
    delay: { control: 'select', options: ['default', 'none'] },
  },
  args: {
    content: 'Includes archived items',
    placement: 'top',
    describes: true,
    delay: 'default',
  },
  render: (args) => html`
    <ds-tooltip
      content=${args.content}
      placement=${args.placement}
      ?describes=${args.describes}
      delay=${args.delay}
    >
      <ds-button label="Show all" variant="secondary"></ds-button>
    </ds-tooltip>
  `,
};

export default meta;
type Story = StoryObj<TooltipArgs>;

export const Default: Story = {};

/* placement */
export const PlacementTop: Story = { args: { placement: 'top' } };
export const PlacementBottom: Story = { args: { placement: 'bottom' } };
export const PlacementStart: Story = { args: { placement: 'start' } };
export const PlacementEnd: Story = { args: { placement: 'end' } };

/* delay */
export const DelayDefault: Story = { args: { delay: 'default' } };
export const DelayNone: Story = { args: { delay: 'none' } };

/* describes */
export const DescribesTrue: Story = { args: { describes: true } };

/**
 * `describes: false` — the child has no visible text, so the tooltip becomes
 * its accessible name (`aria-labelledby`) instead of a description. `content`
 * equals the button's own `label` for exactly this reason.
 */
export const DescribesFalse: Story = {
  args: { describes: false, content: 'Search' },
  render: (args) => html`
    <ds-tooltip content=${args.content} placement=${args.placement} ?describes=${args.describes} delay=${args.delay}>
      <ds-button icon-only label="Search" variant="ghost">
        <ds-icon slot="leading-icon" name="search"></ds-icon>
      </ds-button>
    </ds-tooltip>
  `,
};

/**
 * Renders present with its trigger, autofocused so it is open on mount, among
 * three focusable siblings so the keyboard gate can verify Escape hides it
 * without moving focus and Tab still reaches every control normally.
 */
export const Keyboard: Story = {
  render: () => html`
    <div style="display: flex; gap: var(--space-md);">
      <button type="button">Before</button>
      <ds-tooltip content="Includes archived items">
        <button type="button" autofocus>Show all</button>
      </ds-tooltip>
      <button type="button">After</button>
    </div>
  `,
};
