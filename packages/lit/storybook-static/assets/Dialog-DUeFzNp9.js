import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{O as t,_ as n,a as r,b as i,c as a,f as ee,g as te,h as ne,i as re,o as ie,p as ae,r as oe,t as se,u as o,v as s,w as c}from"./if-defined-CARySXJh.js";import{t as l}from"./query-BHY-nhsh.js";import{t as ce}from"./Icon-eWCe5jE3.js";import{t as le}from"./Text-b_nq3K9L.js";import{t as ue}from"./Button-B3rVveNU.js";import{t as de}from"./Heading-9iQ-E2rO.js";import{n as u,t as fe}from"./class-map-C-hUkrHk.js";import{t as pe}from"./Stack-CZci_zJ9.js";import{t as me}from"./Box-Cbe3zAzP.js";import{n as he,t as ge}from"./FocusScope-BSAjTz8A.js";function d(e){return ge(e)[0]??null}function _e(){return new Promise(e=>requestAnimationFrame(()=>e()))}function ve(){if(X+=1,X===1){let e=document.documentElement.style;Z=e.getPropertyValue(`overflow`),Q=e.getPropertyValue(`scrollbar-gutter`),e.setProperty(`overflow`,`hidden`),e.setProperty(`scrollbar-gutter`,`stable`)}}function ye(){if(X=Math.max(0,X-1),X===0){let e=document.documentElement.style;e.setProperty(`overflow`,Z),e.setProperty(`scrollbar-gutter`,Q)}}var f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,be,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,xe,Y,Se,Ce,X,Z,Q,we;function $(){return($=e((()=>{te(),n(),ie(),fe(),se(),r(),de(),le(),ue(),ce(),me(),pe(),he(),Y={scrim:`--ds-dialog-scrim`,border:`--ds-dialog-border`,borderWidth:`--ds-dialog-border-width`,shadow:`--ds-dialog-shadow`,radius:`--ds-dialog-radius`,inset:`--ds-dialog-inset`,partGap:`--ds-dialog-part-gap`,gutter:`--ds-dialog-gutter`,headerGap:`--ds-dialog-header-gap`,footerGap:`--ds-dialog-footer-gap`,descriptionGap:`--ds-dialog-description-gap`,widthSm:`--ds-dialog-width-sm`,widthMd:`--ds-dialog-width-md`,widthLg:`--ds-dialog-width-lg`,layer:`--ds-dialog-layer`,enter:`--ds-dialog-enter`,exit:`--ds-dialog-exit`},Se=`Close`,Ce={fromAttribute(e){return e===null},toAttribute(e){return e?null:``}},X=0,Z=``,Q=``,new class extends ae{static[class extends s{static{({e:[p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,be,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,xe],c:[we,f]}=ne(this,[ee(`ds-dialog`)],[[o({type:Boolean,reflect:!0}),1,`open`],[o(),1,`heading`],[o(),1,`description`],[o({type:Boolean,attribute:`hide-heading`}),1,`hideHeading`],[o({type:String,reflect:!0}),1,`size`],[o({attribute:`no-dismiss`,reflect:!0,converter:Ce}),1,`dismissible`],[o({type:String,attribute:`initial-focus`,reflect:!0}),1,`initialFocus`],[o({attribute:!1}),1,`overrides`],[a(),1,`closing`],[a(),1,`hasFooter`],[a(),1,`headingIsFallback`],[l(`dialog`),1,`dialogEl`],[l(`ds-focus-scope`),1,`scopeEl`],[l(`.scrim`),1,`scrimEl`],[l(`.surface`),1,`surfaceEl`],[l(`ds-heading`),1,`headingEl`],[l(`.close-button ds-button`),1,`closeButtonEl`],[l(`slot:not([name])`),1,`bodySlotEl`],[l(`slot[name="footer"]`),1,`footerSlotEl`]],0,void 0,s))}#e=p(this,!1);get open(){return this.#e}set open(e){this.#e=e}#t=(m(this),h(this,``));get heading(){return this.#t}set heading(e){this.#t=e}#n=(g(this),_(this));get description(){return this.#n}set description(e){this.#n=e}#r=(v(this),y(this,!1));get hideHeading(){return this.#r}set hideHeading(e){this.#r=e}#i=(b(this),x(this,`md`));get size(){return this.#i}set size(e){this.#i=e}#a=(S(this),C(this,!0));get dismissible(){return this.#a}set dismissible(e){this.#a=e}#o=(w(this),T(this,`first`));get initialFocus(){return this.#o}set initialFocus(e){this.#o=e}#s=(E(this),D(this));get overrides(){return this.#s}set overrides(e){this.#s=e}#c=(O(this),be(this,!1));get closing(){return this.#c}set closing(e){this.#c=e}#l=(k(this),A(this,!1));get hasFooter(){return this.#l}set hasFooter(e){this.#l=e}#u=(j(this),M(this,!1));get headingIsFallback(){return this.#u}set headingIsFallback(e){this.#u=e}#d=(N(this),P(this));get dialogEl(){return this.#d}set dialogEl(e){this.#d=e}#f=(F(this),I(this));get scopeEl(){return this.#f}set scopeEl(e){this.#f=e}#p=(L(this),R(this));get scrimEl(){return this.#p}set scrimEl(e){this.#p=e}#m=(z(this),B(this));get surfaceEl(){return this.#m}set surfaceEl(e){this.#m=e}#h=(V(this),H(this));get headingEl(){return this.#h}set headingEl(e){this.#h=e}#g=(U(this),W(this));get closeButtonEl(){return this.#g}set closeButtonEl(e){this.#g=e}#_=(G(this),K(this));get bodySlotEl(){return this.#_}set bodySlotEl(e){this.#_=e}#v=(q(this),J(this));get footerSlotEl(){return this.#v}set footerSlotEl(e){this.#v=e}scrollLocked=(xe(this),!1);closingProgrammatically=!1;escapeReported=!1;footerObserver=new MutationObserver(()=>this.syncHasFooter());connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Dialog`),this.addEventListener(`submit`,this.handleSubmit),this.syncHasFooter(),this.footerObserver.observe(this,{childList:!0,subtree:!0,attributeFilter:[`slot`]})}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`submit`,this.handleSubmit),this.footerObserver.disconnect(),this.releaseScroll()}willUpdate(e){e.has(`overrides`)&&this.applyOverrides(),e.has(`open`)&&(this.open?this.closing=!1:e.get(`open`)===!0&&(this.closing=!0)),(e.has(`initialFocus`)||e.has(`dismissible`)||e.has(`open`)&&this.open)&&(this.headingIsFallback=!1)}updated(e){e.has(`open`)&&(this.open?this.handleOpen():this.closing&&this.handleClose())}render(){if(!this.open&&!this.closing)return i;let e=this.description||void 0,t=this.initialFocus===`title`||this.headingIsFallback,n=this.overrides?.inset,r=n===void 0?void 0:{paddingInline:n},a=this.overrides?.footerGap,ee=a===void 0?void 0:{gap:a};return c`
      <dialog
        class=${u({closing:this.closing})}
        role="dialog"
        aria-modal="true"
        aria-label=${this.heading}
        aria-description=${oe(e)}
        @cancel=${this.handleCancel}
        @close=${this.handleNativeClose}
      >
        <div class="scrim" part="scrim" data-part="scrim" @click=${this.handleScrimClick}></div>
        <ds-focus-scope auto-focus="none" .active=${!this.closing}>
          <div class="scope" part="focusScope" data-part="focusScope">
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
                  ${e?c`<div part="description" data-part="description">
                        <ds-text tone="muted">${e}</ds-text>
                      </div>`:i}
                </div>
                ${this.dismissible?c`<div class="close-button" part="closeButton" data-part="closeButton">
                      <ds-button
                        variant="ghost"
                        size="sm"
                        icon-only
                        label=${Se}
                        @press=${this.handleCloseButtonPress}
                        ><ds-icon slot="leading-icon" name="close"></ds-icon
                      ></ds-button>
                    </div>`:i}
              </div>
              <div class="body" part="body" data-part="body">
                <ds-box .overrides=${r}><slot></slot></ds-box>
              </div>
              ${this.hasFooter?c`<div class="footer" part="footer" data-part="footer">
                    <ds-stack direction="horizontal" justify="end" wrap .overrides=${ee}
                      ><slot name="footer"></slot
                    ></ds-stack>
                  </div>`:i}
            </div>
          </div>
        </ds-focus-scope>
      </dialog>
    `}handleCancel=e=>{e.preventDefault(),this.open&&(this.escapeReported=!e.cancelable,this.dispatchClose(`escape`))};handleNativeClose=()=>{if(this.closingProgrammatically){this.closingProgrammatically=!1;return}if(!this.open)return;this.escapeReported||this.dispatchClose(`escape`),this.escapeReported=!1;let e=this.dialogEl;e&&!e.open&&(e.showModal(),this.applyInitialFocus())};handleScrimClick=e=>{this.open&&this.dismissible&&e.target===e.currentTarget&&this.dispatchClose(`scrim`)};handleCloseButtonPress=e=>{e.stopPropagation(),this.open&&this.dispatchClose(`close-button`)};handleSubmit=e=>{let t=e.target;if(!(t instanceof HTMLFormElement)||!this.open)return;let n=e.submitter;((n instanceof HTMLButtonElement||n instanceof HTMLInputElement)&&n.hasAttribute(`formmethod`)?n.formMethod:t.method)===`dialog`&&(e.preventDefault(),this.dispatchClose(`action`))};syncHasFooter(){let e=Array.from(this.children).some(e=>e.slot===`footer`);e!==this.hasFooter&&(this.hasFooter=e)}async handleOpen(){let e=this.dialogEl;e&&(this.scrollLocked||=(ve(),!0),e.open||e.showModal(),await this.scopeEl?.updateComplete,this.open&&!this.closing&&(await this.applyInitialFocus(),await this.transitionsSettled()===0&&await _e(),this.open&&!this.closing&&this.dispatchEvent(new CustomEvent(`opened`,{bubbles:!0,composed:!0}))))}async handleClose(){let e=this.dialogEl;e?.open&&(this.closingProgrammatically=!0,e.close()),this.releaseScroll(),await this.transitionsSettled(),!this.open&&(this.closing=!1)}async transitionsSettled(){let e=[this.scrimEl,this.surfaceEl].filter(e=>e!==null);for(let t of e)getComputedStyle(t).opacity;let t=e.flatMap(e=>e.getAnimations());return await Promise.all(t.map(e=>e.finished.catch(()=>void 0))),t.length}async applyInitialFocus(){let e=this.dismissible?this.closeButtonEl:null,t=null;if(this.initialFocus===`close`&&(t=e),this.initialFocus!==`title`&&!t){let n=this.bodySlotEl?d(this.bodySlotEl):null,r=this.footerSlotEl?d(this.footerSlotEl):null;t=n??r??e}t?.focus(),!(t&&this.focusIsInside())&&(this.initialFocus!==`title`&&!this.headingIsFallback&&(this.headingIsFallback=!0,await this.updateComplete),this.headingEl?.focus())}focusIsInside(){let e=document.activeElement;for(;e;){if(e===this)return!0;e=e.shadowRoot?.activeElement??null}return!1}releaseScroll(){this.scrollLocked&&=(ye(),!1)}dispatchClose(e){this.dispatchEvent(new CustomEvent(`close`,{detail:{reason:e},bubbles:!0,composed:!0}))}applyOverrides(){for(let e of Object.keys(Y)){let t=this.overrides?.[e],n=Y[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,re(t))}}warnInDev(){this.open&&(this.heading||console.warn("<ds-dialog> requires a `heading`; it is the accessible name.",this),!this.dismissible&&!this.hasFooter&&console.warn(`<ds-dialog no-dismiss> has no footer: provide the answers in the footer.`,this))}}];shadowRootOptions={...s.shadowRootOptions,delegatesFocus:!0};styles=t`
    :host {
      display: contents;
      --ds-dialog-scrim: var(--color-overlay-scrim);
      /* Locked: not in the overrides type, but still a hook, themeable from page CSS. */
      --ds-dialog-surface: var(--color-overlay-surface);
      --ds-dialog-focus-ring: var(--color-border-focus);
      --ds-dialog-focus-ring-width: var(--border-width-focus);
      --ds-dialog-border: var(--color-border);
      --ds-dialog-border-width: var(--border-width-thin);
      --ds-dialog-shadow: var(--shadow-overlay);
      --ds-dialog-radius: var(--radius-lg);
      --ds-dialog-inset: var(--layout-inset-lg);
      --ds-dialog-part-gap: var(--layout-gap-loose);
      --ds-dialog-gutter: var(--layout-gutter);
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
      place-items: center;
      /* Only a non-top-layer fallback honours this; the top layer ignores z-index. */
      z-index: var(--ds-dialog-layer);
      /* The native <dialog> closes at the start of the exit (focus restore, page no longer inert);
         these keep it painted in the top layer until the exit transition ends. */
      transition:
        display var(--ds-dialog-exit) allow-discrete,
        overlay var(--ds-dialog-exit) allow-discrete;
    }

    dialog[open] {
      display: grid;
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

    /* The <ds-focus-scope> host carries no part: it writes its own data-part="scope", and it only
       traps Tab and restores focus. */
    ds-focus-scope {
      min-inline-size: 0;
    }

    /* focusScope: the Dialog-owned part element inside the scope, wrapping the surface. */
    .scope {
      display: block;
      min-inline-size: 0;
    }

    .surface {
      box-sizing: border-box;
      position: relative;
      display: flex;
      flex-direction: column;
      /* widthMd: layout.maxWidth.content × 0.75; an override replaces the base, the × 0.75 stays. */
      inline-size: calc(var(--ds-dialog-width-md) * 0.75);
      /* gutter: the minimum space between the surface and the viewport edge. */
      max-inline-size: calc(100vw - 2 * var(--ds-dialog-gutter));
      max-block-size: calc(100dvh - 2 * var(--ds-dialog-gutter));
      gap: var(--ds-dialog-part-gap);
      /* inset: the surface column carries the block padding, once at the top and once at the bottom. */
      padding-block: var(--ds-dialog-inset);
      font-family: var(--font-family-body);
      color: var(--color-foreground);
      background: var(--ds-dialog-surface);
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

    :host([size='sm']) .surface {
      inline-size: var(--ds-dialog-width-sm);
    }
    :host([size='lg']) .surface {
      inline-size: var(--ds-dialog-width-lg);
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
      dialog,
      .scrim,
      .surface {
        transition: none;
      }
      /* The rise is motion too: no translate at either end under reduced motion. */
      .surface,
      .closing .surface {
        transform: none;
      }
    }

    /* header: inline inset only — the surface owns the block padding, so nothing doubles between parts. */
    .header {
      display: flex;
      flex: 0 0 auto;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--ds-dialog-header-gap);
      padding-inline: var(--ds-dialog-inset);
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
      outline: var(--ds-dialog-focus-ring-width) solid var(--ds-dialog-focus-ring);
      outline-offset: var(--ds-dialog-focus-ring-width);
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

    /* body: the only region that scrolls, so header and footer stay put. */
    .body {
      flex: 1 1 auto;
      min-block-size: 0;
      overflow-y: auto;
    }
    /* inset reaches the body Box as inline padding only (and through overrides when set); the
       Box keeps zero block padding, which the surface's block padding already provides. */
    .body > ds-box {
      --ds-box-padding-inline: var(--ds-dialog-inset);
    }

    /* footer: end-aligned action row, inline inset only. */
    .footer {
      flex: 0 0 auto;
      padding-inline: var(--ds-dialog-inset);
    }
    /* footerGap reaches the Stack through its own hook (and through overrides when set). */
    .footer > ds-stack {
      --ds-stack-gap: var(--ds-dialog-footer-gap);
    }
  `;constructor(){super(we),f()}}})))()}export{$ as t};