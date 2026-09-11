import type { Meta, StoryObj } from '@storybook/react-vite';
import { Carousel, CarouselSlide } from './Carousel';
import { Card } from './Card';

const meta: Meta<typeof Carousel> = {
  title: 'Carousel/React',
  component: Carousel,
  args: {
    label: 'Featured products',
    picker: 'dots',
    children: (
      <>
        <CarouselSlide label="Aria desk lamp">
          <Card heading="Aria desk lamp">A dimmable lamp with a warm-to-cool range.</Card>
        </CarouselSlide>
        <CarouselSlide label="Solstice mug">
          <Card heading="Solstice mug">Double-walled ceramic that holds its heat for hours.</Card>
        </CarouselSlide>
        <CarouselSlide label="Range planter">
          <Card heading="Range planter">Self-watering, fits a windowsill.</Card>
        </CarouselSlide>
      </>
    ),
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* picker */
export const PickerDots: Story = { args: { picker: 'dots' } };
export const PickerTabs: Story = { args: { picker: 'tabs' } };
export const PickerNone: Story = { args: { picker: 'none' } };

/* notable states */
export const Loop: Story = { args: { loop: true } };
export const Autoplay: Story = { args: { autoplay: true, interval: 6000 } };

/** Open/present with its controls and three focusable slides, for the keyboard gate. */
export const Keyboard: Story = {
  args: {
    picker: 'tabs',
    children: (
      <>
        <CarouselSlide label="First">
          <Card heading="First">One</Card>
        </CarouselSlide>
        <CarouselSlide label="Second">
          <Card heading="Second">Two</Card>
        </CarouselSlide>
        <CarouselSlide label="Third">
          <Card heading="Third">Three</Card>
        </CarouselSlide>
      </>
    ),
  },
};
