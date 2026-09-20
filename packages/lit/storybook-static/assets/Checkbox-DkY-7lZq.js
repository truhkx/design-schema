import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{O as t,_ as n,a as r,b as i,c as a,f as o,g as ee,h as s,i as te,o as c,p as ne,r as l,t as re,u,v as d,w as f}from"./if-defined-CARySXJh.js";import{t as p}from"./query-BHY-nhsh.js";import{t as ie}from"./Icon-BHsrajXm.js";import{t as ae}from"./Text-BrJPDVza.js";import{n as m,t as oe}from"./class-map-C-hUkrHk.js";import{r as h,t as g}from"./live-DYI4u8lm.js";var _,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{ee(),n(),c(),oe(),re(),g(),r(),ie(),ae(),q=e=>`${e} is required.`,J=e=>`${e} is not valid.`,Y=` (required)`,X={color:`color.control.selectedForeground`},Z={controlBackground:`--ds-checkbox-control-background`,controlBorderWidth:`--ds-checkbox-control-border-width`,pressedOverlay:`--ds-checkbox-pressed-overlay`,controlBorderInvalid:`--ds-checkbox-control-border-invalid`,controlSize:`--ds-checkbox-control-size`,controlRadius:`--ds-checkbox-control-radius`,gap:`--ds-checkbox-gap`,partGap:`--ds-checkbox-part-gap`,labelSize:`--ds-checkbox-label-size`,labelWeight:`--ds-checkbox-label-weight`,helperSize:`--ds-checkbox-helper-size`,fontFamily:`--ds-checkbox-font-family`,lineHeight:`--ds-checkbox-line-height`,disabledOpacity:`--ds-checkbox-disabled-opacity`,transition:`--ds-checkbox-transition`},new class extends ne{static[class extends d{static{({e:[y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,_],c:[Q,v]}=s(this,[o(`ds-checkbox`)],[[u(),1,`label`],[u({type:Boolean,attribute:`hide-label`}),1,`hideLabel`],[u(),1,`name`],[u(),1,`value`],[u({type:Boolean,attribute:`default-checked`}),1,`defaultChecked`],[u({type:Boolean,reflect:!0}),1,`indeterminate`],[u({type:Boolean,reflect:!0}),1,`disabled`],[u({type:Boolean,reflect:!0}),1,`required`],[u({type:Boolean,reflect:!0}),1,`invalid`],[u(),1,`description`],[u({attribute:!1}),1,`overrides`],[u({type:Boolean}),4,`checked`],[u(),4,`error`],[a(),1,`formDisabled`],[a(),1,`mixedCleared`],[p(`#control`),1,`inputEl`]],0,void 0,d))}#e=(_(this),y(this,``));get label(){return this.#e}set label(e){this.#e=e}#t=(b(this),x(this,!1));get hideLabel(){return this.#t}set hideLabel(e){this.#t=e}#n=(S(this),C(this,``));get name(){return this.#n}set name(e){this.#n=e}#r=(w(this),T(this,`on`));get value(){return this.#r}set value(e){this.#r=e}#i=(E(this),D(this,!1));get defaultChecked(){return this.#i}set defaultChecked(e){this.#i=e}#a=(O(this),k(this,!1));get indeterminate(){return this.#a}set indeterminate(e){this.#a=e}#o=(A(this),j(this,!1));get disabled(){return this.#o}set disabled(e){this.#o=e}#s=(M(this),N(this,!1));get required(){return this.#s}set required(e){this.#s=e}#c=(P(this),F(this,!1));get invalid(){return this.#c}set invalid(e){this.#c=e}#l=(I(this),L(this));get description(){return this.#l}set description(e){this.#l=e}#u=(R(this),z(this));get overrides(){return this.#u}set overrides(e){this.#u=e}checkedValue=void B(this);get checked(){return this.checkedValue??this.defaultChecked}set checked(e){let t=this.checked;this.checkedValue=e,this.requestUpdate(`checked`,t)}errorValue;get error(){return this.errorValue}set error(e){let t=this.errorValue;this.errorValue=e,this.invalid=!!e,this.requestUpdate(`error`,t)}#d=V(this,!1);get formDisabled(){return this.#d}set formDisabled(e){this.#d=e}#f=(H(this),U(this,!1));get mixedCleared(){return this.#f}set mixedCleared(e){this.#f=e}#p=(W(this),G(this));get inputEl(){return this.#p}set inputEl(e){this.#p=e}internals=void K(this);constructor(){super(),this.internals=this.attachInternals()}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Checkbox`),this.setAttribute(`data-ds-field`,``)}get currentValue(){return this.checked}get form(){return this.internals.form}get validity(){return this.syncInternals(),this.internals.validity}get validationMessage(){return this.syncInternals(),this.internals.validationMessage}checkValidity(){return this.syncInternals(),this.internals.checkValidity()}reportValidity(){return this.syncInternals(),this.internals.reportValidity()}formDisabledCallback(e){this.formDisabled=e}formResetCallback(){this.checked=this.hasAttribute(`checked`)||this.defaultChecked,this.mixedCleared=!1}formStateRestoreCallback(e){this.checked=typeof e==`string`&&e===this.value}willUpdate(e){e.has(`indeterminate`)&&(this.mixedCleared=!1),e.has(`overrides`)&&this.applyOverrides()}updated(){this.inputEl&&this.inputEl.indeterminate!==this.showMixed&&(this.inputEl.indeterminate=this.showMixed),this.syncInternals()}render(){let e=this.isDisabled,t=this.showMixed,n=this.displayedError,r=[this.description?`description`:``,n?`error`:``].filter(Boolean).join(` `),a=this.textOverrides,o=t?`dash`:this.checked?`check`:void 0;return f`
      <div class="field">
        <div class=${m({row:!0,disabled:e})} @click=${this.handleRowClick}>
          <span class="box">
            <input
              id="control"
              class="control"
              part="control"
              data-part="control"
              type="checkbox"
              name=${this.name}
              value=${this.value}
              .checked=${h(this.checked)}
              aria-checked=${l(t?`mixed`:void 0)}
              aria-describedby=${l(r||void 0)}
              aria-invalid=${l(this.invalid?`true`:void 0)}
              aria-required=${l(this.required?`true`:void 0)}
              aria-disabled=${l(e?`true`:void 0)}
              @click=${this.handleControlClick}
              @change=${this.handleChange}
            />
            ${o?f`<span class="indicator" part="indicator" data-part="indicator" aria-hidden="true"
                  ><ds-icon name=${o} size="xs" .overrides=${X}></ds-icon
                ></span>`:i}
          </span>
          <div class="text">
            <label
              class=${m({label:!0,"visually-hidden":this.hideLabel})}
              part="label"
              data-part="label"
              for="control"
              >${this.label}${this.required?Y:i}</label
            >
            ${this.description?f`<ds-text
                  id="description"
                  part="description"
                  data-part="description"
                  element="p"
                  size="sm"
                  tone="muted"
                  .overrides=${a}
                  >${this.description}</ds-text
                >`:i}
          </div>
        </div>
        ${n?f`<ds-text
              id="error"
              role="alert"
              part="errorMessage"
              data-part="errorMessage"
              element="p"
              size="sm"
              tone="danger"
              .overrides=${a}
              >${n}</ds-text
            >`:i}
      </div>
    `}get isDisabled(){return this.disabled||this.formDisabled}get showMixed(){return this.indeterminate&&!this.mixedCleared}get displayedError(){return this.error?this.error:this.invalid?this.required&&!this.checked?q(this.label):J(this.label):``}get textOverrides(){let e=this.overrides;if(e)return{fontSize:e.helperSize,fontFamily:e.fontFamily,lineHeight:e.lineHeight}}handleRowClick(e){let t=this.inputEl,n=e.target;t&&n instanceof Element&&n!==t&&n.closest(`label`)===null&&(t.focus(),t.click())}handleControlClick(e){this.isDisabled&&e.preventDefault()}handleChange(e){e.stopPropagation();let t=e.currentTarget;if(this.isDisabled){e.preventDefault(),t.checked=this.checked;return}let n=t.checked;this.indeterminate&&(this.mixedCleared=!0),this.checked=n,this.dispatchEvent(new CustomEvent(`change`,{detail:{checked:n},bubbles:!0,composed:!0}))}syncInternals(){if(this.isDisabled){this.internals.setFormValue(null),this.internals.setValidity({});return}let e=this.inputEl??void 0;this.internals.setFormValue(this.checked?this.value:null),this.error?this.internals.setValidity({customError:!0},this.error,e):this.required&&!this.checked?this.internals.setValidity({valueMissing:!0},q(this.label),e):this.invalid?this.internals.setValidity({customError:!0},J(this.label),e):this.internals.setValidity({})}applyOverrides(){for(let e of Object.keys(Z)){let t=this.overrides?.[e],n=Z[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,te(t))}}}];formAssociated=!0;shadowRootOptions={...d.shadowRootOptions,delegatesFocus:!0};styles=t`
    :host {
      display: block;
      --ds-checkbox-control-background: var(--color-control-background);
      --ds-checkbox-control-border-width: var(--border-width-thin);
      --ds-checkbox-pressed-overlay: var(--opacity-disabled);
      --ds-checkbox-control-border-invalid: var(--color-border-danger);
      --ds-checkbox-control-size: var(--space-5);
      --ds-checkbox-control-radius: var(--radius-sm);
      --ds-checkbox-gap: var(--space-2);
      --ds-checkbox-part-gap: var(--space-1);
      --ds-checkbox-label-size: var(--font-size-md);
      --ds-checkbox-label-weight: var(--font-weight-regular);
      --ds-checkbox-helper-size: var(--font-size-sm);
      --ds-checkbox-font-family: var(--font-family-body);
      --ds-checkbox-line-height: var(--font-line-height-normal);
      --ds-checkbox-disabled-opacity: var(--opacity-disabled);
      --ds-checkbox-transition: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    /* partGap: between the row and the error message below it */
    .field {
      display: flex;
      flex-direction: column;
      gap: var(--ds-checkbox-part-gap);
    }

    /* gap, minTarget: the whole row, gap included, is the hit area; no vertical padding */
    .row {
      display: flex;
      align-items: center;
      gap: var(--ds-checkbox-gap);
      min-block-size: var(--size-target-comfortable);
      cursor: pointer;
    }

    /* The control and its indicator stacked in one cell. */
    .box {
      display: grid;
      flex: none;
    }
    .box > * {
      grid-area: 1 / 1;
    }

    .control {
      box-sizing: border-box;
      inline-size: var(--ds-checkbox-control-size);
      block-size: var(--ds-checkbox-control-size);
      margin: 0;
      border-width: var(--ds-checkbox-control-border-width);
      border-style: solid;
      border-color: var(--color-control-border);
      border-radius: var(--ds-checkbox-control-radius);
      background: var(--ds-checkbox-control-background);
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      transition:
        background-color var(--ds-checkbox-transition) var(--motion-easing-standard),
        border-color var(--ds-checkbox-transition) var(--motion-easing-standard);
    }

    /* pressedOverlay: an unchecked, not-mixed, enabled box shows controlSelectedBackground at this opacity */
    .row:not(.disabled) .control:active:not(:checked):not(:indeterminate) {
      background: color-mix(
        in srgb,
        var(--color-control-selected-background) calc(var(--ds-checkbox-pressed-overlay) * 100%),
        var(--ds-checkbox-control-background)
      );
    }

    /* controlSelectedBackground: checked and indeterminate fill; the border takes the same color */
    .control:checked,
    .control:indeterminate {
      border-color: var(--color-control-selected-background);
      background: var(--color-control-selected-background);
    }

    /* controlBorderInvalid */
    :host([invalid]) .control {
      border-color: var(--ds-checkbox-control-border-invalid);
    }

    /* focusRing, focusRingWidth */
    .control:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    /* indicator: the Icon centered in the control; clicks fall through to the input */
    .indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }

    @media (prefers-reduced-motion: reduce) {
      .control {
        transition: none;
      }
    }

    /* labelColor, labelSize, labelWeight, fontFamily, lineHeight: the label's own rule */
    .label {
      font-family: var(--ds-checkbox-font-family);
      font-size: var(--ds-checkbox-label-size);
      font-weight: var(--ds-checkbox-label-weight);
      line-height: var(--ds-checkbox-line-height);
      color: var(--color-foreground);
      cursor: pointer;
    }

    /* partGap: between label and description */
    .text {
      display: flex;
      flex-direction: column;
      gap: var(--ds-checkbox-part-gap);
      min-inline-size: 0;
    }

    /* disabledOpacity: dims the control (with its indicator) and the label, not the description or error */
    .row.disabled {
      cursor: not-allowed;
    }
    .row.disabled .box,
    .row.disabled .label {
      opacity: var(--ds-checkbox-disabled-opacity);
    }
    .row.disabled .control,
    .row.disabled .label {
      cursor: not-allowed;
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
  `;constructor(){super(Q),v()}}})))()}export{$ as t};