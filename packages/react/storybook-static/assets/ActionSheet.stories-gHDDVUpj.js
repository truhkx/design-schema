import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t}from"./iframe-BaAix2rE.js";import{t as n}from"./react-dom-Beiq-MTI.js";import{t as r}from"./jsx-runtime-DeHZSEgm.js";import{n as i,t as a}from"./names-szlHjJ4U.js";import{n as o,t as s}from"./Button-CXwJSRqr.js";import{n as c,t as ee}from"./Text-BmznDQS2.js";import{n as l,t as te}from"./Icon-CNCpSr-m.js";import{n as u,t as ne}from"./FocusScope-2jH_6XAy.js";import{n as d,t as f}from"./Menu-yLset2_S.js";function p(e){let t=getComputedStyle(e).getPropertyValue(A).trim(),n=Number.parseFloat(t);if(!Number.isFinite(n))return 0;if(!t.endsWith(`rem`)&&!t.endsWith(`em`))return n;let r=Number.parseFloat(getComputedStyle(document.documentElement).fontSize);return Number.isFinite(r)?n*r:0}function m(e){return!(getComputedStyle(e).transitionDuration||``).split(`,`).some(e=>Number.parseFloat(e)>0)}function h(){return typeof window<`u`&&typeof window.matchMedia==`function`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches}function g(){if(typeof window>`u`||typeof window.matchMedia!=`function`)return null;let e=getComputedStyle(document.documentElement).getPropertyValue(`--layout-max-width-prose`).trim();return e?window.matchMedia(`(width > ${e})`):null}function re(){let[e,t]=(0,x.useState)(()=>g()?.matches??!1);return(0,x.useEffect)(()=>{let e=0,n=null,r=()=>t(n?.matches??!1),i=()=>{if(n=g(),n){r(),n.addEventListener(`change`,r);return}typeof document<`u`&&document.readyState!==`complete`&&(e=requestAnimationFrame(i))};return i(),()=>{e&&cancelAnimationFrame(e),n?.removeEventListener(`change`,r)}},[]),e}function _(e){return{normal:e.filter(e=>e.tone!==`danger`),danger:e.filter(e=>e.tone===`danger`)}}function v(e){return{id:e.id,label:e.label,icon:e.icon,tone:e.tone,disabled:e.disabled}}function y(e){let{normal:t,danger:n}=_(e),r=t.map(v);return t.length>0&&n.length>0&&r.push({separator:!0}),r.push(...n.map(v)),r}function b({ref:e,open:t,heading:n,actions:r,dismissible:i=!0,cancelLabel:o,onAction:c,onClose:l,container:u,overrides:d,...g}){let v=re(),b=(0,x.useRef)(null),A=(0,x.useRef)(null),j=(0,x.useRef)(new Map),M=(0,x.useRef)(null),N=(0,x.useRef)(null),P=(0,x.useRef)(!1),F=(0,x.useRef)(!1);if(t&&!P.current){if(typeof document<`u`){let e=document.activeElement;N.current=e instanceof HTMLElement?e:document.body}F.current=!1,P.current=!0}else!t&&P.current&&(P.current=!1);let[I,L]=(0,x.useState)(t),[R,z]=(0,x.useState)(!1),[B,V]=(0,x.useState)(`idle`),[H,U]=(0,x.useState)(null);t&&!I&&L(!0),(0,x.useImperativeHandle)(e,()=>b.current,[v,t,I]);let W=n||D.defaultLabel,{normal:G,danger:K}=_(r),q=[...G,...K].filter(e=>!e.disabled);(0,x.useLayoutEffect)(()=>{if(!I||v||!t)return;let e=b.current;if(!e)return;if(!e.open){let t=!1;if(typeof e.showModal==`function`)try{e.showModal(),t=!0}catch{t=!1}t||e.setAttribute(`open`,``)}let n=q[0];if(n&&(U(n.id),j.current.get(n.id)?.focus()),h()){z(!0);return}let r=requestAnimationFrame(()=>z(!0));return()=>cancelAnimationFrame(r)},[I,v,t]),(0,x.useEffect)(()=>{if(t||!I)return;z(!1);let e=N.current;e?.isConnected&&e.focus();let n=b.current,r=A.current,i=()=>{n?.open&&(typeof n.close==`function`?n.close():n.removeAttribute(`open`)),L(!1)};if(v||!r||m(r)){i();return}let a=e=>{e.target===r&&e.propertyName===`transform`&&i()};return r.addEventListener(`transitionend`,a),()=>r.removeEventListener(`transitionend`,a)},[t,I,v]),(0,x.useLayoutEffect)(()=>{let e=A.current;if(B===`held`){V(t?`settling`:`exiting`);return}if(B===`exiting`){if(t){V(`settling`);return}e&&(e.style.transform=``),V(`idle`);return}if(B!==`settling`)return;if(!e){V(`idle`);return}if(e.style.transform=``,m(e)){V(`idle`);return}let n=t=>{t.target===e&&t.propertyName===`transform`&&V(`idle`)};return e.addEventListener(`transitionend`,n),()=>e.removeEventListener(`transitionend`,n)},[B,t]),(0,x.useEffect)(()=>{if(I&&!v)return document.documentElement.classList.add(`ds-action-sheet-lock-scroll`),()=>document.documentElement.classList.remove(`ds-action-sheet-lock-scroll`)},[I,v]);let J=e=>{(e===`escape`||i)&&l?.(e)},ie=e=>{e.key===`Escape`&&(e.preventDefault(),e.stopPropagation(),J(`escape`))},ae=e=>{e.preventDefault(),J(`escape`)},oe=e=>{i&&t&&!M.current&&(e.pointerType!==`mouse`||e.button===0)&&Number.isFinite(e.clientY)&&(M.current={pointerId:e.pointerId,startY:e.clientY,originY:e.clientY,claimed:!1,previous:null,last:null})},se=e=>{let t=M.current,n=A.current;if(t&&t.pointerId===e.pointerId&&n&&Number.isFinite(e.clientY)){if(!t.claimed){let r=e.clientY-t.startY;if(r<=0||r<p(n))return;t.claimed=!0,t.originY=e.clientY,typeof e.currentTarget.setPointerCapture==`function`&&e.currentTarget.setPointerCapture(e.pointerId),V(`dragging`)}t.previous=t.last,t.last={y:e.clientY,time:e.timeStamp},n.style.transform=`translateY(${Math.max(0,e.clientY-t.originY)}px)`}},Y=(e,n)=>{let r=M.current;if(!r||r.pointerId!==e.pointerId)return;M.current=null;let i=A.current;if(!r.claimed||!i)return;let a=Number.isFinite(e.clientY)?Math.max(0,e.clientY-r.originY):0,o=i.getBoundingClientRect().height,s=o>0&&a>o*O,c=0;if(r.previous&&r.last&&r.last.time>r.previous.time&&(c=(r.last.y-r.previous.y)/(r.last.time-r.previous.time)),n||!t||!(s||c>k)){V(`settling`);return}V(`held`),J(`drag`)},X=e=>{e&&(U(e.id),j.current.get(e.id)?.focus())},ce=e=>{if(q.length===0)return;let t=q.findIndex(e=>e.id===H);switch(e.key){case`ArrowDown`:e.preventDefault(),X(q[(t+1)%q.length]);break;case`ArrowUp`:e.preventDefault(),X(q[(t-1+q.length)%q.length]);break;case`Home`:e.preventDefault(),X(q[0]);break;case`End`:e.preventDefault(),X(q[q.length-1])}},le=e=>t=>{if(e.disabled){t.preventDefault();return}c?.(e.id)},ue=(e,t)=>{if(!e){if(t===`action`){F.current=!0;return}F.current||(t===`escape`?l?.(`escape`):(t===`outside`||t===`tab-out`||t===`focus-out`)&&l?.(`scrim`))}},de=e=>{F.current=!0,c?.(e)};if(v){if(!t||typeof document>`u`)return null;let e={};for(let[t,n]of Object.entries(d??{})){let r=E[t];n&&r&&(e[r]=n)}return(0,C.jsx)(f,{label:W,items:y(r),open:!0,anchor:N,onAction:de,onOpenChange:ue,container:u,overrides:Object.keys(e).length>0?e:void 0})}if(!I||typeof document>`u`)return null;let Z={},Q={};for(let[e,t]of Object.entries(d??{})){if(!t)continue;Z[w[e]]=a(t);let n=T[e];n&&(Q[n]=t)}let $=e=>(0,C.jsxs)(`button`,{ref:t=>{t?j.current.set(e.id,t):j.current.delete(e.id)},type:`button`,role:`menuitem`,tabIndex:e.id===(H??q[0]?.id)?0:-1,"aria-disabled":e.disabled?`true`:void 0,"data-part":`item`,className:[`ds-action-sheet__item`,e.tone===`danger`?`ds-action-sheet__item--danger`:``,e.disabled?`ds-action-sheet__item--disabled`:``].filter(Boolean).join(` `),onFocus:()=>{!e.disabled&&H!==e.id&&U(e.id)},onClick:le(e),children:[e.icon?(0,C.jsx)(`span`,{className:`ds-action-sheet__icon`,"data-part":`itemIcon`,"aria-hidden":`true`,children:(0,C.jsx)(te,{name:e.icon,inline:!0})}):null,(0,C.jsx)(`span`,{className:`ds-action-sheet__label`,children:e.label})]},e.id),fe=[`ds-action-sheet`,R?`ds-action-sheet--visible`:``,B===`dragging`?`ds-action-sheet--dragging`:``,B===`settling`?`ds-action-sheet--settling`:``].filter(Boolean).join(` `);return(0,S.createPortal)((0,C.jsxs)(`dialog`,{...g,ref:b,"data-ds":`ActionSheet`,className:fe,style:Object.keys(Z).length>0?Z:void 0,"aria-modal":`true`,"aria-label":W,onKeyDown:ie,onCancel:ae,children:[(0,C.jsx)(`div`,{className:`ds-action-sheet__scrim`,"data-part":`scrim`,"aria-hidden":`true`,onClick:()=>J(`scrim`)}),(0,C.jsx)(ne,{trapped:!0,autoFocus:`none`,restoreFocus:!0,active:t,returnFocusTo:N,"data-part":`focusScope`,children:(0,C.jsxs)(`div`,{ref:A,className:`ds-action-sheet__surface`,"data-part":`surface`,children:[i||n?(0,C.jsxs)(`div`,{className:`ds-action-sheet__header`,"data-part":`header`,onPointerDown:oe,onPointerMove:se,onPointerUp:e=>Y(e,!1),onPointerCancel:e=>Y(e,!0),children:[i?(0,C.jsx)(`span`,{className:`ds-action-sheet__handle`,"data-part":`handle`,"aria-hidden":`true`}):null,n?(0,C.jsx)(ee,{element:`p`,size:`sm`,tone:`muted`,"data-part":`heading`,overrides:Object.keys(Q).length>0?Q:void 0,children:n}):null]}):null,(0,C.jsxs)(`div`,{role:`menu`,"aria-label":W,"data-part":`list`,className:`ds-action-sheet__list`,onKeyDown:ce,children:[G.map($),G.length>0&&K.length>0?(0,C.jsx)(`div`,{role:`separator`,className:`ds-action-sheet__divider`,"data-part":`divider`}):null,K.map($)]}),i?(0,C.jsxs)(C.Fragment,{children:[(0,C.jsx)(`div`,{className:`ds-action-sheet__divider`,"data-part":`divider`,"aria-hidden":`true`}),(0,C.jsx)(`div`,{className:`ds-action-sheet__cancel-row`,"data-part":`cancelButton`,children:(0,C.jsx)(s,{variant:`secondary`,label:o||D.cancelLabel,onClick:()=>J(`cancel`)})})]}):null]})})]}),u??document.body)}var x,S,C,w,T,E,D,O,k,A;function j(){return(j=e((()=>{x=t(),S=n(),i(),o(),u(),l(),d(),c(),C=r(),w={scrim:`--ds-action-sheet-scrim`,shadow:`--ds-action-sheet-shadow`,radius:`--ds-action-sheet-radius`,itemPaddingBlock:`--ds-action-sheet-item-padding-block`,itemPaddingInline:`--ds-action-sheet-item-padding-inline`,itemGap:`--ds-action-sheet-item-gap`,headerPaddingBlock:`--ds-action-sheet-header-padding-block`,headerGap:`--ds-action-sheet-header-gap`,handleHeight:`--ds-action-sheet-handle-height`,handleWidth:`--ds-action-sheet-handle-width`,handleRadius:`--ds-action-sheet-handle-radius`,titleSize:`--ds-action-sheet-title-size`,fontFamily:`--ds-action-sheet-font-family`,fontSize:`--ds-action-sheet-font-size`,lineHeight:`--ds-action-sheet-line-height`,divider:`--ds-action-sheet-divider`,dividerWidth:`--ds-action-sheet-divider-width`,layer:`--ds-action-sheet-layer`,enter:`--ds-action-sheet-enter`,exit:`--ds-action-sheet-exit`},T={titleSize:`fontSize`,fontFamily:`fontFamily`,lineHeight:`lineHeight`},E={shadow:`shadow`,radius:`radius`,itemPaddingBlock:`itemPaddingBlock`,itemPaddingInline:`itemPaddingInline`,itemGap:`itemGap`,fontFamily:`fontFamily`,fontSize:`fontSize`,lineHeight:`lineHeight`,layer:`layer`,enter:`enter`,divider:`separator`},D={cancelLabel:`Cancel`,defaultLabel:`Actions`},O=.25,k=1.5,A=`--space-1`,b.__docgenInfo={description:`ActionSheet — contextual actions on an item: a bottom sheet of menu items at or below
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
and the drag do nothing, and Escape still reports through onClose; with no \`heading\` either, the
header has nothing to show and is not rendered at all. It gates the sheet presentation only —
the wide Menu presentation has no scrim, drag or cancel row, and clicking outside always closes it.`,defaultValue:{value:`true`,computed:!1}},cancelLabel:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:"Label of the explicit cancel row on phones. Defaults to `copy.cancelLabel`."},onAction:{required:!1,tsType:{name:`union`,raw:`((id: string) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"An action was chosen; receives its `id`. The consumer performs it and closes."},onClose:{required:!1,tsType:{name:`union`,raw:`((reason: ActionSheetCloseReason) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Dismissed without choosing: reason `escape`, `scrim`, `cancel`, or `drag`."},container:{required:!1,tsType:{name:`union`,raw:`HTMLElement | undefined`,elements:[{name:`HTMLElement`},{name:`undefined`}]},description:"Portal target (platform prop, not in the schema). Defaults to `document.body`; forwarded to the wide Menu."},overrides:{required:!1,tsType:{name:`union`,raw:`Partial<Record<ActionSheetOverridableBinding, TokenRef | undefined>> | undefined`,elements:[{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'scrim'
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
| 'exit'`,elements:[{name:`literal`,value:`'scrim'`},{name:`literal`,value:`'shadow'`},{name:`literal`,value:`'radius'`},{name:`literal`,value:`'itemPaddingBlock'`},{name:`literal`,value:`'itemPaddingInline'`},{name:`literal`,value:`'itemGap'`},{name:`literal`,value:`'headerPaddingBlock'`},{name:`literal`,value:`'headerGap'`},{name:`literal`,value:`'handleHeight'`},{name:`literal`,value:`'handleWidth'`},{name:`literal`,value:`'handleRadius'`},{name:`literal`,value:`'titleSize'`},{name:`literal`,value:`'fontFamily'`},{name:`literal`,value:`'fontSize'`},{name:`literal`,value:`'lineHeight'`},{name:`literal`,value:`'divider'`},{name:`literal`,value:`'dividerWidth'`},{name:`literal`,value:`'layer'`},{name:`literal`,value:`'enter'`},{name:`literal`,value:`'exit'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<ActionSheetOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<ActionSheetOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:`Per-instance style overrides: each entry sets the matching CSS hook to that token, inline.`},ref:{required:!1,tsType:{name:`union`,raw:`Ref<HTMLDialogElement> | undefined`,elements:[{name:`Ref`,elements:[{name:`HTMLDialogElement`}],raw:`Ref<HTMLDialogElement>`},{name:`undefined`}]},description:``}},composes:[`Omit`]}})))()}function M(e){let[t,n]=(0,N.useState)(e.open);return(0,N.useEffect)(()=>n(e.open),[e.open]),(0,P.jsx)(b,{...e,open:t,onAction:t=>{e.onAction?.(t),n(!1)},onClose:t=>{e.onClose?.(t),n(!1)}})}var N,P,F,I,L,R,z,B,V,H,U,W;function G(){return(G=e((()=>{N=t(),j(),P=r(),F=[{id:`share`,label:`Share`,icon:`external`},{id:`rename`,label:`Rename`},{id:`duplicate`,label:`Duplicate`},{id:`delete`,label:`Delete photo`,icon:`danger`,tone:`danger`}],I={title:`ActionSheet/React`,component:b,tags:[`autodocs`],render:e=>(0,P.jsx)(M,{...e}),args:{open:!0,heading:`Photo.jpg`,actions:F},argTypes:{onAction:{action:`action`},onClose:{action:`close`}}},L={},R={args:{open:!0,heading:`Photo.jpg`,actions:[{id:`share`,label:`Share`,icon:`external`},{id:`rename`,label:`Rename`},{id:`duplicate`,label:`Duplicate`},{id:`delete`,label:`Delete photo`,icon:`danger`,tone:`danger`}]}},z={args:{open:!0,heading:void 0,actions:[{id:`copy`,label:`Copy link`},{id:`open`,label:`Open in new tab`}]}},B={args:{open:!0,heading:`Invoice 4821`,cancelLabel:`Not now`,actions:[{id:`download`,label:`Download`},{id:`void`,label:`Void invoice`,tone:`danger`,disabled:!0}]}},V={args:{dismissible:!1}},H={args:{open:!1}},U={args:{open:!0,heading:`Photo.jpg`,actions:F}},W=[`Default`,`PhotoActions`,`UnnamedSheet`,`WithAnUnavailableAction`,`DismissibleFalse`,`Closed`,`Keyboard`],L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{}`,...L.parameters?.docs?.source},description:{story:`Open, with the photo-actions example's args.`,...L.parameters?.docs?.description}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source},description:{story:`Contextual actions on an item, with the destructive one last.`,...R.parameters?.docs?.description}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source},description:{story:`A sheet with no heading, named by copy.defaultLabel for assistive technology.`,...z.parameters?.docs?.description}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source},description:{story:`An action that is shown but cannot be used here, announced as disabled rather than hidden.`,...B.parameters?.docs?.description}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    dismissible: false
  }
}`,...V.parameters?.docs?.source},description:{story:`No Cancel row, no handle; the scrim does nothing and Escape still reports through onClose.`,...V.parameters?.docs?.description}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    open: false
  }
}`,...H.parameters?.docs?.source},description:{story:"The controlled sheet with `open` false renders nothing.",...H.parameters?.docs?.description}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Photo.jpg',
    actions: PHOTO_ACTIONS
  }
}`,...U.parameters?.docs?.source},description:{story:`Open with four focusable actions and the Cancel row, for the keyboard gate.`,...U.parameters?.docs?.description}}}})))()}G();export{H as Closed,L as Default,V as DismissibleFalse,U as Keyboard,R as PhotoActions,z as UnnamedSheet,B as WithAnUnavailableAction,W as __namedExportsOrder,I as default};