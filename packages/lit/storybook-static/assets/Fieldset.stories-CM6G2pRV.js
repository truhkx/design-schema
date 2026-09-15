import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{r,t as i}from"./if-defined-BfpvQ5_i.js";import{t as a}from"./Input-BGhC2i8R.js";import{D as o}from"./iframe-CsoUKhN4.js";var s,c,l,u,d,f,p,m,h,g;function _(){return(_=e((()=>{t(),i(),o(),a(),s={title:`Fieldset/Lit`,tags:[`autodocs`],argTypes:{gap:{control:`select`,options:[`tight`,`normal`,`loose`]},disabled:{control:`boolean`},required:{control:`boolean`}},args:{legend:`Shipping address`,description:void 0,error:void 0,disabled:!1,gap:`normal`,required:!1},render:e=>n`
    <ds-fieldset
      legend=${e.legend}
      description=${r(e.description)}
      error=${r(e.error)}
      gap=${e.gap}
      ?disabled=${e.disabled}
    >
      <ds-input name="street" label="Street" ?required=${e.required}></ds-input>
      <ds-input name="city" label="City" ?required=${e.required}></ds-input>
      <ds-input name="postal-code" label="Postal code" ?required=${e.required}></ds-input>
    </ds-fieldset>
  `},c={},l={args:{gap:`tight`}},u={args:{gap:`normal`}},d={args:{gap:`loose`}},f={args:{description:`We only ship within the EU.`}},p={args:{error:`End date must be after start date.`}},m={args:{disabled:!0}},h={args:{required:!0}},g=[`Default`,`GapTight`,`GapNormal`,`GapLoose`,`WithDescription`,`ErrorSet`,`DisabledTrue`,`AllFieldsRequired`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'tight'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'normal'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    gap: 'loose'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'We only ship within the EU.'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    error: 'End date must be after start date.'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    required: true
  }
}`,...h.parameters?.docs?.source}}}})))()}_();export{h as AllFieldsRequired,c as Default,m as DisabledTrue,p as ErrorSet,d as GapLoose,u as GapNormal,l as GapTight,f as WithDescription,g as __namedExportsOrder,s as default};