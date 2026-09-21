import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{O as t,_ as n,b as r,f as i,g as a,h as o,o as s,p as c,u as l,v as u,w as d}from"./if-defined-CARySXJh.js";import{t as f}from"./query-BHY-nhsh.js";function p(e){return!(e instanceof HTMLElement)||e.hasAttribute(`data-focus-sentinel`)||e.hasAttribute(`data-focus-scope-anchor`)||!e.matches(V)||e.matches(`:disabled`)?!1:e.getAttribute(`tabindex`)!==`-1`&&e.tabIndex>=0}function m(e){return e.hasAttribute(`inert`)||e.getAttribute(`aria-hidden`)===`true`}function h(e,t){if(m(e))return;if(p(e)&&t.push(e),e instanceof HTMLSlotElement){for(let n of e.assignedElements({flatten:!0}))h(n,t);return}let n=e.shadowRoot??e;for(let e of Array.from(n.children))h(e,t)}function g(e){let t=[];return h(e,t),t}function _(e=document){let t=e.activeElement;return t?.shadowRoot?.activeElement?_(t.shadowRoot):t}function v(e){let t=e,n=t.getRootNode();for(;n instanceof ShadowRoot;)t=n.host,n=t.getRootNode();return t}function y(e,t){let n=t;for(;n;){if(n===e)return!0;n=(n instanceof Element?n.assignedSlot:null)??(n instanceof ShadowRoot?n.host:n.parentNode)}return!1}function b(e){S(e);let t=H.findIndex(t=>y(e,t));t===-1?H.push(e):H.splice(t,0,e),C()}function x(e){S(e),C()}function S(e){let t=H.indexOf(e);t!==-1&&H.splice(t,1)}function C(){for(let e of H)e.requestUpdate()}function w(){for(let e=H.length-1;e>=0;--e){let t=H[e];if(t.active)return t}}var T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U;function W(){return(W=e((()=>{a(),n(),s(),B={fromAttribute(e){return e===null},toAttribute(e){return e?null:``}},V=[`a[href]`,`area[href]`,`button`,`input:not([type="hidden"])`,`select`,`textarea`,`summary`,`iframe`,`audio[controls]`,`video[controls]`,`[contenteditable]:not([contenteditable="false"])`,`[tabindex]`].join(`,`),H=[],new class extends c{static[class extends u{static{({e:[E,D,O,k,A,j,M,N,P,F,I,L,R,z],c:[U,T]}=o(this,[i(`ds-focus-scope`)],[[l({attribute:`no-trapped`,reflect:!0,converter:B}),1,`trapped`],[l({attribute:`auto-focus`}),1,`autoFocus`],[l({attribute:`no-restore-focus`,converter:B}),1,`restoreFocus`],[l({attribute:!1}),1,`returnFocusTo`],[l({attribute:`no-active`,reflect:!0,converter:B}),1,`active`],[f(`[data-focus-scope-anchor]`),1,`anchorEl`],[f(`[data-focus-sentinel="start"]`),1,`startSentinelEl`]],0,void 0,u))}#e=E(this,!0);get trapped(){return this.#e}set trapped(e){this.#e=e}#t=(D(this),O(this,`first`));get autoFocus(){return this.#t}set autoFocus(e){this.#t=e}#n=(k(this),A(this,!0));get restoreFocus(){return this.#n}set restoreFocus(e){this.#n=e}#r=(j(this),M(this));get returnFocusTo(){return this.#r}set returnFocusTo(e){this.#r=e}#i=(N(this),P(this,!0));get active(){return this.#i}set active(e){this.#i=e}#a=(F(this),I(this));get anchorEl(){return this.#a}set anchorEl(e){this.#a=e}#o=(L(this),R(this));get startSentinelEl(){return this.#o}set startSentinelEl(e){this.#o=e}openerElement=(z(this),null);openerMarker=null;openerAncestors=[];lastFocused=null;childrenSettled=Promise.resolve();handleKeydown=e=>{if(e.key!==`Tab`||e.defaultPrevented||e.altKey||e.ctrlKey||e.metaKey||!this.isEffective())return;let t=this.getFocusableDescendants(),n=t[0],r=t[t.length-1];if(!n||!r)return;let i=_();i===this.anchorEl?(e.preventDefault(),e.shiftKey?(this.dispatchEscapeAttempt(`backward`),r.focus()):n.focus()):!e.shiftKey&&i===r?(e.preventDefault(),this.dispatchEscapeAttempt(`forward`),n.focus()):e.shiftKey&&i===n&&(e.preventDefault(),this.dispatchEscapeAttempt(`backward`),r.focus())};handleDocumentFocusIn=()=>{let e=_();if(e instanceof HTMLElement&&y(this,e)){p(e)&&(this.lastFocused=e);return}this.isEffective()&&((this.lastFocused?.isConnected&&y(this,this.lastFocused)?this.lastFocused:null)??this.getFocusableDescendants()[0]??this.containerTarget())?.focus()};handleSentinelFocus=e=>{if(!this.isEffective())return;let t=this.getFocusableDescendants();((e.target===this.startSentinelEl?t[0]:t[t.length-1])??this.containerTarget())?.focus()};connectedCallback(){super.connectedCallback(),this.dataset.ds=`FocusScope`,this.recordOpener(),this.addEventListener(`keydown`,this.handleKeydown),document.addEventListener(`focusin`,this.handleDocumentFocusIn),b(this)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener(`keydown`,this.handleKeydown),document.removeEventListener(`focusin`,this.handleDocumentFocusIn),x(this),this.restoreFocus&&this.restoreFocusOnExit(),this.openerMarker?.remove(),this.openerMarker=null,this.openerAncestors=[],this.openerElement=null,this.lastFocused=null}firstUpdated(){this.childrenSettled=this.settleChildren().then(()=>{this.isConnected&&(this.applyAutoFocus(),this.warnInDev())})}async getUpdateComplete(){let e=await super.getUpdateComplete();return await this.childrenSettled,e}updated(e){e.has(`active`)&&e.get(`active`)===!1&&this.active?b(this):(e.has(`active`)&&e.get(`active`)!==void 0||e.has(`trapped`)&&e.get(`trapped`)!==void 0)&&C()}render(){let e=this.isEffective()?`0`:`-1`;return d`
      <span
        class="visually-hidden"
        part="scope"
        data-part="scope"
        tabindex=${this.autoFocus===`container`?`-1`:r}
        data-focus-scope-anchor
      ></span>
      <span
        class="visually-hidden"
        tabindex=${e}
        data-focus-sentinel="start"
        @focus=${this.handleSentinelFocus}
      ></span>
      <slot></slot>
      <span
        class="visually-hidden"
        tabindex=${e}
        data-focus-sentinel="end"
        @focus=${this.handleSentinelFocus}
      ></span>
    `}recordOpener(){let e=_();this.openerElement=e instanceof HTMLElement&&e!==document.body?e:null,this.openerMarker?.remove(),this.openerMarker=null,this.openerAncestors=[];let t=this.openerElement;if(t&&!y(this,t)){t.parentNode&&(this.openerMarker=document.createComment(`ds-focus-scope opener`),t.after(this.openerMarker));for(let e=t.parentElement;e&&!y(this,e);e=e.parentElement)this.openerAncestors.push(e)}}applyAutoFocus(){switch(this.autoFocus){case`first`:this.getFocusableDescendants()[0]?.focus();break;case`last`:{let e=this.getFocusableDescendants();e[e.length-1]?.focus();break}case`container`:this.anchorEl?.focus()}}containerTarget(){return this.autoFocus===`container`?this.anchorEl:null}resolveReturnTarget(){let e=this.returnFocusTo;return e instanceof HTMLElement?e:e?.value}restoreFocusOnExit(){let e=this.resolveReturnTarget();if(e?.isConnected){e.focus();return}let t=this.openerElement;if(t?.isConnected){t.focus();return}let n=this.openerMarker?.isConnected?this.openerMarker:this.openerAncestors.find(e=>e.isConnected);if(!n)return;let r=[];h(document.body,r),r.find(e=>!y(this,e)&&!!(n.compareDocumentPosition(v(e))&Node.DOCUMENT_POSITION_FOLLOWING))?.focus()}async settleChildren(){let e=((this.shadowRoot?.querySelector(`slot`))?.assignedElements({flatten:!0})??[]).flatMap(e=>[e,...Array.from(e.querySelectorAll(`*`))]);await Promise.all(e.map(e=>e.updateComplete))}getFocusableDescendants(){let e=this.shadowRoot;if(!e)return[];let t=[];for(let n of Array.from(e.children))h(n,t);return t}isEffective(){return this.trapped&&this.active&&this.isConnected&&w()===this}dispatchEscapeAttempt(e){this.dispatchEvent(new CustomEvent(`escape-attempt`,{detail:{direction:e},bubbles:!0,composed:!0}))}warnInDev(){}}];styles=t`
    :host {
      display: block;
    }
    :host([hidden]) {
      display: none;
    }
    /* literal-ok: standard visually-hidden clip pattern */
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
    .visually-hidden:focus {
      outline: none;
    }
  `;constructor(){super(U),T()}}})))()}export{W as n,g as t};