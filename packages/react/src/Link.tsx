import { forwardRef, type ComponentPropsWithoutRef, type MouseEvent } from 'react';
import './Link.css';

export type LinkTone = 'default' | 'inherit';

/** copy.externalSuffix — appended to the accessible name of an external link. */
const EXTERNAL_SUFFIX = ' (opens in new tab)';

export interface LinkProps
  extends Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'children' | 'target' | 'rel' | 'download' | 'aria-label' | 'onClick'> {
  /** The destination. A URL on web; a URL or app route on native, resolved by `onPress` when the consumer provides it. */
  href: string;
  /** The link text. Also the accessible name. Says where the link goes, not "click here". */
  label: string;
  /** Opens the destination in a new tab and appends the external suffix to the accessible name, with a decorative trailing icon. */
  external?: boolean;
  /** `default` uses the link colors. `inherit` takes the surrounding text color and relies on the underline alone. */
  tone?: LinkTone;
  /** Downloads the resource instead of navigating. Web only. */
  download?: boolean;
  /** Fired when the link is activated. The default navigation still happens unless the consumer prevents it. */
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
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
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { href, label, external = false, tone = 'default', download = false, onClick, className, ...rest },
  ref,
) {
  const classes = ['ds-link', `ds-link--tone-${tone}`, external ? 'ds-link--external' : null, className ?? null]
    .filter(Boolean)
    .join(' ');

  return (
    <a
      {...rest}
      ref={ref}
      href={href}
      className={classes}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      download={download ? true : undefined}
      onClick={onClick}
    >
      <span className="ds-link__label">{label}</span>
      {external ? (
        <>
          {/* The suffix is visually hidden text, not aria-label, so the name still starts with the visible label. */}
          <span className="ds-link__external-suffix">{EXTERNAL_SUFFIX}</span>
          <span className="ds-link__external-icon" aria-hidden="true">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" focusable="false">
              <path d="M6 3H3v10h10v-3M9 3h4v4M13 3L7 9" />
            </svg>
          </span>
        </>
      ) : null}
    </a>
  );
});
