import type { Meta, StoryObj } from '@storybook/react-vite';
import { Disclosure } from './Disclosure';
import { Text } from './Text';
import { Stack } from './Stack';

const panel = (
  <Text>
    You keep access until the end of the current billing period. Your data is kept for 30 days after that, then
    deleted.
  </Text>
);

const meta: Meta<typeof Disclosure> = {
  title: 'Disclosure/React',
  component: Disclosure,
  tags: ['autodocs'],
  args: {
    summary: 'What happens if I cancel?',
    defaultOpen: false,
    disabled: false,
    keepMounted: false,
    children: panel,
  },
  argTypes: {
    onToggle: { action: 'onToggle' },
    headingLevel: { control: 'select', options: [undefined, '2', '3', '4', '5', '6'] },
  },
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: '32rem' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* headingLevel */
export const HeadingLevel2: Story = { args: { headingLevel: '2' } };
export const HeadingLevel3: Story = { args: { headingLevel: '3' } };
export const HeadingLevel4: Story = { args: { headingLevel: '4' } };
export const HeadingLevel5: Story = { args: { headingLevel: '5' } };
export const HeadingLevel6: Story = { args: { headingLevel: '6' } };

/* examples — exactly their `given` as args */
export const FaqAnswer: Story = {
  args: {
    summary: 'What happens if I cancel?',
    children: 'You keep access until the end of the current billing period.',
    headingLevel: '3',
  },
};

export const AdvancedOptions: Story = {
  args: {
    summary: 'Advanced options',
    children: 'Retry limit, timeout and proxy settings.',
  },
};

export const OpenWithFormFields: Story = {
  args: {
    summary: 'Billing address',
    children: 'Street, city and postcode fields.',
    defaultOpen: true,
    keepMounted: true,
  },
};

export const Disabled: Story = {
  args: {
    summary: 'Shipping details',
    children: 'Choose a delivery address first.',
    disabled: true,
  },
};

/* states */
export const Open: Story = { args: { defaultOpen: true } };
export const Controlled: Story = { args: { open: true } };
export const KeepMounted: Story = { args: { keepMounted: true } };

/* accordion: independent disclosures stacked; nothing closes its siblings. */
export const Accordion: Story = {
  render: (args) => (
    <Stack gap="none">
      <Disclosure {...args} summary="What happens if I cancel?" headingLevel="3" />
      <Disclosure {...args} summary="Can I change plans later?" headingLevel="3">
        <Text>Yes. Changes take effect at the next billing date.</Text>
      </Disclosure>
      <Disclosure {...args} summary="Do you offer refunds?" headingLevel="3">
        <Text>Within 14 days of a charge, in full.</Text>
      </Disclosure>
    </Stack>
  ),
};
