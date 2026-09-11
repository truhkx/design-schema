import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
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

interface SlideContent {
  heading: string;
  body: string;
}

const SLIDES: SlideContent[] = [
  { heading: 'Trail runner', body: 'Grippy sole, breathable mesh, built for wet rock.' },
  { heading: 'Everyday backpack', body: 'A padded laptop sleeve and one zip pocket for keys.' },
  { heading: 'Insulated bottle', body: 'Keeps cold drinks cold for a full day on the trail.' },
  { heading: 'Packable jacket', body: 'Folds into its own pocket; blocks wind, not rain.' },
];

const renderSlides = () =>
  SLIDES.map(
    (slide) => html`
      <ds-carousel-slide heading=${slide.heading}>
        <ds-card heading=${slide.heading} heading-level="3">${slide.body}</ds-card>
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
    activeIndex: undefined,
    snap: true,
  },
  render: (args) => html`
    <div style="max-inline-size: 32rem;">
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
        ${renderSlides()}
      </ds-carousel>
    </div>
  `,
};

export default meta;
type Story = StoryObj<CarouselArgs>;

export const Default: Story = {};

/* picker */
export const PickerDots: Story = { args: { picker: 'dots' } };
export const PickerTabs: Story = { args: { picker: 'tabs' } };
export const PickerNone: Story = { args: { picker: 'none' } };

export const Loop: Story = { args: { loop: true } };

export const PerViewThree: Story = { args: { perView: 3 } };

export const Autoplay: Story = { args: { autoplay: true, interval: 6000 } };

export const NoSnap: Story = { args: { snap: false } };

export const WithActiveIndex: Story = { args: { activeIndex: 2, picker: 'tabs' } };

/**
 * Renders with the picker present and at least three focusable dots/tabs
 * plus the previous/next controls, so the keyboard gate can verify arrow
 * navigation, wrapping, Home/End and Enter/Space activation.
 */
export const Keyboard: Story = { args: { picker: 'tabs', perView: 1 } };
