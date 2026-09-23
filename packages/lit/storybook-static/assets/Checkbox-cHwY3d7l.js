import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{O as t,_ as n,a as r,b as i,c as a,f as o,g as ee,h as s,i as te,o as c,p as l,r as u,t as ne,u as d,v as f,w as p}from"./if-defined-CARySXJh.js";import{t as re}from"./query-BHY-nhsh.js";import{t as m}from"./Icon-eWCe5jE3.js";import{t as h}from"./Text-b_nq3K9L.js";import{n as g,t as ie}from"./class-map-C-hUkrHk.js";import{r as ae,t as oe}from"./live-DYI4u8lm.js";var _,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{ee(),n(),c(),ie(),ne(),oe(),r(),m(),h(),q=e=>`${e} is required.`,J=e=>`${e} is not valid.`,Y=` (required)`,X={color:`color.control.selectedForeground`},Z={controlBackground:`--ds-checkbox-control-background`,controlBorderWidth:`--ds-checkbox-control-border-width`,pressedOverlay:`--ds-checkbox-pressed-overlay`,controlBorderInvalid:`--ds-checkbox-control-border-invalid`,controlSize:`--ds-checkbox-control-size`,controlRadius:`--ds-checkbox-control-radius`,gap:`--ds-checkbox-gap`,partGap:`--ds-checkbox-part-gap`,labelSize:`--ds-checkbox-label-size`,labelWeight:`--ds-checkbox-label-weight`,fontFamily:`--ds-checkbox-font-family`,lineHeight:`--ds-checkbox-line-height`,disabledOpacity:`--ds-checkbox-disabled-opacity`,transition:`--ds-checkbox-transition`},new class extends l{static[class extends f{static{({e:[y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,_],c:[Q,v]}=s(this,[o(`ds-checkbox`)],[[d(),1,`label`],[d({type:Boolean,attribute:`hide-label`}),1,`hideLabel`],[d(),1,`name`],[d(),1,`value`],[d({type:Boolean,attribute:`default-checked`}),1,`defaultChecked`],[d({type:Boolean,reflect:!0}),1,`indeterminate`],[d({type:Boolean,reflect:!0}),1,`disabled`],[d({type:Boolean,reflect:!0}),1,`required`],[d({type:Boolean,reflect:!0}),1,`invalid`],[d(),1,`description`],[d({attribute:!1}),1,`overrides`],[d({type:Boolean}),4,`checked`],[d(),4,`error`],[a(),1,`formDisabled`],[a(),1,`mixedCleared`],[re(`#control`),1,`inputEl`]],0,void 0,f))}#e=(_(this),y(this,``));get label(){return this.#e}set label(e){this.#e=e}#t=(b(this),x(this,!1));get hideLabel(){return this.#t}set hideLabel(e){this.#t=e}#n=(S(this),C(this,``));get name(){return this.#n}set name(e){this.#n=e}#r=(w(this),T(this,`on`));get value(){return this.#r}set value(e){this.#r=e}#i=(E(this),D(this,!1));get defaultChecked(){return this.#i}set defaultChecked(e){this.#i=e}#a=(O(this),k(this,!1));get indeterminate(){return this.#a}set indeterminate(e){this.#a=e}#o=(A(this),j(this,!1));get disabled(){return this.#o}set disabled(e){this.#o=e}#s=(M(this),N(this,!1));get required(){return this.#s}set required(e){this.#s=e}#c=(P(this),F(this,!1));get invalid(){return this.#c}set invalid(e){this.#c=e}#l=(I(this),L(this));get description(){return this.#l}set description(e){this.#l=e}#u=(R(this),z(this));get overrides(){return this.#u}set overrides(e){this.#u=e}checkedValue=void B(this);get checked(){return this.checkedValue??this.defaultChecked}set checked(e){let t=this.checked;this.checkedValue=e,this.requestUpdate(`checked`,t)}errorValue;get error(){return this.errorValue}set error(e){let t=this.errorValue;this.errorValue=e,this.invalid=!!e,this.requestUpdate(`error`,t)}#d=V(this,!1);get formDisabled(){return this.#d}set formDisabled(e){this.#d=e}#f=(H(this),U(this,!1));get mixedCleared(){return this.#f}set mixedCleared(e){this.#f=e}#p=(W(this),G(this));get inputEl(){return this.#p}set inputEl(e){this.#p=e}internals=void K(this);constructor(){super(),this.internals=this.attachInternals()}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Checkbox`),this.setAttribute(`data-ds-field`,`change`)}get currentValue(){return this.checked}get form(){return this.internals.form}get validity(){return this.syncInternals(),this.internals.validity}get validationMessage(){return this.syncInternals(),this.internals.validationMessage}checkValidity(){return this.syncInternals(),this.internals.checkValidity()}reportValidity(){return this.syncInternals(),this.internals.reportValidity()}formDisabledCallback(e){this.formDisabled=e}formResetCallback(){this.checked=this.hasAttribute(`checked`)||this.defaultChecked,this.mixedCleared=!1}formStateRestoreCallback(e){this.checked=typeof e==`string`&&e===this.value}willUpdate(e){e.has(`indeterminate`)&&(this.mixedCleared=!1),e.has(`overrides`)&&this.applyOverrides()}updated(){this.inputEl&&this.inputEl.indeterminate!==this.showMixed&&(this.inputEl.indeterminate=this.showMixed),this.syncInternals()}render(){let e=this.isDisabled,t=this.showMixed,n=this.displayedError,r=[this.description?`description`:``,n?`error`:``].filter(Boolean).join(` `),a=this.textOverrides,o=t?`dash`:this.checked?`check`:void 0;return p`
      <div class="field">
        <div class=${g({row:!0,disabled:e})} @click=${this.handleRowClick}>
          <span class="box">
            <input
              id="control"
              class="control"
              part="control"
              data-part="control"
              type="checkbox"
              name=${this.name}
              value=${this.value}
              .checked=${ae(this.checked)}
              aria-checked=${u(t?`mixed`:void 0)}
              aria-describedby=${u(r||void 0)}
              aria-invalid=${u(this.invalid?`true`:void 0)}
              aria-required=${u(this.required?`true`:void 0)}
              aria-disabled=${u(e?`true`:void 0)}
              @click=${this.handleControlClick}
              @change=${this.handleChange}
            />
            ${o?p`<span class="indicator" part="indicator" data-part="indicator" aria-hidden="true"
                  ><ds-icon name=${o} size="xs" .overrides=${X}></ds-icon
                ></span>`:i}
          </span>
          <div class=${g({text:!0,"label-hidden":this.hideLabel})}>
            <label
              class=${g({label:!0,"visually-hidden":this.hideLabel})}
              part="label"
              data-part="label"
              for="control"
              >${this.label}${this.required?Y:i}</label
            >
            ${this.description?p`<ds-text
                  id="description"
                  class="description"
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
        ${n?p`<ds-text
              id="error"
              class="error"
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
    `}get isDisabled(){return this.disabled||this.formDisabled}get showMixed(){return this.indeterminate&&!this.mixedCleared}get displayedError(){return this.error?this.error:this.invalid?this.required&&!this.checked?q(this.label):J(this.label):``}get textOverrides(){let e=this.overrides;if(e)return{fontSize:e.helperSize,fontFamily:e.fontFamily,lineHeight:e.lineHeight}}handleRowClick(e){let t=this.inputEl,n=e.target;t&&n instanceof Element&&!this.isDisabled&&n!==t&&n.closest(`label`)===null&&(t.focus(),t.click())}handleControlClick(e){this.isDisabled&&e.preventDefault()}handleChange(e){e.stopPropagation();let t=e.currentTarget;if(this.isDisabled){e.preventDefault(),t.checked=this.checked;return}let n=t.checked;this.indeterminate&&(this.mixedCleared=!0),this.checked=n,this.dispatchEvent(new CustomEvent(`change`,{detail:{checked:n},bubbles:!0,composed:!0}))}syncInternals(){if(this.isDisabled){this.internals.setFormValue(null),this.internals.setValidity({});return}let e=this.inputEl??void 0;this.internals.setFormValue(this.checked?this.value:null),this.error?this.internals.setValidity({customError:!0},this.error,e):this.required&&!this.checked?this.internals.setValidity({valueMissing:!0},q(this.label),e):this.invalid?this.internals.setValidity({customError:!0},J(this.label),e):this.internals.setValidity({})}applyOverrides(){for(let[e,t]of Object.entries(Z)){let n=this.overrides?.[e];n===void 0?this.style.removeProperty(t):this.style.setProperty(t,te(n))}}}];formAssociated=!0;shadowRootOptions={...f.shadowRootOptions,delegatesFocus:!0};styles=t`
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
      --ds-checkbox-font-family: var(--font-family-body);
      --ds-checkbox-line-height: var(--font-line-height-normal);
      --ds-checkbox-disabled-opacity: var(--opacity-disabled);
      --ds-checkbox-transition: var(--motion-duration-fast);
      /* Locked: closed to the overrides API, still themeable from page CSS. */
      --ds-checkbox-control-border: var(--color-control-border);
      --ds-checkbox-control-selected-background: var(--color-control-selected-background);
      --ds-checkbox-label-color: var(--color-foreground);
      --ds-checkbox-focus-ring: var(--color-border-focus);
      --ds-checkbox-focus-ring-width: var(--border-width-focus);
      --ds-checkbox-min-target: var(--size-target-comfortable);
      /* indicatorStroke, descriptionText and errorText are realised by the composed Icon and Texts;
         these hooks reach them only through the children's documented hooks (below), on the same
         tokens those children already use, so page CSS can still re-theme or rename them. */
      --ds-checkbox-indicator-stroke: var(--border-width-focus);
      --ds-checkbox-description-text: var(--color-foreground-muted);
      --ds-checkbox-error-text: var(--color-foreground-danger);
      /* indicator and helperSize have no hook: they are forwarded to the children's overrides. */

      /* The label's first line box; the control centres on it and the row is padded around it. */
      --ds-checkbox-line-box: calc(var(--ds-checkbox-label-size) * var(--ds-checkbox-line-height));
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

    /* minTarget: the whole row, gap included, is the hit area. The children align to the start of
       the cross axis and the padding makes a single-line row exactly minTarget tall, so a wrapping
       label or a description grows the row downwards without pulling the control off the first line. */
    .row {
      box-sizing: border-box;
      display: flex;
      align-items: flex-start;
      gap: var(--ds-checkbox-gap);
      /* Clamped at zero (a zero length, written without a literal) so a line box taller than the
         target grows the row instead of producing a negative padding. */
      padding-block: max(
        calc(var(--ds-checkbox-min-target) * 0),
        calc((var(--ds-checkbox-min-target) - var(--ds-checkbox-line-box)) / 2)
      );
      min-block-size: var(--ds-checkbox-min-target);
      cursor: pointer;
    }

    /* The box is one label line tall and stacks the control and the indicator in one grid cell,
       which centres the control on the label's first line (and in the row when the label is hidden). */
    .box {
      display: inline-grid;
      place-items: center;
      flex: 0 0 auto;
      block-size: var(--ds-checkbox-line-box);
    }
    .box > * {
      grid-area: 1 / 1;
    }

    /* control: a native input drawn with the control tokens, never a hidden input under a fake box. */
    .control {
      box-sizing: border-box;
      inline-size: var(--ds-checkbox-control-size);
      block-size: var(--ds-checkbox-control-size);
      margin: 0;
      padding: 0;
      border-width: var(--ds-checkbox-control-border-width);
      border-style: solid;
      border-color: var(--ds-checkbox-control-border);
      border-radius: var(--ds-checkbox-control-radius);
      background-color: var(--ds-checkbox-control-background);
      cursor: pointer;
      appearance: none;
      -webkit-appearance: none;
      transition:
        background-color var(--ds-checkbox-transition) var(--motion-easing-standard),
        border-color var(--ds-checkbox-transition) var(--motion-easing-standard);
    }

    /* Border color precedence: invalid, then selected, then rest — so these three rules stay in order. */

    /* controlSelectedBackground: checked and indeterminate fill; the border takes the same color */
    .control:checked,
    .control:indeterminate {
      border-color: var(--ds-checkbox-control-selected-background);
      background-color: var(--ds-checkbox-control-selected-background);
    }

    /* controlBorderInvalid: replaces the border color in every state; the selected fill is unchanged */
    :host([invalid]) .control {
      border-color: var(--ds-checkbox-control-border-invalid);
    }

    /* pressedOverlay: an unchecked, not-mixed, enabled box shows controlSelectedBackground at this
       opacity over controlBackground; the border is unchanged. A filled or disabled box shows none. */
    .row:not(.disabled) .control:active:not(:checked):not(:indeterminate) {
      background-color: color-mix(
        in srgb,
        var(--ds-checkbox-control-selected-background) calc(var(--ds-checkbox-pressed-overlay) * 100%),
        var(--ds-checkbox-control-background)
      );
    }

    /* focusRing, focusRingWidth: a separate outline, so an invalid box keeps controlBorderInvalid */
    .control:focus-visible {
      outline: var(--ds-checkbox-focus-ring-width) solid var(--ds-checkbox-focus-ring);
      outline-offset: var(--ds-checkbox-focus-ring-width);
    }

    /* indicator: the Icon centred over the control; clicks fall through to the input */
    .indicator {
      display: inline-flex;
      pointer-events: none;
    }

    /* indicatorStroke, descriptionText, errorText: set through each child's documented hook, never
       by styling its shadow tree. */
    .indicator ds-icon {
      --ds-icon-stroke-width: var(--ds-checkbox-indicator-stroke);
    }
    .description {
      --ds-text-color: var(--ds-checkbox-description-text);
    }
    .error {
      --ds-text-color: var(--ds-checkbox-error-text);
    }

    /* transition: fill and border only — the indicator is mounted and unmounted, never animated */
    @media (prefers-reduced-motion: reduce) {
      .control {
        transition: none;
      }
    }

    /* partGap: between label and description */
    .text {
      display: flex;
      flex-direction: column;
      gap: var(--ds-checkbox-part-gap);
      min-inline-size: 0;
    }

    /* hideLabel: the hidden label still sets the line box, so a description starts below the
       empty label line (where the control sits) rather than beside the control. */
    .text.label-hidden::before {
      content: '';
      block-size: var(--ds-checkbox-line-box);
    }

    /* labelColor, labelSize, labelWeight, fontFamily, lineHeight: the label's own rule */
    .label {
      font-family: var(--ds-checkbox-font-family);
      font-size: var(--ds-checkbox-label-size);
      font-weight: var(--ds-checkbox-label-weight);
      line-height: var(--ds-checkbox-line-height);
      color: var(--ds-checkbox-label-color);
      cursor: pointer;
    }

    /* The error sits below the row, outside the hit area, indented by controlSize + gap so it lines
       up with the label rather than the control. */
    .error {
      padding-inline-start: calc(var(--ds-checkbox-control-size) + var(--ds-checkbox-gap));
    }

    /* disabledOpacity: dims the control (with its indicator) and the label, not the description or error */
    .row.disabled,
    .row.disabled .control,
    .row.disabled .label {
      cursor: not-allowed;
    }
    .row.disabled .box,
    .row.disabled .label {
      opacity: var(--ds-checkbox-disabled-opacity);
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