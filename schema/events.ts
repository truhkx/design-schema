/**
 * Event contracts and the event registry.
 *
 * The field schemas an event declares beyond its description (`payload`, `reasons`, `fires`, `timing`) live here,
 * and schema/component.ts's `eventDef` imports them. `EVENT_CONVENTIONS` is the one registry of the event names
 * components share: what each means and how each platform spells it. A component whose platform name is not a
 * registry spelling is reported by `conventionDrift`, which `componentWarnings` returns as a warning.
 *
 * schema/component.ts imports this file, so this file never imports schema/component.ts.
 *
 * Runs under Node's type stripping: annotations only.
 */
import { z } from 'zod';

import { platformId } from './platforms.ts';

/** The kinds a handler argument can be. */
export const PAYLOAD_TYPES = ['string', 'number', 'boolean', 'enum', 'array', 'object', 'union'] as const;
/** Payload types whose value only `shape` can spell. */
const SHAPED_TYPES: readonly string[] = ['array', 'object', 'union'];

export const payloadField = z
  .strictObject({
    name: z.string().regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, 'Expected an identifier like reason or rowId').describe('The argument name: an identifier. On Lit it is the key in CustomEvent.detail.'),
    type: z.enum(PAYLOAD_TYPES).describe("A value of more than one kind is 'union', with the kinds spelled out in shape."),
    shape: z.string().optional().describe("For array/object/union fields: the item or field shape in TypeScript-like notation, e.g. 'string[]' or '{ rowId: string; column: string }'. Required for those three types."),
    values: z.array(z.string()).optional().describe('For enum fields: every value the handler can receive. Required for enum.'),
    description: z.string().optional(),
  })
  .check((ctx) => {
    const f = ctx.value;
    if (f.type === 'enum' && f.values === undefined) ctx.issues.push({ code: 'custom', input: f, path: ['values'], message: "an enum payload field needs 'values'" });
    if (SHAPED_TYPES.includes(f.type) && f.shape === undefined) ctx.issues.push({ code: 'custom', input: f, path: ['shape'], message: `a${f.type === 'array' || f.type === 'object' ? 'n' : ''} ${f.type} payload field needs 'shape'` });
  })
  .meta({ id: 'payloadField' });

export const eventPayload = z
  .array(payloadField)
  .describe("The handler's arguments, in order. On web, React Native and SwiftUI they are positional parameters; on Lit they are the keys of CustomEvent.detail. An empty array means the handler takes no arguments. When the event declares reasons, one field is { name: reason, type: enum } with the reason keys as its values.");

