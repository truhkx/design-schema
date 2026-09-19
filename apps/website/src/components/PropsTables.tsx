import { Stack, Table, Text, type TableColumn, type TableRow } from '@design-schema/react';

import { Mono } from './Mono';
import type { EventRow, PropRow } from '../component-page';

/** User-facing strings, in one place, the way the generated components keep theirs. */
const COPY = {
  propsCaption: 'Props',
  eventsCaption: 'Events',
  required: 'required',
  gesture: 'Gesture event — the schema requires a pointer and keyboard alternative.',
  empty: 'This component takes no props.',
};

/**
 * The length past which a type is a signature rather than a word, and needs a column of its own
 * width — see ./props-table.css, which is where the width is.
 *
 * The number is the measure the Type column can hold on one line at the narrowest it is ever asked
 * to: everything shorter wraps once at most and is left exactly as it renders today, which is the
 * point. It sits above every enum the schema declares that reads as a list of words — Button's
 * `primary | secondary | ghost | danger` is 36 characters, the longest of them 44 — and below every
 * object, array and function shape, the ones whose min-content width is a token rather than a line.
 */
const SHAPE_TYPE_LENGTH = 48;

/**
 * A Type cell. The wrapper is added only for a shape, so a table of short types emits none and is
 * laid out by exactly the rules it is laid out by today.
 */
function typeCell(type: string | undefined) {
  const mono = <Mono>{type}</Mono>;
  if (type === undefined || type.length < SHAPE_TYPE_LENGTH) return mono;
  return <span className="ds-prop-type">{mono}</span>;
}

export interface PropsTablesProps {
  /** The component name, so each table's accessible name says which component it belongs to. */
  name: string;
  /** One row per prop, in the doc's order. The count here is the doc's prop count — the job's gate. */
  props: PropRow[];
  /** One row per event. Empty for the components that fire none, in which case no table is rendered. */
  events: EventRow[];
}

/**
 * The props section (website-plan.md, "Component page template" #3).
 *
 * A `Table`, not a `DataGrid`: this is static reference data, nothing here is edited, and the plan
 * names the distinction explicitly. The columns are the ones site/src/components/SchemaTables.astro
 * already renders for the contributor docs — Prop, Type, Default, Description, Platforms — rendered
 * through our own component instead of a raw `<table>`.
 *
 * Events get a second table rather than extra rows in the first: an event has no type and no
 * default of its own, so folding the two together would mean a column that is a dash for half the
 * page, and it would make "the props table" no longer the doc's prop count.
 *
 * Rendered without a `client:*` directive on purpose. `Table`'s interactive parts — sorting,
 * selection — are not used here, so its output is static HTML and the page ships no JavaScript for
 * the props table at all.
 */
export function PropsTables({ name, props, events }: PropsTablesProps) {
  // Table cells are rendered from the row `id`, so each column looks its own row up rather than
  // casting `unknown` cell values back into shape.
  const byProp = new Map(props.map((row) => [row.name, row]));
  const byEvent = new Map(events.map((row) => [row.name, row]));

  const propColumns: TableColumn[] = [
    {
      key: 'name',
      header: 'Prop',
      isRowHeader: true,
      width: 'min',
      render: (row: TableRow) => {
        const prop = byProp.get(row.id);
        return (
          <>
            <Mono>{row.id}</Mono>
            {prop?.required === true ? (
              <>
                {' '}
                <Text element="span" size="xs" tone="muted">
                  {COPY.required}
                </Text>
              </>
            ) : null}
          </>
        );
      },
    },
    { key: 'type', header: 'Type', render: (row: TableRow) => typeCell(byProp.get(row.id)?.type) },
    {
      key: 'default',
      header: 'Default',
      width: 'min',
      render: (row: TableRow) => <Mono>{byProp.get(row.id)?.default}</Mono>,
    },
    {
      key: 'description',
      header: 'Description',
      width: 'fill',
      render: (row: TableRow) => {
        const prop = byProp.get(row.id);
        return (
          <Stack direction="vertical" gap="tight">
            <Text size="sm">{prop?.description}</Text>
            {prop?.a11y === undefined ? null : (
              <Text size="xs" tone="muted">
                {`Accessibility: ${prop.a11y}`}
              </Text>
            )}
          </Stack>
        );
      },
    },
    {
      key: 'platforms',
      header: 'Platforms',
      // The narrowest column and the least load-bearing: on a prose-width container it is the one
      // the table can afford to drop rather than scroll for.
      hideBelow: 'prose',
      render: (row: TableRow) => <Mono>{byProp.get(row.id)?.platforms.join(', ')}</Mono>,
    },
  ];

  const eventColumns: TableColumn[] = [
    {
      key: 'name',
      header: 'Event',
      isRowHeader: true,
      width: 'min',
      render: (row: TableRow) => <Mono>{row.id}</Mono>,
    },
    { key: 'type', header: 'Type', render: (row: TableRow) => typeCell(byEvent.get(row.id)?.type) },
    {
      key: 'description',
      header: 'Description',
      width: 'fill',
      render: (row: TableRow) => {
        const event = byEvent.get(row.id);
        return (
          <Stack direction="vertical" gap="tight">
            <Text size="sm">{event?.description}</Text>
            {event?.gesture === true ? (
              <Text size="xs" tone="muted">
                {COPY.gesture}
              </Text>
            ) : null}
          </Stack>
        );
      },
    },
    {
      key: 'platforms',
      header: 'Platforms',
      hideBelow: 'prose',
      render: (row: TableRow) => <Mono>{byEvent.get(row.id)?.platforms.join(', ')}</Mono>,
    },
  ];

  return (
    <Stack direction="vertical" gap="loose">
      <Table
        caption={COPY.propsCaption}
        captionLevel={2}
        columns={propColumns}
        data={props.map((row) => ({ id: row.name }))}
        responsive="stack"
        stickyHeader={false}
        density="compact"
        emptyMessage={COPY.empty}
        data-table={`${name}-props`}
      />
      {events.length === 0 ? null : (
        <Table
          caption={COPY.eventsCaption}
          captionLevel={2}
          columns={eventColumns}
          data={events.map((row) => ({ id: row.name }))}
          responsive="stack"
          stickyHeader={false}
          density="compact"
          data-table={`${name}-events`}
        />
      )}
    </Stack>
  );
}
