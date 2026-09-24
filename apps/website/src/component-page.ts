/**
 * The component page's view models — every row and sentence the page renders, derived from the
 * schema and nothing else (site/src/content/docs/process/website-plan.md, "Component page template").
 *
 * Kept out of the `.astro` page and out of the React components on purpose: this is the half that
 * can be reasoned about without a renderer, so the page stays composition and the components stay
 * markup. Nothing here invents content — every string is either a field of `generated/components.json`
 * or one of the fixed prose lines below, which exist because the schema's `a11y.requires` is a list
 * of slugs (`focus-restore`, `no-hover-only`) and a docs page owes the reader a sentence.
 */
import { resolveRole, type ComponentDef, type PlatformId } from '../../../schema/component';
// The package the Basic Usage snippet installs, read from its own manifest rather than typed out:
// a rename or a moved CSS export then reaches the docs with a build, not with a search-and-replace.
import reactManifest from '../../../packages/react/package.json';
import litManifest from '../../../packages/lit/package.json';
import tokensManifest from '../../../packages/tokens/package.json';

/** One entry of `a11y.requires`. Taken from the schema so a new requirement fails typecheck here. */
export type Requirement = ComponentDef['a11y']['requires'][number];

/** One row of the props `Table`: the five columns website-plan.md names, plus the a11y footnote. */
export interface PropRow {
  name: string;
  /** Rendered type: an enum's values joined with `|`, otherwise the declared type (with its shape). */
  type: string;
  required: boolean;
  /** The literal default, or `—` when the prop has none. */
  default: string;
  description: string;
  /** Why the prop matters for accessibility, when the doc says. */
  a11y?: string | undefined;
  /** The platforms the prop exists on; a prop without its own list exists on all of them. */
  platforms: string[];
}

/** One row of the events `Table`. Events have no type or default of their own; the per-platform
 *  name is the closest thing, so it takes the Type column. */
export interface EventRow {
  name: string;
  type: string;
  description: string;
  gesture: boolean;
  platforms: string[];
}

/** One row of the contrast `Table` in the "Contrast & motion" section. */
export interface ContrastRow {
  foreground: string;
  background: string;
  /** `AA` or `AAA`, with the large-text threshold noted when the pair uses it. */
  level: string;
}

/** One line of the "Role & structure" requirement prose. */
export interface RequirementLine {
  id: Requirement;
  label: string;
  prose: string;
}

const DASH = '—';

/**
 * What each `a11y.requires` slug means, in one sentence.
 *
 * A fixed table rather than generated text: the slugs are a closed enum in schema/component.ts, so
 * this is exhaustive by construction — adding a requirement to the schema without a sentence here is
 * a typecheck error, not a page that silently renders a slug at a reader.
 */
