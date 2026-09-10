import type { Meta, StoryObj } from '@storybook/react';
import { Carousel, CarouselSlide } from './Carousel';
import { Button } from './Button';
import { Text } from './Text';
import { withTheme } from './decorators';

const meta: Meta<typeof Carousel> = {
  title: 'Carousel/React Native',
  component: Carousel,
  decorators: [withTheme()],
  args: {
    label: 'Featured products',
  },
};

export default meta;

type Story = StoryObj<typeof Carousel>;

export const Default: Story = {
  render: (args) => (
    <Carousel {...args}>
      <CarouselSlide heading="Desk lamp">
        <Text>A warm, dimmable desk lamp.</Text>
      </CarouselSlide>
      <CarouselSlide heading="Ceramic mug">
        <Text>Holds a full press of coffee.</Text>
      </CarouselSlide>
      <CarouselSlide heading="Wool blanket">
        <Text>Woven from recycled wool.</Text>
      </CarouselSlide>
      <CarouselSlide heading="Reading chair">
        <Text>A low, deep chair for long books.</Text>
      </CarouselSlide>
    </Carousel>
  ),
};

// picker
export const PickerDots: Story = { ...Default, args: { picker: 'dots' } };
export const PickerTabs: Story = { ...Default, args: { picker: 'tabs' } };
export const PickerNone: Story = { ...Default, args: { picker: 'none' } };

// notable states
export const Loop: Story = { ...Default, args: { loop: true } };
export const PerViewTwo: Story = { ...Default, args: { perView: 2 } };
export const Autoplay: Story = { ...Default, args: { autoplay: true, interval: 6000 } };

export const WithOverrides: Story = {
  ...Default,
  args: { overrides: { radius: 'radius.full', slideGap: 'space.6' } },
};

/** At least three focusable children (a Button in each slide), for the axe gate and manual keyboard checks on react-native-web. */
export const Keyboard: Story = {
  render: (args) => (
    <Carousel {...args}>
      <CarouselSlide heading="Desk lamp">
        <Text>A warm, dimmable desk lamp.</Text>
        <Button label="Add to cart" variant="secondary" />
      </CarouselSlide>
      <CarouselSlide heading="Ceramic mug">
        <Text>Holds a full press of coffee.</Text>
        <Button label="Add to cart" variant="secondary" />
      </CarouselSlide>
      <CarouselSlide heading="Wool blanket">
        <Text>Woven from recycled wool.</Text>
        <Button label="Add to cart" variant="secondary" />
      </CarouselSlide>
    </Carousel>
  ),
};
