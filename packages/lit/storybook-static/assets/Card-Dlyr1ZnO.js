import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{C as t,a as n,c as r,d as i,f as a,h as o,p as s,s as c,t as l,u,y as d}from"./decorators-BlUBDG4K.js";import{a as f,i as p}from"./if-defined-BfpvQ5_i.js";import{t as m}from"./Heading-zy-G4KpZ.js";import{t as h}from"./Stack-CZSvFm0E.js";function g(e){if(I.has(e))return;I.add(e);let t=e instanceof Document?e.head:e;if(t.querySelector(`style[data-${P}]`)!==null)return;let n=document.createElement(`style`);n.setAttribute(`data-${P}`,``),n.textContent=F,t.appendChild(n)}var _,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L;function R(){return(R=e((()=>{i(),a(),l(),f(),m(),h(),M={paddingBlock:`--ds-card-padding-block`,paddingInline:`--ds-card-padding-inline`,partGap:`--ds-card-part-gap`,headerGap:`--ds-card-header-gap`,footerGap:`--ds-card-footer-gap`,actionsGap:`--ds-card-actions-gap`,border:`--ds-card-border`,borderWidth:`--ds-card-border-width`,radius:`--ds-card-radius`,hoverBackground:`--ds-card-hover-background`,transition:`--ds-card-transition`},N=`ds-link, ds-button, a[href], button`,P=`ds-card-hit-area`,F=`.${P} { position: relative; } .${P}::after { content: ''; position: absolute; inset: 0; }`,I=new WeakSet,new class extends r{static[class extends s{static{({e:[v,y,b,x,S,C,w,T,E,D,O,k,A,j],c:[L,_]}=u(this,[c(`ds-card`)],[[n(),1,`heading`],[n({reflect:!0,attribute:`heading-level`}),1,`headingLevel`],[n({reflect:!0}),1,`inset`],[n({reflect:!0}),1,`surface`],[n({type:Boolean,reflect:!0}),1,`interactive`],[n({type:Boolean}),1,`focusable`],[n({attribute:!1}),1,`overrides`]],0,void 0,s))}#e=v(this);get heading(){return this.#e}set heading(e){this.#e=e}#t=(y(this),b(this,`3`));get headingLevel(){return this.#t}set headingLevel(e){this.#t=e}#n=(x(this),S(this,`md`));get inset(){return this.#n}set inset(e){this.#n=e}#r=(C(this),w(this,`default`));get surface(){return this.#r}set surface(e){this.#r=e}#i=(T(this),E(this,!1));get interactive(){return this.#i}set interactive(e){this.#i=e}#a=(D(this),O(this,!1));get focusable(){return this.#a}set focusable(e){this.#a=e}#o=(k(this),A(this));get overrides(){return this.#o}set overrides(e){this.#o=e}internals=void j(this);hitAreaTarget=null;constructor(){super(),this.internals=this.attachInternals()}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Card`)}willUpdate(e){e.has(`overrides`)&&this.applyOverrides(),e.has(`focusable`)&&(this.focusable?this.setAttribute(`tabindex`,`-1`):this.removeAttribute(`tabindex`))}render(){let e=!!this.heading,t=this.querySelector(`[slot="header-actions"]`)!==null,n=e||t,r=this.querySelector(`[slot="footer"]`)!==null;return d`
      <div class="surface" part="surface">
        ${n?d`
              <ds-stack
                part="header"
                direction="horizontal"
                justify="between"
                align="center"
                style="gap: var(--ds-card-header-gap)"
              >
                ${e?d`<ds-heading id="heading" part="heading" level=${this.headingLevel} size="md"
                      >${this.heading}</ds-heading
                    >`:o}
                <slot name="header-actions" part="header-actions"></slot>
              </ds-stack>
            `:o}
        <div class="body" part="body">
          <slot @slotchange=${this.handleDefaultSlotChange}></slot>
        </div>
        ${r?d`
              <ds-stack part="footer" direction="horizontal" style="gap: var(--ds-card-footer-gap)">
                <slot name="footer"></slot>
              </ds-stack>
            `:o}
      </div>
    `}updated(e){if(this.syncInternals(),e.has(`interactive`)){let e=this.renderRoot.querySelector(`slot:not([name])`);e!==null&&(this.interactive?this.syncHitArea(e):this.hitAreaTarget!==null&&(this.hitAreaTarget.classList.remove(P),this.hitAreaTarget=null))}}handleDefaultSlotChange(e){this.interactive&&this.syncHitArea(e.target)}syncHitArea(e){let t=e.assignedElements({flatten:!0}).filter(e=>e.matches(N));this.hitAreaTarget!==null&&(this.hitAreaTarget.classList.remove(P),this.hitAreaTarget=null);let[n,...r]=t;n!==void 0&&r.length===0&&(g(this.getRootNode()),n.classList.add(P),this.hitAreaTarget=n)}syncInternals(){let e=!!this.heading;this.internals.role=e?`article`:null;let t=this.internals;if(`ariaLabelledByElements`in t){let n=e?this.renderRoot.querySelector(`#heading`):null;t.ariaLabelledByElements=n?[n]:null}}applyOverrides(){for(let e of Object.keys(M)){let t=this.overrides?.[e],n=M[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,p(t))}}}];styles=t`
    :host {
      display: block;
      box-sizing: border-box;
      font-family: var(--font-family-body);
      --ds-card-padding-block: var(--layout-inset-md);
      --ds-card-padding-inline: var(--layout-inset-md);
      --ds-card-part-gap: var(--layout-gap-loose);
      --ds-card-header-gap: var(--layout-gap-normal);
      --ds-card-footer-gap: var(--layout-gap-tight);
      --ds-card-actions-gap: var(--layout-gap-tight);
      --ds-card-border: var(--color-border);
      --ds-card-border-width: var(--border-width-thin);
      --ds-card-radius: var(--radius-lg);
      --ds-card-hover-background: var(--color-background-subtle);
      --ds-card-transition: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    /* paddingBlock/paddingInline: layout.inset.{inset} */
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

    /* hoverBackground: color.background.subtle; a subtle surface hovers one step up, to color.background.strong */
    :host([surface='subtle']) {
      --ds-card-hover-background: var(--color-background-strong);
    }

    .surface {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: var(--ds-card-part-gap);
      padding-block: var(--ds-card-padding-block);
      padding-inline: var(--ds-card-padding-inline);
      border-style: solid;
      border-width: 0;
      border-color: var(--ds-card-border);
      border-radius: var(--ds-card-radius);
      /* background: color.background.{surface}, locked — no override hook */
      background: var(--color-background);
      transition: background-color var(--ds-card-transition) var(--motion-easing-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      .surface {
        transition: none;
      }
    }

    /* background: color.background.{surface}, locked */
    :host([surface='subtle']) .surface {
      background: var(--color-background-subtle);
    }

    /* borderWidth: rendered only with surface default — the calm option; subtle has no border */
    :host([surface='default']) .surface {
      border-width: var(--ds-card-border-width);
    }

    /* interactive: position context for the slotted link/button's extending hit area (see ensureHitAreaStyle) */
    :host([interactive]) {
      position: relative;
    }
    :host([interactive]) .surface {
      cursor: pointer;
    }
    :host([interactive]) .surface:hover {
      background: var(--ds-card-hover-background);
    }

    /* focusRing/focusRingWidth: color.border.focus, border.width.focus, locked. Drawn on the card, never a second tab stop. */
    :host([interactive]:focus-within) .surface {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    /* focusable: scripted focus only (tabindex="-1"); the card draws its own ring via :focus-visible. */
    :host(:focus-visible) .surface {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
    }

    .body {
      min-inline-size: 0;
    }

    /* actionsGap: layout.gap.tight, between the (at most two) header-actions controls */
    slot[name='header-actions'] {
      display: flex;
      align-items: center;
      gap: var(--ds-card-actions-gap);
    }
  `;constructor(){super(L),_()}}})))()}export{R as t};