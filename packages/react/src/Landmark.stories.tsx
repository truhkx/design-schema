import type { Meta, StoryObj } from '@storybook/react-vite';
import { Landmark } from './Landmark';
import { Heading } from './Heading';
import { Text } from './Text';
import { Stack } from './Stack';

const meta: Meta<typeof Landmark> = {
  title: 'Landmark/React',
  component: Landmark,
  args: {
    role: 'region',
    label: 'Related articles',
    children: <Text>Content of the region.</Text>,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* role */
export const RoleBanner: Story = { args: { role: 'banner', label: undefined, children: <Text weight="semibold">Site header</Text> } };
export const RoleNavigation: Story = { args: { role: 'navigation', label: 'Main', children: <Text>Navigation links</Text> } };
export const RoleMain: Story = {
  args: { role: 'main', label: undefined, children: <Heading level="1">Page title</Heading> },
};
export const RoleComplementary: Story = {
  args: { role: 'complementary', label: 'Sidebar', children: <Text>Sidebar content</Text> },
};
export const RoleContentinfo: Story = { args: { role: 'contentinfo', label: undefined, children: <Text size="sm">Site footer</Text> } };
export const RoleRegion: Story = { args: { role: 'region', label: 'Related articles' } };
export const RoleSearch: Story = { args: { role: 'search', label: 'Site', children: <Text>Search form</Text> } };
export const RoleForm: Story = { args: { role: 'form', label: 'Feedback', children: <Text>Form fields</Text> } };

/* as */
export const AsHeader: Story = { args: { role: 'banner', as: 'header', label: undefined } };
export const AsNav: Story = { args: { role: 'navigation', as: 'nav', label: 'Footer' } };
export const AsMain: Story = { args: { role: 'main', as: 'main', label: undefined } };
export const AsAside: Story = { args: { role: 'complementary', as: 'aside', label: 'Sidebar' } };
export const AsFooter: Story = { args: { role: 'contentinfo', as: 'footer', label: undefined } };
export const AsSection: Story = { args: { role: 'region', as: 'section' } };
export const AsForm: Story = { args: { role: 'search', as: 'form', label: 'Site' } };
export const AsDiv: Story = { args: { role: 'banner', as: 'div', label: 'Promotion' } };

/* a page skeleton: one of each, with two labelled navigations. */
export const PageSkeleton: Story = {
  render: () => (
    <Stack gap="section">
      <Landmark role="banner">
        <Landmark role="navigation" label="Main">
          <Text>Main navigation</Text>
        </Landmark>
      </Landmark>
      <Landmark role="main">
        <Heading level="1">Notifications</Heading>
      </Landmark>
      <Landmark role="complementary" label="Help">
        <Text>Help panel</Text>
      </Landmark>
      <Landmark role="contentinfo">
        <Landmark role="navigation" label="Footer">
          <Text size="sm">Footer navigation</Text>
        </Landmark>
      </Landmark>
    </Stack>
  ),
};
