import { LitElement, css, html } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';

import '../src/Landmark.js';
import '../src/Container.js';
import '../src/Stack.js';
import '../src/Heading.js';
import '../src/Tabs.js';
import '../src/Form.js';
import '../src/Fieldset.js';
import '../src/Input.js';
import '../src/Button.js';
import '../src/Checkbox.js';
import '../src/Switch.js';
import '../src/RadioGroup.js';
import '../src/SegmentedControl.js';
import '../src/Card.js';
import '../src/Text.js';
import '../src/Alert.js';
import '../src/AlertDialog.js';
import '../src/Toast.js';

import type { TabsTab } from '../src/Tabs.js';
import type { DsForm, FormSubmitDetail } from '../src/Form.js';
import type { SwitchChangeDetail } from '../src/Switch.js';
import type { RadioGroupOption } from '../src/RadioGroup.js';
import type { SegmentedControlOption, SegmentedControlChangeDetail } from '../src/SegmentedControl.js';
import type { AlertDialogCancelDetail } from '../src/AlertDialog.js';
import { toast } from '../src/Toast.js';

const SETTINGS_TABS: TabsTab[] = [
  { id: 'profile', label: 'Profile' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'account', label: 'Account' },
];

const FREQUENCY_OPTIONS: RadioGroupOption[] = [
  { value: 'immediately', label: 'Immediately' },
  { value: 'daily', label: 'Daily digest' },
  { value: 'weekly', label: 'Weekly digest' },
];

const COLOR_MODE_OPTIONS: SegmentedControlOption[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const DENSITY_OPTIONS: RadioGroupOption[] = [
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'compact', label: 'Compact' },
];

/**
 * Settings pattern page composed from the Calm & precise Lit elements: a main
 * Landmark → Container → Tabs (Profile, Notifications, Appearance, Account),
 * each panel built only from Form, Fieldset, Input, Checkbox, Switch,
 * RadioGroup, SegmentedControl, Card, Alert and Button.
 *
 * Expects the token custom properties to be loaded once at the app root
 * (`import '@design-schema/tokens/calm-precise/css'`).
 */
