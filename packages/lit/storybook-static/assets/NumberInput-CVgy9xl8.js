import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{O as t,_ as n,a as r,b as i,c as a,f as o,g as s,h as c,i as l,o as u,p as d,r as f,t as ee,u as p,v as m,w as h}from"./if-defined-CARySXJh.js";import{t as te}from"./query-BHY-nhsh.js";import{t as ne}from"./Icon-eWCe5jE3.js";import{t as re}from"./Text-b_nq3K9L.js";import{t as ie}from"./Button-B3rVveNU.js";import{n as g,t as ae}from"./class-map-C-hUkrHk.js";import{r as oe,t as se}from"./live-DYI4u8lm.js";function ce(){let e=new Intl.NumberFormat().formatToParts(12345.6);return{decimal:e.find(e=>e.type===`decimal`)?.value??`.`,group:e.find(e=>e.type===`group`)?.value??`,`}}function le(e){let t=String(e),n=/e-(\d+)$/.exec(t);if(n)return Number(n[1]);let r=t.indexOf(`.`);return r===-1?0:t.length-r-1}function _(e,t){let n=10**t;return Math.round(e*n)/n}function v(e){let t=e.trim();if(t===``)return{kind:`empty`};let{decimal:n}=ce(),r=n===`.`||!t.includes(n),i=``,a=!1,o=!1;for(let e of t)e>=`0`&&e<=`9`?i+=e:e===`-`&&i===``&&!o?a=!0:(e===n||e===`.`&&r)&&!o&&(o=!0,i+=`.`);if(!/\d/.test(i))return{kind:`invalid`};let s=Number(`${a?`-`:``}${i.startsWith(`.`)?`0${i}`:i}`);return Number.isFinite(s)?{kind:`number`,value:s}:{kind:`invalid`}}function ue(e){try{return new Intl.NumberFormat(void 0,{style:`unit`,unit:e}),!0}catch{return!1}}function y(e){let t=/^(-?\d*\.?\d+)(ms|s)$/.exec(e.trim());if(!t)return;let n=Number(t[1]);return t[2]===`s`?n*1e3:n}function b(e){return typeof e==`number`&&Number.isFinite(e)?e:void 0}var x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,de,Y,fe,pe,me,he,ge,_e,ve,ye,be,xe,Se,Ce,we,Te,Ee,De,Oe,ke,Ae,X,je,Me,Ne,Pe,Fe,Ie,Le,Re,Z,Q,ze;function $(){return($=e((()=>{s(),n(),u(),ae(),ee(),se(),r(),re(),ie(),ne(),Z={borderInvalid:`--ds-number-input-border-invalid`,borderWidth:`--ds-number-input-border-width`,radius:`--ds-number-input-radius`,paddingInline:`--ds-number-input-padding-inline`,paddingBlock:`--ds-number-input-padding-block`,affixGap:`--ds-number-input-affix-gap`,stepperGap:`--ds-number-input-stepper-gap`,stepperDivider:`--ds-number-input-stepper-divider`,stepperDividerWidth:`--ds-number-input-stepper-divider-width`,partGap:`--ds-number-input-part-gap`,labelWeight:`--ds-number-input-label-weight`,helperSize:`--ds-number-input-helper-size`,fontFamily:`--ds-number-input-font-family`,fontSize:`--ds-number-input-font-size`,lineHeight:`--ds-number-input-line-height`,disabledOpacity:`--ds-number-input-disabled-opacity`},Q={increment:`Increase`,decrement:`Decrease`,required:`{label} is required.`,invalid:`{label} must be a number.`,outOfRange:`{label} must be between {min} and {max}.`,outOfRangeMin:`{label} must be {min} or more.`,outOfRangeMax:`{label} must be {max} or less.`,currencyMissing:`format "currency" needs a currency code.`,requiredIndicator:` (required)`},new class extends d{static[class extends m{static{({e:[C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,de,Y,fe,pe,me,he,ge,_e,ve,ye,be,xe,Se,Ce,we,Te,Ee,De,Oe,ke,Ae,X,je,Me,Ne,Pe,Fe,Ie,Le,Re,x],c:[ze,S]}=c(this,[o(`ds-number-input`)],[[p(),1,`label`],[p(),1,`name`],[p({attribute:!1}),1,`value`],[p({attribute:`default-value`,type:Number}),1,`defaultValue`],[p({type:Number}),1,`min`],[p({type:Number}),1,`max`],[p({type:Number}),1,`step`],[p({type:Number}),1,`precision`],[p({type:String,reflect:!0}),1,`format`],[p(),1,`currency`],[p(),1,`unit`],[p({attribute:`leading-text`}),1,`leadingText`],[p({attribute:`trailing-text`}),1,`trailingText`],[p({type:Boolean,reflect:!0,attribute:`hide-steppers`}),1,`hideSteppers`],[p(),1,`placeholder`],[p(),1,`description`],[p({type:Boolean,reflect:!0}),1,`required`],[p({type:Boolean,attribute:`hide-label`}),1,`hideLabel`],[p({type:String,reflect:!0}),1,`size`],[p({type:Boolean,reflect:!0}),1,`disabled`],[p({type:Boolean,reflect:!0}),1,`invalid`],[p(),4,`error`],[p({attribute:!1}),1,`overrides`],[a(),1,`internalValue`],[a(),1,`text`],[a(),1,`textInvalid`],[a(),1,`rangeMessage`],[a(),1,`formDisabled`],[te(`#input`),1,`inputEl`]],0,void 0,m))}#e=(x(this),C(this,``));get label(){return this.#e}set label(e){this.#e=e}#t=(w(this),T(this,``));get name(){return this.#t}set name(e){this.#t=e}#n=(E(this),D(this));get value(){return this.#n}set value(e){this.#n=e}#r=(O(this),k(this));get defaultValue(){return this.#r}set defaultValue(e){this.#r=e}#i=(A(this),j(this));get min(){return this.#i}set min(e){this.#i=e}#a=(M(this),N(this));get max(){return this.#a}set max(e){this.#a=e}#o=(P(this),F(this,1));get step(){return this.#o}set step(e){this.#o=e}#s=(I(this),L(this));get precision(){return this.#s}set precision(e){this.#s=e}#c=(R(this),z(this,`decimal`));get format(){return this.#c}set format(e){this.#c=e}#l=(B(this),V(this));get currency(){return this.#l}set currency(e){this.#l=e}#u=(H(this),U(this));get unit(){return this.#u}set unit(e){this.#u=e}#d=(W(this),G(this));get leadingText(){return this.#d}set leadingText(e){this.#d=e}#f=(K(this),q(this));get trailingText(){return this.#f}set trailingText(e){this.#f=e}#p=(J(this),de(this,!1));get hideSteppers(){return this.#p}set hideSteppers(e){this.#p=e}#m=(Y(this),fe(this));get placeholder(){return this.#m}set placeholder(e){this.#m=e}#h=(pe(this),me(this));get description(){return this.#h}set description(e){this.#h=e}#g=(he(this),ge(this,!1));get required(){return this.#g}set required(e){this.#g=e}#_=(_e(this),ve(this,!1));get hideLabel(){return this.#_}set hideLabel(e){this.#_=e}#v=(ye(this),be(this,`md`));get size(){return this.#v}set size(e){this.#v=e}#y=(xe(this),Se(this,!1));get disabled(){return this.#y}set disabled(e){this.#y=e}#b=(Ce(this),we(this,!1));get invalid(){return this.#b}set invalid(e){this.#b=e}errorValue=void Te(this);get error(){return this.errorValue}set error(e){let t=this.errorValue;this.errorValue=e,e?this.invalid=!0:t&&(this.invalid=!1),this.syncInternals()}#x=Ee(this);get overrides(){return this.#x}set overrides(e){this.#x=e}#S=(De(this),Oe(this));get internalValue(){return this.#S}set internalValue(e){this.#S=e}#C=(ke(this),Ae(this,``));get text(){return this.#C}set text(e){this.#C=e}#w=(X(this),je(this,!1));get textInvalid(){return this.#w}set textInvalid(e){this.#w=e}#T=(Me(this),Ne(this));get rangeMessage(){return this.#T}set rangeMessage(e){this.#T=e}rangeSide=void Pe(this);#E=Fe(this,!1);get formDisabled(){return this.#E}set formDisabled(e){this.#E=e}#D=(Ie(this),Le(this));get inputEl(){return this.#D}set inputEl(e){this.#D=e}internals=(Re(this),this.attachInternals());seeded=!1;typing=!1;lastSynced;warnedCurrency=!1;repeatTimer;pointerStepped=!1;get valueAsNumber(){return this.value===void 0?this.seeded?this.internalValue:b(this.defaultValue):b(this.value)}get currentValue(){let e=this.valueAsNumber;return e===void 0?null:String(e)}get form(){return this.internals.form}get validity(){return this.syncInternals(),this.internals.validity}get validationMessage(){return this.message??``}checkValidity(){return this.syncInternals(),this.internals.checkValidity()}reportValidity(){return this.syncInternals(),this.internals.reportValidity()}formDisabledCallback(e){this.formDisabled=e}formResetCallback(){this.internalValue=b(this.defaultValue),this.textInvalid=!1,this.rangeMessage=void 0,this.typing=!1,this.lastSynced=void 0}formStateRestoreCallback(e){if(typeof e==`string`&&this.value===void 0){let t=v(e);this.internalValue=t.kind===`number`?t.value:void 0}}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`NumberInput`),this.setAttribute(`data-ds-field`,``)}disconnectedCallback(){super.disconnectedCallback(),this.stopRepeat()}willUpdate(e){this.seeded||(this.seeded=!0,this.internalValue=b(this.defaultValue)),e.has(`overrides`)&&this.applyOverrides(),this.syncText()}updated(){this.syncInternals()}render(){let e=this.isDisabled,t=this.valueAsNumber,n=this.displayedMessage,r=this.invalid||this.textInvalid||n!==void 0,a=[this.description?`description`:``,n?`error`:``].filter(Boolean).join(` `),o=this.resolvedLeading,s=this.resolvedTrailing,c=t===void 0?void 0:`${o??``}${this.display(t)}${s?` ${s}`:``}`,l=this.textOverrides,u=b(this.min),d=b(this.max);return h`
      <div class=${g({group:!0,disabled:e})}>
        <label
          class=${g({"visually-hidden":this.hideLabel})}
          part="label"
          data-part="label"
          for="input"
          >${this.label}${this.required?Q.requiredIndicator:i}</label
        >
        ${this.description?h`<div id="description" part="description" data-part="description">
              <ds-text element="p" size="sm" tone="muted" .overrides=${l}
                >${this.description}</ds-text
              >
            </div>`:i}
        <div
          class=${g({"has-steppers":!this.hideSteppers,invalid:r})}
          part="field"
          data-part="field"
        >
          ${o?h`<span part="prefix" data-part="prefix" aria-hidden="true">${o}</span>`:i}
          <input
            id="input"
            part="input"
            data-part="input"
            type="text"
            inputmode="decimal"
            role="spinbutton"
            autocomplete="off"
            name=${this.name}
            .value=${oe(this.text)}
            placeholder=${f(this.placeholder)}
            aria-valuenow=${f(t)}
            aria-valuemin=${f(u)}
            aria-valuemax=${f(d)}
            aria-valuetext=${f(c)}
            aria-describedby=${f(a||void 0)}
            aria-invalid=${f(r?`true`:void 0)}
            aria-required=${f(this.required?`true`:void 0)}
            aria-disabled=${f(e?`true`:void 0)}
            ?readonly=${e}
            @input=${this.handleInput}
            @keydown=${this.handleKeydown}
            @blur=${this.handleBlur}
          />
          ${s?h`<span part="suffix" data-part="suffix" aria-hidden="true">${s}</span>`:i}
          ${this.hideSteppers?i:h`<span class="steppers">
                <span
                  part="decrementButton"
                  data-part="decrementButton"
                  @pointerdown=${e=>this.handleStepperPointerDown(e,-1)}
                  @mousedown=${this.keepFocus}
                  @pointerup=${this.stopRepeat}
                  @pointerleave=${this.endPointerStep}
                  @pointercancel=${this.endPointerStep}
                  @click=${e=>this.handleStepperClick(e,-1)}
                  @press=${this.stopInnerPress}
                  ><ds-button
                    variant="ghost"
                    size="sm"
                    icon-only
                    label=${Q.decrement}
                    tabindex="-1"
                    ?disabled=${e||this.atMin}
                    ><ds-icon slot="leading-icon" name="minus" inline></ds-icon></ds-button
                ></span>
                <span
                  part="incrementButton"
                  data-part="incrementButton"
                  @pointerdown=${e=>this.handleStepperPointerDown(e,1)}
                  @mousedown=${this.keepFocus}
                  @pointerup=${this.stopRepeat}
                  @pointerleave=${this.endPointerStep}
                  @pointercancel=${this.endPointerStep}
                  @click=${e=>this.handleStepperClick(e,1)}
                  @press=${this.stopInnerPress}
                  ><ds-button
                    variant="ghost"
                    size="sm"
                    icon-only
                    label=${Q.increment}
                    tabindex="-1"
                    ?disabled=${e||this.atMax}
                    ><ds-icon slot="leading-icon" name="plus" inline></ds-icon></ds-button
                ></span>
              </span>`}
        </div>
        ${n?h`<ds-text
              id="error"
              role="alert"
              part="errorMessage"
              data-part="errorMessage"
              element="p"
              size="sm"
              tone="danger"
              .overrides=${l}
              >${n}</ds-text
            >`:i}
      </div>
    `}get isDisabled(){return this.disabled||this.formDisabled}get digits(){let e=b(this.step)??1;return Math.max(0,Math.trunc(b(this.precision)??le(e)))}get stepSize(){let e=b(this.step);return e!==void 0&&e>0?e:1}get unitKnown(){return this.format===`unit`&&!!this.unit&&ue(this.unit)}get resolvedLeading(){return this.format===`currency`?void 0:this.leadingText||void 0}get resolvedTrailing(){return this.trailingText?this.trailingText:this.format===`unit`&&this.unit&&!this.unitKnown?this.unit:void 0}get atMin(){let e=b(this.min),t=this.valueAsNumber;return e!==void 0&&t!==void 0&&t<=e}get atMax(){let e=b(this.max),t=this.valueAsNumber;return e!==void 0&&t!==void 0&&t>=e}display(e){let t={minimumFractionDigits:this.digits,maximumFractionDigits:this.digits};return this.format===`currency`?new Intl.NumberFormat(void 0,{...t,style:`currency`,currency:this.currency||`USD`}).format(e):this.format===`percent`?new Intl.NumberFormat(void 0,{...t,style:`percent`}).format(e/100):this.unitKnown?new Intl.NumberFormat(void 0,{...t,style:`unit`,unit:this.unit}).format(e):new Intl.NumberFormat(void 0,t).format(e)}syncText(){let e=this.valueAsNumber,t=`${this.format}|${this.digits}|${this.currency??``}|${this.unit??``}`,n=this.lastSynced;if(!(n&&Object.is(n.value,e)&&n.formatKey===t)){if(this.lastSynced={value:e,formatKey:t},n&&(this.typing||this.textInvalid)&&n.formatKey===t){let t=v(this.text);if(e===void 0||Object.is(t.kind===`number`?t.value:void 0,e))return}this.typing=!1,this.text=e===void 0?``:this.display(e),this.textInvalid=!1}}get message(){let e=e=>e.replace(`{label}`,this.label);return this.error?this.error:this.required&&this.valueAsNumber===void 0&&!this.textInvalid?e(Q.required):this.invalid||this.textInvalid?e(Q.invalid):this.rangeMessage}get displayedMessage(){let e=e=>e.replace(`{label}`,this.label);return this.error?this.error:this.textInvalid?e(Q.invalid):this.invalid&&this.required&&this.valueAsNumber===void 0?e(Q.required):this.rangeMessage}rangeCopy(){let e=b(this.min),t=b(this.max),n=e=>e.replace(`{label}`,this.label);return e!==void 0&&t!==void 0?n(Q.outOfRange).replace(`{min}`,this.display(e)).replace(`{max}`,this.display(t)):e===void 0?n(Q.outOfRangeMax).replace(`{max}`,t===void 0?``:this.display(t)):n(Q.outOfRangeMin).replace(`{min}`,this.display(e))}clamp(e){let t=b(this.min),n=b(this.max),r=e;return t!==void 0&&r<t&&(r=t),n!==void 0&&r>n&&(r=n),r}report(e){Object.is(e,this.valueAsNumber)||(this.value===void 0?this.internalValue=e:this.requestUpdate(),this.dispatchEvent(new CustomEvent(`change`,{detail:{value:e},bubbles:!0,composed:!0})))}stepBy(e){if(this.isDisabled)return;let t=this.valueAsNumber,n=b(this.min),r=b(this.max),i=t===void 0?e>0?n??0:r??0:t+e;this.typing=!1,this.textInvalid=!1,this.rangeMessage=void 0,this.report(this.clamp(_(i,this.digits)))}setTo(e){this.isDisabled||(this.typing=!1,this.textInvalid=!1,this.rangeMessage=void 0,this.report(_(e,this.digits)))}commit(){this.typing=!1;let e=v(this.inputEl?.value??this.text);if(e.kind!==`number`){this.textInvalid=e.kind===`invalid`,this.rangeMessage=void 0,this.report(void 0),e.kind===`empty`&&(this.text=``);return}let t=_(e.value,this.digits),n=this.clamp(t);this.textInvalid=!1,this.rangeSide=n===t?void 0:n>t?`under`:`over`,this.rangeMessage=n===t?void 0:this.rangeCopy(),this.report(n);let r=this.valueAsNumber;this.text=r===void 0?``:this.display(r)}handleInput(e){if(this.isDisabled)return;let t=e.currentTarget.value;this.typing=!0,this.text=t,this.rangeMessage=void 0,this.textInvalid=!1;let n=v(t);n.kind!==`invalid`&&this.report(n.kind===`number`?n.value:void 0)}handleKeydown(e){if(this.isDisabled)return;let t=this.stepSize;switch(e.key){case`ArrowUp`:e.preventDefault(),this.stepBy(t);break;case`ArrowDown`:e.preventDefault(),this.stepBy(-t);break;case`PageUp`:e.preventDefault(),this.stepBy(t*10);break;case`PageDown`:e.preventDefault(),this.stepBy(-t*10);break;case`Home`:{let t=b(this.min);t!==void 0&&(e.preventDefault(),this.setTo(t));break}case`End`:{let t=b(this.max);t!==void 0&&(e.preventDefault(),this.setTo(t));break}case`Enter`:this.commit()}}handleBlur(){this.isDisabled||this.commit()}stopInnerPress=e=>{e.stopPropagation()};keepFocus=e=>{e.preventDefault()};stopRepeat=()=>{this.repeatTimer!==void 0&&(window.clearTimeout(this.repeatTimer),this.repeatTimer=void 0)};endPointerStep=()=>{this.stopRepeat(),this.pointerStepped=!1};repeatTimings(){let e=getComputedStyle(this),t=y(e.getPropertyValue(`--motion-duration-base`)),n=y(e.getPropertyValue(`--motion-duration-fast`));return t!==void 0&&n!==void 0&&t>0&&n>0?{delay:t,interval:n}:void 0}handleStepperPointerDown(e,t){if(e.preventDefault(),this.stopRepeat(),this.pointerStepped=!0,this.isDisabled||(t>0?this.atMax:this.atMin))return;this.stepBy(t*this.stepSize);let n=this.repeatTimings();if(!n)return;let r=()=>{if(this.isDisabled||(t>0?this.atMax:this.atMin)){this.stopRepeat();return}this.stepBy(t*this.stepSize),this.repeatTimer=window.setTimeout(r,n.interval)};this.repeatTimer=window.setTimeout(r,n.delay)}handleStepperClick(e,t){if(this.pointerStepped){this.pointerStepped=!1;return}e.preventDefault(),!(this.isDisabled||(t>0?this.atMax:this.atMin))&&this.stepBy(t*this.stepSize)}get textOverrides(){let e=this.overrides;if(e)return{fontSize:e.helperSize,fontFamily:e.fontFamily,lineHeight:e.lineHeight}}applyOverrides(){for(let e of Object.keys(Z)){let t=this.overrides?.[e],n=Z[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,l(t))}}syncInternals(){if(this.isDisabled){this.internals.setFormValue(null),this.internals.setValidity({});return}this.internals.setFormValue(this.currentValue);let e=this.inputEl??void 0,t=this.message;if(t===void 0)this.internals.setValidity({});else if(!this.error&&this.required&&this.valueAsNumber===void 0&&!this.textInvalid)this.internals.setValidity({valueMissing:!0},t,e);else if(!this.error&&!this.invalid&&!this.textInvalid&&this.rangeMessage){let n=this.rangeSide===`under`?{rangeUnderflow:!0}:{rangeOverflow:!0};this.internals.setValidity(n,t,e)}else this.internals.setValidity({customError:!0},t,e)}}];formAssociated=!0;shadowRootOptions={...m.shadowRootOptions,delegatesFocus:!0};styles=t`
    :host {
      display: block;
      --ds-number-input-border-invalid: var(--color-border-danger);
      --ds-number-input-border-width: var(--border-width-thin);
      --ds-number-input-radius: var(--radius-md);
      --ds-number-input-padding-inline: var(--space-md);
      --ds-number-input-padding-block: var(--space-sm);
      --ds-number-input-affix-gap: var(--layout-gap-tight);
      --ds-number-input-stepper-gap: var(--layout-gap-none);
      --ds-number-input-stepper-divider: var(--color-border);
      --ds-number-input-stepper-divider-width: var(--border-width-thin);
      --ds-number-input-part-gap: var(--space-1);
      --ds-number-input-label-weight: var(--font-weight-medium);
      --ds-number-input-helper-size: var(--font-size-sm);
      --ds-number-input-font-family: var(--font-family-body);
      --ds-number-input-font-size: var(--font-size-md);
      --ds-number-input-line-height: var(--font-line-height-normal);
      --ds-number-input-disabled-opacity: var(--opacity-disabled);
      /* Locked bindings: out of the overrides API, still themeable from page CSS. */
      --ds-number-input-background: var(--color-background);
      --ds-number-input-foreground: var(--color-foreground);
      --ds-number-input-placeholder: var(--color-foreground-muted);
      --ds-number-input-border: var(--color-border-strong);
      --ds-number-input-border-focus: var(--color-border-focus);
      --ds-number-input-affix-color: var(--color-foreground-muted);
      --ds-number-input-description-text: var(--color-foreground-muted);
      --ds-number-input-error-text: var(--color-foreground-danger);
      --ds-number-input-min-target: var(--size-target-comfortable);
      --ds-number-input-min-target-sm: var(--size-target-min);
      --ds-number-input-focus-ring-width: var(--border-width-focus);
    }

    :host([hidden]) {
      display: none;
    }

    /* paddingInline / paddingBlock by size; fontSize: font.size.{size} */
    :host([size='sm']) {
      --ds-number-input-padding-inline: var(--space-2);
      --ds-number-input-padding-block: var(--space-1);
      --ds-number-input-font-size: var(--font-size-sm);
    }
    :host([size='md']) {
      --ds-number-input-padding-inline: var(--space-md);
      --ds-number-input-padding-block: var(--space-sm);
      --ds-number-input-font-size: var(--font-size-md);
    }

    /* partGap: between label, description, field and error */
    .group {
      display: grid;
      gap: var(--ds-number-input-part-gap);
      position: relative;
      font-family: var(--ds-number-input-font-family);
    }

    /*
     * disabledOpacity: the label, description, input and affix parts dim. The
     * description part is a wrapper this element owns, so the dimming never
     * reaches into the composed ds-text. The field frame and the error message
     * are not dimmed, and the stepper Buttons take disabled instead, dimming
     * once through their own style.
     */
    .group.disabled [data-part='label'],
    .group.disabled [data-part='description'],
    .group.disabled [data-part='input'],
    .group.disabled [data-part='prefix'],
    .group.disabled [data-part='suffix'] {
      opacity: var(--ds-number-input-disabled-opacity);
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
      font-family: var(--ds-number-input-font-family);
      font-size: var(--ds-number-input-font-size);
      font-weight: var(--ds-number-input-label-weight);
      line-height: var(--ds-number-input-line-height);
      color: var(--ds-number-input-foreground);
    }

    /* descriptionText (locked): the wrapper's colour; the composed Text draws its own muted tone. */
    [data-part='description'] {
      color: var(--ds-number-input-description-text);
    }

    /*
     * background, border (locked); borderWidth, radius, paddingInline, affixGap.
     * --field-border is the width actually drawn — borderWidth normally, and
     * focusRingWidth while the input has focus. Both paddings subtract the
     * difference, so swapping to the ring neither grows nor shifts the field.
     */
    [data-part='field'] {
      --field-border: var(--ds-number-input-border-width);
      --field-ring-delta: calc(var(--field-border) - var(--ds-number-input-border-width));
      box-sizing: border-box;
      display: flex;
      align-items: stretch;
      inline-size: 100%;
      min-block-size: var(--ds-number-input-min-target);
      padding-inline: calc(var(--ds-number-input-padding-inline) - var(--field-ring-delta));
      gap: var(--ds-number-input-affix-gap);
      border: var(--field-border) solid var(--ds-number-input-border);
      border-radius: var(--ds-number-input-radius);
      background: var(--ds-number-input-background);
      transition: border-color var(--motion-duration-fast) var(--motion-easing-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      [data-part='field'] {
        transition: none;
      }
    }

    /* minTargetSm: the field height floor at size sm */
    :host([size='sm']) [data-part='field'] {
      min-block-size: var(--ds-number-input-min-target-sm);
    }

    /* The steppers sit flush at the end of the field. */
    [data-part='field'].has-steppers {
      padding-inline-end: 0;
    }

    /*
     * borderFocus / focusRingWidth (locked): the ring is the field's own border,
     * drawn while the input matches :focus-visible — no outline, as Input.
     */
    [data-part='field']:has([data-part='input']:focus-visible) {
      --field-border: var(--ds-number-input-focus-ring-width);
      border-color: var(--ds-number-input-border-focus);
    }

    /* borderInvalid */
    [data-part='field'].invalid,
    [data-part='field'].invalid:has([data-part='input']:focus-visible) {
      border-color: var(--ds-number-input-border-invalid);
    }

    /* foreground (locked); paddingBlock, fontSize, lineHeight */
    [data-part='input'] {
      flex: 1 1 auto;
      min-inline-size: 0;
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      /* paddingBlock, shrunk by the focus-ring width difference inherited from the field */
      padding-block: calc(var(--ds-number-input-padding-block) - var(--field-ring-delta));
      border: 0;
      outline: none;
      background: transparent;
      font-family: var(--ds-number-input-font-family);
      font-size: var(--ds-number-input-font-size);
      line-height: var(--ds-number-input-line-height);
      color: var(--ds-number-input-foreground);
      appearance: none;
      -webkit-appearance: none;
    }

    /* placeholder: color.foreground.muted (locked) */
    [data-part='input']::placeholder {
      color: var(--ds-number-input-placeholder);
      opacity: 1;
    }

    .group.disabled [data-part='input'] {
      cursor: not-allowed;
    }

    /* affixColor: color.foreground.muted (locked) */
    [data-part='prefix'],
    [data-part='suffix'] {
      display: inline-flex;
      align-items: center;
      color: var(--ds-number-input-affix-color);
      font-family: var(--ds-number-input-font-family);
      font-size: var(--ds-number-input-font-size);
      line-height: var(--ds-number-input-line-height);
      white-space: nowrap;
    }

    /* stepperGap between the two Buttons; stepperDivider / stepperDividerWidth is the hairline before them */
    .steppers {
      display: flex;
      align-items: center;
      flex-shrink: 0;
      gap: var(--ds-number-input-stepper-gap);
      border-inline-start: var(--ds-number-input-stepper-divider-width) solid var(--ds-number-input-stepper-divider);
    }

    [data-part='decrementButton'],
    [data-part='incrementButton'] {
      display: inline-flex;
    }
  `;constructor(){super(ze),S()}}})))()}export{$ as t};