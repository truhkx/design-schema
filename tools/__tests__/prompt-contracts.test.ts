/**
 * Job 625: the templates read the phase 2 fields. `contractSections` renders each declared contract resolved for one
 * platform (emitted event names, slot names, computed expressions, narrowed copy), and each template carries the
 * "Declared contracts" rules that say what to build from them.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

import { componentDef } from '../../schema/component.ts';
import { dump } from '../lib/pyyaml.ts';
import * as parse from '../parse.ts';
import type { Dict } from '../parse.ts';
import { component } from './fixtures.ts';

const PLATFORMS = ['web', 'lit', 'rn', 'swiftui'] as const;
type Platform = (typeof PLATFORMS)[number];

const SECTIONS = ['Events', 'Controlled state', 'Parts and slots', 'Style bindings', 'Keyboard', 'Form and overlay', 'Copy', 'Constants and examples', 'Lifecycle'];

/** The shared Widget, grown to use every field the phase 2 jobs added, and valid against the schema. */
function contractsFixture(): Dict {
  const c = component();
  c.status = 'deprecated';
  c.deprecated = { reason: 'Replaced.', use: 'Button' };
  c.anatomy = ['container', 'label', 'icon', 'footer', 'closeButton'];
  c.props.variant.valuesOn = { danger: ['web', 'lit', 'rn'] };
  Object.assign(c.props, {
    open: { type: 'boolean', description: 'Whether the popup is open.', controls: { event: 'onOpenChange', default: 'defaultOpen', state: 'open' } },
    defaultOpen: { type: 'boolean', default: false, description: 'Initial open state.' },
    footer: { type: 'content', description: 'Footer content.' },
    count: { type: 'integer', default: 0, description: 'Items.' },
    name: { type: 'string', description: 'Field name.' },
    placement: { type: 'enum', values: ['top', 'bottom'], default: 'bottom', description: 'Preferred side.' },
    tone: {
      type: 'enum', values: ['plain', 'loud'], default: 'plain', description: 'Old emphasis.',
      deprecated: { reason: 'Use variant.', since: '0.2.0', use: 'variant' },
      valueLifecycle: { loud: { deprecated: { reason: 'Too loud.', use: 'plain' } } },
    },
  });
  c.events = {
    onPress: { description: 'Activated.', platforms: { web: 'onClick', lit: 'press', rn: 'onPress', swiftui: 'action' } },
    onOpenChange: {
      description: 'Opened or closed.',
      platforms: { web: 'onOpenChange', lit: 'open-change', rn: 'onOpenChange', swiftui: 'onOpenChange' },
      payload: [{ name: 'open', type: 'boolean' }, { name: 'reason', type: 'enum', values: ['escape', 'controlled'] }],
      reasons: { escape: 'Escape pressed while open', controlled: 'the open prop changed' },
      fires: ['user', 'controlled'],
      cancelable: true,
      timing: { phase: 'request', before: ['onClose'] },
    },
    onClose: {
      description: 'Closed.',
      platforms: { web: 'onClose', lit: 'close', rn: 'onClose', swiftui: 'onClose' },
      deprecated: { reason: 'Use onOpenChange.', since: '0.2.0', use: 'onOpenChange' },
    },
  };
  Object.assign(c.styles, {
    paddingBlock: { token: 'space.sm', part: 'container', by: 'size', values: { sm: 'space.1' } },
    backgroundHover: { token: 'color.action.primary.backgroundHover', state: 'hover', platforms: ['web', 'lit'] },
    menuWidth: { token: 'space.20', computed: { times: 2.5 } },
    indicator: { token: 'space.0', computed: { plus: [{ binding: 'paddingBlock' }], minus: [{ token: 'space.1', times: 2 }] } },
  });
  c.constants = {
    hoverDelay: { description: 'Delay before opening.', token: 'motion.duration.base', multiply: 3, unit: 'ms' },
    swipeThreshold: { description: 'Dismiss velocity.', value: 1.5, unit: 'px/ms' },
  };
  c.a11y.requires = [...c.a11y.requires, 'keyboard-operable'];
  c.keyboard = [
    { keys: ['Enter'], action: 'Opens the popup.', expect: 'opens', target: 'icon', given: { size: 'sm', open: false } },
    { keys: ['Tab'], action: 'Moves to the next item.', expect: 'focus-next', repeat: 2, platforms: ['web', 'lit'] },
    { keys: [' '], action: 'Presses the native button.', native: true },
  ];
  c.parts = {
    icon: { kind: 'element' },
    footer: { kind: 'slot', slot: { prop: 'footer', platforms: { lit: 'footer-area', swiftui: 'footerContent' } } },
    closeButton: { kind: 'component' },
  };
  c.composition = { closeButton: { component: 'Button', props: { variant: 'ghost', label: { from: 'label' } }, forwards: { background: 'background' } } };
  c.examples = [
    { name: 'with-footer', description: 'A widget with a footer.', given: { label: 'Save', size: 'sm' } },
    { name: 'lit-only', description: 'Only on Lit.', given: { label: 'Lit' }, platforms: ['lit'] },
  ];
  c.copy = {
    invalid: 'Check {label}.',
    resultCount: { plural: { by: 'count', one: '{count} result', other: '{count} results' }, params: { count: { type: 'number' } } },
    webOnly: { text: 'Press {key} to open', params: { key: { type: 'string' } }, platforms: ['web'] },
  };
  c.form = { role: 'field', value: 'count', valueType: 'number', name: 'name', validation: ['custom'], messages: { custom: 'invalid' }, discovery: 'context' };
  c.overlay = { layer: 'popover', anchor: 'container', placement: 'placement', collision: 'flip', open: 'open', closeEvent: 'onOpenChange', dismiss: ['outside-press'], modal: false };
  c.platforms = { web: { element: 'button' }, lit: { tag: 'ds-widget', reflect: ['variant', 'size'] }, rn: { element: 'Pressable' }, swiftui: { element: 'Button' } };
  return componentDef.parse(c) as Dict;
}

