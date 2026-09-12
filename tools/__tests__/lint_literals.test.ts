/**
 * tools/lint_literals.ts — the no-design-literals gate over generated packages
 * (port of tests/test_lint_literals.py).
 *
 * One fixture file per rule, written to a temp folder so nothing under packages/ is read. React
 * Native rules key off the path (`packages/rn/`), so RN fixtures are written under that name.
 */
import { join } from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';

import * as ll from '../lint_literals.ts';
import type { Finding } from '../lint_literals.ts';
import { pySorted } from '../lib/py.ts';
import { useStd, useTmp, write } from './fixtures.ts';

const tmp = useTmp();
const std = useStd();

const savedPaths = { ...ll.paths };
afterEach(() => {
  Object.assign(ll.paths, savedPaths);
});

function scan(text: string, name = 'Widget.css', rn = false): Finding[] {
  const file = join(tmp(), rn ? 'packages/rn/src' : 'packages/react/src', name);
  write(file, text);
  return ll.scanFile(file);
}

function kinds(findings: Finding[]): string[] {
  return findings.map(([, name]) => name);
}

/** A SwiftUI source, scanned through `scanFile` so the `.swift` dispatch is covered too. */
function swift(text: string, name = 'Widget.swift'): Finding[] {
  return ll.scanFile(write(join(tmp(), 'packages/swiftui/Sources/DesignSchema', name), text));
}

/** The body of a `var body: some View` line, indented as a generated component writes it. */
function view(...modifiers: string[]): string {
  return ['Text(label)', ...modifiers.map((m) => `    ${m}`)].join('\n');
}

describe('hex color', () => {
  test('six-digit hex is a finding', () => {
    expect(scan('.ds-widget { color: #3B5BDB; }')).toEqual([[1, 'hex color', '#3B5BDB']]);
  });

  test.each(['#fff', '#ffff', '#3b5bdb80'])('short and alpha forms are findings too: %s', (hex) => {
    expect(kinds(scan(`a { color: ${hex}; }`))).toEqual(['hex color']);
  });

  test('a token reference is not a finding', () => {
    expect(scan('.ds-widget { color: var(--color-foreground); }')).toEqual([]);
  });

  test('an HTML entity is not a hex color', () => {
    expect(scan("const s = '&#8594;';", 'Widget.tsx')).toEqual([]);
  });
});

describe('pixel literal', () => {
  test('a pixel size is a finding', () => {
    expect(scan('.ds-widget { padding: 12px; }')).toEqual([[1, 'pixel literal', '12px']]);
  });

  test('zero pixels is allowed', () => {
    expect(scan('.ds-widget { margin: 0px; }')).toEqual([]);
  });

  test('relative units are allowed', () => {
    expect(scan('.ds-widget { inline-size: 1em; block-size: 100%; }')).toEqual([]);
  });

  test('a negative pixel value is a finding', () => {
    expect(kinds(scan('.ds-widget { margin-inline-start: -4px; }'))).toEqual(['pixel literal']);
  });
});

describe('duration literal', () => {
  test.each(['200ms', '2s'])('a duration is a finding: %s', (dur) => {
    expect(kinds(scan(`.ds-widget { transition: opacity ${dur}; }`))).toEqual(['duration literal']);
  });

  test('a duration token is not a finding', () => {
    expect(scan('.ds-widget { transition: opacity var(--motion-duration-fast); }')).toEqual([]);
  });

  test('a duration inside an import line is tolerated', () => {
    // Package names can look like durations; only import lines get that benefit of the doubt.
    expect(scan("import { wait } from 'sleep-500ms';", 'Widget.tsx')).toEqual([]);
    expect(kinds(scan("const t = '500ms';", 'Widget.tsx'))).toEqual(['duration literal']);
  });
});

describe('font stack', () => {
  test('a CSS font stack is a finding', () => {
    expect(kinds(scan('.ds-widget { font-family: Inter, sans-serif; }'))).toEqual(['font stack literal']);
  });

  test.each(['var(--font-family-body)', 'inherit'])('token and inherit are allowed: %s', (value) => {
    expect(scan(`.ds-widget { font-family: ${value}; }`)).toEqual([]);
  });

  test('a quoted React Native family is a finding', () => {
    expect(kinds(scan("const s = { fontFamily: 'Inter' };", 'Widget.tsx', true))).toContain('font stack literal');
  });

  test.each(["'--ds-text-font-family'", '"--ds-heading-font-family"', "'var(--font-family-body)'"])(
    'a custom-property name in a lookup table is not a font stack: %s',
    (value) => {
      // Override-hook tables map bindings to their hook names: `fontFamily: '--ds-text-font-family'`.
      expect(scan(`const HOOKS = { fontFamily: ${value} };`, 'Widget.tsx')).toEqual([]);
    },
  );
});

