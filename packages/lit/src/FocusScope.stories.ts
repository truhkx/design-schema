import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html, nothing, type TemplateResult } from 'lit';
import './FocusScope.js';
import type { FocusScopeAutoFocus } from './FocusScope.js';

interface FocusScopeArgs {
  trapped: boolean;
  autoFocus: FocusScopeAutoFocus;
  restoreFocus: boolean;
  active: boolean;
  /** Example stories only: a description of the confined content, rendered as its first line. */
  children?: string | undefined;
}

const renderScope = (args: FocusScopeArgs): TemplateResult => html`
  <ds-focus-scope
    .trapped=${args.trapped}
    .autoFocus=${args.autoFocus}
    .restoreFocus=${args.restoreFocus}
    .active=${args.active}
  >
    ${args.children ? html`<p>${args.children}</p>` : nothing}
    <button type="button">One</button>
    <button type="button">Two</button>
    <button type="button">Three</button>
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
  render: renderScope,
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
export const TrappedFalse: Story = { args: { trapped: false } };
export const ActiveFalse: Story = { args: { active: false } };
export const RestoreFocusFalse: Story = { args: { restoreFocus: false } };

/**
 * Renders trapped, present, with three focusable children so the keyboard
 * gate can verify Tab wraps last → first and Shift+Tab wraps first → last.
 */
export const Keyboard: Story = {
  args: { trapped: true, autoFocus: 'first' },
};

/* examples */
export const ModalTakeover: Story = {
  args: {
    children: 'A full-screen onboarding overlay with its own close Button',
    trapped: true,
    autoFocus: 'first',
  },
};

export const NonModalDrawer: Story = {
  args: {
    children: 'A slide-in filter drawer',
    trapped: false,
    autoFocus: 'first',
  },
};

export const ReadingFirst: Story = {
  args: {
    children: 'A long terms-of-service body with Accept and Decline Buttons',
    autoFocus: 'container',
  },
};

export const PausedOuterScope: Story = {
  args: {
    children: 'A dialog body with a Menu open inside it',
    active: false,
  },
};
