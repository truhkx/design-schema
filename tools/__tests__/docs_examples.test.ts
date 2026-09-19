/** tools/docs_examples.ts — Storybook's stories, projected into generated/examples/<Name>.json. */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import * as examples from '../docs_examples.ts';
import { useStd, useTmp, write } from './fixtures.ts';

const tmp = useTmp();
const std = useStd();

const saved = { ...examples.paths };
afterEach(() => {
  Object.assign(examples.paths, saved);
});

/** A story module with the shapes the real ones use: meta args, a const, JSX, a callback, a decorator and a play. */
const STORIES = `import type { Meta, StoryObj } from '@storybook/react-vite';
import { Widget } from './Widget';

const ITEMS = [
  { id: 'one', label: 'One' },
  { id: 'two', label: 'Two', disabled: true },
];

const meta: Meta<typeof Widget> = {
  title: 'Widget/React',
  component: Widget,
  args: { label: 'Save', size: 'md', items: ITEMS, count: 2, open: false },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/* size */
export const SizeSm: Story = { args: { size: 'sm', label: 'Small' } };

export const Trimmed: Story = { args: { items: ITEMS.slice(0, 1), count: ITEMS.length - 1 } };

export const NoLabel: Story = { args: { label: undefined } };

export const WithIcon: Story = {
  args: {
    icon: (
      <svg viewBox="0 0 16 16">
        <path d="M3 3l10 10" />
      </svg>
    ),
  },
};

export const Formatted: Story = { args: { format: (value: number) => \`\${value}%\` } };

export const Framed: Story = { args: { open: true }, decorators: [(Story) => <div><Story /></div>] };

export const Played: Story = { args: { size: 'lg' }, play: async () => {} };
`;

const EXPORTS: [string, string, string][] = [
  ['Default', 'Default', 'widget-react--default'],
  ['SizeSm', 'Size Sm', 'widget-react--size-sm'],
  ['Trimmed', 'Trimmed', 'widget-react--trimmed'],
  ['NoLabel', 'No Label', 'widget-react--no-label'],
  ['WithIcon', 'With Icon', 'widget-react--with-icon'],
  ['Formatted', 'Formatted', 'widget-react--formatted'],
  ['Framed', 'Framed', 'widget-react--framed'],
  ['Played', 'Played', 'widget-react--played'],
];

/** The manifest Storybook writes, with one entry per export above. */
const MANIFEST = {
  v: 5,
  entries: {
    'widget-react--docs': { type: 'docs', id: 'widget-react--docs', name: 'Docs', title: 'Widget/React', importPath: './src/Widget.stories.tsx' },
    ...Object.fromEntries(
      EXPORTS.map(([exportName, name, id]) => [
        id,
        { type: 'story', id, name, title: 'Widget/React', importPath: './src/Widget.stories.tsx', exportName },
      ]),
    ),
  },
};

/** The same component's Lit stories: a meta render with every binding kind, one story renamed, one with code. */
const LIT_STORIES = `import type { Meta, StoryObj } from '@storybook/web-components-vite';
import { html } from 'lit';
import { ifDefined } from 'lit/directives/if-defined.js';
import './Widget.js';
import type { WidgetItem } from './Widget.js';

const ITEMS: WidgetItem[] = [{ id: 'one', label: 'One' }];

const meta: Meta = {
  title: 'Widget/Lit',
  args: { label: 'Save', size: 'md', open: false, hint: undefined, tone: 'calm' },
  render: (args) => html\`
    <ds-widget
      label=\${args.label}
      size=\${args.size}
      hint=\${ifDefined(args.hint)}
      ?open=\${args.open}
      .tone=\${args.tone}
    >
      \${ITEMS.map((item) => html\`<ds-item id=\${item.id}>\${item.label}</ds-item>\`)}
    </ds-widget>
  \`,
};

export default meta;
type Story = StoryObj;

export const Default: Story = {};
export const Small: Story = { args: { size: 'sm', label: 'Tiny' } };
export const Framed: Story = { args: { open: true } };
export const Played: Story = {
  render: (args) => html\`<ds-widget label=\${args.label} .items=\${ITEMS} @change=\${() => {}}></ds-widget>\`,
};
`;

/** The Lit element's own source, which is where a \`.tone\` binding's attribute name comes from. */
const LIT_ELEMENT = `@customElement('ds-widget')
export class DsWidget extends LitElement {
  @property({ reflect: true }) accessor tone = 'calm';
  @property({ attribute: false }) accessor items: WidgetItem[] = [];
}
`;

