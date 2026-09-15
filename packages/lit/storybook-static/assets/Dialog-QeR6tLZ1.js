import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{C as t,a as n,c as r,d as ee,f as te,h as i,p as a,r as o,s,t as ne,u as re,y as c}from"./decorators-BlUBDG4K.js";import{t as l}from"./query-BHY-nhsh.js";import{a as u,i as d,r as f,t as p}from"./if-defined-BfpvQ5_i.js";import{t as m}from"./Icon-CGupucWg.js";import{n as h,t as ie}from"./class-map-ByT5L8jj.js";import{t as ae}from"./Button-TSn-G4Vm.js";import{t as oe}from"./Heading-zy-G4KpZ.js";import{t as se}from"./Text-Dgpz9DWN.js";import{t as ce}from"./Stack-CZSvFm0E.js";import{t as g}from"./Box-CZm3aDsl.js";import{t as _}from"./FocusScope-AtfqVa8B.js";function v(e){return e instanceof HTMLElement&&e.matches(X)?e:e.querySelector(X)}function y(){Z+=1,Z===1&&(document.documentElement.style.overflow=`hidden`)}function b(){Z=Math.max(0,Z-1),Z===0&&document.documentElement.style.removeProperty(`overflow`)}function x(){let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e}var S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{ee(),te(),ne(),ie(),p(),u(),oe(),se(),ae(),m(),g(),ce(),_(),q={scrim:`--ds-dialog-scrim`,border:`--ds-dialog-border`,borderWidth:`--ds-dialog-border-width`,shadow:`--ds-dialog-shadow`,radius:`--ds-dialog-radius`,inset:`--ds-dialog-inset`,partGap:`--ds-dialog-part-gap`,headerGap:`--ds-dialog-header-gap`,footerGap:`--ds-dialog-footer-gap`,descriptionGap:`--ds-dialog-description-gap`,widthSm:`--ds-dialog-width-sm`,layer:`--ds-dialog-layer`,enter:`--ds-dialog-enter`,exit:`--ds-dialog-exit`},J=`Close`,Y={fromAttribute(e){return e===null},toAttribute(e){return e?null:``}},X=[`a[href]`,`button:not([disabled])`,`input:not([disabled])`,`select:not([disabled])`,`textarea:not([disabled])`,`[tabindex]:not([tabindex="-1"])`,`ds-button`,`ds-link`,`ds-input`,`ds-checkbox`,`ds-switch`,`ds-radio-group`,`ds-disclosure`].join(`,`),Z=0,new class extends r{static[class extends a{static{({e:[C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K],c:[Q,S]}=re(this,[s(`ds-dialog`)],[[n({type:Boolean,reflect:!0}),1,`open`],[n(),1,`heading`],[n(),1,`description`],[n({type:Boolean,attribute:`hide-heading`}),1,`hideHeading`],[n({reflect:!0}),1,`size`],[n({attribute:`no-dismiss`,reflect:!0,converter:Y}),1,`dismissible`],[n({attribute:`initial-focus`,reflect:!0}),1,`initialFocus`],[n({attribute:!1}),1,`overrides`],[l(`dialog`),1,`dialogEl`],[l(`#heading`),1,`headingEl`],[l(`.close`),1,`closeButtonEl`],[o(),1,`closing`]],0,void 0,a))}#e=C(this,!1);get open(){return this.#e}set open(e){this.#e=e}#t=(w(this),T(this));get heading(){return this.#t}set heading(e){this.#t=e}#n=(E(this),D(this));get description(){return this.#n}set description(e){this.#n=e}#r=(O(this),k(this,!1));get hideHeading(){return this.#r}set hideHeading(e){this.#r=e}#i=(A(this),j(this,`md`));get size(){return this.#i}set size(e){this.#i=e}#a=(M(this),N(this,!0));get dismissible(){return this.#a}set dismissible(e){this.#a=e}#o=(P(this),F(this,`first`));get initialFocus(){return this.#o}set initialFocus(e){this.#o=e}#s=(I(this),L(this));get overrides(){return this.#s}set overrides(e){this.#s=e}#c=(R(this),z(this));get dialogEl(){return this.#c}set dialogEl(e){this.#c=e}#l=(B(this),V(this));get headingEl(){return this.#l}set headingEl(e){this.#l=e}#u=(H(this),U(this));get closeButtonEl(){return this.#u}set closeButtonEl(e){this.#u=e}#d=(W(this),G(this,!1));get closing(){return this.#d}set closing(e){this.#d=e}openerElement=(K(this),null);closingProgrammatically=!1;suppressCloseSync=!1;connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Dialog`)}disconnectedCallback(){super.disconnectedCallback(),this.dialogEl?.open&&b()}willUpdate(e){e.has(`overrides`)&&this.applyOverrides()}updated(e){e.has(`open`)&&(this.open?this.handleOpen():e.get(`open`)&&(this.suppressCloseSync?this.suppressCloseSync=!1:this.playExit())),this.warnInDev()}render(){let e=!!this.description,t=this.querySelector(`[slot="footer"]`)!==null,n=h({"heading--hidden":this.hideHeading});return c`
      <dialog
        aria-modal="true"
        aria-labelledby="heading"
        aria-describedby=${f(e?`description`:void 0)}
        @cancel=${this.handleCancel}
        @close=${this.handleNativeClose}
        @click=${this.handleDialogClick}
      >
        <div class="surface${this.closing?` closing`:``}" part="surface">
          <ds-focus-scope
            trapped
            ?active=${this.open}
            auto-focus="none"
            ?restore-focus=${!1}
            style="display: flex; flex-direction: column; gap: var(--ds-dialog-part-gap)"
          >
            <div class="header" part="header">
              <div class="titles">
                <ds-heading id="heading" part="title" level="2" size="lg" tabindex="-1" class=${n}
                  >${this.heading}</ds-heading
                >
                ${e?c`<ds-text id="description" part="description" size="sm" tone="muted"
                      >${this.description}</ds-text
                    >`:i}
              </div>
              ${this.dismissible?c`
                    <ds-button
                      class="close"
                      part="close-button"
                      variant="ghost"
                      size="sm"
                      icon-only
                      label=${J}
                      @press=${this.handleCloseButtonPress}
                    >
                      <ds-icon slot="leading-icon" name="close"></ds-icon>
                    </ds-button>
                  `:i}
            </div>
            <ds-box class="body" part="body" style="overflow-y: auto; min-block-size: 0">
              <slot></slot>
            </ds-box>
            ${t?c`
                  <ds-stack
                    part="footer"
                    direction="horizontal"
                    style="gap: var(--ds-dialog-footer-gap)"
                  >
                    <slot name="footer"></slot>
                  </ds-stack>
                `:i}
          </ds-focus-scope>
        </div>
      </dialog>
    `}handleCancel=e=>{e.preventDefault(),this.dispatchClose(`escape`)};handleDialogClick=e=>{this.dismissible&&e.target===this.dialogEl&&this.dispatchClose(`scrim`)};handleCloseButtonPress=e=>{e.stopPropagation(),this.dispatchClose(`close-button`)};handleNativeClose=()=>{if(this.closingProgrammatically){this.closingProgrammatically=!1;return}b(),this.restoreFocus(),this.suppressCloseSync=!0,this.open=!1,this.dispatchClose(`action`)};handleOpen(){this.closing=!1,this.openerElement=x(),y(),this.dialogEl.showModal(),this.applyInitialFocus(),this.scheduleOpened()}playExit(){let e=matchMedia(`(prefers-reduced-motion: reduce)`).matches,t=()=>{this.closingProgrammatically=!0,this.dialogEl.close(),b(),this.restoreFocus(),this.closing=!1};if(e){t();return}this.closing=!0;let n=this.renderRoot.querySelector(`.surface`);if(!n){t();return}let r=e=>{e.target===n&&e.propertyName===`opacity`&&(n.removeEventListener(`transitionend`,r),t())};n.addEventListener(`transitionend`,r)}applyInitialFocus(){let e;e=this.initialFocus===`close`?this.closeButtonEl??this.findFirstBodyFocusable()??this.headingEl:this.initialFocus===`title`?this.headingEl:this.findFirstBodyFocusable()??this.closeButtonEl??this.headingEl,e?.focus()}findFirstBodyFocusable(){let e=this.renderRoot.querySelector(`slot:not([name])`);if(!e)return null;for(let t of e.assignedElements({flatten:!0})){let e=v(t);if(e)return e}return null}restoreFocus(){let e=this.openerElement;this.openerElement=null,e instanceof HTMLElement&&e.isConnected&&e.focus()}scheduleOpened(){let e=()=>{this.dispatchEvent(new CustomEvent(`opened`,{bubbles:!0,composed:!0}))};if(matchMedia(`(prefers-reduced-motion: reduce)`).matches){e();return}let t=this.renderRoot.querySelector(`.surface`);if(!t){e();return}let n=r=>{r.target===t&&r.propertyName===`opacity`&&(t.removeEventListener(`transitionend`,n),e())};t.addEventListener(`transitionend`,n)}dispatchClose(e){this.dispatchEvent(new CustomEvent(`close`,{detail:{reason:e},bubbles:!0,composed:!0}))}applyOverrides(){for(let e of Object.keys(q)){let t=this.overrides?.[e],n=q[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,d(t))}}warnInDev(){}}];shadowRootOptions={...a.shadowRootOptions,delegatesFocus:!0};styles=t`
    :host {
      display: block;
      --ds-dialog-scrim: var(--color-overlay-scrim);
      --ds-dialog-border: var(--color-border);
      --ds-dialog-border-width: var(--border-width-thin);
      --ds-dialog-shadow: var(--shadow-overlay);
      --ds-dialog-radius: var(--radius-lg);
      --ds-dialog-inset: var(--layout-inset-lg);
      --ds-dialog-part-gap: var(--layout-gap-loose);
      --ds-dialog-header-gap: var(--layout-gap-normal);
      --ds-dialog-footer-gap: var(--layout-gap-tight);
      --ds-dialog-description-gap: var(--layout-gap-tight);
      --ds-dialog-width-sm: var(--layout-max-width-prose);
      --ds-dialog-max-width: calc(var(--layout-max-width-content) * 0.75);
      --ds-dialog-layer: var(--layer-dialog);
      --ds-dialog-enter: var(--motion-duration-base);
      --ds-dialog-exit: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    /* widthSm / md (3/4 content) / lg (content): layout.maxWidth.{prose,content} derived, not new tokens */
    :host([size='sm']) {
      --ds-dialog-max-width: var(--ds-dialog-width-sm);
    }
    :host([size='md']) {
      --ds-dialog-max-width: calc(var(--layout-max-width-content) * 0.75);
    }
    :host([size='lg']) {
      --ds-dialog-max-width: var(--layout-max-width-content);
    }

    dialog {
      box-sizing: border-box;
      padding: 0;
      border: 0;
      background: transparent;
      color: inherit;
      inline-size: 100%;
      max-inline-size: min(var(--ds-dialog-max-width), calc(100vw - 2 * var(--layout-gutter)));
      max-block-size: calc(100vh - 2 * var(--layout-gutter));
      z-index: var(--ds-dialog-layer);
    }

    /* scrim: color.overlay.scrim */
    dialog::backdrop {
      background: var(--ds-dialog-scrim);
      transition: opacity var(--ds-dialog-enter) var(--motion-easing-standard);
    }

    @starting-style {
      dialog[open]::backdrop {
        opacity: 0;
      }
    }

    .surface {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      max-block-size: calc(100vh - 2 * var(--layout-gutter));
      padding: var(--ds-dialog-inset);
      font-family: var(--font-family-body);
      /* surface: color.overlay.surface, locked — no override hook */
      background: var(--color-overlay-surface);
      border-style: solid;
      border-width: var(--ds-dialog-border-width);
      border-color: var(--ds-dialog-border);
      border-radius: var(--ds-dialog-radius);
      box-shadow: var(--ds-dialog-shadow);
      opacity: 1;
      transform: translateY(0);
      transition:
        opacity var(--ds-dialog-enter) var(--motion-easing-standard),
        transform var(--ds-dialog-enter) var(--motion-easing-standard);
    }

    /* exit: motion.duration.fast with motion.easing.exit */
    .surface.closing {
      opacity: 0;
      transform: translateY(var(--space-2));
      transition-duration: var(--ds-dialog-exit);
      transition-timing-function: var(--motion-easing-exit);
    }

    @starting-style {
      dialog[open] .surface {
        opacity: 0;
        transform: translateY(var(--space-2));
      }
    }

    @media (prefers-reduced-motion: reduce) {
      dialog::backdrop,
      .surface {
        transition: none;
      }
    }

    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--ds-dialog-header-gap);
    }

    .titles {
      display: flex;
      flex-direction: column;
      gap: var(--ds-dialog-description-gap);
      min-inline-size: 0;
    }

    .close {
      flex: none;
    }

    #heading:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
      border-radius: var(--radius-sm);
    }

    /* hideHeading: kept for the accessible name, removed from the visual layout. */
    .heading--hidden {
      /* literal-ok: standard visually-hidden clip pattern, exempt from token-only rule */
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    .body {
      min-block-size: 0;
      overflow-y: auto;
    }
  `;constructor(){super(Q),S()}}})))()}export{$ as t};