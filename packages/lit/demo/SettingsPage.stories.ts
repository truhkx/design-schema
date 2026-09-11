import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import './SettingsPage.js';

const meta: Meta = {
  title: 'Patterns/SettingsPage',
  parameters: {
    actions: { handles: ['submit', 'invalid', 'press', 'change', 'confirm', 'cancel', 'dismiss'] },
  },
  render: () => html`<ds-pattern-settings-page></ds-pattern-settings-page>`,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};
