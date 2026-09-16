/** schema/events.ts and eventDef's contract fields (job 610): payload, reasons, fires, cancelable and timing, the
 *  checks componentDef runs over them, the event registry, and registry drift — an error since the phase 3 doc
 *  migration (job 638) gave the one drifting doc a spelling the registry accepts. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';

import { componentDef, componentWarnings } from '../../schema/component.ts';
import type { ComponentDef } from '../../schema/component.ts';
import { conventionDrift, EVENT_CONVENTIONS, eventConvention } from '../../schema/events.ts';
import { REPO_ROOT } from '../lib/root.ts';
import * as parse from '../parse.ts';
import type { Dict } from '../parse.ts';
import { BODY, component, fmText, useStd, usePaths, useTmp, write } from './fixtures.ts';

const tmp = useTmp();
usePaths();
const std = useStd();

afterEach(() => {
  parse.takeWarnings();
});

type Issue = { path: PropertyKey[]; message: string };

function issues(c: Dict): Issue[] {
  const r = componentDef.safeParse(c);
  return r.success ? [] : r.error.issues.map((i) => ({ path: i.path, message: i.message }));
}

const accepts = (c: Dict): void => {
  expect(issues(c)).toEqual([]);
};
const rejects = (c: Dict, path: PropertyKey[], message: string): void => {
  expect(issues(c)).toContainEqual({ path, message });
};

/** The fixture component with these events added, each mapped on the fixture's platforms (web, rn). */
function withEvents(events: Dict): Dict {
  const c = component();
  for (const [name, ev] of Object.entries(events)) c.events[name] = { description: `${name}.`, platforms: { web: name, rn: name }, ...ev };
  return c;
}

/** The fixture with `events` and one scenario that clicks and asserts `then`. */
function withScenario(events: Dict, then: Dict): Dict {
  const c = withEvents(events);
  c.behavior = [{ name: 'click-fires', when: { click: 'container' }, then: [then] }];
  return c;
}

const DIALOG_REASONS = {
  escape: 'Escape pressed while open',
  'close-button': 'the close button was activated',
  scrim: 'the scrim was clicked',
  action: 'a footer action asked to close',
};
const reasonField = (values: string[]): Dict => ({ name: 'reason', type: 'enum', values });

describe('the contract fields', () => {
  test('a doc using every new field parses', () => {
    const c = withEvents({
      onClose: {
        payload: [
          reasonField(['escape', 'close-button', 'scrim', 'action']),
          { name: 'label', type: 'string', description: 'The action label.' },
          { name: 'index', type: 'number' },
          { name: 'open', type: 'boolean' },
          { name: 'ids', type: 'array', shape: 'string[]' },
          { name: 'cell', type: 'object', shape: '{ rowId: string; column: string }' },
          { name: 'value', type: 'union', shape: 'string | string[]' },
        ],
        reasons: DIALOG_REASONS,
        fires: ['user', 'programmatic'],
        cancelable: true,
        timing: { phase: 'request' },
      },
      onDragDismiss: { payload: [], fires: ['user'], timing: { phase: 'before-change', before: ['onClose'] } },
    });
    c.behavior = [{ name: 'escape-closes', when: { click: 'container' }, then: [{ event: 'onClose', with: { reason: 'escape', open: false } }] }];
    accepts(c);
  });

  test('an empty payload means the handler takes no arguments', () => {
    accepts(withEvents({ onOpened: { payload: [] } }));
  });

  test('every timing phase and fires source is accepted', () => {
    for (const phase of ['request', 'before-change', 'after-change', 'commit']) accepts(withEvents({ onX: { timing: { phase } } }));
    accepts(withEvents({ onX: { fires: ['user', 'programmatic', 'controlled'] } }));
  });

  test('an enum field needs values', () => {
    rejects(withEvents({ onClose: { payload: [{ name: 'reason', type: 'enum' }] } }), ['events', 'onClose', 'payload', 0, 'values'], "an enum payload field needs 'values'");
  });

  test('array, object and union fields need shape', () => {
    rejects(withEvents({ onX: { payload: [{ name: 'ids', type: 'array' }] } }), ['events', 'onX', 'payload', 0, 'shape'], "an array payload field needs 'shape'");
    rejects(withEvents({ onX: { payload: [{ name: 'cell', type: 'object' }] } }), ['events', 'onX', 'payload', 0, 'shape'], "an object payload field needs 'shape'");
    rejects(withEvents({ onX: { payload: [{ name: 'value', type: 'union' }] } }), ['events', 'onX', 'payload', 0, 'shape'], "a union payload field needs 'shape'");
  });

  test('a field name is an identifier, and a field is strict', () => {
    rejects(withEvents({ onX: { payload: [{ name: 'row id', type: 'string' }] } }), ['events', 'onX', 'payload', 0, 'name'], 'Expected an identifier like reason or rowId');
    expect(issues(withEvents({ onX: { payload: [{ name: 'id', type: 'string', optional: true }] } })).map((i) => i.path)).toEqual([['events', 'onX', 'payload', 0]]);
    expect(issues(withEvents({ onX: { payload: [{ name: 'id', type: 'date' }] } })).map((i) => i.path)).toEqual([['events', 'onX', 'payload', 0, 'type']]);
  });

  test('reasons are kebab-case, fires is non-empty, timing is strict', () => {
    rejects(withEvents({ onX: { reasons: { closeButton: 'x' } } }), ['events', 'onX', 'reasons', 'closeButton'], 'Invalid key in record');
    expect(issues(withEvents({ onX: { fires: [] } })).map((i) => i.path)).toEqual([['events', 'onX', 'fires']]);
    expect(issues(withEvents({ onX: { fires: ['timer'] } })).map((i) => i.path)).toEqual([['events', 'onX', 'fires', 0]]);
    expect(issues(withEvents({ onX: { timing: { phase: 'during' } } })).map((i) => i.path)).toEqual([['events', 'onX', 'timing', 'phase']]);
    expect(issues(withEvents({ onX: { timing: { phase: 'commit', after: [] } } })).map((i) => i.path)).toEqual([['events', 'onX', 'timing']]);
  });
});