/** And its React Native stories: a decorator, a render wrapping the spread, and a story reusing that render. */
const RN_STORIES = `import type { Meta, StoryObj } from '@storybook/react-vite';
import { View } from 'react-native';
import { Widget } from './Widget';
import { withTheme } from './decorators';

function Surface({ children }: { children: React.ReactNode }) {
  return <View>{children}</View>;
}

const meta: Meta<typeof Widget> = {
  title: 'Widget/React Native',
  component: Widget,
  decorators: [withTheme()],
  args: { label: 'Save', size: 'md', open: false },
};

export default meta;
type Story = StoryObj<typeof Widget>;

export const Default: Story = {
  render: (args) => (
    <Surface>
      <Widget {...args} />
    </Surface>
  ),
};

export const SizeSm: Story = { ...Default, args: { size: 'sm' } };
`;

/** Widget as generated/components.json describes it: the prop types the layout decision reads. */
const WIDGET: examples.ComponentInfo = {
  category: 'input',
  props: {
    label: { type: 'string' },
    size: { type: 'enum', default: 'md' },
    items: { type: 'array' },
    count: { type: 'number' },
    open: { type: 'boolean' },
    icon: { type: 'content' },
    format: { type: 'function' },
  },
};

let root = '';

beforeEach(() => {
  root = tmp();
  Object.assign(examples.paths, {
    ROOT: root,
    STORIES: join(root, 'packages', 'react', 'src'),
    LIT_STORIES: join(root, 'packages', 'lit', 'src'),
    RN_STORIES: join(root, 'packages', 'rn', 'src'),
    SWIFT: join(root, 'packages', 'swiftui', 'Sources', 'DesignSchema'),
    INDEX: join(root, 'packages', 'react', 'storybook-static', 'index.json'),
    COMPONENTS: join(root, 'generated', 'components.json'),
    OUT: join(root, 'generated', 'examples'),
  });
  write(join(examples.paths.STORIES, 'Widget.stories.tsx'), STORIES);
  write(join(examples.paths.LIT_STORIES, 'Widget.stories.ts'), LIT_STORIES);
  write(join(examples.paths.LIT_STORIES, 'Widget.ts'), LIT_ELEMENT);
  write(join(examples.paths.RN_STORIES, 'Widget.stories.tsx'), RN_STORIES);
  write(examples.paths.INDEX, JSON.stringify(MANIFEST));
  write(examples.paths.COMPONENTS, JSON.stringify([{ id: 'widget', component: { name: 'Widget', ...WIDGET } }]));
});

/** The parsed exports of the fixture, by export name. */
function parsed(): Map<string, examples.StoryExport> {
  const exports = examples.parseStories('Widget.stories.tsx', STORIES);
  return new Map(exports.map((story) => [story.exportName, story]));
}

describe('parseStories', () => {
  test('finds every named export beside the default, in source order', () => {
    expect(examples.parseStories('Widget.stories.tsx', STORIES).map((s) => s.exportName)).toEqual(EXPORTS.map(([exportName]) => exportName));
  });

  test('a story with no args of its own inherits the meta’s', () => {
    expect(parsed().get('Default')?.args).toEqual({
      label: 'Save',
      size: 'md',
      items: [{ id: 'one', label: 'One' }, { id: 'two', label: 'Two', disabled: true }],
      count: 2,
      open: false,
    });
  });

  test('a story’s own args win, and the rest of the meta’s come along', () => {
    const args = parsed().get('SizeSm')?.args;
    expect(args?.['size']).toBe('sm');
    expect(args?.['count']).toBe(2);
  });

  test('module-level consts, pure array calls and arithmetic are resolved to data', () => {
    const args = parsed().get('Trimmed')?.args;
    expect(args?.['items']).toEqual([{ id: 'one', label: 'One' }]);
    expect(args?.['count']).toBe(1);
  });

  test('an arg set to undefined unsets the meta’s rather than inheriting it', () => {
    expect(parsed().get('NoLabel')?.args).not.toHaveProperty('label');
  });

  test('JSX becomes an element descriptor the website can rebuild', () => {
    expect(parsed().get('WithIcon')?.args['icon']).toEqual({
      $element: 'svg',
      props: { viewBox: '0 0 16 16' },
      children: [{ $element: 'path', props: { d: 'M3 3l10 10' }, children: [] }],
    });
  });

  test('an arg that is genuinely code keeps its source instead of being dropped silently', () => {
    expect(parsed().get('Formatted')?.args['format']).toEqual({ $unsupported: '(value: number) => `${value}%`' });
  });

  test('records what the story sets itself, before the merge — an unset included', () => {
    expect(parsed().get('Default')?.set).toEqual([]);
    expect(parsed().get('SizeSm')?.set).toEqual(['size', 'label']);
    expect(parsed().get('NoLabel')?.set).toEqual(['label']);
  });

  test('a play function is code and a decorator is a frame', () => {
    expect(parsed().get('Played')).toMatchObject({ code: true, decorated: false });
    expect(parsed().get('Framed')).toMatchObject({ code: false, decorated: true });
    expect(parsed().get('SizeSm')).toMatchObject({ code: false, decorated: false });
  });
});

