import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{C as t,a as n,c as r,d as i,f as a,g as o,p as s,s as c,t as l,u,y as d}from"./decorators-BlUBDG4K.js";import{a as f,i as p}from"./if-defined-BfpvQ5_i.js";import{t as m}from"./Text-Dgpz9DWN.js";function h(){return F+=1,`ds-tooltip-${F}`}function g(e,t){let n=getComputedStyle(e).getPropertyValue(t).trim();return n.endsWith(`ms`)?parseFloat(n):n.endsWith(`s`)?parseFloat(n)*1e3:0}function _(e){if(B.has(e))return;B.add(e);let t=e instanceof Document?e.head:e;if(t.querySelector(`style[${R}]`)!==null)return;let n=document.createElement(`style`);n.setAttribute(R,``),n.textContent=z,t.appendChild(n)}var v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V;function H(){return(H=e((()=>{i(),a(),l(),f(),m(),j={radius:`--ds-tooltip-radius`,paddingBlock:`--ds-tooltip-padding-block`,paddingInline:`--ds-tooltip-padding-inline`,offset:`--ds-tooltip-offset`,maxWidth:`--ds-tooltip-max-width`,fontFamily:`--ds-tooltip-font-family`,fontSize:`--ds-tooltip-font-size`,lineHeight:`--ds-tooltip-line-height`,shadow:`--ds-tooltip-shadow`,layer:`--ds-tooltip-layer`,enter:`--ds-tooltip-enter`,exit:`--ds-tooltip-exit`},M=typeof HTMLElement<`u`&&typeof HTMLElement.prototype.showPopover==`function`,N=3,P=100,F=0,I=0,L=`ds-tooltip-popup`,R=`data-ds-tooltip-popup-style`,z=`
.${L} {
  position: fixed;
  inset: auto;
  box-sizing: border-box;
  margin: 0;
  padding-block: var(--ds-tooltip-padding-block);
  padding-inline: var(--ds-tooltip-padding-inline);
  border-radius: var(--ds-tooltip-radius);
  background: var(--color-inverse-surface);
  box-shadow: var(--ds-tooltip-shadow);
  max-inline-size: calc(var(--ds-tooltip-max-width) * 3);
  z-index: var(--ds-tooltip-layer);
  opacity: 0;
  pointer-events: none;
  transition:
    opacity var(--ds-tooltip-exit) var(--motion-easing-standard),
    display var(--ds-tooltip-exit) allow-discrete;
}
.${L}:popover-open {
  opacity: 1;
  pointer-events: auto;
  transition:
    opacity var(--ds-tooltip-enter) var(--motion-easing-standard),
    display var(--ds-tooltip-enter) allow-discrete;
}
@starting-style {
  .${L}:popover-open {
    opacity: 0;
  }
}
.${L}[hidden] {
  display: none;
}
@media (prefers-reduced-motion: reduce) {
  .${L} {
    transition: none;
  }
}
`,B=new WeakSet,new class extends r{static[class extends s{static{({e:[y,b,x,S,C,w,T,E,D,O,k,A],c:[V,v]}=u(this,[c(`ds-tooltip`)],[[n(),1,`content`],[n({reflect:!0}),1,`placement`],[n({type:Boolean,reflect:!0}),1,`describes`],[n(),1,`delay`],[n({type:Boolean}),1,`open`],[n({attribute:!1}),1,`overrides`]],0,void 0,s))}#e=y(this);get content(){return this.#e}set content(e){this.#e=e}#t=(b(this),x(this,`top`));get placement(){return this.#t}set placement(e){this.#t=e}#n=(S(this),C(this,!0));get describes(){return this.#n}set describes(e){this.#n=e}#r=(w(this),T(this,`default`));get delay(){return this.#r}set delay(e){this.#r=e}#i=(E(this),D(this));get open(){return this.#i}set open(e){this.#i=e}#a=(O(this),k(this));get overrides(){return this.#a}set overrides(e){this.#a=e}popupEl=void A(this);popupId;triggerEl=null;visible=!1;pointerOverTrigger=!1;pointerOverPopup=!1;triggerFocused=!1;showTimerId;hideGraceTimerId;connectedCallback(){super.connectedCallback(),this.setAttribute(`data-ds`,`Tooltip`),this.popupEl||(this.popupId=h(),this.popupEl=document.createElement(`div`),this.popupEl.id=this.popupId,this.popupEl.dataset.part=`popup`,this.popupEl.setAttribute(`role`,`tooltip`),this.popupEl.className=L,M?this.popupEl.setAttribute(`popover`,`manual`):this.popupEl.hidden=!0,this.popupEl.addEventListener(`pointerenter`,this.handlePopupPointerEnter),this.popupEl.addEventListener(`pointerleave`,this.handlePopupPointerLeave)),this.popupEl.isConnected||this.appendChild(this.popupEl),_(this.getRootNode()),this.renderPopupContent()}disconnectedCallback(){super.disconnectedCallback(),clearTimeout(this.showTimerId),clearTimeout(this.hideGraceTimerId),this.removeGlobalListeners()}willUpdate(e){e.has(`overrides`)&&this.applyOverrides(),(e.has(`content`)||e.has(`overrides`))&&this.renderPopupContent(),e.has(`describes`)&&this.updateTriggerAria()}updated(e){e.has(`open`)&&(this.open?this.showPopup():this.open===!1&&this.hidePopup()),this.visible&&e.has(`placement`)&&this.updatePosition(),this.warnInDev()}render(){return d`<slot @slotchange=${this.handleSlotChange}></slot>`}handleSlotChange=e=>{let t=e.target.assignedElements({flatten:!0}).filter(e=>e!==this.popupEl)[0]??null;if(t===this.triggerEl){this.updateTriggerAria();return}this.detachTrigger(),this.triggerEl=t,this.attachTrigger(),this.open&&this.showPopup()};attachTrigger(){let e=this.triggerEl;e&&(e.addEventListener(`pointerenter`,this.handleTriggerPointerEnter),e.addEventListener(`pointerleave`,this.handleTriggerPointerLeave),e.addEventListener(`focus`,this.handleTriggerFocus),e.addEventListener(`blur`,this.handleTriggerBlur),e.addEventListener(`keydown`,this.handleTriggerKeydown),this.updateTriggerAria(),this.warnInDev())}detachTrigger(){let e=this.triggerEl;e&&(e.removeEventListener(`pointerenter`,this.handleTriggerPointerEnter),e.removeEventListener(`pointerleave`,this.handleTriggerPointerLeave),e.removeEventListener(`focus`,this.handleTriggerFocus),e.removeEventListener(`blur`,this.handleTriggerBlur),e.removeEventListener(`keydown`,this.handleTriggerKeydown),e.removeAttribute(`aria-describedby`),e.removeAttribute(`aria-labelledby`),this.hidePopup())}updateTriggerAria(){this.triggerEl&&(this.describes?(this.triggerEl.setAttribute(`aria-describedby`,this.popupId),this.triggerEl.removeAttribute(`aria-labelledby`)):(this.triggerEl.setAttribute(`aria-labelledby`,this.popupId),this.triggerEl.removeAttribute(`aria-describedby`)))}handleTriggerPointerEnter=e=>{e.pointerType!==`touch`&&(this.pointerOverTrigger=!0,this.requestShow(!1))};handleTriggerPointerLeave=e=>{if(e.pointerType!==`touch`){if(this.pointerOverTrigger=!1,!this.visible){clearTimeout(this.showTimerId),this.showTimerId=void 0;return}this.scheduleMaybeHide()}};handleTriggerFocus=()=>{this.triggerFocused=!0,this.requestShow(!0)};handleTriggerBlur=()=>{this.triggerFocused=!1,this.hidePopup()};handleTriggerKeydown=e=>{e.key===`Escape`&&this.visible&&this.hidePopup()};handlePopupPointerEnter=()=>{this.pointerOverPopup=!0,clearTimeout(this.hideGraceTimerId)};handlePopupPointerLeave=()=>{this.pointerOverPopup=!1,this.scheduleMaybeHide()};handleReposition=()=>{this.visible&&this.updatePosition()};requestShow(e){if(this.visible)return;clearTimeout(this.showTimerId);let t=Date.now()<I;e||this.delay===`none`||t?this.showPopup():this.showTimerId=setTimeout(()=>this.showPopup(),this.computeDelayMs())}scheduleMaybeHide(){clearTimeout(this.hideGraceTimerId),this.hideGraceTimerId=setTimeout(()=>{!this.pointerOverTrigger&&!this.pointerOverPopup&&!this.triggerFocused&&this.hidePopup()},P)}computeDelayMs(){return g(this,`--motion-duration-base`)*N}showPopup(){!this.visible&&this.triggerEl&&(this.visible=!0,clearTimeout(this.showTimerId),this.showTimerId=void 0,M?this.popupEl.showPopover():this.popupEl.hidden=!1,this.updatePosition(),this.addGlobalListeners())}hidePopup(){this.visible&&(this.visible=!1,clearTimeout(this.showTimerId),clearTimeout(this.hideGraceTimerId),this.showTimerId=void 0,M?this.popupEl.matches(`:popover-open`)&&this.popupEl.hidePopover():this.popupEl.hidden=!0,this.removeGlobalListeners(),I=Date.now()+g(this,`--motion-duration-base`))}addGlobalListeners(){window.addEventListener(`scroll`,this.handleReposition,!0),window.addEventListener(`resize`,this.handleReposition)}removeGlobalListeners(){window.removeEventListener(`scroll`,this.handleReposition,!0),window.removeEventListener(`resize`,this.handleReposition)}updatePosition(){let e=this.triggerEl,t=this.popupEl;if(!e||!t)return;let n=e.getBoundingClientRect(),r=t.getBoundingClientRect(),i=document.documentElement.clientWidth,a=document.documentElement.clientHeight,o=parseFloat(getComputedStyle(this).getPropertyValue(`--ds-tooltip-offset`))||0,s=parseFloat(getComputedStyle(document.documentElement).getPropertyValue(`--layout-gutter`))||0,c=this.placement;c===`top`&&n.top-o-r.height<0?c=`bottom`:c===`bottom`&&n.bottom+o+r.height>a?c=`top`:c===`start`&&n.left-o-r.width<0?c=`end`:c===`end`&&n.right+o+r.width>i&&(c=`start`);let l,u;switch(c){case`top`:l=n.top-o-r.height,u=n.left+n.width/2-r.width/2;break;case`bottom`:l=n.bottom+o,u=n.left+n.width/2-r.width/2;break;case`start`:u=n.left-o-r.width,l=n.top+n.height/2-r.height/2;break;default:u=n.right+o,l=n.top+n.height/2-r.height/2}u=Math.min(Math.max(u,s),Math.max(s,i-r.width-s)),l=Math.min(Math.max(l,s),Math.max(s,a-r.height-s)),t.style.top=`${l}px`,t.style.left=`${u}px`}renderPopupContent(){if(!this.popupEl)return;let e={color:`color.inverse.foreground`};this.overrides?.fontFamily&&(e.fontFamily=this.overrides.fontFamily),this.overrides?.fontSize&&(e.fontSize=this.overrides.fontSize),this.overrides?.lineHeight&&(e.lineHeight=this.overrides.lineHeight),o(d`<ds-text data-part="text" size="sm" element="span" .overrides=${e}>${this.content}</ds-text>`,this.popupEl)}applyOverrides(){for(let e of Object.keys(j)){let t=this.overrides?.[e],n=j[e];t===void 0?this.style.removeProperty(n):this.style.setProperty(n,p(t))}}warnInDev(){}}];styles=t`
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
  `;constructor(){super(V),v()}}})))()}export{H as t};