import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{O as t,_ as n,a as r,c as i,f as a,g as o,h as s,i as c,o as l,p as u,r as d,t as f,u as p,v as m}from"./if-defined-CARySXJh.js";import{i as h,n as g,t as _}from"./static-html-C_poBzD8.js";function v(e){return typeof e==`string`&&Object.prototype.hasOwnProperty.call(z,e)}var y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B;function V(){return(V=e((()=>{o(),n(),l(),f(),_(),r(),R={fontFamily:`--ds-text-font-family`,fontSize:`--ds-text-font-size`,fontWeight:`--ds-text-font-weight`,lineHeight:`--ds-text-line-height`},z={p:g`p`,span:g`span`},new class extends u{static[class extends m{static{({e:[b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L],c:[B,y]}=s(this,[a(`ds-text`)],[[p({type:String,reflect:!0}),1,`size`],[p({type:String,reflect:!0}),1,`weight`],[p({type:String,reflect:!0}),1,`tone`],[p({type:String,reflect:!0}),1,`align`],[p({type:Boolean,reflect:!0}),1,`truncate`],[p({type:String,reflect:!0}),1,`element`],[p({attribute:!1}),1,`overrides`],[i(),1,`fullText`],[i(),1,`consumerTitle`]],0,void 0,m))}#e=b(this,`md`);get size(){return this.#e}set size(e){this.#e=e}#t=(x(this),S(this,`regular`));get weight(){return this.#t}set weight(e){this.#t=e}#n=(C(this),w(this,`default`));get tone(){return this.#n}set tone(e){this.#n=e}#r=(T(this),E(this,`start`));get align(){return this.#r}set align(e){this.#r=e}#i=(D(this),O(this,!1));get truncate(){return this.#i}set truncate(e){this.#i=e}#a=(k(this),A(this,`p`));get element(){return this.#a}set element(e){this.#a=e}#o=(j(this),M(this));get overrides(){return this.#o}set overrides(e){this.#o=e}#s=(N(this),P(this,``));get fullText(){return this.#s}set fullText(e){this.#s=e}#c=(F(this),I(this));get consumerTitle(){return this.#c}set consumerTitle(e){this.#c=e}textObserver=void L(this);connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Text`),this.syncFullText(),this.textObserver??=new MutationObserver(()=>this.syncFullText()),this.textObserver.observe(this,{childList:!0,characterData:!0,subtree:!0,attributes:!0,attributeFilter:[`title`]})}disconnectedCallback(){super.disconnectedCallback(),this.textObserver?.disconnect()}willUpdate(e){e.has(`overrides`)&&this.applyOverrides()}render(){let e=v(this.element)?z[this.element]:z.p,t=this.consumerTitle??(this.truncate&&this.fullText!==``?this.fullText:void 0);return h`<${e} class="text" part="text" data-part="text" title=${d(t)}
      ><slot @slotchange=${this.syncFullText}></slot></${e}
    >`}syncFullText(){let e=(this.textContent??``).replace(/\s+/g,` `).trim();e!==this.fullText&&(this.fullText=e);let t=this.getAttribute(`title`)??void 0;t!==this.consumerTitle&&(this.consumerTitle=t)}applyOverrides(){for(let e of Object.keys(R)){let t=this.overrides?.[e],n=R[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,c(t))}}}];styles=t`
    :host {
      display: block;
      --ds-text-font-family: var(--font-family-body);
      --ds-text-font-size: var(--font-size-md);
      --ds-text-font-weight: var(--font-weight-regular);
      --ds-text-line-height: var(--font-line-height-normal);
    }

    /* A span-like host gets out of the way so the inline run joins its surrounding line. */
    :host([element='span']) {
      display: contents;
    }

    .text {
      margin: 0;
      padding: 0;
      font-family: var(--ds-text-font-family);
      font-size: var(--ds-text-font-size);
      font-weight: var(--ds-text-font-weight);
      line-height: var(--ds-text-line-height);
      /* color: color.foreground.{tone}, locked — read straight from the token, no hook */
      color: var(--color-foreground);
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
    :host([tone='default']) .text {
      color: var(--color-foreground);
    }
    :host([tone='strong']) .text {
      color: var(--color-foreground-strong);
    }
    :host([tone='muted']) .text {
      color: var(--color-foreground-muted);
    }
    :host([tone='danger']) .text {
      color: var(--color-foreground-danger);
    }
    :host([tone='onAction']) .text {
      color: var(--color-foreground-on-action);
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

    /* truncate: one line with an ellipsis; the full text stays reachable as title */
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

    :host([hidden]) {
      display: none;
    }
  `;constructor(){super(B),y()}}})))()}export{V as t};