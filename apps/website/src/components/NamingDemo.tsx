import { useState, type ReactNode } from 'react';
import { Alert, Box, Button, Card, Disclosure, Heading, Icon, Stack, Text } from '@design-schema/react';

// The renamed tree, imported by relative path rather than by package name: it is generator output
// living beside packages/react/src (packages/react/demo-brand/README.md), not a fourth workspace
// package. Its own imports of `@demo/tokens` are aliased in astro.config.mjs — the one thing in this
// worked example a real fork, which publishes that package for real, would not need.
import { Callout } from '../../../../packages/react/demo-brand/src/Callout';
import { CtaButton } from '../../../../packages/react/demo-brand/src/CtaButton';
import { Expander } from '../../../../packages/react/demo-brand/src/Expander';
import { Icon as DemoIcon } from '../../../../packages/react/demo-brand/src/Icon';
import { Text as DemoText } from '../../../../packages/react/demo-brand/src/Text';

import { Mono } from './Mono';

/** User-facing strings, in one place, the way the generated components keep theirs. */
const COPY = {
  canonical: 'Design Schema',
  brand: 'Demo Brand',
  buttonHeading: 'Button → CtaButton',
  disclosureHeading: 'Disclosure → Expander',
  alertHeading: 'Alert → Callout',
  buttonLabel: 'Save changes',
  presses: (n: number) => (n === 1 ? '1 press' : `${n} presses`),
  summary: 'Delivery options',
  panel:
    'Standard delivery arrives in three to five working days. Express delivery arrives the next ' +
    'working day when ordered before 3pm.',
  alertTitle: 'Your session is about to expire',
  alertBody: 'You will be signed out in five minutes unless you carry on working.',
  dismissed: 'Dismissed.',
  restore: 'Show it again',
  restoreLabel: 'Restore both notices',
};

/** What each column of a pair is labelled with: the package it imports from, and the export name. */
const SIDES = {
  canonical: { title: COPY.canonical, pkg: '@design-schema/react' },
  brand: { title: COPY.brand, pkg: '@demo/react' },
} as const;

type Side = keyof typeof SIDES;

/**
 * One column of a comparison: which build it is, the import line a reader would write, then the live
 * component.
 *
 * The `data-demo` hook `tests/website/naming-demo.spec.ts` compares the two renders through is on a
 * `Box` around the component rather than on the component itself — a `Box` from the *canonical*
 * package on both sides, so it normalises to the same markup and adds nothing to the diff. On the
 * component it would land wherever that component happens to spread its rest props, which for
 * `Disclosure` is the trigger button, and the panel would go uncompared.
 */
function Column({ side, exportName, demo, children }: { side: Side; exportName: string; demo: string; children: ReactNode }) {
  return (
    <Card inset="lg">
      <Stack direction="vertical" gap="normal">
        <Stack direction="vertical" gap="tight">
          <Text size="sm" weight="medium">
            {SIDES[side].title}
          </Text>
          <Text size="sm" tone="muted">
            <Mono>{`import { ${exportName} } from '${SIDES[side].pkg}'`}</Mono>
          </Text>
        </Stack>
        <Box inset="none" data-demo={demo}>
          {children}
        </Box>
      </Stack>
    </Card>
  );
}

function Pair({ heading, canonical, brand }: { heading: string; canonical: ReactNode; brand: ReactNode }) {
  return (
    <Stack element="section" direction="vertical" gap="normal">
      <Heading level={3}>{heading}</Heading>
      {/* The two columns share a width rule in ../styles/naming-demo.css, for the reason the home
          page's card row does: a flex row sizes its items by their content, and two components of
          different widths would not read as a comparison. */}
      <Stack direction="horizontal" gap="normal" wrap align="stretch" className="ds-naming-demo__pair">
        {canonical}
        {brand}
      </Stack>
    </Stack>
  );
}

