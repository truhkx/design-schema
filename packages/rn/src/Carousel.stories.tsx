import type { Meta, StoryObj } from '@storybook/react-vite';
import { Carousel, CarouselSlide } from './Carousel';
import { Card } from './Card';
import { Text } from './Text';
import { withTheme } from './decorators';

/** `CarouselSlide`s labelled `labels`, each a Card whose heading repeats the label. */
function cardSlides(labels: string[]): React.JSX.Element[] {
  return labels.map((label) => (
    <CarouselSlide key={label} label={label}>
      <Card heading={label} headingLevel={3}>
        <Text>{label}</Text>
      </Card>
    </CarouselSlide>
  ));
}

const productSlides = cardSlides(['Product 1', 'Product 2', 'Product 3', 'Product 4']);

const meta: Meta<typeof Carousel> = {
  title: 'Carousel/React Native',
  component: Carousel,
  decorators: [withTheme()],
  args: {
    label: 'Featured products',
    children: productSlides,
  },
};

export default meta;

type Story = StoryObj<typeof Carousel>;

export const Default: Story = {};

// picker
export const PickerDots: Story = { args: { picker: 'dots' } };
export const PickerTabs: Story = { args: { picker: 'tabs' } };
export const PickerNone: Story = { args: { picker: 'none' } };

// notable states
export const Loop: Story = { args: { loop: true } };
export const PerViewTwo: Story = { args: { perView: 2 } };
export const Autoplay: Story = { args: { autoplay: true } };
export const Controlled: Story = { args: { activeIndex: 2 } };
export const NoSnap: Story = { args: { snap: false } };
export const WithOverrides: Story = { args: { overrides: { radius: 'radius.sm', slideGap: 'layout.gap.loose' } } };

// examples
export const FeaturedProducts: Story = { args: { label: 'Featured products', children: productSlides } };

export const NamedSlidesWithTabs: Story = {
  args: { label: 'Plans', picker: 'tabs', children: cardSlides(['Starter', 'Team', 'Enterprise']) },
};

export const AmbientHero: Story = {
  args: {
    label: 'Customer stories',
    autoplay: true,
    interval: 8000,
    loop: true,
    children: cardSlides(['Story 1', 'Story 2', 'Story 3']),
  },
};

export const ThreeUpGallery: Story = {
  args: {
    label: 'Gallery',
    perView: 3,
    picker: 'none',
    children: cardSlides(['Image 1', 'Image 2', 'Image 3', 'Image 4', 'Image 5', 'Image 6']),
  },
};

/**
 * The Default slides with a tabs picker, for the axe gate and manual keyboard checks on
 * react-native-web: previous, next, the four tabs and the track are the focusable children.
 */
export const Keyboard: Story = { args: { picker: 'tabs' } };
