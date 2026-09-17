import { LitElement, css, html, type CSSResult, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';

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

import type { TabsItem } from '../src/Tabs.js';
import type { FormSubmitDetail } from '../src/Form.js';
import type { InputChangeDetail } from '../src/Input.js';
import type { SwitchChangeDetail } from '../src/Switch.js';
import type { RadioGroupChangeDetail, RadioGroupOption } from '../src/RadioGroup.js';
import type { SegmentedControlChangeDetail, SegmentedControlOption } from '../src/SegmentedControl.js';
import { toast } from '../src/Toast.js';

const SETTINGS_TABS: TabsItem[] = [
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

/** The profile form's values; Cancel restores the last saved copy. */
export interface SettingsProfile {
  name: string;
  email: string;
  displayName: string;
  website: string;
}

const EMPTY_PROFILE: SettingsProfile = { name: '', email: '', displayName: '', website: '' };

/**
 * `<ds-pattern-settings-page>` — the Settings pattern: a main Landmark →
 * Container → Tabs (Profile, Notifications, Appearance, Account), composed only
 * from system elements.
 *
 * The Appearance controls are presentational: they are real, controlled inputs
 * that drive nothing. The mode is set by an ancestor (`data-mode` on `<html>`)
 * and the theme has no density, so the page never reads or writes either.
 *
 * Expects the token custom properties to be loaded once at the app root.
 */
@customElement('ds-pattern-settings-page')
export class DsPatternSettingsPage extends LitElement {
  static override styles: CSSResult = css`
    :host {
      display: block;
    }
  `;

  /** Last saved profile; there is no seed data, so it starts empty. */
  @state() private accessor savedProfile: SettingsProfile = EMPTY_PROFILE;

  /** Unsaved edits to the profile form. */
  @state() private accessor draftProfile: SettingsProfile = EMPTY_PROFILE;

  @state() private accessor pushEnabled = false;

  @state() private accessor frequency: string | undefined;

  @state() private accessor colorMode = 'system';

  @state() private accessor density = 'comfortable';

  @state() private accessor deleteDialogOpen = false;

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('data-ds', 'Pattern.SettingsPage');
  }

  protected override render(): TemplateResult {
    const profile = this.draftProfile;
    return html`
      <ds-landmark role="main">
        <ds-container width="content">
          <ds-stack gap="section">
            <ds-heading level="1">Settings</ds-heading>

            <ds-tabs label="Settings sections" .tabs=${SETTINGS_TABS} keep-mounted>
              <ds-tab-panel id="profile">
                <ds-form no-error-summary @submit=${this.handleProfileSubmit}>
                  <ds-stack gap="loose">
                    <ds-fieldset legend="Your details">
                      <ds-input
                        label="Name"
                        name="name"
                        required
                        .value=${profile.name}
                        @change=${(event: CustomEvent<InputChangeDetail>) => this.editProfile('name', event)}
                      ></ds-input>
                      <ds-input
                        label="Email"
                        name="email"
                        type="email"
                        required
                        description="We send receipts here."
                        .value=${profile.email}
                        @change=${(event: CustomEvent<InputChangeDetail>) => this.editProfile('email', event)}
                      ></ds-input>
                    </ds-fieldset>
                    <ds-fieldset legend="Public profile">
                      <ds-input
                        label="Display name"
                        name="displayName"
                        .value=${profile.displayName}
                        @change=${(event: CustomEvent<InputChangeDetail>) => this.editProfile('displayName', event)}
                      ></ds-input>
                      <ds-input
                        label="Website"
                        name="website"
                        type="url"
                        .value=${profile.website}
                        @change=${(event: CustomEvent<InputChangeDetail>) => this.editProfile('website', event)}
                      ></ds-input>
                    </ds-fieldset>
                  </ds-stack>
                  <ds-stack slot="actions" direction="horizontal" gap="tight" justify="end">
                    <ds-button variant="secondary" label="Cancel" @press=${this.handleProfileCancel}></ds-button>
                    <ds-button variant="primary" type="submit" label="Save changes"></ds-button>
                  </ds-stack>
                </ds-form>
              </ds-tab-panel>

              <ds-tab-panel id="notifications">
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
                    .value=${this.frequency}
                    ?disabled=${!this.pushEnabled}
                    @change=${this.handleFrequencyChange}
                  ></ds-radio-group>
                </ds-fieldset>
              </ds-tab-panel>

              <ds-tab-panel id="appearance">
                <ds-fieldset legend="Theme">
                  <ds-segmented-control
                    label="Color mode"
                    .options=${COLOR_MODE_OPTIONS}
                    .value=${this.colorMode}
                    @change=${this.handleColorModeChange}
                  ></ds-segmented-control>
                </ds-fieldset>
                <ds-fieldset legend="Density">
                  <ds-radio-group
                    label="Layout density"
                    description="Affects tables and lists."
                    .options=${DENSITY_OPTIONS}
                    .value=${this.density}
                    @change=${this.handleDensityChange}
                  ></ds-radio-group>
                </ds-fieldset>
              </ds-tab-panel>

              <ds-tab-panel id="account">
                <ds-card surface="subtle" inset="lg" heading="Export your data" heading-level="2">
                  <ds-text>Download everything we store about you as a ZIP.</ds-text>
                  <ds-button variant="secondary" label="Request export"></ds-button>
                </ds-card>
                <ds-card surface="subtle" inset="lg" heading="Delete account" heading-level="2">
                  <ds-alert tone="warning">This cannot be undone.</ds-alert>
                  <ds-button variant="danger" label="Delete account…" @press=${this.handleDeleteRequest}></ds-button>
                </ds-card>
              </ds-tab-panel>
            </ds-tabs>
          </ds-stack>
        </ds-container>

        <ds-alert-dialog
          ?open=${this.deleteDialogOpen}
          tone="danger"
          heading="Delete your account?"
          description="This permanently deletes your account and everything in it. This cannot be undone."
          confirm-label="Delete account"
          @confirm=${this.closeDeleteDialog}
          @cancel=${this.closeDeleteDialog}
        ></ds-alert-dialog>
      </ds-landmark>
    `;
  }

  private editProfile(field: keyof SettingsProfile, event: CustomEvent<InputChangeDetail>): void {
    this.draftProfile = { ...this.draftProfile, [field]: event.detail.value };
  }

  /** Form has validated before `submit` fires; the save is faked, and the toast does not move focus. */
  private readonly handleProfileSubmit = (_event: CustomEvent<FormSubmitDetail>): void => {
    const saving = this.draftProfile;
    void Promise.resolve().then(() => {
      this.savedProfile = saving;
      void toast({ message: 'Changes saved' });
    });
  };

  private readonly handleProfileCancel = (): void => {
    this.draftProfile = this.savedProfile;
  };

  private readonly handlePushChange = (event: CustomEvent<SwitchChangeDetail>): void => {
    this.pushEnabled = event.detail.checked;
  };

  private readonly handleFrequencyChange = (event: CustomEvent<RadioGroupChangeDetail>): void => {
    this.frequency = event.detail.value;
  };

  /** Presentational: records the choice and drives nothing ("System" means no override). */
  private readonly handleColorModeChange = (event: CustomEvent<SegmentedControlChangeDetail>): void => {
    this.colorMode = event.detail.value;
  };

  /** Presentational: the theme has no density, so this drives nothing. */
  private readonly handleDensityChange = (event: CustomEvent<RadioGroupChangeDetail>): void => {
    this.density = event.detail.value;
  };

  private readonly handleDeleteRequest = (): void => {
    this.deleteDialogOpen = true;
  };

  private readonly closeDeleteDialog = (): void => {
    this.deleteDialogOpen = false;
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-pattern-settings-page': DsPatternSettingsPage;
  }
}
