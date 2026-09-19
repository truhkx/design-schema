import type { Meta, StoryObj } from '@storybook/react-vite';
import { Link } from './Link';
import { Text } from './Text';

const meta: Meta<typeof Link> = {
  title: 'Link/React',
  component: Link,
  tags: ['autodocs'],
  args: {
    href: '/billing/history',
    label: 'View the billing history',
    external: false,
    tone: 'default',
    download: false,
  },
  argTypes: {
    onClick: { action: 'onClick' },
    tone: { control: 'inline-radio', options: ['default', 'inherit'] },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* tone */
export const ToneDefault: Story = { args: { tone: 'default' } };
/* Same muted wrapper and sentence as InsideMutedText, with the Default href and label. */
export const ToneInherit: Story = {
  args: { tone: 'inherit' },
  render: (args) => (
    <Text tone="muted">
      For how charges are calculated, read <Link {...args} />.
    </Text>
  ),
};

/* examples — ExternalDestination is the `external` state story and DownloadableFile the `download` one. */
export const InlineInAParagraph: Story = {
  args: { href: '/billing/history', label: 'View the billing history' },
  render: (args) => (
    <Text>
      Invoices from the last twelve months are kept. <Link {...args} />.
    </Text>
  ),
};

export const ExternalDestination: Story = {
  args: { href: 'https://status.example.com', label: 'Status page', external: true },
};

export const InsideMutedText: Story = {
  args: { href: '/help/billing', label: 'the billing guide', tone: 'inherit' },
  render: (args) => (
    <Text tone="muted">
      For how charges are calculated, read <Link {...args} />.
    </Text>
  ),
};

export const DownloadableFile: Story = {
  args: { href: '/invoices/2026-09.pdf', label: 'Download the September invoice', download: true },
};
