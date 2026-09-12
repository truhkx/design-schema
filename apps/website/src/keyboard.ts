/**
 * The keyboard specs, read from `generated/keyboard/<Name>.json` at build time.
 *
 * One file per interactive component (29 of the 51 today), written by the same pipeline that writes
 * `generated/components.json`; a component with no keyboard model simply has no file, which is what
 * makes the "Keyboard support" accordion section conditional.
 *
 * Read through `import.meta.glob` rather than `node:fs`, for the reason ./nav.ts spells out: a
 * module in this app is bundled before it runs, which moves `import.meta.url` out from under any
 * path computed at runtime. A glob is resolved by Vite at build time against *this* file's directory,
 * so the 29 files become 29 static imports and the paths cannot go stale.
 */
import type { ComponentDef } from '../../../schema/component';

/** One key → action rule. Taken from the schema, so the generated file and this view cannot drift. */
export type KeyboardRule = NonNullable<ComponentDef['keyboard']>[number];

/** The shape of one `generated/keyboard/<Name>.json`. */
export interface KeyboardSpec {
  /** The component name, e.g. `Accordion` — the key this module is looked up by. */
  name: string;
  /** The component's `a11y.role`, carried along for the gate that presses these keys. */
  role: string;
  /** The identifier the keyboard gate mounts the component under. */
  identifier: string;
  rules: KeyboardRule[];
}

const SPECS = import.meta.glob<KeyboardSpec>('../../../generated/keyboard/*.json', {
  eager: true,
  import: 'default',
});

const BY_NAME = new Map<string, KeyboardSpec>(
  Object.values(SPECS).map((spec) => [spec.name, spec]),
);

/**
 * The keyboard model for a component, or `undefined` when it has none.
 *
 * A spec that exists but lists no rules counts as none: an empty "Keyboard support" section tells
 * the reader less than its absence does.
 */
export function keyboardSpec(name: string): KeyboardSpec | undefined {
  const spec = BY_NAME.get(name);
  return spec !== undefined && spec.rules.length > 0 ? spec : undefined;
}

/** How one rule's keys read in the Key column: `Enter or Space`, and `Space` for the literal ' '. */
export function keyLabel(rule: KeyboardRule): string {
  const keys = rule.keys.map((key) => (key === ' ' ? 'Space' : key));
  return keys.join(' or ');
}

/** The Action column: what happens, with the focus condition the rule applies in when it has one. */
export function actionLabel(rule: KeyboardRule): string {
  return rule.when === undefined ? rule.action : `${rule.action} (${rule.when})`;
}
