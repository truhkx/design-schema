import { type ComponentPropsWithoutRef, type CSSProperties, type MouseEvent, type Ref, type ReactElement } from 'react';
import { cssVar, type TokenRef } from '@demo/tokens';
import { Icon } from './Icon';
import './Link.css';

export type LinkTone = 'default' | 'inherit';

/** copy.externalSuffix — appended to the accessible name of an external link. */
const EXTERNAL_SUFFIX = ' (opens in new tab)';

/** Style bindings that can be overridden per instance; accessibility-bearing bindings are never in this list. */
export type LinkOverridableBinding = 'underlineThickness' | 'underlineOffset' | 'externalIconGap' | 'transition';

const OVERRIDE_HOOK: Record<LinkOverridableBinding, string> = {
  underlineThickness: '--demo-link-underline-thickness',
  underlineOffset: '--demo-link-underline-offset',
  externalIconGap: '--demo-link-external-icon-gap',
  transition: '--demo-link-transition',
};

function overridesToStyle(overrides: Partial<Record<LinkOverridableBinding, TokenRef | undefined>>): CSSProperties {
  const style: Record<string, string> = {};
  for (const binding of Object.keys(overrides) as LinkOverridableBinding[]) {
    const ref = overrides[binding];
    if (ref) style[OVERRIDE_HOOK[binding]] = cssVar(ref);
  }
  return style as CSSProperties;
}

export interface LinkProps
  extends Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'children' | 'target' | 'rel' | 'download' | 'aria-label' | 'onClick'> {
  /** The destination. A URL on web; a URL or app route on native, resolved by `onPress` when the consumer provides it. */
  href: string;
  /** The link text. Also the accessible name. Says where the link goes, not "click here". */
  label: string;
  /** Opens the destination in a new tab and appends the external suffix to the accessible name, with a decorative trailing icon. */
  external?: boolean | undefined;
  /** `default` uses the link colors. `inherit` takes the surrounding text color and relies on the underline alone. */
  tone?: LinkTone | undefined;
  /** Downloads the resource instead of navigating. Web only. */
  download?: boolean | undefined;
  /** Per-instance style overrides: each entry sets the matching CSS hook to that token, inline. */
  overrides?: Partial<Record<LinkOverridableBinding, TokenRef | undefined>> | undefined;
  /** Fired when the link is activated. The default navigation still happens unless the consumer prevents it. */
  onClick?: ((event: MouseEvent<HTMLAnchorElement>) => void) | undefined;
}

/**
 * Link — Design Schema, category: navigation.
 *
 * When to use:
 * Use a Link for any navigation: to another page, to a screen, to an anchor within the page, to
 * an external site, or to a downloadable file. Use it inline inside body text (it renders inline
 * by default) and standalone in navigation lists. Use `external` whenever the destination leaves
 * the product, so people are warned before they lose their place.
 */
export const Link = function Link({ ref, href, label, external = false, tone = 'default', download = false, overrides, onClick, className, style, ...rest }: LinkProps & { ref?: Ref<HTMLAnchorElement> | undefined }): ReactElement {
  const classes = ['demo-link', `demo-link--tone-${tone}`, external ? 'demo-link--external' : null, className ?? null]
    .filter(Boolean)
    .join(' ');

  const overrideStyle = overrides ? overridesToStyle(overrides) : undefined;
  const mergedStyle = overrideStyle || style ? { ...overrideStyle, ...style } : undefined;

  return (
    <a
      {...rest}
      ref={ref}
      href={href}
      data-ds="Link"
      className={classes}
      style={mergedStyle}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      download={download ? true : undefined}
      onClick={onClick}
    >
      <span className="demo-link__label">{label}</span>
      {external ? (
        <>
          {/* The suffix is visually hidden text, not aria-label, so the name still starts with the visible label. */}
          <span className="demo-link__external-suffix">{EXTERNAL_SUFFIX}</span>
          <span className="demo-link__external-icon" data-part="externalIcon" aria-hidden="true">
            <Icon name="external" inline />
          </span>
        </>
      ) : null}
    </a>
  );
};