describe('examplesFor', () => {
  const stories = () => examples.manifestStories(MANIFEST);
  const built = () => examples.examplesFor('Widget', examples.parseStories('Widget.stories.tsx', STORIES), stories(), WIDGET);

  test('takes the title and the id from the manifest, never deriving either', () => {
    expect(built().examples.map((e) => [e.title, e.storyId])).toEqual(EXPORTS.map(([, name, id]) => [name, id]));
  });

  test('an export the manifest does not list is a stale build, not a skipped story', () => {
    const extra = [...examples.parseStories('Widget.stories.tsx', STORIES), { exportName: 'Added', args: {}, set: [], code: false, decorated: false }];
    expect(() => examples.examplesFor('Widget', extra, stories(), WIDGET)).toThrow(/build-storybook/);
  });

  test('a module with no Default story is an error', () => {
    const withoutDefault = examples.parseStories('Widget.stories.tsx', STORIES).filter((s) => s.exportName !== 'Default');
    expect(() => examples.examplesFor('Widget', withoutDefault, stories(), WIDGET)).toThrow(/no `Default` story/);
  });

  test('a sweep is one enum or boolean prop — copy beside it is fine, code or a second prop is not', () => {
    expect(Object.fromEntries(built().examples.map((e) => [e.title, e.sweep]))).toEqual({
      Default: null,
      'Size Sm': { prop: 'size', value: 'sm' }, // relabelled, still a size step
      Trimmed: null, // two props, neither an enum
      'No Label': null, // copy only
      'With Icon': null, // content only
      Formatted: null, // a function prop
      Framed: { prop: 'open', value: true },
      Played: null, // one enum, but a play function
    });
  });

  test('carries the decorator flag through', () => {
    expect(built().examples.filter((e) => e.decorated).map((e) => e.title)).toEqual(['Framed']);
  });

  test('eight examples fit one strip, so every one is primary and the layout is tabs', () => {
    expect(built().layout).toBe('scenarios');
    expect(built().examples.every((e) => e.primary)).toBe(true);
  });
});

