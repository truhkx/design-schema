import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
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
      track=${args.track}
      ?disabled=${args.disabled}
      ?icon-only=${args.iconOnly}
      ?loading=${args.loading}
      ?inverse=${args.inverse}
    ></ds-button>
  `,
};

export default meta;
type Story = StoryObj<ButtonArgs>;

export const Default: Story = {};

/* variant */
export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Danger: Story = { args: { variant: 'danger', label: 'Delete file' } };

/* size */
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };
export const SizeLg: Story = { args: { size: 'lg' } };

/* type */
export const TypeButton: Story = { args: { type: 'button' } };
export const TypeSubmit: Story = { args: { type: 'submit' } };

/* boolean states */
export const Disabled: Story = { args: { disabled: true } };
export const Loading: Story = { args: { loading: true } };
export const IconOnly: Story = {
  args: { iconOnly: true, label: 'Close', variant: 'ghost' },
  render: (args) => html`
    <ds-button
      label=${args.label}
      variant=${args.variant}
      size=${args.size}
      type=${args.type}
      ?disabled=${args.disabled}
      ?icon-only=${args.iconOnly}
      ?loading=${args.loading}
    >
      <ds-icon slot="leading-icon" name="close"></ds-icon>
    </ds-button>
  `,
};

/* inverse: rendered on an inverse surface, like a Toast or Tooltip panel */
export const Inverse: Story = {
  args: { variant: 'ghost', inverse: true, label: 'Dismiss' },
  render: (args) => html`
    <div
      style="background: var(--color-inverse-surface); padding: var(--space-md); border-radius: var(--radius-md);"
    >
      <ds-button label=${args.label} variant=${args.variant} size=${args.size} type=${args.type} ?inverse=${args.inverse}></ds-button>
    </div>
  `,
};

/* track: sends an analytics event on press, then fires `track` */
export const Tracked: Story = { args: { track: 'signup', label: 'Sign up' } };

/* accessibleName: overrides the accessible name; the visible label is its start */
export const AccessibleName: Story = {
  args: { label: 'Amount' },
  render: (args) => html`
    <ds-button
      label=${args.label}
      variant=${args.variant}
      size=${args.size}
      type=${args.type}
      accessible-name="Sort by Amount, ascending"
    ></ds-button>
  `,
};

/* expanded: set by a disclosing parent (Menu, Popover, SidePanel, Disclosure) */
export const Expanded: Story = {
  args: { label: 'Options', variant: 'secondary' },
  render: (args) => html`
    <ds-button
      label=${args.label}
      variant=${args.variant}
      size=${args.size}
      type=${args.type}
      .expanded=${true}
    ></ds-button>
  `,
};
