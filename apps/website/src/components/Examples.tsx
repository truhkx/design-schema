import { Component as ReactComponent, createElement, useState, type ElementType, type ErrorInfo, type ReactNode } from 'react';
import { Alert, Box, Button, Card, Disclosure, Heading, Link, Stack, TabPanel, Tabs, Text } from '@design-schema/react';

import { COMPONENTS, contentGaps, exampleProps } from '../example-args';
import type { Caption } from '../example-sweep';
import { PLATFORM_ORDER, storybookLink, type ExampleView, type HarnessEvents, type Layout, type Platform } from '../examples';
import type { PlatformCode } from '../highlight';
import { Mono } from './Mono';

/** User-facing strings, in one place, the way the generated components keep theirs. */
/** The level a grid's group labels render at, and so the level its first tile follows. */
const GROUP_HEADING_LEVEL = 3;

const COPY = {
  heading: 'Examples',
  openInStorybook: 'Open in Storybook',
  none: 'This component has no Storybook stories yet, so there is nothing to project here.',
  notExported: 'Not renderable here',
  notExportedBody:
    'The stories for this component exist, but the package does not export it, so this page can ' +
    'show their source without running them.',
  sourceOnly:
    'This story does not render from its args alone — it builds its own demo around the component. ' +
    'Its source is below; open it in Storybook to interact with it.',
  decorated:
    'This story frames the component in a decorator — a background, a width — that this page does not ' +
    'run, so it is shown as source rather than rendered without its frame.',
  /**
   * An example whose content is the part that could not be carried (see `contentGaps`). Rendering it
   * would be a working-looking shell with nothing in it, which reads as a broken component; the
   * source below is the real thing.
   */
  contentOnlyBefore: 'This example’s ',
  contentOnlyOne: ' is built in code rather than data, so it is shown as source below rather than as a component with nothing in it.',
  contentOnlyMany: ' are built in code rather than data, so it is shown as source below rather than as a component with nothing in it.',
  pageHeading:
    'Not rendered here: this example renders a level-1 heading, and a page has one of those — the ' +
    'title at the top of this one. Its source stands in, and it says the same thing either way: ' +
    'level 1 really does produce an <h1>, which is the whole reason this page cannot embed it.',
  headingSkip:
    'Not rendered here: a grid shows every tile at once, and this example’s heading would skip a ' +
    'level after the one above it. Its source stands in — the level it names is the point, and the ' +
    'page outline cannot demonstrate it and stay unbroken at the same time.',
  more: (count: number) => `More examples (${count})`,
  moreLabel: (name: string) => `More ${name} examples`,
  defaultGroup: 'Default',
  sweepSource: 'Source for these examples',
  separator: ' · ',
  platforms: { react: 'React', rn: 'React Native', lit: 'Lit', swift: 'Swift' } satisfies Record<Platform, string>,
  platformStrip: (scenario: string) => `${scenario}: code by platform`,
  noModule: (platform: string) => `This component has no ${platform} stories yet, so there is no ${platform} code to show.`,
  noStory: (platform: string) =>
    `No ${platform} story covers this scenario, so there is no ${platform} code for it. The other scenarios may have one.`,
  swiftPending: 'SwiftUI example ships once this component is generated for iOS — see the iOS platform plan, ',
  swiftPlan: 'site/src/content/docs/process/ios-platform.md',
  swiftPendingEnd: '.',
  swiftNoPreview: 'The generated SwiftUI view has no preview for this scenario, so there is no Swift code for it.',
  litRegister: 'Register the elements once, anywhere in the app: ',
  /**
   * The harness button's label. Which components get a harness is the schema's call (see
   * tools/docs_examples.ts, `harnessOf`); only the wording is kept here, and a component without an
   * entry reads "Open <its name>" — so a new overlay gets a working button before anyone words it.
   */
  harnessLabels: {
    Dialog: 'Open dialog',
    AlertDialog: 'Open alert',
    BottomSheet: 'Show sheet',
    SidePanel: 'Open panel',
    ActionSheet: 'Show actions',
  } as Record<string, string>,
  harnessLabel: (name: string) => `Open ${name.replace(/(?<=[a-z])(?=[A-Z])/g, ' ').toLowerCase()}`,
  /** The neutral content `EXAMPLE_CONTEXT` puts around an example that is furniture on its own. */
  context: {
    dividerAbove: 'Today',
    dividerBelow: 'Earlier',
    // The same pair the stories' `inRow` decorator puts either side of a vertical Divider.
    dividerBefore: 'Bold Italic',
    dividerAfter: 'Align left',
    stackItem: (position: number) => `Item ${position}`,
  },
};

