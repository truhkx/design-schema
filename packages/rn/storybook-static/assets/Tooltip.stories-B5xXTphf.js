import{n as e,o as t}from"./rolldown-runtime-C0FnF6B9.js";import{t as n}from"./react-DiVRNtpo.js";import{c as r,d as i,h as a,i as o,l as s,m as c,n as l,o as u,r as ee,t as d,u as f}from"./decorators-Dl4455ZU.js";import{n as p,t as m}from"./Platform-qE9g7V_t.js";import{n as h,t as g}from"./Animated-75prr5wJ.js";import{n as _,t as v}from"./Icon-sSovLWRe.js";import{n as te,t as y}from"./useWindowDimensions-oJibnkug.js";import{c as ne,i as re,l as b,r as x,s as ie}from"./iframe-CAToN8Eb.js";import{n as S,t as C}from"./Button-B0Tk0pjd.js";import{n as ae,t as w}from"./Stack-l7fs4Elr.js";import{r as T,t as E}from"./Toolbar-DUjU0BAt.js";function D(e,t,n){return Math.max(t,Math.min(e,n))}function oe(e,t,n,r,i){if(e===`start`||e===`end`){let a=f.isRTL?e===`end`:e===`start`,o=t.x,s=r.width-(t.x+t.width);a&&o<n.width+i&&s>=n.width+i?a=!1:!a&&s<n.width+i&&o>=n.width+i&&(a=!0);let c=a?t.x-i-n.width:t.x+t.width+i;return{top:D(t.y+t.height/2-n.height/2,0,r.height-n.height)-t.y,left:c-t.x}}let a=e===`bottom`,o=t.y,s=r.height-(t.y+t.height);a&&s<n.height+i&&o>s?a=!1:!a&&o<n.height+i&&s>o&&(a=!0);let c=a?t.y+t.height+i:t.y-i-n.height,l=D(t.x+t.width/2-n.width/2,0,r.width-n.width);return{top:c-t.y,left:l-t.x}}function O({content:e,children:t,placement:n=`top`,describes:r=!0,open:i,delay:a=`default`,overrides:l}){let{tokens:u}=ne(),d=ie(),f=te(),p=l?.radius?s(u,l.radius):u.radiusSm,h=l?.paddingBlock?s(u,l.paddingBlock):u.space1,_=l?.paddingInline?s(u,l.paddingInline):u.space2,v=l?.offset?s(u,l.offset):u.space1,y=l?.maxWidth?s(u,l.maxWidth):u.space20*3,b=l?.shadow?s(u,l.shadow):u.shadowRaised,x=l?.layer?s(u,l.layer):u.layerToast,S=l?.enter?s(u,l.enter):u.motionDurationFast,C=l?.exit?s(u,l.exit):u.motionDurationFast,ae=u.motionDurationBase*3,w=u.motionDurationBase,T=u.motionDurationFast,[E,D]=k.useState(j),[O,N]=k.useState(!1);k.useEffect(()=>N(!1),[i]);let P=i===void 0?E.hover||E.bubble||E.focus||E.press:i&&!O,F=k.useRef(null),I=k.useRef(null),L=e=>{e.current!==null&&(clearTimeout(e.current),e.current=null)};k.useEffect(()=>()=>{L(F),L(I)},[]);let R=k.useCallback((e,t)=>{D(n=>n[e]===t?n:{...n,[e]:t})},[]),z=k.useRef(P);k.useEffect(()=>{z.current&&!P&&(M=Date.now()+w),z.current=P},[P,w]);let B=()=>{if(L(I),L(F),a===`none`||P||Date.now()<M){R(`hover`,!0);return}F.current=setTimeout(()=>R(`hover`,!0),ae)},V=()=>{L(F),L(I),I.current=setTimeout(()=>R(`hover`,!1),T)},H=()=>{L(I),R(`bubble`,!0)},U=()=>{L(I),I.current=setTimeout(()=>{R(`bubble`,!1),R(`hover`,!1)},T)},W=k.useCallback(()=>{L(F),L(I),D(j),N(!0)},[]);k.useEffect(()=>{if(m.OS!==`web`||!P)return;let e=globalThis.window;if(e===void 0)return;let t=e=>{e.key===`Escape`&&(e.stopPropagation(),W())};return e.addEventListener(`keydown`,t,!0),()=>e.removeEventListener(`keydown`,t,!0)},[P,W]);let G=k.isValidElement(t)&&k.Children.count(t)===1;k.useEffect(()=>{G||console.warn("Tooltip: `children` must be exactly one focusable element (a Button, Link or Input).")},[G]);let K=G?t:null,q=K?.props??{},J=(e,t)=>n=>{q[e]?.(n),t()},Y=K===null?t:k.cloneElement(K,{...r?{accessibilityHint:e}:{accessibilityLabel:e},onLongPress:J(`onLongPress`,()=>R(`press`,!0)),onPressOut:J(`onPressOut`,()=>R(`press`,!1)),...m.OS===`web`?{onHoverIn:J(`onHoverIn`,B),onHoverOut:J(`onHoverOut`,V),onFocus:J(`onFocus`,()=>R(`focus`,!0)),onBlur:J(`onBlur`,()=>R(`focus`,!1))}:{}}),[X,Z]=k.useState(P),Q=k.useRef(new g.Value(0)).current;k.useEffect(()=>{P&&Z(!0)},[P]),k.useEffect(()=>{if(!X)return;let e=re(u.motionEasingStandard);if(P){if(d){Q.setValue(1);return}let t=g.timing(Q,{toValue:1,duration:S,easing:e,useNativeDriver:!1});return t.start(),()=>t.stop()}if(d){Q.setValue(0),Z(!1);return}let t=g.timing(Q,{toValue:0,duration:C,easing:e,useNativeDriver:!1});return t.start(({finished:e})=>{e&&Z(!1)}),()=>t.stop()},[P,X,d,S,C,Q,u.motionEasingStandard]);let se=k.useRef(null),[ce,le]=k.useState(null),[ue,de]=k.useState(null),fe=k.useCallback(()=>{se.current?.measureInWindow((e,t,n,r)=>{le(i=>i!==null&&i.x===e&&i.y===t&&i.width===n&&i.height===r?i:{x:e,y:t,width:n,height:r})})},[]);k.useEffect(()=>{X&&fe()},[X,fe,f.width,f.height]);let pe=e=>{let{width:t,height:n}=e.nativeEvent.layout;de(e=>e!==null&&e.width===t&&e.height===n?e:{width:t,height:n})},$=ce===null?null:oe(n,ce,ue??{width:0,height:0},f,v),me={position:`absolute`,top:$?.top??0,left:$?.left??0,maxWidth:y,paddingVertical:h,paddingHorizontal:_,borderRadius:p,backgroundColor:u.colorInverseSurface,zIndex:x,opacity:$!==null&&ue!==null?Q:0,...b};return(0,A.jsxs)(c,{testID:`Tooltip`,style:{position:`relative`,alignSelf:`flex-start`,...X?{zIndex:x}:{}},children:[(0,A.jsx)(c,{ref:se,collapsable:!1,children:Y}),X?(0,A.jsx)(g.View,{testID:`Tooltip.popup`,onLayout:pe,pointerEvents:m.OS===`web`?`auto`:`none`,onPointerEnter:H,onPointerLeave:U,accessibilityElementsHidden:!0,importantForAccessibility:`no-hide-descendants`,"aria-hidden":!0,style:me,children:(0,A.jsx)(o.Provider,{value:u.colorInverseForeground,children:(0,A.jsx)(ee,{size:`sm`,overrides:{fontFamily:l?.fontFamily,fontSize:l?.fontSize,lineHeight:l?.lineHeight},children:e})})}):null]})}var k,A,j,M;function N(){return(N=e((()=>{k=t(n(),1),h(),i(),p(),a(),y(),r(),u(),x(),A=b(),j={hover:!1,bubble:!1,focus:!1,press:!1},M=0,O.__docgenInfo={description:"Tooltip — the smallest overlay: a label that names an icon-only button or adds a\nshort clarification to a control, shown while attention is on it.\n\nWhen to use: attach it to an icon-only Button (`describes={false}`, so the tooltip is\nthe accessible name rather than a second announcement) or to a labelled control that\nneeds one more short phrase. Never put essential information, links or controls in it.\n\nThere is no hover on touch, so native shows nothing by default: `content` is cloned\nonto the single child as `accessibilityHint` (or `accessibilityLabel` when `describes`\nis `false`), so the information is never hover-only. A long-press shows the inverted\nbubble above the child until the press ends, as a sighted-user aid. On\nreact-native-web hover and focus behave as on web: focus shows it immediately, hover\nwaits `hoverDelay` (none when `delay` is `none` or a sibling hid within `warmWindow`),\nleaving the trigger hides it after `pointerGrace` unless the pointer reaches the\nbubble, and Escape hides it without moving focus. The bubble is hidden from\naccessibility — the hint or label on the trigger already carries the text.\n\nThe bubble is not portaled: it is absolutely positioned inside Tooltip's root on\n`layer.toast`, placed from the trigger's `measureInWindow` rect and flipped on\noverflow. An ancestor that clips (`overflow: 'hidden'`) or a sibling stacking context\nabove the root can still cover it — the acknowledged native limit.\n\nTooltip exposes no `ref`: it adds no root a caller needs; a caller that wants the\ntrigger refs its own child. Inside a Toolbar it adds no focus stop and no role.",methods:[],displayName:`Tooltip`,props:{content:{required:!0,tsType:{name:`string`},description:`The tooltip text. One short phrase or sentence; no markup, no links, no line breaks.`},children:{required:!0,tsType:{name:`ReactReactNode`,raw:`React.ReactNode`},description:`Exactly one focusable element (a Button, Link, Input). The tooltip attaches to it; a non-focusable child is an error.`},placement:{required:!1,tsType:{name:`union`,raw:`TooltipPlacement | undefined`,elements:[{name:`union`,raw:`'top' | 'bottom' | 'start' | 'end'`,elements:[{name:`literal`,value:`'top'`},{name:`literal`,value:`'bottom'`},{name:`literal`,value:`'start'`},{name:`literal`,value:`'end'`}]},{name:`undefined`}]},description:"Preferred side; flips when it would overflow the window (measured with `measureInWindow`). `start`/`end` are logical and mirror in right-to-left.",defaultValue:{value:`'top'`,computed:!1}},describes:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:"`true`: supplementary, becomes the child's `accessibilityHint`. `false`: it IS the child's name and becomes `accessibilityLabel` instead.",defaultValue:{value:`true`,computed:!1}},open:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Controlled visibility, for stories and tests only. Product code never sets it: a tooltip is hover, focus and long-press driven.`},delay:{required:!1,tsType:{name:`union`,raw:`TooltipDelay | undefined`,elements:[{name:`union`,raw:`'default' | 'none'`,elements:[{name:`literal`,value:`'default'`},{name:`literal`,value:`'none'`}]},{name:`undefined`}]},description:"Hover delay before showing (react-native-web): `default` waits `motion.duration.base` × 3; `none` shows instantly.",defaultValue:{value:`'default'`,computed:!1}},overrides:{required:!1,tsType:{name:`union`,raw:`Partial<Record<TooltipOverridableBinding, TokenRef | undefined>> | undefined`,elements:[{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'radius'
| 'paddingBlock'
| 'paddingInline'
| 'offset'
| 'maxWidth'
| 'fontFamily'
| 'fontSize'
| 'lineHeight'
| 'shadow'
| 'layer'
| 'enter'
| 'exit'`,elements:[{name:`literal`,value:`'radius'`},{name:`literal`,value:`'paddingBlock'`},{name:`literal`,value:`'paddingInline'`},{name:`literal`,value:`'offset'`},{name:`literal`,value:`'maxWidth'`},{name:`literal`,value:`'fontFamily'`},{name:`literal`,value:`'fontSize'`},{name:`literal`,value:`'lineHeight'`},{name:`literal`,value:`'shadow'`},{name:`literal`,value:`'layer'`},{name:`literal`,value:`'enter'`},{name:`literal`,value:`'exit'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<TooltipOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<TooltipOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:"Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop."}}}})))()}var P,F,I,L,R,z,B,V,H,U,W,G,K,q,J,Y,X;function Z(){return(Z=e((()=>{n(),S(),_(),ae(),T(),N(),d(),P=b(),F={title:`Tooltip/React Native`,component:O,decorators:[l({fit:!0})],args:{content:`Includes archived items`,children:(0,P.jsx)(C,{variant:`ghost`,size:`sm`,label:`Items`}),placement:`top`,describes:!0,delay:`default`}},I={},L={args:{placement:`top`}},R={args:{placement:`bottom`}},z={args:{placement:`start`}},B={args:{placement:`end`}},V={args:{delay:`default`}},H={args:{delay:`none`}},U={args:{open:!0}},W={args:{open:!0,overrides:{radius:`radius.md`,maxWidth:`space.20`}}},G={args:{content:`Add item`,children:(0,P.jsx)(C,{iconOnly:!0,label:`Add item`,leadingIcon:(0,P.jsx)(v,{name:`plus`})}),describes:!1}},K={args:{content:`Includes archived items`,children:(0,P.jsx)(C,{variant:`ghost`,size:`sm`,label:`Items`})}},q={args:{content:`Grid view`,children:(0,P.jsx)(C,{iconOnly:!0,variant:`ghost`,label:`Grid view`,leadingIcon:(0,P.jsx)(v,{name:`grid`})}),delay:`none`},render:e=>(0,P.jsx)(E,{label:`View`,children:(0,P.jsx)(O,{...e})})},J={args:{content:`Open in new tab`,children:(0,P.jsx)(C,{iconOnly:!0,label:`Open in new tab`,leadingIcon:(0,P.jsx)(v,{name:`external`})}),placement:`bottom`}},Y={render:()=>(0,P.jsxs)(w,{direction:`horizontal`,gap:`tight`,children:[(0,P.jsx)(O,{content:`Add item`,describes:!1,open:!0,children:(0,P.jsx)(C,{iconOnly:!0,variant:`ghost`,label:`Add item`,leadingIcon:(0,P.jsx)(v,{name:`plus`})})}),(0,P.jsx)(O,{content:`Grid view`,describes:!1,children:(0,P.jsx)(C,{iconOnly:!0,variant:`ghost`,label:`Grid view`,leadingIcon:(0,P.jsx)(v,{name:`grid`})})}),(0,P.jsx)(O,{content:`Open in new tab`,describes:!1,children:(0,P.jsx)(C,{iconOnly:!0,variant:`ghost`,label:`Open in new tab`,leadingIcon:(0,P.jsx)(v,{name:`external`})})})]})},X=[`Default`,`PlacementTop`,`PlacementBottom`,`PlacementStart`,`PlacementEnd`,`DelayDefault`,`DelayNone`,`Open`,`WithOverrides`,`IconOnlyButtonName`,`ColumnHeaderHint`,`WarmToolbar`,`BelowTheTrigger`,`Keyboard`],I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'top'
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'bottom'
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'start'
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    placement: 'end'
  }
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    delay: 'default'
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    delay: 'none'
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    open: true
  }
}`,...U.parameters?.docs?.source}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    open: true,
    overrides: {
      radius: 'radius.md',
      maxWidth: 'space.20'
    }
  }
}`,...W.parameters?.docs?.source}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  args: {
    content: 'Add item',
    children: <Button iconOnly label="Add item" leadingIcon={<Icon name="plus" />} />,
    describes: false
  }
}`,...G.parameters?.docs?.source},description:{story:`The tooltip is the control's name, not a second announcement, so it is linked as the label.`,...G.parameters?.docs?.description}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  args: {
    content: 'Includes archived items',
    children: <Button variant="ghost" size="sm" label="Items" />
  }
}`,...K.parameters?.docs?.source},description:{story:`A clarification on a labelled control in dense UI.`,...K.parameters?.docs?.description}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  args: {
    content: 'Grid view',
    children: <Button iconOnly variant="ghost" label="Grid view" leadingIcon={<Icon name="grid" />} />,
    delay: 'none'
  },
  render: args => <Toolbar label="View">\r
      <Tooltip {...args} />\r
    </Toolbar>
}`,...q.parameters?.docs?.source},description:{story:`A toolbar where a sibling tooltip is already open, so the next one shows instantly.`,...q.parameters?.docs?.description}}},J.parameters={...J.parameters,docs:{...J.parameters?.docs,source:{originalSource:`{
  args: {
    content: 'Open in new tab',
    children: <Button iconOnly label="Open in new tab" leadingIcon={<Icon name="external" />} />,
    placement: 'bottom'
  }
}`,...J.parameters?.docs?.source},description:{story:`A trigger at the top of the page, where the bubble reads better underneath.`,...J.parameters?.docs?.description}}},Y.parameters={...Y.parameters,docs:{...Y.parameters?.docs,source:{originalSource:`{
  render: () => <Stack direction="horizontal" gap="tight">\r
      <Tooltip content="Add item" describes={false} open>\r
        <Button iconOnly variant="ghost" label="Add item" leadingIcon={<Icon name="plus" />} />\r
      </Tooltip>\r
      <Tooltip content="Grid view" describes={false}>\r
        <Button iconOnly variant="ghost" label="Grid view" leadingIcon={<Icon name="grid" />} />\r
      </Tooltip>\r
      <Tooltip content="Open in new tab" describes={false}>\r
        <Button iconOnly variant="ghost" label="Open in new tab" leadingIcon={<Icon name="external" />} />\r
      </Tooltip>\r
    </Stack>
}`,...Y.parameters?.docs?.source},description:{story:`Rendered open (the \`open\` prop) on the first of three focusable triggers, for the axe\r
gate and manual keyboard checks on react-native-web: Escape hides it without moving\r
focus; focusing any trigger shows its own tooltip.`,...Y.parameters?.docs?.description}}}})))()}Z();export{J as BelowTheTrigger,K as ColumnHeaderHint,I as Default,V as DelayDefault,H as DelayNone,G as IconOnlyButtonName,Y as Keyboard,U as Open,R as PlacementBottom,B as PlacementEnd,z as PlacementStart,L as PlacementTop,q as WarmToolbar,W as WithOverrides,X as __namedExportsOrder,F as default};