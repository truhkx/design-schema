"""
Keyboard gate — derive Playwright tests from each component's `keyboard` block.

Nobody writes a keyboard test per component. The doc says "Escape closes" as data
(`{ keys: [Escape], expect: closes }`), and this script turns every such rule into a test
against the component's `Keyboard` Storybook story, for React (web) and Lit:

    generated/keyboard/<Name>.<platform>.spec.ts

Conventions the generated code must follow (they are in the platform templates):
  - every component with a `keyboard` block ships a story named `Keyboard` (id `<title-id>--keyboard`)
    that renders the component OPEN / present with at least three focusable children, and the
    trigger (if any) in the same story;
  - the component root carries the schema's a11y.role (or `data-ds="<Name>"` when role is none).

Rules whose `expect` is `manual` are listed in the spec as `test.skip` so the report shows
coverage, not silence.

Usage:  python3 tools/keyboard_tests.py            # writes generated/keyboard/*.spec.ts
        pnpm gates:keyboard                         # runs them (Playwright starts the Storybooks)
"""
from __future__ import annotations

import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GENERATED = ROOT / "generated"
OUT = GENERATED / "keyboard"
PLATFORMS = {"web": {"suffix": "React", "port": 6007}, "lit": {"suffix": "Lit", "port": 6008}}

KEY_MAP = {" ": "Space", "Shift+Tab": "Shift+Tab"}  # Playwright key names; everything else passes through
LETTERS = re.compile(r"^[a-z]-[a-z]$")


def story_id(name: str, suffix: str) -> str:
    """Storybook's id for title '<Name>/<Suffix>' and export 'Keyboard'."""
    title = f"{name}/{suffix}".lower().replace("/", "-")
    return f"{title}--keyboard"


def root_locator(c: dict) -> str:
    role = c["a11y"]["role"]
    if role in ("none", "landmark", "img"):
        return f'page.locator(\'[data-ds="{c["name"]}"]\').first()'
    return f"page.getByRole('{role}').first()"


def expect_block(exp: str) -> str:
    return {
        "closes": "await expect(root).toBeHidden();",
        "opens": "await expect(root).toBeVisible();",
        "focus-next": "expect(await focusIndex(page, root)).toBe(before + 1);",
        "focus-prev": "expect(await focusIndex(page, root)).toBe(before - 1);",
        "focus-first": "expect(await focusIndex(page, root)).toBe(0);",
        "focus-last": "expect(await focusIndex(page, root)).toBe(await focusableCount(page, root) - 1);",
        "focus-wraps-to-first": "expect(await focusIndex(page, root)).toBe(0);",
        "focus-wraps-to-last": "expect(await focusIndex(page, root)).toBe(await focusableCount(page, root) - 1);",
        "focus-trigger": "await expect(trigger(page)).toBeFocused();",
        "focus-unchanged": "expect(await focusIndex(page, root)).toBe(before);",
        "toggles": "expect(await ariaState(page)).not.toBe(stateBefore);",
        "selects": "expect(await ariaState(page)).toMatch(/true/);",
    }[exp]


def from_block(frm: str) -> str:
    return {
        "trigger": "await trigger(page).focus();",
        "first": "await focusAt(page, root, 0);",
        "last": "await focusAt(page, root, await focusableCount(page, root) - 1);",
        "inside": "await focusAt(page, root, 1);",
        "any": "",
    }[frm]


