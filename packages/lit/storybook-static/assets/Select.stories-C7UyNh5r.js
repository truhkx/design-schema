import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./Select-CKPhcmgN.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w;function T(){return(T=e((()=>{t(),r(),a(),o={title:`Select/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`,`open-change`]}},argTypes:{size:{control:`select`,options:[`sm`,`md`]},native:{control:`select`,options:[`auto`,`always`,`never`]},open:{control:`boolean`}},args:{label:`Country`,name:`country`,options:[{value:`ca`,label:`Canada`},{value:`fr`,label:`France`},{value:`jp`,label:`Japan`},{value:`us`,label:`United States`}],hideLabel:!1,size:`md`,multiple:!1,required:!1,disabled:!1,invalid:!1,native:`auto`},render:e=>i`
    <ds-select
      label=${e.label}
      name=${e.name}
      .options=${e.options}
      .value=${e.value}
      .defaultValue=${e.defaultValue}
      placeholder=${n(e.placeholder)}
      ?hide-label=${e.hideLabel}
      size=${e.size}
      .open=${e.open}
      ?multiple=${e.multiple}
      description=${n(e.description)}
      ?required=${e.required}
      ?disabled=${e.disabled}
      ?invalid=${e.invalid}
      error=${n(e.error)}
      native=${e.native}
    ></ds-select>
  `},s={},c={args:{size:`sm`}},l={args:{size:`md`}},u={args:{native:`auto`}},d={args:{native:`always`}},f={args:{native:`never`}},p={args:{multiple:!0,defaultValue:[`ca`,`fr`,`jp`]}},m={args:{description:`Where the account is registered.`}},h={args:{required:!0}},g={args:{disabled:!0,defaultValue:`fr`}},_={args:{invalid:!0}},v={args:{error:`Fix this before continuing.`}},y={args:{open:!0}},b={args:{label:`Country`,name:`country`,placeholder:`Choose a country`,options:[{value:`ca`,label:`Canada`},{value:`fr`,label:`France`},{value:`jp`,label:`Japan`}]}},x={args:{label:`Roles`,name:`roles`,multiple:!0,options:[{value:`frontend`,label:`Frontend`},{value:`backend`,label:`Backend`},{value:`design`,label:`Design`}]}},S={args:{label:`Country`,name:`country`,native:`always`,options:[{value:`ca`,label:`Canada`},{value:`us`,label:`United States`}]}},C={args:{label:`Month`,name:`month`,hideLabel:!0,size:`sm`,options:[{value:`1`,label:`January`},{value:`2`,label:`February`}]}},w=[`Default`,`SizeSm`,`SizeMd`,`NativeAuto`,`NativeAlways`,`NativeNever`,`Multiple`,`WithDescription`,`Required`,`Disabled`,`Invalid`,`WithError`,`Keyboard`,`CountryPicker`,`MultiSelectRoles`,`ForcedNativePicker`,`CompactPickerInAHeader`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    native: 'auto'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    native: 'always'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    native: 'never'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    multiple: true,
    defaultValue: ['ca', 'fr', 'jp']
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'Where the account is registered.'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    required: true
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: 'fr'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    invalid: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    error: 'Fix this before continuing.'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    open: true
  }
}`,...y.parameters?.docs?.source},description:{story:`Rendered open with its trigger and four options, for the keyboard gate.`,...y.parameters?.docs?.description}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Country',
    name: 'country',
    placeholder: 'Choose a country',
    options: [{
      value: 'ca',
      label: 'Canada'
    }, {
      value: 'fr',
      label: 'France'
    }, {
      value: 'jp',
      label: 'Japan'
    }]
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Roles',
    name: 'roles',
    multiple: true,
    options: [{
      value: 'frontend',
      label: 'Frontend'
    }, {
      value: 'backend',
      label: 'Backend'
    }, {
      value: 'design',
      label: 'Design'
    }]
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Country',
    name: 'country',
    native: 'always',
    options: [{
      value: 'ca',
      label: 'Canada'
    }, {
      value: 'us',
      label: 'United States'
    }]
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Month',
    name: 'month',
    hideLabel: true,
    size: 'sm',
    options: [{
      value: '1',
      label: 'January'
    }, {
      value: '2',
      label: 'February'
    }]
  }
}`,...C.parameters?.docs?.source}}}})))()}T();export{C as CompactPickerInAHeader,b as CountryPicker,s as Default,g as Disabled,S as ForcedNativePicker,_ as Invalid,y as Keyboard,x as MultiSelectRoles,p as Multiple,d as NativeAlways,u as NativeAuto,f as NativeNever,h as Required,l as SizeMd,c as SizeSm,m as WithDescription,v as WithError,w as __namedExportsOrder,o as default};