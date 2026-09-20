import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{O as t,_ as n,a as r,b as i,f as a,g as o,h as s,i as c,o as l,p as u,r as d,t as f,u as p,v as m,w as h}from"./if-defined-CARySXJh.js";var g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G;function K(){return(K=e((()=>{o(),n(),l(),f(),r(),U={iconGap:`--ds-button-icon-gap`,paddingInline:`--ds-button-padding-inline`,paddingBlock:`--ds-button-padding-block`,radius:`--ds-button-radius`,fontFamily:`--ds-button-font-family`,fontWeight:`--ds-button-font-weight`,fontSize:`--ds-button-font-size`,inverseBackgroundHover:`--ds-button-inverse-background-hover`,inverseHoverOpacity:`--ds-button-inverse-hover-opacity`,disabledOpacity:`--ds-button-disabled-opacity`,transition:`--ds-button-transition`,loadingSpin:`--ds-button-loading-spin`,spinnerSize:`--ds-button-spinner-size`},W=`Loading`,new class extends u{static[class extends m{static{({e:[_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H],c:[G,g]}=s(this,[a(`ds-button`)],[[p({type:String}),1,`label`],[p({type:String,reflect:!0}),1,`variant`],[p({type:String,reflect:!0}),1,`size`],[p({type:String,reflect:!0}),1,`type`],[p({attribute:!1}),1,`expanded`],[p({type:Boolean,reflect:!0}),1,`disabled`],[p({type:Boolean,reflect:!0,attribute:`icon-only`}),1,`iconOnly`],[p({type:Boolean,reflect:!0}),1,`loading`],[p({type:Boolean,reflect:!0}),1,`inverse`],[p({type:String,attribute:`accessible-name`}),1,`accessibleName`],[p({type:String,reflect:!0,attribute:`overflow-label`}),1,`overflowLabel`],[p({type:String}),1,`track`],[p({attribute:!1}),1,`overrides`]],0,void 0,m))}constructor(...e){super(...e),H(this)}#e=_(this,``);get label(){return this.#e}set label(e){this.#e=e}#t=(v(this),y(this,`primary`));get variant(){return this.#t}set variant(e){this.#t=e}#n=(b(this),x(this,`md`));get size(){return this.#n}set size(e){this.#n=e}#r=(S(this),C(this,`button`));get type(){return this.#r}set type(e){this.#r=e}#i=(w(this),T(this));get expanded(){return this.#i}set expanded(e){this.#i=e}#a=(E(this),D(this,!1));get disabled(){return this.#a}set disabled(e){this.#a=e}#o=(O(this),k(this,!1));get iconOnly(){return this.#o}set iconOnly(e){this.#o=e}#s=(A(this),j(this,!1));get loading(){return this.#s}set loading(e){this.#s=e}#c=(M(this),N(this,!1));get inverse(){return this.#c}set inverse(e){this.#c=e}#l=(P(this),F(this));get accessibleName(){return this.#l}set accessibleName(e){this.#l=e}#u=(I(this),L(this));get overflowLabel(){return this.#u}set overflowLabel(e){this.#u=e}#d=(R(this),z(this));get track(){return this.#d}set track(e){this.#d=e}#f=(B(this),V(this));get overrides(){return this.#f}set overrides(e){this.#f=e}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Button`)}willUpdate(e){e.has(`overrides`)&&this.applyOverrides()}render(){return h`
      <button
        part="container"
        data-part="container"
        type=${this.type}
        aria-disabled=${d(this.disabled?`true`:void 0)}
        aria-busy=${d(this.loading?`true`:void 0)}
        aria-expanded=${d(this.expanded===void 0?void 0:String(this.expanded))}
        aria-label=${d(this.accessibleName??(this.iconOnly?this.label:void 0))}
        aria-describedby=${d(this.loading?`loading-description`:void 0)}
        @click=${this.handleClick}
      >
        <span class="content">
          ${this.loading?h`<span class="spinner" aria-hidden="true"></span>`:h`<slot name="leading-icon" part="leadingIcon" data-part="leadingIcon"></slot>`}
          <span class="label" part="label" data-part="label">${this.label}</span>
          ${this.iconOnly||this.loading?i:h`<slot name="trailing-icon" part="trailingIcon" data-part="trailingIcon"></slot>`}
        </span>
        ${this.loading?h`<span id="loading-description" class="visually-hidden" aria-hidden="true">${W}</span>`:i}
      </button>
    `}handleClick(e){if(this.disabled||this.loading){e.preventDefault(),e.stopPropagation();return}this.dispatchEvent(new CustomEvent(`press`,{bubbles:!0,composed:!0})),this.track&&(this.track,this.label,this.dispatchEvent(new CustomEvent(`track`,{detail:{name:this.track,label:this.label},bubbles:!0,composed:!0}))),this.type===`submit`&&!this.closest(`ds-form`)&&this.closest(`form`)?.requestSubmit()}applyOverrides(){for(let e of Object.keys(U)){let t=this.overrides?.[e],n=U[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,c(t))}}}];shadowRootOptions={...m.shadowRootOptions,delegatesFocus:!0};styles=t`
    /*
     * Hooks for the overridable bindings, plus spinnerStroke (locked, but its
     * binding keeps the hook). The other locked bindings (background,
     * backgroundHover, foreground, focusRing, focusRingWidth, inverseForeground,
     * inverseFocusRing, minTarget) have no hook: their rules read the token.
     */
    :host {
      display: inline-flex;
      vertical-align: middle;
      --ds-button-icon-gap: var(--space-2);
      --ds-button-padding-inline: var(--space-md);
      --ds-button-padding-block: var(--space-sm);
      --ds-button-radius: var(--radius-md);
      --ds-button-font-family: var(--font-family-body);
      --ds-button-font-weight: var(--font-weight-medium);
      --ds-button-font-size: var(--font-size-md);
      --ds-button-inverse-background-hover: var(--color-inverse-foreground);
      /* the base token; the rule that reads it multiplies by 0.25 */
      --ds-button-inverse-hover-opacity: var(--opacity-disabled);
      --ds-button-disabled-opacity: var(--opacity-disabled);
      --ds-button-transition: var(--motion-duration-fast);
      --ds-button-loading-spin: var(--motion-duration-loop);
      --ds-button-spinner-size: var(--font-size-md);
      --ds-button-spinner-stroke: var(--border-width-focus);
    }

    :host([hidden]) {
      display: none;
    }

    [data-part='container'] {
      position: relative;
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      inline-size: 100%;
      /* minTarget: locked; the floor at every size (WCAG 2.5.8) */
      min-inline-size: var(--size-target-min);
      min-block-size: var(--size-target-min);
      margin: 0;
      padding-block: var(--ds-button-padding-block);
      padding-inline: var(--ds-button-padding-inline);
      border: 0;
      border-radius: var(--ds-button-radius);
      font-family: var(--ds-button-font-family);
      font-size: var(--ds-button-font-size);
      font-weight: var(--ds-button-font-weight);
      color: var(--color-action-primary-foreground);
      background: var(--color-action-primary-background);
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      /* transition: only the background animates, with motion.easing.standard */
      transition: background-color var(--ds-button-transition) var(--motion-easing-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      [data-part='container'] {
        transition: none;
      }
    }

    /* paddingInline: space.{size}; fontSize and spinnerSize: font.size.{size} */
    :host([size='sm']) {
      --ds-button-padding-inline: var(--space-sm);
      --ds-button-font-size: var(--font-size-sm);
      --ds-button-spinner-size: var(--font-size-sm);
    }
    :host([size='md']) {
      --ds-button-padding-inline: var(--space-md);
      --ds-button-font-size: var(--font-size-md);
      --ds-button-spinner-size: var(--font-size-md);
    }
    :host([size='lg']) {
      --ds-button-padding-inline: var(--space-lg);
      --ds-button-font-size: var(--font-size-lg);
      --ds-button-spinner-size: var(--font-size-lg);
    }

    /*
     * iconOnly: equal padding on all sides. paddingInline takes the resolved
     * paddingBlock, so a paddingBlock override keeps the sides equal and a
     * paddingInline override has no effect.
     */
    :host([icon-only]) [data-part='container'] {
      padding-inline: var(--ds-button-padding-block);
    }

    /* background / foreground: color.action.{variant}.*, locked (no hook) */
    :host([variant='primary']) [data-part='container'] {
      color: var(--color-action-primary-foreground);
      background: var(--color-action-primary-background);
    }
    :host([variant='secondary']) [data-part='container'] {
      color: var(--color-action-secondary-foreground);
      background: var(--color-action-secondary-background);
    }
    :host([variant='ghost']) [data-part='container'] {
      color: var(--color-action-ghost-foreground);
      background: var(--color-action-ghost-background);
    }
    :host([variant='danger']) [data-part='container'] {
      color: var(--color-action-danger-foreground);
      background: var(--color-action-danger-background);
    }

    /* backgroundHover: color.action.{variant}.backgroundHover on pointer hover and pressed, locked */
    :host([variant='primary']:not([disabled]):not([loading])) [data-part='container']:is(:hover, :active) {
      background: var(--color-action-primary-background-hover);
    }
    :host([variant='secondary']:not([disabled]):not([loading])) [data-part='container']:is(:hover, :active) {
      background: var(--color-action-secondary-background-hover);
    }
    :host([variant='ghost']:not([disabled]):not([loading])) [data-part='container']:is(:hover, :active) {
      background: var(--color-action-ghost-background-hover);
    }
    :host([variant='danger']:not([disabled]):not([loading])) [data-part='container']:is(:hover, :active) {
      background: var(--color-action-danger-background-hover);
    }

    /*
     * inverse: only ghost changes on an inverse surface. Its text is
     * inverseForeground, and its hover fill is inverseBackgroundHover at
     * inverseHoverOpacity (the sanctioned color-mix of tokens). Other variants
     * keep their own fills.
     */
    :host([inverse][variant='ghost']) [data-part='container'] {
      color: var(--color-inverse-link);
    }
    :host([inverse][variant='ghost']:not([disabled]):not([loading])) [data-part='container']:is(:hover, :active) {
      background: color-mix(
        in srgb,
        var(--ds-button-inverse-background-hover) calc(var(--ds-button-inverse-hover-opacity) * 0.25 * 100%),
        transparent
      );
    }

    /* focusRing / focusRingWidth: color.border.focus at border.width.focus, locked */
    [data-part='container']:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    /* inverseFocusRing: the ring must read against the inverse surface, for every variant */
    :host([inverse]) [data-part='container']:focus-visible {
      outline-color: var(--color-inverse-focus);
    }

    /* disabledOpacity: the whole button; colors are unchanged so the contrast math still holds */
    :host([disabled]) [data-part='container'] {
      opacity: var(--ds-button-disabled-opacity);
      cursor: not-allowed;
    }

    .content {
      display: inline-flex;
      align-items: center;
      /* iconGap: space.2 */
      gap: var(--ds-button-icon-gap);
    }

    /* iconOnly: hide the visible label; the accessible name moves to aria-label */
    :host([icon-only]) [data-part='label'] {
      display: none;
    }

    :host([loading]) [data-part='container'] {
      cursor: progress;
    }

    /* loading: a ring spinnerSize across, spinnerStroke thick, one quarter transparent, in currentColor */
    .spinner {
      display: inline-block;
      box-sizing: border-box;
      inline-size: var(--ds-button-spinner-size);
      block-size: var(--ds-button-spinner-size);
      border: var(--ds-button-spinner-stroke) solid currentColor;
      border-inline-end-color: transparent;
      border-radius: var(--radius-full);
      animation: ds-button-spin var(--ds-button-loading-spin) linear infinite;
    }
    @keyframes ds-button-spin {
      to {
        /* one full turn: a geometric constant, not a themed value */
        transform: rotate(360deg);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .spinner {
        animation: none;
      }
    }

    .visually-hidden {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }
  `;constructor(){super(G),g()}}})))()}export{K as t};