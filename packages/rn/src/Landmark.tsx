import * as React from 'react';
import { View } from 'react-native';
import type { AccessibilityRole, Role, ViewInstance } from 'react-native';
import { Text } from './Text';

export type LandmarkRole =
  | 'banner'
  | 'navigation'
  | 'main'
  | 'complementary'
  | 'contentinfo'
  | 'region'
  | 'search'
  | 'form';

export interface LandmarkProps {
  /** Which landmark this is. `banner` (site header), `navigation`, `main` (exactly one per page), `complementary` (sidebar), `contentinfo` (site footer), `region` (a labelled section that deserves a jump point), `search`, `form` (a labelled form that is a page-level region). */
  role: LandmarkRole;
  /** Accessible name. Required for `region` and `form`, and whenever the page has more than one landmark of the same role. Not shown visually. An empty string counts as absent. On React Native it is applied as `accessibilityLabel` only for `navigation`, `region` and `form`; on any other role it is silently dropped, with no warning. */
  label?: string | undefined;
  /** The region's content. String and number children are wrapped in the package `Text`. */
  children: React.ReactNode;
  /** The root `View`. */
  ref?: React.Ref<ViewInstance> | undefined;
}

/** Roles whose `label` becomes the group's `accessibilityLabel` on iOS and Android. */
const LABELLED_ROLES: ReadonlySet<LandmarkRole> = new Set<LandmarkRole>(['navigation', 'region', 'form']);

/** Roles that are only landmarks when they carry a name. */
const NAME_REQUIRED_ROLES: ReadonlySet<LandmarkRole> = new Set<LandmarkRole>(['region', 'form']);

/**
 * Landmark — the page's table of contents for assistive technology. Every page
 * gets the same, correct set of regions without anyone remembering which element
 * implies which role.
 *
 * When to use: Wrap the page's major regions: one `banner`, exactly one `main`,
 * `navigation` for each navigation block (labelled when there is more than one),
 * `complementary` for sidebars, `contentinfo` for the footer, `search` around the
 * site search, and `region` for any other section a user might want to jump to. Do
 * not wrap everything, and do not use it to style a region — it has no visual
 * bindings by design.
 *
 * Renders a `View` with the `role` prop, which react-native-web turns into the
 * semantic element (`nav`, `main`, …) and iOS/Android map to the nearest
 * accessibility role or ignore. `search` is the one role missing from RN's `role`
 * union, so it is passed as the legacy `accessibilityRole="search"`, which
 * react-native-web maps to the same ARIA landmark. `label` is applied as `accessibilityLabel` only for
 * `navigation`, `region` and `form`, so the group has a name for TalkBack and
 * VoiceOver without every View announcing a role. The container is not
 * `accessible`, so its children stay individually reachable. A View cannot hold a
 * raw string, so string and number children are wrapped in `Text`. There is no
 * jump-to-landmark on native — the value is web parity and one structure for the
 * same screen code. In development it warns when `region` or `form` has no `label`.
 */
export function Landmark({ role, label, children, ref }: LandmarkProps): React.JSX.Element {
  const name = label === '' ? undefined : label;

  React.useEffect(() => {
    if (__DEV__ && NAME_REQUIRED_ROLES.has(role) && name === undefined) {
      console.warn(`Landmark: role "${role}" is only a landmark when it has a label.`);
    }
  }, [role, name]);

  // Every landmark role except `search` is in RN's `Role` union (RN ≥ 0.73); `search`
  // exists only in the legacy `accessibilityRole` union, which react-native-web maps
  // to the same ARIA `search` landmark.
  const nativeRole: Role | undefined = role === 'search' ? undefined : role;
  const legacyRole: AccessibilityRole | undefined = role === 'search' ? 'search' : undefined;

  const content =
    typeof children === 'string' || typeof children === 'number' ? (
      <Text>{children}</Text>
    ) : (
      React.Children.map(children, (child) =>
        typeof child === 'string' || typeof child === 'number' ? <Text>{child}</Text> : child,
      )
    );

  return (
    <View
      ref={ref}
      testID="Landmark"
      role={nativeRole}
      accessibilityRole={legacyRole}
      accessibilityLabel={LABELLED_ROLES.has(role) ? name : undefined}
    >
      {content}
    </View>
  );
}
