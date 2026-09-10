import * as React from 'react';
import { View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { Button, Form, Heading, Input, Stack, Text, useTheme } from '../src';
import type { FormValues } from '../src';

export interface SignInProps {
  /** Receives `{ email, password }` once both fields pass validation. */
  onSubmit?: (values: FormValues) => void;
  /** Activated by the low-emphasis "Forgot password?" action. */
  onForgotPassword?: () => void;
  /** Disables the form while a sign-in request is in flight. */
  submitting?: boolean;
}

/**
 * Sign-in screen composed entirely from Design Schema React Native components.
 *
 * The outline is one `level: 1` Heading. The Form is labelled so it is a named
 * region, both Inputs are required, the primary Button submits, and the ghost
 * Button is the only other action so nothing competes with sign-in.
 */
export function SignIn({ onSubmit, onForgotPassword, submitting = false }: SignInProps): React.JSX.Element {
  const { tokens } = useTheme();

  const screenStyle: ViewStyle = {
    flex: 1,
    backgroundColor: tokens.colorBackground,
    paddingHorizontal: tokens.spaceLg,
    paddingVertical: tokens.space8,
  };

  return (
    <View style={screenStyle}>
      <Stack gap="section">
        <Stack gap="tight">
          <Heading level={1} size="2xl">
            Sign in
          </Heading>
          <Text tone="muted">Use the email you signed up with.</Text>
        </Stack>
        <Form name="sign-in" label="Sign in" disabled={submitting} onSubmit={onSubmit}>
          <Input label="Email address" name="email" type="email" required placeholder="name@example.com" />
          <Input label="Password" name="password" type="password" required />
          <Stack gap="normal" align="start">
            <Button label="Sign in" type="submit" loading={submitting} />
            <Button label="Forgot password?" variant="ghost" onPress={onForgotPassword} />
          </Stack>
        </Form>
      </Stack>
    </View>
  );
}
