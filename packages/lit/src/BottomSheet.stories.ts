import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, type TemplateResult } from 'lit';
import './BottomSheet.js';
import './Button.js';
import './Checkbox.js';
import './Input.js';
import './Link.js';
import './Stack.js';
import './Text.js';
import type { BottomSheetHeight, DsBottomSheet } from './BottomSheet.js';

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

/** The consumer owns `open`: every close request (and every footer action) closes the story's sheet. */
function closeSheet(event: Event): void {
  const sheet = (event.currentTarget as HTMLElement).closest('ds-bottom-sheet') as DsBottomSheet | null;
  if (sheet) {
    sheet.open = false;
  }
}

function openSheet(event: Event): void {
  const sheet = (event.currentTarget as HTMLElement).nextElementSibling as DsBottomSheet | null;
  if (sheet) {
    sheet.open = true;
  }
}

function renderSheet(args: BottomSheetArgs, body: TemplateResult, footer: TemplateResult | undefined): TemplateResult {
  return html`
    <ds-button label="Open sheet" @press=${openSheet}></ds-button>
    <ds-bottom-sheet
      ?open=${args.open}
      heading=${args.heading}
      ?hide-heading=${args.hideHeading ?? false}
      height=${args.height ?? 'content'}
      ?no-dismiss=${args.dismissible === false}
      ?no-drag-to-dismiss=${args.dragToDismiss === false}
      @close=${closeSheet}
    >
      ${body} ${footer ?? ''}
    </ds-bottom-sheet>
  `;
}

const filtersBody: TemplateResult = html`
  <ds-stack gap="normal">
    <ds-input label="Keyword" name="keyword"></ds-input>
    <ds-checkbox label="Open now" name="openNow"></ds-checkbox>
    <ds-checkbox label="Free parking" name="parking"></ds-checkbox>
  </ds-stack>
`;
const filtersFooter: TemplateResult = html`
  <ds-button slot="footer" variant="primary" label="Apply" @press=${closeSheet}></ds-button>
  <ds-button slot="footer" variant="secondary" label="Clear" @press=${closeSheet}></ds-button>
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
  render: (args) => renderSheet(args, filtersBody, filtersFooter),
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
export const NotDismissible: Story = { args: { dismissible: false } };
export const DragToDismissOff: Story = { args: { dragToDismiss: false } };
export const NoFooter: Story = {
  args: { heading: 'Details' },
  render: (args) =>
    renderSheet(args, html`<ds-text>Open daily from eight until late. Street parking nearby.</ds-text>`, undefined),
};

/* examples */
export const Filters: Story = {
  args: {
    open: true,
    heading: 'Filters',
    children: 'A Form of filter controls',
    footer: 'Clear and Apply Buttons',
  },
  render: (args) => renderSheet(args, filtersBody, filtersFooter),
};

export const HalfHeightResults: Story = {
  args: {
    open: true,
    heading: 'Nearby places',
    children: 'A scrolling list of results',
    height: 'half',
  },
  render: (args) =>
    renderSheet(
      args,
      html`
        <ds-stack gap="normal">
          ${['Harbor Coffee', 'Lindon Books', 'Market Hall', 'North Park', 'Riverside Deli', 'The Glasshouse', 'Union Station', 'West End Library'].map(
            (place) => html`<ds-link href="#" label=${place}></ds-link>`,
          )}
        </ds-stack>
      `,
      undefined,
    ),
};

export const ShareSheet: Story = {
  args: {
    open: true,
    heading: 'Share to',
    children: 'A row of share targets',
    hideHeading: true,
  },
  render: (args) =>
    renderSheet(
      args,
      html`
        <ds-stack direction="horizontal" gap="normal">
          <ds-button variant="secondary" label="Email" @press=${closeSheet}></ds-button>
          <ds-button variant="secondary" label="Messages" @press=${closeSheet}></ds-button>
          <ds-button variant="secondary" label="Copy link" @press=${closeSheet}></ds-button>
        </ds-stack>
      `,
      undefined,
    ),
};

export const FullScreenTask: Story = {
  args: {
    open: true,
    heading: 'New expense',
    children: 'A Form of a few fields',
    footer: 'Cancel and Save Buttons',
    height: 'full',
    dragToDismiss: false,
  },
  render: (args) =>
    renderSheet(
      args,
      html`
        <ds-stack gap="normal">
          <ds-input label="Merchant" name="merchant"></ds-input>
          <ds-input label="Amount" name="amount" type="number"></ds-input>
          <ds-input label="Date" name="date" type="date"></ds-input>
        </ds-stack>
      `,
      html`
        <ds-button slot="footer" variant="primary" label="Save" @press=${closeSheet}></ds-button>
        <ds-button slot="footer" variant="secondary" label="Cancel" @press=${closeSheet}></ds-button>
      `,
    ),
};

/**
 * Open with its trigger and at least three focusable children (the close button, the body's
 * controls and two footer buttons), so the keyboard gate can check Escape and Tab / Shift+Tab wrapping.
 */
export const Keyboard: Story = {
  render: (args) => renderSheet(args, filtersBody, filtersFooter),
};
