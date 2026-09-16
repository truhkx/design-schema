/** Style binding fields (job 613): `part`, `state`, `platforms`, `by`/`values` and `computed` on `styleBinding`, their
 *  checks in componentDef, locking over every token a binding can resolve to (`bindingTokens`), and `computeBinding`. */
import { join } from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';

import { BEHAVIOR_STATES, bindingTokens, componentDef, computeBinding, lockRule, STYLE_STATES } from '../../schema/component.ts';
import * as parse from '../parse.ts';
import type { Dict } from '../parse.ts';
import { component, expectDocError, usePaths, useTmp } from './fixtures.ts';

const tmp = useTmp();
usePaths();

afterEach(() => {
  parse.takeWarnings();
});

type Issue = { path: PropertyKey[]; message: string };

function issues(c: Dict): Issue[] {
  const r = componentDef.safeParse(c);
  return r.success ? [] : r.error.issues.map((i) => ({ path: i.path, message: i.message }));
}

const accepts = (c: Dict): void => {
  expect(issues(c)).toEqual([]);
};
const rejects = (c: Dict, path: PropertyKey[], message: string): void => {
  expect(issues(c)).toContainEqual({ path, message });
};

/** The fixture component (Widget: anatomy container and label, enum props variant and size, platforms web and rn)
 *  with a boolean `disabled` prop and `styles` merged in. */
function styled(styles: Dict): Dict {
  const c = component();
  c.props.disabled = { type: 'boolean', default: false, description: 'Disabled.' };
  Object.assign(c.styles, styles);
  return c;
}

const check = (c: Dict): void => parse.validate({ component: c }, join(tmp(), 'widget.md'));

describe('the fields parse', () => {
  test("STYLE_STATES is BEHAVIOR_STATES plus hover, focus-visible, active and dragging", () => {
    expect(STYLE_STATES).toEqual([...BEHAVIOR_STATES, 'hover', 'focus-visible', 'active', 'dragging']);
  });

  test("Input's paddingBlock and paddingBlockSm as one binding by size", () => {
    accepts(styled({ paddingBlock: { token: 'space.sm', by: 'size', values: { sm: 'space.1' } } }));
  });

  test('Button.backgroundHover as a token on a part in the hover state', () => {
    accepts(styled({ backgroundHover: { token: 'color.action.primary.backgroundHover', part: 'container', state: 'hover' } }));
  });

  test('Card.transition narrowed to the platforms where it does something', () => {
    accepts(styled({ transition: { token: 'motion.duration.fast', platforms: ['web'] } }));
  });

  test('a state outside STYLE_STATES is rejected', () => {
    expect(issues(styled({ pressedOverlay: { token: 'color.overlay.pressed', state: 'pushed' } })).map((i) => i.path)).toContainEqual(['styles', 'pressedOverlay', 'state']);
  });

  test('computed needs at least one of times, plus or minus, and every times is positive', () => {
    rejects(styled({ minWidth: { token: 'space.20', computed: {} } }), ['styles', 'minWidth', 'computed'], "computed needs at least one of 'times', 'plus' or 'minus'");
    const paths = (b: Dict): PropertyKey[][] => issues(styled({ minWidth: b })).map((i) => i.path);
    expect(paths({ token: 'space.20', computed: { times: 0 } })).toContainEqual(['styles', 'minWidth', 'computed', 'times']);
    expect(paths({ token: 'space.20', computed: { plus: [{ token: 'space.1', times: -2 }] } })).toContainEqual(['styles', 'minWidth', 'computed', 'plus', 0, 'times']);
    expect(paths({ token: 'space.20', computed: { plus: [{ token: 'space.1', binding: 'radius' }] } })).toContainEqual(['styles', 'minWidth', 'computed', 'plus', 0]);
  });
});