describe('snippets', () => {
  /** Every example's snippets and source stories, by title, through the same path `main` takes. */
  const code = () => {
    const component = WIDGET;
    const set = examples.examplesFor(
      'Widget',
      examples.parseStories('Widget.stories.tsx', STORIES),
      examples.manifestStories(MANIFEST),
      component,
      examples.codeSource('Widget', STORIES, component, examples.snippetOptions()),
    );
    return { set, byTitle: new Map(set.examples.map((example) => [example.title, example])) };
  };

  test('every example carries a snippet map with all four platforms', () => {
    const { set } = code();
    expect(set.platforms).toEqual({ react: true, lit: true, rn: true, swift: false });
    for (const example of set.examples) expect(Object.keys(example.snippets)).toEqual(['react', 'lit', 'rn', 'swift']);
  });

  test('React: the import and the props, with inherited defaults left out and referenced helpers brought along', () => {
    expect(code().byTitle.get('Default')?.snippets.react).toBe(
      [
        "import { Widget } from '@design-schema/react';",
        '',
        'const ITEMS = [',
        "  { id: 'one', label: 'One' },",
        "  { id: 'two', label: 'Two', disabled: true },",
        '];',
        '',
        '<Widget label="Save" items={ITEMS} count={2} />',
      ].join('\n'),
    );
  });

  test('React: a prop the story sets itself stays even when it is the default; decorators and unset args do not appear', () => {
    const { byTitle } = code();
    expect(byTitle.get('Size Sm')?.snippets.react).toContain('<Widget label="Small" size="sm" items={ITEMS} count={2} />');
    expect(byTitle.get('Framed')?.snippets.react).toContain('<Widget label="Save" items={ITEMS} count={2} open />');
    expect(byTitle.get('Framed')?.snippets.react).not.toContain('<div>');
    expect(byTitle.get('No Label')?.snippets.react).toContain('<Widget items={ITEMS} count={2} />');
    expect(byTitle.get('Formatted')?.snippets.react).toContain('format={(value: number) => `${value}%`}');
  });

  test('Lit: a fully bound template is the HTML it renders', () => {
    // `size` is the default and `hint` unset, so neither is written; `?open` false is absent; `.tone`
    // is the attribute the element reflects it to; the `.map` is the markup it maps to.
    expect(code().byTitle.get('Default')?.snippets.lit).toBe(
      ['<ds-widget label="Save" tone="calm">', '  <ds-item id="one">One</ds-item>', '</ds-widget>'].join('\n'),
    );
    expect(code().byTitle.get('Framed')?.snippets.lit).toContain('<ds-widget label="Save" open tone="calm">');
  });

  test('Lit: a story under another name is matched by the configuration it sets, and says which story it was', () => {
    const small = code().byTitle.get('Size Sm');
    expect(small?.stories.lit).toBe('Small');
    expect(small?.snippets.lit).toContain('<ds-widget label="Tiny" size="sm" tone="calm">');
    // Two props, neither copy: no Lit story sets the same, so there is no Lit snippet rather than a wrong one.
    expect(code().byTitle.get('Trimmed')?.snippets.lit).toBeNull();
    expect(code().byTitle.get('Trimmed')?.stories.lit).toBeNull();
  });

  test('Lit: a binding that is not plain HTML keeps the template, as a Lit module with the args written in', () => {
    const played = code().byTitle.get('Played')?.snippets.lit ?? '';
    expect(played).toContain("import '@design-schema/lit';");
    expect(played).toContain("import { html } from 'lit';");
    expect(played).toContain("import type { WidgetItem } from '@design-schema/lit';");
    expect(played).toContain("const ITEMS: WidgetItem[] = [{ id: 'one', label: 'One' }];");
    expect(played).toContain('<ds-widget label="Save" .items=${ITEMS} @change=${() => {}}></ds-widget>');
    expect(played).not.toContain('args');
  });

  test('React Native: the render around the spread survives, the decorator does not, and a spread story reuses the render', () => {
    const { byTitle } = code();
    expect(byTitle.get('Default')?.snippets.rn).toBe(
      [
        "import { View } from 'react-native';",
        "import { Widget } from '@design-schema/rn';",
        '',
        'function Surface({ children }: { children: React.ReactNode }) {',
        '  return <View>{children}</View>;',
        '}',
        '',
        '<Surface>',
        '  <Widget label="Save" />',
        '</Surface>',
      ].join('\n'),
    );
    expect(byTitle.get('Size Sm')?.snippets.rn).toContain('<Widget label="Save" size="sm" />');
  });

  test('SwiftUI: null until the generated view exists, then its matching #Preview', () => {
    expect(code().byTitle.get('Default')?.snippets.swift).toBeNull();
    write(join(examples.paths.SWIFT, 'Widget.swift'), [
      'public struct Widget: View { var body: some View { Text("x") } }',
      '',
      '#Preview("Default") {',
      '    Widget(label: "Save")',
      '}',
      '',
      '#Preview("SizeSm") {',
      '    Widget(label: "Small", size: .sm)',
      '}',
    ].join('\n'));
    const { set, byTitle } = code();
    expect(set.platforms.swift).toBe(true);
    expect(byTitle.get('Default')?.snippets.swift).toBe('import DesignSchema\n\nWidget(label: "Save")');
    expect(byTitle.get('Size Sm')?.stories.swift).toBe('SizeSm');
    expect(byTitle.get('Trimmed')?.snippets.swift).toBeNull();
  });
});

describe('layoutOf', () => {
  const steps = [
    { title: 'Default', sweep: null },
    { title: 'Size Sm', sweep: { prop: 'size', value: 'sm' } },
    { title: 'Truncate', sweep: { prop: 'truncate', value: true } },
  ];

  test('typography whose every story steps one prop is a sweep', () => {
    expect(examples.layoutOf({ category: 'typography', props: {} }, steps)).toBe('sweep');
  });

  test('a scenario among the steps rides along in the grid', () => {
    expect(examples.layoutOf({ category: 'typography', props: {} }, [...steps, { title: 'Custom', sweep: null }])).toBe('sweep');
  });

  test('a set that is mostly scenarios keeps the tabs', () => {
    const scenarios = [{ title: 'A', sweep: null }, { title: 'B', sweep: null }, { title: 'C', sweep: null }];
    expect(examples.layoutOf({ category: 'typography', props: {} }, [...steps, ...scenarios])).toBe('scenarios');
  });

  test('a layout component is never tiled, however sweep-shaped its stories', () => {
    expect(examples.layoutOf({ category: 'layout', props: {} }, steps)).toBe('scenarios');
  });

  test('Default alone is not a sweep', () => {
    expect(examples.layoutOf({ category: 'typography', props: {} }, [steps[0]!])).toBe('scenarios');
  });
});

