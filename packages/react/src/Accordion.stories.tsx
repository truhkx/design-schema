import type { Meta, StoryObj } from '@storybook/react-vite';
import { Accordion, type AccordionItem } from './Accordion';
import { Text } from './Text';

const ITEMS: AccordionItem[] = [
  {
    id: 'cancel',
    summary: 'What happens if I cancel?',
    content: <Text>You keep access until the end of the billing period.</Text>,
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
];

const meta: Meta<typeof Accordion> = {
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
    headingLevel: { control: 'select', options: ['2', '3', '4', '5', '6'] },
    onChange: { action: 'onChange' },
    onOpenChange: { action: 'onOpenChange' },
  },
  tags: ['autodocs'],
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

/* examples */
export const Faq: Story = {
  args: {
    items: [
      { id: 'cancel', summary: 'What happens if I cancel?', content: 'You keep access until the end of the billing period.' },
      { id: 'refunds', summary: 'Do you offer refunds?', content: 'Within 14 days of a charge, in full.' },
    ],
  },
};

export const OneOpenAtATime: Story = {
  args: {
    exclusive: true,
    items: [
      { id: 'free', summary: 'Free', content: 'One project and community support.' },
      { id: 'pro', summary: 'Pro', content: 'Unlimited projects and email support.' },
    ],
  },
};

export const FormSections: Story = {
  args: {
    keepMounted: true,
    headingLevel: '2',
    items: [
      { id: 'contact', summary: 'Contact details', content: 'Name and email fields.' },
      { id: 'billing', summary: 'Billing address', content: 'Street and city fields.' },
    ],
  },
};

export const Undivided: Story = {
  args: {
    divided: false,
    items: [
      { id: 'shipping', summary: 'Shipping', content: 'Orders ship within two business days.' },
      { id: 'returns', summary: 'Returns', content: 'Items can be returned within 30 days.' },
    ],
  },
};

/* notable states */
export const Controlled: Story = { args: { value: ['cancel', 'plans'] } };

export const DisabledItem: Story = {
  args: {
    items: [
      ...ITEMS,
      { id: 'support', summary: 'How do I contact support?', content: <Text>Write to the support team.</Text>, disabled: true },
    ],
  },
};

/** Present with three enabled triggers and nothing open, for the keyboard gate. */
export const Keyboard: Story = { args: { items: ITEMS } };
