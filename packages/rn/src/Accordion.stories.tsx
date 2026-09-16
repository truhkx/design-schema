import type { Meta, StoryObj } from '@storybook/react-vite';
import { Accordion } from './Accordion';
import type { AccordionItem } from './Accordion';
import { withTheme } from './decorators';

const ITEMS: AccordionItem[] = [
  { id: 'shipping', summary: 'How long does shipping take?', content: 'Orders ship within two business days.' },
  { id: 'returns', summary: 'What is your return policy?', content: 'Items can be returned within 30 days.' },
  { id: 'payment', summary: 'Which payment methods are accepted?', content: 'All major credit cards.' },
  { id: 'support', summary: 'How do I contact support?', content: 'From the Help page.', disabled: true },
];

const meta: Meta<typeof Accordion> = {
  title: 'Accordion/React Native',
  component: Accordion,
  decorators: [withTheme()],
  args: {
    items: ITEMS,
  },
};

export default meta;

type Story = StoryObj<typeof Accordion>;

export const Default: Story = {};

// headingLevel
export const HeadingLevel2: Story = { args: { headingLevel: '2' } };
export const HeadingLevel3: Story = { args: { headingLevel: '3' } };
export const HeadingLevel4: Story = { args: { headingLevel: '4' } };
export const HeadingLevel5: Story = { args: { headingLevel: '5' } };
export const HeadingLevel6: Story = { args: { headingLevel: '6' } };

// notable states
export const Exclusive: Story = { args: { exclusive: true, defaultValue: 'shipping' } };
export const NotDivided: Story = { args: { divided: false } };
export const KeepMounted: Story = { args: { keepMounted: true } };
export const WithOverrides: Story = {
  args: { overrides: { triggerPaddingBlock: 'space.lg', divider: 'color.border.strong' } },
};

// examples
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

/** Open, with four triggers as focus stops, for the axe gate and manual keyboard checks on react-native-web. */
export const Keyboard: Story = { args: { defaultValue: 'shipping' } };
