import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{t as r}from"./Icon-CGupucWg.js";import{t as i}from"./Button-TSn-G4Vm.js";var a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{t(),i(),r(),a={title:`Button/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`press`,`track`]}},argTypes:{variant:{control:`select`,options:[`primary`,`secondary`,`ghost`,`danger`]},size:{control:`select`,options:[`sm`,`md`,`lg`]},type:{control:`select`,options:[`button`,`submit`]},disabled:{control:`boolean`},iconOnly:{control:`boolean`},loading:{control:`boolean`},inverse:{control:`boolean`},track:{control:`text`}},args:{label:`Save changes`,variant:`primary`,size:`md`,type:`button`,disabled:!1,iconOnly:!1,loading:!1,inverse:!1,track:``},render:e=>n`
    <ds-button
      label=${e.label}
      variant=${e.variant}
      size=${e.size}
      type=${e.type}
      track=${e.track}
      ?disabled=${e.disabled}
      ?icon-only=${e.iconOnly}
      ?loading=${e.loading}
      ?inverse=${e.inverse}
    ></ds-button>
  `},o={},s={args:{variant:`primary`}},c={args:{variant:`secondary`}},l={args:{variant:`ghost`}},u={args:{variant:`danger`,label:`Delete file`}},d={args:{size:`sm`}},f={args:{size:`md`}},p={args:{size:`lg`}},m={args:{type:`button`}},h={args:{type:`submit`}},g={args:{disabled:!0}},_={args:{loading:!0}},v={args:{iconOnly:!0,label:`Close`,variant:`ghost`},render:e=>n`
    <ds-button
      label=${e.label}
      variant=${e.variant}
      size=${e.size}
      type=${e.type}
      ?disabled=${e.disabled}
      ?icon-only=${e.iconOnly}
      ?loading=${e.loading}
    >
      <ds-icon slot="leading-icon" name="close"></ds-icon>
    </ds-button>
  `},y={args:{variant:`ghost`,inverse:!0,label:`Dismiss`},render:e=>n`
    <div
      style="background: var(--color-inverse-surface); padding: var(--space-md); border-radius: var(--radius-md);"
    >
      <ds-button label=${e.label} variant=${e.variant} size=${e.size} type=${e.type} ?inverse=${e.inverse}></ds-button>
    </div>
  `},b={args:{track:`signup`,label:`Sign up`}},x={args:{label:`Amount`},render:e=>n`
    <ds-button
      label=${e.label}
      variant=${e.variant}
      size=${e.size}
      type=${e.type}
      accessible-name="Sort by Amount, ascending"
    ></ds-button>
  `},S={args:{label:`Options`,variant:`secondary`},render:e=>n`
    <ds-button
      label=${e.label}
      variant=${e.variant}
      size=${e.size}
      type=${e.type}
      .expanded=${!0}
    ></ds-button>
  `},C=[`Default`,`Primary`,`Secondary`,`Ghost`,`Danger`,`SizeSm`,`SizeMd`,`SizeLg`,`TypeButton`,`TypeSubmit`,`Disabled`,`Loading`,`IconOnly`,`Inverse`,`Tracked`,`AccessibleName`,`Expanded`],o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{}`,...o.parameters?.docs?.source}}},s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'primary'
  }
}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'secondary'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'ghost'
  }
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'danger',
    label: 'Delete file'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'sm'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'md'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    size: 'lg'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'button'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'submit'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    iconOnly: true,
    label: 'Close',
    variant: 'ghost'
  },
  render: args => html\`
    <ds-button
      label=\${args.label}
      variant=\${args.variant}
      size=\${args.size}
      type=\${args.type}
      ?disabled=\${args.disabled}
      ?icon-only=\${args.iconOnly}
      ?loading=\${args.loading}
    >
      <ds-icon slot="leading-icon" name="close"></ds-icon>
    </ds-button>
  \`
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'ghost',
    inverse: true,
    label: 'Dismiss'
  },
  render: args => html\`
    <div
      style="background: var(--color-inverse-surface); padding: var(--space-md); border-radius: var(--radius-md);"
    >
      <ds-button label=\${args.label} variant=\${args.variant} size=\${args.size} type=\${args.type} ?inverse=\${args.inverse}></ds-button>
    </div>
  \`
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    track: 'signup',
    label: 'Sign up'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Amount'
  },
  render: args => html\`
    <ds-button
      label=\${args.label}
      variant=\${args.variant}
      size=\${args.size}
      type=\${args.type}
      accessible-name="Sort by Amount, ascending"
    ></ds-button>
  \`
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Options',
    variant: 'secondary'
  },
  render: args => html\`
    <ds-button
      label=\${args.label}
      variant=\${args.variant}
      size=\${args.size}
      type=\${args.type}
      .expanded=\${true}
    ></ds-button>
  \`
}`,...S.parameters?.docs?.source}}}})))()}w();export{x as AccessibleName,u as Danger,o as Default,g as Disabled,S as Expanded,l as Ghost,v as IconOnly,y as Inverse,_ as Loading,s as Primary,c as Secondary,p as SizeLg,f as SizeMd,d as SizeSm,b as Tracked,m as TypeButton,h as TypeSubmit,C as __namedExportsOrder,a as default};