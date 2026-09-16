import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, type TemplateResult } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Popover.js';
import './Button.js';
import './Icon.js';
import './Input.js';
import './Checkbox.js';
import './Stack.js';
import './Text.js';
import './Link.js';
import './DatePicker.js';
import type { DsPopover, PopoverHeadingLevel, PopoverOpenChangeDetail, PopoverPlacement } from './Popover.js';

interface PopoverArgs {
  /** Example description of the trigger; the render supplies the element. */
  trigger?: string | undefined;
  /** Example description of the panel content; the render supplies the elements. */
  children?: string | undefined;
  heading?: string | undefined;
  headingLevel: PopoverHeadingLevel;
  placement: PopoverPlacement;
  modal: boolean;
  showArrow: boolean;
  dismissible: boolean;
  open?: boolean | undefined;
}

/**
 * Stories that set `open` are controlled: the story plays the consumer and writes
 * `open-change` back into `open`, so the popover still closes and reopens.
 */
function followOpenChange(args: PopoverArgs): ((event: CustomEvent<PopoverOpenChangeDetail>) => void) | undefined {
  if (args.open === undefined) {
    return undefined;
  }
  return (event) => {
    (event.currentTarget as DsPopover).open = event.detail.open;
  };
}

function popover(args: PopoverArgs, trigger: TemplateResult, body: TemplateResult): TemplateResult {
  return html`
    <ds-popover
      heading=${ifDefined(args.heading)}
      heading-level=${args.headingLevel}
      placement=${args.placement}
      ?modal=${args.modal}
      ?show-arrow=${args.showArrow}
      .dismissible=${args.dismissible}
      .open=${args.open}
      @open-change=${ifDefined(followOpenChange(args))}
    >
      ${trigger}
      ${body}
    </ds-popover>
  `;
}

const filtersTrigger = html`<ds-button slot="trigger" variant="secondary" size="sm" label="Filters"></ds-button>`;

const filtersBody = html`
  <ds-stack gap="normal">
    <ds-checkbox label="Open issues" name="open-issues" default-checked></ds-checkbox>
    <ds-checkbox label="Assigned to me" name="assigned"></ds-checkbox>
    <ds-button variant="primary" size="sm" label="Apply"></ds-button>
  </ds-stack>
`;

const meta: Meta<PopoverArgs> = {
  title: 'Popover/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['open-change'] },
  },
  argTypes: {
    placement: {
      control: 'select',
      options: ['bottom-start', 'bottom', 'bottom-end', 'top-start', 'top', 'top-end', 'start', 'end'],
    },
    headingLevel: {
      control: 'select',
      options: ['2', '3', '4'],
    },
  },
  args: {
    headingLevel: '3',
    placement: 'bottom',
    modal: false,
    showArrow: false,
    dismissible: true,
  },
  render: (args) => popover(args, filtersTrigger, filtersBody),
};

export default meta;
type Story = StoryObj<PopoverArgs>;

export const Default: Story = {};

/* headingLevel */
export const HeadingLevel2: Story = { args: { heading: 'Filters', headingLevel: '2', open: true } };
export const HeadingLevel3: Story = { args: { heading: 'Filters', headingLevel: '3', open: true } };
export const HeadingLevel4: Story = { args: { heading: 'Filters', headingLevel: '4', open: true } };

/* placement */
export const PlacementBottomStart: Story = { args: { placement: 'bottom-start', open: true } };
export const PlacementBottom: Story = { args: { placement: 'bottom', open: true } };
export const PlacementBottomEnd: Story = { args: { placement: 'bottom-end', open: true } };
export const PlacementTopStart: Story = { args: { placement: 'top-start', open: true } };
export const PlacementTop: Story = { args: { placement: 'top', open: true } };
export const PlacementTopEnd: Story = { args: { placement: 'top-end', open: true } };
export const PlacementStart: Story = { args: { placement: 'start', open: true } };
export const PlacementEnd: Story = { args: { placement: 'end', open: true } };

/* booleans */
export const Modal: Story = { args: { heading: 'Filters', modal: true, open: true } };
export const ShowArrow: Story = { args: { showArrow: true, open: true } };
export const NotDismissible: Story = { args: { dismissible: false, open: true } };

/**
 * Open with its trigger and three focusable children, for the keyboard gate:
 * Escape, Tab past the last element (`modal: false`), Shift+Tab from the first.
 */
export const Keyboard: Story = {
  args: { heading: 'Filters', open: true, modal: false },
};

/* examples */

export const FilterPanel: Story = {
  args: {
    trigger: 'A Filters Button',
    children: 'A Form of filter controls',
    heading: 'Filters',
    placement: 'bottom-start',
  },
  render: (args) => popover(args, filtersTrigger, filtersBody),
};

export const DatePickerPanel: Story = {
  args: {
    trigger: 'A date field Button showing the current date',
    children: 'A DatePicker calendar',
  },
  render: (args) =>
    popover(
      args,
      html`<ds-button slot="trigger" variant="secondary" size="sm" label=${new Date().toLocaleDateString()}>
        <ds-icon slot="leading-icon" name="calendar"></ds-icon>
      </ds-button>`,
      html`<ds-date-picker label="Date" name="date"></ds-date-picker>`,
    ),
};

export const RequiredStep: Story = {
  args: {
    trigger: 'An Add member Button',
    children: 'An email Input and a Save Button',
    heading: 'Add member',
    modal: true,
  },
  render: (args) =>
    popover(
      args,
      html`<ds-button slot="trigger" variant="secondary" size="sm" label="Add member"></ds-button>`,
      html`
        <ds-stack gap="normal">
          <ds-input label="Email" name="email" type="email" required></ds-input>
          <ds-button variant="primary" size="sm" label="Save"></ds-button>
        </ds-stack>
      `,
    ),
};

export const ContextualHelp: Story = {
  args: {
    trigger: 'An icon-only help Button',
    children: 'One sentence of help ending in a Link to the guide',
    showArrow: true,
    placement: 'end',
  },
  render: (args) =>
    popover(
      args,
      html`<ds-button slot="trigger" variant="ghost" size="sm" icon-only label="Help">
        <ds-icon slot="leading-icon" name="info"></ds-icon>
      </ds-button>`,
      html`<ds-text size="sm">Filters apply to every view in this project; <ds-link href="#" label="read the guide"></ds-link>.</ds-text>`,
    ),
};
