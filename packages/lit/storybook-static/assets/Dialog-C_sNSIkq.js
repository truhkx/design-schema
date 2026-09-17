import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{O as t,_ as n,a as r,b as i,c as a,f as ee,g as te,h as ne,i as re,o as ie,p as ae,r as oe,t as se,u as o,v as s,w as c}from"./if-defined-CARySXJh.js";import{t as l}from"./query-BHY-nhsh.js";import{t as ce}from"./Icon-BHsrajXm.js";import{t as le}from"./Text-C3do0IPT.js";import{t as ue}from"./Button-DM0-zK5H.js";import{t as de}from"./Heading-Ca-mCASW.js";import{n as u,t as fe}from"./class-map-C-hUkrHk.js";import{t as pe}from"./Stack-gnRbseNc.js";import{t as me}from"./Box-CAC_PYS7.js";import{t as he}from"./FocusScope-BRL2IrR1.js";function d(e){if(e.hasAttribute(`inert`)||e.getAttribute(`aria-hidden`)===`true`)return null;if(e instanceof HTMLElement&&!e.hidden&&e.tabIndex>=0&&e.matches(Ce))return e;if(e instanceof HTMLSlotElement){for(let t of e.assignedElements({flatten:!0})){let e=d(t);if(e)return e}return null}let t=e.shadowRoot??e;for(let e of Array.from(t.children)){let t=d(e);if(t)return t}return null}function ge(){return new Promise(e=>requestAnimationFrame(()=>e()))}function _e(){if(X+=1,X===1){let e=document.documentElement.style;Z=e.getPropertyValue(`overflow`),Q=e.getPropertyValue(`scrollbar-gutter`),e.setProperty(`overflow`,`hidden`),e.setProperty(`scrollbar-gutter`,`stable`)}}function ve(){if(X=Math.max(0,X-1),X===0){let e=document.documentElement.style;e.setProperty(`overflow`,Z),e.setProperty(`scrollbar-gutter`,Q)}}var f,p,m,h,g,_,v,y,b,x,S,C,w,ye,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,be,Y,xe,Se,Ce,X,Z,Q,we;function $(){return($=e((()=>{te(),n(),ie(),fe(),se(),r(),de(),le(),ue(),ce(),me(),pe(),he(),Y={scrim:`--ds-dialog-scrim`,border:`--ds-dialog-border`,borderWidth:`--ds-dialog-border-width`,shadow:`--ds-dialog-shadow`,radius:`--ds-dialog-radius`,inset:`--ds-dialog-inset`,partGap:`--ds-dialog-part-gap`,headerGap:`--ds-dialog-header-gap`,footerGap:`--ds-dialog-footer-gap`,descriptionGap:`--ds-dialog-description-gap`,widthSm:`--ds-dialog-width-sm`,widthMd:`--ds-dialog-width-md`,widthLg:`--ds-dialog-width-lg`,layer:`--ds-dialog-layer`,enter:`--ds-dialog-enter`,exit:`--ds-dialog-exit`},xe=`Close`,Se={fromAttribute(e){return e===null},toAttribute(e){return e?null:``}},Ce=[`a[href]`,`button:not([disabled])`,`input:not([disabled])`,`select:not([disabled])`,`textarea:not([disabled])`,`summary`,`[contenteditable]:not([contenteditable="false"])`,`[tabindex]`].join(`,`),X=0,Z=``,Q=``,new class extends ae{static[class extends s{static{({e:[p,m,h,g,_,v,y,b,x,S,C,w,ye,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,be],c:[we,f]}=ne(this,[ee(`ds-dialog`)],[[o({type:Boolean,reflect:!0}),1,`open`],[o(),1,`heading`],[o(),1,`description`],[o({type:Boolean,attribute:`hide-heading`}),1,`hideHeading`],[o({type:String,reflect:!0}),1,`size`],[o({attribute:`no-dismiss`,reflect:!0,converter:Se}),1,`dismissible`],[o({type:String,attribute:`initial-focus`,reflect:!0}),1,`initialFocus`],[o({attribute:!1}),1,`overrides`],[a(),1,`closing`],[a(),1,`hasFooter`],[a(),1,`headingIsFallback`],[l(`dialog`),1,`dialogEl`],[l(`.scope`),1,`scopeEl`],[l(`.scrim`),1,`scrimEl`],[l(`.surface`),1,`surfaceEl`],[l(`ds-heading`),1,`headingEl`],[l(`.close-button ds-button`),1,`closeButtonEl`],[l(`slot:not([name])`),1,`bodySlotEl`],[l(`slot[name="footer"]`),1,`footerSlotEl`]],0,void 0,s))}#e=p(this,!1);get open(){return this.#e}set open(e){this.#e=e}#t=(m(this),h(this,``));get heading(){return this.#t}set heading(e){this.#t=e}#n=(g(this),_(this));get description(){return this.#n}set description(e){this.#n=e}#r=(v(this),y(this,!1));get hideHeading(){return this.#r}set hideHeading(e){this.#r=e}#i=(b(this),x(this,`md`));get size(){return this.#i}set size(e){this.#i=e}#a=(S(this),C(this,!0));get dismissible(){return this.#a}set dismissible(e){this.#a=e}#o=(w(this),ye(this,`first`));get initialFocus(){return this.#o}set initialFocus(e){this.#o=e}#s=(T(this),E(this));get overrides(){return this.#s}set overrides(e){this.#s=e}#c=(D(this),O(this,!1));get closing(){return this.#c}set closing(e){this.#c=e}#l=(k(this),A(this,!1));get hasFooter(){return this.#l}set hasFooter(e){this.#l=e}#u=(j(this),M(this,!1));get headingIsFallback(){return this.#u}set headingIsFallback(e){this.#u=e}#d=(N(this),P(this));get dialogEl(){return this.#d}set dialogEl(e){this.#d=e}#f=(F(this),I(this));get scopeEl(){return this.#f}set scopeEl(e){this.#f=e}#p=(L(this),R(this));get scrimEl(){return this.#p}set scrimEl(e){this.#p=e}#m=(z(this),B(this));get surfaceEl(){return this.#m}set surfaceEl(e){this.#m=e}#h=(V(this),H(this));get headingEl(){return this.#h}set headingEl(e){this.#h=e}#g=(U(this),W(this));get closeButtonEl(){return this.#g}set closeButtonEl(e){this.#g=e}#_=(G(this),K(this));get bodySlotEl(){return this.#_}set bodySlotEl(e){this.#_=e}#v=(q(this),J(this));get footerSlotEl(){return this.#v}set footerSlotEl(e){this.#v=e}scrollLocked=(be(this),!1);closingProgrammatically=!1;escapeReported=!1;footerObserver=new MutationObserver(()=>this.syncHasFooter());connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Dialog`),this.addEventListener(`submit`,this.handleSubmit),this.syncHasFooter(),this.footerObserver.observe(this,{childList:!0,subtree:!0,attributeFilter:[`slot`]})}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`submit`,this.handleSubmit),this.footerObserver.disconnect(),this.releaseScroll()}willUpdate(e){e.has(`overrides`)&&this.applyOverrides(),e.has(`open`)&&(this.open?this.closing=!1:e.get(`open`)===!0&&(this.closing=!0)),(e.has(`initialFocus`)||e.has(`dismissible`)||e.has(`open`)&&this.open)&&(this.headingIsFallback=!1)}updated(e){e.has(`open`)&&(this.open?this.handleOpen():this.closing&&this.handleClose())}render(){if(!this.open&&!this.closing)return i;let e=this.description||void 0,t=this.initialFocus===`title`||this.headingIsFallback,n=this.overrides?.inset,r=n===void 0?void 0:{paddingBlock:n,paddingInline:n},a=this.overrides?.footerGap,ee=a===void 0?void 0:{gap:a};return c`
      <dialog
        class=${u({closing:this.closing})}
        aria-modal="true"
        aria-label=${this.heading}
        aria-description=${oe(e)}
        @cancel=${this.handleCancel}
        @close=${this.handleNativeClose}
      >
        <div class="scrim" part="scrim" data-part="scrim" @click=${this.handleScrimClick}></div>
        <ds-focus-scope
          class="scope"
          part="focusScope"
          data-part="focusScope"
          auto-focus="none"
          .active=${!this.closing}
        >
          <div class="surface" part="surface" data-part="surface">
            <div class="header" part="header" data-part="header">
              <div class="titles">
                <div
                  class=${u({heading:!0,"visually-hidden":this.hideHeading})}
                  part="heading"
                  data-part="heading"
                >
                  <ds-heading level="2" tabindex=${oe(t?`-1`:void 0)}
                    >${this.heading}</ds-heading
                  >
                </div>
                ${e?c`<ds-text part="description" data-part="description">${e}</ds-text>`:i}
              </div>
              ${this.dismissible?c`<div class="close-button" part="closeButton" data-part="closeButton">
                    <ds-button
                      variant="ghost"
                      size="sm"
                      icon-only
                      label=${xe}
                      @press=${this.handleCloseButtonPress}
                      ><ds-icon slot="leading-icon" name="close"></ds-icon
                    ></ds-button>
                  </div>`:i}
            </div>
            <div class="body" part="body" data-part="body">
              <ds-box .overrides=${r}><slot></slot></ds-box>
            </div>
            ${this.hasFooter?c`<div class="footer" part="footer" data-part="footer">
                  <ds-stack direction="horizontal" justify="end" .overrides=${ee}
                    ><slot name="footer"></slot
                  ></ds-stack>
                </div>`:i}
          </div>
        </ds-focus-scope>
      </dialog>
    `}handleCancel=e=>{e.preventDefault(),this.escapeReported=!e.cancelable,this.dispatchClose(`escape`)};handleNativeClose=()=>{if(this.closingProgrammatically){this.closingProgrammatically=!1;return}this.escapeReported||this.dispatchClose(`escape`),this.escapeReported=!1;let e=this.dialogEl;this.open&&e&&!e.open&&(e.showModal(),this.applyInitialFocus())};handleScrimClick=e=>{this.dismissible&&e.target===e.currentTarget&&this.dispatchClose(`scrim`)};handleCloseButtonPress=e=>{e.stopPropagation(),this.dispatchClose(`close-button`)};handleSubmit=e=>{let t=e.target;if(!(t instanceof HTMLFormElement)||!this.open)return;let n=e.submitter;((n instanceof HTMLButtonElement||n instanceof HTMLInputElement)&&n.hasAttribute(`formmethod`)?n.formMethod:t.method)===`dialog`&&(e.preventDefault(),this.dispatchClose(`action`))};syncHasFooter(){let e=Array.from(this.children).some(e=>e.slot===`footer`);e!==this.hasFooter&&(this.hasFooter=e)}async handleOpen(){let e=this.dialogEl;e&&(this.scrollLocked||=(_e(),!0),e.open||e.showModal(),await this.scopeEl?.updateComplete,this.open&&!this.closing&&(await this.applyInitialFocus(),await this.transitionsSettled()===0&&await ge(),this.open&&!this.closing&&this.dispatchEvent(new CustomEvent(`opened`,{bubbles:!0,composed:!0}))))}async handleClose(){if(await this.updateComplete,await this.transitionsSettled(),this.open)return;let e=this.dialogEl;e?.open&&(this.closingProgrammatically=!0,e.close()),this.releaseScroll(),this.closing=!1}async transitionsSettled(){let e=[this.scrimEl,this.surfaceEl].filter(e=>e!==null);for(let t of e)getComputedStyle(t).opacity;let t=e.flatMap(e=>e.getAnimations());return await Promise.all(t.map(e=>e.finished.catch(()=>void 0))),t.length}async applyInitialFocus(){let e=this.dismissible?this.closeButtonEl:null,t=null;if(this.initialFocus===`close`&&(t=e),this.initialFocus!==`title`&&!t){let n=this.bodySlotEl?d(this.bodySlotEl):null,r=this.footerSlotEl?d(this.footerSlotEl):null;t=n??r??e}t||=(this.initialFocus!==`title`&&!this.headingIsFallback&&(this.headingIsFallback=!0,await this.updateComplete),this.headingEl),t?.focus()}releaseScroll(){this.scrollLocked&&=(ve(),!1)}dispatchClose(e){this.dispatchEvent(new CustomEvent(`close`,{detail:{reason:e},bubbles:!0,composed:!0}))}applyOverrides(){for(let e of Object.keys(Y)){let t=this.overrides?.[e],n=Y[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,re(t))}}warnInDev(){this.open&&(this.heading||console.warn("<ds-dialog> requires a `heading`; it is the accessible name.",this),!this.dismissible&&!this.hasFooter&&console.warn(`<ds-dialog no-dismiss> has no footer: provide the answers in the footer.`,this))}}];shadowRootOptions={...s.shadowRootOptions,delegatesFocus:!0};styles=t`
    :host {
      display: contents;
      --ds-dialog-scrim: var(--color-overlay-scrim);
      --ds-dialog-border: var(--color-border);
      --ds-dialog-border-width: var(--border-width-thin);
      --ds-dialog-shadow: var(--shadow-overlay);
      --ds-dialog-radius: var(--radius-lg);
      --ds-dialog-inset: var(--layout-inset-lg);
      --ds-dialog-part-gap: var(--layout-gap-loose);
      --ds-dialog-header-gap: var(--layout-gap-normal);
      --ds-dialog-footer-gap: var(--layout-gap-tight);
      --ds-dialog-description-gap: var(--layout-gap-tight);
      --ds-dialog-width-sm: var(--layout-max-width-prose);
      --ds-dialog-width-md: var(--layout-max-width-content);
      --ds-dialog-width-lg: var(--layout-max-width-content);
      --ds-dialog-layer: var(--layer-dialog);
      --ds-dialog-enter: var(--motion-duration-base);
      --ds-dialog-exit: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    dialog {
      box-sizing: border-box;
      position: fixed;
      inset: 0;
      inline-size: auto;
      block-size: auto;
      max-inline-size: none;
      max-block-size: none;
      margin: 0;
      padding: 0;
      border: 0;
      background: transparent;
      color: inherit;
      overflow: hidden;
      /* Only a non-top-layer fallback honours this; the top layer ignores z-index. */
      z-index: var(--ds-dialog-layer);
    }

    dialog[open] {
      display: grid;
      place-items: center;
    }

    /* The scrim is the element below; the native backdrop stays clear. */
    dialog::backdrop {
      background: transparent;
    }

    .scrim {
      position: absolute;
      inset: 0;
      background: var(--ds-dialog-scrim);
      opacity: 1;
      transition: opacity var(--ds-dialog-enter) var(--motion-easing-standard);
    }

    .scope {
      position: relative;
      display: flex;
      box-sizing: border-box;
      /* widthMd: layout.maxWidth.content × 0.75; an override replaces the base, the × 0.75 stays. */
      --ds-dialog-width: calc(var(--ds-dialog-width-md) * 0.75);
      inline-size: min(var(--ds-dialog-width), calc(100% - 2 * var(--layout-gutter)));
      max-block-size: calc(100% - 2 * var(--layout-gutter));
    }
    :host([size='sm']) .scope {
      --ds-dialog-width: var(--ds-dialog-width-sm);
    }
    :host([size='lg']) .scope {
      --ds-dialog-width: var(--ds-dialog-width-lg);
    }

    .surface {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-inline-size: 0;
      max-block-size: 100%;
      gap: var(--ds-dialog-part-gap);
      font-family: var(--font-family-body);
      color: var(--color-foreground);
      /* surface: color.overlay.surface, locked — no hook */
      background: var(--color-overlay-surface);
      border-style: solid;
      border-width: var(--ds-dialog-border-width);
      border-color: var(--ds-dialog-border);
      border-radius: var(--ds-dialog-radius);
      box-shadow: var(--ds-dialog-shadow);
      opacity: 1;
      transform: translateY(0);
      transition:
        opacity var(--ds-dialog-enter) var(--motion-easing-standard),
        transform var(--ds-dialog-enter) var(--motion-easing-standard);
    }

    @starting-style {
      .scrim {
        opacity: 0;
      }
      .surface {
        opacity: 0;
        transform: translateY(var(--space-2));
      }
    }

    /* exit: motion.duration.fast with motion.easing.exit, scrim and surface alike */
    .closing .scrim,
    .closing .surface {
      opacity: 0;
      transition-duration: var(--ds-dialog-exit);
      transition-timing-function: var(--motion-easing-exit);
    }
    .closing .surface {
      transform: translateY(var(--space-2));
    }

    @media (prefers-reduced-motion: reduce) {
      .scrim,
      .surface {
        transition: none;
      }
    }

    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--ds-dialog-header-gap);
      padding: var(--ds-dialog-inset);
    }

    /* The titles group: Dialog-owned, not an anatomy part. */
    .titles {
      display: flex;
      flex-direction: column;
      gap: var(--ds-dialog-description-gap);
      min-inline-size: 0;
    }

    .close-button {
      flex: none;
    }

    /* The heading wrapper draws the ring when the heading holds focus (tabindex -1). */
    .heading ds-heading:focus {
      outline: none;
    }
    .heading:has(:focus-visible) {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    /* hideHeading: out of view, still the accessible name and still a focus target. */
    .heading.visually-hidden {
      /* literal-ok: standard visually-hidden clip pattern */
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }

    .body {
      flex: 1 1 auto;
      min-block-size: 0;
      overflow-y: auto;
    }
    /* inset reaches the body Box through its own hooks (and through overrides when set). */
    .body > ds-box {
      --ds-box-padding-block: var(--ds-dialog-inset);
      --ds-box-padding-inline: var(--ds-dialog-inset);
    }

    .footer {
      padding: var(--ds-dialog-inset);
    }
    /* footerGap reaches the Stack through its own hook (and through overrides when set). */
    .footer > ds-stack {
      --ds-stack-gap: var(--ds-dialog-footer-gap);
    }
  `;constructor(){super(we),f()}}})))()}export{$ as t};