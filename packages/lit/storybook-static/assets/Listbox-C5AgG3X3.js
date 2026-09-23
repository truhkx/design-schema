import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{O as t,_ as n,a as r,b as i,c as a,f as o,g as s,h as ee,i as te,o as ne,p as re,r as c,t as ie,u as l,v as u,w as d}from"./if-defined-CARySXJh.js";import{t as ae}from"./query-BHY-nhsh.js";import{t as oe}from"./Icon-eWCe5jE3.js";import{t as se}from"./Text-b_nq3K9L.js";function ce(e){let t=e.trim(),n=parseFloat(t);return Number.isNaN(n)?0:t.endsWith(`ms`)?n:t.endsWith(`s`)?n*1e3:n}function f(e){return`group`in e}function le(e){let t=[];for(let n of e)f(n)?t.push(...n.options):t.push(n);return t}var p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,ue,H,U,W,G,K,q,J,de,fe,pe,me,he,ge,_e,ve,ye,be,Y,X,xe,Se,Ce,Z,we,Q,Te,Ee;function $(){return($=e((()=>{s(),n(),ne(),ie(),r(),oe(),se(),be=`No options`,Y=e=>`${e} is required.`,X=e=>`${e} is not valid.`,xe=`Loading…`,Se={color:`color.control.selectedBackground`},Ce={color:`color.foreground`},Z={border:`--ds-listbox-border`,borderInvalid:`--ds-listbox-border-invalid`,partGap:`--ds-listbox-part-gap`,borderWidth:`--ds-listbox-border-width`,radius:`--ds-listbox-radius`,listPadding:`--ds-listbox-list-padding`,optionPaddingBlock:`--ds-listbox-option-padding-block`,optionPaddingInline:`--ds-listbox-option-padding-inline`,optionGap:`--ds-listbox-option-gap`,optionRadius:`--ds-listbox-option-radius`,optionDescriptionSize:`--ds-listbox-option-description-size`,optionWeight:`--ds-listbox-option-weight`,optionSelectedWeight:`--ds-listbox-option-selected-weight`,groupLabelSize:`--ds-listbox-group-label-size`,groupLabelWeight:`--ds-listbox-group-label-weight`,groupLabelPaddingBlock:`--ds-listbox-group-label-padding-block`,fontFamily:`--ds-listbox-font-family`,fontSize:`--ds-listbox-font-size`,lineHeight:`--ds-listbox-line-height`,disabledOpacity:`--ds-listbox-disabled-opacity`,typeaheadReset:`--ds-listbox-typeahead-reset`},we=new Set([`border`,`borderInvalid`,`borderWidth`,`radius`]),Q={fromAttribute:e=>e===null,toAttribute:e=>e?null:``},Te=0,new class extends re{static[class extends u{static{({e:[h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,ue,H,U,W,G,K,q,J,de,fe,pe,me,he,ge,_e,ve,ye,p],c:[Ee,m]}=ee(this,[o(`ds-listbox`)],[[l(),1,`label`],[l({attribute:`labelled-by`}),1,`labelledBy`],[l({attribute:!1}),1,`options`],[l({type:Boolean,reflect:!0}),1,`multiple`],[l({attribute:!1}),1,`value`],[l({attribute:!1}),1,`defaultValue`],[l({attribute:`no-selection-follows-focus`,reflect:!0,converter:Q}),1,`selectionFollowsFocus`],[l({type:Boolean,reflect:!0}),1,`required`],[l({type:Boolean,reflect:!0}),1,`invalid`],[l(),4,`error`],[l({type:Boolean,reflect:!0}),1,`embedded`],[l({attribute:`initial-active-value`}),1,`initialActiveValue`],[l({type:Boolean,reflect:!0}),1,`loading`],[l({type:Boolean,reflect:!0}),1,`disabled`],[l(),1,`name`],[l({attribute:`empty-message`}),1,`emptyMessage`],[l({attribute:`max-visible`,reflect:!0}),1,`maxVisible`],[l({attribute:!1}),1,`overrides`],[a(),1,`internalValue`],[l({attribute:!1}),1,`activeValue`],[a(),1,`internalActive`],[a(),1,`formDisabled`],[ae(`[data-part=list]`),1,`listEl`]],0,void 0,u))}#e=(p(this),h(this));get label(){return this.#e}set label(e){this.#e=e}#t=(g(this),_(this));get labelledBy(){return this.#t}set labelledBy(e){this.#t=e}#n=(v(this),y(this,[]));get options(){return this.#n}set options(e){this.#n=e}#r=(b(this),x(this,!1));get multiple(){return this.#r}set multiple(e){this.#r=e}#i=(S(this),C(this));get value(){return this.#i}set value(e){this.#i=e}#a=(w(this),T(this));get defaultValue(){return this.#a}set defaultValue(e){this.#a=e}#o=(E(this),D(this,!0));get selectionFollowsFocus(){return this.#o}set selectionFollowsFocus(e){this.#o=e}#s=(O(this),k(this,!1));get required(){return this.#s}set required(e){this.#s=e}#c=(A(this),j(this,!1));get invalid(){return this.#c}set invalid(e){this.#c=e}errorValue=void M(this);invalidFromError=!1;get error(){return this.errorValue}set error(e){let t=this.errorValue;this.errorValue=e,e?this.invalid||=(this.invalidFromError=!0,!0):this.invalidFromError&&(this.invalidFromError=!1,this.invalid=!1),this.syncInternals(),this.requestUpdate(`error`,t)}#l=N(this,!1);get embedded(){return this.#l}set embedded(e){this.#l=e}#u=(P(this),F(this));get initialActiveValue(){return this.#u}set initialActiveValue(e){this.#u=e}#d=(I(this),L(this,!1));get loading(){return this.#d}set loading(e){this.#d=e}#f=(R(this),z(this,!1));get disabled(){return this.#f}set disabled(e){this.#f=e}#p=(B(this),V(this,``));get name(){return this.#p}set name(e){this.#p=e}#m=(ue(this),H(this));get emptyMessage(){return this.#m}set emptyMessage(e){this.#m=e}#h=(U(this),W(this,`8`));get maxVisible(){return this.#h}set maxVisible(e){this.#h=e}#g=(G(this),K(this));get overrides(){return this.#g}set overrides(e){this.#g=e}#_=(q(this),J(this));get internalValue(){return this.#_}set internalValue(e){this.#_=e}#v=(de(this),fe(this));get activeValue(){return this.#v}set activeValue(e){this.#v=e}#y=(pe(this),me(this,null));get internalActive(){return this.#y}set internalActive(e){this.#y=e}textOverrides=(he(this),{fontFamily:`font.family.body`,lineHeight:`font.lineHeight.normal`});#b=ge(this,!1);get formDisabled(){return this.#b}set formDisabled(e){this.#b=e}#x=(_e(this),ve(this));get listEl(){return this.#x}set listEl(e){this.#x=e}instanceId=(ye(this),`ds-listbox-${++Te}`);errorId=`${this.instanceId}-error`;emptyId=`${this.instanceId}-empty`;typeaheadQuery=``;typeaheadTimer;warnedMissingLabel=!1;internals;constructor(){super(),this.internals=this.attachInternals()}get flatOptions(){return le(this.options)}get enabledOptions(){return this.flatOptions.filter(e=>e.disabled!==!0)}get isDisabled(){return this.disabled||this.formDisabled}get currentValue(){let e=this.value===void 0?this.internalValue:this.value;if(this.multiple){let t=Array.isArray(e)?e:typeof e==`string`&&e!==``?[e]:[];return t.length>0?t:null}let t=Array.isArray(e)?e[0]:e;return typeof t==`string`&&t!==``?t:null}get currentActive(){return this.activeValue===void 0?this.internalActive:this.activeValue}get form(){return this.internals.form}get validationMessage(){return this.computeValidationMessage()??``}get selectedSet(){let e=this.currentValue;return new Set(e===null?[]:Array.isArray(e)?e:[e])}get listHasFocus(){return this.listEl!==null&&this.shadowRoot?.activeElement===this.listEl}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Listbox`),this.setAttribute(`data-ds-field`,``)}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this.typeaheadTimer)}focus(e){this.listEl?.focus(e)}checkValidity(){return this.syncInternals(),this.internals.checkValidity()}reportValidity(){return this.syncInternals(),this.internals.reportValidity()}formDisabledCallback(e){this.formDisabled=e}formResetCallback(){this.internalValue=this.defaultValue}formStateRestoreCallback(e){typeof e==`string`?this.internalValue=e:e instanceof FormData&&(this.internalValue=e.getAll(this.name).filter(e=>typeof e==`string`))}handleKey=e=>{if(this.isDisabled)return;let t=e.key;if(this.multiple&&e.shiftKey&&(t===`ArrowDown`||t===`ArrowUp`)){e.preventDefault(),this.extendSelection(t===`ArrowDown`?1:-1);return}if(this.multiple&&(e.ctrlKey||e.metaKey)&&t.toLowerCase()===`a`){e.preventDefault(),this.toggleSelectAll();return}if(!(e.ctrlKey||e.metaKey||e.altKey))switch(t){case`ArrowDown`:e.preventDefault(),this.moveBy(1);break;case`ArrowUp`:e.preventDefault(),this.moveBy(-1);break;case`Home`:e.preventDefault(),this.moveToIndex(0);break;case`End`:e.preventDefault(),this.moveToIndex(this.enabledOptions.length-1);break;case`PageDown`:e.preventDefault(),this.moveBy(this.pageSize());break;case`PageUp`:e.preventDefault(),this.moveBy(-this.pageSize());break;case` `:e.preventDefault(),this.selectActive();break;case`Enter`:this.multiple||(e.preventDefault(),this.selectActive());break;default:t.length===1&&/[a-z]/i.test(t)&&this.handleTypeahead(t)}};willUpdate(e){this.hasUpdated?e.has(`initialActiveValue`)&&this.followInitialActiveValue():this.internalValue=this.defaultValue,(e.has(`overrides`)||e.has(`embedded`))&&this.applyOverrides(),e.has(`overrides`)&&(this.textOverrides={fontFamily:this.overrides?.fontFamily??`font.family.body`,lineHeight:this.overrides?.lineHeight??`font.lineHeight.normal`})}updated(e){this.syncInternals(),(e.has(`activeValue`)||e.has(`internalActive`))&&this.scrollActiveIntoView()}render(){let e=this.flatOptions,t=new Map;e.forEach((e,n)=>t.set(e.value,`${this.instanceId}-option-${n}`));let n=this.isDisabled?null:this.currentActive,r=n===null?void 0:t.get(n),a=this.displayedMessage(),o=[e.length===0?this.emptyId:null,a?this.errorId:null].filter(Boolean).join(` `)||void 0;return d`
      <div class="root">
        <div
          data-part="list"
          part="list"
          role="listbox"
          tabindex=${this.embedded?`-1`:`0`}
          aria-label=${c(this.label||void 0)}
          aria-multiselectable=${c(this.multiple?`true`:void 0)}
          aria-required=${c(this.required?`true`:void 0)}
          aria-invalid=${c(this.invalid?`true`:void 0)}
          aria-describedby=${c(o)}
          aria-busy=${c(this.loading?`true`:void 0)}
          aria-disabled=${c(this.isDisabled?`true`:void 0)}
          aria-activedescendant=${c(r)}
          @keydown=${this.handleKey}
          @focus=${this.handleListFocus}
          @blur=${this.handleListBlur}
        >
          ${e.length===0?this.renderEmpty():this.renderItems(t,n)}
        </div>
        ${a?d`<ds-text
              id=${this.errorId}
              data-part="errorMessage"
              part="errorMessage"
              element="p"
              size="sm"
              tone="danger"
              .overrides=${this.textOverrides}
              >${a}</ds-text
            >`:i}
      </div>
    `}renderEmpty(){return d`<div class="empty" id=${this.emptyId} aria-hidden="true">
      <ds-text data-part="emptyState" part="emptyState" element="p" tone="muted" .overrides=${this.textOverrides}
        >${this.loading?xe:this.emptyMessage||be}</ds-text
      >
    </div>`}renderItems(e,t){let n=0;return this.options.map(r=>{if(!f(r))return this.renderOption(r,e.get(r.value),t);if(r.options.length===0)return i;let a=`${this.instanceId}-group-${n++}`;return d`
        <div data-part="group" part="group" role="group" aria-labelledby=${a}>
          <div data-part="groupLabel" part="groupLabel" id=${a}>${r.group}</div>
          ${r.options.map(n=>this.renderOption(n,e.get(n.value),t))}
        </div>
      `})}renderOption(e,t,n){let r=this.isDisabled||e.disabled===!0,a=this.selectedSet.has(e.value),o=e.description?`${t}-description`:void 0;return d`
      <div
        id=${t}
        data-part="option"
        part="option"
        role="option"
        data-value=${e.value}
        ?data-active=${n===e.value}
        aria-selected=${a?`true`:`false`}
        aria-disabled=${c(r?`true`:void 0)}
        aria-describedby=${c(o)}
        @click=${()=>this.handleOptionClick(e)}
        @pointermove=${()=>this.handleOptionPointer(e)}
      >
        ${this.multiple?d`<ds-icon
              data-part="optionCheck"
              part="optionCheck"
              name="check"
              size="sm"
              .overrides=${Se}
            ></ds-icon>`:i}
        ${e.icon?d`<ds-icon
              data-part="optionIcon"
              part="optionIcon"
              name=${e.icon}
              size="sm"
              .overrides=${Ce}
            ></ds-icon>`:i}
        <span class="option-text">
          <span data-part="optionLabel" part="optionLabel">${e.label}</span>
          ${e.description?d`<span id=${c(o)} data-part="optionDescription" part="optionDescription"
                >${e.description}</span
              >`:i}
        </span>
      </div>
    `}displayedMessage(){if(this.errorValue)return this.errorValue;if(!this.invalid)return``;let e=this.label??``;return this.required&&this.currentValue===null?Y(e):X(e)}initialOption(){let e=this.enabledOptions,t=this.initialActiveValue===void 0?void 0:e.find(e=>e.value===this.initialActiveValue),n=this.selectedSet;return t??e.find(e=>n.has(e.value))??e[0]}followInitialActiveValue(){let e=this.initialActiveValue;e===void 0||e===this.internalActive||this.listHasFocus||this.enabledOptions.some(t=>t.value===e)&&(this.internalActive=e)}handleListFocus=()=>{if(this.isDisabled)return;let e=this.currentActive,t=this.enabledOptions.find(t=>t.value===e)??this.initialOption();t&&this.setActive(t.value,!0)};handleListBlur=()=>{this.isDisabled||this.currentActive===null||this.setActive(null)};handleOptionClick(e){this.isDisabled||e.disabled===!0||(this.setActive(e.value),this.selectActive())}handleOptionPointer(e){this.isDisabled||e.disabled===!0||this.setActive(e.value)}activeIndex(){let e=this.currentActive;return e===null?-1:this.enabledOptions.findIndex(t=>t.value===e)}moveBy(e){let t=this.enabledOptions.length,n=this.activeIndex();if(n===-1){this.moveToIndex(e>0?0:t-1);return}this.moveToIndex(n+e)}moveToIndex(e){let t=this.enabledOptions;if(t.length===0)return;let n=t[Math.max(0,Math.min(t.length-1,e))];this.setActive(n.value),!this.multiple&&this.selectionFollowsFocus&&this.selectSingle(n.value)}pageSize(){return this.maxVisible===`all`?this.enabledOptions.length:Number(this.maxVisible)}extendSelection(e){let t=this.enabledOptions;if(t.length===0)return;let n=this.activeIndex(),r=n===-1?e>0?0:t.length-1:n+e,i=t[Math.max(0,Math.min(t.length-1,r))];this.setActive(i.value);let a=this.selectedSet;a.has(i.value)||(a.add(i.value),this.commitValue(this.orderValues(a)))}toggleSelectAll(){let e=this.enabledOptions.map(e=>e.value);if(e.length===0)return;let t=this.selectedSet;if(e.every(e=>t.has(e)))for(let n of e)t.delete(n);else for(let n of e)t.add(n);this.commitValue(this.orderValues(t))}handleTypeahead(e){clearTimeout(this.typeaheadTimer);let t=ce(getComputedStyle(this.listEl??this).getPropertyValue(Z.typeaheadReset));this.typeaheadTimer=setTimeout(()=>{this.typeaheadQuery=``},t);let n=this.typeaheadQuery+e.toLowerCase();this.typeaheadQuery=n;let r=this.enabledOptions;if(r.length===0)return;let i=n.length>1&&[...n].every(e=>e===n[0])?n[0]:n,a=this.activeIndex(),o=a===-1?0:a,s=a===-1?0:+(i.length===1);for(let e=s;e<r.length+s;e++){let t=(o+e)%r.length;if(r[t].label.toLowerCase().startsWith(i)){this.moveToIndex(t);break}}t<=0&&(clearTimeout(this.typeaheadTimer),this.typeaheadQuery=``)}selectActive(){let e=this.currentActive,t=e===null?this.initialOption():this.enabledOptions.find(t=>t.value===e);if(t){if(this.setActive(t.value),this.multiple){let e=this.selectedSet;e.has(t.value)?e.delete(t.value):e.add(t.value),this.commitValue(this.orderValues(e))}else this.selectSingle(t.value)}}selectSingle(e){this.currentValue!==e&&this.commitValue(e)}orderValues(e){let t=this.flatOptions.map(e=>e.value);return[...t.filter(t=>e.has(t)),...[...e].filter(e=>!t.includes(e))]}setActive(e,t=!1){(t||this.currentActive!==e)&&(this.activeValue===void 0&&(this.internalActive=e),this.dispatchEvent(new CustomEvent(`active-change`,{detail:{value:e},bubbles:!0,composed:!0})))}scrollActiveIntoView(){let e=this.currentActive;e===null||this.isDisabled||this.renderRoot.querySelector(`[data-part=option][data-value="${CSS.escape(e)}"]`)?.scrollIntoView({block:`nearest`})}commitValue(e){this.value===void 0&&(this.internalValue=e),this.dispatchEvent(new CustomEvent(`change`,{detail:{value:e},bubbles:!0,composed:!0}))}computeValidationMessage(){let e=this.label??``;return this.required&&this.currentValue===null?Y(e):this.errorValue?this.errorValue:this.invalid?X(e):null}syncInternals(){let e=this.currentValue;if(this.isDisabled||e===null||!this.name)this.internals.setFormValue(null);else if(Array.isArray(e)){let t=new FormData;for(let n of e)t.append(this.name,n);this.internals.setFormValue(t)}else this.internals.setFormValue(e);let t=this.computeValidationMessage();t===null?this.internals.setValidity({}):this.required&&e===null?this.internals.setValidity({valueMissing:!0},t,this.listEl??void 0):this.internals.setValidity({customError:!0},t,this.listEl??void 0)}applyOverrides(){for(let e of Object.keys(Z)){let t=this.overrides?.[e],n=Z[e];t===void 0||this.embedded&&we.has(e)?this.style.removeProperty(n):this.style.setProperty(n,te(t))}}}];formAssociated=!0;shadowRootOptions={...u.shadowRootOptions,delegatesFocus:!0};styles=t`
    :host {
      display: block;
      --ds-listbox-border: var(--color-border-strong);
      --ds-listbox-border-invalid: var(--color-border-danger);
      --ds-listbox-part-gap: var(--space-1);
      --ds-listbox-border-width: var(--border-width-thin);
      --ds-listbox-radius: var(--radius-md);
      --ds-listbox-list-padding: var(--space-1);
      --ds-listbox-option-padding-block: var(--space-sm);
      --ds-listbox-option-padding-inline: var(--space-md);
      --ds-listbox-option-gap: var(--layout-gap-normal);
      --ds-listbox-option-radius: var(--radius-sm);
      --ds-listbox-option-description-size: var(--font-size-sm);
      --ds-listbox-option-weight: var(--font-weight-regular);
      --ds-listbox-option-selected-weight: var(--font-weight-medium);
      --ds-listbox-group-label-size: var(--font-size-xs);
      --ds-listbox-group-label-weight: var(--font-weight-semibold);
      --ds-listbox-group-label-padding-block: var(--space-1);
      --ds-listbox-font-family: var(--font-family-body);
      --ds-listbox-font-size: var(--font-size-md);
      --ds-listbox-line-height: var(--font-line-height-normal);
      --ds-listbox-disabled-opacity: var(--opacity-disabled);
      --ds-listbox-typeahead-reset: var(--motion-duration-loop);
      /* Locked bindings: out of the overrides API, still hooks for page CSS and the naming codemod. */
      --ds-listbox-surface: var(--color-background);
      --ds-listbox-option-color: var(--color-foreground);
      --ds-listbox-option-description-color: var(--color-foreground-muted);
      --ds-listbox-option-active-background: var(--color-background-subtle);
      --ds-listbox-option-selected-check: var(--color-control-selected-background);
      --ds-listbox-group-label-color: var(--color-foreground-muted);
      --ds-listbox-min-target: var(--size-target-min);
      --ds-listbox-focus-ring: var(--color-border-focus);
      --ds-listbox-focus-ring-width: var(--border-width-focus);
      /*
       * errorText and emptyColor are realised by the composed Text's tone (danger / muted);
       * these hooks are declared for the hook gate and naming codemod, not read here.
       */
      --ds-listbox-error-text: var(--color-foreground-danger);
      --ds-listbox-empty-color: var(--color-foreground-muted);
    }

    :host([hidden]) {
      display: none;
    }

    /* The root wrapper (not an anatomy part): list, then errorMessage, partGap apart. */
    .root {
      display: flex;
      flex-direction: column;
      gap: var(--ds-listbox-part-gap);
    }

    [data-part='list'] {
      --ds-listbox-frame: var(--ds-listbox-border-width);
      /* Row height from Behavior: max(minTarget, fontSize × lineHeight + 2 × optionPaddingBlock), never measured. */
      --ds-listbox-row-size: max(
        var(--ds-listbox-min-target),
        calc(var(--ds-listbox-font-size) * var(--ds-listbox-line-height) + 2 * var(--ds-listbox-option-padding-block))
      );
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      padding: var(--ds-listbox-list-padding);
      border-style: solid;
      border-width: var(--ds-listbox-border-width);
      border-color: var(--ds-listbox-border);
      border-radius: var(--ds-listbox-radius);
      /* surface: color.background, locked */
      background: var(--ds-listbox-surface);
      font-family: var(--ds-listbox-font-family);
      font-size: var(--ds-listbox-font-size);
      line-height: var(--ds-listbox-line-height);
      overflow-y: auto;
      outline: none;
      max-block-size: calc(
        var(--ds-listbox-row-size) * var(--ds-listbox-rows) + 2 * var(--ds-listbox-list-padding) + 2 *
          var(--ds-listbox-frame)
      );
    }

    :host([max-visible='5']) [data-part='list'] {
      --ds-listbox-rows: 5;
    }
    :host(:not([max-visible])) [data-part='list'],
    :host([max-visible='8']) [data-part='list'] {
      --ds-listbox-rows: 8;
    }
    :host([max-visible='12']) [data-part='list'] {
      --ds-listbox-rows: 12;
    }
    :host([max-visible='all']) [data-part='list'] {
      max-block-size: none;
      overflow-y: visible;
    }

    :host([invalid]) [data-part='list'] {
      border-color: var(--ds-listbox-border-invalid);
    }

    /* embedded: the popup owns border, surface and radius; listPadding stays */
    :host([embedded]) [data-part='list'] {
      --ds-listbox-frame: calc(0 * var(--ds-listbox-border-width));
      border-style: none;
      border-width: 0;
      border-radius: 0;
      background: none;
    }

    /* focusRing / focusRingWidth: color.border.focus / border.width.focus, locked */
    [data-part='list']:focus-visible {
      outline: var(--ds-listbox-focus-ring-width) solid var(--ds-listbox-focus-ring);
      outline-offset: calc(-1 * var(--ds-listbox-focus-ring-width));
    }

    /*
     * disabledOpacity dims the list once; the error message, which sits outside
     * the list, stays at full opacity. Keyed on aria-disabled rather than
     * :host([disabled]) so a list disabled by an owning form or fieldset is
     * dimmed the same way.
     */
    [data-part='list'][aria-disabled='true'] {
      opacity: var(--ds-listbox-disabled-opacity);
      cursor: not-allowed;
    }

    [data-part='group'] {
      display: flex;
      flex-direction: column;
    }

    [data-part='groupLabel'] {
      padding-block: var(--ds-listbox-group-label-padding-block);
      padding-inline: var(--ds-listbox-option-padding-inline);
      font-size: var(--ds-listbox-group-label-size);
      font-weight: var(--ds-listbox-group-label-weight);
      /* groupLabelColor: color.foreground.muted, locked */
      color: var(--ds-listbox-group-label-color);
    }

    [data-part='option'] {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: var(--ds-listbox-option-gap);
      /* minTarget: size.target.min, locked */
      min-block-size: var(--ds-listbox-min-target);
      padding-block: var(--ds-listbox-option-padding-block);
      padding-inline: var(--ds-listbox-option-padding-inline);
      border-radius: var(--ds-listbox-option-radius);
      /* optionColor: color.foreground, locked */
      color: var(--ds-listbox-option-color);
      cursor: pointer;
      user-select: none;
    }

    /* optionActiveBackground: color.background.subtle, locked — keyboard and hover share it */
    [data-part='option'][data-active] {
      background: var(--ds-listbox-option-active-background);
    }

    /* optionWeight is the base row weight; the selected rule below is more specific and wins. */
    [data-part='option'] [data-part='optionLabel'] {
      font-weight: var(--ds-listbox-option-weight);
    }

    /* optionSelectedWeight: selection is shown by weight (and the check with multiple), never a row fill */
    [data-part='option'][aria-selected='true'] [data-part='optionLabel'] {
      font-weight: var(--ds-listbox-option-selected-weight);
    }

    [data-part='option'][aria-disabled='true'] {
      opacity: var(--ds-listbox-disabled-opacity);
      cursor: not-allowed;
    }
    /* A disabled list is dimmed once: its rows are not dimmed again on top of it. */
    [data-part='list'][aria-disabled='true'] [data-part='option'][aria-disabled='true'] {
      opacity: 1;
    }

    /* optionSelectedCheck: always rendered with multiple (invisible when unselected) so labels align */
    [data-part='optionCheck'] {
      flex: none;
      visibility: hidden;
    }
    [data-part='option'][aria-selected='true'] [data-part='optionCheck'] {
      visibility: visible;
    }

    [data-part='optionIcon'] {
      flex: none;
    }

    .option-text {
      display: flex;
      flex-direction: column;
      min-inline-size: 0;
    }

    [data-part='optionDescription'] {
      font-size: var(--ds-listbox-option-description-size);
      /* optionDescriptionColor: color.foreground.muted, locked */
      color: var(--ds-listbox-option-description-color);
    }

    /* The empty/loading row lines up with the rows it replaces. */
    .empty {
      padding-block: var(--ds-listbox-option-padding-block);
      padding-inline: var(--ds-listbox-option-padding-inline);
    }
  `;constructor(){super(Ee),m()}}})))()}export{$ as t};