import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{O as t,_ as n,a as r,b as i,c as a,f as o,g as s,h as c,i as l,o as u,p as d,r as f,t as p,u as m,v as h}from"./if-defined-CARySXJh.js";import{t as g}from"./query-BHY-nhsh.js";import{i as _,n as v,t as y}from"./static-html-C_poBzD8.js";import{t as b}from"./Icon-eWCe5jE3.js";function x(e){return typeof e==`string`&&Object.prototype.hasOwnProperty.call(W,e)}var S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G;function K(){return(K=e((()=>{s(),n(),u(),p(),y(),r(),b(),U={triggerPaddingBlock:`--ds-disclosure-trigger-padding-block`,triggerPaddingInline:`--ds-disclosure-trigger-padding-inline`,triggerGap:`--ds-disclosure-trigger-gap`,triggerFontFamily:`--ds-disclosure-trigger-font-family`,triggerFontSize:`--ds-disclosure-trigger-font-size`,triggerFontWeight:`--ds-disclosure-trigger-font-weight`,triggerLineHeight:`--ds-disclosure-trigger-line-height`,triggerRadius:`--ds-disclosure-trigger-radius`,panelPaddingBlock:`--ds-disclosure-panel-padding-block`,panelPaddingInline:`--ds-disclosure-panel-padding-inline`,disabledOpacity:`--ds-disclosure-disabled-opacity`,transition:`--ds-disclosure-transition`},W={2:v`h2`,3:v`h3`,4:v`h4`,5:v`h5`,6:v`h6`},new class extends d{static[class extends h{static{({e:[C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H],c:[G,S]}=c(this,[o(`ds-disclosure`)],[[m(),1,`summary`],[m({type:Boolean,reflect:!0}),1,`open`],[m({type:Boolean,attribute:`default-open`}),1,`defaultOpen`],[m({type:Boolean,reflect:!0}),1,`disabled`],[m({type:Boolean,reflect:!0,attribute:`keep-mounted`}),1,`keepMounted`],[m({type:Boolean,reflect:!0,attribute:`full-width`}),1,`fullWidth`],[m({attribute:`heading-level`}),1,`headingLevel`],[m({attribute:!1}),1,`overrides`],[a(),1,`internalOpen`],[g(`[data-part=trigger]`),1,`triggerEl`]],0,void 0,h))}#e=C(this,``);get summary(){return this.#e}set summary(e){this.#e=e}#t=(w(this),T(this));get open(){return this.#t}set open(e){this.#t=e}#n=(E(this),D(this,!1));get defaultOpen(){return this.#n}set defaultOpen(e){this.#n=e}#r=(O(this),k(this,!1));get disabled(){return this.#r}set disabled(e){this.#r=e}#i=(A(this),j(this,!1));get keepMounted(){return this.#i}set keepMounted(e){this.#i=e}#a=(M(this),N(this,!1));get fullWidth(){return this.#a}set fullWidth(e){this.#a=e}#o=(P(this),F(this));get headingLevel(){return this.#o}set headingLevel(e){this.#o=e}#s=(I(this),L(this));get overrides(){return this.#s}set overrides(e){this.#s=e}#c=(R(this),z(this,!1));get internalOpen(){return this.#c}set internalOpen(e){this.#c=e}#l=(B(this),V(this));get triggerEl(){return this.#l}set triggerEl(e){this.#l=e}renderedOpen=void H(this);requestedOpen;focusWithinPanel=!1;restoreFocusPending=!1;get currentOpen(){return this.open??this.internalOpen}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Disclosure`)}willUpdate(e){this.hasUpdated||(this.internalOpen=this.defaultOpen),e.has(`overrides`)&&this.applyOverrides(),this.hasUpdated&&this.renderedOpen===!0&&!this.currentOpen&&this.focusWithinPanel&&(this.focusWithinPanel=!1,this.restoreFocusPending=!0)}render(){let e=this.currentOpen,t=e||this.keepMounted,n=_`
      <button
        data-part="trigger"
        part="trigger"
        type="button"
        aria-expanded=${e?`true`:`false`}
        aria-controls=${f(t?`panel`:void 0)}
        aria-disabled=${f(this.disabled?`true`:void 0)}
        @click=${this.handleClick}
      >
        <span data-part="triggerIcon" part="triggerIcon"
          ><ds-icon name="chevron-right" inline></ds-icon
        ></span>
        <span>${this.summary}</span>
      </button>
    `,r=this.headingLevel,a=x(r)?_`<${W[r]} class="heading">${n}</${W[r]}>`:n;return _`
      ${a}
      ${t?_`<div
            id="panel"
            data-part="panel"
            part="panel"
            ?hidden=${!e}
            @focusin=${this.handlePanelFocusIn}
            @focusout=${this.handlePanelFocusOut}
          ><slot></slot></div>`:i}
    `}updated(e){let t=this.currentOpen,n=this.renderedOpen;if(this.renderedOpen=t,this.restoreFocusPending&&(this.restoreFocusPending=!1,this.restoreFocus()),!e.has(`open`)&&!e.has(`internalOpen`))return;let r=this.requestedOpen;this.requestedOpen=void 0,n!==void 0&&n!==t&&e.has(`open`)&&r!==t&&this.dispatchToggle(t,`controlled`)}handleClick(e){if(this.disabled){e.preventDefault();return}let t=!this.currentOpen,n=e.detail===0?`keyboard`:`pointer`;this.open===void 0?this.internalOpen=t:this.requestedOpen=t,this.dispatchToggle(t,n)}dispatchToggle(e,t){this.dispatchEvent(new CustomEvent(`toggle`,{detail:{open:e,reason:t},bubbles:!0,composed:!0}))}handlePanelFocusIn(){this.focusWithinPanel=!0}handlePanelFocusOut(e){let t=e.relatedTarget;t instanceof Node&&(t===this||!this.contains(t))&&(this.focusWithinPanel=!1)}restoreFocus(){let e=document.activeElement;(e===null||e===document.body||e!==this&&this.contains(e))&&this.triggerEl?.focus()}applyOverrides(){for(let e of Object.keys(U)){let t=this.overrides?.[e],n=U[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,l(t))}}}];shadowRootOptions={...h.shadowRootOptions,delegatesFocus:!0};styles=t`
    :host {
      display: block;
      --ds-disclosure-trigger-padding-block: var(--space-sm);
      --ds-disclosure-trigger-padding-inline: var(--space-sm);
      --ds-disclosure-trigger-gap: var(--space-2);
      --ds-disclosure-trigger-font-family: var(--font-family-body);
      --ds-disclosure-trigger-font-size: var(--font-size-md);
      --ds-disclosure-trigger-font-weight: var(--font-weight-medium);
      --ds-disclosure-trigger-line-height: var(--font-line-height-normal);
      --ds-disclosure-trigger-radius: var(--radius-md);
      --ds-disclosure-panel-padding-block: var(--space-sm);
      --ds-disclosure-panel-padding-inline: var(--space-sm);
      --ds-disclosure-disabled-opacity: var(--opacity-disabled);
      --ds-disclosure-transition: var(--motion-duration-base);
      /* Locked: no overrides entry, but the hook stays themeable from page CSS. */
      --ds-disclosure-trigger-color: var(--color-foreground);
      --ds-disclosure-trigger-background-hover: var(--color-background-subtle);
      --ds-disclosure-icon: var(--color-foreground-muted);
      --ds-disclosure-panel-color: var(--color-foreground);
      --ds-disclosure-focus-ring: var(--color-border-focus);
      --ds-disclosure-focus-ring-width: var(--border-width-focus);
      --ds-disclosure-min-target: var(--size-target-min);
    }

    :host([hidden]) {
      display: none;
    }

    /* The heading has no styling of its own — the button carries it. */
    .heading {
      margin: 0;
      padding: 0;
      font: inherit;
    }

    [data-part='trigger'] {
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      gap: var(--ds-disclosure-trigger-gap);
      min-inline-size: var(--ds-disclosure-min-target);
      min-block-size: var(--ds-disclosure-min-target);
      margin: 0;
      padding-block: var(--ds-disclosure-trigger-padding-block);
      padding-inline: var(--ds-disclosure-trigger-padding-inline);
      border: 0;
      border-radius: var(--ds-disclosure-trigger-radius);
      font-family: var(--ds-disclosure-trigger-font-family);
      font-size: var(--ds-disclosure-trigger-font-size);
      font-weight: var(--ds-disclosure-trigger-font-weight);
      line-height: var(--ds-disclosure-trigger-line-height);
      text-align: start;
      color: var(--ds-disclosure-trigger-color);
      /* At rest the trigger has no fill; no token expresses its absence. */
      background: transparent;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
    }

    /* fullWidth: the whole row is the hit area; icon and summary stay at the start. */
    :host([full-width]) [data-part='trigger'] {
      display: flex;
      inline-size: 100%;
    }

    /* triggerBackgroundHover: pointer hover and pressed state, instant, suppressed while disabled */
    :host(:not([disabled])) [data-part='trigger']:is(:hover, :active) {
      background: var(--ds-disclosure-trigger-background-hover);
    }

    [data-part='trigger']:focus-visible {
      outline: var(--ds-disclosure-focus-ring-width) solid var(--ds-disclosure-focus-ring);
      outline-offset: var(--ds-disclosure-focus-ring-width);
    }

    :host([disabled]) [data-part='trigger'] {
      opacity: var(--ds-disclosure-disabled-opacity);
      cursor: not-allowed;
    }

    /* icon: the wrapper the Disclosure owns carries the colour and the rotation; the composed
       <ds-icon inline> is never restyled and tracks the trigger's font size through 1em. */
    [data-part='triggerIcon'] {
      display: inline-flex;
      flex: none;
      color: var(--ds-disclosure-icon);
      transition: transform var(--ds-disclosure-transition) var(--motion-easing-standard);
    }
    [aria-expanded='true'] [data-part='triggerIcon'] {
      transform: rotate(90deg);
    }
    :host(:dir(rtl)) [data-part='triggerIcon'] {
      transform: scaleX(-1);
    }
    :host(:dir(rtl)) [aria-expanded='true'] [data-part='triggerIcon'] {
      transform: scaleX(-1) rotate(90deg);
    }

    @media (prefers-reduced-motion: reduce) {
      [data-part='triggerIcon'] {
        transition: none;
      }
    }

    [data-part='panel'] {
      padding-block: var(--ds-disclosure-panel-padding-block);
      padding-inline: var(--ds-disclosure-panel-padding-inline);
      color: var(--ds-disclosure-panel-color);
    }
    [data-part='panel'][hidden] {
      display: none;
    }
  `;constructor(){super(G),S()}}})))()}export{K as t};