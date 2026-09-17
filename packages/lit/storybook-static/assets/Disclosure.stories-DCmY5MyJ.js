import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,r as n,t as r,w as i}from"./if-defined-CARySXJh.js";import{t as a}from"./Disclosure-CsDZV-lA.js";import{t as o}from"./Text-C3do0IPT.js";import{t as s}from"./Stack-gnRbseNc.js";var c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C;function w(){return(w=e((()=>{t(),r(),a(),o(),s(),c={title:`Disclosure/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`toggle`]}},argTypes:{defaultOpen:{control:`boolean`},disabled:{control:`boolean`},keepMounted:{control:`boolean`},headingLevel:{control:`select`,options:[void 0,`2`,`3`,`4`,`5`,`6`]}},args:{summary:`What happens if I cancel?`,children:`Your plan stays active until the end of the billing period.`,defaultOpen:!1,disabled:!1,keepMounted:!1,headingLevel:void 0},render:e=>i`
    <ds-disclosure
      summary=${e.summary}
      heading-level=${n(e.headingLevel)}
      ?default-open=${e.defaultOpen}
      ?disabled=${e.disabled}
      ?keep-mounted=${e.keepMounted}
    >
      <ds-text>${e.children}</ds-text>
    </ds-disclosure>
  `},l={},u={args:{headingLevel:`2`}},d={args:{headingLevel:`3`}},f={args:{headingLevel:`4`}},p={args:{headingLevel:`5`}},m={args:{headingLevel:`6`}},h={args:{defaultOpen:!0}},g={args:{keepMounted:!0}},_={args:{disabled:!0,defaultOpen:!0}},v={args:{summary:`What happens if I cancel?`,children:`You keep access until the end of the current billing period.`,headingLevel:`3`}},y={args:{summary:`Advanced options`,children:`Retry limit, timeout and proxy settings.`}},b={args:{summary:`Billing address`,children:`Street, city and postcode fields.`,defaultOpen:!0,keepMounted:!0}},x={args:{summary:`Shipping details`,children:`Choose a delivery address first.`,disabled:!0}},S={render:()=>i`
    <ds-stack gap="0">
      <ds-disclosure summary="Can I change plans later?" heading-level="3">
        <ds-text>Yes. Upgrades apply immediately; downgrades apply at the next renewal.</ds-text>
      </ds-disclosure>
      <ds-disclosure summary="Do you offer refunds?" heading-level="3">
        <ds-text>Annual plans can be refunded within 14 days of purchase.</ds-text>
      </ds-disclosure>
      <ds-disclosure summary="What happens if I cancel?" heading-level="3">
        <ds-text>Your workspace becomes read-only at the end of the billing period.</ds-text>
      </ds-disclosure>
    </ds-stack>
  `},C=[`Default`,`HeadingLevel2`,`HeadingLevel3`,`HeadingLevel4`,`HeadingLevel5`,`HeadingLevel6`,`DefaultOpenTrue`,`KeepMountedTrue`,`DisabledOpen`,`FaqAnswer`,`AdvancedOptions`,`OpenWithFormFields`,`Disabled`,`Accordion`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
    defaultOpen: true
  }
}`,...h.parameters?.docs?.source}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    keepMounted: true
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultOpen: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    summary: 'What happens if I cancel?',
    children: 'You keep access until the end of the current billing period.',
    headingLevel: '3'
  }
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  args: {
    summary: 'Advanced options',
    children: 'Retry limit, timeout and proxy settings.'
  }
}`,...y.parameters?.docs?.source}}},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    summary: 'Billing address',
    children: 'Street, city and postcode fields.',
    defaultOpen: true,
    keepMounted: true
  }
}`,...b.parameters?.docs?.source}}},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    summary: 'Shipping details',
    children: 'Choose a delivery address first.',
    disabled: true
  }
}`,...x.parameters?.docs?.source}}},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <ds-stack gap="0">
      <ds-disclosure summary="Can I change plans later?" heading-level="3">
        <ds-text>Yes. Upgrades apply immediately; downgrades apply at the next renewal.</ds-text>
      </ds-disclosure>
      <ds-disclosure summary="Do you offer refunds?" heading-level="3">
        <ds-text>Annual plans can be refunded within 14 days of purchase.</ds-text>
      </ds-disclosure>
      <ds-disclosure summary="What happens if I cancel?" heading-level="3">
        <ds-text>Your workspace becomes read-only at the end of the billing period.</ds-text>
      </ds-disclosure>
    </ds-stack>
  \`
}`,...S.parameters?.docs?.source}}}})))()}w();export{S as Accordion,y as AdvancedOptions,l as Default,h as DefaultOpenTrue,x as Disabled,_ as DisabledOpen,v as FaqAnswer,u as HeadingLevel2,d as HeadingLevel3,f as HeadingLevel4,p as HeadingLevel5,m as HeadingLevel6,g as KeepMountedTrue,b as OpenWithFormFields,C as __namedExportsOrder,c as default};