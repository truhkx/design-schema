/**
 * tools/naming_demo.ts is job 523's evidence, so the part of it that decides *what counts as proof*
 * is what these tests are about: the tokenizer that claims two files have the same shape, and the
 * classifier that claims every difference between them is an identifier the naming doc moves.
 *
 * The classifier has to be able to say no. Most of what is below is a difference that is not a
 * rename — an added argument, a moved gate hook, a prop the doc never mentions — checked to make
 * sure `compare` reports it, because a checker that cannot fail is not a gate.
 */
import { describe, expect, test } from 'vitest';

import { resolve } from '../naming.ts';
import { BRAND, compare, explain, fileSet, lexicon, protectedVocabulary, SEEDS, tokenize } from '../naming_demo.ts';
import type { Pairing } from '../naming_demo.ts';

const lex = lexicon(resolve(BRAND));
const pair: Pairing = { canonical: 'Button.tsx', brand: 'CtaButton.tsx', dir: 'src' };

/** `compare` against a hand-written canonical/brand pair, so a case is two short strings. */
function diff(canonical: string, brand: string, p: Pairing = pair) {
  return compare(p, brand, canonical, lex);
}

describe('tokenize', () => {
  test('splits names from everything between them, losslessly', () => {
    const text = `<span className="ds-button__label">{label}</span>`;
    const { tokens, gaps } = tokenize(text);
    expect(tokens).toEqual(['span', 'className', 'ds-button__label', 'label', 'span']);
    // The gaps and the tokens interleave back into the original: nothing is dropped or merged.
    expect(gaps.map((gap, i) => gap + (tokens[i] ?? '')).join('')).toBe(text);
  });

  test('a custom property is one name, prefix and all', () => {
    expect(tokenize('  --ds-button-padding-inline: var(--space-md);').tokens).toEqual([
      '--ds-button-padding-inline',
      'var',
      '--space-md',
    ]);
  });

  test('a template literal does not swallow its own interpolation', () => {
    // `$` is a valid identifier character, so a naive tokenizer reads `ds-disclosure$` here — a name
    // neither file contains, and one no rename could ever explain.
    // The `$` is left as a name of its own, which is harmless — it is identical on both sides and
    // no rename can explain turning it into anything else.
    expect(tokenize('`ds-disclosure__icon${open ? open : closed}`').tokens).toEqual([
      'ds-disclosure__icon',
      '$',
      'open',
      'open',
      'closed',
    ]);
  });
});

describe('explain', () => {
  test.each([
    ['Button', 'CtaButton', 'component name'],
    ['ButtonProps', 'CtaButtonProps', 'component name'],
    ['DisclosureToggleReason', 'ExpanderToggleReason', 'component name'],
    ['variant', 'emphasis', 'prop name'],
    ['--ds-button-background', '--demo-button-background', 'CSS custom-property prefix'],
    ['--ds-alert-radius', '--demo-alert-radius', 'CSS custom-property prefix'],
    ['ds-button__label', 'demo-cta-button__label', 'class or custom-element name'],
    ['ds-alert', 'demo-callout', 'class or custom-element name'],
    ['ds-icon', 'demo-icon', 'class or custom-element name'],
    ['design-schema', 'demo', 'package scope'],
  ])('%s → %s is a %s', (from, to, category) => {
    expect(explain(from, to, lex)).toBe(category);
  });

  test.each([
    ['Button', 'PrimaryButton', 'a component the doc does not rename to that'],
    ['Icon', 'Glyph', 'a component the doc does not rename at all'],
    ['size', 'scale', 'a prop the doc does not rename'],
    ['--ds-button-background', '--demo-button-fill', 'a custom property whose binding also moved'],
    ['ds-button__label', 'demo-cta-button__text', 'an anatomy part the doc does not rename'],
    ['label', 'Label', 'a change of case'],
    ['true', 'false', 'a value, not a name'],
  ])('%s → %s is not explained (%s)', (from, to) => {
    expect(explain(from, to, lex)).toBeNull();
  });

  test('the canonical name is only renamed the way the doc says', () => {
    // `Alert: Callout` must not reach `AlertDialog`: the stem has to end on a word boundary.
    expect(explain('AlertDialog', 'CalloutDialog', lex)).toBe('component name');
    expect(explain('Alerts', 'Callouts', lex), 'not a new word — not a stem').toBeNull();
  });
});

