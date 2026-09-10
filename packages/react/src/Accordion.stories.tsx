import type { Meta, StoryObj } from '@storybook/react';
import { Accordion, type AccordionItem } from './Accordion';
import { Text } from './Text';

const ITEMS: AccordionItem[] = [
  {
    id: 'cancel',
    summary: 'What happens if I cancel?',
    content: (
      <Text>
        You keep access until the end of the current billing period. Your data is kept for 30 days after that, then
        deleted.
      </Text>
    ),
  },
  {
    id: 'plans',
    summary: 'Can I change plans later?',
    content: <Text>Yes. Changes take effect at the next billing date.</Text>,
  },
  {
    id: 'refunds',
    summary: 'Do you offer refunds?',
    content: <Text>Within 14 days of a charge, in full.</Text>,
  },
  {
    id: 'support',
    summary: 'How do I contact support?',
    content: <Text>Email support@example.com — a real product would link this.</Text>,
    disabled: true,
  },
];

const meta = {
  title: 'Accordion/React',
  component: Accordion,
  args: {
    items: ITEMS,
    headingLevel: '3',
    exclusive: false,
    divided: true,
    keepMounted: false,
  },
  argTypes: {
    onChange: { action: 'onChange' },
    onOpenChange: { action: 'onOpenChange' },
  },
  decorators: [
    (Story) => (
      <div style={{ maxInlineSize: '32rem' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* headingLevel */
export const HeadingLevel2: Story = { args: { headingLevel: '2' } };
export const HeadingLevel3: Story = { args: { headingLevel: '3' } };
export const HeadingLevel4: Story = { args: { headingLevel: '4' } };
export const HeadingLevel5: Story = { args: { headingLevel: '5' } };
export const HeadingLevel6: Story = { args: { headingLevel: '6' } };

/* notable states */
export const Exclusive: Story = { args: { exclusive: true, defaultValue: 'cancel' } };
export const NotDivided: Story = { args: { divided: false } };
export const KeepMounted: Story = { args: { keepMounted: true } };
export const Controlled: Story = { args: { value: ['cancel', 'plans'] } };

/** Present with four triggers (three enabled), for the keyboard gate. */
export const Keyboard: Story = { args: { defaultValue: 'cancel' } };
