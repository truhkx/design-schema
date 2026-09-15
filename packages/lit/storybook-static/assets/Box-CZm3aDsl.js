import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{C as t,a as n,c as r,d as i,f as a,p as o,s,t as c,u as l,y as u}from"./decorators-BlUBDG4K.js";import{a as d,i as f}from"./if-defined-BfpvQ5_i.js";var p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M;function N(){return(N=e((()=>{i(),a(),c(),d(),A={article:`article`,aside:`complementary`,header:`banner`,footer:`contentinfo`,main:`main`,nav:`navigation`},j={paddingBlock:`--ds-box-padding-block`,paddingInline:`--ds-box-padding-inline`,background:`--ds-box-background`,border:`--ds-box-border`,borderWidth:`--ds-box-border-width`,radius:`--ds-box-radius`},new class extends r{static[class extends o{static{({e:[m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k],c:[M,p]}=l(this,[s(`ds-box`)],[[n({reflect:!0}),1,`inset`],[n({reflect:!0,attribute:`inset-block`}),1,`insetBlock`],[n({reflect:!0,attribute:`inset-inline`}),1,`insetInline`],[n({reflect:!0}),1,`surface`],[n({type:Boolean,reflect:!0}),1,`border`],[n({reflect:!0}),1,`radius`],[n(),1,`element`],[n({attribute:!1}),1,`overrides`]],0,void 0,o))}#e=m(this,`none`);get inset(){return this.#e}set inset(e){this.#e=e}#t=(h(this),g(this));get insetBlock(){return this.#t}set insetBlock(e){this.#t=e}#n=(_(this),v(this));get insetInline(){return this.#n}set insetInline(e){this.#n=e}#r=(y(this),b(this,`none`));get surface(){return this.#r}set surface(e){this.#r=e}#i=(x(this),S(this,!1));get border(){return this.#i}set border(e){this.#i=e}#a=(C(this),w(this,`none`));get radius(){return this.#a}set radius(e){this.#a=e}#o=(T(this),E(this,`div`));get element(){return this.#o}set element(e){this.#o=e}#s=(D(this),O(this));get overrides(){return this.#s}set overrides(e){this.#s=e}internals=void k(this);constructor(){super(),this.internals=this.attachInternals()}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Box`)}willUpdate(e){e.has(`element`)&&(this.internals.role=A[this.element]??null),e.has(`overrides`)&&this.applyOverrides()}render(){return u`<slot></slot>`}applyOverrides(){for(let e of Object.keys(j)){let t=this.overrides?.[e],n=j[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,f(t))}}}];styles=t`
    :host {
      display: block;
      box-sizing: border-box;
      --ds-box-padding-block: var(--layout-inset-none);
      --ds-box-padding-inline: var(--layout-inset-none);
      --ds-box-background: transparent;
      --ds-box-border: var(--color-border);
      --ds-box-border-width: var(--border-width-thin);
      --ds-box-radius: var(--radius-none);
      padding-block: var(--ds-box-padding-block);
      padding-inline: var(--ds-box-padding-inline);
      background: var(--ds-box-background);
      border-style: solid;
      border-width: 0;
      border-color: var(--ds-box-border);
      border-radius: var(--ds-box-radius);
    }

    :host([hidden]) {
      display: none;
    }

    /* paddingBlock/paddingInline: layout.inset.{inset} */
    :host([inset='none']) {
      --ds-box-padding-block: var(--layout-inset-none);
      --ds-box-padding-inline: var(--layout-inset-none);
    }
    :host([inset='sm']) {
      --ds-box-padding-block: var(--layout-inset-sm);
      --ds-box-padding-inline: var(--layout-inset-sm);
    }
    :host([inset='md']) {
      --ds-box-padding-block: var(--layout-inset-md);
      --ds-box-padding-inline: var(--layout-inset-md);
    }
    :host([inset='lg']) {
      --ds-box-padding-block: var(--layout-inset-lg);
      --ds-box-padding-inline: var(--layout-inset-lg);
    }
    :host([inset='xl']) {
      --ds-box-padding-block: var(--layout-inset-xl);
      --ds-box-padding-inline: var(--layout-inset-xl);
    }

    /* paddingBlock override, per axis: layout.inset.{insetBlock}. Declared after inset to win. */
    :host([inset-block='none']) {
      --ds-box-padding-block: var(--layout-inset-none);
    }
    :host([inset-block='sm']) {
      --ds-box-padding-block: var(--layout-inset-sm);
    }
    :host([inset-block='md']) {
      --ds-box-padding-block: var(--layout-inset-md);
    }
    :host([inset-block='lg']) {
      --ds-box-padding-block: var(--layout-inset-lg);
    }
    :host([inset-block='xl']) {
      --ds-box-padding-block: var(--layout-inset-xl);
    }

    /* paddingInline override, per axis: layout.inset.{insetInline}. Declared after inset to win. */
    :host([inset-inline='none']) {
      --ds-box-padding-inline: var(--layout-inset-none);
    }
    :host([inset-inline='sm']) {
      --ds-box-padding-inline: var(--layout-inset-sm);
    }
    :host([inset-inline='md']) {
      --ds-box-padding-inline: var(--layout-inset-md);
    }
    :host([inset-inline='lg']) {
      --ds-box-padding-inline: var(--layout-inset-lg);
    }
    :host([inset-inline='xl']) {
      --ds-box-padding-inline: var(--layout-inset-xl);
    }

    /* background: color.background.{surface}; none renders transparent. */
    :host([surface='none']) {
      --ds-box-background: transparent;
    }
    :host([surface='default']) {
      --ds-box-background: var(--color-background);
    }
    :host([surface='subtle']) {
      --ds-box-background: var(--color-background-subtle);
    }
    :host([surface='strong']) {
      --ds-box-background: var(--color-background-strong);
    }

    /* border / borderWidth: color.border, border.width.thin. A thin default border, only when present. */
    :host([border]) {
      border-width: var(--ds-box-border-width);
    }

    /* radius: radius.{radius} */
    :host([radius='none']) {
      --ds-box-radius: var(--radius-none);
    }
    :host([radius='sm']) {
      --ds-box-radius: var(--radius-sm);
    }
    :host([radius='md']) {
      --ds-box-radius: var(--radius-md);
    }
    :host([radius='lg']) {
      --ds-box-radius: var(--radius-lg);
    }
    :host([radius='full']) {
      --ds-box-radius: var(--radius-full);
    }
  `;constructor(){super(M),p()}}})))()}export{N as t};