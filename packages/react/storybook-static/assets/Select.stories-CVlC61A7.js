import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{t}from"./jsx-runtime-DeHZSEgm.js";import{n,t as r}from"./Select-GHmP_vFH.js";var i,a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{n(),i=t(),a=[{value:`ca`,label:`Canada`},{value:`fr`,label:`France`},{value:`de`,label:`Germany`},{value:`jp`,label:`Japan`},{value:`mx`,label:`Mexico`},{value:`us`,label:`United States`}],o=[{group:`Engineering`,options:[{value:`frontend`,label:`Frontend`},{value:`backend`,label:`Backend`}]},{group:`Design`,options:[{value:`product`,label:`Product design`},{value:`brand`,label:`Brand design`}]}],s={title:`Select/React`,component:r,args:{label:`Country`,name:`country`,options:a},tags:[`autodocs`]},c={},l={args:{size:`sm`}},u={args:{size:`md`}},d={args:{native:`auto`}},f={args:{native:`always`}},p={args:{native:`never`}},m={args:{label:`Role`,name:`role`,options:o,multiple:!0}},h={args:{description:`Used for shipping and tax rates.`}},g={args:{required:!0}},_={args:{placeholder:`Choose a country`}},v={args:{disabled:!0,defaultValue:`fr`}},y={args:{invalid:!0,error:`Country is required.`}},b={args:{defaultValue:`fr`}},x={args:{hideLabel:!0}},S={render:()=>(0,i.jsxs)(`div`,{style:{display:`flex`,gap:`var(--space-2)`},children:[(0,i.jsx)(r,{label:`Country`,name:`country-a`,options:a,open:!0}),(0,i.jsx)(r,{label:`Role`,name:`role-b`,options:o}),(0,i.jsx)(r,{label:`Export to`,name:`export-c`,options:a})]})},C=[`Default`,`SizeSm`,`SizeMd`,`NativeAuto`,`NativeAlways`,`NativeNever`,`Multiple`,`WithDescription`,`Required`,`Placeholder`,`Disabled`,`InvalidWithError`,`DefaultValue`,`HideLabel`,`Keyboard`],c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    native: 'auto'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    native: 'always'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    native: 'never'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Role',
    name: 'role',
    options: ROLES,
    multiple: true
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    description: 'Used for shipping and tax rates.'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    required: true
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    placeholder: 'Choose a country'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultValue: 'fr'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    invalid: true,
    error: 'Country is required.'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    defaultValue: 'fr'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    hideLabel: true
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: 'var(--space-2)'
  }}>\r
      <Select label="Country" name="country-a" options={COUNTRIES} open />\r
      <Select label="Role" name="role-b" options={ROLES} />\r
      <Select label="Export to" name="export-c" options={COUNTRIES} />\r
    </div>
}`,...S.parameters?.docs?.source},description:{story:`Open/present with its trigger, for the keyboard gate. The first Select renders with \`open\`, so\r
the popup and its composed (embedded) Listbox are present; per the WAI-ARIA listbox pattern the\r
Listbox exposes exactly one focusable node for the whole option list (aria-activedescendant, not\r
per-option tab stops), so two further closed triggers stand alongside it to reach three\r
focusable children without adding any decorator-only focusable element.`,...S.parameters?.docs?.description}}}})))()}w();export{c as Default,b as DefaultValue,v as Disabled,x as HideLabel,y as InvalidWithError,S as Keyboard,m as Multiple,f as NativeAlways,d as NativeAuto,p as NativeNever,_ as Placeholder,g as Required,u as SizeMd,l as SizeSm,h as WithDescription,C as __namedExportsOrder,s as default};