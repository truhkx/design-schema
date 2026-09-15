import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{C as t,a as n,c as r,d as i,f as a,p as o,s,t as c,u as l,y as u}from"./decorators-BlUBDG4K.js";import{a as d,i as f}from"./if-defined-BfpvQ5_i.js";import{t as p}from"./Text-Dgpz9DWN.js";var m,h,g,_,v,y,b,x,S,C,w,T,E;function D(){return(D=e((()=>{i(),a(),c(),d(),p(),T={color:`--ds-divider-color`,thickness:`--ds-divider-thickness`,spacing:`--ds-divider-spacing`,labelSize:`--ds-divider-label-size`,labelGap:`--ds-divider-label-gap`,fontFamily:`--ds-divider-font-family`},new class extends r{static[class extends o{static{({e:[h,g,_,v,y,b,x,S,C,w],c:[E,m]}=l(this,[s(`ds-divider`)],[[n({reflect:!0}),1,`orientation`],[n(),1,`label`],[n({type:Boolean,reflect:!0}),1,`semantic`],[n({reflect:!0}),1,`spacing`],[n({attribute:!1}),1,`overrides`]],0,void 0,o))}#e=h(this,`horizontal`);get orientation(){return this.#e}set orientation(e){this.#e=e}#t=(g(this),_(this));get label(){return this.#t}set label(e){this.#t=e}#n=(v(this),y(this,!1));get semantic(){return this.#n}set semantic(e){this.#n=e}#r=(b(this),x(this,`none`));get spacing(){return this.#r}set spacing(e){this.#r=e}#i=(S(this),C(this));get overrides(){return this.#i}set overrides(e){this.#i=e}internals=void w(this);constructor(){super(),this.internals=this.attachInternals()}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Divider`)}willUpdate(e){e.has(`overrides`)&&this.applyOverrides(),(e.has(`semantic`)||e.has(`label`)||e.has(`orientation`))&&this.syncInternals(),(e.has(`label`)||e.has(`orientation`))&&this.label&&this.orientation}get effectiveLabel(){return this.orientation===`vertical`?void 0:this.label}render(){let e=this.effectiveLabel;return e?u`
      <span class="line" part="line"></span>
      <ds-text part="label" class="label" element="span" size="sm" tone="muted">${e}</ds-text>
      <span class="line" part="line"></span>
    `:u`<span class="line" part="line"></span>`}syncInternals(){let e=this.semantic||!!this.effectiveLabel;this.internals.role=e?`separator`:null,this.internals.ariaOrientation=e?this.orientation:null,this.internals.ariaHidden=e?null:`true`}applyOverrides(){for(let e of Object.keys(T)){let t=this.overrides?.[e],n=T[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,f(t))}}}];styles=t`
    :host {
      display: flex;
      align-items: center;
      box-sizing: border-box;
      gap: var(--ds-divider-label-gap);
      margin-block: var(--ds-divider-spacing);
      --ds-divider-color: var(--color-border);
      --ds-divider-thickness: var(--border-width-thin);
      --ds-divider-spacing: var(--layout-gap-none);
      --ds-divider-label-size: var(--font-size-sm);
      --ds-divider-label-gap: var(--layout-gap-normal);
      --ds-divider-font-family: var(--font-family-body);
    }

    :host([hidden]) {
      display: none;
    }

    :host([orientation='vertical']) {
      display: inline-flex;
      flex-direction: column;
      align-self: stretch;
      margin-block: 0;
      margin-inline: var(--ds-divider-spacing);
    }

    /* spacing: layout.gap.{spacing} */
    :host([spacing='none']) {
      --ds-divider-spacing: var(--layout-gap-none);
    }
    :host([spacing='tight']) {
      --ds-divider-spacing: var(--layout-gap-tight);
    }
    :host([spacing='normal']) {
      --ds-divider-spacing: var(--layout-gap-normal);
    }
    :host([spacing='loose']) {
      --ds-divider-spacing: var(--layout-gap-loose);
    }

    /* color / thickness: color.border, border.width.thin */
    .line {
      flex: 1 1 auto;
      background: var(--ds-divider-color);
    }
    :host(:not([orientation='vertical'])) .line {
      block-size: var(--ds-divider-thickness);
    }
    :host([orientation='vertical']) .line {
      inline-size: var(--ds-divider-thickness);
    }

    /* labelSize / fontFamily forward into ds-text's own override hooks; labelColor stays on ds-text's locked tone="muted" */
    .label {
      --ds-text-font-size: var(--ds-divider-label-size);
      --ds-text-font-family: var(--ds-divider-font-family);
      white-space: nowrap;
    }
  `;constructor(){super(E),m()}}})))()}export{D as t};