describe('named color', () => {
  test('a named CSS color is a finding', () => {
    expect(kinds(scan('.ds-widget { color: white; }'))).toEqual(['named color']);
  });

  test('the word inside a label string is not a color', () => {
    expect(scan("const label = 'Black Friday sale';", 'Widget.tsx')).toEqual([]);
  });

  test('a quoted color assigned to a color prop is still a finding', () => {
    expect(kinds(scan("const s = { color: 'white' };", 'Widget.tsx'))).toEqual(['named color']);
  });
});

describe('React Native size numbers', () => {
  test('a bare size number is a finding only under packages/rn', () => {
    const src = 'const s = { width: 20, padding: 8 };';
    expect(scan(src, 'Widget.tsx', true)).toEqual([
      [1, 'RN size literal', 'width: 20'],
      [1, 'RN size literal', 'padding: 8'],
    ]);
    expect(scan(src, 'Widget.tsx', false)).toEqual([]);
  });

  test.each(pySorted([...ll.ALLOWED_NUMBERS]))('hairline and half-offset numbers are allowed: %s', (n) => {
    expect(scan(`const s = { borderWidth: ${n} };`, 'Widget.tsx', true)).toEqual([]);
  });

  test('a token lookup is not a finding', () => {
    expect(scan('const s = { padding: t.spaceMd, gap: t.space2 };', 'Widget.tsx', true)).toEqual([]);
  });

  test('opacity is not a size', () => {
    expect(scan('const s = { opacity: 0.5 };', 'Widget.tsx', true)).toEqual([]);
  });

  test('React Native stories are exempt', () => {
    expect(scan('const s = { width: 320 };', 'Widget.stories.tsx', true)).toEqual([]);
  });
});

