import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t}from"./iframe-Bb3rYm-L.js";import{t as n}from"./react-dom-Cd1api_3.js";import{t as r}from"./jsx-runtime-DeHZSEgm.js";import{n as i,t as a}from"./names-szlHjJ4U.js";import{n as o,t as s}from"./Button-QLx-usSq.js";import{n as c,t as l}from"./Text--Q5VwBjk.js";import{n as u,t as d}from"./Icon-CBlYQ3eE.js";import{n as f,t as ee}from"./FocusScope-wimxzjas.js";import{n as p,t as m}from"./Menu-B7TVz2wx.js";function h(e){let t={},n={};for(let r of Object.keys(e)){let i=e[r];if(!i)continue;let o=w[r];o&&(t[o]=a(i)),r===`titleSize`&&(n.fontSize=i),r===`fontFamily`&&(n.fontFamily=i),r===`lineHeight`&&(n.lineHeight=i)}return{rootStyle:t,textOverrides:n}}function g(){return typeof window<`u`&&typeof window.matchMedia==`function`&&window.matchMedia(`(prefers-reduced-motion: reduce)`).matches}function _(){let[e,t]=(0,x.useState)(!1);return(0,x.useEffect)(()=>{if(typeof window>`u`||typeof window.matchMedia!=`function`)return;let e=getComputedStyle(document.documentElement).getPropertyValue(`--layout-max-width-prose`).trim();if(!e)return;let n=window.matchMedia(`(min-width: ${e})`),r=()=>t(n.matches);return r(),n.addEventListener(`change`,r),()=>n.removeEventListener(`change`,r)},[]),e}function v(e){return{id:e.id,label:e.label,icon:e.icon,tone:e.tone,disabled:e.disabled}}function y(e){return{normal:e.filter(e=>e.tone!==`danger`),danger:e.filter(e=>e.tone===`danger`)}}function b(e){let{normal:t,danger:n}=y(e),r=t.map(v);return n.length>0&&(r.push({separator:!0}),r.push(...n.map(v))),r}var x,S,C,w,T,E;function D(){return(D=e((()=>{x=t(),S=n(),i(),o(),f(),u(),p(),c(),C=r(),w={scrim:`--ds-action-sheet-scrim`,shadow:`--ds-action-sheet-shadow`,radius:`--ds-action-sheet-radius`,itemPaddingBlock:`--ds-action-sheet-item-padding-block`,itemPaddingInline:`--ds-action-sheet-item-padding-inline`,itemGap:`--ds-action-sheet-item-gap`,headerPaddingBlock:`--ds-action-sheet-header-padding-block`,fontFamily:`--ds-action-sheet-font-family`,fontSize:`--ds-action-sheet-font-size`,lineHeight:`--ds-action-sheet-line-height`,divider:`--ds-action-sheet-divider`,dividerWidth:`--ds-action-sheet-divider-width`,maxWidth:`--ds-action-sheet-max-width`,layer:`--ds-action-sheet-layer`,enter:`--ds-action-sheet-enter`,exit:`--ds-action-sheet-exit`},T={cancelLabel:`Cancel`,defaultLabel:`Actions`},E=function({ref:e,open:t,heading:n,actions:r,dismissible:i=!0,cancelLabel:a,onAction:o,onClose:c,container:u,overrides:f,className:p,style:v,...w}){let E=_(),D=`ds-action-sheet${(0,x.useId)()}-list`,O=(0,x.useRef)(null);(0,x.useImperativeHandle)(e,()=>O.current,[]);let k=(0,x.useRef)(null),A=(0,x.useRef)(new Map),j=(0,x.useRef)(null),M=(0,x.useRef)(null),[N,P]=(0,x.useState)(t),[F,I]=(0,x.useState)(!1),[L,R]=(0,x.useState)(null),z=n||T.defaultLabel,{normal:B,danger:V}=y(r);(0,x.useEffect)(()=>{t&&P(!0)},[t]),(0,x.useEffect)(()=>{if(!t||!E)return;let e=document.activeElement;e instanceof HTMLElement&&(M.current=e)},[t,E]),(0,x.useLayoutEffect)(()=>{if(!N||E)return;let e=O.current;if(!e)return;e.open||=(e.showModal?.(),!0);let t=r.find(e=>!e.disabled);if(t?(R(t.id),A.current.get(t.id)?.focus()):e.focus(),g()){I(!0);return}let n=requestAnimationFrame(()=>I(!0));return()=>cancelAnimationFrame(n)},[N,E]),(0,x.useEffect)(()=>{if(t||!N||E)return;I(!1);let e=O.current,n=()=>{P(!1),e?.close?.(),e&&(e.open=!1)};if(g()){n();return}let r=k.current,i=e=>{e.target===r&&e.propertyName===`transform`&&n()};return r?.addEventListener(`transitionend`,i),()=>r?.removeEventListener(`transitionend`,i)},[t,N,E]),(0,x.useEffect)(()=>{if(N&&!E)return document.documentElement.classList.add(`ds-action-sheet-lock-scroll`),()=>document.documentElement.classList.remove(`ds-action-sheet-lock-scroll`)},[N,E]);let H=e=>{(e===`escape`||i)&&c?.(e)},U=e=>{e.preventDefault(),H(`escape`)},W=e=>{e.target===O.current&&H(`scrim`)},G=()=>H(`cancel`),K=e=>{if(e.target.closest(`button`))return;let t=k.current;t&&(e.currentTarget.setPointerCapture(e.pointerId),j.current={startY:e.clientY,startTime:e.timeStamp},t.style.transition=`none`)},q=e=>{let t=j.current,n=k.current;if(!t||!n)return;let r=Math.max(0,e.clientY-t.startY);n.style.transform=`translateY(${r}px)`},J=e=>{let t=j.current,n=k.current;if(j.current=null,!t||!n)return;let r=Math.max(0,e.clientY-t.startY),i=r/Math.max(1,e.timeStamp-t.startTime),a=r/(n.getBoundingClientRect().height||1)>.25||i>.5;n.style.transition=g()?`none`:``,n.style.transform=``,a&&H(`drag`)},Y=e=>{R(e),A.current.get(e)?.focus()},X=e=>{e.disabled||o?.(e.id)},te=e=>{let t=r.filter(e=>!e.disabled);if(t.length===0)return;let n=t.findIndex(e=>e.id===L);switch(e.key){case`ArrowDown`:e.preventDefault(),Y(t[(n+1)%t.length].id);break;case`ArrowUp`:e.preventDefault(),Y(t[(n-1+t.length)%t.length].id);break;case`Home`:e.preventDefault(),Y(t[0].id);break;case`End`:e.preventDefault(),Y(t[t.length-1].id);break;case`Enter`:case` `:e.preventDefault(),n!==-1&&X(t[n])}},ne=e=>{e.disabled||Y(e.id)},re=e=>t=>{if(e.disabled){t.preventDefault();return}X(e)},ie=({open:e,reason:t})=>{e||t===`action`||H(t===`outside`?`scrim`:`escape`)},ae=e=>{o?.(e)},Z=e=>{let t=[`ds-action-sheet__item`,e.tone===`danger`?`ds-action-sheet__item--danger`:null,e.disabled?`ds-action-sheet__item--disabled`:null].filter(Boolean).join(` `);return(0,C.jsxs)(`button`,{ref:t=>{t?A.current.set(e.id,t):A.current.delete(e.id)},type:`button`,role:`menuitem`,id:`${D}-item-${e.id}`,tabIndex:e.id===L?0:-1,"aria-disabled":e.disabled?`true`:void 0,"data-part":`item`,className:t,onMouseEnter:()=>ne(e),onClick:re(e),children:[e.icon?(0,C.jsx)(`span`,{className:`ds-action-sheet__item-icon`,"data-part":`itemIcon`,"aria-hidden":`true`,children:(0,C.jsx)(d,{name:e.icon,inline:!0})}):null,(0,C.jsx)(`span`,{className:`ds-action-sheet__item-label`,children:e.label})]},e.id)},{rootStyle:Q,textOverrides:$}=f?h(f):{rootStyle:void 0,textOverrides:{}};if(E)return t?(0,C.jsx)(m,{label:z,items:b(r),open:!0,anchor:M,onAction:ae,onOpenChange:ie,container:u}):null;if(!N)return null;let oe=[`ds-action-sheet`,F?`ds-action-sheet--visible`:null,p??null].filter(Boolean).join(` `),se=Q||v?{...Q,...v}:void 0,ce=(0,C.jsx)(`dialog`,{...w,ref:O,"data-ds":`ActionSheet`,className:oe,style:se,"aria-modal":`true`,onCancel:U,onClick:W,children:(0,C.jsx)(ee,{trapped:!0,autoFocus:`none`,restoreFocus:!0,children:(0,C.jsxs)(`div`,{className:`ds-action-sheet__surface`,ref:k,"data-part":`surface`,onPointerDown:K,onPointerMove:q,onPointerUp:J,onPointerCancel:J,children:[(0,C.jsxs)(`div`,{className:`ds-action-sheet__header`,"data-part":`header`,children:[(0,C.jsx)(`span`,{className:`ds-action-sheet__handle`,"data-part":`handle`,"aria-hidden":`true`}),n?(0,C.jsx)(l,{size:`sm`,tone:`muted`,"data-part":`heading`,className:`ds-action-sheet__heading`,overrides:Object.keys($).length?$:void 0,children:n}):null]}),(0,C.jsxs)(`div`,{role:`menu`,id:D,"aria-label":z,"data-part":`list`,className:`ds-action-sheet__list`,onKeyDown:te,children:[B.map(Z),V.length>0?(0,C.jsx)(`div`,{role:`separator`,className:`ds-action-sheet__divider`,"aria-hidden":`true`}):null,V.map(Z)]}),(0,C.jsx)(`div`,{role:`separator`,className:`ds-action-sheet__divider`,"aria-hidden":`true`}),(0,C.jsx)(`div`,{className:`ds-action-sheet__cancel-row`,children:(0,C.jsx)(s,{variant:`secondary`,label:a||T.cancelLabel,"data-part":`cancelButton`,className:`ds-action-sheet__cancel`,onClick:G})})]})})});return(0,S.createPortal)(ce,u??document.body)},E.__docgenInfo={description:`ActionSheet — Design Schema, category: overlay.

When to use:
Use an ActionSheet for contextual actions on an item — share, rename, duplicate, delete — opened
from an overflow Button (\`iconOnly\`, label "More actions") or a long-press. Keep it to what fits
without scrolling; more than eight actions means the item needs its own screen. Put destructive
actions last with \`tone: danger\`.`,methods:[],displayName:`ActionSheet`,props:{open:{required:!0,tsType:{name:`boolean`},description:`Controlled visibility.`},heading:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:'What the actions apply to ("Photo.jpg"), shown muted above the list. Also the accessible name;\nwhen omitted the name is `copy.defaultLabel`.'},actions:{required:!0,tsType:{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{
  id: string;
  label: string;
  icon?: IconName | undefined;
  tone?: ActionSheetActionTone | undefined;
  disabled?: boolean | undefined;
}`,signature:{properties:[{key:`id`,value:{name:`string`,required:!0}},{key:`label`,value:{name:`string`,required:!0}},{key:`icon`,value:{name:`union`,raw:`IconName | undefined`,elements:[{name:`union`,raw:`| 'check'
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
| 'file'`,elements:[{name:`literal`,value:`'check'`},{name:`literal`,value:`'dash'`},{name:`literal`,value:`'chevron-right'`},{name:`literal`,value:`'chevron-down'`},{name:`literal`,value:`'chevron-up'`},{name:`literal`,value:`'chevron-left'`},{name:`literal`,value:`'close'`},{name:`literal`,value:`'plus'`},{name:`literal`,value:`'minus'`},{name:`literal`,value:`'info'`},{name:`literal`,value:`'success'`},{name:`literal`,value:`'warning'`},{name:`literal`,value:`'danger'`},{name:`literal`,value:`'external'`},{name:`literal`,value:`'ellipsis'`},{name:`literal`,value:`'search'`},{name:`literal`,value:`'arrow-right'`},{name:`literal`,value:`'arrow-left'`},{name:`literal`,value:`'calendar'`},{name:`literal`,value:`'menu'`},{name:`literal`,value:`'list'`},{name:`literal`,value:`'grid'`},{name:`literal`,value:`'play'`},{name:`literal`,value:`'pause'`},{name:`literal`,value:`'folder'`},{name:`literal`,value:`'file'`}]},{name:`undefined`}],required:!1}},{key:`tone`,value:{name:`union`,raw:`ActionSheetActionTone | undefined`,elements:[{name:`union`,raw:`'default' | 'danger'`,elements:[{name:`literal`,value:`'default'`},{name:`literal`,value:`'danger'`}]},{name:`undefined`}],required:!1}},{key:`disabled`,value:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}],required:!1}}]}}],raw:`ActionSheetAction[]`},description:"Two to about eight actions. `danger` actions are visually distinct and grouped last."},dismissible:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Escape, the scrim, the cancel row and the drag all request close; Escape still reports through onClose when false, as in Dialog.`,defaultValue:{value:`true`,computed:!1}},cancelLabel:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:"Label of the explicit cancel row on phones. Defaults to `copy.cancelLabel`."},onAction:{required:!1,tsType:{name:`union`,raw:`((id: string) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"An action was chosen; receives its `id`. The consumer performs it and closes."},onClose:{required:!1,tsType:{name:`union`,raw:`((reason: ActionSheetCloseReason) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Dismissed without choosing: reason `escape`, `scrim`, `cancel`, or `drag`."},container:{required:!1,tsType:{name:`union`,raw:`HTMLElement | undefined`,elements:[{name:`HTMLElement`},{name:`undefined`}]},description:"Portal target for the sheet's DOM node. Defaults to `document.body`."},overrides:{required:!1,tsType:{name:`union`,raw:`Partial<Record<ActionSheetOverridableBinding, TokenRef | undefined>> | undefined`,elements:[{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'scrim'
| 'shadow'
| 'radius'
| 'itemPaddingBlock'
| 'itemPaddingInline'
| 'itemGap'
| 'headerPaddingBlock'
| 'titleSize'
| 'fontFamily'
| 'fontSize'
| 'lineHeight'
| 'divider'
| 'dividerWidth'
| 'maxWidth'
| 'layer'
| 'enter'
| 'exit'`,elements:[{name:`literal`,value:`'scrim'`},{name:`literal`,value:`'shadow'`},{name:`literal`,value:`'radius'`},{name:`literal`,value:`'itemPaddingBlock'`},{name:`literal`,value:`'itemPaddingInline'`},{name:`literal`,value:`'itemGap'`},{name:`literal`,value:`'headerPaddingBlock'`},{name:`literal`,value:`'titleSize'`},{name:`literal`,value:`'fontFamily'`},{name:`literal`,value:`'fontSize'`},{name:`literal`,value:`'lineHeight'`},{name:`literal`,value:`'divider'`},{name:`literal`,value:`'dividerWidth'`},{name:`literal`,value:`'maxWidth'`},{name:`literal`,value:`'layer'`},{name:`literal`,value:`'enter'`},{name:`literal`,value:`'exit'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<ActionSheetOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<ActionSheetOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:`Per-instance style overrides: each entry sets the matching CSS hook to that token, inline.`},ref:{required:!1,tsType:{name:`union`,raw:`Ref<HTMLDialogElement> | undefined`,elements:[{name:`Ref`,elements:[{name:`HTMLDialogElement`}],raw:`Ref<HTMLDialogElement>`},{name:`undefined`}]},description:``}},composes:[`Omit`]}})))()}function O(e){let[t,n]=(0,k.useState)(!0);return(0,A.jsxs)(`div`,{children:[(0,A.jsx)(s,{label:`More actions`,iconOnly:!0,leadingIcon:(0,A.jsx)(d,{name:`ellipsis`,inline:!0}),onClick:()=>n(!0)}),(0,A.jsx)(E,{open:t,heading:`Photo.jpg`,actions:M,onAction:()=>n(!1),onClose:()=>n(!1),...e})]})}var k,A,j,M,N,P,F,I,L,R;function z(){return(z=e((()=>{k=t(),D(),o(),u(),A=r(),j={title:`ActionSheet/React`,component:E,tags:[`autodocs`]},M=[{id:`share`,label:`Share`,icon:`external`},{id:`rename`,label:`Rename`},{id:`duplicate`,label:`Duplicate`},{id:`delete`,label:`Delete photo`,icon:`danger`,tone:`danger`}],N={render:()=>(0,A.jsx)(O,{})},P={render:()=>(0,A.jsx)(O,{heading:void 0})},F={render:()=>(0,A.jsx)(O,{dismissible:!1})},I={render:()=>(0,A.jsx)(O,{actions:[{id:`share`,label:`Share`,icon:`external`},{id:`rename`,label:`Rename`,disabled:!0},{id:`duplicate`,label:`Duplicate`},{id:`delete`,label:`Delete photo`,icon:`danger`,tone:`danger`}]})},L={render:()=>(0,A.jsx)(E,{open:!0,heading:`Photo.jpg`,actions:M,onAction:()=>{},onClose:()=>{}})},R=[`Default`,`WithoutHeading`,`NotDismissible`,`DisabledAction`,`Keyboard`],N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: () => <ActionSheetDemo />
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  render: () => <ActionSheetDemo heading={undefined} />
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  render: () => <ActionSheetDemo dismissible={false} />
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  render: () => <ActionSheetDemo actions={[{
    id: 'share',
    label: 'Share',
    icon: 'external'
  }, {
    id: 'rename',
    label: 'Rename',
    disabled: true
  }, {
    id: 'duplicate',
    label: 'Duplicate'
  }, {
    id: 'delete',
    label: 'Delete photo',
    icon: 'danger',
    tone: 'danger'
  }]} />
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  render: () => <ActionSheet open heading="Photo.jpg" actions={PHOTO_ACTIONS} onAction={() => {}} onClose={() => {}} />
}`,...L.parameters?.docs?.source}}}})))()}z();export{N as Default,I as DisabledAction,L as Keyboard,F as NotDismissible,P as WithoutHeading,R as __namedExportsOrder,j as default};