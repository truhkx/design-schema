import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { renderPreferences } from './Preferences.js';

const meta: Meta = {
  title: 'Demo/Preferences/Lit',
  parameters: {
    actions: { handles: ['submit', 'invalid', 'press', 'change', 'toggle', 'navigate', 'dismiss'] },
    layout: 'centered',
  },
  render: () => html`<div style="inline-size: min(100%, 32rem)">${renderPreferences()}</div>`,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};

export const DarkMode: Story = {
  render: () => html`
    <div
      data-mode="dark"
      style="inline-size: min(100%, 32rem); padding: var(--space-6); background: var(--color-background)"
    >
      ${renderPreferences()}
    </div>
  `,
};
