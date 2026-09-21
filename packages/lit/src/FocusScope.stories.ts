import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
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
  // The three booleans default to true, so each is bound through its negated attribute: present
  // means false, absent means true. That is the markup a consumer writes by hand, and it is what
  // the docs site quotes. A composing overlay binds the properties instead (`.active=${open}`).
  render: (args) => html`
    <ds-focus-scope
      ?no-trapped=${!args.trapped}
      auto-focus=${args.autoFocus}
      ?no-restore-focus=${!args.restoreFocus}
      ?no-active=${!args.active}
    >
      <ds-text>Confirm your changes</ds-text>
      <ds-button label="Cancel"></ds-button>
      <ds-button label="Continue"></ds-button>
    </ds-focus-scope>
  `,
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
  render: (args) => html`
    <ds-focus-scope
      ?no-trapped=${!args.trapped}
      auto-focus=${args.autoFocus}
      ?no-restore-focus=${!args.restoreFocus}
      ?no-active=${!args.active}
    >
      <ds-button label="First"></ds-button>
      <ds-button label="Second"></ds-button>
      <ds-button label="Third"></ds-button>
    </ds-focus-scope>
  `,
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
  render: (args) => html`
    <ds-focus-scope
      ?no-trapped=${!args.trapped}
      auto-focus=${args.autoFocus}
      ?no-restore-focus=${!args.restoreFocus}
      ?no-active=${!args.active}
    >
      <ds-text>${args.children}</ds-text>
      <ds-button label="Close"></ds-button>
    </ds-focus-scope>
  `,
};

export const NonModalDrawer: Story = {
  args: {
    children: 'A slide-in filter drawer',
    trapped: false,
    autoFocus: 'first',
  },
  render: (args) => html`
    <ds-focus-scope
      ?no-trapped=${!args.trapped}
      auto-focus=${args.autoFocus}
      ?no-restore-focus=${!args.restoreFocus}
      ?no-active=${!args.active}
    >
      <ds-text>${args.children}</ds-text>
      <ds-button label="Apply filters"></ds-button>
    </ds-focus-scope>
  `,
};

export const ReadingFirst: Story = {
  args: {
    children: 'A long terms-of-service body with Accept and Decline Buttons',
    autoFocus: 'container',
  },
  render: (args) => html`
    <ds-focus-scope
      ?no-trapped=${!args.trapped}
      auto-focus=${args.autoFocus}
      ?no-restore-focus=${!args.restoreFocus}
      ?no-active=${!args.active}
    >
      <ds-text>${args.children}</ds-text>
      <ds-button label="Accept" variant="primary"></ds-button>
      <ds-button label="Decline"></ds-button>
    </ds-focus-scope>
  `,
};

export const PausedOuterScope: Story = {
  args: {
    children: 'A dialog body with a Menu open inside it',
    active: false,
  },
  render: (args) => html`
    <ds-focus-scope
      ?no-trapped=${!args.trapped}
      auto-focus=${args.autoFocus}
      ?no-restore-focus=${!args.restoreFocus}
      ?no-active=${!args.active}
    >
      <ds-text>${args.children}</ds-text>
      <ds-button label="Options"></ds-button>
    </ds-focus-scope>
  `,
};
