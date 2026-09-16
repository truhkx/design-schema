/** The form block's half in tools/parse.ts `validate` (job 615): a form container composing a field-shaped component
 *  with no form block is an error since the phase 3 migration gave every field its block, and one composing a
 *  declared field parses clean. */
import { join } from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';

import { readText } from '../lib/py.ts';
import { REPO_ROOT } from '../lib/root.ts';
import * as parse from '../parse.ts';
import type { Dict } from '../parse.ts';
import { component, expectDocError, fmText, usePaths, useTmp, write } from './fixtures.ts';

const tmp = useTmp();
usePaths();

afterEach(() => {
  parse.takeWarnings();
});

const FIELD_PROPS = {
  name: { type: 'string', description: 'Form key.' },
  error: { type: 'string', description: 'Validation message.' },
  value: { type: 'string', description: 'The text.' },
};

/** A temp docs folder with a field that declares its form block (Textfield) and one that does not (Legacyfield). */
function childDocs(): void {
  const d = join(tmp(), 'components');
  write(join(d, 'textfield.md'), '---\n' + fmText({ name: 'Textfield', props: FIELD_PROPS, form: { role: 'field', value: 'value', valueType: 'string' } }) + '---\n');
  write(join(d, 'legacyfield.md'), '---\n' + fmText({ name: 'Legacyfield', props: FIELD_PROPS }) + '---\n');
  parse.paths.DOCS = d;
}

/** The fixture as a form container composing `child` in a `field` part. */
function container(child: string, form: Dict | null = { role: 'container', discovery: 'attribute' }): Dict {
  const c = component();
  c.anatomy.push('field');
  c.composition = { field: child };
  if (form !== null) c.form = form;
  return c;
}

const check = (c: Dict): void => parse.validate({ component: c }, join(tmp(), 'widget.md'));

describe('a form container composing fields', () => {
  test('a child that declares form.role field is fine', () => {
    childDocs();
    check(container('Textfield'));
    expect(parse.takeWarnings()).toEqual([]);
  });

  test('a child with name and error props but no form block is an error', () => {
    childDocs();
    expectDocError(() => check(container('Legacyfield')), "composition.field: Legacyfield has 'name' and 'error' props but no form block, so Widget cannot tell how it joins as a field");
    expect(parse.takeWarnings()).toEqual([]);
  });

  test('a component that is not a form container is fine', () => {
    childDocs();
    check(container('Legacyfield', null));
    check(container('Legacyfield', { role: 'field', value: 'label', valueType: 'string' }));
    expect(parse.takeWarnings()).toEqual([]);
  });

  test("today's Form doc validates and raises no field error", () => {
    const file = join(REPO_ROOT, 'site', 'src', 'content', 'docs', 'components', 'form.md');
    const [fm] = parse.splitFrontmatter(readText(file), file);
    parse.validate(fm, file);
    expect(parse.takeWarnings().filter((w) => w.message.includes('no form block'))).toEqual([]);
  });
});
