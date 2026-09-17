import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{O as t,_ as n,a as r,b as i,c as a,f as o,g as s,h as c,i as l,o as u,p as d,r as f,t as ee,u as p,v as m,w as h}from"./if-defined-CARySXJh.js";import{t as g}from"./query-BHY-nhsh.js";import{t as te}from"./Icon-BHsrajXm.js";import{t as ne}from"./Button-DM0-zK5H.js";function _(e){return`separator`in e}function v(e){return`group`in e}function y(e){return e.items.filter(e=>!_(e)&&!v(e))}function b(e){let t=[];for(let n of e)_(n)||(v(n)?t.push(...y(n)):t.push(n));return t}function re(e){let t=e.trim(),n=parseFloat(t);return Number.isNaN(n)?0:t.endsWith(`ms`)?n:t.endsWith(`s`)?n*1e3:n}var x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{s(),n(),u(),ee(),r(),ne(),te(),X={border:`--ds-menu-border`,borderWidth:`--ds-menu-border-width`,shadow:`--ds-menu-shadow`,radius:`--ds-menu-radius`,popupPadding:`--ds-menu-popup-padding`,popupOffset:`--ds-menu-popup-offset`,typeaheadReset:`--ds-menu-typeahead-reset`,maxHeight:`--ds-menu-max-height`,minWidth:`--ds-menu-min-width`,itemPaddingBlock:`--ds-menu-item-padding-block`,itemPaddingInline:`--ds-menu-item-padding-inline`,itemGap:`--ds-menu-item-gap`,itemRadius:`--ds-menu-item-radius`,groupLabelSize:`--ds-menu-group-label-size`,groupLabelWeight:`--ds-menu-group-label-weight`,shortcutSize:`--ds-menu-shortcut-size`,separator:`--ds-menu-separator`,separatorMargin:`--ds-menu-separator-margin`,fontFamily:`--ds-menu-font-family`,fontSize:`--ds-menu-font-size`,lineHeight:`--ds-menu-line-height`,layer:`--ds-menu-layer`,enter:`--ds-menu-enter`,enterDistance:`--ds-menu-enter-distance`},Z=typeof HTMLElement<`u`&&typeof HTMLElement.prototype.showPopover==`function`,new class extends d{static[class extends m{static{({e:[S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y],c:[Q,x]}=c(this,[o(`ds-menu`)],[[p(),1,`label`],[p({attribute:!1}),1,`items`],[p({attribute:`trigger-variant`}),1,`triggerVariant`],[p({attribute:`trigger-icon`}),1,`triggerIcon`],[p({type:Boolean,reflect:!0,attribute:`icon-only`}),1,`iconOnly`],[p({type:String,reflect:!0}),1,`placement`],[p({type:Boolean,reflect:!0}),1,`open`],[p({attribute:!1}),1,`anchor`],[p({attribute:!1}),1,`overrides`],[a(),1,`internalOpen`],[a(),1,`activeId`],[g(`[data-part="trigger"]`),1,`triggerEl`],[g(`[data-part="trigger"] ds-button`),1,`buttonEl`],[g(`[data-part="popup"]`),1,`popupEl`]],0,void 0,m))}#e=S(this,``);get label(){return this.#e}set label(e){this.#e=e}#t=(C(this),w(this,[]));get items(){return this.#t}set items(e){this.#t=e}#n=(T(this),E(this,`ghost`));get triggerVariant(){return this.#n}set triggerVariant(e){this.#n=e}#r=(D(this),O(this,`chevron-down`));get triggerIcon(){return this.#r}set triggerIcon(e){this.#r=e}#i=(k(this),A(this,!1));get iconOnly(){return this.#i}set iconOnly(e){this.#i=e}#a=(j(this),M(this,`bottom-start`));get placement(){return this.#a}set placement(e){this.#a=e}#o=(N(this),P(this));get open(){return this.#o}set open(e){this.#o=e}#s=(F(this),I(this));get anchor(){return this.#s}set anchor(e){this.#s=e}#c=(L(this),R(this));get overrides(){return this.#c}set overrides(e){this.#c=e}#l=(z(this),B(this,!1));get internalOpen(){return this.#l}set internalOpen(e){this.#l=e}#u=(V(this),H(this,null));get activeId(){return this.#u}set activeId(e){this.#u=e}#d=(U(this),W(this));get triggerEl(){return this.#d}set triggerEl(e){this.#d=e}#f=(G(this),K(this));get buttonEl(){return this.#f}set buttonEl(e){this.#f=e}#p=(q(this),J(this));get popupEl(){return this.#p}set popupEl(e){this.#p=e}wasOpen=(Y(this),!1);pendingFocus=`first`;restoreOnClose=!1;typeaheadBuffer=``;typeaheadTimer;warnedNothingToPress=!1;get currentOpen(){return this.open??this.internalOpen}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Menu`),this.addEventListener(`focusout`,this.handleFocusOut)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`focusout`,this.handleFocusOut),this.removeGlobalListeners(),clearTimeout(this.typeaheadTimer),this.wasOpen=!1}willUpdate(e){e.has(`overrides`)&&this.applyOverrides()}updated(){let e=this.currentOpen;e!==this.wasOpen&&(this.wasOpen=e,e?this.handleOpened():this.handleClosed())}render(){let e=this.currentOpen,t=this.navigableItems(),n=this.activeId??t[0]?.id??null,r=0,a=e=>h`
      <div
        part="item"
        data-part="item"
        role="menuitem"
        data-id=${e.id}
        data-tone=${f(e.tone===`danger`?`danger`:void 0)}
        tabindex=${n===e.id&&!e.disabled?0:-1}
        aria-disabled=${f(e.disabled?`true`:void 0)}
        @click=${()=>this.handleItemClick(e)}
        @pointerenter=${()=>this.handleItemPointerEnter(e)}
      >
        ${e.icon?h`<ds-icon part="itemIcon" data-part="itemIcon" name=${e.icon}></ds-icon>`:i}
        <span class="label">${e.label}</span>
        ${e.shortcut?h`<span part="itemShortcut" data-part="itemShortcut" aria-hidden="true">${e.shortcut}</span>`:i}
      </div>
    `,o=this.items.map(e=>{if(_(e))return h`<div part="separator" data-part="separator" role="separator"></div>`;if(v(e)){let t=`group-label-${r++}`;return h`
          <div part="group" data-part="group" role="group" aria-labelledby=${t}>
            <div part="groupLabel" data-part="groupLabel" id=${t} role="presentation">${e.group}</div>
            ${y(e).map(a)}
          </div>
        `}return a(e)}),s=this.triggerIcon===`none`?i:h`<ds-icon slot=${this.iconOnly?`leading-icon`:`trailing-icon`} name=${this.triggerIcon}></ds-icon>`;return h`
      ${this.anchor?i:h`
            <span part="trigger" data-part="trigger">
              <ds-button
                variant=${this.triggerVariant}
                label=${this.label}
                ?icon-only=${this.iconOnly}
                .expanded=${e}
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
        popover=${f(Z?`manual`:void 0)}
        ?hidden=${!Z&&!e}
        @keydown=${this.handleMenuKeydown}
      >
        ${o}
      </div>
    `}requestOpen(e,t){e!==this.currentOpen&&(this.open===void 0&&(this.internalOpen=e),this.dispatchEvent(new CustomEvent(`open-change`,{detail:{open:e,reason:t},bubbles:!0,composed:!0})))}handleOpened(){let e=this.popupEl;e&&Z&&!e.matches(`:popover-open`)&&e.showPopover(),this.updatePosition(),this.addGlobalListeners(),this.focusItem(this.pendingFocus),this.pendingFocus=`first`}handleClosed(){this.removeGlobalListeners();let e=this.shadowRoot?.activeElement??null,t=e!==null&&(this.popupEl?.contains(e)??!1);this.hidePopup(),(this.restoreOnClose||t)&&this.restoreFocus(),this.restoreOnClose=!1,this.activeId=null,this.typeaheadBuffer=``}hidePopup(){let e=this.popupEl;e&&(Z?e.matches(`:popover-open`)&&e.hidePopover():e.hidden=!0)}restoreFocus(){(this.anchor??this.buttonEl)?.focus()}closeAndRestore(e){this.restoreOnClose=!0,this.requestOpen(!1,e)}handleTriggerPress=e=>{e.stopPropagation(),this.currentOpen?this.closeAndRestore(`trigger`):(this.pendingFocus=`first`,this.requestOpen(!0,`trigger`))};handleTriggerKeydown=e=>{(e.key===`ArrowDown`||e.key===`ArrowUp`)&&(e.preventDefault(),this.pendingFocus=e.key===`ArrowDown`?`first`:`last`,this.currentOpen?this.focusItem(this.pendingFocus):this.requestOpen(!0,`trigger`))};handleMenuKeydown=e=>{let t=e.key;if(t===`ArrowDown`)e.preventDefault(),this.moveFocus(1);else if(t===`ArrowUp`)e.preventDefault(),this.moveFocus(-1);else if(t===`Home`)e.preventDefault(),this.focusItem(`first`);else if(t===`End`)e.preventDefault(),this.focusItem(`last`);else if(t===`Enter`||t===` `){e.preventDefault();let t=this.navigableItems().find(e=>e.id===this.activeId);t&&this.selectItem(t)}else t===`Escape`?(e.preventDefault(),e.stopPropagation(),this.closeAndRestore(`escape`)):t===`Tab`?(this.restoreFocus(),this.open===void 0&&this.hidePopup(),this.requestOpen(!1,`tab-out`)):t.length===1&&/^[a-z]$/i.test(t)&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&(e.preventDefault(),this.typeahead(t))};handleItemClick(e){e.disabled||this.selectItem(e)}handleItemPointerEnter(e){!e.disabled&&this.currentOpen&&this.focusItem(e.id)}isInside(e){return e instanceof Node?e===this||this.contains(e)||this.renderRoot.contains(e)||(this.anchor?.contains(e)??!1):!1}handleOutsidePointerDown=e=>{e.composedPath().some(e=>this.isInside(e))||this.requestOpen(!1,`outside`)};handleFocusOut=e=>{this.currentOpen&&(this.isInside(e.relatedTarget)||this.requestOpen(!1,`focus-out`))};handleWindowBlur=()=>{this.requestOpen(!1,`focus-out`)};handleReposition=()=>{this.currentOpen&&this.updatePosition()};addGlobalListeners(){document.addEventListener(`pointerdown`,this.handleOutsidePointerDown,!0),window.addEventListener(`scroll`,this.handleReposition,!0),window.addEventListener(`resize`,this.handleReposition),window.addEventListener(`blur`,this.handleWindowBlur)}removeGlobalListeners(){document.removeEventListener(`pointerdown`,this.handleOutsidePointerDown,!0),window.removeEventListener(`scroll`,this.handleReposition,!0),window.removeEventListener(`resize`,this.handleReposition),window.removeEventListener(`blur`,this.handleWindowBlur)}navigableItems(){return b(this.items).filter(e=>!e.disabled)}async focusItem(e){let t=this.navigableItems();if(t.length===0)return;let n=e===`first`?t[0].id:e===`last`?t[t.length-1].id:e;this.activeId=n,await this.updateComplete,this.renderRoot.querySelector(`[data-part="item"][data-id="${CSS.escape(n)}"]`)?.focus()}moveFocus(e){let t=this.navigableItems();if(t.length===0)return;let n=t.findIndex(e=>e.id===this.activeId),r=n===-1?e===1?0:t.length-1:(n+e+t.length)%t.length;this.focusItem(t[r].id)}selectItem(e){this.closeAndRestore(`action`),this.dispatchEvent(new CustomEvent(`action`,{detail:{id:e.id},bubbles:!0,composed:!0}))}typeahead(e){clearTimeout(this.typeaheadTimer),this.typeaheadBuffer+=e.toLowerCase();let t=this.navigableItems(),n=Math.max(0,t.findIndex(e=>e.id===this.activeId)),r=this.typeaheadBuffer.length===1?n+1:n;for(let e=0;e<t.length;e++){let n=t[(r+e)%t.length];if(n.label.toLowerCase().startsWith(this.typeaheadBuffer)){this.focusItem(n.id);break}}let i=this.popupEl??this,a=re(getComputedStyle(i).getPropertyValue(X.typeaheadReset));this.typeaheadTimer=setTimeout(()=>{this.typeaheadBuffer=``},a)}updatePosition(){let e=this.anchor??this.triggerEl,t=this.popupEl;if(!e||!t)return;let n=e.getBoundingClientRect(),r=document.documentElement.clientWidth,i=document.documentElement.clientHeight,[a,o]=this.placement.split(`-`);t.style.minInlineSize=`max(calc(var(${X.minWidth}) * 2.5), ${n.width}px)`,t.dataset.side=a;let s=getComputedStyle(t),c=Math.max(parseFloat(s.marginBlockStart)||0,parseFloat(s.marginBlockEnd)||0),l=t.getBoundingClientRect(),u=a;u===`bottom`&&n.bottom+c+l.height>i&&n.top-c-l.height>=0?u=`top`:u===`top`&&n.top-c-l.height<0&&n.bottom+c+l.height<=i&&(u=`bottom`);let d=o;d===`start`&&n.left+l.width>r&&n.right-l.width>=0?d=`end`:d===`end`&&n.right-l.width<0&&n.left+l.width<=r&&(d=`start`),t.dataset.side=u,t.style.top=u===`bottom`?`${n.bottom}px`:`auto`,t.style.bottom=u===`top`?`${i-n.top}px`:`auto`,t.style.left=d===`start`?`${n.left}px`:`auto`,t.style.right=d===`end`?`${r-n.right}px`:`auto`}applyOverrides(){for(let e of Object.keys(X)){let t=this.overrides?.[e],n=X[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,l(t))}}}];shadowRootOptions={...m.shadowRootOptions,delegatesFocus:!0};styles=t`
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
      background: var(--color-overlay-surface);
      box-shadow: var(--ds-menu-shadow);
      color: var(--color-foreground);
      z-index: var(--ds-menu-layer);
      /* minWidth: an override replaces the base; the × 2.5 stays in the rule */
      min-inline-size: calc(var(--ds-menu-min-width) * 2.5);
      max-inline-size: calc(100vw - 2 * var(--layout-gutter));
      max-block-size: min(var(--ds-menu-max-height), calc(100vh - 2 * var(--layout-gutter)));
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

    /* popupOffset: the gap between trigger and popup, on the side facing the trigger */
    [data-part='popup'][data-side='bottom'] {
      margin-block-start: var(--ds-menu-popup-offset);
    }

    [data-part='popup'][data-side='top'] {
      margin-block-end: var(--ds-menu-popup-offset);
    }

    [data-part='popup'][hidden] {
      display: none;
    }

    /* enter: fade plus an enterDistance slide from the trigger side */
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
      color: var(--color-foreground-muted);
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
      min-block-size: var(--size-target-min);
      padding-block: var(--ds-menu-item-padding-block);
      padding-inline: var(--ds-menu-item-padding-inline);
      border-radius: var(--ds-menu-item-radius);
      /* itemColor: color.foreground, locked */
      color: var(--color-foreground);
      cursor: pointer;
      user-select: none;
      outline: none;
    }

    /* itemHover: color.background.subtle, locked; keyboard focus shares it, so the highlight is never hover-only */
    [data-part='item']:hover,
    [data-part='item']:focus {
      background: var(--color-background-subtle);
    }

    /* focusRing / focusRingWidth: color.border.focus / border.width.focus, locked */
    [data-part='item']:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: calc(-1 * var(--border-width-focus));
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
      color: var(--color-foreground-danger);
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
      color: var(--color-foreground-muted);
    }
  `;constructor(){super(Q),x()}}})))()}export{$ as t};