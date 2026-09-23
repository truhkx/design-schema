import { type ComponentPropsWithoutRef, type CSSProperties, type MouseEvent, type Ref, type ReactElement } from 'react';
import { cssVar, type TokenRef } from '@demo/tokens';
import { Icon } from './Icon';
import './Link.css';

/** `default` uses the link colors; `inherit` takes the surrounding text color. */
export type LinkTone = 'default' | 'inherit';

/** Copy strings from the schema, used verbatim. `copy.external` is the SwiftUI accessibility label and unused on web. */
const COPY = {
  externalSuffix: ' (opens in new tab)',
} as const;

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type LinkOverridableBinding = 'underlineThickness' | 'underlineOffset' | 'externalIconGap' | 'transition';

const OVERRIDE_HOOK: Record<LinkOverridableBinding, string> = {
  underlineThickness: '--demo-link-underline-thickness',
  underlineOffset: '--demo-link-underline-offset',
  externalIconGap: '--demo-link-external-icon-gap',
  transition: '--demo-link-transition',
};

function overridesToStyle(
  overrides: Partial<Record<LinkOverridableBinding, TokenRef | undefined>>,
  external: boolean,
): CSSProperties | undefined {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(OVERRIDE_HOOK) as LinkOverridableBinding[]) {
    // Overrides change values, never presence: the icon gap only applies when the icon renders.
    if (binding === 'externalIconGap' && !external) continue;
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return Object.keys(style).length > 0 ? (style as CSSProperties) : undefined;
}

export interface LinkProps
  extends Omit<
    ComponentPropsWithoutRef<'a'>,
    'href' | 'children' | 'target' | 'rel' | 'download' | 'aria-label' | 'onClick' | 'style' | 'className'
  > {
  /** The destination. A URL on web; a URL or app route on native, resolved by `onPress` when the consumer provides it. */
  href: string;
  /** The link text. Also the accessible name. Says where the link goes, not "click here". */
  label: string;
  /** Opens the destination in a new tab or the system browser and appends `copy.externalSuffix` to the accessible name, with a decorative trailing icon. */
  external?: boolean | undefined;
  /**
   * `default` uses the link colors. `inherit` takes the surrounding text color and relies on the
   * underline alone — for links inside muted or on-action text. Under `inherit` the color,
   * colorHover and colorVisited bindings are not applied: rest, hover and visited all resolve to
   * the inherited color, and the underline and the external icon follow it.
   */
  tone?: LinkTone | undefined;
  /** Downloads the resource instead of navigating, under the server's file name (a custom file name is out of scope). Web only. */
  download?: boolean | undefined;
  /**
   * The link points at the page the user is on, in a navigation list (a SidePanel drawer, a Tree of
   * href nodes): `aria-current="page"` on the anchor. The link stays a link and keeps its colours and
   * underline; how a navigation also marks it visually is that container's to say. False writes
   * nothing, so an `aria-current` passed through `...rest` (a `step` or `location`) still applies;
   * while `current` is true the prop wins.
   */
  current?: boolean | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<LinkOverridableBinding, TokenRef | undefined>> | undefined;
  /**
   * onPress — fired when the link is activated. The default navigation still happens unless the
   * consumer prevents it: call `preventDefault()` on the event or return `false`.
   */
  onClick?: ((event: MouseEvent<HTMLAnchorElement>) => void | boolean) | undefined;
}

/**
 * Link — Design Schema, category: navigation.
 *
 * When to use:
 * Use a Link for any navigation: to another page, to a screen, to an anchor within the page, to an
 * external site, or to a downloadable file. Use it inline inside body text (it renders inline by
 * default) and standalone in navigation lists. Use `external` whenever the destination leaves the
 * product, so people are warned before they lose their place.
 */
export function Link({
  ref,
  href,
  label,
  external = false,
  tone = 'default',
  download = false,
  current = false,
  overrides,
  onClick,
  ...rest
}: LinkProps & { ref?: Ref<HTMLAnchorElement> | undefined }): ReactElement {
  const classes = ['demo-link', `demo-link--tone-${tone}`, external ? 'demo-link--external' : null].filter(Boolean).join(' ');

  const handleClick = (event: MouseEvent<HTMLAnchorElement>): void => {
    if (onClick?.(event) === false) event.preventDefault();
  };

  return (
    <a
      {...rest}
      ref={ref}
      href={href}
      // Link's own hooks win over anything a parent passes: a parent's part goes on a wrapper it owns.
      data-ds="Link"
      data-part="anchor"
      className={classes}
      style={overrides ? overridesToStyle(overrides, external) : undefined}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      download={download ? true : undefined}
      // `current` writes aria-current only when true, so a consumer's own value from ...rest survives otherwise.
      {...(current ? { 'aria-current': 'page' as const } : {})}
      onClick={handleClick}
    >
      <span className="demo-link__label" data-part="label">
        {label}
      </span>
      {external ? (
        <>
          {/* Visually hidden text, not aria-label, so the accessible name still starts with the visible label. */}
          <span className="demo-link__external-suffix">{COPY.externalSuffix}</span>
          <span className="demo-link__external-icon" data-part="externalIcon">
            <Icon name="external" inline />
          </span>
        </>
      ) : null}
    </a>
  );
}
