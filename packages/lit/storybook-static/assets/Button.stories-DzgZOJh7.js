import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,b as n,r,t as i,w as a}from"./if-defined-CARySXJh.js";import{t as o}from"./Icon-BHsrajXm.js";import{t as s}from"./Button-DM0-zK5H.js";var c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N;function P(){return(P=e((()=>{t(),i(),s(),o(),c=(e,t=n)=>a`
  <ds-button
    label=${e.label}
    variant=${e.variant}
    size=${e.size}
    type=${e.type}
    track=${r(e.track===``?void 0:e.track)}
    accessible-name=${r(e.accessibleName||void 0)}
    overflow-label=${r(e.overflowLabel||void 0)}
    .expanded=${e.expanded}
    ?disabled=${e.disabled}
    ?icon-only=${e.iconOnly}
    ?loading=${e.loading}
    ?inverse=${e.inverse}
    >${t}</ds-button
  >
`,l={title:`Button/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`press`,`track`]}},argTypes:{variant:{control:`select`,options:[`primary`,`secondary`,`ghost`,`danger`]},size:{control:`select`,options:[`sm`,`md`,`lg`]},type:{control:`select`,options:[`button`,`submit`]},disabled:{control:`boolean`},iconOnly:{control:`boolean`},loading:{control:`boolean`},inverse:{control:`boolean`},track:{control:`text`},accessibleName:{control:`text`},overflowLabel:{control:`text`},expanded:{control:`boolean`}},args:{label:`Save changes`,variant:`primary`,size:`md`,type:`button`,disabled:!1,iconOnly:!1,loading:!1,inverse:!1,track:``},render:e=>c(e)},u={},d={args:{variant:`primary`}},f={args:{variant:`secondary`}},p={args:{variant:`ghost`}},m={args:{variant:`danger`,label:`Delete file`}},h={args:{size:`sm`}},g={args:{size:`md`}},_={args:{size:`lg`}},v={args:{type:`button`}},y={args:{type:`submit`}},b={args:{disabled:!0}},x={args:{loading:!0}},S={args:{label:`Add item`,variant:`secondary`},render:e=>c(e,a`<ds-icon slot="leading-icon" name="plus"></ds-icon>`)},C={args:{label:`Continue`,variant:`secondary`},render:e=>c(e,a`<ds-icon slot="trailing-icon" name="chevron-right"></ds-icon>`)},w={args:{iconOnly:!0,label:`Close`,variant:`ghost`},render:e=>c(e,a`<ds-icon slot="leading-icon" name="close"></ds-icon>`)},T={args:{variant:`ghost`,inverse:!0,label:`Dismiss`},render:e=>a`
    <div style="background: var(--color-inverse-surface); padding: var(--space-md); border-radius: var(--radius-md);">
      ${c(e)}
    </div>
  `},E={args:{track:`signup`,label:`Sign up`}},D={args:{label:`Amount`,variant:`ghost`,accessibleName:`Sort by Amount, ascending`}},O={args:{label:`Options`,variant:`secondary`,expanded:!0}},k={args:{label:`Save changes`,variant:`primary`}},A={args:{label:`Delete file`,variant:`danger`}},j={args:{label:`Close`,iconOnly:!0,variant:`ghost`,size:`sm`},render:e=>c(e,a`<ds-icon slot="leading-icon" name="close"></ds-icon>`)},M={args:{label:`Create account`,type:`submit`,loading:!0}},N=[`Default`,`VariantPrimary`,`VariantSecondary`,`VariantGhost`,`VariantDanger`,`SizeSm`,`SizeMd`,`SizeLg`,`TypeButton`,`TypeSubmit`,`Disabled`,`Loading`,`LeadingIcon`,`TrailingIcon`,`IconOnly`,`Inverse`,`Tracked`,`AccessibleName`,`Expanded`,`PrimarySave`,`DestructiveConfirm`,`IconOnlyInAToolbar`,`PendingSubmit`],u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'primary'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'secondary'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'ghost'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'danger',
    label: 'Delete file'
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
    size: 'lg'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'button'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'submit'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true
  }
}`,...x.parameters?.docs?.source},description:{story:`Busy: a spinner replaces the leading icon, the trailing icon hides, the label and size stay put.`,...x.parameters?.docs?.description}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Add item',
    variant: 'secondary'
  },
  render: args => renderButton(args, html\`<ds-icon slot="leading-icon" name="plus"></ds-icon>\`)
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Continue',
    variant: 'secondary'
  },
  render: args => renderButton(args, html\`<ds-icon slot="trailing-icon" name="chevron-right"></ds-icon>\`)
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    iconOnly: true,
    label: 'Close',
    variant: 'ghost'
  },
  render: args => renderButton(args, html\`<ds-icon slot="leading-icon" name="close"></ds-icon>\`)
}`,...w.parameters?.docs?.source},description:{story:"iconOnly hides the visible label; `label` becomes the accessible name.",...w.parameters?.docs?.description}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'ghost',
    inverse: true,
    label: 'Dismiss'
  },
  render: args => html\`
    <div style="background: var(--color-inverse-surface); padding: var(--space-md); border-radius: var(--radius-md);">
      \${renderButton(args)}
    </div>
  \`
}`,...T.parameters?.docs?.source},description:{story:`inverse: rendered on an inverse surface, like a Toast or a Tooltip-like panel.`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    track: 'signup',
    label: 'Sign up'
  }
}`,...E.parameters?.docs?.source},description:{story:"track: calls the analytics module on press, then fires `track` with the same pair.",...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Amount',
    variant: 'ghost',
    accessibleName: 'Sort by Amount, ascending'
  }
}`,...D.parameters?.docs?.source},description:{story:`accessibleName: says more than the visible label, which stays part of the name (WCAG 2.5.3).`,...D.parameters?.docs?.description}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Options',
    variant: 'secondary',
    expanded: true
  }
}`,...O.parameters?.docs?.source},description:{story:`expanded: set by a disclosing parent (Menu, Popover, SidePanel, Disclosure) as a property.`,...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Save changes',
    variant: 'primary'
  }
}`,...k.parameters?.docs?.source},description:{story:`The single most important action in a view, labelled with the outcome.`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Delete file',
    variant: 'danger'
  }
}`,...A.parameters?.docs?.source},description:{story:`A destructive, hard-to-undo action, which is the only use of the danger variant.`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Close',
    iconOnly: true,
    variant: 'ghost',
    size: 'sm'
  },
  render: args => renderButton(args, html\`<ds-icon slot="leading-icon" name="close"></ds-icon>\`)
}`,...j.parameters?.docs?.source},description:{story:`A low-emphasis icon-only control in dense UI, labelled with what it does, not what the icon depicts.`,...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Create account',
    type: 'submit',
    loading: true
  }
}`,...M.parameters?.docs?.source},description:{story:`The submit button of a form while the request is in flight — busy, and ignoring repeat activation.`,...M.parameters?.docs?.description}}}})))()}P();export{D as AccessibleName,u as Default,A as DestructiveConfirm,b as Disabled,O as Expanded,w as IconOnly,j as IconOnlyInAToolbar,T as Inverse,S as LeadingIcon,x as Loading,M as PendingSubmit,k as PrimarySave,_ as SizeLg,g as SizeMd,h as SizeSm,E as Tracked,C as TrailingIcon,v as TypeButton,y as TypeSubmit,m as VariantDanger,p as VariantGhost,d as VariantPrimary,f as VariantSecondary,N as __namedExportsOrder,l as default};