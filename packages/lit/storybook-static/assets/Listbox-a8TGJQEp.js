import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{C as t,a as n,c as r,d as i,f as ee,h as a,p as o,r as s,s as te,t as ne,u as re,y as c}from"./decorators-BlUBDG4K.js";import{t as ie}from"./query-BHY-nhsh.js";import{a as ae,i as oe,r as l,t as se}from"./if-defined-BfpvQ5_i.js";import{t as ce}from"./Icon-CGupucWg.js";import{n as u,t as le}from"./class-map-ByT5L8jj.js";import{t as ue}from"./Text-Dgpz9DWN.js";import{r as de,t as fe}from"./style-map-BVFfHnm-.js";function d(e){return`group`in e}function f(e){let t=[];for(let n of e)d(n)?t.push(...f(n.options)):t.push(n);return t}var p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,pe,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,me,he,Z,ge,_e,ve,ye,be,xe,Se,Q,Ce,we;function $(){return($=e((()=>{i(),ee(),ne(),se(),le(),fe(),ae(),ce(),ue(),ve=`No options`,ye=e=>`${e} is required.`,be=`Loading…`,xe=e=>`${e} is not valid.`,Se=500,Q={border:`--ds-listbox-border`,borderWidth:`--ds-listbox-border-width`,radius:`--ds-listbox-radius`,listPadding:`--ds-listbox-list-padding`,optionPaddingBlock:`--ds-listbox-option-padding-block`,optionPaddingInline:`--ds-listbox-option-padding-inline`,optionGap:`--ds-listbox-option-gap`,optionRadius:`--ds-listbox-option-radius`,optionDescriptionSize:`--ds-listbox-option-description-size`,optionSelectedWeight:`--ds-listbox-option-selected-weight`,groupLabelSize:`--ds-listbox-group-label-size`,groupLabelWeight:`--ds-listbox-group-label-weight`,groupLabelPaddingBlock:`--ds-listbox-group-label-padding-block`,fontFamily:`--ds-listbox-font-family`,fontSize:`--ds-listbox-font-size`,lineHeight:`--ds-listbox-line-height`,disabledOpacity:`--ds-listbox-disabled-opacity`},Ce=0,new class extends r{static[class extends o{static{({e:[h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,pe,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,me,he,Z,ge,_e,p],c:[we,m]}=re(this,[te(`ds-listbox`)],[[n(),1,`label`],[n(),1,`labelledBy`],[n({attribute:!1}),1,`options`],[n({type:Boolean,reflect:!0}),1,`multiple`],[n({attribute:!1}),1,`value`],[n({attribute:!1}),1,`defaultValue`],[n({attribute:`no-selection-follows-focus`,converter:{fromAttribute:e=>e===null,toAttribute:e=>e?null:``}}),1,`selectionFollowsFocus`],[n({type:Boolean,reflect:!0}),1,`required`],[n({type:Boolean}),1,`invalid`],[n(),4,`error`],[n({type:Boolean}),1,`embedded`],[n({type:Boolean,reflect:!0}),1,`disabled`],[n(),1,`name`],[n({attribute:`empty-message`}),1,`emptyMessage`],[n({attribute:`max-visible`}),1,`maxVisible`],[n({attribute:`default-active-value`}),1,`defaultActiveValue`],[n({type:Boolean}),1,`loading`],[n({attribute:!1}),1,`overrides`],[s(),1,`internalValue`],[s(),1,`activeValue`],[s(),1,`formDisabled`],[ie(`.list`),1,`listEl`]],0,void 0,o))}#e=(p(this),h(this));get label(){return this.#e}set label(e){this.#e=e}#t=(g(this),_(this));get labelledBy(){return this.#t}set labelledBy(e){this.#t=e}#n=(v(this),y(this,[]));get options(){return this.#n}set options(e){this.#n=e}#r=(b(this),x(this,!1));get multiple(){return this.#r}set multiple(e){this.#r=e}#i=(S(this),C(this));get value(){return this.#i}set value(e){this.#i=e}#a=(w(this),T(this));get defaultValue(){return this.#a}set defaultValue(e){this.#a=e}#o=(E(this),D(this,!0));get selectionFollowsFocus(){return this.#o}set selectionFollowsFocus(e){this.#o=e}#s=(O(this),k(this,!1));get required(){return this.#s}set required(e){this.#s=e}#c=(A(this),j(this,!1));get invalid(){return this.#c}set invalid(e){this.#c=e}errorValue=void M(this);get error(){return this.errorValue}set error(e){let t=this.errorValue;this.errorValue=e,this.invalid=!!e,this.requestUpdate(`error`,t)}#l=N(this,!1);get embedded(){return this.#l}set embedded(e){this.#l=e}#u=(pe(this),P(this,!1));get disabled(){return this.#u}set disabled(e){this.#u=e}#d=(F(this),I(this,``));get name(){return this.#d}set name(e){this.#d=e}#f=(L(this),R(this));get emptyMessage(){return this.#f}set emptyMessage(e){this.#f=e}#p=(z(this),B(this,`8`));get maxVisible(){return this.#p}set maxVisible(e){this.#p=e}#m=(V(this),H(this));get defaultActiveValue(){return this.#m}set defaultActiveValue(e){this.#m=e}#h=(U(this),W(this,!1));get loading(){return this.#h}set loading(e){this.#h=e}#g=(G(this),K(this));get overrides(){return this.#g}set overrides(e){this.#g=e}#_=(q(this),J(this));get internalValue(){return this.#_}set internalValue(e){this.#_=e}#v=(Y(this),X(this,null));get activeValue(){return this.#v}set activeValue(e){this.#v=e}#y=(me(this),he(this,!1));get formDisabled(){return this.#y}set formDisabled(e){this.#y=e}#b=(Z(this),ge(this));get listEl(){return this.#b}set listEl(e){this.#b=e}instanceId=(_e(this),`ds-listbox-${++Ce}`);typeaheadQuery=``;typeaheadTimer;internals;constructor(){super(),this.internals=this.attachInternals()}get flatItems(){return f(this.options)}get enabledItems(){return this.flatItems.filter(e=>e.disabled!==!0)}get isDisabled(){return this.disabled||this.formDisabled}get currentValue(){let e=this.value??this.internalValue;if(this.multiple){let t=Array.isArray(e)?e:[];return t.length>0?t:null}return typeof e==`string`&&e!==``?e:null}get form(){return this.internals.form}get validationMessage(){return this.internals.validationMessage}get selectedSet(){let e=this.currentValue;return this.multiple?new Set(Array.isArray(e)?e:[]):new Set(typeof e==`string`?[e]:[])}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Listbox`)}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this.typeaheadTimer)}checkValidity(){return this.syncInternals(),this.internals.checkValidity()}reportValidity(){return this.syncInternals(),this.internals.reportValidity()}formDisabledCallback(e){this.formDisabled=e}formResetCallback(){this.value=void 0,this.internalValue=this.defaultValue}formStateRestoreCallback(e){typeof e==`string`&&!this.multiple&&(this.value=e)}willUpdate(e){this.hasUpdated||(this.internalValue=this.defaultValue),e.has(`overrides`)&&this.applyOverrides()}updated(){this.syncInternals(),this.warnInDev()}render(){let e=this.flatItems,t=e.length===0,n=new Map;e.forEach((e,t)=>n.set(e.value,`${this.instanceId}-option-${t}`));let r=this.activeValue===null?void 0:n.get(this.activeValue),i=this.maxVisible===`all`?{}:{"--ds-listbox-rows":this.maxVisible};return c`
      <div
        id="list"
        class=${u({list:!0,"is-max-visible-all":this.maxVisible===`all`,"is-embedded":this.embedded})}
        style=${de(i)}
        part="list"
        role="listbox"
        tabindex=${this.isDisabled?-1:0}
        aria-label=${l(this.labelledBy?void 0:this.label)}
        aria-labelledby=${l(this.labelledBy)}
        aria-multiselectable=${l(this.multiple?`true`:void 0)}
        aria-required=${l(this.required?`true`:void 0)}
        aria-invalid=${l(this.invalid?`true`:void 0)}
        aria-describedby=${l(this.error?`error-message`:void 0)}
        aria-busy=${l(this.loading?`true`:void 0)}
        aria-disabled=${l(this.isDisabled?`true`:void 0)}
        aria-activedescendant=${l(r)}
        @keydown=${this.handleKey}
        @focus=${this.handleListFocus}
      >
        ${t?c`<ds-text class="empty" part="empty-state" tone="muted"
              >${this.loading?be:this.emptyMessage||ve}</ds-text
            >`:this.renderOptionList(this.options,n)}
      </div>
      <div id="error-message" part="error-message" class="error" role="alert">${this.error??``}</div>
    `}renderOptionList(e,t){let n=0,r=e=>e.map(e=>{if(d(e)){let t=`${this.instanceId}-group-${n++}`;return c`
            <div class="group" part="group" role="group" aria-labelledby=${t}>
              <div class="group-label" part="group-label" id=${t}>${e.group}</div>
              ${r(e.options)}
            </div>
          `}return this.renderOption(e,t.get(e.value))});return r(e)}renderOption(e,t){let n=this.isDisabled||e.disabled===!0,r=this.selectedSet.has(e.value),i=this.activeValue===e.value;return c`
      <div
        id=${t}
        class=${u({option:!0,"is-active":i})}
        part="option"
        role="option"
        data-value=${e.value}
        aria-selected=${r?`true`:`false`}
        aria-disabled=${l(n?`true`:void 0)}
        @click=${()=>this.handleOptionClick(e)}
        @pointerenter=${()=>this.handleOptionPointerEnter(e)}
      >
        <ds-icon class="option-check" part="option-check" name="check"></ds-icon>
        ${e.icon?c`<ds-icon class="option-icon" part="option-icon" name=${e.icon}></ds-icon>`:a}
        <div class="option-text">
          <span class="option-label" part="option-label">${e.label}</span>
          ${e.description?c`<span class="option-description" part="option-description">${e.description}</span>`:a}
        </div>
      </div>
    `}handleKey=e=>{if(this.isDisabled)return;let t=e.key;if(this.multiple&&e.shiftKey&&(t===`ArrowDown`||t===`ArrowUp`)){e.preventDefault(),this.extendSelection(t===`ArrowDown`?1:-1);return}if(this.multiple&&(e.ctrlKey||e.metaKey)&&t.toLowerCase()===`a`){e.preventDefault(),this.toggleSelectAll();return}switch(t){case`ArrowDown`:e.preventDefault(),this.moveActive(1);break;case`ArrowUp`:e.preventDefault(),this.moveActive(-1);break;case`Home`:e.preventDefault(),this.setActiveEdge(`first`);break;case`End`:e.preventDefault(),this.setActiveEdge(`last`);break;case` `:e.preventDefault(),this.selectActive();break;case`Enter`:this.multiple||(e.preventDefault(),this.selectActive());break;case`PageDown`:e.preventDefault(),this.pageActive(1);break;case`PageUp`:e.preventDefault(),this.pageActive(-1);break;default:t.length===1&&/[a-z]/i.test(t)&&this.handleTypeahead(t)}};handleListFocus=()=>{if(this.activeValue!==null)return;let e=this.enabledItems;if(e.length===0)return;let t=this.defaultActiveValue===void 0?void 0:e.find(e=>e.value===this.defaultActiveValue),n=e.find(e=>this.selectedSet.has(e.value));this.setActive((t??n??e[0]).value)};handleOptionClick(e){this.isDisabled||e.disabled||(this.setActive(e.value),this.selectActive())}handleOptionPointerEnter(e){this.isDisabled||e.disabled||this.setActive(e.value)}moveActive(e){let t=this.enabledItems;if(t.length===0)return;let n=(this.activeValue?t.findIndex(e=>e.value===this.activeValue):-1)+e;n<0?n=t.length-1:n>=t.length&&(n=0);let r=t[n];this.setActive(r.value),!this.multiple&&this.selectionFollowsFocus&&this.commitValue(r.value)}setActiveEdge(e){let t=this.enabledItems;if(t.length===0)return;let n=e===`first`?t[0]:t[t.length-1];this.setActive(n.value)}pageActive(e){let t=this.enabledItems;if(t.length===0)return;let n=this.maxVisible===`all`?t.length:Number(this.maxVisible),r=(this.activeValue?t.findIndex(e=>e.value===this.activeValue):e===1?-1:t.length)+e*n;r=Math.max(0,Math.min(t.length-1,r)),this.setActive(t[r].value)}extendSelection(e){let t=this.enabledItems;if(t.length===0)return;let n=this.activeValue?t.findIndex(e=>e.value===this.activeValue):-1,r=t[Math.max(0,Math.min(t.length-1,n+e))];this.setActive(r.value);let i=this.selectedSet;i.add(r.value),this.commitValue(this.orderValues(i))}toggleSelectAll(){let e=this.enabledItems;if(e.length===0)return;let t=e.every(e=>this.selectedSet.has(e.value));this.commitValue(t?[]:e.map(e=>e.value))}handleTypeahead(e){clearTimeout(this.typeaheadTimer),this.typeaheadQuery+=e.toLowerCase();let t=this.typeaheadQuery,n=this.enabledItems.find(e=>e.label.toLowerCase().startsWith(t));n&&this.setActive(n.value),this.typeaheadTimer=setTimeout(()=>{this.typeaheadQuery=``},Se)}selectActive(){if(this.activeValue===null)return;let e=this.flatItems.find(e=>e.value===this.activeValue);if(e&&!e.disabled){if(this.multiple){let t=this.selectedSet;t.has(e.value)?t.delete(e.value):t.add(e.value),this.commitValue(this.orderValues(t))}else this.commitValue(e.value)}}orderValues(e){return this.flatItems.filter(t=>e.has(t.value)).map(e=>e.value)}setActive(e){this.activeValue!==e&&(this.activeValue=e,this.dispatchEvent(new CustomEvent(`active-change`,{detail:{value:e},bubbles:!0,composed:!0})),this.scrollActiveIntoView())}async scrollActiveIntoView(){await this.updateComplete,this.activeValue!==null&&this.renderRoot.querySelector(`[data-value="${CSS.escape(this.activeValue)}"]`)?.scrollIntoView({block:`nearest`})}commitValue(e){this.value===void 0?this.internalValue=e:this.value=e,this.dispatchEvent(new CustomEvent(`change`,{detail:{value:e},bubbles:!0,composed:!0}))}syncInternals(){let e=this.currentValue;if(this.multiple){if(this.isDisabled||e===null)this.internals.setFormValue(null);else{let t=new FormData;for(let n of e)t.append(this.name,n);this.internals.setFormValue(t)}}else this.internals.setFormValue(this.isDisabled||e===null?null:e);this.error?this.internals.setValidity({customError:!0},this.error,this.listEl):this.invalid?this.internals.setValidity({customError:!0},xe(this.label),this.listEl):this.required&&e===null?this.internals.setValidity({valueMissing:!0},ye(this.label),this.listEl):this.internals.setValidity({})}applyOverrides(){for(let e of Object.keys(Q)){let t=this.overrides?.[e],n=Q[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,oe(t))}}warnInDev(){}}];formAssociated=!0;shadowRootOptions={...o.shadowRootOptions,delegatesFocus:!0};styles=t`
    :host {
      display: block;
      --ds-listbox-border: var(--color-border-strong);
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
    }

    :host([hidden]) {
      display: none;
    }

    /* surface: color.background, locked */
    .list {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      padding: var(--ds-listbox-list-padding);
      border-style: solid;
      border-width: var(--ds-listbox-border-width);
      border-color: var(--ds-listbox-border);
      border-radius: var(--ds-listbox-radius);
      background: var(--color-background);
      font-family: var(--ds-listbox-font-family);
      font-size: var(--ds-listbox-font-size);
      line-height: var(--ds-listbox-line-height);
      overflow-y: auto;
      outline: none;
      /* maxVisible: rows × one option's measured block size */
      max-block-size: calc(
        (
            var(--ds-listbox-font-size) * var(--ds-listbox-line-height) + 2 * var(--ds-listbox-option-padding-block)
          ) * var(--ds-listbox-rows, 8)
      );
    }

    .list.is-max-visible-all {
      max-block-size: none;
      overflow-y: visible;
    }

    /* focusRing / focusRingWidth: color.border.focus / border.width.focus, locked */
    .list:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: calc(-1 * var(--border-width-focus));
    }

    :host([disabled]) .list {
      cursor: not-allowed;
    }

    .group {
      display: flex;
      flex-direction: column;
    }

    /* groupLabelColor: color.foreground.muted, locked */
    .group-label {
      padding-block: var(--ds-listbox-group-label-padding-block);
      padding-inline: var(--ds-listbox-option-padding-inline);
      font-size: var(--ds-listbox-group-label-size);
      font-weight: var(--ds-listbox-group-label-weight);
      color: var(--color-foreground-muted);
    }

    /* minTarget: size.target.min, locked */
    .option {
      box-sizing: border-box;
      display: flex;
      align-items: center;
      gap: var(--ds-listbox-option-gap);
      min-block-size: var(--size-target-min);
      padding-block: var(--ds-listbox-option-padding-block);
      padding-inline: var(--ds-listbox-option-padding-inline);
      border-radius: var(--ds-listbox-option-radius);
      /* optionColor: color.foreground, locked */
      color: var(--color-foreground);
      cursor: pointer;
      user-select: none;
    }

    /* optionActiveBackground: color.background.subtle, locked — keyboard and hover share it, so active is never hover-only */
    .option.is-active {
      background: var(--color-background-subtle);
    }

    .option[aria-disabled='true'] {
      opacity: var(--ds-listbox-disabled-opacity);
      cursor: not-allowed;
    }

    /* optionSelectedWeight: selection is marked by weight and the check, never color alone */
    .option[aria-selected='true'] .option-label {
      font-weight: var(--ds-listbox-option-selected-weight);
    }

    /* optionSelectedCheck: color.control.selectedBackground, locked; always rendered (invisible when unselected) so labels align */
    .option-check {
      flex: none;
      color: var(--color-control-selected-background);
      visibility: hidden;
    }
    .option[aria-selected='true'] .option-check {
      visibility: visible;
    }

    .option-icon {
      flex: none;
    }

    .option-text {
      display: flex;
      flex-direction: column;
      min-inline-size: 0;
    }

    .option-label {
      min-inline-size: 0;
    }

    /* optionDescriptionColor: color.foreground.muted, locked */
    .option-description {
      font-size: var(--ds-listbox-option-description-size);
      color: var(--color-foreground-muted);
    }

    .empty {
      display: block;
      padding-block: var(--ds-listbox-option-padding-block);
      padding-inline: var(--ds-listbox-option-padding-inline);
    }

    /* embedded: the popup that composes this list owns border, surface and radius */
    .list.is-embedded {
      border-style: none;
      border-radius: 0;
      background: none;
    }

    /* errorText: not a binding in this component's schema (gap) — styled like Input/Select's own errorText token */
    .error {
      font-size: var(--ds-listbox-option-description-size);
      line-height: var(--ds-listbox-line-height);
      color: var(--color-foreground-danger);
    }
    .error:not(:empty) {
      margin-block-start: var(--ds-listbox-list-padding);
    }
  `;constructor(){super(we),m()}}})))()}export{$ as t};