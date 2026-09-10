import * as React from 'react';
import { View } from 'react-native';
import type { ViewStyle } from 'react-native';
import {
  Alert,
  Breadcrumb,
  Button,
  Checkbox,
  Disclosure,
  Form,
  Heading,
  Landmark,
  Meter,
  RadioGroup,
  Stack,
  Switch,
  Text,
  useTheme,
} from '../src';
import type { FormValues } from '../src';

export interface PreferencesProps {
  /** Starting digest frequency. */
  digest?: 'daily' | 'weekly' | 'never';
  /** Whether mentions are on to begin with. */
  mentions?: boolean;
  /** Whether comment notifications are on to begin with. */
  comments?: boolean;
  /** Whether the "pause all" switch starts on. */
  paused?: boolean;
  /** Storage used, in GB, for the quota meter. */
  storageUsedGb?: number;
  /** Storage quota, in GB. */
  storageQuotaGb?: number;
  /** Receives the collected values once the form passes validation. */
  onSubmit?: (values: FormValues) => void;
  /** Activated by the secondary "Cancel" action; discards the edits. */
  onCancel?: () => void;
  /** Fired when an ancestor in the breadcrumb is activated. */
  onNavigate?: (href: string) => void;
  /** Disables the form while the save request is in flight. */
  submitting?: boolean;
}

/**
 * Notification preferences screen composed entirely from Design Schema React Native
 * components.
 *
 * The structure is one `main` Landmark holding a Breadcrumb (Settings / Notifications),
 * the page Heading, an info Alert that is present at load (`live: off`), and a
 * labelled Form. Inside the form: a RadioGroup for digest frequency, two Checkboxes
 * for the kinds of activity to include, a Switch for pausing everything (immediate,
 * so it is a switch rather than a third checkbox), a Meter for storage in the
 * warning tone because the consumer decided 80% is worth flagging, a Disclosure
 * hiding an advanced option, and the actions — one primary submit and one secondary
 * cancel — in a horizontal Stack.
 *
 * Every color, size, and gap comes from a token; the screen frame reads
 * `colorBackground` and the spacing scale from `useTheme`.
 */
export function Preferences({
  digest,
  mentions = true,
  comments = false,
  paused = false,
  storageUsedGb = 8.2,
  storageQuotaGb = 10,
  onSubmit,
  onCancel,
  onNavigate,
  submitting = false,
}: PreferencesProps): React.JSX.Element {
  const { tokens } = useTheme();

  const screenStyle: ViewStyle = {
    flex: 1,
    backgroundColor: tokens.colorBackground,
    paddingHorizontal: tokens.spaceLg,
    paddingVertical: tokens.space8,
  };

  return (
    <View style={screenStyle}>
      <Landmark role="main">
        <Stack gap="section">
          <Stack gap="normal">
            <Breadcrumb
              items={[{ label: 'Settings', href: '/settings' }, { label: 'Notifications' }]}
              onNavigate={(item) => {
                if (item.href !== undefined) {
                  onNavigate?.(item.href);
                }
              }}
            />
            <Heading level={1} size="2xl">
              Notifications
            </Heading>
            <Text tone="muted">Choose what you hear about and how often.</Text>
          </Stack>
          <Alert tone="info" heading="Digest times follow your profile time zone" live="off">
            Change the time zone in Profile settings if digests arrive at the wrong hour.
          </Alert>
          <Form name="notification-preferences" label="Notification preferences" disabled={submitting} onSubmit={onSubmit}>
            <RadioGroup
              label="Email digest"
              name="digest"
              defaultValue={digest}
              options={[
                { value: 'daily', label: 'Daily', description: 'Every morning at 9:00' },
                { value: 'weekly', label: 'Weekly', description: 'Monday mornings' },
                { value: 'never', label: 'Never', description: 'Only in-app notifications' },
              ]}
              required
            />
            <Stack gap="none">
              <Checkbox label="Mentions" name="mentions" defaultChecked={mentions} description="When someone @-mentions you." />
              <Checkbox label="Comments on your work" name="comments" defaultChecked={comments} />
            </Stack>
            <Switch
              label="Pause all notifications"
              name="paused"
              defaultChecked={paused}
              description="Stops every email and push notification until you turn this off."
            />
            <Meter
              label="Attachment storage used"
              value={storageUsedGb}
              min={0}
              max={storageQuotaGb}
              valueText={`${storageUsedGb} GB of ${storageQuotaGb} GB`}
              tone="warning"
            />
            <Disclosure summary="Advanced options" keepMounted>
              <Checkbox label="Include activity from archived projects" name="includeArchived" />
            </Disclosure>
            <Stack direction="horizontal" gap="normal" align="center">
              <Button label="Save" type="submit" loading={submitting} />
              <Button label="Cancel" variant="secondary" onPress={onCancel} />
            </Stack>
          </Form>
        </Stack>
      </Landmark>
    </View>
  );
}
