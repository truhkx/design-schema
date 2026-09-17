import{n as e,o as t}from"./rolldown-runtime-C0FnF6B9.js";import{t as n}from"./react-DiVRNtpo.js";import{X as r,Z as i,c as a,h as o,l as s,m as c,n as l,o as u,r as d,t as f}from"./decorators-Dl4455ZU.js";import{n as p,t as ee}from"./Platform-qE9g7V_t.js";import{n as m,t as te}from"./FlatList-B--84B_m.js";import{n as h,t as g}from"./Animated-75prr5wJ.js";import{a as ne,i as re,n as ie,r as ae}from"./Link-Bw8MWX3a.js";import{n as oe,t as se}from"./Pressable-CjGHHyHY.js";import{n as ce,t as _}from"./Icon-sSovLWRe.js";import{c as le,i as v,l as y,m as b,p as ue,r as x,s as S}from"./iframe-CAToN8Eb.js";import{n as C,t as de}from"./Button-B0Tk0pjd.js";import{n as fe,t as pe}from"./Heading-BHboSapN.js";function w(e,t,n){return t===void 0?n:s(e,t)}function me(e){return e.children===`lazy`||Array.isArray(e.children)&&e.children.length>0}function he(e,t,n,r=[]){for(let i of e)r.push({key:i.id,level:n,placeholder:!1,node:i}),me(i)&&t.has(i.id)&&(i.children===`lazy`?r.push({key:`${i.id}::loading`,level:n+1,placeholder:!0,node:i}):Array.isArray(i.children)&&he(i.children,t,n+1,r));return r}function ge(e,t=[]){for(let n of e)Array.isArray(n.children)&&n.children.length>0&&(t.push(n.id),ge(n.children,t));return t}function _e(e,t=[]){for(let n of e)n.children===`lazy`?t.push(n.id):Array.isArray(n.children)&&_e(n.children,t);return t}function T(e,t=[]){if(Array.isArray(e.children))for(let n of e.children)n.disabled!==!0&&t.push(n.id),T(n,t);return t}function ve(e,t,n){for(let r of e)n.set(r.id,{node:r,parent:t,order:n.size}),Array.isArray(r.children)&&ve(r.children,r.id,n);return n}function ye({expanded:e,color:t,duration:n}){let{tokens:r}=le(),i=S(),a=E.useRef(new g.Value(+!!e)).current;E.useEffect(()=>{let t=+!!e;if(i){a.setValue(t);return}g.timing(a,{toValue:t,duration:n,easing:v(r.motionEasingStandard),useNativeDriver:!1}).start()},[e,i,n,a,r.motionEasingStandard]);let o={transform:[{rotate:a.interpolate({inputRange:[0,1],outputRange:[`0deg`,`90deg`]})}]};return(0,D.jsx)(g.View,{style:o,children:(0,D.jsx)(_,{name:`chevron-right`,size:`sm`,color:t})})}function be({label:e,showLabel:t=!1,headingLevel:n=`2`,nodes:r,expanded:a,defaultExpanded:o,selectable:s=`single`,selected:l,defaultSelected:u,selectChildren:f=!1,selectOnFocus:p=!1,showGuides:m=!0,overrides:h,onSelectionChange:g,onExpandChange:ne,onExpand:ae,onActivate:oe,ref:ce}){let{tokens:v}=le(),y=w(v,h?.indent,v.space5),b=v.sizeTargetMin,x=w(v,h?.rowPaddingInline,v.space2),S=w(v,h?.rowRadius,v.radiusSm),C=w(v,h?.rowGap,v.layoutGapTight),fe=w(v,h?.rowHover,v.colorActionGhostBackgroundHover),be=v.colorBackgroundStrong,k=v.colorControlSelectedBackground,A=v.borderWidthFocus,j=v.sizeTargetMin,M=w(v,h?.guideLine,v.colorBorder),N=w(v,h?.guideLineWidth,v.borderWidthThin),P=w(v,h?.checkboxGap,v.layoutGapTight),F=w(v,h?.checkboxSize,v.space4),I=w(v,h?.checkboxBorderWidth,v.borderWidthThin),L=w(v,h?.checkboxBackground,v.colorControlBackground),R=w(v,h?.checkboxRadius,v.radiusSm),z=w(v,h?.disabledOpacity,v.opacityDisabled),B=w(v,h?.transition,v.motionDurationFast),V=h?.labelSelectedWeight??xe,H=h?.headingSize??Se,U=h?.badgeSize??Ce,W={fontFamily:h?.fontFamily,fontSize:h?.fontSize,lineHeight:h?.lineHeight},G=E.useMemo(()=>ve(r,void 0,new Map),[r]),[K,q]=E.useState(()=>o?.includes(`*`)?ge(r):o??[]),J=a??K,[Te,Ee]=E.useState([]),De=E.useMemo(()=>new Set(_e(r)),[r]),Y=E.useMemo(()=>new Set(J.filter(e=>!De.has(e)||Te.includes(e))),[J,De,Te]),Oe=e=>{a===void 0&&q(e),ne?.(e)},ke=e=>{if(e.disabled!==!0){if(Y.has(e.id)){Oe(J.filter(t=>t!==e.id));return}e.children===`lazy`&&(Ee(t=>t.includes(e.id)?t:[...t,e.id]),ae?.(e.id)),Oe(J.includes(e.id)?J:[...J,e.id])}},Ae=E.useMemo(()=>he(r,Y,1),[r,Y]),[je,Me]=E.useState(u??[]),X=l??je,Z=E.useMemo(()=>new Set(X),[X]),[Ne,Pe]=E.useState(``),Fe=e=>Array.from(e).sort((e,t)=>(G.get(e)?.order??2**53-1)-(G.get(t)?.order??2**53-1)),Ie=e=>{if(!(e.length===X.length&&e.every(e=>Z.has(e)))&&(l===void 0&&Me(e),g?.(e),s===`multiple`)){let t=O.selectedCount(e.length);Pe(t),ee.OS===`ios`&&ue.announceForAccessibility(t)}},Le=e=>{let t=Z.has(e.id);if(!f)return t?`checked`:`unchecked`;let n=T(e);if(n.length===0)return t?`checked`:`unchecked`;let r=n.filter(e=>Z.has(e)).length;return r===n.length?`checked`:r>0||t?`mixed`:`unchecked`},Re=(e,t)=>{let n=G.get(e)?.parent;for(;n!==void 0;){let e=G.get(n);if(e===void 0)return;let r=T(e.node);r.length>0&&(r.every(e=>t.has(e))?t.add(n):t.delete(n)),n=e.parent}},ze=e=>{Ie([e.id])},Be=e=>{let t=Le(e)!==`checked`,n=f?[e.id,...T(e)]:[e.id],r=new Set(Z);for(let e of n)t?r.add(e):r.delete(e);f&&Re(e.id,r),Ie(Fe(r))},Ve=e=>{if(e.href!==void 0){Promise.resolve(re.openURL(e.href)).catch(()=>void 0);return}oe?.(e.id)},He=e=>{if(e.disabled!==!0){if(s===`multiple`){Be(e);return}s===`single`&&ze(e),Ve(e)}},Q=e=>{e.disabled!==!0&&s===`multiple`&&Ve(e)},[Ue,We]=E.useState(null),[Ge,$]=E.useState(null),Ke=e=>{We(e.id),p&&s===`single`&&e.disabled!==!0&&ze(e)},qe=e=>m&&e>1?(0,D.jsx)(c,{accessibilityElementsHidden:!0,importantForAccessibility:`no-hide-descendants`,style:[i.absoluteFill,{pointerEvents:`none`}],children:Array.from({length:e-1},(e,t)=>(0,D.jsx)(c,{style:{position:`absolute`,top:0,bottom:0,start:x+t*y+(j-N)/2,width:N,backgroundColor:M}},t))}):null,Je=e=>(0,D.jsx)(c,{testID:`Tree.checkbox`,accessibilityElementsHidden:!0,importantForAccessibility:`no-hide-descendants`,style:{width:F,height:F,borderRadius:R,borderWidth:I,borderColor:e===`unchecked`?v.colorControlBorder:v.colorControlSelectedBackground,backgroundColor:e===`unchecked`?L:v.colorControlSelectedBackground,alignItems:`center`,justifyContent:`center`},children:e===`unchecked`?null:(0,D.jsx)(_,{name:e===`mixed`?`dash`:`check`,size:`xs`,color:v.colorControlSelectedForeground})}),Ye=e=>(0,D.jsxs)(c,{testID:`Tree.node`,style:{flexDirection:`row`,alignItems:`center`,minHeight:b,paddingHorizontal:x,gap:C},children:[qe(e.level),(0,D.jsx)(c,{testID:`Tree.indent`,style:{width:(e.level-1)*y}}),(0,D.jsx)(c,{style:{width:j}}),(0,D.jsx)(d,{size:`sm`,tone:`muted`,children:O.loading})]});return(0,D.jsxs)(c,{ref:ce,testID:`Tree`,children:[t?(0,D.jsx)(c,{testID:`Tree.heading`,children:(0,D.jsx)(pe,{level:n,overrides:{fontSize:H},children:e})}):null,(0,D.jsx)(te,{accessibilityRole:`list`,accessibilityLabel:e,data:Ae,extraData:[X,J,Ue,Ge,s,f,m],keyExtractor:e=>e.key,renderItem:({item:e})=>{if(e.placeholder)return Ye(e);let{node:t,level:n}=e,r=me(t),a=r&&Y.has(t.id),o=t.disabled===!0,l=s===`multiple`?Le(t):`unchecked`,u=s===`single`?Z.has(t.id):s===`multiple`&&l===`checked`,f=!o&&Ge===t.id,p=[];return r&&!o&&p.push({name:`expand`,label:O.expand(t.label)},{name:`collapse`,label:O.collapse(t.label)}),s===`multiple`&&!o&&p.push({name:`longpress`}),(0,D.jsxs)(c,{testID:`Tree.node`,style:{flexDirection:`row`,alignItems:`center`,minHeight:b,paddingHorizontal:x,gap:C,borderRadius:S,backgroundColor:u?be:f?fe:void 0,opacity:o?z:1},children:[qe(n),u?(0,D.jsx)(c,{accessibilityElementsHidden:!0,importantForAccessibility:`no`,style:{position:`absolute`,top:0,bottom:0,start:0,width:A,backgroundColor:k,pointerEvents:`none`}}):null,(0,D.jsx)(c,{testID:`Tree.indent`,style:{width:(n-1)*y}}),(0,D.jsx)(c,{testID:`Tree.expandButton`,style:{width:j,minHeight:j,alignItems:`center`,justifyContent:`center`},children:r?(0,D.jsx)(de,{label:a?O.collapse(t.label):O.expand(t.label),variant:`ghost`,size:`sm`,iconOnly:!0,expanded:a,disabled:o,leadingIcon:(0,D.jsx)(ye,{expanded:a,color:v.colorForeground,duration:B}),onPress:()=>ke(t)}):null}),(0,D.jsxs)(se,{testID:`Tree.nodeRow`,accessibilityRole:t.href===void 0?`button`:`link`,accessibilityLabel:`${t.label}, level ${n}`,accessibilityState:{disabled:o,expanded:r?a:void 0,selected:s===`single`?u:void 0,checked:s===`multiple`?l===`mixed`?`mixed`:l===`checked`:void 0,busy:a&&t.children===`lazy`?!0:void 0},accessibilityActions:p.length>0?p:void 0,onAccessibilityAction:p.length>0?e=>{let n=e.nativeEvent.actionName;n===`expand`&&!a||n===`collapse`&&a?ke(t):n===`longpress`&&Q(t)}:void 0,onPress:()=>He(t),onLongPress:s===`multiple`?()=>Q(t):void 0,onFocus:()=>Ke(t),onBlur:()=>We(e=>e===t.id?null:e),onHoverIn:()=>$(t.id),onHoverOut:()=>$(e=>e===t.id?null:e),onPressIn:()=>$(t.id),onPressOut:()=>$(e=>e===t.id?null:e),style:{flex:1,flexDirection:`row`,alignItems:`center`,alignSelf:`stretch`,gap:P},children:[s===`multiple`?Je(l):null,(0,D.jsxs)(c,{style:{flex:1,flexDirection:`row`,alignItems:`center`,gap:C},children:[t.icon===void 0?null:(0,D.jsx)(c,{testID:`Tree.icon`,children:(0,D.jsx)(_,{name:t.icon,size:`sm`,color:v.colorForegroundMuted})}),(0,D.jsx)(c,{style:{flex:1},children:t.href===void 0?(0,D.jsx)(c,{testID:`Tree.label`,children:(0,D.jsx)(d,{size:`sm`,truncate:!0,overrides:u?{...W,fontWeight:V}:W,children:t.label})}):(0,D.jsx)(c,{testID:`Tree.link`,children:(0,D.jsx)(d,{size:`sm`,truncate:!0,overrides:W,children:(0,D.jsx)(ie,{href:t.href,label:t.label,onPress:()=>(He(t),!1),onLongPress:s===`multiple`?()=>Q(t):void 0})})})}),t.badge===void 0?null:(0,D.jsx)(c,{testID:`Tree.badge`,children:(0,D.jsx)(d,{size:`xs`,tone:`muted`,overrides:{fontSize:U},children:t.badge})})]})]}),Ue===t.id?(0,D.jsx)(c,{accessibilityElementsHidden:!0,importantForAccessibility:`no`,style:[i.absoluteFill,{borderWidth:v.borderWidthFocus,borderColor:v.colorBorderFocus,borderRadius:S,pointerEvents:`none`}]}):null]})},ListEmptyComponent:(0,D.jsx)(c,{testID:`Tree.emptyState`,style:{minHeight:b,paddingHorizontal:x,justifyContent:`center`},children:(0,D.jsx)(d,{size:`sm`,tone:`muted`,children:O.empty})})}),s===`multiple`?(0,D.jsx)(c,{accessibilityLiveRegion:`polite`,style:we,children:(0,D.jsx)(d,{size:`sm`,children:Ne})}):null]})}var E,D,O,xe,Se,Ce,we;function k(){return(k=e((()=>{E=t(n(),1),b(),h(),m(),ne(),p(),oe(),r(),o(),a(),C(),fe(),ce(),ae(),u(),x(),D=y(),O={expand:e=>`Expand ${e}`,collapse:e=>`Collapse ${e}`,selectedCount:e=>`${e} selected`,loading:`Loading`,empty:`Nothing here.`},xe=`font.weight.medium`,Se=`font.size.md`,Ce=`font.size.xs`,we={position:`absolute`,width:1,height:1,overflow:`hidden`},be.__docgenInfo={description:'Tree — a list that knows about nesting: a file browser\'s sidebar, a category\npicker, a documentation site\'s navigation. One field per node.\n\nWhen to use: a hierarchy the user navigates or picks from. `single` with `href`\nnodes is a navigation tree; `multiple` with `selectChildren` is a picker. Not for\none level (Listbox, a list of Links), several fields per node (TreeGrid) or a\nMenu.\n\nNative has no tree role: an optional `Heading` (`showLabel`, at `headingLevel`,\nsized by headingSize) above a `FlatList` (`accessibilityRole="list"`, labelled by\n`label`) over the flattened visible nodes — groups have no wrapper, collapsed\nsubtrees are absent. Each node is a row: indent per level with one guide line per\nopen ancestor (`showGuides`), a ghost `Button` chevron as the real expand target,\nthen a `Pressable` (`button`, or `link` for `href`) holding the drawn checkbox in\n`multiple` mode, the `Icon`, the label `Text` (or `Link`) and the badge `Text`.\nThe row announces "{label}, level {n}" with `accessibilityState` expanded,\nselected, checked (`mixed` for a partly selected cascading parent), disabled and\nbusy (an open lazy parent), and `expand`/`collapse` accessibility actions.\n\nA tap is Enter: it activates (`onActivate`, or opens `href` through `Linking`)\nand, in `single`, selects. In `multiple` a tap toggles selection and a long press\nactivates; the row carries the standard `longpress` accessibility action so a\nscreen reader can still reach activation. `selectOnFocus` selects from the\nPressable\'s `onFocus`. Selection is reported in tree order and only when the set\nchanges; in `multiple` it announces `copy.selectedCount` (iOS\n`announceForAccessibility`, an Android live region). A `"lazy"` node opens on a\nuser act only — firing `onExpand` every time it opens while still lazy, so a\nfailed load can retry — and shows a `copy.loading` placeholder while its parent\nreports busy. No arrow keys, `*` or type-ahead on this platform.',methods:[],displayName:`Tree`,props:{label:{required:!0,tsType:{name:`string`},description:'What the tree lists ("Folders", "Categories"). The accessible name; visible only with `showLabel`.'},showLabel:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Show the label as a Heading above the tree.`,defaultValue:{value:`false`,computed:!1}},headingLevel:{required:!1,tsType:{name:`union`,raw:`TreeHeadingLevel | undefined`,elements:[{name:`union`,raw:`'2' | '3' | '4' | 2 | 3 | 4`,elements:[{name:`literal`,value:`'2'`},{name:`literal`,value:`'3'`},{name:`literal`,value:`'4'`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`}]},{name:`undefined`}]},description:`Heading level of the visible label in the page outline; its size is headingSize regardless.`,defaultValue:{value:`'2'`,computed:!1}},nodes:{required:!0,tsType:{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{ id: string; label: string; icon?: IconName; badge?: string; disabled?: boolean; href?: string; children?: TreeNode[] | 'lazy' }`,signature:{properties:[{key:`id`,value:{name:`string`,required:!0}},{key:`label`,value:{name:`string`,required:!0}},{key:`icon`,value:{name:`union`,raw:`| 'check'
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
| 'file'`,elements:[{name:`literal`,value:`'check'`},{name:`literal`,value:`'dash'`},{name:`literal`,value:`'chevron-right'`},{name:`literal`,value:`'chevron-down'`},{name:`literal`,value:`'chevron-up'`},{name:`literal`,value:`'chevron-left'`},{name:`literal`,value:`'close'`},{name:`literal`,value:`'plus'`},{name:`literal`,value:`'minus'`},{name:`literal`,value:`'info'`},{name:`literal`,value:`'success'`},{name:`literal`,value:`'warning'`},{name:`literal`,value:`'danger'`},{name:`literal`,value:`'external'`},{name:`literal`,value:`'ellipsis'`},{name:`literal`,value:`'search'`},{name:`literal`,value:`'arrow-right'`},{name:`literal`,value:`'arrow-left'`},{name:`literal`,value:`'calendar'`},{name:`literal`,value:`'menu'`},{name:`literal`,value:`'list'`},{name:`literal`,value:`'grid'`},{name:`literal`,value:`'play'`},{name:`literal`,value:`'pause'`},{name:`literal`,value:`'folder'`},{name:`literal`,value:`'file'`}],required:!1}},{key:`badge`,value:{name:`string`,required:!1}},{key:`disabled`,value:{name:`boolean`,required:!1}},{key:`href`,value:{name:`string`,required:!1}},{key:`children`,value:{name:`union`,raw:`TreeNode[] | 'lazy'`,elements:[{name:`Array`,elements:[{name:`TreeNode`}],raw:`TreeNode[]`},{name:`literal`,value:`'lazy'`}],required:!1}}]}}],raw:`TreeNode[]`},description:`The hierarchy.`},expanded:{required:!1,tsType:{name:`union`,raw:`string[] | undefined`,elements:[{name:`Array`,elements:[{name:`string`}],raw:`string[]`},{name:`undefined`}]},description:`Controlled expanded ids.`},defaultExpanded:{required:!1,tsType:{name:`union`,raw:`string[] | undefined`,elements:[{name:`Array`,elements:[{name:`string`}],raw:`string[]`},{name:`undefined`}]},description:'Initially expanded ids. `["*"]` opens every node whose `children` is a non-empty array and never a `"lazy"` node; a lazy id listed explicitly stays closed until the user opens it.'},selectable:{required:!1,tsType:{name:`union`,raw:`TreeSelectable | undefined`,elements:[{name:`union`,raw:`'none' | 'single' | 'multiple'`,elements:[{name:`literal`,value:`'none'`},{name:`literal`,value:`'single'`},{name:`literal`,value:`'multiple'`}]},{name:`undefined`}]},description:"`single`: one current node. `multiple`: checkbox-like selection, cascading with `selectChildren`. `none`: expand/collapse only.",defaultValue:{value:`'single'`,computed:!1}},selected:{required:!1,tsType:{name:`union`,raw:`string[] | undefined`,elements:[{name:`Array`,elements:[{name:`string`}],raw:`string[]`},{name:`undefined`}]},description:"Controlled selected ids. Always an array, even in `single` mode."},defaultSelected:{required:!1,tsType:{name:`union`,raw:`string[] | undefined`,elements:[{name:`Array`,elements:[{name:`string`}],raw:`string[]`},{name:`undefined`}]},description:`Initially selected ids.`},selectChildren:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"With `multiple`, selecting a parent selects its enabled loaded descendants and parents show indeterminate.",defaultValue:{value:`false`,computed:!1}},selectOnFocus:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"With `single`, focus reaching a node (hardware keyboard, assistive technology) also selects it.",defaultValue:{value:`false`,computed:!1}},showGuides:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Vertical guide lines under open parents.`,defaultValue:{value:`true`,computed:!1}},overrides:{required:!1,tsType:{name:`union`,raw:`Partial<Record<TreeOverridableBinding, TokenRef | undefined>> | undefined`,elements:[{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'indent'
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
| 'transition'`,elements:[{name:`literal`,value:`'indent'`},{name:`literal`,value:`'rowPaddingInline'`},{name:`literal`,value:`'rowRadius'`},{name:`literal`,value:`'rowGap'`},{name:`literal`,value:`'rowHover'`},{name:`literal`,value:`'labelSelectedWeight'`},{name:`literal`,value:`'headingSize'`},{name:`literal`,value:`'badgeSize'`},{name:`literal`,value:`'guideLine'`},{name:`literal`,value:`'guideLineWidth'`},{name:`literal`,value:`'checkboxGap'`},{name:`literal`,value:`'checkboxSize'`},{name:`literal`,value:`'checkboxBorderWidth'`},{name:`literal`,value:`'checkboxBackground'`},{name:`literal`,value:`'checkboxRadius'`},{name:`literal`,value:`'fontFamily'`},{name:`literal`,value:`'fontSize'`},{name:`literal`,value:`'lineHeight'`},{name:`literal`,value:`'disabledOpacity'`},{name:`literal`,value:`'transition'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<TreeOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<TreeOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:"Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop."},onSelectionChange:{required:!1,tsType:{name:`union`,raw:`((ids: string[]) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired with every selected id in tree order, as a bare array, and only when the set changes.`},onExpandChange:{required:!1,tsType:{name:`union`,raw:`((ids: string[]) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired with every expanded id, in the order they were opened, as a bare array.`},onExpand:{required:!1,tsType:{name:`union`,raw:`((id: string) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:'Fired with its id each time a node whose `children` is still `"lazy"` is opened, so a failed load can retry. It precedes the `onExpandChange` of the same act.'},onActivate:{required:!1,tsType:{name:`union`,raw:`((id: string) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Fired when a node is activated, with its id. Nodes with `href` navigate instead."},ref:{required:!1,tsType:{name:`union`,raw:`React.Ref<ViewInstance> | undefined`,elements:[{name:`ReactRef`,raw:`React.Ref<ViewInstance>`,elements:[{name:`ViewInstance`}]},{name:`undefined`}]},description:`The root view.`}}}})))()}var A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K;function q(){return(q=e((()=>{k(),f(),A={title:`Tree/React Native`,component:be,decorators:[l()],args:{label:`Folders`,showLabel:!1,headingLevel:`2`,nodes:[{id:`docs`,label:`Documents`,icon:`folder`,children:[{id:`invoices`,label:`Invoices`,icon:`file`},{id:`contracts`,label:`Contracts`,icon:`file`,badge:`3`},{id:`archive`,label:`Archive`,icon:`folder`,disabled:!0}]},{id:`media`,label:`Media`,icon:`folder`,children:`lazy`},{id:`notes`,label:`Notes`,icon:`file`}],selectable:`single`,selectChildren:!1,selectOnFocus:!1,showGuides:!0},argTypes:{headingLevel:{control:`inline-radio`,options:[`2`,`3`,`4`]},selectable:{control:`inline-radio`,options:[`none`,`single`,`multiple`]}}},j={},M={args:{showLabel:!0,headingLevel:`2`}},N={args:{showLabel:!0,headingLevel:`3`}},P={args:{showLabel:!0,headingLevel:`4`}},F={args:{selectable:`none`}},I={args:{selectable:`single`,defaultExpanded:[`docs`],defaultSelected:[`invoices`]}},L={args:{selectable:`multiple`,defaultExpanded:[`docs`]}},R={args:{showGuides:!1,defaultExpanded:[`docs`]}},z={args:{defaultExpanded:[`media`]}},B={args:{nodes:[]}},V={args:{label:`Folders`,defaultExpanded:[`docs`],nodes:[{id:`docs`,label:`Documents`,icon:`folder`,children:[{id:`invoices`,label:`Invoices`,icon:`file`},{id:`contracts`,label:`Contracts`,icon:`file`}]},{id:`media`,label:`Media`,icon:`folder`,children:`lazy`}]}},H={args:{label:`Settings sections`,showLabel:!0,headingLevel:`2`,selectOnFocus:!0,nodes:[{id:`account`,label:`Account`,href:`/settings/account`},{id:`billing`,label:`Billing`,href:`/settings/billing`}]}},U={args:{label:`Categories`,selectable:`multiple`,selectChildren:!0,defaultExpanded:[`*`],nodes:[{id:`clothing`,label:`Clothing`,children:[{id:`shirts`,label:`Shirts`},{id:`shoes`,label:`Shoes`}]}]}},W={args:{label:`Site map`,selectable:`none`,nodes:[{id:`guides`,label:`Guides`,badge:`12`,children:[{id:`start`,label:`Getting started`}]},{id:`api`,label:`API`,badge:`48`,children:`lazy`}]}},G={args:{showLabel:!0,defaultExpanded:[`docs`],selectable:`single`}},K=[`Default`,`HeadingLevel2`,`HeadingLevel3`,`HeadingLevel4`,`SelectableNone`,`SelectableSingle`,`SelectableMultiple`,`HiddenGuides`,`LazyLoading`,`Empty`,`FolderTree`,`NavigationSidebar`,`CategoryPickerWithCascade`,`ReadOnlySiteMap`,`Keyboard`],j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    showLabel: true,
    headingLevel: '2'
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    showLabel: true,
    headingLevel: '3'
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    showLabel: true,
    headingLevel: '4'
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'none'
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'single',
    defaultExpanded: ['docs'],
    defaultSelected: ['invoices']
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'multiple',
    defaultExpanded: ['docs']
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    showGuides: false,
    defaultExpanded: ['docs']
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    defaultExpanded: ['media']
  }
}`,...z.parameters?.docs?.source},description:{story:"A lazy node the caller lists stays closed until the user opens it: press Media's chevron to fire `onExpand` and reveal the `Loading` placeholder.",...z.parameters?.docs?.description}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    nodes: []
  }
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
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
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
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
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
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
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
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
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  args: {
    showLabel: true,
    defaultExpanded: ['docs'],
    selectable: 'single'
  }
}`,...G.parameters?.docs?.source},description:{story:`Open, with the expand buttons and rows as focusable children, for the axe gate and manual keyboard checks on react-native-web.`,...G.parameters?.docs?.description}}}})))()}q();export{U as CategoryPickerWithCascade,j as Default,B as Empty,V as FolderTree,M as HeadingLevel2,N as HeadingLevel3,P as HeadingLevel4,R as HiddenGuides,G as Keyboard,z as LazyLoading,H as NavigationSidebar,W as ReadOnlySiteMap,L as SelectableMultiple,F as SelectableNone,I as SelectableSingle,K as __namedExportsOrder,A as default};