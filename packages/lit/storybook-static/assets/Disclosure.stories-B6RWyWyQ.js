import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{f as t,y as n}from"./decorators-BlUBDG4K.js";import{r,t as i}from"./if-defined-BfpvQ5_i.js";import{t as a}from"./Disclosure-Drfq4zwz.js";import{t as o}from"./Text-Dgpz9DWN.js";import{t as s}from"./Stack-CZSvFm0E.js";var c,l,u,d,f,p,m,h,g,_,v,y,b;function x(){return(x=e((()=>{t(),i(),a(),o(),s(),c={title:`Disclosure/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`toggle`]}},argTypes:{defaultOpen:{control:`boolean`},disabled:{control:`boolean`},headingLevel:{control:`select`,options:[void 0,`2`,`3`,`4`,`5`,`6`]}},args:{summary:`What happens if I cancel?`,defaultOpen:!1,disabled:!1,headingLevel:void 0},render:e=>n`
    <ds-disclosure
      summary=${e.summary}
      heading-level=${r(e.headingLevel)}
      ?default-open=${e.defaultOpen}
      ?disabled=${e.disabled}
    >
      <ds-text
        >Your plan stays active until the end of the billing period. After that, your
        workspace becomes read-only and you can export your data at any time.</ds-text
      >
    </ds-disclosure>
  `},l={},u={args:{headingLevel:`2`}},d={args:{headingLevel:`3`}},f={args:{headingLevel:`4`}},p={args:{headingLevel:`5`}},m={args:{headingLevel:`6`}},h={args:{defaultOpen:!0}},g={args:{disabled:!0}},_={args:{disabled:!0,defaultOpen:!0}},v={render:()=>n`
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
  `},y={render:()=>n`
    <ds-disclosure summary="Advanced options" keep-mounted>
      <ds-text>Rendered while closed (hidden), so form fields inside are still collected.</ds-text>
    </ds-disclosure>
  `},b=[`Default`,`HeadingLevel2`,`HeadingLevel3`,`HeadingLevel4`,`HeadingLevel5`,`HeadingLevel6`,`DefaultOpenTrue`,`DisabledTrue`,`DisabledOpen`,`Accordion`,`KeepMountedTrue`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
    disabled: true
  }
}`,...g.parameters?.docs?.source}}},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    disabled: true,
    defaultOpen: true
  }
}`,..._.parameters?.docs?.source}}},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
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
}`,...v.parameters?.docs?.source}}},y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
  render: () => html\`
    <ds-disclosure summary="Advanced options" keep-mounted>
      <ds-text>Rendered while closed (hidden), so form fields inside are still collected.</ds-text>
    </ds-disclosure>
  \`
}`,...y.parameters?.docs?.source}}}})))()}x();export{v as Accordion,l as Default,h as DefaultOpenTrue,_ as DisabledOpen,g as DisabledTrue,u as HeadingLevel2,d as HeadingLevel3,f as HeadingLevel4,p as HeadingLevel5,m as HeadingLevel6,y as KeepMountedTrue,b as __namedExportsOrder,c as default};