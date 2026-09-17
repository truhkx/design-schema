import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing, type TemplateResult } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Button.js';
import './Icon.js';
import type { ButtonSize, ButtonType, ButtonVariant } from './Button.js';

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
}

/** The base render; `extra` is slotted into the button (the decorative icon slots). */
const renderButton = (args: ButtonArgs, extra: TemplateResult | typeof nothing = nothing): TemplateResult => html`
  <ds-button
    label=${args.label}
    variant=${args.variant}
    size=${args.size}
    type=${args.type}
    track=${ifDefined(args.track === '' ? undefined : args.track)}
    accessible-name=${ifDefined(args.accessibleName || undefined)}
    overflow-label=${ifDefined(args.overflowLabel || undefined)}
    .expanded=${args.expanded}
    ?disabled=${args.disabled}
    ?icon-only=${args.iconOnly}
    ?loading=${args.loading}
    ?inverse=${args.inverse}
    >${extra}</ds-button
  >
`;

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
  render: (args) => renderButton(args),
};

export default meta;
type Story = StoryObj<ButtonArgs>;

export const Default: Story = {};

/* variant */
export const VariantPrimary: Story = { args: { variant: 'primary' } };
export const VariantSecondary: Story = { args: { variant: 'secondary' } };
export const VariantGhost: Story = { args: { variant: 'ghost' } };
export const VariantDanger: Story = { args: { variant: 'danger', label: 'Delete file' } };

/* size */
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };
export const SizeLg: Story = { args: { size: 'lg' } };

/* type */
export const TypeButton: Story = { args: { type: 'button' } };
export const TypeSubmit: Story = { args: { type: 'submit' } };

/* boolean states */
export const Disabled: Story = { args: { disabled: true } };

/** Busy: a spinner replaces the leading icon, the trailing icon hides, the label and size stay put. */
export const Loading: Story = { args: { loading: true } };

/* decorative icons, hidden from assistive technology — the label carries the meaning */
export const LeadingIcon: Story = {
  args: { label: 'Add item', variant: 'secondary' },
  render: (args) => renderButton(args, html`<ds-icon slot="leading-icon" name="plus"></ds-icon>`),
};

export const TrailingIcon: Story = {
  args: { label: 'Continue', variant: 'secondary' },
  render: (args) => renderButton(args, html`<ds-icon slot="trailing-icon" name="chevron-right"></ds-icon>`),
};

/** iconOnly hides the visible label; `label` becomes the accessible name. */
export const IconOnly: Story = {
  args: { iconOnly: true, label: 'Close', variant: 'ghost' },
  render: (args) => renderButton(args, html`<ds-icon slot="leading-icon" name="close"></ds-icon>`),
};

/** inverse: rendered on an inverse surface, like a Toast or a Tooltip-like panel. */
export const Inverse: Story = {
  args: { variant: 'ghost', inverse: true, label: 'Dismiss' },
  render: (args) => html`
    <div style="background: var(--color-inverse-surface); padding: var(--space-md); border-radius: var(--radius-md);">
      ${renderButton(args)}
    </div>
  `,
};

/** track: calls the analytics module on press, then fires `track` with the same pair. */
export const Tracked: Story = { args: { track: 'signup', label: 'Sign up' } };

/** accessibleName: says more than the visible label, which stays part of the name (WCAG 2.5.3). */
export const AccessibleName: Story = {
  args: { label: 'Amount', variant: 'ghost', accessibleName: 'Sort by Amount, ascending' },
};

/** expanded: set by a disclosing parent (Menu, Popover, SidePanel, Disclosure) as a property. */
export const Expanded: Story = {
  args: { label: 'Options', variant: 'secondary', expanded: true },
};

/* examples from the doc */

/** The single most important action in a view, labelled with the outcome. */
export const PrimarySave: Story = { args: { label: 'Save changes', variant: 'primary' } };

/** A destructive, hard-to-undo action, which is the only use of the danger variant. */
export const DestructiveConfirm: Story = { args: { label: 'Delete file', variant: 'danger' } };

/** A low-emphasis icon-only control in dense UI, labelled with what it does, not what the icon depicts. */
export const IconOnlyInAToolbar: Story = {
  args: { label: 'Close', iconOnly: true, variant: 'ghost', size: 'sm' },
  render: (args) => renderButton(args, html`<ds-icon slot="leading-icon" name="close"></ds-icon>`),
};

/** The submit button of a form while the request is in flight — busy, and ignoring repeat activation. */
export const PendingSubmit: Story = {
  args: { label: 'Create account', type: 'submit', loading: true },
};
