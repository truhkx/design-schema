import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Button.js';
import './Icon.js';
import type { ButtonSize, ButtonType, ButtonVariant } from './Button.js';
import type { IconName } from './Icon.js';

interface ButtonArgs {
  label: string;
  variant: ButtonVariant;
  size: ButtonSize;
  type: ButtonType;
  disabled: boolean;
  iconOnly: boolean;
  loading: boolean;
  inverse: boolean;
  track: string;
  accessibleName?: string | undefined;
  overflowLabel?: string | undefined;
  expanded?: boolean | undefined;
  /** The system Icon slotted as `leading-icon` (decorative). */
  leadingIcon?: IconName | undefined;
  /** The system Icon slotted as `trailing-icon` (decorative). */
  trailingIcon?: IconName | undefined;
}

const meta: Meta<ButtonArgs> = {
  title: 'Button/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['press', 'track'] },
  },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    type: { control: 'select', options: ['button', 'submit'] },
    disabled: { control: 'boolean' },
    iconOnly: { control: 'boolean' },
    loading: { control: 'boolean' },
    inverse: { control: 'boolean' },
    track: { control: 'text' },
    accessibleName: { control: 'text' },
    overflowLabel: { control: 'text' },
    expanded: { control: 'boolean' },
    leadingIcon: { control: 'text' },
    trailingIcon: { control: 'text' },
  },
  args: {
    label: 'Save changes',
    variant: 'primary',
    size: 'md',
    type: 'button',
    disabled: false,
    iconOnly: false,
    loading: false,
    inverse: false,
    track: '',
  },
  render: (args) => html`
    <ds-button
      label=${args.label}
      variant=${args.variant}
      size=${args.size}
      type=${args.type}
      track=${ifDefined(args.track || undefined)}
      accessible-name=${ifDefined(args.accessibleName || undefined)}
      overflow-label=${ifDefined(args.overflowLabel || undefined)}
      .expanded=${args.expanded}
      ?disabled=${args.disabled}
      ?icon-only=${args.iconOnly}
      ?loading=${args.loading}
      ?inverse=${args.inverse}
      >${args.leadingIcon
        ? html`<ds-icon slot="leading-icon" name=${args.leadingIcon} inline></ds-icon>`
        : nothing}${args.trailingIcon
        ? html`<ds-icon slot="trailing-icon" name=${args.trailingIcon} inline></ds-icon>`
        : nothing}</ds-button
    >
  `,
};

export default meta;
type Story = StoryObj<ButtonArgs>;

export const Default: Story = {};

/* variant */
export const VariantPrimary: Story = { args: { variant: 'primary' } };
export const VariantSecondary: Story = { args: { variant: 'secondary', label: 'Cancel' } };
export const VariantGhost: Story = { args: { variant: 'ghost', label: 'Forgot password?' } };
export const VariantDanger: Story = { args: { variant: 'danger', label: 'Delete file' } };

/* size */
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };
export const SizeLg: Story = { args: { size: 'lg' } };

/* type */
export const TypeButton: Story = { args: { type: 'button' } };
export const TypeSubmit: Story = { args: { type: 'submit', label: 'Sign in' } };

/* notable states */
export const Disabled: Story = { args: { disabled: true } };

/** Busy: a spinner takes the leading icon position, the trailing icon hides, the label and height stay put. */
export const Loading: Story = { args: { loading: true, label: 'Saving' } };

/** iconOnly while loading: the spinner replaces the sole glyph. */
export const LoadingIconOnly: Story = {
  args: { loading: true, iconOnly: true, label: 'Close', variant: 'ghost', leadingIcon: 'close' },
};

/* decorative icons, hidden from assistive technology — the label carries the meaning */
export const WithIcons: Story = {
  args: { label: 'Add item', leadingIcon: 'plus', trailingIcon: 'chevron-right' },
};

/** iconOnly hides the visible label; `label` becomes the accessible name. */
export const IconOnly: Story = {
  args: { iconOnly: true, label: 'Close', variant: 'ghost', leadingIcon: 'close' },
};

/** expanded: set by a disclosing parent (Menu, Popover, SidePanel, Disclosure) as a property. */
export const Expanded: Story = {
  args: { label: 'Actions', variant: 'secondary', expanded: true, trailingIcon: 'chevron-down' },
};

/**
 * inverse: rendered on an inverse surface, like a Toast or a Tooltip-like panel. The surface is a
 * story-only decorator, so the meta's render (and the Lit code sample) stays the button itself.
 */
export const Inverse: Story = {
  args: { variant: 'ghost', inverse: true, label: 'Undo' },
  parameters: { backgrounds: { default: 'dark' } },
  decorators: [
    (story) =>
      html`<div style="background: var(--color-inverse-surface); padding: var(--space-lg);">
        ${story()}
      </div>`,
  ],
};

/** track: calls the analytics module on press, then fires `track` with the same pair. */
export const Tracked: Story = { args: { track: 'signup', label: 'Sign up' } };

/** accessibleName: says more than the visible label, which stays part of the name (WCAG 2.5.3). */
export const AccessibleName: Story = {
  args: { label: 'Amount', variant: 'ghost', accessibleName: 'Sort by Amount, ascending' },
};

/* examples from the doc */

/** The single most important action in a view, labelled with the outcome. */
export const PrimarySave: Story = { args: { label: 'Save changes', variant: 'primary' } };

/** A destructive, hard-to-undo action, which is the only use of the danger variant. */
export const DestructiveConfirm: Story = { args: { label: 'Delete file', variant: 'danger' } };

/** A low-emphasis icon-only control in dense UI, whose label says what it does rather than what the icon depicts. */
export const IconOnlyInAToolbar: Story = {
  args: { label: 'Close', iconOnly: true, leadingIcon: 'close', variant: 'ghost', size: 'sm' },
};

/** The submit button of a form while the request is in flight - busy, and ignoring repeat activation. */
export const PendingSubmit: Story = { args: { label: 'Create account', type: 'submit', loading: true } };
