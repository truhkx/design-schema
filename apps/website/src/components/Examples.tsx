import { Component as ReactComponent, createElement, type ElementType, type ErrorInfo, type ReactNode } from 'react';
import { Alert, Card, Heading, Link, Stack, TabPanel, Tabs, Text } from '@design-schema/react';

import { COMPONENTS, decodeArgs } from '../example-args';
import { storybookLink, type Example } from '../examples';

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
};

export interface ExamplesProps {
  /** The component the examples render — a `@design-schema/react` export name. */
  name: string;
  /** `generated/examples/<Name>.json`, in story order. One tab each. */
  examples: Example[];
  /**
   * Whether each example renders live, in the same order — from ../example-probe.ts, which answered
   * it by rendering them at build time rather than by inspecting them.
   */
  renderable: boolean[];
  /** The hosted Storybook's project URL, or absent before job 510 publishes one. */
  storybookUrl?: string | undefined;
  /**
   * Each example's `sourceText`, already highlighted by ../highlight.ts — same order as `examples`.
   *
   * Finished HTML rather than a string the island renders: highlighting is a build-time transform of
   * a string the JSON already carries, so it costs the island no JavaScript and no Shiki reaches the
   * browser. ../highlight.ts explains why this spot calls Shiki directly instead of Astro's `<Code>`,
   * and where the colours come from.
   */
  code: string[];
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

/**
 * The examples section (website-plan.md, "Component page template" step 4).
 *
 * One tab per story, each panel holding the story rendered live, its source, and — once job 510 has
 * published a Storybook — a deep link to the same story there. The live render is built from
 * `generated/examples/<Name>.json` alone: nothing here fetches Storybook or Chromatic, so the
 * examples work whether or not any Storybook instance is up, and a "Storybook is down" incident
 * costs the page one link rather than its content.
 *
 * An island (`client:visible`), because a `Tabs` that cannot change tab is a list of dead buttons.
 * Astro still renders it at build time, so the first example, every tab label and every snippet are
 * in view-source.
 */
export function Examples({ name, examples, renderable, storybookUrl, code }: ExamplesProps) {
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
      <Tabs
        label={`${name} examples`}
        tabs={examples.map((example) => ({ id: example.storyId, label: example.title }))}
        // The story id, not the tab index: it is stable across a story being added above this one,
        // and it is the same id the panel's deep link uses.
        defaultValue={examples[0]?.storyId}
      >
        {examples.map((example, index) => (
          <TabPanel key={example.storyId} id={example.storyId}>
            <Stack direction="vertical" gap="normal">
              {renderable[index] === true ? (
                <ExampleBoundary fallback={sourceOnly}>
                  <Card inset="lg" data-example={example.storyId}>
                    {createElement(Component as ElementType, decodeArgs(example.args))}
                  </Card>
                </ExampleBoundary>
              ) : (
                sourceOnly
              )}
              {/* No `tabIndex` here: Shiki puts one on the `<pre>` it emits, which is the element
                  that scrolls, so the snippet is already reachable by keyboard (axe's
                  `scrollable-region-focusable`). A second one on the wrapper would be a tab stop
                  that scrolls nothing. This element is the frame, and the element the theme's colour
                  tokens are bound on — see code.css. */}
              <div className="ds-code" dangerouslySetInnerHTML={{ __html: code[index] ?? '' }} />
              {storybookUrl === undefined ? null : (
                /* `external` is what adds the ↗ and the "opens in a new tab" suffix to the
                   accessible name — the arrow is the component's, not a character in the label. */
                <Link external href={storybookLink(storybookUrl, example.storyId)} label={COPY.openInStorybook} />
              )}
            </Stack>
          </TabPanel>
        ))}
      </Tabs>
    </Stack>
  );
}