@customElement('ds-pattern-settings-page')
export class DsPatternSettingsPage extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
  `;

  @state() private pushEnabled = false;

  @state() private deleteDialogOpen = false;

  @query('ds-form') private readonly profileFormEl?: DsForm;

  protected override render() {
    return html`
      <ds-landmark role="main">
        <ds-container width="content">
          <ds-stack gap="section" align="stretch">
            <ds-heading level="1">Settings</ds-heading>

            <ds-tabs label="Settings sections" .tabs=${SETTINGS_TABS} keep-mounted>
              <ds-tab-panel id="profile">
                <ds-form
                  name="profile"
                  label="Profile"
                  .errorSummary=${false}
                  @submit=${this.handleProfileSubmit}
                >
                  <ds-stack gap="loose">
                    <ds-fieldset legend="Your details">
                      <ds-input label="Name" name="name" required></ds-input>
                      <ds-input
                        label="Email"
                        name="email"
                        type="email"
                        required
                        description="We send receipts here."
                      ></ds-input>
                    </ds-fieldset>
                    <ds-fieldset legend="Public profile">
                      <ds-input label="Display name" name="displayName"></ds-input>
                      <ds-input label="Website" name="website" type="url"></ds-input>
                    </ds-fieldset>
                  </ds-stack>
                  <ds-stack slot="actions" direction="horizontal" gap="tight" justify="end">
                    <ds-button variant="secondary" label="Cancel" @press=${this.handleProfileCancel}></ds-button>
                    <ds-button variant="primary" type="submit" label="Save changes"></ds-button>
                  </ds-stack>
                </ds-form>
              </ds-tab-panel>

              <ds-tab-panel id="notifications">
                <ds-stack gap="loose">
                  <ds-fieldset legend="Email me about">
                    <ds-checkbox label="Product updates" description="About once a month."></ds-checkbox>
                    <ds-checkbox label="Security alerts" default-checked></ds-checkbox>
                    <ds-checkbox label="Tips and tutorials"></ds-checkbox>
                  </ds-fieldset>
                  <ds-fieldset legend="Push notifications">
                    <ds-switch
                      label="Enable push notifications"
                      .checked=${this.pushEnabled}
                      @change=${this.handlePushChange}
                    ></ds-switch>
                    <ds-radio-group
                      label="Frequency"
                      .options=${FREQUENCY_OPTIONS}
                      default-value="immediately"
                      ?disabled=${!this.pushEnabled}
                    ></ds-radio-group>
                  </ds-fieldset>
                </ds-stack>
              </ds-tab-panel>

              <ds-tab-panel id="appearance">
                <ds-stack gap="loose">
                  <ds-fieldset legend="Theme">
                    <ds-segmented-control
                      label="Color mode"
                      .options=${COLOR_MODE_OPTIONS}
                      default-value="system"
                      @change=${this.handleColorModeChange}
                    ></ds-segmented-control>
                  </ds-fieldset>
                  <ds-fieldset legend="Density">
                    <ds-radio-group
                      label="Layout density"
                      .options=${DENSITY_OPTIONS}
                      default-value="comfortable"
                      description="Affects tables and lists."
                    ></ds-radio-group>
                  </ds-fieldset>
                </ds-stack>
              </ds-tab-panel>

              <ds-tab-panel id="account">
                <ds-stack gap="loose">
                  <ds-card surface="subtle" inset="lg" heading="Export your data" heading-level="2">
                    <ds-stack gap="normal">
                      <ds-text>Download everything we store about you as a ZIP.</ds-text>
                      <ds-button variant="secondary" label="Request export"></ds-button>
                    </ds-stack>
                  </ds-card>
                  <ds-card surface="subtle" inset="lg" heading="Delete account" heading-level="2">
                    <ds-stack gap="normal">
                      <ds-alert tone="warning">This cannot be undone.</ds-alert>
                      <ds-button
                        variant="danger"
                        label="Delete account…"
                        @press=${this.handleDeleteRequest}
                      ></ds-button>
                    </ds-stack>
                  </ds-card>
                </ds-stack>
              </ds-tab-panel>
            </ds-tabs>
          </ds-stack>
        </ds-container>

        <ds-alert-dialog
          ?open=${this.deleteDialogOpen}
          heading="Delete your account?"
          description="This permanently deletes your account and everything in it. This cannot be undone."
          tone="danger"
          confirm-label="Delete account"
          @confirm=${this.handleDeleteConfirm}
          @cancel=${this.handleDeleteCancel}
        ></ds-alert-dialog>
      </ds-landmark>
    `;
  }

  private readonly handleProfileSubmit = (_event: CustomEvent<FormSubmitDetail>): void => {
    void new Promise<void>((resolve) => setTimeout(resolve, 300)).then(() => {
      void toast({ message: 'Changes saved' });
    });
  };

  /** No native form.reset() reaches these slotted fields (see the gap list), so each is cleared by hand. */
  private readonly handleProfileCancel = (): void => {
    const inputs = this.profileFormEl?.querySelectorAll('ds-input') ?? [];
    inputs.forEach((input) => {
      input.value = undefined;
    });
  };

  private readonly handlePushChange = (event: CustomEvent<SwitchChangeDetail>): void => {
    this.pushEnabled = event.detail.checked;
  };

  private readonly handleColorModeChange = (event: CustomEvent<SegmentedControlChangeDetail>): void => {
    if (event.detail.value === 'dark') {
      document.documentElement.dataset.mode = 'dark';
    } else {
      delete document.documentElement.dataset.mode;
    }
  };

  private readonly handleDeleteRequest = (): void => {
    this.deleteDialogOpen = true;
  };

  private readonly handleDeleteConfirm = (): void => {
    this.deleteDialogOpen = false;
  };

  private readonly handleDeleteCancel = (_event: CustomEvent<AlertDialogCancelDetail>): void => {
    this.deleteDialogOpen = false;
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-pattern-settings-page': DsPatternSettingsPage;
  }
}
