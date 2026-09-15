import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{f as r}from"./iframe-CsoUKhN4.js";var i,a,o,s,c,l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{t(),r(),i=[{id:`shipping`,label:`Shipping address`,description:`Where the order will arrive`},{id:`payment`,label:`Payment`,description:`Card or bank details`},{id:`review`,label:`Review order`,description:`Check items and totals`},{id:`confirm`,label:`Confirmation`,description:`Takes about a minute`}],a=[{id:`shipping`,label:`Shipping address`,status:`error`,description:`Postal code could not be verified`},{id:`payment`,label:`Payment`,description:`Card or bank details`},{id:`review`,label:`Review order`,description:`Check items and totals`},{id:`confirm`,label:`Confirmation`,description:`Takes about a minute`}],o={title:`Stepper/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`step-select`]}},argTypes:{orientation:{control:`radio`,options:[`horizontal`,`vertical`]},navigable:{control:`radio`,options:[`none`,`completed`,`all`]},compact:{control:`boolean`}},args:{steps:i,current:`payment`,orientation:`horizontal`,navigable:`completed`,compact:!1},render:e=>n`
    <ds-stepper
      .steps=${e.steps}
      current=${e.current}
      orientation=${e.orientation}
      navigable=${e.navigable}
      ?compact=${e.compact}
      @step-select=${e=>console.log(`step-select`,e.detail)}
    ></ds-stepper>
  `},s={},c={args:{orientation:`horizontal`}},l={args:{orientation:`vertical`}},u={args:{navigable:`none`}},d={args:{navigable:`completed`}},f={args:{navigable:`all`}},p={args:{compact:!0}},m={args:{compact:!1}},h={args:{steps:a,current:`payment`}},g={args:{navigable:`all`,current:`payment`}},_=[`Default`,`OrientationHorizontal`,`OrientationVertical`,`NavigableNone`,`NavigableCompleted`,`NavigableAll`,`CompactTrue`,`CompactFalse`,`ErrorStep`,`Keyboard`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'horizontal'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    orientation: 'vertical'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    navigable: 'none'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    navigable: 'completed'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    navigable: 'all'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    compact: true
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    compact: false
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    steps: stepsWithError,
    current: 'payment'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    navigable: 'all',
    current: 'payment'
  }
}`,...g.parameters?.docs?.source},description:{story:`Every step is a focusable control, for keyboard testing (Tab between them, Enter/Space to select).`,...g.parameters?.docs?.description}}}})))()}v();export{m as CompactFalse,p as CompactTrue,s as Default,h as ErrorStep,g as Keyboard,f as NavigableAll,d as NavigableCompleted,u as NavigableNone,c as OrientationHorizontal,l as OrientationVertical,_ as __namedExportsOrder,o as default};