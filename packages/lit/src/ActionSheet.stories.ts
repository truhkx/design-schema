import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './ActionSheet.js';
import type { ActionSheetAction } from './ActionSheet.js';

interface ActionSheetArgs {
  open: boolean;
  heading?: string;
  actions: ActionSheetAction[];
  cancelLabel?: string;
}

const DEFAULT_ACTIONS: ActionSheetAction[] = [
  { id: 'share', label: 'Share', icon: 'external' },
  { id: 'rename', label: 'Rename' },
  { id: 'duplicate', label: 'Duplicate' },
  { id: 'delete', label: 'Delete photo', tone: 'danger' },
];

const DISABLED_ACTIONS: ActionSheetAction[] = [
  { id: 'share', label: 'Share', icon: 'external' },
  { id: 'rename', label: 'Rename', disabled: true },
  { id: 'duplicate', label: 'Duplicate' },
  { id: 'delete', label: 'Delete photo', tone: 'danger' },
];

const meta: Meta<ActionSheetArgs> = {
  title: 'ActionSheet/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['action', 'close'] },
  },
  args: {
    open: true,
    heading: 'Photo.jpg',
    actions: DEFAULT_ACTIONS,
  },
  render: (args) => html`
    <ds-action-sheet
      ?open=${args.open}
      heading=${ifDefined(args.heading)}
      .actions=${args.actions}
      cancel-label=${ifDefined(args.cancelLabel)}
    ></ds-action-sheet>
  `,
};

export default meta;
type Story = StoryObj<ActionSheetArgs>;

export const Default: Story = {};

export const WithoutTitle: Story = {
  args: { heading: undefined },
};

export const WithDisabledAction: Story = {
  args: { actions: DISABLED_ACTIONS },
};

export const CustomCancelLabel: Story = {
  args: { cancelLabel: 'Never mind' },
};

/**
 * Renders open with at least three focusable children (four action rows plus
 * Cancel) so the keyboard gate can verify arrow navigation, Home/End wrapping,
 * Enter/Space and Escape. ActionSheet has no dedicated trigger of its own —
 * `open` is fully controlled by the consumer.
 */
export const Keyboard: Story = {
  args: { open: true, heading: 'Photo.jpg', actions: DEFAULT_ACTIONS },
};
