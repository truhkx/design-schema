import * as React from 'react';
import { AccessibilityInfo, TextInput, View, findNodeHandle } from 'react-native';

export type FocusScopeAutoFocus = 'first' | 'last' | 'container' | 'none';
export type FocusScopeEscapeDirection = 'forward' | 'backward';

export interface FocusScopeProps {
  /** The confined content. The scope renders no element of its own beyond a wrapper that is not focusable and not announced. */
  children: React.ReactNode;
  /** Tab and Shift+Tab wrap within the scope's focusable descendants, and focus that lands outside is pulled back in. `false` turns the scope into a plain "move focus in and restore on exit" helper, for non-modal panels. Native has no Tab order to confine; this only maps to `accessibilityViewIsModal`. */
  trapped?: boolean;
  /** Where focus goes on mount: the first focusable descendant, the last, the scope's own wrapper (for reading-first dialogs), or nowhere. Native has no descendant walker, so `first`, `last` and `container` all focus the wrapper; only `none` differs. */
  autoFocus?: FocusScopeAutoFocus;
  /** On unmount, focus returns to the element that was focused when the scope mounted, if it can still be found. */
  restoreFocus?: boolean;
  /** Pause the scope without unmounting it — used while a nested scope (a Menu inside a Dialog) is open, so the innermost active scope owns modal focus. */
  active?: boolean;
  /**
   * Fired when trapped focus would have left the scope just before it wraps, with
   * the direction. Diagnostic; components do not need it. Native has no Tab order
   * to confine, so this never fires on this platform.
   */
  onEscapeAttempt?: (direction: FocusScopeEscapeDirection) => void;
}

/**
 * FocusScope — the smallest possible answer to the hardest accessibility bug: focus
 * that escapes a modal, or never comes back from one. It has no appearance and no
 * opinion about what is inside it.
 *
 * When to use: Consumers rarely render it directly; Dialog, AlertDialog, BottomSheet
 * and ActionSheet declare it in their composition. Render it yourself only when
 * building a new modal surface the system does not have yet, with `trapped` on — or
 * with `trapped: false` for a non-modal panel that should still move focus in and
 * restore it on close. Do not trap focus in anything that is not modal, and do not
 * nest it inside a surface that already does the same work.
 *
 * Renders a `View` with `accessibilityViewIsModal={trapped && active}` so VoiceOver
 * and TalkBack ignore siblings while the scope is the active one. There is no Tab
 * order to confine on native: `autoFocus` calls `AccessibilityInfo.setAccessibilityFocus`
 * on the wrapper after mount (RN has no way to walk arbitrary children for the
 * "first" or "last" focusable descendant, so those and `container` all resolve to
 * the wrapper; only `none` skips it). `restoreFocus` captures whatever `TextInput`
 * was focused when the scope mounted — the only "currently focused element" RN
 * exposes — and refocuses it on unmount; an opener that was not a text input cannot
 * be captured, a platform limit. `onEscapeAttempt` never fires on native.
 */
export function FocusScope({
  children,
  trapped = true,
  autoFocus = 'first',
  restoreFocus = true,
  active = true,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onEscapeAttempt,
}: FocusScopeProps): React.JSX.Element {
  const wrapperRef = React.useRef<View>(null);
  const openerRef = React.useRef<ReturnType<typeof TextInput.State.currentlyFocusedInput> | null>(null);

  React.useEffect(() => {
    if (restoreFocus) {
      try {
        openerRef.current = TextInput.State.currentlyFocusedInput();
      } catch {
        openerRef.current = null;
      }
    }

    if (autoFocus !== 'none') {
      const node = wrapperRef.current === null ? null : findNodeHandle(wrapperRef.current);
      if (node !== null) {
        AccessibilityInfo.setAccessibilityFocus(node);
      }
    }

    return () => {
      if (!restoreFocus || openerRef.current === null) {
        return;
      }
      const node = findNodeHandle(openerRef.current);
      if (node !== null) {
        AccessibilityInfo.setAccessibilityFocus(node);
      }
    };
    // Mount/unmount only: autoFocus and restoreFocus describe what happens at those
    // two moments, not a reaction to every prop change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View ref={wrapperRef} accessibilityViewIsModal={trapped && active} testID="FocusScope">
      {children}
    </View>
  );
}
