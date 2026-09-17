import{n as e}from"./rolldown-runtime-DkW27tQK.js";import{_ as t,w as n}from"./if-defined-CARySXJh.js";import{t as r}from"./Text-C3do0IPT.js";import{t as i}from"./Link-DBG2Lhp4.js";var a,o,s,c,l,u,d,f,p,m;function h(){return(h=e((()=>{t(),i(),r(),a=e=>n`<ds-link
  href=${e.href}
  label=${e.label}
  tone=${e.tone}
  ?external=${e.external}
  ?download=${e.download}
></ds-link>`,o={title:`Link/Lit`,tags:[`autodocs`],parameters:{actions:{handles:[`click`]}},argTypes:{tone:{control:`select`,options:[`default`,`inherit`]},external:{control:`boolean`},download:{control:`boolean`}},args:{href:`#billing`,label:`View the billing history`,external:!1,tone:`default`,download:!1},render:a},s={},c={args:{tone:`default`}},l={args:{tone:`inherit`},render:e=>n`<ds-text tone="muted">See ${a(e)}.</ds-text>`},u={args:{href:`/billing/history`,label:`View the billing history`},render:e=>n`<ds-text>Invoices from the last twelve months are kept. ${a(e)}.</ds-text>`},d={args:{href:`https://status.example.com`,label:`Status page`,external:!0}},f={args:{href:`/help/billing`,label:`the billing guide`,tone:`inherit`},render:e=>n`<ds-text tone="muted">For how charges are calculated, read ${a(e)}.</ds-text>`},p={args:{href:`/invoices/2026-09.pdf`,label:`Download the September invoice`,download:!0}},m=[`Default`,`ToneDefault`,`ToneInherit`,`InlineInAParagraph`,`ExternalDestination`,`InsideMutedText`,`DownloadableFile`],s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{}`,...s.parameters?.docs?.source}}},c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'default'
  }
}`,...c.parameters?.docs?.source}}},l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    tone: 'inherit'
  },
  render: args => html\`<ds-text tone="muted">See \${link(args)}.</ds-text>\`
}`,...l.parameters?.docs?.source}}},u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    href: '/billing/history',
    label: 'View the billing history'
  },
  render: args => html\`<ds-text>Invoices from the last twelve months are kept. \${link(args)}.</ds-text>\`
}`,...u.parameters?.docs?.source}}},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    href: 'https://status.example.com',
    label: 'Status page',
    external: true
  }
}`,...d.parameters?.docs?.source}}},f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    href: '/help/billing',
    label: 'the billing guide',
    tone: 'inherit'
  },
  render: args => html\`<ds-text tone="muted">For how charges are calculated, read \${link(args)}.</ds-text>\`
}`,...f.parameters?.docs?.source}}},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    href: '/invoices/2026-09.pdf',
    label: 'Download the September invoice',
    download: true
  }
}`,...p.parameters?.docs?.source}}}})))()}h();export{s as Default,p as DownloadableFile,d as ExternalDestination,u as InlineInAParagraph,f as InsideMutedText,c as ToneDefault,l as ToneInherit,m as __namedExportsOrder,o as default};