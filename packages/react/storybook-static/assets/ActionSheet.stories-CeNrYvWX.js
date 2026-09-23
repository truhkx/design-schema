import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t}from"./iframe-D5pPePpr.js";import{t as n}from"./react-dom-BT06ZQro.js";import{t as r}from"./jsx-runtime-DeHZSEgm.js";import{n as i,t as a}from"./names-szlHjJ4U.js";import{n as o,t as s}from"./Button-OQwYA6MI.js";import{n as c,t as ee}from"./Text-B1hFPUay.js";import{n as l,t as u}from"./Icon-dvwZzeX-.js";import{n as d,t as te}from"./FocusScope-DauhWYu8.js";import{n as f,t as ne}from"./Menu-pFLiI3wA.js";function re(e){let t=getComputedStyle(e).getPropertyValue(D).trim(),n=Number.parseFloat(t);if(!Number.isFinite(n))return 0;if(!t.endsWith(`rem`)&&!t.endsWith(`em`))return n;let r=Number.parseFloat(getComputedStyle(document.documentElement).fontSize);return Number.isFinite(r)?n*r:0}function p(e){return!(getComputedStyle(e).transitionDuration||``).split(`,`).some(e=>Number.parseFloat(e)>0)}function ie(){return typeof window<`u`&&typeof window.matchMedia==`function`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches}function m(){if(typeof window>`u`||typeof window.matchMedia!=`function`)return null;let e=getComputedStyle(document.documentElement),t=e.getPropertyValue(`--ds-action-sheet-max-width`).trim()||e.getPropertyValue(`--layout-max-width-prose`).trim();return t?window.matchMedia(`(width > ${t})`):null}function ae(){return(0,v.useSyncExternalStore)(O,()=>!0,()=>!1)}function oe(){let[e,t]=(0,v.useState)(!1);return(0,v.useLayoutEffect)(()=>{let e=0,n=null,r=()=>t(n?.matches??!1),i=()=>{if(n=m(),n){r(),n.addEventListener(`change`,r);return}typeof document<`u`&&document.readyState!==`complete`&&(e=requestAnimationFrame(i))};return i(),()=>{e&&cancelAnimationFrame(e),n?.removeEventListener(`change`,r)}},[]),e}function h(e){return{normal:e.filter(e=>e.tone!==`danger`),danger:e.filter(e=>e.tone===`danger`)}}function g(e){return{id:e.id,label:e.label,icon:e.icon,tone:e.tone,disabled:e.disabled}}function se(e){let{normal:t,danger:n}=h(e),r=t.map(g);return t.length>0&&n.length>0&&r.push({separator:!0}),r.push(...n.map(g)),r}function _({ref:e,open:t,heading:n,actions:r,dismissible:i=!0,cancelLabel:o,onAction:c,onClose:l,container:d,overrides:f,...m}){let g=ae(),_=oe(),D=(0,v.useRef)(null),O=(0,v.useRef)(null),k=(0,v.useRef)(new Map),A=(0,v.useRef)(null),j=(0,v.useRef)(null),M=(0,v.useRef)(null),N=(0,v.useRef)(!1),P=(0,v.useRef)(!1);if(t&&!N.current){if(typeof document<`u`){let e=document.activeElement;M.current=e instanceof HTMLElement?e:document.body}P.current=!1,N.current=!0}else!t&&N.current&&(N.current=!1);let[F,I]=(0,v.useState)(t),[L,R]=(0,v.useState)(!1),[z,B]=(0,v.useState)(`idle`),[V,H]=(0,v.useState)(null),U=(0,v.useRef)(!1);U.current=L,t&&!F&&I(!0),(0,v.useImperativeHandle)(e,()=>D.current,[_,t,F]);let W=n||w.defaultLabel,{normal:G,danger:K}=h(r),q=[...G,...K].filter(e=>!e.disabled);(0,v.useLayoutEffect)(()=>{if(!F||_||!t||!g)return;let e=D.current;if(!e||!O.current)return;if(!e.open){let t=!1;if(typeof e.showModal==`function`)try{e.showModal(),t=!0}catch{t=!1}t||e.setAttribute(`open`,``)}let n=q[0];if(n&&(H(n.id),k.current.get(n.id)?.focus()),ie()){R(!0);return}let r=requestAnimationFrame(()=>R(!0));return()=>cancelAnimationFrame(r)},[F,_,t,g]),(0,v.useEffect)(()=>{if(t||!F)return;R(!1);let e=M.current;e?.isConnected&&e.focus();let n=D.current,r=O.current,i=()=>{n?.open&&(typeof n.close==`function`?n.close():n.removeAttribute(`open`)),I(!1)};if(_||!r||!U.current||p(r)){i();return}let a=e=>{e.target===r&&e.propertyName===`transform`&&i()};return r.addEventListener(`transitionend`,a),()=>r.removeEventListener(`transitionend`,a)},[t,F,_]),(0,v.useLayoutEffect)(()=>{let e=O.current;if(z===`held`){B(t?`settling`:`exiting`);return}if(z===`exiting`){if(t){B(`settling`);return}e&&(e.style.transform=``),B(`idle`);return}if(z!==`settling`)return;if(!e){B(`idle`);return}if(e.style.transform=``,p(e)){B(`idle`);return}let n=t=>{t.target===e&&t.propertyName===`transform`&&B(`idle`)};return e.addEventListener(`transitionend`,n),()=>e.removeEventListener(`transitionend`,n)},[z,t]),(0,v.useEffect)(()=>{if(F&&!_)return document.documentElement.classList.add(`ds-action-sheet-lock-scroll`),()=>document.documentElement.classList.remove(`ds-action-sheet-lock-scroll`)},[F,_]);let J=e=>{(e===`escape`||i)&&l?.(e)},le=e=>{e.target===e.currentTarget&&t&&J(`scrim`)},ue=e=>{e.key===`Escape`&&(e.preventDefault(),e.stopPropagation(),J(`escape`))},de=e=>{e.preventDefault(),J(`escape`)},fe=e=>{if(!i||!t||j.current||!e.isPrimary||e.pointerType===`mouse`&&e.button!==0||!Number.isFinite(e.clientY))return;let n=O.current;n&&(j.current={pointerId:e.pointerId,slop:re(n),startY:e.clientY,originY:e.clientY,claimed:!1,previous:null,last:null})},pe=e=>{let t=j.current,n=O.current;if(t&&t.pointerId===e.pointerId&&n&&Number.isFinite(e.clientY)){if(!t.claimed){let n=e.clientY-t.startY;if(n<=0||n<t.slop)return;t.claimed=!0,t.originY=e.clientY,typeof e.currentTarget.setPointerCapture==`function`&&e.currentTarget.setPointerCapture(e.pointerId),B(`dragging`)}t.previous=t.last,t.last={y:e.clientY,time:e.timeStamp},n.style.transform=`translateY(${Math.max(0,e.clientY-t.originY)}px)`}},Y=(e,n)=>{let r=j.current;if(!r||r.pointerId!==e.pointerId)return;j.current=null;let i=O.current;if(!r.claimed||!i)return;let a=Number.isFinite(e.clientY)?Math.max(0,e.clientY-r.originY):0,o=i.getBoundingClientRect().height,s=o>0&&a>o*T,c=0;if(r.previous&&r.last&&r.last.time>r.previous.time&&(c=(r.last.y-r.previous.y)/(r.last.time-r.previous.time)),n||!t||!(s||c>E)){B(`settling`);return}B(`held`),J(`drag`)},X=e=>{e&&(H(e.id),k.current.get(e.id)?.focus())},me=e=>{if(q.length===0)return;let t=q.findIndex(e=>e.id===V);switch(e.key){case`ArrowDown`:e.preventDefault(),X(q[(t+1)%q.length]);break;case`ArrowUp`:e.preventDefault(),X(q[(t-1+q.length)%q.length]);break;case`Home`:e.preventDefault(),X(q[0]);break;case`End`:e.preventDefault(),X(q[q.length-1])}},he=e=>t=>{if(e.disabled){t.preventDefault();return}c?.(e.id)},ge=(e,t)=>{if(!e){if(t===`action`){P.current=!0;return}P.current||(t===`escape`?l?.(`escape`):(t===`outside`||t===`tab-out`||t===`focus-out`&&document.hasFocus())&&l?.(`scrim`))}},_e=e=>{let t=A.current;t&&!t.contains(e.target)&&t.click()},ve=e=>{P.current=!0,c?.(e)};if(!g)return null;if(_){if(!t)return null;let e={};for(let[t,n]of Object.entries(f??{})){let r=C[t];n&&r&&(e[r]=n)}return(0,y.jsx)(ne,{label:W,items:se(r),open:!0,anchor:M,onAction:ve,onOpenChange:ge,container:d,overrides:Object.keys(e).length>0?e:void 0})}if(!F)return null;let Z={},Q={},$={};for(let[e,t]of Object.entries(f??{})){let n=b[e];if(!t||!n)continue;Z[n]=a(t);let r=x[e];r&&(Q[r]=t);let i=S[e];i&&($[i]=t)}let ye=Object.keys($).length>0,be=e=>(0,y.jsxs)(`button`,{ref:t=>{t?k.current.set(e.id,t):k.current.delete(e.id)},type:`button`,role:`menuitem`,tabIndex:e.id===(V??q[0]?.id)?0:-1,"aria-disabled":e.disabled?`true`:void 0,"data-part":`item`,className:[`ds-action-sheet__item`,e.tone===`danger`?`ds-action-sheet__item--danger`:``,e.disabled?`ds-action-sheet__item--disabled`:``].filter(Boolean).join(` `),onFocus:()=>{!e.disabled&&V!==e.id&&H(e.id)},onClick:he(e),children:[e.icon?(0,y.jsx)(`span`,{className:`ds-action-sheet__icon`,"data-part":`itemIcon`,"aria-hidden":`true`,children:(0,y.jsx)(u,{name:e.icon,overrides:ye?$:void 0})}):null,(0,y.jsx)(`span`,{className:`ds-action-sheet__label`,children:e.label})]},e.id),xe=[`ds-action-sheet`,L&&t?`ds-action-sheet--visible`:``,z===`dragging`?`ds-action-sheet--dragging`:``,z===`settling`?`ds-action-sheet--settling`:``].filter(Boolean).join(` `);return(0,ce.createPortal)((0,y.jsxs)(`dialog`,{...m,ref:D,"data-ds":`ActionSheet`,className:xe,style:Object.keys(Z).length>0?Z:void 0,"aria-modal":`true`,"aria-label":W,onKeyDown:ue,onCancel:de,children:[(0,y.jsx)(`div`,{className:`ds-action-sheet__scrim`,"data-part":`scrim`,"aria-hidden":`true`,onClick:le}),(0,y.jsx)(te,{trapped:!0,autoFocus:`none`,restoreFocus:!0,active:t,returnFocusTo:M,children:(0,y.jsx)(`div`,{className:`ds-action-sheet__scope`,"data-part":`focusScope`,children:(0,y.jsxs)(`div`,{ref:O,className:`ds-action-sheet__surface`,"data-part":`surface`,children:[i||n?(0,y.jsxs)(`div`,{className:`ds-action-sheet__header`,"data-part":`header`,onPointerDown:fe,onPointerMove:pe,onPointerUp:e=>Y(e,!1),onPointerCancel:e=>Y(e,!0),children:[i?(0,y.jsx)(`span`,{className:`ds-action-sheet__handle`,"data-part":`handle`,"aria-hidden":`true`}):null,n?(0,y.jsx)(ee,{element:`p`,size:`sm`,tone:`muted`,"data-part":`heading`,overrides:Object.keys(Q).length>0?Q:void 0,children:n}):null]}):null,(0,y.jsxs)(`div`,{role:`menu`,"aria-label":W,"data-part":`list`,className:`ds-action-sheet__list`,onKeyDown:me,children:[G.map(be),G.length>0&&K.length>0?(0,y.jsx)(`div`,{role:`separator`,className:`ds-action-sheet__divider`,"data-part":`divider`}):null,K.map(be)]}),i?(0,y.jsxs)(y.Fragment,{children:[(0,y.jsx)(`div`,{className:`ds-action-sheet__divider`,"data-part":`divider`,"aria-hidden":`true`}),(0,y.jsx)(`div`,{className:`ds-action-sheet__cancel-row`,"data-part":`cancelButton`,onClick:_e,children:(0,y.jsx)(s,{ref:A,variant:`secondary`,label:o||w.cancelLabel,onClick:()=>J(`cancel`)})})]}):null]})})})]}),d??document.body)}var v,ce,y,b,x,S,C,w,T,E,D,O;function k(){return(k=e((()=>{v=t(),ce=n(),i(),o(),d(),l(),f(),c(),y=r(),b={scrim:`--ds-action-sheet-scrim`,shadow:`--ds-action-sheet-shadow`,radius:`--ds-action-sheet-radius`,itemPaddingBlock:`--ds-action-sheet-item-padding-block`,itemPaddingInline:`--ds-action-sheet-item-padding-inline`,itemGap:`--ds-action-sheet-item-gap`,headerPaddingBlock:`--ds-action-sheet-header-padding-block`,headerGap:`--ds-action-sheet-header-gap`,handleHeight:`--ds-action-sheet-handle-height`,handleWidth:`--ds-action-sheet-handle-width`,handleRadius:`--ds-action-sheet-handle-radius`,titleSize:`--ds-action-sheet-title-size`,fontFamily:`--ds-action-sheet-font-family`,fontSize:`--ds-action-sheet-font-size`,itemIconSize:`--ds-action-sheet-item-icon-size`,lineHeight:`--ds-action-sheet-line-height`,divider:`--ds-action-sheet-divider`,dividerWidth:`--ds-action-sheet-divider-width`,layer:`--ds-action-sheet-layer`,enter:`--ds-action-sheet-enter`,exit:`--ds-action-sheet-exit`},x={titleSize:`fontSize`,fontFamily:`fontFamily`,lineHeight:`lineHeight`},S={itemIconSize:`size`},C={shadow:`shadow`,radius:`radius`,itemPaddingBlock:`itemPaddingBlock`,itemPaddingInline:`itemPaddingInline`,itemGap:`itemGap`,fontFamily:`fontFamily`,fontSize:`fontSize`,lineHeight:`lineHeight`,layer:`layer`,enter:`enter`,divider:`separator`},w={cancelLabel:`Cancel`,defaultLabel:`Actions`},T=.25,E=1.5,D=`--space-1`,O=()=>()=>{},_.__docgenInfo={description:`ActionSheet — contextual actions on an item: a bottom sheet of menu items at or below\r
\`layout.maxWidth.prose\`, a Menu anchored to the opener above it.\r
\r
When to use: Use an ActionSheet for contextual actions on an item — share, rename, duplicate,\r
delete — opened from an overflow Button (\`iconOnly\`, label "More actions") or a long-press. Keep\r
it to what fits without scrolling; more than eight actions means the item needs its own screen.\r
Put destructive actions last with \`tone: danger\`.`,methods:[],displayName:`ActionSheet`,props:{open:{required:!0,tsType:{name:`boolean`},description:"Controlled only — there is no uncontrolled mode; the consumer owns `open`, the sheet requests a\r\ndismissal through `onClose` and reports a choice through `onAction`, and the consumer sets\r\n`open` to false for both."},heading:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:'What the actions apply to ("Photo.jpg"), shown muted above the list. Also the accessible name;\r\nwhen omitted the name is `copy.defaultLabel`.'},actions:{required:!0,tsType:{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{\r
  id: string;\r
  label: string;\r
  icon?: IconName | undefined;\r
  tone?: 'default' | 'danger' | undefined;\r
  disabled?: boolean | undefined;\r
}`,signature:{properties:[{key:`id`,value:{name:`string`,required:!0}},{key:`label`,value:{name:`string`,required:!0}},{key:`icon`,value:{name:`union`,raw:`IconName | undefined`,elements:[{name:`union`,raw:`| 'check'\r
| 'dash'\r
| 'chevron-right'\r
| 'chevron-down'\r
| 'chevron-up'\r
| 'chevron-left'\r
| 'close'\r
| 'plus'\r
| 'minus'\r
| 'info'\r
| 'success'\r
| 'warning'\r
| 'danger'\r
| 'external'\r
| 'ellipsis'\r
| 'search'\r
| 'arrow-right'\r
| 'arrow-left'\r
| 'calendar'\r
| 'menu'\r
| 'list'\r
| 'grid'\r
| 'play'\r
| 'pause'\r
| 'folder'\r
| 'file'`,elements:[{name:`literal`,value:`'check'`},{name:`literal`,value:`'dash'`},{name:`literal`,value:`'chevron-right'`},{name:`literal`,value:`'chevron-down'`},{name:`literal`,value:`'chevron-up'`},{name:`literal`,value:`'chevron-left'`},{name:`literal`,value:`'close'`},{name:`literal`,value:`'plus'`},{name:`literal`,value:`'minus'`},{name:`literal`,value:`'info'`},{name:`literal`,value:`'success'`},{name:`literal`,value:`'warning'`},{name:`literal`,value:`'danger'`},{name:`literal`,value:`'external'`},{name:`literal`,value:`'ellipsis'`},{name:`literal`,value:`'search'`},{name:`literal`,value:`'arrow-right'`},{name:`literal`,value:`'arrow-left'`},{name:`literal`,value:`'calendar'`},{name:`literal`,value:`'menu'`},{name:`literal`,value:`'list'`},{name:`literal`,value:`'grid'`},{name:`literal`,value:`'play'`},{name:`literal`,value:`'pause'`},{name:`literal`,value:`'folder'`},{name:`literal`,value:`'file'`}]},{name:`undefined`}],required:!1}},{key:`tone`,value:{name:`union`,raw:`'default' | 'danger' | undefined`,elements:[{name:`literal`,value:`'default'`},{name:`literal`,value:`'danger'`},{name:`undefined`}],required:!1}},{key:`disabled`,value:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}],required:!1}}]}}],raw:`ActionSheetAction[]`},description:`Two to about eight actions. \`danger\` actions are visually distinct and grouped last: the\r
component does the grouping, so the consumer may pass them in any order — the default actions\r
render in the order given, then the danger ones in the order given. The count is guidance, not\r
enforced: no dev warning outside that range.`},dismissible:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Escape, the scrim, the cancel row and the drag all request close. When false, as in Dialog: the\r
Cancel row and the divider above it are not rendered, the drag handle is not rendered, the scrim\r
and the drag do nothing, and Escape still reports through onClose; with no \`heading\` either, the\r
header has nothing to show and is not rendered at all. It gates the sheet presentation only —\r
the wide Menu presentation has no scrim, drag or cancel row, and clicking outside always closes it.`,defaultValue:{value:`true`,computed:!1}},cancelLabel:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:"Label of the explicit cancel row on phones. Defaults to `copy.cancelLabel`."},onAction:{required:!1,tsType:{name:`union`,raw:`((id: string) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"An action was chosen; receives its `id`. The consumer performs it and closes."},onClose:{required:!1,tsType:{name:`union`,raw:`((reason: ActionSheetCloseReason) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Dismissed without choosing: reason `escape`, `scrim`, `cancel`, or `drag`."},container:{required:!1,tsType:{name:`union`,raw:`HTMLElement | undefined`,elements:[{name:`HTMLElement`},{name:`undefined`}]},description:"Portal target (platform prop, not in the schema). Defaults to `document.body`; forwarded to the wide Menu."},overrides:{required:!1,tsType:{name:`union`,raw:`Partial<Record<ActionSheetOverridableBinding, TokenRef | undefined>> | undefined`,elements:[{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'scrim'\r
| 'shadow'\r
| 'radius'\r
| 'itemPaddingBlock'\r
| 'itemPaddingInline'\r
| 'itemGap'\r
| 'headerPaddingBlock'\r
| 'headerGap'\r
| 'handleHeight'\r
| 'handleWidth'\r
| 'handleRadius'\r
| 'titleSize'\r
| 'fontFamily'\r
| 'fontSize'\r
| 'itemIconSize'\r
| 'lineHeight'\r
| 'divider'\r
| 'dividerWidth'\r
| 'layer'\r
| 'enter'\r
| 'exit'`,elements:[{name:`literal`,value:`'scrim'`},{name:`literal`,value:`'shadow'`},{name:`literal`,value:`'radius'`},{name:`literal`,value:`'itemPaddingBlock'`},{name:`literal`,value:`'itemPaddingInline'`},{name:`literal`,value:`'itemGap'`},{name:`literal`,value:`'headerPaddingBlock'`},{name:`literal`,value:`'headerGap'`},{name:`literal`,value:`'handleHeight'`},{name:`literal`,value:`'handleWidth'`},{name:`literal`,value:`'handleRadius'`},{name:`literal`,value:`'titleSize'`},{name:`literal`,value:`'fontFamily'`},{name:`literal`,value:`'fontSize'`},{name:`literal`,value:`'itemIconSize'`},{name:`literal`,value:`'lineHeight'`},{name:`literal`,value:`'divider'`},{name:`literal`,value:`'dividerWidth'`},{name:`literal`,value:`'layer'`},{name:`literal`,value:`'enter'`},{name:`literal`,value:`'exit'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<ActionSheetOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<ActionSheetOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:`Per-instance style overrides: each entry sets the matching CSS hook to that token, inline.`},ref:{required:!1,tsType:{name:`union`,raw:`Ref<HTMLDialogElement> | undefined`,elements:[{name:`Ref`,elements:[{name:`HTMLDialogElement`}],raw:`Ref<HTMLDialogElement>`},{name:`undefined`}]},description:``}},composes:[`Omit`]}})))()}function A(e){let[t,n]=(0,M.useState)(e.open);return(0,M.useEffect)(()=>n(e.open),[e.open]),(0,N.jsx)(_,{...e,open:t,onAction:t=>{e.onAction?.(t),n(!1)},onClose:t=>{e.onClose?.(t),n(!1)}})}function j(e){let[t,n]=(0,M.useState)(e.open);return(0,M.useEffect)(()=>n(e.open),[e.open]),(0,N.jsxs)(N.Fragment,{children:[(0,N.jsx)(s,{variant:`secondary`,iconOnly:!0,label:`More actions`,leadingIcon:(0,N.jsx)(u,{name:`ellipsis`}),onClick:()=>n(!0)}),(0,N.jsx)(_,{...e,open:t,onAction:t=>{e.onAction?.(t),n(!1)},onClose:t=>{e.onClose?.(t),n(!1)}})]})}var M,N,P,F,I,L,R,z,B,V,H,U;function W(){return(W=e((()=>{M=t(),k(),o(),l(),N=r(),P=[{id:`share`,label:`Share`,icon:`external`},{id:`rename`,label:`Rename`},{id:`duplicate`,label:`Duplicate`},{id:`delete`,label:`Delete photo`,icon:`danger`,tone:`danger`}],F={title:`ActionSheet/React`,component:_,tags:[`autodocs`],render:e=>(0,N.jsx)(A,{...e}),args:{open:!0,heading:`Photo.jpg`,actions:P},argTypes:{onAction:{action:`action`},onClose:{action:`close`}}},I={},L={args:{open:!0,heading:`Photo.jpg`,actions:[{id:`share`,label:`Share`,icon:`external`},{id:`rename`,label:`Rename`},{id:`duplicate`,label:`Duplicate`},{id:`delete`,label:`Delete photo`,icon:`danger`,tone:`danger`}]}},R={args:{open:!0,heading:void 0,actions:[{id:`copy`,label:`Copy link`},{id:`open`,label:`Open in new tab`}]}},z={args:{open:!0,heading:`Invoice 4821`,cancelLabel:`Not now`,actions:[{id:`download`,label:`Download`},{id:`void`,label:`Void invoice`,tone:`danger`,disabled:!0}]}},B={args:{dismissible:!1}},V={args:{open:!1}},H={args:{open:!0,heading:`Photo.jpg`,actions:P},render:e=>(0,N.jsx)(j,{...e})},U=[`Default`,`PhotoActions`,`UnnamedSheet`,`WithAnUnavailableAction`,`DismissibleFalse`,`Closed`,`Keyboard`],I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{}`,...I.parameters?.docs?.source},description:{story:`Open, with the photo-actions example's args.`,...I.parameters?.docs?.description}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source},description:{story:`Contextual actions on an item, with the destructive one last.`,...L.parameters?.docs?.description}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source},description:{story:`A sheet with no heading, named by copy.defaultLabel for assistive technology.`,...R.parameters?.docs?.description}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source},description:{story:`An action that is shown but cannot be used here, announced as disabled rather than hidden.`,...z.parameters?.docs?.description}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    dismissible: false
  }
}`,...B.parameters?.docs?.source},description:{story:`No Cancel row, no handle; the scrim does nothing and Escape still reports through onClose.`,...B.parameters?.docs?.description}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    open: false
  }
}`,...V.parameters?.docs?.source},description:{story:"The controlled sheet with `open` false renders nothing.",...V.parameters?.docs?.description}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Photo.jpg',
    actions: PHOTO_ACTIONS
  },
  render: args => <KeyboardConsumer {...args} />
}`,...H.parameters?.docs?.source},description:{story:`Open with its "More actions" trigger, four focusable actions and the Cancel row, for the keyboard gate.`,...H.parameters?.docs?.description}}}})))()}W();export{V as Closed,I as Default,B as DismissibleFalse,H as Keyboard,L as PhotoActions,R as UnnamedSheet,z as WithAnUnavailableAction,U as __namedExportsOrder,F as default};