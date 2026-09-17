import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{O as t,_ as n,a as r,f as i,g as a,h as o,i as s,o as c,p as l,u,v as d}from"./if-defined-CARySXJh.js";import{i as f,n as p,t as m}from"./static-html-C_poBzD8.js";function h(e){if(e==null)return;let t=String(e);return Object.prototype.hasOwnProperty.call(E,t)?t:void 0}var g,_,v,y,b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{a(),n(),c(),m(),r(),T={fontFamily:`--ds-heading-font-family`,fontWeight:`--ds-heading-font-weight`,fontSize:`--ds-heading-font-size`,lineHeight:`--ds-heading-line-height`,marginBlockEnd:`--ds-heading-margin-block-end`},E={1:p`h1`,2:p`h2`,3:p`h3`,4:p`h4`,5:p`h5`,6:p`h6`},D=`2`,new class extends l{static[class extends d{static{({e:[_,v,y,b,x,S,C,w],c:[O,g]}=o(this,[i(`ds-heading`)],[[u({type:String,reflect:!0}),1,`level`],[u({type:String,reflect:!0}),1,`size`],[u({type:String,reflect:!0}),1,`align`],[u({attribute:!1}),1,`overrides`]],0,void 0,d))}#e=_(this);get level(){return this.#e}set level(e){this.#e=e}#t=(v(this),y(this));get size(){return this.#t}set size(e){this.#t=e}#n=(b(this),x(this,`start`));get align(){return this.#n}set align(e){this.#n=e}#r=(S(this),C(this));get overrides(){return this.#r}set overrides(e){this.#r=e}warnedMissingLevel=(w(this),!1);connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Heading`)}willUpdate(e){e.has(`overrides`)&&this.applyOverrides()}render(){let e=E[h(this.level)??D];return f`<${e} part="text" data-part="text"><slot></slot></${e}>`}applyOverrides(){for(let e of Object.keys(T)){let t=this.overrides?.[e],n=T[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,s(t))}}}];styles=t`
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

    [data-part='text'] {
      /* marginBlockEnd: space.sm — the one margin the system allows, because a
         heading owns the gap to its own first paragraph. */
      margin-block: 0 var(--ds-heading-margin-block-end);
      margin-inline: 0;
      font-family: var(--ds-heading-font-family);
      font-weight: var(--ds-heading-font-weight);
      font-size: var(--ds-heading-font-size);
      line-height: var(--ds-heading-line-height);
      /* color: color.foreground.strong, locked (AAA against color.background) — no override hook */
      color: var(--color-foreground-strong);
      text-align: start;
    }

    /* fontSize: font.size.{size}, defaulted per level */
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

    /* fontSize: an explicit size wins over the level default (same specificity, later rule) */
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

    :host([align='start']) [data-part='text'] {
      text-align: start;
    }
    :host([align='center']) [data-part='text'] {
      text-align: center;
    }
    :host([align='end']) [data-part='text'] {
      text-align: end;
    }
  `;constructor(){super(O),g()}}})))()}export{k as t};