import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{O as t,_ as n,a as r,b as i,f as a,g as o,h as s,i as c,o as l,p as u,u as d,v as f,w as p}from"./if-defined-CARySXJh.js";import{t as m}from"./Text-C3do0IPT.js";var h,g,_,v,y,b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{o(),n(),l(),r(),m(),E={color:`--ds-divider-color`,thickness:`--ds-divider-thickness`,spacing:`--ds-divider-spacing`,labelSize:`--ds-divider-label-size`,labelGap:`--ds-divider-label-gap`,fontFamily:`--ds-divider-font-family`},D=[[`labelSize`,`fontSize`],[`fontFamily`,`fontFamily`]],new class extends u{static[class extends f{static{({e:[g,_,v,y,b,x,S,C,w,T],c:[O,h]}=s(this,[a(`ds-divider`)],[[d({type:String,reflect:!0}),1,`orientation`],[d({type:String}),1,`label`],[d({type:Boolean,reflect:!0}),1,`semantic`],[d({type:String,reflect:!0}),1,`spacing`],[d({attribute:!1}),1,`overrides`]],0,void 0,f))}#e=g(this,`horizontal`);get orientation(){return this.#e}set orientation(e){this.#e=e}#t=(_(this),v(this));get label(){return this.#t}set label(e){this.#t=e}#n=(y(this),b(this,!1));get semantic(){return this.#n}set semantic(e){this.#n=e}#r=(x(this),S(this,`none`));get spacing(){return this.#r}set spacing(e){this.#r=e}#i=(C(this),w(this));get overrides(){return this.#i}set overrides(e){this.#i=e}warnedLabel=void T(this);connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Divider`)}willUpdate(e){e.has(`overrides`)&&this.applyOverrides(),(e.has(`semantic`)||e.has(`label`)||e.has(`orientation`))&&this.syncSemantics(),(e.has(`label`)||e.has(`orientation`))&&this.warnIgnoredLabel()}get effectiveLabel(){return this.orientation===`vertical`?void 0:this.label||void 0}render(){let e=this.effectiveLabel;return e===void 0?i:p`
      <span part="line" data-part="line" aria-hidden="true"></span>
      <ds-text
        part="label"
        data-part="label"
        size="sm"
        tone="muted"
        element="span"
        .overrides=${this.labelOverrides()}
      >${e}</ds-text>
      <span part="line" data-part="line" aria-hidden="true"></span>
    `}labelOverrides(){let e={},t=!1;for(let[n,r]of D){let i=this.overrides?.[n];i!==void 0&&(e[r]=i,t=!0)}return t?e:void 0}syncSemantics(){let e=this.effectiveLabel,t=this.semantic||e!==void 0;this.toggleAttribute(`data-labelled`,e!==void 0),t?(this.removeAttribute(`aria-hidden`),this.setAttribute(`role`,`separator`),this.setAttribute(`aria-orientation`,this.orientation)):(this.setAttribute(`aria-hidden`,`true`),this.removeAttribute(`role`),this.removeAttribute(`aria-orientation`)),e===void 0?this.removeAttribute(`aria-label`):this.setAttribute(`aria-label`,e)}warnIgnoredLabel(){let e=this.orientation===`vertical`&&this.label?this.label:void 0;e!==void 0&&this.warnedLabel,this.warnedLabel=e}applyOverrides(){for(let e of Object.keys(E)){let t=this.overrides?.[e],n=E[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,c(t))}}}];styles=t`
    :host {
      --ds-divider-color: var(--color-border);
      --ds-divider-thickness: var(--border-width-thin);
      --ds-divider-label-size: var(--font-size-sm);
      --ds-divider-label-gap: var(--layout-gap-normal);
      --ds-divider-font-family: var(--font-family-body);
      display: block;
      box-sizing: border-box;
      block-size: var(--ds-divider-thickness);
      background-color: var(--ds-divider-color);
    }

    :host([hidden]) {
      display: none;
    }

    /* stretches in a flex/grid row (block-size stays auto so align-self: stretch applies) and fills a parent with a definite height */
    :host([orientation='vertical']) {
      display: inline-block;
      inline-size: var(--ds-divider-thickness);
      block-size: auto;
      min-block-size: 100%;
      align-self: stretch;
    }

    /* spacing: layout.gap.{spacing}; none is the off state, so the hook (and any override of it) applies only once a value is chosen */
    :host([spacing='tight']) {
      --ds-divider-spacing: var(--layout-gap-tight);
    }
    :host([spacing='normal']) {
      --ds-divider-spacing: var(--layout-gap-normal);
    }
    :host([spacing='loose']) {
      --ds-divider-spacing: var(--layout-gap-loose);
    }
    :host([spacing]:not([spacing='none'])) {
      margin-block: var(--ds-divider-spacing);
    }
    :host([orientation='vertical'][spacing]:not([spacing='none'])) {
      margin-block: 0;
      margin-inline: var(--ds-divider-spacing);
    }

    /* labelled (horizontal only): the host is a row of line, label, line */
    :host([data-labelled]) {
      display: flex;
      align-items: center;
      gap: var(--ds-divider-label-gap);
      block-size: auto;
      background-color: transparent;
    }

    [data-part='line'] {
      flex: 1 1 auto;
      block-size: var(--ds-divider-thickness);
      background-color: var(--ds-divider-color);
    }

    /* labelSize / fontFamily reach ds-text through its documented hooks (and its overrides); color and size come from tone="muted" size="sm" */
    [data-part='label'] {
      --ds-text-font-size: var(--ds-divider-label-size);
      --ds-text-font-family: var(--ds-divider-font-family);
      flex: 0 0 auto;
      white-space: nowrap;
    }
  `;constructor(){super(O),h()}}})))()}export{k as t};