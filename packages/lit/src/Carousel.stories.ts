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

const slides = (names: string[], body: (name: string) => string): TemplateResult[] =>
  names.map(
    (name) => html`
      <ds-carousel-slide label=${name}>
        <ds-card heading=${name} heading-level="3">${body(name)}</ds-card>
      </ds-carousel-slide>
    `,
  );

const carousel = (args: CarouselArgs, children: TemplateResult[]): TemplateResult => html`
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
    ${children}
  </ds-carousel>
`;

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
  render: (args) =>
    carousel(args, slides(['Aria desk lamp', 'Solstice mug', 'Range planter'], () => 'A product worth a closer look.')),
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

/* examples */
export const FeaturedProducts: Story = {
  args: { label: 'Featured products' },
  render: (args) =>
    carousel(args, slides(['Aria desk lamp', 'Solstice mug', 'Range planter', 'Ledger notebook'], () => 'A product card.')),
};

export const NamedSlidesWithTabs: Story = {
  args: { label: 'Plans', picker: 'tabs' },
  render: (args) =>
    carousel(args, slides(['Starter', 'Team', 'Enterprise'], (name) => `What the ${name} plan includes.`)),
};

export const AmbientHero: Story = {
  args: { label: 'Customer stories', autoplay: true, interval: 8000, loop: true },
  render: (args) => carousel(args, slides(['Harbour at dawn', 'Studio floor', 'Night market'], () => 'A photograph.')),
};

export const ThreeUpGallery: Story = {
  args: { label: 'Gallery', perView: 3, picker: 'none' },
  render: (args) =>
    carousel(args, slides(['One', 'Two', 'Three', 'Four', 'Five', 'Six'], (name) => `Image ${name}.`)),
};

/** Present with its controls: previous, next and three picker tabs are focusable. */
export const Keyboard: Story = { args: { picker: 'tabs' } };
