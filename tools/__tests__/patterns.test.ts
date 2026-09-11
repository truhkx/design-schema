/** tools/parse.ts — pattern docs (site/src/content/docs/patterns/*.md): the Structure tree is validated against
 *  the component schemas and turned into one generation prompt per platform (port of tests/test_patterns.py). */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, test } from 'vitest';

import { REPO_ROOT } from '../lib/root.ts';
import * as parse from '../parse.ts';
import { expectDocError, usePaths, useTmp, write } from './fixtures.ts';

const tmp = useTmp();
usePaths();

const STRUCTURE = `Landmark main
  Container width=content
    Stack gap=section
      Heading level=1  "Settings"
      Form onSubmit
        Stack horizontal gap=tight justify=end   (the action row)
          Button variant=secondary "Cancel"
          Button variant=primary type=submit "Save changes"
      Card surface=subtle inset=lg heading="Delete account" tone=danger? (see seams)
        Button variant=danger "Delete account…"  → AlertDialog
      Toast region (bottom-end)  "Changes saved" on successful submit
`;

const body = (structure: string): string => `
A page.

## Structure

\`\`\`
${structure}
\`\`\`

## Behaviors the page must show

Saving validates on submit.

## Seams to look for

Does it read as one page?
`;

function componentNamed(name: string, extra: parse.Dict = {}): parse.Dict {
  return {
    name, category: 'layout', anatomy: ['container'], props: {}, events: {},
    a11y: { role: 'none', requires: [] }, platforms: { web: { element: 'div' }, lit: { tag: `ds-${name.toLowerCase()}` }, rn: { element: 'View' } },
    ...extra,
  };
}

const COMPONENTS: parse.Dict[] = [
  componentNamed('Landmark', { anatomy: ['region'], props: { role: { type: 'enum', values: ['banner', 'main'], description: 'x' }, children: { type: 'content', description: 'x' } } }),
  componentNamed('Container', { anatomy: ['column'], props: { width: { type: 'enum', values: ['prose', 'content'], description: 'x' } } }),
  componentNamed('Stack', { props: { direction: { type: 'enum', values: ['vertical', 'horizontal'], description: 'x' },
    gap: { type: 'enum', values: ['tight', 'section'], description: 'x' },
    justify: { type: 'enum', values: ['start', 'end'], description: 'x' } } }),
  componentNamed('Heading', { anatomy: ['text'], props: { level: { type: 'enum', values: ['1', '2'], description: 'x' } } }),
  componentNamed('Form', { anatomy: ['container', 'actions'], events: { onSubmit: { description: 'x', platforms: { web: 'onSubmit', lit: 'submit', rn: 'onSubmit' } } } }),
  componentNamed('Button', { props: { variant: { type: 'enum', values: ['primary', 'secondary', 'danger'], description: 'x' },
    type: { type: 'enum', values: ['button', 'submit'], description: 'x' } } }),
  componentNamed('Card', { anatomy: ['surface'], props: { surface: { type: 'enum', values: ['default', 'subtle'], description: 'x' },
    inset: { type: 'enum', values: ['md', 'lg'], description: 'x' },
    heading: { type: 'string', description: 'x' } } }),
  componentNamed('Toast', { anatomy: ['region', 'toast'], props: { message: { type: 'string', description: 'x' } } }),
  componentNamed('Tabs', { anatomy: ['tablist', 'tab', 'panel'], props: { label: { type: 'string', description: 'x' } } }),
];
const comps = (): Record<string, parse.Dict> => Object.fromEntries(COMPONENTS.map((c) => [c.name, c]));

describe('parseStructure', () => {
  test('lines become nodes with props flags and copy', () => {
    const nodes = parse.parseStructure(STRUCTURE);
    expect(nodes.slice(0, 4).map((n) => n.component)).toEqual(['Landmark', 'Container', 'Stack', 'Heading']);
    expect(nodes[0]?.flags).toEqual(['main']);
    expect(nodes[0]?.depth).toBe(0);
    expect(nodes[1]?.props).toEqual({ width: 'content' });
    expect(nodes[1]?.depth).toBe(1);
    expect(nodes[3]?.props).toEqual({ level: '1' });
    expect(nodes[3]?.copy).toEqual(['Settings']);
    const form = nodes[4] as parse.StructureNode;
    expect(form.flags).toEqual(['onSubmit']);
    const row = nodes[5] as parse.StructureNode;
    expect(row.flags).toEqual(['horizontal']);
    expect(row.props).toEqual({ gap: 'tight', justify: 'end' });
    expect(row.notes).toEqual(['the action row']);
  });

  test('a question mark prop is recorded not applied', () => {
    const card = parse.parseStructure(STRUCTURE).find((n) => n.component === 'Card') as parse.StructureNode;
    expect(card.props).toEqual({ surface: 'subtle', inset: 'lg', heading: 'Delete account' });
    expect(card.questions).toEqual({ tone: 'danger' });
  });

  test('arrows and prose are kept as notes', () => {
    const buttons = parse.parseStructure(STRUCTURE).filter((n) => n.component === 'Button');
    const button = buttons[buttons.length - 1] as parse.StructureNode;
    expect(button.copy).toEqual(['Delete account…']);
    expect(button.notes).toEqual(['→ AlertDialog']);
    const toast = parse.parseStructure(STRUCTURE).find((n) => n.component === 'Toast') as parse.StructureNode;
    expect(toast.flags).toEqual(['region']);
    expect(toast.notes).toContain('bottom-end');
  });
});

