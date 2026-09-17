import * as React from 'react';
import { AccessibilityInfo, TextInput, View, findNodeHandle } from 'react-native';
import type { HostInstance, ViewInstance } from 'react-native';

export type FocusScopeAutoFocus = 'first' | 'last' | 'container' | 'none';
export type FocusScopeEscapeDirection = 'forward' | 'backward';

export interface FocusScopeProps {
  /** The confined content. The scope renders no element of its own beyond a wrapper that is not focusable and not announced. */
  children: React.ReactNode;
  /** Tab and Shift+Tab wrap within the scope's focusable descendants, and focus that lands outside is pulled back in. `false` turns the scope into a plain "move focus in and restore on exit" helper, for non-modal panels. Native has no Tab order to confine; together with `active` this maps to `accessibilityViewIsModal`. */
  trapped?: boolean | undefined;
  /** Where focus goes on mount: the first focusable descendant, the last, the scope's own wrapper (for reading-first dialogs), or nowhere. Native has no descendant walker, so `first`, `last` and `container` all focus the wrapper; only `none` differs. */
  autoFocus?: FocusScopeAutoFocus | undefined;
  /** On unmount, focus returns to `returnFocusTo`, or to the `TextInput` that was focused when the scope mounted. */
  restoreFocus?: boolean | undefined;
  /**
   * Explicit element to restore focus to instead of the recorded opener. Required on
   * native when the opener is not a `TextInput` — React Native exposes no generic
   * "currently focused element" — so every overlay passes its trigger ref.
   */
  returnFocusTo?: React.RefObject<ViewInstance | null> | undefined;
  /** Pause the scope without unmounting it — used while a nested scope (a Menu inside a Dialog) is open, so the innermost active scope owns modal focus. */
  active?: boolean | undefined;
  /**
   * Fired when trapped focus would have left the scope just before it wraps, with
   * the direction. Diagnostic; components do not need it. Native has no Tab order
   * to confine, so this never fires on this platform.
   */
  onEscapeAttempt?: ((direction: FocusScopeEscapeDirection) => void) | undefined;
  /** The wrapper `View` (the `scope` part). */
  ref?: React.Ref<ViewInstance> | undefined;
}

/** Whatever `TextInput` is focused right now — the one "what is focused" React Native exposes. */
function currentlyFocusedInput(): HostInstance | null {
  try {
    return TextInput.State.currentlyFocusedInput() ?? null;
  } catch {
    return null;
  }
}

/**
 * FocusScope — the smallest possible answer to the hardest accessibility bug: focus
 * that escapes a modal, or never comes back from one. It has no appearance and no
 * opinion about what is inside it.
 *
 * When to use: consumers rarely render it directly; Dialog, AlertDialog, BottomSheet
 * and ActionSheet declare it in their composition. Render it yourself only when
 * building a new modal surface the system does not have yet, with `trapped` on and a
 * dismiss control of your own — or with `trapped: false` for a non-modal panel that
 * should still move focus in and restore it on close. Do not trap focus in anything
 * that is not modal, and do not use it for composites (menus, tab lists).
 *
 * Renders a `View` with `accessibilityViewIsModal={trapped && active}` so VoiceOver
 * and TalkBack ignore siblings while the scope is the active one; a paused outer
 * scope therefore does not hide a nested Menu. There is no Tab order to confine on
 * native, so hardware-keyboard Tab is not wrapped (a platform limit) and
 * `onEscapeAttempt` never fires. `autoFocus` runs once after mount and calls
 * `AccessibilityInfo.setAccessibilityFocus` on the wrapper for `first`, `last` and
 * `container` alike — children cannot be walked for a focusable descendant — so the
 * screen reader reads the scope from its top; only `none` skips it. `restoreFocus`
 * runs once on unmount and focuses `returnFocusTo` when given, otherwise the
 * `TextInput` that was focused when the scope first rendered; an opener that is
 * neither cannot be restored. The wrapper sets no `role`, `accessibilityRole` or
 * `accessibilityLabel`, and never handles Escape or the back button — the overlay
 * owns dismissal.
 */
export function FocusScope({
  children,
  trapped = true,
  autoFocus = 'first',
  restoreFocus = true,
  returnFocusTo,
  active = true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onEscapeAttempt,
  ref,
}: FocusScopeProps): React.JSX.Element {
  const wrapperRef = React.useRef<ViewInstance>(null);
  // The wrapper ref is needed internally for setAccessibilityFocus, so the caller's
  // ref is served from it rather than attached directly.
  React.useImperativeHandle(ref, () => wrapperRef.current!, []);

  // Recorded on the first render, before any child mounts: a child TextInput with
  // `autoFocus` focuses in its own effect, which runs before this component's.
  const [capturedOpener] = React.useState<HostInstance | null>(() =>
    restoreFocus && returnFocusTo === undefined ? currentlyFocusedInput() : null,
  );

  React.useEffect(() => {
    if (autoFocus !== 'none') {
      const node = wrapperRef.current === null ? null : findNodeHandle(wrapperRef.current);
      if (node != null) {
        AccessibilityInfo.setAccessibilityFocus(node);
      }
    }

    return () => {
      if (!restoreFocus) {
        return;
      }
      // returnFocusTo is read at unmount: it names a trigger that outlives the scope.
      const opener = returnFocusTo !== undefined ? returnFocusTo.current : capturedOpener;
      const node = opener == null ? null : findNodeHandle(opener);
      if (node != null) {
        AccessibilityInfo.setAccessibilityFocus(node);
      }
    };
    // Mount/unmount only: later changes to autoFocus, restoreFocus or active do not
    // re-run either.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    // collapsable={false}: a style-less wrapper would otherwise be flattened away,
    // leaving setAccessibilityFocus and accessibilityViewIsModal no native view.
    <View ref={wrapperRef} collapsable={false} accessibilityViewIsModal={trapped && active} testID="FocusScope">
      {children}
    </View>
  );
}
