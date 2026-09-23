import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{O as t,_ as n,a as r,b as i,c as a,f as o,g as s,h as c,i as ee,o as l,p as te,r as u,t as d,u as f,v as p,w as m}from"./if-defined-CARySXJh.js";import{t as h}from"./query-BHY-nhsh.js";import{t as ne}from"./Icon-eWCe5jE3.js";import{t as g}from"./Button-B3rVveNU.js";function _(e){return`separator`in e}function v(e){return`group`in e}function re(e){return e.items.filter(e=>!_(e)&&!v(e))}function ie(e){let t=[];for(let n of e)_(n)||(v(n)?t.push(...re(n)):t.push(n));return t}function ae(e){let t=e.trim(),n=parseFloat(t);return Number.isNaN(n)?0:t.endsWith(`ms`)?n:t.endsWith(`s`)?n*1e3:n}function y(e,t){let n=getComputedStyle(e).getPropertyValue(t).trim(),r=Number.parseFloat(n);if(!Number.isFinite(r))return null;if(n.endsWith(`rem`)){let e=Number.parseFloat(getComputedStyle(document.documentElement).fontSize);return Number.isFinite(e)?r*e:null}return n.endsWith(`px`)||/^[\d.]+$/.test(n)?r:null}function oe(e){return e.matches(Q)||e.tabIndex>=0}function se(e,t,n){let r=[...document.querySelectorAll(Q)].filter(n=>!(t&&t.contains(n))&&!e.contains(n));if(n===`next`)r.find(t=>e.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_FOLLOWING)?.focus();else{let t=r.filter(t=>e.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_PRECEDING);t[t.length-1]?.focus()}}function ce(){let e=document.activeElement;for(;e?.shadowRoot?.activeElement;)e=e.shadowRoot.activeElement;return e instanceof HTMLElement?e:null}var b,x,S,C,w,T,E,D,O,k,A,j,M,N,le,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,ue,Y,X,Z,Q,de;function $(){return($=e((()=>{s(),n(),l(),d(),r(),g(),ne(),Y={border:`--ds-menu-border`,borderWidth:`--ds-menu-border-width`,shadow:`--ds-menu-shadow`,radius:`--ds-menu-radius`,popupPadding:`--ds-menu-popup-padding`,popupOffset:`--ds-menu-popup-offset`,typeaheadReset:`--ds-menu-typeahead-reset`,maxHeight:`--ds-menu-max-height`,gutter:`--ds-menu-gutter`,minWidth:`--ds-menu-min-width`,itemPaddingBlock:`--ds-menu-item-padding-block`,itemPaddingInline:`--ds-menu-item-padding-inline`,itemGap:`--ds-menu-item-gap`,itemRadius:`--ds-menu-item-radius`,groupLabelSize:`--ds-menu-group-label-size`,groupLabelWeight:`--ds-menu-group-label-weight`,shortcutSize:`--ds-menu-shortcut-size`,separator:`--ds-menu-separator`,separatorMargin:`--ds-menu-separator-margin`,fontFamily:`--ds-menu-font-family`,fontSize:`--ds-menu-font-size`,lineHeight:`--ds-menu-line-height`,layer:`--ds-menu-layer`,enter:`--ds-menu-enter`,enterDistance:`--ds-menu-enter-distance`},X=`--ds-menu-trigger-width`,Z=typeof HTMLElement<`u`&&typeof HTMLElement.prototype.showPopover==`function`,Q=[`a[href]`,`button:not([disabled])`,`input:not([disabled])`,`select:not([disabled])`,`textarea:not([disabled])`,`[contenteditable]:not([contenteditable="false"])`,`[tabindex]:not([tabindex="-1"])`].join(`,`),new class extends te{static[class extends p{static{({e:[x,S,C,w,T,E,D,O,k,A,j,M,N,le,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,ue],c:[de,b]}=c(this,[o(`ds-menu`)],[[f(),1,`label`],[f({attribute:!1}),1,`items`],[f({attribute:`trigger-variant`}),1,`triggerVariant`],[f({attribute:`trigger-icon`}),1,`triggerIcon`],[f({type:Boolean,reflect:!0,attribute:`icon-only`}),1,`iconOnly`],[f({type:String,reflect:!0}),1,`placement`],[f({type:Boolean,reflect:!0}),1,`open`],[f({attribute:!1}),1,`anchor`],[f({attribute:!1}),1,`overrides`],[a(),1,`internalOpen`],[a(),1,`activeId`],[a(),1,`tabStopSuppressed`],[h(`[data-part="trigger"]`),1,`triggerEl`],[h(`[data-part="trigger"] ds-button`),1,`buttonEl`],[h(`[data-part="popup"]`),1,`popupEl`]],0,void 0,p))}#e=x(this,``);get label(){return this.#e}set label(e){this.#e=e}#t=(S(this),C(this,[]));get items(){return this.#t}set items(e){this.#t=e}#n=(w(this),T(this,`ghost`));get triggerVariant(){return this.#n}set triggerVariant(e){this.#n=e}#r=(E(this),D(this,`chevron-down`));get triggerIcon(){return this.#r}set triggerIcon(e){this.#r=e}#i=(O(this),k(this,!1));get iconOnly(){return this.#i}set iconOnly(e){this.#i=e}#a=(A(this),j(this,`bottom-start`));get placement(){return this.#a}set placement(e){this.#a=e}#o=(M(this),N(this));get open(){return this.#o}set open(e){this.#o=e}#s=(le(this),P(this));get anchor(){return this.#s}set anchor(e){this.#s=e}#c=(F(this),I(this));get overrides(){return this.#c}set overrides(e){this.#c=e}#l=(L(this),R(this,!1));get internalOpen(){return this.#l}set internalOpen(e){this.#l=e}#u=(z(this),B(this,null));get activeId(){return this.#u}set activeId(e){this.#u=e}#d=(V(this),H(this,!1));get tabStopSuppressed(){return this.#d}set tabStopSuppressed(e){this.#d=e}#f=(U(this),W(this));get triggerEl(){return this.#f}set triggerEl(e){this.#f=e}#p=(G(this),K(this));get buttonEl(){return this.#p}set buttonEl(e){this.#p=e}#m=(q(this),J(this));get popupEl(){return this.#m}set popupEl(e){this.#m=e}wasOpen=(ue(this),!1);pendingFocus=`first`;restoreOnClose=!1;opener=null;typeaheadBuffer=``;typeaheadTimer;focusLossReported=!1;warnedNothingToPress=!1;get currentOpen(){return this.open??this.internalOpen}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Menu`),this.addEventListener(`focusout`,this.handleFocusOut),this.addEventListener(`focusin`,this.handleFocusIn)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`focusout`,this.handleFocusOut),this.removeEventListener(`focusin`,this.handleFocusIn),this.removeGlobalListeners(),clearTimeout(this.typeaheadTimer),this.wasOpen=!1}willUpdate(e){e.has(`overrides`)&&this.applyOverrides()}updated(){let e=this.currentOpen;e!==this.wasOpen&&(this.wasOpen=e,e?this.handleOpened():this.handleClosed())}render(){let e=this.currentOpen,t=this.navigableItems(),n=this.tabStopSuppressed?null:this.activeId??t[0]?.id??null,r=0,a=e=>m`
      <div
        data-part="item"
        role="menuitem"
        data-id=${e.id}
        data-tone=${u(e.tone===`danger`?`danger`:void 0)}
        tabindex=${n===e.id&&!e.disabled?0:-1}
        aria-disabled=${u(e.disabled?`true`:void 0)}
        @click=${()=>this.handleItemClick(e)}
        @focus=${()=>this.handleItemFocus(e)}
        @pointerenter=${()=>this.handleItemPointerEnter(e)}
      >
        ${e.icon?m`<ds-icon data-part="itemIcon" name=${e.icon}></ds-icon>`:i}
        <span class="label">${e.label}</span>
        ${e.shortcut?m`<span data-part="itemShortcut" aria-hidden="true">${e.shortcut}</span>`:i}
      </div>
    `,o=this.items.map(e=>{if(_(e))return m`<div data-part="separator" role="separator"></div>`;if(v(e)){let t=`group-label-${r++}`;return m`
          <div data-part="group" role="group" aria-labelledby=${t}>
            <div data-part="groupLabel" id=${t} role="presentation">${e.group}</div>
            ${re(e).map(a)}
          </div>
        `}return a(e)}),s=this.triggerIcon===`none`?i:m`<ds-icon slot=${this.iconOnly?`leading-icon`:`trailing-icon`} name=${this.triggerIcon}></ds-icon>`;return m`
      ${this.anchor?i:m`
            <span data-part="trigger">
              <ds-button
                variant=${this.triggerVariant}
                label=${this.label}
                ?icon-only=${this.iconOnly}
                .expanded=${e}
                .haspopup=${`menu`}
                @press=${this.handleTriggerPress}
                @keydown=${this.handleTriggerKeydown}
              >
                ${s}
              </ds-button>
            </span>
          `}
      <div
        id="menu"
        part="popup list"
        data-part="popup"
        role="menu"
        aria-label=${this.label}
        popover=${u(Z?`manual`:void 0)}
        ?hidden=${!Z&&!e}
        @keydown=${this.handleMenuKeydown}
      >
        ${o}
      </div>
    `}requestOpen(e,t){e!==this.currentOpen&&(this.open===void 0&&(this.internalOpen=e),this.dispatchEvent(new CustomEvent(`open-change`,{detail:{open:e,reason:t},bubbles:!0,composed:!0})))}handleOpened(){this.tabStopSuppressed=!1,this.focusLossReported=!1,this.anchor&&(this.opener=ce());let e=this.popupEl;e&&Z&&!e.matches(`:popover-open`)&&e.showPopover(),this.updatePosition(),this.addGlobalListeners(),this.focusItem(this.pendingFocus),this.pendingFocus=`first`}handleClosed(){this.removeGlobalListeners();let e=this.shadowRoot?.activeElement??null,t=e!==null&&(this.popupEl?.contains(e)??!1);this.hidePopup(),(this.restoreOnClose||t)&&this.restoreFocus(),this.restoreOnClose=!1,this.activeId=null,this.opener=null,this.typeaheadBuffer=``}hidePopup(){let e=this.popupEl;e&&(Z?e.matches(`:popover-open`)&&e.hidePopover():e.hidden=!0)}restoreFocus(){(this.anchor?this.opener:this.buttonEl)?.focus()}closeAndRestore(e){this.restoreOnClose=!0,this.requestOpen(!1,e)}handleTriggerPress=e=>{e.stopPropagation(),this.currentOpen?this.closeAndRestore(`trigger`):(this.pendingFocus=`first`,this.requestOpen(!0,`trigger`))};handleTriggerKeydown=e=>{let t=e.key;if(t===`ArrowDown`||t===`ArrowUp`){e.preventDefault();let n=t===`ArrowDown`?`first`:`last`;this.pendingFocus=n,this.currentOpen?this.focusItem(n):this.requestOpen(!0,`trigger`)}else t===`Escape`&&this.currentOpen&&(e.preventDefault(),e.stopPropagation(),this.requestOpen(!1,`escape`))};handleMenuKeydown=e=>{let t=e.key;if(t===`ArrowDown`)e.preventDefault(),this.moveFocus(1);else if(t===`ArrowUp`)e.preventDefault(),this.moveFocus(-1);else if(t===`Home`)e.preventDefault(),this.focusItem(`first`);else if(t===`End`)e.preventDefault(),this.focusItem(`last`);else if(t===`Enter`||t===` `){e.preventDefault();let t=this.focusedActionId(),n=this.navigableItems().find(e=>e.id===t);n&&this.selectItem(n)}else t===`Escape`?(e.preventDefault(),e.stopPropagation(),this.closeAndRestore(`escape`)):t===`Tab`?this.handleTab(e):t.length===1&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&(e.preventDefault(),this.typeahead(t))};handleTab(e){this.focusLossReported=!0;let t=this.anchor??null,n=this.buttonEl??(t&&oe(t)?t:null);if(n){for(let e of this.itemElements())e.tabIndex!==-1&&(e.tabIndex=-1);this.tabStopSuppressed=!0,this.activeId=null,n.focus(),this.requestOpen(!1,`tab-out`);return}e.preventDefault(),this.requestOpen(!1,`tab-out`),t&&se(t,this.popupEl,e.shiftKey?`previous`:`next`)}handleItemClick(e){e.disabled||this.selectItem(e)}handleItemFocus(e){this.tabStopSuppressed=!1,!e.disabled&&this.activeId!==e.id&&(this.activeId=e.id)}handleItemPointerEnter(e){!e.disabled&&this.currentOpen&&this.focusItem(e.id)}isInside(e){return e instanceof Node?e===this||this.contains(e)||this.renderRoot.contains(e)||(this.anchor?.contains(e)??!1):!1}handleOutsidePointerDown=e=>{e.composedPath().some(e=>this.isInside(e))||this.requestOpen(!1,`outside`)};handleFocusOut=e=>{this.currentOpen&&(this.isInside(e.relatedTarget)||this.reportFocusLoss())};handleFocusIn=()=>{this.focusLossReported=!1};handleWindowBlur=()=>{this.currentOpen&&this.reportFocusLoss()};reportFocusLoss(){this.focusLossReported||(this.focusLossReported=!0,this.requestOpen(!1,`focus-out`))}handleReposition=()=>{this.currentOpen&&this.updatePosition()};addGlobalListeners(){document.addEventListener(`pointerdown`,this.handleOutsidePointerDown,!0),window.addEventListener(`scroll`,this.handleReposition,!0),window.addEventListener(`resize`,this.handleReposition),window.addEventListener(`blur`,this.handleWindowBlur)}removeGlobalListeners(){document.removeEventListener(`pointerdown`,this.handleOutsidePointerDown,!0),window.removeEventListener(`scroll`,this.handleReposition,!0),window.removeEventListener(`resize`,this.handleReposition),window.removeEventListener(`blur`,this.handleWindowBlur)}navigableItems(){return ie(this.items).filter(e=>!e.disabled)}itemElements(){return[...this.renderRoot.querySelectorAll(`[data-part="item"]`)]}focusedActionId(){let e=this.shadowRoot?.activeElement;if(e instanceof HTMLElement){let t=e.closest(`[data-part="item"]`)?.dataset.id;if(t!==void 0)return t}return this.activeId}async focusItem(e){let t=this.navigableItems();if(t.length===0)return;let n=e===`first`?t[0].id:e===`last`?t[t.length-1].id:e;this.tabStopSuppressed=!1,this.activeId=n,await this.updateComplete,this.renderRoot.querySelector(`[data-part="item"][data-id="${CSS.escape(n)}"]`)?.focus()}moveFocus(e){let t=this.navigableItems();if(t.length===0)return;let n=t.findIndex(e=>e.id===this.focusedActionId()),r=n===-1?e===1?0:t.length-1:(n+e+t.length)%t.length;this.focusItem(t[r].id)}selectItem(e){this.closeAndRestore(`action`),this.dispatchEvent(new CustomEvent(`action`,{detail:{id:e.id},bubbles:!0,composed:!0}))}typeahead(e){clearTimeout(this.typeaheadTimer),this.typeaheadBuffer+=e.toLowerCase();let t=this.navigableItems(),n=Math.max(0,t.findIndex(e=>e.id===this.focusedActionId())),r=this.typeaheadBuffer.length===1?n+1:n;for(let e=0;e<t.length;e++){let n=t[(r+e)%t.length];if(n.label.toLowerCase().startsWith(this.typeaheadBuffer)){this.focusItem(n.id);break}}let i=this.popupEl??this,a=ae(getComputedStyle(i).getPropertyValue(Y.typeaheadReset));this.typeaheadTimer=setTimeout(()=>{this.typeaheadBuffer=``},a)}updatePosition(){let e=this.anchor??this.triggerEl,t=this.popupEl;if(!e||!t)return;let n=this.anchor?`0px`:`${e.getBoundingClientRect().width}px`;t.style.getPropertyValue(X)!==n&&t.style.setProperty(X,n);let r=y(t,Y.popupOffset)??0,i=y(t,Y.gutter)??0,a=getComputedStyle(e).direction===`rtl`,o=e.getBoundingClientRect(),s=t.offsetWidth,c=t.offsetHeight,ee=window.innerWidth,l=window.innerHeight,[te,u]=this.placement.split(`-`),d=c+r+i,f=te;f===`bottom`&&o.bottom+d>l&&o.top-d>=0?f=`top`:f===`top`&&o.top-d<0&&o.bottom+d<=l&&(f=`bottom`);let p=(a?u===`end`:u===`start`)?o.left:o.right-s,m=ee-i-s,h=m<i?a?m:i:Math.min(Math.max(p,i),m),ne=f===`bottom`?o.bottom+r:o.top-r-c,g=Math.max(i,Math.min(ne,l-i-c));t.dataset.side!==f&&(t.dataset.side=f),t.style.left=`${h}px`,t.style.right=`auto`,t.style.top=`${g}px`,t.style.bottom=`auto`}applyOverrides(){for(let e of Object.keys(Y)){let t=this.overrides?.[e],n=Y[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,ee(t))}}}];shadowRootOptions={...p.shadowRootOptions,delegatesFocus:!0};styles=t`
    :host {
      display: inline-block;
      --ds-menu-border: var(--color-border);
      --ds-menu-border-width: var(--border-width-thin);
      --ds-menu-shadow: var(--shadow-overlay);
      --ds-menu-radius: var(--radius-md);
      --ds-menu-popup-padding: var(--space-1);
      --ds-menu-popup-offset: var(--space-1);
      --ds-menu-typeahead-reset: var(--motion-duration-loop);
      --ds-menu-max-height: var(--layout-max-width-prose);
      --ds-menu-gutter: var(--layout-gutter);
      --ds-menu-min-width: var(--space-20);
      --ds-menu-item-padding-block: var(--space-sm);
      --ds-menu-item-padding-inline: var(--space-md);
      --ds-menu-item-gap: var(--layout-gap-normal);
      --ds-menu-item-radius: var(--radius-sm);
      --ds-menu-group-label-size: var(--font-size-xs);
      --ds-menu-group-label-weight: var(--font-weight-semibold);
      --ds-menu-shortcut-size: var(--font-size-sm);
      --ds-menu-separator: var(--color-border);
      --ds-menu-separator-margin: var(--space-1);
      --ds-menu-font-family: var(--font-family-body);
      --ds-menu-font-size: var(--font-size-md);
      --ds-menu-line-height: var(--font-line-height-normal);
      --ds-menu-layer: var(--layer-dropdown);
      --ds-menu-enter: var(--motion-duration-fast);
      --ds-menu-enter-distance: var(--space-1);
      /* Locked bindings: outside the overrides type, but still hooks so page CSS can re-theme them. */
      --ds-menu-surface: var(--color-overlay-surface);
      /* phoneBreakpoint is read on rn only; declared here so the binding stays renameable. */
      --ds-menu-phone-breakpoint: var(--layout-max-width-prose);
      --ds-menu-item-hover: var(--color-background-subtle);
      --ds-menu-item-color: var(--color-foreground);
      --ds-menu-item-danger-color: var(--color-foreground-danger);
      --ds-menu-group-label-color: var(--color-foreground-muted);
      --ds-menu-shortcut-color: var(--color-foreground-muted);
      --ds-menu-min-target: var(--size-target-min);
      --ds-menu-focus-ring: var(--color-border-focus);
      --ds-menu-focus-ring-width: var(--border-width-focus);
    }

    :host([hidden]) {
      display: none;
    }

    [data-part='trigger'] {
      display: inline-flex;
    }

    [data-part='popup'] {
      position: fixed;
      inset: auto;
      box-sizing: border-box;
      margin: 0;
      padding: var(--ds-menu-popup-padding);
      border-style: solid;
      border-width: var(--ds-menu-border-width);
      border-color: var(--ds-menu-border);
      border-radius: var(--ds-menu-radius);
      /* surface: color.overlay.surface, locked */
      background: var(--ds-menu-surface);
      box-shadow: var(--ds-menu-shadow);
      color: var(--ds-menu-item-color);
      z-index: var(--ds-menu-layer);
      /* minWidth: an override replaces the base; the × 2.5 stays in the rule, and the trigger's
         measured width is the runtime floor (0 in anchor mode, which has no trigger). */
      min-inline-size: max(calc(var(--ds-menu-min-width) * 2.5), var(--ds-menu-trigger-width, 0px));
      max-inline-size: calc(100vw - 2 * var(--ds-menu-gutter));
      max-block-size: min(var(--ds-menu-max-height), calc(100vh - 2 * var(--ds-menu-gutter)));
      overflow-y: auto;
      font-family: var(--ds-menu-font-family);
      font-size: var(--ds-menu-font-size);
      line-height: var(--ds-menu-line-height);
      outline: none;
      opacity: 1;
      transform: translateY(0);
      transition:
        opacity var(--ds-menu-enter) var(--motion-easing-standard),
        transform var(--ds-menu-enter) var(--motion-easing-standard);
    }

    [data-part='popup'][hidden] {
      display: none;
    }

    /* enter: fade plus an enterDistance slide from the side facing the trigger, after any flip */
    @starting-style {
      [data-part='popup'][data-side='bottom'] {
        opacity: 0;
        transform: translateY(calc(-1 * var(--ds-menu-enter-distance)));
      }

      [data-part='popup'][data-side='top'] {
        opacity: 0;
        transform: translateY(var(--ds-menu-enter-distance));
      }
    }

    @media (prefers-reduced-motion: reduce) {
      [data-part='popup'] {
        transition: none;
      }
    }

    [data-part='group'] {
      display: flex;
      flex-direction: column;
    }

    /* groupLabelColor: color.foreground.muted, locked */
    [data-part='groupLabel'] {
      padding-block: var(--ds-menu-item-padding-block);
      padding-inline: var(--ds-menu-item-padding-inline);
      font-size: var(--ds-menu-group-label-size);
      font-weight: var(--ds-menu-group-label-weight);
      color: var(--ds-menu-group-label-color);
    }

    /* borderWidth also sets the separator thickness */
    [data-part='separator'] {
      block-size: var(--ds-menu-border-width);
      margin-block: var(--ds-menu-separator-margin);
      background: var(--ds-menu-separator);
    }

    [data-part='item'] {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: var(--ds-menu-item-gap);
      /* minTarget: size.target.min, locked */
      min-block-size: var(--ds-menu-min-target);
      padding-block: var(--ds-menu-item-padding-block);
      padding-inline: var(--ds-menu-item-padding-inline);
      border-radius: var(--ds-menu-item-radius);
      /* itemColor: color.foreground, locked */
      color: var(--ds-menu-item-color);
      cursor: pointer;
      user-select: none;
      outline: none;
    }

    /* itemHover: color.background.subtle, locked; keyboard focus shares it, so the highlight is
       never hover-only. The highlight changes instantly: enter is the popup's transition only. */
    [data-part='item']:hover,
    [data-part='item']:focus {
      background: var(--ds-menu-item-hover);
    }

    /* focusRing / focusRingWidth: color.border.focus / border.width.focus, locked */
    [data-part='item']:focus-visible {
      outline: var(--ds-menu-focus-ring-width) solid var(--ds-menu-focus-ring);
      outline-offset: calc(-1 * var(--ds-menu-focus-ring-width));
    }

    [data-part='item'][aria-disabled='true'] {
      opacity: var(--opacity-disabled);
      cursor: not-allowed;
    }

    [data-part='item'][aria-disabled='true']:hover {
      background: none;
    }

    /* itemDangerColor: color.foreground.danger, locked */
    [data-part='item'][data-tone='danger'] {
      color: var(--ds-menu-item-danger-color);
    }

    [data-part='itemIcon'] {
      flex: none;
    }

    .label {
      flex: 1;
      min-inline-size: 0;
    }

    /* shortcutColor: color.foreground.muted, locked */
    [data-part='itemShortcut'] {
      flex: none;
      font-size: var(--ds-menu-shortcut-size);
      color: var(--ds-menu-shortcut-color);
    }
  `;constructor(){super(de),b()}}})))()}export{$ as t};