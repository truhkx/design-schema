import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, type TemplateResult } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Popover.js';
import './Button.js';
import './Icon.js';
import './Input.js';
import './Checkbox.js';
import './Form.js';
import './Stack.js';
import './Text.js';
import './Link.js';
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
 * Stories that set `open` render through a wrapper that owns it: the story plays the
 * consumer and writes `open-change` back into `open`, so the popover still closes and reopens.
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
      heading-level=${ifDefined(args.headingLevel)}
      placement=${ifDefined(args.placement)}
      ?modal=${args.modal ?? false}
      ?show-arrow=${args.showArrow ?? false}
      .dismissible=${args.dismissible ?? true}
      .open=${args.open}
      @open-change=${ifDefined(followOpenChange(args))}
    >
      ${trigger}
      ${body}
    </ds-popover>
  `;
}

const filtersTrigger = html`<ds-button slot="trigger" variant="secondary" size="sm" label="Filters"></ds-button>`;

/** Three focusable children, for the keyboard gate. */
const filtersBody = html`
  <ds-form label="Filters" name="filters">
    <ds-stack gap="normal">
      <ds-checkbox label="Open issues" name="open-issues" default-checked></ds-checkbox>
      <ds-checkbox label="Assigned to me" name="assigned"></ds-checkbox>
    </ds-stack>
    <ds-button slot="actions" type="submit" variant="primary" size="sm" label="Apply"></ds-button>
  </ds-form>
`;

const filterPanelArgs: PopoverArgs = {
  trigger: 'A Filters Button',
  children: 'A Form of filter controls',
  heading: 'Filters',
  placement: 'bottom-start',
};

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
    modal: { control: 'boolean' },
    showArrow: { control: 'boolean' },
    dismissible: { control: 'boolean' },
    open: { control: 'boolean' },
  },
  render: (args) => popover(args, filtersTrigger, filtersBody),
};

export default meta;
type Story = StoryObj<PopoverArgs>;

/** Open, with the filter-panel example's args, so the derived scenarios find the named panel. */
export const Default: Story = { args: { ...filterPanelArgs, open: true } };

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

/* notable states */
export const Modal: Story = { args: { heading: 'Filters', modal: true, open: true } };
export const ShowArrow: Story = { args: { showArrow: true, open: true } };
export const NotDismissible: Story = { args: { dismissible: false, open: true } };
export const Uncontrolled: Story = { args: { heading: 'Filters' } };

/**
 * Open with its trigger and three focusable children, for the keyboard gate:
 * Escape, Tab past the last element (`args=modal:!false`), Shift+Tab from the first.
 */
export const Keyboard: Story = {
  args: { ...filterPanelArgs, open: true, modal: false },
};

/* examples */

export const FilterPanel: Story = {
  args: filterPanelArgs,
};

export const DatePickerPanel: Story = {
  args: {
    trigger: 'A date field Button with the calendar Icon showing the current date',
    children: 'Three quick-pick date Buttons: Today, Tomorrow, Next week',
  },
  render: (args) =>
    popover(
      args,
      html`<ds-button slot="trigger" variant="secondary" size="sm" label=${new Date().toLocaleDateString()}>
        <ds-icon slot="leading-icon" name="calendar"></ds-icon>
      </ds-button>`,
      html`
        <ds-stack gap="tight">
          <ds-button variant="ghost" size="sm" label="Today"></ds-button>
          <ds-button variant="ghost" size="sm" label="Tomorrow"></ds-button>
          <ds-button variant="ghost" size="sm" label="Next week"></ds-button>
        </ds-stack>
      `,
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
        <ds-form label="Add member" name="add-member">
          <ds-input label="Email" name="email" type="email" required></ds-input>
          <ds-button slot="actions" type="submit" variant="primary" size="sm" label="Save"></ds-button>
        </ds-form>
      `,
    ),
};

export const ContextualHelp: Story = {
  args: {
    trigger: 'An icon-only Button labelled "Help" with the info Icon',
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
