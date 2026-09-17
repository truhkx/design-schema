import{n as e,o as t}from"./rolldown-runtime-C0FnF6B9.js";import{t as n}from"./react-DiVRNtpo.js";import{X as r,Z as i,c as a,d as ee,h as te,l as o,m as s,n as ne,o as re,r as c,t as l,u as ie}from"./decorators-Dl4455ZU.js";import{d as ae,f as oe}from"./FlatList-B--84B_m.js";import{n as u,t as d}from"./Animated-75prr5wJ.js";import{n as f,r as se}from"./Link-Bw8MWX3a.js";import{n as p,t as ce}from"./PanResponder-yh9ffqIF.js";import{n as le,t as ue}from"./Pressable-CjGHHyHY.js";import{n as m,t as de}from"./Modal-DsdNBXp0.js";import{n as h,t as fe}from"./SafeAreaView-u-zpwWzv.js";import{n as g,t as pe}from"./Icon-sSovLWRe.js";import{n as me,t as he}from"./useWindowDimensions-oJibnkug.js";import{t as ge}from"./react-native-web-CvoPEK_w.js";import{c as _e,i as ve,l as ye,m as be,p as xe,r as Se,s as Ce}from"./iframe-CAToN8Eb.js";import{n as we,t as _}from"./Button-B0Tk0pjd.js";import{n as v,t as Te}from"./Heading-BHboSapN.js";import{n as y,t as b}from"./Stack-l7fs4Elr.js";import{n as Ee,t as De}from"./Box-Cboob0HJ.js";import{n as x,t as S}from"./Checkbox--8cawqnp.js";import{n as Oe,t as C}from"./Card-DUGvBOuT.js";import{n as ke,t as Ae}from"./FocusScope-DoyDPQFh.js";function w({trigger:e,open:t,heading:n,hideHeading:r=!1,children:a,footer:ee,side:te=`start`,width:ne=`default`,persistent:re=`never`,role:c=`complementary`,modal:l=!1,scrim:oe=!0,dismissible:u=!0,swipeable:f=!0,onOpenChange:se,overrides:p,ref:le}){let{tokens:m}=_e(),h=Ce(),{width:g}=me(),he=T.useRef(null),ye=T.useRef(0),be=t!==void 0,[Se,we]=T.useState(!1),v=be?t:Se,[y,Ee]=T.useState(v),x=T.useRef(new d.Value(+!!v)).current,S=T.useRef(new d.Value(0)).current,Oe=p?.scrim?o(m,p.scrim):m.colorOverlayScrim,C=m.colorOverlaySurface,ke=p?.shadow?o(m,p.shadow):m.shadowOverlay,w=p?.border?o(m,p.border):m.colorBorder,Le=p?.borderWidth?o(m,p.borderWidth):m.borderWidthThin,Re=p?.width?o(m,p.width):m.layoutMaxWidthProse,ze=(p?.widthNarrow?o(m,p.widthNarrow):m.space20)*3,D=p?.widthWide?o(m,p.widthWide):m.layoutMaxWidthContent,O=p?.edgeGutter?o(m,p.edgeGutter):m.space12,k=p?.inset?o(m,p.inset):m.layoutInsetLg,A=p?.headerGap?o(m,p.headerGap):m.layoutGapNormal,j=p?.partGap?o(m,p.partGap):m.layoutGapLoose,M=p?.layer?o(m,p.layer):m.layerSheet,N=p?.enter?o(m,p.enter):m.motionDurationBase,P=p?.exit?o(m,p.exit):m.motionDurationFast,F=re===`content`?m.layoutMaxWidthContent:re===`page`?m.layoutMaxWidthPage:null,I=F!==null&&g>F,L=ie.isRTL?te===`end`:te===`start`,R=l||oe,z=ne===`narrow`?ze:ne===`wide`?D:Re,B=Math.min(z,g-O);T.useEffect(()=>{v&&Ee(!0)},[v]),T.useEffect(()=>{if(I||!y)return;if(v){if(S.setValue(0),h){x.setValue(1);return}let e=d.timing(x,{toValue:1,duration:N,easing:ve(m.motionEasingStandard),useNativeDriver:!1});return e.start(),()=>e.stop()}if(h){x.setValue(0),Ee(!1);return}let e=d.timing(x,{toValue:0,duration:P,easing:ve(m.motionEasingExit),useNativeDriver:!1});return e.start(({finished:e})=>{e&&Ee(!1)}),()=>e.stop()},[v,y,h,I]);let V=()=>{let e=he.current?ge(he.current):null;e!=null&&xe.setAccessibilityFocus(e)},H=(e,t)=>{be||we(e),se?.(e,t)},U=e=>{v&&(H(!1,e),V())},W=()=>{if(v){U(`trigger`);return}H(!0,`trigger`)},G=T.useRef(U);G.current=U;let K=()=>{u&&U(`scrim`)},q=()=>{U(`close-button`)},J=()=>{if(v){if(u){U(`escape`);return}se?.(!1,`escape`)}},Y=T.useRef(!1),X=()=>{Y.current=!0},Z=()=>{Y.current=!1},Q=e=>{ye.current=e.nativeEvent.layout.width},Be=T.useMemo(()=>{let e=()=>{if(h){S.setValue(0);return}d.timing(S,{toValue:0,duration:P,easing:ve(m.motionEasingStandard),useNativeDriver:!1}).start()};return ce.create({onStartShouldSetPanResponder:()=>!1,onMoveShouldSetPanResponder:(e,t)=>!f||!u||Y.current?!1:(L?-t.dx:t.dx)>Pe&&Math.abs(t.dx)>Math.abs(t.dy),onPanResponderMove:(e,t)=>{let n=L?-t.dx:t.dx;S.setValue(n>0?t.dx:0)},onPanResponderRelease:(t,n)=>{let r=L?-n.dx:n.dx,i=L?-n.vx:n.vx;if(r<=(ye.current||B)*Me&&i<=Ne){e();return}if(G.current(`swipe`),h){S.setValue(L?-g:g);return}let a=Math.max(i,Fe);d.decay(S,{velocity:L?-a:a,deceleration:Ie,useNativeDriver:!1}).start()},onPanResponderTerminate:e})},[f,u,L,S,g,B,h,P,m.motionEasingStandard]),$=T.isValidElement(e)?e:null,Ve=$===null?e:T.cloneElement($,{onPress:e=>{$.props.onPress?.(e),W()},expanded:v}),He=p?.inset?{paddingBlock:p.inset}:void 0,Ue=p?.footerGap?{gap:p.footerGap}:void 0,We=ee===void 0?null:(0,E.jsx)(fe,{style:{paddingHorizontal:k,paddingBottom:k},testID:`SidePanel.footer`,children:(0,E.jsx)(b,{direction:`horizontal`,gap:`tight`,justify:`end`,overrides:Ue,children:ee})}),Ge=(0,E.jsx)(Te,{level:2,size:`lg`,children:n});if(I){let e={width:z,backgroundColor:C,gap:j,...L?{borderRightWidth:Le,borderRightColor:w}:{borderLeftWidth:Le,borderLeftColor:w}};return(0,E.jsxs)(s,{ref:le,style:e,role:c,accessibilityLabel:n,testID:`SidePanel`,children:[r?null:(0,E.jsx)(s,{style:{paddingHorizontal:k,paddingTop:k},testID:`SidePanel.header`,children:Ge}),(0,E.jsx)(s,{testID:`SidePanel.body`,children:(0,E.jsx)(De,{inset:`lg`,overrides:He,children:a})}),We]})}let Ke={flex:1},qe={...i.absoluteFill,backgroundColor:Oe,opacity:R?x:0},Je={flex:1,flexDirection:`row`,justifyContent:L?`flex-start`:`flex-end`,zIndex:M},Ye=x.interpolate({inputRange:[0,1],outputRange:[L?-B:B,0]}),Xe={width:B,height:`100%`,...ke,backgroundColor:C,overflow:`hidden`,gap:j,transform:[{translateX:d.add(Ye,S)}]},Ze={flexDirection:`row`,alignItems:`flex-start`,justifyContent:r?`flex-end`:`space-between`,gap:A,paddingHorizontal:k,paddingTop:k},Qe={flexShrink:1},$e={flexGrow:1},et=!r||u;return(0,E.jsxs)(s,{testID:`SidePanel`,children:[e===void 0?null:(0,E.jsx)(s,{ref:he,collapsable:!1,testID:`SidePanel.trigger`,children:Ve}),(0,E.jsx)(de,{visible:y,transparent:!0,onRequestClose:J,statusBarTranslucent:!0,children:(0,E.jsxs)(s,{style:Ke,children:[(0,E.jsx)(d.View,{style:qe}),(0,E.jsx)(ue,{style:i.absoluteFill,onPress:K,accessible:!1,testID:`SidePanel.scrim`}),(0,E.jsx)(s,{style:Je,pointerEvents:`box-none`,children:(0,E.jsx)(Ae,{trapped:l,active:y,autoFocus:l?`first`:`none`,restoreFocus:!1,children:(0,E.jsxs)(d.View,{ref:le,style:Xe,onLayout:Q,accessibilityViewIsModal:l,accessibilityLabel:n,testID:`SidePanel.surface`,children:[et?(0,E.jsxs)(s,{...f&&u?Be.panHandlers:null,onTouchEnd:Z,onTouchCancel:Z,style:Ze,testID:`SidePanel.header`,children:[r?null:Ge,u?(0,E.jsx)(s,{onTouchStart:X,testID:`SidePanel.closeButton`,children:(0,E.jsx)(_,{label:je.closeLabel,variant:`ghost`,iconOnly:!0,leadingIcon:(0,E.jsx)(pe,{name:`close`,color:m.colorActionGhostForeground}),onPress:q})}):null]}):null,(0,E.jsx)(ae,{testID:`SidePanel.body`,style:Qe,contentContainerStyle:$e,keyboardShouldPersistTaps:`handled`,children:(0,E.jsx)(De,{inset:`lg`,overrides:He,children:a})}),We]})})})]})})]})}var T,E,je,Me,Ne,Pe,Fe,Ie;function Le(){return(Le=e((()=>{T=t(n(),1),be(),u(),ee(),m(),p(),le(),h(),oe(),r(),te(),he(),a(),Ee(),we(),ke(),v(),g(),y(),Se(),E=ye(),je={closeLabel:`Close`},Me=.25,Ne=1.5,Pe=4,Fe=.5,Ie=.998,w.__docgenInfo={description:"SidePanel — the drawer: hidden off the edge until the trigger asks for it, then\nsliding in beside the page. Non-modal by default (the APG disclosure pattern);\n`modal` makes it a modal panel at the edge. Above `persistent`'s breakpoint it\nstops being an overlay and becomes a sidebar.\n\nWhen to use: primary navigation on phones (`start`), filters, a cart or a detail\npanel (`end`), a settings drawer. Not for a short list of actions (Menu,\nActionSheet), a task with a few fields (Dialog, BottomSheet), or the page's point.\nDo not stack side panels.\n\nOverlay: a native `Modal` (`transparent`, `statusBarTranslucent`) holding a\nfull-screen scrim `Pressable` (`color.overlay.scrim` when `modal` or `scrim`,\ntransparent otherwise, reported as `scrim` either way) and an `Animated.View`\nsurface at the `side` edge (`I18nManager.isRTL` flips it), its width the width\nbinding capped at the window minus `edgeGutter`. It slides in over `enter` with\n`motion.easing.standard` and out over `exit` with `motion.easing.exit`, the scrim\nfading with it, instantly under reduced motion. The surface composes `FocusScope`\n(`trapped={modal}`), a header row with `Heading` (level 2, size lg) and the close\n`Button` (ghost, iconOnly), a scrolling `Box` body and a `Stack` footer. A\n`PanResponder` on the header — never on a touch that starts inside the close\nbutton's wrapping view — drags the surface toward its edge; past a quarter of its\nwidth or a fast flick it reports `swipe` and continues at the release velocity,\notherwise it springs back over `exit`. `onRequestClose` (the Android back button)\nis `escape`; with `dismissible` false it reports without closing. Closing moves\naccessibility focus back to the trigger.\n\nPersistent (window width > the chosen `layout.maxWidth.*` token — a width check,\nnot an orientation check): a plain `View` where SidePanel sits, with the `role`\nprop and `heading` as its label, the `border` on the edge facing the content, the\nwidth binding as its width and natural height (the screen scrolls, not the body),\nno Modal, scrim, close button or trigger.\n\nNative limits: the non-modal \"page stays live\" cannot be reproduced under `Modal`,\nwhich intercepts every touch; Tab stitching and modal Tab wrap have no native\nkey-event equivalent; the inert page is the Modal window itself and scroll lock has\nno meaning. Crossing the persistent breakpoint changes the root, so the children\nremount.",methods:[],displayName:`SidePanel`,props:{trigger:{required:!1,tsType:{name:`union`,raw:`React.ReactNode | undefined`,elements:[{name:`ReactReactNode`,raw:`React.ReactNode`},{name:`undefined`}]},description:'The Button that shows and hides the panel (usually `iconOnly` with the `menu` Icon and a label like "Menu"). It stays a toggle — pressing it again closes — and carries `expanded`. Omit to control `open` from elsewhere (a Toolbar). Not rendered once `persistent` takes over.'},open:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Controlled visibility. Omit for uncontrolled (the trigger toggles it); an uncontrolled panel always starts closed, so a panel that must start open is controlled.`},heading:{required:!0,tsType:{name:`string`},description:`The panel's title and accessible name ("Menu", "Filters", "Your cart").`},hideHeading:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"Keep the title for assistive technology (the surface's `accessibilityLabel`) but do not show it. When the header would then be empty, it is not rendered.",defaultValue:{value:`false`,computed:!1}},children:{required:!0,tsType:{name:`ReactReactNode`,raw:`React.ReactNode`},description:`The body. Scrolls inside the overlay panel when taller than the viewport.`},footer:{required:!1,tsType:{name:`union`,raw:`React.ReactNode | undefined`,elements:[{name:`ReactReactNode`,raw:`React.ReactNode`},{name:`undefined`}]},description:`Pinned to the bottom of the panel above the safe area.`},side:{required:!1,tsType:{name:`union`,raw:`SidePanelSide | undefined`,elements:[{name:`union`,raw:`'start' | 'end'`,elements:[{name:`literal`,value:`'start'`},{name:`literal`,value:`'end'`}]},{name:`undefined`}]},description:"The edge the panel slides from: `start` is left in left-to-right layouts, right under `I18nManager.isRTL`.",defaultValue:{value:`'start'`,computed:!1}},width:{required:!1,tsType:{name:`union`,raw:`SidePanelWidth | undefined`,elements:[{name:`union`,raw:`'narrow' | 'default' | 'wide'`,elements:[{name:`literal`,value:`'narrow'`},{name:`literal`,value:`'default'`},{name:`literal`,value:`'wide'`}]},{name:`undefined`}]},description:"Panel width: `narrow` for a list of links, `wide` for a form or a detail. On phones the panel is the window width minus `edgeGutter`.",defaultValue:{value:`'default'`,computed:!1}},persistent:{required:!1,tsType:{name:`union`,raw:`SidePanelPersistent | undefined`,elements:[{name:`union`,raw:`'never' | 'content' | 'page'`,elements:[{name:`literal`,value:`'never'`},{name:`literal`,value:`'content'`},{name:`literal`,value:`'page'`}]},{name:`undefined`}]},description:"Above this window width the panel is a fixed sidebar instead of an overlay: always visible, no scrim, no trap, no close button, trigger hidden. `content` switches at `layout.maxWidth.content`, `page` at `layout.maxWidth.page`; a width exactly at the token is still the overlay.",defaultValue:{value:`'never'`,computed:!1}},role:{required:!1,tsType:{name:`union`,raw:`SidePanelRole | undefined`,elements:[{name:`union`,raw:`'complementary' | 'navigation'`,elements:[{name:`literal`,value:`'complementary'`},{name:`literal`,value:`'navigation'`}]},{name:`undefined`}]},description:"The role the persistent sidebar carries: `navigation` for a menu of Links, `complementary` for filters, a cart, a detail. The overlay presentations expose no region role, only their label.",defaultValue:{value:`'complementary'`,computed:!1}},modal:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"`false` (default, the disclosure pattern): focus stays on the trigger when it opens. `true`: a modal panel — always a scrim, screen readers confined with `accessibilityViewIsModal`.",defaultValue:{value:`false`,computed:!1}},scrim:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Show the scrim in non-modal mode too (modal always has one).`,defaultValue:{value:`true`,computed:!1}},dismissible:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"The back button (Escape), the close button, a scrim tap and the swipe all request close. When false, the close button is not rendered and the scrim tap and swipe do nothing; the back button still reports `onOpenChange(false, 'escape')` without closing an uncontrolled panel.",defaultValue:{value:`true`,computed:!1}},swipeable:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"A swipe on the header (not the close button) toward the edge dismisses. Purely additive. Edge-swipe-to-open is `useSidePanelEdgeSwipe`, which needs a controlled `open`.",defaultValue:{value:`true`,computed:!1}},onOpenChange:{required:!1,tsType:{name:`union`,raw:`((open: boolean, reason: SidePanelCloseReason) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired after the panel opens or closes, with the new state and a reason.`},overrides:{required:!1,tsType:{name:`union`,raw:`Partial<Record<SidePanelOverridableBinding, TokenRef | undefined>> | undefined`,elements:[{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'scrim'
| 'shadow'
| 'border'
| 'borderWidth'
| 'width'
| 'widthNarrow'
| 'widthWide'
| 'edgeGutter'
| 'inset'
| 'headerGap'
| 'partGap'
| 'footerGap'
| 'layer'
| 'enter'
| 'exit'`,elements:[{name:`literal`,value:`'scrim'`},{name:`literal`,value:`'shadow'`},{name:`literal`,value:`'border'`},{name:`literal`,value:`'borderWidth'`},{name:`literal`,value:`'width'`},{name:`literal`,value:`'widthNarrow'`},{name:`literal`,value:`'widthWide'`},{name:`literal`,value:`'edgeGutter'`},{name:`literal`,value:`'inset'`},{name:`literal`,value:`'headerGap'`},{name:`literal`,value:`'partGap'`},{name:`literal`,value:`'footerGap'`},{name:`literal`,value:`'layer'`},{name:`literal`,value:`'enter'`},{name:`literal`,value:`'exit'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<SidePanelOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<SidePanelOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:"Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop."},ref:{required:!1,tsType:{name:`union`,raw:`React.Ref<ViewInstance> | undefined`,elements:[{name:`ReactRef`,raw:`React.Ref<ViewInstance>`,elements:[{name:`ViewInstance`}]},{name:`undefined`}]},description:`The positioned surface: the sliding panel view in overlay mode, the sidebar view when persistent. Null while the overlay is closed.`}}}})))()}function Re(e){let[t,n]=D.useState(e.open);return D.useEffect(()=>n(e.open),[e.open]),(0,O.jsx)(w,{...e,open:t,onOpenChange:(r,i)=>{t!==void 0&&n(r),e.onOpenChange?.(r,i)}})}function ze(){let{tokens:e}=_e();return(0,O.jsx)(_,{label:`Menu`,variant:`ghost`,iconOnly:!0,leadingIcon:(0,O.jsx)(pe,{name:`menu`,color:e.colorActionGhostForeground})})}var D,O,k,A,j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,Be;function $(){return($=e((()=>{D=t(n(),1),we(),Oe(),x(),g(),se(),Le(),y(),re(),Se(),l(),O=ye(),k={title:`SidePanel/React Native`,component:w,decorators:[ne()],render:e=>(0,O.jsx)(Re,{...e}),args:{open:!0,heading:`Menu`,children:(0,O.jsxs)(b,{gap:`tight`,align:`start`,children:[(0,O.jsx)(f,{href:`#`,label:`Home`}),(0,O.jsx)(f,{href:`#`,label:`Products`}),(0,O.jsx)(f,{href:`#`,label:`About`})]}),side:`start`,width:`default`,persistent:`never`,role:`complementary`,modal:!1,scrim:!0,dismissible:!0,swipeable:!0}},A={},j={args:{side:`start`}},M={args:{side:`end`,heading:`Your cart`,children:(0,O.jsx)(c,{children:`Cart contents go here.`})}},N={args:{width:`narrow`}},P={args:{width:`default`}},F={args:{width:`wide`,heading:`Filters`,children:(0,O.jsx)(c,{children:`A wider panel for a form of filters.`})}},I={args:{persistent:`never`}},L={args:{persistent:`content`}},R={args:{persistent:`page`}},z={args:{role:`complementary`}},B={args:{role:`navigation`}},V={args:{modal:!0}},H={args:{scrim:!1}},U={args:{dismissible:!1}},W={args:{swipeable:!1}},G={args:{heading:`Menu`,hideHeading:!0}},K={args:{heading:`Filters`,children:(0,O.jsx)(c,{children:`Narrow results by price, distance and rating.`}),footer:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(_,{label:`Apply`,variant:`primary`}),(0,O.jsx)(_,{label:`Clear`,variant:`secondary`})]})}},q={args:{overrides:{width:`layout.maxWidth.content`,scrim:`color.overlay.scrim`}}},J={args:{open:void 0,trigger:(0,O.jsx)(ze,{}),heading:`Menu`,children:(0,O.jsxs)(b,{gap:`tight`,align:`start`,children:[(0,O.jsx)(f,{href:`#`,label:`Home`}),(0,O.jsx)(f,{href:`#`,label:`Products`}),(0,O.jsx)(f,{href:`#`,label:`About`})]}),hideHeading:!0,role:`navigation`,persistent:`content`}},Y={args:{open:void 0,trigger:(0,O.jsx)(_,{label:`Filters`,variant:`secondary`}),heading:`Filters`,children:(0,O.jsxs)(b,{gap:`normal`,children:[(0,O.jsx)(S,{name:`inStock`,label:`In stock`}),(0,O.jsx)(S,{name:`freeShipping`,label:`Free shipping`})]}),footer:(0,O.jsxs)(O.Fragment,{children:[(0,O.jsx)(_,{label:`Clear`,variant:`secondary`}),(0,O.jsx)(_,{label:`Apply`,variant:`primary`})]}),width:`wide`}},X={args:{open:!0,heading:`Your cart`,children:(0,O.jsxs)(b,{gap:`normal`,children:[(0,O.jsx)(C,{heading:`Desk lamp`,children:(0,O.jsx)(c,{children:`1 × $48.00`})}),(0,O.jsx)(C,{heading:`Notebook`,children:(0,O.jsx)(c,{children:`2 × $12.00`})})]}),footer:(0,O.jsx)(_,{label:`Checkout`,variant:`primary`}),side:`end`,modal:!0}},Z={args:{open:!0,heading:`Order details`,children:(0,O.jsxs)(b,{gap:`tight`,children:[(0,O.jsx)(c,{children:`Order: 10482`}),(0,O.jsx)(c,{children:`Status: Shipped`}),(0,O.jsx)(c,{children:`Total: $72.00`})]}),side:`end`,width:`narrow`,scrim:!1}},Q={render:e=>{function t(){let[t,n]=D.useState(!0);return(0,O.jsx)(w,{...e,trigger:(0,O.jsx)(_,{label:`Menu`,variant:`secondary`}),open:t,onOpenChange:e=>n(e),children:(0,O.jsxs)(b,{gap:`tight`,align:`start`,children:[(0,O.jsx)(f,{href:`#`,label:`Home`}),(0,O.jsx)(f,{href:`#`,label:`Products`}),(0,O.jsx)(_,{label:`Sign out`,variant:`secondary`,onPress:()=>n(!1)})]})})}return(0,O.jsx)(t,{})}},Be=[`Default`,`SideStart`,`SideEnd`,`WidthNarrow`,`WidthDefault`,`WidthWide`,`PersistentNever`,`PersistentContent`,`PersistentPage`,`RoleComplementary`,`RoleNavigation`,`Modal`,`NoScrim`,`NotDismissible`,`NotSwipeable`,`HideHeading`,`WithFooter`,`WithOverrides`,`NavigationDrawer`,`Filters`,`Cart`,`DetailPanel`,`Keyboard`],A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{}`,...A.parameters?.docs?.source}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    side: 'start'
  }
}`,...j.parameters?.docs?.source}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    side: 'end',
    heading: 'Your cart',
    children: <Text>Cart contents go here.</Text>
  }
}`,...M.parameters?.docs?.source}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    width: 'narrow'
  }
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    width: 'default'
  }
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    width: 'wide',
    heading: 'Filters',
    children: <Text>A wider panel for a form of filters.</Text>
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    persistent: 'never'
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    persistent: 'content'
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    persistent: 'page'
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    role: 'complementary'
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    role: 'navigation'
  }
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    modal: true
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    scrim: false
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    dismissible: false
  }
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    swipeable: false
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  args: {
    heading: 'Menu',
    hideHeading: true
  }
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  args: {
    heading: 'Filters',
    children: <Text>Narrow results by price, distance and rating.</Text>,
    footer: <>\r
        <Button label="Apply" variant="primary" />\r
        <Button label="Clear" variant="secondary" />\r
      </>
  }
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  args: {
    overrides: {
      width: 'layout.maxWidth.content',
      scrim: 'color.overlay.scrim'
    }
  }
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  args: {
    open: undefined,
    trigger: <MenuTrigger />,
    heading: 'Menu',
    children: <Stack gap="tight" align="start">\r
        <Link href="#" label="Home" />\r
        <Link href="#" label="Products" />\r
        <Link href="#" label="About" />\r
      </Stack>,
    hideHeading: true,
    role: 'navigation',
    persistent: 'content'
  }
}`,...J.parameters?.docs?.source},description:{story:`The phone hamburger menu that becomes the permanent sidebar on desktop, with a self-explanatory list.`,...J.parameters?.docs?.description}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  args: {
    open: undefined,
    trigger: <Button label="Filters" variant="secondary" />,
    heading: 'Filters',
    children: <Stack gap="normal">\r
        <Checkbox name="inStock" label="In stock" />\r
        <Checkbox name="freeShipping" label="Free shipping" />\r
      </Stack>,
    footer: <>\r
        <Button label="Clear" variant="secondary" />\r
        <Button label="Apply" variant="primary" />\r
      </>,
    width: 'wide'
  }
}`,...Y.parameters?.docs?.source},description:{story:`A wide filter panel beside a results page, ending in an action row.`,...Y.parameters?.docs?.description}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Your cart',
    children: <Stack gap="normal">\r
        <Card heading="Desk lamp">\r
          <Text>1 × $48.00</Text>\r
        </Card>\r
        <Card heading="Notebook">\r
          <Text>2 × $12.00</Text>\r
        </Card>\r
      </Stack>,
    footer: <Button label="Checkout" variant="primary" />,
    side: 'end',
    modal: true
  }
}`,...X.parameters?.docs?.source},description:{story:`A checkout panel from the end edge that must be finished or dismissed, so it is modal.`,...X.parameters?.docs?.description}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    heading: 'Order details',
    children: <Stack gap="tight">\r
        <Text>Order: 10482</Text>\r
        <Text>Status: Shipped</Text>\r
        <Text>Total: $72.00</Text>\r
      </Stack>,
    side: 'end',
    width: 'narrow',
    scrim: false
  }
}`,...Z.parameters?.docs?.source},description:{story:`A narrow detail panel that should feel like part of the page, so it has no scrim.`,...Z.parameters?.docs?.description}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  render: args => {
    function Open(): React.JSX.Element {
      const [open, setOpen] = React.useState(true);
      return <SidePanel {...args} trigger={<Button label="Menu" variant="secondary" />} open={open} onOpenChange={next => setOpen(next)}>\r
          <Stack gap="tight" align="start">\r
            <Link href="#" label="Home" />\r
            <Link href="#" label="Products" />\r
            <Button label="Sign out" variant="secondary" onPress={() => setOpen(false)} />\r
          </Stack>\r
        </SidePanel>;
    }
    return <Open />;
  }
}`,...Q.parameters?.docs?.source},description:{story:`Open with its trigger and three focusable children, for the axe gate and manual keyboard checks.`,...Q.parameters?.docs?.description}}}})))()}$();export{X as Cart,A as Default,Z as DetailPanel,Y as Filters,G as HideHeading,Q as Keyboard,V as Modal,J as NavigationDrawer,H as NoScrim,U as NotDismissible,W as NotSwipeable,L as PersistentContent,I as PersistentNever,R as PersistentPage,z as RoleComplementary,B as RoleNavigation,M as SideEnd,j as SideStart,P as WidthDefault,N as WidthNarrow,F as WidthWide,K as WithFooter,q as WithOverrides,Be as __namedExportsOrder,k as default};