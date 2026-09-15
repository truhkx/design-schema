import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{C as t,a as n,c as r,d as i,f as a,p as o,s,t as c,u as l,y as u}from"./decorators-BlUBDG4K.js";import{a as d,i as f}from"./if-defined-BfpvQ5_i.js";function p(e){return e instanceof Element||e instanceof Text&&e.data.trim()!==``}var m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A;function j(){return(j=e((()=>{i(),a(),c(),d(),k={gap:`--ds-stack-gap`},new class extends r{static[class extends o{static{({e:[h,g,_,v,y,b,x,S,C,w,T,E,D,O],c:[A,m]}=l(this,[s(`ds-stack`)],[[n({reflect:!0}),1,`direction`],[n({reflect:!0}),1,`gap`],[n({reflect:!0}),1,`align`],[n({reflect:!0}),1,`justify`],[n({type:Boolean,reflect:!0}),1,`wrap`],[n(),1,`element`],[n({attribute:!1}),1,`overrides`]],0,void 0,o))}#e=h(this,`vertical`);get direction(){return this.#e}set direction(e){this.#e=e}#t=(g(this),_(this,`normal`));get gap(){return this.#t}set gap(e){this.#t=e}#n=(v(this),y(this,`stretch`));get align(){return this.#n}set align(e){this.#n=e}#r=(b(this),x(this,`start`));get justify(){return this.#r}set justify(e){this.#r=e}#i=(S(this),C(this,!1));get wrap(){return this.#i}set wrap(e){this.#i=e}#a=(w(this),T(this,`div`));get element(){return this.#a}set element(e){this.#a=e}#o=(E(this),D(this));get overrides(){return this.#o}set overrides(e){this.#o=e}observer=(O(this),new MutationObserver(()=>this.requestUpdate()));connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Stack`),this.observer.observe(this,{childList:!0})}disconnectedCallback(){super.disconnectedCallback(),this.observer.disconnect()}willUpdate(e){(e.has(`overrides`)||e.has(`gap`))&&this.applyOverrides()}get items(){return Array.from(this.childNodes).filter(p)}render(){switch(this.element){case`ul`:return u`<ul part="container" role="list">
          ${this.items.map(()=>u`<li role="listitem"><slot></slot></li>`)}
        </ul>`;case`ol`:return u`<ol part="container" role="list">
          ${this.items.map(()=>u`<li role="listitem"><slot></slot></li>`)}
        </ol>`;case`nav`:return u`<nav part="container" role="navigation"><slot></slot></nav>`;case`section`:return u`<section part="container"><slot></slot></section>`;default:return u`<slot></slot>`}}updated(){this.assignSlots()}assignSlots(){let e=Array.from(this.renderRoot.querySelectorAll(`slot`)),t=this.items;if(e.length===0)return;if(this.element===`ul`||this.element===`ol`){e.forEach((e,n)=>{let r=t[n];r===void 0?e.assign():e.assign(r)});return}let[n]=e;n!==void 0&&n.assign(...t)}applyOverrides(){for(let e of Object.keys(k)){let t=this.overrides?.[e],n=k[e];t===void 0||e===`gap`&&this.gap===`none`?this.style.removeProperty(n):this.style.setProperty(n,f(t))}}}];shadowRootOptions={...o.shadowRootOptions,slotAssignment:`manual`};styles=t`
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

    /* Semantic wrappers contribute no box; the host stays the flex container. */
    section,
    nav,
    ul,
    ol,
    li {
      display: contents;
    }
  `;constructor(){super(A),m()}}})))()}export{j as t};