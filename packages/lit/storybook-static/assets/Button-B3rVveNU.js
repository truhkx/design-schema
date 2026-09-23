import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{O as t,_ as n,a as r,b as i,c as a,f as o,g as s,h as c,i as l,o as u,p as d,r as f,t as p,u as m,v as h,w as g}from"./if-defined-CARySXJh.js";var _,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X;function Z(){return(Z=e((()=>{s(),n(),u(),p(),r(),J={iconGap:`--ds-button-icon-gap`,paddingInline:`--ds-button-padding-inline`,paddingBlock:`--ds-button-padding-block`,radius:`--ds-button-radius`,fontFamily:`--ds-button-font-family`,fontWeight:`--ds-button-font-weight`,fontSize:`--ds-button-font-size`,inverseBackgroundHover:`--ds-button-inverse-background-hover`,inverseHoverOpacity:`--ds-button-inverse-hover-opacity`,disabledOpacity:`--ds-button-disabled-opacity`,transition:`--ds-button-transition`,loadingSpin:`--ds-button-loading-spin`,spinnerSize:`--ds-button-spinner-size`},Y=`Loading`,new class extends d{static[class extends h{static{({e:[v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q],c:[X,_]}=c(this,[o(`ds-button`)],[[m({type:String}),1,`label`],[m({type:String,reflect:!0}),1,`variant`],[m({type:String,reflect:!0}),1,`size`],[m({type:String,reflect:!0}),1,`type`],[m({attribute:!1}),1,`expanded`],[m({attribute:!1}),1,`haspopup`],[m({type:Boolean,reflect:!0}),1,`disabled`],[m({type:Boolean,reflect:!0,attribute:`icon-only`}),1,`iconOnly`],[m({type:Boolean,reflect:!0}),1,`loading`],[m({type:Boolean,reflect:!0}),1,`inverse`],[m({type:String,attribute:`accessible-name`}),1,`accessibleName`],[m({type:String,reflect:!0,attribute:`overflow-label`}),1,`overflowLabel`],[m({type:String}),1,`track`],[m({attribute:!1}),1,`overrides`],[a(),1,`hostTabIndex`]],0,void 0,h))}#e=v(this,``);get label(){return this.#e}set label(e){this.#e=e}#t=(y(this),b(this,`primary`));get variant(){return this.#t}set variant(e){this.#t=e}#n=(x(this),S(this,`md`));get size(){return this.#n}set size(e){this.#n=e}#r=(C(this),w(this,`button`));get type(){return this.#r}set type(e){this.#r=e}#i=(T(this),E(this));get expanded(){return this.#i}set expanded(e){this.#i=e}#a=(D(this),O(this));get haspopup(){return this.#a}set haspopup(e){this.#a=e}#o=(k(this),A(this,!1));get disabled(){return this.#o}set disabled(e){this.#o=e}#s=(j(this),M(this,!1));get iconOnly(){return this.#s}set iconOnly(e){this.#s=e}#c=(N(this),P(this,!1));get loading(){return this.#c}set loading(e){this.#c=e}#l=(F(this),I(this,!1));get inverse(){return this.#l}set inverse(e){this.#l=e}#u=(L(this),R(this));get accessibleName(){return this.#u}set accessibleName(e){this.#u=e}#d=(z(this),B(this));get overflowLabel(){return this.#d}set overflowLabel(e){this.#d=e}#f=(V(this),H(this));get track(){return this.#f}set track(e){this.#f=e}#p=(U(this),W(this));get overrides(){return this.#p}set overrides(e){this.#p=e}#m=(G(this),K(this,null));get hostTabIndex(){return this.#m}set hostTabIndex(e){this.#m=e}tabIndexObserver=(q(this),new MutationObserver(()=>this.readHostTabIndex()));connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Button`),this.readHostTabIndex(),this.tabIndexObserver.observe(this,{attributes:!0,attributeFilter:[`tabindex`]})}disconnectedCallback(){super.disconnectedCallback(),this.tabIndexObserver.disconnect()}willUpdate(e){e.has(`overrides`)&&this.applyOverrides()}render(){return g`
      <button
        part="container"
        data-part="container"
        type=${this.type}
        tabindex=${f(this.hostTabIndex??void 0)}
        aria-disabled=${f(this.disabled?`true`:void 0)}
        aria-busy=${f(this.loading?`true`:void 0)}
        aria-expanded=${f(this.expanded===void 0?void 0:String(this.expanded))}
        aria-haspopup=${f(this.haspopup)}
        aria-label=${f(this.accessibleName??(this.iconOnly?this.label:void 0))}
        aria-describedby=${f(this.loading?`loading-description`:void 0)}
        @click=${this.handleClick}
      >
        <span class="content">
          ${this.loading?g`<span class="spinner" aria-hidden="true"></span>`:g`<slot name="leading-icon" part="leadingIcon" data-part="leadingIcon"></slot>`}
          ${this.iconOnly?i:g`<span class="label" part="label" data-part="label">${this.label}</span>`}
          ${this.iconOnly||this.loading?i:g`<slot name="trailing-icon" part="trailingIcon" data-part="trailingIcon"></slot>`}
        </span>
        ${this.loading?g`<span id="loading-description" class="visually-hidden" aria-hidden="true">${Y}</span>`:i}
      </button>
    `}handleClick(e){if(this.disabled||this.loading){e.preventDefault(),e.stopPropagation();return}this.dispatchEvent(new CustomEvent(`press`,{bubbles:!0,composed:!0})),this.track&&(this.track,this.label,this.dispatchEvent(new CustomEvent(`track`,{detail:{name:this.track,label:this.label},bubbles:!0,composed:!0}))),this.type===`submit`&&!this.closest(`ds-form`)&&this.closest(`form`)?.requestSubmit()}readHostTabIndex(){this.hostTabIndex=this.getAttribute(`tabindex`)}applyOverrides(){for(let e of Object.keys(J)){let t=this.overrides?.[e],n=J[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,l(t))}}}];shadowRootOptions={...h.shadowRootOptions,delegatesFocus:!0};styles=t`
    /*
     * One hook per binding, locked ones included: locked closes the overrides
     * API, not the CSS escape hatch, so every rule reads a --ds-button-* hook.
     * background, backgroundHover and foreground are set per variant below.
     */
    :host {
      display: inline-flex;
      vertical-align: middle;
      --ds-button-background: var(--color-action-primary-background);
      --ds-button-background-hover: var(--color-action-primary-background-hover);
      --ds-button-foreground: var(--color-action-primary-foreground);
      --ds-button-focus-ring: var(--color-border-focus);
      --ds-button-focus-ring-width: var(--border-width-focus);
      --ds-button-focus-ring-offset: var(--border-width-focus);
      --ds-button-inverse-foreground: var(--color-inverse-link);
      --ds-button-inverse-focus-ring: var(--color-inverse-focus);
      --ds-button-min-target: var(--size-target-min);
      /* touchTarget is an rn/swiftui binding: declared for the hook contract, read by no Lit rule */
      --ds-button-touch-target: var(--size-target-comfortable);
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
      min-inline-size: var(--ds-button-min-target);
      min-block-size: var(--ds-button-min-target);
      margin: 0;
      padding-block: var(--ds-button-padding-block);
      padding-inline: var(--ds-button-padding-inline);
      border: 0;
      border-radius: var(--ds-button-radius);
      font-family: var(--ds-button-font-family);
      font-size: var(--ds-button-font-size);
      font-weight: var(--ds-button-font-weight);
      color: var(--ds-button-foreground);
      background: var(--ds-button-background);
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

    /* background / backgroundHover / foreground: color.action.{variant}.*, locked; hooks set per variant */
    :host([variant='primary']) {
      --ds-button-background: var(--color-action-primary-background);
      --ds-button-background-hover: var(--color-action-primary-background-hover);
      --ds-button-foreground: var(--color-action-primary-foreground);
    }
    :host([variant='secondary']) {
      --ds-button-background: var(--color-action-secondary-background);
      --ds-button-background-hover: var(--color-action-secondary-background-hover);
      --ds-button-foreground: var(--color-action-secondary-foreground);
    }
    :host([variant='ghost']) {
      --ds-button-background: var(--color-action-ghost-background);
      --ds-button-background-hover: var(--color-action-ghost-background-hover);
      --ds-button-foreground: var(--color-action-ghost-foreground);
    }
    :host([variant='danger']) {
      --ds-button-background: var(--color-action-danger-background);
      --ds-button-background-hover: var(--color-action-danger-background-hover);
      --ds-button-foreground: var(--color-action-danger-foreground);
    }

    /*
     * backgroundHover on pointer hover and pressed. Suppressed by selector while
     * the button is not accepting a press -- :not([aria-disabled='true']):not([aria-busy='true']),
     * the same suppression web writes, read off the inner button's own state attributes.
     */
    [data-part='container']:not([aria-disabled='true']):not([aria-busy='true']):is(:hover, :active) {
      background: var(--ds-button-background-hover);
    }

    /*
     * inverse: only ghost changes on an inverse surface. Its text is
     * inverseForeground, and its hover fill is inverseBackgroundHover at
     * inverseHoverOpacity (the sanctioned color-mix of tokens). Other variants
     * keep their own fills.
     */
    :host([inverse][variant='ghost']) [data-part='container'] {
      color: var(--ds-button-inverse-foreground);
    }
    :host([inverse][variant='ghost'])
      [data-part='container']:not([aria-disabled='true']):not([aria-busy='true']):is(:hover, :active) {
      background: color-mix(
        in srgb,
        var(--ds-button-inverse-background-hover) calc(var(--ds-button-inverse-hover-opacity) * 0.25 * 100%),
        transparent
      );
    }

    /*
     * focusRing / focusRingWidth / focusRingOffset: color.border.focus at
     * border.width.focus, offset by the same token so the ring clears the fill; locked
     */
    [data-part='container']:focus-visible {
      outline: var(--ds-button-focus-ring-width) solid var(--ds-button-focus-ring);
      outline-offset: var(--ds-button-focus-ring-offset);
    }

    /* inverseFocusRing: the ring must read against the inverse surface, for every variant */
    :host([inverse]) [data-part='container']:focus-visible {
      outline-color: var(--ds-button-inverse-focus-ring);
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
      /* the block-start quarter, so the turn reads as starting from twelve o'clock */
      border-block-start-color: transparent;
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
  `;constructor(){super(X),_()}}})))()}export{Z as t};