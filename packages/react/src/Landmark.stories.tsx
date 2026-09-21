import type { Meta, StoryObj } from '@storybook/react-vite';
import { Landmark } from './Landmark';
import { Heading } from './Heading';
import { Text } from './Text';
import { Stack } from './Stack';

const meta: Meta<typeof Landmark> = {
  title: 'Landmark/React',
  component: Landmark,
  tags: ['autodocs'],
  args: {
    role: 'navigation',
    label: 'Main',
    children: <Text>Primary links.</Text>,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/*
 * role — banner, main, contentinfo, complementary and search carry no label here, so no story
 * models a label on a role that refuses it or trips the missing-label warning by accident.
 */
export const RoleBanner: Story = {
  args: { role: 'banner', label: undefined, children: <Text>Site header</Text> },
};
export const RoleNavigation: Story = { args: { role: 'navigation', label: 'Main' } };
export const RoleMain: Story = {
  args: { role: 'main', label: undefined, children: <Text>Page content</Text> },
};
export const RoleComplementary: Story = {
  args: { role: 'complementary', label: undefined, children: <Text>Sidebar content</Text> },
};
export const RoleContentinfo: Story = {
  args: { role: 'contentinfo', label: undefined, children: <Text>Site footer</Text> },
};
export const RoleRegion: Story = {
  args: { role: 'region', label: 'Related articles', children: <Text>Section content</Text> },
};
export const RoleSearch: Story = {
  args: { role: 'search', label: undefined, children: <Text>Search form</Text> },
};
export const RoleForm: Story = { args: { role: 'form', label: 'Sign in', children: <Text>Form fields</Text> } };

/* as — each element with the role it belongs to, the way the override is meant to be used. */
export const AsHeader: Story = { args: { role: 'banner', label: undefined, as: 'header' } };
export const AsNav: Story = { args: { role: 'navigation', label: 'Footer', as: 'nav' } };
export const AsMain: Story = { args: { role: 'main', label: undefined, as: 'main' } };
export const AsAside: Story = { args: { role: 'complementary', label: undefined, as: 'aside' } };
export const AsFooter: Story = { args: { role: 'contentinfo', label: undefined, as: 'footer' } };
export const AsSection: Story = { args: { role: 'region', label: 'Related articles', as: 'section' } };
export const AsForm: Story = { args: { role: 'search', label: undefined, as: 'form' } };
export const AsDiv: Story = { args: { role: 'banner', label: undefined, as: 'div' } };

/* examples */
export const PageMain: Story = {
  args: { role: 'main', label: undefined, children: <Text>The page content.</Text> },
};
export const FooterNavigation: Story = {
  args: { role: 'navigation', label: 'Footer', children: <Text>Footer links.</Text> },
};
export const RelatedArticlesRegion: Story = {
  args: { role: 'region', label: 'Related articles', children: <Text>A list of related articles.</Text> },
};
export const BannerThatIsNotThePageHeader: Story = {
  args: { role: 'banner', label: undefined, as: 'div', children: <Text>The product banner.</Text> },
};

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
          <Text>Footer navigation</Text>
        </Landmark>
      </Landmark>
    </Stack>
  ),
};
