import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Fieldset.js';
import './Input.js';
import type { FieldsetGap } from './Fieldset.js';

interface FieldsetArgs {
  legend: string;
  description?: string | undefined;
  error?: string | undefined;
  disabled: boolean;
  gap: FieldsetGap;
  required: boolean;
}

const meta: Meta<FieldsetArgs> = {
  title: 'Fieldset/Lit',
  tags: ['autodocs'],
  argTypes: {
    gap: { control: 'select', options: ['tight', 'normal', 'loose'] },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  args: {
    legend: 'Shipping address',
    description: undefined,
    error: undefined,
    disabled: false,
    gap: 'normal',
    required: false,
  },
  render: (args) => html`
    <ds-fieldset
      legend=${args.legend}
      description=${ifDefined(args.description)}
      error=${ifDefined(args.error)}
      gap=${args.gap}
      ?disabled=${args.disabled}
    >
      <ds-input name="street" label="Street" ?required=${args.required}></ds-input>
      <ds-input name="city" label="City" ?required=${args.required}></ds-input>
      <ds-input name="postal-code" label="Postal code" ?required=${args.required}></ds-input>
    </ds-fieldset>
  `,
};

export default meta;
type Story = StoryObj<FieldsetArgs>;

export const Default: Story = {};

/* gap */
export const GapTight: Story = { args: { gap: 'tight' } };
export const GapNormal: Story = { args: { gap: 'normal' } };
export const GapLoose: Story = { args: { gap: 'loose' } };

/* notable states */
export const WithDescription: Story = {
  args: { description: 'We only ship within the EU.' },
};

export const ErrorSet: Story = {
  args: { error: 'End date must be after start date.' },
};

export const DisabledTrue: Story = { args: { disabled: true } };

export const AllFieldsRequired: Story = {
  args: { required: true },
};
