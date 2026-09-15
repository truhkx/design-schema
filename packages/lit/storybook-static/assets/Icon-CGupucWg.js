import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{C as t,a as n,c as r,d as i,f as a,p as o,s,t as c,u as l,y as u}from"./decorators-BlUBDG4K.js";import{a as d,i as f,r as p,t as m}from"./if-defined-BfpvQ5_i.js";var h,g,_,v,y,b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{i(),a(),c(),m(),d(),E={size:`--ds-icon-size`,color:`--ds-icon-color`,strokeWidth:`--ds-icon-stroke-width`},D={check:u`<path d="M3 8.5l3.5 3.5L13 5" />`,dash:u`<path d="M4 8h8" />`,"chevron-right":u`<path d="M6 3l5 5-5 5" />`,"chevron-down":u`<path d="M3 6l5 5 5-5" />`,"chevron-up":u`<path d="M3 10l5-5 5 5" />`,"chevron-left":u`<path d="M10 3L5 8l5 5" />`,close:u`<path d="M3 3l10 10M13 3L3 13" />`,plus:u`<path d="M8 3v10M3 8h10" />`,minus:u`<path d="M3 8h10" />`,info:u`<path
    class="filled"
    d="M8 1a7 7 0 1 0 0 14A7 7 0 1 0 8 1zm0 3a1 1 0 1 0 0 2 1 1 0 1 0 0-2zM7 7h2v4.5H7z"
  />`,success:u`<path
    class="filled"
    d="M8 1a7 7 0 1 0 0 14A7 7 0 1 0 8 1zM3.9 8.6 7 11.7l5.1-5.1-1.2-1.2L7 9.3 5.1 7.4z"
  />`,warning:u`<path
    class="filled"
    d="M8 1.5 15 14H1zM7 5.5h2V10H7zm1 5.5a1 1 0 1 0 0 2 1 1 0 1 0 0-2z"
  />`,danger:u`<path
    class="filled"
    d="M5 1h6l4 4v6l-4 4H5l-4-4V5zm-.6 4.6 1.2-1.2L8 6.8l2.4-2.4 1.2 1.2L9.2 8l2.4 2.4-1.2 1.2L8 9.2l-2.4 2.4-1.2-1.2L6.8 8z"
  />`,external:u`<path d="M6 3H3v10h10v-3M9 3h4v4M13 3L7 9" />`,ellipsis:u`<path
    class="filled"
    d="M1.75,8a1.25,1.25 0 1,0 2.5,0a1.25,1.25 0 1,0 -2.5,0M6.75,8a1.25,1.25 0 1,0 2.5,0a1.25,1.25 0 1,0 -2.5,0M11.75,8a1.25,1.25 0 1,0 2.5,0a1.25,1.25 0 1,0 -2.5,0"
  />`,search:u`<path d="M7 2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 1 0 0-9zM10.3 10.3L14 14" />`,"arrow-right":u`<path d="M3 8h10M9 4l4 4-4 4" />`,"arrow-left":u`<path d="M13 8H3M7 4L3 8l4 4" />`,calendar:u`<path d="M2.5 3.5h11v10h-11zM2.5 6.5h11M5.5 1.5v3M10.5 1.5v3" />`,menu:u`<path d="M2 4h12M2 8h12M2 12h12" />`,list:u`<path d="M5 4h9M5 8h9M5 12h9M2 4h.01M2 8h.01M2 12h.01" />`,grid:u`<path d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z" />`,play:u`<path class="filled" d="M4 2l10 6-10 6z" />`,pause:u`<path class="filled" d="M3 2h3v12H3zM10 2h3v12H10z" />`,folder:u`<path d="M2 13V2h5v2h7v9z" />`,file:u`<path d="M4 2h5l3 3v9H4zM9 2v3h3" />`},new class extends r{static[class extends o{static{({e:[g,_,v,y,b,x,S,C,w,T],c:[O,h]}=l(this,[s(`ds-icon`)],[[n({reflect:!0}),1,`name`],[n({reflect:!0}),1,`size`],[n({type:Boolean,reflect:!0}),1,`inline`],[n(),1,`label`],[n({attribute:!1}),1,`overrides`]],0,void 0,o))}constructor(...e){super(...e),T(this)}#e=g(this);get name(){return this.#e}set name(e){this.#e=e}#t=(_(this),v(this,`md`));get size(){return this.#t}set size(e){this.#t=e}#n=(y(this),b(this,!1));get inline(){return this.#n}set inline(e){this.#n=e}#r=(x(this),S(this));get label(){return this.#r}set label(e){this.#r=e}#i=(C(this),w(this));get overrides(){return this.#i}set overrides(e){this.#i=e}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Icon`)}willUpdate(e){e.has(`overrides`)&&this.applyOverrides()}applyOverrides(){for(let e of Object.keys(E)){let t=this.overrides?.[e],n=E[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,f(t))}}render(){let e=D[this.name],t=!!this.label;return u`
      <svg
        part="glyph"
        viewBox="0 0 16 16"
        focusable="false"
        role=${p(t?`img`:void 0)}
        aria-label=${p(t?this.label:void 0)}
        aria-hidden=${p(t?void 0:`true`)}
      >
        ${e}
      </svg>
    `}}];styles=t`
    /* size: font.size.{size} via --ds-icon-size; color: currentColor, falling back to inherit so an ancestor (Button, Link, Alert) colors this icon for free */
    :host {
      display: inline-flex;
      flex-shrink: 0;
      --ds-icon-size: var(--font-size-md);
      --ds-icon-stroke-width: var(--border-width-focus);
      inline-size: var(--ds-icon-size);
      block-size: var(--ds-icon-size);
      color: var(--ds-icon-color, inherit);
    }

    :host([size='xs']) {
      --ds-icon-size: var(--font-size-xs);
    }
    :host([size='sm']) {
      --ds-icon-size: var(--font-size-sm);
    }
    :host([size='md']) {
      --ds-icon-size: var(--font-size-md);
    }
    :host([size='lg']) {
      --ds-icon-size: var(--font-size-lg);
    }
    :host([size='xl']) {
      --ds-icon-size: var(--font-size-xl);
    }

    /* inline: 1em of the surrounding text, aligned to its baseline; ignores size (and any size override) */
    :host([inline]) {
      display: inline-block;
      vertical-align: -0.125em;
      inline-size: 1em;
      block-size: 1em;
    }

    :host([hidden]) {
      display: none;
    }

    /* strokeWidth: border.width.focus, kept at that thickness at every size so line glyphs stay legible at xs */
    svg {
      display: block;
      inline-size: 100%;
      block-size: 100%;
      overflow: visible;
      fill: none;
      stroke: currentColor;
      stroke-width: var(--ds-icon-stroke-width);
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    svg > * {
      vector-effect: non-scaling-stroke;
    }

    /* filled glyphs (status shapes, ellipsis) have no stroke; each is one evenodd path whose inner mark is a hole */
    .filled {
      fill: currentColor;
      stroke: none;
      fill-rule: evenodd;
    }
  `;constructor(){super(O),h()}}})))()}export{k as t};