describe('SwiftUI literals', () => {
  test('the gate: a bare padding is a finding, the token is not', () => {
    expect(swift(view('.padding(12)'))).toEqual([[2, 'SwiftUI literal in .padding(', '12']]);
    expect(swift(view('.padding(theme.spaceMd)'))).toEqual([]);
  });

  test.each(ll.SWIFT_CALLS)('every policed call reports the number it wraps: %s', (call) => {
    const findings = swift(view(`${call}44)`));
    expect(findings).toEqual([[2, `SwiftUI literal in ${call}`, '44']]);
  });

  test.each([
    '.frame(width: theme.sizeTargetMin, height: theme.sizeTargetMin)',
    '.cornerRadius(theme.radiusMd)',
    '.font(.system(size: theme.fontSizeMd, weight: .semibold))',
    '.foregroundStyle(theme.colorActionPrimaryForeground)',
    '.animation(theme.animation(.motionEasingStandard), value: isOn)',
    '.zIndex(theme.number(item.layer))',
    '.padding(.horizontal, theme.space2)',
  ])('a token read through any of them is clean: %s', (modifier) => {
    expect(swift(view(modifier))).toEqual([]);
  });

  test.each(['0', '1', '-1', '2', '-2', '0.5', '0.25', '-0.75'])('0, 1, 2 and fractions are allowed: %s', (n) => {
    expect(swift(view(`.padding(${n})`))).toEqual([]);
  });

  test.each(['12', '1.5', '44.0', '1_000', '0xFF3B30'])('anything else is a finding: %s', (n) => {
    expect(kinds(swift(view(`.padding(${n})`)))).toEqual(['SwiftUI literal in .padding(']);
  });

  test('a number outside the policed calls is not this rule\'s business', () => {
    // Indices, counts and loop bounds are not design values.
    expect(swift('let columns = 3\nfor i in 0..<12 { rows.append(i) }')).toEqual([]);
  });

  test('a call spanning several lines is still covered, and closes again', () => {
    const src = ['Text(label)', '    .frame(', '        width: 44,', '        height: theme.sizeTargetMin', '    )', '    .tag(7)'].join('\n');
    expect(swift(src)).toEqual([[3, 'SwiftUI literal in .frame(', '44']]);
  });

  test('the innermost call owns the number', () => {
    expect(swift(view('.frame(width: box(Color(white: 0.9, opacity: 12), 44))'))).toEqual([
      [2, 'SwiftUI literal in Color(', '12'],
      [2, 'SwiftUI literal in .frame(', '44'],
    ]);
  });

  test('`.font(` alone carries a token, only `.system(size:` carries a size', () => {
    expect(swift(view('.font(theme.fontBody)'))).toEqual([]);
    expect(kinds(swift(view('.font(.system(size: 14))')))).toEqual(['SwiftUI literal in .font(.system(size:']);
  });

  test('a longer identifier ending in Color is not `Color(`', () => {
    expect(swift('let c = BrandColor(17)')).toEqual([]);
    expect(kinds(swift('let c = Color(17)'))).toEqual(['SwiftUI literal in Color(']);
  });

  test('a token name that ends in a digit is not a number', () => {
    expect(swift(view('.padding(theme.space2)', '.zIndex(theme.layer1)'))).toEqual([]);
  });

  test('the literal-ok mark exempts its own line, not the whole call', () => {
    expect(swift(view('.padding(12) // literal-ok: the sheet grabber is a fixed 12pt handle'))).toEqual([]);
    const src = ['Text(label)', '    .frame(', '        width: 44, // literal-ok: the macOS toolbar item is fixed', '        height: 44', '    )'].join('\n');
    expect(swift(src)).toEqual([[4, 'SwiftUI literal in .frame(', '44']]);
  });

  test('comments and strings are not scanned, and leave the parens balanced', () => {
    expect(swift(view('// .padding(12) before tokens', '.padding(theme.spaceMd)'))).toEqual([]);
    expect(swift(view('/* .padding(12 */ .padding(theme.spaceMd)'))).toEqual([]);
    expect(swift('/* a note about\n   .padding(12)\n*/\nText(label).padding(theme.spaceMd)')).toEqual([]);
    expect(swift(view('.accessibilityLabel("12 of 30 (in stock)")', '.padding(theme.spaceMd)'))).toEqual([]);
  });

  test('the CSS rules do not run on Swift: `Color(red:green:blue:)` is argument labels', () => {
    expect(swift('let c = Color(red: theme.r, green: theme.g, blue: theme.b)')).toEqual([]);
  });

  test('Swift is only linted under packages/swiftui, but the rule is the file type', () => {
    // The walk decides which files are handed over; `scanFile` keys off `.swift` alone.
    expect(kinds(ll.scanFile(write(join(tmp(), 'Loose.swift'), 'Text(l).padding(12)')))).toEqual(['SwiftUI literal in .padding(']);
  });
});

describe('the visually-hidden exemption', () => {
  const CLIP = `.ds-widget__visually-hidden {
  position: absolute;
  inline-size: 1px;
  block-size: 1px;
  margin: -1px;
  clip-path: inset(50%);
  white-space: nowrap;
}
`;

  test('one-pixel boxes in the clip pattern are allowed', () => {
    expect(scan(CLIP)).toEqual([]);
  });

  test('one pixel outside that context is still a finding', () => {
    expect(scan('.ds-widget { border-block-end: 1px solid var(--color-border); }')).toEqual([[1, 'pixel literal', '1px']]);
  });

  test('the exemption does not cover other sizes', () => {
    expect(scan(CLIP.replace('margin: -1px;', 'margin: -2px;'))).toEqual([[5, 'pixel literal', '-2px']]);
  });
});

describe('the color-mix exemption', () => {
  test('mixing tokens is allowed', () => {
    const css = '.ds-widget:hover { background: color-mix(in oklab, var(--color-action-primary-background), transparent 20%); }';
    expect(scan(css)).toEqual([]);
  });

  test('mixing literals is a finding', () => {
    const found = kinds(scan('.ds-widget { background: color-mix(in srgb, #ffffff 50%, #000000); }'));
    expect(found).toContain('rgb/hsl/oklch color');
    expect(found.filter((k) => k === 'hex color')).toHaveLength(2);
  });

  test.each(['rgb(', 'rgba(', 'hsl(', 'oklch('])('other color functions are findings: %s', (fn) => {
    expect(kinds(scan(`.ds-widget { color: ${fn}0 0 0); }`))).toEqual(['rgb/hsl/oklch color']);
  });
});

