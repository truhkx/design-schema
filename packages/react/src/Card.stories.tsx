import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';
import { Stack } from './Stack';
import { Text } from './Text';
import { Button } from './Button';
import { Link } from './Link';

const meta: Meta<typeof Card> = {
  title: 'Card/React',
  component: Card,
  tags: ['autodocs'],
  args: {
    children: 'What the plan includes',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    heading: 'Team plan',
    children: (
      <Stack gap="tight">
        <Text element="p">Unlimited projects, priority support and advanced analytics for growing teams.</Text>
        <Text element="p" tone="muted" size="sm">
          Billed annually.
        </Text>
      </Stack>
    ),
    footer: (
      <>
        <Button label="Choose plan" variant="primary" size="sm" />
        <Button label="Compare plans" variant="secondary" size="sm" />
      </>
    ),
  },
};

/* headingLevel */
export const HeadingLevel2: Story = { args: { ...Default.args, headingLevel: '2' } };
export const HeadingLevel3: Story = { args: { ...Default.args, headingLevel: '3' } };
export const HeadingLevel4: Story = { args: { ...Default.args, headingLevel: '4' } };
export const HeadingLevel5: Story = { args: { ...Default.args, headingLevel: '5' } };
export const HeadingLevel6: Story = { args: { ...Default.args, headingLevel: '6' } };

/* inset */
export const InsetSm: Story = { args: { ...Default.args, inset: 'sm' } };
export const InsetMd: Story = { args: { ...Default.args, inset: 'md' } };
export const InsetLg: Story = { args: { ...Default.args, inset: 'lg' } };

/* surface */
export const SurfaceDefault: Story = { args: { ...Default.args, surface: 'default' } };
export const SurfaceSubtle: Story = { args: { ...Default.args, surface: 'subtle' } };

/* notable states */
export const WithHeaderActions: Story = {
  args: {
    ...Default.args,
    headerActions: <Link href="#" label="Details" />,
  },
};

export const Interactive: Story = {
  args: {
    heading: 'September invoice',
    interactive: true,
    children: <Link href="#" label="View the September invoice" />,
  },
};

export const InteractiveSubtle: Story = {
  args: { ...Interactive.args, surface: 'subtle' },
};

/* The target is found among the body's top-level children, so a Link beside Text still extends. */
export const InteractiveWithText: Story = {
  args: {
    heading: 'September invoice',
    interactive: true,
    children: [
      <Text key="summary" element="p" tone="muted">
        Due 30 September.
      </Text>,
      <Link key="link" href="#" label="View the September invoice" />,
    ],
    headerActions: <Button label="Download" variant="ghost" size="sm" />,
  },
};

export const InteractiveDisabledButton: Story = {
  args: {
    heading: 'Archived plan',
    interactive: true,
    children: <Button label="Choose plan" variant="secondary" disabled />,
  },
};

/* examples */
export const PlanCard: Story = {
  args: { heading: 'Team plan', headingLevel: '3', children: 'What the plan includes' },
};

export const DenseGridCard: Story = {
  args: { children: 'A search result', inset: 'sm', surface: 'subtle' },
};

export const WholeCardIsALink: Story = {
  args: {
    heading: 'September invoice',
    children: <Link href="#" label="A Link to the invoice" />,
    interactive: true,
  },
};

export const CardFocusedByAFeed: Story = {
  args: { heading: 'New comment', children: 'The comment body', focusable: true },
};
