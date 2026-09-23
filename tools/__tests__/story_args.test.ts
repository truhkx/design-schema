/** tools/story_args.ts — the story modules' `args`, evaluated rather than parsed (job 546). The
 *  serializer is what the JSON's shape depends on, so it is tested against the shapes a story
 *  actually holds: element trees from a helper call, nested data, and the functions that stay
 *  `{ $unsupported }`. The child process itself is covered by docs_examples.test.ts's `main`. */
import { fileURLToPath } from 'node:url';

import { describe, expect, test } from 'vitest';

import { canEvaluate, serialize } from '../story_args.ts';

/** A React element as React stamps one, without importing React into a tool's test. */
function element(type: unknown, props: Record<string, unknown> = {}, key: string | null = null) {
  return { $$typeof: Symbol.for('react.transitional.element'), type, key, props, ref: null };
}

function Card() {
  return null;
}

describe('serialize', () => {
  test('primitives are themselves, and `undefined` is a key that is not there', () => {
    expect(serialize('Save')).toBe('Save');
    expect(serialize(3)).toBe(3);
    expect(serialize(false)).toBe(false);
    expect(serialize(null)).toBeNull();
    expect(serialize(undefined)).toBeUndefined();
  });

  test('arrays and plain objects go through recursively, dropping undefined values', () => {
    expect(serialize([1, 'two', { three: true }])).toEqual([1, 'two', { three: true }]);
    expect(serialize({ label: 'Save', heading: undefined, items: [{ id: 'a' }] })).toEqual({ label: 'Save', items: [{ id: 'a' }] });
    // A hole has no JSON spelling; `null` is the nearest, and is what the parse wrote for one.
    expect(serialize([1, undefined, 2])).toEqual([1, null, 2]);
  });

  test('an element becomes the descriptor the website rebuilds with createElement', () => {
    const value = serialize(element(Card, { heading: 'Product 1', children: 'Product 1' }, 'Product 1'));
    expect(value).toEqual({
      $element: 'Card',
      // The key is React's, hoisted out of the props it was written in, and put back so a list of
      // elements still has one.
      props: { key: 'Product 1', heading: 'Product 1' },
      children: ['Product 1'],
    });
  });

  test('children are flattened, and the empties JSX ignores are dropped', () => {
    const value = serialize(element('div', { children: ['a', [element('span'), null], false, undefined] }));
    expect(value).toMatchObject({ $element: 'div', children: ['a', { $element: 'span', props: {}, children: [] }] });
  });

  test('a fragment is an element named Fragment', () => {
    expect(serialize(element(Symbol.for('react.fragment'), { children: 'x' }))).toMatchObject({ $element: 'Fragment' });
  });

  test('a function is its own name, not its source', () => {
    const validate = (value: number) => value >= 0;
    expect(serialize({ validate })).toEqual({ validate: { $unsupported: 'validate' } });
    expect(serialize([() => undefined])).toEqual([{ $unsupported: '(anonymous function)' }]);
  });

  test('what is not data is named rather than swallowed', () => {
    expect(serialize(new Date(0))).toEqual({ $unsupported: '(a Date)' });
    expect(serialize(Number.NaN)).toEqual({ $unsupported: 'NaN' });
    const cycle: Record<string, unknown> = {};
    cycle['self'] = cycle;
    expect(serialize(cycle)).toEqual({ self: { $unsupported: '(circular reference)' } });
  });

  test('the same value twice is not a cycle', () => {
    const shared = { id: 'a' };
    expect(serialize({ one: shared, two: shared })).toEqual({ one: { id: 'a' }, two: { id: 'a' } });
  });
});

describe('canEvaluate', () => {
  test('is false where the package’s dependencies are not installed beside the stories', () => {
    expect(canEvaluate(fileURLToPath(new URL('.', import.meta.url)))).toBe(false);
  });
});
