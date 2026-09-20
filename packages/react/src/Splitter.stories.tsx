import type { Meta, StoryObj } from '@storybook/react-vite';
import { Splitter } from './Splitter';
import { Stack } from './Stack';
import { Text } from './Text';
import { Link } from './Link';
import { Button } from './Button';

/* A standalone Link is an inline text box (18px tall) that declares no target binding, so the
   container owns its 24px target (WCAG 2.5.8) — the rule Breadcrumb.css and Form.css also state.
   gap=normal spaces the links 26px apart (tight's 4px left them 22px apart), and align=start sizes
   each one to its label instead of stretching it across the pane, where it would run under the
   collapse Button and shrink that button's safe clickable space. Both are needed for axe. */
const primaryContent = (
  <Stack element="nav" gap="normal" align="start">
    <Text element="p" weight="medium">
      Sections
    </Text>
    <Link href="#" label="Overview" />
    <Link href="#" label="Reports" />
    <Link href="#" label="Settings" />
  </Stack>
);

const secondaryContent = (
  <Stack gap="normal">
    <Text element="p" weight="medium">
      Overview
    </Text>
    <Text element="p">Select a section from the sidebar to see its detail here.</Text>
  </Stack>
);

const meta: Meta<typeof Splitter> = {
  title: 'Splitter/React',
  component: Splitter,
  tags: ['autodocs'],
  args: {
    label: 'Sidebar width',
    orientation: 'horizontal',
    primary: primaryContent,
    secondary: secondaryContent,
    defaultSize: 30,
    minSize: 10,
    maxSize: 90,
    step: 2,
    collapsible: false,
    stackBelow: 'prose',
  },
  // A vertical splitter needs a height to divide; the frame is a plain, non-focusable box.
  decorators: [
    (Story) => (
      <div style={{ blockSize: 'var(--layout-max-width-prose)' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* orientation */
export const OrientationHorizontal: Story = { args: { orientation: 'horizontal' } };
export const OrientationVertical: Story = {
  args: {
    orientation: 'vertical',
    label: 'Preview height',
    primary: <Text element="p">Editor</Text>,
    secondary: <Text element="p">Preview</Text>,
  },
};

/* stackBelow */
export const StackBelowProse: Story = { args: { stackBelow: 'prose' } };
export const StackBelowContent: Story = { args: { stackBelow: 'content' } };
export const StackBelowNever: Story = { args: { stackBelow: 'never' } };

/* notable states */
export const Collapsible: Story = { args: { collapsible: true } };
export const Collapsed: Story = { args: { collapsible: true, defaultCollapsed: true } };

/** Present with its separator, collapse Button and at least three focusable children, for the keyboard gate. */
export const Keyboard: Story = {
  args: {
    collapsible: true,
    // gap=normal + align=start for the same 24px target reason as primaryContent above.
    primary: (
      <Stack element="nav" gap="normal" align="start">
        <Link href="#" label="Overview" />
        <Link href="#" label="Reports" />
      </Stack>
    ),
    secondary: <Button label="Detail action" variant="secondary" size="sm" />,
  },
};

/* examples */
export const SidebarAndContent: Story = {
  args: {
    label: 'Sidebar width',
    primary: 'A navigation tree',
    secondary: 'The selected document',
    defaultSize: 25,
    persistKey: 'app-sidebar',
  },
};

export const CollapsibleNavigation: Story = {
  args: {
    label: 'Sidebar width',
    primary: 'A navigation tree',
    secondary: 'The selected document',
    collapsible: true,
    minSize: 15,
  },
};

export const EditorOverPreview: Story = {
  args: {
    label: 'Editor height',
    primary: 'The editor',
    secondary: 'The preview',
    orientation: 'vertical',
    defaultSize: 60,
  },
};

export const NeverStackingWorkbench: Story = {
  args: {
    label: 'List width',
    primary: 'The result list',
    secondary: 'The detail view',
    stackBelow: 'never',
    step: 5,
  },
};
