import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{O as t,_ as n,a as r,f as i,g as a,h as o,i as s,o as c,p as l,r as u,t as d,u as f,v as p,w as m}from"./if-defined-CARySXJh.js";var h,g,_,v,y,b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{a(),n(),c(),d(),r(),E={size:`--ds-icon-size`,color:`--ds-icon-color`},D={check:m`<path d="M3 8.5l3.5 3.5L13 5" />`,dash:m`<path d="M4 8h8" />`,"chevron-right":m`<path d="M6 3l5 5-5 5" />`,"chevron-down":m`<path d="M3 6l5 5 5-5" />`,"chevron-up":m`<path d="M3 10l5-5 5 5" />`,"chevron-left":m`<path d="M10 3L5 8l5 5" />`,close:m`<path d="M3 3l10 10M13 3L3 13" />`,plus:m`<path d="M8 3v10M3 8h10" />`,minus:m`<path d="M3 8h10" />`,info:m`<path
    class="filled"
    d="M8 1a7 7 0 1 0 0 14A7 7 0 1 0 8 1zm0 3a1 1 0 1 0 0 2 1 1 0 1 0 0-2zM7 7h2v4.5H7z"
  />`,success:m`<path
    class="filled"
    d="M8 1a7 7 0 1 0 0 14A7 7 0 1 0 8 1zM3.9 8.6 7 11.7l5.1-5.1-1.2-1.2L7 9.3 5.1 7.4z"
  />`,warning:m`<path class="filled" d="M8 1.5 15 14H1zM7 5.5h2V10H7zm1 5.5a1 1 0 1 0 0 2 1 1 0 1 0 0-2z" />`,danger:m`<path
    class="filled"
    d="M5 1h6l4 4v6l-4 4H5l-4-4V5zm-.6 4.6 1.2-1.2L8 6.8l2.4-2.4 1.2 1.2L9.2 8l2.4 2.4-1.2 1.2L8 9.2l-2.4 2.4-1.2-1.2L6.8 8z"
  />`,external:m`<path d="M6 3H3v10h10v-3M9 3h4v4M13 3L7 9" />`,ellipsis:m`<path
    class="filled"
    d="M1.75,8a1.25,1.25 0 1,0 2.5,0a1.25,1.25 0 1,0 -2.5,0M6.75,8a1.25,1.25 0 1,0 2.5,0a1.25,1.25 0 1,0 -2.5,0M11.75,8a1.25,1.25 0 1,0 2.5,0a1.25,1.25 0 1,0 -2.5,0"
  />`,search:m`<path d="M7 2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 1 0 0-9zM10.3 10.3L14 14" />`,"arrow-right":m`<path d="M3 8h10M9 4l4 4-4 4" />`,"arrow-left":m`<path d="M13 8H3M7 4L3 8l4 4" />`,calendar:m`<path d="M2.5 3.5h11v10h-11zM2.5 6.5h11M5.5 1.5v3M10.5 1.5v3" />`,menu:m`<path d="M2 4h12M2 8h12M2 12h12" />`,list:m`<path d="M5 4h9M5 8h9M5 12h9M2 4h.01M2 8h.01M2 12h.01" />`,grid:m`<path d="M2 2h5v5H2zM9 2h5v5H9zM2 9h5v5H2zM9 9h5v5H9z" />`,play:m`<path class="filled" d="M4 2l10 6-10 6z" />`,pause:m`<path class="filled" d="M3 2h3v12H3zM10 2h3v12H10z" />`,folder:m`<path d="M2 13V2h5v2h7v9z" />`,file:m`<path d="M4 2h5l3 3v9H4zM9 2v3h3" />`},new class extends l{static[class extends p{static{({e:[g,_,v,y,b,x,S,C,w,T],c:[O,h]}=o(this,[i(`ds-icon`)],[[f({type:String,reflect:!0}),1,`name`],[f({type:String,reflect:!0}),1,`size`],[f({type:Boolean,reflect:!0}),1,`inline`],[f({type:String}),1,`label`],[f({attribute:!1}),1,`overrides`]],0,void 0,p))}constructor(...e){super(...e),T(this)}#e=g(this);get name(){return this.#e}set name(e){this.#e=e}#t=(_(this),v(this,`md`));get size(){return this.#t}set size(e){this.#t=e}#n=(y(this),b(this,!1));get inline(){return this.#n}set inline(e){this.#n=e}#r=(x(this),S(this));get label(){return this.#r}set label(e){this.#r=e}#i=(C(this),w(this));get overrides(){return this.#i}set overrides(e){this.#i=e}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Icon`)}willUpdate(e){e.has(`overrides`)&&this.applyOverrides()}applyOverrides(){for(let e of Object.keys(E)){let t=this.overrides?.[e],n=E[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,s(t))}}render(){let e=D[this.name],t=this.label!==void 0&&this.label!==``;return m`
      <svg
        part="glyph"
        data-part="glyph"
        viewBox="0 0 16 16"
        focusable="false"
        role=${u(t?`img`:void 0)}
        aria-label=${u(t?this.label:void 0)}
        aria-hidden=${u(t?void 0:`true`)}
      >
        ${e}
      </svg>
    `}}];styles=t`
    :host {
      /* size: font.size.{size} — the em the 1em glyph box is drawn at, so the box tracks the type scale */
      --ds-icon-size: var(--font-size-md);
      /* color: currentColor, so an ancestor (Button, Link, Alert) colors this glyph for free */
      --ds-icon-color: currentColor;
      /* strokeWidth (locked): border.width.focus — the focus-ring width, so line glyphs stay legible at xs */
      --ds-icon-stroke-width: var(--border-width-focus);
      display: inline-flex;
      flex-shrink: 0;
      vertical-align: middle;
      font-size: var(--ds-icon-size);
      color: var(--ds-icon-color);
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

    /*
     * inline: 1em of the surrounding text, sitting on its baseline. Last in the cascade, so it wins
     * over the font-size above and an overrides.size entry is a no-op here, as the binding
     * documents — the hook keeps its value either way.
     */
    :host([inline]) {
      display: inline-block;
      vertical-align: -0.125em;
      font-size: inherit;
      inline-size: 1em;
      block-size: 1em;
    }

    :host([hidden]) {
      display: none;
    }

    svg {
      display: block;
      inline-size: 1em;
      block-size: 1em;
      overflow: visible;
      fill: none;
      stroke: currentColor;
      stroke-width: var(--ds-icon-stroke-width);
      stroke-linecap: round;
      stroke-linejoin: round;
    }

    /* The stroke stays the token width in screen pixels at every rendered size. */
    path {
      vector-effect: non-scaling-stroke;
    }

    /* filled glyphs have no stroke; each is one evenodd path whose inner mark is a hole */
    .filled {
      fill: currentColor;
      stroke: none;
      fill-rule: evenodd;
    }
  `;constructor(){super(O),h()}}})))()}export{k as t};