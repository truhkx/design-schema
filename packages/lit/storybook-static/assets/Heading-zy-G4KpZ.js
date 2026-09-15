import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{C as t,a as n,c as r,d as i,f as a,p as o,s,t as c,u as l}from"./decorators-BlUBDG4K.js";import{a as u,i as d}from"./if-defined-BfpvQ5_i.js";import{i as f,n as p,t as m}from"./static-html-BoBPE1hr.js";function h(e){return typeof e==`string`&&Object.prototype.hasOwnProperty.call(E,e)}var g,_,v,y,b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{i(),a(),c(),m(),u(),T={fontFamily:`--ds-heading-font-family`,fontWeight:`--ds-heading-font-weight`,fontSize:`--ds-heading-font-size`,lineHeight:`--ds-heading-line-height`,marginBlockEnd:`--ds-heading-margin-block-end`},E={1:p`h1`,2:p`h2`,3:p`h3`,4:p`h4`,5:p`h5`,6:p`h6`},new class extends r{static[class extends o{static{({e:[_,v,y,b,x,S,C,w],c:[D,g]}=l(this,[s(`ds-heading`)],[[n({reflect:!0}),1,`level`],[n({reflect:!0}),1,`size`],[n({reflect:!0}),1,`align`],[n({attribute:!1}),1,`overrides`]],0,void 0,o))}constructor(...e){super(...e),w(this)}#e=_(this);get level(){return this.#e}set level(e){this.#e=e}#t=(v(this),y(this));get size(){return this.#t}set size(e){this.#t=e}#n=(b(this),x(this,`start`));get align(){return this.#n}set align(e){this.#n=e}#r=(S(this),C(this));get overrides(){return this.#r}set overrides(e){this.#r=e}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Heading`)}willUpdate(e){e.has(`overrides`)&&this.applyOverrides()}render(){let e=h(this.level)?E[this.level]:E[2];return f`<${e} class="heading" part="heading"><slot></slot></${e}>`}applyOverrides(){for(let e of Object.keys(T)){let t=this.overrides?.[e],n=T[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,d(t))}}}];styles=t`
    :host {
      display: block;
      --ds-heading-font-family: var(--font-family-heading);
      --ds-heading-font-weight: var(--font-weight-semibold);
      --ds-heading-font-size: var(--font-size-3xl);
      --ds-heading-line-height: var(--font-line-height-tight);
      --ds-heading-margin-block-end: var(--space-sm);
    }

    :host([hidden]) {
      display: none;
    }

    .heading {
      margin-block: 0 var(--ds-heading-margin-block-end);
      margin-inline: 0;
      font-family: var(--ds-heading-font-family);
      font-weight: var(--ds-heading-font-weight);
      font-size: var(--ds-heading-font-size);
      line-height: var(--ds-heading-line-height);
      /* color: color.foreground.strong, locked — no override hook */
      color: var(--color-foreground-strong);
      text-align: start;
    }

    /* fontSize: font.size.{size} default per level */
    :host([level='1']) {
      --ds-heading-font-size: var(--font-size-4xl);
    }
    :host([level='2']) {
      --ds-heading-font-size: var(--font-size-3xl);
    }
    :host([level='3']) {
      --ds-heading-font-size: var(--font-size-2xl);
    }
    :host([level='4']) {
      --ds-heading-font-size: var(--font-size-xl);
    }
    :host([level='5']) {
      --ds-heading-font-size: var(--font-size-lg);
    }
    :host([level='6']) {
      --ds-heading-font-size: var(--font-size-md);
    }

    /* fontSize: an explicit size wins over the level default */
    :host([size='4xl']) {
      --ds-heading-font-size: var(--font-size-4xl);
    }
    :host([size='3xl']) {
      --ds-heading-font-size: var(--font-size-3xl);
    }
    :host([size='2xl']) {
      --ds-heading-font-size: var(--font-size-2xl);
    }
    :host([size='xl']) {
      --ds-heading-font-size: var(--font-size-xl);
    }
    :host([size='lg']) {
      --ds-heading-font-size: var(--font-size-lg);
    }
    :host([size='md']) {
      --ds-heading-font-size: var(--font-size-md);
    }

    :host([align='start']) .heading {
      text-align: start;
    }
    :host([align='center']) .heading {
      text-align: center;
    }
    :host([align='end']) .heading {
      text-align: end;
    }
  `;constructor(){super(D),g()}}})))()}export{O as t};