describe('validateStructure', () => {
  test('the settings shape validates', () => {
    expect(parse.validateStructure(parse.parseStructure(STRUCTURE), comps(), 'settings-page.md')).toEqual(['Landmark', 'Container', 'Stack', 'Heading', 'Form', 'Button', 'Card', 'Toast']);
  });

  test('an unknown component', () => {
    expectDocError(() => parse.validateStructure(parse.parseStructure('Gadget width=content\n'), comps(), 'settings-page.md'), "settings-page.md: line 1: unknown component 'Gadget'");
  });

  test('an unknown prop', () => {
    expectDocError(() => parse.validateStructure(parse.parseStructure('Container widht=content\n'), comps(), 'settings-page.md'), "Container has no prop or event 'widht'");
  });

  test('an enum value outside the declared values', () => {
    expectDocError(() => parse.validateStructure(parse.parseStructure('Container width=huge\n'), comps(), 'settings-page.md'), "Container.width: 'huge' is not one of ['prose', 'content']");
  });

  test('a camel case flag must be a prop or event', () => {
    expectDocError(() => parse.validateStructure(parse.parseStructure('Form onSubmitted\n'), comps(), 'settings-page.md'), "Form has no prop or event 'onSubmitted'");
  });

  test('lowercase prose flags are ignored', () => {
    parse.validateStructure(parse.parseStructure('Button disabled unless the Switch is on\n'), comps(), 'x.md');
  });

  test('a component part name is accepted', () => {
    // `TabPanel "Profile"` names Tabs' `panel` part (singular component + capitalised part).
    const used = parse.validateStructure(parse.parseStructure('Tabs label="Sections"\n  TabPanel "Profile"\n'), comps(), 'x.md');
    expect(used).toEqual(['Tabs']);
  });
});

describe('parsePatterns', () => {
  let patterns = '';
  let out = '';
  const entries = (): parse.Dict[] => COMPONENTS.map((c) => ({ id: c.name.toLowerCase(), title: c.name, component: c, sections: {} }));
  const writePattern = (name: string, text: string, title = 'Settings page'): void => {
    write(join(patterns, `${name}.md`), `---\ntitle: ${title}\ndescription: A page.\n---\n${text}`);
  };

  beforeEach(() => {
    const root = tmp();
    patterns = join(root, 'patterns');
    out = join(root, 'generated');
    const templates = join(root, 'templates');
    for (const t of ['web', 'rn']) write(join(templates, `pattern-${t}.md`), '{{NAME}}|{{TITLE}}|{{PLATFORM}}|{{KEBAB}}\n{{COMPONENTS}}\n{{STRUCTURE}}\n{{BEHAVIORS}}\n{{GUIDANCE}}');
    write(join(patterns, '.keep'), '');
    write(join(out, 'prompts', '.keep'), '');
    Object.assign(parse.paths, { PATTERN_DOCS: patterns, OUT: out, TEMPLATES: templates, ROOT: root });
  });

  test('a pattern emits one prompt per platform with a template', () => {
    writePattern('settings-page', body(STRUCTURE));
    const [result, errors] = parse.parsePatterns(entries());
    expect(errors).toEqual([]);
    expect(result.map((pt) => pt.name)).toEqual(['SettingsPage']);
    expect(readdirSync(join(out, 'prompts')).filter((f) => f.startsWith('Pattern.')).sort()).toEqual(['Pattern.SettingsPage.rn.md', 'Pattern.SettingsPage.web.md']);
    const web = readFileSync(join(out, 'prompts', 'Pattern.SettingsPage.web.md'), 'utf8');
    expect(web.startsWith('SettingsPage|Settings page|web|settings-page')).toBe(true);
    expect(web).toContain('Landmark main');
    expect(web).toContain('Saving validates on submit.');
    expect(web, 'other sections ride along as guidance').toContain('## Seams to look for');
    expect(web, 'the components section names each component and its package').toContain('`Landmark`');
    expect(web).toContain('packages/react');
  });

  test('the name is the title without spaces', () => {
    writePattern('settings-page', body('Button variant=primary\n'), 'Account settings page');
    const [result] = parse.parsePatterns(entries());
    expect(result[0]?.name).toBe('AccountSettingsPage');
  });

  test('a missing structure is an error', () => {
    writePattern('settings-page', '\n## Behaviors the page must show\n\nx\n');
    const [, errors] = parse.parsePatterns(entries());
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain("required section '## Structure'");
  });

  test('a structure error names the pattern file', () => {
    writePattern('settings-page', body('Gadget\n'));
    const [, errors] = parse.parsePatterns(entries());
    expect(errors).toEqual(["settings-page.md: line 1: unknown component 'Gadget'"]);
  });

  test('a doc with a component block is not a pattern', () => {
    write(join(patterns, 'oops.md'), '---\ntitle: X\ncomponent:\n  name: X\n---\n');
    const [, errors] = parse.parsePatterns(entries());
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0]).toContain('is not a pattern');
  });

  test('no patterns folder is fine', () => {
    parse.paths.PATTERN_DOCS = join(patterns, 'missing');
    expect(parse.parsePatterns(entries())).toEqual([[], []]);
  });
});

describe('the repository', () => {
  test('the settings page parses against the real components', () => {
    const cj = join(REPO_ROOT, 'generated', 'components.json');
    if (!existsSync(cj) || !existsSync(join(parse.paths.PATTERN_DOCS, 'settings-page.md'))) return; // run tools/parse.ts first
    const [patterns, errors] = parse.parsePatterns(JSON.parse(readFileSync(cj, 'utf8')) as parse.Dict[]);
    expect(errors).toEqual([]);
    expect(patterns.map((pt) => pt.name)).toContain('SettingsPage');
    for (const platform of ['web', 'lit', 'rn']) {
      expect(existsSync(join(REPO_ROOT, 'generated', 'prompts', `Pattern.SettingsPage.${platform}.md`))).toBe(true);
    }
  });
});
