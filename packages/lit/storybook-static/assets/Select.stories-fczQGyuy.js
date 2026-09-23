import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./Select-CtuNKP36.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D;function O(){return(O=e((()=>{t(),r(),a(),o=[{value:`ca`,label:`Canada`},{value:`fr`,label:`France`},{value:`de`,label:`Germany`},{value:`jp`,label:`Japan`},{value:`mx`,label:`Mexico`},{value:`us`,label:`United States`}],s=[{group:`Engineering`,options:[{value:`frontend`,label:`Frontend`},{value:`backend`,label:`Backend`}]},{group:`Design`,options:[{value:`product`,label:`Product design`},{value:`brand`,label:`Brand design`}]}],c={title:`Select/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`,`open-change`]}},argTypes:{size:{control:`select`,options:[`sm`,`md`]},native:{control:`select`,options:[`auto`,`always`,`never`]},open:{control:`boolean`}},args:{label:`Country`,name:`country`,options:o,hideLabel:!1,size:`md`,multiple:!1,required:!1,disabled:!1,invalid:!1,native:`auto`},render:e=>i`
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
  `},l={},u={args:{size:`sm`}},d={args:{size:`md`}},f={args:{native:`auto`}},p={args:{native:`always`}},m={args:{native:`never`}},h={args:{label:`Country`,name:`country`,placeholder:`Choose a country`,options:[{value:`ca`,label:`Canada`},{value:`fr`,label:`France`},{value:`jp`,label:`Japan`}]}},g={args:{label:`Roles`,name:`roles`,multiple:!0,options:[{value:`frontend`,label:`Frontend`},{value:`backend`,label:`Backend`},{value:`design`,label:`Design`}]}},_={args:{label:`Country`,name:`country`,native:`always`,options:[{value:`ca`,label:`Canada`},{value:`us`,label:`United States`}]}},v={args:{label:`Month`,name:`month`,hideLabel:!0,size:`sm`,options:[{value:`1`,label:`January`},{value:`2`,label:`February`}]}},y={args:{label:`Role`,name:`role`,options:s,multiple:!0,defaultValue:[`frontend`,`backend`,`brand`]}},b={args:{description:`Used for shipping and tax rates.`}},x={args:{required:!0}},S={args:{disabled:!0,defaultValue:`fr`}},C={args:{invalid:!0}},w={args:{error:`Choose the country you ship to.`}},T={args:{defaultValue:`fr`}},E={args:{open:!0},play:async({canvasElement:e})=>{let t=e.querySelector(`ds-select`);await t?.updateComplete,t?.shadowRoot?.querySelector(`[data-part=trigger]`)?.focus()},render:e=>i`
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
      @open-change=${e=>{e.currentTarget.open=e.detail.open}}
    ></ds-select>
  `},D=[`Default`,`SizeSm`,`SizeMd`,`NativeAuto`,`NativeAlways`,`NativeNever`,`CountryPicker`,`MultiSelectRoles`,`ForcedNativePicker`,`CompactPickerInAHeader`,`Multiple`,`WithDescription`,`Required`,`Disabled`,`Invalid`,`WithError`,`DefaultValue`,`Keyboard`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    native: 'auto'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    native: 'always'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    native: 'never'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
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
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
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
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Role',
    name: 'role',
    options: ROLES,
    multiple: true,
    defaultValue: ['frontend', 'backend', 'brand']
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'Used for shipping and tax rates.'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    required: true
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: 'fr'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    invalid: true
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    error: 'Choose the country you ship to.'
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 'fr'
  }
}`,...T.parameters?.docs?.source}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    open: true
  },
  play: async ({
    canvasElement
  }) => {
    const select = canvasElement.querySelector('ds-select');
    await select?.updateComplete;
    select?.shadowRoot?.querySelector<HTMLElement>('[data-part=trigger]')?.focus();
  },
  render: args => html\`
    <ds-select
      label=\${args.label}
      name=\${args.name}
      .options=\${args.options}
      .value=\${args.value}
      .defaultValue=\${args.defaultValue}
      placeholder=\${ifDefined(args.placeholder)}
      ?hide-label=\${args.hideLabel}
      size=\${args.size}
      .open=\${args.open}
      ?multiple=\${args.multiple}
      description=\${ifDefined(args.description)}
      ?required=\${args.required}
      ?disabled=\${args.disabled}
      ?invalid=\${args.invalid}
      error=\${ifDefined(args.error)}
      native=\${args.native}
      @open-change=\${(event: CustomEvent<SelectOpenChangeDetail>) => {
    (event.currentTarget as DsSelect).open = event.detail.open;
  }}
    ></ds-select>
  \`
}`,...E.parameters?.docs?.source},description:{story:`Open with its trigger, for the keyboard gate: the popup's Listbox holds the six country options\r
(focusable through the trigger's keyboard model) while DOM focus stays on the trigger. Args come\r
from the story URL; the story owns \`open\` — it writes the new state back onto the element — so\r
Escape and Tab really close it. The play step puts DOM focus where the popup's keyboard model\r
lives — on the trigger — since the embedded list is never a tab stop.`,...E.parameters?.docs?.description}}}})))()}O();export{v as CompactPickerInAHeader,h as CountryPicker,l as Default,T as DefaultValue,S as Disabled,_ as ForcedNativePicker,C as Invalid,E as Keyboard,g as MultiSelectRoles,y as Multiple,p as NativeAlways,f as NativeAuto,m as NativeNever,x as Required,d as SizeMd,u as SizeSm,b as WithDescription,w as WithError,D as __namedExportsOrder,c as default};