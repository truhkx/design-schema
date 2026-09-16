import type { ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Carousel, CarouselSlide } from './Carousel';
import { Card } from './Card';

function slides(names: string[], body: (name: string) => string): ReactElement[] {
  return names.map((name) => (
    <CarouselSlide key={name} label={name}>
      <Card heading={name}>{body(name)}</Card>
    </CarouselSlide>
  ));
}

const meta: Meta<typeof Carousel> = {
  title: 'Carousel/React',
  component: Carousel,
  args: {
    label: 'Featured products',
    picker: 'dots',
    children: slides(['Aria desk lamp', 'Solstice mug', 'Range planter'], () => 'A product worth a closer look.'),
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

/* examples */
export const FeaturedProducts: Story = {
  args: {
    label: 'Featured products',
    children: slides(['Aria desk lamp', 'Solstice mug', 'Range planter', 'Ledger notebook'], () => 'A product card.'),
  },
};

export const NamedSlidesWithTabs: Story = {
  args: {
    label: 'Plans',
    picker: 'tabs',
    children: slides(['Starter', 'Team', 'Enterprise'], (name) => `What the ${name} plan includes.`),
  },
};

export const AmbientHero: Story = {
  args: {
    label: 'Customer stories',
    autoplay: true,
    interval: 8000,
    loop: true,
    children: slides(['Harbour at dawn', 'Studio floor', 'Night market'], () => 'A photograph.'),
  },
};

export const ThreeUpGallery: Story = {
  args: {
    label: 'Gallery',
    perView: 3,
    picker: 'none',
    children: slides(['One', 'Two', 'Three', 'Four', 'Five', 'Six'], (name) => `Image ${name}.`),
  },
};

/** Present with its controls: previous, next and the picker are three focusable children. */
export const Keyboard: Story = {
  args: { picker: 'tabs' },
};
