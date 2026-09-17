import { useState, type ReactElement } from 'react';
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
  toast,
  type FormValues,
  type RadioGroupOption,
  type SegmentedControlOption,
  type TabsItem,
} from '../src/index';

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

const COPY = {
  saved: 'Changes saved',
  themeNote: 'A preview only: the app sets the color mode, and System means no override.',
  densityNote: 'A preview only: the theme has no density setting yet.',
};

interface Profile {
  name: string;
  email: string;
  displayName: string;
  website: string;
}

const EMPTY_PROFILE: Profile = { name: '', email: '', displayName: '', website: '' };

/** Stands in for the network call: the save always succeeds. */
function saveProfile(profile: Profile): Promise<Profile> {
  return Promise.resolve(profile);
}

/**
 * Settings pattern page: Landmark (main) → Container → Tabs (Profile, Notifications, Appearance,
 * Account), composed only from the package's components. The theme and mode come from an
 * ancestor; the Appearance controls are controlled inputs that drive nothing.
 */
export function SettingsPage(): ReactElement {
  const [savedProfile, setSavedProfile] = useState<Profile>(EMPTY_PROFILE);
  const [profile, setProfile] = useState<Profile>(EMPTY_PROFILE);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [colorMode, setColorMode] = useState('system');
  const [density, setDensity] = useState('comfortable');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const setField =
    (field: keyof Profile) =>
    (value: string): void => {
      setProfile((prev) => ({ ...prev, [field]: value }));
    };

  const handleSubmit = (_values: FormValues): void => {
    void saveProfile(profile).then((saved) => {
      setSavedProfile(saved);
      void toast({ message: COPY.saved });
    });
  };

  const handleCancel = (): void => {
    setProfile(savedProfile);
  };

  return (
    <Landmark role="main">
      <Container width="content">
        <Stack gap="section">
          <Heading level={1}>Settings</Heading>

          <Tabs label="Settings sections" tabs={SETTINGS_TABS} keepMounted>
            <TabPanel id="profile">
              <Form
                name="profile"
                errorSummary={false}
                onSubmit={handleSubmit}
                actions={
                  <Stack direction="horizontal" gap="tight" justify="end">
                    <Button label="Cancel" variant="secondary" onClick={handleCancel} />
                    <Button label="Save changes" variant="primary" type="submit" />
                  </Stack>
                }
              >
                <Stack gap="loose">
                  <Fieldset legend="Your details">
                    <Input label="Name" name="name" required value={profile.name} onChange={setField('name')} />
                    <Input
                      label="Email"
                      name="email"
                      type="email"
                      required
                      description="We send receipts here."
                      value={profile.email}
                      onChange={setField('email')}
                    />
                  </Fieldset>
                  <Fieldset legend="Public profile">
                    <Input
                      label="Display name"
                      name="displayName"
                      value={profile.displayName}
                      onChange={setField('displayName')}
                    />
                    <Input
                      label="Website"
                      name="website"
                      type="url"
                      value={profile.website}
                      onChange={setField('website')}
                    />
                  </Fieldset>
                </Stack>
              </Form>
            </TabPanel>

            <TabPanel id="notifications">
              <Stack gap="loose">
                <Fieldset legend="Email me about">
                  <Checkbox label="Product updates" name="productUpdates" description="About once a month." />
                  <Checkbox label="Security alerts" name="securityAlerts" defaultChecked />
                  <Checkbox label="Tips and tutorials" name="tips" />
                </Fieldset>
                <Fieldset legend="Push notifications">
                  <Switch label="Enable push notifications" checked={pushEnabled} onChange={setPushEnabled} />
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
                <Fieldset legend="Theme" description={COPY.themeNote}>
                  <SegmentedControl
                    label="Color mode"
                    options={COLOR_MODE_OPTIONS}
                    value={colorMode}
                    onChange={setColorMode}
                  />
                </Fieldset>
                <Fieldset legend="Density" description={COPY.densityNote}>
                  <RadioGroup
                    label="Layout density"
                    name="density"
                    options={DENSITY_OPTIONS}
                    description="Affects tables and lists."
                    value={density}
                    onChange={setDensity}
                  />
                </Fieldset>
              </Stack>
            </TabPanel>

            <TabPanel id="account">
              <Stack gap="loose">
                <Card surface="subtle" inset="lg" heading="Export your data" headingLevel={2}>
                  <Stack gap="normal" align="start">
                    <Text>Download everything we store about you as a ZIP.</Text>
                    <Button label="Request export" variant="secondary" />
                  </Stack>
                </Card>
                <Card surface="subtle" inset="lg" heading="Delete account" headingLevel={2}>
                  <Stack gap="normal" align="start">
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
        tone="danger"
        heading="Delete your account?"
        description="This permanently deletes your account and everything in it. This cannot be undone."
        confirmLabel="Delete account"
        onConfirm={() => setDeleteDialogOpen(false)}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Landmark>
  );
}
