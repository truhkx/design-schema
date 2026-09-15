import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{C as t,a as n,c as r,d as i,f as a,h as o,p as s,r as c,s as l,t as u,u as d,y as f}from"./decorators-BlUBDG4K.js";import{t as ee}from"./query-BHY-nhsh.js";import{a as p,i as m,r as h,t as g}from"./if-defined-BfpvQ5_i.js";import{r as _,t as v}from"./live-DoUijhZq.js";var y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{i(),a(),u(),g(),v(),p(),Y=e=>`${e} is required.`,X=` (required)`,Z={controlBackground:`--ds-checkbox-control-background`,controlBorderWidth:`--ds-checkbox-control-border-width`,indicatorStroke:`--ds-checkbox-indicator-stroke`,pressedOverlay:`--ds-checkbox-pressed-overlay`,controlBorderInvalid:`--ds-checkbox-control-border-invalid`,controlSize:`--ds-checkbox-control-size`,controlRadius:`--ds-checkbox-control-radius`,gap:`--ds-checkbox-gap`,partGap:`--ds-checkbox-part-gap`,labelSize:`--ds-checkbox-label-size`,labelWeight:`--ds-checkbox-label-weight`,helperSize:`--ds-checkbox-helper-size`,fontFamily:`--ds-checkbox-font-family`,lineHeight:`--ds-checkbox-line-height`,disabledOpacity:`--ds-checkbox-disabled-opacity`,transition:`--ds-checkbox-transition`},new class extends r{static[class extends s{static{({e:[x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,y],c:[Q,b]}=d(this,[l(`ds-checkbox`)],[[n(),1,`label`],[n(),1,`name`],[n(),1,`value`],[n({type:Boolean}),1,`checked`],[n({type:Boolean,attribute:`default-checked`}),1,`defaultChecked`],[n({type:Boolean,reflect:!0}),1,`indeterminate`],[n({type:Boolean,reflect:!0}),1,`disabled`],[n({type:Boolean,reflect:!0}),1,`required`],[n(),1,`description`],[n({type:Boolean,reflect:!0}),1,`invalid`],[n({attribute:!1}),1,`overrides`],[n(),4,`error`],[c(),1,`internalChecked`],[c(),1,`formDisabled`],[ee(`#control`),1,`inputEl`]],0,void 0,s))}#e=(y(this),x(this,``));get label(){return this.#e}set label(e){this.#e=e}#t=(S(this),C(this,``));get name(){return this.#t}set name(e){this.#t=e}#n=(w(this),T(this,`on`));get value(){return this.#n}set value(e){this.#n=e}#r=(E(this),D(this));get checked(){return this.#r}set checked(e){this.#r=e}#i=(O(this),k(this,!1));get defaultChecked(){return this.#i}set defaultChecked(e){this.#i=e}#a=(A(this),j(this,!1));get indeterminate(){return this.#a}set indeterminate(e){this.#a=e}#o=(M(this),N(this,!1));get disabled(){return this.#o}set disabled(e){this.#o=e}#s=(P(this),F(this,!1));get required(){return this.#s}set required(e){this.#s=e}#c=(I(this),L(this));get description(){return this.#c}set description(e){this.#c=e}#l=(R(this),z(this,!1));get invalid(){return this.#l}set invalid(e){this.#l=e}#u=(B(this),V(this));get overrides(){return this.#u}set overrides(e){this.#u=e}errorValue=void H(this);get error(){return this.errorValue}set error(e){let t=this.errorValue;this.errorValue=e,this.invalid=!!e,this.requestUpdate(`error`,t)}#d=U(this,!1);get internalChecked(){return this.#d}set internalChecked(e){this.#d=e}#f=(W(this),G(this,!1));get formDisabled(){return this.#f}set formDisabled(e){this.#f=e}#p=(K(this),q(this));get inputEl(){return this.#p}set inputEl(e){this.#p=e}internals=void J(this);constructor(){super(),this.internals=this.attachInternals()}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Checkbox`)}get currentChecked(){return this.checked??this.internalChecked}get currentValue(){return this.currentChecked?this.value:null}get form(){return this.internals.form}get validity(){return this.internals.validity}get validationMessage(){return this.internals.validationMessage}checkValidity(){return this.syncInternals(),this.internals.checkValidity()}reportValidity(){return this.syncInternals(),this.internals.reportValidity()}formDisabledCallback(e){this.formDisabled=e}formResetCallback(){this.checked=void 0,this.internalChecked=this.defaultChecked}formStateRestoreCallback(e){typeof e==`string`&&(this.checked=e===this.value)}willUpdate(e){this.hasUpdated||(this.internalChecked=this.defaultChecked),e.has(`overrides`)&&this.applyOverrides()}updated(){this.inputEl.indeterminate=this.indeterminate,this.syncInternals()}render(){let e=this.disabled||this.formDisabled,t=[this.description?`description`:``,this.error?`error`:``].filter(e=>e!==``).join(` `)||void 0;return f`
      <div class="row" @click=${this.handleRowClick}>
        <input
          id="control"
          class="control"
          part="control"
          type="checkbox"
          name=${this.name}
          value=${this.value}
          .checked=${_(this.currentChecked)}
          aria-checked=${h(this.indeterminate?`mixed`:void 0)}
          aria-describedby=${h(t)}
          aria-invalid=${h(this.invalid?`true`:void 0)}
          aria-required=${h(this.required?`true`:void 0)}
          aria-disabled=${h(e?`true`:void 0)}
          @click=${this.handleControlClick}
          @change=${this.handleChange}
        />
        <div class="text">
          <label class="label" part="label" for="control"
            >${this.label}${this.required?f`<span class="required" aria-hidden="true">${X}</span>`:o}</label
          >
          ${this.description?f`<p id="description" class="description" part="description">${this.description}</p>`:o}
          <div id="error" class="error" part="error" role="alert">${this.error??``}</div>
        </div>
      </div>
    `}get isDisabled(){return this.disabled||this.formDisabled}handleRowClick(e){let t=e.target;t instanceof Element&&t!==this.inputEl&&t.closest(`label`)===null&&(this.isDisabled||this.inputEl.click())}handleControlClick(e){this.isDisabled&&(e.preventDefault(),e.stopPropagation())}handleChange(e){if(this.isDisabled){e.preventDefault(),this.requestUpdate();return}let t=this.inputEl.checked;this.indeterminate=!1,this.checked===void 0?this.internalChecked=t:this.checked=t,this.dispatchEvent(new CustomEvent(`change`,{detail:{checked:t},bubbles:!0,composed:!0}))}syncInternals(){let e=this.inputEl;if(!e)return;let t=this.currentChecked;this.internals.setFormValue(t&&!this.isDisabled?this.value:null),this.error?this.internals.setValidity({customError:!0},this.error,e):this.invalid?this.internals.setValidity({customError:!0},`${this.label} is invalid`,e):this.required&&!t?this.internals.setValidity({valueMissing:!0},Y(this.label),e):this.internals.setValidity({})}applyOverrides(){for(let e of Object.keys(Z)){let t=this.overrides?.[e],n=Z[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,m(t))}}}];formAssociated=!0;shadowRootOptions={...s.shadowRootOptions,delegatesFocus:!0};styles=t`
    :host {
      display: block;
      font-family: var(--ds-checkbox-font-family);
      --ds-checkbox-control-background: var(--color-control-background);
      --ds-checkbox-control-border-width: var(--border-width-thin);
      --ds-checkbox-indicator-stroke: var(--border-width-focus);
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

    /* minTarget: the whole row is the hit area */
    .row {
      display: flex;
      align-items: flex-start;
      gap: var(--ds-checkbox-gap);
      min-block-size: var(--size-target-comfortable);
      cursor: pointer;
    }

    .control {
      position: relative;
      flex: none;
      box-sizing: border-box;
      inline-size: var(--ds-checkbox-control-size);
      block-size: var(--ds-checkbox-control-size);
      margin: 0;
      /* Center the control on the first line of the label. */
      margin-block-start: calc(
        (var(--ds-checkbox-label-size) * var(--ds-checkbox-line-height) - var(--ds-checkbox-control-size)) / 2
      );
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

    /* pressedOverlay: while pressed, the box shows controlSelectedBackground at this opacity */
    .control:active:not(:checked):not(:indeterminate)::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: var(--color-control-selected-background);
      opacity: var(--ds-checkbox-pressed-overlay);
    }
    :host([disabled]) .control:active::before {
      content: none;
    }

    /* indicator: check mark and mixed dash at indicatorStroke, drawn at controlSize minus 2 × space.1 */
    .control::after {
      content: '';
      position: absolute;
      inset: 0;
      margin: auto;
      box-sizing: border-box;
      opacity: 0;
      transition: opacity var(--ds-checkbox-transition) var(--motion-easing-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      .control,
      .control::after {
        transition: none;
      }
    }

    /* controlSelectedBackground: checked and indeterminate fill; the border takes the same color */
    .control:checked,
    .control:indeterminate {
      border-color: var(--color-control-selected-background);
      background: var(--color-control-selected-background);
    }

    .control:checked::after {
      inline-size: calc((var(--ds-checkbox-control-size) - 2 * var(--space-1)) * 0.5);
      block-size: calc(var(--ds-checkbox-control-size) - 2 * var(--space-1));
      margin-block-start: calc(var(--space-1) * -0.5);
      border-inline-end: var(--ds-checkbox-indicator-stroke) solid var(--color-control-selected-foreground);
      border-block-end: var(--ds-checkbox-indicator-stroke) solid var(--color-control-selected-foreground);
      transform: rotate(45deg) scale(0.8);
      opacity: 1;
    }

    .control:indeterminate::after {
      inline-size: calc(var(--ds-checkbox-control-size) - 2 * var(--space-1));
      block-size: var(--ds-checkbox-indicator-stroke);
      background: var(--color-control-selected-foreground);
      opacity: 1;
    }

    /* controlBorderInvalid */
    :host([invalid]) .control {
      border-color: var(--ds-checkbox-control-border-invalid);
    }

    .control:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    /* disabled: stays focusable; dimmed with disabledOpacity */
    :host([disabled]) .row {
      opacity: var(--ds-checkbox-disabled-opacity);
      cursor: not-allowed;
    }
    :host([disabled]) .control {
      cursor: not-allowed;
    }

    .text {
      display: flex;
      flex-direction: column;
      gap: var(--ds-checkbox-part-gap);
      min-inline-size: 0;
    }

    .label {
      font-size: var(--ds-checkbox-label-size);
      font-weight: var(--ds-checkbox-label-weight);
      line-height: var(--ds-checkbox-line-height);
      color: var(--color-foreground);
      cursor: pointer;
    }

    .required {
      color: var(--color-foreground-muted);
    }

    .description {
      margin: 0;
      font-size: var(--ds-checkbox-helper-size);
      line-height: var(--ds-checkbox-line-height);
      color: var(--color-foreground-muted);
    }

    .error {
      font-size: var(--ds-checkbox-helper-size);
      line-height: var(--ds-checkbox-line-height);
      color: var(--color-foreground-danger);
    }
    .error:empty {
      display: none;
    }
  `;constructor(){super(Q),b()}}})))()}export{$ as t};