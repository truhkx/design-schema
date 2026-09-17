import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, type TemplateResult } from 'lit';
import './Button.js';
import './FocusScope.js';
import './Text.js';
import type { FocusScopeAutoFocus } from './FocusScope.js';

interface FocusScopeArgs {
  trapped: boolean;
  autoFocus: FocusScopeAutoFocus;
  restoreFocus: boolean;
  active: boolean;
  /** Example stories only: a description of the confined content, rendered as Text. */
  children?: string | undefined;
}

const scope = (args: FocusScopeArgs, content: TemplateResult): TemplateResult => html`
  <ds-focus-scope
    .trapped=${args.trapped}
    .autoFocus=${args.autoFocus}
    .restoreFocus=${args.restoreFocus}
    .active=${args.active}
  >
    ${content}
  </ds-focus-scope>
`;

const meta: Meta<FocusScopeArgs> = {
  title: 'FocusScope/Lit',
  tags: ['autodocs'],
  parameters: {
    actions: { handles: ['escape-attempt'] },
  },
  argTypes: {
    trapped: { control: 'boolean' },
    autoFocus: { control: 'select', options: ['first', 'last', 'container', 'none'] },
    restoreFocus: { control: 'boolean' },
    active: { control: 'boolean' },
  },
  args: {
    trapped: true,
    autoFocus: 'first',
    restoreFocus: true,
    active: true,
  },
  render: (args) =>
    scope(
      args,
      html`
        <ds-text>Confirm your changes</ds-text>
        <ds-button label="Cancel"></ds-button>
        <ds-button label="Continue"></ds-button>
      `,
    ),
};

export default meta;
type Story = StoryObj<FocusScopeArgs>;

export const Default: Story = {};

/* autoFocus */
export const AutoFocusFirst: Story = { args: { autoFocus: 'first' } };
export const AutoFocusLast: Story = { args: { autoFocus: 'last' } };
export const AutoFocusContainer: Story = { args: { autoFocus: 'container' } };
export const AutoFocusNone: Story = { args: { autoFocus: 'none' } };

/* boolean states */
/** A non-modal helper: focus moves in and restores on exit, but Tab is free to leave. */
export const TrappedFalse: Story = { args: { trapped: false } };
export const RestoreFocusFalse: Story = { args: { restoreFocus: false } };
export const ActiveFalse: Story = { args: { active: false } };

/** Present with three focusable descendants, for the keyboard gate to verify Tab wrapping both ways. */
export const Keyboard: Story = {
  args: { trapped: true, autoFocus: 'first' },
  render: (args) =>
    scope(
      args,
      html`
        <ds-button label="First"></ds-button>
        <ds-button label="Second"></ds-button>
        <ds-button label="Third"></ds-button>
      `,
    ),
};

/*
 * The examples' `children` are descriptions of content; each story renders that description
 * as Text and the controls it names beside it.
 */
export const ModalTakeover: Story = {
  args: {
    children: 'A full-screen onboarding overlay with its own close Button',
    trapped: true,
    autoFocus: 'first',
  },
  render: (args) =>
    scope(args, html`<ds-text>${args.children}</ds-text><ds-button label="Close"></ds-button>`),
};

export const NonModalDrawer: Story = {
  args: {
    children: 'A slide-in filter drawer',
    trapped: false,
    autoFocus: 'first',
  },
  render: (args) =>
    scope(args, html`<ds-text>${args.children}</ds-text><ds-button label="Apply filters"></ds-button>`),
};

export const ReadingFirst: Story = {
  args: {
    children: 'A long terms-of-service body with Accept and Decline Buttons',
    autoFocus: 'container',
  },
  render: (args) =>
    scope(
      args,
      html`
        <ds-text>${args.children}</ds-text>
        <ds-button label="Accept" variant="primary"></ds-button>
        <ds-button label="Decline"></ds-button>
      `,
    ),
};

export const PausedOuterScope: Story = {
  args: {
    children: 'A dialog body with a Menu open inside it',
    active: false,
  },
  render: (args) =>
    scope(args, html`<ds-text>${args.children}</ds-text><ds-button label="Options"></ds-button>`),
};