describe('the literal-ok mark', () => {
  test('a CSS mark exempts the line', () => {
    expect(scan('.ds-widget { border-width: 3px; /* literal-ok: hairline on hi-dpi */ }')).toEqual([]);
  });

  test('a line-comment mark exempts the line', () => {
    expect(scan('const s = { width: 20 }; // literal-ok: icon glyph box', 'Widget.tsx', true)).toEqual([]);
  });

  test('the mark covers only its own line', () => {
    expect(scan('a { padding: 12px; /* literal-ok: x */ }\nb { padding: 12px; }')).toEqual([[2, 'pixel literal', '12px']]);
  });
});

describe('comments', () => {
  test('line comments are ignored', () => {
    expect(scan('// was 12px before tokens\nconst a = 1;', 'Widget.tsx')).toEqual([]);
  });

  test('a trailing comment is stripped before scanning', () => {
    expect(scan('const a = t.spaceMd; // not 12px', 'Widget.tsx')).toEqual([]);
  });

  test('block comments are ignored across lines', () => {
    const css = '/* thumb travel:\n   trackWidth - 20px - 2px\n*/\n.ds-widget { color: var(--color-foreground); }';
    expect(scan(css)).toEqual([]);
  });
});

describe('main', () => {
  test('--files scans only the named files and fails on a finding', () => {
    const bad = write(join(tmp(), 'Bad.css'), 'a { color: #123456; }');
    const good = write(join(tmp(), 'Good.css'), 'a { color: var(--color-foreground); }');
    expect(ll.main(['--files', bad, good])).toBe(1);
    expect(std.out()).toContain('Bad.css:1: hex color `#123456`');
    expect(std.out()).toContain('1 finding(s) in 2 file(s)');
  });

  test('a clean set exits zero', () => {
    const good = write(join(tmp(), 'Good.tsx'), 'export const a = 1;');
    expect(ll.main(['--files', good])).toBe(0);
    expect(std.out()).toContain('✔ lint_literals: 0 finding(s)');
  });

  test('declaration files and other extensions are skipped', () => {
    const dts = write(join(tmp(), 'css.d.ts'), "declare const x: '#ffffff';");
    const md = write(join(tmp(), 'README.md'), 'padding: 12px');
    expect(ll.main(['--files', dts, md])).toBe(0);
  });

  test('with no --files it walks packages/<pkg>/src, and --platform narrows to one', () => {
    Object.assign(ll.paths, { ROOT: tmp() });
    write(join(tmp(), 'packages/react/src/A.css'), 'a { color: #123456; }');
    write(join(tmp(), 'packages/rn/src/B.tsx'), 'const s = { width: 20 };');
    expect(ll.main([])).toBe(1);
    expect(std.out()).toContain('2 finding(s) in 2 file(s)');
    expect(ll.main(['--platform', 'rn'])).toBe(1);
    expect(std.out()).toContain('RN size literal');
    expect(std.out()).toContain('1 finding(s) in 1 file(s)');
  });

  test('swiftui is walked at Sources/DesignSchema, subdirectories included', () => {
    // SwiftPM's layout, and the support types live one level down.
    Object.assign(ll.paths, { ROOT: tmp() });
    write(join(tmp(), 'packages/swiftui/Sources/DesignSchema/Widget.swift'), 'Text(l).padding(theme.spaceMd)');
    write(join(tmp(), 'packages/swiftui/Sources/DesignSchema/Support/Panel.swift'), 'Text(l).cornerRadius(12)');
    write(join(tmp(), 'packages/swiftui/Sources/DesignSchemaTokens/Theme.swift'), 'let spaceMd: CGFloat = 12');
    expect(ll.main(['--platform', 'swiftui'])).toBe(1);
    expect(std.out()).toContain(join('Support', 'Panel.swift') + ':1: SwiftUI literal in .cornerRadius( `12`');
    expect(std.out()).toContain('1 finding(s) in 2 file(s)'); // the token package is not a component
  });

  test('a finding inside the repository is reported relative to it', () => {
    Object.assign(ll.paths, { ROOT: tmp() });
    write(join(tmp(), 'packages/react/src/A.css'), 'a { color: #123456; }');
    ll.main(['--platform', 'web']);
    expect(std.out()).toContain(join('packages', 'react', 'src', 'A.css') + ':1:');
  });

  test('argparse exit codes: an unknown flag and a bad --platform choice both exit 2', () => {
    expect(ll.main(['--nope'])).toBe(2);
    expect(ll.main(['--platform', 'swift'])).toBe(2); // the platform is `swiftui`
    expect(std.err()).toContain("invalid choice: 'swift' (choose from web, lit, rn, swiftui)");
  });
});
