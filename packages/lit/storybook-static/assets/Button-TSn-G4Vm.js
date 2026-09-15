import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{C as t,a as n,c as r,d as i,f as a,p as o,s,t as c,u as l,y as u}from"./decorators-BlUBDG4K.js";import{a as d,i as f,r as p,t as m}from"./if-defined-BfpvQ5_i.js";import{n as h,t as g}from"./class-map-ByT5L8jj.js";var _,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G;function K(){return(K=e((()=>{i(),a(),c(),m(),g(),d(),W={backgroundHover:`--ds-button-background-hover`,iconGap:`--ds-button-icon-gap`,paddingInline:`--ds-button-padding-inline`,paddingBlock:`--ds-button-padding-block`,radius:`--ds-button-radius`,fontFamily:`--ds-button-font-family`,fontWeight:`--ds-button-font-weight`,fontSize:`--ds-button-font-size`,disabledOpacity:`--ds-button-disabled-opacity`,transition:`--ds-button-transition`,loadingSpin:`--ds-button-loading-spin`,spinnerStroke:`--ds-button-spinner-stroke`},new class extends r{static[class extends o{static{({e:[v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U],c:[G,_]}=l(this,[s(`ds-button`)],[[n(),1,`label`],[n({reflect:!0}),1,`variant`],[n({reflect:!0}),1,`size`],[n({reflect:!0}),1,`type`],[n({type:Boolean,attribute:!1}),1,`expanded`],[n({type:Boolean,reflect:!0}),1,`disabled`],[n({type:Boolean,reflect:!0,attribute:`icon-only`}),1,`iconOnly`],[n({type:Boolean,reflect:!0}),1,`loading`],[n({type:Boolean,reflect:!0}),1,`inverse`],[n({attribute:`accessible-name`}),1,`accessibleName`],[n({attribute:`overflow-label`}),1,`overflowLabel`],[n(),1,`track`],[n({attribute:!1}),1,`overrides`]],0,void 0,o))}constructor(...e){super(...e),U(this)}#e=v(this,``);get label(){return this.#e}set label(e){this.#e=e}#t=(y(this),b(this,`primary`));get variant(){return this.#t}set variant(e){this.#t=e}#n=(x(this),S(this,`md`));get size(){return this.#n}set size(e){this.#n=e}#r=(C(this),w(this,`button`));get type(){return this.#r}set type(e){this.#r=e}#i=(T(this),E(this));get expanded(){return this.#i}set expanded(e){this.#i=e}#a=(D(this),O(this,!1));get disabled(){return this.#a}set disabled(e){this.#a=e}#o=(k(this),A(this,!1));get iconOnly(){return this.#o}set iconOnly(e){this.#o=e}#s=(j(this),M(this,!1));get loading(){return this.#s}set loading(e){this.#s=e}#c=(N(this),P(this,!1));get inverse(){return this.#c}set inverse(e){this.#c=e}#l=(F(this),I(this));get accessibleName(){return this.#l}set accessibleName(e){this.#l=e}#u=(L(this),R(this));get overflowLabel(){return this.#u}set overflowLabel(e){this.#u=e}#d=(z(this),B(this));get track(){return this.#d}set track(e){this.#d=e}#f=(V(this),H(this));get overrides(){return this.#f}set overrides(e){this.#f=e}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Button`)}willUpdate(e){e.has(`overrides`)&&this.applyOverrides()}render(){return u`
      <button
        part="container"
        class=${h({inverse:this.inverse})}
        type=${this.type}
        aria-disabled=${p(this.disabled?`true`:void 0)}
        aria-busy=${p(this.loading?`true`:void 0)}
        aria-expanded=${p(this.expanded===void 0?void 0:String(this.expanded))}
        aria-label=${p(this.accessibleName??(this.iconOnly?this.label:void 0))}
        @click=${this.handleClick}
      >
        <span class="content">
          <span class="spinner" part="leading-icon" aria-hidden="true"></span>
          <slot name="leading-icon" part="leading-icon"></slot>
          <span class="label" part="label">${this.label}</span>
          <slot name="trailing-icon" part="trailing-icon"></slot>
        </span>
      </button>
    `}handleClick(e){if(this.disabled||this.loading){e.preventDefault(),e.stopPropagation();return}this.dispatchEvent(new CustomEvent(`press`,{bubbles:!0,composed:!0})),this.track&&(this.track,this.label,this.dispatchEvent(new CustomEvent(`track`,{detail:{name:this.track,label:this.label},bubbles:!0,composed:!0}))),this.type===`submit`&&this.closest(`form`)?.requestSubmit()}applyOverrides(){for(let e of Object.keys(W)){let t=this.overrides?.[e],n=W[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,f(t))}}}];shadowRootOptions={...o.shadowRootOptions,delegatesFocus:!0};styles=t`
    :host {
      display: inline-flex;
      vertical-align: middle;
      --ds-button-background-hover: var(--color-action-primary-background-hover);
      --ds-button-icon-gap: var(--space-2);
      --ds-button-padding-inline: var(--space-md);
      --ds-button-padding-block: var(--space-sm);
      --ds-button-radius: var(--radius-md);
      --ds-button-font-family: var(--font-family-body);
      --ds-button-font-weight: var(--font-weight-medium);
      --ds-button-font-size: var(--font-size-md);
      --ds-button-disabled-opacity: var(--opacity-disabled);
      --ds-button-transition: var(--motion-duration-fast);
      --ds-button-loading-spin: var(--motion-duration-loop);
      --ds-button-spinner-stroke: var(--border-width-focus);
    }

    :host([hidden]) {
      display: none;
    }

    button {
      position: relative;
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      inline-size: 100%;
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
      transition:
        background-color var(--ds-button-transition) var(--motion-easing-standard),
        color var(--ds-button-transition) var(--motion-easing-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      button {
        transition: none;
      }
    }

    /* paddingInline: space.{size} */
    :host([size='sm']) {
      --ds-button-padding-inline: var(--space-sm);
    }
    :host([size='md']) {
      --ds-button-padding-inline: var(--space-md);
    }
    :host([size='lg']) {
      --ds-button-padding-inline: var(--space-lg);
    }

    /* fontSize: font.size.{size} */
    :host([size='sm']) {
      --ds-button-font-size: var(--font-size-sm);
    }
    :host([size='md']) {
      --ds-button-font-size: var(--font-size-md);
    }
    :host([size='lg']) {
      --ds-button-font-size: var(--font-size-lg);
    }

    /* iconOnly: equal padding on all sides (space.sm), regardless of size */
    :host([icon-only]) {
      --ds-button-padding-inline: var(--space-sm);
    }

    /* background / foreground: color.action.{variant}.*, locked */
    :host([variant='primary']) button {
      color: var(--color-action-primary-foreground);
      background: var(--color-action-primary-background);
    }
    :host([variant='primary']) {
      --ds-button-background-hover: var(--color-action-primary-background-hover);
    }
    :host([variant='secondary']) button {
      color: var(--color-action-secondary-foreground);
      background: var(--color-action-secondary-background);
    }
    :host([variant='secondary']) {
      --ds-button-background-hover: var(--color-action-secondary-background-hover);
    }
    :host([variant='ghost']) button {
      color: var(--color-action-ghost-foreground);
      background: var(--color-action-ghost-background);
    }
    :host([variant='ghost']) {
      --ds-button-background-hover: var(--color-action-ghost-background-hover);
    }
    :host([variant='danger']) button {
      color: var(--color-action-danger-foreground);
      background: var(--color-action-danger-background);
    }
    :host([variant='danger']) {
      --ds-button-background-hover: var(--color-action-danger-background-hover);
    }

    /* backgroundHover: pointer hover and pressed state */
    :host(:not([disabled]):not([loading])) button:is(:hover, :active) {
      background: var(--ds-button-background-hover);
    }

    /* inverse: only ghost is meaningful on inverse surfaces (Toast, Tooltip-like panels); locked tokens */
    :host([variant='ghost']) button.inverse {
      color: var(--color-inverse-link);
    }
    :host([variant='ghost']:not([disabled]):not([loading])) button.inverse:is(:hover, :active) {
      background: color-mix(in srgb, var(--color-inverse-foreground) 12%, transparent);
    }
    button.inverse:focus-visible {
      outline-color: var(--color-inverse-focus);
    }

    /* focus-visible: color.border.focus at border.width.focus, locked */
    button:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    /* disabledOpacity: applied to the whole button; colors are unchanged */
    :host([disabled]) button {
      opacity: var(--ds-button-disabled-opacity);
      cursor: not-allowed;
    }

    .content {
      display: inline-flex;
      align-items: center;
      gap: var(--ds-button-icon-gap);
    }

    /* iconOnly: hide the visible label; the accessible name moves to aria-label */
    :host([icon-only]) .label {
      display: none;
    }

    /* loading: spinner takes the leading-icon spot, trailing icon hides, label stays visible */
    :host([loading]) button {
      cursor: progress;
    }
    :host([loading]) slot[name='leading-icon'] {
      display: none;
    }
    :host([loading]) slot[name='trailing-icon'] {
      display: none;
    }
    .spinner {
      display: none;
      box-sizing: border-box;
      inline-size: 1em;
      block-size: 1em;
      border: var(--ds-button-spinner-stroke) solid currentColor;
      border-inline-end-color: transparent;
      border-radius: var(--radius-full);
      animation: ds-button-spin var(--ds-button-loading-spin) linear infinite;
    }
    :host([loading]) .spinner {
      display: inline-block;
    }
    @keyframes ds-button-spin {
      to {
        transform: rotate(1turn);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .spinner {
        animation: none;
      }
    }
  `;constructor(){super(G),_()}}})))()}export{K as t};