describe('reasons and payload', () => {
  test('a reason enum whose values are the reason keys, in any order, passes', () => {
    accepts(withEvents({ onClose: { reasons: DIALOG_REASONS, payload: [reasonField(['scrim', 'escape', 'action', 'close-button'])] } }));
  });

  test('reasons alone, or a payload alone, is not checked', () => {
    accepts(withEvents({ onClose: { reasons: DIALOG_REASONS } }));
    accepts(withEvents({ onClose: { payload: [{ name: 'open', type: 'boolean' }] } }));
  });

  test('a payload without a reason field is rejected', () => {
    rejects(withEvents({ onClose: { reasons: DIALOG_REASONS, payload: [{ name: 'open', type: 'boolean' }] } }), ['events', 'onClose', 'payload'], "events.onClose declares reasons but its payload has no 'reason' field");
  });

  test('a reason field that is not an enum is rejected', () => {
    rejects(withEvents({ onClose: { reasons: DIALOG_REASONS, payload: [{ name: 'open', type: 'boolean' }, { name: 'reason', type: 'string' }] } }), ['events', 'onClose', 'payload', 1, 'type'], "events.onClose payload field 'reason' must be an enum of its reasons, got 'string'");
  });

  test('reason values that are not exactly the reason keys are rejected', () => {
    rejects(withEvents({ onClose: { reasons: DIALOG_REASONS, payload: [reasonField(['escape', 'scrim'])] } }), ['events', 'onClose', 'payload', 0, 'values'], "events.onClose payload field 'reason' values ['escape', 'scrim'] are not its reasons ['escape', 'close-button', 'scrim', 'action']");
    rejects(withEvents({ onClose: { reasons: { escape: 'x' }, payload: [reasonField(['escape', 'outside'])] } }), ['events', 'onClose', 'payload', 0, 'values'], "events.onClose payload field 'reason' values ['escape', 'outside'] are not its reasons ['escape']");
  });
});

describe('a controlled reason', () => {
  const REASONS = { pointer: 'clicked', controlled: 'the open prop changed' };

  test('passes when fires includes controlled, or fires is not declared', () => {
    accepts(withEvents({ onToggle: { reasons: REASONS, fires: ['user', 'controlled'] } }));
    accepts(withEvents({ onToggle: { reasons: REASONS } }));
  });

  test('is rejected when fires lacks controlled', () => {
    rejects(withEvents({ onToggle: { reasons: REASONS, fires: ['user'] } }), ['events', 'onToggle', 'fires'], "events.onToggle has a 'controlled' reason but fires lacks 'controlled'");
  });
});

