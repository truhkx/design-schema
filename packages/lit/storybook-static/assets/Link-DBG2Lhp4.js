import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{O as t,_ as n,a as r,b as i,f as a,g as o,h as s,i as c,o as l,p as u,r as d,t as f,u as p,v as m,w as h}from"./if-defined-CARySXJh.js";import{t as g}from"./Icon-BHsrajXm.js";var _,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M;function N(){return(N=e((()=>{o(),n(),l(),f(),r(),g(),A=` (opens in new tab)`,j={underlineThickness:`--ds-link-underline-thickness`,underlineOffset:`--ds-link-underline-offset`,externalIconGap:`--ds-link-external-icon-gap`,transition:`--ds-link-transition`},new class extends u{static[class extends m{static{({e:[v,y,b,x,S,C,w,T,E,D,O,k],c:[M,_]}=s(this,[a(`ds-link`)],[[p(),1,`href`],[p(),1,`label`],[p({type:Boolean,reflect:!0}),1,`external`],[p({type:String,reflect:!0}),1,`tone`],[p({type:Boolean,reflect:!0}),1,`download`],[p({attribute:!1}),1,`overrides`]],0,void 0,m))}constructor(...e){super(...e),k(this)}#e=v(this,``);get href(){return this.#e}set href(e){this.#e=e}#t=(y(this),b(this,``));get label(){return this.#t}set label(e){this.#t=e}#n=(x(this),S(this,!1));get external(){return this.#n}set external(e){this.#n=e}#r=(C(this),w(this,`default`));get tone(){return this.#r}set tone(e){this.#r=e}#i=(T(this),E(this,!1));get download(){return this.#i}set download(e){this.#i=e}#a=(D(this),O(this));get overrides(){return this.#a}set overrides(e){this.#a=e}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Link`)}willUpdate(e){(e.has(`overrides`)||e.has(`external`))&&this.applyOverrides()}render(){return h`<a
      part="anchor"
      data-part="anchor"
      href=${this.href}
      target=${d(this.external?`_blank`:void 0)}
      rel=${d(this.external?`noopener noreferrer`:void 0)}
      ?download=${this.download}
      ><span part="label" data-part="label">${this.label}</span>${this.external?h`<span class="visually-hidden">${A}</span
            ><span part="externalIcon" data-part="externalIcon"><ds-icon name="external" inline></ds-icon></span>`:i}</a
    >`}applyOverrides(){for(let e of Object.keys(j)){let t=j[e],n=e===`externalIconGap`&&!this.external?void 0:this.overrides?.[e];n===void 0?this.style.removeProperty(t):this.style.setProperty(t,c(n))}}}];shadowRootOptions={...m.shadowRootOptions,delegatesFocus:!0};styles=t`
    :host {
      display: inline;
      --ds-link-underline-thickness: var(--border-width-thin);
      --ds-link-underline-offset: var(--space-1);
      --ds-link-external-icon-gap: var(--space-1);
      --ds-link-transition: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }

    [data-part='anchor'] {
      /* A link has no typography of its own: it takes the surrounding text's. */
      font: inherit;
      color: var(--color-link);
      text-decoration-line: underline;
      text-decoration-thickness: var(--ds-link-underline-thickness);
      text-underline-offset: var(--ds-link-underline-offset);
      cursor: pointer;
      transition: color var(--ds-link-transition) var(--motion-easing-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      [data-part='anchor'] {
        transition: none;
      }
    }

    /* colorVisited */
    [data-part='anchor']:visited {
      color: var(--color-link-visited);
    }

    /* colorHover: pointer hover only, not :active */
    [data-part='anchor']:hover {
      color: var(--color-link-hover);
    }

    /* tone=inherit: color, colorHover and colorVisited are not applied; the underline and icon follow currentColor */
    :host([tone='inherit']) [data-part='anchor'],
    :host([tone='inherit']) [data-part='anchor']:visited,
    :host([tone='inherit']) [data-part='anchor']:hover {
      color: inherit;
    }

    /* focusRing, focusRingWidth, focusRingRadius: the ring follows the inline text box */
    [data-part='anchor']:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
      border-radius: var(--radius-sm);
    }

    /* externalIconGap, on Link's own wrapper; the icon inside is 1em of the surrounding font (ds-icon inline) */
    [data-part='externalIcon'] {
      margin-inline-start: var(--ds-link-external-icon-gap);
    }

    .visually-hidden {
      position: absolute;
      inline-size: 1px;
      block-size: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }
  `;constructor(){super(M),_()}}})))()}export{N as t};