import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Popover.js';
import './Box.js';
import './Button.js';
import './Checkbox.js';
import './Form.js';
import './Icon.js';
import './Input.js';
import './Link.js';
import './Stack.js';
import './Switch.js';
import './Text.js';
import type { DsPopover, PopoverHeadingLevel, PopoverOpenChangeDetail, PopoverPlacement } from './Popover.js';

interface PopoverArgs {
  /** Example description of the trigger; the render supplies the element. */
  trigger?: string | undefined;
  /** Example description of the panel content; the render supplies the elements. */
  children?: string | undefined;
  heading?: string | undefined;
  headingLevel?: PopoverHeadingLevel | undefined;
  placement?: PopoverPlacement | undefined;
  modal?: boolean | undefined;
  showArrow?: boolean | undefined;
  dismissible?: boolean | undefined;
  open?: boolean | undefined;
}

/**
 * Acts as the consumer: the story owns `open` and writes `open-change` back into it, so the
 * popover still closes and reopens. Every story but the examples renders through it, starting
 * open; the examples render the popover itself, closed and uncontrolled, as a page first shows it.
 */
function followOpenChange(event: CustomEvent<PopoverOpenChangeDetail>): void {
  (event.currentTarget as DsPopover).open = event.detail.open;
}

/** The filter-panel example's body: a Form of filter controls with Apply in its `actions`. */
const filterForm = html`
  <ds-form label="Filters" name="filters">
    <ds-stack gap="normal">
      <ds-switch label="Only open items" name="openOnly"></ds-switch>
      <ds-switch label="Assigned to me" name="mine"></ds-switch>
    </ds-stack>
    <ds-button slot="actions" type="submit" variant="primary" size="sm" label="Apply"></ds-button>
  </ds-form>
`;

const meta: Meta<PopoverArgs> = {
  title: 'Popover/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['open-change'] },
  },
  args: {
    trigger: 'A Filters Button',
    children: "A Form of filter controls with an Apply Button in the Form's `actions`",
    heading: 'Filters',
    headingLevel: '3',
    placement: 'bottom-start',
    modal: false,
    showArrow: false,
    dismissible: true,
  },
  argTypes: {
    trigger: { control: false },
    children: { control: false },
    headingLevel: { control: 'inline-radio', options: ['2', '3', '4'] },
    placement: {
      control: 'select',
      options: ['bottom-start', 'bottom', 'bottom-end', 'top-start', 'top', 'top-end', 'start', 'end'],
    },
    modal: { control: 'boolean' },
    showArrow: { control: 'boolean' },
    dismissible: { control: 'boolean' },
    open: { control: 'boolean' },
  },
  render: (args) => html`
    <ds-popover
      heading=${ifDefined(args.heading)}
      heading-level=${args.headingLevel ?? '3'}
      placement=${args.placement ?? 'bottom'}
      ?modal=${args.modal ?? false}
      ?show-arrow=${args.showArrow ?? false}
      ?no-dismiss=${args.dismissible === false}
      ?open=${args.open ?? true}
      @open-change=${followOpenChange}
    >
      <ds-button slot="trigger" variant="secondary" label="Filters"></ds-button>
      ${filterForm}
    </ds-popover>
  `,
};

export default meta;
type Story = StoryObj<PopoverArgs>;

/** Open, with the filter-panel example's args, so the derived scenarios find the named panel. */
export const Default: Story = { args: { open: true } };

/* headingLevel */
export const HeadingLevel2: Story = { args: { headingLevel: '2' } };
export const HeadingLevel3: Story = { args: { headingLevel: '3' } };
export const HeadingLevel4: Story = { args: { headingLevel: '4' } };

/* placement */
export const PlacementBottomStart: Story = { args: { placement: 'bottom-start' } };
export const PlacementBottom: Story = { args: { placement: 'bottom' } };
export const PlacementBottomEnd: Story = { args: { placement: 'bottom-end' } };
export const PlacementTopStart: Story = { args: { placement: 'top-start' } };
export const PlacementTop: Story = { args: { placement: 'top' } };
export const PlacementTopEnd: Story = { args: { placement: 'top-end' } };
export const PlacementStart: Story = { args: { placement: 'start' } };
export const PlacementEnd: Story = { args: { placement: 'end' } };

/* notable states */
export const NotDismissible: Story = { args: { dismissible: false } };
export const WithArrow: Story = { args: { showArrow: true } };
export const Modal: Story = { args: { modal: true } };

/*
 * Examples. Each one starts from blank args rather than Default's or meta's: every prop the example
 * does not give is written out at its own default, so the four render closed and uncontrolled.
 */
