import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{C as t,a as n,c as r,d as i,f as a,h as o,p as s,r as c,s as l,t as u,u as d,y as f}from"./decorators-BlUBDG4K.js";import{t as p}from"./query-BHY-nhsh.js";import{a as m,i as h,r as g,t as _}from"./if-defined-BfpvQ5_i.js";import{t as v}from"./Icon-CGupucWg.js";import{t as y}from"./Button-TSn-G4Vm.js";function b(e){return`separator`in e}function x(e){return`group`in e}function S(e){let t=[];for(let n of e)b(n)||(x(n)?t.push(...S(n.items)):t.push(n));return t}var C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{i(),a(),u(),_(),m(),y(),v(),X={border:`--ds-menu-border`,borderWidth:`--ds-menu-border-width`,shadow:`--ds-menu-shadow`,radius:`--ds-menu-radius`,popupPadding:`--ds-menu-popup-padding`,popupOffset:`--ds-menu-popup-offset`,typeaheadReset:`--ds-menu-typeahead-reset`,maxHeight:`--ds-menu-max-height`,minWidth:`--ds-menu-min-width`,itemPaddingBlock:`--ds-menu-item-padding-block`,itemPaddingInline:`--ds-menu-item-padding-inline`,itemGap:`--ds-menu-item-gap`,itemRadius:`--ds-menu-item-radius`,groupLabelSize:`--ds-menu-group-label-size`,groupLabelWeight:`--ds-menu-group-label-weight`,shortcutSize:`--ds-menu-shortcut-size`,separator:`--ds-menu-separator`,separatorMargin:`--ds-menu-separator-margin`,fontFamily:`--ds-menu-font-family`,fontSize:`--ds-menu-font-size`,lineHeight:`--ds-menu-line-height`,layer:`--ds-menu-layer`,enter:`--ds-menu-enter`},Z=typeof HTMLElement<`u`&&typeof HTMLElement.prototype.showPopover==`function`,new class extends r{static[class extends s{static{({e:[w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y],c:[Q,C]}=d(this,[l(`ds-menu`)],[[n(),1,`label`],[n({attribute:!1}),1,`items`],[n({attribute:`trigger-variant`}),1,`triggerVariant`],[n({attribute:`trigger-icon`}),1,`triggerIcon`],[n({type:Boolean,reflect:!0,attribute:`icon-only`}),1,`iconOnly`],[n({reflect:!0}),1,`placement`],[n({type:Boolean,reflect:!0}),1,`open`],[n({attribute:!1}),1,`anchor`],[n({attribute:!1}),1,`overrides`],[c(),1,`internalOpen`],[c(),1,`activeId`],[p(`#trigger`),1,`triggerButtonEl`],[p(`.popup`),1,`popupEl`]],0,void 0,s))}#e=w(this);get label(){return this.#e}set label(e){this.#e=e}#t=(T(this),E(this,[]));get items(){return this.#t}set items(e){this.#t=e}#n=(D(this),O(this,`ghost`));get triggerVariant(){return this.#n}set triggerVariant(e){this.#n=e}#r=(k(this),A(this,`chevron-down`));get triggerIcon(){return this.#r}set triggerIcon(e){this.#r=e}#i=(j(this),M(this,!1));get iconOnly(){return this.#i}set iconOnly(e){this.#i=e}#a=(N(this),P(this,`bottom-start`));get placement(){return this.#a}set placement(e){this.#a=e}#o=(F(this),I(this));get open(){return this.#o}set open(e){this.#o=e}#s=(L(this),R(this));get anchor(){return this.#s}set anchor(e){this.#s=e}#c=(z(this),B(this));get overrides(){return this.#c}set overrides(e){this.#c=e}#l=(V(this),H(this,!1));get internalOpen(){return this.#l}set internalOpen(e){this.#l=e}#u=(U(this),W(this,null));get activeId(){return this.#u}set activeId(e){this.#u=e}#d=(G(this),K(this));get triggerButtonEl(){return this.#d}set triggerButtonEl(e){this.#d=e}#f=(q(this),J(this));get popupEl(){return this.#f}set popupEl(e){this.#f=e}popoverSupported=(Y(this),Z);wasOpen=!1;pendingFocus=`first`;typeaheadQuery=``;typeaheadTimer;get currentOpen(){return this.open??this.internalOpen}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Menu`)}disconnectedCallback(){super.disconnectedCallback(),this.removeGlobalListeners(),clearTimeout(this.typeaheadTimer)}willUpdate(e){e.has(`overrides`)&&this.applyOverrides()}updated(){let e=this.currentOpen;e!==this.wasOpen&&(this.wasOpen=e,e?this.handleOpened():this.handleClosed()),this.warnInDev()}render(){let e=0,t=n=>n.map(n=>{if(b(n))return f`<div class="separator" part="separator" role="separator"></div>`;if(x(n)){let r=`group-label-${e++}`;return f`
            <div class="group" part="group" role="group" aria-labelledby=${r}>
              <div class="group-label" part="group-label" id=${r}>${n.group}</div>
              ${t(n.items)}
            </div>
          `}return this.renderActionItem(n)}),n=this.currentOpen,r=this.triggerIcon===`ellipsis`?`ellipsis`:`chevron-down`;return f`
      ${this.anchor?o:f`
            <ds-button
              id="trigger"
              class="trigger"
              part="trigger"
              variant=${this.triggerVariant}
              label=${this.label}
              ?icon-only=${this.iconOnly}
              aria-haspopup="menu"
              aria-expanded=${n?`true`:`false`}
              aria-controls="list"
              @press=${this.handleTriggerPress}
              @keydown=${this.handleTriggerKeydown}
            >
              ${this.triggerIcon===`none`?o:f`<ds-icon slot="trailing-icon" name=${r}></ds-icon>`}
            </ds-button>
          `}
      <div
        class="popup"
        part="popup"
        popover=${this.popoverSupported?`manual`:o}
        ?hidden=${!this.popoverSupported&&!n}
      >
        <div
          id="list"
          class="list"
          part="list"
          role="menu"
          aria-label=${this.anchor?this.label:o}
          aria-labelledby=${this.anchor?o:`trigger`}
          tabindex="-1"
          @keydown=${this.handleListKeydown}
        >
          ${t(this.items)}
        </div>
      </div>
    `}renderActionItem(e){return f`
      <div
        class="item"
        part="item"
        role="menuitem"
        data-id=${e.id}
        data-tone=${g(e.tone===`danger`?`danger`:void 0)}
        tabindex=${this.activeId===e.id?0:-1}
        aria-disabled=${g(e.disabled?`true`:void 0)}
        @click=${()=>this.handleItemClick(e)}
        @pointerenter=${()=>this.handleItemPointerEnter(e)}
      >
        ${e.icon?f`<ds-icon class="item-icon" part="item-icon" name=${e.icon}></ds-icon>`:o}
        <span class="item-label" part="item-label">${e.label}</span>
        ${e.shortcut?f`<span class="item-shortcut" part="item-shortcut" aria-hidden="true">${e.shortcut}</span>`:o}
      </div>
    `}handleTriggerPress=e=>{e.stopPropagation(),this.openMenu(`first`)};handleTriggerKeydown=e=>{e.key===`ArrowDown`?(e.preventDefault(),this.openMenu(`first`)):e.key===`ArrowUp`&&(e.preventDefault(),this.openMenu(`last`))};handleListKeydown=e=>{let t=e.key;t===`ArrowDown`?(e.preventDefault(),this.moveFocus(1)):t===`ArrowUp`?(e.preventDefault(),this.moveFocus(-1)):t===`Home`?(e.preventDefault(),this.focusItem(`first`)):t===`End`?(e.preventDefault(),this.focusItem(`last`)):t===`Enter`||t===` `?(e.preventDefault(),this.activateActiveItem()):t===`Escape`?(e.preventDefault(),this.closeMenu(!0)):t===`Tab`?(this.hidePopupImmediately(),this.closeMenu(!1)):t.length===1&&/[a-z]/i.test(t)&&this.handleTypeahead(t)};handleItemClick=e=>{e.disabled||this.selectItem(e)};handleItemPointerEnter=e=>{e.disabled||this.focusItem(e.id)};handleOutsidePointerDown=e=>{e.composedPath().includes(this)||this.closeMenu(!1)};handleReposition=()=>{this.currentOpen&&this.updatePosition()};handleWindowBlur=()=>{this.closeMenu(!1)};openMenu(e){this.currentOpen||(this.pendingFocus=e,this.setOpen(!0))}closeMenu(e){this.currentOpen&&(this.setOpen(!1),e&&(this.anchor??this.triggerButtonEl)?.focus())}setOpen(e){this.open===void 0?this.internalOpen=e:this.open=e}handleOpened(){this.activeId=null,this.popoverSupported&&this.popupEl.showPopover(),this.updatePosition(),this.addGlobalListeners(),this.focusItem(this.pendingFocus),this.dispatchOpenChange(!0)}handleClosed(){this.removeGlobalListeners(),this.hidePopupImmediately(),this.activeId=null,this.dispatchOpenChange(!1)}hidePopupImmediately(){this.popoverSupported?this.popupEl.matches(`:popover-open`)&&this.popupEl.hidePopover():this.popupEl.hidden=!0}addGlobalListeners(){document.addEventListener(`pointerdown`,this.handleOutsidePointerDown,!0),window.addEventListener(`scroll`,this.handleReposition,!0),window.addEventListener(`resize`,this.handleReposition),window.addEventListener(`blur`,this.handleWindowBlur)}removeGlobalListeners(){document.removeEventListener(`pointerdown`,this.handleOutsidePointerDown,!0),window.removeEventListener(`scroll`,this.handleReposition,!0),window.removeEventListener(`resize`,this.handleReposition),window.removeEventListener(`blur`,this.handleWindowBlur)}navigableItems(){return S(this.items).filter(e=>!e.disabled)}async focusItem(e){let t=this.navigableItems();if(t.length===0)return;let n=e===`first`?t[0].id:e===`last`?t[t.length-1].id:e;this.activeId=n,await this.updateComplete,this.renderRoot.querySelector(`[data-id="${CSS.escape(n)}"]`)?.focus()}moveFocus(e){let t=this.navigableItems();if(t.length===0)return;let n=t.findIndex(e=>e.id===this.activeId)+e;n<0?n=t.length-1:n>=t.length&&(n=0),this.focusItem(t[n].id)}activateActiveItem(){let e=this.navigableItems().find(e=>e.id===this.activeId);e&&this.selectItem(e)}selectItem(e){this.closeMenu(!0),this.dispatchEvent(new CustomEvent(`action`,{detail:{id:e.id},bubbles:!0,composed:!0}))}handleTypeahead(e){clearTimeout(this.typeaheadTimer),this.typeaheadQuery+=e.toLowerCase();let t=this.typeaheadQuery,n=this.navigableItems().find(e=>e.label.toLowerCase().startsWith(t));n&&this.focusItem(n.id);let r=parseFloat(getComputedStyle(this).getPropertyValue(`--ds-menu-typeahead-reset`))||0;this.typeaheadTimer=setTimeout(()=>{this.typeaheadQuery=``},r)}updatePosition(){let e=this.anchor??this.triggerButtonEl,t=this.popupEl;if(!e||!t)return;let n=e.getBoundingClientRect(),r=t.getBoundingClientRect(),i=document.documentElement.clientWidth,a=document.documentElement.clientHeight,o=parseFloat(getComputedStyle(t).getPropertyValue(`--ds-menu-popup-offset`))||0,[s,c]=this.placement.split(`-`),l=s;s===`bottom`&&n.bottom+o+r.height>a?l=`top`:s===`top`&&n.top-o-r.height<0&&(l=`bottom`);let u=c;c===`start`&&n.left+r.width>i?u=`end`:c===`end`&&n.right-r.width<0&&(u=`start`),t.style.top=l===`bottom`?`${n.bottom+o}px`:`auto`,t.style.bottom=l===`top`?`${a-n.top+o}px`:`auto`,t.style.left=u===`start`?`${n.left}px`:`auto`,t.style.right=u===`end`?`${i-n.right}px`:`auto`,t.style.minWidth=`max(var(--ds-menu-min-width), ${n.width}px)`}dispatchOpenChange(e){this.dispatchEvent(new CustomEvent(`open-change`,{detail:{open:e},bubbles:!0,composed:!0}))}applyOverrides(){for(let e of Object.keys(X)){let t=this.overrides?.[e],n=X[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,h(t))}}warnInDev(){}}];shadowRootOptions={...s.shadowRootOptions,delegatesFocus:!0};styles=t`
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
      --ds-menu-min-width: calc(var(--space-20) * 2.5);
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
    }

    :host([hidden]) {
      display: none;
    }

    .popup {
      position: fixed;
      inset: auto;
      box-sizing: border-box;
      margin: 0;
      padding: var(--ds-menu-popup-padding);
      border-style: solid;
      border-width: var(--ds-menu-border-width);
      border-color: var(--ds-menu-border);
      border-radius: var(--ds-menu-radius);
      /* surface: color.overlay.surface, locked — no override hook */
      background: var(--color-overlay-surface);
      box-shadow: var(--ds-menu-shadow);
      z-index: var(--ds-menu-layer);
      max-inline-size: calc(100vw - 2 * var(--layout-gutter));
      max-block-size: min(var(--ds-menu-max-height), calc(100vh - 2 * var(--layout-gutter)));
      overflow-y: auto;
      opacity: 1;
      transform: translateY(0);
      transition:
        opacity var(--ds-menu-enter) var(--motion-easing-standard),
        transform var(--ds-menu-enter) var(--motion-easing-standard);
    }

    .popup[hidden] {
      display: none;
    }

    @starting-style {
      .popup:popover-open {
        opacity: 0;
        transform: translateY(var(--space-1));
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .popup {
        transition: none;
      }
    }

    .list {
      display: flex;
      flex-direction: column;
      gap: var(--ds-menu-item-gap);
      font-family: var(--ds-menu-font-family);
      font-size: var(--ds-menu-font-size);
      line-height: var(--ds-menu-line-height);
      outline: none;
    }

    .group {
      display: flex;
      flex-direction: column;
      gap: var(--ds-menu-item-gap);
    }

    /* groupLabelColor: color.foreground.muted, locked */
    .group-label {
      padding-block: var(--space-sm);
      padding-inline: var(--ds-menu-item-padding-inline);
      font-size: var(--ds-menu-group-label-size);
      font-weight: var(--ds-menu-group-label-weight);
      color: var(--color-foreground-muted);
    }

    .separator {
      block-size: var(--border-width-thin);
      margin-block: var(--ds-menu-separator-margin);
      background: var(--ds-menu-separator);
    }

    .item {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      min-block-size: var(--size-target-min);
      padding-block: var(--ds-menu-item-padding-block);
      padding-inline: var(--ds-menu-item-padding-inline);
      border-radius: var(--ds-menu-item-radius);
      /* itemColor: color.foreground, locked */
      color: var(--color-foreground);
      cursor: pointer;
      user-select: none;
    }

    /* itemHover: color.background.subtle, locked — pointer hover and keyboard focus share it, so the highlight is never hover-only */
    .item:hover,
    .item:focus {
      outline: none;
      background: var(--color-background-subtle);
    }

    /* focusRing / focusRingWidth: color.border.focus / border.width.focus, locked */
    .item:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: calc(-1 * var(--border-width-focus));
    }

    .item[aria-disabled='true'] {
      opacity: var(--opacity-disabled);
      cursor: not-allowed;
    }

    /* itemDangerColor: color.foreground.danger, locked */
    .item[data-tone='danger'] {
      color: var(--color-foreground-danger);
    }

    .item-icon {
      flex: none;
    }

    .item-label {
      flex: 1;
      min-inline-size: 0;
    }

    /* shortcutColor: color.foreground.muted, locked */
    .item-shortcut {
      flex: none;
      font-size: var(--ds-menu-shortcut-size);
      color: var(--color-foreground-muted);
    }
  `;constructor(){super(Q),C()}}})))()}export{$ as t};