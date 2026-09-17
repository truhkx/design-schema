import{n as e,o as t}from"./rolldown-runtime-C0FnF6B9.js";import{t as n}from"./react-DiVRNtpo.js";import{c as r,f as i,h as a,l as o,m as s,n as c,o as l,p as u,r as d,t as f}from"./decorators-Dl4455ZU.js";import{n as p,t as m}from"./Animated-75prr5wJ.js";import{n as h,t as g}from"./Pressable-CjGHHyHY.js";import{n as _,t as v}from"./Icon-sSovLWRe.js";import{a as y,c as b,i as x,l as S,r as C,s as w}from"./iframe-CAToN8Eb.js";function T(e,t){return e.replace(/\{(\w+)\}/g,(e,n)=>n in t?String(t[n]):e)}function E(e,t,n){return e.status===void 0?n===-1||t>n?`upcoming`:t<n?`complete`:`current`:e.status}function D({label:e,steps:t,current:n,orientation:r=`horizontal`,navigable:i=`completed`,compact:a=!1,overrides:c,onStepSelect:l,ref:u}){let{tokens:f}=b(),p=w(),[m,h]=A.useState(void 0),g=(e,t)=>{let n=c?.[e];return n?o(f,n):t},_={indicatorSize:g(`indicatorSize`,f.space6),indicatorBackground:g(`indicatorBackground`,f.colorControlBackground),indicatorRadius:g(`indicatorRadius`,f.radiusFull),indicatorFontSize:g(`indicatorFontSize`,f.fontSizeSm),indicatorFontWeight:g(`indicatorFontWeight`,f.fontWeightSemibold),connector:g(`connector`,f.colorBorder),stepHover:g(`stepHover`,f.colorActionGhostBackgroundHover),stepRadius:g(`stepRadius`,f.radiusSm),stepPadding:g(`stepPadding`,f.space2),stepGap:g(`stepGap`,f.layoutGapNormal),partGap:g(`partGap`,f.space2),fontFamily:g(`fontFamily`,f.fontFamilyBody),transition:g(`transition`,f.motionDurationFast)},v=t.findIndex(e=>e.id===n),y=r===`horizontal`,x=y&&(a||m!==void 0&&m<f.layoutMaxWidthProse);A.useEffect(()=>{v===-1&&console.warn(`Stepper: current "${n}" matches no step id; nothing is selected.`)},[n,v]);let S=e=>{let t=e.nativeEvent.layout.width;h(e=>e===t?e:t)},C=[];return t.forEach((e,r)=>{let a=i===`all`||i===`completed`&&v!==-1&&r<v;C.push((0,j.jsx)(O,{step:e,index:r,status:E(e,r,v),isCurrent:e.id===n,isNavigable:a,compact:x,isHorizontal:y,t:f,r:_,overrides:c,onStepSelect:l},e.id)),r<t.length-1&&C.push((0,j.jsx)(k,{isHorizontal:y,complete:v!==-1&&r<v,reducedMotion:p,t:f,r:_},`connector-${e.id}`))}),(0,j.jsxs)(s,{ref:u,testID:`Stepper`,accessibilityRole:`list`,accessibilityLabel:e??M.navLabel,onLayout:S,style:{flexDirection:`column`,gap:_.stepGap},children:[(0,j.jsx)(s,{style:y?{flexDirection:`row`,alignItems:`flex-start`}:{flexDirection:`column`},children:C}),x?(0,j.jsx)(s,{testID:`Stepper.count`,children:(0,j.jsx)(d,{size:`sm`,tone:`muted`,overrides:{fontSize:c?.countSize,fontFamily:c?.fontFamily},children:T(M.stepOf,{current:v===-1?1:v+1,total:t.length})})}):null]})}function O({step:e,index:t,status:n,isCurrent:r,isNavigable:a,compact:o,isHorizontal:c,t:l,r:u,overrides:f,onStepSelect:p}){let[m,h]=A.useState(!1),[_,b]=A.useState(!1),x=t+1,S=N[n],C=T(M.stepLabel,{n:x,label:e.label}),w=S===void 0?C:`${C}, ${S}`,E={width:u.indicatorSize,height:u.indicatorSize,borderRadius:u.indicatorRadius,borderWidth:l.borderWidthFocus,borderColor:n===`error`?l.colorStatusDangerIcon:n===`complete`||n===`current`?l.colorControlSelectedBackground:l.colorBorderStrong,backgroundColor:n===`error`?l.colorStatusDangerBackground:n===`complete`?l.colorControlSelectedBackground:u.indicatorBackground,alignItems:`center`,justifyContent:`center`},D={fontFamily:u.fontFamily,fontSize:u.indicatorFontSize,fontWeight:y(u.indicatorFontWeight),color:l.colorForeground},O=f?.indicatorFontSize??`font.size.sm`,k=(0,j.jsx)(s,{testID:`Stepper.indicator`,style:E,accessibilityElementsHidden:!0,importantForAccessibility:`no`,children:n===`complete`?(0,j.jsx)(v,{name:`check`,size:`sm`,overrides:{color:`color.control.selectedForeground`,size:O}}):n===`error`?(0,j.jsx)(v,{name:`danger`,size:`sm`,overrides:{color:`color.status.danger.foreground`,size:O}}):(0,j.jsx)(i,{style:D,children:x})}),P=!o||r,F=!c&&e.description!==void 0,I=P||F?(0,j.jsxs)(s,{style:c?{alignItems:`center`}:{flex:1,gap:u.partGap},children:[P?(0,j.jsx)(s,{testID:`Stepper.label`,children:(0,j.jsx)(d,{size:`sm`,tone:n===`upcoming`?`muted`:`default`,overrides:{fontSize:f?.labelSize,fontWeight:r?f?.labelCurrentWeight??`font.weight.semibold`:f?.labelWeight??`font.weight.medium`,fontFamily:f?.fontFamily},children:e.label})}):null,F?(0,j.jsx)(s,{testID:`Stepper.description`,children:(0,j.jsx)(d,{size:`xs`,tone:`muted`,overrides:{fontSize:f?.descriptionSize,fontFamily:f?.fontFamily},children:e.description})}):null]}):null,L=e=>({...c?{alignItems:`center`}:{flexDirection:`row`,alignItems:`flex-start`,paddingVertical:u.stepPadding},paddingHorizontal:u.stepPadding,gap:u.partGap,minWidth:l.sizeTargetMin,minHeight:l.sizeTargetMin,borderRadius:u.stepRadius,borderWidth:l.borderWidthFocus,borderColor:m?l.colorBorderFocus:`transparent`,backgroundColor:e?u.stepHover:`transparent`});return a?(0,j.jsxs)(g,{testID:`Stepper.step`,accessibilityRole:`button`,accessibilityLabel:w,accessibilityState:{selected:r},onPress:()=>p?.(e.id),onFocus:()=>h(!0),onBlur:()=>h(!1),onHoverIn:()=>b(!0),onHoverOut:()=>b(!1),style:({pressed:e})=>L(e||_),children:[k,I]}):(0,j.jsxs)(s,{testID:`Stepper.step`,accessible:!0,accessibilityLabel:w,accessibilityState:{selected:r},style:L(!1),children:[k,I]})}function k({isHorizontal:e,complete:t,reducedMotion:n,t:r,r:i}){let a=A.useRef(new m.Value(+!!t)).current,o=A.useRef(t);A.useEffect(()=>{if(o.current===t)return;o.current=t;let e=+!!t;if(n){a.setValue(e);return}let s=m.timing(a,{toValue:e,duration:i.transition,easing:x(r.motionEasingStandard),useNativeDriver:!1});return s.start(),()=>s.stop()},[t,n,i.transition,a,r.motionEasingStandard]);let c=a.interpolate({inputRange:[0,1],outputRange:[i.connector,r.colorControlSelectedBackground]}),l=e?{width:i.stepGap,height:i.indicatorSize,paddingTop:r.borderWidthFocus,boxSizing:`content-box`,justifyContent:`center`}:{width:i.indicatorSize,height:i.stepGap,paddingLeft:r.borderWidthFocus+i.stepPadding,boxSizing:`content-box`,alignItems:`center`},u=e?{alignSelf:`stretch`,height:r.borderWidthFocus,backgroundColor:c}:{flex:1,width:r.borderWidthFocus,backgroundColor:c};return(0,j.jsx)(s,{testID:`Stepper.connector`,accessibilityElementsHidden:!0,importantForAccessibility:`no`,style:l,children:(0,j.jsx)(m.View,{style:u})})}var A,j,M,N;function P(){return(P=e((()=>{A=t(n(),1),p(),h(),u(),a(),r(),_(),l(),C(),j=S(),M={navLabel:`Progress`,stepOf:`Step {current} of {total}`,complete:`completed`,current:`current step`,error:`has an error`,stepLabel:`Step {n}: {label}`},N={complete:M.complete,current:M.current,error:M.error,upcoming:void 0},D.__docgenInfo={description:'Stepper — a map of a journey with a "you are here". It sets expectations, shows progress without a bar, and\ngives people a way back to a step they finished. Navigation, not a form control (the number-stepping field is\nNumberInput).\n\nUse it for three to about seven ordered steps: vertical with descriptions for flows that need explanation,\nhorizontal for short, familiar ones. Do not use it for two steps, for more than about eight, as Tabs, or to show\ntask progress (ProgressBar).\n\nRenders a `View` with `accessibilityRole="list"` named by `label` (React Native has no `nav` landmark). Each step\nis a `Pressable` (navigable) or an `accessible` `View` whose `accessibilityLabel` is `copy.stepLabel` plus ", " and\nthe status word, with `accessibilityState.selected` on the step `current` names. An explicit `status: "error"`\nwins for the indicator and the status word, while selection and the compact reveal still follow the id. The\nindicator switches between its four states at once; connectors cross-fade to `connectorComplete` over\n`transition`. Compact is decided by the stepper\'s own `onLayout` width, rendering non-compact until the first\nlayout; the `count` Text ("Step n of m") follows the steps only while compact is in effect.',methods:[],displayName:`Stepper`,props:{label:{required:!1,tsType:{name:`union`,raw:`string | undefined`,elements:[{name:`string`},{name:`undefined`}]},description:"Accessible name of the list (React Native has no navigation landmark). Defaults to `copy.navLabel`."},steps:{required:!0,tsType:{name:`Array`,elements:[{name:`signature`,type:`object`,raw:`{ id: string; label: string; description?: string; status?: "complete" | "current" | "upcoming" | "error" }`,signature:{properties:[{key:`id`,value:{name:`string`,required:!0}},{key:`label`,value:{name:`string`,required:!0}},{key:`description`,value:{name:`string`,required:!1}},{key:`status`,value:{name:`union`,raw:`"complete" | "current" | "upcoming" | "error"`,elements:[{name:`literal`,value:`"complete"`},{name:`literal`,value:`"current"`},{name:`literal`,value:`"upcoming"`},{name:`literal`,value:`"error"`}],required:!1}}]}}],raw:`{ id: string; label: string; description?: string; status?: "complete" | "current" | "upcoming" | "error" }[]`},description:"The steps in order. `status` is derived from `current` when omitted. An explicit `status` sets only the\nindicator, its colours and the status word; position (not status) decides the selected state, navigability,\nthe connector colour and the compact reveal."},current:{required:!0,tsType:{name:`string`},description:'The id of the current step. When no id matches, nothing is selected, every step without an explicit status is\nupcoming, no step is navigable under `completed`, the count reads "Step 1 of m", and `__DEV__` logs a warning.'},orientation:{required:!1,tsType:{name:`union`,raw:`StepperOrientation | undefined`,elements:[{name:`union`,raw:`'horizontal' | 'vertical'`,elements:[{name:`literal`,value:`'horizontal'`},{name:`literal`,value:`'vertical'`}]},{name:`undefined`}]},description:"Vertical shows descriptions under each label; horizontal renders no descriptions and collapses to `compact` below the prose width.",defaultValue:{value:`'horizontal'`,computed:!1}},navigable:{required:!1,tsType:{name:`union`,raw:`StepperNavigable | undefined`,elements:[{name:`union`,raw:`'none' | 'completed' | 'all'`,elements:[{name:`literal`,value:`'none'`},{name:`literal`,value:`'completed'`},{name:`literal`,value:`'all'`}]},{name:`undefined`}]},description:"Which steps can be activated: `none` (display only), `completed` (every step before the current one by\nposition, including one marked `error`), or `all` (a settings-style flow where order does not matter).",defaultValue:{value:`'completed'`,computed:!1}},compact:{required:!1,tsType:{name:`union`,raw:`boolean | undefined`,elements:[{name:`boolean`},{name:`undefined`}]},description:`Show only the current step's label and "Step 2 of 5"; the indicators stay. Horizontal only, set by hand or
automatically when the stepper's own width is below \`layout.maxWidth.prose\`; does nothing on a vertical stepper.`,defaultValue:{value:`false`,computed:!1}},overrides:{required:!1,tsType:{name:`union`,raw:`Partial<Record<StepperOverridableBinding, TokenRef | undefined>> | undefined`,elements:[{name:`Partial`,elements:[{name:`Record`,elements:[{name:`union`,raw:`| 'indicatorSize'
| 'indicatorBackground'
| 'indicatorRadius'
| 'indicatorFontSize'
| 'indicatorFontWeight'
| 'connector'
| 'labelWeight'
| 'labelCurrentWeight'
| 'labelSize'
| 'descriptionSize'
| 'countSize'
| 'stepHover'
| 'stepRadius'
| 'stepPadding'
| 'stepGap'
| 'partGap'
| 'fontFamily'
| 'transition'`,elements:[{name:`literal`,value:`'indicatorSize'`},{name:`literal`,value:`'indicatorBackground'`},{name:`literal`,value:`'indicatorRadius'`},{name:`literal`,value:`'indicatorFontSize'`},{name:`literal`,value:`'indicatorFontWeight'`},{name:`literal`,value:`'connector'`},{name:`literal`,value:`'labelWeight'`},{name:`literal`,value:`'labelCurrentWeight'`},{name:`literal`,value:`'labelSize'`},{name:`literal`,value:`'descriptionSize'`},{name:`literal`,value:`'countSize'`},{name:`literal`,value:`'stepHover'`},{name:`literal`,value:`'stepRadius'`},{name:`literal`,value:`'stepPadding'`},{name:`literal`,value:`'stepGap'`},{name:`literal`,value:`'partGap'`},{name:`literal`,value:`'fontFamily'`},{name:`literal`,value:`'transition'`}]},{name:`union`,raw:`TokenRef | undefined`,elements:[{name:`TokenRef`},{name:`undefined`}]}],raw:`Record<StepperOverridableBinding, TokenRef | undefined>`}],raw:`Partial<Record<StepperOverridableBinding, TokenRef | undefined>>`},{name:`undefined`}]},description:"Replace individual style bindings with a different token from the theme. The only per-instance styling surface — there is no `style` prop."},onStepSelect:{required:!1,tsType:{name:`union`,raw:`((id: string) => void) | undefined`,elements:[{name:`unknown`},{name:`undefined`}]},description:"Fired when a navigable step is chosen, with its id. The container changes `current`; the stepper never changes it itself."},ref:{required:!1,tsType:{name:`union`,raw:`React.Ref<ViewInstance> | undefined`,elements:[{name:`ReactRef`,raw:`React.Ref<ViewInstance>`,elements:[{name:`ViewInstance`}]},{name:`undefined`}]},description:`The root list view.`}}}})))()}var F,I,L,R,z,B,V,H,U,W,G,K,q,J;function Y(){return(Y=e((()=>{P(),f(),F={title:`Stepper/React Native`,component:D,decorators:[c()],args:{steps:[{id:`shipping`,label:`Shipping address`},{id:`payment`,label:`Payment`},{id:`review`,label:`Review order`},{id:`confirm`,label:`Confirmation`}],current:`payment`,orientation:`horizontal`,navigable:`completed`,compact:!1}},I={},L={args:{orientation:`horizontal`}},R={args:{orientation:`vertical`}},z={args:{navigable:`none`}},B={args:{navigable:`completed`}},V={args:{navigable:`all`}},H={args:{compact:!0}},U={args:{navigable:`all`,current:`review`}},W={args:{current:`payment`,steps:[{id:`shipping`,label:`Shipping address`},{id:`payment`,label:`Payment`},{id:`review`,label:`Review order`}]}},G={args:{orientation:`vertical`,current:`verify`,steps:[{id:`account`,label:`Create account`,description:`Takes about a minute.`},{id:`verify`,label:`Verify identity`,description:`Takes about 2 minutes.`},{id:`plan`,label:`Choose a plan`,description:`Compare features and pricing.`}]}},K={args:{navigable:`none`,current:`payment`,steps:[{id:`shipping`,label:`Shipping address`},{id:`payment`,label:`Payment`},{id:`review`,label:`Review order`}]}},q={args:{current:`review`,steps:[{id:`shipping`,label:`Shipping address`,status:`complete`},{id:`payment`,label:`Payment`,status:`error`},{id:`review`,label:`Review order`}]}},J=[`Default`,`OrientationHorizontal`,`OrientationVertical`,`NavigableNone`,`NavigableCompleted`,`NavigableAll`,`CompactTrue`,`Keyboard`,`Checkout`,`OnboardingWithDescriptions`,`DisplayOnly`,`AStepWithAnError`],I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{}`,...I.parameters?.docs?.source}}},L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'horizontal'
  }
}`,...L.parameters?.docs?.source}}},R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'vertical'
  }
}`,...R.parameters?.docs?.source}}},z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  args: {
    navigable: 'none'
  }
}`,...z.parameters?.docs?.source}}},B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
  args: {
    navigable: 'completed'
  }
}`,...B.parameters?.docs?.source}}},V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  args: {
    navigable: 'all'
  }
}`,...V.parameters?.docs?.source}}},H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  args: {
    compact: true
  }
}`,...H.parameters?.docs?.source}}},U.parameters={...U.parameters,docs:{...U.parameters?.docs,source:{originalSource:`{
  args: {
    navigable: 'all',
    current: 'review'
  }
}`,...U.parameters?.docs?.source},description:{story:`Every step navigable, so Tab reaches four Pressables in order on react-native-web.`,...U.parameters?.docs?.description}}},W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  args: {
    current: 'payment',
    steps: [{
      id: 'shipping',
      label: 'Shipping address'
    }, {
      id: 'payment',
      label: 'Payment'
    }, {
      id: 'review',
      label: 'Review order'
    }]
  }
}`,...W.parameters?.docs?.source},description:{story:`The usual horizontal flow, where a completed step can be revisited.`,...W.parameters?.docs?.description}}},G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'vertical',
    current: 'verify',
    steps: [{
      id: 'account',
      label: 'Create account',
      description: 'Takes about a minute.'
    }, {
      id: 'verify',
      label: 'Verify identity',
      description: 'Takes about 2 minutes.'
    }, {
      id: 'plan',
      label: 'Choose a plan',
      description: 'Compare features and pricing.'
    }]
  }
}`,...G.parameters?.docs?.source},description:{story:`A vertical stepper whose steps each need a line of explanation.`,...G.parameters?.docs?.description}}},K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  args: {
    navigable: 'none',
    current: 'payment',
    steps: [{
      id: 'shipping',
      label: 'Shipping address'
    }, {
      id: 'payment',
      label: 'Payment'
    }, {
      id: 'review',
      label: 'Review order'
    }]
  }
}`,...K.parameters?.docs?.source},description:{story:`A flow the user cannot jump around in.`,...K.parameters?.docs?.description}}},q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  args: {
    current: 'review',
    steps: [{
      id: 'shipping',
      label: 'Shipping address',
      status: 'complete'
    }, {
      id: 'payment',
      label: 'Payment',
      status: 'error'
    }, {
      id: 'review',
      label: 'Review order'
    }]
  }
}`,...q.parameters?.docs?.source},description:{story:`Validation failed on a step the user has already left.`,...q.parameters?.docs?.description}}}})))()}Y();export{q as AStepWithAnError,W as Checkout,H as CompactTrue,I as Default,K as DisplayOnly,U as Keyboard,V as NavigableAll,B as NavigableCompleted,z as NavigableNone,G as OnboardingWithDescriptions,L as OrientationHorizontal,R as OrientationVertical,J as __namedExportsOrder,F as default};