import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{O as t,_ as n,a as r,b as i,c as a,f as o,g as s,h as c,i as l,o as u,p as d,u as f,v as p,w as m}from"./if-defined-CARySXJh.js";import{t as h}from"./Heading-Ca-mCASW.js";function g(e){if(!(e instanceof Document||e instanceof ShadowRoot)||V.has(e))return;V.add(e);let t=e instanceof Document?e.head:e;if(t.querySelector(`style[data-${z}]`)!==null)return;let n=document.createElement(`style`);n.setAttribute(`data-${z}`,``),n.textContent=B,t.appendChild(n)}var _,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U;function W(){return(W=e((()=>{s(),n(),u(),r(),h(),I={paddingBlock:`--ds-card-padding-block`,paddingInline:`--ds-card-padding-inline`,partGap:`--ds-card-part-gap`,headerGap:`--ds-card-header-gap`,footerGap:`--ds-card-footer-gap`,actionsGap:`--ds-card-actions-gap`,border:`--ds-card-border`,borderWidth:`--ds-card-border-width`,radius:`--ds-card-radius`,transition:`--ds-card-transition`},L={marginBlockEnd:`space.0`},R=`ds-link, ds-button, a[href], button`,z=`ds-card-hit-area`,B=`.${z}::after { content: ''; position: absolute; inset: 0; }`,V=new WeakSet,H=e=>e.hasAttribute(`disabled`)||e.getAttribute(`aria-disabled`)===`true`,new class extends d{static[class extends p{static{({e:[v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F],c:[U,_]}=c(this,[o(`ds-card`)],[[f(),1,`heading`],[f({type:String,reflect:!0,attribute:`heading-level`}),1,`headingLevel`],[f({type:String,reflect:!0}),1,`inset`],[f({type:String,reflect:!0}),1,`surface`],[f({type:Boolean,reflect:!0}),1,`interactive`],[f({type:Boolean,reflect:!0}),1,`focusable`],[f({attribute:!1}),1,`overrides`],[a(),1,`hasHeaderActions`],[a(),1,`hasFooter`]],0,void 0,p))}#e=v(this);get heading(){return this.#e}set heading(e){this.#e=e}#t=(y(this),b(this,`3`));get headingLevel(){return this.#t}set headingLevel(e){this.#t=e}#n=(x(this),S(this,`md`));get inset(){return this.#n}set inset(e){this.#n=e}#r=(C(this),w(this,`default`));get surface(){return this.#r}set surface(e){this.#r=e}#i=(T(this),E(this,!1));get interactive(){return this.#i}set interactive(e){this.#i=e}#a=(D(this),O(this,!1));get focusable(){return this.#a}set focusable(e){this.#a=e}#o=(k(this),A(this));get overrides(){return this.#o}set overrides(e){this.#o=e}#s=(j(this),M(this,!1));get hasHeaderActions(){return this.#s}set hasHeaderActions(e){this.#s=e}#c=(N(this),P(this,!1));get hasFooter(){return this.#c}set hasFooter(e){this.#c=e}internals=void F(this);hitAreaTarget=null;targetObserver=new MutationObserver(()=>this.syncTargetDisabled());ownsRole=!1;ownsLabel=!1;ownsTabindex=!1;warnedTarget=!1;warnedFocusable=!1;constructor(){super(),this.internals=this.attachInternals(),this.addEventListener(`click`,this.handleHostClick),this.addEventListener(`focusin`,this.handleFocusIn),this.addEventListener(`focusout`,this.handleFocusOut)}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Card`),this.hasHeaderActions=this.querySelector(`:scope > [slot="header-actions"]`)!==null,this.hasFooter=this.querySelector(`:scope > [slot="footer"]`)!==null,this.hitAreaTarget!==null&&this.targetObserver.observe(this.hitAreaTarget,{attributes:!0,attributeFilter:[`disabled`,`aria-disabled`]})}disconnectedCallback(){super.disconnectedCallback(),this.targetObserver.disconnect(),this.setCustomState(`target-focus`,!1)}willUpdate(e){(e.has(`overrides`)||e.has(`surface`)||e.has(`interactive`))&&this.applyOverrides(),e.has(`heading`)&&this.syncName(),(e.has(`focusable`)||e.has(`interactive`))&&this.syncTabindex()}render(){let e=!!this.heading;return m`
      <div part="surface" data-part="surface">
        <div part="header" data-part="header" ?hidden=${!e&&!this.hasHeaderActions}>
          ${e?m`<ds-heading level=${this.headingLevel} size="lg" .overrides=${L}
                >${this.heading}</ds-heading
              >`:i}
          <div part="headerActions" data-part="headerActions" ?hidden=${!this.hasHeaderActions}>
            <slot name="header-actions" @slotchange=${this.handleHeaderActionsSlotChange}></slot>
          </div>
        </div>
        <div part="body" data-part="body">
          <slot @slotchange=${this.handleBodySlotChange}></slot>
        </div>
        <div part="footer" data-part="footer" ?hidden=${!this.hasFooter}>
          <slot name="footer" @slotchange=${this.handleFooterSlotChange}></slot>
        </div>
      </div>
    `}updated(e){e.has(`interactive`)&&this.syncHitArea(e.get(`interactive`)!==void 0)}handleHeaderActionsSlotChange(e){let t=e.target.assignedNodes({flatten:!0}).length>0;this.hasHeaderActions!==t&&(this.hasHeaderActions=t)}handleFooterSlotChange(e){let t=e.target.assignedNodes({flatten:!0}).length>0;this.hasFooter!==t&&(this.hasFooter=t)}handleBodySlotChange(){this.syncHitArea(!0)}syncHitArea(e){let t=this.renderRoot.querySelector(`slot:not([name])`),[n,...r]=this.interactive&&t!==null?t.assignedElements({flatten:!0}).filter(e=>e.matches(R)):[],i=n!==void 0&&r.length===0?n:null;this.hitAreaTarget!==i&&(this.hitAreaTarget!==null&&this.hitAreaTarget.classList.remove(z),this.targetObserver.disconnect(),this.hitAreaTarget=i,i!==null&&this.targetObserver.observe(i,{attributes:!0,attributeFilter:[`disabled`,`aria-disabled`]})),i===null?(this.setCustomState(`target-focus`,!1),this.interactive&&e&&this.warnedTarget):(g(i.getRootNode()),i.classList.contains(z)||i.classList.add(z)),this.setCustomState(`has-target`,i!==null),this.syncTargetDisabled()}syncTargetDisabled(){this.setCustomState(`target-disabled`,this.hitAreaTarget!==null&&H(this.hitAreaTarget))}setCustomState(e,t){this.internals.states.has(e)!==t&&(t?this.internals.states.add(e):this.internals.states.delete(e))}handleHostClick=e=>{let t=this.hitAreaTarget;t!==null&&this.interactive&&!H(t)&&e.composedPath()[0]===t&&t.shadowRoot!==null&&t.shadowRoot.querySelector(`a[href], button`)?.click()};handleFocusIn=e=>{let t=this.hitAreaTarget,n=e.composedPath(),r=n[0];this.setCustomState(`target-focus`,this.interactive&&t!==null&&n.includes(t)&&r instanceof Element&&r.matches(`:focus-visible`))};handleFocusOut=()=>{this.setCustomState(`target-focus`,!1)};syncName(){this.heading?((!this.hasAttribute(`role`)||this.ownsRole)&&(this.getAttribute(`role`)!==`article`&&this.setAttribute(`role`,`article`),this.ownsRole=!0),(!this.hasAttribute(`aria-label`)||this.ownsLabel)&&(this.getAttribute(`aria-label`)!==this.heading&&this.setAttribute(`aria-label`,this.heading),this.ownsLabel=!0)):(this.ownsRole&&=(this.removeAttribute(`role`),!1),this.ownsLabel&&=(this.removeAttribute(`aria-label`),!1))}syncTabindex(){this.focusable&&this.interactive&&this.warnedFocusable,this.focusable&&!this.interactive?(this.getAttribute(`tabindex`)!==`-1`&&this.setAttribute(`tabindex`,`-1`),this.ownsTabindex=!0):this.ownsTabindex&&=(this.removeAttribute(`tabindex`),!1)}isInEffect(e){switch(e){case`border`:return this.surface==="default";case`borderWidth`:return this.surface==="default"&&!this.interactive;case`transition`:return this.interactive;default:return!0}}applyOverrides(){for(let e of Object.keys(I)){let t=this.overrides?.[e],n=I[e];t===void 0||!this.isInEffect(e)?this.style.removeProperty(n):this.style.setProperty(n,l(t))}}}];styles=t`
    :host {
      display: block;
      box-sizing: border-box;
      --ds-card-padding-block: var(--layout-inset-md);
      --ds-card-padding-inline: var(--layout-inset-md);
      --ds-card-part-gap: var(--layout-gap-loose);
      --ds-card-header-gap: var(--layout-gap-normal);
      --ds-card-footer-gap: var(--layout-gap-tight);
      --ds-card-actions-gap: var(--layout-gap-tight);
      --ds-card-border: var(--color-border);
      --ds-card-border-width: var(--border-width-thin);
      --ds-card-radius: var(--radius-lg);
      --ds-card-transition: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    /* paddingBlock / paddingInline: layout.inset.{inset} */
    :host([inset='sm']) {
      --ds-card-padding-block: var(--layout-inset-sm);
      --ds-card-padding-inline: var(--layout-inset-sm);
    }
    :host([inset='md']) {
      --ds-card-padding-block: var(--layout-inset-md);
      --ds-card-padding-inline: var(--layout-inset-md);
    }
    :host([inset='lg']) {
      --ds-card-padding-block: var(--layout-inset-lg);
      --ds-card-padding-inline: var(--layout-inset-lg);
    }

    [data-part='surface'] {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: var(--ds-card-part-gap);
      padding-block: var(--ds-card-padding-block);
      padding-inline: var(--ds-card-padding-inline);
      border-style: solid;
      border-width: 0;
      border-color: transparent;
      border-radius: var(--ds-card-radius);
      /* background: color.background.{surface}, locked; default drops the segment */
      background-color: var(--color-background);
    }

    :host([surface='subtle']) [data-part='surface'] {
      background-color: var(--color-background-subtle);
    }

    /* borderWidth / border: rendered only with surface default */
    :host([surface='default']) [data-part='surface'] {
      border-width: var(--ds-card-border-width);
      border-color: var(--ds-card-border);
    }

    /* headerGap: layout.gap.normal, between the heading and headerActions */
    [data-part='header'] {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--ds-card-header-gap);
      min-inline-size: 0;
    }

    /* actionsGap: layout.gap.tight, between the headerActions controls */
    [data-part='headerActions'] {
      display: flex;
      align-items: center;
      gap: var(--ds-card-actions-gap);
      flex: 0 0 auto;
      margin-inline-start: auto;
    }

    [data-part='body'] {
      display: block;
      min-inline-size: 0;
    }

    /* footerGap: layout.gap.tight, between footer actions */
    [data-part='footer'] {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--ds-card-footer-gap);
    }

    [hidden] {
      display: none;
    }

    /*
     * interactive: position context for the slotted target's ::after. The card always reserves
     * border.width.focus so the ring never shifts the layout; at rest that border is the card's
     * border on surface default and transparent on subtle.
     */
    :host([interactive]) {
      position: relative;
    }
    :host([interactive]) [data-part='surface'] {
      border-width: var(--border-width-focus);
      border-color: var(--ds-card-border);
      transition:
        background-color var(--ds-card-transition) var(--motion-easing-standard),
        border-color var(--ds-card-transition) var(--motion-easing-standard);
    }
    :host([interactive][surface='subtle']) [data-part='surface'] {
      border-color: transparent;
    }
    /* Header actions and footer controls keep their own targets above the extended hit area. */
    :host([interactive]) [data-part='headerActions'],
    :host([interactive]) [data-part='footer'] {
      position: relative;
      z-index: 1;
    }

    /* hoverBackground: color.background.subtle, locked; subtle cards use color.background.strong. Only with a live target. */
    :host([interactive]:state(has-target):not(:state(target-disabled)):hover) [data-part='surface'] {
      background-color: var(--color-background-subtle);
    }
    :host([interactive][surface='subtle']:state(has-target):not(:state(target-disabled)):hover) [data-part='surface'] {
      background-color: var(--color-background-strong);
    }

    /* focusRing: locked; drawn on the card only while its target has keyboard focus */
    :host([interactive]:state(target-focus)) [data-part='surface'] {
      border-color: var(--color-border-focus);
    }

    /* focusable: scripted focus only; an outline of focusRingWidth in focusRing, no offset */
    :host([focusable]:not([interactive])) {
      outline: none;
    }
    :host([focusable]:not([interactive]):focus-visible) [data-part='surface'] {
      /* no outline-offset: the ring sits on the card's edge */
      outline: var(--border-width-focus) solid var(--color-border-focus);
    }

    @media (prefers-reduced-motion: reduce) {
      :host([interactive]) [data-part='surface'] {
        transition: none;
      }
    }
  `;constructor(){super(U),_()}}})))()}export{W as t};