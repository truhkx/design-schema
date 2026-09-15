import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{C as t,a as n,c as r,d as i,f as a,h as o,p as s,r as c,s as ee,t as te,u as ne,y as l}from"./decorators-BlUBDG4K.js";import{t as u}from"./query-BHY-nhsh.js";import{a as re,i as ie,r as d,t as ae}from"./if-defined-BfpvQ5_i.js";import{t as oe}from"./Icon-CGupucWg.js";import{n as f,t as se}from"./class-map-ByT5L8jj.js";import{t as ce}from"./Text-Dgpz9DWN.js";import{t as le}from"./Listbox-a8TGJQEp.js";function p(e){return`group`in e}function m(e){let t=[];for(let n of e)p(n)?t.push(...m(n.options)):t.push(n);return t}var h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,ue,I,L,R,z,B,V,H,U,W,G,K,q,J,de,fe,pe,me,he,ge,_e,ve,ye,be,xe,Se,Ce,Y,X,we,Te,Z,Q,Ee,De;function $(){return($=e((()=>{i(),a(),te(),ae(),se(),re(),ce(),oe(),le(),Y={triggerBorderFocus:`--ds-select-trigger-border-focus`,triggerBorderInvalid:`--ds-select-trigger-border-invalid`,triggerBorderWidth:`--ds-select-trigger-border-width`,triggerRadius:`--ds-select-trigger-radius`,triggerPaddingInline:`--ds-select-trigger-padding-inline`,triggerPaddingBlock:`--ds-select-trigger-padding-block`,triggerPaddingBlockSm:`--ds-select-trigger-padding-block-sm`,triggerGap:`--ds-select-trigger-gap`,partGap:`--ds-select-part-gap`,labelWeight:`--ds-select-label-weight`,helperSize:`--ds-select-helper-size`,popupSurface:`--ds-select-popup-surface`,popupBorder:`--ds-select-popup-border`,popupShadow:`--ds-select-popup-shadow`,popupRadius:`--ds-select-popup-radius`,popupOffset:`--ds-select-popup-offset`,layer:`--ds-select-layer`,fontFamily:`--ds-select-font-family`,fontSize:`--ds-select-font-size`,lineHeight:`--ds-select-line-height`,minTargetSm:`--ds-select-min-target-sm`,disabledOpacity:`--ds-select-disabled-opacity`,enter:`--ds-select-enter`},X=`Select…`,we=e=>`${e} selected`,Te=e=>`${e} is required.`,Z=e=>`${e} is not valid.`,Q=` (required)`,Ee=typeof HTMLElement<`u`&&typeof HTMLElement.prototype.showPopover==`function`,new class extends r{static[class extends s{static{({e:[_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,ue,I,L,R,z,B,V,H,U,W,G,K,q,J,de,fe,pe,me,he,ge,_e,ve,ye,be,xe,Se,Ce,h],c:[De,g]}=ne(this,[ee(`ds-select`)],[[n(),1,`label`],[n(),1,`name`],[n({attribute:!1}),1,`options`],[n({attribute:!1}),1,`value`],[n({attribute:!1}),1,`defaultValue`],[n(),1,`placeholder`],[n({type:Boolean,attribute:`hide-label`}),1,`hideLabel`],[n({reflect:!0}),1,`size`],[n({type:Boolean,reflect:!0}),1,`open`],[n({type:Boolean,reflect:!0}),1,`multiple`],[n(),1,`description`],[n({type:Boolean,reflect:!0}),1,`required`],[n({type:Boolean,reflect:!0}),1,`disabled`],[n({type:Boolean,reflect:!0}),1,`invalid`],[n(),4,`error`],[n({reflect:!0}),1,`native`],[n({attribute:!1}),1,`overrides`],[c(),1,`internalValue`],[c(),1,`internalOpen`],[c(),1,`formDisabled`],[u(`#trigger`),1,`triggerEl`],[u(`#native-select`),1,`nativeSelectEl`],[u(`#listbox`),1,`listboxEl`],[u(`#popup`),1,`popupEl`]],0,void 0,s))}#e=(h(this),_(this));get label(){return this.#e}set label(e){this.#e=e}#t=(v(this),y(this));get name(){return this.#t}set name(e){this.#t=e}#n=(b(this),x(this,[]));get options(){return this.#n}set options(e){this.#n=e}#r=(S(this),C(this));get value(){return this.#r}set value(e){this.#r=e}#i=(w(this),T(this));get defaultValue(){return this.#i}set defaultValue(e){this.#i=e}#a=(E(this),D(this));get placeholder(){return this.#a}set placeholder(e){this.#a=e}#o=(O(this),k(this,!1));get hideLabel(){return this.#o}set hideLabel(e){this.#o=e}#s=(A(this),j(this,`md`));get size(){return this.#s}set size(e){this.#s=e}#c=(M(this),N(this));get open(){return this.#c}set open(e){this.#c=e}#l=(P(this),F(this,!1));get multiple(){return this.#l}set multiple(e){this.#l=e}#u=(ue(this),I(this));get description(){return this.#u}set description(e){this.#u=e}#d=(L(this),R(this,!1));get required(){return this.#d}set required(e){this.#d=e}#f=(z(this),B(this,!1));get disabled(){return this.#f}set disabled(e){this.#f=e}#p=(V(this),H(this,!1));get invalid(){return this.#p}set invalid(e){this.#p=e}errorValue=void U(this);get error(){return this.errorValue}set error(e){let t=this.errorValue;this.errorValue=e,this.invalid=!!e,this.requestUpdate(`error`,t)}#m=W(this,`auto`);get native(){return this.#m}set native(e){this.#m=e}#h=(G(this),K(this));get overrides(){return this.#h}set overrides(e){this.#h=e}#g=(q(this),J(this));get internalValue(){return this.#g}set internalValue(e){this.#g=e}#_=(de(this),fe(this,!1));get internalOpen(){return this.#_}set internalOpen(e){this.#_=e}#v=(pe(this),me(this,!1));get formDisabled(){return this.#v}set formDisabled(e){this.#v=e}#y=(he(this),ge(this));get triggerEl(){return this.#y}set triggerEl(e){this.#y=e}#b=(_e(this),ve(this));get nativeSelectEl(){return this.#b}set nativeSelectEl(e){this.#b=e}#x=(ye(this),be(this));get listboxEl(){return this.#x}set listboxEl(e){this.#x=e}#S=(xe(this),Se(this));get popupEl(){return this.#S}set popupEl(e){this.#S=e}popoverSupported=(Ce(this),Ee);wasOpen=!1;internals;constructor(){super(),this.internals=this.attachInternals()}get flatItems(){return m(this.options)}get isDisabled(){return this.disabled||this.formDisabled}get currentOpen(){return this.open??this.internalOpen}get currentValue(){let e=this.value??this.internalValue;if(this.multiple){let t=Array.isArray(e)?e:[];return t.length>0?t:null}return typeof e==`string`&&e!==``?e:null}get form(){return this.internals.form}get validationMessage(){return this.internals.validationMessage}get selectedSet(){let e=this.currentValue;return this.multiple?new Set(Array.isArray(e)?e:[]):new Set(typeof e==`string`?[e]:[])}get listboxValue(){let e=this.currentValue;return this.multiple?Array.isArray(e)?e:[]:typeof e==`string`?e:``}get displayLabels(){let e=this.currentValue;if(e===null)return[];let t=Array.isArray(e)?e:[e],n=new Map(this.flatItems.map(e=>[e.value,e.label]));return t.map(e=>n.get(e)??e)}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Select`)}disconnectedCallback(){super.disconnectedCallback(),this.removeGlobalListeners()}checkValidity(){return this.syncInternals(),this.internals.checkValidity()}reportValidity(){return this.syncInternals(),this.internals.reportValidity()}formDisabledCallback(e){this.formDisabled=e}formResetCallback(){this.value=void 0,this.internalValue=this.defaultValue,this.closePopup(!1)}formStateRestoreCallback(e){typeof e==`string`&&!this.multiple&&(this.value=e)}willUpdate(e){this.hasUpdated||(this.internalValue=this.defaultValue),e.has(`overrides`)&&this.applyOverrides()}updated(){this.syncInternals();let e=this.currentOpen;e!==this.wasOpen&&(this.wasOpen=e,e?this.handleOpened():this.handleClosed()),this.warnInDev()}render(){let e=this.isDisabled,t=[this.description?`description`:``,this.error?`error-message`:``].filter(e=>e!==``).join(` `)||void 0;if(this.native===`always`)return this.renderNative(e,t);let n=this.displayLabels,r=n.length===0?this.placeholder||X:this.multiple?n.length<=2?n.join(`, `):we(n.length):n[0],i=this.currentOpen;return l`
      <ds-text id="label" part="label" class=${f({label:!0,"visually-hidden":this.hideLabel})} element="p" weight="medium"
        >${this.label}${this.required?l`<span aria-hidden="true">${Q}</span>`:o}</ds-text
      >
      ${this.description?l`<ds-text id="description" part="description" class="description" element="p" tone="muted" size="sm"
            >${this.description}</ds-text
          >`:o}
      <button
        id="trigger"
        part="trigger"
        class=${f({trigger:!0,disabled:e})}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded=${i?`true`:`false`}
        aria-controls="popup"
        aria-labelledby="label"
        aria-describedby=${d(t)}
        aria-invalid=${d(this.invalid?`true`:void 0)}
        aria-required=${d(this.required?`true`:void 0)}
        aria-disabled=${d(e?`true`:void 0)}
        @click=${this.handleTriggerClick}
        @keydown=${this.handleTriggerKeydown}
      >
        <span id="value" part="value" class=${f({value:!0,placeholder:n.length===0})}
          >${r}</span
        >
        <ds-icon part="chevron" class=${f({chevron:!0,"is-open":i})} name="chevron-down"></ds-icon>
      </button>
      <div
        id="popup"
        class="popup"
        part="popup"
        popover=${this.popoverSupported?`manual`:o}
        ?hidden=${!this.popoverSupported&&!i}
      >
        <ds-listbox
          id="listbox"
          part="listbox"
          class="listbox"
          label=${this.label}
          .options=${this.options}
          .value=${this.listboxValue}
          ?multiple=${this.multiple}
          ?disabled=${e}
          @change=${this.handleListboxChange}
        ></ds-listbox>
      </div>
      <div id="error-message" part="errorMessage" class="error" role="alert">${this.error??``}</div>
    `}renderNative(e,t){return l`
      <ds-text id="label" part="label" class=${f({label:!0,"visually-hidden":this.hideLabel})} element="p" weight="medium"
        >${this.label}${this.required?l`<span aria-hidden="true">${Q}</span>`:o}</ds-text
      >
      ${this.description?l`<ds-text id="description" part="description" class="description" element="p" tone="muted" size="sm"
            >${this.description}</ds-text
          >`:o}
      <select
        id="native-select"
        part="trigger"
        class="native-select"
        name=${this.name}
        ?multiple=${this.multiple}
        ?disabled=${e}
        ?required=${this.required}
        aria-labelledby="label"
        aria-describedby=${d(t)}
        aria-invalid=${d(this.invalid?`true`:void 0)}
        @change=${this.handleNativeChange}
      >
        ${this.multiple?o:l`<option value="" ?selected=${this.currentValue===null}>${this.placeholder||X}</option>`}
        ${this.renderNativeOptions(this.options)}
      </select>
      <div id="error-message" part="errorMessage" class="error" role="alert">${this.error??``}</div>
    `}renderNativeOptions(e){let t=this.selectedSet;return e.map(e=>p(e)?l`<optgroup label=${e.group}>${this.renderNativeOptions(e.options)}</optgroup>`:l`<option value=${e.value} ?selected=${t.has(e.value)} ?disabled=${e.disabled===!0}
        >${e.label}</option
      >`)}handleTriggerClick=()=>{this.isDisabled||(this.currentOpen?this.closePopup(!1):this.openPopup())};handleTriggerKeydown=e=>{if(this.isDisabled)return;let t=e.key;if(!this.currentOpen){(t===`Enter`||t===` `||t===`ArrowDown`||t===`ArrowUp`)&&(e.preventDefault(),this.openPopup());return}switch(t){case`Escape`:e.preventDefault(),this.closePopup(!0);break;case`Tab`:if(!this.multiple){let e=this.activeOptionItem();e&&!e.disabled&&this.commitValue(e.value)}this.hidePopupImmediately(),this.setOpen(!1);break;case`Enter`:e.preventDefault(),this.listboxEl?.handleKey(new KeyboardEvent(`keydown`,{key:` `}));break;default:this.listboxEl?.handleKey(e)}};handleListboxChange=e=>{e.stopPropagation(),this.commitValue(e.detail.value),this.multiple||this.closePopup(!0)};handleNativeChange=e=>{let t=e.target,n=this.multiple?Array.from(t.selectedOptions).map(e=>e.value):t.value;this.commitValue(n)};handleOutsidePointerDown=e=>{e.composedPath().includes(this)||this.closePopup(!1)};handleReposition=()=>{this.currentOpen&&this.updatePosition()};handleWindowBlur=()=>{this.closePopup(!1)};activeOptionItem(){let e=this.listboxEl?.activeValue;if(e)return this.flatItems.find(t=>t.value===e)}openPopup(){this.currentOpen||this.isDisabled||this.setOpen(!0)}closePopup(e){this.currentOpen&&(this.setOpen(!1),e&&this.triggerEl?.focus())}setOpen(e){this.open===void 0?this.internalOpen=e:this.open=e}handleOpened(){this.popoverSupported&&this.popupEl?.showPopover(),this.updatePosition(),this.addGlobalListeners(),this.listboxEl&&(this.listboxEl.activeValue=this.defaultActiveValue()),this.dispatchOpenChange(!0)}handleClosed(){this.removeGlobalListeners(),this.hidePopupImmediately(),this.listboxEl&&(this.listboxEl.activeValue=null),this.dispatchOpenChange(!1)}defaultActiveValue(){let e=this.flatItems.filter(e=>e.disabled!==!0);if(e.length===0)return null;let t=this.selectedSet;return(e.find(e=>t.has(e.value))??e[0]).value}hidePopupImmediately(){this.popoverSupported?this.popupEl?.matches(`:popover-open`)&&this.popupEl.hidePopover():this.popupEl&&(this.popupEl.hidden=!0)}addGlobalListeners(){document.addEventListener(`pointerdown`,this.handleOutsidePointerDown,!0),window.addEventListener(`scroll`,this.handleReposition,!0),window.addEventListener(`resize`,this.handleReposition),window.addEventListener(`blur`,this.handleWindowBlur)}removeGlobalListeners(){document.removeEventListener(`pointerdown`,this.handleOutsidePointerDown,!0),window.removeEventListener(`scroll`,this.handleReposition,!0),window.removeEventListener(`resize`,this.handleReposition),window.removeEventListener(`blur`,this.handleWindowBlur)}updatePosition(){let e=this.triggerEl,t=this.popupEl;if(!e||!t)return;let n=e.getBoundingClientRect(),r=t.getBoundingClientRect(),i=document.documentElement.clientHeight,a=parseFloat(getComputedStyle(t).getPropertyValue(`--ds-select-popup-offset`))||0,o=n.bottom+a+r.height>i&&n.top-a-r.height>=0;t.style.top=o?`auto`:`${n.bottom+a}px`,t.style.bottom=o?`${i-n.top+a}px`:`auto`,t.style.left=`${n.left}px`,t.style.minWidth=`${n.width}px`}commitValue(e){this.value===void 0?this.internalValue=e:this.value=e,this.dispatchEvent(new CustomEvent(`change`,{detail:{value:e},bubbles:!0,composed:!0}))}dispatchOpenChange(e){this.dispatchEvent(new CustomEvent(`open-change`,{detail:{open:e},bubbles:!0,composed:!0}))}syncInternals(){let e=this.currentValue,t=this.isDisabled;if(this.multiple){if(t||e===null)this.internals.setFormValue(null);else{let t=new FormData;for(let n of e)t.append(this.name,n);this.internals.setFormValue(t)}}else this.internals.setFormValue(t||e===null?null:e);if(t){this.internals.setValidity({});return}let n=this.triggerEl??this.nativeSelectEl;this.error?this.internals.setValidity({customError:!0},this.error,n):this.invalid?this.internals.setValidity({customError:!0},Z(this.label),n):this.required&&e===null?this.internals.setValidity({valueMissing:!0},Te(this.label),n):this.internals.setValidity({})}applyOverrides(){for(let e of Object.keys(Y)){let t=this.overrides?.[e],n=Y[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,ie(t))}}warnInDev(){}}];formAssociated=!0;shadowRootOptions={...s.shadowRootOptions,delegatesFocus:!0};styles=t`
    :host {
      display: block;
      font-family: var(--font-family-body);
      --ds-select-trigger-border-focus: var(--color-border-focus);
      --ds-select-trigger-border-invalid: var(--color-border-danger);
      --ds-select-trigger-border-width: var(--border-width-thin);
      --ds-select-trigger-radius: var(--radius-md);
      --ds-select-trigger-padding-inline: var(--space-md);
      --ds-select-trigger-padding-block: var(--space-sm);
      --ds-select-trigger-padding-block-sm: var(--space-1);
      --ds-select-trigger-gap: var(--layout-gap-normal);
      --ds-select-part-gap: var(--space-1);
      --ds-select-label-weight: var(--font-weight-medium);
      --ds-select-helper-size: var(--font-size-sm);
      --ds-select-popup-surface: var(--color-overlay-surface);
      --ds-select-popup-border: var(--color-border);
      --ds-select-popup-shadow: var(--shadow-overlay);
      --ds-select-popup-radius: var(--radius-md);
      --ds-select-popup-offset: var(--space-1);
      --ds-select-layer: var(--layer-dropdown);
      --ds-select-font-family: var(--font-family-body);
      --ds-select-font-size: var(--font-size-md);
      --ds-select-line-height: var(--font-line-height-normal);
      --ds-select-min-target-sm: var(--size-target-min);
      --ds-select-disabled-opacity: var(--opacity-disabled);
      --ds-select-enter: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    /* fontSize: font.size.{size} */
    :host([size='sm']) {
      --ds-select-font-size: var(--font-size-sm);
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

    .label {
      display: block;
      font-size: var(--ds-select-font-size);
      font-weight: var(--ds-select-label-weight);
      line-height: var(--ds-select-line-height);
    }

    /* descriptionText: color.foreground.muted, locked (set on ds-text via tone="muted") */
    .description {
      margin-block-start: var(--ds-select-part-gap);
    }

    /* triggerBackground / triggerBorder: color.background / color.border.strong, locked */
    .trigger {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ds-select-trigger-gap);
      inline-size: 100%;
      min-block-size: var(--size-target-comfortable);
      margin-block-start: var(--ds-select-part-gap);
      padding-block: var(--ds-select-trigger-padding-block);
      padding-inline: var(--ds-select-trigger-padding-inline);
      border: var(--ds-select-trigger-border-width) solid var(--color-border-strong);
      border-radius: var(--ds-select-trigger-radius);
      background: var(--color-background);
      font-family: var(--ds-select-font-family);
      font-size: var(--ds-select-font-size);
      line-height: var(--ds-select-line-height);
      color: var(--color-foreground);
      cursor: pointer;
      transition:
        border-color var(--ds-select-enter) var(--motion-easing-standard),
        padding var(--ds-select-enter) var(--motion-easing-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      .trigger,
      .popup,
      .chevron {
        transition: none;
      }
    }

    /* triggerPaddingBlockSm / minTargetSm replace the md bindings at size sm */
    :host([size='sm']) .trigger {
      min-block-size: var(--ds-select-min-target-sm);
      padding-block: var(--ds-select-trigger-padding-block-sm);
    }

    /*
     * focusRingWidth (locked) replaces triggerBorderWidth while focused; padding
     * shrinks by the difference (border-box sizing) so the trigger does not shift.
     */
    .trigger:focus-visible {
      border-color: var(--ds-select-trigger-border-focus);
      border-width: var(--border-width-focus);
      padding-inline: calc(
        var(--ds-select-trigger-padding-inline) - (var(--border-width-focus) - var(--ds-select-trigger-border-width))
      );
      padding-block: calc(
        var(--ds-select-trigger-padding-block) - (var(--border-width-focus) - var(--ds-select-trigger-border-width))
      );
    }

    :host([size='sm']) .trigger:focus-visible {
      padding-block: calc(
        var(--ds-select-trigger-padding-block-sm) - (var(--border-width-focus) - var(--ds-select-trigger-border-width))
      );
    }

    :host([invalid]) .trigger {
      border-color: var(--ds-select-trigger-border-invalid);
    }
    :host([invalid]) .trigger:focus-visible {
      border-color: var(--ds-select-trigger-border-invalid);
    }

    .trigger.disabled {
      opacity: var(--ds-select-disabled-opacity);
      cursor: not-allowed;
    }

    /* valueColor: color.foreground, locked */
    .value {
      flex: 1;
      min-inline-size: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: start;
      color: var(--color-foreground);
    }

    /* placeholderColor: color.foreground.muted, locked */
    .value.placeholder {
      color: var(--color-foreground-muted);
    }

    /* chevron: color.foreground.muted, locked */
    .chevron {
      flex: none;
      color: var(--color-foreground-muted);
      transition: transform var(--ds-select-enter) var(--motion-easing-standard);
    }
    .chevron.is-open {
      transform: rotate(180deg);
    }

    .popup {
      position: fixed;
      inset: auto;
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      border-style: solid;
      border-width: var(--border-width-thin);
      border-color: var(--ds-select-popup-border);
      border-radius: var(--ds-select-popup-radius);
      background: var(--ds-select-popup-surface);
      box-shadow: var(--ds-select-popup-shadow);
      z-index: var(--ds-select-layer);
      max-block-size: calc(100vh - 2 * var(--layout-gutter));
      opacity: 1;
      transform: translateY(0);
      transition:
        opacity var(--ds-select-enter) var(--motion-easing-standard),
        transform var(--ds-select-enter) var(--motion-easing-standard);
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

    .listbox {
      display: block;
    }

    .native-select {
      box-sizing: border-box;
      display: block;
      inline-size: 100%;
      min-block-size: var(--size-target-comfortable);
      margin-block-start: var(--ds-select-part-gap);
      padding-block: var(--ds-select-trigger-padding-block);
      padding-inline: var(--ds-select-trigger-padding-inline);
      border: var(--ds-select-trigger-border-width) solid var(--color-border-strong);
      border-radius: var(--ds-select-trigger-radius);
      font-family: var(--ds-select-font-family);
      font-size: var(--ds-select-font-size);
      line-height: var(--ds-select-line-height);
      color: var(--color-foreground);
      background: var(--color-background);
      appearance: none;
      -webkit-appearance: none;
    }

    :host([size='sm']) .native-select {
      min-block-size: var(--ds-select-min-target-sm);
      padding-block: var(--ds-select-trigger-padding-block-sm);
    }

    .native-select:focus-visible {
      border-color: var(--color-border-focus);
      border-width: var(--border-width-focus);
    }

    :host([invalid]) .native-select {
      border-color: var(--color-border-danger);
    }

    .native-select:disabled {
      opacity: var(--ds-select-disabled-opacity);
      cursor: not-allowed;
    }

    /* errorText: color.foreground.danger, locked */
    .error {
      font-size: var(--ds-select-helper-size);
      line-height: var(--ds-select-line-height);
      color: var(--color-foreground-danger);
    }
    .error:not(:empty) {
      margin-block-start: var(--ds-select-part-gap);
    }
  `;constructor(){super(De),g()}}})))()}export{$ as t};