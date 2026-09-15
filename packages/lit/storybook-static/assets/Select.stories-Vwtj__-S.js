import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{r,t as i}from"./if-defined-BfpvQ5_i.js";import{t as a}from"./Select-h5GtQbtr.js";var o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T;function E(){return(E=e((()=>{t(),i(),a(),o=[{value:`us`,label:`United States`},{value:`ca`,label:`Canada`},{value:`mx`,label:`Mexico`},{value:`fr`,label:`France`},{value:`de`,label:`Germany`}],s=[{value:`viewer`,label:`Viewer`,description:`Can view, not edit`},{value:`editor`,label:`Editor`,description:`Can view and edit`},{value:`admin`,label:`Admin`,description:`Full access, including billing`}],c=[{group:`North America`,options:[{value:`us`,label:`United States`},{value:`ca`,label:`Canada`},{value:`mx`,label:`Mexico`}]},{group:`Europe`,options:[{value:`fr`,label:`France`},{value:`de`,label:`Germany`}]}],l={title:`Select/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`change`,`open-change`]}},argTypes:{native:{control:`select`,options:[`auto`,`always`,`never`]},size:{control:`select`,options:[`sm`,`md`]},hideLabel:{control:`boolean`},multiple:{control:`boolean`},required:{control:`boolean`},disabled:{control:`boolean`},invalid:{control:`boolean`}},args:{label:`Country`,name:`country`,options:o,value:void 0,defaultValue:void 0,placeholder:void 0,hideLabel:!1,size:`md`,open:void 0,multiple:!1,description:void 0,required:!1,disabled:!1,invalid:!1,error:void 0,native:`auto`},render:e=>n`
    <ds-select
      label=${e.label}
      name=${e.name}
      .options=${e.options}
      .value=${e.value}
      .defaultValue=${e.defaultValue}
      placeholder=${r(e.placeholder)}
      ?hide-label=${e.hideLabel}
      size=${e.size}
      ?open=${e.open}
      ?multiple=${e.multiple}
      description=${r(e.description)}
      ?required=${e.required}
      ?disabled=${e.disabled}
      ?invalid=${e.invalid}
      error=${r(e.error)}
      native=${e.native}
    ></ds-select>
  `},u={},d={args:{native:`auto`}},f={args:{native:`always`,defaultValue:`ca`}},p={args:{native:`never`}},m={args:{size:`sm`}},h={args:{size:`md`}},g={args:{hideLabel:!0,defaultValue:`us`}},_={args:{multiple:!0,options:s,label:`Roles`,name:`roles`,defaultValue:[`editor`]}},v={args:{multiple:!0,options:c,label:`Regions`,name:`regions`,defaultValue:[`us`,`ca`,`mx`,`fr`]}},y={args:{required:!0}},b={args:{disabled:!0,defaultValue:`us`}},x={args:{label:`Role`,name:`role`,options:s,description:`Controls what this member can see and change.`,defaultValue:`viewer`}},S={args:{label:`Country`,options:c,defaultValue:`fr`}},C={args:{required:!0,error:`Fix this before continuing.`}},w={args:{options:o,open:!0}},T=[`Default`,`NativeAuto`,`NativeAlways`,`NativeNever`,`SizeSm`,`SizeMd`,`HideLabelTrue`,`MultipleTrue`,`MultipleManySelected`,`RequiredTrue`,`DisabledTrue`,`WithDescription`,`Grouped`,`ErrorIdentified`,`Keyboard`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    native: 'auto'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    native: 'always',
    defaultValue: 'ca'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    native: 'never'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    hideLabel: true,
    defaultValue: 'us'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    multiple: true,
    options: ROLE_OPTIONS,
    label: 'Roles',
    name: 'roles',
    defaultValue: ['editor']
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    multiple: true,
    options: GROUPED_OPTIONS,
    label: 'Regions',
    name: 'regions',
    defaultValue: ['us', 'ca', 'mx', 'fr']
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    required: true
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: 'us'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Role',
    name: 'role',
    options: ROLE_OPTIONS,
    description: 'Controls what this member can see and change.',
    defaultValue: 'viewer'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Country',
    options: GROUPED_OPTIONS,
    defaultValue: 'fr'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    required: true,
    error: 'Fix this before continuing.'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    options: COUNTRY_OPTIONS,
    open: true
  }
}`,...w.parameters?.docs?.source},description:{story:`Renders open (via the controlled \`open\` prop) with its trigger and at\r
least three options so the keyboard gate can verify Enter/Space/arrow-to-\r
open, arrow navigation, Home/End, typeahead, Enter to commit, Escape and\r
Tab. Unlike the option list, real DOM focus stays on the trigger the whole\r
time the popup is open.`,...w.parameters?.docs?.description}}}})))()}E();export{u as Default,b as DisabledTrue,C as ErrorIdentified,S as Grouped,g as HideLabelTrue,w as Keyboard,v as MultipleManySelected,_ as MultipleTrue,f as NativeAlways,d as NativeAuto,p as NativeNever,y as RequiredTrue,h as SizeMd,m as SizeSm,x as WithDescription,T as __namedExportsOrder,l as default};