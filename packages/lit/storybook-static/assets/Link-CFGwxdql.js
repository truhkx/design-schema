import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{C as t,a as n,c as r,d as i,f as a,h as o,p as s,s as c,t as l,u,y as d}from"./decorators-BlUBDG4K.js";import{a as f,i as p,r as m,t as h}from"./if-defined-BfpvQ5_i.js";import{t as g}from"./Icon-CGupucWg.js";var _,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M;function N(){return(N=e((()=>{i(),a(),l(),h(),f(),g(),A=` (opens in new tab)`,j={underlineThickness:`--ds-link-underline-thickness`,underlineOffset:`--ds-link-underline-offset`,externalIconGap:`--ds-link-external-icon-gap`,transition:`--ds-link-transition`},new class extends r{static[class extends s{static{({e:[v,y,b,x,S,C,w,T,E,D,O,k],c:[M,_]}=u(this,[c(`ds-link`)],[[n(),1,`href`],[n(),1,`label`],[n({type:Boolean,reflect:!0}),1,`external`],[n({reflect:!0}),1,`tone`],[n({type:Boolean,reflect:!0}),1,`download`],[n({attribute:!1}),1,`overrides`]],0,void 0,s))}constructor(...e){super(...e),k(this)}#e=v(this,``);get href(){return this.#e}set href(e){this.#e=e}#t=(y(this),b(this,``));get label(){return this.#t}set label(e){this.#t=e}#n=(x(this),S(this,!1));get external(){return this.#n}set external(e){this.#n=e}#r=(C(this),w(this,`default`));get tone(){return this.#r}set tone(e){this.#r=e}#i=(T(this),E(this,!1));get download(){return this.#i}set download(e){this.#i=e}#a=(D(this),O(this));get overrides(){return this.#a}set overrides(e){this.#a=e}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Link`)}willUpdate(e){e.has(`overrides`)&&this.applyOverrides()}render(){return d`
      <a
        part="anchor"
        href=${this.href}
        target=${m(this.external?`_blank`:void 0)}
        rel=${m(this.external?`noopener noreferrer`:void 0)}
        ?download=${this.download}
      >
        <span part="label">${this.label}</span>${this.external?d`<span class="visually-hidden">${A}</span
              ><ds-icon part="external-icon" name="external" inline></ds-icon>`:o}
      </a>
    `}applyOverrides(){for(let e of Object.keys(j)){let t=this.overrides?.[e],n=j[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,p(t))}}}];shadowRootOptions={...s.shadowRootOptions,delegatesFocus:!0};styles=t`
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

    a {
      /* Inherit the surrounding font so the link flows with its paragraph. */
      font: inherit;
      color: var(--color-link);
      text-decoration-line: underline;
      text-decoration-thickness: var(--ds-link-underline-thickness);
      text-underline-offset: var(--ds-link-underline-offset);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: color var(--ds-link-transition) var(--motion-easing-standard);
    }

    @media (prefers-reduced-motion: reduce) {
      a {
        transition: none;
      }
    }

    /* colorVisited: web and Lit only */
    a:visited {
      color: var(--color-link-visited);
    }

    /* colorHover: pointer hover and active state */
    a:is(:hover, :active) {
      color: var(--color-link-hover);
    }

    /* tone=inherit: takes the surrounding text color; the underline alone marks the link */
    :host([tone='inherit']) a,
    :host([tone='inherit']) a:visited,
    :host([tone='inherit']) a:is(:hover, :active) {
      color: inherit;
    }

    /* focus-visible: the ring follows the text box (inline), rounded by focusRingRadius */
    a:focus-visible {
      outline: var(--border-width-focus) solid var(--color-border-focus);
      outline-offset: var(--border-width-focus);
      border-radius: var(--radius-sm);
    }

    /* externalIcon: 1em of the surrounding font size (ds-icon's own inline sizing), never larger */
    ds-icon {
      margin-inline-start: var(--ds-link-external-icon-gap);
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
  `;constructor(){super(M),_()}}})))()}export{N as t};