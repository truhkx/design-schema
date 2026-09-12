import { Accordion, Alert, Heading, Stack, Table, Text, type AccordionItem, type TableColumn, type TableRow } from '@design-schema/react';

import { Mono } from './Mono';
import type { ContrastRow, RequirementLine } from '../component-page';

/** User-facing strings, in one place, the way the generated components keep theirs. */
const COPY = {
  sectionHeading: 'Accessibility',
  choicesHeading: 'Decisions this component leaves to you',
  roleAndStructure: 'Role & structure',
  keyboardSupport: 'Keyboard support',
  contrastAndMotion: 'Contrast & motion',
  anatomy: 'Anatomy',
  requirements: 'What generation guarantees',
  contrastCaption: 'Contrast pairs',
  noMotion: 'This component does not animate, so it has no reduced-motion behaviour to describe.',
  noContrastOrMotion:
    'This component declares no contrast pair of its own — it inherits the colour of whatever it is ' +
    'placed in — and it does not animate.',
};

/** One row of the keyboard table: already reduced to the two columns website-plan.md names. */
export interface KeyboardLine {
  key: string;
  action: string;
}

export interface AccessibilityContractProps {
  /** The component name, for each table's accessible name. */
  name: string;
  /** The `a11y.role` sentence. */
  role: string;
  /** The anatomy parts, in schema order. */
  anatomy: string[];
  /** Every `a11y.requires` entry as a label and a sentence. */
  requirements: RequirementLine[];
  /** The consumer decisions the schema implies. Empty means no Alert. */
  choices: string[];
  /** `generated/keyboard/<Name>.json`, flattened. Absent for the components with no keyboard model. */
  keyboard?: KeyboardLine[] | undefined;
  /** The doc's contrast pairs. */
  contrast: ContrastRow[];
  /** The reduced-motion sentence, when `a11y.requires` asks for one. */
  reducedMotion?: string | undefined;
}

const KEYBOARD_COLUMNS: TableColumn[] = [
  { key: 'key', header: 'Key', isRowHeader: true, width: 'min', render: (row: TableRow) => <Mono>{row.id}</Mono> },
  { key: 'action', header: 'Action', width: 'fill' },
];

const CONTRAST_COLUMNS: TableColumn[] = [
  {
    key: 'foreground',
    header: 'Foreground',
    isRowHeader: true,
    render: (row: TableRow) => <Mono>{String(row.foreground)}</Mono>,
  },
  { key: 'background', header: 'Background', render: (row: TableRow) => <Mono>{String(row.background)}</Mono> },
  { key: 'level', header: 'Level', width: 'min' },
];

/**
 * The accessibility section (website-plan.md, "Component page template" #5).
 *
 * An `Accordion` of up to three sections — role and structure, keyboard support, contrast and
 * motion — with an `Alert(tone="info")` above it for the parts of the contract the component cannot
 * fulfil on its own. The keyboard section is omitted, not emptied, for the 22 components with no
 * `generated/keyboard/<Name>.json`.
 *
 * This is the page's one island: an `Accordion` whose triggers never collapse is three dead buttons.
 * Every section is open at build time and stays mounted (`keepMounted`), so the whole contract is in
 * view-source and readable with the island's JavaScript slow or blocked — the same bargain
 * `DocsNav` makes. Hydration only adds the ability to fold a section away.
 */
export function AccessibilityContract({
  name,
  role,
  anatomy,
  requirements,
  choices,
  keyboard,
  contrast,
  reducedMotion,
}: AccessibilityContractProps) {
  const items: AccordionItem[] = [
    {
      id: 'role',
      summary: COPY.roleAndStructure,
      content: (
        <Stack direction="vertical" gap="normal">
          <Text>{role}</Text>
          <Stack direction="vertical" gap="tight">
            <Text weight="medium">{COPY.anatomy}</Text>
            <Stack direction="horizontal" gap="tight" wrap>
              {anatomy.map((part) => (
                <Mono key={part}>{part}</Mono>
              ))}
            </Stack>
          </Stack>
          <Stack direction="vertical" gap="tight">
            <Text weight="medium">{COPY.requirements}</Text>
            {requirements.map((requirement) => (
              <Text key={requirement.id} size="sm">
                {`${requirement.label} — ${requirement.prose}`}
              </Text>
            ))}
          </Stack>
        </Stack>
      ),
    },
  ];

  if (keyboard !== undefined && keyboard.length > 0) {
    items.push({
      id: 'keyboard',
      summary: COPY.keyboardSupport,
      content: (
        <Table
          // The accordion trigger above already says "Keyboard support"; the caption stays as the
          // table's accessible name, which is what tells the two tables on this page apart.
          caption={`${name} keyboard support`}
          captionLevel={4}
          hideCaption
          columns={KEYBOARD_COLUMNS}
          data={keyboard.map((line) => ({ id: line.key, action: line.action }))}
          responsive="stack"
          stickyHeader={false}
          density="compact"
          data-table={`${name}-keyboard`}
        />
      ),
    });
  }

  items.push({
    id: 'contrast',
    summary: COPY.contrastAndMotion,
    content: (
      <Stack direction="vertical" gap="normal">
        {contrast.length === 0 ? null : (
          <Table
            caption={COPY.contrastCaption}
            captionLevel={4}
            hideCaption
            columns={CONTRAST_COLUMNS}
            data={contrast.map((pair) => ({
              id: `${pair.foreground} on ${pair.background}`,
              foreground: pair.foreground,
              background: pair.background,
              level: pair.level,
            }))}
            responsive="stack"
            stickyHeader={false}
            density="compact"
            data-table={`${name}-contrast`}
          />
        )}
        <Text>{reducedMotion ?? (contrast.length === 0 ? COPY.noContrastOrMotion : COPY.noMotion)}</Text>
      </Stack>
    ),
  });

  return (
    <Stack direction="vertical" gap="normal">
      <Heading level={2}>{COPY.sectionHeading}</Heading>
      {choices.length === 0 ? null : (
        // `live="off"`: the alert is present when the page loads, so announcing it would interrupt
        // the reader with something they are about to read anyway.
        <Alert tone="info" live="off" heading={COPY.choicesHeading}>
          <Stack direction="vertical" gap="tight">
            {choices.map((choice) => (
              <Text key={choice} size="sm">
                {choice}
              </Text>
            ))}
          </Stack>
        </Alert>
      )}
      <Accordion
        headingLevel={3}
        divided
        keepMounted
        defaultValue={items.map((item) => item.id)}
        items={items}
      />
    </Stack>
  );
}
