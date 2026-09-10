import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './FocusScope.js';
import type { FocusScopeAutoFocus } from './FocusScope.js';

interface FocusScopeArgs {
  trapped: boolean;
  autoFocus: FocusScopeAutoFocus;
  restoreFocus: boolean;
  active: boolean;
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
  render: (args) => html`
    <ds-focus-scope
      ?trapped=${args.trapped}
      auto-focus=${args.autoFocus}
      ?restore-focus=${args.restoreFocus}
      ?active=${args.active}
    >
      <button type="button">One</button>
      <button type="button">Two</button>
      <button type="button">Three</button>
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
export const TrappedFalse: Story = { args: { trapped: false } };
export const ActiveFalse: Story = { args: { active: false } };

/**
 * Renders trapped, present, with three focusable children so the keyboard
 * gate can verify Tab wraps last → first and Shift+Tab wraps first → last.
 */
export const Keyboard: Story = {
  args: { trapped: true, autoFocus: 'first' },
  render: (args) => html`
    <ds-focus-scope ?trapped=${args.trapped} auto-focus=${args.autoFocus}>
      <button type="button">One</button>
      <button type="button">Two</button>
      <button type="button">Three</button>
    </ds-focus-scope>
  `,
};
