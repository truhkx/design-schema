import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t}from"./iframe-D5pPePpr.js";import{t as n}from"./jsx-runtime-DeHZSEgm.js";import{n as r,t as i}from"./names-szlHjJ4U.js";import{n as a,t as ee}from"./Button-OQwYA6MI.js";import{n as o,t as s}from"./Heading-IOamlp7v.js";import{n as c,t as l}from"./Text-B1hFPUay.js";import{n as u,t as d}from"./Icon-dvwZzeX-.js";import{n as f,t as te}from"./Link-BzpYanxW.js";function ne(e){let t={};for(let n of Object.keys(e)){let r=ce[n],a=e[n];r&&a&&(t[r]=i(a))}return t}function re(e,t){return e.replace(/\{(\w+)\}/g,(e,n)=>n in t?String(t[n]):e)}function p(e){return e.children===`lazy`||Array.isArray(e.children)&&e.children.length>0}function m(e){return Array.isArray(e.children)?e.children:[]}function h(e,t=[]){for(let n of e)t.push(n),h(m(n),t);return t}function g(e){return h(m(e)).filter(e=>!e.disabled)}function ie(e,t){return t?[e.id,...g(e).map(e=>e.id)]:[e.id]}function ae(e,t){for(let n of e){let e=m(n);if(e.length===0||(ae(e,t),n.disabled))continue;let r=g(n);r.length!==0&&(r.every(e=>t.has(e.id))?t.add(n.id):t.delete(n.id))}}function _({ref:e,label:t,showLabel:n=!1,headingLevel:r=`2`,nodes:i,expanded:a,defaultExpanded:o,selectable:c=`single`,selected:u,defaultSelected:f,selectChildren:_=!1,selectOnFocus:ce=!1,showGuides:x=!0,overrides:S,onSelectionChange:C,onExpandChange:w,onExpand:T,onActivate:E,...D}){let O=(0,v.useId)(),k=`${O}-heading`,A=(0,v.useRef)(new Map),j=(0,v.useRef)({buffer:``,timer:void 0}),M=(0,v.useRef)(!1);(0,v.useEffect)(()=>{let e=j.current;return()=>{e.timer!==void 0&&clearTimeout(e.timer)}},[]);let N=(0,v.useMemo)(()=>h(i),[i]),P=(0,v.useMemo)(()=>new Map(N.map(e=>[e.id,e])),[N]),F=(0,v.useMemo)(()=>{let e=new Map,t=(n,r)=>{for(let i of n)e.set(i.id,r),t(m(i),i.id)};return t(i,null),e},[i]),[I,L]=(0,v.useState)(o??[]),[R,le]=(0,v.useState)([]),z=a??I,B=(0,v.useMemo)(()=>{let e=new Set,t=[],n=n=>{e.has(n)||(e.add(n),t.push(n))};for(let e of z)e!==se&&n(e);if(z.includes(se)){let e=t=>{for(let r of t)Array.isArray(r.children)&&r.children.length!==0&&(n(r.id),e(r.children))};e(i)}return t},[z,i]),V=(0,v.useMemo)(()=>new Set(B.filter(e=>P.get(e)?.children!==`lazy`||R.includes(e))),[B,R,P]),H=(e,t)=>{let n=t.filter(e=>P.get(e)?.children===`lazy`);n.length>0&&le(e=>[...e,...n.filter(t=>!e.includes(t))]);for(let e of n)T?.(e);a===void 0&&L(e),w?.(e)},U=e=>{if(V.has(e)){H(B.filter(t=>t!==e),[]);return}H(B.includes(e)?B:[...B,e],[e])},ue=(0,v.useMemo)(()=>{let e=[],t=(n,r,i)=>{for(let a of n)e.push({node:a,level:r,parentId:i,siblings:n}),V.has(a.id)&&t(m(a),r+1,a.id)};return t(i,1,null),e},[i,V]),W=(0,v.useMemo)(()=>ue.filter(e=>!e.node.disabled),[ue]),[de,fe]=(0,v.useState)(f??[]),G=u??de,K=(0,v.useMemo)(()=>new Set(G),[G]),q=e=>{c===`multiple`&&_&&ae(i,e);let t=N.map(e=>e.id).filter(t=>e.has(t));for(let n of e)P.has(n)||t.push(n);t.length===G.length&&t.every(e=>K.has(e))||(u===void 0&&fe(t),C?.(t))},J=e=>q(new Set([e])),pe=e=>{let t=new Set(G),n=ie(e,_);if(_e(e)===`true`)for(let e of n)t.delete(e);else for(let e of n)t.add(e);q(t)},me=e=>{let t=new Set(G);for(let n of ie(e,_))t.add(n);q(t)},he=e=>{e.disabled||(c===`single`?J(e.id):c===`multiple`&&pe(e))},ge=new Map;function _e(e){let t=ge.get(e.id);if(t)return t;let n=K.has(e.id)?`true`:`false`;if(_){let t=g(e);if(t.length>0){let e=t.filter(e=>K.has(e.id)).length;n=e===t.length?`true`:e>0?`mixed`:`false`}}return ge.set(e.id,n),n}let[Y,X]=(0,v.useState)(void 0),ve=(Y!==void 0&&W.some(e=>e.node.id===Y)?Y:void 0)??W.find(e=>K.has(e.node.id))?.node.id??W[0]?.node.id,Z=e=>{X(e),A.current.get(e)?.focus()};(0,v.useLayoutEffect)(()=>{if(Y===void 0||W.some(e=>e.node.id===Y))return;let e=document.activeElement;if(e&&e!==document.body)return;let t=F.get(Y)??null;for(;t!==null&&!W.some(e=>e.node.id===t);)t=F.get(t)??null;if(t===null){X(void 0);return}X(t),A.current.get(t)?.focus()},[Y,W,F]);let Q=e=>{e&&(Z(e.node.id),c===`single`&&ce&&J(e.node.id))},ye=e=>{if(!e.disabled){if(c===`single`&&J(e.id),e.href){let t=A.current.get(e.id)?.querySelector(`[data-part="link"] a`);M.current=!0;try{t?.click()}finally{M.current=!1}}else E?.(e.id)}},be=(e,t)=>{let n=j.current;n.timer!==void 0&&clearTimeout(n.timer),n.timer=setTimeout(()=>{n.buffer=``,n.timer=void 0},oe),n.buffer+=e.toLowerCase();let r=n.buffer.length===1?t+1:t;for(let e=0;e<W.length;e++){let t=W[(r+e)%W.length];if(t&&t.node.label.toLowerCase().startsWith(n.buffer)){Q(t);return}}},xe=e=>{let t=e.target.closest(`[role="treeitem"]`);if(!t)return;let n=W.findIndex(e=>A.current.get(e.node.id)===t),r=W[n];if(!r)return;let{node:i}=r,a=c===`multiple`;if((e.ctrlKey||e.metaKey)&&!e.altKey&&e.code===`KeyA`){if(!a)return;e.preventDefault();let t=new Set(G);for(let e of W)t.add(e.node.id);q(t);return}switch(e.key){case`ArrowDown`:case`ArrowUp`:{e.preventDefault();let t=W[e.key===`ArrowDown`?n+1:n-1];if(!t)return;a&&e.shiftKey?(Z(t.node.id),me(t.node)):Q(t);return}case`ArrowRight`:if(e.preventDefault(),!p(i))return;if(!V.has(i.id))U(i.id);else{let e=m(i).find(e=>!e.disabled);e&&Q(W.find(t=>t.node.id===e.id))}return;case`ArrowLeft`:e.preventDefault(),p(i)&&V.has(i.id)?U(i.id):r.parentId!==null&&Q(W.find(e=>e.node.id===r.parentId));return;case`Home`:e.preventDefault(),Q(W[0]);return;case`End`:e.preventDefault(),Q(W[W.length-1]);return;case`Enter`:e.preventDefault(),ye(i);return;case` `:if(c===`none`)return;e.preventDefault(),he(i);return;case`*`:{e.preventDefault();let t=r.siblings.filter(e=>!e.disabled&&p(e)&&!V.has(e.id)).map(e=>e.id);t.length>0&&H([...B,...t.filter(e=>!B.includes(e))],t);return}default:e.key.length===1&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&(e.preventDefault(),be(e.key,n))}},Se=e=>{e.currentTarget.contains(e.relatedTarget)||X(void 0)},Ce=S?.labelSelectedWeight??`font.weight.medium`,we=S?.badgeSize??`font.size.xs`,Te=S?.headingSize??`font.size.md`,$={fontFamily:S?.fontFamily??`font.family.body`,fontSize:S?.fontSize??`font.size.sm`,lineHeight:S?.lineHeight??`font.lineHeight.normal`},Ee=(e,t,n,r)=>{let i=p(e),a=i&&V.has(e.id),o=c===`multiple`?_e(e):void 0,s=c===`single`?K.has(e.id):o===`true`,u=a&&e.children===`lazy`,f=m(e),ne=[`ds-tree__row`,s?`ds-tree__row--selected`:null,e.disabled?`ds-tree__row--disabled`:null].filter(Boolean).join(` `);return(0,y.jsxs)(`li`,{ref:t=>{t?A.current.set(e.id,t):A.current.delete(e.id)},id:`${O}-node-${e.id}`,role:`treeitem`,"data-part":`node`,className:`ds-tree__node`,style:{"--ds-tree-level":t-1},"aria-label":e.badge?`${e.label}, ${e.badge}`:e.label,"aria-level":t,"aria-setsize":r,"aria-posinset":n,"aria-expanded":i?a:void 0,"aria-selected":c===`single`?s:void 0,"aria-checked":o,"aria-disabled":e.disabled?!0:void 0,"aria-busy":u?!0:void 0,tabIndex:e.id===ve?0:-1,onFocus:t=>{t.target===t.currentTarget&&!e.disabled&&X(e.id)},children:[(0,y.jsxs)(`div`,{className:ne,"data-part":`nodeRow`,onMouseDown:t=>{e.disabled&&t.preventDefault()},onClick:t=>{e.disabled||M.current||(Z(e.id),!(t.detail>=2)&&he(e))},onDoubleClick:()=>ye(e),children:[(0,y.jsx)(`span`,{className:`ds-tree__indent`,"data-part":`indent`,"aria-hidden":`true`}),(0,y.jsxs)(`span`,{className:`ds-tree__content`,children:[i?(0,y.jsx)(`span`,{className:`ds-tree__expand`,"data-part":`expandButton`,onMouseDown:e=>e.preventDefault(),onClick:t=>{t.stopPropagation(),!e.disabled&&(U(e.id),Z(e.id))},onDoubleClick:e=>e.stopPropagation(),children:(0,y.jsx)(ee,{variant:`ghost`,size:`sm`,iconOnly:!0,label:re(a?b.collapse:b.expand,{label:e.label}),leadingIcon:(0,y.jsx)(`span`,{className:a?`ds-tree__chevron ds-tree__chevron--expanded`:`ds-tree__chevron`,children:(0,y.jsx)(d,{name:`chevron-right`,inline:!0})}),disabled:e.disabled??!1,tabIndex:-1})}):(0,y.jsx)(`span`,{className:`ds-tree__expand`,"aria-hidden":`true`}),(0,y.jsxs)(`span`,{className:`ds-tree__main`,children:[o===void 0?null:(0,y.jsx)(`span`,{className:o===`false`?`ds-tree__checkbox`:`ds-tree__checkbox ds-tree__checkbox--checked`,"data-part":`checkbox`,"aria-hidden":`true`,children:o===`true`?(0,y.jsx)(d,{name:`check`,inline:!0}):o===`mixed`?(0,y.jsx)(d,{name:`dash`,inline:!0}):null}),(0,y.jsxs)(`span`,{className:`ds-tree__body`,children:[e.icon?(0,y.jsx)(`span`,{className:`ds-tree__icon`,"data-part":`icon`,children:(0,y.jsx)(d,{name:e.icon,inline:!0,overrides:{color:`color.foreground.muted`}})}):null,(0,y.jsx)(`span`,{className:`ds-tree__label`,children:(0,y.jsx)(l,{"data-part":`label`,element:`span`,truncate:!0,overrides:s&&e.href===void 0?{...$,fontWeight:Ce}:$,children:e.href?(0,y.jsx)(`span`,{className:`ds-tree__link`,"data-part":`link`,children:(0,y.jsx)(te,{href:e.href,label:e.label,tone:`inherit`,tabIndex:-1})}):e.label})})]})]}),e.badge?(0,y.jsx)(l,{"data-part":`badge`,element:`span`,tone:`muted`,overrides:{fontSize:we},children:e.badge}):null]})]}),a?(0,y.jsx)(`ul`,{role:`group`,"data-part":`group`,className:`ds-tree__group`,children:u?(0,y.jsx)(`li`,{role:`treeitem`,className:`ds-tree__node`,style:{"--ds-tree-level":t},"aria-level":t+1,"aria-setsize":1,"aria-posinset":1,"aria-disabled":!0,children:(0,y.jsxs)(`div`,{className:`ds-tree__row ds-tree__row--placeholder`,children:[(0,y.jsx)(`span`,{className:`ds-tree__indent`,"aria-hidden":`true`}),(0,y.jsxs)(`span`,{className:`ds-tree__content`,children:[(0,y.jsx)(`span`,{className:`ds-tree__expand`,"aria-hidden":`true`}),(0,y.jsx)(l,{element:`span`,tone:`muted`,overrides:$,children:b.loading})]})]})}):f.map((e,n)=>Ee(e,t+1,n+1,f.length))}):null]},e.id)},De=[`ds-tree`,x?null:`ds-tree--hide-guides`].filter(Boolean).join(` `);return(0,y.jsxs)(`div`,{...D,ref:e,"data-ds":`Tree`,"data-part":`container`,className:De,style:S?ne(S):void 0,children:[n?(0,y.jsx)(`div`,{className:`ds-tree__heading`,"data-part":`heading`,children:(0,y.jsx)(s,{id:k,level:r,size:`md`,overrides:{fontSize:Te},children:t})}):null,(0,y.jsx)(`ul`,{role:`tree`,className:`ds-tree__tree`,"aria-label":n?void 0:t,"aria-labelledby":n?k:void 0,"aria-multiselectable":c===`multiple`||void 0,onKeyDown:xe,onBlur:Se,children:i.map((e,t)=>Ee(e,1,t+1,i.length))}),i.length===0?(0,y.jsx)(l,{"data-part":`emptyState`,tone:`muted`,overrides:$,children:b.empty}):null,c===`multiple`?(0,y.jsx)(`span`,{className:`ds-tree__visually-hidden`,role:`status`,"aria-live":`polite`,children:re(b.selectedCount,{count:G.length})}):null]})}var v,y,b,oe,se,ce;function x(){return(x=e((()=>{v=t(),r(),a(),o(),u(),f(),c(),y=n(),b={expand:`Expand {label}`,collapse:`Collapse {label}`,selectedCount:`{count} selected`,loading:`Loading`,empty:`Nothing here.`},oe=500,se=`*`,ce={indent:`--ds-tree-indent`,rowPaddingInline:`--ds-tree-row-padding-inline`,rowRadius:`--ds-tree-row-radius`,rowGap:`--ds-tree-row-gap`,rowHover:`--ds-tree-row-hover`,guideLine:`--ds-tree-guide-line`,guideLineWidth:`--ds-tree-guide-line-width`,checkboxGap:`--ds-tree-checkbox-gap`,checkboxSize:`--ds-tree-checkbox-size`,checkboxBorderWidth:`--ds-tree-checkbox-border-width`,checkboxBackground:`--ds-tree-checkbox-background`,checkboxRadius:`--ds-tree-checkbox-radius`,fontFamily:`--ds-tree-font-family`,fontSize:`--ds-tree-font-size`,lineHeight:`--ds-tree-line-height`,disabledOpacity:`--ds-tree-disabled-opacity`,transition:`--ds-tree-transition`},_.__docgenInfo={description:"Tree — Design Schema, category: navigation.\r\n\r\nWhen to use:\r\nUse a Tree for a hierarchy the user navigates or picks from: folders, a site's sections, product\r\ncategories, an org's departments. `single` selection with `href` nodes is a navigation tree;\r\n`multiple` with `selectChildren` is a picker (choose folders to sync). Use `selectOnFocus` only\r\nwhen the tree drives a panel beside it and moving through nodes should preview them.",methods:[],displayName:`Tree`,props:{label:{required:!0,tsType:{name:`string`},description:'What the tree lists ("Folders", "Categories"). Not visible unless `showLabel`.'},showLabel:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Show the label as a Heading above the tree (then the tree is aria-labelledby it instead of aria-label).`,defaultValue:{value:`false`,computed:!1}},headingLevel:{required:!1,tsType:{name:`union`,raw:`TreeHeadingLevel | undefined`,elements:[{name:`union`,raw:`'2' | '3' | '4' | 2 | 3 | 4`,elements:[{name:`literal`,value:`'2'`},{name:`literal`,value:`'3'`},{name:`literal`,value:`'4'`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`}]},{name:`undefined`}]},description:`Heading level of the visible label in the page outline; its size is headingSize regardless.`,defaultValue:{value:`'2'`,computed:!1}},nodes:{required:!0,tsType:{name:`Array`,elements:[{name:`TreeNode`}],raw:`TreeNode[]`},description:"The hierarchy. `href` makes a node's label a Link with `tone: inherit` nested inside the label Text, so it\r\ntakes the label's font and color (navigation trees); `icon` is an Icon glyph (`folder` and `file` exist for\r\nthe usual case); `badge` is a short trailing count or status; `children: \"lazy\"` loads on first expand\r\nthrough `onExpand`."},expanded:{required:!1,tsType:{name:`union`,raw:`string[] | undefined`,elements:[{name:`Array`,elements:[{name:`string`}],raw:`string[]`},{name:`undefined`}]},description:'Controlled expanded ids. A still-`"lazy"` id here is held closed until the user opens it, exactly as in\r\n`defaultExpanded` — the id stays in the array the caller passed and in what onExpandChange reports, but\r\nthe node does not render open and fires no onExpand.'},defaultExpanded:{required:!1,tsType:{name:`union`,raw:`string[] | undefined`,elements:[{name:`Array`,elements:[{name:`string`}],raw:`string[]`},{name:`undefined`}]},description:'Initially expanded ids. `["*"]` opens every node whose `children` is a non-empty array and never a\r\n`"lazy"` node; `"*"` is reserved as that sentinel, so a node whose id is literally `"*"` is never matched\r\nby it. The first user toggle resolves `"*"` to the concrete ids then open, and that resolved array is what\r\nonExpandChange reports, any held-lazy ids kept in place. A lazy id listed explicitly stays closed until the\r\nuser opens it (onExpand only fires for user acts), and the same rule covers the controlled `expanded`.'},selectable:{required:!1,tsType:{name:`union`,raw:`TreeSelectable | undefined`,elements:[{name:`union`,raw:`'none' | 'single' | 'multiple'`,elements:[{name:`literal`,value:`'none'`},{name:`literal`,value:`'single'`},{name:`literal`,value:`'multiple'`}]},{name:`undefined`}]},description:"`single`: one current node (the usual for navigation and pickers). `multiple`: checkbox-like\r\nselection with Space, Shift+arrows and Ctrl+A; parents are checkboxes that cascade when\r\n`selectChildren`. `none`: expand/collapse only.",defaultValue:{value:`'single'`,computed:!1}},selected:{required:!1,tsType:{name:`union`,raw:`string[] | undefined`,elements:[{name:`Array`,elements:[{name:`string`}],raw:`string[]`},{name:`undefined`}]},description:"Controlled selected ids. Always an array, even in `single` mode (zero or one element)."},defaultSelected:{required:!1,tsType:{name:`union`,raw:`string[] | undefined`,elements:[{name:`Array`,elements:[{name:`string`}],raw:`string[]`},{name:`undefined`}]},description:`Initially selected ids.`},selectChildren:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"With `multiple`, selecting a parent selects its descendants and parents show indeterminate. The cascade\r\ncovers loaded, enabled descendants only; a parent's id is in `selected` exactly when all its enabled loaded\r\ndescendants are, and unchecking any descendant removes it and every ancestor id. A parent with no enabled\r\nloaded descendants behaves as a leaf. Shift+ArrowDown/Up cascade like Space but only ever add.",defaultValue:{value:`false`,computed:!1}},selectOnFocus:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`With \`single\`, moving focus also selects (a settings sidebar where the tree drives a panel). Moving focus\r
means the keyboard — the arrows, Home, End and type-ahead; entering with Tab and pointer focus never select\r
on their own. Off by default: focus moves, Enter or Space selects.`,defaultValue:{value:`false`,computed:!1}},showGuides:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Vertical guide lines under open parents.`,defaultValue:{value:`true`,computed:!1}},overrides:{required:!1,tsType:{name:`union`,raw:`Partial<Record<TreeOverridableBinding, TokenRef | undefined>> | undefined`,elements:[{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'indent'\r
| 'rowPaddingInline'\r
| 'rowRadius'\r
| 'rowGap'\r
| 'rowHover'\r
| 'labelSelectedWeight'\r
| 'headingSize'\r
| 'badgeSize'\r
| 'guideLine'\r
| 'guideLineWidth'\r
| 'checkboxGap'\r
| 'checkboxSize'\r
| 'checkboxBorderWidth'\r
| 'checkboxBackground'\r
| 'checkboxRadius'\r
| 'fontFamily'\r
| 'fontSize'\r
| 'lineHeight'\r
| 'disabledOpacity'\r
| 'transition'`,elements:[{name:`literal`,value:`'indent'`},{name:`literal`,value:`'rowPaddingInline'`},{name:`literal`,value:`'rowRadius'`},{name:`literal`,value:`'rowGap'`},{name:`literal`,value:`'rowHover'`},{name:`literal`,value:`'labelSelectedWeight'`},{name:`literal`,value:`'headingSize'`},{name:`literal`,value:`'badgeSize'`},{name:`literal`,value:`'guideLine'`},{name:`literal`,value:`'guideLineWidth'`},{name:`literal`,value:`'checkboxGap'`},{name:`literal`,value:`'checkboxSize'`},{name:`literal`,value:`'checkboxBorderWidth'`},{name:`literal`,value:`'checkboxBackground'`},{name:`literal`,value:`'checkboxRadius'`},{name:`literal`,value:`'fontFamily'`},{name:`literal`,value:`'fontSize'`},{name:`literal`,value:`'lineHeight'`},{name:`literal`,value:`'disabledOpacity'`},{name:`literal`,value:`'transition'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<TreeOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<TreeOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:`Per-instance style overrides: each entry sets the matching CSS hook (or composed child override) to that token.`},onSelectionChange:{required:!1,tsType:{name:`union`,raw:`((ids: string[]) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired with the selected ids, in tree (document) order, and only when the set actually changes.`},onExpandChange:{required:!1,tsType:{name:`union`,raw:`((ids: string[]) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired with the expanded ids, in the order they were opened.`},onExpand:{required:!1,tsType:{name:`union`,raw:`((id: string) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:'Fired with its id each time a node whose `children` is still `"lazy"` is opened, so a failed load can retry;\r\nreplacing `children` is the only thing that stops it. Fires before the onExpandChange of the same act.'},onActivate:{required:!1,tsType:{name:`union`,raw:`((id: string) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Fired on Enter or double-click on a node (open the file, navigate), with its id. Nodes with `href` navigate instead."},ref:{required:!1,tsType:{name:`union`,raw:`Ref<HTMLDivElement> | undefined`,elements:[{name:`Ref`,elements:[{name:`HTMLDivElement`}],raw:`Ref<HTMLDivElement>`},{name:`undefined`}]},description:``}},composes:[`Omit`]}})))()}var S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,le;function z(){return(z=e((()=>{x(),S={title:`Tree/React`,component:_,args:{label:`Folders`,nodes:[{id:`docs`,label:`Documents`,icon:`folder`,badge:`3`,children:[{id:`invoices`,label:`Invoices`,icon:`file`},{id:`contracts`,label:`Contracts`,icon:`file`},{id:`archive`,label:`Archive`,icon:`file`,disabled:!0}]},{id:`media`,label:`Media`,icon:`folder`,children:[{id:`photos`,label:`Photos`,icon:`folder`,children:[{id:`holiday`,label:`Holiday`,icon:`file`}]},{id:`videos`,label:`Videos`,icon:`folder`,children:`lazy`}]},{id:`notes`,label:`Notes`,icon:`file`}]},tags:[`autodocs`]},C={},w={args:{selectable:`none`,defaultExpanded:[`docs`]}},T={args:{selectable:`single`,defaultExpanded:[`docs`],defaultSelected:[`invoices`]}},E={args:{selectable:`multiple`,defaultExpanded:[`docs`],defaultSelected:[`invoices`,`notes`]}},D={args:{showLabel:!0,headingLevel:`2`}},O={args:{showLabel:!0,headingLevel:`3`}},k={args:{showLabel:!0,headingLevel:`4`}},A={args:{selectable:`multiple`,selectChildren:!0,defaultExpanded:[`*`],defaultSelected:[`invoices`]}},j={args:{showGuides:!1,defaultExpanded:[`*`]}},M={args:{defaultExpanded:[`media`,`videos`]}},N={args:{nodes:[]}},P={args:{defaultExpanded:[`docs`]}},F={args:{label:`Folders`,defaultExpanded:[`docs`],nodes:[{id:`docs`,label:`Documents`,icon:`folder`,children:[{id:`invoices`,label:`Invoices`,icon:`file`},{id:`contracts`,label:`Contracts`,icon:`file`}]},{id:`media`,label:`Media`,icon:`folder`,children:`lazy`}]}},I={args:{label:`Settings sections`,showLabel:!0,headingLevel:`2`,selectOnFocus:!0,nodes:[{id:`account`,label:`Account`,href:`/settings/account`},{id:`billing`,label:`Billing`,href:`/settings/billing`}]}},L={args:{label:`Categories`,selectable:`multiple`,selectChildren:!0,defaultExpanded:[`*`],nodes:[{id:`clothing`,label:`Clothing`,children:[{id:`shirts`,label:`Shirts`},{id:`shoes`,label:`Shoes`}]}]}},R={args:{label:`Site map`,selectable:`none`,nodes:[{id:`guides`,label:`Guides`,badge:`12`,children:[{id:`start`,label:`Getting started`}]},{id:`api`,label:`API`,badge:`48`,children:`lazy`}]}},le=[`Default`,`SelectableNone`,`SelectableSingle`,`SelectableMultiple`,`HeadingLevel2`,`HeadingLevel3`,`HeadingLevel4`,`SelectChildren`,`GuidesHidden`,`LazyLoading`,`Empty`,`Keyboard`,`FolderTree`,`NavigationSidebar`,`CategoryPickerWithCascade`,`ReadOnlySiteMap`],C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'none',
    defaultExpanded: ['docs']
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'single',
    defaultExpanded: ['docs'],
    defaultSelected: ['invoices']
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'multiple',
    defaultExpanded: ['docs'],
    defaultSelected: ['invoices', 'notes']
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    showLabel: true,
    headingLevel: '2'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    showLabel: true,
    headingLevel: '3'
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    showLabel: true,
    headingLevel: '4'
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'multiple',
    selectChildren: true,
    defaultExpanded: ['*'],
    defaultSelected: ['invoices']
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    showGuides: false,
    defaultExpanded: ['*']
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    defaultExpanded: ['media', 'videos']
  }
}`,...M.parameters?.docs?.source},description:{story:'A `children: "lazy"` branch. `videos` is listed in `defaultExpanded` but stays closed — a lazy id only opens\r\non a user act, which is what fires `onExpand`; open it to see the placeholder and the parent\'s `aria-busy`.',...M.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    nodes: []
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    defaultExpanded: ['docs']
  }
}`,...P.parameters?.docs?.source},description:{story:`Keyboard gate: present with the first branch open — Documents, Invoices, Contracts, Media, Notes are focusable.`,...P.parameters?.docs?.description}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
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
}`,...F.parameters?.docs?.source},description:{story:`The everyday file tree, one branch open, each node with its glyph.`,...F.parameters?.docs?.description}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
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
}`,...I.parameters?.docs?.source},description:{story:`A settings sidebar whose visible heading names it and whose selection drives the panel beside it.`,...I.parameters?.docs?.description}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
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
}`,...L.parameters?.docs?.source},description:{story:`Multi-select categories where choosing a parent chooses everything under it.`,...L.parameters?.docs?.description}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
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
}`,...R.parameters?.docs?.source},description:{story:`A tree that only expands and collapses, with counts after each branch.`,...R.parameters?.docs?.description}}}})))()}z();export{L as CategoryPickerWithCascade,C as Default,N as Empty,F as FolderTree,j as GuidesHidden,D as HeadingLevel2,O as HeadingLevel3,k as HeadingLevel4,P as Keyboard,M as LazyLoading,I as NavigationSidebar,R as ReadOnlySiteMap,A as SelectChildren,E as SelectableMultiple,w as SelectableNone,T as SelectableSingle,le as __namedExportsOrder,S as default};