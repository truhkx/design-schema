import type { Meta, StoryObj } from '@storybook/react-vite';
import { Disclosure } from './Disclosure';
import { withTheme } from './decorators';

const meta: Meta<typeof Disclosure> = {
  title: 'Disclosure/React Native',
  component: Disclosure,
  decorators: [withTheme()],
  args: {
    summary: 'Advanced options',
    children: 'Retry limit, timeout and proxy settings.',
    defaultOpen: false,
    disabled: false,
    keepMounted: false,
  },
};

export default meta;

type Story = StoryObj<typeof Disclosure>;

export const Default: Story = {};

export const Open: Story = { args: { defaultOpen: true } };

// headingLevel
export const HeadingLevel2: Story = { args: { headingLevel: '2' } };
export const HeadingLevel3: Story = { args: { headingLevel: '3' } };
export const HeadingLevel4: Story = { args: { headingLevel: '4' } };
export const HeadingLevel5: Story = { args: { headingLevel: '5' } };
export const HeadingLevel6: Story = { args: { headingLevel: '6' } };

/** The panel stays mounted (hidden) while closed, so form fields inside keep registering. */
export const KeepMounted: Story = { args: { keepMounted: true } };

// Examples from the component doc.

/** A question whose trigger sits in a heading, so it appears in the document outline. */
export const FaqAnswer: Story = {
  args: {
    summary: 'What happens if I cancel?',
    children: 'You keep access until the end of the current billing period.',
    headingLevel: '3',
  },
};

/** Secondary settings most users never open. */
export const AdvancedOptions: Story = {
  args: { summary: 'Advanced options', children: 'Retry limit, timeout and proxy settings.' },
};

/** A disclosure that starts open and keeps its panel mounted so a Form still collects the fields inside. */
export const OpenWithFormFields: Story = {
  args: {
    summary: 'Billing address',
    children: 'Street, city and postcode fields.',
    defaultOpen: true,
    keepMounted: true,
  },
};

/** A trigger that cannot be activated yet, still focusable and announced as disabled. */
export const Disabled: Story = {
  args: { summary: 'Shipping details', children: 'Choose a delivery address first.', disabled: true },
};
