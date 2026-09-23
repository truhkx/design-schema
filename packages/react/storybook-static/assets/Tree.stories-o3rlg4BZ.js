import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t}from"./iframe-BaAix2rE.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./names-szlHjJ4U.js";import{n as a,t as ee}from"./Button-CXwJSRqr.js";import{n as o,t as s}from"./Heading-CeutS2sZ.js";import{n as c,t as l}from"./Text-BmznDQS2.js";import{n as u,t as d}from"./Icon-CNCpSr-m.js";import{n as f,t as te}from"./Link-DHkk5TA_.js";function ne(e){let t={};for(let n of Object.keys(e)){let r=S[n],a=e[n];r&&a&&(t[r]=i(a))}return t}function re(e,t){return e.replace(/\{(\w+)\}/g,(e,n)=>n in t?String(t[n]):e)}function p(e){return e.children===`lazy`||Array.isArray(e.children)&&e.children.length>0}function m(e){return Array.isArray(e.children)?e.children:[]}function h(e,t=[]){for(let n of e)t.push(n),h(m(n),t);return t}function g(e){return h(m(e)).filter(e=>!e.disabled)}function ie(e,t){return t?[e.id,...g(e).map(e=>e.id)]:[e.id]}function ae(e,t){for(let n of e){let e=m(n);if(e.length===0||(ae(e,t),n.disabled))continue;let r=g(n);r.length!==0&&(r.every(e=>t.has(e.id))?t.add(n.id):t.delete(n.id))}}function _({ref:e,label:t,showLabel:n=!1,headingLevel:r=`2`,nodes:i,expanded:a,defaultExpanded:o,selectable:c=`single`,selected:u,defaultSelected:f,selectChildren:_=!1,selectOnFocus:S=!1,showGuides:C=!0,overrides:w,onSelectionChange:T,onExpandChange:E,onExpand:D,onActivate:O,...k}){let A=(0,v.useId)(),j=`${A}-heading`,M=(0,v.useRef)(new Map),N=(0,v.useRef)({buffer:``,timer:void 0}),P=(0,v.useMemo)(()=>h(i),[i]),F=(0,v.useMemo)(()=>new Map(P.map(e=>[e.id,e])),[P]),[I,L]=(0,v.useState)(o??[]),[R,z]=(0,v.useState)([]),B=a??I,V=(0,v.useMemo)(()=>{let e=new Set,t=[],n=n=>{e.has(n)||(e.add(n),t.push(n))};for(let e of B)e!==x&&n(e);if(B.includes(x)){let e=t=>{for(let r of t)Array.isArray(r.children)&&r.children.length!==0&&(n(r.id),e(r.children))};e(i)}return t},[B,i]),H=(0,v.useMemo)(()=>new Set(V.filter(e=>F.get(e)?.children!==`lazy`||R.includes(e))),[V,R,F]),U=(e,t)=>{let n=t.filter(e=>F.get(e)?.children===`lazy`);n.length>0&&z(e=>[...e,...n.filter(t=>!e.includes(t))]);for(let e of n)D?.(e);a===void 0&&L(e),E?.(e)},W=e=>{if(H.has(e)){U(V.filter(t=>t!==e),[]);return}U(V.includes(e)?V:[...V,e],[e])},se=(0,v.useMemo)(()=>{let e=[],t=(n,r,i)=>{for(let a of n)e.push({node:a,level:r,parentId:i,siblings:n}),H.has(a.id)&&t(m(a),r+1,a.id)};return t(i,1,null),e},[i,H]),G=(0,v.useMemo)(()=>se.filter(e=>!e.node.disabled),[se]),[ce,le]=(0,v.useState)(f??[]),K=u??ce,q=(0,v.useMemo)(()=>new Set(K),[K]),J=e=>{c===`multiple`&&_&&ae(i,e);let t=P.map(e=>e.id).filter(t=>e.has(t));for(let n of e)F.has(n)||t.push(n);t.length===K.length&&t.every(e=>q.has(e))||(u===void 0&&le(t),T?.(t))},Y=e=>J(new Set([e])),ue=e=>{let t=new Set(K),n=ie(e,_);if(me(e)===`true`)for(let e of n)t.delete(e);else for(let e of n)t.add(e);J(t)},de=e=>{let t=new Set(K);for(let n of ie(e,_))t.add(n);J(t)},fe=e=>{e.disabled||(c===`single`?Y(e.id):c===`multiple`&&ue(e))},pe=new Map;function me(e){let t=pe.get(e.id);if(t)return t;let n=q.has(e.id)?`true`:`false`;if(_){let t=g(e);if(t.length>0){let e=t.filter(e=>q.has(e.id)).length;n=e===t.length?`true`:e>0?`mixed`:`false`}}return pe.set(e.id,n),n}let[X,Z]=(0,v.useState)(void 0),he=(X!==void 0&&G.some(e=>e.node.id===X)?X:void 0)??G.find(e=>q.has(e.node.id))?.node.id??G[0]?.node.id,Q=e=>{Z(e),M.current.get(e)?.focus()},$=e=>{e&&(Q(e.node.id),c===`single`&&S&&Y(e.node.id))},ge=e=>{e.disabled||(c===`single`&&Y(e.id),e.href?M.current.get(e.id)?.querySelector(`[data-part="link"] a`)?.click():O?.(e.id))},_e=(e,t)=>{let n=N.current;n.timer!==void 0&&clearTimeout(n.timer),n.timer=setTimeout(()=>{n.buffer=``,n.timer=void 0},oe),n.buffer+=e.toLowerCase();let r=n.buffer.length===1?t+1:t;for(let e=0;e<G.length;e++){let t=G[(r+e)%G.length];if(t&&t.node.label.toLowerCase().startsWith(n.buffer)){$(t);return}}},ve=e=>{let t=e.target.closest(`[role="treeitem"]`);if(!t)return;let n=G.findIndex(e=>M.current.get(e.node.id)===t),r=G[n];if(!r)return;let{node:i}=r,a=c===`multiple`;if((e.ctrlKey||e.metaKey)&&!e.altKey&&e.code===`KeyA`){if(!a)return;e.preventDefault();let t=new Set(K);for(let e of G)t.add(e.node.id);J(t);return}switch(e.key){case`ArrowDown`:case`ArrowUp`:{e.preventDefault();let t=G[e.key===`ArrowDown`?n+1:n-1];if(!t)return;a&&e.shiftKey?(Q(t.node.id),de(t.node)):$(t);return}case`ArrowRight`:if(e.preventDefault(),!p(i))return;if(!H.has(i.id))W(i.id);else{let e=m(i).find(e=>!e.disabled);e&&$(G.find(t=>t.node.id===e.id))}return;case`ArrowLeft`:e.preventDefault(),p(i)&&H.has(i.id)?W(i.id):r.parentId!==null&&$(G.find(e=>e.node.id===r.parentId));return;case`Home`:e.preventDefault(),$(G[0]);return;case`End`:e.preventDefault(),$(G[G.length-1]);return;case`Enter`:e.preventDefault(),ge(i);return;case` `:if(c===`none`)return;e.preventDefault(),fe(i);return;case`*`:{e.preventDefault();let t=r.siblings.filter(e=>!e.disabled&&p(e)&&!H.has(e.id)).map(e=>e.id);t.length>0&&U([...V,...t.filter(e=>!V.includes(e))],t);return}default:e.key.length===1&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&(e.preventDefault(),_e(e.key,n))}},ye=e=>{e.currentTarget.contains(e.relatedTarget)||Z(void 0)},be=w?.labelSelectedWeight??`font.weight.medium`,xe=w?.badgeSize??`font.size.xs`,Se=w?.headingSize??`font.size.md`,Ce={fontFamily:w?.fontFamily??`font.family.body`,fontSize:w?.fontSize??`font.size.sm`,lineHeight:w?.lineHeight??`font.lineHeight.normal`},we=(e,t,n,r)=>{let i=p(e),a=i&&H.has(e.id),o=c===`multiple`?me(e):void 0,s=c===`single`?q.has(e.id):o===`true`,u=a&&e.children===`lazy`,f=m(e),ne=[`ds-tree__row`,s?`ds-tree__row--selected`:null,e.disabled?`ds-tree__row--disabled`:null].filter(Boolean).join(` `);return(0,y.jsxs)(`li`,{ref:t=>{t?M.current.set(e.id,t):M.current.delete(e.id)},id:`${A}-node-${e.id}`,role:`treeitem`,"data-part":`node`,className:`ds-tree__node`,style:{"--ds-tree-level":t-1},"aria-level":t,"aria-setsize":r,"aria-posinset":n,"aria-expanded":i?a:void 0,"aria-selected":c===`single`?s:void 0,"aria-checked":o,"aria-disabled":e.disabled?!0:void 0,"aria-busy":u?!0:void 0,tabIndex:e.id===he?0:-1,onFocus:t=>{t.target===t.currentTarget&&!e.disabled&&Z(e.id)},children:[(0,y.jsxs)(`div`,{className:ne,"data-part":`nodeRow`,onMouseDown:t=>{e.disabled&&t.preventDefault()},onClick:t=>{e.disabled||(Q(e.id),!(t.detail>=2)&&fe(e))},onDoubleClick:()=>ge(e),children:[(0,y.jsx)(`span`,{className:`ds-tree__indent`,"data-part":`indent`,"aria-hidden":`true`}),(0,y.jsxs)(`span`,{className:`ds-tree__content`,children:[i?(0,y.jsx)(`span`,{className:`ds-tree__expand`,"data-part":`expandButton`,onMouseDown:e=>e.preventDefault(),onClick:t=>{t.stopPropagation(),!e.disabled&&(W(e.id),Q(e.id))},onDoubleClick:e=>e.stopPropagation(),children:(0,y.jsx)(ee,{variant:`ghost`,size:`sm`,iconOnly:!0,label:re(a?b.collapse:b.expand,{label:e.label}),leadingIcon:(0,y.jsx)(`span`,{className:a?`ds-tree__chevron ds-tree__chevron--expanded`:`ds-tree__chevron`,children:(0,y.jsx)(d,{name:`chevron-right`,inline:!0})}),disabled:e.disabled??!1,tabIndex:-1})}):(0,y.jsx)(`span`,{className:`ds-tree__expand`,"aria-hidden":`true`}),(0,y.jsxs)(`span`,{className:`ds-tree__main`,children:[o===void 0?null:(0,y.jsx)(`span`,{className:o===`false`?`ds-tree__checkbox`:`ds-tree__checkbox ds-tree__checkbox--checked`,"data-part":`checkbox`,"aria-hidden":`true`,children:o===`true`?(0,y.jsx)(d,{name:`check`,inline:!0}):o===`mixed`?(0,y.jsx)(d,{name:`dash`,inline:!0}):null}),(0,y.jsxs)(`span`,{className:`ds-tree__body`,children:[e.icon?(0,y.jsx)(`span`,{className:`ds-tree__icon`,"data-part":`icon`,children:(0,y.jsx)(d,{name:e.icon,inline:!0,overrides:{color:`color.foreground.muted`}})}):null,(0,y.jsx)(`span`,{className:`ds-tree__label`,children:(0,y.jsx)(l,{"data-part":`label`,element:`span`,truncate:!0,overrides:s&&e.href===void 0?{...Ce,fontWeight:be}:Ce,children:e.href?(0,y.jsx)(`span`,{className:`ds-tree__link`,"data-part":`link`,children:(0,y.jsx)(te,{href:e.href,label:e.label,tone:`inherit`,tabIndex:-1})}):e.label})})]})]}),e.badge?(0,y.jsx)(l,{"data-part":`badge`,element:`span`,tone:`muted`,overrides:{fontSize:xe},children:e.badge}):null]})]}),a?(0,y.jsx)(`ul`,{role:`group`,"data-part":`group`,className:`ds-tree__group`,children:u?(0,y.jsx)(`li`,{role:`treeitem`,className:`ds-tree__node`,style:{"--ds-tree-level":t},"aria-level":t+1,"aria-setsize":1,"aria-posinset":1,"aria-disabled":!0,tabIndex:-1,children:(0,y.jsxs)(`div`,{className:`ds-tree__row ds-tree__row--placeholder`,children:[(0,y.jsx)(`span`,{className:`ds-tree__indent`,"aria-hidden":`true`}),(0,y.jsxs)(`span`,{className:`ds-tree__content`,children:[(0,y.jsx)(`span`,{className:`ds-tree__expand`,"aria-hidden":`true`}),(0,y.jsx)(l,{element:`span`,tone:`muted`,children:b.loading})]})]})}):f.map((e,n)=>we(e,t+1,n+1,f.length))}):null]},e.id)},Te=[`ds-tree`,C?null:`ds-tree--hide-guides`].filter(Boolean).join(` `);return(0,y.jsxs)(`div`,{...k,ref:e,"data-ds":`Tree`,"data-part":`container`,className:Te,style:w?ne(w):void 0,children:[n?(0,y.jsx)(`div`,{className:`ds-tree__heading`,"data-part":`heading`,children:(0,y.jsx)(s,{id:j,level:r,size:`md`,overrides:{fontSize:Se},children:t})}):null,(0,y.jsx)(`ul`,{role:`tree`,className:`ds-tree__tree`,"aria-label":n?void 0:t,"aria-labelledby":n?j:void 0,"aria-multiselectable":c===`multiple`||void 0,onKeyDown:ve,onBlur:ye,children:i.map((e,t)=>we(e,1,t+1,i.length))}),i.length===0?(0,y.jsx)(l,{"data-part":`emptyState`,tone:`muted`,children:b.empty}):null,c===`multiple`?(0,y.jsx)(`span`,{className:`ds-tree__visually-hidden`,role:`status`,"aria-live":`polite`,children:re(b.selectedCount,{count:K.length})}):null]})}var v,y,b,oe,x,S;function C(){return(C=e((()=>{v=t(),r(),a(),o(),u(),f(),c(),y=n(),b={expand:`Expand {label}`,collapse:`Collapse {label}`,selectedCount:`{count} selected`,loading:`Loading`,empty:`Nothing here.`},oe=500,x=`*`,S={indent:`--ds-tree-indent`,rowPaddingInline:`--ds-tree-row-padding-inline`,rowRadius:`--ds-tree-row-radius`,rowGap:`--ds-tree-row-gap`,rowHover:`--ds-tree-row-hover`,guideLine:`--ds-tree-guide-line`,guideLineWidth:`--ds-tree-guide-line-width`,checkboxGap:`--ds-tree-checkbox-gap`,checkboxSize:`--ds-tree-checkbox-size`,checkboxBorderWidth:`--ds-tree-checkbox-border-width`,checkboxBackground:`--ds-tree-checkbox-background`,checkboxRadius:`--ds-tree-checkbox-radius`,fontFamily:`--ds-tree-font-family`,fontSize:`--ds-tree-font-size`,lineHeight:`--ds-tree-line-height`,disabledOpacity:`--ds-tree-disabled-opacity`,transition:`--ds-tree-transition`},_.__docgenInfo={description:"Tree — Design Schema, category: navigation.\n\nWhen to use:\nUse a Tree for a hierarchy the user navigates or picks from: folders, a site's sections, product\ncategories, an org's departments. `single` selection with `href` nodes is a navigation tree;\n`multiple` with `selectChildren` is a picker (choose folders to sync). Use `selectOnFocus` only\nwhen the tree drives a panel beside it and moving through nodes should preview them.",methods:[],displayName:`Tree`,props:{label:{required:!0,tsType:{name:`string`},description:'What the tree lists ("Folders", "Categories"). Not visible unless `showLabel`.'},showLabel:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Show the label as a Heading above the tree (then the tree is aria-labelledby it instead of aria-label).`,defaultValue:{value:`false`,computed:!1}},headingLevel:{required:!1,tsType:{name:`union`,raw:`TreeHeadingLevel | undefined`,elements:[{name:`union`,raw:`'2' | '3' | '4' | 2 | 3 | 4`,elements:[{name:`literal`,value:`'2'`},{name:`literal`,value:`'3'`},{name:`literal`,value:`'4'`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`}]},{name:`undefined`}]},description:`Heading level of the visible label in the page outline; its size is headingSize regardless.`,defaultValue:{value:`'2'`,computed:!1}},nodes:{required:!0,tsType:{name:`Array`,elements:[{name:`TreeNode`}],raw:`TreeNode[]`},description:'The hierarchy. `href` makes a node\'s label a Link (navigation trees); `icon` is an Icon glyph\n(`folder` and `file` exist for the usual case); `badge` is a short trailing count or status;\n`children: "lazy"` loads on first expand through `onExpand`.'},expanded:{required:!1,tsType:{name:`union`,raw:`string[] | undefined`,elements:[{name:`Array`,elements:[{name:`string`}],raw:`string[]`},{name:`undefined`}]},description:'Controlled expanded ids. A still-`"lazy"` id here is held closed until the user opens it, exactly as in\n`defaultExpanded` — the id stays in the array the caller passed and in what onExpandChange reports, but\nthe node does not render open and fires no onExpand.'},defaultExpanded:{required:!1,tsType:{name:`union`,raw:`string[] | undefined`,elements:[{name:`Array`,elements:[{name:`string`}],raw:`string[]`},{name:`undefined`}]},description:'Initially expanded ids. `["*"]` opens every node whose `children` is a non-empty array and never a\n`"lazy"` node; `"*"` is reserved as that sentinel, so a node whose id is literally `"*"` is never matched\nby it. A lazy id listed explicitly stays closed until the user opens it (onExpand only fires for user\nacts), and the same rule covers the controlled `expanded`.'},selectable:{required:!1,tsType:{name:`union`,raw:`TreeSelectable | undefined`,elements:[{name:`union`,raw:`'none' | 'single' | 'multiple'`,elements:[{name:`literal`,value:`'none'`},{name:`literal`,value:`'single'`},{name:`literal`,value:`'multiple'`}]},{name:`undefined`}]},description:"`single`: one current node (the usual for navigation and pickers). `multiple`: checkbox-like\nselection with Space, Shift+arrows and Ctrl+A; parents are checkboxes that cascade when\n`selectChildren`. `none`: expand/collapse only.",defaultValue:{value:`'single'`,computed:!1}},selected:{required:!1,tsType:{name:`union`,raw:`string[] | undefined`,elements:[{name:`Array`,elements:[{name:`string`}],raw:`string[]`},{name:`undefined`}]},description:"Controlled selected ids. Always an array, even in `single` mode (zero or one element)."},defaultSelected:{required:!1,tsType:{name:`union`,raw:`string[] | undefined`,elements:[{name:`Array`,elements:[{name:`string`}],raw:`string[]`},{name:`undefined`}]},description:`Initially selected ids.`},selectChildren:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"With `multiple`, selecting a parent selects its descendants and parents show indeterminate.",defaultValue:{value:`false`,computed:!1}},selectOnFocus:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"With `single`, moving focus also selects (a settings sidebar where the tree drives a panel).\nOff by default: focus moves, Enter or Space selects.",defaultValue:{value:`false`,computed:!1}},showGuides:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Vertical guide lines under open parents.`,defaultValue:{value:`true`,computed:!1}},overrides:{required:!1,tsType:{name:`union`,raw:`Partial<Record<TreeOverridableBinding, TokenRef | undefined>> | undefined`,elements:[{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'indent'
| 'rowPaddingInline'
| 'rowRadius'
| 'rowGap'
| 'rowHover'
| 'labelSelectedWeight'
| 'headingSize'
| 'badgeSize'
| 'guideLine'
| 'guideLineWidth'
| 'checkboxGap'
| 'checkboxSize'
| 'checkboxBorderWidth'
| 'checkboxBackground'
| 'checkboxRadius'
| 'fontFamily'
| 'fontSize'
| 'lineHeight'
| 'disabledOpacity'
| 'transition'`,elements:[{name:`literal`,value:`'indent'`},{name:`literal`,value:`'rowPaddingInline'`},{name:`literal`,value:`'rowRadius'`},{name:`literal`,value:`'rowGap'`},{name:`literal`,value:`'rowHover'`},{name:`literal`,value:`'labelSelectedWeight'`},{name:`literal`,value:`'headingSize'`},{name:`literal`,value:`'badgeSize'`},{name:`literal`,value:`'guideLine'`},{name:`literal`,value:`'guideLineWidth'`},{name:`literal`,value:`'checkboxGap'`},{name:`literal`,value:`'checkboxSize'`},{name:`literal`,value:`'checkboxBorderWidth'`},{name:`literal`,value:`'checkboxBackground'`},{name:`literal`,value:`'checkboxRadius'`},{name:`literal`,value:`'fontFamily'`},{name:`literal`,value:`'fontSize'`},{name:`literal`,value:`'lineHeight'`},{name:`literal`,value:`'disabledOpacity'`},{name:`literal`,value:`'transition'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<TreeOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<TreeOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:`Per-instance style overrides: each entry sets the matching CSS hook (or composed child override) to that token.`},onSelectionChange:{required:!1,tsType:{name:`union`,raw:`((ids: string[]) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired with the selected ids.`},onExpandChange:{required:!1,tsType:{name:`union`,raw:`((ids: string[]) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired with the expanded ids.`},onExpand:{required:!1,tsType:{name:`union`,raw:`((id: string) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired when a lazy node is expanded for the first time, with its id.`},onActivate:{required:!1,tsType:{name:`union`,raw:`((id: string) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Fired on Enter or double-click on a node (open the file, navigate), with its id. Nodes with `href` navigate instead."},ref:{required:!1,tsType:{name:`union`,raw:`Ref<HTMLDivElement> | undefined`,elements:[{name:`Ref`,elements:[{name:`HTMLDivElement`}],raw:`Ref<HTMLDivElement>`},{name:`undefined`}]},description:``}},composes:[`Omit`]}})))()}var w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V;function H(){return(H=e((()=>{C(),w={title:`Tree/React`,component:_,args:{label:`Folders`,nodes:[{id:`docs`,label:`Documents`,icon:`folder`,badge:`3`,children:[{id:`invoices`,label:`Invoices`,icon:`file`},{id:`contracts`,label:`Contracts`,icon:`file`},{id:`archive`,label:`Archive`,icon:`file`,disabled:!0}]},{id:`media`,label:`Media`,icon:`folder`,children:[{id:`photos`,label:`Photos`,icon:`folder`,children:[{id:`holiday`,label:`Holiday`,icon:`file`}]},{id:`videos`,label:`Videos`,icon:`folder`,children:`lazy`}]},{id:`notes`,label:`Notes`,icon:`file`}]},tags:[`autodocs`]},T={},E={args:{selectable:`none`,defaultExpanded:[`docs`]}},D={args:{selectable:`single`,defaultExpanded:[`docs`],defaultSelected:[`invoices`]}},O={args:{selectable:`multiple`,defaultExpanded:[`docs`],defaultSelected:[`invoices`,`notes`]}},k={args:{showLabel:!0,headingLevel:`2`}},A={args:{showLabel:!0,headingLevel:`3`}},j={args:{showLabel:!0,headingLevel:`4`}},M={args:{selectable:`multiple`,selectChildren:!0,defaultExpanded:[`*`],defaultSelected:[`invoices`]}},N={args:{showGuides:!1,defaultExpanded:[`*`]}},P={args:{defaultExpanded:[`media`,`videos`]}},F={args:{nodes:[]}},I={args:{defaultExpanded:[`docs`]}},L={args:{label:`Folders`,defaultExpanded:[`docs`],nodes:[{id:`docs`,label:`Documents`,icon:`folder`,children:[{id:`invoices`,label:`Invoices`,icon:`file`},{id:`contracts`,label:`Contracts`,icon:`file`}]},{id:`media`,label:`Media`,icon:`folder`,children:`lazy`}]}},R={args:{label:`Settings sections`,showLabel:!0,headingLevel:`2`,selectOnFocus:!0,nodes:[{id:`account`,label:`Account`,href:`/settings/account`},{id:`billing`,label:`Billing`,href:`/settings/billing`}]}},z={args:{label:`Categories`,selectable:`multiple`,selectChildren:!0,defaultExpanded:[`*`],nodes:[{id:`clothing`,label:`Clothing`,children:[{id:`shirts`,label:`Shirts`},{id:`shoes`,label:`Shoes`}]}]}},B={args:{label:`Site map`,selectable:`none`,nodes:[{id:`guides`,label:`Guides`,badge:`12`,children:[{id:`start`,label:`Getting started`}]},{id:`api`,label:`API`,badge:`48`,children:`lazy`}]}},V=[`Default`,`SelectableNone`,`SelectableSingle`,`SelectableMultiple`,`HeadingLevel2`,`HeadingLevel3`,`HeadingLevel4`,`SelectChildren`,`GuidesHidden`,`LazyLoading`,`Empty`,`Keyboard`,`FolderTree`,`NavigationSidebar`,`CategoryPickerWithCascade`,`ReadOnlySiteMap`],T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'none',
    defaultExpanded: ['docs']
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'single',
    defaultExpanded: ['docs'],
    defaultSelected: ['invoices']
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'multiple',
    defaultExpanded: ['docs'],
    defaultSelected: ['invoices', 'notes']
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    showLabel: true,
    headingLevel: '2'
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    showLabel: true,
    headingLevel: '3'
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    showLabel: true,
    headingLevel: '4'
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'multiple',
    selectChildren: true,
    defaultExpanded: ['*'],
    defaultSelected: ['invoices']
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    showGuides: false,
    defaultExpanded: ['*']
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    defaultExpanded: ['media', 'videos']
  }
}`,...P.parameters?.docs?.source},description:{story:'A `children: "lazy"` branch. `videos` is listed in `defaultExpanded` but stays closed — a lazy id only opens\r\non a user act, which is what fires `onExpand`; open it to see the placeholder and the parent\'s `aria-busy`.',...P.parameters?.docs?.description}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    nodes: []
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    defaultExpanded: ['docs']
  }
}`,...I.parameters?.docs?.source},description:{story:`Keyboard gate: present with the first branch open — Documents, Invoices, Contracts, Media, Notes are focusable.`,...I.parameters?.docs?.description}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Folders',
    defaultExpanded: ['docs'],
    nodes: [{
      id: 'docs',
      label: 'Documents',
      icon: 'folder',
      children: [{
        id: 'invoices',
        label: 'Invoices',
        icon: 'file'
      }, {
        id: 'contracts',
        label: 'Contracts',
        icon: 'file'
      }]
    }, {
      id: 'media',
      label: 'Media',
      icon: 'folder',
      children: 'lazy'
    }]
  }
}`,...L.parameters?.docs?.source},description:{story:`The everyday file tree, one branch open, each node with its glyph.`,...L.parameters?.docs?.description}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Settings sections',
    showLabel: true,
    headingLevel: '2',
    selectOnFocus: true,
    nodes: [{
      id: 'account',
      label: 'Account',
      href: '/settings/account'
    }, {
      id: 'billing',
      label: 'Billing',
      href: '/settings/billing'
    }]
  }
}`,...R.parameters?.docs?.source},description:{story:`A settings sidebar whose visible heading names it and whose selection drives the panel beside it.`,...R.parameters?.docs?.description}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Categories',
    selectable: 'multiple',
    selectChildren: true,
    defaultExpanded: ['*'],
    nodes: [{
      id: 'clothing',
      label: 'Clothing',
      children: [{
        id: 'shirts',
        label: 'Shirts'
      }, {
        id: 'shoes',
        label: 'Shoes'
      }]
    }]
  }
}`,...z.parameters?.docs?.source},description:{story:`Multi-select categories where choosing a parent chooses everything under it.`,...z.parameters?.docs?.description}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Site map',
    selectable: 'none',
    nodes: [{
      id: 'guides',
      label: 'Guides',
      badge: '12',
      children: [{
        id: 'start',
        label: 'Getting started'
      }]
    }, {
      id: 'api',
      label: 'API',
      badge: '48',
      children: 'lazy'
    }]
  }
}`,...B.parameters?.docs?.source},description:{story:`A tree that only expands and collapses, with counts after each branch.`,...B.parameters?.docs?.description}}}})))()}H();export{z as CategoryPickerWithCascade,T as Default,F as Empty,L as FolderTree,N as GuidesHidden,k as HeadingLevel2,A as HeadingLevel3,j as HeadingLevel4,I as Keyboard,P as LazyLoading,R as NavigationSidebar,B as ReadOnlySiteMap,M as SelectChildren,O as SelectableMultiple,E as SelectableNone,D as SelectableSingle,V as __namedExportsOrder,w as default};