import * as React from 'react';
import { View } from 'react-native';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box } from './Box';
import { Text } from './Text';
import { withTheme } from './decorators';
import { useTheme } from './theme';

const meta: Meta<typeof Text> = {
  title: 'Text/React Native',
  component: Text,
  decorators: [withTheme()],
  args: {
    size: 'md',
    weight: 'regular',
    tone: 'default',
    align: 'start',
    truncate: false,
    children: 'Use the email you signed up with. We will send a verification code to it.',
  },
};

export default meta;

type Story = StoryObj<typeof Text>;

export const Default: Story = {};

// size
export const SizeXs: Story = { args: { size: 'xs' } };
export const SizeSm: Story = { args: { size: 'sm' } };
export const SizeMd: Story = { args: { size: 'md' } };
export const SizeLg: Story = { args: { size: 'lg' } };
export const SizeXl: Story = { args: { size: 'xl' } };

// weight
export const WeightRegular: Story = { args: { weight: 'regular' } };
export const WeightMedium: Story = { args: { weight: 'medium' } };
export const WeightSemibold: Story = { args: { weight: 'semibold' } };
export const WeightBold: Story = { args: { weight: 'bold' } };

// tone
export const ToneDefault: Story = { args: { tone: 'default' } };
export const ToneStrong: Story = { args: { tone: 'strong' } };
export const ToneMuted: Story = { args: { tone: 'muted' } };
export const ToneDanger: Story = { args: { tone: 'danger', children: 'Error: enter an email address like name@example.com' } };

/**
 * `onAction` is only valid on an action background, so the story paints
 * `color.action.primary.background` on a wrapper holding a Box with `inset: md` around the Text.
 */
function OnActionSurface(props: React.ComponentProps<typeof Text>): React.JSX.Element {
  const { tokens } = useTheme();
  return (
    <View style={{ backgroundColor: tokens.colorActionPrimaryBackground }}>
      <Box inset="md">
        <Text {...props} />
      </Box>
    </View>
  );
}

/** Story scaffolding, not a binding: a fixed column for truncation to clip against (web and Lit use `24ch`). */
function NarrowColumn(props: React.ComponentProps<typeof Text>): React.JSX.Element {
  return (
    <View style={{ width: 200 /* literal-ok: story scaffolding width for truncate to clip against */ }}>
      <Text {...props} />
    </View>
  );
}
export const ToneOnAction: Story = {
  args: { tone: 'onAction', children: 'Save changes' },
  render: (args) => <OnActionSurface {...args} />,
};

// align
export const AlignStart: Story = { args: { align: 'start' } };
export const AlignCenter: Story = { args: { align: 'center' } };
export const AlignEnd: Story = { args: { align: 'end' } };

// examples
/** The default paragraph — body size, regular weight, default tone. */
export const BodyCopy: Story = {
  args: { children: 'Changes are saved automatically. You can undo any change for 30 days.' },
};

/** Secondary metadata at the smallest readable size, muted so it sits behind the content it annotates. */
export const Caption: Story = {
  args: { children: 'Last updated 2 minutes ago.', size: 'xs', tone: 'muted' },
};

/** One line of text in a dense cell. Native has no `title` equivalent, so only screen readers reach the rest. */
export const TruncatedCell: Story = {
  args: { children: 'Quarterly revenue summary for the EMEA region.', truncate: true },
  render: (args) => <NarrowColumn {...args} />,
};
