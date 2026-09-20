import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{f as a}from"./iframe-B0T1LYjz.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{t(),r(),a(),o=[{id:`shipping`,label:`Shipping address`},{id:`payment`,label:`Payment`},{id:`review`,label:`Review order`}],s={title:`Stepper/Lit`,component:`ds-stepper`,tags:[`autodocs`],parameters:{actions:{handles:[`step-select`]}},argTypes:{orientation:{control:`radio`,options:[`horizontal`,`vertical`]},navigable:{control:`radio`,options:[`none`,`completed`,`all`]},compact:{control:`boolean`}},args:{steps:[...o,{id:`confirm`,label:`Confirmation`}],current:`payment`},render:e=>i`
    <ds-stepper
      label=${n(e.label)}
      .steps=${e.steps}
      current=${e.current}
      orientation=${n(e.orientation)}
      navigable=${n(e.navigable)}
      ?compact=${e.compact??!1}
    ></ds-stepper>
  `},c={},l={args:{orientation:`horizontal`}},u={args:{orientation:`vertical`}},d={args:{navigable:`none`}},f={args:{navigable:`completed`}},p={args:{navigable:`all`}},m={args:{compact:!0}},h={args:{navigable:`all`}},g={args:{current:`payment`,steps:o}},_={args:{orientation:`vertical`,current:`verify`,steps:[{id:`account`,label:`Create account`,description:`Takes about a minute.`},{id:`verify`,label:`Verify identity`,description:`Takes about 2 minutes.`},{id:`plan`,label:`Choose a plan`,description:`Compare features and pricing.`}]}},v={args:{navigable:`none`,current:`payment`,steps:o}},y={args:{current:`review`,steps:[{id:`shipping`,label:`Shipping address`,status:`complete`},{id:`payment`,label:`Payment`,status:`error`},{id:`review`,label:`Review order`}]}},b=[`Default`,`OrientationHorizontal`,`OrientationVertical`,`NavigableNone`,`NavigableCompleted`,`NavigableAll`,`Compact`,`Keyboard`,`Checkout`,`OnboardingWithDescriptions`,`DisplayOnly`,`AStepWithAnError`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'horizontal'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'vertical'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    navigable: 'none'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    navigable: 'completed'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    navigable: 'all'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    compact: true
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    navigable: 'all'
  }
}`,...h.parameters?.docs?.source},description:{story:`Every step is a navigable native button: Tab moves between them, Enter or Space selects.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    current: 'payment',
    steps: checkout
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    navigable: 'none',
    current: 'payment',
    steps: checkout
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}}})))()}x();export{y as AStepWithAnError,g as Checkout,m as Compact,c as Default,v as DisplayOnly,h as Keyboard,p as NavigableAll,f as NavigableCompleted,d as NavigableNone,_ as OnboardingWithDescriptions,l as OrientationHorizontal,u as OrientationVertical,b as __namedExportsOrder,s as default};