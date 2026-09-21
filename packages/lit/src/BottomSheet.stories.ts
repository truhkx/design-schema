import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, type TemplateResult } from 'lit';
import './BottomSheet.js';
import './Button.js';
import './Checkbox.js';
import './Input.js';
import './Link.js';
import './Stack.js';
import './Text.js';
import type { BottomSheetCloseDetail, BottomSheetHeight, DsBottomSheet } from './BottomSheet.js';

interface BottomSheetArgs {
  open: boolean;
  heading: string;
  hideHeading?: boolean | undefined;
  height?: BottomSheetHeight | undefined;
  dismissible?: boolean | undefined;
  dragToDismiss?: boolean | undefined;
  /** Examples only: a description of the body the story renders. */
  children?: string | undefined;
  /** Examples only: a description of the footer the story renders. */
  footer?: string | undefined;
}

/**
 * The consumer owns `open`: the story acts as one, closing the sheet on every close request.
 * A sheet that is not dismissible still reports Escape, and stays open until a footer action.
 */
function closeSheet(event: Event): void {
  const sheet = (event.currentTarget as HTMLElement).closest('ds-bottom-sheet') as DsBottomSheet | null;
  if (!sheet) {
    return;
  }
  const reason = (event as CustomEvent<BottomSheetCloseDetail>).detail?.reason;
  if (reason === 'escape' && !sheet.dismissible) {
    return;
  }
  sheet.open = false;
}

/** The trigger sits before the sheet, so focus has somewhere to return to on close. */
function openSheet(event: Event): void {
  const sheet = (event.currentTarget as HTMLElement).nextElementSibling as DsBottomSheet | null;
  if (sheet) {
    sheet.open = true;
  }
}

/** The default body: a few filter controls, interpolated into each story's own template. */
const filterControls: TemplateResult = html`
  <ds-stack gap="normal">
    <ds-text size="sm">Show items updated in the last:</ds-text>
    <ds-input label="Days" name="days" default-value="30"></ds-input>
    <ds-checkbox label="Open now" name="openNow"></ds-checkbox>
  </ds-stack>
`;

const meta: Meta<BottomSheetArgs> = {
  title: 'BottomSheet/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['close', 'drag-dismiss'] },
  },
  argTypes: {
    height: { control: 'select', options: ['content', 'half', 'full'] },
  },
  args: {
    open: true,
    heading: 'Filters',
    hideHeading: false,
    height: 'content',
    dismissible: true,
    dragToDismiss: true,
  },
  render: (args) => html`
    <ds-button label=${args.heading} @press=${openSheet}></ds-button>
    <ds-bottom-sheet
      ?open=${args.open}
      heading=${args.heading}
      ?hide-heading=${args.hideHeading ?? false}
      height=${args.height ?? 'content'}
      ?no-dismiss=${args.dismissible === false}
      ?no-drag-to-dismiss=${args.dragToDismiss === false}
      @close=${closeSheet}
    >
      ${filterControls}
      <ds-button slot="footer" variant="secondary" label="Clear" @press=${closeSheet}></ds-button>
      <ds-button slot="footer" variant="primary" label="Apply" @press=${closeSheet}></ds-button>
    </ds-bottom-sheet>
  `,
};

export default meta;
type Story = StoryObj<BottomSheetArgs>;

export const Default: Story = {};

/* height */
export const HeightContent: Story = { args: { height: 'content' } };
export const HeightHalf: Story = { args: { height: 'half' } };
export const HeightFull: Story = { args: { height: 'full' } };

/* notable states */
export const HideHeading: Story = { args: { hideHeading: true } };

export const NotDismissible: Story = {
  args: { dismissible: false },
  render: (args) => html`
    <ds-button label=${args.heading} @press=${openSheet}></ds-button>
    <ds-bottom-sheet
      ?open=${args.open}
      heading=${args.heading}
      ?hide-heading=${args.hideHeading ?? false}
      height=${args.height ?? 'content'}
      ?no-dismiss=${args.dismissible === false}
      ?no-drag-to-dismiss=${args.dragToDismiss === false}
      @close=${closeSheet}
    >
      <ds-text>Only the footer actions close this sheet; Escape still reports.</ds-text>
      <ds-button slot="footer" variant="primary" size="sm" label="Done" @press=${closeSheet}></ds-button>
    </ds-bottom-sheet>
  `,
};

export const DragToDismissOff: Story = { args: { dragToDismiss: false } };

/** Nothing left for the header to hold — no visible heading, no handle, no close button — so it is not rendered. */
export const HiddenHeadingNotDismissible: Story = {
  args: { hideHeading: true, dismissible: false },
  render: (args) => html`
    <ds-button label=${args.heading} @press=${openSheet}></ds-button>
    <ds-bottom-sheet
      ?open=${args.open}
      heading=${args.heading}
      ?hide-heading=${args.hideHeading ?? false}
      height=${args.height ?? 'content'}
      ?no-dismiss=${args.dismissible === false}
      ?no-drag-to-dismiss=${args.dragToDismiss === false}
      @close=${closeSheet}
    >
      ${filterControls}
      <ds-button slot="footer" variant="primary" size="sm" label="Done" @press=${closeSheet}></ds-button>
    </ds-bottom-sheet>
  `,
};

/* examples */