export const eventReasons = z
  .record(z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Expected a kebab-case reason like close-button'), z.string())
  .describe("Why the event fired: each kebab-case reason the handler can receive, mapped to when it is reported, e.g. { escape: 'Escape pressed while open', close-button: 'the close button was activated' }. A controlled reason means the consumer changed a controlled prop, and fires must then include controlled.");

export const EVENT_SOURCES = ['user', 'programmatic', 'controlled'] as const;

export const eventFires = z
  .array(z.enum(EVENT_SOURCES))
  .min(1)
  .describe('Who can make the event fire: user (an interaction), programmatic (the component changes state on its own, such as autoplay or a timeout), controlled (the consumer changed a controlled prop). Generators fire the event for exactly these sources.');

export const EVENT_PHASES = ['request', 'before-change', 'after-change', 'commit'] as const;

export const eventTiming = z
  .strictObject({
    phase: z.enum(EVENT_PHASES).describe('When the event fires relative to the state change. request: the component does not change its own state; the consumer decides (Dialog onClose). before-change: fired before the component applies the change. after-change: fired once the new state is in effect. commit: fired once at the end of a continuous interaction (Slider onChangeEnd).'),
    before: z.array(z.string()).optional().describe("Events of this component that this one fires ahead of, when both fire for one interaction, e.g. onDragDismiss's before: [onClose]. Never the event itself, and two events never list each other."),
  })
  .meta({ id: 'eventTiming' });

export const eventConvention = z
  .strictObject({
    description: z.string().describe('What the event means wherever it appears, and why any alternative spelling is accepted.'),
    platforms: z.record(platformId, z.array(z.string().min(1)).min(1)).describe('Per platform, the accepted spellings of the event name; the first is preferred.'),
    payload: eventPayload.optional(),
    reasons: eventReasons.optional(),
  })
  .meta({ id: 'eventConvention' });

export type EventConvention = z.infer<typeof eventConvention>;

/** The neutral event names two or more components share, and how each platform spells them. */
export const EVENT_CONVENTIONS: Readonly<Record<string, EventConvention>> = z.record(z.string().regex(/^on[A-Z][A-Za-z0-9]*$/), eventConvention).parse({
  onAction: {
    description: 'An action or item was chosen, or an action button activated.',
    platforms: { web: ['onAction'], lit: ['action'], rn: ['onAction'], swiftui: ['onAction'] },
  },
  onCellChange: {
    description: 'A grid cell edit committed.',
    platforms: { web: ['onCellChange'], lit: ['cell-change'], rn: ['onCellChange'], swiftui: ['onCellChange'] },
  },
  onChange: {
    description: "The component's value changed. On React Native, onChangeText is TextInput's own name and applies to text entry (Input, NumberInput, Search); onValueChange is the name the native scalar controls use (Slider, Switch); every other component uses onChange.",
    platforms: { web: ['onChange'], lit: ['change'], rn: ['onChange', 'onChangeText', 'onValueChange'], swiftui: ['onChange'] },
  },
  onClose: {
    description: 'The surface was dismissed, or the user asked to dismiss it.',
    platforms: { web: ['onClose'], lit: ['close'], rn: ['onClose'], swiftui: ['onClose'] },
  },
  onColumnResize: {
    description: 'The user finished resizing a column.',
    platforms: { web: ['onColumnResize'], lit: ['column-resize'], rn: ['onColumnResize'], swiftui: ['onColumnResize'] },
  },
  onDismiss: {
    description: 'The message left, or the user dismissed it.',
    platforms: { web: ['onDismiss'], lit: ['dismiss'], rn: ['onDismiss'], swiftui: ['onDismiss'] },
  },
  onEditStart: {
    description: 'An editor is about to open on a cell.',
    platforms: { web: ['onEditStart'], lit: ['edit-start'], rn: ['onEditStart'], swiftui: ['onEditStart'] },
  },
  onExpand: {
    description: 'A lazy node or row was expanded and its children must be loaded.',
    platforms: { web: ['onExpand'], lit: ['expand'], rn: ['onExpand'], swiftui: ['onExpand'] },
    payload: [{ name: 'id', type: 'string', description: 'The expanded node or row.' }],
  },
  onExpandChange: {
    description: 'The set of expanded nodes or rows changed.',
    platforms: { web: ['onExpandChange'], lit: ['expand-change'], rn: ['onExpandChange'], swiftui: ['onExpandChange'] },
    payload: [{ name: 'ids', type: 'array', shape: 'string[]', description: 'Every expanded id, as a bare array.' }],
  },
  onOpenChange: {
    description: 'A popup, panel or section opened or closed.',
    platforms: { web: ['onOpenChange'], lit: ['open-change'], rn: ['onOpenChange'], swiftui: ['onOpenChange'] },
  },
  onPress: {
    description: "The control was activated. Web spells it onClick, the DOM's name, and SwiftUI action, the Button initializer's parameter. On Lit, press is the component's CustomEvent; click applies when the component renders a native element whose own click event is retargeted out of the shadow root instead (Link's anchor).",
    platforms: { web: ['onClick'], lit: ['press', 'click'], rn: ['onPress'], swiftui: ['action'] },
  },
  onSelectionChange: {
    description: 'The selected rows, cells or nodes changed.',
    platforms: { web: ['onSelectionChange'], lit: ['selection-change'], rn: ['onSelectionChange'], swiftui: ['onSelectionChange'] },
  },
  onSortChange: {
    description: 'The sort column or direction changed.',
    platforms: { web: ['onSortChange'], lit: ['sort-change'], rn: ['onSortChange'], swiftui: ['onSortChange'] },
  },
  onSubmit: {
    description: "The user submitted. On React Native, onSubmitEditing is TextInput's own name and applies to a text field's return key (Search); a form uses onSubmit.",
    platforms: { web: ['onSubmit'], lit: ['submit'], rn: ['onSubmit', 'onSubmitEditing'], swiftui: ['onSubmit'] },
  },
});

type EventNames = { events?: Record<string, { platforms: Partial<Record<string, string>> }> };

/** One finding per event whose name is in the registry but whose platform name is not an accepted spelling. */
export function conventionDrift(component: EventNames): { path: string; message: string }[] {
  const out: { path: string; message: string }[] = [];
  for (const [name, ev] of Object.entries(component.events ?? {})) {
    if (!Object.hasOwn(EVENT_CONVENTIONS, name)) continue;
    const convention = EVENT_CONVENTIONS[name] as EventConvention;
    for (const [platform, given] of Object.entries(ev.platforms)) {
      const accepted = convention.platforms[platform as keyof EventConvention['platforms']];
      if (given === undefined || accepted === undefined || accepted.includes(given)) continue;
      out.push({ path: `events.${name}.platforms.${platform}`, message: `'${given}' is not a registry spelling; the registry accepts ${accepted.map((s) => `'${s}'`).join(', ')}` });
    }
  }
  return out;
}
