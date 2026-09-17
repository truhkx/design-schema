import type { ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Carousel, CarouselSlide } from './Carousel';
import { Card } from './Card';

/** One CarouselSlide per name, each a Card whose heading repeats the label. */
function slides(names: string[]): ReactElement[] {
  return names.map((name) => (
    <CarouselSlide key={name} label={name}>
      <Card heading={name}>{name}</Card>
    </CarouselSlide>
  ));
}

const meta: Meta<typeof Carousel> = {
  title: 'Carousel/React',
  component: Carousel,
  args: {
    label: 'Featured products',
    children: slides(['Product 1', 'Product 2', 'Product 3', 'Product 4']),
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
export const NoSnap: Story = { args: { snap: false } };
export const Controlled: Story = { args: { activeIndex: 1 } };
export const Autoplay: Story = { args: { autoplay: true } };

/* examples */
export const FeaturedProducts: Story = {
  args: {
    label: 'Featured products',
    children: slides(['Product 1', 'Product 2', 'Product 3', 'Product 4']),
  },
};

export const NamedSlidesWithTabs: Story = {
  args: {
    label: 'Plans',
    picker: 'tabs',
    children: slides(['Starter', 'Team', 'Enterprise']),
  },
};

export const AmbientHero: Story = {
  args: {
    label: 'Customer stories',
    autoplay: true,
    interval: 8000,
    loop: true,
    children: slides(['Story 1', 'Story 2', 'Story 3']),
  },
};

export const ThreeUpGallery: Story = {
  args: {
    label: 'Gallery',
    perView: 3,
    picker: 'none',
    children: slides(['Image 1', 'Image 2', 'Image 3', 'Image 4', 'Image 5', 'Image 6']),
  },
};

/** Present with its controls: previous, next and the picker are three focusable children. */
export const Keyboard: Story = {
  args: { picker: 'tabs' },
};
