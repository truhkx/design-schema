import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{O as t,_ as n,a as r,f as i,g as a,h as o,i as s,o as c,p as l,u,v as d,w as f,x as p}from"./if-defined-CARySXJh.js";import{t as m}from"./Text-BrJPDVza.js";function h(){return I+=1,`ds-tooltip-${I}`}function g(e){let t=(e.split(`,`)[0]??``).trim(),n=0;return t.endsWith(`ms`)?n=parseFloat(t):t.endsWith(`s`)&&(n=parseFloat(t)*1e3),Number.isFinite(n)?n:0}function _(e){if(!(e instanceof Document)&&!(e instanceof ShadowRoot)||H.has(e))return;H.add(e);let t=e instanceof Document?e.head:e;if(t.querySelector(`style[${B}]`)!==null)return;let n=document.createElement(`style`);n.setAttribute(B,``),n.textContent=V,t.appendChild(n)}var v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U;function W(){return(W=e((()=>{a(),n(),c(),r(),m(),j={radius:`--ds-tooltip-radius`,paddingBlock:`--ds-tooltip-padding-block`,paddingInline:`--ds-tooltip-padding-inline`,offset:`--ds-tooltip-offset`,maxWidth:`--ds-tooltip-max-width`,fontFamily:`--ds-tooltip-font-family`,fontSize:`--ds-tooltip-font-size`,lineHeight:`--ds-tooltip-line-height`,shadow:`--ds-tooltip-shadow`,layer:`--ds-tooltip-layer`,enter:`--ds-tooltip-enter`,exit:`--ds-tooltip-exit`},M=typeof HTMLElement<`u`&&typeof HTMLElement.prototype.showPopover==`function`,N=`calc(var(--motion-duration-base) * 3)`,P=`var(--motion-duration-base)`,F=`var(--motion-duration-fast)`,I=0,L=0,R=`ds-tooltip-bubble`,z=`ds-tooltip-description`,B=`data-ds-tooltip-style`,V=`
.${z} {
  /* literal-ok: standard visually-hidden clip pattern, exempt from token-only rule */
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.${R} {
  --color-foreground: var(--color-inverse-foreground);
  position: fixed;
  inset: auto;
  box-sizing: border-box;
  margin: 0;
  border: none;
  scroll-margin-top: var(--ds-tooltip-offset);
  padding-block: var(--ds-tooltip-padding-block);
  padding-inline: var(--ds-tooltip-padding-inline);
  border-radius: var(--ds-tooltip-radius);
  background: var(--color-inverse-surface);
  color: var(--color-inverse-foreground);
  box-shadow: var(--ds-tooltip-shadow);
  max-inline-size: calc(var(--ds-tooltip-max-width) * 3);
  font-family: var(--ds-tooltip-font-family);
  font-size: var(--ds-tooltip-font-size);
  line-height: var(--ds-tooltip-line-height);
  z-index: var(--ds-tooltip-layer);
  opacity: 0;
  pointer-events: none;
  transition:
    opacity var(--ds-tooltip-exit) var(--motion-easing-standard),
    display var(--ds-tooltip-exit) allow-discrete,
    overlay var(--ds-tooltip-exit) allow-discrete;
}
.${R}:popover-open,
.${R}[data-open] {
  opacity: 1;
  pointer-events: auto;
  transition:
    opacity var(--ds-tooltip-enter) var(--motion-easing-standard),
    display var(--ds-tooltip-enter) allow-discrete,
    overlay var(--ds-tooltip-enter) allow-discrete;
}
@starting-style {
  .${R}:popover-open,
  .${R}[data-open] {
    opacity: 0;
  }
}
.${R}[hidden] {
  display: none;
}
@media (prefers-reduced-motion: reduce) {
  .${R},
  .${R}:popover-open,
  .${R}[data-open] {
    transition: none;
  }
}
`,H=new WeakSet,new class extends l{static[class extends d{static{({e:[y,b,x,S,C,w,T,E,D,O,k,A],c:[U,v]}=o(this,[i(`ds-tooltip`)],[[u(),1,`content`],[u({type:String,reflect:!0}),1,`placement`],[u({type:Boolean,reflect:!0,attribute:`no-describes`,converter:{fromAttribute:e=>e===null,toAttribute:e=>e?null:``}}),1,`describes`],[u({type:String}),1,`delay`],[u({type:Boolean}),1,`open`],[u({attribute:!1}),1,`overrides`]],0,void 0,d))}#e=y(this,``);get content(){return this.#e}set content(e){this.#e=e}#t=(b(this),x(this,`top`));get placement(){return this.#t}set placement(e){this.#t=e}#n=(S(this),C(this,!0));get describes(){return this.#n}set describes(e){this.#n=e}#r=(w(this),T(this,`default`));get delay(){return this.#r}set delay(e){this.#r=e}#i=(E(this),D(this));get open(){return this.#i}set open(e){this.#i=e}#a=(O(this),k(this));get overrides(){return this.#a}set overrides(e){this.#a=e}tooltipId=(A(this),h());descriptionEl=null;bubbleEl=null;triggerEl=null;triggerLink=null;visible=!1;pointerOverTrigger=!1;pointerOverBubble=!1;triggerFocused=!1;showTimerId;hideGraceTimerId;connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Tooltip`),this.ensureLightNodes(),_(this.getRootNode()),this.renderLightContent()}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this.showTimerId),clearTimeout(this.hideGraceTimerId),this.hideBubble()}willUpdate(e){e.has(`overrides`)&&this.applyOverrides(),(e.has(`content`)||e.has(`overrides`))&&this.renderLightContent(),(e.has(`describes`)||e.has(`content`))&&this.updateTriggerAria()}updated(e){e.has(`open`)&&(this.open===!0?this.showBubble():this.open===!1&&this.hideBubble()),this.visible&&e.has(`placement`)&&this.updatePosition(),e.has(`content`)&&this.warnInDev()}render(){return f`<slot @slotchange=${this.handleSlotChange}></slot>`}get controlled(){return this.open!==void 0}ensureLightNodes(){if(!this.descriptionEl){let e=document.createElement(`span`);e.id=this.tooltipId,e.setAttribute(`role`,`tooltip`),e.className=z,this.descriptionEl=e}if(!this.bubbleEl){let e=document.createElement(`div`);e.className=R,e.setAttribute(`aria-hidden`,`true`),e.setAttribute(`data-part`,`popup`),M?e.setAttribute(`popover`,`manual`):e.hidden=!0,e.addEventListener(`pointerenter`,this.handleBubblePointerEnter),e.addEventListener(`pointerleave`,this.handleBubblePointerLeave),this.bubbleEl=e}this.descriptionEl.parentElement!==this&&this.appendChild(this.descriptionEl),this.bubbleEl.parentElement!==this&&this.appendChild(this.bubbleEl)}handleSlotChange=e=>{let t=e.target.assignedElements({flatten:!0}).filter(e=>e!==this.bubbleEl&&e!==this.descriptionEl&&e instanceof HTMLElement)[0]??null;t!==this.triggerEl&&(this.detachTrigger(),this.triggerEl=t,this.attachTrigger(),this.open===!0&&this.showBubble())};attachTrigger(){let e=this.triggerEl;e&&(e.addEventListener(`pointerenter`,this.handleTriggerPointerEnter),e.addEventListener(`pointerleave`,this.handleTriggerPointerLeave),e.addEventListener(`focusin`,this.handleTriggerFocusIn),e.addEventListener(`focusout`,this.handleTriggerFocusOut),this.updateTriggerAria(),this.warnInDev())}detachTrigger(){let e=this.triggerEl;e&&(e.removeEventListener(`pointerenter`,this.handleTriggerPointerEnter),e.removeEventListener(`pointerleave`,this.handleTriggerPointerLeave),e.removeEventListener(`focusin`,this.handleTriggerFocusIn),e.removeEventListener(`focusout`,this.handleTriggerFocusOut),this.clearTriggerLink(),this.pointerOverTrigger=!1,this.triggerFocused=!1,this.hideBubble())}updateTriggerAria(){let e=this.triggerEl;if(!e)return;let t=e.shadowRoot===null?{attribute:this.describes?`aria-describedby`:`aria-labelledby`,value:this.tooltipId}:{attribute:this.describes?`aria-description`:`aria-label`,value:this.content},n=this.triggerLink;n&&n.attribute!==t.attribute&&this.clearTriggerLink(),e.getAttribute(t.attribute)!==t.value&&e.setAttribute(t.attribute,t.value),this.triggerLink=t}clearTriggerLink(){let e=this.triggerEl,t=this.triggerLink;e&&t&&e.getAttribute(t.attribute)===t.value&&e.removeAttribute(t.attribute),this.triggerLink=null}handleTriggerPointerEnter=e=>{e.pointerType!==`touch`&&(this.pointerOverTrigger=!0,clearTimeout(this.hideGraceTimerId),this.requestShow(!1))};handleTriggerPointerLeave=e=>{if(e.pointerType!==`touch`){if(this.pointerOverTrigger=!1,!this.visible){clearTimeout(this.showTimerId),this.showTimerId=void 0;return}this.scheduleMaybeHide()}};handleTriggerFocusIn=()=>{this.triggerFocused=!0,this.requestShow(!0)};handleTriggerFocusOut=e=>{let t=e.relatedTarget;t instanceof Node&&this.triggerEl?.contains(t)||(this.triggerFocused=!1,this.controlled||this.hideBubble())};handleDocumentKeydown=e=>{e.key===`Escape`&&this.visible&&(e.stopPropagation(),e.preventDefault(),this.hideBubble())};handleBubblePointerEnter=()=>{this.pointerOverBubble=!0,clearTimeout(this.hideGraceTimerId)};handleBubblePointerLeave=()=>{this.pointerOverBubble=!1,this.scheduleMaybeHide()};handleReposition=()=>{this.visible&&this.updatePosition()};requestShow(e){this.visible||this.controlled||(clearTimeout(this.showTimerId),this.showTimerId=void 0,e||this.delay===`none`||Date.now()<L?this.showBubble():this.showTimerId=setTimeout(()=>this.showBubble(),this.resolveMs(N)))}scheduleMaybeHide(){this.controlled||(clearTimeout(this.hideGraceTimerId),this.hideGraceTimerId=setTimeout(()=>{!this.pointerOverTrigger&&!this.pointerOverBubble&&!this.triggerFocused&&this.hideBubble()},this.resolveMs(F)))}showBubble(){let e=this.bubbleEl;!this.visible&&this.triggerEl&&e&&this.isConnected&&(this.visible=!0,clearTimeout(this.showTimerId),this.showTimerId=void 0,M?e.matches(`:popover-open`)||e.showPopover():(e.hidden=!1,e.toggleAttribute(`data-open`,!0)),this.updatePosition(),window.addEventListener(`scroll`,this.handleReposition,!0),window.addEventListener(`resize`,this.handleReposition),document.addEventListener(`keydown`,this.handleDocumentKeydown,!0))}hideBubble(){if(clearTimeout(this.showTimerId),this.showTimerId=void 0,!this.visible)return;this.visible=!1,clearTimeout(this.hideGraceTimerId);let e=this.bubbleEl;e&&(M?e.matches(`:popover-open`)&&e.hidePopover():(e.toggleAttribute(`data-open`,!1),e.hidden=!0)),window.removeEventListener(`scroll`,this.handleReposition,!0),window.removeEventListener(`resize`,this.handleReposition),document.removeEventListener(`keydown`,this.handleDocumentKeydown,!0),L=Date.now()+this.resolveMs(P)}resolveMs(e){let t=this.descriptionEl;if(!t||!t.isConnected)return 0;t.style.setProperty(`transition-duration`,e);let n=g(getComputedStyle(t).transitionDuration);return t.style.removeProperty(`transition-duration`),n}updatePosition(){let e=this.triggerEl,t=this.bubbleEl;if(!e||!t)return;let n=e.getBoundingClientRect(),r=t.getBoundingClientRect(),i=document.documentElement.clientWidth,a=document.documentElement.clientHeight,o=parseFloat(getComputedStyle(t).scrollMarginTop)||0,s=getComputedStyle(e).direction===`rtl`,c=this.placement===`start`?s?`right`:`left`:this.placement===`end`?s?`left`:`right`:this.placement;c===`top`&&n.top-o-r.height<0?c=`bottom`:c===`bottom`&&n.bottom+o+r.height>a?c=`top`:c===`left`&&n.left-o-r.width<0?c=`right`:c===`right`&&n.right+o+r.width>i&&(c=`left`);let l,u;switch(c){case`top`:l=n.top-o-r.height,u=n.left+n.width/2-r.width/2;break;case`bottom`:l=n.bottom+o,u=n.left+n.width/2-r.width/2;break;case`left`:u=n.left-o-r.width,l=n.top+n.height/2-r.height/2;break;default:u=n.right+o,l=n.top+n.height/2-r.height/2}u=Math.min(Math.max(u,0),Math.max(0,i-r.width)),l=Math.min(Math.max(l,0),Math.max(0,a-r.height)),t.style.top=`${l}px`,t.style.left=`${u}px`}renderLightContent(){if(this.descriptionEl&&this.descriptionEl.textContent!==this.content&&(this.descriptionEl.textContent=this.content),!this.bubbleEl)return;let e={};this.overrides?.fontFamily&&(e.fontFamily=this.overrides.fontFamily),this.overrides?.fontSize&&(e.fontSize=this.overrides.fontSize),this.overrides?.lineHeight&&(e.lineHeight=this.overrides.lineHeight),p(f`<ds-text data-part="text" size="sm" element="span" .overrides=${e}>${this.content}</ds-text>`,this.bubbleEl)}applyOverrides(){for(let e of Object.keys(j)){let t=this.overrides?.[e],n=j[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,s(t))}}warnInDev(){}}];styles=t`
    :host {
      display: contents;
      --ds-tooltip-radius: var(--radius-sm);
      --ds-tooltip-padding-block: var(--space-1);
      --ds-tooltip-padding-inline: var(--space-2);
      --ds-tooltip-offset: var(--space-1);
      --ds-tooltip-max-width: var(--space-20);
      --ds-tooltip-font-family: var(--font-family-body);
      --ds-tooltip-font-size: var(--font-size-sm);
      --ds-tooltip-line-height: var(--font-line-height-normal);
      --ds-tooltip-shadow: var(--shadow-raised);
      --ds-tooltip-layer: var(--layer-toast);
      --ds-tooltip-enter: var(--motion-duration-fast);
      --ds-tooltip-exit: var(--motion-duration-fast);
    }

    :host([hidden]) {
      display: none;
    }
  `;constructor(){super(U),v()}}})))()}export{W as t};