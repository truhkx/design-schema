import{n as e,o as t}from"./rolldown-runtime-C0FnF6B9.js";import{t as n}from"./react-DiVRNtpo.js";import{X as r,Z as i,c as a,h as o,i as s,l as c,m as l,n as u,o as d,r as f,t as ee}from"./decorators-Dl4455ZU.js";import{n as p,t as te}from"./Platform-qE9g7V_t.js";import{d as ne,f as re,n as m,t as ie}from"./FlatList-B--84B_m.js";import{n as h,t as ae}from"./Animated-75prr5wJ.js";import{n as oe,t as g}from"./PanResponder-yh9ffqIF.js";import{n as se,t as ce}from"./Pressable-CjGHHyHY.js";import{n as le,t as ue}from"./Icon-sSovLWRe.js";import{n as de,t as fe}from"./useWindowDimensions-oJibnkug.js";import{c as pe,i as me,l as he,m as ge,p as _e,r as ve,s as _}from"./iframe-CAToN8Eb.js";import{n as ye,t as be}from"./Button-B0Tk0pjd.js";import{n as xe,t as Se}from"./Heading-BHboSapN.js";import{n as v,t as Ce}from"./Input-DDaWoxHS.js";import{n as we,t as Te}from"./NumberInput-VPf_Ohlc.js";import{n as Ee,t as De}from"./Checkbox--8cawqnp.js";import{n as y,t as Oe}from"./Select-BW6rwOBr.js";import{n as ke,t as Ae}from"./DatePicker-B3uS00Pe.js";function b(e,t,n){return t===void 0?n:c(e,t)}function je(e,t){let n=e[t];return n==null?``:String(n)}function Me(e,t){let n=e[t];return typeof n==`string`||typeof n==`number`||typeof n==`boolean`?n:n==null?void 0:String(n)}function Ne(e,t,n){let r=n.direction===`ascending`?1:-1,i=e[n.column],a=t[n.column];return typeof i==`number`&&typeof a==`number`?(i-a)*r:je(e,n.column).localeCompare(je(t,n.column),void 0,{numeric:!0})*r}function Pe(e,t,n){return e!==null&&e.rowId===t&&e.column===n}function Fe({visible:e,color:t,duration:n}){let{tokens:r}=pe(),a=_(),o=x.useRef(new ae.Value(+!!e)).current;return x.useEffect(()=>{let t=+!!e;if(a){o.setValue(t);return}ae.timing(o,{toValue:t,duration:n,easing:me(r.motionEasingStandard),useNativeDriver:!1}).start()},[e,a,n,o,r.motionEasingStandard]),(0,S.jsx)(ae.View,{accessibilityElementsHidden:!0,importantForAccessibility:`no-hide-descendants`,style:[i.absoluteFill,{backgroundColor:t,opacity:o,pointerEvents:`none`}]})}function Ie({color:e,width:t}){return(0,S.jsx)(l,{accessibilityElementsHidden:!0,importantForAccessibility:`no-hide-descendants`,style:[i.absoluteFill,{borderColor:e,borderWidth:t,pointerEvents:`none`}]})}function Le({width:e,minWidth:t,color:n,handleWidth:r,hitSlop:i,onResize:a,onResizeEnd:o}){let s=x.useRef({width:e,minWidth:t,onResize:a,onResizeEnd:o});s.current={width:e,minWidth:t,onResize:a,onResizeEnd:o};let c=x.useRef(e),u=x.useRef(g.create({onStartShouldSetPanResponder:()=>!0,onMoveShouldSetPanResponder:()=>!0,onPanResponderTerminationRequest:()=>!1,onPanResponderGrant:()=>{c.current=s.current.width},onPanResponderMove:(e,t)=>{s.current.onResize(Math.max(s.current.minWidth,Math.round(c.current+t.dx)))},onPanResponderRelease:()=>{s.current.onResizeEnd(s.current.width)},onPanResponderTerminate:()=>{s.current.onResizeEnd(s.current.width)}})).current;return(0,S.jsx)(l,{...u.panHandlers,testID:`DataGrid.resizeHandle`,accessibilityElementsHidden:!0,importantForAccessibility:`no-hide-descendants`,hitSlop:{left:i,right:i},style:{width:r,alignSelf:`stretch`,backgroundColor:n}})}function Re({caption:e,captionLevel:t=`2`,hideCaption:n=!1,columns:r,data:i,rowCount:a,sort:o,defaultSort:c,selectable:u=`none`,selected:d,editable:ee=!1,density:p=`compact`,stickyHeader:re=!0,height:m=`viewport`,loading:h=!1,emptyMessage:ae,showStatusBar:oe=!0,overrides:g,onSortChange:se,onSelectionChange:le,onCellChange:fe,onEditStart:me,onEndReached:he,onColumnResize:ge,ref:ve}){let{tokens:_}=pe(),ye=de(),xe=x.useId(),v=u===`range`?`row`:u,[we,Ee]=x.useState(c),y=o??we,[ke,Re]=x.useState([]),T=d??ke,E=x.useMemo(()=>new Set(T),[T]),[D,O]=x.useState(null),[k,A]=x.useState(null),[j,M]=x.useState(null),[N,P]=x.useState(null),[F,I]=x.useState(void 0),[L,R]=x.useState(void 0),[z,B]=x.useState({}),[V,H]=x.useState(!1),[U,W]=x.useState(!1),[G,K]=x.useState(null),[q,J]=x.useState(null),[Y,Je]=x.useState(``);x.useEffect(()=>{u===`range`&&console.warn('DataGrid: `selectable="range"` has no touch model on React Native and degrades to `"row"`.'),r.filter(e=>e.isRowHeader===!0).length>1&&console.warn("DataGrid: only one column may set `isRowHeader`; the first one is used.")},[u,r]);let X=e=>{Je(e),te.OS===`ios`&&_e.announceForAccessibility(e)},Ye=y===void 0?``:`${y.column}:${y.direction}`,Xe=x.useRef(Ye);x.useEffect(()=>{if(Xe.current===Ye||y===void 0){Xe.current=Ye;return}Xe.current=Ye;let e=r.find(e=>e.key===y.column)?.header??y.column;X(C.sortedAnnouncement(e,y.direction))},[Ye]);let Ze=r.find(e=>e.isRowHeader===!0),Qe=x.useMemo(()=>new Map(r.map(e=>[e.key,e])),[r]),$e=x.useMemo(()=>o===void 0&&a===void 0&&we!==void 0?[...i].sort((e,t)=>Ne(e,t,we)):i,[i,o,a,we]),et=a??i.length,tt=g?.headerWeight??Ve,nt=g?.headerSize??He,rt=b(_,g?.headerBorder,_.colorBorderStrong),it=b(_,g?.headerBorderWidth,_.borderWidthThin),at=b(_,g?.headerShadow,_.shadowRaised),Z=b(_,g?.gridLine,_.colorBorder),Q=b(_,g?.gridLineWidth,_.borderWidthThin),ot=b(_,g?.rowHover,_.colorActionGhostBackgroundHover),st=b(_,g?.cellPaddingInline,_.space2),ct=b(_,g?.columnWidth,_.space20)*2,lt=b(_,g?.pinnedShadow,_.shadowRaised),ut=b(_,g?.resizeHandle,_.colorBorderStrong),dt=b(_,g?.resizeHandleWidth,_.space1),ft=b(_,g?.resizeStep,_.space4),pt=b(_,g?.statusBarPadding,_.space2),mt=b(_,g?.statusBarGap,_.space2),ht=b(_,g?.fixedHeight,_.space20),gt=b(_,g?.transition,_.motionDurationFast),$=p===`comfortable`?_.sizeTargetComfortable:_.sizeTargetMin,_t=_.sizeTargetMin+2*st,vt={fontFamily:g?.fontFamily,fontSize:g?.fontSize,lineHeight:g?.lineHeight??Ke},yt={...vt,fontFamily:g?.numericFont??qe},bt={fontFamily:g?.fontFamily,lineHeight:g?.lineHeight??Ke,fontSize:nt,fontWeight:tt},xt={fontFamily:g?.fontFamily,lineHeight:g?.lineHeight??Ke,fontSize:g?.statusBarSize},St={paddingInline:w,paddingBlock:w},Ct=e=>z[e.key]??e.width??ct,wt=e=>e.minWidth??_.sizeTargetMin,Tt=e=>{Ft();let t=y?.column===e&&y.direction===`ascending`?`descending`:`ascending`;o===void 0&&Ee({column:e,direction:t}),se?.(e,t)},Et=e=>{d===void 0&&Re(e),le?.(e),X(C.selectedRows(e.length,et))},Dt=e=>{Et(E.has(e)?T.filter(t=>t!==e):[...T,e])},Ot=$e.map(e=>e.id),kt=Ot.length>0&&Ot.every(e=>E.has(e)),At=!kt&&Ot.some(e=>E.has(e)),jt=()=>Et(kt?[]:Ot),Mt=e=>Ze===void 0?e.id:je(e,Ze.key)||e.id,Nt=()=>{P(null),I(void 0),R(void 0)},Pt=(e,t,n)=>{let r=t.validate?.(n,e);if(r!==void 0)return R(r),X(C.invalid(r)),!1;let i=Me(e,t.key);return Nt(),Object.is(n,i)||fe?.(e.id,t.key,n,i),!0};function Ft(){if(N===null)return!0;let e=$e.find(e=>e.id===N.rowId),t=Qe.get(N.column);return e===void 0||t===void 0?(Nt(),!0):Pt(e,t,F)}let It=(e,t)=>{!Pe(N,e.id,t.key)&&Ft()&&me?.(e.id,t.key)!==!1&&(P({rowId:e.id,column:t.key}),I(Me(e,t.key)),R(void 0),X(C.editing(t.header)))},Lt=(e,t)=>{let n=t.header,r=`${xe}-${e.id}-${t.key}`;switch(t.editor){case`number`:return(0,S.jsx)(Te,{label:n,hideLabel:!0,name:r,size:`sm`,value:typeof F==`number`?F:F===void 0||F===``?void 0:Number(F),overrides:St,onChangeText:e=>I(e)});case`select`:return(0,S.jsx)(Oe,{label:n,hideLabel:!0,name:r,size:`sm`,open:!0,options:t.options??[],value:typeof F==`string`?F:void 0,overrides:{triggerPaddingInline:w,triggerPaddingBlock:w},onChange:n=>Pt(e,t,Array.isArray(n)?n[0]:n),onOpenChange:e=>{e||Nt()}});case`date`:return(0,S.jsx)(Ae,{label:n,hideLabel:!0,name:r,size:`sm`,value:typeof F==`string`&&F!==``?F:void 0,overrides:St,onChange:e=>I(typeof e==`string`?e:void 0)});case`checkbox`:return(0,S.jsx)(De,{label:n,hideLabel:!0,name:r,checked:F===!0,onChange:n=>Pt(e,t,n)});default:return(0,S.jsx)(Ce,{label:n,hideLabel:!0,name:r,size:`sm`,value:F===void 0?``:String(F),overrides:St,onChange:e=>I(e),onBlur:()=>Pt(e,t,F)})}},Rt={width:_t,alignItems:`center`,justifyContent:`center`},zt=e=>U&&(e===null||e.pinned!==void 0)?{zIndex:1,...lt}:null,Bt=(e,t)=>{B(n=>({...n,[e.key]:Math.max(wt(e),t)}))},Vt=(0,S.jsx)(l,{testID:`DataGrid.header`,role:`rowgroup`,style:{backgroundColor:_.colorBackgroundSubtle,...V?at:null},children:(0,S.jsxs)(l,{testID:`DataGrid.headerRow`,role:`row`,style:{flexDirection:`row`,alignItems:`stretch`,minHeight:$,borderBottomWidth:it,borderBottomColor:rt},children:[v===`row`?(0,S.jsx)(l,{testID:`DataGrid.selectAllCell`,role:`columnheader`,style:[Rt,{backgroundColor:_.colorBackgroundSubtle,borderEndWidth:Q,borderEndColor:Z},zt(null)],children:(0,S.jsx)(De,{label:C.selectAll,hideLabel:!0,name:`${xe}-all`,checked:kt,indeterminate:At,onChange:jt})}):null,r.map(e=>{let t=Ct(e),n=y?.column===e.key,r=e.resizable===!0?[{name:`increment`,label:C.resize(e.header)},{name:`decrement`,label:C.resize(e.header)}]:void 0;return(0,S.jsxs)(l,{testID:`DataGrid.columnHeader`,role:`columnheader`,accessibilityActions:r,onAccessibilityAction:r===void 0?void 0:n=>{let r=n.nativeEvent.actionName===`increment`?ft:n.nativeEvent.actionName===`decrement`?-ft:0;if(r===0)return;let i=Math.max(wt(e),t+r);Bt(e,i),ge?.(e.key,i)},style:[{width:t,flexDirection:`row`,alignItems:`center`,justifyContent:ze[e.align??`start`],paddingStart:st,paddingEnd:e.resizable===!0?0:st,backgroundColor:_.colorBackgroundSubtle,borderEndWidth:Q,borderEndColor:Z},zt(e)],children:[(0,S.jsx)(l,{style:{flexGrow:1,flexShrink:1,alignItems:ze[e.align??`start`]},children:e.sortable===!0?(0,S.jsx)(l,{testID:`DataGrid.sortButton`,children:(0,S.jsx)(be,{label:e.header,accessibleName:n&&y.direction===`ascending`?C.sortDescending(e.header):C.sortAscending(e.header),variant:`ghost`,size:`sm`,trailingIcon:n?(0,S.jsx)(ue,{name:y.direction===`ascending`?`chevron-up`:`chevron-down`,inline:!0,color:_.colorActionGhostForeground}):void 0,overrides:{fontWeight:tt,fontSize:nt,paddingInline:w},onPress:()=>Tt(e.key)})}):(0,S.jsx)(l,{accessible:!0,accessibilityLabel:e.abbr??e.header,children:(0,S.jsx)(f,{size:`sm`,weight:`semibold`,align:e.align??`start`,overrides:bt,children:e.header})})}),e.resizable===!0?(0,S.jsx)(Le,{width:t,minWidth:wt(e),color:ut,handleWidth:dt,hitSlop:(_.sizeTargetMin-dt)/2,onResize:t=>Bt(e,t),onResizeEnd:t=>ge?.(e.key,t)}):null]},e.key)})]})}),Ht=({item:e})=>{let t=v===`row`&&E.has(e.id),n=t?_.colorBackgroundSubtle:_.colorBackground;return(0,S.jsxs)(l,{testID:`DataGrid.row`,role:`row`,accessibilityState:v===`row`?{selected:t}:void 0,style:{flexDirection:`row`,alignItems:`stretch`,height:$,backgroundColor:n,borderBottomWidth:Q,borderBottomColor:Z,borderStartWidth:_.borderWidthFocus,borderStartColor:t?_.colorControlSelectedBackground:n},children:[(0,S.jsx)(Fe,{visible:j===e.id,color:ot,duration:gt}),v===`row`?(0,S.jsx)(l,{testID:`DataGrid.selectCell`,role:`cell`,style:[Rt,{backgroundColor:n,borderEndWidth:Q,borderEndColor:Z},zt(null)],children:(0,S.jsx)(De,{label:C.selectRow(Mt(e)),hideLabel:!0,name:`${xe}-${e.id}`,checked:t,onChange:()=>Dt(e.id)})}):null,r.map(t=>{let r=`${e.id} ${t.key}`,i=t===Ze,a=i?`rowheader`:`cell`,o=ee&&t.editable===!0,s=Pe(N,e.id,t.key),c=s&&L!==void 0,u=v===`cell`&&Pe(D,e.id,t.key),d=c?_.colorStatusDangerBackground:s?_.colorControlBackground:u?_.colorBackgroundSubtle:`transparent`,p=[{width:Ct(t),paddingHorizontal:st,justifyContent:`center`,alignItems:s?`stretch`:ze[t.align??`start`],backgroundColor:d,borderEndWidth:Q,borderEndColor:Z}],te=zt(t);te!==null&&p.push({...te,backgroundColor:d===`transparent`?n:d});let ne=c?(0,S.jsx)(Ie,{color:_.colorBorderDanger,width:_.borderWidthFocus}):s||k===r||u?(0,S.jsx)(Ie,{color:_.colorBorderFocus,width:_.borderWidthFocus}):null;if(s)return(0,S.jsxs)(l,{testID:i?`DataGrid.rowHeader`:`DataGrid.cell`,role:a,accessibilityActions:[{name:`activate`},{name:`escape`}],onAccessibilityAction:e=>{e.nativeEvent.actionName===`activate`?Ft():e.nativeEvent.actionName===`escape`&&Nt()},style:p,children:[(0,S.jsx)(l,{testID:`DataGrid.editor`,children:Lt(e,t)}),ne]},t.key);let re=je(e,t.key),m=typeof e[t.key]==`number`,ie=t.render===void 0?(0,S.jsx)(f,{size:`sm`,align:t.align??`start`,tone:h?`muted`:`default`,truncate:!0,overrides:m?yt:vt,children:re}):t.render(e),ae=o||v===`cell`||N!==null;return(0,S.jsxs)(ce,{testID:i?`DataGrid.rowHeader`:`DataGrid.cell`,role:a,accessibilityLabel:C.cellLabel(t.header,re),accessibilityHint:o?C.editHint:void 0,accessibilityState:v===`cell`?{selected:u}:void 0,onPress:ae?()=>{if(v===`cell`&&!u){let n={rowId:e.id,column:t.key};O(n),le?.(n)}o?It(e,t):Ft()}:void 0,onFocus:()=>A(r),onBlur:()=>A(e=>e===r?null:e),onHoverIn:()=>M(e.id),onHoverOut:()=>M(t=>t===e.id?null:t),style:p,children:[(0,S.jsx)(l,{testID:`DataGrid.cellContent`,style:{alignItems:ze[t.align??`start`]},children:ie}),ne]},t.key)})]})},Ut=x.useRef(null);x.useEffect(()=>{Ut.current=null},[i.length]);let Wt=Math.max(1,Math.ceil((q??ye.height)/$)),Gt=()=>{if(a===void 0||i.length>=a)return;let e=Math.min(a,i.length+Wt)-1;Ut.current!==e&&(Ut.current=e,he?.(i.length,e))},Kt=r.reduce((e,t)=>e+Ct(t),v===`row`?_t:0)+_.borderWidthFocus,qt=G!==null&&Kt>G,Jt=m!==`content`,Yt={flexGrow:1,flexShrink:1},Xt=(0,S.jsx)(l,{testID:`DataGrid.emptyState`,style:{paddingHorizontal:st,minHeight:$,justifyContent:`center`},children:(0,S.jsx)(f,{size:`sm`,tone:`muted`,overrides:vt,children:ae??C.empty})}),Zt=h?C.loading:L===void 0?N===null?Y:C.editing(Qe.get(N.column)?.header??N.column):C.invalid(L),Qt=D===null?-1:$e.findIndex(e=>e.id===D.rowId),$t=(0,S.jsx)(ie,{testID:`DataGrid.grid`,role:`grid`,accessibilityLabel:e,accessibilityState:{busy:h},data:$e,extraData:[T,y,D,k,j,N,F,L,z,U,p,h],keyExtractor:e=>e.id,renderItem:Ht,getItemLayout:(e,t)=>({length:$,offset:$*t,index:t}),ListHeaderComponent:Vt,ListEmptyComponent:Xt,stickyHeaderIndices:re||Jt?[0]:void 0,scrollEnabled:Jt,initialNumToRender:Jt?void 0:i.length,onScroll:e=>H(e.nativeEvent.contentOffset.y>0),scrollEventThrottle:16,onEndReached:a===void 0?void 0:Gt,onEndReachedThreshold:1,onLayout:e=>J(e.nativeEvent.layout.height),style:Jt?Yt:void 0});return(0,S.jsxs)(l,{ref:ve,testID:`DataGrid`,style:{backgroundColor:_.colorBackground,...m===`viewport`?{height:ye.height-2*_.layoutGapSection}:null},children:[(0,S.jsx)(l,{testID:`DataGrid.caption`,style:n?Be:void 0,children:(0,S.jsx)(Se,{level:t,size:`md`,overrides:{fontFamily:g?.fontFamily,fontSize:g?.captionSize??Ue,fontWeight:g?.captionWeight??We,marginBlockEnd:g?.captionGap??Ge},children:e})}),(0,S.jsx)(l,{testID:`DataGrid.container`,style:{borderStartWidth:Q,borderTopWidth:Q,borderColor:Z,...m===`viewport`?Yt:m===`fixed`?{height:ht}:null},children:(0,S.jsx)(ne,{testID:`DataGrid.scrollRegion`,horizontal:!0,accessibilityHint:C.scrollHint,onScroll:e=>W(e.nativeEvent.contentOffset.x>0),scrollEventThrottle:16,onLayout:e=>K(e.nativeEvent.layout.width),contentContainerStyle:{minWidth:Kt,flexGrow:1},style:Jt?Yt:void 0,children:(0,S.jsx)(l,{style:[{width:Kt},Jt?Yt:null],children:$t})})}),(0,S.jsxs)(l,{testID:`DataGrid.statusBar`,style:oe?{flexDirection:`row`,flexWrap:`wrap`,alignItems:`center`,gap:mt,padding:pt,backgroundColor:_.colorBackgroundSubtle}:Be,children:[(0,S.jsx)(l,{role:`status`,accessibilityLiveRegion:`polite`,children:L!==void 0&&!h?(0,S.jsx)(l,{style:{backgroundColor:_.colorStatusDangerBackground},children:(0,S.jsx)(s.Provider,{value:_.colorStatusDangerForeground,children:(0,S.jsx)(f,{size:`xs`,overrides:xt,children:Zt})})}):(0,S.jsx)(f,{size:`xs`,tone:`muted`,overrides:xt,children:Zt})}),oe?(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)(f,{size:`xs`,tone:`muted`,overrides:xt,children:C.rowCount(et)}),v===`row`&&T.length>0?(0,S.jsx)(f,{size:`xs`,tone:`muted`,overrides:xt,children:C.selectedRows(T.length,et)}):null,qt&&!U?(0,S.jsx)(f,{size:`xs`,tone:`muted`,overrides:xt,children:C.scrollHint}):null,Qt>=0&&D!==null?(0,S.jsx)(f,{size:`xs`,tone:`muted`,overrides:xt,children:C.position(Qt+1,Qe.get(D.column)?.header??D.column)}):null]}):null]})]})}var x,S,C,ze,Be,Ve,He,Ue,We,Ge,Ke,qe,w;function T(){return(T=e((()=>{x=t(n(),1),ge(),h(),m(),oe(),p(),se(),re(),r(),o(),fe(),a(),ye(),Ee(),ke(),xe(),le(),v(),we(),y(),d(),ve(),S=he(),C={sortAscending:e=>`Sort by ${e}, ascending`,sortDescending:e=>`Sort by ${e}, descending`,sortedAnnouncement:(e,t)=>`Sorted by ${e}, ${t}`,selectAll:`Select all rows`,selectRow:e=>`Select ${e}`,selectedRows:(e,t)=>`${e} of ${t} rows selected`,editing:e=>`Editing ${e}. Enter to save, Escape to cancel.`,invalid:e=>`${e}`,rowCount:e=>new Intl.PluralRules().select(e)===`one`?`${e} row`:`${e} rows`,position:(e,t)=>`Row ${e}, ${t}`,resize:e=>`Resize ${e}`,loading:`Loading`,empty:`Nothing to show.`,scrollHint:`Scroll sideways to see more columns`,cellLabel:(e,t)=>`${e}: ${t}`,editHint:`Double tap to edit`},ze={start:`flex-start`,center:`center`,end:`flex-end`},Be={position:`absolute`,width:1,height:1,overflow:`hidden`},Ve=`font.weight.semibold`,He=`font.size.sm`,Ue=`font.size.md`,We=`font.weight.semibold`,Ge=`space.2`,Ke=`font.lineHeight.tight`,qe=`font.family.mono`,w=`space.0`,Re.__docgenInfo={description:'DataGrid — for working in data, not reading it: many rows, cell-level selection, values\nedited in place. Shares Table\'s column and data model; a different role and contract.\n\nWhen to use: price lists, inventory counts, timesheets, admin views over large sets. Set\n`editable` and mark the editable columns, each with a `validate`. Not for records read and\nacted on by row (Table), a handful of fields (Form), or phone-first screens (Table with\n`responsive: stack`).\n\nThere is no grid element on native. The caption is a `Heading` at `captionLevel` (visually\nhidden with `hideCaption`). A horizontal `ScrollView` (the scroll region) holds a `FlatList`\nwith `role="grid"`, the caption as its `accessibilityLabel`, and a fixed `getItemLayout`\nfrom the density\'s row height, so rows virtualize; the header row (`role="rowgroup"` >\n`row` > `columnheader`) is its sticky list header, sharing the horizontal scroll with the\nbody and casting `headerShadow` once the body scrolls beneath it. `FlatList` gives the body\nrows no wrapper, so the `body` rowgroup part has no element here. Rows are `role="row"`\nViews of fixed-width `role="cell"` / `"rowheader"` Pressables named `copy.cellLabel`.\nPinned columns keep their place in `columns` and scroll with the rest (native has no\n`position: sticky`), casting `pinnedShadow` once the region has moved sideways.\n\nThe web keyboard model has no equivalent in core React Native (View and Pressable have no\nkey events), so touch replaces it: a sortable header is a `Button`; `selectable="row"`\n(and `range`, which degrades to it with a `__DEV__` warning) adds `Checkbox` cells and a\nselect-all Checkbox that stands in for Ctrl+A; `cell` selects the tapped cell. An editable\ncell opens its editor on tap (`copy.editHint`), after `onEditStart` allows it: `Input`\n(commits on blur), `NumberInput` and `DatePicker` (commit when another cell or a sort header\nis pressed, or through the cell\'s `activate` accessibility action), `Select` (opens at once\nand commits on change; closing it cancels) and `Checkbox` (commits on change). The `escape`\naccessibility action cancels. A failing `validate` keeps the editor open with the cell in\ncellInvalid* and the message in the status bar. Column resize is a `PanResponder` drag on\nthe always-visible header edge plus increment/decrement accessibility actions on the header\ncell by `resizeStep`. Copying (Ctrl+C) is not offered: core RN has no clipboard API.\n\nThe status bar holds one polite live region (loading, validation, editing, sort and\nselection announcements, with `AccessibilityInfo.announceForAccessibility` on iOS) beside\nthe row count, the selection count, `copy.scrollHint` while columns overflow unscrolled, and\n`copy.position` for the active cell — which is shown but never announced. With\n`showStatusBar` false the bar is visually hidden and keeps only the live region.',methods:[],displayName:`DataGrid`,props:{caption:{required:!0,tsType:{name:`string`},description:'What the grid holds ("Price list"). The accessible name; visually hidden with `hideCaption`.'},captionLevel:{required:!1,tsType:{name:`union`,raw:`DataGridCaptionLevel | undefined`,elements:[{name:`union`,raw:`'2' | '3' | '4' | 2 | 3 | 4`,elements:[{name:`literal`,value:`'2'`},{name:`literal`,value:`'3'`},{name:`literal`,value:`'4'`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`}]},{name:`undefined`}]},description:"Heading level of the caption in the page outline; its size is `captionSize` regardless, as Table.",defaultValue:{value:`'2'`,computed:!1}},hideCaption:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Visually hide the caption; it remains the accessible name.`,defaultValue:{value:`false`,computed:!1}},columns:{required:!0,tsType:{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{
  key: string;
  header: string;
  abbr?: string;
  align?: 'start' | 'end' | 'center';
  sortable?: boolean;
  width?: number;
  minWidth?: number;
  resizable?: boolean;
  isRowHeader?: boolean;
  pinned?: 'start' | 'end';
  editable?: boolean;
  editor?: 'text' | 'number' | 'select' | 'date' | 'checkbox';
  options?: { value: string; label: string }[];
  render?: (row: DataGridRow) => React.ReactNode;
  validate?: (value: unknown, row: DataGridRow) => string | undefined;
}`,signature:{properties:[{key:`key`,value:{name:`string`,required:!0}},{key:`header`,value:{name:`string`,required:!0}},{key:`abbr`,value:{name:`string`,required:!1}},{key:`align`,value:{name:`union`,raw:`'start' | 'end' | 'center'`,elements:[{name:`literal`,value:`'start'`},{name:`literal`,value:`'end'`},{name:`literal`,value:`'center'`}],required:!1}},{key:`sortable`,value:{name:`boolean`,required:!1}},{key:`width`,value:{name:`number`,required:!1}},{key:`minWidth`,value:{name:`number`,required:!1}},{key:`resizable`,value:{name:`boolean`,required:!1}},{key:`isRowHeader`,value:{name:`boolean`,required:!1}},{key:`pinned`,value:{name:`union`,raw:`'start' | 'end'`,elements:[{name:`literal`,value:`'start'`},{name:`literal`,value:`'end'`}],required:!1}},{key:`editable`,value:{name:`boolean`,required:!1}},{key:`editor`,value:{name:`union`,raw:`'text' | 'number' | 'select' | 'date' | 'checkbox'`,elements:[{name:`literal`,value:`'text'`},{name:`literal`,value:`'number'`},{name:`literal`,value:`'select'`},{name:`literal`,value:`'date'`},{name:`literal`,value:`'checkbox'`}],required:!1}},{key:`options`,value:{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{ value: string; label: string }`,signature:{properties:[{key:`value`,value:{name:`string`,required:!0}},{key:`label`,value:{name:`string`,required:!0}}]}}],raw:`{ value: string; label: string }[]`,required:!1}},{key:`render`,value:{name:`signature`,type:`function`,raw:`(row: DataGridRow) => React.ReactNode`,signature:{arguments:[{type:{name:`signature`,type:`object`,raw:`{ id: string; [key: string]: unknown }`,signature:{properties:[{key:`id`,value:{name:`string`,required:!0}},{key:{name:`string`},value:{name:`unknown`,required:!0}}]}},name:`row`}],return:{name:`ReactReactNode`,raw:`React.ReactNode`}},required:!1}},{key:`validate`,value:{name:`signature`,type:`function`,raw:`(value: unknown, row: DataGridRow) => string | undefined`,signature:{arguments:[{type:{name:`unknown`},name:`value`},{type:{name:`signature`,type:`object`,raw:`{ id: string; [key: string]: unknown }`,signature:{properties:[{key:`id`,value:{name:`string`,required:!0}},{key:{name:`string`},value:{name:`unknown`,required:!0}}]}},name:`row`}],return:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]}},required:!1}}]}}],raw:`DataGridColumn[]`},description:"Column model. `width` is pixels (the `columnWidth` binding when omitted); exactly one column may be `isRowHeader`."},data:{required:!0,tsType:{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{ id: string; [key: string]: unknown }`,signature:{properties:[{key:`id`,value:{name:`string`,required:!0}},{key:{name:`string`},value:{name:`unknown`,required:!0}}]}}],raw:`DataGridRow[]`},description:"The rows. `id` must be stable. Only visible rows are rendered."},rowCount:{required:!1,tsType:{name:`union`,raw:`number | undefined`,elements:[{name:`number`},{name:`undefined`}]},description:"Total rows when `data` is a prefix of a larger set (server paging); `onEndReached` asks for more. A whole number."},sort:{required:!1,tsType:{name:`union`,raw:`DataGridSort | undefined`,elements:[{name:`signature`,type:`object`,raw:`{ column: string; direction: 'ascending' | 'descending' }`,signature:{properties:[{key:`column`,value:{name:`string`,required:!0}},{key:`direction`,value:{name:`union`,raw:`'ascending' | 'descending'`,elements:[{name:`literal`,value:`'ascending'`},{name:`literal`,value:`'descending'`}],required:!0}}]}},{name:`undefined`}]},description:"Controlled sort state; the caller sorts `data`."},defaultSort:{required:!1,tsType:{name:`union`,raw:`DataGridSort | undefined`,elements:[{name:`signature`,type:`object`,raw:`{ column: string; direction: 'ascending' | 'descending' }`,signature:{properties:[{key:`column`,value:{name:`string`,required:!0}},{key:`direction`,value:{name:`union`,raw:`'ascending' | 'descending'`,elements:[{name:`literal`,value:`'ascending'`},{name:`literal`,value:`'descending'`}],required:!0}}]}},{name:`undefined`}]},description:"Initial sort; the grid sorts `data` itself when `rowCount` is not set."},selectable:{required:!1,tsType:{name:`union`,raw:`DataGridSelectable | undefined`,elements:[{name:`union`,raw:`'none' | 'row' | 'cell' | 'range'`,elements:[{name:`literal`,value:`'none'`},{name:`literal`,value:`'row'`},{name:`literal`,value:`'cell'`},{name:`literal`,value:`'range'`}]},{name:`undefined`}]},description:"`row` adds a checkbox column; `cell` selects the tapped cell. `range` has no touch model here and degrades to `row`.",defaultValue:{value:`'none'`,computed:!1}},selected:{required:!1,tsType:{name:`union`,raw:`string[] | undefined`,elements:[{name:`Array`,elements:[{name:`string`}],raw:`string[]`},{name:`undefined`}]},description:`Controlled selected row ids (row mode).`},editable:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"Master switch: cells whose column is `editable` open their editor when tapped.",defaultValue:{value:`false`,computed:!1}},density:{required:!1,tsType:{name:`union`,raw:`DataGridDensity | undefined`,elements:[{name:`union`,raw:`'compact' | 'comfortable'`,elements:[{name:`literal`,value:`'compact'`},{name:`literal`,value:`'comfortable'`}]},{name:`undefined`}]},description:"Row height: `compact` is the minimum target, `comfortable` the touch target.",defaultValue:{value:`'compact'`,computed:!1}},stickyHeader:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"The header stays visible while the body scrolls. Always true when virtualized (`height` is not `content`).",defaultValue:{value:`true`,computed:!1}},height:{required:!1,tsType:{name:`union`,raw:`DataGridHeight | undefined`,elements:[{name:`union`,raw:`'content' | 'viewport' | 'fixed'`,elements:[{name:`literal`,value:`'content'`},{name:`literal`,value:`'viewport'`},{name:`literal`,value:`'fixed'`}]},{name:`undefined`}]},description:"`viewport`: window height minus twice the section gap; `content`: grows with rows; `fixed`: `overrides.fixedHeight`.",defaultValue:{value:`'viewport'`,computed:!1}},loading:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"Marks the grid busy and shows `copy.loading` in the status bar; existing rows stay, their text muted.",defaultValue:{value:`false`,computed:!1}},emptyMessage:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:"Shown when `data` is empty. Defaults to `copy.empty`."},showStatusBar:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`A footer line with row count, selection count and, while editing, the validation message.`,defaultValue:{value:`true`,computed:!1}},overrides:{required:!1,tsType:{name:`union`,raw:`Partial<Record<DataGridOverridableBinding, TokenRef | undefined>> | undefined`,elements:[{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'headerWeight'
| 'headerSize'
| 'headerBorder'
| 'headerBorderWidth'
| 'headerShadow'
| 'gridLine'
| 'gridLineWidth'
| 'rowHover'
| 'cellPaddingInline'
| 'columnWidth'
| 'pinnedShadow'
| 'resizeHandle'
| 'resizeHandleWidth'
| 'resizeStep'
| 'statusBarSize'
| 'statusBarPadding'
| 'statusBarGap'
| 'captionSize'
| 'captionWeight'
| 'captionGap'
| 'fixedHeight'
| 'fontFamily'
| 'fontSize'
| 'lineHeight'
| 'numericFont'
| 'transition'`,elements:[{name:`literal`,value:`'headerWeight'`},{name:`literal`,value:`'headerSize'`},{name:`literal`,value:`'headerBorder'`},{name:`literal`,value:`'headerBorderWidth'`},{name:`literal`,value:`'headerShadow'`},{name:`literal`,value:`'gridLine'`},{name:`literal`,value:`'gridLineWidth'`},{name:`literal`,value:`'rowHover'`},{name:`literal`,value:`'cellPaddingInline'`},{name:`literal`,value:`'columnWidth'`},{name:`literal`,value:`'pinnedShadow'`},{name:`literal`,value:`'resizeHandle'`},{name:`literal`,value:`'resizeHandleWidth'`},{name:`literal`,value:`'resizeStep'`},{name:`literal`,value:`'statusBarSize'`},{name:`literal`,value:`'statusBarPadding'`},{name:`literal`,value:`'statusBarGap'`},{name:`literal`,value:`'captionSize'`},{name:`literal`,value:`'captionWeight'`},{name:`literal`,value:`'captionGap'`},{name:`literal`,value:`'fixedHeight'`},{name:`literal`,value:`'fontFamily'`},{name:`literal`,value:`'fontSize'`},{name:`literal`,value:`'lineHeight'`},{name:`literal`,value:`'numericFont'`},{name:`literal`,value:`'transition'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<DataGridOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<DataGridOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:"Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop."},onSortChange:{required:!1,tsType:{name:`union`,raw:`((column: string, direction: 'ascending' | 'descending') => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired when a sortable header is activated: ascending on a new column, then toggling.`},onSelectionChange:{required:!1,tsType:{name:`union`,raw:`| ((
    selection: string[] | { rowId: string; column: string } | { from: { rowId: string; column: string }; to: { rowId: string; column: string } },
  ) => void)
| undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired with the selection: row ids (row mode) or one cell (cell mode).`},onCellChange:{required:!1,tsType:{name:`union`,raw:`((rowId: string, column: string, value: DataGridCellValue, previous: DataGridCellValue) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Fired when an edit commits. The caller updates `data`; the cell shows the old value until it does."},onEditStart:{required:!1,tsType:{name:`union`,raw:`((rowId: string, column: string) => boolean | void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Fired before an editor opens; return `false` to refuse editing that cell."},onEndReached:{required:!1,tsType:{name:`union`,raw:`((start: number, end: number) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"`onRangeNeeded` on this platform: the list came within one page of the end of `data` and `rowCount` says there is more."},onColumnResize:{required:!1,tsType:{name:`union`,raw:`((column: string, width: number) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired with the column key and its new width when a drag on the header edge ends, or per resize accessibility action.`},ref:{required:!1,tsType:{name:`union`,raw:`React.Ref<ViewInstance> | undefined`,elements:[{name:`ReactRef`,raw:`React.Ref<ViewInstance>`,elements:[{name:`ViewInstance`}]},{name:`undefined`}]},description:`The root view.`}}}})))()}var E,D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,Je;function X(){return(X=e((()=>{T(),ee(),E={title:`DataGrid/React Native`,component:Re,decorators:[u()],args:{caption:`Price list`,captionLevel:`2`,hideCaption:!1,columns:[{key:`sku`,header:`SKU`,isRowHeader:!0,width:160},{key:`name`,header:`Name`},{key:`price`,header:`Price`,align:`end`,sortable:!0}],data:[{id:`a`,sku:`A-1`,name:`Widget`,price:10},{id:`b`,sku:`B-2`,name:`Sprocket`,price:20}],selectable:`none`,editable:!1,density:`compact`,stickyHeader:!0,height:`viewport`,loading:!1,showStatusBar:!0}},D={},O={args:{captionLevel:`2`}},k={args:{captionLevel:`3`}},A={args:{captionLevel:`4`}},j={args:{selectable:`none`}},M={args:{selectable:`row`}},N={args:{selectable:`cell`}},P={args:{selectable:`range`}},F={args:{density:`compact`}},I={args:{density:`comfortable`}},L={args:{height:`content`}},R={args:{height:`viewport`}},z={args:{height:`fixed`}},B={args:{loading:!0}},V={args:{data:[]}},H={args:{hideCaption:!0}},U={args:{showStatusBar:!1}},W={args:{columns:[{key:`sku`,header:`SKU`,isRowHeader:!0,width:160,pinned:`start`,resizable:!0},{key:`name`,header:`Name`,resizable:!0},{key:`price`,header:`Price`,align:`end`,sortable:!0,resizable:!0}]}},G={args:{caption:`Price list`,columns:[{key:`sku`,header:`SKU`,isRowHeader:!0,width:160},{key:`name`,header:`Name`},{key:`price`,header:`Price`,align:`end`,sortable:!0}],data:[{id:`a`,sku:`A-1`,name:`Widget`,price:10},{id:`b`,sku:`B-2`,name:`Sprocket`,price:20}]}},K={args:{caption:`Stock levels`,editable:!0,columns:[{key:`sku`,header:`SKU`,isRowHeader:!0},{key:`onHand`,header:`On hand`,align:`end`,editable:!0,editor:`number`}],data:[{id:`a`,sku:`A-1`,onHand:12},{id:`b`,sku:`B-2`,onHand:4}]}},q={args:{caption:`Orders`,selectable:`row`,density:`comfortable`,columns:[{key:`order`,header:`Order`,isRowHeader:!0},{key:`customer`,header:`Customer`}],data:[{id:`a`,order:`1001`,customer:`Ana Souza`},{id:`b`,order:`1002`,customer:`Bo Lin`}]}},J={args:{caption:`Daily figures`,selectable:`range`,height:`fixed`,columns:[{key:`day`,header:`Day`,isRowHeader:!0},{key:`visits`,header:`Visits`,align:`end`},{key:`signups`,header:`Signups`,align:`end`}],data:[{id:`a`,day:`Monday`,visits:1200,signups:30},{id:`b`,day:`Tuesday`,visits:1450,signups:41}]}},Y={args:{selectable:`row`,editable:!0,height:`content`,columns:[{key:`sku`,header:`SKU`,isRowHeader:!0,width:160},{key:`name`,header:`Name`,editable:!0,editor:`text`},{key:`price`,header:`Price`,align:`end`,sortable:!0,editable:!0,editor:`number`}]}},Je=[`Default`,`CaptionLevel2`,`CaptionLevel3`,`CaptionLevel4`,`SelectableNone`,`SelectableRow`,`SelectableCell`,`SelectableRange`,`DensityCompact`,`DensityComfortable`,`HeightContent`,`HeightViewport`,`HeightFixed`,`Loading`,`Empty`,`HiddenCaption`,`NoStatusBar`,`ResizableAndPinned`,`PriceList`,`EditableCells`,`RowSelectionForBulkActions`,`RangeSelectionInAFixedHeightGrid`,`Keyboard`],D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    captionLevel: '2'
  }
}`,...O.parameters?.docs?.source}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    captionLevel: '3'
  }
}`,...k.parameters?.docs?.source}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    captionLevel: '4'
  }
}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'none'
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'row'
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'cell'
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'range'
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
    height: 'content'
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    height: 'viewport'
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    height: 'fixed'
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true
  }
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    data: []
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    hideCaption: true
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    showStatusBar: false
  }
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    columns: [{
      key: 'sku',
      header: 'SKU',
      isRowHeader: true,
      width: 160,
      pinned: 'start',
      resizable: true
    }, {
      key: 'name',
      header: 'Name',
      resizable: true
    }, {
      key: 'price',
      header: 'Price',
      align: 'end',
      sortable: true,
      resizable: true
    }]
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  args: {
    caption: 'Price list',
    columns: [{
      key: 'sku',
      header: 'SKU',
      isRowHeader: true,
      width: 160
    }, {
      key: 'name',
      header: 'Name'
    }, {
      key: 'price',
      header: 'Price',
      align: 'end',
      sortable: true
    }],
    data: [{
      id: 'a',
      sku: 'A-1',
      name: 'Widget',
      price: 10
    }, {
      id: 'b',
      sku: 'B-2',
      name: 'Sprocket',
      price: 20
    }]
  }
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  args: {
    caption: 'Stock levels',
    editable: true,
    columns: [{
      key: 'sku',
      header: 'SKU',
      isRowHeader: true
    }, {
      key: 'onHand',
      header: 'On hand',
      align: 'end',
      editable: true,
      editor: 'number'
    }],
    data: [{
      id: 'a',
      sku: 'A-1',
      onHand: 12
    }, {
      id: 'b',
      sku: 'B-2',
      onHand: 4
    }]
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  args: {
    caption: 'Orders',
    selectable: 'row',
    density: 'comfortable',
    columns: [{
      key: 'order',
      header: 'Order',
      isRowHeader: true
    }, {
      key: 'customer',
      header: 'Customer'
    }],
    data: [{
      id: 'a',
      order: '1001',
      customer: 'Ana Souza'
    }, {
      id: 'b',
      order: '1002',
      customer: 'Bo Lin'
    }]
  }
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  args: {
    caption: 'Daily figures',
    selectable: 'range',
    height: 'fixed',
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
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  args: {
    selectable: 'row',
    editable: true,
    height: 'content',
    columns: [{
      key: 'sku',
      header: 'SKU',
      isRowHeader: true,
      width: 160
    }, {
      key: 'name',
      header: 'Name',
      editable: true,
      editor: 'text'
    }, {
      key: 'price',
      header: 'Price',
      align: 'end',
      sortable: true,
      editable: true,
      editor: 'number'
    }]
  }
}`,...Y.parameters?.docs?.source},description:{story:`Sortable header, select-all, row checkboxes and editable cells, for the axe gate and manual keyboard checks on react-native-web.`,...Y.parameters?.docs?.description}}}})))()}X();export{O as CaptionLevel2,k as CaptionLevel3,A as CaptionLevel4,D as Default,I as DensityComfortable,F as DensityCompact,K as EditableCells,V as Empty,L as HeightContent,z as HeightFixed,R as HeightViewport,H as HiddenCaption,Y as Keyboard,B as Loading,U as NoStatusBar,G as PriceList,J as RangeSelectionInAFixedHeightGrid,W as ResizableAndPinned,q as RowSelectionForBulkActions,N as SelectableCell,j as SelectableNone,P as SelectableRange,M as SelectableRow,Je as __namedExportsOrder,E as default};