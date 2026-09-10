import * as React from 'react';
import { View } from 'react-native';
import type { ViewStyle } from 'react-native';
import { Button, Form, Heading, Input, Stack, Text, useTheme } from '../src';
import type { FormValues } from '../src';

export interface ProfileSettingsProps {
  /** Current display name, used as the field's starting value. */
  displayName?: string;
  /** Current email address, used as the field's starting value. */
  email?: string;
  /** Receives `{ displayName, email }` once both fields pass validation. */
  onSubmit?: (values: FormValues) => void;
  /** Activated by the secondary "Cancel" action; discards the edits. */
  onCancel?: () => void;
  /** Disables the form while the save request is in flight. */
  submitting?: boolean;
}

/**
 * Profile settings screen composed entirely from Design Schema React Native components.
 *
 * The outline is one `level: 1` Heading followed by a short intro in muted Text. The
 * Form is labelled so it is a named region, both Inputs are required and carry their
 * own description, and the actions sit at the end in a horizontal Stack: one primary
 * submit and one secondary alternative beside it, so nothing competes with Save.
 *
 * Every color, size, and gap comes from a token — the screen frame reads
 * `colorBackground` and the spacing scale from `useTheme`, and the components take
 * care of the rest.
 */
export function ProfileSettings({
  displayName,
  email,
  onSubmit,
  onCancel,
  submitting = false,
}: ProfileSettingsProps): React.JSX.Element {
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
            Profile settings
          </Heading>
          <Text tone="muted">Update how your name and email appear to the rest of your team.</Text>
        </Stack>
        <Form
          name="profile-settings"
          label="Profile settings"
          disabled={submitting}
          onSubmit={onSubmit}
          actions={
            <Stack direction="horizontal" gap="normal" align="center">
              <Button label="Save changes" type="submit" loading={submitting} />
              <Button label="Cancel" variant="secondary" onPress={onCancel} />
            </Stack>
          }
        >
          <Input
            label="Display name"
            name="displayName"
            defaultValue={displayName}
            description="Shown on your comments and activity."
            required
          />
          <Input
            label="Email address"
            name="email"
            type="email"
            defaultValue={email}
            description="Used for sign-in and account notices."
            placeholder="name@example.com"
            required
          />
        </Form>
      </Stack>
    </View>
  );
}
