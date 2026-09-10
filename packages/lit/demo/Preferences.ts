import { html, type TemplateResult } from 'lit';
import '../src/index.js';
import type { BreadcrumbItem, RadioGroupOption } from '../src/index.js';

const trail: BreadcrumbItem[] = [{ label: 'Settings', href: '#settings' }, { label: 'Notifications' }];

const digestOptions: RadioGroupOption[] = [
  { value: 'daily', label: 'Daily', description: 'One summary every morning' },
  { value: 'weekly', label: 'Weekly', description: 'A summary every Monday' },
  { value: 'never', label: 'Never', description: 'Only the alerts you turn on below' },
];

/**
 * Notification-preferences screen composed from the Calm & precise Lit elements.
 *
 * Expects the token custom properties to be loaded once at the app root
 * (`import '@design-schema/tokens/calm-precise/css'`) and, optionally,
 * `data-mode="dark"` on `<html>`.
 */
export function renderPreferences(): TemplateResult {
  return html`
    <ds-landmark role="main">
      <ds-stack gap="6" align="stretch">
        <ds-stack gap="2">
          <ds-breadcrumb .items=${trail}></ds-breadcrumb>
          <ds-heading level="1">Notifications</ds-heading>
          <ds-text tone="muted">Choose what we send you and how often.</ds-text>
        </ds-stack>

        <ds-alert tone="info" live="off" heading="Applies to every device">
          <ds-text>These preferences follow your account, not this browser.</ds-text>
        </ds-alert>

        <ds-form name="preferences" label="Notification preferences">
          <ds-radio-group
            name="digest"
            label="Email digest"
            description="A single email that collects the activity you missed."
            .options=${digestOptions}
            default-value="weekly"
            required
          ></ds-radio-group>

          <ds-stack gap="0">
            <ds-checkbox
              name="mentions"
              label="Mentions and replies"
              description="When someone mentions you or replies to your comment."
              default-checked
            ></ds-checkbox>
            <ds-checkbox
              name="product"
              label="Product updates"
              description="About one email a month."
            ></ds-checkbox>
          </ds-stack>

          <ds-switch
            name="push"
            label="Push notifications"
            description="Delivered to this device right away."
            default-checked
          ></ds-switch>

          <ds-meter
            label="Attachment storage used"
            value="82"
            value-text="8.2 GB of 10 GB"
            tone="warning"
          ></ds-meter>

          <ds-disclosure summary="Advanced options" keep-mounted>
            <ds-checkbox
              name="quiet-hours"
              label="Pause notifications overnight"
              description="Nothing is sent between 22:00 and 07:00 in your time zone."
            ></ds-checkbox>
          </ds-disclosure>

          <ds-stack direction="horizontal" gap="2" align="center" wrap>
            <ds-button type="submit" label="Save"></ds-button>
            <ds-button variant="secondary" label="Cancel"></ds-button>
          </ds-stack>
        </ds-form>
      </ds-stack>
    </ds-landmark>
  `;
}
