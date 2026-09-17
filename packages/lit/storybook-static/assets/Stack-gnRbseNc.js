import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{O as t,_ as n,a as r,f as i,g as a,h as o,i as s,o as c,p as l,u,v as d,w as f}from"./if-defined-CARySXJh.js";function p(e){return e instanceof Element||e instanceof Text&&e.data.trim()!==``}var m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A;function j(){return(j=e((()=>{a(),n(),c(),r(),k={gap:`--ds-stack-gap`},new class extends l{static[class extends d{static{({e:[h,g,_,v,y,b,x,S,C,w,T,E,D,O],c:[A,m]}=o(this,[i(`ds-stack`)],[[u({type:String,reflect:!0}),1,`direction`],[u({type:String,reflect:!0}),1,`gap`],[u({type:String,reflect:!0}),1,`align`],[u({type:String,reflect:!0}),1,`justify`],[u({type:Boolean,reflect:!0}),1,`wrap`],[u({type:String}),1,`element`],[u({attribute:!1}),1,`overrides`]],0,void 0,d))}#e=h(this,`vertical`);get direction(){return this.#e}set direction(e){this.#e=e}#t=(g(this),_(this,`normal`));get gap(){return this.#t}set gap(e){this.#t=e}#n=(v(this),y(this,`stretch`));get align(){return this.#n}set align(e){this.#n=e}#r=(b(this),x(this,`start`));get justify(){return this.#r}set justify(e){this.#r=e}#i=(S(this),C(this,!1));get wrap(){return this.#i}set wrap(e){this.#i=e}#a=(w(this),T(this,`div`));get element(){return this.#a}set element(e){this.#a=e}#o=(E(this),D(this));get overrides(){return this.#o}set overrides(e){this.#o=e}observer=(O(this),new MutationObserver(()=>this.requestUpdate()));connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Stack`),this.observer.observe(this,{childList:!0})}disconnectedCallback(){super.disconnectedCallback(),this.observer.disconnect()}willUpdate(e){(e.has(`overrides`)||e.has(`gap`))&&this.applyOverrides()}get items(){return Array.from(this.childNodes).filter(p)}render(){switch(this.element){case`ul`:return f`<ul role="list">
          ${this.items.map(()=>f`<li role="listitem" part="item" data-part="item"><slot></slot></li>`)}
        </ul>`;case`ol`:return f`<ol role="list">
          ${this.items.map(()=>f`<li role="listitem" part="item" data-part="item"><slot></slot></li>`)}
        </ol>`;case`nav`:return f`<nav><slot></slot></nav>`;case`section`:return f`<section><slot></slot></section>`;default:return f`<slot></slot>`}}updated(){this.assignSlots()}assignSlots(){let e=Array.from(this.renderRoot.querySelectorAll(`slot`)),t=this.items;if(e.length===0)return;if(this.element===`ul`||this.element===`ol`){e.forEach((e,n)=>{let r=t[n];r===void 0?e.assign():e.assign(r)});return}let[n]=e;n!==void 0&&n.assign(...t)}applyOverrides(){for(let e of Object.keys(k)){let t=this.overrides?.[e],n=k[e];t===void 0||e===`gap`&&this.gap===`none`?this.style.removeProperty(n):this.style.setProperty(n,s(t))}}}];shadowRootOptions={...d.shadowRootOptions,slotAssignment:`manual`};styles=t`
    :host {
      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;
      align-items: stretch;
      justify-content: flex-start;
      --ds-stack-gap: var(--layout-gap-normal);
      gap: var(--ds-stack-gap);
    }

    :host([hidden]) {
      display: none;
    }

    :host([direction='vertical']) {
      flex-direction: column;
    }
    :host([direction='horizontal']) {
      flex-direction: row;
    }

    /* gap: layout.gap.{gap} */
    :host([gap='none']) {
      --ds-stack-gap: var(--layout-gap-none);
    }
    :host([gap='tight']) {
      --ds-stack-gap: var(--layout-gap-tight);
    }
    :host([gap='normal']) {
      --ds-stack-gap: var(--layout-gap-normal);
    }
    :host([gap='loose']) {
      --ds-stack-gap: var(--layout-gap-loose);
    }
    :host([gap='section']) {
      --ds-stack-gap: var(--layout-gap-section);
    }

    :host([align='start']) {
      align-items: flex-start;
    }
    :host([align='center']) {
      align-items: center;
    }
    :host([align='end']) {
      align-items: flex-end;
    }
    :host([align='stretch']) {
      align-items: stretch;
    }

    :host([justify='start']) {
      justify-content: flex-start;
    }
    :host([justify='center']) {
      justify-content: center;
    }
    :host([justify='end']) {
      justify-content: flex-end;
    }
    :host([justify='between']) {
      justify-content: space-between;
    }

    :host([wrap]) {
      flex-wrap: wrap;
    }

    /* Semantic wrappers contribute no box, so the host stays the flex container
       and the slotted children stay its flex items. Dropping the boxes also
       drops the UA list margin, padding and marker. */
    section,
    nav,
    ul,
    ol,
    li {
      display: contents;
    }
  `;constructor(){super(A),m()}}})))()}export{j as t};