export const FilterPanel: Story = {
  args: {
    trigger: 'A Filters Button',
    children: "A Form of filter controls with an Apply Button in the Form's `actions`",
    heading: 'Filters',
    headingLevel: '3',
    placement: 'bottom-start',
    modal: false,
    showArrow: false,
    dismissible: true,
    open: undefined,
  },
  render: (args) => html`
    <ds-popover
      heading=${ifDefined(args.heading)}
      heading-level=${args.headingLevel ?? '3'}
      placement=${args.placement ?? 'bottom'}
      ?modal=${args.modal ?? false}
      ?show-arrow=${args.showArrow ?? false}
      ?no-dismiss=${args.dismissible === false}
    >
      <ds-button slot="trigger" variant="secondary" label="Filters"></ds-button>
      ${filterForm}
    </ds-popover>
  `,
};

export const DatePickerPanel: Story = {
  args: {
    trigger: 'A date field Button with the calendar Icon showing a fixed literal date label',
    children: 'Three quick-pick date Buttons: Today, Tomorrow, Next week',
    heading: undefined,
    headingLevel: '3',
    placement: 'bottom',
    modal: false,
    showArrow: false,
    dismissible: true,
    open: undefined,
  },
  render: (args) => html`
    <ds-popover
      heading=${ifDefined(args.heading)}
      heading-level=${args.headingLevel ?? '3'}
      placement=${args.placement ?? 'bottom'}
      ?modal=${args.modal ?? false}
      ?show-arrow=${args.showArrow ?? false}
      ?no-dismiss=${args.dismissible === false}
    >
      <ds-button slot="trigger" variant="secondary" label="16 September 2026">
        <ds-icon slot="leading-icon" name="calendar"></ds-icon>
      </ds-button>
      <ds-stack gap="tight">
        <ds-button variant="ghost" size="sm" label="Today"></ds-button>
        <ds-button variant="ghost" size="sm" label="Tomorrow"></ds-button>
        <ds-button variant="ghost" size="sm" label="Next week"></ds-button>
      </ds-stack>
    </ds-popover>
  `,
};

export const RequiredStep: Story = {
  args: {
    trigger: 'An Add member Button',
    children: "A Form with an email Input and a Save Button in the Form's `actions`",
    heading: 'Add member',
    headingLevel: '3',
    placement: 'bottom',
    modal: true,
    showArrow: false,
    dismissible: true,
    open: undefined,
  },
  render: (args) => html`
    <ds-popover
      heading=${ifDefined(args.heading)}
      heading-level=${args.headingLevel ?? '3'}
      placement=${args.placement ?? 'bottom'}
      ?modal=${args.modal ?? false}
      ?show-arrow=${args.showArrow ?? false}
      ?no-dismiss=${args.dismissible === false}
    >
      <ds-button slot="trigger" variant="secondary" label="Add member"></ds-button>
      <ds-form label="Add member" name="add-member">
        <ds-input label="Email" name="email" type="email" required></ds-input>
        <ds-button slot="actions" type="submit" variant="primary" size="sm" label="Save"></ds-button>
      </ds-form>
    </ds-popover>
  `,
};

export const ContextualHelp: Story = {
  args: {
    trigger: 'An icon-only Button labelled "Help" with the info Icon',
    children: 'One sentence of help ending in a Link to the guide',
    heading: undefined,
    headingLevel: '3',
    placement: 'end',
    modal: false,
    showArrow: true,
    dismissible: true,
    open: undefined,
  },
  render: (args) => html`
    <ds-popover
      heading=${ifDefined(args.heading)}
      heading-level=${args.headingLevel ?? '3'}
      placement=${args.placement ?? 'bottom'}
      ?modal=${args.modal ?? false}
      ?show-arrow=${args.showArrow ?? false}
      ?no-dismiss=${args.dismissible === false}
    >
      <ds-button slot="trigger" variant="ghost" icon-only label="Help">
        <ds-icon slot="leading-icon" name="info"></ds-icon>
      </ds-button>
      <ds-text size="sm">
        Filters apply to every view in this project. <ds-link href="#" label="Read the guide"></ds-link>
      </ds-text>
    </ds-popover>
  `,
};

/** Open with its trigger and three focusable body children, for the keyboard gate. */
export const Keyboard: Story = {
  args: { open: true, modal: false },
  render: (args) => html`
    <ds-popover
      heading=${ifDefined(args.heading)}
      heading-level=${args.headingLevel ?? '3'}
      placement=${args.placement ?? 'bottom'}
      ?modal=${args.modal ?? false}
      ?show-arrow=${args.showArrow ?? false}
      ?no-dismiss=${args.dismissible === false}
      ?open=${args.open ?? true}
      @open-change=${followOpenChange}
    >
      <ds-button slot="trigger" variant="secondary" label="Filters"></ds-button>
      <ds-stack gap="normal">
        <ds-button variant="secondary" size="sm" label="7 days"></ds-button>
        <ds-button variant="secondary" size="sm" label="30 days"></ds-button>
        <ds-button variant="secondary" size="sm" label="90 days"></ds-button>
      </ds-stack>
    </ds-popover>
  `,
};
