import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./Input-CF5u541t.js";import{t as o}from"./Checkbox-z3JMAxj-.js";import{k as s}from"./iframe-DJFLK4ZL.js";var c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E;function D(){return(D=e((()=>{t(),r(),s(),a(),o(),c=()=>i`
  <ds-input name="street" label="Street"></ds-input>
  <ds-input name="city" label="City"></ds-input>
`,l=`An Input name=street label=Street and an Input name=city label=City`,u=`A Checkbox name=email label=Email, a Checkbox name=sms label=SMS and a Checkbox name=push label=Push`,d=`An Input name=startDate label=Start date and an Input name=endDate label=End date`,f={[l]:c,[u]:()=>i`
    <ds-checkbox name="email" label="Email"></ds-checkbox>
    <ds-checkbox name="sms" label="SMS"></ds-checkbox>
    <ds-checkbox name="push" label="Push"></ds-checkbox>
  `,[d]:()=>i`
    <ds-input name="startDate" label="Start date"></ds-input>
    <ds-input name="endDate" label="End date"></ds-input>
  `},p={title:`Fieldset/Lit`,tags:[`autodocs`],argTypes:{gap:{control:`select`,options:[`tight`,`normal`,`loose`]},disabled:{control:`boolean`},children:{control:`select`,options:Object.keys(f)}},args:{legend:`Shipping address`,disabled:!1,gap:`normal`},render:e=>i`
    <ds-fieldset
      legend=${e.legend}
      description=${n(e.description)}
      error=${n(e.error)}
      gap=${e.gap??`normal`}
      ?disabled=${e.disabled??!1}
    >
      ${(f[e.children??``]??c)()}
    </ds-fieldset>
  `},m={},h={args:{gap:`tight`}},g={args:{gap:`normal`}},_={args:{gap:`loose`}},v={args:{description:`We only ship within the EU.`}},y={args:{error:`End date must be after start date.`}},b={args:{disabled:!0}},x={render:e=>i`
    <ds-fieldset legend=${e.legend} gap=${e.gap??`normal`}>
      <ds-input name="street" label="Street" required></ds-input>
      <ds-input name="city" label="City" required></ds-input>
    </ds-fieldset>
  `},S={args:{legend:`Shipping address`,children:l}},C={args:{legend:`Notification preferences`,description:`You can change these at any time.`,children:u,gap:`tight`}},w={args:{legend:`Reporting period`,error:`End date must be after start date.`,children:d}},T={args:{legend:`Billing address`,disabled:!0,children:l}},E=[`Default`,`GapTight`,`GapNormal`,`GapLoose`,`WithDescription`,`ErrorSet`,`DisabledTrue`,`AllFieldsRequired`,`ShippingAddress`,`NotificationPreferences`,`DateRangeWithAGroupError`,`DisabledGroup`],m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'tight'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'normal'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'loose'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'We only ship within the EU.'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    error: 'End date must be after start date.'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <ds-fieldset legend=\${args.legend} gap=\${args.gap ?? 'normal'}>
      <ds-input name="street" label="Street" required></ds-input>
      <ds-input name="city" label="City" required></ds-input>
    </ds-fieldset>
  \`
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    legend: 'Shipping address',
    children: ADDRESS
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    legend: 'Notification preferences',
    description: 'You can change these at any time.',
    children: NOTIFICATIONS,
    gap: 'tight'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    legend: 'Reporting period',
    error: 'End date must be after start date.',
    children: DATE_RANGE
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    legend: 'Billing address',
    disabled: true,
    children: ADDRESS
  }
}`,...T.parameters?.docs?.source}}}})))()}D();export{x as AllFieldsRequired,w as DateRangeWithAGroupError,m as Default,T as DisabledGroup,b as DisabledTrue,y as ErrorSet,_ as GapLoose,g as GapNormal,h as GapTight,C as NotificationPreferences,S as ShippingAddress,v as WithDescription,E as __namedExportsOrder,p as default};