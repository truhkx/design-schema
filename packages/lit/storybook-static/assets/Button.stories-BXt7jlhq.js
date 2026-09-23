import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,b as n,r,t as i,w as a}from"./if-defined-CARySXJh.js";import{t as o}from"./Icon-eWCe5jE3.js";import{t as s}from"./Button-B3rVveNU.js";var c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T,E,D,O,k,A,j,M,N,P,F,I,L;function R(){return(R=e((()=>{t(),i(),s(),o(),c={title:`Button/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`press`,`track`]}},argTypes:{variant:{control:`select`,options:[`primary`,`secondary`,`ghost`,`danger`]},size:{control:`select`,options:[`sm`,`md`,`lg`]},type:{control:`select`,options:[`button`,`submit`]},disabled:{control:`boolean`},iconOnly:{control:`boolean`},loading:{control:`boolean`},inverse:{control:`boolean`},track:{control:`text`},accessibleName:{control:`text`},overflowLabel:{control:`text`},expanded:{control:`boolean`},haspopup:{control:`select`,options:[`menu`,`listbox`,`tree`,`grid`,`dialog`]},leadingIcon:{control:`text`},trailingIcon:{control:`text`}},args:{label:`Save changes`,variant:`primary`,size:`md`,type:`button`,disabled:!1,iconOnly:!1,loading:!1,inverse:!1,track:``},render:e=>a`
    <ds-button
      label=${e.label}
      variant=${e.variant}
      size=${e.size}
      type=${e.type}
      track=${r(e.track||void 0)}
      accessible-name=${r(e.accessibleName||void 0)}
      overflow-label=${r(e.overflowLabel||void 0)}
      .expanded=${e.expanded}
      .haspopup=${e.haspopup}
      ?disabled=${e.disabled}
      ?icon-only=${e.iconOnly}
      ?loading=${e.loading}
      ?inverse=${e.inverse}
      >${e.leadingIcon?a`<ds-icon slot="leading-icon" name=${e.leadingIcon} inline></ds-icon>`:n}${e.trailingIcon?a`<ds-icon slot="trailing-icon" name=${e.trailingIcon} inline></ds-icon>`:n}</ds-button
    >
  `},l={},u={args:{variant:`primary`}},d={args:{variant:`secondary`,label:`Cancel`}},f={args:{variant:`ghost`,label:`Forgot password?`}},p={args:{variant:`danger`,label:`Delete file`}},m={args:{size:`sm`}},h={args:{size:`md`}},g={args:{size:`lg`}},_={args:{type:`button`}},v={args:{type:`submit`,label:`Sign in`}},y={args:{haspopup:`menu`,label:`Actions`,variant:`secondary`}},b={args:{haspopup:`listbox`,label:`Choose a country`,variant:`secondary`}},x={args:{haspopup:`tree`,label:`Choose a folder`,variant:`secondary`}},S={args:{haspopup:`grid`,label:`Choose a date`,variant:`secondary`}},C={args:{haspopup:`dialog`,label:`Edit profile`,variant:`secondary`}},w={args:{disabled:!0}},T={args:{loading:!0,label:`Saving`}},E={args:{loading:!0,iconOnly:!0,label:`Close`,variant:`ghost`,leadingIcon:`close`}},D={args:{label:`Add item`,leadingIcon:`plus`,trailingIcon:`chevron-right`}},O={args:{iconOnly:!0,label:`Close`,variant:`ghost`,leadingIcon:`close`}},k={args:{label:`Actions`,variant:`secondary`,expanded:!0,trailingIcon:`chevron-down`}},A={args:{variant:`ghost`,inverse:!0,label:`Undo`},parameters:{backgrounds:{default:`dark`}},decorators:[e=>a`<div style="background: var(--color-inverse-surface); padding: var(--space-lg);">
        ${e()}
      </div>`]},j={args:{track:`signup`,label:`Sign up`}},M={args:{label:`Amount`,variant:`ghost`,accessibleName:`Sort by Amount, ascending`}},N={args:{label:`Save changes`,variant:`primary`}},P={args:{label:`Delete file`,variant:`danger`}},F={args:{label:`Close`,iconOnly:!0,leadingIcon:`close`,variant:`ghost`,size:`sm`}},I={args:{label:`Create account`,type:`submit`,loading:!0}},L=`Default.VariantPrimary.VariantSecondary.VariantGhost.VariantDanger.SizeSm.SizeMd.SizeLg.TypeButton.TypeSubmit.HaspopupMenu.HaspopupListbox.HaspopupTree.HaspopupGrid.HaspopupDialog.Disabled.Loading.LoadingIconOnly.WithIcons.IconOnly.Expanded.Inverse.Tracked.AccessibleName.PrimarySave.DestructiveConfirm.IconOnlyInAToolbar.PendingSubmit`.split(`.`),l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'primary'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'secondary',
    label: 'Cancel'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'ghost',
    label: 'Forgot password?'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'danger',
    label: 'Delete file'
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
    size: 'lg'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'button'
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    type: 'submit',
    label: 'Sign in'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    haspopup: 'menu',
    label: 'Actions',
    variant: 'secondary'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    haspopup: 'listbox',
    label: 'Choose a country',
    variant: 'secondary'
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    haspopup: 'tree',
    label: 'Choose a folder',
    variant: 'secondary'
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    haspopup: 'grid',
    label: 'Choose a date',
    variant: 'secondary'
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  args: {
    haspopup: 'dialog',
    label: 'Edit profile',
    variant: 'secondary'
  }
}`,...C.parameters?.docs?.source}}},w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true
  }
}`,...w.parameters?.docs?.source}}},T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true,
    label: 'Saving'
  }
}`,...T.parameters?.docs?.source},description:{story:`Busy: a spinner takes the leading icon position, the trailing icon hides, the label and height stay put.`,...T.parameters?.docs?.description}}},E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  args: {
    loading: true,
    iconOnly: true,
    label: 'Close',
    variant: 'ghost',
    leadingIcon: 'close'
  }
}`,...E.parameters?.docs?.source},description:{story:`iconOnly while loading: the spinner replaces the sole glyph.`,...E.parameters?.docs?.description}}},D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Add item',
    leadingIcon: 'plus',
    trailingIcon: 'chevron-right'
  }
}`,...D.parameters?.docs?.source}}},O.parameters={...O.parameters,docs:{...O.parameters?.docs,source:{originalSource:`{
  args: {
    iconOnly: true,
    label: 'Close',
    variant: 'ghost',
    leadingIcon: 'close'
  }
}`,...O.parameters?.docs?.source},description:{story:"iconOnly hides the visible label; `label` becomes the accessible name.",...O.parameters?.docs?.description}}},k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Actions',
    variant: 'secondary',
    expanded: true,
    trailingIcon: 'chevron-down'
  }
}`,...k.parameters?.docs?.source},description:{story:`expanded: set by a disclosing parent (Menu, Popover, SidePanel, Disclosure) as a property.`,...k.parameters?.docs?.description}}},A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  args: {
    variant: 'ghost',
    inverse: true,
    label: 'Undo'
  },
  parameters: {
    backgrounds: {
      default: 'dark'
    }
  },
  decorators: [story => html\`<div style="background: var(--color-inverse-surface); padding: var(--space-lg);">
        \${story()}
      </div>\`]
}`,...A.parameters?.docs?.source},description:{story:`inverse: rendered on an inverse surface, like a Toast or a Tooltip-like panel. The surface is a\r
story-only decorator, so the meta's render (and the Lit code sample) stays the button itself.`,...A.parameters?.docs?.description}}},j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  args: {
    track: 'signup',
    label: 'Sign up'
  }
}`,...j.parameters?.docs?.source},description:{story:"track: calls the analytics module on press, then fires `track` with the same pair.",...j.parameters?.docs?.description}}},M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Amount',
    variant: 'ghost',
    accessibleName: 'Sort by Amount, ascending'
  }
}`,...M.parameters?.docs?.source},description:{story:`accessibleName: says more than the visible label, which stays part of the name (WCAG 2.5.3).`,...M.parameters?.docs?.description}}},N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Save changes',
    variant: 'primary'
  }
}`,...N.parameters?.docs?.source},description:{story:`The single most important action in a view, labelled with the outcome.`,...N.parameters?.docs?.description}}},P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Delete file',
    variant: 'danger'
  }
}`,...P.parameters?.docs?.source},description:{story:`A destructive, hard-to-undo action, which is the only use of the danger variant.`,...P.parameters?.docs?.description}}},F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Close',
    iconOnly: true,
    leadingIcon: 'close',
    variant: 'ghost',
    size: 'sm'
  }
}`,...F.parameters?.docs?.source},description:{story:`A low-emphasis icon-only control in dense UI, whose label says what it does rather than what the icon depicts.`,...F.parameters?.docs?.description}}},I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  args: {
    label: 'Create account',
    type: 'submit',
    loading: true
  }
}`,...I.parameters?.docs?.source},description:{story:`The submit button of a form while the request is in flight - busy, and ignoring repeat activation.`,...I.parameters?.docs?.description}}}})))()}R();export{M as AccessibleName,l as Default,P as DestructiveConfirm,w as Disabled,k as Expanded,C as HaspopupDialog,S as HaspopupGrid,b as HaspopupListbox,y as HaspopupMenu,x as HaspopupTree,O as IconOnly,F as IconOnlyInAToolbar,A as Inverse,T as Loading,E as LoadingIconOnly,I as PendingSubmit,N as PrimarySave,g as SizeLg,h as SizeMd,m as SizeSm,j as Tracked,_ as TypeButton,v as TypeSubmit,p as VariantDanger,f as VariantGhost,u as VariantPrimary,d as VariantSecondary,D as WithIcons,L as __namedExportsOrder,c as default};