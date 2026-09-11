import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  AlertDialog,
  Button,
  Card,
  Checkbox,
  Container,
  Fieldset,
  Form,
  Heading,
  Input,
  Landmark,
  RadioGroup,
  SegmentedControl,
  Stack,
  Switch,
  Tabs,
  TabPanel,
  Text,
  ToastRegion,
  toast,
  type FormValues,
} from '../src/index';

const SETTINGS_TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'account', label: 'Account' },
];

const FREQUENCY_OPTIONS = [
  { value: 'immediately', label: 'Immediately' },
  { value: 'daily', label: 'Daily digest' },
  { value: 'weekly', label: 'Weekly digest' },
];

const COLOR_MODE_OPTIONS = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const DENSITY_OPTIONS = [
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'compact', label: 'Compact' },
];

/**
 * Settings pattern page composed from the Calm & precise React components: Landmark (main) →
 * Container → Tabs (Profile, Notifications, Appearance, Account), each panel built only from
 * Form, Fieldset, Input, Checkbox, Switch, RadioGroup, SegmentedControl, Card, Alert and Button.
 */
export function SettingsPage() {
  const profileFormRef = useRef<HTMLFormElement>(null);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [colorMode, setColorMode] = useState('system');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // The documented mechanism (packages/react/src/index.ts) is an explicit data-mode="dark" | "light"
  // on <html>; there is no "system" value, so System resolves to the documented light default.
  useEffect(() => {
    if (colorMode === 'dark') {
      document.documentElement.dataset.mode = 'dark';
    } else {
      delete document.documentElement.dataset.mode;
    }
  }, [colorMode]);

  const handleProfileSubmit = (_values: FormValues) => {
    new Promise((resolve) => setTimeout(resolve, 300)).then(() => {
      toast({ message: 'Changes saved' });
    });
  };

  const handleProfileCancel = () => {
    profileFormRef.current?.reset();
  };

  return (
    <Landmark role="main">
      <Container width="content">
        <Stack gap="section" align="stretch">
          <Heading level="1" id="settings-title">
            Settings
          </Heading>

          <Tabs label="Settings sections" tabs={SETTINGS_TABS} keepMounted>
            <TabPanel id="profile">
              <Form
                ref={profileFormRef}
                name="profile"
                label="Profile"
                validate="submit"
                errorSummary={false}
                onSubmit={handleProfileSubmit}
                actions={
                  <Stack direction="horizontal" gap="tight" justify="end">
                    <Button label="Cancel" variant="secondary" onClick={handleProfileCancel} />
                    <Button label="Save changes" type="submit" variant="primary" />
                  </Stack>
                }
              >
                <Stack gap="loose">
                  <Fieldset legend="Your details">
                    <Input label="Name" name="name" required />
                    <Input
                      label="Email"
                      name="email"
                      type="email"
                      required
                      description="We send receipts here."
                    />
                  </Fieldset>
                  <Fieldset legend="Public profile">
                    <Input label="Display name" name="displayName" />
                    <Input label="Website" name="website" type="url" />
                  </Fieldset>
                </Stack>
              </Form>
            </TabPanel>

            <TabPanel id="notifications">
              <Stack gap="loose">
                <Fieldset legend="Email me about">
                  <Checkbox
                    label="Product updates"
                    name="emailProductUpdates"
                    description="About once a month."
                  />
                  <Checkbox label="Security alerts" name="emailSecurityAlerts" defaultChecked />
                  <Checkbox label="Tips and tutorials" name="emailTips" />
                </Fieldset>
                <Fieldset legend="Push notifications">
                  <Switch
                    label="Enable push notifications"
                    checked={pushEnabled}
                    onChange={setPushEnabled}
                  />
                  <RadioGroup
                    label="Frequency"
                    name="pushFrequency"
                    options={FREQUENCY_OPTIONS}
                    defaultValue="immediately"
                    disabled={!pushEnabled}
                  />
                </Fieldset>
              </Stack>
            </TabPanel>

            <TabPanel id="appearance">
              <Stack gap="loose">
                <Fieldset legend="Theme">
                  <SegmentedControl
                    label="Color mode"
                    options={COLOR_MODE_OPTIONS}
                    value={colorMode}
                    onChange={setColorMode}
                  />
                </Fieldset>
                <Fieldset legend="Density">
                  <RadioGroup
                    label="Layout density"
                    name="density"
                    options={DENSITY_OPTIONS}
                    defaultValue="comfortable"
                    description="Affects tables and lists."
                  />
                </Fieldset>
              </Stack>
            </TabPanel>

            <TabPanel id="account">
              <Stack gap="loose">
                <Card surface="subtle" inset="lg" heading="Export your data" headingLevel={2}>
                  <Stack gap="normal">
                    <Text>Download everything we store about you as a ZIP.</Text>
                    <Button label="Request export" variant="secondary" />
                  </Stack>
                </Card>
                <Card surface="subtle" inset="lg" heading="Delete account" headingLevel={2}>
                  <Stack gap="normal">
                    <Alert tone="warning">This cannot be undone.</Alert>
                    <Button label="Delete account…" variant="danger" onClick={() => setDeleteDialogOpen(true)} />
                  </Stack>
                </Card>
              </Stack>
            </TabPanel>
          </Tabs>
        </Stack>
      </Container>

      <AlertDialog
        open={deleteDialogOpen}
        heading="Delete your account?"
        description="This permanently deletes your account and everything in it. This cannot be undone."
        tone="danger"
        confirmLabel="Delete account"
        onConfirm={() => setDeleteDialogOpen(false)}
        onCancel={() => setDeleteDialogOpen(false)}
      />

      <ToastRegion />
    </Landmark>
  );
}