describe('the checks', () => {
  test('part is an anatomy part', () => {
    accepts(styled({ labelColor: { token: 'color.foreground', part: 'label' } }));
    rejects(styled({ iconColor: { token: 'color.foreground', part: 'icon' } }), ['styles', 'iconColor', 'part'], "styles.iconColor.part 'icon' is not in anatomy ['container', 'label']");
  });

  test('every platforms entry is a platform the component declares', () => {
    accepts(styled({ transition: { token: 'motion.duration.fast', platforms: ['web', 'rn'] } }));
    rejects(styled({ transition: { token: 'motion.duration.fast', platforms: ['web', 'lit'] } }), ['styles', 'transition', 'platforms', 1], "styles.transition platforms includes 'lit', which the component does not declare");
  });

  test('by names an enum or boolean prop', () => {
    accepts(styled({ text: { token: 'color.foreground', by: 'disabled', values: { true: 'color.foreground.muted' } } }));
    rejects(styled({ opacity: { token: 'opacity.full', by: 'label', values: { x: 'opacity.disabled' } } }), ['styles', 'opacity', 'by'], "styles.opacity.by 'label' is not an enum or boolean prop");
    rejects(styled({ opacity: { token: 'opacity.full', by: 'nope', values: { x: 'opacity.disabled' } } }), ['styles', 'opacity', 'by'], "styles.opacity.by 'nope' is not an enum or boolean prop");
  });

  test('every values key is a value of the by prop', () => {
    accepts(styled({ paddingBlock: { token: 'space.sm', by: 'size', values: { sm: 'space.1', md: 'space.sm' } } }));
    rejects(styled({ paddingBlock: { token: 'space.sm', by: 'size', values: { lg: 'space.md' } } }), ['styles', 'paddingBlock', 'values', 'lg'], "styles.paddingBlock.values has 'lg', which is not a value of 'size' ['sm', 'md']");
    rejects(styled({ opacity: { token: 'opacity.full', by: 'disabled', values: { yes: 'opacity.disabled' } } }), ['styles', 'opacity', 'values', 'yes'], "styles.opacity.values has 'yes', which is not a value of 'disabled' ['true', 'false']");
  });

  test('by and values come together', () => {
    rejects(styled({ paddingBlock: { token: 'space.sm', by: 'size' } }), ['styles', 'paddingBlock', 'by'], "styles.paddingBlock.by needs 'values'");
    rejects(styled({ paddingBlock: { token: 'space.sm', values: { sm: 'space.xs' } } }), ['styles', 'paddingBlock', 'values'], "styles.paddingBlock.values needs 'by'");
  });

  test('a token that interpolates {<by>} does not also declare values', () => {
    accepts(styled({ fill: { token: 'color.action.{variant}.background', by: 'size', values: { sm: 'color.background.subtle' } } }));
    rejects(styled({ paddingBlock: { token: 'space.{size}', by: 'size', values: { sm: 'space.xs' } } }), ['styles', 'paddingBlock', 'token'], "styles.paddingBlock interpolates '{size}' and declares values by 'size'; a binding uses one or the other");
  });

  test('values tokens obey the {slot} rule, with its message', () => {
    accepts(styled({ fill: { token: 'color.background', by: 'size', values: { sm: 'color.action.{variant}.background' } } }));
    rejects(styled({ paddingBlock: { token: 'space.sm', by: 'size', values: { sm: 'space.{label}' } } }), ['styles', 'paddingBlock', 'values', 'sm'], "styles.paddingBlock interpolates '{label}' but 'label' is not an enum prop");
  });

  test('a computed binding operand names another existing binding', () => {
    accepts(styled({ inset: { token: 'space.1', computed: { plus: [{ binding: 'radius', times: 2 }] } } }));
    rejects(styled({ inset: { token: 'space.1', computed: { plus: [{ binding: 'nope' }] } } }), ['styles', 'inset', 'computed', 'plus', 0, 'binding'], "styles.inset.computed.plus.0.binding names 'nope', which is not a styles binding of this component");
    rejects(styled({ inset: { token: 'space.1', computed: { minus: [{ binding: 'inset' }] } } }), ['styles', 'inset', 'computed', 'minus', 0, 'binding'], 'styles.inset.computed.minus.0.binding names the binding itself');
  });

  test('no chain of computed bindings forms a cycle, and a cycle is reported once', () => {
    accepts(styled({ a: { token: 'space.1', computed: { plus: [{ binding: 'b' }] } }, b: { token: 'space.1', computed: { plus: [{ binding: 'radius' }] } } }));
    const c = styled({
      a: { token: 'space.1', computed: { plus: [{ binding: 'b' }] } },
      b: { token: 'space.1', computed: { minus: [{ binding: 'c' }] } },
      c: { token: 'space.1', computed: { plus: [{ binding: 'a' }] } },
    });
    rejects(c, ['styles', 'a', 'computed'], 'styles.a.computed forms a cycle: a → b → c → a');
    expect(issues(c)).toHaveLength(1);
  });

  test('a binding that must lock may not subtract or scale below 1', () => {
    accepts(styled({ targetSize: { token: 'size.target.min', computed: { times: 1.5, plus: [{ token: 'space.1' }] } } }));
    accepts(styled({ gap: { token: 'space.1', computed: { times: 0.5, minus: [{ token: 'space.0' }] } } }));
    rejects(
      styled({ targetSize: { token: 'size.target.min', computed: { minus: [{ token: 'space.1' }] } } }),
      ['styles', 'targetSize', 'computed', 'minus'],
      "styles.targetSize must be locked (LOCKED_TOKENS has 'size.target.*'), so computed may not subtract: a derived value could shrink the guarantee below its token",
    );
    rejects(
      styled({ ringWidth: { token: 'space.1', by: 'size', values: { sm: 'border.width.focus' }, computed: { times: 0.5 } } }),
      ['styles', 'ringWidth', 'computed', 'times'],
      "styles.ringWidth must be locked (LOCKED_TOKENS has 'border.width.focus'), so computed.times may not be below 1: a derived value could shrink the guarantee below its token",
    );
  });
});

