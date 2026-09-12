import type { Meta, StoryObj } from '@storybook/react-vite';
import { Expander } from './Expander';
import { Text } from './Text';
import { Stack } from './Stack';

const panel = (
  <Text>
    You keep access until the end of the current billing period. Your data is kept for 30 days after that, then
    deleted.
  </Text>
);

const meta: Meta<typeof Expander> = {
  title: 'Expander/React',
  component: Expander,
  args: {
    summary: 'What happens if I cancel?',
    defaultOpen: false,
    disabled: false,
    keepMounted: false,
    children: panel,
  },
  argTypes: {
    onToggle: { action: 'onToggle' },
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

/* states */
export const Open: Story = { args: { defaultOpen: true } };
export const Disabled: Story = { args: { disabled: true } };
export const Controlled: Story = { args: { open: true } };
export const KeepMounted: Story = { args: { keepMounted: true } };

/* accordion: independent disclosures stacked; nothing closes its siblings. */
export const Accordion: Story = {
  render: (args) => (
    <Stack gap="none">
      <Expander {...args} summary="What happens if I cancel?" headingLevel="3" />
      <Expander {...args} summary="Can I change plans later?" headingLevel="3">
        <Text>Yes. Changes take effect at the next billing date.</Text>
      </Expander>
      <Expander {...args} summary="Do you offer refunds?" headingLevel="3">
        <Text>Within 14 days of a charge, in full.</Text>
      </Expander>
    </Stack>
  ),
};
