import * as React from 'react';
import { ScrollView } from 'react-native';
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
  TabPanel,
  Tabs,
  Text,
  ToastProvider,
  useToast,
} from '../src';
import type { FormValues } from '../src';

interface SavedProfile {
  name: string;
  email: string;
  displayName: string;
  website: string;
}

const EMPTY_PROFILE: SavedProfile = { name: '', email: '', displayName: '', website: '' };

/**
 * Settings pattern page composed entirely from Design Schema React Native components.
 *
 * A `ToastProvider` wraps the screen so the profile form can confirm a save; the
 * region it renders is an overlay outside the normal flow (see the gap list), not a
 * sibling inside the page's own Stack. Everything else is one scrollable `main`
 * Landmark holding a Container, a page Heading, and a four-tab settings surface.
 */
export function SettingsPage(): React.JSX.Element {
  return (
    <ToastProvider>
      <SettingsPageBody />
    </ToastProvider>
  );
}

function SettingsPageBody(): React.JSX.Element {
  const { toast } = useToast();

  const [savedProfile, setSavedProfile] = React.useState<SavedProfile>(EMPTY_PROFILE);
  const [formResetKey, setFormResetKey] = React.useState(0);

  const [pushEnabled, setPushEnabled] = React.useState(false);

  // Presentational only — see the gap list: the page has no route to the theme's
  // mode or a density setting without `useTheme()`, which these rules forbid here.
  const [colorMode, setColorMode] = React.useState('system');
  const [density, setDensity] = React.useState('comfortable');

  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const handleProfileSubmit = (values: FormValues): void => {
    // Fakes the save; a real screen would await its own request here.
    Promise.resolve().then(() => {
      setSavedProfile({
        name: (values.name as string | undefined) ?? '',
        email: (values.email as string | undefined) ?? '',
        displayName: (values.displayName as string | undefined) ?? '',
        website: (values.website as string | undefined) ?? '',
      });
      toast({ message: 'Changes saved' });
    });
  };

  const handleProfileCancel = (): void => {
    // Remounts the Form (and its uncontrolled Inputs) back to the last saved values.
    setFormResetKey((key) => key + 1);
  };

  return (
    <ScrollView>
      <Landmark role="main">
        <Container width="content">
          <Stack gap="section">
            <Heading level={1}>Settings</Heading>
            <Tabs
              label="Settings sections"
              keepMounted
              tabs={[
                { id: 'profile', label: 'Profile' },
                { id: 'notifications', label: 'Notifications' },
                { id: 'appearance', label: 'Appearance' },
                { id: 'account', label: 'Account' },
              ]}
            >
              <TabPanel id="profile">
                <Form
                  key={formResetKey}
                  name="profile"
                  label="Profile"
                  errorSummary={false}
                  onSubmit={handleProfileSubmit}
                  actions={
                    <Stack direction="horizontal" gap="tight" justify="end">
                      <Button label="Cancel" variant="secondary" onPress={handleProfileCancel} />
                      <Button label="Save changes" variant="primary" type="submit" />
                    </Stack>
                  }
                >
                  <Stack gap="loose">
                    <Fieldset legend="Your details">
                      <Input label="Name" name="name" defaultValue={savedProfile.name} required />
                      <Input
                        label="Email"
                        name="email"
                        type="email"
                        defaultValue={savedProfile.email}
                        required
                        description="We send receipts here."
                      />
                    </Fieldset>
                    <Fieldset legend="Public profile">
                      <Input label="Display name" name="displayName" defaultValue={savedProfile.displayName} />
                      <Input label="Website" name="website" type="url" defaultValue={savedProfile.website} />
                    </Fieldset>
                  </Stack>
                </Form>
              </TabPanel>

              <TabPanel id="notifications">
                <Stack gap="loose">
                  <Fieldset legend="Email me about">
                    <Checkbox label="Product updates" name="productUpdates" description="About once a month." />
                    <Checkbox label="Security alerts" name="securityAlerts" defaultChecked />
                    <Checkbox label="Tips and tutorials" name="tipsAndTutorials" />
                  </Fieldset>
                  <Fieldset legend="Push notifications">
                    <Switch
                      label="Enable push notifications"
                      checked={pushEnabled}
                      onValueChange={setPushEnabled}
                    />
                    <RadioGroup
                      label="Frequency"
                      name="frequency"
                      disabled={!pushEnabled}
                      options={[
                        { value: 'immediately', label: 'Immediately' },
                        { value: 'daily', label: 'Daily digest' },
                        { value: 'weekly', label: 'Weekly digest' },
                      ]}
                    />
                  </Fieldset>
                </Stack>
              </TabPanel>

              <TabPanel id="appearance">
                <Stack gap="loose">
                  <Fieldset legend="Theme">
                    <SegmentedControl
                      label="Color mode"
                      value={colorMode}
                      onChange={setColorMode}
                      options={[
                        { value: 'system', label: 'System' },
                        { value: 'light', label: 'Light' },
                        { value: 'dark', label: 'Dark' },
                      ]}
                    />
                  </Fieldset>
                  <Fieldset legend="Density">
                    <RadioGroup
                      label="Layout density"
                      name="density"
                      value={density}
                      onChange={setDensity}
                      description="Affects tables and lists."
                      options={[
                        { value: 'comfortable', label: 'Comfortable' },
                        { value: 'compact', label: 'Compact' },
                      ]}
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
                      <Button label="Delete account…" variant="danger" onPress={() => setDeleteOpen(true)} />
                    </Stack>
                  </Card>
                </Stack>
              </TabPanel>
            </Tabs>
          </Stack>
        </Container>
      </Landmark>

      <AlertDialog
        open={deleteOpen}
        tone="danger"
        heading="Delete account?"
        description="This will permanently delete your account and everything in it. This cannot be undone."
        confirmLabel="Delete account"
        onConfirm={() => setDeleteOpen(false)}
        onCancel={() => setDeleteOpen(false)}
      />
    </ScrollView>
  );
}