describe('locking reads every token a binding can resolve to', () => {
  test('bindingTokens: token, values tokens, computed token operands, each once', () => {
    const binding = { token: 'space.sm', by: 'size', values: { sm: 'space.xs', md: 'space.sm' }, computed: { plus: [{ token: 'space.1' }, { binding: 'radius' }], minus: [{ token: 'space.xs' }] } };
    expect(bindingTokens(binding)).toEqual(['space.sm', 'space.xs', 'space.1']);
    expect(bindingTokens({ token: 'radius.md' })).toEqual(['radius.md']);
  });

  const focusByValue = (): { token: string; by: string; values: Record<string, string> } => ({ token: 'color.border.default', by: 'size', values: { sm: 'color.border.focus' } });

  test('a binding whose only values entry is color.border.focus must lock', () => {
    expect(lockRule('border', 'color.border.default', [])).toBeNull();
    expect(lockRule('border', bindingTokens(focusByValue()), [])).toBe("LOCKED_TOKENS has 'color.border.focus'");
    const c = styled({ border: focusByValue() });
    check(c);
    expect(c.styles.border.locked).toBe(true);
  });

  test('an explicit locked: false on it fails with the existing message', () => {
    expectDocError(() => check(styled({ border: { ...focusByValue(), locked: false } })), "widget.md: styles.border sets locked: false, but 'color.border.default' must be locked (LOCKED_TOKENS has 'color.border.focus')");
  });

  test('a values token in a contrast pair and a computed token operand lock too', () => {
    const c = styled({
      text: { token: 'color.foreground', by: 'variant', values: { danger: 'color.action.danger.foreground' } },
      gap: { token: 'space.1', computed: { plus: [{ token: 'border.width.focus' }] } },
    });
    expect(lockRule('text', bindingTokens(c.styles.text), ['color.action.{variant}.foreground'], c.props)).toBe("a11y.contrast pairs 'color.action.{variant}.foreground'");
    check(c);
    expect([c.styles.text.locked, c.styles.gap.locked, c.styles.radius.locked]).toEqual([true, true, false]);
  });

  test('an extension may not add a binding a values token locks', () => {
    const c = component();
    const glow = { token: 'color.border.default', by: 'size', values: { md: 'color.border.focus' } };
    c.styles.glow = glow;
    expectDocError(() => parse.checkExtensionLocks(c, [[glow, 'extensions/Widget.glow.md']]), "extensions/Widget.glow.md: styles.glow binds 'color.border.default', which is locked (contrast pair, focus ring or target) — an extension may add only overridable bindings");
  });

  test('the token-existence check covers values and computed tokens', () => {
    check(styled({ gap: { token: 'space.sm', by: 'size', values: { sm: 'color.action.{variant}.background' } } }));
    rejects(
      styled({ gap: { token: 'space.sm', by: 'size', values: { sm: 'space.{variant}' } } }),
      ['styles', 'gap', 'values', 'sm'],
      "Widget: styles.gap 'space.{variant}' → 'space.primary' is not a token",
    );
    rejects(
      styled({ gap: { token: 'space.sm', computed: { plus: [{ token: 'gap.{size}' }] } } }),
      ['styles', 'gap', 'computed', 'plus', 0, 'token'],
      "Widget: styles.gap 'gap.{size}' → 'gap.sm' is not a token",
    );
    rejects(
      styled({ gap: { token: 'space.sm', computed: { minus: [{ token: 'space.xs' }] } } }),
      ['styles', 'gap', 'computed', 'minus', 0, 'token'],
      "Widget: styles.gap 'space.xs' is not a token",
    );
    expectDocError(() => check(styled({ gap: { token: 'space.sm', by: 'size', values: { md: 'space.{variant}' } } })), "Widget: styles.gap 'space.{variant}' → 'space.primary' is not a token");
  });
});

