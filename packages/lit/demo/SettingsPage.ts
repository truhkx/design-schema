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
 * from system elements. The page owns no styling of its own beyond
 * `:host { display: block }`, reads no tokens and never branches on theme or
 * mode; spacing is Stack, Card inset and Container gutters throughout.
 *
 * The Appearance controls are presentational: they are real, controlled inputs
 * that drive nothing. The mode is set by an ancestor (`data-mode` on `<html>`)
 * and the theme has no density, so the page never reads or writes either, and
 * each Fieldset's `description` says so.
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

  /** Unsaved edits to the profile form; the four Inputs are controlled from it so Cancel can restore. */
  @state() private accessor draftProfile: SettingsProfile = EMPTY_PROFILE;

  /** Push notifications: page state outside the Form, and the RadioGroup's enablement. */
  @state() private accessor pushEnabled = false;

  /** Presentational: the color mode the user picked, where "System" means no override. */
  @state() private accessor colorMode = 'system';

  /** Presentational: the theme has no density setting, so this drives nothing. */
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

            <ds-tabs label="Settings sections" .tabs=${SETTINGS_TABS} fit="fill" keep-mounted>
              <ds-tab-panel id="profile">
                <ds-form name="profile" no-error-summary @submit=${this.handleProfileSubmit}>
                  <ds-stack gap="loose">
                    <ds-fieldset legend="Your details" gap="normal">
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
                    <ds-fieldset legend="Public profile" gap="normal">
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
                    <ds-button variant="primary" type="submit" label="Save changes"></ds-button>
                    <ds-button variant="secondary" label="Cancel" @press=${this.handleProfileCancel}></ds-button>
                  </ds-stack>
                </ds-form>
              </ds-tab-panel>

              <ds-tab-panel id="notifications">
                <ds-stack gap="loose">
                  <ds-fieldset legend="Email me about" gap="normal">
                    <ds-checkbox
                      name="productUpdates"
                      label="Product updates"
                      description="About once a month."
                    ></ds-checkbox>
                    <ds-checkbox name="securityAlerts" label="Security alerts" default-checked></ds-checkbox>
                    <ds-checkbox name="tips" label="Tips and tutorials"></ds-checkbox>
                  </ds-fieldset>
                  <ds-fieldset legend="Push notifications" gap="normal">
                    <ds-switch
                      label="Enable push notifications"
                      .checked=${this.pushEnabled}
                      @change=${this.handlePushChange}
                    ></ds-switch>
                    <ds-radio-group
                      name="pushFrequency"
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
                  <ds-fieldset
                    legend="Theme"
                    gap="normal"
                    description="A preview only: the app sets the color mode, and System means no override."
                  >
                    <ds-segmented-control
                      label="Color mode"
                      .options=${COLOR_MODE_OPTIONS}
                      .value=${this.colorMode}
                      @change=${this.handleColorModeChange}
                    ></ds-segmented-control>
                  </ds-fieldset>
                  <ds-fieldset
                    legend="Density"
                    gap="normal"
                    description="A preview only: the theme has no density setting yet."
                  >
                    <ds-radio-group
                      name="density"
                      label="Layout density"
                      description="Affects tables and lists."
                      .options=${DENSITY_OPTIONS}
                      .value=${this.density}
                      @change=${this.handleDensityChange}
                    ></ds-radio-group>
                  </ds-fieldset>
                </ds-stack>
              </ds-tab-panel>

              <ds-tab-panel id="account">
                <ds-stack gap="loose">
                  <ds-card surface="subtle" inset="lg" heading="Export your data" heading-level="2">
                    <ds-stack gap="normal" align="start">
                      <ds-text>Download everything we store about you as a ZIP.</ds-text>
                      <ds-button variant="secondary" label="Request export"></ds-button>
                    </ds-stack>
                  </ds-card>
                  <ds-card surface="subtle" inset="lg" heading="Delete account" heading-level="2">
                    <ds-stack gap="normal" align="start">
                      <ds-alert tone="warning" live="off">This cannot be undone.</ds-alert>
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

  /**
   * Form validates before `submit` fires (required only: there is no built-in
   * email or URL format check and this pattern adds no business logic of its
   * own). The save is faked with a resolved Promise, and the Toast does not move
   * focus.
   */
  private readonly handleProfileSubmit = (_event: CustomEvent<FormSubmitDetail>): void => {
    const saving = this.draftProfile;
    void Promise.resolve().then(() => {
      this.savedProfile = saving;
      void toast({ message: 'Changes saved' });
    });
  };

  /** Form has no reset contract, so Cancel restores the saved copy the Inputs are controlled from. */
  private readonly handleProfileCancel = (): void => {
    this.draftProfile = this.savedProfile;
  };

  private readonly handlePushChange = (event: CustomEvent<SwitchChangeDetail>): void => {
    this.pushEnabled = event.detail.checked;
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

  /** Confirm closes it exactly like Cancel: there is no account to delete. */
  private readonly closeDeleteDialog = (): void => {
    this.deleteDialogOpen = false;
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'ds-pattern-settings-page': DsPatternSettingsPage;
  }
}
