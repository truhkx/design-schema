import { Component as ReactComponent, createElement, useState, type ElementType, type ErrorInfo, type ReactNode } from 'react';
import { Alert, Card, Disclosure, Heading, Link, Stack, TabPanel, Tabs, Text } from '@design-schema/react';

import { COMPONENTS, decodeArgs } from '../example-args';
import type { Caption } from '../example-sweep';
import { PLATFORM_ORDER, storybookLink, type ExampleView, type Layout, type Platform } from '../examples';
import type { PlatformCode } from '../highlight';
import { Mono } from './Mono';

/** User-facing strings, in one place, the way the generated components keep theirs. */
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
};

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
 * - **A grid** (`sweep`), when every story steps one prop of a typography component: one tile per
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

  /** The story rendered live, or the note that says why its source stands in. */
  const live = (index: number, inset: 'md' | 'lg') => {
    const example = examples[index] as ExampleView;
    return renderable[index] === true ? (
      <ExampleBoundary fallback={sourceOnly}>
        <Card inset={inset} data-example={example.storyId}>
          {createElement(Component as ElementType, decodeArgs(example.args))}
        </Card>
      </ExampleBoundary>
    ) : (
      sourceOnly
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
        {groups.map((group) => (
          <Stack key={group.title} direction="vertical" gap="normal">
            <Heading level={3}>{group.title}</Heading>
            <ul className="ds-example-grid">
              {group.indexes.map((index) => {
                const example = examples[index] as ExampleView;
                return (
                  <li key={example.storyId} className="ds-example-grid__tile" data-example-tile={example.storyId}>
                    <Stack direction="vertical" gap="tight">
                      {example.decorated ? (
                        <Text size="sm" tone="muted">
                          {COPY.decorated}
                        </Text>
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
        ))}
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

  return (
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
  );
}
