import type { Meta, StoryObj } from '@storybook/react-vite';
import { Carousel, CarouselSlide } from './Carousel';
import { Box } from './Box';
import { Button } from './Button';
import { Card } from './Card';
import { Heading } from './Heading';
import { Text } from './Text';
import { withTheme } from './decorators';

const PRODUCTS = [
  { label: 'Desk lamp', body: 'A warm, dimmable desk lamp.' },
  { label: 'Ceramic mug', body: 'Holds a full press of coffee.' },
  { label: 'Wool blanket', body: 'Woven from recycled wool.' },
  { label: 'Reading chair', body: 'A low, deep chair for long books.' },
];

const productSlides = PRODUCTS.map((product) => (
  <CarouselSlide key={product.label} label={product.label}>
    <Card heading={product.label} headingLevel={3}>
      <Text>{product.body}</Text>
    </Card>
  </CarouselSlide>
));

/** A stand-in for a photograph or image: a strong surface with the slide's visible heading. */
function pictureSlides(labels: string[]): React.JSX.Element[] {
  return labels.map((label) => (
    <CarouselSlide key={label} label={label}>
      <Box surface="strong" inset="xl">
        <Heading level={3}>{label}</Heading>
      </Box>
    </CarouselSlide>
  ));
}

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
  args: {
    label: 'Plans',
    picker: 'tabs',
    children: ['Starter', 'Team', 'Enterprise'].map((plan) => (
      <CarouselSlide key={plan} label={plan}>
        <Card heading={plan} headingLevel={3}>
          <Text>Everything in the {plan} plan.</Text>
        </Card>
      </CarouselSlide>
    )),
  },
};

export const AmbientHero: Story = {
  args: {
    label: 'Customer stories',
    autoplay: true,
    interval: 8000,
    loop: true,
    children: pictureSlides(['Harbour at dawn', 'Workshop floor', 'Rooftop garden']),
  },
};

export const ThreeUpGallery: Story = {
  args: {
    label: 'Gallery',
    perView: 3,
    picker: 'none',
    children: pictureSlides(['Image 1', 'Image 2', 'Image 3', 'Image 4', 'Image 5', 'Image 6']),
  },
};

/** Controls plus a focusable Button in each slide, for the axe gate and manual keyboard checks on react-native-web. */
export const Keyboard: Story = {
  args: {
    autoplay: true,
    children: PRODUCTS.map((product) => (
      <CarouselSlide key={product.label} label={product.label}>
        <Card heading={product.label} headingLevel={3}>
          <Text>{product.body}</Text>
          <Button label="Add to cart" variant="secondary" />
        </Card>
      </CarouselSlide>
    )),
  },
};
