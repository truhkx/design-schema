import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './Button.js';
import type { ButtonSize, ButtonType, ButtonVariant } from './Button.js';

interface ButtonArgs {
  label: string;
  variant: ButtonVariant;
  size: ButtonSize;
  type: ButtonType;
  disabled: boolean;
  iconOnly: boolean;
  loading: boolean;
}

const meta: Meta<ButtonArgs> = {
  title: 'Button/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['press'] },
  },
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'danger'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    type: { control: 'select', options: ['button', 'submit'] },
    disabled: { control: 'boolean' },
    iconOnly: { control: 'boolean' },
    loading: { control: 'boolean' },
  },
  args: {
    label: 'Save changes',
    variant: 'primary',
    size: 'md',
    type: 'button',
    disabled: false,
    iconOnly: false,
    loading: false,
  },
  render: (args) => html`
    <ds-button
      label=${args.label}
      variant=${args.variant}
      size=${args.size}
      type=${args.type}
      ?disabled=${args.disabled}
      ?icon-only=${args.iconOnly}
      ?loading=${args.loading}
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
      <span slot="leading-icon" aria-hidden="true">&#x2715;</span>
    </ds-button>
  `,
};
