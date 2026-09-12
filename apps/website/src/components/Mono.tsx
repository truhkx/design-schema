import type { ReactNode } from 'react';
import { Text } from '@design-schema/react';

/**
 * A prop name, a type, a token path — the fragments of code a schema page is mostly made of.
 *
 * `Text` with the mono family rather than a bare `<code>`, so the docs site keeps its own rule that
 * every pixel of UI is one of the system's own components (website-plan.md, "Why a new app instead
 * of reskinning Starlight"). Nothing is lost by not using `<code>`: it carries no ARIA role and is
 * announced no differently, so the difference here is the typeface, which is what `font.family.mono`
 * is for. Syntax-highlighted *source* is the separate, deliberate exception — Astro's `<Code>`,
 * job 508.
 *
 * `size="sm"` because a mono face at the body size reads a step larger than the prose around it.
 */
export function Mono({ children }: { children: ReactNode }) {
  return (
    <Text element="span" size="sm" overrides={{ fontFamily: 'font.family.mono' }}>
      {children}
    </Text>
  );
}
