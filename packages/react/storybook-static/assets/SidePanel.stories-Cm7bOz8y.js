import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t}from"./iframe-BeYiOD21.js";import{t as n}from"./react-dom-FHI9z2KQ.js";import{t as r}from"./jsx-runtime-DeHZSEgm.js";import{n as i,t as ee}from"./names-szlHjJ4U.js";import{n as a,t as o}from"./Button-Bo7PDoxU.js";import{n as te,t as ne}from"./Heading-cF8HOPk0.js";import{n as re,t as s}from"./Text-mkTTvuew.js";import{n as c,t as ie}from"./Icon-Bkk7FUFb.js";import{n as ae,t as l}from"./Link-CrMOAh8Z.js";import{n as u,t as d}from"./Stack-DxRz7ipk.js";import{n as oe,t as se}from"./Box-CFLRldLE.js";import{n as ce,t as f}from"./Checkbox-R7B2ofKb.js";import{n as p,t as le}from"./Landmark-DzhUqOuC.js";import{n as ue,t as de}from"./Card-C8E0Oxzo.js";import{n as m,t as fe}from"./FocusScope-DLCK7Ho9.js";function pe(e){let t={};for(let n of Object.keys(e)){let r=e[n],i=x[n];r&&i&&(t[i]=ee(r))}return t}function h(e){return e.hasAttribute(`data-focus-sentinel`)||e.getAttribute(`tabindex`)===`-1`||e.tabIndex<0?!1:!e.closest(`[hidden], [inert]`)}function g(e){return e?Array.from(e.querySelectorAll(S)).filter(h):[]}function me(e,t){for(let n of g(document))if(!(n===e||e.contains(n)||t?.contains(n))&&e.compareDocumentPosition(n)&Node.DOCUMENT_POSITION_FOLLOWING)return n;return null}function he(e){let t=getComputedStyle(e).transitionDuration;return!t||t.split(`,`).every(e=>parseFloat(e)===0)}function ge(){return C+=1,document.documentElement.classList.add(`ds-side-panel-lock-scroll`),()=>{--C,C===0&&document.documentElement.classList.remove(`ds-side-panel-lock-scroll`)}}function _(e){if(e===`never`||typeof window>`u`||typeof window.matchMedia!=`function`)return null;let t=e===`content`?`--layout-max-width-content`:`--layout-max-width-page`,n=getComputedStyle(document.documentElement).getPropertyValue(t).trim();return n?window.matchMedia(`(width > ${n})`):null}function _e(e){let[t,n]=(0,y.useState)(()=>_(e)?.matches??!1);return(0,y.useEffect)(()=>{let t=_(e);if(!t){n(!1);return}let r=()=>n(t.matches);return r(),t.addEventListener(`change`,r),()=>t.removeEventListener(`change`,r)},[e]),t}function v({ref:e,trigger:t,open:n,heading:r,hideHeading:i=!1,children:ee,footer:a,side:te=`start`,width:re=`default`,persistent:s=`never`,role:c=`complementary`,modal:ae=!1,scrim:l=!0,dismissible:u=!0,swipeable:oe=!0,onOpenChange:ce,container:f,overrides:p,className:ue,style:de,...m}){let h=_e(s),_=ae&&!h,v=(0,y.useId)(),x=`ds-side-panel${v}-panel`,S=`ds-side-panel${v}-heading`,C=(0,y.useRef)(null),w=(0,y.useRef)(null),T=(0,y.useRef)(null),E=(0,y.useRef)(null),D=(0,y.useRef)(null),O=(0,y.useRef)(null),k=(0,y.useRef)(null),A=(0,y.useRef)(!1),j=(0,y.useRef)(!1),[M]=(0,y.useState)(()=>typeof document>`u`?null:document.createElement(`div`)),N=n!==void 0,[P,F]=(0,y.useState)(!1),I=n??P,[L,R]=(0,y.useState)(I),[z,B]=(0,y.useState)(!1),V=(0,y.useRef)(z);V.current=z,I&&!L&&R(!0);let H=h||L;(0,y.useImperativeHandle)(e,()=>H?C.current:null,[H,_]),(0,y.useRef)(!1);let U=(e,t)=>{N||F(e),ce?.(e,t)},W=e=>{if(I&&!h&&(!be.has(e)||u)){if(e===`escape`&&!u){ce?.(!1,`escape`);return}U(!1,e)}},G=(0,y.useRef)(W);G.current=W,(0,y.useLayoutEffect)(()=>{O.current=D.current?.firstElementChild??null}),(0,y.useLayoutEffect)(()=>{if(!M)return;M.className!==`ds-side-panel-host`&&(M.className=`ds-side-panel-host`);let e=h?k.current:f??document.body;if(e)return e.appendChild(M),()=>M.remove()},[M,h,f]),(0,y.useLayoutEffect)(()=>{if(!L||!_)return;let e=C.current;if(!(e instanceof HTMLDialogElement))return;e.open||(typeof e.showModal==`function`&&e.isConnected?e.showModal():e.open=!0);let t=g(w.current)[0]??g(T.current)[0]??E.current;if(t){t.focus();return}let n=document.getElementById(S);n&&(n.tabIndex!==-1&&(n.tabIndex=-1),n.focus())},[L,_,S]),(0,y.useLayoutEffect)(()=>{if(!L||!I||h)return;let e=requestAnimationFrame(()=>B(!0));return()=>cancelAnimationFrame(e)},[L,I,h]);let K=(0,y.useRef)(I);(0,y.useEffect)(()=>{let e=K.current;if(K.current=I,!e||I||h||_||!M)return;let t=document.activeElement;t&&M.contains(t)&&O.current?.focus()},[I,h,_,M]),(0,y.useEffect)(()=>{if(I||!L||h)return;let e=V.current;B(!1);let t=C.current,n=()=>{let e=C.current;e instanceof HTMLDialogElement&&e.open&&(typeof e.close==`function`?e.close():e.open=!1),R(!1)};if(!e||!t||he(t)){n();return}let r=e=>{e.target===t&&e.propertyName===`transform`&&n()};return t.addEventListener(`transitionend`,r),()=>t.removeEventListener(`transitionend`,r)},[I,L,h]),(0,y.useEffect)(()=>{if(L&&_)return ge()},[L,_]),(0,y.useEffect)(()=>{if(!I||_||h||l||!u||!M)return;let e=e=>{let t=e.target;t instanceof Node&&(M.contains(t)||D.current?.contains(t)||G.current(`outside`))};return document.addEventListener(`pointerdown`,e),()=>document.removeEventListener(`pointerdown`,e)},[I,_,h,l,u,M]);let q=e=>{t?.props.onClick?.(e),!e.defaultPrevented&&U(!I,`trigger`)},J=e=>{if(e.key!==`Tab`||e.shiftKey||e.defaultPrevented||!I||_||h||e.target!==O.current)return;let t=g(C.current)[0];t&&(e.preventDefault(),t.focus())},Y=e=>{if(m.onKeyDown?.(e),e.defaultPrevented||h||!I)return;if(e.key===`Escape`){e.preventDefault(),_&&(j.current=!0,setTimeout(()=>{j.current=!1},0)),W(`escape`);return}if(e.key!==`Tab`||_)return;let t=O.current,n=g(C.current);if(!t||n.length===0)return;let r=document.activeElement;if(e.shiftKey&&r===n[0])e.preventDefault(),t.focus();else if(!e.shiftKey&&r===n[n.length-1]){let n=me(t,M);if(!n)return;e.preventDefault(),n.focus()}},X=e=>{e.preventDefault(),!j.current&&W(`escape`)},Z=e=>{m.onPointerDown?.(e),A.current=e.target!==C.current},Q=e=>{m.onClick?.(e);let t=A.current;A.current=!1;let n=C.current;if(!n||e.target!==n||t)return;let r=n.getBoundingClientRect();e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom&&r.width>0||W(`scrim`)},xe=e=>{if(e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;let t=e.target.closest(`a[href]`);t instanceof HTMLAnchorElement&&e.currentTarget.contains(t)&&(t.target===`_blank`||t.hasAttribute(`download`)||I&&!h&&U(!1,`navigation`))},Se=e=>{let t=E.current;t&&!t.contains(e.target)&&t.click()},Ce=t?(0,y.cloneElement)(t,{"aria-expanded":I,"aria-controls":x,onClick:q}):null,we=a!=null&&a!==!1,Te=u&&!h,Ee=!i||Te,De=(0,b.jsx)(`div`,{className:i?`ds-side-panel__heading ds-side-panel__visually-hidden`:`ds-side-panel__heading`,"data-part":`heading`,children:(0,b.jsx)(ne,{level:`2`,size:`lg`,id:S,children:r})}),Oe=(0,b.jsxs)(`div`,{className:`ds-side-panel__layout`,onClick:xe,children:[Ee?(0,b.jsxs)(`div`,{className:`ds-side-panel__header`,"data-part":`header`,children:[De,Te?(0,b.jsx)(`span`,{className:`ds-side-panel__close`,"data-part":`closeButton`,onClick:Se,children:(0,b.jsx)(o,{ref:E,variant:`ghost`,iconOnly:!0,label:ye.closeLabel,leadingIcon:(0,b.jsx)(ie,{name:`close`,inline:!0}),onClick:()=>W(`close-button`)})}):null]}):De,(0,b.jsx)(`div`,{className:`ds-side-panel__scroll`,ref:w,children:(0,b.jsx)(se,{"data-part":`body`,inset:`lg`,overrides:p?.inset?{paddingBlock:p.inset}:void 0,children:ee})}),we?(0,b.jsx)(`div`,{className:`ds-side-panel__footer`,"data-part":`footer`,ref:T,children:(0,b.jsx)(d,{direction:`horizontal`,gap:`tight`,justify:`end`,overrides:p?.footerGap?{gap:p.footerGap}:void 0,children:a})}):null]}),ke=z&&I&&!h,Ae=[`ds-side-panel`,`ds-side-panel--${te}`,`ds-side-panel--${re}`,_?`ds-side-panel--modal`:null,h?`ds-side-panel--persistent`:null,ke?`ds-side-panel--visible`:null].filter(Boolean).join(` `),je=p?pe(p):void 0,$=null;return $=_?L?(0,b.jsx)(`dialog`,{...m,ref:e=>{C.current=e},id:x,"data-ds":`SidePanel`,"data-part":`surface`,className:Ae,style:je,"aria-modal":`true`,"aria-labelledby":S,onKeyDown:Y,onCancel:X,onPointerDown:Z,onClick:Q,children:(0,b.jsx)(fe,{trapped:!0,autoFocus:`none`,restoreFocus:!0,returnFocusTo:O,"data-part":`focusScope`,children:Oe})}):null:(0,b.jsxs)(b.Fragment,{children:[!h&&l?(0,b.jsx)(`div`,{className:ke?`ds-side-panel__scrim ds-side-panel__scrim--visible`:`ds-side-panel__scrim`,style:je,"data-part":`scrim`,"aria-hidden":`true`,hidden:!L,onPointerDown:()=>W(`scrim`)}):null,(0,b.jsx)(`div`,{...m,ref:e=>{C.current=e},id:x,"data-ds":`SidePanel`,"data-part":`surface`,className:Ae,style:je,hidden:!H,onKeyDown:Y,children:(0,b.jsx)(fe,{trapped:!1,autoFocus:`none`,restoreFocus:!1,"data-part":`focusScope`,children:(0,b.jsx)(le,{role:c,as:c===`navigation`?`nav`:`aside`,"aria-labelledby":S,children:Oe})})})]}),(0,b.jsxs)(b.Fragment,{children:[Ce?(0,b.jsx)(`span`,{ref:D,className:h?`ds-side-panel__trigger ds-side-panel__trigger--hidden`:`ds-side-panel__trigger`,"data-part":`trigger`,onKeyDown:J,children:Ce}):null,(0,b.jsx)(`div`,{ref:k,className:`ds-side-panel-slot`}),M&&$?(0,ve.createPortal)($,M):null]})}var y,ve,b,x,ye,be,S,C;function w(){return(w=e((()=>{y=t(),ve=n(),i(),oe(),a(),m(),te(),c(),p(),u(),b=r(),x={scrim:`--ds-side-panel-scrim`,shadow:`--ds-side-panel-shadow`,border:`--ds-side-panel-border`,borderWidth:`--ds-side-panel-border-width`,width:`--ds-side-panel-width`,widthNarrow:`--ds-side-panel-width-narrow`,widthWide:`--ds-side-panel-width-wide`,edgeGutter:`--ds-side-panel-edge-gutter`,inset:`--ds-side-panel-inset`,headerGap:`--ds-side-panel-header-gap`,partGap:`--ds-side-panel-part-gap`,footerGap:`--ds-side-panel-footer-gap`,layer:`--ds-side-panel-layer`,enter:`--ds-side-panel-enter`,exit:`--ds-side-panel-exit`},ye={closeLabel:`Close`,expanded:`Expanded`},be=new Set([`close-button`,`scrim`,`outside`,`swipe`]),S=[`a[href]`,`button:not([disabled])`,`input:not([disabled]):not([type="hidden"])`,`select:not([disabled])`,`textarea:not([disabled])`,`summary`,`[contenteditable]:not([contenteditable="false"])`,`[tabindex]`].join(`,`),C=0,v.__docgenInfo={description:`SidePanel — Design Schema, category: overlay.

When to use:
Use a SidePanel for the primary navigation on phones (the "hamburger" menu — a Stack or Tree of
Links from the \`start\` edge), for filters beside a results page, for a cart or a detail panel from
the \`end\` edge, for a settings drawer. Set \`persistent: content\` when the same panel should become
the permanent sidebar on desktop; leave it \`never\` for panels that are always a temporary overlay
(a cart).

The panel renders into one stable host node that moves between the portal target (overlay) and
the component's place in the page (persistent sidebar), so crossing the breakpoint keeps a
non-modal panel's children state. The ref resolves to the positioned surface element — the fixed
panel, the <dialog> when modal, the in-page sidebar when persistent — and is null while closed.`,methods:[],displayName:`SidePanel`,props:{trigger:{required:!1,tsType:{name:`union`,raw:`ReactElement<{ onClick?: ((event: ReactMouseEvent<HTMLElement>) => void) | undefined }> | undefined`,elements:[{name:`ReactElement`,elements:[{name:`signature`,type:`object`,raw:`{ onClick?: ((event: ReactMouseEvent<HTMLElement>) => void) | undefined }`,signature:{properties:[{key:`onClick`,value:{name:`union`,raw:`((event: ReactMouseEvent<HTMLElement>) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}],required:!1}}]}}],raw:`ReactElement<{ onClick?: ((event: ReactMouseEvent<HTMLElement>) => void) | undefined }>`},{name:`undefined`}]},description:'The Button that shows and hides the panel (usually `iconOnly` with the `menu` Icon and a label\nlike "Menu"). It is the APG disclosure button: the panel sets aria-expanded and aria-controls on\nit, and it stays a toggle — pressing it again closes. Omit to control `open` from elsewhere (a\nToolbar). Exactly one element: it is cloned, wrapped in an overlay-owned\n`<span data-part="trigger">` with display: contents, and that wrapper is what persistent mode hides.'},open:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Controlled visibility. Omit for uncontrolled (the trigger toggles it); an uncontrolled panel
always starts closed and there is no defaultOpen, so a panel that must start open is controlled.`},heading:{required:!0,tsType:{name:`string`},description:'The panel\'s title and accessible name ("Menu", "Filters", "Your cart"). May be visually hidden with `hideHeading`.'},hideHeading:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Keep the title for assistive technology but hide it visually (a navigation panel whose Links are
self-explanatory). When the header would then be empty (no close button because \`dismissible\` is
false or the panel is persistent), the header part is not rendered. The accessible name is
required regardless.`,defaultValue:{value:`false`,computed:!1}},children:{required:!0,tsType:{name:`ReactNode`},description:`The body: a Stack or Tree of Links for navigation, a Stack of filter controls (Checkboxes, a
RadioGroup — not a Form, whose own actions would duplicate the footer), a Stack of Cards. Scrolls
inside the panel when taller than the viewport.`},footer:{required:!1,tsType:{name:`ReactNode`},description:`Pinned to the bottom of the panel above the safe area (a sign-out Button, a "Apply filters" action row).`},side:{required:!1,tsType:{name:`union`,raw:`SidePanelSide | undefined`,elements:[{name:`union`,raw:`'start' | 'end'`,elements:[{name:`literal`,value:`'start'`},{name:`literal`,value:`'end'`}]},{name:`undefined`}]},description:"The edge the panel slides from: `start` is left in left-to-right languages and right in\nright-to-left; `end` the opposite. Navigation comes from the start; contextual panels (a cart, a\ndetail) from the end.",defaultValue:{value:`'start'`,computed:!1}},width:{required:!1,tsType:{name:`union`,raw:`SidePanelWidth | undefined`,elements:[{name:`union`,raw:`'narrow' | 'default' | 'wide'`,elements:[{name:`literal`,value:`'narrow'`},{name:`literal`,value:`'default'`},{name:`literal`,value:`'wide'`}]},{name:`undefined`}]},description:`Panel width on wide screens: narrow for a list of links, wide for a form or a detail. On phones
the panel is the viewport width minus a gutter that keeps the scrim visible.`,defaultValue:{value:`'default'`,computed:!1}},persistent:{required:!1,tsType:{name:`union`,raw:`SidePanelPersistent | undefined`,elements:[{name:`union`,raw:`'never' | 'content' | 'page'`,elements:[{name:`literal`,value:`'never'`},{name:`literal`,value:`'content'`},{name:`literal`,value:`'page'`}]},{name:`undefined`}]},description:"Above this layout width the panel stops being an overlay and becomes a fixed sidebar beside the\ncontent: always visible, no scrim, no trap, part of the page's tab order, and the trigger is\nhidden. `content` switches at layout.maxWidth.content, `page` at layout.maxWidth.page; the\ncomparison is `(width > token)`. Below it, the overlay behavior applies.",defaultValue:{value:`'never'`,computed:!1}},role:{required:!1,tsType:{name:`union`,raw:`SidePanelRole | undefined`,elements:[{name:`union`,raw:`'complementary' | 'navigation'`,elements:[{name:`literal`,value:`'complementary'`},{name:`literal`,value:`'navigation'`}]},{name:`undefined`}]},description:"The landmark the panel exposes (in persistent mode and as the region's role when open):\n`navigation` for a menu of Links, `complementary` for filters, a cart, a detail. On web this is\nthe composed Landmark's own role, so `navigation` renders a real <nav>; a modal panel is a\ndialog, not a landmark, and takes none of this.",defaultValue:{value:`'complementary'`,computed:!1}},modal:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`False (the default, the disclosure pattern): the panel is a disclosed region — the page stays
live and in the tab order after the panel, focus stays on the trigger when it opens, and Escape
from inside or a click outside closes it. True: the panel is a modal Dialog at the edge — scrim,
focus moved in and trapped, page inert and scroll-locked.`,defaultValue:{value:`false`,computed:!1}},scrim:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Show the scrim in non-modal mode too (modal always has one). Turn it off for a panel that should feel like part of the page.`,defaultValue:{value:`true`,computed:!1}},dismissible:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Escape, the close button, a scrim tap / outside click, and the swipe gesture all request close.
When false, the close button is not rendered and a scrim tap or an outside press do nothing;
Escape still reports through onOpenChange with reason escape (the consumer decides), as in
Dialog. The trigger toggle, a followed Link and a consumer's \`action\` always close.`,defaultValue:{value:`true`,computed:!1}},swipeable:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`On touch, a swipe toward the edge dismisses (native only). Accepted on web for parity; no
gesture is wired, since dragging a panel with a mouse is not a web idiom.`,defaultValue:{value:`true`,computed:!1}},onOpenChange:{required:!1,tsType:{name:`union`,raw:`((open: boolean, reason: SidePanelOpenChangeReason) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Fired when the panel opens or closes, with the new state and a reason: `trigger`, `escape`,\n`close-button`, `scrim`, `outside`, `swipe`, `action`, `navigation` (a Link inside was followed)."},container:{required:!1,tsType:{name:`union`,raw:`HTMLElement | undefined`,elements:[{name:`HTMLElement`},{name:`undefined`}]},description:"Portal target for the overlay. Defaults to `document.body`. A platform prop, not part of the schema."},overrides:{required:!1,tsType:{name:`union`,raw:`Partial<Record<SidePanelOverridableBinding, TokenRef | undefined>> | undefined`,elements:[{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'scrim'
| 'shadow'
| 'border'
| 'borderWidth'
| 'width'
| 'widthNarrow'
| 'widthWide'
| 'edgeGutter'
| 'inset'
| 'headerGap'
| 'partGap'
| 'footerGap'
| 'layer'
| 'enter'
| 'exit'`,elements:[{name:`literal`,value:`'scrim'`},{name:`literal`,value:`'shadow'`},{name:`literal`,value:`'border'`},{name:`literal`,value:`'borderWidth'`},{name:`literal`,value:`'width'`},{name:`literal`,value:`'widthNarrow'`},{name:`literal`,value:`'widthWide'`},{name:`literal`,value:`'edgeGutter'`},{name:`literal`,value:`'inset'`},{name:`literal`,value:`'headerGap'`},{name:`literal`,value:`'partGap'`},{name:`literal`,value:`'footerGap'`},{name:`literal`,value:`'layer'`},{name:`literal`,value:`'enter'`},{name:`literal`,value:`'exit'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<SidePanelOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<SidePanelOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:"Per-instance style overrides: each entry sets the matching CSS hook to that token, inline.\n`inset` is forwarded to the body Box's `paddingBlock`, `footerGap` to the footer Stack's `gap`."},ref:{required:!1,tsType:{name:`union`,raw:`Ref<HTMLElement> | undefined`,elements:[{name:`Ref`,elements:[{name:`HTMLElement`}],raw:`Ref<HTMLElement>`},{name:`undefined`}]},description:``}},composes:[`Omit`]}})))()}function T(e){let[t,n]=(0,E.useState)(e.open);return(0,E.useEffect)(()=>n(e.open),[e.open]),t===void 0?(0,D.jsx)(v,{...e}):(0,D.jsx)(v,{...e,open:t,onOpenChange:(t,r)=>{n(t),e.onOpenChange?.(t,r)}})}var E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,xe;function Se(){return(Se=e((()=>{E=t(),w(),a(),ue(),ce(),c(),ae(),u(),re(),D=r(),O=(0,D.jsx)(o,{variant:`ghost`,iconOnly:!0,label:`Menu`,leadingIcon:(0,D.jsx)(ie,{name:`menu`,inline:!0})}),k=(0,D.jsxs)(d,{gap:`tight`,children:[(0,D.jsx)(l,{href:`#dashboard`,label:`Dashboard`,"aria-current":`page`}),(0,D.jsx)(l,{href:`#projects`,label:`Projects`}),(0,D.jsx)(l,{href:`#settings`,label:`Settings`})]}),A={title:`SidePanel/React`,component:v,render:e=>(0,D.jsx)(T,{...e}),args:{trigger:O,heading:`Menu`,children:k},tags:[`autodocs`]},j={},M={args:{side:`start`}},N={args:{side:`end`}},P={args:{width:`narrow`}},F={args:{width:`default`}},I={args:{width:`wide`}},L={args:{persistent:`never`}},R={args:{persistent:`content`}},z={args:{persistent:`page`}},B={args:{role:`complementary`}},V={args:{role:`navigation`}},H={args:{open:!0}},U={args:{open:!0,modal:!0}},W={args:{open:!0,scrim:!1}},G={args:{open:!0,dismissible:!1}},K={args:{open:!0,hideHeading:!0}},q={args:{open:!0,hideHeading:!0,dismissible:!1}},J={args:{trigger:O,heading:`Menu`,children:k,hideHeading:!0,role:`navigation`,persistent:`content`}},Y={args:{trigger:(0,D.jsx)(o,{variant:`secondary`,label:`Filters`}),heading:`Filters`,children:(0,D.jsxs)(d,{gap:`normal`,children:[(0,D.jsx)(f,{name:`in-stock`,label:`In stock`}),(0,D.jsx)(f,{name:`free-shipping`,label:`Free shipping`}),(0,D.jsx)(f,{name:`on-sale`,label:`On sale`})]}),footer:(0,D.jsxs)(D.Fragment,{children:[(0,D.jsx)(o,{variant:`secondary`,label:`Clear`}),(0,D.jsx)(o,{variant:`primary`,label:`Apply`})]}),width:`wide`}},X={args:{open:!0,heading:`Your cart`,children:(0,D.jsxs)(d,{gap:`normal`,children:[(0,D.jsx)(de,{heading:`Linen shirt`,children:(0,D.jsx)(s,{children:`1 × $48.00`})}),(0,D.jsx)(de,{heading:`Canvas tote`,children:(0,D.jsx)(s,{children:`2 × $22.00`})})]}),footer:(0,D.jsx)(o,{variant:`primary`,label:`Checkout`}),side:`end`,modal:!0}},Z={args:{open:!0,heading:`Order details`,children:(0,D.jsxs)(d,{gap:`tight`,children:[(0,D.jsx)(s,{tone:`muted`,children:`Order`}),(0,D.jsx)(s,{children:`#10482`}),(0,D.jsx)(s,{tone:`muted`,children:`Status`}),(0,D.jsx)(s,{children:`Shipped`})]}),side:`end`,width:`narrow`,scrim:!1}},Q={args:{open:!0,children:k}},xe=[`Default`,`SideStart`,`SideEnd`,`WidthNarrow`,`WidthDefault`,`WidthWide`,`PersistentNever`,`PersistentContent`,`PersistentPage`,`RoleComplementary`,`RoleNavigation`,`Open`,`Modal`,`NoScrim`,`NotDismissible`,`HiddenHeading`,`HiddenHeadingNotDismissible`,`NavigationDrawer`,`Filters`,`Cart`,`DetailPanel`,`Keyboard`],j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    side: 'start'
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    side: 'end'
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    width: 'narrow'
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    width: 'default'
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    width: 'wide'
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    persistent: 'never'
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    persistent: 'content'
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    persistent: 'page'
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    role: 'complementary'
  }
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    role: 'navigation'
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    open: true
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    modal: true
  }
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    scrim: false
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    dismissible: false
  }
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    hideHeading: true
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    hideHeading: true,
    dismissible: false
  }
}`,...q.parameters?.docs?.source},description:{story:`hideHeading with no close button: the header part is not rendered and the hidden title leads the column.`,...q.parameters?.docs?.description}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  args: {
    trigger: menuTrigger,
    heading: 'Menu',
    children: navigationLinks,
    hideHeading: true,
    role: 'navigation',
    persistent: 'content'
  }
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
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
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  args: {
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
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  args: {
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
}`,...Z.parameters?.docs?.source}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    children: navigationLinks
  }
}`,...Q.parameters?.docs?.source},description:{story:`Open with its trigger and three focusable children, for the keyboard gate.`,...Q.parameters?.docs?.description}}}})))()}Se();export{X as Cart,j as Default,Z as DetailPanel,Y as Filters,K as HiddenHeading,q as HiddenHeadingNotDismissible,Q as Keyboard,U as Modal,J as NavigationDrawer,W as NoScrim,G as NotDismissible,H as Open,R as PersistentContent,L as PersistentNever,z as PersistentPage,B as RoleComplementary,V as RoleNavigation,N as SideEnd,M as SideStart,F as WidthDefault,P as WidthNarrow,I as WidthWide,xe as __namedExportsOrder,A as default};