import { html, type TemplateResult } from 'lit';
import '../src/index.js';

/**
 * Sign-in screen composed from the Calm & precise Lit elements.
 *
 * Expects the token custom properties to be loaded once at the app root
 * (`import '@design-schema/tokens/calm-precise/css'`) and, optionally,
 * `data-mode="dark"` on `<html>`.
 */
export function renderSignIn(): TemplateResult {
  return html`
    <ds-stack gap="6" align="stretch">
      <ds-stack gap="1">
        <ds-heading level="1">Sign in</ds-heading>
        <ds-text tone="muted">Use the email you signed up with.</ds-text>
      </ds-stack>

      <ds-form name="sign-in" label="Sign in">
        <ds-input
          label="Email address"
          name="email"
          type="email"
          autocomplete="email"
          required
        ></ds-input>
        <ds-input
          label="Password"
          name="password"
          type="password"
          autocomplete="current-password"
          required
        ></ds-input>
        <ds-stack direction="horizontal" gap="2" align="center" justify="between" wrap>
          <ds-button type="submit" label="Sign in"></ds-button>
          <ds-button variant="ghost" label="Forgot password?"></ds-button>
        </ds-stack>
      </ds-form>
    </ds-stack>
  `;
}