describe('primaryFlags', () => {
  const step = (title: string, value: string) => ({ title, sweep: { prop: 'size', value } });
  const scenario = (title: string) => ({ title, sweep: null });

  test('past MAX_TABS, Default and the first scenarios stay; enum steps go behind the disclosure', () => {
    const set = [
      scenario('Default'),
      step('Size Sm', 'sm'),
      step('Size Md', 'md'),
      step('Size Lg', 'lg'),
      { title: 'Disabled', sweep: { prop: 'disabled', value: true } },
      scenario('Empty'),
      scenario('Loading'),
      scenario('Editable'),
      scenario('Pinned'),
      scenario('Keyboard'),
    ];
    const flags = examples.primaryFlags('scenarios', set);
    expect(set.filter((_, i) => flags[i]).map((e) => e.title)).toEqual(['Default', 'Disabled', 'Empty', 'Loading', 'Editable', 'Pinned']);
    expect(flags.filter(Boolean)).toHaveLength(examples.PRIMARY_TABS);
  });

  test('a set that fits, or a grid, keeps everything primary', () => {
    const many = Array.from({ length: examples.MAX_TABS + 4 }, (_, i) => step(`Step ${i}`, String(i)));
    expect(examples.primaryFlags('sweep', many).every(Boolean)).toBe(true);
    expect(examples.primaryFlags('scenarios', many.slice(0, examples.MAX_TABS)).every(Boolean)).toBe(true);
  });
});

describe('main', () => {
  const out = () => join(examples.paths.OUT, 'Widget.json');

  test('writes one file per story module and is byte-identical on a re-run', () => {
    expect(examples.main([])).toBe(0);
    const first = readFileSync(out());
    expect(std.out()).toContain('8 stories across 1 components');
    expect(JSON.parse(first.toString('utf8'))).toMatchObject({ layout: 'scenarios', examples: expect.any(Array) });
    expect(examples.main([])).toBe(0);
    expect(readFileSync(out()).equals(first)).toBe(true);
    expect(examples.main(['--check'])).toBe(0);
  });

  test('--report names the args it could not encode, and the scenarios another platform has no story for', () => {
    expect(examples.main(['--report'])).toBe(0);
    expect(std.out()).toContain('Widget/Formatted: format =');
    expect(std.out()).toContain('Widget/Trimmed: lit: no story matches Trimmed');
    expect(std.out()).toMatch(/snippets: react 8, lit \d+, rn \d+, swift 0 of 8/);
  });

  test('--check fails when a file is missing or stale', () => {
    expect(examples.main(['--check'])).toBe(1);
    expect(std.err()).toContain('is missing');
    expect(examples.main([])).toBe(0);
    write(join(examples.paths.STORIES, 'Widget.stories.tsx'), STORIES.replace("'Save'", "'Submit'"));
    expect(examples.main(['--check'])).toBe(1);
    expect(std.err()).toContain('is stale');
  });

  test('a file for a story module that no longer exists is removed, not left behind', () => {
    expect(examples.main([])).toBe(0);
    write(join(examples.paths.OUT, 'Gone.json'), '[]\n');
    expect(examples.main(['--check'])).toBe(1);
    expect(std.err()).toContain('has no story module');
    expect(examples.main([])).toBe(0);
    expect(existsSync(join(examples.paths.OUT, 'Gone.json'))).toBe(false);
  });

  test('a missing manifest says to build Storybook, and writes nothing', () => {
    Object.assign(examples.paths, { INDEX: join(root, 'packages', 'react', 'storybook-static', 'gone.json') });
    expect(examples.main([])).toBe(1);
    expect(std.err()).toContain('build-storybook');
    expect(existsSync(out())).toBe(false);
  });

  test('missing components.json says to parse first', () => {
    Object.assign(examples.paths, { COMPONENTS: join(root, 'generated', 'gone.json') });
    expect(examples.main([])).toBe(1);
    expect(std.err()).toContain('pnpm parse');
  });

  test('a story module with no component in the schema is an error', () => {
    write(examples.paths.COMPONENTS, '[]');
    expect(examples.main([])).toBe(1);
    expect(std.err()).toContain('has no component in generated/components.json');
  });

  test('an unknown flag exits 2', () => {
    expect(examples.main(['--stories'])).toBe(2);
    expect(std.err()).toContain('unrecognized arguments: --stories');
  });
});
