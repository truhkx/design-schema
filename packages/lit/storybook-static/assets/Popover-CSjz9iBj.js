import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{C as t,a as n,c as r,d as i,f as a,h as o,p as s,r as c,s as l,t as u,u as d,y as f}from"./decorators-BlUBDG4K.js";import{t as p}from"./query-BHY-nhsh.js";import{a as m,i as h,r as ee,t as te}from"./if-defined-BfpvQ5_i.js";import{t as ne}from"./Icon-CGupucWg.js";import{n as re,t as ie}from"./class-map-ByT5L8jj.js";import{t as ae}from"./Button-TSn-G4Vm.js";import{t as oe}from"./Heading-zy-G4KpZ.js";import{t as se}from"./Box-CZm3aDsl.js";import{t as ce}from"./FocusScope-AtfqVa8B.js";function le(e){let t=[];return e.matches(X)&&t.push(e),t.push(...Array.from(e.querySelectorAll(X))),t}function ue(e){return e.matches(X)?e:e.querySelector(X)}function de(){let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e}function fe(e){switch(e){case`bottom-start`:return{side:`bottom`,align:`start`};case`bottom`:return{side:`bottom`,align:`center`};case`bottom-end`:return{side:`bottom`,align:`end`};case`top-start`:return{side:`top`,align:`start`};case`top`:return{side:`top`,align:`center`};case`top-end`:return{side:`top`,align:`end`};case`start`:return{side:`start`,align:`center`};default:return{side:`end`,align:`center`}}}function pe(){Z+=1,Z===1&&(document.documentElement.style.overflow=`hidden`)}function g(){Z=Math.max(0,Z-1),Z===0&&document.documentElement.style.removeProperty(`overflow`)}var _,v,y,b,x,S,C,w,T,E,D,O,k,me,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,he,ge,X,Z,_e,Q;function $(){return($=e((()=>{i(),a(),u(),te(),ie(),m(),ce(),oe(),se(),ae(),ne(),Y={border:`--ds-popover-border`,borderWidth:`--ds-popover-border-width`,shadow:`--ds-popover-shadow`,radius:`--ds-popover-radius`,inset:`--ds-popover-inset`,partGap:`--ds-popover-part-gap`,offset:`--ds-popover-offset`,arrowSize:`--ds-popover-arrow-size`,maxWidth:`--ds-popover-max-width`,layer:`--ds-popover-layer`,enter:`--ds-popover-enter`,exit:`--ds-popover-exit`},he=`Close`,ge=typeof HTMLElement<`u`&&typeof HTMLElement.prototype.showPopover==`function`,X=[`a[href]`,`button:not([disabled])`,`input:not([disabled])`,`select:not([disabled])`,`textarea:not([disabled])`,`[tabindex]:not([tabindex="-1"])`,`ds-button`,`ds-link`,`ds-input`,`ds-checkbox`,`ds-switch`,`ds-radio-group`,`ds-disclosure`].join(`,`),Z=0,_e={fromAttribute(e){return e===null},toAttribute(e){return e?null:``}},new class extends r{static[class extends s{static{({e:[v,y,b,x,S,C,w,T,E,D,O,k,me,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J],c:[Q,_]}=d(this,[l(`ds-popover`)],[[n(),1,`heading`],[n({attribute:`heading-level`,reflect:!0}),1,`headingLevel`],[n({type:Boolean,reflect:!0}),1,`open`],[n({reflect:!0}),1,`placement`],[n({type:Boolean,reflect:!0}),1,`modal`],[n({type:Boolean,reflect:!0,attribute:`show-arrow`}),1,`showArrow`],[n({attribute:`no-dismiss`,reflect:!0,converter:_e}),1,`dismissible`],[n({attribute:!1}),1,`overrides`],[c(),1,`internalOpen`],[c(),1,`closing`],[c(),1,`hasBodyContent`],[p(`.panel`),1,`panelEl`],[p(`#heading`),1,`headingEl`],[p(`.close`),1,`closeButtonEl`],[p(`.arrow`),1,`arrowEl`],[c(),1,`triggerAccessibleName`]],0,void 0,s))}#e=v(this);get heading(){return this.#e}set heading(e){this.#e=e}#t=(y(this),b(this,`3`));get headingLevel(){return this.#t}set headingLevel(e){this.#t=e}#n=(x(this),S(this));get open(){return this.#n}set open(e){this.#n=e}#r=(C(this),w(this,`bottom`));get placement(){return this.#r}set placement(e){this.#r=e}#i=(T(this),E(this,!1));get modal(){return this.#i}set modal(e){this.#i=e}#a=(D(this),O(this,!1));get showArrow(){return this.#a}set showArrow(e){this.#a=e}#o=(k(this),me(this,!0));get dismissible(){return this.#o}set dismissible(e){this.#o=e}#s=(A(this),j(this));get overrides(){return this.#s}set overrides(e){this.#s=e}#c=(M(this),N(this,!1));get internalOpen(){return this.#c}set internalOpen(e){this.#c=e}#l=(P(this),F(this,!1));get closing(){return this.#l}set closing(e){this.#l=e}#u=(I(this),L(this,!1));get hasBodyContent(){return this.#u}set hasBodyContent(e){this.#u=e}#d=(R(this),z(this));get panelEl(){return this.#d}set panelEl(e){this.#d=e}#f=(B(this),V(this));get headingEl(){return this.#f}set headingEl(e){this.#f=e}#p=(H(this),U(this));get closeButtonEl(){return this.#p}set closeButtonEl(e){this.#p=e}#m=(W(this),G(this));get arrowEl(){return this.#m}set arrowEl(e){this.#m=e}#h=(K(this),q(this,``));get triggerAccessibleName(){return this.#h}set triggerAccessibleName(e){this.#h=e}popoverSupported=(J(this),ge);triggerEl=null;wasOpen=!1;pendingReason=`trigger`;focusTriggerOnClose=!1;get currentOpen(){return this.open??this.internalOpen}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Popover`)}disconnectedCallback(){super.disconnectedCallback(),this.detachTrigger(),this.removeGlobalListeners(),this.modal&&this.currentOpen&&g()}willUpdate(e){e.has(`overrides`)&&this.applyOverrides()}updated(e){let t=this.currentOpen;t===this.wasOpen?t&&e.has(`placement`)&&this.updatePosition():(this.wasOpen=t,this.updateTriggerExpanded(),t?this.handleOpened():this.handleClosed()),this.warnInDev()}render(){let e=this.currentOpen,t=this.heading||this.triggerAccessibleName||void 0,n=!!this.heading,r=f`
      <ds-focus-scope
        ?trapped=${this.modal}
        ?active=${e}
        auto-focus="none"
        ?restore-focus=${!1}
      >
        <div class=${re({content:!0,"has-close":this.dismissible})}>
          ${n?f`<ds-heading id="heading" part="heading" level=${this.headingLevel} size="md" tabindex="-1">${this.heading}</ds-heading>`:o}
          <ds-box part="body"><slot @slotchange=${this.handleBodySlotChange}></slot></ds-box>
          ${this.dismissible?f`
                <ds-button
                  class="close"
                  part="close-button"
                  variant="ghost"
                  size="sm"
                  icon-only
                  label=${he}
                  @press=${this.handleCloseButtonPress}
                >
                  <ds-icon slot="leading-icon" name="close"></ds-icon>
                </ds-button>
              `:o}
        </div>
      </ds-focus-scope>
      ${this.showArrow?f`<span class="arrow" part="arrow" aria-hidden="true"></span>`:o}
    `;return f`
      <slot name="trigger" @slotchange=${this.handleTriggerSlotChange}></slot>
      ${this.modal?f`
            <dialog
              class="panel${this.closing?` closing`:``}"
              part="panel"
              aria-label=${ee(t)}
              aria-modal="true"
              @cancel=${this.handleDialogCancel}
              @keydown=${this.handlePanelKeydown}
            >
              ${r}
            </dialog>
          `:f`
            <div
              class="panel"
              part="panel"
              role="dialog"
              aria-label=${ee(t)}
              popover=${this.popoverSupported?`manual`:o}
              ?hidden=${!this.popoverSupported&&!e}
              @keydown=${this.handlePanelKeydown}
            >
              ${r}
            </div>
          `}
    `}handleTriggerSlotChange=e=>{let t=e.target.assignedElements({flatten:!0})[0]??null;if(t===this.triggerEl){this.updateTriggerAccessibleName(),this.updateTriggerExpanded();return}this.detachTrigger(),this.triggerEl=t,this.attachTrigger()};attachTrigger(){let e=this.triggerEl;e&&(e.addEventListener(`click`,this.handleTriggerClick),this.updateTriggerAccessibleName(),this.updateTriggerExpanded(),this.warnInDev())}detachTrigger(){let e=this.triggerEl;e&&(e.removeEventListener(`click`,this.handleTriggerClick),e.removeAttribute(`aria-expanded`))}updateTriggerAccessibleName(){let e=this.triggerEl;this.triggerAccessibleName=e?e.getAttribute(`aria-label`)??e.getAttribute(`label`)??e.textContent?.trim()??``:``}updateTriggerExpanded(){this.triggerEl?.setAttribute(`aria-expanded`,this.currentOpen?`true`:`false`)}handleTriggerClick=()=>{this.requestOpenChange(!this.currentOpen,`trigger`,!1)};handleBodySlotChange=e=>{let t=e.target;this.hasBodyContent=t.assignedNodes({flatten:!0}).length>0,this.warnInDev()};handleCloseButtonPress=e=>{e.stopPropagation(),this.requestOpenChange(!1,`close-button`,!0)};handleDialogCancel=e=>{e.preventDefault(),this.requestOpenChange(!1,`escape`,!0)};handlePanelKeydown=e=>{if(e.key===`Escape`){this.modal||(e.preventDefault(),this.requestOpenChange(!1,`escape`,!0));return}if(this.modal||e.key!==`Tab`)return;let t=this.getPanelFocusables();if(t.length===0)return;let n=de(),r=t[0],i=t[t.length-1];e.shiftKey&&n===r?(e.preventDefault(),this.requestOpenChange(!1,`tab-out`,!0)):!e.shiftKey&&n===i&&(this.hidePanelImmediately(),this.requestOpenChange(!1,`tab-out`,!1))};handleOutsidePointerDown=e=>{e.composedPath().includes(this)||this.requestOpenChange(!1,`outside`,!1)};handleReposition=()=>{this.currentOpen&&this.updatePosition()};requestOpenChange(e,t,n){this.pendingReason=t,this.focusTriggerOnClose=n,this.open===void 0?this.internalOpen=e:this.open=e}handleOpened(){this.modal?(this.closing=!1,pe(),this.panelEl.showModal()):(this.addGlobalListeners(),this.popoverSupported&&this.panelEl.showPopover()),this.updatePosition(),this.applyInitialFocus(),this.dispatchOpenChange(!0)}handleClosed(){let e=this.focusTriggerOnClose;this.focusTriggerOnClose=!1,this.modal?this.playModalExit(e):(this.removeGlobalListeners(),this.hidePanelImmediately(),e&&this.triggerEl?.focus()),this.dispatchOpenChange(!1)}playModalExit(e){let t=matchMedia(`(prefers-reduced-motion: reduce)`).matches,n=()=>{this.panelEl.close(),g(),this.closing=!1,e&&this.triggerEl?.focus()};if(t){n();return}this.closing=!0;let r=this.panelEl,i=e=>{e.target===r&&e.propertyName===`opacity`&&(r.removeEventListener(`transitionend`,i),n())};r.addEventListener(`transitionend`,i)}hidePanelImmediately(){!this.modal&&this.panelEl&&(this.popoverSupported?this.panelEl.matches(`:popover-open`)&&this.panelEl.hidePopover():this.panelEl.hidden=!0)}applyInitialFocus(){(this.findFirstBodyFocusable()??this.headingEl??null)?.focus()}findFirstBodyFocusable(){let e=this.renderRoot.querySelector(`slot:not([name])`);if(!e)return null;for(let t of e.assignedElements({flatten:!0}))if(t instanceof HTMLElement){let e=ue(t);if(e)return e}return null}getPanelFocusables(){let e=[],t=this.renderRoot.querySelector(`slot:not([name])`);if(t)for(let n of t.assignedElements({flatten:!0}))n instanceof HTMLElement&&e.push(...le(n));return this.dismissible&&this.closeButtonEl&&e.push(this.closeButtonEl),e}addGlobalListeners(){document.addEventListener(`pointerdown`,this.handleOutsidePointerDown,!0),window.addEventListener(`scroll`,this.handleReposition,!0),window.addEventListener(`resize`,this.handleReposition)}removeGlobalListeners(){document.removeEventListener(`pointerdown`,this.handleOutsidePointerDown,!0),window.removeEventListener(`scroll`,this.handleReposition,!0),window.removeEventListener(`resize`,this.handleReposition)}updatePosition(){let e=this.triggerEl,t=this.panelEl;if(!e||!t)return;let n=e.getBoundingClientRect(),r=t.getBoundingClientRect(),i=document.documentElement.clientWidth,a=document.documentElement.clientHeight,o=parseFloat(getComputedStyle(this).getPropertyValue(`--ds-popover-offset`))||0,s=parseFloat(getComputedStyle(document.documentElement).getPropertyValue(`--layout-gutter`))||0,{side:c,align:l}=fe(this.placement),u=c;u===`bottom`&&n.bottom+o+r.height>a&&n.top-o-r.height>=0?u=`top`:u===`top`&&n.top-o-r.height<0&&n.bottom+o+r.height<=a?u=`bottom`:u===`start`&&n.left-o-r.width<0&&n.right+o+r.width<=i?u=`end`:u===`end`&&n.right+o+r.width>i&&n.left-o-r.width>=0&&(u=`start`);let d,f;u===`bottom`||u===`top`?(d=u===`bottom`?n.bottom+o:n.top-o-r.height,f=l===`start`?n.left:l===`end`?n.right-r.width:n.left+n.width/2-r.width/2):(f=u===`end`?n.right+o:n.left-o-r.width,d=n.top+n.height/2-r.height/2),f=Math.min(Math.max(f,s),Math.max(s,i-r.width-s)),d=Math.min(Math.max(d,s),Math.max(s,a-r.height-s)),t.style.top=`${d}px`,t.style.left=`${f}px`;let p=`var(--space-1)`,m=`0px`,h=`0px`;u===`bottom`?h=`calc(-1 * ${p})`:u===`top`?h=p:u===`end`?m=`calc(-1 * ${p})`:u===`start`&&(m=p),t.style.setProperty(`--ds-popover-slide-x`,m),t.style.setProperty(`--ds-popover-slide-y`,h),this.updateArrowPosition(u,n,d,f,r)}updateArrowPosition(e,t,n,r,i){let a=this.arrowEl;if(!a)return;let o=(parseFloat(getComputedStyle(this).getPropertyValue(`--ds-popover-arrow-size`))||0)/2;if(a.style.top=``,a.style.bottom=``,a.style.left=``,a.style.right=``,e===`bottom`||e===`top`){let n=t.left+t.width/2,s=Math.min(Math.max(n-r,o),i.width-o);a.style.left=`${s-o}px`,e===`bottom`?a.style.top=`${-o}px`:a.style.bottom=`${-o}px`}else{let r=t.top+t.height/2,s=Math.min(Math.max(r-n,o),i.height-o);a.style.top=`${s-o}px`,e===`end`?a.style.left=`${-o}px`:a.style.right=`${-o}px`}}dispatchOpenChange(e){this.dispatchEvent(new CustomEvent(`open-change`,{detail:{open:e,reason:this.pendingReason},bubbles:!0,composed:!0}))}applyOverrides(){for(let e of Object.keys(Y)){let t=this.overrides?.[e],n=Y[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,h(t))}}warnInDev(){}}];shadowRootOptions={...s.shadowRootOptions,delegatesFocus:!0};styles=t`
    :host {
      display: inline-block;
      --ds-popover-border: var(--color-border);
      --ds-popover-border-width: var(--border-width-thin);
      --ds-popover-shadow: var(--shadow-overlay);
      --ds-popover-radius: var(--radius-md);
      --ds-popover-inset: var(--layout-inset-md);
      --ds-popover-part-gap: var(--layout-gap-normal);
      --ds-popover-offset: var(--space-2);
      --ds-popover-arrow-size: var(--space-2);
      --ds-popover-max-width: var(--layout-max-width-prose);
      --ds-popover-layer: var(--layer-dropdown);
      --ds-popover-enter: var(--motion-duration-fast);
      --ds-popover-exit: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    .panel {
      box-sizing: border-box;
      position: fixed;
      inset: auto;
      margin: 0;
      padding: var(--ds-popover-inset);
      border-style: solid;
      border-width: var(--ds-popover-border-width);
      border-color: var(--ds-popover-border);
      border-radius: var(--ds-popover-radius);
      /* surface: color.overlay.surface, locked — no override hook */
      background: var(--color-overlay-surface);
      box-shadow: var(--ds-popover-shadow);
      max-inline-size: min(var(--ds-popover-max-width), calc(100vw - 2 * var(--layout-gutter)));
      overflow: visible;
      color: var(--color-foreground);
      font-family: var(--font-family-body);
      z-index: var(--ds-popover-layer);
    }

    /* non-modal: Popover API top layer, or the position: fixed fallback above */
    div.panel {
      opacity: 0;
      transform: translate(var(--ds-popover-slide-x, 0), var(--ds-popover-slide-y, 0));
      transition:
        opacity var(--ds-popover-exit) var(--motion-easing-standard),
        transform var(--ds-popover-exit) var(--motion-easing-standard),
        overlay var(--ds-popover-exit) allow-discrete,
        display var(--ds-popover-exit) allow-discrete;
    }

    div.panel:popover-open {
      opacity: 1;
      transform: translate(0, 0);
      transition:
        opacity var(--ds-popover-enter) var(--motion-easing-standard),
        transform var(--ds-popover-enter) var(--motion-easing-standard);
    }

    div.panel[hidden] {
      display: none;
    }

    @starting-style {
      div.panel:popover-open {
        opacity: 0;
        transform: translate(var(--ds-popover-slide-x, 0), var(--ds-popover-slide-y, 0));
      }
    }

    /* modal: a native <dialog>, trapped and inert like a small Dialog */
    dialog.panel {
      border: 0;
      opacity: 1;
      transform: translate(0, 0);
      transition:
        opacity var(--ds-popover-enter) var(--motion-easing-standard),
        transform var(--ds-popover-enter) var(--motion-easing-standard);
    }

    dialog.panel::backdrop {
      background: transparent;
    }

    dialog.panel.closing {
      opacity: 0;
      transform: translate(var(--ds-popover-slide-x, 0), var(--ds-popover-slide-y, 0));
      transition-duration: var(--ds-popover-exit);
    }

    @starting-style {
      dialog.panel[open] {
        opacity: 0;
        transform: translate(var(--ds-popover-slide-x, 0), var(--ds-popover-slide-y, 0));
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .panel {
        transition: none;
      }
    }

    .content {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: var(--ds-popover-part-gap);
      max-block-size: calc(100vh - 2 * var(--layout-gutter) - 2 * var(--ds-popover-inset));
      overflow-y: auto;
    }

    /* Reserves room so the heading never sits under the close button. */
    .content.has-close {
      padding-inline-end: calc(var(--size-target-min) + var(--ds-popover-part-gap));
    }

    #heading:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
      border-radius: var(--radius-sm);
    }

    .close {
      position: absolute;
      inset-block-start: var(--ds-popover-inset);
      inset-inline-end: var(--ds-popover-inset);
    }

    /* arrowSize: space.2. A rotated square pointer toward the trigger. */
    .arrow {
      position: absolute;
      inline-size: var(--ds-popover-arrow-size);
      block-size: var(--ds-popover-arrow-size);
      background: var(--color-overlay-surface);
      border-inline-start: var(--ds-popover-border-width) solid var(--ds-popover-border);
      border-block-start: var(--ds-popover-border-width) solid var(--ds-popover-border);
      transform: rotate(45deg);
    }
  `;constructor(){super(Q),_()}}})))()}export{$ as t};