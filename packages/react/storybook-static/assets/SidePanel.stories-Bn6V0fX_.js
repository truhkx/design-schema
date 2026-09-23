import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t}from"./iframe-D5pPePpr.js";import{t as n}from"./react-dom-BT06ZQro.js";import{t as r}from"./jsx-runtime-DeHZSEgm.js";import{n as i,t as ee}from"./names-szlHjJ4U.js";import{n as a,t as o}from"./Button-OQwYA6MI.js";import{n as te,t as ne}from"./Heading-IOamlp7v.js";import{n as re,t as s}from"./Text-B1hFPUay.js";import{n as c,t as ie}from"./Icon-dvwZzeX-.js";import{n as ae,t as l}from"./Link-BzpYanxW.js";import{n as u,t as d}from"./Stack-Dye9FNwJ.js";import{n as oe,t as se}from"./Box-ztJlli24.js";import{n as ce,t as f}from"./Checkbox-Za7sMM6c.js";import{n as p,t as le}from"./Landmark-DLmfK0VR.js";import{n as ue,t as de}from"./Card-CF227zQC.js";import{n as m,t as fe}from"./FocusScope-DauhWYu8.js";function pe(e){let t={};for(let n of Object.keys(e)){let r=e[n],i=S[n];r&&i&&(t[i]=ee(r))}return t}function h(e){return e.hasAttribute(`data-focus-sentinel`)||e.getAttribute(`tabindex`)===`-1`||e.tabIndex<0?!1:!e.closest(`[hidden], [inert]`)}function g(e){return e?Array.from(e.querySelectorAll(C)).filter(h):[]}function me(e,t){for(let n of g(document))if(!(n===e||e.contains(n)||t?.contains(n))&&e.compareDocumentPosition(n)&Node.DOCUMENT_POSITION_FOLLOWING)return n;return null}function he(e){let t=getComputedStyle(e).transitionDuration;return!t||t.split(`,`).every(e=>parseFloat(e)===0)}function ge(){return w+=1,document.documentElement.classList.add(`ds-side-panel-lock-scroll`),()=>{--w,w===0&&document.documentElement.classList.remove(`ds-side-panel-lock-scroll`)}}function _(e){let t=getComputedStyle(document.documentElement).getPropertyValue(e).trim();if(!t)return null;let n=document.createElement(`div`);n.setAttribute(`aria-hidden`,`true`),n.style.position=`absolute`,n.style.visibility=`hidden`,n.style.inlineSize=t,document.documentElement.appendChild(n);let r=n.getBoundingClientRect().width;return n.remove(),r>0?`${r}px`:t}function v(e){if(e===`never`||typeof window>`u`||typeof window.matchMedia!=`function`)return null;let t=_(e===`content`?`--layout-max-width-content`:`--layout-max-width-page`);return t?window.matchMedia(`(width > ${t})`):null}function _e(){return(0,b.useSyncExternalStore)(T,()=>!0,()=>!1)}function ve(e){let[t,n]=(0,b.useState)(!1);return(0,b.useLayoutEffect)(()=>{let t=v(e);if(!t){n(!1);return}let r=()=>n(t.matches);return r(),t.addEventListener(`change`,r),()=>t.removeEventListener(`change`,r)},[e]),t}function y({ref:e,trigger:t,open:n,heading:r,hideHeading:i=!1,children:ee,footer:a,side:te=`start`,width:re=`default`,persistent:s=`never`,role:c=`complementary`,modal:ae=!1,scrim:l=!0,dismissible:u=!0,swipeable:oe=!0,onOpenChange:ce,container:f,overrides:p,className:ue,style:de,...m}){let h=_e(),_=ve(s),v=ae&&!_,y=(0,b.useId)(),S=`ds-side-panel${y}-panel`,C=`ds-side-panel${y}-heading`,w=(0,b.useRef)(null),T=(0,b.useRef)(null),E=(0,b.useRef)(null),Se=(0,b.useRef)(null),D=(0,b.useRef)(null),O=(0,b.useRef)(null),k=(0,b.useRef)(null),A=(0,b.useRef)(null),j=(0,b.useRef)(null),M=(0,b.useRef)(!1),N=(0,b.useRef)(null),[P]=(0,b.useState)(()=>typeof document>`u`?null:document.createElement(`div`)),F=n!==void 0,[I,L]=(0,b.useState)(!1),R=n??I,[z,B]=(0,b.useState)(R),[V,H]=(0,b.useState)(!1),U=(0,b.useRef)(V);U.current=V,R&&!z&&B(!0);let W=_||z;(0,b.useImperativeHandle)(e,()=>W?w.current:null,[W,v]);let G=(0,b.isValidElement)(t)&&t.type!==b.Fragment;(0,b.useRef)(!1),(0,b.useRef)(!1);let K=(e,t)=>{N.current=e?null:t,F||L(e),ce?.(e,t)},q=e=>{if(R&&!_&&(!xe.has(e)||u)){if(e===`escape`&&!u){N.current=`escape`,ce?.(!1,`escape`);return}K(!1,e)}},J=(0,b.useRef)(q);J.current=q,(0,b.useLayoutEffect)(()=>{A.current=k.current?.firstElementChild??null}),(0,b.useLayoutEffect)(()=>{if(!P)return;P.className!==`ds-side-panel-host`&&(P.className=`ds-side-panel-host`);let e=_?j.current:f??document.body;if(e)return e.appendChild(P),()=>P.remove()},[P,_,f]),(0,b.useLayoutEffect)(()=>{if(!z||!v||!h)return;let e=w.current;if(!(e instanceof HTMLDialogElement))return;e.open||(typeof e.showModal==`function`&&e.isConnected?e.showModal():e.open=!0);let t=g(E.current)[0]??g(Se.current)[0]??D.current;if(t){t.focus();return}O.current?.focus()},[z,v,h]),(0,b.useLayoutEffect)(()=>{if(!z||!R||_||!h)return;let e=requestAnimationFrame(()=>H(!0));return()=>cancelAnimationFrame(e)},[z,R,_,v,h]),(0,b.useEffect)(()=>{R&&(N.current=null)},[R]);let Y=(0,b.useRef)(R);(0,b.useEffect)(()=>{let e=Y.current;if(Y.current=R,!e||R||_||v||!P||N.current===`navigation`)return;let t=document.activeElement;(t===null||t===document.body||t&&P.contains(t))&&A.current?.focus()},[R,_,v,P]),(0,b.useEffect)(()=>{if(R||!z||_)return;let e=U.current;H(!1);let t=T.current,n=()=>{let e=w.current;e instanceof HTMLDialogElement&&e.open&&(typeof e.close==`function`?e.close():e.open=!1),B(!1)};if(!e||!t||he(t)){n();return}let r=e=>{e.target===t&&e.propertyName===`transform`&&n()};return t.addEventListener(`transitionend`,r),()=>t.removeEventListener(`transitionend`,r)},[R,z,_]),(0,b.useEffect)(()=>{if(z&&v)return ge()},[z,v]),(0,b.useEffect)(()=>{if(!R||v||_||l||!u||!P)return;let e=e=>{let t=e.target;t instanceof Node&&(P.contains(t)||k.current?.contains(t)||J.current(`outside`))};return document.addEventListener(`pointerdown`,e),()=>document.removeEventListener(`pointerdown`,e)},[R,v,_,l,u,P]);let X=e=>{t?.props.onClick?.(e),!e.defaultPrevented&&K(!R,`trigger`)},Z=e=>{if(e.key!==`Tab`||e.shiftKey||e.defaultPrevented||!R||v||_||e.target!==A.current)return;let t=g(T.current)[0];t&&(e.preventDefault(),t.focus())},Q=e=>{if(m.onKeyDown?.(e),e.defaultPrevented||_||!R)return;if(e.key===`Escape`){e.preventDefault(),v&&(M.current=!0,setTimeout(()=>{M.current=!1},0)),q(`escape`);return}if(e.key!==`Tab`||v)return;let t=A.current,n=g(T.current);if(!t||n.length===0)return;let r=document.activeElement;if(e.shiftKey&&r===n[0])e.preventDefault(),t.focus();else if(!e.shiftKey&&r===n[n.length-1]){let n=me(t,P);if(!n)return;e.preventDefault(),n.focus()}},$=e=>{e.preventDefault(),!M.current&&q(`escape`)},Ce=()=>{R&&v&&requestAnimationFrame(()=>{let e=w.current;e instanceof HTMLDialogElement&&!e.open&&e.isConnected&&(typeof e.showModal==`function`?e.showModal():e.open=!0)})},we=e=>{let t=D.current;t&&!t.contains(e.target)&&t.click()},Te=e=>{if(e.isDefaultPrevented()||e.nativeEvent.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;let t=e.target.closest(`a[href]`);t instanceof HTMLAnchorElement&&e.currentTarget.contains(t)&&(t.target===`_blank`||t.hasAttribute(`download`)||R&&!_&&K(!1,`navigation`))},Ee=G?(0,b.cloneElement)(t,{"aria-expanded":R,"aria-controls":h&&(_||!v||z)?S:void 0,onClick:X}):t??null,De=a!=null&&a!==!1,Oe=u&&!_,ke=!i||Oe,Ae=(0,x.jsx)(`div`,{className:i?`ds-side-panel__heading ds-side-panel__visually-hidden`:`ds-side-panel__heading`,"data-part":`heading`,children:(0,x.jsx)(ne,{level:`2`,size:`lg`,id:C,ref:O,tabIndex:v?-1:void 0,children:r})}),je=(0,x.jsxs)(`div`,{className:`ds-side-panel__scope`,"data-part":`focusScope`,onClick:Te,children:[ke?(0,x.jsxs)(`div`,{className:`ds-side-panel__header`,"data-part":`header`,children:[Ae,Oe?(0,x.jsx)(`span`,{className:`ds-side-panel__close`,"data-part":`closeButton`,onClick:we,children:(0,x.jsx)(o,{ref:D,variant:`ghost`,iconOnly:!0,label:be.closeLabel,leadingIcon:(0,x.jsx)(ie,{name:`close`,inline:!0}),onClick:()=>q(`close-button`)})}):null]}):Ae,(0,x.jsx)(`div`,{className:`ds-side-panel__scroll`,ref:E,children:(0,x.jsx)(se,{"data-part":`body`,inset:`lg`,insetBlock:`none`,overrides:p?.inset?{paddingInline:p.inset}:void 0,children:ee})}),De?(0,x.jsx)(`div`,{className:`ds-side-panel__footer`,"data-part":`footer`,ref:Se,children:(0,x.jsx)(d,{direction:`horizontal`,gap:`tight`,justify:`end`,overrides:p?.footerGap?{gap:p.footerGap}:void 0,children:a})}):null]}),Me=V&&R&&!_,Ne=p?pe(p):void 0,Pe=[`ds-side-panel`,v?`ds-side-panel--modal`:null,_?`ds-side-panel--persistent`:null,Me?`ds-side-panel--visible`:null].filter(Boolean).join(` `),Fe=[`ds-side-panel__surface`,`ds-side-panel__surface--${te}`,`ds-side-panel__surface--${re}`,_?`ds-side-panel__surface--persistent`:null,Me?`ds-side-panel__surface--visible`:null].filter(Boolean).join(` `),Ie=Me?`ds-side-panel__scrim ds-side-panel__scrim--visible`:`ds-side-panel__scrim`,Le=null;return Le=v?z?(0,x.jsxs)(`dialog`,{...m,ref:e=>{w.current=e},id:S,"data-ds":`SidePanel`,className:Pe,style:Ne,"aria-modal":`true`,"aria-labelledby":C,onKeyDown:Q,onCancel:$,onClose:Ce,children:[(0,x.jsx)(`div`,{className:Ie,"data-part":`scrim`,onClick:()=>q(`scrim`)}),(0,x.jsx)(`div`,{className:Fe,"data-part":`surface`,ref:e=>{T.current=e},children:(0,x.jsx)(fe,{trapped:!0,autoFocus:`none`,restoreFocus:N.current!==`navigation`,returnFocusTo:A,children:je})})]}):null:(0,x.jsxs)(x.Fragment,{children:[!_&&l?(0,x.jsx)(`div`,{className:Ie,style:Ne,"data-part":`scrim`,"aria-hidden":`true`,hidden:!z,onClick:()=>q(`scrim`)}):null,(0,x.jsx)(`div`,{...m,ref:e=>{w.current=e,T.current=e},id:S,"data-ds":`SidePanel`,"data-part":`surface`,className:`${Pe} ${Fe}`,style:Ne,hidden:!W,onKeyDown:Q,children:(0,x.jsx)(le,{role:c,as:c===`navigation`?`nav`:`aside`,"aria-labelledby":C,children:(0,x.jsx)(fe,{trapped:!1,autoFocus:`none`,restoreFocus:!1,children:je})})})]}),(0,x.jsxs)(x.Fragment,{children:[Ee?(0,x.jsx)(`span`,{ref:k,className:_?`ds-side-panel__trigger ds-side-panel__trigger--hidden`:`ds-side-panel__trigger`,"data-part":`trigger`,hidden:_,onKeyDown:Z,children:Ee}):null,(0,x.jsx)(`div`,{ref:j,className:`ds-side-panel-slot`}),h&&P&&Le?(0,ye.createPortal)(Le,P):null]})}var b,ye,x,S,be,xe,C,w,T;function E(){return(E=e((()=>{b=t(),ye=n(),i(),oe(),a(),m(),te(),c(),p(),u(),x=r(),S={scrim:`--ds-side-panel-scrim`,shadow:`--ds-side-panel-shadow`,border:`--ds-side-panel-border`,borderWidth:`--ds-side-panel-border-width`,width:`--ds-side-panel-width`,widthNarrow:`--ds-side-panel-width-narrow`,widthWide:`--ds-side-panel-width-wide`,edgeGutter:`--ds-side-panel-edge-gutter`,inset:`--ds-side-panel-inset`,headerGap:`--ds-side-panel-header-gap`,headingGap:`--ds-side-panel-heading-gap`,partGap:`--ds-side-panel-part-gap`,footerGap:`--ds-side-panel-footer-gap`,layer:`--ds-side-panel-layer`,enter:`--ds-side-panel-enter`,exit:`--ds-side-panel-exit`},be={closeLabel:`Close`,expanded:`Expanded`},xe=new Set([`close-button`,`scrim`,`outside`,`swipe`]),C=[`a[href]`,`button:not([disabled])`,`input:not([disabled]):not([type="hidden"])`,`select:not([disabled])`,`textarea:not([disabled])`,`summary`,`[contenteditable]:not([contenteditable="false"])`,`[tabindex]`].join(`,`),w=0,T=()=>()=>{},y.__docgenInfo={description:`SidePanel — Design Schema, category: overlay.\r
\r
When to use:\r
Use a SidePanel for the primary navigation on phones (the "hamburger" menu — a Stack or Tree of\r
Links from the \`start\` edge), for filters beside a results page, for a cart or a detail panel from\r
the \`end\` edge, for a settings drawer. Set \`persistent: content\` when the same panel should become\r
the permanent sidebar on desktop; leave it \`never\` for panels that are always a temporary overlay\r
(a cart).\r
\r
The panel renders into one stable host node that moves between the portal target (overlay) and\r
the component's place in the page (persistent sidebar), so crossing the breakpoint keeps a\r
non-modal panel's children state. The ref resolves to the root element — the fixed panel, the\r
full-viewport <dialog> when modal, the in-page sidebar when persistent — and is null while closed.`,methods:[],displayName:`SidePanel`,props:{trigger:{required:!1,tsType:{name:`union`,raw:`ReactElement<{ onClick?: ((event: ReactMouseEvent<HTMLElement>) => void) | undefined }> | undefined`,elements:[{name:`ReactElement`,elements:[{name:`signature`,type:`object`,raw:`{ onClick?: ((event: ReactMouseEvent<HTMLElement>) => void) | undefined }`,signature:{properties:[{key:`onClick`,value:{name:`union`,raw:`((event: ReactMouseEvent<HTMLElement>) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}],required:!1}}]}}],raw:`ReactElement<{ onClick?: ((event: ReactMouseEvent<HTMLElement>) => void) | undefined }>`},{name:`undefined`}]},description:`The Button that shows and hides the panel (usually \`iconOnly\` with the \`menu\` Icon and a label\r
like "Menu"). It is the APG disclosure button: the panel sets aria-expanded on it, and\r
aria-controls whenever the element it names is in the DOM — a modal panel's <dialog> unmounts\r
when closed, so the attribute is dropped then. It stays a toggle — pressing it again closes. Omit\r
to control \`open\` from elsewhere (a Toolbar). Exactly one element, because it is cloned to carry\r
that wiring; a fragment or a bare string never opens the panel, so both warn in development. The\r
clone sits in an overlay-owned \`<span data-part="trigger">\` with display: contents, and that\r
wrapper — never the Button — is what persistent mode hides.`},open:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Controlled visibility. Omit for uncontrolled (the trigger toggles it); an uncontrolled panel\r
always starts closed and there is no defaultOpen, so a panel that must start open is controlled.`},heading:{required:!0,tsType:{name:`string`},description:'The panel\'s title and accessible name ("Menu", "Filters", "Your cart"). May be visually hidden with `hideHeading`.'},hideHeading:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Keep the title for assistive technology but hide it visually (a navigation panel whose Links are\r
self-explanatory): it stays rendered with the visually-hidden clip pattern so aria-labelledby\r
still resolves. When the header would then be empty (no close button because \`dismissible\` is\r
false or the panel is persistent), the header part is not rendered: no padding, no gap, no\r
height, and the hidden title moves to the top of the surface. The accessible name is required\r
regardless.`,defaultValue:{value:`false`,computed:!1}},children:{required:!0,tsType:{name:`ReactNode`},description:`The body: a Stack or Tree of Links for navigation, a Stack of filter controls (Checkboxes, a\r
RadioGroup — not a Form, whose own actions would duplicate the footer), a Stack of Cards. Scrolls\r
inside the panel when taller than the viewport.`},footer:{required:!1,tsType:{name:`ReactNode`},description:`Pinned to the bottom of the panel above the safe area (a sign-out Button, a "Apply filters" action row).`},side:{required:!1,tsType:{name:`union`,raw:`SidePanelSide | undefined`,elements:[{name:`union`,raw:`'start' | 'end'`,elements:[{name:`literal`,value:`'start'`},{name:`literal`,value:`'end'`}]},{name:`undefined`}]},description:"The edge the panel slides from: `start` is left in left-to-right languages and right in\r\nright-to-left; `end` the opposite. Navigation comes from the start; contextual panels (a cart, a\r\ndetail) from the end.",defaultValue:{value:`'start'`,computed:!1}},width:{required:!1,tsType:{name:`union`,raw:`SidePanelWidth | undefined`,elements:[{name:`union`,raw:`'narrow' | 'default' | 'wide'`,elements:[{name:`literal`,value:`'narrow'`},{name:`literal`,value:`'default'`},{name:`literal`,value:`'wide'`}]},{name:`undefined`}]},description:`Panel width on wide screens: narrow for a list of links, wide for a form or a detail. On phones\r
the panel is the viewport width minus a gutter that keeps the scrim visible.`,defaultValue:{value:`'default'`,computed:!1}},persistent:{required:!1,tsType:{name:`union`,raw:`SidePanelPersistent | undefined`,elements:[{name:`union`,raw:`'never' | 'content' | 'page'`,elements:[{name:`literal`,value:`'never'`},{name:`literal`,value:`'content'`},{name:`literal`,value:`'page'`}]},{name:`undefined`}]},description:"Above this layout width the panel stops being an overlay and becomes a fixed sidebar beside the\r\ncontent: always visible, no scrim, no trap, part of the page's tab order, and the trigger is\r\nhidden. `content` switches at layout.maxWidth.content, `page` at layout.maxWidth.page; the\r\ncomparison is `(width > token)`, read from the theme token on <html> when the component mounts.\r\nBelow it, the overlay behavior applies.",defaultValue:{value:`'never'`,computed:!1}},role:{required:!1,tsType:{name:`union`,raw:`SidePanelRole | undefined`,elements:[{name:`union`,raw:`'complementary' | 'navigation'`,elements:[{name:`literal`,value:`'complementary'`},{name:`literal`,value:`'navigation'`}]},{name:`undefined`}]},description:"The landmark the panel exposes (in persistent mode and as the region's role when open):\r\n`navigation` for a menu of Links, `complementary` for filters, a cart, a detail. This is the\r\ncomposed Landmark's own role, so `navigation` renders a real <nav>; a modal panel is a dialog,\r\nnot a landmark, and takes none of this.",defaultValue:{value:`'complementary'`,computed:!1}},modal:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`False (the default, the disclosure pattern): the panel is a disclosed region — the page stays\r
live and in the tab order after the panel, focus stays on the trigger when it opens, and Escape\r
from inside or a click outside closes it. True: the panel is a modal Dialog at the edge — scrim,\r
focus moved in and trapped, page inert and scroll-locked — for a panel that must be finished or\r
dismissed (a cart checkout, a required filter).`,defaultValue:{value:`false`,computed:!1}},scrim:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Show the scrim in non-modal mode too (modal always has one). It defaults to true, so turn it off\r
for a panel that should feel like part of the page.`,defaultValue:{value:`true`,computed:!1}},dismissible:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Escape, the close button, a scrim tap / outside click, and the swipe gesture all request close.\r
When false, the close button is not rendered and a scrim tap and an outside press do nothing;\r
Escape still reports through onOpenChange with reason escape (the consumer decides), as in\r
Dialog. Only those are gated: the trigger toggle, a followed Link (\`navigation\`) and a consumer's\r
\`action\` always close.`,defaultValue:{value:`true`,computed:!1}},swipeable:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`On touch, a swipe toward the edge dismisses (native only). Purely additive, and accepted here for\r
parity: the web wires no gesture, since dragging a panel with a mouse is not a web idiom. The\r
trigger and close button are always there (WCAG 2.5.1).`,defaultValue:{value:`true`,computed:!1}},onOpenChange:{required:!1,tsType:{name:`union`,raw:`((open: boolean, reason: SidePanelOpenChangeReason) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Fired when the panel opens or closes, with the new state and a reason: `trigger`, `escape`,\r\n`close-button`, `scrim`, `outside`, `swipe`, `action`, `navigation` (a Link inside was followed).\r\n`swipe` never comes from the web; `action` is a consumer's own footer handler reusing this."},container:{required:!1,tsType:{name:`union`,raw:`HTMLElement | undefined`,elements:[{name:`HTMLElement`},{name:`undefined`}]},description:"Portal target for the overlay. Defaults to `document.body`. A platform prop, not part of the schema."},overrides:{required:!1,tsType:{name:`union`,raw:`Partial<Record<SidePanelOverridableBinding, TokenRef | undefined>> | undefined`,elements:[{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'scrim'\r
| 'shadow'\r
| 'border'\r
| 'borderWidth'\r
| 'width'\r
| 'widthNarrow'\r
| 'widthWide'\r
| 'edgeGutter'\r
| 'inset'\r
| 'headerGap'\r
| 'headingGap'\r
| 'partGap'\r
| 'footerGap'\r
| 'layer'\r
| 'enter'\r
| 'exit'`,elements:[{name:`literal`,value:`'scrim'`},{name:`literal`,value:`'shadow'`},{name:`literal`,value:`'border'`},{name:`literal`,value:`'borderWidth'`},{name:`literal`,value:`'width'`},{name:`literal`,value:`'widthNarrow'`},{name:`literal`,value:`'widthWide'`},{name:`literal`,value:`'edgeGutter'`},{name:`literal`,value:`'inset'`},{name:`literal`,value:`'headerGap'`},{name:`literal`,value:`'headingGap'`},{name:`literal`,value:`'partGap'`},{name:`literal`,value:`'footerGap'`},{name:`literal`,value:`'layer'`},{name:`literal`,value:`'enter'`},{name:`literal`,value:`'exit'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<SidePanelOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<SidePanelOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:"Per-instance style overrides: each entry sets the matching CSS hook to that token, inline.\r\n`inset` is also forwarded to the body Box's `paddingInline` and `footerGap` to the footer Stack's\r\n`gap`, so the composed children follow."},ref:{required:!1,tsType:{name:`union`,raw:`Ref<HTMLElement> | undefined`,elements:[{name:`Ref`,elements:[{name:`HTMLElement`}],raw:`Ref<HTMLElement>`},{name:`undefined`}]},description:``}},composes:[`Omit`]}})))()}function Se(e){let[t,n]=(0,D.useState)(e.open);return(0,D.useEffect)(()=>n(e.open),[e.open]),t===void 0?(0,O.jsx)(y,{...e}):(0,O.jsx)(y,{...e,open:t,onOpenChange:(t,r)=>{n(t),e.onOpenChange?.(t,r)}})}var D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,$,Ce;function we(){return(we=e((()=>{D=t(),E(),a(),ue(),ce(),c(),ae(),u(),re(),O=r(),k=(0,O.jsx)(o,{variant:`ghost`,iconOnly:!0,label:`Menu`,leadingIcon:(0,O.jsx)(ie,{name:`menu`,inline:!0})}),A=(0,O.jsxs)(d,{gap:`tight`,children:[(0,O.jsx)(l,{href:`#dashboard`,label:`Dashboard`,"aria-current":`page`}),(0,O.jsx)(l,{href:`#projects`,label:`Projects`}),(0,O.jsx)(l,{href:`#settings`,label:`Settings`})]}),j={title:`SidePanel/React`,component:y,render:e=>(0,O.jsx)(Se,{...e}),args:{trigger:k,heading:`Menu`,children:A},tags:[`autodocs`]},M={},N={args:{side:`start`}},P={args:{side:`end`}},F={args:{width:`narrow`}},I={args:{width:`default`}},L={args:{width:`wide`}},R={args:{persistent:`never`}},z={args:{persistent:`content`}},B={args:{persistent:`page`}},V={args:{role:`complementary`}},H={args:{role:`navigation`}},U={args:{open:!0}},W={args:{open:!0,modal:!0}},G={args:{open:!0,scrim:!1}},K={args:{open:!0,dismissible:!1}},q={args:{open:!0,hideHeading:!0}},J={args:{open:!0,hideHeading:!0,dismissible:!1}},Y={args:{trigger:k,heading:`Menu`,children:A,hideHeading:!0,role:`navigation`,persistent:`content`}},X={args:{trigger:(0,O.jsx)(o,{variant:`secondary`,label:`Filters`}),heading:`Filters`,children:(0,O.jsxs)(d,{gap:`normal`,children:[(0,O.jsx)(f,{name:`in-stock`,label:`In stock`}),(0,O.jsx)(f,{name:`free-shipping`,label:`Free shipping`}),(0,O.jsx)(f,{name:`on-sale`,label:`On sale`})]}),footer:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(o,{variant:`secondary`,label:`Clear`}),(0,O.jsx)(o,{variant:`primary`,label:`Apply`})]}),width:`wide`}},Z={args:{trigger:void 0,open:!0,heading:`Your cart`,children:(0,O.jsxs)(d,{gap:`normal`,children:[(0,O.jsx)(de,{heading:`Linen shirt`,children:(0,O.jsx)(s,{children:`1 × $48.00`})}),(0,O.jsx)(de,{heading:`Canvas tote`,children:(0,O.jsx)(s,{children:`2 × $22.00`})})]}),footer:(0,O.jsx)(o,{variant:`primary`,label:`Checkout`}),side:`end`,modal:!0}},Q={args:{trigger:void 0,open:!0,heading:`Order details`,children:(0,O.jsxs)(d,{gap:`tight`,children:[(0,O.jsx)(s,{tone:`muted`,children:`Order`}),(0,O.jsx)(s,{children:`#10482`}),(0,O.jsx)(s,{tone:`muted`,children:`Status`}),(0,O.jsx)(s,{children:`Shipped`})]}),side:`end`,width:`narrow`,scrim:!1}},$={args:{open:!0,children:A}},Ce=[`Default`,`SideStart`,`SideEnd`,`WidthNarrow`,`WidthDefault`,`WidthWide`,`PersistentNever`,`PersistentContent`,`PersistentPage`,`RoleComplementary`,`RoleNavigation`,`Open`,`Modal`,`NoScrim`,`NotDismissible`,`HiddenHeading`,`HiddenHeadingNotDismissible`,`NavigationDrawer`,`Filters`,`Cart`,`DetailPanel`,`Keyboard`],M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    side: 'start'
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    side: 'end'
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    width: 'narrow'
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    width: 'default'
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    width: 'wide'
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    persistent: 'never'
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    persistent: 'content'
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    persistent: 'page'
  }
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    role: 'complementary'
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    role: 'navigation'
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    open: true
  }
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    modal: true
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    scrim: false
  }
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    dismissible: false
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    hideHeading: true
  }
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    hideHeading: true,
    dismissible: false
  }
}`,...J.parameters?.docs?.source},description:{story:`hideHeading with no close button: the header part is not rendered and the hidden title leads the column.`,...J.parameters?.docs?.description}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  args: {
    trigger: menuTrigger,
    heading: 'Menu',
    children: navigationLinks,
    hideHeading: true,
    role: 'navigation',
    persistent: 'content'
  }
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  args: {
    trigger: <Button variant="secondary" label="Filters" />,
    heading: 'Filters',
    children: <Stack gap="normal">\r
        <Checkbox name="in-stock" label="In stock" />\r
        <Checkbox name="free-shipping" label="Free shipping" />\r
        <Checkbox name="on-sale" label="On sale" />\r
      </Stack>,
    footer: <>\r
        <Button variant="secondary" label="Clear" />\r
        <Button variant="primary" label="Apply" />\r
      </>,
    width: 'wide'
  }
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  args: {
    trigger: undefined,
    open: true,
    heading: 'Your cart',
    children: <Stack gap="normal">\r
        <Card heading="Linen shirt">\r
          <Text>1 × $48.00</Text>\r
        </Card>\r
        <Card heading="Canvas tote">\r
          <Text>2 × $22.00</Text>\r
        </Card>\r
      </Stack>,
    footer: <Button variant="primary" label="Checkout" />,
    side: 'end',
    modal: true
  }
}`,...Z.parameters?.docs?.source}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  args: {
    trigger: undefined,
    open: true,
    heading: 'Order details',
    children: <Stack gap="tight">\r
        <Text tone="muted">Order</Text>\r
        <Text>#10482</Text>\r
        <Text tone="muted">Status</Text>\r
        <Text>Shipped</Text>\r
      </Stack>,
    side: 'end',
    width: 'narrow',
    scrim: false
  }
}`,...Q.parameters?.docs?.source}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    children: navigationLinks
  }
}`,...$.parameters?.docs?.source},description:{story:`Open with its trigger and three focusable children, for the keyboard gate.`,...$.parameters?.docs?.description}}}})))()}we();export{Z as Cart,M as Default,Q as DetailPanel,X as Filters,q as HiddenHeading,J as HiddenHeadingNotDismissible,$ as Keyboard,W as Modal,Y as NavigationDrawer,G as NoScrim,K as NotDismissible,U as Open,z as PersistentContent,R as PersistentNever,B as PersistentPage,V as RoleComplementary,H as RoleNavigation,P as SideEnd,N as SideStart,I as WidthDefault,F as WidthNarrow,L as WidthWide,Ce as __namedExportsOrder,j as default};