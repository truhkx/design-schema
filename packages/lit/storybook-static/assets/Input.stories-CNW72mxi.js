import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./Input-C44YOz46.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{t(),r(),a(),o={title:`Input/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`,`focus`,`blur`]}},argTypes:{type:{control:`select`,options:[`text`,`email`,`password`,`number`,`search`,`tel`,`url`]},size:{control:`select`,options:[`sm`,`md`]},required:{control:`boolean`},hideLabel:{control:`boolean`},disabled:{control:`boolean`},invalid:{control:`boolean`}},args:{label:`Email address`,name:`email`},render:e=>i`
    <ds-input
      label=${e.label}
      name=${e.name}
      type=${n(e.type)}
      size=${n(e.size)}
      .value=${e.value}
      default-value=${n(e.defaultValue)}
      placeholder=${n(e.placeholder)}
      description=${n(e.description)}
      error=${n(e.error)}
      autocomplete=${n(e.autocomplete)}
      ?required=${e.required??!1}
      ?hide-label=${e.hideLabel??!1}
      ?disabled=${e.disabled??!1}
      ?invalid=${e.invalid??!1}
    ></ds-input>
  `},s={},c={args:{type:`text`}},l={args:{type:`email`}},u={args:{type:`password`}},d={args:{type:`number`}},f={args:{type:`search`}},p={args:{type:`tel`}},m={args:{type:`url`}},h={args:{size:`sm`}},g={args:{size:`md`}},_={args:{required:!0}},v={args:{hideLabel:!0}},y={args:{disabled:!0,defaultValue:`name@example.com`}},b={args:{invalid:!0}},x={args:{invalid:!0,required:!0}},S={args:{placeholder:`name@example.com`}},C={args:{label:`Email address`,name:`email`,type:`email`,description:`Use the email you signed up with.`}},w={args:{label:`Full name`,name:`name`,required:!0}},T={args:{label:`Email address`,name:`email`,type:`email`,error:`Enter an email address like name@example.com`}},E={args:{label:`Quantity`,name:`quantity`,type:`number`,size:`sm`,hideLabel:!0}},D=[`Default`,`TypeText`,`TypeEmail`,`TypePassword`,`TypeNumber`,`TypeSearch`,`TypeTel`,`TypeUrl`,`SizeSm`,`SizeMd`,`Required`,`HideLabel`,`Disabled`,`Invalid`,`InvalidRequiredEmpty`,`WithPlaceholder`,`EmailWithADescription`,`RequiredField`,`FieldWithAnError`,`DenseGridEditor`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'text'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'email'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'password'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'number'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'search'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'tel'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'url'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    required: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    hideLabel: true
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: 'name@example.com'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    invalid: true
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    invalid: true,
    required: true
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: 'name@example.com'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Email address',
    name: 'email',
    type: 'email',
    description: 'Use the email you signed up with.'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Full name',
    name: 'name',
    required: true
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Email address',
    name: 'email',
    type: 'email',
    error: 'Enter an email address like name@example.com'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Quantity',
    name: 'quantity',
    type: 'number',
    size: 'sm',
    hideLabel: true
  }
}`,...E.parameters?.docs?.source}}}})))()}O();export{s as Default,E as DenseGridEditor,y as Disabled,C as EmailWithADescription,T as FieldWithAnError,v as HideLabel,b as Invalid,x as InvalidRequiredEmpty,_ as Required,w as RequiredField,g as SizeMd,h as SizeSm,l as TypeEmail,d as TypeNumber,u as TypePassword,f as TypeSearch,p as TypeTel,c as TypeText,m as TypeUrl,S as WithPlaceholder,D as __namedExportsOrder,o as default};