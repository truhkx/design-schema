import * as React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { addons, types } from '@storybook/manager-api';
import { DEFAULT_SELECTION, MODES, THEMES, THEME_EVENT, current } from './theme';
import type { ModeSetting, ThemeId, ThemeSelection } from './theme';

const ADDON_ID = 'design-schema/theme-addon';
const PANEL_ID = `${ADDON_ID}/panel`;

// Only calm-precise ships React Native token modules wired into ThemeProvider today
// (packages/rn/src/theme.tsx imports that theme). warm-friendly is listed so the switch is in place
// for when the provider takes a `theme` prop; until then it is shown but not selectable.
const AVAILABLE: ReadonlySet<ThemeId> = new Set<ThemeId>(['calm-precise']);

function Chip({ label, active, disabled, onPress }: { label: string; active: boolean; disabled?: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active, disabled: disabled ?? false }}
      onPress={disabled ? undefined : onPress}
      style={[styles.chip, active && styles.chipActive, disabled && styles.chipDisabled]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ThemePanel() {
  const [selection, setSelection] = React.useState<ThemeSelection>(current.value);
  const channel = addons.getChannel();

  const apply = (next: ThemeSelection) => {
    current.value = next;
    setSelection(next);
    channel.emit(THEME_EVENT, next);
  };

  return (
    <View style={styles.panel}>
      <Text style={styles.heading}>Theme</Text>
      <View style={styles.row}>
        {THEMES.map((t) => (
          <Chip key={t} label={t} active={selection.theme === t} disabled={!AVAILABLE.has(t)} onPress={() => apply({ ...selection, theme: t })} />
        ))}
      </View>
      <Text style={styles.heading}>Mode</Text>
      <View style={styles.row}>
        {MODES.map((m: ModeSetting) => (
          <Chip key={m} label={m} active={selection.mode === m} onPress={() => apply({ ...selection, mode: m })} />
        ))}
      </View>
      <Text style={styles.note}>
        Mode drives the package ThemeProvider. Only calm-precise has React Native tokens wired into the provider; warm-friendly
        becomes selectable once ThemeProvider accepts a theme prop.
      </Text>
      <Pressable accessibilityRole="button" onPress={() => apply(DEFAULT_SELECTION)} style={styles.reset}>
        <Text style={styles.resetText}>Reset</Text>
      </Pressable>
    </View>
  );
}

addons.register(ADDON_ID, () => {
  addons.add(PANEL_ID, {
    type: types.PANEL,
    title: 'Theme',
    render: ({ active }) => (active ? <ThemePanel /> : null),
  });
});

// The panel is the system's own chrome, not a component, so its styling is deliberately not token-bound.
const styles = StyleSheet.create({
  panel: { padding: 12, gap: 8 },
  heading: { fontWeight: '600', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.7 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1, borderColor: '#999' },
  chipActive: { backgroundColor: '#1f1f1f', borderColor: '#1f1f1f' },
  chipDisabled: { opacity: 0.4 },
  chipText: { fontSize: 14 },
  chipTextActive: { color: '#ffffff' },
  note: { fontSize: 12, opacity: 0.7, marginTop: 4 },
  reset: { alignSelf: 'flex-start', marginTop: 8, paddingVertical: 6, paddingHorizontal: 12 },
  resetText: { textDecorationLine: 'underline' },
});