const REQUIREMENT_PROSE: Record<Requirement, { label: string; prose: string }> = {
  'accessible-name': {
    label: 'Accessible name',
    prose:
      'Every instance carries a programmatic name. Where the component has no text of its own to ' +
      'use, the name is a prop the consumer supplies.',
  },
  'focus-visible': {
    label: 'Visible focus',
    prose: 'Keyboard focus is always drawn, from the theme’s focus tokens, and is never removed.',
  },
  'keyboard-operable': {
    label: 'Keyboard operable',
    prose: 'Everything the pointer can do here, the keyboard can do — see the keyboard section.',
  },
  'target-24px': {
    label: 'Target size',
    prose: 'Interactive targets are at least 24×24 CSS pixels (WCAG 2.2 Target Size, minimum).',
  },
  'target-44px': {
    label: 'Target size',
    prose: 'Interactive targets are at least 44×44 CSS pixels — the touch-first size, not the minimum.',
  },
  'contrast-aa': {
    label: 'Contrast',
    prose: 'Text and meaningful non-text contrast meets WCAG AA; the pairs are listed below.',
  },
  'contrast-aaa': {
    label: 'Contrast',
    prose: 'Text contrast meets WCAG AAA; the pairs are listed below.',
  },
  'heading-hierarchy': {
    label: 'Heading hierarchy',
    prose:
      'Headings this component renders take their level from the caller, so the page outline never ' +
      'skips a level.',
  },
  'label-association': {
    label: 'Label association',
    prose: 'The label is programmatically associated with the control, not merely placed beside it.',
  },
  'error-identification': {
    label: 'Error identification',
    prose:
      'An invalid value is identified in text and linked to the control — never signalled by colour ' +
      'alone.',
  },
  'focus-trap': {
    label: 'Focus trap',
    prose: 'While it is open, Tab cycles inside it; focus cannot reach the page behind.',
  },
  'focus-restore': {
    label: 'Focus restore',
    prose: 'On close, focus returns to whatever opened it.',
  },
  'escape-dismiss': {
    label: 'Escape dismisses',
    prose: 'Escape closes it from anywhere inside.',
  },
  'arrow-navigation': {
    label: 'Arrow navigation',
    prose: 'Arrow keys move between items; Home and End jump to the ends.',
  },
  'roving-tabindex': {
    label: 'Roving tabindex',
    prose: 'The group is a single tab stop; the arrow keys move within it.',
  },
  'expanded-state': {
    label: 'Expanded state',
    prose: 'Open and closed are exposed programmatically (`aria-expanded`), not only visually.',
  },
  'selected-state': {
    label: 'Selected state',
    prose: 'Selection is exposed programmatically (`aria-selected` / `aria-checked`).',
  },
  'live-region': {
    label: 'Live region',
    prose: 'Changes are announced through a live region, without moving focus.',
  },
  'reduced-motion': {
    label: 'Reduced motion',
    prose:
      'Under `prefers-reduced-motion: reduce` the transitions are dropped rather than shortened, and ' +
      'the component still reaches every state.',
  },
  'gesture-alternative': {
    label: 'Gesture alternative',
    prose: 'Every gesture — swipe, drag, long-press — has a single-pointer and a keyboard equivalent.',
  },
  'landmark-role': {
    label: 'Landmark',
    prose: 'It renders a landmark, so assistive technology can jump straight to it.',
  },
  'inert-background': {
    label: 'Inert background',
    prose: 'While it is open, the rest of the page is inert to the pointer and to assistive technology.',
  },
  'scroll-lock': {
    label: 'Scroll lock',
    prose: 'While it is open, the page behind it does not scroll.',
  },
  'no-hover-only': {
    label: 'No hover-only content',
    prose: 'Nothing is reachable by hover alone; keyboard focus reveals the same content.',
  },
};

/**
 * The requirements that are a decision the *consumer* makes, not something generation can settle.
 *
 * The rest of `a11y.requires` is the component's own contract — it either traps focus or it does
 * not — and saying so in an Alert would be noise. These are the ones where the component cannot act
 * without being told something, which is exactly what website-plan.md asks the Alert above the
 * accordion to surface ("anything that needs a deliberate consumer choice").
 */
const CONSUMER_CHOICE: Partial<Record<Requirement, string>> = {
  'accessible-name':
    'Supply an accessible name. This component has no text of its own to fall back on, so without ' +
    'one a screen reader announces its role and nothing else.',
  'label-association':
    'Supply the label. It is associated with the control for you, but the words are yours — a ' +
    'placeholder is not a label.',
  'error-identification':
    'Supply the error text when the value is invalid. The component links and announces it; it ' +
    'cannot write it.',
  'heading-hierarchy':
    'Choose the heading level so it follows the heading above it on your page. The component will ' +
    'not guess the outline it lands in.',
  'landmark-role':
    'Choose the landmark role, and give it a name when the page has more than one landmark of that ' +
    'role.',
  'gesture-alternative':
    'If you wire up the gesture events, provide the pointer and keyboard path to the same outcome.',
};

/** `enum` props render their values; `array`/`object`/`function` props render their declared shape, and
 *  `union` props the shape alone, which already names every kind (`string | string[]`). An `integer` reads as
 *  the `number` it is emitted as. */