/**
 * Examples that are furniture on their own, given the frame Storybook's decorator gives them.
 *
 * A horizontal Divider is a 1px line in an otherwise empty card, and a Stack whose children were
 * code in the story (a `.map`, which the extractor cannot carry) is an empty flex box; both read as
 * broken. The site owns how an example is presented, so the frame is kept here, by component name,
 * rather than in the stories or the JSON: each entry gets the component and the example's props and
 * returns what to render, or `null` to render the example bare. The code panel still shows the story
 * as written — the frame is presentation, not part of the example.
 */
const EXAMPLE_CONTEXT: Record<string, (component: ElementType, props: Record<string, unknown>) => ReactNode | null> = {
  // Two short lines either side, so the rule is visibly between something — beside, for a vertical
  // one, in a stretched row as the stories' `inRow` decorator does. Gap `none`, so the space around
  // the line is the Divider's own `spacing`, which is what half these examples are showing.
  Divider: (component, props) =>
    props['orientation'] === 'vertical' ? (
      <Stack direction="horizontal" align="stretch" gap="tight">
        <Text>{COPY.context.dividerBefore}</Text>
        {createElement(component, props)}
        <Text>{COPY.context.dividerAfter}</Text>
      </Stack>
    ) : (
      <Stack direction="vertical" gap="none">
        <Text>{COPY.context.dividerAbove}</Text>
        {createElement(component, props)}
        <Text>{COPY.context.dividerBelow}</Text>
      </Stack>
    ),
  // Only a Stack with nothing in it: one whose story's children survived renders as written.
  Stack: (component, props) => {
    const children = props['children'];
    if (children !== undefined && children !== null && !(Array.isArray(children) && children.length === 0)) return null;
    return createElement(
      component,
      props,
      ...[1, 2, 3].map((position) => (
        <Box key={position} inset="sm" surface="subtle" radius="sm">
          <Text>{COPY.context.stackItem(position)}</Text>
        </Box>
      )),
    );
  },
};

interface TriggerHarnessProps {
  component: ElementType;
  /** The example's props, already decoded; `open` is overridden here. */
  props: Record<string, unknown>;
  label: string;
  events: HarnessEvents;
}

/**
 * An overlay a consumer opens from elsewhere, with the elsewhere supplied: a secondary Button that
 * sets `open`, and the component's own close events wired back to it — what a real consumer writes,
 * and what the story's `open: true` stands in for in Storybook.
 *
 * Closed on the server and on first render, so hydration matches and nothing opens over the page on
 * load. Focus is not handled here: returning it to the button on close is the component's contract,
 * and tests/website/overlay-harness.spec.ts holds it to that. An example that passes a `trigger` of
 * its own (SidePanel's) keeps it, and the harness only owns the state.
 */
function TriggerHarness({ component, props, label, events }: TriggerHarnessProps) {
  const [open, setOpen] = useState(false);
  const wiring: Record<string, (next?: unknown) => void> = {};
  for (const event of events.close) wiring[event] = () => setOpen(false);
  for (const event of events.change) wiring[event] = (next) => setOpen(next === true);
  return (
    <>
      {props['trigger'] === undefined ? <Button variant="secondary" label={label} onClick={() => setOpen(true)} /> : null}
      {createElement(component, { ...props, ...wiring, open })}
    </>
  );
}

