import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{C as t,a as n,c as ee,d as te,f as r,h as i,p as a,r as ne,s as o,t as s,u as re,y as c}from"./decorators-BlUBDG4K.js";import{t as l}from"./query-BHY-nhsh.js";import{a as u,i as d,r as f,t as p}from"./if-defined-BfpvQ5_i.js";import{n as m,t as ie}from"./class-map-ByT5L8jj.js";import{r as ae,t as oe}from"./live-DoUijhZq.js";var h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{te(),r(),s(),p(),oe(),ie(),u(),Y={borderFocus:`--ds-input-border-focus`,borderInvalid:`--ds-input-border-invalid`,borderWidth:`--ds-input-border-width`,radius:`--ds-input-radius`,paddingInline:`--ds-input-padding-inline`,paddingBlock:`--ds-input-padding-block`,paddingBlockSm:`--ds-input-padding-block-sm`,paddingInlineSm:`--ds-input-padding-inline-sm`,partGap:`--ds-input-part-gap`,fontFamily:`--ds-input-font-family`,fontSize:`--ds-input-font-size`,labelWeight:`--ds-input-label-weight`,helperSize:`--ds-input-helper-size`,lineHeight:`--ds-input-line-height`,minTargetSm:`--ds-input-min-target-sm`,disabledOpacity:`--ds-input-disabled-opacity`},X=e=>`${e} is required.`,Z=e=>`${e} is not valid.`,new class extends ee{static[class extends a{static{({e:[_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,h],c:[Q,g]}=re(this,[o(`ds-input`)],[[n(),1,`label`],[n(),1,`name`],[n(),1,`value`],[n({attribute:`default-value`}),1,`defaultValue`],[n(),1,`placeholder`],[n(),1,`description`],[n({reflect:!0}),1,`type`],[n({type:Boolean,attribute:`hide-label`}),1,`hideLabel`],[n({reflect:!0}),1,`size`],[n({type:Boolean,reflect:!0}),1,`required`],[n({type:Boolean,reflect:!0}),1,`disabled`],[n({type:Boolean,reflect:!0}),1,`invalid`],[n(),4,`error`],[n(),1,`autocomplete`],[n({attribute:!1}),1,`overrides`],[ne(),1,`formDisabled`],[l(`#field`),1,`inputEl`]],0,void 0,a))}#e=(h(this),_(this,``));get label(){return this.#e}set label(e){this.#e=e}#t=(v(this),y(this,``));get name(){return this.#t}set name(e){this.#t=e}#n=(b(this),x(this));get value(){return this.#n}set value(e){this.#n=e}#r=(S(this),C(this));get defaultValue(){return this.#r}set defaultValue(e){this.#r=e}#i=(w(this),T(this));get placeholder(){return this.#i}set placeholder(e){this.#i=e}#a=(E(this),D(this));get description(){return this.#a}set description(e){this.#a=e}#o=(O(this),k(this,`text`));get type(){return this.#o}set type(e){this.#o=e}#s=(A(this),j(this,!1));get hideLabel(){return this.#s}set hideLabel(e){this.#s=e}#c=(M(this),N(this,`md`));get size(){return this.#c}set size(e){this.#c=e}#l=(P(this),F(this,!1));get required(){return this.#l}set required(e){this.#l=e}#u=(I(this),L(this,!1));get disabled(){return this.#u}set disabled(e){this.#u=e}#d=(R(this),z(this,!1));get invalid(){return this.#d}set invalid(e){this.#d=e}errorValue=void B(this);get error(){return this.errorValue}set error(e){let t=this.errorValue;this.errorValue=e,this.invalid=!!e,this.requestUpdate(`error`,t)}#f=V(this);get autocomplete(){return this.#f}set autocomplete(e){this.#f=e}#p=(H(this),U(this));get overrides(){return this.#p}set overrides(e){this.#p=e}#m=(W(this),G(this,!1));get formDisabled(){return this.#m}set formDisabled(e){this.#m=e}#h=(K(this),q(this));get inputEl(){return this.#h}set inputEl(e){this.#h=e}internals=void J(this);constructor(){super(),this.internals=this.attachInternals()}get currentValue(){return this.value??this.defaultValue??``}get form(){return this.internals.form}get validity(){return this.internals.validity}get validationMessage(){return this.internals.validationMessage}checkValidity(){return this.syncInternals(),this.internals.checkValidity()}reportValidity(){return this.syncInternals(),this.internals.reportValidity()}formDisabledCallback(e){this.formDisabled=e}formResetCallback(){this.value=void 0}formStateRestoreCallback(e){typeof e==`string`&&(this.value=e)}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Input`)}willUpdate(e){e.has(`overrides`)&&this.applyOverrides()}updated(){this.syncInternals()}render(){let e=this.disabled||this.formDisabled,t=[this.description?`description`:``,this.error?`error`:``].filter(e=>e!==``).join(` `)||void 0;return c`
      <label
        class=${m({label:!0,"visually-hidden":this.hideLabel})}
        part="label"
        for="field"
        >${this.label}${this.required?c`<span class="required" aria-hidden="true"> (required)</span>`:i}</label
      >
      ${this.description?c`<p id="description" class="description" part="description">${this.description}</p>`:i}
      <input
        id="field"
        class=${m({field:!0,disabled:e})}
        part="field"
        name=${this.name}
        type=${this.type}
        .value=${ae(this.currentValue)}
        placeholder=${f(this.placeholder)}
        autocomplete=${f(this.autocomplete)}
        aria-describedby=${f(t)}
        aria-invalid=${f(this.invalid?`true`:void 0)}
        aria-required=${f(this.required?`true`:void 0)}
        aria-disabled=${f(e?`true`:void 0)}
        ?readonly=${e}
        @input=${this.handleInput}
      />
      <div id="error" class="error" part="error" role="alert">${this.error??``}</div>
    `}handleInput(){let e=this.inputEl.value;this.value=e,this.dispatchEvent(new CustomEvent(`change`,{detail:{value:e},bubbles:!0,composed:!0}))}applyOverrides(){for(let e of Object.keys(Y)){let t=this.overrides?.[e],n=Y[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,d(t))}}syncInternals(){let e=this.currentValue,t=this.inputEl;if(t){if(this.disabled||this.formDisabled){this.internals.setFormValue(null),this.internals.setValidity({});return}this.internals.setFormValue(e),this.error?this.internals.setValidity({customError:!0},this.error,t):this.invalid?this.internals.setValidity({customError:!0},Z(this.label),t):this.required&&e.trim()===``?this.internals.setValidity({valueMissing:!0},X(this.label),t):t.validity.valid?this.internals.setValidity({}):this.internals.setValidity(t.validity,t.validationMessage,t)}}}];formAssociated=!0;shadowRootOptions={...a.shadowRootOptions,delegatesFocus:!0};styles=t`
    :host {
      display: block;
      font-family: var(--font-family-body);
      --ds-input-border-focus: var(--color-border-focus);
      --ds-input-border-invalid: var(--color-border-danger);
      --ds-input-border-width: var(--border-width-thin);
      --ds-input-radius: var(--radius-md);
      --ds-input-padding-inline: var(--space-md);
      --ds-input-padding-block: var(--space-sm);
      --ds-input-padding-inline-sm: var(--space-2);
      --ds-input-padding-block-sm: var(--space-1);
      --ds-input-part-gap: var(--space-1);
      --ds-input-font-family: var(--font-family-body);
      --ds-input-font-size: var(--font-size-md);
      --ds-input-label-weight: var(--font-weight-medium);
      --ds-input-helper-size: var(--font-size-sm);
      --ds-input-line-height: var(--font-line-height-normal);
      --ds-input-min-target-sm: var(--size-target-min);
      --ds-input-disabled-opacity: var(--opacity-disabled);
    }

    :host([hidden]) {
      display: none;
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

    /* fontSize: font.size.{size} */
    :host([size='sm']) {
      --ds-input-font-size: var(--font-size-sm);
    }

    .label {
      display: block;
      font-size: var(--ds-input-font-size);
      font-weight: var(--ds-input-label-weight);
      line-height: var(--ds-input-line-height);
      color: var(--color-foreground);
    }

    .required {
      font-weight: var(--font-weight-regular);
      color: var(--color-foreground-muted);
    }

    /* descriptionText: color.foreground.muted, locked */
    .description {
      margin-block: var(--ds-input-part-gap) 0;
      margin-inline: 0;
      font-size: var(--ds-input-helper-size);
      line-height: var(--ds-input-line-height);
      color: var(--color-foreground-muted);
    }

    .field {
      box-sizing: border-box;
      display: block;
      inline-size: 100%;
      min-block-size: var(--size-target-comfortable);
      margin-block-start: var(--ds-input-part-gap);
      padding-block: var(--ds-input-padding-block);
      padding-inline: var(--ds-input-padding-inline);
      border: var(--ds-input-border-width) solid var(--color-border-strong);
      border-radius: var(--ds-input-radius);
      font-family: var(--ds-input-font-family);
      font-size: var(--ds-input-font-size);
      line-height: var(--ds-input-line-height);
      color: var(--color-foreground);
      background: var(--color-background);
      appearance: none;
      -webkit-appearance: none;
      transition:
        border-color var(--motion-duration-fast) var(--motion-easing-standard),
        padding var(--motion-duration-fast) var(--motion-easing-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      .field {
        transition: none;
      }
    }

    /* paddingBlockSm / paddingInlineSm / minTargetSm replace the md bindings at size sm */
    :host([size='sm']) .field {
      min-block-size: var(--ds-input-min-target-sm);
      padding-block: var(--ds-input-padding-block-sm);
      padding-inline: var(--ds-input-padding-inline-sm);
    }

    /* placeholder: color.foreground.muted, locked */
    .field::placeholder {
      color: var(--color-foreground-muted);
      opacity: 1;
    }

    /*
     * focusRingWidth (locked) replaces borderWidth while focused; padding
     * shrinks by the difference (border-box sizing) so the field does not shift.
     */
    .field:focus-visible {
      border-color: var(--ds-input-border-focus);
      border-width: var(--border-width-focus);
      padding-inline: calc(var(--ds-input-padding-inline) - (var(--border-width-focus) - var(--ds-input-border-width)));
      padding-block: calc(var(--ds-input-padding-block) - (var(--border-width-focus) - var(--ds-input-border-width)));
    }

    :host([size='sm']) .field:focus-visible {
      padding-inline: calc(var(--ds-input-padding-inline-sm) - (var(--border-width-focus) - var(--ds-input-border-width)));
      padding-block: calc(var(--ds-input-padding-block-sm) - (var(--border-width-focus) - var(--ds-input-border-width)));
    }

    /* borderInvalid: color.border.danger */
    :host([invalid]) .field {
      border-color: var(--ds-input-border-invalid);
    }
    :host([invalid]) .field:focus-visible {
      border-color: var(--ds-input-border-invalid);
    }

    /*
     * disabledOpacity: opacity.disabled on the control; colors are unchanged.
     * Disabled fields stay focusable and readable (aria-disabled + readonly),
     * never the native disabled attribute, which would drop them from the tab order.
     */
    .field.disabled {
      opacity: var(--ds-input-disabled-opacity);
      cursor: not-allowed;
    }

    /* errorText: color.foreground.danger, locked */
    .error {
      font-size: var(--ds-input-helper-size);
      line-height: var(--ds-input-line-height);
      color: var(--color-foreground-danger);
    }
    .error:not(:empty) {
      margin-block-start: var(--ds-input-part-gap);
    }
  `;constructor(){super(Q),g()}}})))()}export{$ as t};