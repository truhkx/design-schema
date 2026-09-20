import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t}from"./iframe-CeSprNHO.js";import{t as n}from"./react-dom-BECGmpAF.js";import{t as r}from"./jsx-runtime-DeHZSEgm.js";import{n as i,t as a}from"./names-szlHjJ4U.js";import{n as o,t as s}from"./Button-Dwx7L93c.js";import{n as c,t as ee}from"./Text-BmznDQS2.js";import{n as l,t as u}from"./Icon-CDe7Poew.js";import{n as d,t as te}from"./FocusScope-BqmzaOY0.js";import{n as f,t as p}from"./Menu-FCUje0J2.js";function m(){return typeof window<`u`&&typeof window.matchMedia==`function`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches}function h(){if(typeof window>`u`||typeof window.matchMedia!=`function`)return null;let e=getComputedStyle(document.documentElement).getPropertyValue(`--layout-max-width-prose`).trim();return e?window.matchMedia(`(width > ${e})`):null}function ne(){let[e,t]=(0,y.useState)(()=>h()?.matches??!1);return(0,y.useEffect)(()=>{let e=h();if(!e)return;let n=()=>t(e.matches);return n(),e.addEventListener(`change`,n),()=>e.removeEventListener(`change`,n)},[]),e}function g(e){return{normal:e.filter(e=>e.tone!==`danger`),danger:e.filter(e=>e.tone===`danger`)}}function _(e){return{id:e.id,label:e.label,icon:e.icon,tone:e.tone,disabled:e.disabled}}function re(e){let{normal:t,danger:n}=g(e),r=t.map(_);return t.length>0&&n.length>0&&r.push({separator:!0}),r.push(...n.map(_)),r}function v({ref:e,open:t,heading:n,actions:r,dismissible:i=!0,cancelLabel:o,onAction:c,onClose:l,container:d,overrides:f,...h}){let _=ne(),v=(0,y.useRef)(null),O=(0,y.useRef)(null),k=(0,y.useRef)(new Map),A=(0,y.useRef)(null),j=(0,y.useRef)(null),M=(0,y.useRef)(!1),N=(0,y.useRef)(!1);if(t&&!M.current&&typeof document<`u`){let e=document.activeElement;j.current=e instanceof HTMLElement?e:document.body,N.current=!1}(0,y.useEffect)(()=>{M.current=t},[t]);let[P,F]=(0,y.useState)(t),[I,L]=(0,y.useState)(!1),[R,z]=(0,y.useState)(!1),[B,V]=(0,y.useState)(!1),[H,U]=(0,y.useState)(null);t&&!P&&F(!0),(0,y.useImperativeHandle)(e,()=>v.current,[_,t,P]);let W=n||T.defaultLabel,{normal:G,danger:K}=g(r),q=[...G,...K].filter(e=>!e.disabled);(0,y.useLayoutEffect)(()=>{if(!P||_||!t)return;let e=v.current;if(!e)return;e.open||(typeof e.showModal==`function`?e.showModal():e.setAttribute(`open`,``));let n=q[0];if(n&&(U(n.id),k.current.get(n.id)?.focus()),m()){L(!0);return}let r=requestAnimationFrame(()=>L(!0));return()=>cancelAnimationFrame(r)},[P,_,t]),(0,y.useEffect)(()=>{if(t||!P)return;L(!1),V(!1);let e=v.current,n=O.current,r=()=>{e?.open&&(typeof e.close==`function`?e.close():e.removeAttribute(`open`)),F(!1),z(!1)},i=n?Number.parseFloat(getComputedStyle(n).transitionDuration||`0`):0;if(_||!n||m()||!(i>0)){r();return}let a=e=>{e.target===n&&e.propertyName===`transform`&&r()};return n.addEventListener(`transitionend`,a),()=>n.removeEventListener(`transitionend`,a)},[t,P,_]),(0,y.useEffect)(()=>{if(P&&!_)return document.documentElement.classList.add(`ds-action-sheet-lock-scroll`),()=>document.documentElement.classList.remove(`ds-action-sheet-lock-scroll`)},[P,_]);let J=e=>{(e===`escape`||i)&&l?.(e)},ie=e=>{e.key===`Escape`&&(e.preventDefault(),e.stopPropagation(),J(`escape`))},ae=e=>{e.preventDefault(),J(`escape`)},oe=e=>{i&&O.current&&(e.currentTarget.setPointerCapture?.(e.pointerId),A.current={startY:e.clientY,startTime:e.timeStamp},V(!1),z(!0))},se=e=>{let t=A.current,n=O.current;t&&n&&n.style.setProperty(`--ds-action-sheet-drag`,`${Math.max(0,e.clientY-t.startY)}px`)},Y=e=>{let t=A.current,n=O.current;if(A.current=null,!t||!n)return;let r=Math.max(0,e.clientY-t.startY),i=Math.max(1,e.timeStamp-t.startTime),a=n.getBoundingClientRect().height;if(a>0&&r/a>E||r/i>D){J(`drag`);return}n.style.removeProperty(`--ds-action-sheet-drag`),z(!1),V(!m())},X=e=>{e&&(U(e.id),k.current.get(e.id)?.focus())},ce=e=>{if(q.length===0)return;let t=q.findIndex(e=>e.id===H);switch(e.key){case`ArrowDown`:e.preventDefault(),X(q[(t+1)%q.length]);break;case`ArrowUp`:e.preventDefault(),X(q[(t-1+q.length)%q.length]);break;case`Home`:e.preventDefault(),X(q[0]);break;case`End`:e.preventDefault(),X(q[q.length-1])}},le=e=>t=>{if(e.disabled){t.preventDefault();return}c?.(e.id)},ue=(e,t)=>{if(!e){if(t===`action`){N.current=!0;return}N.current||(t===`escape`?l?.(`escape`):(t===`outside`||t===`tab-out`||t===`focus-out`)&&l?.(`scrim`))}},de=e=>{N.current=!0,c?.(e)};if(_){if(!t||typeof document>`u`)return null;let e={};for(let[t,n]of Object.entries(f??{})){let r=w[t];n&&r&&(e[r]=n)}return(0,x.jsx)(p,{label:W,items:re(r),open:!0,anchor:j,onAction:de,onOpenChange:ue,container:d,overrides:Object.keys(e).length>0?e:void 0})}if(!P||typeof document>`u`)return null;let Z={},Q={};for(let[e,t]of Object.entries(f??{})){if(!t)continue;let n=S[e];n&&(Z[n]=a(t));let r=C[e];r&&(Q[r]=t)}let $=e=>(0,x.jsxs)(`button`,{ref:t=>{t?k.current.set(e.id,t):k.current.delete(e.id)},type:`button`,role:`menuitem`,tabIndex:e.id===(H??q[0]?.id)?0:-1,"aria-disabled":e.disabled?`true`:void 0,"data-part":`item`,className:[`ds-action-sheet__item`,e.tone===`danger`?`ds-action-sheet__item--danger`:``,e.disabled?`ds-action-sheet__item--disabled`:``].filter(Boolean).join(` `),onFocus:()=>{!e.disabled&&H!==e.id&&U(e.id)},onClick:le(e),children:[e.icon?(0,x.jsx)(`span`,{className:`ds-action-sheet__icon`,"data-part":`itemIcon`,"aria-hidden":`true`,children:(0,x.jsx)(u,{name:e.icon,inline:!0})}):null,(0,x.jsx)(`span`,{className:`ds-action-sheet__label`,children:e.label})]},e.id),fe=[`ds-action-sheet`,I?`ds-action-sheet--visible`:``,R?`ds-action-sheet--dragging`:``,B?`ds-action-sheet--settling`:``].filter(Boolean).join(` `);return(0,b.createPortal)((0,x.jsxs)(`dialog`,{...h,ref:v,"data-ds":`ActionSheet`,className:fe,style:Object.keys(Z).length>0?Z:void 0,"aria-modal":`true`,"aria-label":W,onKeyDown:ie,onCancel:ae,children:[(0,x.jsx)(`div`,{className:`ds-action-sheet__scrim`,"data-part":`scrim`,"aria-hidden":`true`,onClick:()=>J(`scrim`)}),(0,x.jsx)(te,{trapped:!0,autoFocus:`none`,restoreFocus:!0,returnFocusTo:j,"data-part":`focusScope`,children:(0,x.jsxs)(`div`,{ref:O,className:`ds-action-sheet__surface`,"data-part":`surface`,onTransitionEnd:e=>{e.target===e.currentTarget&&B&&V(!1)},children:[i||n?(0,x.jsxs)(`div`,{className:`ds-action-sheet__header`,"data-part":`header`,onPointerDown:oe,onPointerMove:se,onPointerUp:Y,onPointerCancel:Y,children:[i?(0,x.jsx)(`span`,{className:`ds-action-sheet__handle`,"data-part":`handle`,"aria-hidden":`true`}):null,n?(0,x.jsx)(ee,{element:`p`,size:`sm`,tone:`muted`,"data-part":`heading`,overrides:Object.keys(Q).length>0?Q:void 0,children:n}):null]}):null,(0,x.jsxs)(`div`,{role:`menu`,"aria-label":W,"data-part":`list`,className:`ds-action-sheet__list`,onKeyDown:ce,children:[G.map($),G.length>0&&K.length>0?(0,x.jsx)(`div`,{role:`separator`,className:`ds-action-sheet__divider`,"data-part":`divider`}):null,K.map($)]}),i?(0,x.jsxs)(x.Fragment,{children:[(0,x.jsx)(`div`,{className:`ds-action-sheet__divider`,"data-part":`divider`,"aria-hidden":`true`}),(0,x.jsx)(`div`,{className:`ds-action-sheet__cancel-row`,"data-part":`cancelButton`,children:(0,x.jsx)(s,{variant:`secondary`,label:o||T.cancelLabel,onClick:()=>J(`cancel`)})})]}):null]})})]}),d??document.body)}var y,b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{y=t(),b=n(),i(),o(),d(),l(),f(),c(),x=r(),S={scrim:`--ds-action-sheet-scrim`,shadow:`--ds-action-sheet-shadow`,radius:`--ds-action-sheet-radius`,itemPaddingBlock:`--ds-action-sheet-item-padding-block`,itemPaddingInline:`--ds-action-sheet-item-padding-inline`,itemGap:`--ds-action-sheet-item-gap`,headerPaddingBlock:`--ds-action-sheet-header-padding-block`,headerGap:`--ds-action-sheet-header-gap`,handleHeight:`--ds-action-sheet-handle-height`,handleWidth:`--ds-action-sheet-handle-width`,handleRadius:`--ds-action-sheet-handle-radius`,fontFamily:`--ds-action-sheet-font-family`,fontSize:`--ds-action-sheet-font-size`,lineHeight:`--ds-action-sheet-line-height`,divider:`--ds-action-sheet-divider`,dividerWidth:`--ds-action-sheet-divider-width`,layer:`--ds-action-sheet-layer`,enter:`--ds-action-sheet-enter`,exit:`--ds-action-sheet-exit`},C={titleSize:`fontSize`,fontFamily:`fontFamily`,lineHeight:`lineHeight`},w={shadow:`shadow`,radius:`radius`,itemPaddingBlock:`itemPaddingBlock`,itemPaddingInline:`itemPaddingInline`,itemGap:`itemGap`,fontFamily:`fontFamily`,fontSize:`fontSize`,lineHeight:`lineHeight`,layer:`layer`,enter:`enter`,divider:`separator`},T={cancelLabel:`Cancel`,defaultLabel:`Actions`},E=.25,D=1.5,v.__docgenInfo={description:`ActionSheet — contextual actions on an item: a bottom sheet of menu items at or below
\`layout.maxWidth.prose\`, a Menu anchored to the opener above it.

When to use: Use an ActionSheet for contextual actions on an item — share, rename, duplicate,
delete — opened from an overflow Button (\`iconOnly\`, label "More actions") or a long-press. Keep
it to what fits without scrolling; more than eight actions means the item needs its own screen.
Put destructive actions last with \`tone: danger\`.`,methods:[],displayName:`ActionSheet`,props:{open:{required:!0,tsType:{name:`boolean`},description:"Controlled only — there is no uncontrolled mode; the consumer owns `open`, the sheet requests a\ndismissal through `onClose` and reports a choice through `onAction`, and the consumer sets\n`open` to false for both."},heading:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:'What the actions apply to ("Photo.jpg"), shown muted above the list. Also the accessible name;\nwhen omitted the name is `copy.defaultLabel`.'},actions:{required:!0,tsType:{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{ id: string; label: string; icon?: IconName; tone?: "default" | "danger"; disabled?: boolean }`,signature:{properties:[{key:`id`,value:{name:`string`,required:!0}},{key:`label`,value:{name:`string`,required:!0}},{key:`icon`,value:{name:`union`,raw:`| 'check'
| 'dash'
| 'chevron-right'
| 'chevron-down'
| 'chevron-up'
| 'chevron-left'
| 'close'
| 'plus'
| 'minus'
| 'info'
| 'success'
| 'warning'
| 'danger'
| 'external'
| 'ellipsis'
| 'search'
| 'arrow-right'
| 'arrow-left'
| 'calendar'
| 'menu'
| 'list'
| 'grid'
| 'play'
| 'pause'
| 'folder'
| 'file'`,elements:[{name:`literal`,value:`'check'`},{name:`literal`,value:`'dash'`},{name:`literal`,value:`'chevron-right'`},{name:`literal`,value:`'chevron-down'`},{name:`literal`,value:`'chevron-up'`},{name:`literal`,value:`'chevron-left'`},{name:`literal`,value:`'close'`},{name:`literal`,value:`'plus'`},{name:`literal`,value:`'minus'`},{name:`literal`,value:`'info'`},{name:`literal`,value:`'success'`},{name:`literal`,value:`'warning'`},{name:`literal`,value:`'danger'`},{name:`literal`,value:`'external'`},{name:`literal`,value:`'ellipsis'`},{name:`literal`,value:`'search'`},{name:`literal`,value:`'arrow-right'`},{name:`literal`,value:`'arrow-left'`},{name:`literal`,value:`'calendar'`},{name:`literal`,value:`'menu'`},{name:`literal`,value:`'list'`},{name:`literal`,value:`'grid'`},{name:`literal`,value:`'play'`},{name:`literal`,value:`'pause'`},{name:`literal`,value:`'folder'`},{name:`literal`,value:`'file'`}],required:!1}},{key:`tone`,value:{name:`union`,raw:`"default" | "danger"`,elements:[{name:`literal`,value:`"default"`},{name:`literal`,value:`"danger"`}],required:!1}},{key:`disabled`,value:{name:`boolean`,required:!1}}]}}],raw:`ActionSheetAction[]`},description:"Two to about eight actions. `danger` actions are visually distinct and grouped last. The count\nis guidance, not enforced: no dev warning outside that range."},dismissible:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Escape, the scrim, the cancel row and the drag all request close. When false, as in Dialog: the
Cancel row and the divider above it are not rendered, the drag handle is not rendered, the scrim
and the drag do nothing, and Escape still reports through onClose. It gates the sheet
presentation only — the wide Menu presentation has no scrim, drag or cancel row, and clicking
outside always closes it.`,defaultValue:{value:`true`,computed:!1}},cancelLabel:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:"Label of the explicit cancel row on phones. Defaults to `copy.cancelLabel`."},onAction:{required:!1,tsType:{name:`union`,raw:`((id: string) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"An action was chosen; receives its `id`. The consumer performs it and closes."},onClose:{required:!1,tsType:{name:`union`,raw:`((reason: ActionSheetCloseReason) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Dismissed without choosing: reason `escape`, `scrim`, `cancel`, or `drag`."},container:{required:!1,tsType:{name:`union`,raw:`HTMLElement | undefined`,elements:[{name:`HTMLElement`},{name:`undefined`}]},description:"Portal target (platform prop, not in the schema). Defaults to `document.body`; forwarded to the wide Menu."},overrides:{required:!1,tsType:{name:`union`,raw:`Partial<Record<ActionSheetOverridableBinding, TokenRef | undefined>> | undefined`,elements:[{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'scrim'
| 'shadow'
| 'radius'
| 'itemPaddingBlock'
| 'itemPaddingInline'
| 'itemGap'
| 'headerPaddingBlock'
| 'headerGap'
| 'handleHeight'
| 'handleWidth'
| 'handleRadius'
| 'titleSize'
| 'fontFamily'
| 'fontSize'
| 'lineHeight'
| 'divider'
| 'dividerWidth'
| 'layer'
| 'enter'
| 'exit'`,elements:[{name:`literal`,value:`'scrim'`},{name:`literal`,value:`'shadow'`},{name:`literal`,value:`'radius'`},{name:`literal`,value:`'itemPaddingBlock'`},{name:`literal`,value:`'itemPaddingInline'`},{name:`literal`,value:`'itemGap'`},{name:`literal`,value:`'headerPaddingBlock'`},{name:`literal`,value:`'headerGap'`},{name:`literal`,value:`'handleHeight'`},{name:`literal`,value:`'handleWidth'`},{name:`literal`,value:`'handleRadius'`},{name:`literal`,value:`'titleSize'`},{name:`literal`,value:`'fontFamily'`},{name:`literal`,value:`'fontSize'`},{name:`literal`,value:`'lineHeight'`},{name:`literal`,value:`'divider'`},{name:`literal`,value:`'dividerWidth'`},{name:`literal`,value:`'layer'`},{name:`literal`,value:`'enter'`},{name:`literal`,value:`'exit'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<ActionSheetOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<ActionSheetOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:`Per-instance style overrides: each entry sets the matching CSS hook to that token, inline.`},ref:{required:!1,tsType:{name:`union`,raw:`Ref<HTMLDialogElement> | undefined`,elements:[{name:`Ref`,elements:[{name:`HTMLDialogElement`}],raw:`Ref<HTMLDialogElement>`},{name:`undefined`}]},description:``}},composes:[`Omit`]}})))()}function k(e){let[t,n]=(0,A.useState)(e.open);return(0,A.useEffect)(()=>n(e.open),[e.open]),(0,j.jsxs)(j.Fragment,{children:[(0,j.jsx)(s,{label:`More actions`,iconOnly:!0,leadingIcon:(0,j.jsx)(u,{name:`ellipsis`,inline:!0}),"aria-haspopup":`menu`,onClick:()=>n(!0)}),(0,j.jsx)(v,{...e,open:t,onAction:t=>{e.onAction?.(t),n(!1)},onClose:t=>{e.onClose?.(t),n(!1)}})]})}var A,j,M,N,P,F,I,L,R,z,B,V;function H(){return(H=e((()=>{A=t(),O(),o(),l(),j=r(),M=[{id:`share`,label:`Share`,icon:`external`},{id:`rename`,label:`Rename`},{id:`duplicate`,label:`Duplicate`},{id:`delete`,label:`Delete photo`,icon:`danger`,tone:`danger`}],N={title:`ActionSheet/React`,component:v,tags:[`autodocs`],render:e=>(0,j.jsx)(k,{...e}),args:{open:!0,heading:`Photo.jpg`,actions:M},argTypes:{onAction:{action:`action`},onClose:{action:`close`}}},P={},F={args:{open:!0,heading:`Photo.jpg`,actions:[{id:`share`,label:`Share`,icon:`external`},{id:`rename`,label:`Rename`},{id:`duplicate`,label:`Duplicate`},{id:`delete`,label:`Delete photo`,icon:`danger`,tone:`danger`}]}},I={args:{open:!0,heading:void 0,actions:[{id:`copy`,label:`Copy link`},{id:`open`,label:`Open in new tab`}]}},L={args:{open:!0,heading:`Invoice 4821`,cancelLabel:`Not now`,actions:[{id:`download`,label:`Download`},{id:`void`,label:`Void invoice`,tone:`danger`,disabled:!0}]}},R={args:{dismissible:!1}},z={args:{open:!1}},B={args:{open:!0,heading:`Photo.jpg`,actions:M}},V=[`Default`,`PhotoActions`,`UnnamedSheet`,`WithAnUnavailableAction`,`DismissibleFalse`,`Closed`,`Keyboard`],P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Photo.jpg',
    actions: [{
      id: 'share',
      label: 'Share',
      icon: 'external'
    }, {
      id: 'rename',
      label: 'Rename'
    }, {
      id: 'duplicate',
      label: 'Duplicate'
    }, {
      id: 'delete',
      label: 'Delete photo',
      icon: 'danger',
      tone: 'danger'
    }]
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: undefined,
    actions: [{
      id: 'copy',
      label: 'Copy link'
    }, {
      id: 'open',
      label: 'Open in new tab'
    }]
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Invoice 4821',
    cancelLabel: 'Not now',
    actions: [{
      id: 'download',
      label: 'Download'
    }, {
      id: 'void',
      label: 'Void invoice',
      tone: 'danger',
      disabled: true
    }]
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    dismissible: false
  }
}`,...R.parameters?.docs?.source},description:{story:`No Cancel row, no handle; the scrim does nothing and Escape still reports through onClose.`,...R.parameters?.docs?.description}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    open: false
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Photo.jpg',
    actions: PHOTO_ACTIONS
  }
}`,...B.parameters?.docs?.source},description:{story:`Open with its trigger and four focusable actions, for the keyboard gate.`,...B.parameters?.docs?.description}}}})))()}H();export{z as Closed,P as Default,R as DismissibleFalse,B as Keyboard,F as PhotoActions,I as UnnamedSheet,L as WithAnUnavailableAction,V as __namedExportsOrder,N as default};