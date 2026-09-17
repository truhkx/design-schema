import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{O as t,_ as n,a as r,b as i,c as a,f as o,g as s,h as c,i as l,o as u,p as d,r as f,t as ee,u as p,v as m,w as h}from"./if-defined-CARySXJh.js";import{t as g}from"./query-BHY-nhsh.js";import{t as te}from"./Icon-BHsrajXm.js";import{t as ne}from"./Button-DM0-zK5H.js";import{t as re}from"./Heading-Ca-mCASW.js";import{n as ie,t as ae}from"./class-map-C-hUkrHk.js";import{t as oe}from"./Box-CAC_PYS7.js";import{t as se}from"./FocusScope-BRL2IrR1.js";function ce(e,t){if(e.matches(X)){t.push(e);return}t.push(...Array.from(e.querySelectorAll(X)))}function _(){let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e}function le(e,t){switch(e){case`bottom-start`:return{side:`bottom`,align:`start`};case`bottom`:return{side:`bottom`,align:`center`};case`bottom-end`:return{side:`bottom`,align:`end`};case`top-start`:return{side:`top`,align:`start`};case`top`:return{side:`top`,align:`center`};case`top-end`:return{side:`top`,align:`end`};case`start`:return{side:t?`right`:`left`,align:`center`};default:return{side:t?`left`:`right`,align:`center`}}}function ue(){Q+=1,Q===1&&(document.documentElement.style.overflow=`hidden`)}function de(){Q=Math.max(0,Q-1),Q===0&&document.documentElement.style.removeProperty(`overflow`)}var v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,fe,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,pe,Y,me,he,X,Z,ge,Q,_e,ve;function $(){return($=e((()=>{s(),n(),u(),ee(),ae(),r(),se(),re(),oe(),ne(),te(),Y={border:`--ds-popover-border`,borderWidth:`--ds-popover-border-width`,shadow:`--ds-popover-shadow`,radius:`--ds-popover-radius`,inset:`--ds-popover-inset`,partGap:`--ds-popover-part-gap`,offset:`--ds-popover-offset`,arrowSize:`--ds-popover-arrow-size`,maxWidth:`--ds-popover-max-width`,layer:`--ds-popover-layer`,enter:`--ds-popover-enter`,enterDistance:`--ds-popover-enter-distance`,exit:`--ds-popover-exit`},me=`Close`,he=typeof HTMLElement<`u`&&typeof HTMLElement.prototype.showPopover==`function`,X=[`a[href]`,`button:not([disabled])`,`input:not([disabled]):not([type="hidden"])`,`select:not([disabled])`,`textarea:not([disabled])`,`[tabindex]:not([tabindex="-1"])`,`ds-button:not([disabled])`,`ds-link`,`ds-input:not([disabled])`,`ds-checkbox:not([disabled])`,`ds-switch:not([disabled])`,`ds-radio-group:not([disabled])`,`ds-date-picker:not([disabled])`,`ds-disclosure:not([disabled])`].join(`,`),Z={top:`bottom`,bottom:`top`,left:`right`,right:`left`},ge={bottom:`marginTop`,top:`marginBottom`,right:`marginLeft`,left:`marginRight`},Q=0,_e={fromAttribute(e){return e===null},toAttribute(e){return e?null:``}},new class extends d{static[class extends m{static{({e:[y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,fe,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,pe],c:[ve,v]}=c(this,[o(`ds-popover`)],[[p(),1,`heading`],[p({attribute:`heading-level`,reflect:!0}),1,`headingLevel`],[p({type:Boolean,reflect:!0}),1,`open`],[p({reflect:!0}),1,`placement`],[p({type:Boolean,reflect:!0}),1,`modal`],[p({type:Boolean,reflect:!0,attribute:`show-arrow`}),1,`showArrow`],[p({attribute:`no-dismiss`,reflect:!0,converter:_e}),1,`dismissible`],[p({attribute:!1}),1,`overrides`],[a(),1,`internalOpen`],[a(),1,`mounted`],[a(),1,`triggerAccessibleName`],[a(),1,`side`],[g(`[data-part="panel"]`),1,`panelEl`],[g(`[data-part="heading"]`),1,`headingEl`],[g(`[data-part="closeButton"]`),1,`closeButtonEl`],[g(`slot:not([name])`),1,`bodySlotEl`]],0,void 0,m))}#e=y(this);get heading(){return this.#e}set heading(e){this.#e=e}#t=(b(this),x(this,`3`));get headingLevel(){return this.#t}set headingLevel(e){this.#t=e}#n=(S(this),C(this));get open(){return this.#n}set open(e){this.#n=e}#r=(w(this),T(this,`bottom`));get placement(){return this.#r}set placement(e){this.#r=e}#i=(E(this),D(this,!1));get modal(){return this.#i}set modal(e){this.#i=e}#a=(O(this),k(this,!1));get showArrow(){return this.#a}set showArrow(e){this.#a=e}#o=(A(this),j(this,!0));get dismissible(){return this.#o}set dismissible(e){this.#o=e}#s=(M(this),N(this));get overrides(){return this.#s}set overrides(e){this.#s=e}#c=(fe(this),P(this,!1));get internalOpen(){return this.#c}set internalOpen(e){this.#c=e}#l=(F(this),I(this,!1));get mounted(){return this.#l}set mounted(e){this.#l=e}#u=(L(this),R(this,``));get triggerAccessibleName(){return this.#u}set triggerAccessibleName(e){this.#u=e}#d=(z(this),B(this,`bottom`));get side(){return this.#d}set side(e){this.#d=e}#f=(V(this),H(this));get panelEl(){return this.#f}set panelEl(e){this.#f=e}#p=(U(this),W(this));get headingEl(){return this.#p}set headingEl(e){this.#p=e}#m=(G(this),K(this));get closeButtonEl(){return this.#m}set closeButtonEl(e){this.#m=e}#h=(q(this),J(this));get bodySlotEl(){return this.#h}set bodySlotEl(e){this.#h=e}popoverSupported=(pe(this),he);triggerEl=null;wasOpen=!1;scrollLocked=!1;request=null;exitGeneration=0;warned=!1;get currentOpen(){return this.open??this.internalOpen}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Popover`),this.hasUpdated&&this.requestUpdate()}disconnectedCallback(){super.disconnectedCallback(),this.detachTrigger(),this.removeOpenListeners(),this.releaseScrollLock(),this.wasOpen=!1}willUpdate(e){e.has(`overrides`)&&this.applyOverrides(),this.currentOpen&&!this.mounted&&(this.mounted=!0)}firstUpdated(){}updated(e){let t=this.currentOpen&&this.isConnected;t===this.wasOpen?t&&(e.has(`placement`)||e.has(`heading`)||e.has(`showArrow`))&&this.updatePosition():(this.wasOpen=t,this.updateTriggerExpanded(),t?this.handleOpened():this.handleClosed())}render(){let e=this.currentOpen,t=this.heading||this.triggerAccessibleName||void 0,n=this.mounted?h`
          ${this.showArrow?h`<span data-part="arrow" part="arrow" aria-hidden="true"></span>`:i}
          <ds-focus-scope
            data-part="focusScope"
            part="focusScope"
            .trapped=${this.modal}
            .autoFocus=${`none`}
            .restoreFocus=${!1}
            .active=${e}
          >
            <div class="content">
              ${this.heading||this.dismissible?h`
                    <div class="header">
                      ${this.heading?h`<ds-heading data-part="heading" part="heading" level=${this.headingLevel} tabindex="-1"
                            >${this.heading}</ds-heading
                          >`:i}
                      ${this.dismissible?h`
                            <ds-button
                              data-part="closeButton"
                              part="closeButton"
                              variant="ghost"
                              size="sm"
                              icon-only
                              label=${me}
                              @press=${this.handleCloseButtonPress}
                            >
                              <ds-icon slot="leading-icon" name="close"></ds-icon>
                            </ds-button>
                          `:i}
                    </div>
                  `:i}
              <ds-box data-part="body" part="body"><slot></slot></ds-box>
            </div>
          </ds-focus-scope>
        `:i;return h`
      <slot name="trigger" data-part="trigger" @slotchange=${this.handleTriggerSlotChange}></slot>
      ${this.modal?h`
            <dialog
              data-part="panel"
              part="panel"
              data-side=${this.side}
              tabindex="-1"
              aria-label=${f(t)}
              aria-modal="true"
              @cancel=${this.handleDialogCancel}
              @close=${this.handleDialogClose}
              @keydown=${this.handlePanelKeydown}
            >
              ${n}
            </dialog>
          `:h`
            <div
              data-part="panel"
              part="panel"
              data-side=${this.side}
              class=${ie({"fallback-open":!this.popoverSupported&&e})}
              role="dialog"
              tabindex="-1"
              aria-label=${f(t)}
              popover=${this.popoverSupported?`manual`:i}
              ?hidden=${!this.popoverSupported&&!e&&!this.mounted}
              @keydown=${this.handlePanelKeydown}
            >
              ${n}
            </div>
          `}
    `}handleTriggerSlotChange=e=>{let t=e.target.assignedElements({flatten:!0})[0]??null;t!==this.triggerEl&&(this.detachTrigger(),this.triggerEl=t,t?.addEventListener(`click`,this.handleTriggerClick)),this.updateTriggerAccessibleName(),this.updateTriggerExpanded(),this.currentOpen&&this.updatePosition()};detachTrigger(){let e=this.triggerEl;e&&(e.removeEventListener(`click`,this.handleTriggerClick),`expanded`in e?e.expanded=void 0:e.removeAttribute(`aria-expanded`))}updateTriggerAccessibleName(){let e=this.triggerEl;if(!e){this.triggerAccessibleName=``;return}let t=e=>typeof e==`string`?e:``,n=e.getAttribute(`aria-label`)||t(e.accessibleName)||t(e.label)||e.textContent?.trim()||``;this.triggerAccessibleName!==n&&(this.triggerAccessibleName=n)}updateTriggerExpanded(){let e=this.triggerEl;if(!e)return;let t=this.currentOpen;if(`expanded`in e){let n=e;n.expanded!==t&&(n.expanded=t)}else e.getAttribute(`aria-expanded`)!==String(t)&&e.setAttribute(`aria-expanded`,String(t))}handleTriggerClick=()=>{this.requestOpenChange(!this.currentOpen,`trigger`,!0)};handleCloseButtonPress=e=>{e.stopPropagation(),this.requestOpenChange(!1,`close-button`,!0)};handleDialogCancel=e=>{e.preventDefault(),this.currentOpen&&this.requestOpenChange(!1,`escape`,!0)};handleDialogClose=()=>{let e=this.panelEl;this.currentOpen&&e instanceof HTMLDialogElement&&(this.requestOpenChange(!1,`escape`,!0),this.currentOpen&&!e.open&&e.showModal())};handlePanelKeydown=e=>{if(!this.currentOpen)return;if(e.key===`Escape`){e.preventDefault(),e.stopPropagation(),this.requestOpenChange(!1,`escape`,!0);return}if(this.modal||e.key!==`Tab`||e.defaultPrevented)return;let t=this.getPanelFocusables(),n=_(),r=t[0],i=t[t.length-1],a=n===this.panelEl||this.isWithin(n,this.headingEl);e.shiftKey&&(a||r!==void 0&&this.isWithin(n,r))?(e.preventDefault(),this.triggerEl?.focus(),this.requestOpenChange(!1,`tab-out`,!1)):!e.shiftKey&&(a&&!i||i!==void 0&&this.isWithin(n,i))&&(e.preventDefault(),this.focusAfterHost(),this.requestOpenChange(!1,`tab-out`,!1))};handleOutsidePointerDown=e=>{e.composedPath().includes(this)||this.requestOpenChange(!1,`outside`,!1)};handleReposition=()=>{this.currentOpen&&this.updatePosition()};requestOpenChange(e,t,n){this.request={open:e,focusTrigger:n},this.open===void 0&&(this.internalOpen=e),this.dispatchEvent(new CustomEvent(`open-change`,{detail:{open:e,reason:t},bubbles:!0,composed:!0}))}handleOpened(){this.request=null,this.exitGeneration+=1,this.updateTriggerAccessibleName();let e=this.panelEl;e&&(e instanceof HTMLDialogElement?(this.scrollLocked||=(ue(),!0),e.open||e.showModal()):(document.addEventListener(`pointerdown`,this.handleOutsidePointerDown,!0),this.popoverSupported&&!e.matches(`:popover-open`)&&e.showPopover()),window.addEventListener(`scroll`,this.handleReposition,!0),window.addEventListener(`resize`,this.handleReposition),this.updatePosition(),this.applyInitialFocus())}handleClosed(){let e=this.request;this.request=null;let t=this.isWithin(_(),this),n=e&&e.open===!1?e.focusTrigger:t;this.removeOpenListeners();let r=this.panelEl;r instanceof HTMLDialogElement?r.open&&r.close():r&&this.popoverSupported&&r.matches(`:popover-open`)&&r.hidePopover(),this.releaseScrollLock(),n&&this.triggerEl?.focus(),this.unmountAfterExit()}unmountAfterExit(){let e=this.panelEl,t=++this.exitGeneration,n=!1,r=()=>{n||(n=!0,e?.removeEventListener(`transitionend`,i),e?.removeEventListener(`transitioncancel`,i),t===this.exitGeneration&&!this.currentOpen&&(this.mounted=!1))},i=t=>{t.target===e&&r()};if(!e){r();return}e.addEventListener(`transitionend`,i),e.addEventListener(`transitioncancel`,i);let a=Math.max(...getComputedStyle(e).transitionDuration.split(`,`).map(e=>parseFloat(e)||0));setTimeout(r,a*1e3)}releaseScrollLock(){this.scrollLocked&&=(de(),!1)}removeOpenListeners(){document.removeEventListener(`pointerdown`,this.handleOutsidePointerDown,!0),window.removeEventListener(`scroll`,this.handleReposition,!0),window.removeEventListener(`resize`,this.handleReposition)}async applyInitialFocus(){let e=(this.bodySlotEl?.assignedElements({flatten:!0})??[]).flatMap(e=>[e,...Array.from(e.querySelectorAll(`*`))]);await Promise.all([...e,this.headingEl,this.closeButtonEl].map(e=>e?.updateComplete)),this.currentOpen&&(this.updatePosition(),(this.getBodyFocusables()[0]??this.closeButtonEl??this.headingEl??this.panelEl)?.focus())}getBodyFocusables(){let e=[];for(let t of this.bodySlotEl?.assignedElements({flatten:!0})??[])t instanceof HTMLElement&&ce(t,e);return e}getPanelFocusables(){let e=this.getBodyFocusables();return this.closeButtonEl?[this.closeButtonEl,...e]:e}focusAfterHost(){(Array.from(document.querySelectorAll(X)).find(e=>!this.contains(e)&&(this.compareDocumentPosition(e)&Node.DOCUMENT_POSITION_FOLLOWING)!==0&&e.getAttribute(`tabindex`)!==`-1`&&e.closest(`[inert]`)===null&&e.getClientRects().length>0)??this.triggerEl)?.focus()}isWithin(e,t){if(!t)return!1;let n=e;for(;n;){if(n===t)return!0;n=n instanceof HTMLElement&&n.assignedSlot?n.assignedSlot:n.parentNode instanceof ShadowRoot?n.parentNode.host:n.parentNode}return!1}updatePosition(){let e=this.triggerEl,t=this.panelEl;if(!e||!t)return;let n=e.getBoundingClientRect(),r=t.getBoundingClientRect(),i=document.documentElement.clientWidth,a=document.documentElement.clientHeight,o=parseFloat(getComputedStyle(t)[ge[this.side]])||0,s=this.readLength(`--layout-gutter`,t),c=getComputedStyle(e).direction===`rtl`,{side:l,align:u}=le(this.placement,c),d=e=>{switch(e){case`bottom`:return n.bottom+o+r.height<=a;case`top`:return n.top-o-r.height>=0;case`right`:return n.right+o+r.width<=i;case`left`:return n.left-o-r.width>=0}},f=!d(l)&&d(Z[l])?Z[l]:l,ee=c?n.right-r.width:n.left,p=c?n.left:n.right-r.width,m,h;f===`bottom`||f===`top`?(m=f===`bottom`?n.bottom:n.top-o-r.height,h=u===`start`?ee:u===`end`?p:n.left+n.width/2-r.width/2,h=Math.min(Math.max(h,s),Math.max(s,i-r.width-s))):(h=f===`right`?n.right:n.left-o-r.width,m=n.top+n.height/2-r.height/2,m=Math.min(Math.max(m,s),Math.max(s,a-r.height-s))),t.style.top=`${m}px`,t.style.left=`${h}px`,this.side!==f&&(t.setAttribute(`data-side`,f),this.side=f)}readLength(e,t){let n=document.createElement(`div`);n.style.position=`absolute`,n.style.visibility=`hidden`,n.style.inlineSize=`var(${e})`,t.append(n);let r=n.getBoundingClientRect().width;return n.remove(),r}applyOverrides(){for(let e of Object.keys(Y)){let t=this.overrides?.[e],n=Y[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,l(t))}}warnInDev(){}}];shadowRootOptions={...m.shadowRootOptions,delegatesFocus:!0};styles=t`
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
      --ds-popover-enter-distance: var(--space-1);
      --ds-popover-exit: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    [data-part='panel'] {
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
      max-block-size: none;
      overflow: visible;
      color: var(--color-foreground);
      font-family: var(--font-family-body);
      z-index: var(--ds-popover-layer);
    }

    /* offset: a margin on the side facing the trigger, read back by the flip check. */
    [data-part='panel'][data-side='bottom'] {
      margin-top: var(--ds-popover-offset);
      --ds-popover-slide: translateY(calc(-1 * var(--ds-popover-enter-distance)));
    }
    [data-part='panel'][data-side='top'] {
      margin-bottom: var(--ds-popover-offset);
      --ds-popover-slide: translateY(var(--ds-popover-enter-distance));
    }
    [data-part='panel'][data-side='right'] {
      margin-left: var(--ds-popover-offset);
      --ds-popover-slide: translateX(calc(-1 * var(--ds-popover-enter-distance)));
    }
    [data-part='panel'][data-side='left'] {
      margin-right: var(--ds-popover-offset);
      --ds-popover-slide: translateX(var(--ds-popover-enter-distance));
    }

    [data-part='panel']:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    /* exit: fade out with motion.easing.exit. */
    [data-part='panel'] {
      opacity: 0;
      transform: none;
      transition:
        opacity var(--ds-popover-exit) var(--motion-easing-exit),
        overlay var(--ds-popover-exit) allow-discrete,
        display var(--ds-popover-exit) allow-discrete;
    }

    /* enter: fade and an enterDistance slide from the trigger side, with motion.easing.standard. */
    div[data-part='panel']:popover-open,
    div[data-part='panel'].fallback-open,
    dialog[data-part='panel'][open] {
      opacity: 1;
      transform: none;
      transition:
        opacity var(--ds-popover-enter) var(--motion-easing-standard),
        transform var(--ds-popover-enter) var(--motion-easing-standard),
        overlay var(--ds-popover-enter) allow-discrete,
        display var(--ds-popover-enter) allow-discrete;
    }

    @starting-style {
      div[data-part='panel']:popover-open,
      div[data-part='panel'].fallback-open,
      dialog[data-part='panel'][open] {
        opacity: 0;
        transform: var(--ds-popover-slide, none);
      }
    }

    div[data-part='panel']:not([popover]):not(.fallback-open) {
      pointer-events: none;
    }

    div[data-part='panel'][hidden] {
      display: none;
    }

    /* A modal popover does not dim the page. */
    dialog[data-part='panel']::backdrop {
      background: transparent;
    }

    @media (prefers-reduced-motion: reduce) {
      [data-part='panel'],
      div[data-part='panel']:popover-open,
      div[data-part='panel'].fallback-open,
      dialog[data-part='panel'][open] {
        transition: none;
      }
    }

    .content {
      display: flex;
      flex-direction: column;
      gap: var(--ds-popover-part-gap);
    }

    /* The header row: the heading fills it, the close button sits at its inline end. */
    .header {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--ds-popover-part-gap);
    }

    [data-part='heading'] {
      flex: 1 1 auto;
      min-inline-size: 0;
    }

    [data-part='heading']:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    [data-part='closeButton'] {
      flex: none;
    }

    /* arrowSize: a rotated square centered on the panel edge that faces the trigger, edged on its two outer sides. */
    [data-part='arrow'] {
      position: absolute;
      box-sizing: border-box;
      inline-size: var(--ds-popover-arrow-size);
      block-size: var(--ds-popover-arrow-size);
      background: var(--color-overlay-surface);
      border: 0 solid var(--ds-popover-border);
      transform: rotate(45deg);
    }

    [data-side='bottom'] > [data-part='arrow'] {
      top: calc((var(--ds-popover-arrow-size) + var(--ds-popover-border-width)) / -2);
      left: calc(50% - var(--ds-popover-arrow-size) / 2);
      border-top-width: var(--ds-popover-border-width);
      border-left-width: var(--ds-popover-border-width);
    }

    [data-side='top'] > [data-part='arrow'] {
      bottom: calc((var(--ds-popover-arrow-size) + var(--ds-popover-border-width)) / -2);
      left: calc(50% - var(--ds-popover-arrow-size) / 2);
      border-bottom-width: var(--ds-popover-border-width);
      border-right-width: var(--ds-popover-border-width);
    }

    [data-side='right'] > [data-part='arrow'] {
      left: calc((var(--ds-popover-arrow-size) + var(--ds-popover-border-width)) / -2);
      top: calc(50% - var(--ds-popover-arrow-size) / 2);
      border-bottom-width: var(--ds-popover-border-width);
      border-left-width: var(--ds-popover-border-width);
    }

    [data-side='left'] > [data-part='arrow'] {
      right: calc((var(--ds-popover-arrow-size) + var(--ds-popover-border-width)) / -2);
      top: calc(50% - var(--ds-popover-arrow-size) / 2);
      border-top-width: var(--ds-popover-border-width);
      border-right-width: var(--ds-popover-border-width);
    }
  `;constructor(){super(ve),v()}}})))()}export{$ as t};