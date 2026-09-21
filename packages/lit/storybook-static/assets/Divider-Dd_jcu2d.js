import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{O as t,_ as n,a as r,f as i,g as a,h as o,i as s,o as c,p as l,u,v as d,w as f}from"./if-defined-CARySXJh.js";import{t as p}from"./Text-BrJPDVza.js";var m,h,g,_,v,y,b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{a(),n(),c(),r(),p(),T={color:`--ds-divider-color`,thickness:`--ds-divider-thickness`,spacing:`--ds-divider-spacing`,labelGap:`--ds-divider-label-gap`},E=[[`labelSize`,`fontSize`],[`fontFamily`,`fontFamily`]],new class extends l{static[class extends d{static{({e:[h,g,_,v,y,b,x,S,C,w],c:[D,m]}=o(this,[i(`ds-divider`)],[[u({type:String,reflect:!0}),1,`orientation`],[u({type:String}),1,`label`],[u({type:Boolean,reflect:!0}),1,`semantic`],[u({type:String,reflect:!0}),1,`spacing`],[u({attribute:!1}),1,`overrides`]],0,void 0,d))}#e=h(this,`horizontal`);get orientation(){return this.#e}set orientation(e){this.#e=e}#t=(g(this),_(this));get label(){return this.#t}set label(e){this.#t=e}#n=(v(this),y(this,!1));get semantic(){return this.#n}set semantic(e){this.#n=e}#r=(b(this),x(this,`none`));get spacing(){return this.#r}set spacing(e){this.#r=e}#i=(S(this),C(this));get overrides(){return this.#i}set overrides(e){this.#i=e}warnedLabel=void w(this);connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Divider`)}willUpdate(e){(e.has(`semantic`)||e.has(`label`)||e.has(`orientation`))&&this.syncSemantics(),(e.has(`overrides`)||e.has(`spacing`)||e.has(`label`)||e.has(`orientation`))&&this.applyOverrides(),(e.has(`label`)||e.has(`orientation`))&&this.warnIgnoredLabel()}get effectiveLabel(){return this.orientation===`vertical`?void 0:this.label||void 0}render(){let e=this.effectiveLabel;return e===void 0?f`<span part="line" data-part="line" aria-hidden="true"></span>`:f`
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
    `}labelOverrides(){let e={},t=!1;for(let[n,r]of E){let i=this.overrides?.[n];i!==void 0&&(e[r]=i,t=!0)}return t?e:void 0}syncSemantics(){let e=this.effectiveLabel,t=this.semantic||e!==void 0;this.toggleAttribute(`data-labelled`,e!==void 0),t?(this.removeAttribute(`aria-hidden`),this.setAttribute(`role`,`separator`),this.setAttribute(`aria-orientation`,this.orientation)):(this.setAttribute(`aria-hidden`,`true`),this.removeAttribute(`role`),this.removeAttribute(`aria-orientation`)),e===void 0?this.removeAttribute(`aria-label`):this.setAttribute(`aria-label`,e)}warnIgnoredLabel(){let e=this.orientation===`vertical`&&this.label?this.label:void 0;e!==void 0&&this.warnedLabel,this.warnedLabel=e}applyOverrides(){let e=this.effectiveLabel!==void 0;for(let t of Object.keys(T)){let n=T[t];if(n===void 0)continue;let r=(t===`spacing`?this.spacing!==`none`:t!==`labelGap`||e)?this.overrides?.[t]:void 0;r===void 0?this.style.removeProperty(n):this.style.setProperty(n,s(r))}}}];styles=t`
    :host {
      --ds-divider-color: var(--color-border);
      --ds-divider-thickness: var(--border-width-thin);
      --ds-divider-label-gap: var(--layout-gap-normal);
      display: flex;
      box-sizing: border-box;
      block-size: var(--ds-divider-thickness);
      /* a one-token line is the smallest a divider may be: never let a flex parent shrink it away */
      flex-shrink: 0;
    }

    :host([hidden]) {
      display: none;
    }

    /* The host sizes the line on the cross axis; the line part paints it along the other. */
    [data-part='line'] {
      flex: 1 1 auto;
      background-color: var(--ds-divider-color);
    }

    /* stretches in a flex/grid row (block-size stays auto so align-self: stretch applies) and fills a parent with a definite height */
    :host([orientation='vertical']) {
      display: inline-flex;
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

    /* labelled (horizontal only): the host is a row of line, label, line, and the lines paint */
    :host([data-labelled]) {
      align-items: center;
      block-size: auto;
      gap: var(--ds-divider-label-gap);
    }

    :host([data-labelled]) [data-part='line'] {
      flex: 1 1 0;
      block-size: var(--ds-divider-thickness);
    }
  `;constructor(){super(D),m()}}})))()}export{O as t};