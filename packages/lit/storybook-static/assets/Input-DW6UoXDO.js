import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{O as t,_ as n,a as r,b as i,c as a,f as o,g as ee,h as te,i as ne,o as re,p as ie,r as s,t as ae,u as c,v as l,w as u}from"./if-defined-CARySXJh.js";import{t as oe}from"./query-BHY-nhsh.js";import{t as se}from"./Text-BrJPDVza.js";import{n as d,t as ce}from"./class-map-C-hUkrHk.js";import{r as le,t as ue}from"./live-DYI4u8lm.js";var f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q;function $(){return($=e((()=>{ee(),n(),re(),ce(),ae(),ue(),r(),se(),J={borderInvalid:`--ds-input-border-invalid`,borderWidth:`--ds-input-border-width`,radius:`--ds-input-radius`,paddingInline:`--ds-input-padding-inline`,paddingBlock:`--ds-input-padding-block`,partGap:`--ds-input-part-gap`,fontFamily:`--ds-input-font-family`,fontSize:`--ds-input-font-size`,labelWeight:`--ds-input-label-weight`,lineHeight:`--ds-input-line-height`,disabledOpacity:`--ds-input-disabled-opacity`,transition:`--ds-input-transition`},Y=e=>`${e} is required.`,X=e=>`${e} is not valid.`,Z=` (required)`,new class extends ie{static[class extends l{static{({e:[m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,f],c:[Q,p]}=te(this,[o(`ds-input`)],[[c(),1,`label`],[c(),1,`name`],[c({attribute:!1}),1,`value`],[c({attribute:`default-value`}),1,`defaultValue`],[c(),1,`placeholder`],[c(),1,`description`],[c({type:String,reflect:!0}),1,`type`],[c({type:Boolean,reflect:!0}),1,`required`],[c({type:Boolean,attribute:`hide-label`}),1,`hideLabel`],[c({type:String,reflect:!0}),1,`size`],[c({type:Boolean,reflect:!0}),1,`disabled`],[c({type:Boolean,reflect:!0}),1,`invalid`],[c(),4,`error`],[c(),1,`autocomplete`],[c({attribute:!1}),1,`overrides`],[a(),1,`editedValue`],[a(),1,`formDisabled`],[oe(`#field`),1,`inputEl`]],0,void 0,l))}#e=(f(this),m(this,``));get label(){return this.#e}set label(e){this.#e=e}#t=(h(this),g(this,``));get name(){return this.#t}set name(e){this.#t=e}#n=(_(this),v(this));get value(){return this.#n}set value(e){this.#n=e}#r=(y(this),b(this));get defaultValue(){return this.#r}set defaultValue(e){this.#r=e}#i=(x(this),S(this));get placeholder(){return this.#i}set placeholder(e){this.#i=e}#a=(C(this),w(this));get description(){return this.#a}set description(e){this.#a=e}#o=(T(this),E(this,`text`));get type(){return this.#o}set type(e){this.#o=e}#s=(D(this),O(this,!1));get required(){return this.#s}set required(e){this.#s=e}#c=(k(this),A(this,!1));get hideLabel(){return this.#c}set hideLabel(e){this.#c=e}#l=(j(this),M(this,`md`));get size(){return this.#l}set size(e){this.#l=e}#u=(N(this),P(this,!1));get disabled(){return this.#u}set disabled(e){this.#u=e}#d=(F(this),I(this,!1));get invalid(){return this.#d}set invalid(e){this.#d=e}errorValue=void L(this);get error(){return this.errorValue}set error(e){let t=this.errorValue;this.errorValue=e,e?this.invalid=!0:t&&(this.invalid=!1),this.syncInternals()}#f=R(this);get autocomplete(){return this.#f}set autocomplete(e){this.#f=e}#p=(z(this),B(this));get overrides(){return this.#p}set overrides(e){this.#p=e}#m=(V(this),H(this));get editedValue(){return this.#m}set editedValue(e){this.#m=e}#h=(U(this),W(this,!1));get formDisabled(){return this.#h}set formDisabled(e){this.#h=e}#g=(G(this),K(this));get inputEl(){return this.#g}set inputEl(e){this.#g=e}internals=(q(this),this.attachInternals());get currentValue(){return this.value??this.editedValue??this.defaultValue??``}get form(){return this.internals.form}get validity(){return this.syncInternals(),this.internals.validity}get validationMessage(){return this.syncInternals(),this.internals.validationMessage}checkValidity(){return this.syncInternals(),this.internals.checkValidity()}reportValidity(){return this.syncInternals(),this.internals.reportValidity()}formDisabledCallback(e){this.formDisabled=e}formResetCallback(){this.editedValue=void 0}formStateRestoreCallback(e){typeof e==`string`&&this.value===void 0&&(this.editedValue=e)}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Input`),this.setAttribute(`data-ds-field`,``)}willUpdate(e){e.has(`overrides`)&&this.applyOverrides()}updated(){this.syncInternals()}render(){let e=this.isDisabled,t=this.displayedError,n=[this.description?`description`:``,t?`error`:``].filter(Boolean).join(` `),r=this.textOverrides;return u`
      <div class=${d({group:!0,disabled:e})}>
        <label
          class=${d({"visually-hidden":this.hideLabel})}
          part="label"
          data-part="label"
          for="field"
          >${this.label}${this.required?Z:i}</label
        >
        ${this.description?u`<ds-text
              id="description"
              part="description"
              data-part="description"
              element="p"
              size="sm"
              tone="muted"
              .overrides=${r}
              >${this.description}</ds-text
            >`:i}
        <input
          id="field"
          part="field"
          data-part="field"
          name=${this.name}
          type=${this.type}
          .value=${le(this.currentValue)}
          placeholder=${s(this.placeholder)}
          autocomplete=${s(this.autocomplete)}
          aria-describedby=${s(n||void 0)}
          aria-invalid=${s(this.invalid?`true`:void 0)}
          aria-required=${s(this.required?`true`:void 0)}
          aria-disabled=${s(e?`true`:void 0)}
          ?readonly=${e}
          @input=${this.handleInput}
        />
        ${t?u`<ds-text
              id="error"
              role="alert"
              part="errorMessage"
              data-part="errorMessage"
              element="p"
              size="sm"
              tone="danger"
              .overrides=${r}
              >${t}</ds-text
            >`:i}
      </div>
    `}get isDisabled(){return this.disabled||this.formDisabled}get displayedError(){return this.error?this.error:this.invalid?this.required&&this.currentValue===``?Y(this.label):X(this.label):``}get textOverrides(){let e=this.overrides;if(e)return{fontSize:e.helperSize,fontFamily:e.fontFamily,lineHeight:e.lineHeight}}handleInput(e){let t=e.currentTarget;if(this.isDisabled)return;let n=t.value;this.value===void 0&&(this.editedValue=n),this.dispatchEvent(new CustomEvent(`change`,{detail:{value:n},bubbles:!0,composed:!0})),this.value!==void 0&&this.requestUpdate()}applyOverrides(){for(let e of Object.keys(J)){let t=this.overrides?.[e],n=J[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,ne(t))}}syncInternals(){if(this.isDisabled){this.internals.setFormValue(null),this.internals.setValidity({});return}let e=this.currentValue,t=this.inputEl??void 0;this.internals.setFormValue(e),this.error?this.internals.setValidity({customError:!0},this.error,t):this.required&&e===``?this.internals.setValidity({valueMissing:!0},Y(this.label),t):this.invalid?this.internals.setValidity({customError:!0},X(this.label),t):t&&!t.validity.valid?this.internals.setValidity(t.validity,X(this.label),t):this.internals.setValidity({})}}];formAssociated=!0;shadowRootOptions={...l.shadowRootOptions,delegatesFocus:!0};styles=t`
    :host {
      display: block;
      --ds-input-border-invalid: var(--color-border-danger);
      --ds-input-border-width: var(--border-width-thin);
      --ds-input-radius: var(--radius-md);
      --ds-input-padding-inline: var(--space-md);
      --ds-input-padding-block: var(--space-sm);
      --ds-input-part-gap: var(--space-1);
      --ds-input-font-family: var(--font-family-body);
      --ds-input-font-size: var(--font-size-md);
      --ds-input-label-weight: var(--font-weight-medium);
      --ds-input-line-height: var(--font-line-height-normal);
      --ds-input-disabled-opacity: var(--opacity-disabled);
      --ds-input-transition: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    /* paddingInline / paddingBlock by size; fontSize: font.size.{size} */
    :host([size='sm']) {
      --ds-input-padding-inline: var(--space-2);
      --ds-input-padding-block: var(--space-1);
      --ds-input-font-size: var(--font-size-sm);
    }
    :host([size='md']) {
      --ds-input-padding-inline: var(--space-md);
      --ds-input-padding-block: var(--space-sm);
      --ds-input-font-size: var(--font-size-md);
    }

    /* partGap: the vertical gap between label, description, field and error */
    .group {
      display: grid;
      gap: var(--ds-input-part-gap);
      position: relative;
      font-family: var(--ds-input-font-family);
    }

    /* disabledOpacity: the whole field group dims, as Button dims the whole control */
    .group.disabled {
      opacity: var(--ds-input-disabled-opacity);
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

    /* labelWeight: font.weight.medium on the label part */
    [data-part='label'] {
      font-family: var(--ds-input-font-family);
      font-size: var(--ds-input-font-size);
      font-weight: var(--ds-input-label-weight);
      line-height: var(--ds-input-line-height);
      color: var(--color-foreground);
    }

    [data-part='field'] {
      box-sizing: border-box;
      display: block;
      inline-size: 100%;
      min-block-size: var(--size-target-comfortable);
      margin: 0;
      padding-block: var(--ds-input-padding-block);
      padding-inline: var(--ds-input-padding-inline);
      border: var(--ds-input-border-width) solid var(--color-border-strong);
      border-radius: var(--ds-input-radius);
      outline: none;
      font-family: var(--ds-input-font-family);
      font-size: var(--ds-input-font-size);
      line-height: var(--ds-input-line-height);
      color: var(--color-foreground);
      background: var(--color-background);
      appearance: none;
      -webkit-appearance: none;
      /* transition: border color only; border width and padding change instantly */
      transition: border-color var(--ds-input-transition) var(--motion-easing-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      [data-part='field'] {
        transition: none;
      }
    }

    /* minTargetSm: the field height floor at size sm */
    :host([size='sm']) [data-part='field'] {
      min-block-size: var(--size-target-min);
    }

    /* placeholder: color.foreground.muted */
    [data-part='field']::placeholder {
      color: var(--color-foreground-muted);
      opacity: 1;
    }

    /*
     * The border is the focus ring: focusRingWidth replaces borderWidth, and the
     * padding shrinks by the difference so the field does not shift.
     */
    [data-part='field']:focus-visible {
      border-color: var(--color-border-focus);
      border-width: var(--border-width-focus);
      padding-inline: calc(var(--ds-input-padding-inline) - (var(--border-width-focus) - var(--ds-input-border-width)));
      padding-block: calc(var(--ds-input-padding-block) - (var(--border-width-focus) - var(--ds-input-border-width)));
    }

    /* borderInvalid: the danger color stays while focused; only the width changes */
    :host([invalid]) [data-part='field'],
    :host([invalid]) [data-part='field']:focus-visible {
      border-color: var(--ds-input-border-invalid);
    }

    .group.disabled [data-part='field'] {
      cursor: not-allowed;
    }
  `;constructor(){super(Q),p()}}})))()}export{$ as t};