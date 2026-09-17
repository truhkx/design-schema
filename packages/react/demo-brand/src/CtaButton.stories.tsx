import type { Meta, StoryObj } from '@storybook/react-vite';
import { CtaButton } from './CtaButton';
import { Icon } from './Icon';

const meta: Meta<typeof CtaButton> = {
  title: 'CtaButton/React',
  component: CtaButton,
  tags: ['autodocs'],
  args: {
    label: 'Save changes',
    emphasis: 'primary',
    size: 'md',
    type: 'button',
    disabled: false,
    iconOnly: false,
    loading: false,
    inverse: false,
  },
  argTypes: {
    onClick: { action: 'onClick' },
    onTrack: { action: 'onTrack' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* emphasis */
export const VariantPrimary: Story = { args: { emphasis: 'primary' } };
export const VariantSecondary: Story = { args: { emphasis: 'secondary', label: 'Cancel' } };
export const VariantGhost: Story = { args: { emphasis: 'ghost', label: 'Forgot password?' } };
export const VariantDanger: Story = { args: { emphasis: 'danger', label: 'Delete file' } };

/* size */
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };
export const SizeLg: Story = { args: { size: 'lg' } };

/* type */
export const TypeButton: Story = { args: { type: 'button' } };
export const TypeSubmit: Story = { args: { type: 'submit', label: 'Sign in' } };

/* notable states */
export const Disabled: Story = { args: { disabled: true } };

export const Loading: Story = { args: { loading: true, label: 'Saving' } };

export const LoadingIconOnly: Story = {
  args: { loading: true, iconOnly: true, label: 'Close', emphasis: 'ghost', leadingIcon: <Icon name="close" inline /> },
};

export const WithIcons: Story = {
  args: {
    label: 'Add item',
    leadingIcon: <Icon name="plus" inline />,
    trailingIcon: <Icon name="chevron-right" inline />,
  },
};

export const IconOnly: Story = {
  args: {
    iconOnly: true,
    label: 'Close',
    emphasis: 'ghost',
    leadingIcon: <Icon name="close" inline />,
  },
};

export const Expanded: Story = {
  args: {
    label: 'Actions',
    emphasis: 'secondary',
    expanded: true,
    trailingIcon: <Icon name="chevron-down" inline />,
  },
};

export const Inverse: Story = {
  args: { emphasis: 'ghost', inverse: true, label: 'Undo' },
  parameters: { backgrounds: { default: 'dark' } },
  decorators: [
    (Story) => (
      <div style={{ background: 'var(--color-inverse-surface)', padding: 'var(--space-lg)' }}>
        <Story />
      </div>
    ),
  ],
};

export const Tracked: Story = { args: { track: 'signup', label: 'Sign up' } };

/* examples from the doc */

/** The single most important action in a view, labelled with the outcome. */
export const PrimarySave: Story = { args: { label: 'Save changes', emphasis: 'primary' } };

/** A destructive, hard-to-undo action, which is the only use of the danger emphasis. */
export const DestructiveConfirm: Story = { args: { label: 'Delete file', emphasis: 'danger' } };

/** A low-emphasis icon-only control in dense UI, whose label says what it does rather than what the icon depicts. */
export const IconOnlyInAToolbar: Story = {
  args: {
    label: 'Close',
    iconOnly: true,
    leadingIcon: <Icon name="close" inline />,
    emphasis: 'ghost',
    size: 'sm',
  },
};

/** The submit button of a form while the request is in flight - busy, and ignoring repeat activation. */
export const PendingSubmit: Story = { args: { label: 'Create account', type: 'submit', loading: true } };
