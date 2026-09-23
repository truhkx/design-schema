import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{O as t,_ as n,a as r,b as i,c as a,f as o,g as s,h as c,i as l,o as u,p as d,r as f,t as p,u as m,v as h,w as g}from"./if-defined-CARySXJh.js";import{t as _}from"./query-BHY-nhsh.js";import{t as ee}from"./Icon-eWCe5jE3.js";import{t as te}from"./Button-B3rVveNU.js";import{t as ne}from"./Heading-9iQ-E2rO.js";import{n as re,t as ie}from"./class-map-C-hUkrHk.js";import{t as ae}from"./Box-Cbe3zAzP.js";import{n as oe,t as v}from"./FocusScope-BSAjTz8A.js";function y(){let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e}function se(e,t){switch(e){case`bottom-start`:return{side:`bottom`,align:`start`};case`bottom`:return{side:`bottom`,align:`center`};case`bottom-end`:return{side:`bottom`,align:`end`};case`top-start`:return{side:`top`,align:`start`};case`top`:return{side:`top`,align:`center`};case`top-end`:return{side:`top`,align:`end`};case`start`:return{side:t?`right`:`left`,align:`center`};default:return{side:t?`left`:`right`,align:`center`}}}function ce(){if(X+=1,X===1){let e=document.documentElement.style;Z=e.getPropertyValue(`overflow`),Q=e.getPropertyValue(`scrollbar-gutter`),e.setProperty(`overflow`,`hidden`),e.setProperty(`scrollbar-gutter`,`stable`)}}function le(){if(X=Math.max(0,X-1),X===0){let e=document.documentElement.style;e.setProperty(`overflow`,Z),e.setProperty(`scrollbar-gutter`,Q)}}var b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,ue,H,U,W,G,K,q,de,fe,pe,me,he,ge,_e,ve,ye,be,J,xe,Se,Y,Ce,X,Z,Q,$,we;function Te(){return(Te=e((()=>{s(),n(),u(),p(),ie(),r(),oe(),ne(),ae(),te(),ee(),J={border:`--ds-popover-border`,borderWidth:`--ds-popover-border-width`,shadow:`--ds-popover-shadow`,radius:`--ds-popover-radius`,inset:`--ds-popover-inset`,partGap:`--ds-popover-part-gap`,offset:`--ds-popover-offset`,arrowSize:`--ds-popover-arrow-size`,maxWidth:`--ds-popover-max-width`,gutter:`--ds-popover-gutter`,layer:`--ds-popover-layer`,enter:`--ds-popover-enter`,enterDistance:`--ds-popover-enter-distance`,exit:`--ds-popover-exit`},xe=`Close`,Se=typeof HTMLElement<`u`&&typeof HTMLElement.prototype.showPopover==`function`,Y={top:`bottom`,bottom:`top`,left:`right`,right:`left`},Ce={bottom:`marginTop`,top:`marginBottom`,right:`marginLeft`,left:`marginRight`},X=0,Z=``,Q=``,$={fromAttribute(e){return e===null},toAttribute(e){return e?null:``}},new class extends d{static[class extends h{static{({e:[x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,ue,H,U,W,G,K,q,de,fe,pe,me,he,ge,_e,ve,ye,be],c:[we,b]}=c(this,[o(`ds-popover`)],[[m(),1,`heading`],[m({attribute:`heading-level`,reflect:!0}),1,`headingLevel`],[m({type:Boolean,reflect:!0}),1,`open`],[m({reflect:!0}),1,`placement`],[m({type:Boolean,reflect:!0}),1,`modal`],[m({type:Boolean,reflect:!0,attribute:`show-arrow`}),1,`showArrow`],[m({attribute:`no-dismiss`,reflect:!0,converter:$}),1,`dismissible`],[m({attribute:`initial-focus`,reflect:!0}),1,`initialFocus`],[m({attribute:!1}),1,`overrides`],[a(),1,`internalOpen`],[a(),1,`mounted`],[a(),1,`triggerAccessibleName`],[a(),1,`side`],[_(`[data-part="panel"]`),1,`panelEl`],[_(`[data-part="heading"]`),1,`headingEl`],[_(`[data-part="heading"] ds-heading`),1,`headingControlEl`],[_(`[data-part="closeButton"] ds-button`),1,`closeButtonControlEl`],[_(`[data-part="body"]`),1,`bodyEl`],[_(`slot:not([name])`),1,`bodySlotEl`]],0,void 0,h))}#e=x(this);get heading(){return this.#e}set heading(e){this.#e=e}#t=(S(this),C(this,`3`));get headingLevel(){return this.#t}set headingLevel(e){this.#t=e}#n=(w(this),T(this));get open(){return this.#n}set open(e){this.#n=e}#r=(E(this),D(this,`bottom`));get placement(){return this.#r}set placement(e){this.#r=e}#i=(O(this),k(this,!1));get modal(){return this.#i}set modal(e){this.#i=e}#a=(A(this),j(this,!1));get showArrow(){return this.#a}set showArrow(e){this.#a=e}#o=(M(this),N(this,!0));get dismissible(){return this.#o}set dismissible(e){this.#o=e}#s=(P(this),F(this,`first`));get initialFocus(){return this.#s}set initialFocus(e){this.#s=e}#c=(I(this),L(this));get overrides(){return this.#c}set overrides(e){this.#c=e}#l=(R(this),z(this,!1));get internalOpen(){return this.#l}set internalOpen(e){this.#l=e}#u=(B(this),V(this,!1));get mounted(){return this.#u}set mounted(e){this.#u=e}#d=(ue(this),H(this,``));get triggerAccessibleName(){return this.#d}set triggerAccessibleName(e){this.#d=e}#f=(U(this),W(this,`bottom`));get side(){return this.#f}set side(e){this.#f=e}#p=(G(this),K(this));get panelEl(){return this.#p}set panelEl(e){this.#p=e}#m=(q(this),de(this));get headingEl(){return this.#m}set headingEl(e){this.#m=e}#h=(fe(this),pe(this));get headingControlEl(){return this.#h}set headingControlEl(e){this.#h=e}#g=(me(this),he(this));get closeButtonControlEl(){return this.#g}set closeButtonControlEl(e){this.#g=e}#_=(ge(this),_e(this));get bodyEl(){return this.#_}set bodyEl(e){this.#_=e}#v=(ve(this),ye(this));get bodySlotEl(){return this.#v}set bodySlotEl(e){this.#v=e}popoverSupported=(be(this),Se);triggerEl=null;wasOpen=!1;scrollLocked=!1;request=null;exitGeneration=0;warned=!1;get currentOpen(){return this.open??this.internalOpen}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Popover`),this.hasUpdated&&this.requestUpdate()}disconnectedCallback(){super.disconnectedCallback(),this.detachTrigger(),this.removeOpenListeners(),this.releaseScrollLock(),this.wasOpen=!1}willUpdate(e){e.has(`overrides`)&&this.applyOverrides(),this.currentOpen&&!this.mounted&&(this.mounted=!0)}firstUpdated(){}updated(e){let t=this.currentOpen&&this.isConnected;t===this.wasOpen?t&&(e.has(`placement`)||e.has(`heading`)||e.has(`showArrow`))&&this.updatePosition():(this.wasOpen=t,this.updateTriggerExpanded(),t?this.handleOpened():this.handleClosed())}render(){let e=this.currentOpen,t=this.heading||this.triggerAccessibleName||void 0,n=this.mounted?g`
          ${this.showArrow?g`<span data-part="arrow" part="arrow" aria-hidden="true"></span>`:i}
          <ds-focus-scope
            data-part="focusScope"
            part="focusScope"
            .trapped=${this.modal}
            .autoFocus=${`none`}
            .restoreFocus=${!1}
            .active=${e}
          >
            <div class="content">
              ${this.heading||this.dismissible?g`
                    <div class="header">
                      ${this.heading?g`
                            <div data-part="heading" part="heading">
                              <ds-heading level=${this.headingLevel} tabindex="-1">${this.heading}</ds-heading>
                            </div>
                          `:i}
                      ${this.dismissible?g`
                            <span data-part="closeButton" part="closeButton" @click=${this.handleCloseTargetClick}>
                              <ds-button
                                variant="ghost"
                                size="sm"
                                icon-only
                                label=${xe}
                                @press=${this.handleCloseButtonPress}
                              >
                                <ds-icon slot="leading-icon" name="close"></ds-icon>
                              </ds-button>
                            </span>
                          `:i}
                    </div>
                  `:i}
              <div data-part="body" part="body"><ds-box><slot></slot></ds-box></div>
            </div>
          </ds-focus-scope>
        `:i;return g`
      <slot name="trigger" data-part="trigger" @slotchange=${this.handleTriggerSlotChange}></slot>
      ${this.modal?g`
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
          `:g`
            <div
              data-part="panel"
              part="panel"
              data-side=${this.side}
              class=${re({"fallback-open":!this.popoverSupported&&e})}
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
    `}reposition(){this.currentOpen&&this.updatePosition()}handleTriggerSlotChange=e=>{let t=e.target.assignedElements({flatten:!0})[0]??null;t!==this.triggerEl&&(this.detachTrigger(),this.triggerEl=t,t?.addEventListener(`click`,this.handleTriggerClick)),this.updateTriggerAccessibleName(),this.updateTriggerExpanded(),this.currentOpen&&this.updatePosition()};detachTrigger(){let e=this.triggerEl;e&&(e.removeEventListener(`click`,this.handleTriggerClick),`expanded`in e?e.expanded=void 0:e.removeAttribute(`aria-expanded`))}updateTriggerAccessibleName(){let e=this.triggerEl;if(!e){this.triggerAccessibleName=``;return}let t=e=>typeof e==`string`?e:``,n=e.getAttribute(`aria-label`)||t(e.accessibleName)||t(e.label)||e.textContent?.trim()||``;this.triggerAccessibleName!==n&&(this.triggerAccessibleName=n)}updateTriggerExpanded(){let e=this.triggerEl;if(!e)return;let t=this.currentOpen;if(`expanded`in e){let n=e;n.expanded!==t&&(n.expanded=t)}else e.getAttribute(`aria-expanded`)!==String(t)&&e.setAttribute(`aria-expanded`,String(t))}handleTriggerClick=()=>{this.requestOpenChange(!this.currentOpen,`trigger`,!0)};handleCloseButtonPress=e=>{e.stopPropagation(),this.requestOpenChange(!1,`close-button`,!0)};handleCloseTargetClick=e=>{e.target===e.currentTarget&&this.closeButtonControlEl?.click()};handleDialogCancel=e=>{e.preventDefault(),this.currentOpen&&this.requestOpenChange(!1,`escape`,!0)};handleDialogClose=()=>{let e=this.panelEl;this.currentOpen&&e instanceof HTMLDialogElement&&(this.requestOpenChange(!1,`escape`,!0),this.currentOpen&&!e.open&&e.showModal())};handlePanelKeydown=e=>{if(!this.currentOpen)return;if(e.key===`Escape`){e.preventDefault(),e.stopPropagation(),this.requestOpenChange(!1,`escape`,!0);return}if(this.modal||e.key!==`Tab`||e.defaultPrevented)return;let t=this.getPanelFocusables(),n=y(),r=t[0],i=t[t.length-1],a=n===this.panelEl||this.isWithin(n,this.headingEl);e.shiftKey&&(a||r!==void 0&&this.isWithin(n,r))?(e.preventDefault(),this.triggerEl?.focus(),this.requestOpenChange(!1,`tab-out`,!1)):!e.shiftKey&&(a&&!i||i!==void 0&&this.isWithin(n,i))&&(e.preventDefault(),this.focusAfterHost(),this.requestOpenChange(!1,`tab-out`,!1))};handleOutsidePointerDown=e=>{e.composedPath().includes(this)||this.requestOpenChange(!1,`outside`,!1)};handleReposition=()=>{this.currentOpen&&this.updatePosition()};requestOpenChange(e,t,n){this.request={open:e,focusTrigger:n},this.open===void 0&&(this.internalOpen=e),this.dispatchEvent(new CustomEvent(`open-change`,{detail:{open:e,reason:t},bubbles:!0,composed:!0}))}handleOpened(){this.request=null,this.exitGeneration+=1,this.updateTriggerAccessibleName();let e=this.panelEl;e&&(e instanceof HTMLDialogElement?(this.scrollLocked||=(ce(),!0),e.open||e.showModal()):(document.addEventListener(`pointerdown`,this.handleOutsidePointerDown,!0),this.popoverSupported&&!e.matches(`:popover-open`)&&e.showPopover()),window.addEventListener(`scroll`,this.handleReposition,!0),window.addEventListener(`resize`,this.handleReposition),this.updatePosition(),this.applyInitialFocus())}handleClosed(){let e=this.request;this.request=null;let t=y(),n=this.isWithin(t,this.panelEl)||this.modal&&(t===null||t===document.body),r=e&&e.open===!1?e.focusTrigger:n;this.removeOpenListeners();let i=this.panelEl;i instanceof HTMLDialogElement?i.open&&i.close():i&&this.popoverSupported&&i.matches(`:popover-open`)&&i.hidePopover(),this.releaseScrollLock(),r&&this.triggerEl?.focus(),this.unmountAfterExit()}unmountAfterExit(){let e=this.panelEl,t=++this.exitGeneration,n=!1,r=()=>{n||(n=!0,e?.removeEventListener(`transitionend`,i),e?.removeEventListener(`transitioncancel`,i),t===this.exitGeneration&&!this.currentOpen&&(this.mounted=!1))},i=t=>{t.target===e&&r()};if(!e){r();return}e.addEventListener(`transitionend`,i),e.addEventListener(`transitioncancel`,i);let a=Math.max(...getComputedStyle(e).transitionDuration.split(`,`).map(e=>parseFloat(e)||0));setTimeout(r,a*1e3)}releaseScrollLock(){this.scrollLocked&&=(le(),!1)}removeOpenListeners(){document.removeEventListener(`pointerdown`,this.handleOutsidePointerDown,!0),window.removeEventListener(`scroll`,this.handleReposition,!0),window.removeEventListener(`resize`,this.handleReposition)}async applyInitialFocus(){let e=(this.bodySlotEl?.assignedElements({flatten:!0})??[]).flatMap(e=>[e,...Array.from(e.querySelectorAll(`*`))]);await Promise.all([...e,this.headingControlEl,this.closeButtonControlEl].map(e=>e?.updateComplete)),this.currentOpen&&(this.updatePosition(),this.initialFocus!==`none`&&(this.getBodyFocusables()[0]??this.closeButtonControlEl??this.headingControlEl??this.panelEl)?.focus())}getBodyFocusables(){let e=this.bodyEl;return e===null?[]:v(e)}getPanelFocusables(){let e=this.panelEl;return e===null?[]:v(e)}focusAfterHost(){let e=v(document.documentElement),t=e.findIndex(e=>this.isWithin(e,this));((t===-1?void 0:e.slice(t).find(e=>!this.isWithin(e,this)))??this.triggerEl)?.focus()}isWithin(e,t){if(!t)return!1;let n=e;for(;n;){if(n===t)return!0;n=n instanceof HTMLElement&&n.assignedSlot?n.assignedSlot:n.parentNode instanceof ShadowRoot?n.parentNode.host:n.parentNode}return!1}updatePosition(){let e=this.triggerEl,t=this.panelEl;if(!e||!t)return;let n=e.getBoundingClientRect(),r=t.getBoundingClientRect(),i=document.documentElement.clientWidth,a=document.documentElement.clientHeight,o=parseFloat(getComputedStyle(t)[Ce[this.side]])||0,s=this.readLength(`--ds-popover-gutter`,t),c=getComputedStyle(e).direction===`rtl`,{side:l,align:u}=se(this.placement,c),d=e=>{switch(e){case`bottom`:return n.bottom+o+r.height+s<=a;case`top`:return n.top-o-r.height-s>=0;case`right`:return n.right+o+r.width+s<=i;case`left`:return n.left-o-r.width-s>=0}},f=!d(l)&&d(Y[l])?Y[l]:l,p=c?n.right-r.width:n.left,m=c?n.left:n.right-r.width,h,g;f===`bottom`||f===`top`?(h=f===`bottom`?n.bottom:n.top-o-r.height,g=u===`start`?p:u===`end`?m:n.left+n.width/2-r.width/2,g=Math.min(Math.max(g,s),Math.max(s,i-r.width-s))):(g=f===`right`?n.right:n.left-o-r.width,h=n.top+n.height/2-r.height/2,h=Math.min(Math.max(h,s),Math.max(s,a-r.height-s))),t.style.top=`${h}px`,t.style.left=`${g}px`,this.side!==f&&(t.setAttribute(`data-side`,f),this.side=f)}readLength(e,t){let n=document.createElement(`div`);n.style.position=`absolute`,n.style.visibility=`hidden`,n.style.inlineSize=`var(${e})`,t.append(n);let r=n.getBoundingClientRect().width;return n.remove(),r}applyOverrides(){for(let e of Object.keys(J)){let t=this.overrides?.[e],n=J[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,l(t))}}warnInDev(){}}];shadowRootOptions={...h.shadowRootOptions,delegatesFocus:!0};styles=t`
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
      --ds-popover-gutter: var(--layout-gutter);
      --ds-popover-layer: var(--layer-dropdown);
      --ds-popover-enter: var(--motion-duration-fast);
      --ds-popover-enter-distance: var(--space-1);
      --ds-popover-exit: var(--motion-duration-fast);
      /* Locked: no override API, but still themeable from page CSS. */
      --ds-popover-surface: var(--color-overlay-surface);
      --ds-popover-focus-ring: var(--color-border-focus);
      --ds-popover-focus-ring-width: var(--border-width-focus);
      /* React Native only; declared so every platform carries the same hook set. */
      --ds-popover-breakpoint: var(--layout-max-width-prose);
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
      background: var(--ds-popover-surface);
      box-shadow: var(--ds-popover-shadow);
      max-inline-size: min(var(--ds-popover-max-width), calc(100vw - 2 * var(--ds-popover-gutter)));
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
      outline: var(--ds-popover-focus-ring-width) solid var(--ds-popover-focus-ring);
      outline-offset: var(--ds-popover-focus-ring-width);
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

    /* The heading part is a popover-owned wrapper: <ds-heading> itself is never restyled. */
    [data-part='heading'] {
      flex: 1 1 auto;
      min-inline-size: 0;
    }

    /* The heading is focused only when the panel has no controls; its wrapper draws the ring. */
    [data-part='heading']:has(:focus-visible) {
      outline: var(--ds-popover-focus-ring-width) solid var(--ds-popover-focus-ring);
      outline-offset: var(--ds-popover-focus-ring-width);
    }

    [data-part='closeButton'] {
      display: inline-flex;
      flex: none;
    }

    [data-part='body'] {
      min-inline-size: 0;
    }

    /* arrowSize: a rotated square centered on the panel edge that faces the trigger, edged on its two outer sides. */
    [data-part='arrow'] {
      position: absolute;
      box-sizing: border-box;
      inline-size: var(--ds-popover-arrow-size);
      block-size: var(--ds-popover-arrow-size);
      background: var(--ds-popover-surface);
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
  `;constructor(){super(we),b()}}})))()}export{Te as t};