interface StateHarnessProps {
  component: ElementType;
  /** The example's props, already decoded; their `open` is the first value (see `exampleProps`). */
  props: Record<string, unknown>;
  events: HarnessEvents;
}

/**
 * A component with an opener of its own (Menu's trigger, Select's field, Disclosure's summary) whose
 * story pins `open`: the page adds no button, it only holds the state — what a consumer of a
 * controlled component writes — so the trigger and the component's own dismissals work.
 *
 * The first value is `exampleProps`'s: closed for anything floating, so nothing opens over the page on
 * load and selecting a tab never moves focus into a panel; the story's own for an inline component
 * (Disclosure "Controlled" starts expanded). Wired exactly as `TriggerHarness` is.
 */
function StateHarness({ component, props, events }: StateHarnessProps) {
  const [open, setOpen] = useState(props['open'] === true);
  const wiring: Record<string, (next?: unknown) => void> = {};
  for (const event of events.close) wiring[event] = () => setOpen(false);
  for (const event of events.change) wiring[event] = (next) => setOpen(next === true);
  return createElement(component, { ...props, ...wiring, open });
}

export interface ExamplesProps {
  /** The component the examples render — a `@design-schema/react` export name. */
  name: string;
  /** How to lay the set out, from `generated/examples/<Name>.json`: one grid, or tabs. */
  layout: Layout;
  /** `generated/examples/<Name>.json`'s examples, in story order, without their raw snippets (see `code`). */
  examples: ExampleView[];
  /**
   * Whether each example renders live, in the same order — from ../example-probe.ts, which answered
   * it by rendering them at build time rather than by inspecting them.
   */
  renderable: boolean[];
  /**
   * Whether each example renders only without its story's `open`, in the same order — an overlay that
   * opens from its own trigger, rendered closed so the visitor opens it. From ../example-probe.ts.
   */
  withoutOpen: boolean[];
  /** The events a harness wires, from `generated/examples/<Name>.json`, or `null` when it has none. */
  harnessEvents: HarnessEvents | null;
  /**
   * Whether the component's open state floats above the page, from the same file: a `state`
   * example then starts closed, and its card leaves room for the panel to open in (examples.css).
   */
  floating: boolean;
  /**
   * The component's required props, from its schema. An example that lost one of those — or its
   * `children` — to `{ $unsupported }` is shown as source rather than as a shell; see `contentGaps`.
   */
  required: string[];
  /**
   * Whether each example would put an `<h1>` on this page, in the same order — from
   * ../example-probe.ts, which answered it by rendering them at build time. Those are shown as
   * source: the page's own title is its one level-1 heading, and an embedded example must not be a
   * second one. It is a fact about this page, not about the component, so nothing is re-rendered at
   * a different level — see `pageHeadingExamples`.
   */
  pageHeading: boolean[];
  /**
   * The heading level each example renders, in the same order, or `null` for none — from
   * ../example-probe.ts, again by rendering. A grid shows every tile at once, so a tile whose
   * heading would skip a level after the tile before it is shown as source: the tabs layout never
   * had the problem, because one panel is on screen at a time.
   */
  headingLevel: (number | null)[];
  /** The hosted Storybook's project URL, or absent before job 510 publishes one. */
  storybookUrl?: string | undefined;
  /**
   * Whether each platform has source for this component at all — which decides whether an empty
   * platform panel says "no stories yet" (or, for Swift, "not generated for iOS yet") or "not for this
   * scenario".
   */
  platforms: Record<Platform, boolean>;
  /**
   * Each example's snippets, per platform, already highlighted by ../highlight.ts — same order as
   * `examples`. Tabs only; a grid shows one block per platform for the whole set (`sweepCode`).
   *
   * Finished HTML rather than strings the island renders: highlighting is a build-time transform of
   * strings the JSON already carries, so it costs the island no JavaScript and no Shiki reaches the
   * browser. ../highlight.ts explains why this spot calls Shiki directly instead of Astro's `<Code>`,
   * and where the colours come from.
   */
  code: PlatformCode[];
  /** Grid only: each example's token captions, same order — from ../example-sweep.ts. */
  captions: Caption[][];
  /** Grid only: every story's snippets, joined per platform and highlighted, for the block under the grid. */
  sweepCode?: PlatformCode | undefined;
  /** The Lit package's registering import, shown beside a Lit snippet that is plain HTML. */
  litRegister: string;
}

