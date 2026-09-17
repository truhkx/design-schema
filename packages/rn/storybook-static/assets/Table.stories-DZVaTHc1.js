import{n as e,o as t}from"./rolldown-runtime-C0FnF6B9.js";import{t as n}from"./react-DiVRNtpo.js";import{X as r,Z as i,c as a,h as o,l as ee,m as s,n as c,o as te,r as l,t as ne}from"./decorators-Dl4455ZU.js";import{n as re,t as ie}from"./Platform-qE9g7V_t.js";import{n as ae,t as oe}from"./FlatList-B--84B_m.js";import{n as se,t as u}from"./Animated-75prr5wJ.js";import{n as ce,t as le}from"./Pressable-CjGHHyHY.js";import{a as ue,c as de,i as fe,n as d,o as f,r as pe,s as me,t as he}from"./Icon-sSovLWRe.js";import{n as ge,t as p}from"./useWindowDimensions-oJibnkug.js";import{c as _e,i as ve,l as m,m as ye,p as be,r as xe,s as Se}from"./iframe-CAToN8Eb.js";import{n as Ce,t as we}from"./Button-B0Tk0pjd.js";import{n as Te,t as Ee}from"./Heading-BHboSapN.js";import{n as De,t as Oe}from"./Checkbox--8cawqnp.js";import{r as h,t as ke}from"./Toolbar-DUjU0BAt.js";function g(e,t,n){return t===void 0?n:ee(e,t)}function _(e,t){let n=e[t];return n==null?``:String(n)}function Ae(e,t,n){let r=n.direction===`ascending`?1:-1,i=e[n.column],a=t[n.column];return typeof i==`number`&&typeof a==`number`?(i-a)*r:_(e,n.column).localeCompare(_(t,n.column),void 0,{numeric:!0})*r}function je({visible:e,color:t,duration:n}){let{tokens:r}=_e(),a=Se(),o=y.useRef(new u.Value(+!!e)).current;return y.useEffect(()=>{let t=+!!e;if(a){o.setValue(t);return}u.timing(o,{toValue:t,duration:n,easing:ve(r.motionEasingStandard),useNativeDriver:!1}).start()},[e,a,n,o,r.motionEasingStandard]),(0,b.jsx)(u.View,{accessibilityElementsHidden:!0,importantForAccessibility:`no-hide-descendants`,style:[i.absoluteFill,{backgroundColor:t,opacity:o,pointerEvents:`none`}]})}function Me({edge:e,inset:t,length:n,color:r}){let i=`table-fade-${y.useId().replace(/[^a-zA-Z0-9_-]/g,``)}`,a={position:`absolute`,top:0,bottom:0,width:n,pointerEvents:`none`,...e===`start`?{start:t}:{end:t}};return(0,b.jsx)(s,{style:a,accessibilityElementsHidden:!0,importantForAccessibility:`no`,children:(0,b.jsxs)(de,{width:`100%`,height:`100%`,children:[(0,b.jsx)(fe,{children:(0,b.jsxs)(ue,{id:i,x1:e===`start`?`0%`:`100%`,y1:`0%`,x2:e===`start`?`100%`:`0%`,y2:`0%`,children:[(0,b.jsx)(me,{offset:`0`,stopColor:r,stopOpacity:1}),(0,b.jsx)(me,{offset:`1`,stopColor:r,stopOpacity:0})]})}),(0,b.jsx)(f,{width:`100%`,height:`100%`,fill:`url(#${i})`})]})})}function v({caption:e,captionLevel:t=`2`,footer:n,hideCaption:r=!1,columns:i,data:a,sort:o,defaultSort:ee,selectable:c=`none`,selected:te,defaultSelected:ne,responsive:re=`stack`,stickyHeader:ae=!0,maxHeight:se=`none`,density:ce=`comfortable`,striped:ue=!1,emptyMessage:de,loading:fe=!1,rowActions:d,overrides:f,onSortChange:pe,onSelectionChange:me,onRowPress:p,ref:ve}){let{tokens:m}=_e(),ye=ge(),xe=y.useId(),[Se,Ce]=y.useState(null),Te=Se??ye.width,De=Te<m.layoutMaxWidthProse,h=re===`scroll`?`scroll`:De?`stack`:`table`,[v,Ve]=y.useState(ee),C=o??v,[He,w]=y.useState(ne??[]),T=te??He,E=y.useMemo(()=>new Set(T),[T]),[D,O]=y.useState(null),[k,A]=y.useState(null),[j,M]=y.useState(!1),[N,P]=y.useState(!1),[F,I]=y.useState(``),[L,R]=y.useState(``),z=y.useRef(new u.Value(0)).current;y.useEffect(()=>{let e=z.addListener(({value:e})=>P(e>0));return()=>z.removeListener(e)},[z]);let[B,V]=y.useState({start:!1,end:!1}),[H,U]=y.useState(0),W=y.useRef({offset:0,viewport:0,content:0}),G=()=>{let{offset:e,viewport:t,content:n}=W.current,r=e>1,i=e+t<n-1;V(e=>e.start===r&&e.end===i?e:{start:r,end:i})},K=i.find(e=>e.isRowHeader===!0),q=p!==void 0&&K!==void 0&&K.render===void 0;y.useEffect(()=>{i.filter(e=>e.isRowHeader===!0).length>1&&console.warn("Table: only one column may set `isRowHeader`; the first one is used."),p!==void 0&&K===void 0?console.warn("Table: `onRowPress` needs an `isRowHeader` column to become the row's Button; rows stay inert."):p!==void 0&&K?.render!==void 0&&console.warn("Table: `onRowPress` is ignored when the row-header column has a custom `render`; put a Link in it instead.")},[i,p,K]);let J=(e,t)=>{t(e),ie.OS===`ios`&&be.announceForAccessibility(e)},Y=C===void 0?``:`${C.column}:${C.direction}`,X=y.useRef(Y);y.useEffect(()=>{if(X.current===Y||C===void 0){X.current=Y;return}X.current=Y;let e=i.find(e=>e.key===C.column)?.header??C.column;J(x.sortedAnnouncement(e,C.direction),I)},[Y]);let Z=T.join(`\0`),Ue=y.useRef(Z);y.useEffect(()=>{if(Ue.current===Z||c===`none`){Ue.current=Z;return}Ue.current=Z,J(x.selectedCount(T.length,a.length),R)},[Z]);let Q=i.filter(e=>h===`scroll`||e.hideBelow===void 0||Te>=(e.hideBelow===`prose`?m.layoutMaxWidthProse:m.layoutMaxWidthContent)),We=K!==void 0&&Q.includes(K)?[K,...Q.filter(e=>e!==K)]:Q,Ge=y.useMemo(()=>o===void 0&&v!==void 0?[...a].sort((e,t)=>Ae(e,t,v)):a,[a,o,v]),Ke=e=>{let t=C?.column===e&&C.direction===`ascending`?`descending`:`ascending`;o===void 0&&Ve({column:e,direction:t}),pe?.(e,t)},qe=e=>{te===void 0&&w(e),me?.(e)},Je=e=>{c===`single`?qe(E.has(e)?[]:[e]):c===`multiple`&&qe(E.has(e)?T.filter(t=>t!==e):[...T,e])},Ye=Ge.map(e=>e.id),Xe=Ye.length>0&&Ye.every(e=>E.has(e)),Ze=!Xe&&Ye.some(e=>E.has(e)),Qe=()=>qe(Xe?[]:Ye),$e=e=>K===void 0?e.id:_(e,K.key)||e.id,et=g(m,f?.headerBorder,m.colorBorderStrong),tt=g(m,f?.headerBorderWidth,m.borderWidthThin),nt=g(m,f?.headerShadow,m.shadowRaised),rt=g(m,f?.rowBorder,m.colorBorder),it=g(m,f?.rowBorderWidth,m.borderWidthThin),at=g(m,f?.rowHover,m.colorActionGhostBackgroundHover),ot=g(m,f?.cellPaddingInline,m[Ne[ce]]),st=g(m,f?.cellPaddingBlock,m.spaceSm),ct=g(m,f?.cellGap,m.layoutGapTight),lt=g(m,f?.stackedRowInset,m.layoutInsetMd),ut=g(m,f?.stackedRowGap,m.layoutGapTight),dt=g(m,f?.stackedBlockGap,m.layoutGapTight),ft=g(m,f?.stackedRowRadius,m.radiusMd),pt=g(m,f?.scrollFade,m.space6),mt=g(m,f?.stickyColumnShadow,m.shadowRaised),ht=g(m,f?.transition,m.motionDurationFast),gt={fontFamily:f?.fontFamily,fontSize:f?.fontSize,lineHeight:f?.lineHeight},_t={...gt,fontFamily:f?.numericFont??Fe},vt={fontFamily:f?.fontFamily,lineHeight:f?.lineHeight,fontSize:f?.headerSize,fontWeight:f?.headerWeight},yt={fontFamily:f?.fontFamily,lineHeight:f?.lineHeight,fontSize:f?.stackedLabelSize,fontWeight:f?.stackedLabelWeight},bt=(e,t)=>c!==`none`&&E.has(e.id)||ue&&t%2==1?m.colorBackgroundSubtle:m.colorBackground,$={paddingHorizontal:ot,paddingVertical:st,justifyContent:`center`},xt={width:m.sizeTargetComfortable,alignItems:`center`,justifyContent:`center`},St=e=>e.width===`fill`?{flexGrow:1,flexShrink:1,flexBasis:0,minWidth:m.space20,alignItems:Pe[e.align??`start`]}:{width:m.space20,alignItems:Pe[e.align??`start`]},Ct=(e,t)=>t.render===void 0?(0,b.jsx)(l,{size:`sm`,align:t.align??`start`,overrides:t.align===`end`?_t:gt,children:_(e,t.key)}):t.render(e),wt=e=>C?.column===e.key?(0,b.jsx)(he,{name:C.direction===`ascending`?`chevron-up`:`chevron-down`,inline:!0,color:m.colorActionGhostForeground}):void 0,Tt=e=>(0,b.jsx)(we,{label:e.header,accessibleName:C?.column===e.key&&C.direction===`ascending`?x.sortDescending(e.header):x.sortAscending(e.header),variant:`ghost`,size:`sm`,trailingIcon:wt(e),overrides:{fontWeight:f?.headerWeight??Ie,iconGap:f?.cellGap??Le},onPress:()=>Ke(e.key)},e.key),Et=c===`multiple`?(0,b.jsx)(Oe,{label:x.selectAll,hideLabel:!0,name:`${xe}-all`,checked:Xe,indeterminate:Ze,onChange:Qe}):null,Dt=e=>(0,b.jsx)(s,{style:xt,testID:`Table.selectCell`,children:(0,b.jsx)(Oe,{label:x.selectRow($e(e)),hideLabel:!0,name:`${xe}-${e.id}`,checked:E.has(e.id),onChange:()=>Je(e.id)})}),Ot=e=>h===`scroll`&&e===K,kt=e=>({transform:[{translateX:z}],zIndex:1,backgroundColor:e,...N?mt:null}),At=(0,b.jsx)(s,{testID:`Table.header`,style:{flexDirection:`row`,alignItems:`stretch`,backgroundColor:m.colorBackgroundSubtle,borderBottomWidth:tt,borderBottomColor:et,...ae&&j?nt:null},children:(0,b.jsxs)(s,{testID:`Table.headerRow`,style:{flexDirection:`row`,alignItems:`stretch`,flexGrow:1},children:[c===`none`?null:(0,b.jsx)(s,{style:xt,testID:`Table.selectAllCell`,children:Et}),Q.map(e=>{let t=e.sortable===!0?(0,b.jsx)(s,{testID:`Table.sortButton`,children:Tt(e)}):(0,b.jsx)(l,{size:`sm`,weight:`semibold`,align:e.align??`start`,overrides:vt,children:e.header}),n=[$,St(e)];return Ot(e)?(0,b.jsx)(u.View,{testID:`Table.columnHeader`,accessibilityRole:`header`,onLayout:e=>{let t=e.nativeEvent.layout;U(t.x+t.width)},style:[...n,kt(m.colorBackgroundSubtle)],children:t},e.key):(0,b.jsx)(s,{testID:`Table.columnHeader`,accessibilityRole:`header`,style:n,children:t},e.key)}),d===void 0?null:(0,b.jsx)(s,{testID:`Table.columnHeader`,accessibilityRole:`header`,style:[$,{flexShrink:0}],children:(0,b.jsx)(s,{style:S,children:(0,b.jsx)(l,{size:`sm`,children:x.actions})})})]})}),jt=({item:e,index:t})=>{let n=c!==`none`&&E.has(e.id),r=bt(e,t);return(0,b.jsxs)(s,{testID:`Table.row`,accessibilityState:c===`none`?void 0:{selected:n},style:{flexDirection:`row`,alignItems:`stretch`,backgroundColor:r,borderBottomWidth:it,borderBottomColor:rt,borderStartWidth:m.borderWidthFocus,borderStartColor:n?m.colorControlSelectedBackground:r},children:[q?(0,b.jsx)(je,{visible:D===e.id,color:at,duration:ht}):null,c===`none`?null:Dt(e),Q.map(t=>{let i=t===K,a=[$,St(t)];if(i&&q){let r=k===e.id;return(0,b.jsx)(le,{testID:`Table.rowHeader`,accessibilityRole:`button`,accessibilityLabel:$e(e),accessibilityState:c===`none`?void 0:{selected:n},onPress:()=>p?.(e.id),onHoverIn:()=>O(e.id),onHoverOut:()=>O(t=>t===e.id?null:t),onFocus:()=>A(e.id),onBlur:()=>A(t=>t===e.id?null:t),style:[...a,{minHeight:m.sizeTargetMin,borderWidth:m.borderWidthFocus,borderColor:r?m.colorBorderFocus:`transparent`}],children:Ct(e,t)},t.key)}let o=i?`Table.rowHeader`:`Table.cell`;return Ot(t)?(0,b.jsx)(u.View,{testID:o,style:[...a,kt(r)],children:Ct(e,t)},t.key):(0,b.jsx)(s,{testID:o,style:a,children:Ct(e,t)},t.key)}),d===void 0?null:(0,b.jsx)(s,{testID:`Table.cell`,style:[$,{flexDirection:`row`,alignItems:`center`,gap:ct,flexShrink:0}],children:d(e)})]})},Mt=Q.filter(e=>e.sortable===!0),Nt=(0,b.jsxs)(s,{testID:`Table.header`,style:{backgroundColor:m.colorBackground,paddingBottom:st,...ae&&j?nt:null},children:[Et===null?null:(0,b.jsx)(s,{testID:`Table.selectAllCell`,children:Et}),Mt.length>0?(0,b.jsx)(ke,{label:x.sortToolbarLabel(e),density:ce,children:Mt.map(Tt)}):null]}),Pt=({item:e,index:t})=>{let n=c!==`none`&&E.has(e.id),r=bt(e,t),i=We.map(t=>x.cellLabel(t.header,_(e,t.key))).join(`, `),a=We.map(t=>(0,b.jsxs)(s,{testID:t===K?`Table.rowHeader`:`Table.cell`,children:[(0,b.jsx)(s,{testID:`Table.stackedLabel`,children:(0,b.jsx)(l,{size:`xs`,weight:`medium`,tone:`muted`,overrides:yt,children:t.header})}),Ct(e,t)]},t.key)),o={flexGrow:1,flexShrink:1,gap:ut},ee=k===e.id;return(0,b.jsxs)(s,{testID:`Table.row`,style:{flexDirection:`row`,alignItems:`flex-start`,gap:ct,padding:lt,borderRadius:ft,overflow:`hidden`,backgroundColor:r,borderWidth:it,borderColor:rt,borderStartWidth:m.borderWidthFocus,borderStartColor:n?m.colorControlSelectedBackground:rt},children:[q?(0,b.jsx)(je,{visible:D===e.id,color:at,duration:ht}):null,c===`none`?null:Dt(e),q?(0,b.jsx)(le,{accessibilityRole:`button`,accessibilityLabel:i,accessibilityState:c===`none`?void 0:{selected:n},onPress:()=>p?.(e.id),onHoverIn:()=>O(e.id),onHoverOut:()=>O(t=>t===e.id?null:t),onFocus:()=>A(e.id),onBlur:()=>A(t=>t===e.id?null:t),style:[o,{minHeight:m.sizeTargetMin,borderWidth:m.borderWidthFocus,borderColor:ee?m.colorBorderFocus:`transparent`}],children:(0,b.jsx)(s,{accessibilityElementsHidden:!0,importantForAccessibility:`no-hide-descendants`,style:{gap:ut},children:a})}):(0,b.jsx)(s,{accessible:!0,accessibilityLabel:i,accessibilityState:c===`none`?void 0:{selected:n},style:o,children:a}),d===void 0?null:(0,b.jsx)(s,{testID:`Table.cell`,style:{flexDirection:`row`,alignItems:`center`,gap:ct},children:d(e)})]})},Ft=(0,b.jsx)(s,{testID:`Table.emptyState`,style:$,children:(0,b.jsx)(l,{size:`sm`,tone:`muted`,overrides:gt,children:fe?x.loading:de??x.empty})}),It=(0,b.jsx)(oe,{testID:`Table.table`,data:Ge,extraData:[T,C,D,k,N,h,Te],keyExtractor:e=>e.id,renderItem:h===`stack`?Pt:jt,ListHeaderComponent:h===`stack`?Nt:At,ListEmptyComponent:Ft,stickyHeaderIndices:ae?[0]:void 0,contentContainerStyle:h===`stack`?{gap:dt}:void 0,scrollEnabled:se===`viewport`,style:se===`viewport`?{maxHeight:ye.height-2*m.layoutGapSection}:void 0,onScroll:e=>M(e.nativeEvent.contentOffset.y>0),scrollEventThrottle:16,accessibilityRole:`list`,accessibilityLabel:e,accessibilityHint:x.rowCount(a.length),accessibilityState:{busy:fe}});return(0,b.jsxs)(s,{ref:ve,testID:`Table`,onLayout:e=>{Ce(e.nativeEvent.layout.width)},style:{backgroundColor:m.colorBackground},children:[(0,b.jsx)(s,{testID:`Table.caption`,style:r?S:void 0,children:(0,b.jsx)(Ee,{level:t,size:`md`,overrides:{fontSize:f?.captionSize??Re,fontWeight:f?.captionWeight??ze,marginBlockEnd:f?.captionGap??Be},children:e})}),(0,b.jsx)(s,{testID:`Table.container`,children:h===`scroll`?(0,b.jsxs)(s,{children:[(0,b.jsx)(u.ScrollView,{testID:`Table.scrollRegion`,horizontal:!0,accessibilityLabel:e,accessibilityHint:x.scrollHint,onLayout:e=>{W.current.viewport=e.nativeEvent.layout.width,G()},onContentSizeChange:e=>{W.current.content=e,G()},onScroll:u.event([{nativeEvent:{contentOffset:{x:z}}}],{useNativeDriver:!1,listener:e=>{W.current.offset=e.nativeEvent.contentOffset.x,G()}}),scrollEventThrottle:16,contentContainerStyle:{flexGrow:1},children:(0,b.jsx)(s,{style:{flexGrow:1},children:It})}),B.start?(0,b.jsx)(Me,{edge:`start`,inset:H,length:pt,color:m.colorBackground}):null,B.end?(0,b.jsx)(Me,{edge:`end`,inset:0,length:pt,color:m.colorBackground}):null]}):It}),fe&&Ge.length>0?(0,b.jsx)(s,{accessibilityLiveRegion:`polite`,style:$,children:(0,b.jsx)(l,{size:`sm`,tone:`muted`,overrides:gt,children:x.loading})}):null,n==null?null:(0,b.jsx)(s,{testID:`Table.footer`,style:$,children:typeof n==`string`?(0,b.jsx)(l,{size:`sm`,overrides:gt,children:n}):n}),(0,b.jsx)(s,{accessibilityLiveRegion:`polite`,style:S,children:(0,b.jsx)(l,{size:`sm`,children:F})}),(0,b.jsx)(s,{accessibilityLiveRegion:`polite`,style:S,children:(0,b.jsx)(l,{size:`sm`,children:L})})]})}var y,b,x,Ne,Pe,S,Fe,Ie,Le,Re,ze,Be;function Ve(){return(Ve=e((()=>{y=t(n(),1),ye(),se(),ae(),re(),ce(),r(),o(),p(),a(),pe(),Ce(),De(),Te(),d(),te(),h(),xe(),b=m(),x={sortToolbarLabel:e=>`Sort ${e}`,sortAscending:e=>`Sort by ${e}, ascending`,sortDescending:e=>`Sort by ${e}, descending`,sortedAnnouncement:(e,t)=>`Sorted by ${e}, ${t}`,selectAll:`Select all rows`,selectRow:e=>`Select ${e}`,selectedCount:(e,t)=>`${e} of ${t} selected`,cellLabel:(e,t)=>`${e}: ${t}`,actions:`Actions`,empty:`Nothing to show.`,loading:`Loading`,scrollHint:`Scroll sideways to see more columns`,rowCount:e=>new Intl.PluralRules().select(e)===`one`?`${e} row`:`${e} rows`},Ne={compact:`layoutInsetSm`,comfortable:`layoutInsetMd`},Pe={start:`flex-start`,center:`center`,end:`flex-end`},S={position:`absolute`,width:1,height:1,overflow:`hidden`},Fe=`font.family.mono`,Ie=`font.weight.semibold`,Le=`layout.gap.tight`,Re=`font.size.md`,ze=`font.weight.semibold`,Be=`space.2`,v.__docgenInfo={description:'Table — the honest way to show records that share fields: every row the same shape,\nevery column a comparable thing.\n\nWhen to use: a list of records with three or more comparable fields (orders, invoices,\nmembers). `responsive: stack` when each row is a thing a person reads, `scroll` when\nthe columns are the point. Not for layout, one- or two-field lists, key–value pairs, or\ncells edited in place or navigated with arrows (that is DataGrid).\n\nThere is no table element on native. The layout follows the table\'s own measured width\n(a container query, not the window): below `layout.maxWidth.prose` a `stack` table is a\n`FlatList` (`accessibilityRole="list"`, `accessibilityLabel={caption}`) of bordered\nblocks whose accessible summary joins `copy.cellLabel` for every visible column, row\nheader first, with the selected state; the selection Checkbox and `rowActions` are\nseparate stops beside it, and sortable columns become a `Toolbar` of Buttons above the\nlist (`copy.sortToolbarLabel`). At or above that width (tablets, react-native-web) the\nsame list renders a header row (`accessibilityRole="header"` cells) and rows of\nfixed-width cells: `width: fill` flexes, `auto` and `min` are both `space.20`.\n`responsive: scroll` keeps the columns at every width inside a horizontal scroll region\nnamed by the caption with `copy.scrollHint` as its hint; the row-header cells are\ntranslated by the horizontal offset so they stay pinned, and cast `stickyColumnShadow`\nonce scrolled, with a `scrollFade` gradient over each edge that still hides columns\n(react-native-svg, as Toolbar does; the start fade begins where the pinned column ends). `stickyHeader` pins the list header (`stickyHeaderIndices`), which casts\n`headerShadow` once the body has scrolled beneath it; with `maxHeight: none` the list\ndoes not scroll itself, so the page does. `abbr` has no effect on native.\n\nSorting with a controlled `sort` leaves ordering to the caller; otherwise the table\nsorts `data` from its own state (numbers numerically, anything else with\n`localeCompare`, numeric collation). Sort Buttons show the header text and carry\n`copy.sortAscending`/`copy.sortDescending` — what the press will do — as their name.\n`single` selection behaves like radios, and pressing the selected row again clears it;\n`multiple` adds select-all, indeterminate when some rows are selected. Sort and\nselection changes post `copy.sortedAnnouncement` / `copy.selectedCount` to a polite\nlive region (Android) and `AccessibilityInfo.announceForAccessibility` (iOS).\n`onRowPress` turns the row-header cell into the row\'s Button and tints the whole row on\nhover over `transition`; it needs an `isRowHeader` column without a custom `render`\n(a `__DEV__` warning otherwise, and rows stay inert). Arrow-key scrolling of the scroll\nregion is left to the platform: native hardware keyboards have no equivalent.',methods:[],displayName:`Table`,props:{caption:{required:!0,tsType:{name:`string`},description:`What the table lists ("Open invoices"). Rendered as the caption and the accessible name; never omitted.`},captionLevel:{required:!1,tsType:{name:`union`,raw:`TableCaptionLevel | undefined`,elements:[{name:`union`,raw:`'2' | '3' | '4' | 2 | 3 | 4`,elements:[{name:`literal`,value:`'2'`},{name:`literal`,value:`'3'`},{name:`literal`,value:`'4'`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`}]},{name:`undefined`}]},description:"Heading level of the caption in the page outline; its size is `captionSize` regardless.",defaultValue:{value:`'2'`,computed:!1}},footer:{required:!1,tsType:{name:`union`,raw:`React.ReactNode | undefined`,elements:[{name:`ReactReactNode`,raw:`React.ReactNode`},{name:`undefined`}]},description:"Content below the table: a row count, pagination, a total. Rendered in the `footer` part; a string\nrenders in Text with the table's `fontFamily`/`fontSize`/`lineHeight`, other content brings its own typography."},hideCaption:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Visually hide the caption; it remains the accessible name.`,defaultValue:{value:`false`,computed:!1}},columns:{required:!0,tsType:{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{
  key: string;
  header: string;
  abbr?: string;
  align?: 'start' | 'end' | 'center';
  sortable?: boolean;
  width?: 'auto' | 'min' | 'fill';
  isRowHeader?: boolean;
  hideBelow?: 'prose' | 'content';
  render?: (row: TableRow) => React.ReactNode;
}`,signature:{properties:[{key:`key`,value:{name:`string`,required:!0}},{key:`header`,value:{name:`string`,required:!0}},{key:`abbr`,value:{name:`string`,required:!1}},{key:`align`,value:{name:`union`,raw:`'start' | 'end' | 'center'`,elements:[{name:`literal`,value:`'start'`},{name:`literal`,value:`'end'`},{name:`literal`,value:`'center'`}],required:!1}},{key:`sortable`,value:{name:`boolean`,required:!1}},{key:`width`,value:{name:`union`,raw:`'auto' | 'min' | 'fill'`,elements:[{name:`literal`,value:`'auto'`},{name:`literal`,value:`'min'`},{name:`literal`,value:`'fill'`}],required:!1}},{key:`isRowHeader`,value:{name:`boolean`,required:!1}},{key:`hideBelow`,value:{name:`union`,raw:`'prose' | 'content'`,elements:[{name:`literal`,value:`'prose'`},{name:`literal`,value:`'content'`}],required:!1}},{key:`render`,value:{name:`signature`,type:`function`,raw:`(row: TableRow) => React.ReactNode`,signature:{arguments:[{type:{name:`signature`,type:`object`,raw:`{ id: string; [key: string]: unknown }`,signature:{properties:[{key:`id`,value:{name:`string`,required:!0}},{key:{name:`string`},value:{name:`unknown`,required:!0}}]}},name:`row`}],return:{name:`ReactReactNode`,raw:`React.ReactNode`}},required:!1}}]}}],raw:`TableColumn[]`},description:"Column definitions in display order. Exactly one column may be `isRowHeader`."},data:{required:!0,tsType:{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{ id: string; [key: string]: unknown }`,signature:{properties:[{key:`id`,value:{name:`string`,required:!0}},{key:{name:`string`},value:{name:`unknown`,required:!0}}]}}],raw:`TableRow[]`},description:"The rows. `id` must be stable; it is what selection and keys use."},sort:{required:!1,tsType:{name:`union`,raw:`TableSort | undefined`,elements:[{name:`signature`,type:`object`,raw:`{ column: string; direction: 'ascending' | 'descending' }`,signature:{properties:[{key:`column`,value:{name:`string`,required:!0}},{key:`direction`,value:{name:`union`,raw:`'ascending' | 'descending'`,elements:[{name:`literal`,value:`'ascending'`},{name:`literal`,value:`'descending'`}],required:!0}}]}},{name:`undefined`}]},description:`Controlled sort state. The table shows it; the caller sorts the data.`},defaultSort:{required:!1,tsType:{name:`union`,raw:`TableSort | undefined`,elements:[{name:`signature`,type:`object`,raw:`{ column: string; direction: 'ascending' | 'descending' }`,signature:{properties:[{key:`column`,value:{name:`string`,required:!0}},{key:`direction`,value:{name:`union`,raw:`'ascending' | 'descending'`,elements:[{name:`literal`,value:`'ascending'`},{name:`literal`,value:`'descending'`}],required:!0}}]}},{name:`undefined`}]},description:"Initial sort for uncontrolled use; the table then sorts `data` itself by the column value."},selectable:{required:!1,tsType:{name:`union`,raw:`TableSelectable | undefined`,elements:[{name:`union`,raw:`'none' | 'single' | 'multiple'`,elements:[{name:`literal`,value:`'none'`},{name:`literal`,value:`'single'`},{name:`literal`,value:`'multiple'`}]},{name:`undefined`}]},description:"Adds a first column of Checkboxes (radio-like for `single`) and a select-all for `multiple`.",defaultValue:{value:`'none'`,computed:!1}},selected:{required:!1,tsType:{name:`union`,raw:`string[] | undefined`,elements:[{name:`Array`,elements:[{name:`string`}],raw:`string[]`},{name:`undefined`}]},description:`Controlled selected row ids.`},defaultSelected:{required:!1,tsType:{name:`union`,raw:`string[] | undefined`,elements:[{name:`Array`,elements:[{name:`string`}],raw:`string[]`},{name:`undefined`}]},description:`Initially selected ids.`},responsive:{required:!1,tsType:{name:`union`,raw:`TableResponsive | undefined`,elements:[{name:`union`,raw:`'stack' | 'scroll'`,elements:[{name:`literal`,value:`'stack'`},{name:`literal`,value:`'scroll'`}]},{name:`undefined`}]},description:"Below `layout.maxWidth.prose`: `stack` turns each row into a labelled block; `scroll` keeps the columns and scrolls horizontally.",defaultValue:{value:`'stack'`,computed:!1}},stickyHeader:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`The header row stays visible while the body scrolls.`,defaultValue:{value:`true`,computed:!1}},maxHeight:{required:!1,tsType:{name:`union`,raw:`TableMaxHeight | undefined`,elements:[{name:`union`,raw:`'none' | 'viewport'`,elements:[{name:`literal`,value:`'none'`},{name:`literal`,value:`'viewport'`}]},{name:`undefined`}]},description:"`viewport` caps the table at the viewport height minus the section rhythm and scrolls the body; `none` lets the page scroll.",defaultValue:{value:`'none'`,computed:!1}},density:{required:!1,tsType:{name:`union`,raw:`TableDensity | undefined`,elements:[{name:`union`,raw:`'compact' | 'comfortable'`,elements:[{name:`literal`,value:`'compact'`},{name:`literal`,value:`'comfortable'`}]},{name:`undefined`}]},description:"Cell padding: `layout.inset.sm` or `layout.inset.md`.",defaultValue:{value:`'comfortable'`,computed:!1}},striped:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Alternate row backgrounds.`,defaultValue:{value:`false`,computed:!1}},emptyMessage:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:"Shown in place of the body when `data` is empty. Defaults to `copy.empty`."},loading:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"Data is being fetched: the list is busy and shows `copy.loading`; existing rows stay visible.",defaultValue:{value:`false`,computed:!1}},rowActions:{required:!1,tsType:{name:`union`,raw:`((row: TableRow) => React.ReactNode) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Renders a trailing actions cell: Buttons (ghost, sm, iconOnly) or a Menu.`},overrides:{required:!1,tsType:{name:`union`,raw:`Partial<Record<TableOverridableBinding, TokenRef | undefined>> | undefined`,elements:[{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'headerWeight'
| 'headerSize'
| 'headerBorder'
| 'headerBorderWidth'
| 'headerShadow'
| 'rowBorder'
| 'rowBorderWidth'
| 'rowHover'
| 'cellPaddingInline'
| 'cellPaddingBlock'
| 'cellGap'
| 'captionSize'
| 'captionWeight'
| 'captionGap'
| 'stackedRowInset'
| 'stackedRowGap'
| 'stackedBlockGap'
| 'stackedLabelSize'
| 'stackedLabelWeight'
| 'stackedRowRadius'
| 'stickyColumnShadow'
| 'scrollFade'
| 'fontFamily'
| 'fontSize'
| 'lineHeight'
| 'numericFont'
| 'transition'`,elements:[{name:`literal`,value:`'headerWeight'`},{name:`literal`,value:`'headerSize'`},{name:`literal`,value:`'headerBorder'`},{name:`literal`,value:`'headerBorderWidth'`},{name:`literal`,value:`'headerShadow'`},{name:`literal`,value:`'rowBorder'`},{name:`literal`,value:`'rowBorderWidth'`},{name:`literal`,value:`'rowHover'`},{name:`literal`,value:`'cellPaddingInline'`},{name:`literal`,value:`'cellPaddingBlock'`},{name:`literal`,value:`'cellGap'`},{name:`literal`,value:`'captionSize'`},{name:`literal`,value:`'captionWeight'`},{name:`literal`,value:`'captionGap'`},{name:`literal`,value:`'stackedRowInset'`},{name:`literal`,value:`'stackedRowGap'`},{name:`literal`,value:`'stackedBlockGap'`},{name:`literal`,value:`'stackedLabelSize'`},{name:`literal`,value:`'stackedLabelWeight'`},{name:`literal`,value:`'stackedRowRadius'`},{name:`literal`,value:`'stickyColumnShadow'`},{name:`literal`,value:`'scrollFade'`},{name:`literal`,value:`'fontFamily'`},{name:`literal`,value:`'fontSize'`},{name:`literal`,value:`'lineHeight'`},{name:`literal`,value:`'numericFont'`},{name:`literal`,value:`'transition'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<TableOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<TableOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:"Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop."},onSortChange:{required:!1,tsType:{name:`union`,raw:`((column: string, direction: 'ascending' | 'descending') => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired when a sortable header is activated: ascending on a new column, then descending on the same one.`},onSelectionChange:{required:!1,tsType:{name:`union`,raw:`((selected: string[]) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired with the new array of selected ids.`},onRowPress:{required:!1,tsType:{name:`union`,raw:`((id: string) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired when a row is activated (its row-header cell), with its id.`},ref:{required:!1,tsType:{name:`union`,raw:`React.Ref<ViewInstance> | undefined`,elements:[{name:`ReactRef`,raw:`React.Ref<ViewInstance>`,elements:[{name:`ViewInstance`}]},{name:`undefined`}]},description:`The root view.`}}}})))()}var C,He,w,T,E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y;function X(){return(X=e((()=>{n(),Ce(),d(),Ve(),te(),ne(),C=m(),He={title:`Table/React Native`,component:v,decorators:[c()],args:{caption:`Open invoices`,columns:[{key:`invoice`,header:`Invoice`,isRowHeader:!0},{key:`customer`,header:`Customer`,hideBelow:`prose`},{key:`due`,header:`Due`},{key:`amount`,header:`Amount (USD)`,align:`end`,sortable:!0,width:`fill`}],data:[{id:`a`,invoice:`INV-1`,customer:`Acme Co`,due:`12 Sep`,amount:1204},{id:`b`,invoice:`INV-2`,customer:`Globex`,due:`19 Sep`,amount:389.5},{id:`c`,invoice:`INV-3`,customer:`Initech`,due:`26 Sep`,amount:2050}]}},w={},T={args:{captionLevel:`2`}},E={args:{captionLevel:`3`}},D={args:{captionLevel:`4`}},O={args:{selectable:`none`}},k={args:{selectable:`single`}},A={args:{selectable:`multiple`}},j={args:{responsive:`stack`}},M={args:{responsive:`scroll`}},N={args:{maxHeight:`none`}},P={args:{maxHeight:`viewport`}},F={args:{density:`compact`}},I={args:{density:`comfortable`}},L={args:{caption:`Open invoices`,columns:[{key:`invoice`,header:`Invoice`,isRowHeader:!0},{key:`due`,header:`Due`},{key:`amount`,header:`Amount`,align:`end`,sortable:!0}],data:[{id:`a`,invoice:`INV-1`,due:`12 Sep`,amount:100},{id:`b`,invoice:`INV-2`,due:`19 Sep`,amount:200}]}},R={args:{caption:`Members`,selectable:`multiple`,defaultSelected:[`a`],columns:[{key:`person`,header:`Person`,isRowHeader:!0},{key:`role`,header:`Role`}],data:[{id:`a`,person:`Ana Souza`,role:`Admin`},{id:`b`,person:`Bo Lin`,role:`Editor`}]}},z={args:{caption:`Daily traffic`,responsive:`scroll`,density:`compact`,maxHeight:`viewport`,columns:[{key:`day`,header:`Day`,isRowHeader:!0},{key:`visits`,header:`Visits`,align:`end`},{key:`signups`,header:`Signups`,align:`end`}],data:[{id:`a`,day:`Monday`,visits:1200,signups:30},{id:`b`,day:`Tuesday`,visits:1450,signups:41}]}},B={args:{caption:`Open invoices`,emptyMessage:`No invoices yet.`,columns:[{key:`invoice`,header:`Invoice`,isRowHeader:!0}],data:[]}},V={args:{striped:!0}},H={args:{loading:!0}},U={args:{hideCaption:!0}},W={args:{defaultSort:{column:`amount`,direction:`descending`}}},G={args:{onRowPress:()=>void 0}},K={args:{rowActions:e=>(0,C.jsx)(we,{label:`More actions for ${String(e.invoice)}`,variant:`ghost`,size:`sm`,iconOnly:!0,leadingIcon:(0,C.jsx)(he,{name:`ellipsis`})})}},q={args:{footer:(0,C.jsx)(l,{size:`sm`,tone:`muted`,children:`3 rows`})}},J={args:{selectable:`multiple`,rowActions:e=>(0,C.jsx)(we,{label:`Open ${String(e.invoice)}`,variant:`ghost`,size:`sm`})}},Y=[`Default`,`CaptionLevel2`,`CaptionLevel3`,`CaptionLevel4`,`SelectableNone`,`SelectableSingle`,`SelectableMultiple`,`ResponsiveStack`,`ResponsiveScroll`,`MaxHeightNone`,`MaxHeightViewport`,`DensityCompact`,`DensityComfortable`,`OpenInvoices`,`SelectableRows`,`DenseDataTableThatScrolls`,`NothingToShow`,`Striped`,`Loading`,`HiddenCaption`,`DefaultSort`,`WithRowPress`,`WithRowActions`,`WithFooter`,`Keyboard`],w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    captionLevel: '2'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    captionLevel: '3'
  }
}`,...E.parameters?.docs?.source}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    captionLevel: '4'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'none'
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'single'
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'multiple'
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    responsive: 'stack'
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    responsive: 'scroll'
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    maxHeight: 'none'
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    maxHeight: 'viewport'
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    density: 'compact'
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    density: 'comfortable'
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    caption: 'Open invoices',
    columns: [{
      key: 'invoice',
      header: 'Invoice',
      isRowHeader: true
    }, {
      key: 'due',
      header: 'Due'
    }, {
      key: 'amount',
      header: 'Amount',
      align: 'end',
      sortable: true
    }],
    data: [{
      id: 'a',
      invoice: 'INV-1',
      due: '12 Sep',
      amount: 100
    }, {
      id: 'b',
      invoice: 'INV-2',
      due: '19 Sep',
      amount: 200
    }]
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    caption: 'Members',
    selectable: 'multiple',
    defaultSelected: ['a'],
    columns: [{
      key: 'person',
      header: 'Person',
      isRowHeader: true
    }, {
      key: 'role',
      header: 'Role'
    }],
    data: [{
      id: 'a',
      person: 'Ana Souza',
      role: 'Admin'
    }, {
      id: 'b',
      person: 'Bo Lin',
      role: 'Editor'
    }]
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    caption: 'Daily traffic',
    responsive: 'scroll',
    density: 'compact',
    maxHeight: 'viewport',
    columns: [{
      key: 'day',
      header: 'Day',
      isRowHeader: true
    }, {
      key: 'visits',
      header: 'Visits',
      align: 'end'
    }, {
      key: 'signups',
      header: 'Signups',
      align: 'end'
    }],
    data: [{
      id: 'a',
      day: 'Monday',
      visits: 1200,
      signups: 30
    }, {
      id: 'b',
      day: 'Tuesday',
      visits: 1450,
      signups: 41
    }]
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    caption: 'Open invoices',
    emptyMessage: 'No invoices yet.',
    columns: [{
      key: 'invoice',
      header: 'Invoice',
      isRowHeader: true
    }],
    data: []
  }
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    striped: true
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    hideCaption: true
  }
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    defaultSort: {
      column: 'amount',
      direction: 'descending'
    }
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  args: {
    onRowPress: () => undefined
  }
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  args: {
    rowActions: row => <Button label={\`More actions for \${String(row.invoice)}\`} variant="ghost" size="sm" iconOnly leadingIcon={<Icon name="ellipsis" />} />
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  args: {
    footer: <Text size="sm" tone="muted">\r
        3 rows\r
      </Text>
  }
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'multiple',
    rowActions: row => <Button label={\`Open \${String(row.invoice)}\`} variant="ghost" size="sm" />
  }
}`,...J.parameters?.docs?.source},description:{story:`Sort button, select-all, a checkbox per row and an actions Button per row: every focus stop in reading order.`,...J.parameters?.docs?.description}}}})))()}X();export{T as CaptionLevel2,E as CaptionLevel3,D as CaptionLevel4,w as Default,W as DefaultSort,z as DenseDataTableThatScrolls,I as DensityComfortable,F as DensityCompact,U as HiddenCaption,J as Keyboard,H as Loading,N as MaxHeightNone,P as MaxHeightViewport,B as NothingToShow,L as OpenInvoices,M as ResponsiveScroll,j as ResponsiveStack,A as SelectableMultiple,O as SelectableNone,R as SelectableRows,k as SelectableSingle,V as Striped,q as WithFooter,K as WithRowActions,G as WithRowPress,Y as __namedExportsOrder,He as default};