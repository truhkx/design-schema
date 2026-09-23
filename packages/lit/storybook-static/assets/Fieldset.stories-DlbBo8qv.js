import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./Input-C44YOz46.js";import{t as o}from"./Checkbox-cHwY3d7l.js";import{k as s}from"./iframe-C6sywzE2.js";var c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{t(),r(),s(),a(),o(),c=`An Input name=street label=Street and an Input name=city label=City`,l=`A required Input name=street label=Street and a required Input name=city label=City`,u=`A Checkbox name=email label=Email, a Checkbox name=sms label=SMS and a Checkbox name=push label=Push`,d=`An Input name=startDate label=Start date and an Input name=endDate label=End date`,f=()=>i`
  <ds-input name="street" label="Street"></ds-input>
  <ds-input name="city" label="City"></ds-input>
`,p={[c]:f,[l]:()=>i`
    <ds-input name="street" label="Street" required></ds-input>
    <ds-input name="city" label="City" required></ds-input>
  `,[u]:()=>i`
    <ds-checkbox name="email" label="Email"></ds-checkbox>
    <ds-checkbox name="sms" label="SMS"></ds-checkbox>
    <ds-checkbox name="push" label="Push"></ds-checkbox>
  `,[d]:()=>i`
    <ds-input name="startDate" label="Start date"></ds-input>
    <ds-input name="endDate" label="End date"></ds-input>
  `},m={title:`Fieldset/Lit`,tags:[`autodocs`],argTypes:{gap:{control:`select`,options:[`tight`,`normal`,`loose`]},disabled:{control:`boolean`},children:{control:`select`,options:Object.keys(p)}},args:{legend:`Shipping address`,gap:`normal`,disabled:!1,children:c},render:e=>i`
    <ds-fieldset
      legend=${e.legend}
      description=${n(e.description)}
      error=${n(e.error)}
      gap=${e.gap??`normal`}
      ?disabled=${e.disabled??!1}
    >
      ${(p[e.children??``]??f)()}
    </ds-fieldset>
  `},h={},g={args:{gap:`tight`}},_={args:{gap:`normal`}},v={args:{gap:`loose`}},y={args:{description:`We only ship within the EU.`}},b={args:{children:l}},x={args:{error:`End date must be after start date.`,children:d}},S={args:{disabled:!0}},C={args:{legend:`Shipping address`,children:c}},w={args:{legend:`Notification preferences`,description:`You can change these at any time.`,children:u,gap:`tight`}},T={args:{legend:`Reporting period`,error:`End date must be after start date.`,children:d}},E={args:{legend:`Billing address`,disabled:!0,children:c}},D=[`Default`,`GapTight`,`GapNormal`,`GapLoose`,`WithDescription`,`RequiredIndicator`,`WithError`,`Disabled`,`ShippingAddress`,`NotificationPreferences`,`DateRangeWithAGroupError`,`DisabledGroup`],h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'tight'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'normal'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'loose'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'We only ship within the EU.'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    children: REQUIRED_ADDRESS
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    error: 'End date must be after start date.',
    children: DATE_RANGE
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    legend: 'Shipping address',
    children: ADDRESS
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    legend: 'Notification preferences',
    description: 'You can change these at any time.',
    children: NOTIFICATIONS,
    gap: 'tight'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    legend: 'Reporting period',
    error: 'End date must be after start date.',
    children: DATE_RANGE
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    legend: 'Billing address',
    disabled: true,
    children: ADDRESS
  }
}`,...E.parameters?.docs?.source}}}})))()}O();export{T as DateRangeWithAGroupError,h as Default,S as Disabled,E as DisabledGroup,v as GapLoose,_ as GapNormal,g as GapTight,w as NotificationPreferences,b as RequiredIndicator,C as ShippingAddress,y as WithDescription,x as WithError,D as __namedExportsOrder,m as default};