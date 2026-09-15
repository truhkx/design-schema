import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{C as t,a as n,c as r,d as i,f as ee,h as a,p as o,r as s,s as te,t as ne,u as re,y as c}from"./decorators-BlUBDG4K.js";import{t as ie}from"./query-BHY-nhsh.js";import{a as ae,i as oe,r as l,t as se}from"./if-defined-BfpvQ5_i.js";import{t as ce}from"./Icon-CGupucWg.js";import{n as le,t as ue}from"./class-map-ByT5L8jj.js";import{t as de}from"./Button-TSn-G4Vm.js";import{t as fe}from"./Text-Dgpz9DWN.js";import{r as pe,t as me}from"./live-DoUijhZq.js";function he(){return Q+=1,`ds-number-input-${Q}`}var u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,ge,L,R,z,B,V,H,U,W,G,K,q,J,Y,_e,ve,ye,be,xe,Se,Ce,we,Te,Ee,De,Oe,X,ke,Z,Ae,je,Me,Ne,Pe,Q,Fe;function $(){return($=e((()=>{i(),ee(),ne(),se(),me(),ue(),ae(),fe(),de(),ce(),Oe={fromAttribute(e){return e===null},toAttribute(e){return e?null:``}},X={borderFocus:`--ds-number-input-border-focus`,borderInvalid:`--ds-number-input-border-invalid`,borderWidth:`--ds-number-input-border-width`,radius:`--ds-number-input-radius`,paddingInline:`--ds-number-input-padding-inline`,paddingBlock:`--ds-number-input-padding-block`,affixGap:`--ds-number-input-affix-gap`,stepperGap:`--ds-number-input-stepper-gap`,stepperDivider:`--ds-number-input-stepper-divider`,partGap:`--ds-number-input-part-gap`,labelWeight:`--ds-number-input-label-weight`,helperSize:`--ds-number-input-helper-size`,fontFamily:`--ds-number-input-font-family`,fontSize:`--ds-number-input-font-size`,lineHeight:`--ds-number-input-line-height`,disabledOpacity:`--ds-number-input-disabled-opacity`},ke=`Increase`,Z=`Decrease`,Ae=e=>`${e} is required.`,je=e=>`${e} must be a number.`,Me=(e,t,n)=>`${e} must be between ${t} and ${n}.`,Ne=` (required)`,Pe=new Set([`ArrowUp`,`ArrowDown`,`PageUp`,`PageDown`]),Q=0,new class extends r{static[class extends o{static{({e:[f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,ge,L,R,z,B,V,H,U,W,G,K,q,J,Y,_e,ve,ye,be,xe,Se,Ce,we,Te,Ee,De,u],c:[Fe,d]}=re(this,[te(`ds-number-input`)],[[n(),1,`label`],[n(),1,`name`],[n({type:Number}),1,`min`],[n({type:Number}),1,`max`],[n({type:Number}),1,`step`],[n({type:Number}),1,`precision`],[n({reflect:!0}),1,`format`],[n(),1,`currency`],[n(),1,`unit`],[n({type:String}),1,`prefix`],[n(),1,`suffix`],[n({attribute:`hide-steppers`,reflect:!0,converter:Oe}),1,`showSteppers`],[n(),1,`placeholder`],[n(),1,`description`],[n({attribute:!1}),1,`value`],[n({attribute:!1}),1,`defaultValue`],[n({type:Boolean,reflect:!0}),1,`required`],[n({type:Boolean,reflect:!0}),1,`disabled`],[n({type:Boolean,reflect:!0}),1,`invalid`],[n(),4,`error`],[n({attribute:!1}),1,`overrides`],[s(),1,`internalValue`],[s(),1,`formDisabled`],[s(),1,`isFocused`],[s(),1,`rawText`],[ie(`#input`),1,`inputEl`]],0,void 0,o))}#e=(u(this),f(this,``));get label(){return this.#e}set label(e){this.#e=e}#t=(p(this),m(this,``));get name(){return this.#t}set name(e){this.#t=e}#n=(h(this),g(this));get min(){return this.#n}set min(e){this.#n=e}#r=(_(this),v(this));get max(){return this.#r}set max(e){this.#r=e}#i=(y(this),b(this,1));get step(){return this.#i}set step(e){this.#i=e}#a=(x(this),S(this));get precision(){return this.#a}set precision(e){this.#a=e}#o=(C(this),w(this,`decimal`));get format(){return this.#o}set format(e){this.#o=e}#s=(T(this),E(this));get currency(){return this.#s}set currency(e){this.#s=e}#c=(D(this),O(this));get unit(){return this.#c}set unit(e){this.#c=e}#l=(k(this),A(this,null));get prefix(){return this.#l}set prefix(e){this.#l=e}#u=(j(this),M(this));get suffix(){return this.#u}set suffix(e){this.#u=e}#d=(N(this),P(this,!0));get showSteppers(){return this.#d}set showSteppers(e){this.#d=e}#f=(F(this),I(this));get placeholder(){return this.#f}set placeholder(e){this.#f=e}#p=(ge(this),L(this));get description(){return this.#p}set description(e){this.#p=e}#m=(R(this),z(this));get value(){return this.#m}set value(e){this.#m=e}#h=(B(this),V(this));get defaultValue(){return this.#h}set defaultValue(e){this.#h=e}#g=(H(this),U(this,!1));get required(){return this.#g}set required(e){this.#g=e}#_=(W(this),G(this,!1));get disabled(){return this.#_}set disabled(e){this.#_=e}#v=(K(this),q(this,!1));get invalid(){return this.#v}set invalid(e){this.#v=e}errorValue=void J(this);get error(){return this.errorValue}set error(e){let t=this.errorValue;this.errorValue=e,this.invalid=!!e,this.requestUpdate(`error`,t)}#y=Y(this);get overrides(){return this.#y}set overrides(e){this.#y=e}#b=(_e(this),ve(this));get internalValue(){return this.#b}set internalValue(e){this.#b=e}#x=(ye(this),be(this,!1));get formDisabled(){return this.#x}set formDisabled(e){this.#x=e}#S=(xe(this),Se(this,!1));get isFocused(){return this.#S}set isFocused(e){this.#S=e}#C=(Ce(this),we(this,``));get rawText(){return this.#C}set rawText(e){this.#C=e}instanceId=(Te(this),he());repeatTimeoutId;repeatIntervalId;#w=Ee(this);get inputEl(){return this.#w}set inputEl(e){this.#w=e}internals=void De(this);constructor(){super(),this.internals=this.attachInternals()}get currentValue(){return this.value===void 0?this.internalValue===void 0?this.defaultValue:this.internalValue:this.value}get form(){return this.internals.form}get validity(){return this.internals.validity}get validationMessage(){return this.internals.validationMessage}checkValidity(){return this.syncInternals(),this.internals.checkValidity()}reportValidity(){return this.syncInternals(),this.internals.reportValidity()}formDisabledCallback(e){this.formDisabled=e}formResetCallback(){this.value=void 0,this.internalValue=void 0}formStateRestoreCallback(e){if(typeof e!=`string`||e===``)return;let t=Number(e);Number.isFinite(t)&&(this.value=t)}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`NumberInput`)}disconnectedCallback(){super.disconnectedCallback(),this.clearRepeat()}willUpdate(e){e.has(`overrides`)&&this.applyOverrides(),this.warnInDev(e)}updated(){this.syncInternals()}render(){let e=this.disabled||this.formDisabled,t=this.currentValue,n=this.isFocused?this.rawText:t===void 0?``:this.formatDisplay(t),r=t===void 0?void 0:this.formatDisplay(t),i=[this.description?`description`:``,this.error?`error`:``].filter(e=>e!==``).join(` `)||void 0;return c`
      <ds-text id=${this.labelId} part="label" weight="medium" .overrides=${this.labelTextOverrides}
        >${this.label}${this.required?c`<span aria-hidden="true">${Ne}</span>`:a}</ds-text
      >
      ${this.description?c`<ds-text
            id="description"
            part="description"
            size="sm"
            tone="muted"
            .overrides=${this.descriptionTextOverrides}
            >${this.description}</ds-text
          >`:a}
      <div class=${le({field:!0,disabled:e,"has-steppers":this.showSteppers})} part="field">
        ${this.prefix?c`<span class="affix" part="prefix">${this.prefix}</span>`:a}
        <input
          id="input"
          part="input"
          class="input"
          type="text"
          inputmode="decimal"
          role="spinbutton"
          autocomplete="off"
          name=${this.name}
          .value=${pe(n)}
          placeholder=${l(this.placeholder)}
          aria-labelledby=${this.labelId}
          aria-describedby=${l(i)}
          aria-valuenow=${l(t)}
          aria-valuemin=${l(this.min)}
          aria-valuemax=${l(this.max)}
          aria-valuetext=${l(r)}
          aria-invalid=${l(this.invalid?`true`:void 0)}
          aria-required=${l(this.required?`true`:void 0)}
          aria-disabled=${l(e?`true`:void 0)}
          ?readonly=${e}
          @focus=${this.handleFocus}
          @blur=${this.handleBlur}
          @input=${this.handleInput}
          @keydown=${this.handleKeydown}
        />
        ${this.suffix?c`<span class="affix" part="suffix">${this.suffix}</span>`:a}
        ${this.showSteppers?c`
              <div class="steppers">
                <ds-button
                  class="stepper"
                  part="decrementButton"
                  variant="ghost"
                  size="sm"
                  icon-only
                  label=${Z}
                  tabindex="-1"
                  aria-hidden="true"
                  ?disabled=${e||this.atMin}
                  @pointerdown=${e=>this.handleStepperPointerDown(e,-1)}
                  @press=${this.stopInnerPress}
                >
                  <ds-icon slot="leading-icon" name="minus" inline></ds-icon>
                </ds-button>
                <ds-button
                  class="stepper"
                  part="incrementButton"
                  variant="ghost"
                  size="sm"
                  icon-only
                  label=${ke}
                  tabindex="-1"
                  aria-hidden="true"
                  ?disabled=${e||this.atMax}
                  @pointerdown=${e=>this.handleStepperPointerDown(e,1)}
                  @press=${this.stopInnerPress}
                >
                  <ds-icon slot="leading-icon" name="plus" inline></ds-icon>
                </ds-button>
              </div>
            `:a}
      </div>
      <div id="error" class="error" part="errorMessage" role="alert">${this.error??``}</div>
    `}get labelId(){return`${this.instanceId}-label`}get atMin(){return this.min!==void 0&&this.currentValue!==void 0&&this.currentValue<=this.min}get atMax(){return this.max!==void 0&&this.currentValue!==void 0&&this.currentValue>=this.max}get resolvedPrecision(){if(this.precision!==void 0)return this.precision;let e=String(this.step),t=e.indexOf(`.`);return t===-1?0:e.length-t-1}stopInnerPress=e=>{e.stopPropagation()};handleFocus(){this.isFocused=!0;let e=this.currentValue;this.rawText=e===void 0?``:this.plainString(e)}handleBlur(){this.commit(),this.isFocused=!1}handleInput(){this.disabled||this.formDisabled||(this.rawText=this.sanitizeInput(this.inputEl.value),this.commitValue(this.parseNumber(this.rawText)))}handleKeydown(e){if(!(this.disabled||this.formDisabled)){if(Pe.has(e.key)){e.preventDefault();let t=e.key===`ArrowUp`||e.key===`PageUp`?1:-1,n=e.key===`PageUp`||e.key===`PageDown`?10:1;this.adjustValue(t,n);return}if(e.key===`Home`&&this.min!==void 0){e.preventDefault(),this.commitAndSync(this.min);return}if(e.key===`End`&&this.max!==void 0){e.preventDefault(),this.commitAndSync(this.max);return}e.key===`Enter`&&(e.preventDefault(),this.commit(),this.closest(`ds-form`)?.submit?.())}}handleStepperPointerDown=(e,t)=>{if(this.disabled||this.formDisabled)return;e.preventDefault(),this.adjustValue(t,1),this.clearRepeat(),this.repeatTimeoutId=window.setTimeout(()=>{this.repeatIntervalId=window.setInterval(()=>this.adjustValue(t,1),this.durationMs(`--motion-duration-fast`,120))},this.durationMs(`--motion-duration-base`,200));let n=()=>{this.clearRepeat(),window.removeEventListener(`pointerup`,n),window.removeEventListener(`pointercancel`,n)};window.addEventListener(`pointerup`,n),window.addEventListener(`pointercancel`,n)};clearRepeat(){this.repeatTimeoutId!==void 0&&(window.clearTimeout(this.repeatTimeoutId),this.repeatTimeoutId=void 0),this.repeatIntervalId!==void 0&&(window.clearInterval(this.repeatIntervalId),this.repeatIntervalId=void 0)}durationMs(e,t){let n=getComputedStyle(this).getPropertyValue(e).trim(),r=Number.parseFloat(n);return Number.isNaN(r)?t:r}adjustValue(e,t){let n=this.currentValue,r=n===void 0?e===1?this.min??0:this.max??0:n+e*this.step*t,i=this.roundToPrecision(this.clampToBounds(r));i!==n&&(this.commitValue(i),this.rawText=this.plainString(i))}commitAndSync(e){let t=this.roundToPrecision(e);this.commitValue(t),this.rawText=this.plainString(t)}commit(){let e=this.parseNumber(this.rawText);if(e===void 0){this.commitValue(void 0);return}let t=this.roundToPrecision(e),n=this.clampToBounds(t);this.required&&this.min!==void 0&&this.max!==void 0&&n!==t&&(this.error=Me(this.label,this.min,this.max)),this.commitValue(n),this.rawText=this.plainString(n)}commitValue(e){this.value===void 0?this.internalValue=e:this.value=e,this.dispatchEvent(new CustomEvent(`change`,{detail:{value:e},bubbles:!0,composed:!0}))}clampToBounds(e){let t=e;return this.min!==void 0&&(t=Math.max(this.min,t)),this.max!==void 0&&(t=Math.min(this.max,t)),t}roundToPrecision(e){let t=10**this.resolvedPrecision;return Math.round(e*t)/t}sanitizeInput(e){let t=this.localeDecimalSeparator(),n=``,r=!1;for(let i of e)i===`-`&&n===``||i>=`0`&&i<=`9`?n+=i:!r&&(i===`.`||i===t)&&(n+=i,r=!0);return n}parseNumber(e){if(e===``||e===`-`)return;let t=this.localeDecimalSeparator(),n=t===`.`?e:e.replace(t,`.`),r=Number(n);return Number.isFinite(r)?r:void 0}plainString(e){let t=this.localeDecimalSeparator(),n=e.toFixed(this.resolvedPrecision);return t===`.`?n:n.replace(`.`,t)}localeDecimalSeparator(){return new Intl.NumberFormat().formatToParts(1.1).find(e=>e.type===`decimal`)?.value??`.`}formatDisplay(e){let t=this.resolvedPrecision;if(this.format===`percent`)return this.safeFormat({style:`percent`},e/100,e);if(this.format===`currency`)return this.safeFormat({style:`currency`,currency:this.currency??`USD`},e,e);if(this.format===`unit`&&this.unit)try{return new Intl.NumberFormat(void 0,{style:`unit`,unit:this.unit,minimumFractionDigits:t,maximumFractionDigits:t}).format(e)}catch{return`${this.plainFormat(e)} ${this.unit}`}return this.plainFormat(e)}plainFormat(e){let t=this.resolvedPrecision;return new Intl.NumberFormat(void 0,{minimumFractionDigits:t,maximumFractionDigits:t}).format(e)}safeFormat(e,t,n){let r=this.resolvedPrecision;try{return new Intl.NumberFormat(void 0,{...e,minimumFractionDigits:r,maximumFractionDigits:r}).format(t)}catch{return this.plainFormat(n)}}get labelTextOverrides(){let e={};return this.overrides?.fontFamily&&(e.fontFamily=this.overrides.fontFamily),this.overrides?.fontSize&&(e.fontSize=this.overrides.fontSize),this.overrides?.labelWeight&&(e.fontWeight=this.overrides.labelWeight),e}get descriptionTextOverrides(){let e={};return this.overrides?.fontFamily&&(e.fontFamily=this.overrides.fontFamily),this.overrides?.helperSize&&(e.fontSize=this.overrides.helperSize),e}syncInternals(){if(this.disabled||this.formDisabled){this.internals.setFormValue(null),this.internals.setValidity({});return}let e=this.currentValue;this.internals.setFormValue(e===void 0?null:String(e));let t=this.inputEl;t&&(this.error?this.internals.setValidity({customError:!0},this.error,t):this.invalid?this.internals.setValidity({customError:!0},je(this.label),t):this.required&&e===void 0?this.internals.setValidity({valueMissing:!0},Ae(this.label),t):this.internals.setValidity({}))}applyOverrides(){for(let e of Object.keys(X)){let t=this.overrides?.[e],n=X[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,oe(t))}}warnInDev(e){}}];formAssociated=!0;shadowRootOptions={...o.shadowRootOptions,delegatesFocus:!0};styles=t`
    :host {
      display: block;
      font-family: var(--ds-number-input-font-family);
      --ds-number-input-border-focus: var(--color-border-focus);
      --ds-number-input-border-invalid: var(--color-border-danger);
      --ds-number-input-border-width: var(--border-width-thin);
      --ds-number-input-radius: var(--radius-md);
      --ds-number-input-padding-inline: var(--space-md);
      --ds-number-input-padding-block: var(--space-sm);
      --ds-number-input-affix-gap: var(--layout-gap-tight);
      --ds-number-input-stepper-gap: var(--layout-gap-none);
      --ds-number-input-stepper-divider: var(--color-border);
      --ds-number-input-part-gap: var(--space-1);
      --ds-number-input-label-weight: var(--font-weight-medium);
      --ds-number-input-helper-size: var(--font-size-sm);
      --ds-number-input-font-family: var(--font-family-body);
      --ds-number-input-font-size: var(--font-size-md);
      --ds-number-input-line-height: var(--font-line-height-normal);
      --ds-number-input-disabled-opacity: var(--opacity-disabled);
    }

    :host([hidden]) {
      display: none;
    }

    /* background: color.background, locked; border: color.border.strong, locked */
    .field {
      box-sizing: border-box;
      display: flex;
      align-items: stretch;
      inline-size: 100%;
      margin-block-start: var(--ds-number-input-part-gap);
      padding-inline-start: var(--ds-number-input-padding-inline);
      border: var(--ds-number-input-border-width) solid var(--color-border-strong);
      border-radius: var(--ds-number-input-radius);
      background: var(--color-background);
      gap: var(--ds-number-input-affix-gap);
      transition: border-color var(--motion-duration-fast) var(--motion-easing-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      .field {
        transition: none;
      }
    }

    .field:not(.has-steppers) {
      padding-inline-end: var(--ds-number-input-padding-inline);
    }

    /* focusRingWidth (locked) / borderFocus */
    .field:focus-within {
      border-color: var(--ds-number-input-border-focus);
      outline: var(--border-width-focus) solid var(--ds-number-input-border-focus);
      outline-offset: var(--border-width-focus);
    }

    /* borderInvalid: color.border.danger */
    :host([invalid]) .field {
      border-color: var(--ds-number-input-border-invalid);
    }
    :host([invalid]) .field:focus-within {
      border-color: var(--ds-number-input-border-invalid);
    }

    /* disabledOpacity: opacity.disabled; the field stays focusable and readable (readonly, not disabled) */
    .field.disabled {
      opacity: var(--ds-number-input-disabled-opacity);
      cursor: not-allowed;
    }

    /* foreground: color.foreground, locked */
    .input {
      flex: 1 1 auto;
      min-inline-size: 0;
      box-sizing: border-box;
      min-block-size: var(--size-target-comfortable);
      margin: 0;
      padding: 0;
      padding-block: var(--ds-number-input-padding-block);
      border: 0;
      outline: none;
      background: transparent;
      font-family: var(--ds-number-input-font-family);
      font-size: var(--ds-number-input-font-size);
      line-height: var(--ds-number-input-line-height);
      color: var(--color-foreground);
      appearance: none;
      -webkit-appearance: none;
    }

    /* placeholder: color.foreground.muted, locked */
    .input::placeholder {
      color: var(--color-foreground-muted);
      opacity: 1;
    }

    .field.disabled .input {
      cursor: not-allowed;
    }

    /* affixColor: color.foreground.muted, locked */
    .affix {
      display: inline-flex;
      align-items: center;
      color: var(--color-foreground-muted);
      font-family: var(--ds-number-input-font-family);
      font-size: var(--ds-number-input-font-size);
      line-height: var(--ds-number-input-line-height);
      white-space: nowrap;
    }

    /* stepperDivider: color.border; stepperGap: layout.gap.none between the two buttons */
    .steppers {
      display: flex;
      align-items: stretch;
      flex-shrink: 0;
      gap: var(--ds-number-input-stepper-gap);
      border-inline-start: var(--border-width-thin) solid var(--ds-number-input-stepper-divider);
    }

    .stepper {
      align-self: stretch;
    }

    /* errorText: color.foreground.danger, locked */
    .error {
      font-size: var(--ds-number-input-helper-size);
      line-height: var(--ds-number-input-line-height);
      color: var(--color-foreground-danger);
    }
    .error:not(:empty) {
      margin-block-start: var(--ds-number-input-part-gap);
    }
  `;constructor(){super(Fe),d()}}})))()}export{$ as t};