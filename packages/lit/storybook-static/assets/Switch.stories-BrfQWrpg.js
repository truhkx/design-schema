import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{r,t as i}from"./if-defined-BfpvQ5_i.js";import{t as a}from"./Stack-CZSvFm0E.js";import{k as o}from"./iframe-CsoUKhN4.js";var s,c,l,u,d,f,p,m,h,g;function _(){return(_=e((()=>{t(),i(),o(),a(),s={title:`Switch/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`]}},argTypes:{labelPosition:{control:`select`,options:[`start`,`end`]},defaultChecked:{control:`boolean`},disabled:{control:`boolean`}},args:{label:`Email notifications`,name:``,defaultChecked:!1,disabled:!1,description:void 0,labelPosition:`start`},render:e=>n`
    <div style="inline-size: min(100%, 24rem)">
      <ds-switch
        label=${e.label}
        name=${r(e.name||void 0)}
        description=${r(e.description)}
        label-position=${e.labelPosition}
        ?default-checked=${e.defaultChecked}
        ?disabled=${e.disabled}
      ></ds-switch>
    </div>
  `},c={},l={args:{labelPosition:`start`}},u={args:{labelPosition:`end`}},d={args:{defaultChecked:!0}},f={args:{disabled:!0}},p={args:{disabled:!0,defaultChecked:!0}},m={args:{description:`Sends a daily summary at 9:00.`}},h={render:()=>n`
    <ds-stack gap="0" style="inline-size: min(100%, 24rem)">
      <ds-switch label="Email notifications" default-checked></ds-switch>
      <ds-switch label="Push notifications"></ds-switch>
      <ds-switch label="Show archived" description="Includes items archived in the last year."></ds-switch>
    </ds-stack>
  `},g=[`Default`,`LabelPositionStart`,`LabelPositionEnd`,`DefaultCheckedTrue`,`DisabledTrue`,`DisabledOn`,`WithDescription`,`SettingsList`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    labelPosition: 'start'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    labelPosition: 'end'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    defaultChecked: true
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultChecked: true
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'Sends a daily summary at 9:00.'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <ds-stack gap="0" style="inline-size: min(100%, 24rem)">
      <ds-switch label="Email notifications" default-checked></ds-switch>
      <ds-switch label="Push notifications"></ds-switch>
      <ds-switch label="Show archived" description="Includes items archived in the last year."></ds-switch>
    </ds-stack>
  \`
}`,...h.parameters?.docs?.source}}}})))()}_();export{c as Default,d as DefaultCheckedTrue,p as DisabledOn,f as DisabledTrue,u as LabelPositionEnd,l as LabelPositionStart,h as SettingsList,m as WithDescription,g as __namedExportsOrder,s as default};