/** The phone presentation of a filter panel, with the action row pinned at the bottom. */
export const Filters: Story = {
  args: {
    open: true,
    heading: 'Filters',
    children: 'A Form of filter controls',
    footer: 'Clear and Apply Buttons',
  },
  render: (args) => html`
    <ds-button label=${args.heading} @press=${openSheet}></ds-button>
    <ds-bottom-sheet
      ?open=${args.open}
      heading=${args.heading}
      ?hide-heading=${args.hideHeading ?? false}
      height=${args.height ?? 'content'}
      ?no-dismiss=${args.dismissible === false}
      ?no-drag-to-dismiss=${args.dragToDismiss === false}
      @close=${closeSheet}
    >
      <ds-stack gap="normal">
        <ds-input label="Keyword" name="keyword"></ds-input>
        <ds-checkbox label="Open now" name="openNow"></ds-checkbox>
        <ds-checkbox label="Free parking" name="parking"></ds-checkbox>
      </ds-stack>
      <ds-button slot="footer" variant="secondary" label="Clear" @press=${closeSheet}></ds-button>
      <ds-button slot="footer" variant="primary" label="Apply" @press=${closeSheet}></ds-button>
    </ds-bottom-sheet>
  `,
};

/** A browsable list where seeing the page behind matters, so the sheet stops at half height. */
export const HalfHeightResults: Story = {
  args: {
    open: true,
    heading: 'Nearby places',
    children: 'A scrolling list of results',
    height: 'half',
  },
  render: (args) => html`
    <ds-button label=${args.heading} @press=${openSheet}></ds-button>
    <ds-bottom-sheet
      ?open=${args.open}
      heading=${args.heading}
      ?hide-heading=${args.hideHeading ?? false}
      height=${args.height ?? 'content'}
      ?no-dismiss=${args.dismissible === false}
      ?no-drag-to-dismiss=${args.dragToDismiss === false}
      @close=${closeSheet}
    >
      <ds-stack gap="normal">
        <ds-link href="#harbor" label="Harbor Coffee"></ds-link>
        <ds-link href="#lindon" label="Lindon Books"></ds-link>
        <ds-link href="#market" label="Market Hall"></ds-link>
        <ds-link href="#north" label="North Park"></ds-link>
        <ds-link href="#riverside" label="Riverside Deli"></ds-link>
        <ds-link href="#glasshouse" label="The Glasshouse"></ds-link>
        <ds-link href="#union" label="Union Station"></ds-link>
        <ds-link href="#west-end" label="West End Library"></ds-link>
      </ds-stack>
    </ds-bottom-sheet>
  `,
};

/** A self-explanatory body whose title exists only for assistive technology. */
export const ShareSheet: Story = {
  args: {
    open: true,
    heading: 'Share to',
    children: 'A row of share targets',
    hideHeading: true,
  },
  render: (args) => html`
    <ds-button label=${args.heading} @press=${openSheet}></ds-button>
    <ds-bottom-sheet
      ?open=${args.open}
      heading=${args.heading}
      ?hide-heading=${args.hideHeading ?? false}
      height=${args.height ?? 'content'}
      ?no-dismiss=${args.dismissible === false}
      ?no-drag-to-dismiss=${args.dragToDismiss === false}
      @close=${closeSheet}
    >
      <ds-stack direction="horizontal" gap="normal">
        <ds-button variant="secondary" label="Email" @press=${closeSheet}></ds-button>
        <ds-button variant="secondary" label="Messages" @press=${closeSheet}></ds-button>
        <ds-button variant="secondary" label="Copy link" @press=${closeSheet}></ds-button>
      </ds-stack>
    </ds-bottom-sheet>
  `,
};

/** A task that needs the whole screen but should still feel dismissable, with the gesture off. */
export const FullScreenTask: Story = {
  args: {
    open: true,
    heading: 'New expense',
    children: 'A Form of a few fields',
    footer: 'Cancel and Save Buttons',
    height: 'full',
    dragToDismiss: false,
  },
  render: (args) => html`
    <ds-button label=${args.heading} @press=${openSheet}></ds-button>
    <ds-bottom-sheet
      ?open=${args.open}
      heading=${args.heading}
      ?hide-heading=${args.hideHeading ?? false}
      height=${args.height ?? 'content'}
      ?no-dismiss=${args.dismissible === false}
      ?no-drag-to-dismiss=${args.dragToDismiss === false}
      @close=${closeSheet}
    >
      <ds-stack gap="normal">
        <ds-input label="Merchant" name="merchant"></ds-input>
        <ds-input label="Amount" name="amount" type="number"></ds-input>
        <ds-input label="Date" name="date" type="date"></ds-input>
      </ds-stack>
      <ds-button slot="footer" variant="secondary" label="Cancel" @press=${closeSheet}></ds-button>
      <ds-button slot="footer" variant="primary" label="Save" @press=${closeSheet}></ds-button>
    </ds-bottom-sheet>
  `,
};

/**
 * Open with its trigger and more than three focusable children (three body controls, the close
 * button and two footer actions), so the keyboard gate can check Escape and Tab / Shift+Tab wrapping.
 */
export const Keyboard: Story = {
  args: { open: true },
  render: (args) => html`
    <ds-button label=${args.heading} @press=${openSheet}></ds-button>
    <ds-bottom-sheet
      ?open=${args.open}
      heading=${args.heading}
      ?hide-heading=${args.hideHeading ?? false}
      height=${args.height ?? 'content'}
      ?no-dismiss=${args.dismissible === false}
      ?no-drag-to-dismiss=${args.dragToDismiss === false}
      @close=${closeSheet}
    >
      <ds-stack gap="normal">
        <ds-input label="Search term" name="search" default-value="roadmap"></ds-input>
        <ds-input label="Owner" name="owner" default-value="Anyone"></ds-input>
        <ds-input label="Days" name="days" default-value="30"></ds-input>
      </ds-stack>
      <ds-button slot="footer" variant="secondary" label="Clear" @press=${closeSheet}></ds-button>
      <ds-button slot="footer" variant="primary" label="Apply" @press=${closeSheet}></ds-button>
    </ds-bottom-sheet>
  `,
};
