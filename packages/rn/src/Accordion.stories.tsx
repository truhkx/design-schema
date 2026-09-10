import type { Meta, StoryObj } from '@storybook/react';
import { Accordion } from './Accordion';
import type { AccordionItem } from './Accordion';
import { Text } from './Text';
import { withTheme } from './decorators';

const ITEMS: AccordionItem[] = [
  { id: 'shipping', summary: 'How long does shipping take?', content: <Text>Orders ship within two business days.</Text> },
  { id: 'returns', summary: 'What is your return policy?', content: <Text>Items can be returned within 30 days.</Text> },
  { id: 'payment', summary: 'What payment methods are accepted?', content: <Text>We accept all major credit cards.</Text> },
  { id: 'support', summary: 'How do I contact support?', content: <Text>Email support@example.com.</Text>, disabled: true },
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

/** At least three focusable triggers, for the axe gate and manual keyboard checks on react-native-web. */
export const Keyboard: Story = { ...Default };
