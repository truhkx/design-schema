import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{O as t,_ as n,a as r,b as i,c as a,f as ee,g as te,h as ne,i as re,o as ie,p as ae,r as o,t as oe,u as s,v as c,w as l}from"./if-defined-CARySXJh.js";import{t as se}from"./query-BHY-nhsh.js";import{t as ce}from"./Icon-BHsrajXm.js";import{t as le}from"./Text-C3do0IPT.js";function ue(e){let t=e.trim(),n=parseFloat(t);return Number.isNaN(n)?0:t.endsWith(`ms`)?n:t.endsWith(`s`)?n*1e3:n}function u(e){return`group`in e}function de(e){let t=[];for(let n of e)u(n)?t.push(...n.options):t.push(n);return t}var d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,fe,R,z,B,V,H,U,W,G,K,q,J,pe,me,he,ge,_e,Y,X,Z,ve,ye,Q,be,xe,Se,Ce;function $(){return($=e((()=>{te(),n(),ie(),oe(),r(),ce(),le(),Y=`No options`,X=e=>`${e} is required.`,Z=e=>`${e} is not valid.`,ve=`Loading…`,ye={color:`color.control.selectedBackground`},Q={border:`--ds-listbox-border`,borderInvalid:`--ds-listbox-border-invalid`,partGap:`--ds-listbox-part-gap`,borderWidth:`--ds-listbox-border-width`,radius:`--ds-listbox-radius`,listPadding:`--ds-listbox-list-padding`,optionPaddingBlock:`--ds-listbox-option-padding-block`,optionPaddingInline:`--ds-listbox-option-padding-inline`,optionGap:`--ds-listbox-option-gap`,optionRadius:`--ds-listbox-option-radius`,optionDescriptionSize:`--ds-listbox-option-description-size`,optionSelectedWeight:`--ds-listbox-option-selected-weight`,groupLabelSize:`--ds-listbox-group-label-size`,groupLabelWeight:`--ds-listbox-group-label-weight`,groupLabelPaddingBlock:`--ds-listbox-group-label-padding-block`,fontFamily:`--ds-listbox-font-family`,fontSize:`--ds-listbox-font-size`,lineHeight:`--ds-listbox-line-height`,disabledOpacity:`--ds-listbox-disabled-opacity`,typeaheadReset:`--ds-listbox-typeahead-reset`},be=new Set([`border`,`borderInvalid`,`borderWidth`,`radius`]),xe={fromAttribute:e=>e===null,toAttribute:e=>e?null:``},Se=0,new class extends ae{static[class extends c{static{({e:[p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,fe,R,z,B,V,H,U,W,G,K,q,J,pe,me,he,ge,_e,d],c:[Ce,f]}=ne(this,[ee(`ds-listbox`)],[[s(),1,`label`],[s({attribute:`labelled-by`}),1,`labelledBy`],[s({attribute:!1}),1,`options`],[s({type:Boolean,reflect:!0}),1,`multiple`],[s({attribute:!1}),1,`value`],[s({attribute:!1}),1,`defaultValue`],[s({attribute:`no-selection-follows-focus`,reflect:!0,converter:xe}),1,`selectionFollowsFocus`],[s({type:Boolean,reflect:!0}),1,`required`],[s({type:Boolean,reflect:!0}),1,`invalid`],[s(),4,`error`],[s({type:Boolean,reflect:!0}),1,`embedded`],[s({attribute:`initial-active-value`}),1,`initialActiveValue`],[s({type:Boolean,reflect:!0}),1,`loading`],[s({type:Boolean,reflect:!0}),1,`disabled`],[s(),1,`name`],[s({attribute:`empty-message`}),1,`emptyMessage`],[s({attribute:`max-visible`,reflect:!0}),1,`maxVisible`],[s({attribute:!1}),1,`overrides`],[a(),1,`internalValue`],[a(),1,`activeValue`],[a(),1,`formDisabled`],[se(`[data-part=list]`),1,`listEl`]],0,void 0,c))}#e=(d(this),p(this));get label(){return this.#e}set label(e){this.#e=e}#t=(m(this),h(this));get labelledBy(){return this.#t}set labelledBy(e){this.#t=e}#n=(g(this),_(this,[]));get options(){return this.#n}set options(e){this.#n=e}#r=(v(this),y(this,!1));get multiple(){return this.#r}set multiple(e){this.#r=e}#i=(b(this),x(this));get value(){return this.#i}set value(e){this.#i=e}#a=(S(this),C(this));get defaultValue(){return this.#a}set defaultValue(e){this.#a=e}#o=(w(this),T(this,!0));get selectionFollowsFocus(){return this.#o}set selectionFollowsFocus(e){this.#o=e}#s=(E(this),D(this,!1));get required(){return this.#s}set required(e){this.#s=e}#c=(O(this),k(this,!1));get invalid(){return this.#c}set invalid(e){this.#c=e}errorValue=void A(this);invalidFromError=!1;get error(){return this.errorValue}set error(e){let t=this.errorValue;this.errorValue=e,e?this.invalid||=(this.invalidFromError=!0,!0):this.invalidFromError&&(this.invalidFromError=!1,this.invalid=!1),this.syncInternals(),this.requestUpdate(`error`,t)}#l=j(this,!1);get embedded(){return this.#l}set embedded(e){this.#l=e}#u=(M(this),N(this));get initialActiveValue(){return this.#u}set initialActiveValue(e){this.#u=e}#d=(P(this),F(this,!1));get loading(){return this.#d}set loading(e){this.#d=e}#f=(I(this),L(this,!1));get disabled(){return this.#f}set disabled(e){this.#f=e}#p=(fe(this),R(this,``));get name(){return this.#p}set name(e){this.#p=e}#m=(z(this),B(this));get emptyMessage(){return this.#m}set emptyMessage(e){this.#m=e}#h=(V(this),H(this,`8`));get maxVisible(){return this.#h}set maxVisible(e){this.#h=e}#g=(U(this),W(this));get overrides(){return this.#g}set overrides(e){this.#g=e}#_=(G(this),K(this));get internalValue(){return this.#_}set internalValue(e){this.#_=e}#v=(q(this),J(this,null));get activeValue(){return this.#v}set activeValue(e){this.#v=e}#y=(pe(this),me(this,!1));get formDisabled(){return this.#y}set formDisabled(e){this.#y=e}#b=(he(this),ge(this));get listEl(){return this.#b}set listEl(e){this.#b=e}instanceId=(_e(this),`ds-listbox-${++Se}`);typeaheadQuery=``;typeaheadTimer;internals;constructor(){super(),this.internals=this.attachInternals()}get flatOptions(){return de(this.options)}get enabledOptions(){return this.flatOptions.filter(e=>e.disabled!==!0)}get isDisabled(){return this.disabled||this.formDisabled}get currentValue(){let e=this.value===void 0?this.internalValue:this.value;if(this.multiple){let t=Array.isArray(e)?e:typeof e==`string`&&e!==``?[e]:[];return t.length>0?t:null}return typeof e==`string`&&e!==``?e:null}get form(){return this.internals.form}get validationMessage(){return this.computeValidationMessage()??``}get selectedSet(){let e=this.currentValue;return new Set(e===null?[]:Array.isArray(e)?e:[e])}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Listbox`),this.setAttribute(`data-ds-field`,``)}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this.typeaheadTimer)}focus(e){this.listEl?.focus(e)}checkValidity(){return this.syncInternals(),this.internals.checkValidity()}reportValidity(){return this.syncInternals(),this.internals.reportValidity()}formDisabledCallback(e){this.formDisabled=e}formResetCallback(){this.internalValue=this.defaultValue}formStateRestoreCallback(e){typeof e==`string`?this.internalValue=e:e instanceof FormData&&(this.internalValue=e.getAll(this.name).filter(e=>typeof e==`string`))}handleKey=e=>{if(this.isDisabled)return;let t=e.key;if(this.multiple&&e.shiftKey&&(t===`ArrowDown`||t===`ArrowUp`)){e.preventDefault(),this.extendSelection(t===`ArrowDown`?1:-1);return}if(this.multiple&&(e.ctrlKey||e.metaKey)&&t.toLowerCase()===`a`){e.preventDefault(),this.toggleSelectAll();return}if(!(e.ctrlKey||e.metaKey||e.altKey))switch(t){case`ArrowDown`:e.preventDefault(),this.moveBy(1);break;case`ArrowUp`:e.preventDefault(),this.moveBy(-1);break;case`Home`:e.preventDefault(),this.moveToIndex(0);break;case`End`:e.preventDefault(),this.moveToIndex(this.enabledOptions.length-1);break;case`PageDown`:e.preventDefault(),this.moveBy(this.pageSize());break;case`PageUp`:e.preventDefault(),this.moveBy(-this.pageSize());break;case` `:e.preventDefault(),this.selectActive();break;case`Enter`:this.multiple||(e.preventDefault(),this.selectActive());break;default:t.length===1&&/[a-z]/i.test(t)&&this.handleTypeahead(t)}};willUpdate(e){this.hasUpdated||(this.internalValue=this.defaultValue),(e.has(`overrides`)||e.has(`embedded`))&&this.applyOverrides()}updated(){this.syncInternals()}render(){let e=this.flatOptions,t=new Map;e.forEach((e,n)=>t.set(e.value,`${this.instanceId}-option-${n}`));let n=this.activeValue===null?void 0:t.get(this.activeValue),r=this.displayedMessage();return l`
      <div class="root">
        <div
          data-part="list"
          part="list"
          role="listbox"
          tabindex="0"
          aria-label=${o(this.label||void 0)}
          aria-multiselectable=${o(this.multiple?`true`:void 0)}
          aria-required=${o(this.required?`true`:void 0)}
          aria-invalid=${o(this.invalid?`true`:void 0)}
          aria-describedby=${o(r?`errorMessage`:void 0)}
          aria-busy=${o(this.loading?`true`:void 0)}
          aria-disabled=${o(this.isDisabled?`true`:void 0)}
          aria-activedescendant=${o(n)}
          @keydown=${this.handleKey}
          @focus=${this.handleListFocus}
          @blur=${this.handleListBlur}
        >
          ${e.length===0?this.renderEmpty():this.renderItems(t)}
        </div>
        ${r?l`<ds-text id="errorMessage" data-part="errorMessage" part="errorMessage" element="p" size="sm" tone="danger"
              >${r}</ds-text
            >`:i}
      </div>
    `}renderEmpty(){return l`<div class="empty">
      <ds-text data-part="emptyState" part="emptyState" element="p" tone="muted"
        >${this.loading?ve:this.emptyMessage||Y}</ds-text
      >
    </div>`}renderItems(e){let t=0;return this.options.map(n=>{if(!u(n))return this.renderOption(n,e.get(n.value));if(n.options.length===0)return i;let r=`${this.instanceId}-group-${t++}`;return l`
        <div data-part="group" part="group" role="group" aria-labelledby=${r}>
          <div data-part="groupLabel" part="groupLabel" id=${r}>${n.group}</div>
          ${n.options.map(t=>this.renderOption(t,e.get(t.value)))}
        </div>
      `})}renderOption(e,t){let n=this.isDisabled||e.disabled===!0,r=this.selectedSet.has(e.value);return l`
      <div
        id=${t}
        data-part="option"
        part="option"
        role="option"
        data-value=${e.value}
        ?data-active=${this.activeValue===e.value}
        aria-selected=${r?`true`:`false`}
        aria-disabled=${o(n?`true`:void 0)}
        @click=${()=>this.handleOptionClick(e)}
        @pointermove=${()=>this.handleOptionPointer(e)}
      >
        ${this.multiple?l`<ds-icon
              data-part="optionCheck"
              part="optionCheck"
              name="check"
              size="sm"
              .overrides=${ye}
            ></ds-icon>`:i}
        ${e.icon?l`<ds-icon data-part="optionIcon" part="optionIcon" name=${e.icon} size="sm"></ds-icon>`:i}
        <span class="option-text">
          <span data-part="optionLabel" part="optionLabel">${e.label}</span>
          ${e.description?l`<span data-part="optionDescription" part="optionDescription">${e.description}</span>`:i}
        </span>
      </div>
    `}displayedMessage(){if(this.errorValue)return this.errorValue;if(!this.invalid)return``;let e=this.label??``;return this.required&&this.currentValue===null?X(e):Z(e)}initialOption(){let e=this.enabledOptions,t=this.initialActiveValue===void 0?void 0:e.find(e=>e.value===this.initialActiveValue),n=this.selectedSet;return t??e.find(e=>n.has(e.value))??e[0]}handleListFocus=()=>{if(this.isDisabled||this.activeValue!==null)return;let e=this.initialOption();e&&this.setActive(e.value)};handleListBlur=()=>{this.setActive(null)};handleOptionClick(e){this.isDisabled||e.disabled===!0||(this.setActive(e.value),this.selectActive())}handleOptionPointer(e){this.isDisabled||e.disabled===!0||this.setActive(e.value)}activeIndex(){return this.activeValue===null?-1:this.enabledOptions.findIndex(e=>e.value===this.activeValue)}moveBy(e){let t=this.enabledOptions.length,n=this.activeIndex();if(n===-1){this.moveToIndex(e>0?0:t-1);return}this.moveToIndex(n+e)}moveToIndex(e){let t=this.enabledOptions;if(t.length===0)return;let n=t[Math.max(0,Math.min(t.length-1,e))];this.setActive(n.value),!this.multiple&&this.selectionFollowsFocus&&this.selectSingle(n.value)}pageSize(){return this.maxVisible===`all`?this.enabledOptions.length:Number(this.maxVisible)}extendSelection(e){let t=this.enabledOptions;if(t.length===0)return;let n=this.activeIndex(),r=n===-1?e>0?0:t.length-1:n+e,i=t[Math.max(0,Math.min(t.length-1,r))];this.setActive(i.value);let a=this.selectedSet;a.has(i.value)||(a.add(i.value),this.commitValue(this.orderValues(a)))}toggleSelectAll(){let e=this.enabledOptions.map(e=>e.value);if(e.length===0)return;let t=this.selectedSet;if(e.every(e=>t.has(e)))for(let n of e)t.delete(n);else for(let n of e)t.add(n);this.commitValue(this.orderValues(t))}handleTypeahead(e){clearTimeout(this.typeaheadTimer);let t=ue(getComputedStyle(this.listEl??this).getPropertyValue(Q.typeaheadReset));this.typeaheadTimer=setTimeout(()=>{this.typeaheadQuery=``},t);let n=this.typeaheadQuery+e.toLowerCase();this.typeaheadQuery=n;let r=this.enabledOptions,i=this.activeIndex(),a=n.length===1?i+1:Math.max(i,0);for(let e=0;e<r.length;e++){let t=(a+e)%r.length;if(r[t].label.toLowerCase().startsWith(n)){this.moveToIndex(t);return}}}selectActive(){let e=this.activeValue===null?this.initialOption():this.enabledOptions.find(e=>e.value===this.activeValue);if(e){if(this.setActive(e.value),this.multiple){let t=this.selectedSet;t.has(e.value)?t.delete(e.value):t.add(e.value),this.commitValue(this.orderValues(t))}else this.selectSingle(e.value)}}selectSingle(e){this.currentValue!==e&&this.commitValue(e)}orderValues(e){let t=this.flatOptions.map(e=>e.value);return[...t.filter(t=>e.has(t)),...[...e].filter(e=>!t.includes(e))]}setActive(e){this.activeValue!==e&&(this.activeValue=e,this.dispatchEvent(new CustomEvent(`active-change`,{detail:{value:e},bubbles:!0,composed:!0})),this.scrollActiveIntoView())}async scrollActiveIntoView(){await this.updateComplete,this.activeValue!==null&&this.renderRoot.querySelector(`[data-part=option][data-value="${CSS.escape(this.activeValue)}"]`)?.scrollIntoView({block:`nearest`})}commitValue(e){this.value===void 0&&(this.internalValue=e),this.dispatchEvent(new CustomEvent(`change`,{detail:{value:e},bubbles:!0,composed:!0}))}computeValidationMessage(){let e=this.label??``;return this.required&&this.currentValue===null?X(e):this.errorValue?this.errorValue:this.invalid?Z(e):null}syncInternals(){let e=this.currentValue;if(this.isDisabled||e===null||!this.name)this.internals.setFormValue(null);else if(Array.isArray(e)){let t=new FormData;for(let n of e)t.append(this.name,n);this.internals.setFormValue(t)}else this.internals.setFormValue(e);let t=this.computeValidationMessage();t===null?this.internals.setValidity({}):this.required&&e===null?this.internals.setValidity({valueMissing:!0},t,this.listEl??void 0):this.internals.setValidity({customError:!0},t,this.listEl??void 0)}applyOverrides(){for(let e of Object.keys(Q)){let t=this.overrides?.[e],n=Q[e];t===void 0||this.embedded&&be.has(e)?this.style.removeProperty(n):this.style.setProperty(n,re(t))}}}];formAssociated=!0;shadowRootOptions={...c.shadowRootOptions,delegatesFocus:!0};styles=t`
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
      --ds-listbox-option-selected-weight: var(--font-weight-medium);
      --ds-listbox-group-label-size: var(--font-size-xs);
      --ds-listbox-group-label-weight: var(--font-weight-semibold);
      --ds-listbox-group-label-padding-block: var(--space-1);
      --ds-listbox-font-family: var(--font-family-body);
      --ds-listbox-font-size: var(--font-size-md);
      --ds-listbox-line-height: var(--font-line-height-normal);
      --ds-listbox-disabled-opacity: var(--opacity-disabled);
      --ds-listbox-typeahead-reset: var(--motion-duration-loop);
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
        var(--size-target-min),
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
      background: var(--color-background);
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
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: calc(-1 * var(--border-width-focus));
    }

    /* disabledOpacity dims the list once; the error message stays at full opacity */
    :host([disabled]) [data-part='list'] {
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
      color: var(--color-foreground-muted);
    }

    [data-part='option'] {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: var(--ds-listbox-option-gap);
      /* minTarget: size.target.min, locked */
      min-block-size: var(--size-target-min);
      padding-block: var(--ds-listbox-option-padding-block);
      padding-inline: var(--ds-listbox-option-padding-inline);
      border-radius: var(--ds-listbox-option-radius);
      /* optionColor: color.foreground, locked */
      color: var(--color-foreground);
      cursor: pointer;
      user-select: none;
    }

    /* optionActiveBackground: color.background.subtle, locked — keyboard and hover share it */
    [data-part='option'][data-active] {
      background: var(--color-background-subtle);
    }

    /* optionSelectedWeight: selection is shown by weight (and the check with multiple), never a row fill */
    [data-part='option'][aria-selected='true'] [data-part='optionLabel'] {
      font-weight: var(--ds-listbox-option-selected-weight);
    }

    [data-part='option'][aria-disabled='true'] {
      opacity: var(--ds-listbox-disabled-opacity);
      cursor: not-allowed;
    }
    :host([disabled]) [data-part='option'][aria-disabled='true'] {
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
      color: var(--color-foreground-muted);
    }

    .empty {
      padding-block: var(--ds-listbox-option-padding-block);
      padding-inline: var(--ds-listbox-option-padding-inline);
    }
  `;constructor(){super(Ce),f()}}})))()}export{$ as t};