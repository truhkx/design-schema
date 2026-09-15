import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{C as t,a as n,c as r,d as i,f as a,p as o,r as s,s as c,t as l,u}from"./decorators-BlUBDG4K.js";import{a as d,i as f,r as p,t as m}from"./if-defined-BfpvQ5_i.js";import{i as h,n as g,t as _}from"./static-html-BoBPE1hr.js";function v(e){return typeof e==`string`&&Object.prototype.hasOwnProperty.call(L,e)}var y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R;function z(){return(z=e((()=>{i(),a(),l(),m(),_(),d(),I={fontFamily:`--ds-text-font-family`,fontSize:`--ds-text-font-size`,fontWeight:`--ds-text-font-weight`,lineHeight:`--ds-text-line-height`,color:`--ds-text-color`},L={p:g`p`,span:g`span`},new class extends r{static[class extends o{static{({e:[b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F],c:[R,y]}=u(this,[c(`ds-text`)],[[n({reflect:!0}),1,`size`],[n({reflect:!0}),1,`weight`],[n({reflect:!0}),1,`tone`],[n({reflect:!0}),1,`align`],[n({type:Boolean,reflect:!0}),1,`truncate`],[n(),1,`element`],[n({attribute:!1}),1,`overrides`],[s(),1,`fullText`]],0,void 0,o))}constructor(...e){super(...e),F(this)}#e=b(this,`md`);get size(){return this.#e}set size(e){this.#e=e}#t=(x(this),S(this,`regular`));get weight(){return this.#t}set weight(e){this.#t=e}#n=(C(this),w(this,`default`));get tone(){return this.#n}set tone(e){this.#n=e}#r=(T(this),E(this,`start`));get align(){return this.#r}set align(e){this.#r=e}#i=(D(this),O(this,!1));get truncate(){return this.#i}set truncate(e){this.#i=e}#a=(k(this),A(this,`p`));get element(){return this.#a}set element(e){this.#a=e}#o=(j(this),M(this));get overrides(){return this.#o}set overrides(e){this.#o=e}#s=(N(this),P(this,``));get fullText(){return this.#s}set fullText(e){this.#s=e}connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Text`)}willUpdate(e){e.has(`overrides`)&&this.applyOverrides(),e.has(`element`)&&(this.style.display=this.element===`span`?`contents`:`block`)}render(){let e=v(this.element)?L[this.element]:L.p,t=this.truncate&&this.fullText!==``?this.fullText:void 0;return h`<${e} class="text" part="text" title=${p(t)}
      ><slot @slotchange=${this.handleSlotChange}></slot></${e}
    >`}handleSlotChange(){this.fullText=(this.textContent??``).replace(/\s+/g,` `).trim()}applyOverrides(){for(let e of Object.keys(I)){let t=this.overrides?.[e],n=I[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,f(t))}}}];styles=t`
    :host {
      display: block;
      --ds-text-font-family: var(--font-family-body);
      --ds-text-font-size: var(--font-size-md);
      --ds-text-font-weight: var(--font-weight-regular);
      --ds-text-line-height: var(--font-line-height-normal);
      --ds-text-color: var(--color-foreground);
    }

    :host([hidden]) {
      display: none;
    }

    .text {
      margin: 0;
      padding: 0;
      font-family: var(--ds-text-font-family);
      font-size: var(--ds-text-font-size);
      font-weight: var(--ds-text-font-weight);
      line-height: var(--ds-text-line-height);
      color: var(--ds-text-color);
      text-align: start;
    }

    p.text {
      display: block;
    }
    span.text {
      display: inline;
    }

    /* fontSize: font.size.{size} */
    :host([size='xs']) {
      --ds-text-font-size: var(--font-size-xs);
    }
    :host([size='sm']) {
      --ds-text-font-size: var(--font-size-sm);
    }
    :host([size='md']) {
      --ds-text-font-size: var(--font-size-md);
    }
    :host([size='lg']) {
      --ds-text-font-size: var(--font-size-lg);
    }
    :host([size='xl']) {
      --ds-text-font-size: var(--font-size-xl);
    }

    /* fontWeight: font.weight.{weight} */
    :host([weight='regular']) {
      --ds-text-font-weight: var(--font-weight-regular);
    }
    :host([weight='medium']) {
      --ds-text-font-weight: var(--font-weight-medium);
    }
    :host([weight='semibold']) {
      --ds-text-font-weight: var(--font-weight-semibold);
    }
    :host([weight='bold']) {
      --ds-text-font-weight: var(--font-weight-bold);
    }

    /* color: color.foreground.{tone} ("default" is the bare color.foreground token) */
    :host([tone='default']) {
      --ds-text-color: var(--color-foreground);
    }
    :host([tone='strong']) {
      --ds-text-color: var(--color-foreground-strong);
    }
    :host([tone='muted']) {
      --ds-text-color: var(--color-foreground-muted);
    }
    :host([tone='danger']) {
      --ds-text-color: var(--color-foreground-danger);
    }
    :host([tone='onAction']) {
      --ds-text-color: var(--color-foreground-on-action);
    }

    :host([align='start']) .text {
      text-align: start;
    }
    :host([align='center']) .text {
      text-align: center;
    }
    :host([align='end']) .text {
      text-align: end;
    }

    /* truncate: one line with an ellipsis; the full text is exposed via title */
    :host([truncate]) .text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    :host([truncate]) span.text {
      display: inline-block;
      max-inline-size: 100%;
      vertical-align: bottom;
    }
  `;constructor(){super(R),y()}}})))()}export{z as t};