describe('computeBinding', () => {
  const tokens: Record<string, number> = { 'space.0': 0, 'space.1': 4, 'space.5': 20, 'space.10': 40, 'space.20': 80 };
  const resolveToken = (token: string): number => tokens[token] as number;

  test("Menu's space.20 × 2.5 is 200 when space.20 is 80", () => {
    expect(computeBinding({ token: 'space.20', computed: { times: 2.5 } }, resolveToken, () => Number.NaN)).toBe(200);
  });

  test("RadioGroup's controlSize − 2 × space.1 uses a binding operand", () => {
    const styles: Dict = {
      controlSize: { token: 'space.5' },
      indicatorSize: { token: 'space.0', computed: { plus: [{ binding: 'controlSize' }], minus: [{ token: 'space.1', times: 2 }] } },
    };
    accepts(styled(styles));
    const resolveBinding = (bName: string): number => computeBinding(styles[bName], resolveToken, resolveBinding);
    expect(computeBinding(styles.indicatorSize, resolveToken, resolveBinding)).toBe(12);
  });

  test("Switch's thumb travel, trackWidth − thumbSize − 2 × thumbInset, uses three operands", () => {
    const styles: Dict = {
      thumbSize: { token: 'space.5' },
      thumbInset: { token: 'space.1' },
      thumbTravel: { token: 'space.10', computed: { minus: [{ binding: 'thumbSize' }, { binding: 'thumbInset', times: 2 }] } },
    };
    accepts(styled(styles));
    const bindings: Record<string, number> = { thumbSize: 20, thumbInset: 4 };
    expect(computeBinding(styles.thumbTravel, resolveToken, (bName) => bindings[bName] as number)).toBe(12);
  });

  test('without computed it is the token value', () => {
    expect(computeBinding({ token: 'space.10' }, resolveToken, () => Number.NaN)).toBe(40);
  });
});

test('one binding with by/values, state, part and computed parses, locks through a values token and evaluates', () => {
  const c = styled({
    ringOffset: { token: 'space.1', part: 'container', state: 'focus-visible', by: 'size', values: { sm: 'border.width.focus' }, computed: { times: 2, plus: [{ binding: 'radius' }] } },
  });
  accepts(c);
  check(c);
  expect(c.styles.ringOffset.locked).toBe(true);
  const value = computeBinding(c.styles.ringOffset, (token) => ({ 'space.1': 4, 'radius.md': 6 })[token] as number, (bName) => (bName === 'radius' ? 6 : Number.NaN));
  expect(value).toBe(14);
});