/**
 * The side-by-side proof that a naming doc moves names and nothing else (job 523).
 *
 * Every pair is the same component generated twice: once with Design Schema's vocabulary, once with
 * Demo Brand's. The props passed to the two are the same values under whatever name each build calls
 * them — `variant="primary"` on the left is `emphasis="primary"` on the right, because
 * `themes/demo-brand/naming.md` renames that one prop — and everything else is identical by
 * construction, since the right-hand components *are* the left-hand ones with their identifiers
 * rewritten (packages/react/demo-brand/DIFF.md).
 *
 * An island (`client:load`): all three pairs are interactive, and half of what this page claims is
 * that the renamed components behave the same, which a static render cannot show. It is below the
 * fold but not by much, and a page whose whole subject is a comparison should not have half of it
 * arrive late.
 */
export function NamingDemo() {
  const [presses, setPresses] = useState({ canonical: 0, brand: 0 });
  const [dismissed, setDismissed] = useState({ canonical: false, brand: false });
  const press = (side: Side) => () => setPresses((n) => ({ ...n, [side]: n[side] + 1 }));
  const dismiss = (side: Side) => () => setDismissed((d) => ({ ...d, [side]: true }));

  return (
    <Stack direction="vertical" gap="section">
      <Pair
        heading={COPY.buttonHeading}
        canonical={
          <Column side="canonical" exportName="Button" demo="canonical:Button">
            <Stack direction="vertical" gap="tight" align="start">
              <Button label={COPY.buttonLabel} variant="primary" leadingIcon={<Icon name="check" />} onClick={press('canonical')} />
              <Text size="sm" tone="muted">{COPY.presses(presses.canonical)}</Text>
            </Stack>
          </Column>
        }
        brand={
          <Column side="brand" exportName="CtaButton" demo="brand:Button">
            <Stack direction="vertical" gap="tight" align="start">
              <CtaButton label={COPY.buttonLabel} emphasis="primary" leadingIcon={<DemoIcon name="check" />} onClick={press('brand')} />
              <DemoText size="sm" tone="muted">{COPY.presses(presses.brand)}</DemoText>
            </Stack>
          </Column>
        }
      />

      <Pair
        heading={COPY.disclosureHeading}
        canonical={
          <Column side="canonical" exportName="Disclosure" demo="canonical:Disclosure">
            <Disclosure summary={COPY.summary}>
              <Text>{COPY.panel}</Text>
            </Disclosure>
          </Column>
        }
        brand={
          <Column side="brand" exportName="Expander" demo="brand:Disclosure">
            <Expander summary={COPY.summary}>
              <DemoText>{COPY.panel}</DemoText>
            </Expander>
          </Column>
        }
      />

      <Pair
        heading={COPY.alertHeading}
        canonical={
          <Column side="canonical" exportName="Alert" demo="canonical:Alert">
            {dismissed.canonical ? (
              <Text size="sm" tone="muted">{COPY.dismissed}</Text>
            ) : (
              <Alert tone="warning" heading={COPY.alertTitle} dismissible onDismiss={dismiss('canonical')}>
                <Text>{COPY.alertBody}</Text>
              </Alert>
            )}
          </Column>
        }
        brand={
          <Column side="brand" exportName="Callout" demo="brand:Alert">
            {dismissed.brand ? (
              <DemoText size="sm" tone="muted">{COPY.dismissed}</DemoText>
            ) : (
              <Callout tone="warning" heading={COPY.alertTitle} dismissible onDismiss={dismiss('brand')}>
                <DemoText>{COPY.alertBody}</DemoText>
              </Callout>
            )}
          </Column>
        }
      />

      {dismissed.canonical || dismissed.brand ? (
        <Stack direction="horizontal" gap="normal" align="center">
          <Button
            label={COPY.restore}
            accessibleName={COPY.restoreLabel}
            variant="secondary"
            onClick={() => setDismissed({ canonical: false, brand: false })}
          />
        </Stack>
      ) : null}
    </Stack>
  );
}
