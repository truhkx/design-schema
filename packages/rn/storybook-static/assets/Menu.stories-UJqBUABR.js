import{n as e,o as t}from"./rolldown-runtime-C0FnF6B9.js";import{t as n}from"./react-DiVRNtpo.js";import{X as r,Z as i,c as a,d as o,f as s,h as c,l,m as u,n as d,p as f,t as p,u as m}from"./decorators-Dl4455ZU.js";import{d as ee,f as h}from"./FlatList-B--84B_m.js";import{n as g,t as _}from"./Animated-75prr5wJ.js";import{n as v,t as te}from"./Pressable-CjGHHyHY.js";import{n as y,t as ne}from"./Modal-DsdNBXp0.js";import{n as b,t as re}from"./Icon-sSovLWRe.js";import{n as ie,t as x}from"./useWindowDimensions-oJibnkug.js";import{t as ae}from"./react-native-web-CvoPEK_w.js";import{a as oe,c as se,i as ce,l as S,m as C,o as w,p as le,r as T,s as ue}from"./iframe-CAToN8Eb.js";import{n as de,t as fe}from"./Button-B0Tk0pjd.js";import{n as pe,t as me}from"./ActionSheet-BqSruQyK.js";function E(e){let t=[];for(let n of e)`separator`in n||(`group`in n?t.push(...E(n.items)):t.push(n));return t}function he(e){return E(e).map(e=>({id:e.id,label:e.label,icon:e.icon,tone:e.tone,disabled:e.disabled}))}function ge(e){return e===`escape`?`escape`:`outside`}function _e(e,t,n,r,i,a){let[o,s]=r.split(`-`),c=o,l=i.height-(e.y+e.height),u=e.y;c===`bottom`&&l<n+a&&u>l?c=`top`:c===`top`&&u<n+a&&l>u&&(c=`bottom`);let d=m.isRTL?s===`end`:s===`start`,f=i.width-e.x,p=e.x+e.width;return d&&f<t&&p>=t?d=!1:!d&&p<t&&f>=t&&(d=!0),{top:c===`bottom`?e.y+e.height+a:e.y-a-n,left:d?e.x:e.x+e.width-t,side:c}}function D({label:e,items:t,triggerVariant:n=`ghost`,triggerIcon:r=`chevron-down`,iconOnly:a=!1,placement:o=`bottom-start`,open:c,anchor:d,onAction:f,onOpenChange:p,overrides:m}){let{tokens:h}=se(),g=ue(),v=ie(),y=v.width<=h.layoutMaxWidthProse,b=O.useRef(null),x=O.useRef(new Map),S=O.useRef(!1),C=O.useRef(t);C.current=t;let T=c!==void 0,[de,pe]=O.useState(!1),D=T?c:de,[A,j]=O.useState(null),[M,N]=O.useState(null),P=O.useRef(new _.Value(0)).current,F=m?.border?l(h,m.border):h.colorBorder,I=m?.borderWidth?l(h,m.borderWidth):h.borderWidthThin,L=m?.shadow?l(h,m.shadow):h.shadowOverlay,R=m?.radius?l(h,m.radius):h.radiusMd,z=m?.popupPadding?l(h,m.popupPadding):h.space1,B=m?.popupOffset?l(h,m.popupOffset):h.space1,V=m?.maxHeight?l(h,m.maxHeight):h.layoutMaxWidthProse,H=m?.minWidth?l(h,m.minWidth):h.space20*2.5,U=m?.itemPaddingBlock?l(h,m.itemPaddingBlock):h.spaceSm,W=m?.itemPaddingInline?l(h,m.itemPaddingInline):h.spaceMd,G=m?.itemGap?l(h,m.itemGap):h.layoutGapNormal,K=m?.itemRadius?l(h,m.itemRadius):h.radiusSm,q=m?.groupLabelSize?l(h,m.groupLabelSize):h.fontSizeXs,J=m?.groupLabelWeight?l(h,m.groupLabelWeight):h.fontWeightSemibold,Y=m?.shortcutSize?l(h,m.shortcutSize):h.fontSizeSm,X=m?.separator?l(h,m.separator):h.colorBorder,be=m?.separatorMargin?l(h,m.separatorMargin):h.space1,Z=m?.fontFamily?l(h,m.fontFamily):h.fontFamilyBody,xe=m?.fontSize?l(h,m.fontSize):h.fontSizeMd,Se=m?.lineHeight?l(h,m.lineHeight):h.fontLineHeightNormal,Ce=m?.layer?l(h,m.layer):h.layerDropdown,we=m?.enter?l(h,m.enter):h.motionDurationFast,Te=m?.enterDistance?l(h,m.enterDistance):h.space1,Ee=h.colorOverlaySurface,De=h.colorBackgroundSubtle,Oe=h.colorForeground,ke=h.colorForegroundDanger,Ae=h.colorForegroundMuted,je=h.colorForegroundMuted,Me=h.colorBorderFocus,Ne=h.borderWidthFocus,Pe=h[ye[n]],Fe=O.useRef(!1);O.useEffect(()=>{a&&r===`none`&&!Fe.current&&(Fe.current=!0,console.warn('Menu: `iconOnly` with `triggerIcon` "none" leaves the trigger with nothing visible to press.'))},[a,r]);let Ie=e=>t=>{t?x.current.set(e,t):x.current.delete(e)},Le=O.useCallback(()=>{let e=E(C.current).find(e=>e.disabled!==!0),t=e?x.current.get(e.id):void 0,n=t?ae(t):null;n!=null&&le.setAccessibilityFocus(n)},[]),Re=O.useCallback(()=>{let e=d?d.current:b.current,t=e?ae(e):null;t!=null&&le.setAccessibilityFocus(t)},[d]),ze=(e,t)=>{T||pe(e),p?.(e,t)},Q=e=>{D&&ze(!1,e)},Be=O.useRef(D);O.useEffect(()=>{Be.current&&!D&&Re(),Be.current=D},[D,Re]);let Ve=()=>{D?Q(`trigger`):ze(!0,`trigger`)},He=e=>{Q(`action`),f?.(e)},Ue=e=>{let{width:t,height:n}=e.nativeEvent.layout;N(e=>e!==null&&e.width===t&&e.height===n?e:{width:t,height:n})};O.useEffect(()=>{if(y||!D){S.current=!1,P.setValue(0),j(null),N(null);return}(d?d.current:b.current)?.measureInWindow((e,t,n,r)=>j({x:e,y:t,width:n,height:r}))},[D,y]),O.useEffect(()=>{if(y||!D||A===null||M===null||S.current)return;if(S.current=!0,g){P.setValue(1),Le();return}let e=_.timing(P,{toValue:1,duration:we,easing:ce(h.motionEasingStandard),useNativeDriver:!1});return e.start(({finished:e})=>{e&&Le()}),()=>e.stop()},[D,y,A,M,g]);let We=r===`none`?void 0:(0,k.jsx)(re,{name:r,color:Pe}),Ge=d===void 0?(0,k.jsx)(u,{ref:b,collapsable:!1,testID:`Menu.trigger`,children:(0,k.jsx)(fe,{label:e,variant:n,iconOnly:a,expanded:D,leadingIcon:a?We:void 0,trailingIcon:a?void 0:We,onPress:Ve})}):null;if(y)return(0,k.jsxs)(u,{testID:`Menu`,children:[Ge,(0,k.jsx)(me,{open:D,heading:e,actions:he(t),onAction:He,onClose:e=>Q(ge(e))})]});let Ke=A?Math.max(H,A.width):H,$=A?_e(A,Ke,M?.height??0,o,v,B):{top:0,left:0,side:o.startsWith(`top`)?`top`:`bottom`},qe=Math.max(0,Math.min(V,v.height-B*2)),Je=w(xe,Se),Ye={position:`absolute`,top:$.top,left:$.left,width:Ke,borderRadius:R,borderWidth:I,borderColor:F,backgroundColor:Ee,...L,zIndex:Ce,opacity:P,transform:[{translateY:P.interpolate({inputRange:[0,1],outputRange:[$.side===`bottom`?-Te:Te,0]})}]},Xe={padding:z},Ze={paddingHorizontal:W,paddingVertical:U,fontFamily:Z,fontSize:q,fontWeight:oe(J),lineHeight:w(q,Se),color:Ae},Qe={marginVertical:be,height:I,backgroundColor:X},$e=(e,t,n)=>({flexDirection:`row`,alignItems:`center`,gap:G,minHeight:h.sizeTargetMin,paddingVertical:U,paddingHorizontal:W,borderRadius:K,backgroundColor:e?De:`transparent`,borderWidth:Ne,borderColor:t?Me:`transparent`,opacity:n?h.opacityDisabled:1}),et=e=>({flexShrink:1,fontFamily:Z,fontSize:xe,lineHeight:Je,color:e?ke:Oe}),tt={marginStart:`auto`,fontFamily:Z,fontSize:Y,lineHeight:w(Y,Se),color:je};function nt(e,t){let n=e.tone===`danger`;return(0,k.jsx)(ve,{action:e,registerRef:Ie(e.id),rowStyle:$e,labelStyle:et(n),shortcutStyle:tt,iconColor:n?ke:Oe,onActivate:He},t)}function rt(e,t){return`separator`in e?(0,k.jsx)(u,{role:`separator`,style:Qe,testID:`Menu.separator`},t):`group`in e?(0,k.jsxs)(u,{role:`group`,accessibilityLabel:e.group,testID:`Menu.group`,children:[(0,k.jsx)(s,{style:Ze,testID:`Menu.groupLabel`,children:e.group}),e.items.map((e,n)=>`id`in e?nt(e,`${t}-${n}`):null)]},t):nt(e,t)}return(0,k.jsxs)(u,{testID:`Menu`,children:[Ge,(0,k.jsx)(ne,{visible:D,transparent:!0,animationType:`none`,onRequestClose:()=>Q(`escape`),statusBarTranslucent:!0,children:(0,k.jsxs)(u,{style:i.absoluteFill,children:[(0,k.jsx)(te,{style:i.absoluteFill,onPress:()=>Q(`outside`),accessible:!1,testID:`Menu.scrim`}),(0,k.jsx)(_.View,{style:Ye,onLayout:Ue,role:`menu`,accessibilityLabel:e,testID:`Menu.popup`,children:(0,k.jsx)(ee,{style:{maxHeight:qe},contentContainerStyle:Xe,testID:`Menu.list`,children:t.map((e,t)=>rt(e,String(t)))})})]})})]})}function ve({action:e,registerRef:t,rowStyle:n,labelStyle:r,shortcutStyle:i,iconColor:a,onActivate:o}){let[c,l]=O.useState(!1),[d,f]=O.useState(!1),p=e.disabled===!0;return(0,k.jsxs)(te,{ref:t,role:`menuitem`,accessibilityLabel:e.label,accessibilityState:{disabled:p},onPress:()=>{p||o(e.id)},onFocus:()=>l(!0),onBlur:()=>l(!1),onHoverIn:()=>f(!0),onHoverOut:()=>f(!1),style:({pressed:e})=>n(!p&&(c||e||d),c,p),testID:`Menu.item`,children:[e.icon===void 0?null:(0,k.jsx)(u,{accessibilityElementsHidden:!0,importantForAccessibility:`no`,testID:`Menu.itemIcon`,children:(0,k.jsx)(re,{name:e.icon,color:a})}),(0,k.jsx)(s,{numberOfLines:1,style:r,children:e.label}),e.shortcut===void 0?null:(0,k.jsx)(s,{style:i,accessibilityElementsHidden:!0,importantForAccessibility:`no`,testID:`Menu.itemShortcut`,children:e.shortcut})]})}var O,k,ye;function A(){return(A=e((()=>{O=t(n(),1),C(),g(),o(),y(),v(),h(),r(),f(),c(),x(),a(),pe(),de(),b(),T(),k=S(),ye={ghost:`colorActionGhostForeground`,secondary:`colorActionSecondaryForeground`,primary:`colorActionPrimaryForeground`},D.__docgenInfo={description:'Menu — hides a handful of actions behind one button so a toolbar or a row stays\nquiet. The desktop counterpart of ActionSheet: anchored to the trigger, dismissed\nby an outside tap or Escape.\n\nWhen to use: secondary actions that do not deserve their own buttons — overflow\n("More actions"), sort or view options, account menus. Group related items with a\n`group` label past about six items; separate a danger action with a `separator`.\nNot for navigation, for a value that stays selected, or for a single item.\n\nAt or below `layout.maxWidth.prose` (phones) the popup is the package\'s `ActionSheet`\nwith the items flattened: group labels, separators and shortcut hints are dropped.\nAbove it (tablets and react-native-web) a transparent `Modal` holds a\nfull-screen scrim `Pressable` and a popup `View` (`role="menu"`) positioned from the\ntrigger\'s (or `anchor`\'s) `measureInWindow()` rect, flipped on overflow via\n`useWindowDimensions()`. The list scrolls within `maxHeight`. The popup fades and\nslides `enterDistance` from the trigger side over `enter`; under reduced motion it\nappears at once. The Modal is not modal: nothing is trapped, the backdrop closes.\n\nItems are `Pressable`s with `role="menuitem"` and `accessibilityState.disabled`;\nnever the native `disabled` prop, which would drop them from the focus order — a\npress guard makes disabled items inert. Choosing an item fires\n`onOpenChange(false, \'action\')` then `onAction(id)`; an outside tap reports\n`outside`, `onRequestClose` (Escape on react-native-web, Android back) `escape`.\nEvery close returns accessibility focus to the trigger (or `anchor`). The trigger\n`Button` receives `expanded`.\n\nAcknowledged native limits: `Pressable` has no key events, so there are no arrow\nkeys, Home/End or typeahead (`typeaheadReset` has nothing to reset); each item is\nits own focus stop, and every open focuses the first enabled item.',methods:[],displayName:`Menu`,props:{label:{required:!0,tsType:{name:`string`},description:`The trigger's label and the menu's accessible name ("More actions", "Sort by").`},items:{required:!0,tsType:{name:`Array`,elements:[{name:`union`,raw:`MenuAction | MenuGroup | MenuSeparator`,elements:[{name:`signature`,type:`object`,raw:`{
  id: string;
  label: string;
  icon?: IconName | undefined;
  shortcut?: string | undefined;
  tone?: MenuItemTone | undefined;
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
| 'file'`,elements:[{name:`literal`,value:`'check'`},{name:`literal`,value:`'dash'`},{name:`literal`,value:`'chevron-right'`},{name:`literal`,value:`'chevron-down'`},{name:`literal`,value:`'chevron-up'`},{name:`literal`,value:`'chevron-left'`},{name:`literal`,value:`'close'`},{name:`literal`,value:`'plus'`},{name:`literal`,value:`'minus'`},{name:`literal`,value:`'info'`},{name:`literal`,value:`'success'`},{name:`literal`,value:`'warning'`},{name:`literal`,value:`'danger'`},{name:`literal`,value:`'external'`},{name:`literal`,value:`'ellipsis'`},{name:`literal`,value:`'search'`},{name:`literal`,value:`'arrow-right'`},{name:`literal`,value:`'arrow-left'`},{name:`literal`,value:`'calendar'`},{name:`literal`,value:`'menu'`},{name:`literal`,value:`'list'`},{name:`literal`,value:`'grid'`},{name:`literal`,value:`'play'`},{name:`literal`,value:`'pause'`},{name:`literal`,value:`'folder'`},{name:`literal`,value:`'file'`}]},{name:`undefined`}],required:!1}},{key:`shortcut`,value:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}],required:!1}},{key:`tone`,value:{name:`union`,raw:`MenuItemTone | undefined`,elements:[{name:`union`,raw:`'default' | 'danger'`,elements:[{name:`literal`,value:`'default'`},{name:`literal`,value:`'danger'`}]},{name:`undefined`}],required:!1}},{key:`disabled`,value:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}],required:!1}}]}},{name:`signature`,type:`object`,raw:`{ group: string; items: MenuItem[] }`,signature:{properties:[{key:`group`,value:{name:`string`,required:!0}},{key:`items`,value:{name:`Array`,elements:[{name:`MenuItem`}],raw:`MenuItem[]`,required:!0}}]}},{name:`signature`,type:`object`,raw:`{ separator: true }`,signature:{properties:[{key:`separator`,value:{name:`literal`,value:`true`,required:!0}}]}}]}],raw:`MenuItem[]`},description:`Actions, optionally grouped with a label or divided by separators. Groups render their label as a non-interactive heading row and hold action items only.`},triggerVariant:{required:!1,tsType:{name:`union`,raw:`MenuTriggerVariant | undefined`,elements:[{name:`Extract`,elements:[{name:`union`,raw:`'primary' | 'secondary' | 'ghost' | 'danger'`,elements:[{name:`literal`,value:`'primary'`},{name:`literal`,value:`'secondary'`},{name:`literal`,value:`'ghost'`},{name:`literal`,value:`'danger'`}]},{name:`union`,raw:`'ghost' | 'secondary' | 'primary'`,elements:[{name:`literal`,value:`'ghost'`},{name:`literal`,value:`'secondary'`},{name:`literal`,value:`'primary'`}]}],raw:`Extract<ButtonVariant, 'ghost' | 'secondary' | 'primary'>`},{name:`undefined`}]},description:`Variant of the trigger Button.`,defaultValue:{value:`'ghost'`,computed:!1}},triggerIcon:{required:!1,tsType:{name:`union`,raw:`MenuTriggerIcon | undefined`,elements:[{name:`union`,raw:`'ellipsis' | 'chevron-down' | 'none'`,elements:[{name:`literal`,value:`'ellipsis'`},{name:`literal`,value:`'chevron-down'`},{name:`literal`,value:`'none'`}]},{name:`undefined`}]},description:"Trailing icon on the trigger: `ellipsis` for an icon-only overflow button (the label becomes the accessible name), `chevron-down` for a labelled dropdown, `none`.",defaultValue:{value:`'chevron-down'`,computed:!1}},iconOnly:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"Render the trigger as an icon-only Button using `triggerIcon`; `label` is still required. With `triggerIcon: none` this warns in development.",defaultValue:{value:`false`,computed:!1}},placement:{required:!1,tsType:{name:`union`,raw:`MenuPlacement | undefined`,elements:[{name:`union`,raw:`'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'`,elements:[{name:`literal`,value:`'bottom-start'`},{name:`literal`,value:`'bottom-end'`},{name:`literal`,value:`'top-start'`},{name:`literal`,value:`'top-end'`}]},{name:`undefined`}]},description:`Preferred position of the popup relative to the trigger; flips automatically when it would overflow the viewport.`,defaultValue:{value:`'bottom-start'`,computed:!1}},open:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"Controlled open state (the parent flips it from onOpenChange). Omit for an uncontrolled menu, which starts closed. A controlled menu hides, and returns focus to the trigger, only when `open` becomes false."},anchor:{required:!1,tsType:{name:`union`,raw:`React.RefObject<React.ComponentRef<typeof View> | null> | undefined`,elements:[{name:`ReactRefObject`,raw:`React.RefObject<React.ComponentRef<typeof View> | null>`,elements:[{name:`union`,raw:`React.ComponentRef<typeof View> | null`,elements:[{name:`ReactComponentRef`,raw:`React.ComponentRef<typeof View>`,elements:[{name:`View`}]},{name:`null`}]}]},{name:`undefined`}]},description:"Position the popup relative to this element instead of rendering a trigger; the trigger part is omitted and `open` must be controlled. Measured with measureInWindow()."},onAction:{required:!1,tsType:{name:`union`,raw:`((id: string) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"An item was chosen; receives its `id`. The menu closes itself first."},onOpenChange:{required:!1,tsType:{name:`union`,raw:`((open: boolean, reason: MenuOpenChangeReason) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired when the menu opens or closes, with the new state and why.`},overrides:{required:!1,tsType:{name:`union`,raw:`Partial<Record<MenuOverridableBinding, TokenRef | undefined>> | undefined`,elements:[{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'border'
| 'borderWidth'
| 'shadow'
| 'radius'
| 'popupPadding'
| 'popupOffset'
| 'typeaheadReset'
| 'maxHeight'
| 'minWidth'
| 'itemPaddingBlock'
| 'itemPaddingInline'
| 'itemGap'
| 'itemRadius'
| 'groupLabelSize'
| 'groupLabelWeight'
| 'shortcutSize'
| 'separator'
| 'separatorMargin'
| 'fontFamily'
| 'fontSize'
| 'lineHeight'
| 'layer'
| 'enter'
| 'enterDistance'`,elements:[{name:`literal`,value:`'border'`},{name:`literal`,value:`'borderWidth'`},{name:`literal`,value:`'shadow'`},{name:`literal`,value:`'radius'`},{name:`literal`,value:`'popupPadding'`},{name:`literal`,value:`'popupOffset'`},{name:`literal`,value:`'typeaheadReset'`},{name:`literal`,value:`'maxHeight'`},{name:`literal`,value:`'minWidth'`},{name:`literal`,value:`'itemPaddingBlock'`},{name:`literal`,value:`'itemPaddingInline'`},{name:`literal`,value:`'itemGap'`},{name:`literal`,value:`'itemRadius'`},{name:`literal`,value:`'groupLabelSize'`},{name:`literal`,value:`'groupLabelWeight'`},{name:`literal`,value:`'shortcutSize'`},{name:`literal`,value:`'separator'`},{name:`literal`,value:`'separatorMargin'`},{name:`literal`,value:`'fontFamily'`},{name:`literal`,value:`'fontSize'`},{name:`literal`,value:`'lineHeight'`},{name:`literal`,value:`'layer'`},{name:`literal`,value:`'enter'`},{name:`literal`,value:`'enterDistance'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<MenuOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<MenuOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:"Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop."}}}})))()}var j,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,be;function Z(){return(Z=e((()=>{j=t(n(),1),A(),p(),M=S(),N={title:`Menu/React Native`,component:D,decorators:[d({fit:!0})],args:{label:`More actions`,items:[{id:`open`,label:`Open`,icon:`external`},{id:`rename`,label:`Rename`,shortcut:`Ctrl+R`},{id:`duplicate`,label:`Duplicate`},{group:`Sort by`,items:[{id:`sort-name`,label:`Name`},{id:`sort-date`,label:`Date modified`}]},{separator:!0},{id:`archive`,label:`Archive`,disabled:!0},{id:`delete`,label:`Delete`,tone:`danger`}]}},P={},F={args:{triggerVariant:`ghost`}},I={args:{triggerVariant:`secondary`}},L={args:{triggerVariant:`primary`}},R={args:{triggerIcon:`ellipsis`}},z={args:{triggerIcon:`chevron-down`}},B={args:{triggerIcon:`none`}},V={args:{placement:`bottom-start`}},H={args:{placement:`bottom-end`}},U={args:{placement:`top-start`}},W={args:{placement:`top-end`}},G={args:{label:`More actions`,iconOnly:!0,triggerIcon:`ellipsis`,items:[{id:`rename`,label:`Rename`},{id:`duplicate`,label:`Duplicate`},{separator:!0},{id:`delete`,label:`Delete file`,tone:`danger`}]}},K={args:{label:`Sort by`,triggerVariant:`secondary`,triggerIcon:`chevron-down`,items:[{id:`name`,label:`Name`},{id:`modified`,label:`Last modified`},{id:`size`,label:`Size`}]}},q={args:{label:`Account`,placement:`bottom-end`,items:[{group:`Account`,items:[{id:`profile`,label:`Profile`},{id:`billing`,label:`Billing`}]},{group:`Workspace`,items:[{id:`members`,label:`Members`},{id:`settings`,label:`Settings`}]},{separator:!0},{id:`sign-out`,label:`Sign out`}]}},J={args:{label:`Edit`,items:[{id:`undo`,label:`Undo`,shortcut:`Ctrl+Z`},{id:`redo`,label:`Redo`,shortcut:`Ctrl+Shift+Z`}]}},Y={args:{overrides:{radius:`radius.lg`,border:`color.border.strong`}}},X={render:e=>{function t(){let[t,n]=j.useState(!0);return(0,M.jsx)(D,{...e,open:t,onOpenChange:e=>n(e)})}return(0,M.jsx)(t,{})}},be=[`Default`,`TriggerVariantGhost`,`TriggerVariantSecondary`,`TriggerVariantPrimary`,`TriggerIconEllipsis`,`TriggerIconChevronDown`,`TriggerIconNone`,`PlacementBottomStart`,`PlacementBottomEnd`,`PlacementTopStart`,`PlacementTopEnd`,`RowOverflow`,`SortBy`,`GroupedAccountMenu`,`WithShortcuts`,`WithOverrides`,`Keyboard`],P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    triggerVariant: 'ghost'
  }
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    triggerVariant: 'secondary'
  }
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    triggerVariant: 'primary'
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    triggerIcon: 'ellipsis'
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    triggerIcon: 'chevron-down'
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    triggerIcon: 'none'
  }
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'bottom-start'
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'bottom-end'
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'top-start'
  }
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'top-end'
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'More actions',
    iconOnly: true,
    triggerIcon: 'ellipsis',
    items: [{
      id: 'rename',
      label: 'Rename'
    }, {
      id: 'duplicate',
      label: 'Duplicate'
    }, {
      separator: true
    }, {
      id: 'delete',
      label: 'Delete file',
      tone: 'danger'
    }]
  }
}`,...G.parameters?.docs?.source},description:{story:`The icon-only overflow button on a row, with the destructive action last after a separator.`,...G.parameters?.docs?.description}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Sort by',
    triggerVariant: 'secondary',
    triggerIcon: 'chevron-down',
    items: [{
      id: 'name',
      label: 'Name'
    }, {
      id: 'modified',
      label: 'Last modified'
    }, {
      id: 'size',
      label: 'Size'
    }]
  }
}`,...K.parameters?.docs?.source},description:{story:`A labelled dropdown of view options, anchored under a secondary trigger.`,...K.parameters?.docs?.description}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Account',
    placement: 'bottom-end',
    items: [{
      group: 'Account',
      items: [{
        id: 'profile',
        label: 'Profile'
      }, {
        id: 'billing',
        label: 'Billing'
      }]
    }, {
      group: 'Workspace',
      items: [{
        id: 'members',
        label: 'Members'
      }, {
        id: 'settings',
        label: 'Settings'
      }]
    }, {
      separator: true
    }, {
      id: 'sign-out',
      label: 'Sign out'
    }]
  }
}`,...q.parameters?.docs?.source},description:{story:`More than about six items, so they are grouped with labels; aligned to the end of the trigger.`,...q.parameters?.docs?.description}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Edit',
    items: [{
      id: 'undo',
      label: 'Undo',
      shortcut: 'Ctrl+Z'
    }, {
      id: 'redo',
      label: 'Redo',
      shortcut: 'Ctrl+Shift+Z'
    }]
  }
}`,...J.parameters?.docs?.source},description:{story:`Display-only shortcut hints beside the items the app binds elsewhere.`,...J.parameters?.docs?.description}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  args: {
    overrides: {
      radius: 'radius.lg',
      border: 'color.border.strong'
    }
  }
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  render: args => {
    function Open(): React.JSX.Element {
      const [open, setOpen] = React.useState(true);
      return <Menu {...args} open={open} onOpenChange={next => setOpen(next)} />;
    }
    return <Open />;
  }
}`,...X.parameters?.docs?.source},description:{story:"Open with its trigger and several focusable items, for the axe gate and manual keyboard\r\nchecks. A wrapper owns `open`, starting true, and writes onOpenChange back.",...X.parameters?.docs?.description}}}})))()}Z();export{P as Default,q as GroupedAccountMenu,X as Keyboard,H as PlacementBottomEnd,V as PlacementBottomStart,W as PlacementTopEnd,U as PlacementTopStart,G as RowOverflow,K as SortBy,z as TriggerIconChevronDown,R as TriggerIconEllipsis,B as TriggerIconNone,F as TriggerVariantGhost,L as TriggerVariantPrimary,I as TriggerVariantSecondary,Y as WithOverrides,J as WithShortcuts,be as __namedExportsOrder,N as default};