/** What the prompt the parser writes for `c` on `platform` reads, with the real templates. */
function prompt(c: Dict, platform: Platform): string {
  return parse.renderPrompt(c, { 'When to use': 'Use it.', Accessibility: 'It is accessible.' }, platform, dump({ component: c }, true));
}

/** Everything the resolved sections must say, per platform. */
const EXPECTED: Record<Platform, string[]> = {
  web: [
    '- `onOpenChange`: emit `onOpenChange`',
    "  - payload, positional, in this order: `open: boolean`, `reason: 'escape' | 'controlled'`",
    '  - timing: request, fired before `onClose`',
    '- `open` is controlled when given, uncontrolled from `defaultOpen` when omitted; changes reported by `onOpenChange` (emit `onOpenChange`); drives state `open`',
    '- `footer`: slot, prop `footer`',
    '- `backgroundHover`: token `color.action.primary.backgroundHover`; state `hover`; on web, lit',
    '- `menuWidth`: token `space.20`; computed `calc(var(--space-20) * 2.5)`',
    '- `indicator`: token `space.0`; computed `calc(var(--space-0) + var(--ds-widget-padding-block) - var(--space-1) * 2)`',
    '- `Enter` (Opens the popup.): expect opens; target part `icon`; given `size: "sm"`, `open: false`; story URL `/iframe.html?id=widget-react--keyboard&viewMode=story&args=size:sm;open:!false`',
    '- `Tab` (Moves to the next item.): expect focus-next; repeat 2',
    '- `webOnly`: "Press {key} to open"; params `key` (string)',
    '- constant `hoverDelay`: `calc(var(--motion-duration-base) * 3)` (`motion.duration.base` × 3) ms',
    '- event `onClose` (emit `onClose`): since 0.2.0; use `onOpenChange` (emit `onOpenChange`); Use onOpenChange.',
  ],
  lit: [
    '- `onOpenChange`: emit `open-change`',
    "  - payload, the keys of `CustomEvent.detail`: `open: boolean`, `reason: 'escape' | 'controlled'`",
    '  - timing: request, fired before `close`',
    '- `open` is controlled when given, uncontrolled from `defaultOpen` when omitted; changes reported by `onOpenChange` (emit `open-change`); drives state `open`',
    '- `footer`: slot, `<slot name="footer-area">`',
    '- `backgroundHover`: token `color.action.primary.backgroundHover`; state `hover`; on web, lit',
    '- `menuWidth`: token `space.20`; computed `calc(var(--space-20) * 2.5)`',
    '- `indicator`: token `space.0`; computed `calc(var(--space-0) + var(--ds-widget-padding-block) - var(--space-1) * 2)`',
    'story URL `/iframe.html?id=widget-lit--keyboard&viewMode=story&args=size:sm;open:!false`',
    '`overlay.closeEvent` emits `open-change`.',
    '- example `lit-only`, story `LitOnly`: given `label: "Lit"`; Only on Lit.',
    '- event `onClose` (emit `close`): since 0.2.0; use `onOpenChange` (emit `open-change`); Use onOpenChange.',
  ],
  rn: [
    '- `onOpenChange`: emit `onOpenChange`',
    '- `footer`: slot, prop `footer`',
    '- `menuWidth`: token `space.20`; computed `t.space20 * 2.5`',
    '- `indicator`: token `space.0`; computed `t.space0 + paddingBlock - t.space1 * 2`',
    '- `Enter` (Opens the popup.): expect opens; target part `icon`; given `size: "sm"`, `open: false`',
    '- 1 rule(s) in the schema do not apply on rn; implement none of them',
    '- constant `hoverDelay`: `t.motionDurationBase * 3` (`motion.duration.base` × 3) ms',
  ],
  swiftui: [
    '- `onOpenChange`: emit `onOpenChange`',
    '- `footer`: slot, `@ViewBuilder` parameter `footerContent`',
    '- `menuWidth`: token `space.20`; computed `theme.space20 * 2.5`',
    '- `indicator`: token `space.0`; computed `theme.space0 + paddingBlock - theme.space1 * 2`',
    '- 1 rule(s) in the schema do not apply on swiftui; implement none of them',
    '- constant `hoverDelay`: `theme.motionDurationBase * 3` (`motion.duration.base` × 3) ms',
  ],
};

