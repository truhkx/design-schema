import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, type TemplateResult } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Carousel.js';
import './Card.js';
import type { CarouselPicker } from './Carousel.js';

interface CarouselArgs {
  label: string;
  perView: number;
  loop: boolean;
  autoplay: boolean;
  interval: number;
  picker: CarouselPicker;
  activeIndex?: number | undefined;
  snap: boolean;
}

/**
 * One `<ds-carousel-slide>` per name, each a Card whose heading repeats the label.
 * A fragment, interpolated *into* each story's own `html` template — every render below is written
 * inline and returns one template, so the docs site can read the Lit code sample out of it.
 */
const slides = (names: string[], body: (name: string) => string): TemplateResult[] =>
  names.map(
    (name) => html`
      <ds-carousel-slide label=${name}>
        <ds-card heading=${name} heading-level="3">${body(name)}</ds-card>
      </ds-carousel-slide>
    `,
  );

const meta: Meta<CarouselArgs> = {
  title: 'Carousel/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['change'] },
  },
  argTypes: {
    picker: { control: 'select', options: ['dots', 'tabs', 'none'] },
    perView: { control: 'number' },
    interval: { control: 'number' },
    activeIndex: { control: 'number' },
    loop: { control: 'boolean' },
    autoplay: { control: 'boolean' },
    snap: { control: 'boolean' },
  },
  args: {
    label: 'Featured products',
    perView: 1,
    loop: false,
    autoplay: false,
    interval: 6000,
    picker: 'dots',
    snap: true,
  },
  render: (args) => html`
    <ds-carousel
      label=${args.label}
      per-view=${args.perView}
      interval=${args.interval}
      picker=${args.picker}
      active-index=${ifDefined(args.activeIndex)}
      ?loop=${args.loop}
      ?autoplay=${args.autoplay}
      ?no-snap=${!args.snap}
    >
      ${slides(['Product 1', 'Product 2', 'Product 3', 'Product 4'], () => 'A product worth a closer look.')}
    </ds-carousel>
  `,
};

export default meta;
type Story = StoryObj<CarouselArgs>;

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
export const FeaturedProducts: Story = { args: { label: 'Featured products' } };

export const NamedSlidesWithTabs: Story = {
  args: { label: 'Plans', picker: 'tabs' },
  render: (args) => html`
    <ds-carousel
      label=${args.label}
      per-view=${args.perView}
      interval=${args.interval}
      picker=${args.picker}
      active-index=${ifDefined(args.activeIndex)}
      ?loop=${args.loop}
      ?autoplay=${args.autoplay}
      ?no-snap=${!args.snap}
    >
      ${slides(['Starter', 'Team', 'Enterprise'], (name) => `What the ${name} plan includes.`)}
    </ds-carousel>
  `,
};

export const AmbientHero: Story = {
  args: { label: 'Customer stories', autoplay: true, interval: 8000, loop: true },
  render: (args) => html`
    <ds-carousel
      label=${args.label}
      per-view=${args.perView}
      interval=${args.interval}
      picker=${args.picker}
      active-index=${ifDefined(args.activeIndex)}
      ?loop=${args.loop}
      ?autoplay=${args.autoplay}
      ?no-snap=${!args.snap}
    >
      ${slides(['Story 1', 'Story 2', 'Story 3'], () => 'Stands in for a photograph.')}
    </ds-carousel>
  `,
};

export const ThreeUpGallery: Story = {
  args: { label: 'Gallery', perView: 3, picker: 'none' },
  render: (args) => html`
    <ds-carousel
      label=${args.label}
      per-view=${args.perView}
      interval=${args.interval}
      picker=${args.picker}
      active-index=${ifDefined(args.activeIndex)}
      ?loop=${args.loop}
      ?autoplay=${args.autoplay}
      ?no-snap=${!args.snap}
    >
      ${slides(['Image 1', 'Image 2', 'Image 3', 'Image 4', 'Image 5', 'Image 6'], () => 'Stands in for an image.')}
    </ds-carousel>
  `,
};

/** Present with its controls: previous, next and four picker tabs are focusable. */
export const Keyboard: Story = { args: { picker: 'tabs' } };
