import { Button, Form, Heading, Input, Stack, Text, type FormErrors, type FormValues } from '../src/index';

export interface SignInProps {
  /** Called with `{ email, password }` when the form passes validation. Defaults to logging the values. */
  onSubmit?: (values: FormValues) => void;
  /** Called with the errors keyed by field name when submission is blocked. */
  onInvalid?: (errors: FormErrors) => void;
  /** Called when "Forgot password?" is activated. */
  onForgotPassword?: () => void;
}

/**
 * Sign-in screen composed from the Calm & precise React components:
 * Stack → Heading (level 1) + Text + Form → two Inputs + actions.
 */
export function SignIn({ onSubmit, onInvalid, onForgotPassword }: SignInProps) {
  const handleSubmit = (values: FormValues) => {
    if (onSubmit) {
      onSubmit(values);
    } else {
      console.log('Sign in', values);
    }
  };

  return (
    <Stack gap="section" align="stretch" element="section" aria-labelledby="sign-in-title">
      <Stack gap="tight">
        <Heading level="1" id="sign-in-title">
          Sign in
        </Heading>
        <Text tone="muted">Use the email you signed up with.</Text>
      </Stack>

      <Form name="sign-in" label="Sign in" validate="submit" onSubmit={handleSubmit} onInvalid={onInvalid}>
        <Stack gap="normal">
          <Input label="Email address" name="email" type="email" required autocomplete="email" />
          <Input label="Password" name="password" type="password" required autocomplete="current-password" />
          <Stack direction="horizontal" gap="tight" align="center" justify="between" wrap>
            <Button label="Sign in" type="submit" variant="primary" />
            <Button label="Forgot password?" variant="ghost" onClick={onForgotPassword} />
          </Stack>
        </Stack>
      </Form>
    </Stack>
  );
}
