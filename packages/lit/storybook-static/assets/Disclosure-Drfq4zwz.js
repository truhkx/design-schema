import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{C as t,a as n,c as r,d as i,f as a,h as o,p as s,r as c,s as l,t as u,u as d}from"./decorators-BlUBDG4K.js";import{t as f}from"./query-BHY-nhsh.js";import{a as p,i as m,r as h,t as g}from"./if-defined-BfpvQ5_i.js";import{i as _,n as v,t as y}from"./static-html-BoBPE1hr.js";import{t as b}from"./Icon-CGupucWg.js";function x(e){return typeof e==`string`&&Object.prototype.hasOwnProperty.call(H,e)}var S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U;function W(){return(W=e((()=>{i(),a(),u(),g(),y(),p(),b(),V={triggerPaddingBlock:`--ds-disclosure-trigger-padding-block`,triggerPaddingInline:`--ds-disclosure-trigger-padding-inline`,triggerGap:`--ds-disclosure-trigger-gap`,triggerFontFamily:`--ds-disclosure-trigger-font-family`,triggerFontSize:`--ds-disclosure-trigger-font-size`,triggerFontWeight:`--ds-disclosure-trigger-font-weight`,triggerRadius:`--ds-disclosure-trigger-radius`,panelPaddingBlock:`--ds-disclosure-panel-padding-block`,panelPaddingInline:`--ds-disclosure-panel-padding-inline`,disabledOpacity:`--ds-disclosure-disabled-opacity`,transition:`--ds-disclosure-transition`},H={2:v`h2`,3:v`h3`,4:v`h4`,5:v`h5`,6:v`h6`},new class extends r{static[class extends s{static{({e:[C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B],c:[U,S]}=d(this,[l(`ds-disclosure`)],[[n(),1,`summary`],[n({type:Boolean,reflect:!0}),1,`open`],[n({type:Boolean,attribute:`default-open`}),1,`defaultOpen`],[n({type:Boolean,reflect:!0}),1,`disabled`],[n({type:Boolean,reflect:!0,attribute:`keep-mounted`}),1,`keepMounted`],[n({attribute:`heading-level`}),1,`headingLevel`],[n({attribute:!1}),1,`overrides`],[c(),1,`internalOpen`],[f(`#trigger`),1,`triggerEl`]],0,void 0,s))}constructor(...e){super(...e),B(this)}#e=C(this,``);get summary(){return this.#e}set summary(e){this.#e=e}#t=(w(this),T(this));get open(){return this.#t}set open(e){this.#t=e}#n=(E(this),D(this,!1));get defaultOpen(){return this.#n}set defaultOpen(e){this.#n=e}#r=(O(this),k(this,!1));get disabled(){return this.#r}set disabled(e){this.#r=e}#i=(A(this),j(this,!1));get keepMounted(){return this.#i}set keepMounted(e){this.#i=e}#a=(M(this),N(this));get headingLevel(){return this.#a}set headingLevel(e){this.#a=e}#o=(P(this),F(this));get overrides(){return this.#o}set overrides(e){this.#o=e}#s=(I(this),L(this,!1));get internalOpen(){return this.#s}set internalOpen(e){this.#s=e}#c=(R(this),z(this));get triggerEl(){return this.#c}set triggerEl(e){this.#c=e}get currentOpen(){return this.open??this.internalOpen}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Disclosure`)}willUpdate(e){this.hasUpdated||(this.internalOpen=this.defaultOpen),e.has(`overrides`)&&this.applyOverrides(),this.hasUpdated&&(e.has(`open`)||e.has(`internalOpen`))&&!this.currentOpen&&this.moveFocusOutOfPanel()}render(){let e=this.currentOpen,t=e||this.keepMounted,n=_`
      <button
        id="trigger"
        class="trigger"
        part="trigger"
        type="button"
        aria-expanded=${e?`true`:`false`}
        aria-controls=${h(t?`panel`:void 0)}
        aria-disabled=${h(this.disabled?`true`:void 0)}
        @click=${this.handleClick}
      >
        <ds-icon class="icon" part="trigger-icon" name="chevron-right" inline></ds-icon>
        <span class="summary">${this.summary}</span>
      </button>
    `,r=this.headingLevel,i=x(r)?_`<${H[r]} class="heading">${n}</${H[r]}>`:n;return _`
      ${i}
      ${t?_`<div id="panel" class="panel" part="panel" ?hidden=${!e}><slot></slot></div>`:o}
    `}handleClick(e){if(this.disabled){e.preventDefault(),e.stopPropagation();return}let t=!this.currentOpen;this.open===void 0?this.internalOpen=t:this.open=t,this.dispatchEvent(new CustomEvent(`toggle`,{detail:{open:t},bubbles:!0,composed:!0}))}moveFocusOutOfPanel(){let e=document.activeElement;e!==null&&e!==this&&this.contains(e)&&this.triggerEl.focus()}applyOverrides(){for(let e of Object.keys(V)){let t=this.overrides?.[e],n=V[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,m(t))}}}];shadowRootOptions={...s.shadowRootOptions,delegatesFocus:!0};styles=t`
    :host {
      display: block;
      --ds-disclosure-trigger-padding-block: var(--space-sm);
      --ds-disclosure-trigger-padding-inline: var(--space-sm);
      --ds-disclosure-trigger-gap: var(--space-2);
      --ds-disclosure-trigger-font-family: var(--font-family-body);
      --ds-disclosure-trigger-font-size: var(--font-size-md);
      --ds-disclosure-trigger-font-weight: var(--font-weight-medium);
      --ds-disclosure-trigger-radius: var(--radius-md);
      --ds-disclosure-panel-padding-block: var(--space-sm);
      --ds-disclosure-panel-padding-inline: var(--space-sm);
      --ds-disclosure-disabled-opacity: var(--opacity-disabled);
      --ds-disclosure-transition: var(--motion-duration-base);
      font-family: var(--ds-disclosure-trigger-font-family);
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

    .trigger {
      box-sizing: border-box;
      display: inline-flex;
      align-items: center;
      gap: var(--ds-disclosure-trigger-gap);
      min-inline-size: var(--size-target-min);
      min-block-size: var(--size-target-min);
      margin: 0;
      padding-block: var(--ds-disclosure-trigger-padding-block);
      padding-inline: var(--ds-disclosure-trigger-padding-inline);
      border: 0;
      border-radius: var(--ds-disclosure-trigger-radius);
      font-family: var(--ds-disclosure-trigger-font-family);
      font-size: var(--ds-disclosure-trigger-font-size);
      font-weight: var(--ds-disclosure-trigger-font-weight);
      line-height: var(--font-line-height-normal);
      text-align: start;
      color: var(--color-foreground);
      background: transparent;
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      transition: background-color var(--motion-duration-fast) var(--motion-easing-standard);
    }

    /* triggerBackgroundHover: pointer hover and pressed state */
    :host(:not([disabled])) .trigger:is(:hover, :active) {
      background: var(--color-background-subtle);
    }

    .trigger:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    :host([disabled]) .trigger {
      opacity: var(--ds-disclosure-disabled-opacity);
      cursor: not-allowed;
    }

    /* icon: a chevron, 1em, pointing right when closed and down when open */
    .icon {
      flex: none;
      color: var(--color-foreground-muted);
      transition: transform var(--ds-disclosure-transition) var(--motion-easing-standard);
    }
    :host([open]) .icon {
      transform: rotate(90deg);
    }
    :host(:dir(rtl)) .icon {
      transform: rotate(180deg);
    }
    :host(:dir(rtl)[open]) .icon {
      transform: rotate(90deg);
    }

    @media (prefers-reduced-motion: reduce) {
      .trigger,
      .icon {
        transition: none;
      }
    }

    .panel {
      padding-block: var(--ds-disclosure-panel-padding-block);
      padding-inline: var(--ds-disclosure-panel-padding-inline);
      color: var(--color-foreground);
    }
    .panel[hidden] {
      display: none;
    }
  `;constructor(){super(U),S()}}})))()}export{W as t};