function propType(prop: ComponentDef['props'][string]): string {
  if (prop.type === 'enum') return (prop.values ?? []).join(' | ');
  if (prop.type === 'union') return prop.shape ?? prop.type;
  const type = prop.type === 'integer' ? 'number' : prop.type;
  return prop.shape !== undefined ? `${type} ${prop.shape}` : type;
}

/** The literal a prop falls back to. `false` and `0` are real defaults, so only absence is a dash. */
function propDefault(prop: ComponentDef['props'][string]): string {
  return prop.default === undefined ? DASH : String(prop.default);
}

/** The platforms a component declares, in schema order — the fallback for anything not narrowed. */
function allPlatforms(def: ComponentDef): PlatformId[] {
  return Object.keys(def.platforms) as PlatformId[];
}

/**
 * The props table's rows, in the order the doc declares them.
 *
 * One row per prop and no more: this is the count the job's gate compares against the doc, so
 * events deliberately get their own table rather than being folded in here.
 */
export function propRows(def: ComponentDef): PropRow[] {
  const platforms = allPlatforms(def);
  return Object.entries(def.props).map(([name, prop]) => ({
    name,
    type: propType(prop),
    required: prop.required,
    default: propDefault(prop),
    description: prop.description,
    a11y: prop.a11y,
    platforms: prop.platforms ?? platforms,
  }));
}

/** The events table's rows. `type` is the platform-neutral handler's shape across platforms. */
export function eventRows(def: ComponentDef): EventRow[] {
  return Object.entries(def.events).map(([name, event]) => {
    const named = Object.entries(event.platforms) as [PlatformId, string][];
    // `onPress` on three platforms and `press` on Lit is worth showing once, not four times.
    const distinct = [...new Set(named.map(([, handler]) => handler))];
    return {
      name,
      type: distinct.join(' / '),
      description: event.description,
      gesture: event.gesture,
      platforms: named.map(([platform]) => platform),
    };
  });
}

/** Every requirement the doc lists, as a label and a sentence, in the doc's order. */
export function requirementLines(def: ComponentDef): RequirementLine[] {
  return def.a11y.requires.map((id) => ({ id, ...REQUIREMENT_PROSE[id] }));
}

/**
 * The consumer decisions this component's schema implies — the body of the `Alert(tone="info")`
 * above the accessibility accordion. Empty when the schema asks nothing of the caller, in which
 * case the page renders no Alert at all rather than an empty one.
 */
export function consumerChoices(def: ComponentDef): string[] {
  const lines = def.a11y.requires.flatMap((id) => {
    const choice = CONSUMER_CHOICE[id];
    return choice === undefined ? [] : [choice];
  });

  // The props the doc marks *required* and annotates with an a11y note are the same decision stated
  // per prop, and they name themselves — so the reader gets the list rather than a second sentence.
  const bearing = Object.entries(def.props)
    .filter(([, prop]) => prop.required && prop.a11y !== undefined)
    .map(([name]) => name);
  if (bearing.length > 0) {
    lines.push(
      `Required props that carry accessibility meaning: ${bearing.join(', ')}. ` +
        'Each is described in the props table above.',
    );
  }

  return lines;
}

/** The contrast pairs the doc declares. `{tone}`-style placeholders stay verbatim: they are the
 *  token path, and which tone is in play is the caller's prop. */
export function contrastRows(def: ComponentDef): ContrastRow[] {
  return (def.a11y.contrast ?? []).map((pair) => ({
    foreground: pair.foreground,
    background: pair.background,
    level: `${pair.level}${pair.nonText ? ' (non-text)' : pair.large ? ' (large text)' : ''}${pair.state ? ` (${pair.state})` : ''}`,
  }));
}

/** The reduced-motion sentence, when the doc requires one. */
export function reducedMotionNote(def: ComponentDef): string | undefined {
  return def.a11y.requires.includes('reduced-motion') ? REQUIREMENT_PROSE['reduced-motion'].prose : undefined;
}

/** The two snippets of the Basic Usage section, ready for `<Code>`. */
export interface BasicUsage {
  /** The install command, a shell one-liner. */
  install: string;
  /** The import lines a consumer writes to use this component — the theme, the stylesheet, then the component. */
  imports: string;
}

