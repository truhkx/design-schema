import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{O as t,_ as n,a as r,b as i,c as a,f as o,g as s,h as ee,i as te,o as ne,p as re,r as c,t as ie,u as l,v as u,w as d}from"./if-defined-CARySXJh.js";import{t as f}from"./query-BHY-nhsh.js";import{t as ae}from"./Icon-BHsrajXm.js";import{t as oe}from"./Text-BrJPDVza.js";import{n as se,t as ce}from"./class-map-C-hUkrHk.js";import{r as p,t as le}from"./live-DYI4u8lm.js";import{t as ue}from"./Listbox-ByqAOPrD.js";function m(e){return`group`in e}function h(e){let t=[];for(let n of e)m(n)?t.push(...h(n.options)):t.push(n);return t}function de(e,t){return Array.isArray(e)&&Array.isArray(t)?e.length===t.length&&e.every((e,n)=>e===t[n]):e===t}var g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,fe,G,K,pe,me,he,ge,_e,ve,ye,be,xe,Se,Ce,we,Te,Ee,De,Oe,q,J,ke,Ae,Y,X,Z,Q,je,Me,Ne,$,Pe;function Fe(){return(Fe=e((()=>{s(),n(),ne(),ce(),ie(),le(),r(),ae(),ue(),oe(),q={triggerBorderInvalid:`--ds-select-trigger-border-invalid`,triggerBorderWidth:`--ds-select-trigger-border-width`,triggerRadius:`--ds-select-trigger-radius`,triggerPaddingInline:`--ds-select-trigger-padding-inline`,triggerPaddingBlock:`--ds-select-trigger-padding-block`,triggerGap:`--ds-select-trigger-gap`,chevronReserve:`--ds-select-chevron-reserve`,partGap:`--ds-select-part-gap`,labelWeight:`--ds-select-label-weight`,helperSize:`--ds-select-helper-size`,popupSurface:`--ds-select-popup-surface`,popupBorder:`--ds-select-popup-border`,popupBorderWidth:`--ds-select-popup-border-width`,popupShadow:`--ds-select-popup-shadow`,popupRadius:`--ds-select-popup-radius`,popupOffset:`--ds-select-popup-offset`,layer:`--ds-select-layer`,fontFamily:`--ds-select-font-family`,fontSize:`--ds-select-font-size`,fontWeight:`--ds-select-font-weight`,lineHeight:`--ds-select-line-height`,disabledOpacity:`--ds-select-disabled-opacity`,enter:`--ds-select-enter`},J={placeholder:`Select…`,selectedCount:`{count} selected`,done:`Done`,required:`{label} is required.`,invalid:`{label} is not valid.`,requiredIndicator:` (required)`},ke=e=>J.selectedCount.replace(`{count}`,new Intl.NumberFormat().format(e)),Ae=e=>J.required.replace(`{label}`,e),Y=e=>J.invalid.replace(`{label}`,e),X={color:`color.foreground.muted`},Z=`font.family.body`,Q=`font.lineHeight.normal`,je=`font.size.sm`,Me=`font.weight.medium`,Ne=`font.weight.regular`,$=typeof HTMLElement<`u`&&typeof HTMLElement.prototype.showPopover==`function`,new class extends re{static[class extends u{static{({e:[v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,fe,G,K,pe,me,he,ge,_e,ve,ye,be,xe,Se,Ce,we,Te,Ee,De,Oe,g],c:[Pe,_]}=ee(this,[o(`ds-select`)],[[l(),1,`label`],[l(),1,`name`],[l({attribute:!1}),1,`options`],[l({attribute:!1}),1,`value`],[l({attribute:!1}),1,`defaultValue`],[l(),1,`placeholder`],[l({type:Boolean,attribute:`hide-label`}),1,`hideLabel`],[l({type:String,reflect:!0}),1,`size`],[l({type:Boolean}),1,`open`],[l({type:Boolean,reflect:!0}),1,`multiple`],[l(),1,`description`],[l({type:Boolean,reflect:!0}),1,`required`],[l({type:Boolean,reflect:!0}),1,`disabled`],[l({type:Boolean,reflect:!0}),1,`invalid`],[l(),4,`error`],[l({type:String,reflect:!0}),1,`native`],[l({attribute:!1}),1,`overrides`],[a(),1,`internalValue`],[a(),1,`internalOpen`],[a(),1,`activeValue`],[a(),1,`formDisabled`],[f(`[data-part=trigger]`),1,`triggerEl`],[f(`[data-part=popup]`),1,`popupEl`],[f(`[data-part=listbox]`),1,`listboxEl`]],0,void 0,u))}#e=(g(this),v(this,``));get label(){return this.#e}set label(e){this.#e=e}#t=(y(this),b(this,``));get name(){return this.#t}set name(e){this.#t=e}#n=(x(this),S(this,[]));get options(){return this.#n}set options(e){this.#n=e}#r=(C(this),w(this));get value(){return this.#r}set value(e){this.#r=e}#i=(T(this),E(this));get defaultValue(){return this.#i}set defaultValue(e){this.#i=e}#a=(D(this),O(this));get placeholder(){return this.#a}set placeholder(e){this.#a=e}#o=(k(this),A(this,!1));get hideLabel(){return this.#o}set hideLabel(e){this.#o=e}#s=(j(this),M(this,`md`));get size(){return this.#s}set size(e){this.#s=e}#c=(N(this),P(this));get open(){return this.#c}set open(e){this.#c=e}#l=(F(this),I(this,!1));get multiple(){return this.#l}set multiple(e){this.#l=e}#u=(L(this),R(this));get description(){return this.#u}set description(e){this.#u=e}#d=(z(this),B(this,!1));get required(){return this.#d}set required(e){this.#d=e}#f=(V(this),H(this,!1));get disabled(){return this.#f}set disabled(e){this.#f=e}#p=(U(this),W(this,!1));get invalid(){return this.#p}set invalid(e){this.#p=e}errorValue=void fe(this);invalidFromError=!1;get error(){return this.errorValue}set error(e){let t=this.errorValue;this.errorValue=e,e?this.invalid||=(this.invalidFromError=!0,!0):this.invalidFromError&&(this.invalidFromError=!1,this.invalid=!1),this.syncInternals(),this.requestUpdate(`error`,t)}#m=G(this,`auto`);get native(){return this.#m}set native(e){this.#m=e}#h=(K(this),pe(this));get overrides(){return this.#h}set overrides(e){this.#h=e}#g=(me(this),he(this));get internalValue(){return this.#g}set internalValue(e){this.#g=e}#_=(ge(this),_e(this,!1));get internalOpen(){return this.#_}set internalOpen(e){this.#_=e}#v=(ve(this),ye(this,null));get activeValue(){return this.#v}set activeValue(e){this.#v=e}#y=(be(this),xe(this,!1));get formDisabled(){return this.#y}set formDisabled(e){this.#y=e}#b=(Se(this),Ce(this));get triggerEl(){return this.#b}set triggerEl(e){this.#b=e}#x=(we(this),Te(this));get popupEl(){return this.#x}set popupEl(e){this.#x=e}#S=(Ee(this),De(this));get listboxEl(){return this.#S}set listboxEl(e){this.#S=e}internals=void Oe(this);shown=!1;warned=!1;constructor(){super(),this.internals=this.attachInternals(),this.addEventListener(`focusout`,this.handleFocusOut)}get flatItems(){return h(this.options)}get isDisabled(){return this.disabled||this.formDisabled}get usesPopup(){return this.native!==`always`}get currentOpen(){return this.open??this.internalOpen}get showsPopup(){return this.usesPopup&&this.currentOpen&&!this.isDisabled}get currentValue(){let e=this.value===void 0?this.internalValue:this.value;if(this.multiple){let t=Array.isArray(e)?e:typeof e==`string`&&e!==``?[e]:[];return t.length>0?t:null}let t=Array.isArray(e)?e[0]:e;return typeof t==`string`&&t!==``?t:null}get form(){return this.internals.form}get validationMessage(){return this.computeValidationMessage()??``}get selectedSet(){let e=this.currentValue;return new Set(e===null?[]:Array.isArray(e)?e:[e])}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Select`),this.setAttribute(`data-ds-field`,``)}disconnectedCallback(){super.disconnectedCallback(),this.removeGlobalListeners(),this.shown=!1}focus(e){this.triggerEl?.focus(e)}checkValidity(){return this.syncInternals(),this.internals.checkValidity()}reportValidity(){return this.syncInternals(),this.internals.reportValidity()}formDisabledCallback(e){this.formDisabled=e}formResetCallback(){this.internalValue=this.defaultValue}formStateRestoreCallback(e){typeof e==`string`?this.internalValue=e:e instanceof FormData&&(this.internalValue=e.getAll(this.name).filter(e=>typeof e==`string`))}willUpdate(e){this.hasUpdated||(this.internalValue=this.defaultValue),e.has(`overrides`)&&this.applyOverrides();let t=this.showsPopup;t&&!this.shown?this.activeValue=this.defaultActiveValue():t||(this.activeValue=null)}updated(){this.syncInternals();let e=this.showsPopup;e&&!this.shown?(this.shown=!0,this.showPopup()):!e&&this.shown&&(this.shown=!1,this.hidePopup())}render(){let e=this.isDisabled,t=this.errorValue||(this.invalid?Y(this.label):``),n=[this.description?`description`:``,t?`error`:``,this.showsPopup?`active-option`:``].filter(Boolean).join(` `),r=this.overrides,a={fontSize:r?.helperSize??je,fontFamily:r?.fontFamily??Z,lineHeight:r?.lineHeight??Q},o=r?.fontSize??`font.size.${this.size}`,s={fontWeight:r?.labelWeight??Me,fontSize:o,fontFamily:r?.fontFamily??Z,lineHeight:r?.lineHeight??Q};return d`
      <div class=${se({group:!0,disabled:e})}>
        <label
          id="label"
          for="trigger"
          class=${se({"visually-hidden":this.hideLabel})}
          @click=${this.handleLabelClick}
          ><ds-text data-part="label" part="label" element="span" weight="medium" .overrides=${s}
            >${this.label}${this.required?J.requiredIndicator:i}</ds-text
          ></label
        >
        ${this.description?d`<ds-text
              id="description"
              data-part="description"
              part="description"
              element="span"
              size="sm"
              tone="muted"
              .overrides=${a}
              >${this.description}</ds-text
            >`:i}
        ${this.usesPopup?this.renderPopupField(e,n,o):this.renderNativeField(e,n)}
        <div id="error" role="alert" ?hidden=${!t}>
          ${t?d`<ds-text
                data-part="errorMessage"
                part="errorMessage"
                element="span"
                size="sm"
                tone="danger"
                .overrides=${a}
                >${t}</ds-text
              >`:i}
        </div>
      </div>
    `}renderPopupField(e,t,n){let r=this.overrides,i={fontSize:n,fontWeight:r?.fontWeight??Ne,fontFamily:r?.fontFamily??Z,lineHeight:r?.lineHeight??Q},a={fontFamily:r?.fontFamily??Z,lineHeight:r?.lineHeight??Q},o=this.showsPopup,s=this.displayLabels(),ee=s.length===0?this.placeholder||J.placeholder:s.length<=2?s.join(`, `):ke(s.length),te=this.activeValue===null?``:this.flatItems.find(e=>e.value===this.activeValue)?.label??``;return d`
      <button
        id="trigger"
        data-part="trigger"
        part="trigger"
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded=${o?`true`:`false`}
        aria-controls="popup"
        aria-labelledby="label"
        aria-describedby=${c(t||void 0)}
        aria-invalid=${c(this.invalid?`true`:void 0)}
        aria-required=${c(this.required?`true`:void 0)}
        aria-disabled=${c(e?`true`:void 0)}
        @click=${this.handleTriggerClick}
        @keydown=${this.handleTriggerKeydown}
      >
        <ds-text
          id="value"
          data-part="value"
          part="value"
          element="span"
          tone=${s.length===0?`muted`:`default`}
          .overrides=${i}
          >${ee}</ds-text
        >
        <ds-icon
          data-part="chevron"
          part="chevron"
          name="chevron-down"
          size="sm"
          .overrides=${X}
        ></ds-icon>
      </button>
      <span id="active-option" class="visually-hidden" aria-live="polite">${o?te:``}</span>
      <div
        id="popup"
        data-part="popup"
        part="popup"
        popover=${c($?`manual`:void 0)}
        ?hidden=${!$&&!o}
        @mousedown=${this.handlePopupMouseDown}
        @click=${this.handlePopupClick}
      >
        <ds-listbox
          data-part="listbox"
          part="listbox"
          embedded
          label=${this.label}
          .labelledBy=${`label`}
          .selectionFollowsFocus=${!1}
          .options=${this.options}
          .value=${this.multiple?this.currentValue??[]:this.currentValue??``}
          .initialActiveValue=${this.activeValue??void 0}
          .activeValue=${this.activeValue}
          .overrides=${a}
          ?multiple=${this.multiple}
          @change=${this.handleListboxChange}
          @active-change=${this.handleListboxActiveChange}
        ></ds-listbox>
      </div>
    `}renderNativeField(e,t){let n=this.selectedSet,r=e=>e.map(e=>m(e)?d`<optgroup label=${e.group}>${r(e.options)}</optgroup>`:d`<option
              value=${e.value}
              .selected=${p(n.has(e.value))}
              ?disabled=${e.disabled===!0}
            >
              ${e.label}
            </option>`);return d`
      <div class="native">
        <select
          id="trigger"
          data-part="trigger"
          part="trigger"
          ?multiple=${this.multiple}
          ?disabled=${e}
          ?required=${this.required}
          aria-describedby=${c(t||void 0)}
          aria-invalid=${c(this.invalid?`true`:void 0)}
          @change=${this.handleNativeChange}
        >
          ${this.multiple?i:d`<option value="" .selected=${p(n.size===0)}>
                ${this.placeholder||J.placeholder}
              </option>`}
          ${r(this.options)}
        </select>
        ${this.multiple?i:d`<span class="native-chevron"
              ><ds-icon data-part="chevron" part="chevron" name="chevron-down" size="sm" .overrides=${X}></ds-icon
            ></span>`}
      </div>
    `}displayLabels(){let e=this.currentValue;if(e===null)return[];let t=new Map(this.flatItems.map(e=>[e.value,e.label]));return(Array.isArray(e)?e:[e]).map(e=>t.get(e)??e)}defaultActiveValue(){let e=this.flatItems.filter(e=>e.disabled!==!0),t=this.selectedSet;return(e.find(e=>t.has(e.value))??e[0])?.value??null}handleLabelClick=e=>{this.usesPopup&&(e.preventDefault(),this.triggerEl?.focus())};handleTriggerClick=()=>{this.isDisabled||this.requestOpen(!this.currentOpen,!0)};handleTriggerKeydown=e=>{if(this.isDisabled)return;let t=e.key;if(!this.currentOpen){(t===`Enter`||t===` `||t===`ArrowDown`||t===`ArrowUp`)&&(e.preventDefault(),this.requestOpen(!0,!1));return}switch(t){case`Escape`:e.preventDefault(),e.stopPropagation(),this.requestOpen(!1,!0);break;case`Enter`:e.preventDefault(),this.multiple?this.toggleActive():(this.commitActive(),this.requestOpen(!1,!0));break;case`Tab`:this.multiple||this.commitActive(),this.requestOpen(!1,!1);break;case` `:this.listboxEl?.handleKey(e),this.multiple||this.requestOpen(!1,!0);break;default:this.listboxEl?.handleKey(e)}};handlePopupMouseDown=e=>{e.preventDefault()};handlePopupClick=e=>{if(this.multiple)return;let t=e.composedPath().find(e=>e instanceof HTMLElement&&e.getAttribute(`role`)===`option`);t&&t.getAttribute(`aria-disabled`)!==`true`&&this.requestOpen(!1,!0)};handleListboxChange=e=>{e.stopPropagation(),this.commitValue(e.detail.value)};handleListboxActiveChange=e=>{e.stopPropagation(),this.activeValue=e.detail.value};handleNativeChange=e=>{let t=e.currentTarget;this.commitValue(this.multiple?Array.from(t.selectedOptions,e=>e.value):t.value)};handleOutsidePointerDown=e=>{e.composedPath().includes(this)||this.requestOpen(!1,!1)};handleFocusOut=e=>{let t=e.relatedTarget;this.showsPopup&&t instanceof Node&&t!==this&&!this.contains(t)&&this.requestOpen(!1,!1)};handleReposition=()=>{this.updatePosition()};commitActive(){let e=this.flatItems.find(e=>e.value===this.activeValue);e&&e.disabled!==!0&&this.commitValue(e.value)}toggleActive(){let e=this.flatItems.find(e=>e.value===this.activeValue);if(!e||e.disabled===!0)return;let t=this.selectedSet;t.has(e.value)?t.delete(e.value):t.add(e.value);let n=this.flatItems.map(e=>e.value);this.commitValue([...n.filter(e=>t.has(e)),...[...t].filter(e=>!n.includes(e))])}requestOpen(e,t){this.currentOpen===e||e&&this.isDisabled||(this.open===void 0&&(this.internalOpen=e,e||this.hidePopup()),this.dispatchEvent(new CustomEvent(`open-change`,{detail:{open:e},bubbles:!0,composed:!0})),!e&&t&&this.triggerEl?.focus())}commitValue(e){de(Array.isArray(e)?e.length>0?e:null:e||null,this.currentValue)||(this.value===void 0&&(this.internalValue=e),this.dispatchEvent(new CustomEvent(`change`,{detail:{value:e},bubbles:!0,composed:!0})))}showPopup(){let e=this.popupEl;e&&($&&!e.matches(`:popover-open`)&&e.showPopover(),this.addGlobalListeners(),this.updatePosition(),this.listboxEl?.updateComplete.then(()=>this.updatePosition()))}hidePopup(){this.removeGlobalListeners();let e=this.popupEl;e&&($?e.matches(`:popover-open`)&&e.hidePopover():e.hidden||=!0)}addGlobalListeners(){document.addEventListener(`pointerdown`,this.handleOutsidePointerDown,!0),window.addEventListener(`scroll`,this.handleReposition,!0),window.addEventListener(`resize`,this.handleReposition)}removeGlobalListeners(){document.removeEventListener(`pointerdown`,this.handleOutsidePointerDown,!0),window.removeEventListener(`scroll`,this.handleReposition,!0),window.removeEventListener(`resize`,this.handleReposition)}updatePosition(){let e=this.triggerEl,t=this.popupEl;if(!e||!t||!this.shown)return;let n=e.getBoundingClientRect(),r=t.getBoundingClientRect().height,i=document.documentElement.clientHeight,a=parseFloat(getComputedStyle(t).marginBlockStart)||0,o=n.bottom+a+r>i&&n.top-a-r>=0;t.style.top=o?`auto`:`${n.bottom}px`,t.style.bottom=o?`${i-n.top}px`:`auto`,t.style.left=`${n.left}px`,t.style.minInlineSize=`${n.width}px`}computeValidationMessage(){return this.required&&this.currentValue===null?Ae(this.label):this.errorValue?this.errorValue:this.invalid?Y(this.label):null}syncInternals(){let e=this.currentValue,t=this.isDisabled;if(t||e===null||!this.name)this.internals.setFormValue(null);else if(Array.isArray(e)){let t=new FormData;for(let n of e)t.append(this.name,n);this.internals.setFormValue(t)}else this.internals.setFormValue(e);let n=t?null:this.computeValidationMessage(),r=this.triggerEl??void 0;n===null?this.internals.setValidity({}):this.required&&e===null?this.internals.setValidity({valueMissing:!0},n,r):this.internals.setValidity({customError:!0},n,r)}applyOverrides(){for(let e of Object.keys(q)){let t=this.overrides?.[e],n=q[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,te(t))}}}];formAssociated=!0;shadowRootOptions={...u.shadowRootOptions,delegatesFocus:!0};styles=t`
    :host {
      display: block;
      --ds-select-trigger-border-invalid: var(--color-border-danger);
      --ds-select-trigger-border-width: var(--border-width-thin);
      --ds-select-trigger-radius: var(--radius-md);
      --ds-select-trigger-padding-inline: var(--space-md);
      --ds-select-trigger-padding-block: var(--space-sm);
      --ds-select-trigger-gap: var(--layout-gap-normal);
      --ds-select-chevron-reserve: var(--font-size-sm);
      --ds-select-part-gap: var(--space-1);
      --ds-select-label-weight: var(--font-weight-medium);
      --ds-select-helper-size: var(--font-size-sm);
      --ds-select-popup-surface: var(--color-overlay-surface);
      --ds-select-popup-border: var(--color-border);
      --ds-select-popup-border-width: var(--border-width-thin);
      --ds-select-popup-shadow: var(--shadow-overlay);
      --ds-select-popup-radius: var(--radius-md);
      --ds-select-popup-offset: var(--space-1);
      --ds-select-layer: var(--layer-dropdown);
      --ds-select-font-family: var(--font-family-body);
      --ds-select-font-size: var(--font-size-md);
      --ds-select-font-weight: var(--font-weight-regular);
      --ds-select-line-height: var(--font-line-height-normal);
      --ds-select-disabled-opacity: var(--opacity-disabled);
      --ds-select-enter: var(--motion-duration-fast);
      font-family: var(--ds-select-font-family);
    }

    :host([hidden]) {
      display: none;
    }

    /* triggerPaddingBlock: by size (sm → space.1); fontSize: font.size.{size} */
    :host([size='sm']) {
      --ds-select-trigger-padding-block: var(--space-1);
      --ds-select-font-size: var(--font-size-sm);
    }

    .group {
      display: grid;
      gap: var(--ds-select-part-gap);
    }

    /* disabledOpacity: the whole field dims, as Input does */
    .group.disabled {
      opacity: var(--ds-select-disabled-opacity);
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

    /* The <label for> wraps the composed Text, which carries data-part="label". */
    label {
      display: block;
    }

    /* triggerBackground / triggerBorder: color.background / color.border.strong, locked */
    [data-part='trigger'] {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: var(--ds-select-trigger-gap);
      inline-size: 100%;
      /* minTarget: size.target.comfortable, locked */
      min-block-size: var(--size-target-comfortable);
      margin: 0;
      padding-block: var(--ds-select-trigger-padding-block);
      padding-inline: var(--ds-select-trigger-padding-inline);
      border-style: solid;
      border-width: var(--ds-select-trigger-border-width);
      border-color: var(--color-border-strong);
      border-radius: var(--ds-select-trigger-radius);
      background: var(--color-background);
      color: var(--color-foreground);
      font-family: var(--ds-select-font-family);
      font-size: var(--ds-select-font-size);
      font-weight: var(--ds-select-font-weight);
      line-height: var(--ds-select-line-height);
      text-align: start;
      cursor: pointer;
    }

    /* minTargetSm: size.target.min, locked — the trigger floor at sm */
    :host([size='sm']) [data-part='trigger'] {
      min-block-size: var(--size-target-min);
    }

    /* triggerBorderFocus + focusRingWidth (locked): the focus width replaces the border width; padding shrinks by the difference */
    [data-part='trigger']:focus-visible {
      outline: none;
      border-color: var(--color-border-focus);
      border-width: var(--border-width-focus);
      padding-block: max(
        0px,
        calc(
          var(--ds-select-trigger-padding-block) - (var(--border-width-focus) - var(--ds-select-trigger-border-width))
        )
      ); /* literal-ok: the doc's clamp at zero, so the trigger never takes a negative padding */
      padding-inline: max(
        0px,
        calc(
          var(--ds-select-trigger-padding-inline) - (var(--border-width-focus) - var(--ds-select-trigger-border-width))
        )
      ); /* literal-ok: the doc's clamp at zero */
    }

    :host([invalid]) [data-part='trigger'],
    :host([invalid]) [data-part='trigger']:focus-visible {
      border-color: var(--ds-select-trigger-border-invalid);
    }

    .group.disabled [data-part='trigger'] {
      cursor: not-allowed;
    }

    /* valueColor / placeholderColor (locked): the composed Text's default / muted tone */
    [data-part='value'] {
      flex: 1;
      min-inline-size: 0;
      overflow: hidden;
      white-space: nowrap;
    }

    [data-part='chevron'] {
      flex: none;
    }

    [data-part='popup'] {
      position: fixed;
      inset: auto;
      box-sizing: border-box;
      /* popupOffset: the gap on the side the popup opens */
      margin: 0;
      margin-block: var(--ds-select-popup-offset);
      padding: 0;
      overflow: hidden;
      border-style: solid;
      border-width: var(--ds-select-popup-border-width);
      border-color: var(--ds-select-popup-border);
      border-radius: var(--ds-select-popup-radius);
      background: var(--ds-select-popup-surface);
      box-shadow: var(--ds-select-popup-shadow);
      color: var(--color-foreground);
      z-index: var(--ds-select-layer);
      opacity: 1;
      /* enter: popup fade */
      transition: opacity var(--ds-select-enter) var(--motion-easing-standard);
    }

    @starting-style {
      [data-part='popup'] {
        opacity: 0;
      }
    }

    [data-part='listbox'] {
      display: block;
    }

    .native {
      display: grid;
    }

    .native > * {
      grid-area: 1 / 1;
    }

    .native [data-part='trigger'] {
      display: block;
      appearance: none;
    }

    /* chevronReserve: the inline-end space the native <select> leaves for the chevron glyph, added
       to triggerPaddingInline and triggerGap. Single only — <select multiple> has no dropdown. */
    :host(:not([multiple])) .native [data-part='trigger'] {
      padding-inline-end: calc(
        var(--ds-select-trigger-padding-inline) + var(--ds-select-trigger-gap) + var(--ds-select-chevron-reserve)
      );
    }

    .native-chevron {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding-inline: var(--ds-select-trigger-padding-inline);
      pointer-events: none;
    }

    @media (prefers-reduced-motion: reduce) {
      [data-part='popup'] {
        transition: none;
      }
    }
  `;constructor(){super(Pe),_()}}})))()}export{Fe as t};