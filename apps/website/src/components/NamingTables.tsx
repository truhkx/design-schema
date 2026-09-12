import { Stack, Table, Text } from '@design-schema/react';
import type { TableColumn, TableRow } from '@design-schema/react';

import { Mono } from './Mono';
// `pnpm demo:naming` writes this beside the tree it generated, from the diff it actually computed —
// so a row here cannot claim a rename the demo tree does not have. See tools/naming_demo.ts.
import renames from '../../../../packages/react/demo-brand/renames.json';

/** User-facing strings, in one place, the way the generated components keep theirs. */
const COPY = {
  mapCaption: 'themes/demo-brand/naming.md, in full',
  identifiersCaption: 'Identifiers renamed across the demo tree',
  canonical: 'Design Schema',
  brand: 'Demo Brand',
  names: 'What it names',
  kind: 'Kind of identifier',
  occurrences: 'Occurrences',
  more: (n: number) => `${n} more, all of the same kinds — packages/react/demo-brand/DIFF.md lists every one.`,
  package: 'Package scope',
  cssPrefix: 'CSS custom-property prefix',
  component: 'Component',
  prop: 'Prop',
};

/** The identifier table is evidence, not decoration, but it is also 100-odd rows; the most frequent
 *  dozen make the point and DIFF.md carries the rest. */
const SHOWN = 12;

type Row = { id: string; canonical: string; brand: string; kind: string };

const mapRows: Row[] = [
  { id: 'package', canonical: '@design-schema', brand: renames.namespace.package, kind: COPY.package },
  { id: 'cssPrefix', canonical: '--ds-', brand: `--${renames.namespace.cssPrefix}-`, kind: COPY.cssPrefix },
  ...Object.entries(renames.components).map(([canonical, brand]) => ({ id: canonical, canonical, brand, kind: COPY.component })),
  ...Object.entries(renames.props).map(([canonical, brand]) => ({ id: canonical, canonical, brand, kind: COPY.prop })),
];

/**
 * The naming doc itself, as a table: the namespace, the three components, the one prop.
 *
 * Server-rendered like the props tables on a component page — nothing here is interactive, so it
 * ships no JavaScript and the whole table is in view-source.
 */
export function NamingMapTable() {
  const byRow = new Map(mapRows.map((row) => [row.id, row]));
  const columns: TableColumn[] = [
    { key: 'canonical', header: COPY.canonical, isRowHeader: true, render: (row: TableRow) => <Mono>{byRow.get(row.id)?.canonical ?? row.id}</Mono> },
    { key: 'brand', header: COPY.brand, render: (row: TableRow) => <Mono>{byRow.get(row.id)?.brand ?? ''}</Mono> },
    { key: 'kind', header: COPY.names, render: (row: TableRow) => <Text size="sm">{byRow.get(row.id)?.kind ?? ''}</Text> },
  ];
  return (
    <Table
      caption={COPY.mapCaption}
      captionLevel={3}
      columns={columns}
      data={mapRows.map((row) => ({ id: row.id }))}
      responsive="stack"
      stickyHeader={false}
      density="compact"
      data-table="naming-demo-map"
    />
  );
}

/** What the doc above turned into: the identifiers that actually differ between the two builds. */
export function NamingIdentifiersTable() {
  const shown = [...renames.identifiers].sort((a, b) => b.count - a.count || (a.from < b.from ? -1 : 1)).slice(0, SHOWN);
  const hidden = renames.identifiers.length - shown.length;
  const byRow = new Map(shown.map((row) => [`${row.from} ${row.to}`, row]));
  const columns: TableColumn[] = [
    { key: 'from', header: COPY.canonical, isRowHeader: true, render: (row: TableRow) => <Mono>{byRow.get(row.id)?.from ?? row.id}</Mono> },
    { key: 'to', header: COPY.brand, render: (row: TableRow) => <Mono>{byRow.get(row.id)?.to ?? ''}</Mono> },
    { key: 'category', header: COPY.kind, render: (row: TableRow) => <Text size="sm">{byRow.get(row.id)?.category ?? ''}</Text> },
    { key: 'count', header: COPY.occurrences, width: 'min', render: (row: TableRow) => <Text size="sm">{String(byRow.get(row.id)?.count ?? '')}</Text> },
  ];
  return (
    <Stack direction="vertical" gap="normal">
      <Table
        caption={COPY.identifiersCaption}
        captionLevel={3}
        columns={columns}
        data={shown.map((row) => ({ id: `${row.from} ${row.to}` }))}
        responsive="stack"
        stickyHeader={false}
        density="compact"
        data-table="naming-demo-identifiers"
      />
      {hidden > 0 ? <Text tone="muted">{COPY.more(hidden)}</Text> : null}
    </Stack>
  );
}