HELPERS = """
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([data-focus-sentinel]), [role="menuitem"], [role="option"], [role="radio"]';

/** Focusable elements inside the root, in DOM order, crossing shadow roots. */
async function focusables(page: Page, root: Locator): Promise<number> {
  return root.evaluate((el, sel) => {
    const out: Element[] = [];
    const walk = (n: Element | ShadowRoot) => {
      for (const c of Array.from(n.querySelectorAll(sel))) out.push(c);
      for (const c of Array.from(n.querySelectorAll('*'))) if ((c as HTMLElement).shadowRoot) walk((c as HTMLElement).shadowRoot!);
    };
    walk(el);
    (window as any).__dsFocusables = out;
    return out.length;
  }, FOCUSABLE);
}
async function focusableCount(page: Page, root: Locator): Promise<number> { return focusables(page, root); }
async function focusAt(page: Page, root: Locator, i: number): Promise<void> {
  await focusables(page, root);
  await page.evaluate((i) => {
    const el = (window as any).__dsFocusables[i] as HTMLElement | undefined;
    if (!el) return;
    if (el.getAttribute('role') === 'option') {
      // activedescendant composite: focus the listbox and point it at the option via a click (sets active)
      const list = el.closest('[role="listbox"]') as HTMLElement | null;
      list?.focus();
      el.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, composed: true }));
    } else {
      el.focus();
    }
  }, i);
}
/** Index of the deep active element among the root's focusables, or -1. Composites that keep DOM focus on a
 *  container and point at the active item with aria-activedescendant (Listbox, Combobox) resolve to that item. */
async function focusIndex(page: Page, root: Locator): Promise<number> {
  await focusables(page, root);
  return page.evaluate(() => {
    let a: Element | null = document.activeElement;
    while (a && (a as HTMLElement).shadowRoot && (a as HTMLElement).shadowRoot!.activeElement) a = (a as HTMLElement).shadowRoot!.activeElement;
    const desc = a?.getAttribute('aria-activedescendant');
    if (desc) {
      const scope = (a!.getRootNode() as Document | ShadowRoot);
      const target = scope.getElementById ? scope.getElementById(desc) : null;
      if (target) a = target;
    }
    return ((window as any).__dsFocusables as Element[]).indexOf(a as Element);
  });
}
function trigger(page: Page): Locator {
  return page.locator('[aria-haspopup], [aria-expanded], [aria-controls]').first();
}
/** aria-expanded / aria-checked / aria-selected of the deep active element (or the trigger), for toggles/selects. */
async function ariaState(page: Page): Promise<string> {
  return page.evaluate(() => {
    let a: Element | null = document.activeElement;
    while (a && (a as HTMLElement).shadowRoot && (a as HTMLElement).shadowRoot!.activeElement) a = (a as HTMLElement).shadowRoot!.activeElement;
    const el = a ?? document.querySelector('[aria-haspopup], [aria-expanded]');
    return [el?.getAttribute('aria-expanded'), el?.getAttribute('aria-checked'), el?.getAttribute('aria-selected')].join('|');
  });
}
"""


def spec_for(c: dict, platform: str) -> str:
    name = c["name"]
    cfg = PLATFORMS[platform]
    sid = story_id(name, cfg["suffix"])
    lines = [
        "// Generated by tools/keyboard_tests.py from the `keyboard` block of the " + name + " doc. Do not edit.",
        "import { test, expect, type Page, type Locator } from '@playwright/test';",
        HELPERS,
        f"test.describe('{name} ({platform}) keyboard', () => {{",
        "  test.beforeEach(async ({ page }) => {",
        f"    await page.goto('/iframe.html?id={sid}&viewMode=story');",
        f"    await expect({root_locator(c)}).toBeVisible();",
        "  });",
    ]
    for i, rule in enumerate(c.get("keyboard") or []):
        exp = rule.get("expect", "manual")
        frm = rule.get("from", "inside")
        for key in rule["keys"]:
            if LETTERS.match(key):
                key_name, label = "a", "typeahead letter"
            else:
                key_name, label = KEY_MAP.get(key, key), key
            title = f"{label}: {rule['action']}".replace("'", "\\'")
            when = f" ({rule['when']})" if rule.get("when") else ""
            if exp == "manual":
                lines.append(f"  test.skip('{title}{when} — manual', async () => {{}});")
                continue
            lines += [
                f"  test('{title}{when}', async ({{ page }}) => {{",
                f"    const root = {root_locator(c)};",
                f"    {from_block(frm)}",
                "    const before = await focusIndex(page, root);",
                "    const stateBefore = await ariaState(page);",
                "    void before; void stateBefore;",
                f"    await page.keyboard.press('{key_name}');",
                f"    {expect_block(exp)}",
                "  });",
            ]
    lines.append("});")
    return "\n".join(lines) + "\n"


def main() -> int:
    comps = json.loads((GENERATED / "components.json").read_text(encoding="utf-8"))
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("*.spec.ts"):
        old.unlink()
    n_specs = n_tests = n_manual = 0
    for entry in comps:
        c = entry["component"]
        if not c.get("keyboard"):
            continue
        for platform in PLATFORMS:
            if not c["platforms"].get(platform, {}).get("supported", True) or platform not in c["platforms"]:
                continue
            (OUT / f"{c['name']}.{platform}.spec.ts").write_text(spec_for(c, platform), encoding="utf-8")
            n_specs += 1
        for r in c["keyboard"]:
            for _ in r["keys"]:
                if r.get("expect", "manual") == "manual":
                    n_manual += 1
                else:
                    n_tests += 1
    print(f"✔ keyboard gate: {n_specs} spec(s), {n_tests} auto-tested rule(s) per platform, {n_manual} manual → {OUT.relative_to(ROOT)}/")
    return 0


if __name__ == "__main__":
    sys.exit(main())
