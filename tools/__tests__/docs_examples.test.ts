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

/** A story module with the shapes the real ones use: meta args, a const, JSX, and a callback. */
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
export const SizeSm: Story = { args: { size: 'sm' } };

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
`;

/** The manifest Storybook writes, with one entry per export above. */
const MANIFEST = {
  v: 5,
  entries: {
    'widget-react--docs': { type: 'docs', id: 'widget-react--docs', name: 'Docs', title: 'Widget/React', importPath: './src/Widget.stories.tsx' },
    ...Object.fromEntries(
      [
        ['Default', 'Default', 'widget-react--default'],
        ['SizeSm', 'Size Sm', 'widget-react--size-sm'],
        ['Trimmed', 'Trimmed', 'widget-react--trimmed'],
        ['NoLabel', 'No Label', 'widget-react--no-label'],
        ['WithIcon', 'With Icon', 'widget-react--with-icon'],
        ['Formatted', 'Formatted', 'widget-react--formatted'],
      ].map(([exportName, name, id]) => [
        id,
        { type: 'story', id, name, title: 'Widget/React', importPath: './src/Widget.stories.tsx', exportName },
      ]),
    ),
  },
};

let root = '';

beforeEach(() => {
  root = tmp();
  Object.assign(examples.paths, {
    ROOT: root,
    STORIES: join(root, 'packages', 'react', 'src'),
    INDEX: join(root, 'packages', 'react', 'storybook-static', 'index.json'),
    OUT: join(root, 'generated', 'examples'),
  });
  write(join(examples.paths.STORIES, 'Widget.stories.tsx'), STORIES);
  write(examples.paths.INDEX, JSON.stringify(MANIFEST));
});

/** The parsed exports of the fixture, by export name. */
function parsed(): Map<string, examples.StoryExport> {
  const exports = examples.parseStories('Widget.stories.tsx', STORIES);
  return new Map(exports.map((story) => [story.exportName, story]));
}

describe('parseStories', () => {
  test('finds every named export beside the default, in source order', () => {
    expect(examples.parseStories('Widget.stories.tsx', STORIES).map((s) => s.exportName)).toEqual([
      'Default', 'SizeSm', 'Trimmed', 'NoLabel', 'WithIcon', 'Formatted',
    ]);
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
    expect(args?.['label']).toBe('Save');
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

  test('sourceText is the whole export statement, verbatim', () => {
    expect(parsed().get('SizeSm')?.sourceText).toBe("export const SizeSm: Story = { args: { size: 'sm' } };");
  });
});

describe('examplesFor', () => {
  const stories = () => examples.manifestStories(MANIFEST);

  test('takes the title and the id from the manifest, never deriving either', () => {
    const built = examples.examplesFor('Widget', examples.parseStories('Widget.stories.tsx', STORIES), stories());
    expect(built.map((e) => [e.title, e.storyId])).toEqual([
      ['Default', 'widget-react--default'],
      ['Size Sm', 'widget-react--size-sm'],
      ['Trimmed', 'widget-react--trimmed'],
      ['No Label', 'widget-react--no-label'],
      ['With Icon', 'widget-react--with-icon'],
      ['Formatted', 'widget-react--formatted'],
    ]);
  });

  test('an export the manifest does not list is a stale build, not a skipped story', () => {
    const extra = [...examples.parseStories('Widget.stories.tsx', STORIES), { exportName: 'Added', args: {}, sourceText: '' }];
    expect(() => examples.examplesFor('Widget', extra, stories())).toThrow(/build-storybook/);
  });

  test('a module with no Default story is an error', () => {
    const withoutDefault = examples.parseStories('Widget.stories.tsx', STORIES).filter((s) => s.exportName !== 'Default');
    expect(() => examples.examplesFor('Widget', withoutDefault, stories())).toThrow(/no `Default` story/);
  });
});

describe('main', () => {
  const out = () => join(examples.paths.OUT, 'Widget.json');

  test('writes one file per story module and is byte-identical on a re-run', () => {
    expect(examples.main([])).toBe(0);
    const first = readFileSync(out());
    expect(std.out()).toContain('6 stories across 1 components');
    expect(examples.main([])).toBe(0);
    expect(readFileSync(out()).equals(first)).toBe(true);
    expect(examples.main(['--check'])).toBe(0);
  });

  test('--report names the args it could not encode', () => {
    expect(examples.main(['--report'])).toBe(0);
    expect(std.out()).toContain('Widget/Formatted: format =');
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

  test('an unknown flag exits 2', () => {
    expect(examples.main(['--stories'])).toBe(2);
    expect(std.err()).toContain('unrecognized arguments: --stories');
  });
});