describe('cancelable', () => {
  test('passes before the change, or with no timing', () => {
    accepts(withEvents({ onEditStart: { cancelable: true, timing: { phase: 'before-change' } } }));
    accepts(withEvents({ onEditStart: { cancelable: true } }));
    accepts(withEvents({ onChange: { cancelable: false, timing: { phase: 'after-change' } } }));
  });

  test('is rejected after the change', () => {
    rejects(withEvents({ onChange: { cancelable: true, timing: { phase: 'after-change' } } }), ['events', 'onChange', 'cancelable'], 'events.onChange is cancelable but fires after-change, when nothing is left to cancel');
  });
});

describe('timing.before', () => {
  test('names another event of this component', () => {
    accepts(withEvents({ onClose: { timing: { phase: 'request' } }, onDragDismiss: { timing: { phase: 'before-change', before: ['onClose', 'onPress'] } } }));
  });

  test('an event this component does not have is rejected', () => {
    rejects(withEvents({ onDragDismiss: { timing: { phase: 'before-change', before: ['onClose'] } } }), ['events', 'onDragDismiss', 'timing', 'before', 0], "events.onDragDismiss timing.before names 'onClose', which is not an event of this component");
  });

  test('the event itself is rejected', () => {
    rejects(withEvents({ onClose: { timing: { phase: 'request', before: ['onClose'] } } }), ['events', 'onClose', 'timing', 'before', 0], 'events.onClose timing.before names the event itself');
  });

  test('two events listing each other are rejected once, on the later', () => {
    const c = withEvents({ onA: { timing: { phase: 'request', before: ['onB'] } }, onB: { timing: { phase: 'request', before: ['onPress', 'onA'] } } });
    expect(issues(c)).toEqual([{ path: ['events', 'onB', 'timing', 'before', 1], message: 'events.onB and events.onA each list the other in timing.before' }]);
  });
});

describe('then.event with', () => {
  const CLOSE = { onClose: { reasons: DIALOG_REASONS, payload: [reasonField(Object.keys(DIALOG_REASONS)), { name: 'open', type: 'boolean' }] } };

  test('an object with a declared reason and payload keys passes', () => {
    accepts(withScenario(CLOSE, { event: 'onClose', with: { reason: 'scrim', open: false } }));
    accepts(withScenario(CLOSE, { event: 'onClose', with: { reason: 'scrim' } }));
  });

  test('a reason that is not one of the event reasons is rejected', () => {
    rejects(withScenario(CLOSE, { event: 'onClose', with: { reason: 'outside' } }), ['behavior', 0, 'then', 0, 'with', 'reason'], "scenario 'click-fires' then.with.reason: 'outside' is not one of events.onClose reasons ['escape', 'close-button', 'scrim', 'action']");
  });

  test('a key that is not a payload field is rejected when the payload has two or more fields', () => {
    rejects(withScenario(CLOSE, { event: 'onClose', with: { reason: 'scrim', value: 1 } }), ['behavior', 0, 'then', 0, 'with', 'value'], "scenario 'click-fires' then.with.value: not a payload field of events.onClose ['reason', 'open']");
  });

  test('with exactly one payload field, with stays that field value', () => {
    const ONE = { onToggle: { payload: [{ name: 'open', type: 'boolean' }] } };
    accepts(withScenario(ONE, { event: 'onToggle', with: true }));
    accepts(withScenario(ONE, { event: 'onToggle', with: { anything: 1 } }));
  });

  test('an event without contract fields keeps today\'s with', () => {
    accepts(withScenario({ onToggle: {} }, { event: 'onToggle', with: { reason: 'anything', extra: 1 } }));
  });
});

