import{n as e}from"./rolldown-runtime-C0FnF6B9.js";import{t}from"./react-DiVRNtpo.js";import{n,o as r,r as i,t as a}from"./decorators-Dl4455ZU.js";import{n as o,r as s}from"./Link-Bw8MWX3a.js";import{l as c}from"./iframe-CAToN8Eb.js";var l,u,d,f,p,m,h,g,_;function v(){return(v=e((()=>{t(),s(),r(),a(),l=c(),u={title:`Link/React Native`,component:o,decorators:[n({fit:!0})],args:{href:`/billing/history`,label:`View the billing history`,external:!1,tone:`default`}},d={},f={args:{tone:`default`}},p={args:{tone:`inherit`},render:e=>(0,l.jsxs)(i,{tone:`muted`,children:[(0,l.jsx)(o,{...e}),`.`]})},m={args:{href:`/billing/history`,label:`View the billing history`},render:e=>(0,l.jsxs)(i,{children:[`Invoices from the last twelve months are kept. `,(0,l.jsx)(o,{...e}),`.`]})},h={args:{href:`https://status.example.com`,label:`Status page`,external:!0}},g={args:{href:`/help/billing`,label:`the billing guide`,tone:`inherit`},render:e=>(0,l.jsxs)(i,{tone:`muted`,children:[`For how charges are calculated, read `,(0,l.jsx)(o,{...e}),`.`]})},_=[`Default`,`ToneDefault`,`ToneInherit`,`InlineInAParagraph`,`ExternalDestination`,`InsideMutedText`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'default'
  }
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'inherit'
  },
  render: args => <Text tone="muted">\r
      <Link {...args} />.\r
    </Text>
}`,...p.parameters?.docs?.source}}},m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    href: '/billing/history',
    label: 'View the billing history'
  },
  render: args => <Text>\r
      Invoices from the last twelve months are kept. <Link {...args} />.\r
    </Text>
}`,...m.parameters?.docs?.source},description:{story:`The default link inside body text, underlined and taking the paragraph's typography.`,...m.parameters?.docs?.description}}},h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    href: 'https://status.example.com',
    label: 'Status page',
    external: true
  }
}`,...h.parameters?.docs?.source},description:{story:`A link that leaves the product, so the name says so before it is activated.`,...h.parameters?.docs?.description}}},g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    href: '/help/billing',
    label: 'the billing guide',
    tone: 'inherit'
  },
  render: args => <Text tone="muted">\r
      For how charges are calculated, read <Link {...args} />.\r
    </Text>
}`,...g.parameters?.docs?.source},description:{story:`A link in muted or on-action text, where the color is inherited and the underline alone marks it.`,...g.parameters?.docs?.description}}}})))()}v();export{d as Default,h as ExternalDestination,m as InlineInAParagraph,g as InsideMutedText,f as ToneDefault,p as ToneInherit,_ as __namedExportsOrder,u as default};