import type { Meta, StoryObj } from '@storybook/react-vite';
import { Popover } from './Popover';
import { Button } from './Button';
import { Input } from './Input';
import { Link } from './Link';
import { Stack } from './Stack';
import { Text } from './Text';

const defaultBody = (
  <Stack gap="normal">
    <Text size="sm">Show items updated in the last:</Text>
    <Stack direction="horizontal" gap="tight">
      <Button label="7 days" variant="secondary" size="sm" />
      <Button label="30 days" variant="secondary" size="sm" />
      <Button label="90 days" variant="secondary" size="sm" />
    </Stack>
    <Link href="#" label="Reset filters" />
  </Stack>
);

const meta: Meta<typeof Popover> = {
  title: 'Popover/React',
  component: Popover,
  args: {
    trigger: <Button label="Filters" variant="secondary" />,
    children: defaultBody,
    placement: 'bottom',
    modal: false,
    showArrow: false,
    dismissible: true,
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* headingLevel */
export const HeadingLevel2: Story = { args: { heading: 'Filters', headingLevel: '2' } };
export const HeadingLevel3: Story = { args: { heading: 'Filters', headingLevel: '3' } };
export const HeadingLevel4: Story = { args: { heading: 'Filters', headingLevel: '4' } };

/* placement */
export const PlacementBottomStart: Story = { args: { placement: 'bottom-start' } };
export const PlacementBottom: Story = { args: { placement: 'bottom' } };
export const PlacementBottomEnd: Story = { args: { placement: 'bottom-end' } };
export const PlacementTopStart: Story = { args: { placement: 'top-start' } };
export const PlacementTop: Story = { args: { placement: 'top' } };
export const PlacementTopEnd: Story = { args: { placement: 'top-end' } };
export const PlacementStart: Story = { args: { placement: 'start' } };
export const PlacementEnd: Story = { args: { placement: 'end' } };

/* notable states */
export const WithHeading: Story = {
  args: { heading: 'Filters' },
};

export const ShowArrowTrue: Story = {
  args: { showArrow: true, heading: 'Filters' },
};

export const ModalTrue: Story = {
  args: {
    modal: true,
    heading: 'Add link',
    dismissible: false,
    trigger: <Button label="Add link" variant="secondary" />,
    children: (
      <Stack gap="normal">
        <Input label="URL" name="url" placeholder="https://example.com" />
        <Stack direction="horizontal" gap="tight" justify="end">
          <Button label="Cancel" variant="secondary" size="sm" />
          <Button label="Add" variant="primary" size="sm" />
        </Stack>
      </Stack>
    ),
  },
};

export const NotDismissible: Story = {
  args: { dismissible: false, heading: 'Filters' },
};

/** Open/present with its trigger and at least three focusable body children, for the keyboard gate. */
export const Keyboard: Story = {
  args: {
    open: true,
    heading: 'Filters',
    children: (
      <Stack gap="normal">
        <Button label="7 days" variant="secondary" size="sm" />
        <Button label="30 days" variant="secondary" size="sm" />
        <Button label="90 days" variant="secondary" size="sm" />
        <Link href="#" label="Reset filters" />
      </Stack>
    ),
  },
};