interface BoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

/**
 * The live example's guard *after* hydration.
 *
 * ../example-probe.ts already proved every example this island renders can be rendered on the
 * server. The browser is a second environment — an effect, a `ResizeObserver`, a measurement against
 * a layout that does not exist yet — and a throw there would blank the whole section rather than one
 * panel, because the tabs and the props they carry are one island. So each example gets a boundary
 * and the panel falls back to its source, which is what a non-renderable story shows anyway.
 */
class ExampleBoundary extends ReactComponent<BoundaryProps, { failed: boolean }> {
  override state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    // Not swallowed: a component that renders on the server and throws in the browser is a defect in
    // that component, and the console is where a reader who opens devtools would look for it.
    console.error('Design Schema: a live example failed to render in the browser.', error, info);
  }

  override render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** A tile's label: the prop as a reader would write it (`size="xl"`, `truncate`), or the story's title. */
function stepLabel(example: ExampleView): string {
  const { sweep } = example;
  if (sweep === null) return example.title;
  if (sweep.value === true) return sweep.prop;
  if (sweep.value === false) return `${sweep.prop}={false}`;
  return `${sweep.prop}="${sweep.value}"`;
}

/**
 * The examples section (website-plan.md, "Component page template" step 4).
 *
 * Two layouts, chosen by `tools/docs_examples.ts` and carried in the JSON:
 *
 * - **Tabs** (`scenarios`), one per story, each panel holding the story rendered live, its code, and
 *   — once job 510 has published a Storybook — a deep link to the same story there. A set longer
 *   than one strip keeps its `primary` stories in the strip and puts the rest in a second strip
 *   behind a "More examples" disclosure, so every story is still one click away.
 * - **A grid** (`sweep`), when most stories step one prop of a typography component: one tile per
 *   story, grouped by prop, each captioned with the token it reads and that token's built value.
 *
 * The code is per platform (job 532): within a scenario, a second, smaller strip picks React, React
 * Native, Lit or Swift, and shows what a developer writes on that platform — each snippet rendered
 * from that platform's own story. The live render stays React's either way; it is the one platform
 * this site can run. The platform choice is the island's state rather than each strip's, so it
 * follows the reader from scenario to scenario, and it is never the same state as the scenario
 * strip's, so picking a platform can never change which scenario is showing.
 *
 * The live render is built from `generated/examples/<Name>.json` alone: nothing here fetches
 * Storybook or Chromatic, so the examples work whether or not any Storybook instance is up.
 *
 * An island (`client:visible`), because a `Tabs` that cannot change tab is a list of dead buttons.
 * Astro still renders it at build time, so the first example, the primary tab labels, every grid tile
 * and every primary React snippet are in view-source.
 */
