import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { renderSignIn } from './sign-in.js';

const meta: Meta = {
  title: 'Demo/Sign in/Lit',
  parameters: {
    actions: { handles: ['submit', 'invalid', 'press'] },
    layout: 'centered',
  },
  render: () => html`<div style="inline-size: min(100%, 24rem)">${renderSignIn()}</div>`,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const DarkMode: Story = {
  render: () => html`
    <div data-mode="dark" style="inline-size: min(100%, 24rem); padding: var(--space-6); background: var(--color-background)">
      ${renderSignIn()}
    </div>
  `,
};