describe('the real contracts phase 3 migrates', () => {
  test('Dialog.onClose: four reasons, a request the consumer decides', () => {
    accepts(withEvents({
      onClose: {
        description: 'Fired when the user requests to close, with a reason. The consumer sets open to false (or not).',
        payload: [reasonField(['escape', 'close-button', 'scrim', 'action'])],
        reasons: DIALOG_REASONS,
        fires: ['user'],
        timing: { phase: 'request' },
      },
    }));
  });

  test('Disclosure.onToggle: fires on a controlled change, with a controlled reason', () => {
    accepts(withEvents({
      onToggle: {
        description: 'Fired after the state changes, with the new boolean open and a reason.',
        payload: [{ name: 'open', type: 'boolean' }, reasonField(['pointer', 'keyboard', 'controlled'])],
        reasons: { pointer: 'the trigger was clicked or tapped', keyboard: 'Enter or Space on the trigger', controlled: 'the open prop changed' },
        fires: ['user', 'controlled'],
        timing: { phase: 'after-change' },
      },
    }));
  });

  test('BottomSheet.onDragDismiss: fires before onClose', () => {
    accepts(withEvents({
      onClose: { payload: [reasonField(['escape', 'close-button', 'scrim', 'drag', 'action'])], reasons: { ...DIALOG_REASONS, drag: 'dragged past the dismiss threshold' }, timing: { phase: 'request' } },
      onDragDismiss: { payload: [], fires: ['user'], timing: { phase: 'request', before: ['onClose'] } },
    }));
  });

  test("Accordion's with: { reason: trigger } fails against Disclosure-style reasons", () => {
    const c = withScenario(
      { onOpenChange: { payload: [{ name: 'id', type: 'string' }, { name: 'open', type: 'boolean' }, reasonField(['pointer', 'keyboard', 'controlled'])], reasons: { pointer: 'clicked', keyboard: 'Enter or Space', controlled: 'the value prop changed' }, fires: ['user', 'controlled'] } },
      { event: 'onOpenChange', with: { id: 'a', open: true, reason: 'trigger' } },
    );
    expect(issues(c)).toEqual([{ path: ['behavior', 0, 'then', 0, 'with', 'reason'], message: "scenario 'click-fires' then.with.reason: 'trigger' is not one of events.onOpenChange reasons ['pointer', 'keyboard', 'controlled']" }]);
  });
});

// --------------------------------------------------------------------- the registry

const generated = (JSON.parse(readFileSync(join(REPO_ROOT, 'generated', 'components.json'), 'utf8')) as Dict[]).map((entry) => entry.component as Dict);

/** Event name → the components in generated/components.json that declare it. */
function usersByName(): Map<string, string[]> {
  const by = new Map<string, string[]>();
  for (const c of generated) for (const name of Object.keys(c.events ?? {})) by.set(name, [...(by.get(name) ?? []), c.name as string]);
  return by;
}

describe('EVENT_CONVENTIONS', () => {
  test('every entry parses with eventConvention', () => {
    for (const [name, entry] of Object.entries(EVENT_CONVENTIONS)) expect(eventConvention.safeParse(entry).success, name).toBe(true);
  });

  test('an entry needs a non-empty spelling list on every platform', () => {
    const entry = { description: 'x', platforms: { web: ['onX'], lit: ['x'], rn: ['onX'], swiftui: ['onX'] } };
    expect(eventConvention.safeParse(entry).success).toBe(true);
    expect(eventConvention.safeParse({ ...entry, platforms: { ...entry.platforms, rn: [] } }).error?.issues.map((i) => i.path)).toEqual([['platforms', 'rn']]);
    expect(eventConvention.safeParse({ ...entry, platforms: { web: ['onX'], lit: ['x'], rn: ['onX'] } }).success).toBe(false);
  });

  test('every name in it appears in at least two components, and every name two components share is in it', () => {
    const by = usersByName();
    for (const name of Object.keys(EVENT_CONVENTIONS)) expect(by.get(name)?.length ?? 0, name).toBeGreaterThanOrEqual(2);
    const shared = [...by].filter(([, users]) => users.length >= 2).map(([name]) => name).sort();
    expect(Object.keys(EVENT_CONVENTIONS).sort()).toEqual(shared);
  });

  test('onChange on rn accepts all three spellings, preferring onChange', () => {
    expect(EVENT_CONVENTIONS.onChange?.platforms.rn).toEqual(['onChange', 'onChangeText', 'onValueChange']);
  });
});

