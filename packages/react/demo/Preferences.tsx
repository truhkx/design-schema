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
  type FormErrors,
  type FormValues,
} from '../src/index';

export interface PreferencesProps {
  /** Called with the collected values when the form passes validation. Defaults to logging the values. */
  onSubmit?: (values: FormValues) => void;
  /** Called with the errors keyed by field name when submission is blocked. */
  onInvalid?: (errors: FormErrors) => void;
  /** Called when "Cancel" is activated. */
  onCancel?: () => void;
  /** Called when the info alert is dismissed. */
  onDismissAlert?: () => void;
  /** Storage used, in GB, out of 10. Drives the meter. */
  storageUsedGb?: number;
}

const DIGEST_OPTIONS = [
  { value: 'daily', label: 'Daily', description: 'One summary each morning at 9:00' },
  { value: 'weekly', label: 'Weekly', description: 'One summary every Monday' },
  { value: 'never', label: 'Never', description: 'Only the notifications you enable below' },
];

const STORAGE_MAX_GB = 10;

/**
 * Notification-preferences screen composed from the Calm & precise React components:
 * Landmark (main) → Breadcrumb + Heading + Alert + Form → RadioGroup, Checkboxes, Switch, Meter,
 * Disclosure with advanced options, and the Save / Cancel actions.
 */
export function Preferences({ onSubmit, onInvalid, onCancel, onDismissAlert, storageUsedGb = 8.2 }: PreferencesProps) {
  const handleSubmit = (values: FormValues) => {
    if (onSubmit) {
      onSubmit(values);
    } else {
      console.log('Save preferences', values);
    }
  };

  const storageTone = storageUsedGb / STORAGE_MAX_GB >= 0.9 ? 'danger' : storageUsedGb / STORAGE_MAX_GB >= 0.75 ? 'warning' : 'info';

  return (
    <Landmark role="main">
      <Stack gap="6" align="stretch">
        <Stack gap="2">
          <Breadcrumb
            items={[
              { label: 'Settings', href: '/settings' },
              { label: 'Notifications', href: '/settings/notifications' },
            ]}
          />
          <Heading level="1" id="preferences-title">
            Notifications
          </Heading>
          <Text tone="muted">Choose how and when we contact you.</Text>
        </Stack>

        <Alert tone="info" heading="Changes apply from the next digest" dismissible onDismiss={onDismissAlert}>
          Notifications already scheduled for today are sent with your current settings.
        </Alert>

        <Form name="preferences" label="Notification preferences" validate="submit" onSubmit={handleSubmit} onInvalid={onInvalid}>
          <Stack gap="5">
            <RadioGroup label="Email digest" name="digest" options={DIGEST_OPTIONS} defaultValue="weekly" required />

            <Stack gap="0">
              <Checkbox
                label="Mentions"
                name="mentions"
                description="When someone mentions you in a comment."
                defaultChecked
              />
              <Checkbox label="Product updates" name="updates" description="One email a month about new features." />
            </Stack>

            <Switch
              label="Push notifications"
              name="push"
              description="Sent to this device as soon as something happens."
              defaultChecked
            />

            <Meter
              label="Attachment storage used"
              value={storageUsedGb}
              min={0}
              max={STORAGE_MAX_GB}
              valueText={`${storageUsedGb} GB of ${STORAGE_MAX_GB} GB`}
              tone={storageTone}
            />

            <Disclosure summary="Advanced options" keepMounted>
              <Checkbox
                label="Include attachments in digest emails"
                name="digestAttachments"
                description="Larger emails; counts against attachment storage."
              />
            </Disclosure>

            <Stack direction="horizontal" gap="2" align="center" wrap>
              <Button label="Save" type="submit" variant="primary" />
              <Button label="Cancel" variant="secondary" onClick={onCancel} />
            </Stack>
          </Stack>
        </Form>
      </Stack>
    </Landmark>
  );
}
