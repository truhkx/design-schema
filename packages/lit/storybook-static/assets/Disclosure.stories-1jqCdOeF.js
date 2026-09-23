import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./Disclosure-DC_YWXkk.js";import{t as o}from"./Text-b_nq3K9L.js";import{t as s}from"./Stack-CZci_zJ9.js";var c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w;function T(){return(T=e((()=>{t(),r(),a(),o(),s(),c={title:`Disclosure/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`toggle`]}},argTypes:{defaultOpen:{control:`boolean`},disabled:{control:`boolean`},keepMounted:{control:`boolean`},fullWidth:{control:`boolean`},open:{control:`boolean`},headingLevel:{control:`select`,options:[void 0,`2`,`3`,`4`,`5`,`6`]}},args:{summary:`What happens if I cancel?`,children:`You keep access until the end of the current billing period. Your data is kept for 30 days after that, then deleted.`,defaultOpen:!1,disabled:!1,keepMounted:!1,fullWidth:!1,open:void 0,headingLevel:void 0},decorators:[e=>i`<div style="max-inline-size: 32rem">${e()}</div>`],render:e=>i`
    <ds-disclosure
      summary=${e.summary}
      heading-level=${n(e.headingLevel)}
      .open=${e.open}
      ?default-open=${e.defaultOpen}
      ?disabled=${e.disabled}
      ?keep-mounted=${e.keepMounted}
      ?full-width=${e.fullWidth}
    >
      <ds-text>${e.children}</ds-text>
    </ds-disclosure>
  `},l={},u={args:{headingLevel:`2`}},d={args:{headingLevel:`3`}},f={args:{headingLevel:`4`}},p={args:{headingLevel:`5`}},m={args:{headingLevel:`6`}},h={args:{summary:`What happens if I cancel?`,children:`You keep access until the end of the current billing period.`,headingLevel:`3`}},g={args:{summary:`Advanced options`,children:`Retry limit, timeout and proxy settings.`}},_={args:{summary:`Billing address`,children:`Street, city and postcode fields.`,defaultOpen:!0,keepMounted:!0}},v={args:{summary:`Shipping details`,children:`Choose a delivery address first.`,disabled:!0}},y={args:{defaultOpen:!0}},b={args:{open:!0}},x={args:{keepMounted:!0}},S={args:{fullWidth:!0}},C={render:e=>i`
    <ds-stack gap="none">
      <ds-disclosure summary="What happens if I cancel?" heading-level="3" ?disabled=${e.disabled}>
        <ds-text>${e.children}</ds-text>
      </ds-disclosure>
      <ds-disclosure summary="Can I change plans later?" heading-level="3" ?disabled=${e.disabled}>
        <ds-text>Yes. Changes take effect at the next billing date.</ds-text>
      </ds-disclosure>
      <ds-disclosure summary="Do you offer refunds?" heading-level="3" ?disabled=${e.disabled}>
        <ds-text>Within 14 days of a charge, in full.</ds-text>
      </ds-disclosure>
    </ds-stack>
  `},w=[`Default`,`HeadingLevel2`,`HeadingLevel3`,`HeadingLevel4`,`HeadingLevel5`,`HeadingLevel6`,`FaqAnswer`,`AdvancedOptions`,`OpenWithFormFields`,`Disabled`,`Open`,`Controlled`,`KeepMounted`,`FullWidth`,`Accordion`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '2'
  }
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '3'
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '4'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '5'
  }
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    headingLevel: '6'
  }
}`,...m.parameters?.docs?.source}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    summary: 'What happens if I cancel?',
    children: 'You keep access until the end of the current billing period.',
    headingLevel: '3'
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    summary: 'Advanced options',
    children: 'Retry limit, timeout and proxy settings.'
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    summary: 'Billing address',
    children: 'Street, city and postcode fields.',
    defaultOpen: true,
    keepMounted: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    summary: 'Shipping details',
    children: 'Choose a delivery address first.',
    disabled: true
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    defaultOpen: true
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    open: true
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    keepMounted: true
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  args: {
    fullWidth: true
  }
}`,...S.parameters?.docs?.source}}},C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  render: args => html\`
    <ds-stack gap="none">
      <ds-disclosure summary="What happens if I cancel?" heading-level="3" ?disabled=\${args.disabled}>
        <ds-text>\${args.children}</ds-text>
      </ds-disclosure>
      <ds-disclosure summary="Can I change plans later?" heading-level="3" ?disabled=\${args.disabled}>
        <ds-text>Yes. Changes take effect at the next billing date.</ds-text>
      </ds-disclosure>
      <ds-disclosure summary="Do you offer refunds?" heading-level="3" ?disabled=\${args.disabled}>
        <ds-text>Within 14 days of a charge, in full.</ds-text>
      </ds-disclosure>
    </ds-stack>
  \`
}`,...C.parameters?.docs?.source}}}})))()}T();export{C as Accordion,g as AdvancedOptions,b as Controlled,l as Default,v as Disabled,h as FaqAnswer,S as FullWidth,u as HeadingLevel2,d as HeadingLevel3,f as HeadingLevel4,p as HeadingLevel5,m as HeadingLevel6,x as KeepMounted,y as Open,_ as OpenWithFormFields,w as __namedExportsOrder,c as default};