describe('conventionDrift', () => {
  const DRIFT_MESSAGE = "'onTap' is not a registry spelling; the registry accepts 'onPress'";

  test('a spelling the registry does not accept is rejected, with its path and message', () => {
    const c = component();
    c.events.onPress.platforms.rn = 'onTap';
    // The rule reads the same as it did as a warning; the phase 3 migration moved it into componentDef.check.
    expect(conventionDrift(c)).toEqual([{ path: 'events.onPress.platforms.rn', message: DRIFT_MESSAGE }]);
    rejects(c, ['events', 'onPress', 'platforms', 'rn'], DRIFT_MESSAGE);
    expect(componentWarnings(componentDef.parse(component()) as ComponentDef), 'drift is no longer a warning').toEqual([]);
  });

  test('accepted alternatives and names outside the registry are accepted', () => {
    const c = component();
    // The three React Native spellings of onChange are registry facts, not drift.
    c.events.onChange = { description: 'x', platforms: { web: 'onChange', rn: 'onValueChange' } };
    c.events.onWhatever = { description: 'x', platforms: { web: 'onSomething', rn: 'onElse' } };
    expect(conventionDrift(c)).toEqual([]);
    accepts(c);
  });

  test('over generated/components.json no component drifts', () => {
    expect(generated.flatMap((c) => conventionDrift(c).map((w) => ({ component: c.name, ...w })))).toEqual([]);
  });
});

describe('parse.main', () => {
  test('a doc with drift fails the run, and no warning records it', () => {
    const root = tmp();
    const templates = join(root, 'templates');
    write(join(templates, 'web.md'), '{{NAME}}|{{PLATFORM}}');
    write(join(templates, 'rn.md'), '{{NAME}}|{{PLATFORM}}');
    write(join(templates, 'theme.md'), '{{NAME}}');
    const c = component();
    c.events.onPress.platforms.rn = 'onTap';
    write(join(root, 'components', 'widget.md'), '---\n' + fmText(c) + '---\n' + BODY);
    Object.assign(parse.paths, {
      ROOT: root, DOCS: join(root, 'components'), THEME_DOCS: join(root, 'themes'), OUT: join(root, 'generated'), TEMPLATES: templates,
      EXT_DOCS: join(root, 'extensions'), PATTERN_DOCS: join(root, 'patterns'),
    });
    const message = "events.onPress.platforms.rn: 'onTap' is not a registry spelling; the registry accepts 'onPress'";

    expect(parse.main(), 'drift now fails the run').not.toBe(0);
    expect(std.err()).toContain(message);
    expect(JSON.parse(readFileSync(join(root, 'generated', 'parse-warnings.json'), 'utf8'))).not.toContainEqual({ file: 'components/widget.md', message });
    expect(parse.takeWarnings()).toEqual([]);
  });
});

describe('the migrated corpus', () => {
  const events = (c: Dict): [string, string, Dict][] =>
    Object.entries((c.events ?? {}) as Record<string, Dict>).map(([name, ev]) => [c.name as string, name, ev]);
  const all = generated.flatMap(events);

  test('every declared reasons record matches its reason payload field values', () => {
    const declared = all.filter(([, , ev]) => ev.reasons !== undefined && ev.payload !== undefined);
    expect(declared.length, 'the corpus declares both fields somewhere').toBeGreaterThan(0);
    for (const [comp, name, ev] of declared) {
      const field = (ev.payload as Dict[]).find((f) => f.name === 'reason');
      expect(field?.values, `${comp}.${name}`).toEqual(Object.keys(ev.reasons as Dict));
    }
  });

  test("every timing.before names a sibling event that is not the event itself", () => {
    const ordered = all.filter(([, , ev]) => ((ev.timing as Dict | undefined)?.before as string[] | undefined)?.length);
    expect(ordered.length, 'the corpus orders some events').toBeGreaterThan(0);
    for (const [comp, name, ev] of ordered) {
      const siblings = Object.keys(((generated.find((c) => c.name === comp) as Dict).events ?? {}) as Dict);
      for (const other of (ev.timing as Dict).before as string[]) {
        expect(siblings, `${comp}.${name}`).toContain(other);
        expect(other, `${comp}.${name}`).not.toBe(name);
      }
    }
  });

  test('a controlled reason always comes with a controlled source', () => {
    for (const [comp, name, ev] of all) {
      if (ev.reasons === undefined || !Object.hasOwn(ev.reasons as Dict, 'controlled') || ev.fires === undefined) continue;
      expect(ev.fires as string[], `${comp}.${name}`).toContain('controlled');
    }
  });
});
