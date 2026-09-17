import{n as e,o as t}from"./rolldown-runtime-C0FnF6B9.js";import{t as n}from"./react-DiVRNtpo.js";import{X as r,Z as i,c as a,d as o,h as s,l as c,m as l,n as u,o as d,r as f,t as ee,u as p}from"./decorators-Dl4455ZU.js";import{n as m,t as te}from"./Animated-75prr5wJ.js";import{n as h,r as g}from"./Link-Bw8MWX3a.js";import{n as _,t as ne}from"./Pressable-CjGHHyHY.js";import{n as v,t as re}from"./BottomSheet-CVGOiIhz.js";import{n as ie,t as ae}from"./Modal-DsdNBXp0.js";import{n as y,t as oe}from"./Icon-sSovLWRe.js";import{n as se,t as ce}from"./useWindowDimensions-oJibnkug.js";import{t as le}from"./react-native-web-CvoPEK_w.js";import{c as ue,i as de,l as fe,m as pe,p as me,r as b,s as he}from"./iframe-CAToN8Eb.js";import{n as ge,t as x}from"./Button-B0Tk0pjd.js";import{n as S,t as _e}from"./Heading-BHboSapN.js";import{n as ve,t as C}from"./Stack-l7fs4Elr.js";import{n as ye,t as w}from"./Input-DDaWoxHS.js";import{n as be,t as T}from"./Form-C8YSKIO1.js";import{n as xe,t as Se}from"./Box-Cboob0HJ.js";import{n as Ce,t as E}from"./Checkbox--8cawqnp.js";import{n as we,t as Te}from"./FocusScope-DoyDPQFh.js";function Ee(e,t,n){return Math.min(Math.max(e,t),Math.max(t,n))}function De(e,t,n,r,i,a){let o=p.isRTL;if(r===`start`||r===`end`){let s=o?r===`end`:r===`start`,c=e.x,l=i.width-(e.x+e.width);s&&c<t+a&&l>c?s=!1:!s&&l<t+a&&c>l&&(s=!0);let u=Ee(s?e.x-a-t:e.x+e.width+a,a,i.width-t-a);return{top:Ee(e.y+e.height/2-n/2,a,i.height-n-a),left:u,edge:s?`right`:`left`}}let[s,c]=r.split(`-`),l=s,u=i.height-(e.y+e.height),d=e.y;l===`bottom`&&u<n+a&&d>u?l=`top`:l===`top`&&d<n+a&&u>d&&(l=`bottom`);let f;return f=c===void 0?e.x+e.width/2-t/2:(o?c===`end`:c===`start`)?e.x:e.x+e.width-t,f=Ee(f,a,i.width-t-a),{top:l===`bottom`?e.y+e.height+a:e.y-a-n,left:f,edge:l===`bottom`?`top`:`bottom`}}function D({trigger:e,children:t,heading:n,headingLevel:r=`3`,open:i,placement:a=`bottom`,modal:o=!1,showArrow:s=!1,dismissible:u=!0,onOpenChange:d,overrides:f,ref:ee}){let{tokens:p}=ue(),m=he(),h=se(),g=h.width<=p.layoutMaxWidthProse,_=O.useRef(null),v=O.useRef(null),ie=O.useRef(!1),y=O.useRef(null),ce=i!==void 0,[fe,pe]=O.useState(!1),b=ce?i:fe,ge=O.useRef(b),[S,ve]=O.useState(b),[C,ye]=O.useState(null),[w,be]=O.useState(null),T=O.useRef(new te.Value(0)).current,xe=f?.border?c(p,f.border):p.colorBorder,Ce=f?.borderWidth?c(p,f.borderWidth):p.borderWidthThin,E=f?.shadow?c(p,f.shadow):p.shadowOverlay,we=f?.radius?c(p,f.radius):p.radiusMd,Ee=f?.inset?c(p,f.inset):p.layoutInsetMd,D=f?.partGap?c(p,f.partGap):p.layoutGapNormal,Ne=f?.offset?c(p,f.offset):p.space2,A=f?.arrowSize?c(p,f.arrowSize):p.space2,Pe=f?.maxWidth?c(p,f.maxWidth):p.layoutMaxWidthProse,Fe=f?.layer?c(p,f.layer):p.layerDropdown,Ie=f?.enter?c(p,f.enter):p.motionDurationFast,j=f?.enterDistance?c(p,f.enterDistance):p.space1,Le=f?.exit?c(p,f.exit):p.motionDurationFast,M=p.colorOverlaySurface,N=e.props,P=typeof N.accessibleName==`string`?N.accessibleName:typeof N.label==`string`?N.label:void 0,F=n??P;O.useEffect(()=>{F===void 0&&console.warn("Popover: without `heading`, the trigger needs an `accessibleName` or a string `label` to name the panel; the panel has no accessible name.")},[F]);let I=O.useCallback(e=>{let t=e?le(e):null;t!=null&&me.setAccessibilityFocus(t)},[]);O.useEffect(()=>{if(ge.current&&!b){let e=y.current;y.current=null,e!==null&&je.has(e)&&I(_.current)}ge.current=b},[b,I]);let L=(e,t)=>{y.current=e?null:t,ce||pe(e),d?.(e,t)},R=e=>{b&&L(!1,e)},z=(...e)=>{N.onPress?.(...e),b?R(`trigger`):L(!0,`trigger`)},B=e=>{let{width:t,height:n}=e.nativeEvent.layout;be(e=>e!==null&&e.width===t&&e.height===n?e:{width:t,height:n})};O.useEffect(()=>{if(g||!b){ie.current=!1;return}ve(!0),_.current?.measureInWindow((e,t,n,r)=>ye({x:e,y:t,width:n,height:r}))},[b,g]),O.useEffect(()=>{if(g||!S)return;if(b){if(C===null||w===null||ie.current)return;if(ie.current=!0,m){T.setValue(1),I(v.current);return}let e=te.timing(T,{toValue:1,duration:Ie,easing:de(p.motionEasingStandard),useNativeDriver:!1});return e.start(({finished:e})=>{e&&I(v.current)}),()=>e.stop()}let e=()=>{ve(!1),ye(null),be(null)};if(m){T.setValue(0),e();return}let t=te.timing(T,{toValue:0,duration:Le,easing:de(p.motionEasingExit),useNativeDriver:!1});return t.start(({finished:t})=>{t&&e()}),()=>t.stop()},[b,g,S,C,w,m]);let V=O.cloneElement(e,{onPress:z,expanded:b}),H=(0,k.jsx)(l,{ref:_,collapsable:!1,testID:`Popover.trigger`,children:V});if(g){let e={};for(let t of ke)f?.[t]&&(e[t]=f[t]);return(0,k.jsxs)(l,{ref:ee,testID:`Popover`,children:[H,(0,k.jsx)(re,{open:b,heading:F??``,height:`content`,onClose:e=>R(Ae[e]),overrides:e,children:t})]})}let U=C===null?null:De(C,w?.width??Pe,w?.height??0,a,h,Ne),W=U?.edge??`top`,G=W===`top`||W===`left`?-j:j,K=T.interpolate({inputRange:[0,1],outputRange:[G,0]}),q={position:`absolute`,top:U?.top??0,left:U?.left??0,maxWidth:Pe,zIndex:Fe,borderRadius:we,...E,opacity:T,transform:W===`left`||W===`right`?[{translateX:K}]:[{translateY:K}]},J={borderRadius:we,borderWidth:Ce,borderColor:xe,backgroundColor:M,padding:Ee,gap:D,overflow:`hidden`},Y={flexDirection:`row`,alignItems:`flex-start`,justifyContent:`flex-end`,gap:D},X=e=>(e??A*2)/2-A/2,Z={position:`absolute`,width:A,height:A,backgroundColor:M,borderWidth:Ce,borderColor:xe,transform:[{rotate:`45deg`}],...W===`top`?{top:-A/2,left:X(w?.width)}:W===`bottom`?{bottom:-A/2,left:X(w?.width)}:W===`left`?{left:-A/2,top:X(w?.height)}:{right:-A/2,top:X(w?.height)}};return(0,k.jsxs)(l,{ref:ee,testID:`Popover`,children:[H,(0,k.jsx)(ae,{visible:S,transparent:!0,animationType:`none`,onRequestClose:()=>R(`escape`),statusBarTranslucent:!0,children:(0,k.jsxs)(l,{style:Me.host,children:[(0,k.jsx)(ne,{style:Me.backdrop,onPress:()=>{o||R(`outside`)},accessible:!1,testID:`Popover.backdrop`}),(0,k.jsx)(Te,{trapped:o,active:S,autoFocus:`none`,restoreFocus:!1,children:(0,k.jsxs)(te.View,{style:q,onLayout:B,role:`dialog`,accessibilityLabel:F,accessibilityViewIsModal:o,testID:`Popover.panel`,children:[s?(0,k.jsx)(l,{style:Z,testID:`Popover.arrow`}):null,(0,k.jsxs)(l,{style:J,children:[n!==void 0||u?(0,k.jsxs)(l,{style:Y,children:[n===void 0?null:(0,k.jsx)(l,{style:Me.heading,testID:`Popover.heading`,children:(0,k.jsx)(_e,{level:r,children:n})}),u?(0,k.jsx)(x,{label:Oe.closeLabel,variant:`ghost`,size:`sm`,iconOnly:!0,leadingIcon:(0,k.jsx)(oe,{name:`close`,color:p.colorActionGhostForeground}),onPress:()=>R(`close-button`)}):null]}):null,(0,k.jsx)(l,{ref:v,testID:`Popover.body`,children:(0,k.jsx)(Se,{children:t})})]})]})})]})})]})}var O,k,Oe,ke,Ae,je,Me;function Ne(){return(Ne=e((()=>{O=t(n(),1),pe(),m(),o(),ie(),_(),r(),s(),ce(),a(),v(),xe(),ge(),we(),S(),y(),b(),k=fe(),Oe={closeLabel:`Close`},ke=[`shadow`,`radius`,`inset`,`partGap`,`layer`,`enter`,`exit`],Ae={escape:`escape`,"close-button":`close-button`,scrim:`outside`,drag:`outside`,action:`close-button`},je=new Set([`trigger`,`escape`,`close-button`]),Me=i.create({host:{flex:1},backdrop:{...i.absoluteFill,backgroundColor:`transparent`},heading:{flex:1}}),D.__docgenInfo={description:'Popover — a small panel that appears next to the thing you pressed and stays out of\nthe way of everything else: a date picker under a field, a filter panel, a help note\nwith a link. Unlike a Tooltip it can hold controls; unlike a Dialog it does not take\nover the page.\n\nWhen to use: a compact interactive panel tied to a trigger; `modal` when the panel\nholds a required step (a short form that must be submitted or cancelled); `heading`\nwhen the content is not obvious from the trigger. Not for text-only hints (Tooltip),\nlists of actions (Menu), options (Select/Combobox), or anything bigger than a small\npanel (Dialog). Do not nest popovers.\n\nThe trigger is cloned with the toggle `onPress` and Button\'s `expanded`, so the\nstate is announced. At or below `layout.maxWidth.prose` (phones) the panel is the\npackage\'s `BottomSheet` with `height="content"`, titled by `heading`, else the\ntrigger\'s `accessibleName`, else its string `label`; there it is always modal and\nalways shows its close button. Above it (tablets, react-native-web) a transparent\n`Modal` holds a full-screen transparent backdrop `Pressable` (no scrim, even when\n`modal`) and a `role="dialog"` panel positioned from the trigger\'s\n`measureInWindow()` rect, flipped and shifted to stay in the window. The panel\ncomposes `FocusScope` (`trapped` when `modal`), `Heading`, `Button` for the close\ncontrol and `Box` for the body. It fades and slides `enterDistance` from the trigger\nside over `enter` (motion.easing.standard) and fades out over `exit`\n(motion.easing.exit); instantly under reduced motion.\n\nDismissal: Escape (`onRequestClose`: Android back, Esc on react-native-web) always\ncloses; a backdrop tap closes when not `modal`; the close button when `dismissible`.\nClosing by the trigger, Escape or the close button returns accessibility focus to the\ntrigger once `open` goes false; an outside tap does not. On open, focus lands on the\nbody wrapper — native has no descendant walker to find the first control.\n\nAcknowledged native limits: `Modal` intercepts every touch behind it, so non-modal\nmeans only "tapping outside closes"; Pressable sees no key events, so Tab never\nleaves the panel and `tab-out` is never reported; the panel is measured once per\nopen and does not follow a scrolling page; the arrow is centered on the panel edge.',methods:[],displayName:`Popover`,props:{trigger:{required:!0,tsType:{name:`ReactReactElement`,raw:`React.ReactElement`},description:"Exactly one focusable element — usually a Button — that opens the popover. It is cloned with the toggle `onPress` and Button's `expanded`, so it is typed as a single element."},children:{required:!0,tsType:{name:`ReactReactNode`,raw:`React.ReactNode`},description:`The panel content. May contain controls, links and a short Form; keep it to what fits without scrolling.`},heading:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:"Optional heading at the top of the panel, also the accessible name. Without it, the panel is named by the trigger's `accessibleName`, else its string `label`."},headingLevel:{required:!1,tsType:{name:`union`,raw:`PopoverHeadingLevel | undefined`,elements:[{name:`union`,raw:`'2' | '3' | '4' | 2 | 3 | 4`,elements:[{name:`literal`,value:`'2'`},{name:`literal`,value:`'3'`},{name:`literal`,value:`'4'`},{name:`literal`,value:`2`},{name:`literal`,value:`3`},{name:`literal`,value:`4`}]},{name:`undefined`}]},description:`Heading level of the panel heading. React Native has no heading levels: this only selects the Heading's typography, and has no effect in the phone (BottomSheet) presentation.`,defaultValue:{value:`'3'`,computed:!1}},open:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Controlled open state. Omit for uncontrolled (the trigger toggles it); the uncontrolled popover starts closed.`},placement:{required:!1,tsType:{name:`union`,raw:`PopoverPlacement | undefined`,elements:[{name:`union`,raw:`'bottom-start' | 'bottom' | 'bottom-end' | 'top-start' | 'top' | 'top-end' | 'start' | 'end'`,elements:[{name:`literal`,value:`'bottom-start'`},{name:`literal`,value:`'bottom'`},{name:`literal`,value:`'bottom-end'`},{name:`literal`,value:`'top-start'`},{name:`literal`,value:`'top'`},{name:`literal`,value:`'top-end'`},{name:`literal`,value:`'start'`},{name:`literal`,value:`'end'`}]},{name:`undefined`}]},description:"Preferred side and alignment; flips and shifts to stay in the window. `start`/`end` mirror in right-to-left layouts.",defaultValue:{value:`'bottom'`,computed:!1}},modal:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`False (default): tapping outside closes. True: a small Dialog anchored to the trigger — focus trapped, a press outside does nothing, no scrim. No effect on phones, where the sheet is always modal.`,defaultValue:{value:`false`,computed:!1}},showArrow:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`A small pointer toward the trigger. Off by default.`,defaultValue:{value:`false`,computed:!1}},dismissible:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Show the close button. Escape and (non-modal) an outside tap work regardless. No effect on phones, where the sheet always shows it.`,defaultValue:{value:`true`,computed:!1}},onOpenChange:{required:!1,tsType:{name:`union`,raw:`((open: boolean, reason: PopoverCloseReason) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:`Fired when the popover opens or closes, with the new state and a reason.`},overrides:{required:!1,tsType:{name:`union`,raw:`Partial<Record<PopoverOverridableBinding, TokenRef | undefined>> | undefined`,elements:[{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'border'
| 'borderWidth'
| 'shadow'
| 'radius'
| 'inset'
| 'partGap'
| 'offset'
| 'arrowSize'
| 'maxWidth'
| 'layer'
| 'enter'
| 'enterDistance'
| 'exit'`,elements:[{name:`literal`,value:`'border'`},{name:`literal`,value:`'borderWidth'`},{name:`literal`,value:`'shadow'`},{name:`literal`,value:`'radius'`},{name:`literal`,value:`'inset'`},{name:`literal`,value:`'partGap'`},{name:`literal`,value:`'offset'`},{name:`literal`,value:`'arrowSize'`},{name:`literal`,value:`'maxWidth'`},{name:`literal`,value:`'layer'`},{name:`literal`,value:`'enter'`},{name:`literal`,value:`'enterDistance'`},{name:`literal`,value:`'exit'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<PopoverOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<PopoverOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:"Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop."},ref:{required:!1,tsType:{name:`union`,raw:`React.Ref<ViewInstance> | undefined`,elements:[{name:`ReactRef`,raw:`React.Ref<ViewInstance>`,elements:[{name:`ViewInstance`}]},{name:`undefined`}]},description:`The root view (wraps the trigger; the Modal itself exposes no ref).`}}}})))()}function A(e){let[t,n]=Ie.useState(!0);return(0,j.jsx)(D,{...e,open:t,onOpenChange:(t,r)=>{n(t),e.onOpenChange?.(t,r)}})}function Pe(){let{tokens:e}=ue();return(0,j.jsx)(oe,{name:`calendar`,color:e.colorActionSecondaryForeground})}function Fe(){let{tokens:e}=ue();return(0,j.jsx)(oe,{name:`info`,color:e.colorActionGhostForeground})}var Ie,j,Le,M,N,P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X,Z,Q,$,Re;function ze(){return(ze=e((()=>{Ie=t(n(),1),ge(),Ce(),be(),y(),ye(),g(),Ne(),ve(),d(),ee(),b(),j=fe(),Le={title:`Popover/React Native`,component:D,decorators:[u({fit:!0})],args:{trigger:(0,j.jsx)(x,{label:`Filters`,variant:`secondary`}),children:(0,j.jsxs)(T,{actions:(0,j.jsx)(x,{label:`Apply`,type:`submit`}),children:[(0,j.jsx)(E,{label:`Open`,name:`open`}),(0,j.jsx)(E,{label:`Closed`,name:`closed`})]}),heading:`Filters`,placement:`bottom-start`,headingLevel:`3`,modal:!1,showArrow:!1,dismissible:!0}},M=e=>(0,j.jsx)(A,{...e}),N={render:M},P={args:{headingLevel:`2`},render:M},F={args:{headingLevel:`3`},render:M},I={args:{headingLevel:`4`},render:M},L={args:{placement:`bottom-start`}},R={args:{placement:`bottom`}},z={args:{placement:`bottom-end`}},B={args:{placement:`top-start`}},V={args:{placement:`top`}},H={args:{placement:`top-end`}},U={args:{placement:`start`}},W={args:{placement:`end`}},G={args:{modal:!0},render:M},K={args:{showArrow:!0},render:M},q={args:{dismissible:!1},render:M},J={args:{heading:void 0},render:M},Y={args:{trigger:(0,j.jsx)(x,{label:`Filters`,variant:`secondary`}),children:(0,j.jsxs)(T,{actions:(0,j.jsx)(x,{label:`Apply`,type:`submit`}),children:[(0,j.jsx)(E,{label:`Open`,name:`open`}),(0,j.jsx)(E,{label:`Closed`,name:`closed`})]}),heading:`Filters`,placement:`bottom-start`}},X={args:{trigger:(0,j.jsx)(x,{label:`17 September 2026`,variant:`secondary`,leadingIcon:(0,j.jsx)(Pe,{})}),children:(0,j.jsxs)(C,{gap:`tight`,align:`start`,children:[(0,j.jsx)(x,{label:`Today`,variant:`ghost`}),(0,j.jsx)(x,{label:`Tomorrow`,variant:`ghost`}),(0,j.jsx)(x,{label:`Next week`,variant:`ghost`})]}),heading:void 0}},Z={args:{trigger:(0,j.jsx)(x,{label:`Add member`}),children:(0,j.jsxs)(C,{gap:`normal`,align:`start`,children:[(0,j.jsx)(w,{label:`Email`,name:`email`,type:`email`}),(0,j.jsx)(x,{label:`Save`})]}),heading:`Add member`,modal:!0}},Q={args:{trigger:(0,j.jsx)(x,{label:`Help`,variant:`ghost`,iconOnly:!0,leadingIcon:(0,j.jsx)(Fe,{})}),children:(0,j.jsxs)(f,{children:[`Filters apply to every view in this project. `,(0,j.jsx)(h,{href:`https://example.com/guide`,label:`Read the guide`})]}),heading:void 0,showArrow:!0,placement:`end`}},$={args:{modal:!1,children:(0,j.jsxs)(C,{gap:`normal`,align:`start`,children:[(0,j.jsx)(w,{label:`Search`,name:`search`}),(0,j.jsx)(h,{href:`https://example.com/filters`,label:`Reset filters`}),(0,j.jsx)(x,{label:`Apply`})]})},render:M},Re=[`Default`,`HeadingLevel2`,`HeadingLevel3`,`HeadingLevel4`,`PlacementBottomStart`,`PlacementBottom`,`PlacementBottomEnd`,`PlacementTopStart`,`PlacementTop`,`PlacementTopEnd`,`PlacementStart`,`PlacementEnd`,`Modal`,`ShowArrow`,`NotDismissible`,`NoHeading`,`FilterPanel`,`DatePickerPanel`,`RequiredStep`,`ContextualHelp`,`Keyboard`],N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  render: renderOpen
}`,...N.parameters?.docs?.source}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '2'
  },
  render: renderOpen
}`,...P.parameters?.docs?.source}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '3'
  },
  render: renderOpen
}`,...F.parameters?.docs?.source}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '4'
  },
  render: renderOpen
}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'bottom-start'
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'bottom'
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'bottom-end'
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'top-start'
  }
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'top'
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'top-end'
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'start'
  }
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'end'
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  args: {
    modal: true
  },
  render: renderOpen
}`,...G.parameters?.docs?.source}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  args: {
    showArrow: true
  },
  render: renderOpen
}`,...K.parameters?.docs?.source}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  args: {
    dismissible: false
  },
  render: renderOpen
}`,...q.parameters?.docs?.source}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  args: {
    heading: undefined
  },
  render: renderOpen
}`,...J.parameters?.docs?.source}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  args: {
    trigger: <Button label="Filters" variant="secondary" />,
    children: <Form actions={<Button label="Apply" type="submit" />}>\r
        <Checkbox label="Open" name="open" />\r
        <Checkbox label="Closed" name="closed" />\r
      </Form>,
    heading: 'Filters',
    placement: 'bottom-start'
  }
}`,...Y.parameters?.docs?.source}}},X.parameters={...X.parameters,docs:{...X.parameters?.docs,source:{originalSource:`{
  args: {
    trigger: <Button label="17 September 2026" variant="secondary" leadingIcon={<CalendarIcon />} />,
    children: <Stack gap="tight" align="start">\r
        <Button label="Today" variant="ghost" />\r
        <Button label="Tomorrow" variant="ghost" />\r
        <Button label="Next week" variant="ghost" />\r
      </Stack>,
    heading: undefined
  }
}`,...X.parameters?.docs?.source}}},Z.parameters={...Z.parameters,docs:{...Z.parameters?.docs,source:{originalSource:`{
  args: {
    trigger: <Button label="Add member" />,
    children: <Stack gap="normal" align="start">\r
        <Input label="Email" name="email" type="email" />\r
        <Button label="Save" />\r
      </Stack>,
    heading: 'Add member',
    modal: true
  }
}`,...Z.parameters?.docs?.source}}},Q.parameters={...Q.parameters,docs:{...Q.parameters?.docs,source:{originalSource:`{
  args: {
    trigger: <Button label="Help" variant="ghost" iconOnly leadingIcon={<HelpIcon />} />,
    children: <Text>\r
        Filters apply to every view in this project. <Link href="https://example.com/guide" label="Read the guide" />\r
      </Text>,
    heading: undefined,
    showArrow: true,
    placement: 'end'
  }
}`,...Q.parameters?.docs?.source}}},$.parameters={...$.parameters,docs:{...$.parameters?.docs,source:{originalSource:`{
  args: {
    modal: false,
    children: <Stack gap="normal" align="start">\r
        <Input label="Search" name="search" />\r
        <Link href="https://example.com/filters" label="Reset filters" />\r
        <Button label="Apply" />\r
      </Stack>
  },
  render: renderOpen
}`,...$.parameters?.docs?.source},description:{story:"Open with its trigger and three focusable children, for the axe gate and manual keyboard checks. Accepts `modal` as an arg.",...$.parameters?.docs?.description}}}})))()}ze();export{Q as ContextualHelp,X as DatePickerPanel,N as Default,Y as FilterPanel,P as HeadingLevel2,F as HeadingLevel3,I as HeadingLevel4,$ as Keyboard,G as Modal,J as NoHeading,q as NotDismissible,R as PlacementBottom,z as PlacementBottomEnd,L as PlacementBottomStart,W as PlacementEnd,U as PlacementStart,V as PlacementTop,H as PlacementTopEnd,B as PlacementTopStart,Z as RequiredStep,K as ShowArrow,Re as __namedExportsOrder,Le as default};