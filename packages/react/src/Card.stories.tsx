import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from './Card';
import { Stack } from './Stack';
import { Text } from './Text';
import { Button } from './Button';
import { Link } from './Link';

const body = (
  <Stack gap="tight">
    <Text element="p">Unlimited projects, priority support and advanced analytics for growing teams.</Text>
    <Text element="p" tone="muted" size="sm">
      $24/month, billed annually.
    </Text>
  </Stack>
);

const footer = <Button label="Choose plan" variant="primary" size="sm" />;

const meta: Meta<typeof Card> = {
  title: 'Card/React',
  component: Card,
  args: {
    heading: 'Team plan',
    headingLevel: '3',
    inset: 'md',
    surface: 'default',
    interactive: false,
    children: body,
    footer,
  },
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

/* inset */
export const InsetSm: Story = { args: { inset: 'sm' } };
export const InsetMd: Story = { args: { inset: 'md' } };
export const InsetLg: Story = { args: { inset: 'lg' } };

/* surface */
export const SurfaceDefault: Story = { args: { surface: 'default' } };
export const SurfaceSubtle: Story = { args: { surface: 'subtle' } };

/* notable states */
export const WithoutHeading: Story = { args: { heading: undefined, footer: undefined } };

export const WithHeaderActions: Story = {
  args: {
    headerActions: <Button label="Dismiss" variant="ghost" size="sm" iconOnly />,
  },
};

export const Interactive: Story = {
  args: {
    interactive: true,
    heading: undefined,
    footer: undefined,
    children: <Link href="#" label="View plan details" />,
  },
};

export const Focusable: Story = { args: { focusable: true } };