/** Lines every platform shows the same way. */
const SHARED = [
  '  - reasons: `escape` (Escape pressed while open); `controlled` (the open prop changed)',
  '  - cancelable: yes',
  '  - fires on: user, controlled',
  '- `closeButton`: component `Button`; props `variant` = "ghost", `label` ← prop `label`; forwards `background` → `overrides.background`',
  '- `icon`: element',
  '- `paddingBlock`: token `space.sm`; part `container`; by `size`: sm → `space.1`, any other value → `space.sm`',
  '- ` ` (Presses the native button.): expect manual; native: the rendered element already does this',
  'layer: popover',
  'discovery: context',
  '- `resultCount`: "{count} results"; params `count` (number); plural by `count`: one "{count} result", other "{count} results"',
  '- `invalid`: "Check {label}."',
  '- constant `swipeThreshold`: 1.5 px/ms',
  '- example `with-footer`, story `WithFooter`: given `label: "Save"`, `size: "sm"`; A widget with a footer.',
  '- component `Widget`: use `Button`; Replaced.',
  '- prop `tone`: since 0.2.0; use `variant`; Use variant.',
  '- value `tone: loud`: use `plain`; Too loud.',
];

describe('declared contract sections', () => {
  test.each(PLATFORMS)('every section renders on %s, resolved for the platform', (platform) => {
    const out = prompt(contractsFixture(), platform);
    const schemaEnd = out.indexOf('```\n\n## Events');
    const overrides = out.indexOf('## Overrides');
    expect(schemaEnd, 'the sections follow the schema block').toBeGreaterThan(0);
    let at = schemaEnd;
    for (const title of SECTIONS) {
      const found = out.indexOf(`\n## ${title}\n\n`, at);
      expect(found, `## ${title} on ${platform}, in order`).toBeGreaterThan(at);
      at = found;
    }
    expect(at).toBeLessThan(overrides);
    const contracts = out.slice(schemaEnd, overrides);
    for (const line of [...SHARED, ...EXPECTED[platform]]) expect(contracts).toContain(line);
    expect(out).not.toContain('{{CONTRACTS}}');
  });

  test('what a platform narrows away never reaches its prompt', () => {
    const c = contractsFixture();
    const sections = Object.fromEntries(PLATFORMS.map((p) => [p, parse.contractSections(c, p)]));
    // Copy narrowed to web.
    expect(sections.web).toContain('`webOnly`');
    for (const p of ['lit', 'rn', 'swiftui']) expect(sections[p]).not.toContain('webOnly');
    // A binding narrowed to web and Lit, and a keyboard rule with it.
    for (const p of ['rn', 'swiftui']) {
      expect(sections[p]).not.toContain('backgroundHover');
      expect(sections[p]).not.toContain('Moves to the next item.');
    }
    // An example narrowed to Lit.
    for (const p of ['web', 'rn', 'swiftui']) expect(sections[p]).not.toContain('lit-only');
    // A keyboard story URL exists only where the keyboard gate opens one.
    for (const p of ['rn', 'swiftui']) expect(sections[p]).not.toContain('story URL');
  });

  test('the computed expression is what computeBinding evaluates', () => {
    const c = contractsFixture();
    const binding = { token: 'space.4', computed: { times: 3, plus: [{ token: 'space.4', times: 0.5 }], minus: [{ binding: 'paddingBlock', times: 1 }] } };
    expect(parse.computedExpression(c, binding, 'web')).toBe('calc(var(--space-4) * 3.5 - var(--ds-widget-padding-block))');
    expect(parse.computedExpression(c, binding, 'swiftui')).toBe('theme.space4 * 3.5 - paddingBlock');
  });

  test('a pair by name alone renders no controlled-state section (job 651)', () => {
    const c = component();
    c.props.expanded = { type: 'boolean', description: 'Expanded.' };
    c.props.defaultExpanded = { type: 'boolean', default: false, description: 'Initially expanded.' };
    expect(parse.contractSections(c, 'web')).not.toContain('## Controlled state');
  });

  test.each(PLATFORMS)('a component using none of the fields renders no section on %s', (platform) => {
    const c = componentDef.parse(component()) as Dict;
    expect(parse.contractSections(c, platform)).toBe('');
    const out = prompt(c, platform);
    for (const title of SECTIONS) expect(out).not.toContain(`\n## ${title}\n`);
    // The schema block runs straight into the overrides, as it did before the placeholder existed.
    expect(out).toContain('```\n\n## Overrides');
  });
});

describe('templates', () => {
  test.each(PLATFORMS)('%s.md has one Declared contracts section, naming every section, under 110 lines', (platform) => {
    const text = readFileSync(join(parse.paths.TEMPLATES, `${platform}.md`), 'utf8').replace(/\r\n/g, '\n');
    expect(text.split('\n## Declared contracts\n').length).toBe(2);
    expect(text).toContain('{{CONTRACTS}}## Overrides');
    const rules = text.slice(text.indexOf('## Declared contracts'), text.indexOf('## Component schema'));
    for (const title of SECTIONS) expect(rules).toContain(`- **${title}**:`);
    expect(rules).toContain('`type: integer`');
    expect(text.trimEnd().split('\n').length).toBeLessThan(110);
  });
});
