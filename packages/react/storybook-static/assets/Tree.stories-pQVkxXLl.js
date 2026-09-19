import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t}from"./iframe-BeYiOD21.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./names-szlHjJ4U.js";import{n as a,t as ee}from"./Button-Bo7PDoxU.js";import{n as o,t as s}from"./Heading-cF8HOPk0.js";import{n as c,t as l}from"./Text-mkTTvuew.js";import{n as u,t as d}from"./Icon-Bkk7FUFb.js";import{n as f,t as te}from"./Link-CrMOAh8Z.js";function p(e){let t={};for(let n of Object.keys(e)){let r=C[n],a=e[n];r&&a&&(t[r]=i(a))}return t}function m(e,t){return e.replace(/\{(\w+)\}/g,(e,n)=>n in t?String(t[n]):e)}function h(e){return e.children===`lazy`||Array.isArray(e.children)&&e.children.length>0}function g(e){return Array.isArray(e.children)?e.children:[]}function _(e,t=[]){for(let n of e)t.push(n),_(g(n),t);return t}function v(e,t){if(!t)return[e.id];let n=[e.id];for(let t of _(g(e)))t.disabled||n.push(t.id);return n}function ne(e,t){for(let n of e){let e=g(n);if(e.length===0)continue;ne(e,t);let r=e.filter(e=>!e.disabled);r.length===0||n.disabled||(r.every(e=>t.has(e.id))?t.add(n.id):t.delete(n.id))}}function y({ref:e,label:t,showLabel:n=!1,headingLevel:r=`2`,nodes:i,expanded:a,defaultExpanded:o,selectable:c=`single`,selected:u,defaultSelected:f,selectChildren:y=!1,selectOnFocus:C=!1,showGuides:w=!0,overrides:T,onSelectionChange:E,onExpandChange:D,onExpand:O,onActivate:k,...A}){let j=(0,b.useId)(),M=`${j}-heading`,N=(0,b.useRef)(new Map),P=(0,b.useRef)({buffer:``,timer:void 0}),F=(0,b.useRef)(new Set),I=(0,b.useMemo)(()=>_(i),[i]),L=(0,b.useMemo)(()=>new Map(I.map(e=>[e.id,e])),[I]),[R,z]=(0,b.useState)(()=>o?.includes(`*`)?_(i).filter(e=>Array.isArray(e.children)&&e.children.length>0).map(e=>e.id):o??[]),B=a??R,V=(0,b.useMemo)(()=>new Set(B),[B]),H=e=>{for(let t of e)V.has(t)||F.current.has(t)||L.get(t)?.children===`lazy`&&(F.current.add(t),O?.(t));a===void 0&&z(e),D?.(e)},U=e=>{H(V.has(e)?B.filter(t=>t!==e):[...B,e])},ie=(0,b.useMemo)(()=>{let e=[],t=(n,r,i)=>{for(let a of n)e.push({node:a,level:r,parentId:i,siblings:n}),V.has(a.id)&&t(g(a),r+1,a.id)};return t(i,1,null),e},[i,V]),W=(0,b.useMemo)(()=>ie.filter(e=>!e.node.disabled),[ie]),[ae,oe]=(0,b.useState)(f??[]),G=u??ae,K=(0,b.useMemo)(()=>new Set(G),[G]),q=e=>{c===`multiple`&&y&&ne(i,e);let t=I.map(e=>e.id).filter(t=>e.has(t));for(let n of e)L.has(n)||t.push(n);t.length===G.length&&t.every(e=>K.has(e))||(u===void 0&&oe(t),E?.(t))},J=e=>q(new Set([e])),se=e=>{let t=new Set(G),n=v(e,y);if(Y(e)===`true`)for(let e of n)t.delete(e);else for(let e of n)t.add(e);q(t)},ce=e=>{let t=new Set(G);for(let n of v(e,y))t.add(n);q(t)},le=e=>{e.disabled||(c===`single`?J(e.id):c===`multiple`&&se(e))},ue=new Map;function Y(e){let t=ue.get(e.id);if(t)return t;let n=K.has(e.id)?`true`:`false`,r=g(e).filter(e=>!e.disabled);if(y&&r.length>0){let e=r.map(e=>Y(e));n=e.every(e=>e===`true`)?`true`:e.some(e=>e!==`false`)?`mixed`:`false`}return ue.set(e.id,n),n}let[X,Z]=(0,b.useState)(void 0),de=(X!==void 0&&W.some(e=>e.node.id===X)?X:void 0)??W.find(e=>K.has(e.node.id))?.node.id??W[0]?.node.id,Q=e=>{Z(e),N.current.get(e)?.focus()},$=e=>{e&&(Q(e.node.id),c===`single`&&C&&J(e.node.id))},fe=e=>{e.disabled||(c===`single`&&J(e.id),e.href?N.current.get(e.id)?.querySelector(`[data-part="link"] a`)?.click():k?.(e.id))},pe=(e,t)=>{let n=P.current;n.timer!==void 0&&clearTimeout(n.timer),n.timer=setTimeout(()=>{n.buffer=``,n.timer=void 0},re),n.buffer+=e.toLowerCase();let r=n.buffer.length===1?t+1:t;for(let e=0;e<W.length;e++){let t=W[(r+e)%W.length];if(t&&t.node.label.toLowerCase().startsWith(n.buffer)){$(t);return}}},me=e=>{let t=e.target;if(t.getAttribute(`role`)!==`treeitem`)return;let n=W.findIndex(e=>N.current.get(e.node.id)===t),r=W[n];if(!r)return;let{node:i}=r,a=c===`multiple`;if((e.ctrlKey||e.metaKey)&&!e.altKey&&e.code===`KeyA`){if(!a)return;e.preventDefault();let t=new Set(G);for(let e of W)t.add(e.node.id);q(t);return}switch(e.key){case`ArrowDown`:case`ArrowUp`:{e.preventDefault();let t=W[e.key===`ArrowDown`?n+1:n-1];if(!t)return;a&&e.shiftKey?(Q(t.node.id),ce(t.node)):$(t);return}case`ArrowRight`:if(e.preventDefault(),!h(i))return;if(!V.has(i.id))U(i.id);else{let e=g(i).find(e=>!e.disabled);e&&$(W.find(t=>t.node.id===e.id))}return;case`ArrowLeft`:e.preventDefault(),h(i)&&V.has(i.id)?U(i.id):r.parentId!==null&&$(W.find(e=>e.node.id===r.parentId));return;case`Home`:e.preventDefault(),$(W[0]);return;case`End`:e.preventDefault(),$(W[W.length-1]);return;case`Enter`:e.preventDefault(),fe(i);return;case` `:if(c===`none`)return;e.preventDefault(),le(i);return;case`*`:{e.preventDefault();let t=r.siblings.filter(e=>!e.disabled&&h(e)&&!V.has(e.id));t.length>0&&H([...B,...t.map(e=>e.id)]);return}default:e.key.length===1&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&(e.preventDefault(),pe(e.key,n))}},he=e=>{e.currentTarget.contains(e.relatedTarget)||Z(void 0)},ge=T?.labelSelectedWeight??`font.weight.medium`,_e=T?.badgeSize??`font.size.xs`,ve=T?.headingSize??`font.size.md`,ye={fontFamily:T?.fontFamily??`font.family.body`,fontSize:T?.fontSize??`font.size.sm`,lineHeight:T?.lineHeight??`font.lineHeight.normal`},be=(e,t,n,r)=>{let i=h(e),a=i&&V.has(e.id),o=c===`multiple`?Y(e):void 0,s=c===`single`?K.has(e.id):o===`true`,u=a&&e.children===`lazy`,f=g(e),p=[`ds-tree__row`,s?`ds-tree__row--selected`:null,e.disabled?`ds-tree__row--disabled`:null].filter(Boolean).join(` `);return(0,x.jsxs)(`li`,{ref:t=>{t?N.current.set(e.id,t):N.current.delete(e.id)},id:`${j}-node-${e.id}`,role:`treeitem`,"data-part":`node`,className:`ds-tree__node`,style:{"--ds-tree-level":t-1},"aria-level":t,"aria-setsize":r,"aria-posinset":n,"aria-expanded":i?a:void 0,"aria-selected":c===`single`?s:void 0,"aria-checked":o,"aria-disabled":e.disabled?!0:void 0,"aria-busy":u?!0:void 0,tabIndex:e.id===de?0:-1,onFocus:t=>{t.target===t.currentTarget&&!e.disabled&&Z(e.id)},children:[(0,x.jsxs)(`div`,{className:p,"data-part":`nodeRow`,onMouseDown:t=>{e.disabled&&t.preventDefault()},onClick:t=>{e.disabled||(Q(e.id),!(t.detail>=2)&&le(e))},onDoubleClick:()=>fe(e),children:[(0,x.jsx)(`span`,{className:`ds-tree__indent`,"data-part":`indent`,"aria-hidden":`true`}),(0,x.jsxs)(`span`,{className:`ds-tree__content`,children:[i?(0,x.jsx)(`span`,{className:`ds-tree__expand`,"data-part":`expandButton`,onMouseDown:e=>e.preventDefault(),onClick:t=>{t.stopPropagation(),!e.disabled&&(U(e.id),Q(e.id))},onDoubleClick:e=>e.stopPropagation(),children:(0,x.jsx)(ee,{variant:`ghost`,size:`sm`,iconOnly:!0,label:m(a?S.collapse:S.expand,{label:e.label}),leadingIcon:(0,x.jsx)(`span`,{className:a?`ds-tree__chevron ds-tree__chevron--expanded`:`ds-tree__chevron`,children:(0,x.jsx)(d,{name:`chevron-right`,inline:!0})}),disabled:e.disabled??!1,"aria-hidden":`true`,tabIndex:-1})}):(0,x.jsx)(`span`,{className:`ds-tree__expand`,"aria-hidden":`true`}),(0,x.jsxs)(`span`,{className:`ds-tree__main`,children:[o===void 0?null:(0,x.jsx)(`span`,{className:o===`false`?`ds-tree__checkbox`:`ds-tree__checkbox ds-tree__checkbox--checked`,"data-part":`checkbox`,"aria-hidden":`true`,children:o===`true`?(0,x.jsx)(d,{name:`check`,inline:!0}):o===`mixed`?(0,x.jsx)(d,{name:`dash`,inline:!0}):null}),(0,x.jsxs)(`span`,{className:`ds-tree__body`,children:[e.icon?(0,x.jsx)(`span`,{className:`ds-tree__icon`,"aria-hidden":`true`,children:(0,x.jsx)(d,{"data-part":`icon`,name:e.icon,inline:!0,overrides:{color:`color.foreground.muted`}})}):null,(0,x.jsx)(`span`,{className:`ds-tree__label`,children:(0,x.jsx)(l,{"data-part":`label`,element:`span`,truncate:!0,overrides:s&&e.href===void 0?{...ye,fontWeight:ge}:ye,children:e.href?(0,x.jsx)(`span`,{className:`ds-tree__link`,"data-part":`link`,children:(0,x.jsx)(te,{href:e.href,label:e.label,tone:`inherit`,tabIndex:-1})}):e.label})})]})]}),e.badge?(0,x.jsx)(l,{"data-part":`badge`,element:`span`,tone:`muted`,overrides:{fontSize:_e},children:e.badge}):null]})]}),a?(0,x.jsx)(`ul`,{role:`group`,"data-part":`group`,className:`ds-tree__group`,children:u?(0,x.jsx)(`li`,{role:`treeitem`,className:`ds-tree__node`,style:{"--ds-tree-level":t},"aria-level":t+1,"aria-setsize":1,"aria-posinset":1,"aria-disabled":!0,tabIndex:-1,children:(0,x.jsxs)(`div`,{className:`ds-tree__row ds-tree__row--placeholder`,children:[(0,x.jsx)(`span`,{className:`ds-tree__indent`,"aria-hidden":`true`}),(0,x.jsxs)(`span`,{className:`ds-tree__content`,children:[(0,x.jsx)(`span`,{className:`ds-tree__expand`,"aria-hidden":`true`}),(0,x.jsx)(l,{element:`span`,tone:`muted`,children:S.loading})]})]})}):f.map((e,n)=>be(e,t+1,n+1,f.length))}):null]},e.id)},xe=[`ds-tree`,w?null:`ds-tree--hide-guides`].filter(Boolean).join(` `);return(0,x.jsxs)(`div`,{...A,ref:e,"data-ds":`Tree`,"data-part":`container`,className:xe,style:T?p(T):void 0,children:[n?(0,x.jsx)(`div`,{className:`ds-tree__heading`,"data-part":`heading`,children:(0,x.jsx)(s,{id:M,level:r,size:`md`,overrides:{fontSize:ve},children:t})}):null,(0,x.jsx)(`ul`,{role:`tree`,className:`ds-tree__tree`,"aria-label":n?void 0:t,"aria-labelledby":n?M:void 0,"aria-multiselectable":c===`multiple`||void 0,onKeyDown:me,onBlur:he,children:i.map((e,t)=>be(e,1,t+1,i.length))}),i.length===0?(0,x.jsx)(l,{"data-part":`emptyState`,tone:`muted`,children:S.empty}):null,c===`multiple`?(0,x.jsx)(`span`,{className:`ds-tree__visually-hidden`,role:`status`,"aria-live":`polite`,children:m(S.selectedCount,{count:G.length})}):null]})}var b,x,S,re,C;function w(){return(w=e((()=>{b=t(),r(),a(),o(),u(),f(),c(),x=n(),S={expand:`Expand {label}`,collapse:`Collapse {label}`,selectedCount:`{count} selected`,loading:`Loading`,empty:`Nothing here.`},re=500,C={indent:`--ds-tree-indent`,rowPaddingInline:`--ds-tree-row-padding-inline`,rowRadius:`--ds-tree-row-radius`,rowGap:`--ds-tree-row-gap`,rowHover:`--ds-tree-row-hover`,guideLine:`--ds-tree-guide-line`,guideLineWidth:`--ds-tree-guide-line-width`,checkboxGap:`--ds-tree-checkbox-gap`,checkboxSize:`--ds-tree-checkbox-size`,checkboxBorderWidth:`--ds-tree-checkbox-border-width`,checkboxBackground:`--ds-tree-checkbox-background`,checkboxRadius:`--ds-tree-checkbox-radius`,fontFamily:`--ds-tree-font-family`,fontSize:`--ds-tree-font-size`,lineHeight:`--ds-tree-line-height`,disabledOpacity:`--ds-tree-disabled-opacity`,transition:`--ds-tree-transition`},y.__docgenInfo={description:"Tree — Design Schema, category: navigation.\n\nWhen to use:\nUse a Tree for a hierarchy the user navigates or picks from: folders, a site's sections, product\ncategories, an org's departments. `single` selection with `href` nodes is a navigation tree;\n`multiple` with `selectChildren` is a picker (choose folders to sync). Use `selectOnFocus` only\nwhen the tree drives a panel beside it and moving through nodes should preview them.",methods:[],displayName:`Tree`,props:{label:{required:!0,tsType:{name:`string`},description:'What the tree lists ("Folders", "Categories"). Not visible unless `showLabel`.'},showLabel:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Show the label as a Heading above the tree (then the tree is aria-labelledby it instead of aria-label).`,defaultValue:{value:`false`,computed:!1}},headingLevel:{required:!1,tsType:{name:`union`,raw:`TreeHeadingLevel | undefined`,elements:[{name:`union`,raw:`'2' | '3' | '4' | 2 | 3 | 4`,elements:[{name:`literal`,value:`'2'`},{name:`literal`,value:`'3'`},{name:`literal`,value:`'4'`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`}]},{name:`undefined`}]},description:`Heading level of the visible label in the page outline; its size is headingSize regardless.`,defaultValue:{value:`'2'`,computed:!1}},nodes:{required:!0,tsType:{name:`Array`,elements:[{name:`TreeNode`}],raw:`TreeNode[]`},description:'The hierarchy. `href` makes a node\'s label a Link (navigation trees); `icon` is an Icon glyph\n(`folder` and `file` exist for the usual case); `badge` is a short trailing count or status;\n`children: "lazy"` loads on first expand through `onExpand`.'},expanded:{required:!1,tsType:{name:`union`,raw:`string[] | undefined`,elements:[{name:`Array`,elements:[{name:`string`}],raw:`string[]`},{name:`undefined`}]},description:`Controlled expanded ids.`},defaultExpanded:{required:!1,tsType:{name:`union`,raw:`string[] | undefined`,elements:[{name:`Array`,elements:[{name:`string`}],raw:`string[]`},{name:`undefined`}]},description:'Initially expanded ids; `["*"]` for all.'},selectable:{required:!1,tsType:{name:`union`,raw:`TreeSelectable | undefined`,elements:[{name:`union`,raw:`'none' | 'single' | 'multiple'`,elements:[{name:`literal`,value:`'none'`},{name:`literal`,value:`'single'`},{name:`literal`,value:`'multiple'`}]},{name:`undefined`}]},description:"`single`: one current node (the usual for navigation and pickers). `multiple`: checkbox-like\nselection with Space, Shift+arrows and Ctrl+A; parents are checkboxes that cascade when\n`selectChildren`. `none`: expand/collapse only.",defaultValue:{value:`'single'`,computed:!1}},selected:{required:!1,tsType:{name:`union`,raw:`string[] | undefined`,elements:[{name:`Array`,elements:[{name:`string`}],raw:`string[]`},{name:`undefined`}]},description:"Controlled selected ids. Always an array, even in `single` mode (zero or one element)."},defaultSelected:{required:!1,tsType:{name:`union`,raw:`string[] | undefined`,elements:[{name:`Array`,elements:[{name:`string`}],raw:`string[]`},{name:`undefined`}]},description:`Initially selected ids.`},selectChildren:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"With `multiple`, selecting a parent selects its descendants and parents show indeterminate.",defaultValue:{value:`false`,computed:!1}},selectOnFocus:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"With `single`, moving focus also selects (a settings sidebar where the tree drives a panel).\nOff by default: focus moves, Enter or Space selects.",defaultValue:{value:`false`,computed:!1}},showGuides:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Vertical guide lines under open parents.`,defaultValue:{value:`true`,computed:!1}},overrides:{required:!1,tsType:{name:`union`,raw:`Partial<Record<TreeOverridableBinding, TokenRef | undefined>> | undefined`,elements:[{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'indent'
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
| 'transition'`,elements:[{name:`literal`,value:`'indent'`},{name:`literal`,value:`'rowPaddingInline'`},{name:`literal`,value:`'rowRadius'`},{name:`literal`,value:`'rowGap'`},{name:`literal`,value:`'rowHover'`},{name:`literal`,value:`'labelSelectedWeight'`},{name:`literal`,value:`'headingSize'`},{name:`literal`,value:`'badgeSize'`},{name:`literal`,value:`'guideLine'`},{name:`literal`,value:`'guideLineWidth'`},{name:`literal`,value:`'checkboxGap'`},{name:`literal`,value:`'checkboxSize'`},{name:`literal`,value:`'checkboxBorderWidth'`},{name:`literal`,value:`'checkboxBackground'`},{name:`literal`,value:`'checkboxRadius'`},{name:`literal`,value:`'fontFamily'`},{name:`literal`,value:`'fontSize'`},{name:`literal`,value:`'lineHeight'`},{name:`literal`,value:`'disabledOpacity'`},{name:`literal`,value:`'transition'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<TreeOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<TreeOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:`Per-instance style overrides: each entry sets the matching CSS hook (or composed child override) to that token.`},onSelectionChange:{required:!1,tsType:{name:`union`,raw:`((ids: string[]) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired with the selected ids.`},onExpandChange:{required:!1,tsType:{name:`union`,raw:`((ids: string[]) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired with the expanded ids.`},onExpand:{required:!1,tsType:{name:`union`,raw:`((id: string) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired when a lazy node is expanded for the first time, with its id.`},onActivate:{required:!1,tsType:{name:`union`,raw:`((id: string) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Fired on Enter or double-click on a node (open the file, navigate), with its id. Nodes with `href` navigate instead."},ref:{required:!1,tsType:{name:`union`,raw:`Ref<HTMLDivElement> | undefined`,elements:[{name:`Ref`,elements:[{name:`HTMLDivElement`}],raw:`Ref<HTMLDivElement>`},{name:`undefined`}]},description:``}},composes:[`Omit`]}})))()}var T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H;function U(){return(U=e((()=>{w(),T={title:`Tree/React`,component:y,args:{label:`Folders`,nodes:[{id:`docs`,label:`Documents`,icon:`folder`,badge:`3`,children:[{id:`invoices`,label:`Invoices`,icon:`file`},{id:`contracts`,label:`Contracts`,icon:`file`},{id:`archive`,label:`Archive`,icon:`file`,disabled:!0}]},{id:`media`,label:`Media`,icon:`folder`,children:[{id:`photos`,label:`Photos`,icon:`folder`,children:[{id:`holiday`,label:`Holiday`,icon:`file`}]},{id:`videos`,label:`Videos`,icon:`folder`,children:`lazy`}]},{id:`notes`,label:`Notes`,icon:`file`}]},tags:[`autodocs`]},E={},D={args:{selectable:`none`,defaultExpanded:[`docs`]}},O={args:{selectable:`single`,defaultExpanded:[`docs`],defaultSelected:[`invoices`]}},k={args:{selectable:`multiple`,defaultExpanded:[`docs`],defaultSelected:[`invoices`,`notes`]}},A={args:{showLabel:!0,headingLevel:`2`}},j={args:{showLabel:!0,headingLevel:`3`}},M={args:{showLabel:!0,headingLevel:`4`}},N={args:{selectable:`multiple`,selectChildren:!0,defaultExpanded:[`*`],defaultSelected:[`invoices`]}},P={args:{showGuides:!1,defaultExpanded:[`*`]}},F={args:{defaultExpanded:[`media`,`videos`]}},I={args:{nodes:[]}},L={args:{defaultExpanded:[`docs`]}},R={args:{label:`Folders`,defaultExpanded:[`docs`],nodes:[{id:`docs`,label:`Documents`,icon:`folder`,children:[{id:`invoices`,label:`Invoices`,icon:`file`},{id:`contracts`,label:`Contracts`,icon:`file`}]},{id:`media`,label:`Media`,icon:`folder`,children:`lazy`}]}},z={args:{label:`Settings sections`,showLabel:!0,headingLevel:`2`,selectOnFocus:!0,nodes:[{id:`account`,label:`Account`,href:`/settings/account`},{id:`billing`,label:`Billing`,href:`/settings/billing`}]}},B={args:{label:`Categories`,selectable:`multiple`,selectChildren:!0,defaultExpanded:[`*`],nodes:[{id:`clothing`,label:`Clothing`,children:[{id:`shirts`,label:`Shirts`},{id:`shoes`,label:`Shoes`}]}]}},V={args:{label:`Site map`,selectable:`none`,nodes:[{id:`guides`,label:`Guides`,badge:`12`,children:[{id:`start`,label:`Getting started`}]},{id:`api`,label:`API`,badge:`48`,children:`lazy`}]}},H=[`Default`,`SelectableNone`,`SelectableSingle`,`SelectableMultiple`,`HeadingLevel2`,`HeadingLevel3`,`HeadingLevel4`,`SelectChildren`,`GuidesHidden`,`LazyLoading`,`Empty`,`Keyboard`,`FolderTree`,`NavigationSidebar`,`CategoryPickerWithCascade`,`ReadOnlySiteMap`],E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'none',
    defaultExpanded: ['docs']
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'single',
    defaultExpanded: ['docs'],
    defaultSelected: ['invoices']
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'multiple',
    defaultExpanded: ['docs'],
    defaultSelected: ['invoices', 'notes']
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    showLabel: true,
    headingLevel: '2'
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    showLabel: true,
    headingLevel: '3'
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    showLabel: true,
    headingLevel: '4'
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'multiple',
    selectChildren: true,
    defaultExpanded: ['*'],
    defaultSelected: ['invoices']
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    showGuides: false,
    defaultExpanded: ['*']
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    defaultExpanded: ['media', 'videos']
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    nodes: []
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    defaultExpanded: ['docs']
  }
}`,...L.parameters?.docs?.source},description:{story:`Keyboard gate: present with the first branch open — Documents, Invoices, Contracts, Media, Notes are focusable.`,...L.parameters?.docs?.description}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source},description:{story:`The everyday file tree, one branch open, each node with its glyph.`,...R.parameters?.docs?.description}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
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
}`,...z.parameters?.docs?.source},description:{story:`A settings sidebar whose visible heading names it and whose selection drives the panel beside it.`,...z.parameters?.docs?.description}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source},description:{story:`Multi-select categories where choosing a parent chooses everything under it.`,...B.parameters?.docs?.description}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source},description:{story:`A tree that only expands and collapses, with counts after each branch.`,...V.parameters?.docs?.description}}}})))()}U();export{B as CategoryPickerWithCascade,E as Default,I as Empty,R as FolderTree,P as GuidesHidden,A as HeadingLevel2,j as HeadingLevel3,M as HeadingLevel4,L as Keyboard,F as LazyLoading,z as NavigationSidebar,V as ReadOnlySiteMap,N as SelectChildren,k as SelectableMultiple,D as SelectableNone,O as SelectableSingle,H as __namedExportsOrder,T as default};