/**
 * The stylesheet subpath the React package publishes, from its own `exports` map.
 *
 * `sideEffects: false` and a separate CSS entry mean a consumer *has* to import it themselves, so
 * leaving it out of the snippet would document a component that renders unstyled. Finding it rather
 * than writing `./index.css` here keeps the snippet true if the entry is ever renamed.
 */
function stylesheetSubpath(): string {
  const entry = Object.entries(reactManifest.exports).find(([subpath]) => subpath.endsWith('.css'));
  if (entry === undefined) {
    throw new Error(
      `${reactManifest.name} publishes no .css export, so the Basic Usage snippet cannot name one. ` +
        'Update apps/website/src/component-page.ts if the stylesheet moved into the main entry.',
    );
  }
  return entry[0].replace(/^\.\//, '');
}

/**
 * The first theme stylesheet the tokens package publishes (`./<theme>/css`), from its `exports` map.
 *
 * The component stylesheet only binds `--ds-*` hooks to token custom properties; without a theme's
 * sheet those properties are undefined and the component renders with no colour, space or type. And
 * under pnpm the transitive tokens dependency cannot be imported by the app, so the install line
 * names the tokens package too.
 */
function themeStylesheetSubpath(): string {
  const entry = Object.keys(tokensManifest.exports).find((subpath) => subpath.endsWith('/css'));
  if (entry === undefined) {
    throw new Error(
      `${tokensManifest.name} publishes no <theme>/css export, so the Basic Usage snippet cannot name one. ` +
        'Update apps/website/src/component-page.ts if the theme stylesheets moved.',
    );
  }
  return entry.replace(/^\.\//, '');
}

/**
 * Basic Usage for one component (website-plan.md, "Component page template" step 2).
 *
 * Two snippets, both derived: the package names and their stylesheet exports come from
 * `packages/react/package.json` and `packages/tokens/package.json`, and the imported symbol is the
 * component's own schema name, which is also the name the package exports. So this is a *package*
 * fact rather than hand-written prose — the distinction job 507 drew when it moved the live render
 * out of this section and into the examples `Tabs`, leaving the snippet as the only thing Basic Usage
 * still owes the reader.
 */
export function basicUsage(name: string): BasicUsage {
  return {
    install: `pnpm add ${reactManifest.name} ${tokensManifest.name}`,
    imports: [
      `import '${tokensManifest.name}/${themeStylesheetSubpath()}';`,
      `import '${reactManifest.name}/${stylesheetSubpath()}';`,
      `import { ${name} } from '${reactManifest.name}';`,
    ].join('\n'),
  };
}

/**
 * The one line a Lit app writes before any `<ds-*>` element works: the package's side-effect import,
 * which registers every custom element. A Lit example that is plain HTML shows it beside the markup,
 * since markup has no import line of its own to carry it.
 */
export function litRegistration(): string {
  return `import '${litManifest.name}';`;
}

const PLATFORM_NAMES: Record<PlatformId, string> = { web: 'React', lit: 'Lit', rn: 'React Native', swiftui: 'SwiftUI' };

/** `status` and the like are roles; `none` and `presentation` are the absence of one. A `roleFrom` component's
 *  role is whichever value its prop takes. A platform that renders its own role (`platforms.<p>.role`) is named
 *  after the ARIA one. */
export function roleSentence(def: ComponentDef): string {
  const { roleFrom } = def.a11y;
  const own = allPlatforms(def)
    .filter((platform) => def.platforms[platform]?.role !== undefined)
    .map((platform) => ` ${PLATFORM_NAMES[platform]} renders role ${resolveRole(def, undefined, platform)}.`)
    .join('');
  if (roleFrom !== undefined) {
    const values = def.props[roleFrom]?.values ?? [];
    return `ARIA role: set by the ${roleFrom} prop, one of ${values.join(', ')}.${own}`;
  }
  const role = resolveRole(def);
  return role === 'none' || role === 'presentation'
    ? `No implicit ARIA role — the component is styling and structure, and adds nothing to the accessibility tree.${own}`
    : `Implicit ARIA role: ${role}.${own}`;
}
