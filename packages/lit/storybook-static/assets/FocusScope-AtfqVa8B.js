import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{C as t,a as n,c as r,d as i,f as a,p as o,s,t as c,u as l,y as u}from"./decorators-BlUBDG4K.js";import{t as d}from"./query-BHY-nhsh.js";function f(e){if(!(e instanceof HTMLElement)||e.hasAttribute(`data-focus-sentinel`)||e.hasAttribute(`data-focus-scope-anchor`)||e.hasAttribute(`inert`)||e.getAttribute(`aria-hidden`)===`true`)return!1;let t=e.getAttribute(`tabindex`);return t!==null&&Number(t)<0?!1:e.matches(j)}function p(e,t){if(e.hasAttribute(`inert`)||e.getAttribute(`aria-hidden`)===`true`)return;if(f(e)&&t.push(e),e instanceof HTMLSlotElement){for(let n of e.assignedElements({flatten:!0}))p(n,t);return}let n=e.shadowRoot??e;for(let e of Array.from(n.children))p(e,t)}function m(e=document){let t=e.activeElement;return t?.shadowRoot?.activeElement?m(t.shadowRoot):t}function h(){let e=[];for(let t of Array.from(document.body.children))p(t,e);return e}var g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N;function P(){return(P=e((()=>{i(),a(),c(),j=[`a[href]`,`button:not([disabled])`,`input:not([disabled])`,`select:not([disabled])`,`textarea:not([disabled])`,`audio[controls]`,`video[controls]`,`summary`,`[contenteditable]:not([contenteditable="false"])`,`[tabindex]`].join(`,`),M=[],new class extends r{static[class extends o{static{({e:[_,v,y,b,x,S,C,w,T,E,D,O,k,A],c:[N,g]}=l(this,[s(`ds-focus-scope`)],[[n({type:Boolean,reflect:!0}),1,`trapped`],[n({attribute:`auto-focus`}),1,`autoFocus`],[n({type:Boolean,attribute:`restore-focus`}),1,`restoreFocus`],[n({type:Boolean,reflect:!0}),1,`active`],[n({attribute:!1}),1,`returnFocusTo`],[d(`[data-focus-scope-anchor]`),1,`anchorEl`],[d(`[data-focus-sentinel="start"]`),1,`startSentinelEl`]],0,void 0,o))}#e=_(this,!0);get trapped(){return this.#e}set trapped(e){this.#e=e}#t=(v(this),y(this,`first`));get autoFocus(){return this.#t}set autoFocus(e){this.#t=e}#n=(b(this),x(this,!0));get restoreFocus(){return this.#n}set restoreFocus(e){this.#n=e}#r=(S(this),C(this,!0));get active(){return this.#r}set active(e){this.#r=e}#i=(w(this),T(this));get returnFocusTo(){return this.#i}set returnFocusTo(e){this.#i=e}#a=(E(this),D(this));get anchorEl(){return this.#a}set anchorEl(e){this.#a=e}#o=(O(this),k(this));get startSentinelEl(){return this.#o}set startSentinelEl(e){this.#o=e}openerElement=(A(this),null);documentFocusableSnapshot=[];lastFocused=null;handleKeydown=e=>{if(e.key!==`Tab`||!this.trapped||!this.isEffectivelyActive())return;let t=this.getFocusableDescendants();if(t.length===0)return;let n=m(),r=t[0],i=t[t.length-1];!e.shiftKey&&n===i?(e.preventDefault(),this.dispatchEscapeAttempt(`forward`),r.focus()):e.shiftKey&&n===r&&(e.preventDefault(),this.dispatchEscapeAttempt(`backward`),i.focus())};handleDocumentFocusIn=()=>{if(!this.trapped||!this.isEffectivelyActive())return;let e=m();if(e instanceof HTMLElement&&this.scopeContains(e)){f(e)&&(this.lastFocused=e);return}(this.lastFocused??this.getFocusableDescendants()[0]??null)?.focus()};handleSentinelFocus=e=>{if(!this.trapped)return;let t=this.getFocusableDescendants();if(t.length===0){this.anchorEl.focus();return}e.target===this.startSentinelEl?t[0].focus():t[t.length-1].focus()};connectedCallback(){super.connectedCallback(),this.dataset.ds=`FocusScope`,this.openerElement=m(),this.documentFocusableSnapshot=h(),this.addEventListener(`keydown`,this.handleKeydown),document.addEventListener(`focusin`,this.handleDocumentFocusIn),M.push(this)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`keydown`,this.handleKeydown),document.removeEventListener(`focusin`,this.handleDocumentFocusIn);let e=M.indexOf(this);e!==-1&&M.splice(e,1),this.restoreFocus&&this.restoreFocusOnExit()}firstUpdated(){this.applyAutoFocus(),this.warnInDev()}render(){return u`
      <span class="visually-hidden" tabindex="-1" data-focus-scope-anchor></span>
      <span
        class="visually-hidden"
        tabindex="0"
        data-focus-sentinel="start"
        @focus=${this.handleSentinelFocus}
      ></span>
      <slot></slot>
      <span
        class="visually-hidden"
        tabindex="0"
        data-focus-sentinel="end"
        @focus=${this.handleSentinelFocus}
      ></span>
    `}applyAutoFocus(){switch(this.autoFocus){case`first`:{let[e]=this.getFocusableDescendants();(e??this.anchorEl).focus();break}case`last`:{let e=this.getFocusableDescendants();(e[e.length-1]??this.anchorEl).focus();break}case`container`:this.focus()}}restoreFocusOnExit(){let e=this.returnFocusTo;if(e&&e.isConnected&&f(e)){e.focus();return}let t=this.openerElement;if(t&&t.isConnected&&f(t)){t.focus();return}let n=this.documentFocusableSnapshot,r=t?n.indexOf(t):-1;if(r===-1)return;let i=e=>e!==t&&e.isConnected&&f(e);for(let e=r+1;e<n.length;e+=1)if(i(n[e])){n[e].focus();return}for(let e=r-1;e>=0;--e)if(i(n[e])){n[e].focus();return}}getFocusableDescendants(){let e=this.shadowRoot;if(!e)return[];let t=[];for(let n of Array.from(e.children))p(n,t);return t}scopeContains(e){return this.contains(e)?!0:this.shadowRoot?.contains(e)??!1}isEffectivelyActive(){if(!this.active||!this.isConnected)return!1;let e=M.filter(e=>e.trapped&&e.active);return e[e.length-1]===this}dispatchEscapeAttempt(e){this.dispatchEvent(new CustomEvent(`escape-attempt`,{detail:{direction:e},bubbles:!0,composed:!0}))}warnInDev(){}}];shadowRootOptions={...o.shadowRootOptions,delegatesFocus:!0};styles=t`
    :host {
      display: block;
    }
    :host([hidden]) {
      display: none;
    }
    /* literal-ok: standard visually-hidden clip pattern, exempt from token-only rule */
    .visually-hidden {
      position: fixed;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
  `;constructor(){super(N),g()}}})))()}export{P as t};