describe('compare', () => {
  const canonical = `export const Button = ({ variant }: ButtonProps) => (
  <button data-ds="Button" className="ds-button" style={{ '--ds-button-radius': radius }} />
);`;
  const brand = `export const CtaButton = ({ emphasis }: CtaButtonProps) => (
  <button data-ds="Button" className="demo-cta-button" style={{ '--demo-button-radius': radius }} />
);`;

  test('a rename of every kind at once is clean', () => {
    const d = diff(canonical, brand);
    expect(d.findings).toEqual([]);
    expect(d.changed).toBe(5);
    expect(new Set(d.differences.map((x) => x.category))).toEqual(
      new Set(['file name', 'component name', 'prop name', 'class or custom-element name', 'CSS custom-property prefix']),
    );
  });

  test('a file name the component map does not account for', () => {
    const d = diff(canonical, brand, { canonical: 'Button.tsx', brand: 'PrimaryButton.tsx', dir: 'src' });
    expect(d.findings.join('\n')).toContain('file name is not CtaButton.tsx');
  });

  test('an added argument is structure, not an identifier', () => {
    const d = diff('onClick?.(event);', 'onClick?.(event, extra);');
    expect(d.findings.join('\n')).toMatch(/name\(s\) in the canonical file|between names differs/);
  });

  test('reordered text between names is caught even when the names match', () => {
    const d = diff('<span /><div />', '<div /><span />');
    expect(d.findings.join('\n')).toContain('is not a rename');
  });

  test('a whitespace-only change still fails: the shape has to be identical', () => {
    const d = diff('const a = 1;\nconst b = 2;\n', 'const a = 1;\n\nconst b = 2;\n');
    expect(d.findings.join('\n')).toContain('between names differs');
  });

  test('a moved gate hook is reported even though the rename around it is legal', () => {
    // This is the failure the whole mechanism is designed to prevent: the brand's name leaking into
    // the hook the behavior and keyboard gates find the component through.
    const d = diff('<button data-ds="Button" className="ds-button" />', '<button data-ds="CtaButton" className="demo-cta-button" />');
    expect(d.findings.join('\n')).toContain('hook data-ds=Button');
  });

  test('a token reference that changed is reported', () => {
    const d = diff('background: var(--color-action-primary-background);', 'background: var(--color-brand-primary-background);');
    expect(d.findings.join('\n')).toContain('token --color-action-primary-background');
  });

  test('a changed element name is reported', () => {
    const d = diff('<button className="ds-button" />', '<div className="demo-cta-button" />');
    expect(d.findings.join('\n')).toContain('element button');
  });

  test('an unexplained identifier is named in the finding', () => {
    const d = diff('const size = 1;', 'const scale = 1;');
    expect(d.findings.join('\n')).toContain('`size` → `scale` is not a rename');
  });
});

describe('protectedVocabulary', () => {
  test('collects the hooks, the accessibility attributes, the tokens and the elements', () => {
    const text = `<button data-ds="Button" data-part="leadingIcon" role="tab" aria-expanded={open} className="ds-button" style={{ color: 'var(--color-action-primary-foreground)', '--ds-button-radius': r }} />`;
    expect(protectedVocabulary(text, 'ds')).toEqual([
      'aria aria-expanded',
      'element button',
      'hook data-ds=Button',
      'hook data-part=leadingIcon',
      'role tab',
      'token --color-action-primary-foreground',
    ]);
  });

  test("a component's own prefixed hook is not protected — it is the one thing that does move", () => {
    expect(protectedVocabulary('var(--ds-button-radius)', 'ds')).toEqual([]);
    expect(protectedVocabulary('var(--demo-button-radius)', 'demo')).toEqual([]);
  });
});

describe('the demo’s file set', () => {
  const files = fileSet();

  test('every seed brings its stylesheet and its stories', () => {
    for (const seed of SEEDS) {
      expect(files).toContain(`${seed}.tsx`);
      expect(files).toContain(`${seed}.css`);
      expect(files).toContain(`${seed}.stories.tsx`);
    }
  });

  test('the closure follows imports past the renamed components', () => {
    // Alert composes both, and neither is in the naming doc: the tree has to compile, and what the
    // doc does not name has to be visibly left alone.
    expect(files).toContain('Icon.tsx');
    expect(files).toContain('FormContext.ts');
    // Button imports it, and `custom/` is the folder a rename never rewrites.
    expect(files).toContain('custom/analytics.ts');
  });

  test('it is a subset, not the whole package', () => {
    expect(files.length).toBeLessThan(40);
    expect(files).not.toContain('DataGrid.tsx');
  });
});