export function Examples({
  name,
  layout,
  examples,
  renderable,
  withoutOpen,
  harnessEvents,
  floating,
  required,
  pageHeading,
  headingLevel,
  storybookUrl,
  platforms,
  code,
  captions,
  sweepCode,
  litRegister,
}: ExamplesProps) {
  const [platform, setPlatform] = useState<Platform>('react');
  const Component = COMPONENTS[name];
  const exported = typeof Component === 'function';

  if (examples.length === 0) {
    return (
      <Stack direction="vertical" gap="normal">
        <Heading level={2}>{COPY.heading}</Heading>
        <Text tone="muted">{COPY.none}</Text>
      </Stack>
    );
  }

  const sourceOnly = (
    <Text size="sm" tone="muted">
      {COPY.sourceOnly}
    </Text>
  );

  /* An example whose render would be a second page title: the page says so where it would have been. */
  const outlineNote = (
    <Text size="sm" tone="muted">
      {COPY.pageHeading}
    </Text>
  );

  /* A tile whose heading would skip a level after the tile above it: the grid says so instead. */
  const headingSkipNote = (
    <Text size="sm" tone="muted">
      {COPY.headingSkip}
    </Text>
  );

  /* An example whose content, or a required prop, is what the extractor could not carry. */
  const contentNote = (props: string[]) => (
    <Text size="sm" tone="muted">
      {COPY.contentOnlyBefore}
      <Mono>{props.join(', ')}</Mono>
      {props.length === 1 ? COPY.contentOnlyOne : COPY.contentOnlyMany}
    </Text>
  );

  /**
   * The story rendered live, or the note that says why its source stands in. A `trigger` example is
   * the story behind a button that opens it (`TriggerHarness`) — decorated or not, since the harness
   * is the frame an overlay needs and a decorator's background or width means nothing to one. A
   * `state` example is the story with its `open` held by the page (`StateHarness`).
   */
  const live = (index: number, inset: 'md' | 'lg') => {
    const example = examples[index] as ExampleView;
    if (pageHeading[index] === true) return outlineNote;
    if (renderable[index] !== true) return sourceOnly;
    // Rendering would succeed and show nothing: the args carry `{ $unsupported }` where the
    // example's content is. A harness example is exempt — what it renders first is its button.
    const gaps = example.harness === 'trigger' ? [] : contentGaps(example.args, required);
    if (gaps.length > 0) return contentNote(gaps);
    const props = exampleProps(example, withoutOpen[index] === true, { floating, harnessEvents });
    const triggered = example.harness === 'trigger' && harnessEvents !== null;
    // Only a story that pins `open` needs its state held; the rest are uncontrolled already.
    const held = example.harness === 'state' && harnessEvents !== null && props['open'] !== undefined;
    const rendered = triggered ? (
      <TriggerHarness
        component={Component as ElementType}
        props={props}
        label={COPY.harnessLabels[name] ?? COPY.harnessLabel(name)}
        events={harnessEvents}
      />
    ) : held ? (
      <StateHarness component={Component as ElementType} props={props} events={harnessEvents} />
    ) : (
      (EXAMPLE_CONTEXT[name]?.(Component as ElementType, props) ?? createElement(Component as ElementType, props))
    );
    return (
      <ExampleBoundary fallback={sourceOnly}>
        <Card inset={inset} data-example={example.storyId} data-example-harness={triggered || held ? example.harness : undefined}>
          {floating && example.harness === 'state' ? (
            /* A panel anchored to its own trigger opens inside this card's room, not over the tab row
               above it or the code below — examples.css sizes it, more above for a `top` placement. */
            <div className="ds-example-stage" data-placement={typeof props['placement'] === 'string' ? props['placement'] : undefined}>
              {rendered}
            </div>
          ) : (
            rendered
          )}
        </Card>
      </ExampleBoundary>
    );
  };

  /** Why a platform panel has no code: nothing on that platform at all, or nothing for this scenario. */
  const missing = (target: Platform) => {
    const label = COPY.platforms[target];
    if (target === 'swift' && !platforms.swift) {
      return (
        <Text size="sm" tone="muted">
          {COPY.swiftPending}
          <Mono>{COPY.swiftPlan}</Mono>
          {COPY.swiftPendingEnd}
        </Text>
      );
    }
    const text = target === 'swift' ? COPY.swiftNoPreview : platforms[target] ? COPY.noStory(label) : COPY.noModule(label);
    return (
      <Text size="sm" tone="muted">
        {text}
      </Text>
    );
  };

  /**
   * One scenario's code, with the platform strip over it. `key` is the scenario's id — each panel id
   * has to be unique on the page, and the strip id is how the chosen platform is read back.
   */
  const platformCode = (key: string, scenario: string, blocks: PlatformCode | undefined) => (
    <Tabs
      label={COPY.platformStrip(scenario)}
      tabs={PLATFORM_ORDER.map((target) => ({ id: `${key}--${target}`, label: COPY.platforms[target] }))}
      value={`${key}--${platform}`}
      onChange={(id) => setPlatform(id.slice(key.length + 2) as Platform)}
    >
      {PLATFORM_ORDER.map((target) => {
        const block = blocks?.[target] ?? null;
        return (
          <TabPanel key={target} id={`${key}--${target}`}>
            <Stack direction="vertical" gap="tight" data-platform-panel={target}>
              {block === null ? (
                missing(target)
              ) : (
                <>
                  {target === 'lit' && block.lang === 'html' ? (
                    <Text size="sm" tone="muted">
                      {COPY.litRegister}
                      <Mono>{litRegister}</Mono>
                    </Text>
                  ) : null}
                  {/* No `tabIndex` here: Shiki puts one on the `<pre>` it emits, which is the element
                      that scrolls, so the snippet is already reachable by keyboard (axe's
                      `scrollable-region-focusable`). A second one on the wrapper would be a tab stop
                      that scrolls nothing. This element is the frame, and the element the theme's
                      colour tokens are bound on — see code.css. */}
                  <div className="ds-code" data-platform-code={target} dangerouslySetInnerHTML={{ __html: block.html }} />
                </>
              )}
            </Stack>
          </TabPanel>
        );
      })}
    </Tabs>
  );

  const storybook = (example: ExampleView) =>
    storybookUrl === undefined ? null : (
      /* `external` is what adds the ↗ and the "opens in a new tab" suffix to the accessible name —
         the arrow is the component's, not a character in the label. */
      <Link external href={storybookLink(storybookUrl, example.storyId)} label={COPY.openInStorybook} />
    );

  const tabs = (label: string, indexes: number[], orientation: 'horizontal' | 'vertical' = 'horizontal') => (
    <Tabs
      label={label}
      orientation={orientation}
      tabs={indexes.map((index) => ({ id: (examples[index] as ExampleView).storyId, label: (examples[index] as ExampleView).title }))}
      // The story id, not the tab index: it is stable across a story being added above this one,
      // and it is the same id the panel's deep link uses. Uncontrolled on purpose — the platform strip
      // inside each panel is the island's state, and this strip's selection is its own.
      defaultValue={examples[indexes[0] as number]?.storyId}
    >
      {indexes.map((index) => {
        const example = examples[index] as ExampleView;
        return (
          <TabPanel key={example.storyId} id={example.storyId}>
            <Stack direction="vertical" gap="normal">
              {live(index, 'lg')}
              {platformCode(example.storyId, example.title, code[index])}
              {storybook(example)}
            </Stack>
          </TabPanel>
        );
      })}
    </Tabs>
  );

  const indexes = examples.map((_, index) => index);

  let body: ReactNode;
  if (layout === 'sweep') {
    // Default first, then one group per swept prop, in the order the stories introduce them.
    const groups: { title: string; indexes: number[] }[] = [];
    for (const index of indexes) {
      const title = (examples[index] as ExampleView).sweep?.prop ?? COPY.defaultGroup;
      const group = groups.find((candidate) => candidate.title === title);
      if (group === undefined) groups.push({ title, indexes: [index] });
      else group.indexes.push(index);
    }
    body = (
      <>
        {groups.map((group) => {
          /*
           * Which tiles would skip a heading level, walked once per group before anything renders:
           * a tile follows the group's own label, then whatever the tile before it actually put in
           * the outline. A tile shown as source contributes nothing, so the next tile still follows
           * the last real heading. Going down a level never skips — h6 back to h1 is legal.
           */
          const skipped: boolean[] = [];
          let previous = GROUP_HEADING_LEVEL;
          for (const index of group.indexes) {
            const level = headingLevel[index] ?? null;
            const skips = level !== null && level > previous + 1;
            skipped.push(skips);
            if (level !== null && !skips) previous = level;
          }
          return (
          <Stack key={group.title} direction="vertical" gap="normal">
            <Heading level={GROUP_HEADING_LEVEL}>{group.title}</Heading>
            <ul className="ds-example-grid">
              {group.indexes.map((index, position) => {
                const example = examples[index] as ExampleView;
                const skips = skipped[position] === true;
                return (
                  <li key={example.storyId} className="ds-example-grid__tile" data-example-tile={example.storyId}>
                    <Stack direction="vertical" gap="tight">
                      {/* A decorator is only a reason for source when there is no harness to frame the example instead. */}
                      {example.decorated && example.harness !== 'trigger' ? (
                        <Text size="sm" tone="muted">
                          {COPY.decorated}
                        </Text>
                      ) : skips ? (
                        headingSkipNote
                      ) : (
                        live(index, 'md')
                      )}
                      <Mono>{stepLabel(example)}</Mono>
                      {(captions[index] ?? []).map((line) => (
                        <Text key={line.token} size="sm" tone="muted" data-caption={line.token}>
                          {/* One reading per theme and mode where they differ; the page's CSS (from
                              ../example-sweep.ts) shows the one the root is in. */}
                          {line.values.map((value) => (
                            <span
                              key={value.text}
                              data-sweep-variants={value.variants.length === 0 ? undefined : value.variants.join(' ')}
                            >
                              {value.text}
                              {COPY.separator}
                            </span>
                          ))}
                          <Mono>{line.token}</Mono>
                        </Text>
                      ))}
                      {storybook(example)}
                    </Stack>
                  </li>
                );
              })}
            </ul>
          </Stack>
          );
        })}
        {sweepCode === undefined ? null : (
          /* Not `keepMounted`, now that the block has a platform strip: Tabs measures its selected tab
             to place the indicator, and a strip laid out inside a closed disclosure measures zero —
             the same reason "More examples" mounts on open. */
          <Disclosure summary={COPY.sweepSource}>{platformCode(`${name}-sweep`, COPY.sweepSource, sweepCode)}</Disclosure>
        )}
      </>
    );
  } else {
    const primary = indexes.filter((index) => examples[index]?.primary === true);
    const rest = indexes.filter((index) => examples[index]?.primary !== true);
    body = (
      <>
        {tabs(`${name} examples`, primary)}
        {rest.length === 0 ? null : (
          /* Not `keepMounted`: Tabs measures its selected tab to place the indicator, and a strip
             laid out inside a hidden panel measures zero. Mounting on open gets it right.
             Vertical: the rest can be thirty stories (Box), and a horizontal strip scrolls with its
             scrollbar hidden — the very overflow the split exists to avoid. A column shows them all. */
          <Disclosure summary={COPY.more(rest.length)}>{tabs(COPY.moreLabel(name), rest, 'vertical')}</Disclosure>
        )}
      </>
    );
  }

  // The plain wrapper is the hook examples.css scopes the tab rows' scrollbar to: generated
  // components take no `className`.
  return (
    <div className="ds-examples">
      <Stack direction="vertical" gap="normal">
        <Heading level={2}>{COPY.heading}</Heading>
        {exported ? null : (
          /* `tone="info"`: a statement of fact, not urgency — the same gap Alert's own tone list has
             on this page's "not yet generated" notice (generated/gaps/Alert.web.md). */
          <Alert tone="info" live="off" heading={COPY.notExported}>
            <Text>{COPY.notExportedBody}</Text>
          </Alert>
        )}
        {body}
      </Stack>
    </div>
  );
}
